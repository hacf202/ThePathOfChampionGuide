// src/routes/champions.js
import express from "express";
import {
	ScanCommand,
	PutItemCommand,
	DeleteItemCommand,
	GetItemCommand,
	QueryCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import client from "../config/db.js";
import NodeCache from "node-cache";
import { authenticateCognitoToken } from "../middleware/authenticate.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { removeAccents } from "../utils/vietnameseUtils.js";

const router = express.Router();
const CHAMPIONS_TABLE = "guidePocChampionList";

// Khởi tạo cache: stdTTL = 120 giây (2 phút)
const championCache = new NodeCache({ stdTTL: 120, checkperiod: 60 });

/**
 * Hàm lấy toàn bộ dữ liệu từ DB và lưu vào Cache.
 * Sắp xếp mặc định A-Z.
 */
async function getCachedChampions() {
	const CACHE_KEY = "all_champions_list";
	let cachedData = championCache.get(CACHE_KEY);

	if (!cachedData) {
		const command = new ScanCommand({ TableName: CHAMPIONS_TABLE });
		const { Items } = await client.send(command);
		cachedData = Items ? Items.map(item => unmarshall(item)) : [];

		// Sắp xếp mặc định theo tên A-Z
		cachedData.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

		championCache.set(CACHE_KEY, cachedData);
	}
	return cachedData;
}

/**
 * @route   GET /api/champions
 * @desc    Lấy danh sách tướng với bộ lọc động và phân trang an toàn
 */
router.get("/", async (req, res) => {
	try {
		const {
			page = 1,
			limit = 20,
			searchTerm = "",
			regions = "",
			costs = "",
			tags = "",
			maxStars = "",
			sort = "name-asc",
		} = req.query;

		const pageSize = parseInt(limit);
		const currentPage = parseInt(page);

		// 1. Lấy toàn bộ danh sách từ Cache (hoặc DB)
		const allChampions = await getCachedChampions();

		// 2. TRÍCH XUẤT BỘ LỌC ĐỘNG (Dynamic Filters) - Đã đổi thành tags
		const availableFilters = {
			tags: [...new Set(allChampions.flatMap(c => c.tags || []))].sort(),
			regions: [...new Set(allChampions.flatMap(c => c.regions || []))].sort(),
			costs: [...new Set(allChampions.map(c => Number(c.cost)))]
				.filter(Boolean)
				.sort((a, b) => a - b),
			maxStars: [...new Set(allChampions.map(c => Number(c.maxStar)))]
				.filter(Boolean)
				.sort((a, b) => a - b),
		};

		// 3. THỰC HIỆN LỌC (Filtering)
		let filtered = [...allChampions];

		if (searchTerm) {
			const searchKey = removeAccents(searchTerm.toLowerCase());
			filtered = filtered.filter(c => {
				const nameVn = removeAccents(c.name || "");
				const nameEn = removeAccents(c.translations?.en?.name || "");

				// CHỈ TÌM KIẾM THEO TÊN (Tiếng Việt hoặc Tiếng Anh)
				return nameVn.includes(searchKey) || nameEn.includes(searchKey);
			});
		}

		if (regions) {
			const rList = regions.split(",");
			filtered = filtered.filter(c => c.regions?.some(r => rList.includes(r)));
		}

		if (costs) {
			const cList = costs.split(",").map(Number);
			filtered = filtered.filter(c => cList.includes(Number(c.cost)));
		}

		if (tags) {
			const tList = tags.split(",");
			filtered = filtered.filter(c => c.tags?.some(t => tList.includes(t)));
		}

		if (maxStars) {
			const sList = maxStars.split(",").map(Number);
			filtered = filtered.filter(c => sList.includes(Number(c.maxStar)));
		}

		// 4. SẮP XẾP (Sorting)
		const [field, order] = sort.split("-");
		filtered.sort((a, b) => {
			let vA = a[field] ?? "";
			let vB = b[field] ?? "";
			if (typeof vA === "string") {
				return order === "asc" ? vA.localeCompare(vB) : vB.localeCompare(vA);
			}
			return order === "asc" ? vA - vB : vB - vA;
		});

		// 5. PHÂN TRANG (Pagination)
		const totalItems = filtered.length;
		let paginatedItems;

		if (pageSize < 0) {
			paginatedItems = filtered;
		} else {
			paginatedItems = filtered.slice(
				(currentPage - 1) * pageSize,
				currentPage * pageSize,
			);
		}

		const totalPages = pageSize > 0 ? Math.ceil(totalItems / pageSize) : 1;

		res.json({
			items: paginatedItems,
			pagination: {
				totalItems,
				totalPages,
				currentPage,
				pageSize: pageSize < 0 ? totalItems : pageSize,
			},
			availableFilters,
		});
	} catch (error) {
		console.error("Lỗi Backend:", error);
		res.status(500).json({ error: "Lỗi hệ thống." });
	}
});

/**
 * @route   GET /api/champions/search?name=...
 * @desc    Tìm tướng theo tên (exact match)
 */
router.get("/search", async (req, res) => {
	const { name } = req.query;

	if (!name || typeof name !== "string" || name.trim().length < 1) {
		return res.status(400).json({ error: "Tham số 'name' là bắt buộc." });
	}

	const searchName = name.trim();

	try {
		const command = new QueryCommand({
			TableName: CHAMPIONS_TABLE,
			IndexName: "name-index",
			KeyConditionExpression: "#name = :name",
			ExpressionAttributeNames: { "#name": "name" },
			ExpressionAttributeValues: marshall({ ":name": searchName }),
		});

		const { Items } = await client.send(command);
		const champions = Items ? Items.map(item => unmarshall(item)) : [];

		res.json({ items: champions });
	} catch (error) {
		console.error("Lỗi tìm kiếm tướng theo tên:", error);
		res.status(500).json({ error: "Không thể tìm kiếm tướng." });
	}
});

/**
 * @route   POST /api/champions/resolve
 * @desc    Lấy thông tin chi tiết của một danh sách các tướng dựa trên ID (hoặc tên)
 */
router.post("/resolve", async (req, res) => {
	try {
		const { ids } = req.body;
		if (!Array.isArray(ids) || ids.length === 0) {
			return res.json([]); // Trả về mảng rỗng nếu không có id nào
		}

		// Tận dụng cache có sẵn để tìm kiếm siêu tốc độ mà không cần query DB nhiều lần
		const allChampions = await getCachedChampions();

		// Map qua danh sách ids được yêu cầu từ Frontend
		const resolvedChampions = ids
			.map(id => {
				// Tìm khớp theo championID hoặc name (vì đôi khi requirement lưu theo tên)
				const found = allChampions.find(
					c => c.championID === id || c.name === id,
				);
				return found || null;
			})
			.filter(Boolean); // Lọc bỏ các kết quả null nếu không tìm thấy

		res.json(resolvedChampions);
	} catch (error) {
		console.error("Lỗi khi resolve champions:", error);
		res.status(500).json({ error: "Lỗi hệ thống khi resolve tướng." });
	}
});

/**
 * @route   GET /api/champions/:championID
 * @desc    Lấy chi tiết một tướng
 */
router.get("/:championID", async (req, res) => {
	const { championID } = req.params;

	if (!championID) {
		return res.status(400).json({ error: "championID là bắt buộc." });
	}

	const CACHE_KEY = `champion_detail_${championID}`;

	try {
		const cachedChampion = championCache.get(CACHE_KEY);
		if (cachedChampion) {
			return res.json(cachedChampion);
		}

		const command = new GetItemCommand({
			TableName: CHAMPIONS_TABLE,
			Key: marshall({ championID }),
		});

		const { Item } = await client.send(command);

		if (!Item) {
			return res.status(404).json({ error: "Không tìm thấy tướng yêu cầu." });
		}

		const championData = unmarshall(Item);
		championCache.set(CACHE_KEY, championData);

		res.json(championData);
	} catch (error) {
		console.error("Lỗi khi lấy chi tiết tướng:", error);
		res.status(500).json({ error: "Lỗi hệ thống khi truy vấn dữ liệu." });
	}
});

/**
 * @route   PUT /api/champions
 * @desc    Tạo mới hoặc cập nhật một tướng
 */
router.put("/", authenticateCognitoToken, requireAdmin, async (req, res) => {
	const rawData = req.body;

	if (!rawData.championID || !rawData.name?.trim()) {
		return res.status(400).json({ error: "championID và name là bắt buộc." });
	}

	const championID = rawData.championID.trim();

	if (championID.length < 2 || championID.length > 50) {
		return res.status(400).json({ error: "championID phải từ 2-50 ký tự." });
	}
	if (!/^[A-Za-z0-9_-]+$/.test(championID)) {
		return res.status(400).json({
			error: "championID chỉ được chứa chữ cái, số, gạch dưới và gạch ngang.",
		});
	}

	const maxStar = Number(rawData.maxStar) || 7;
	if (!Number.isInteger(maxStar) || maxStar < 1 || maxStar > 7) {
		return res.status(400).json({ error: "maxStar phải là số từ 1-7." });
	}

	const { isNew, ...dataToSave } = rawData;

	const cleanData = {
		...dataToSave,
		championID,
		name: rawData.name.trim(),
		maxStar,
	};

	try {
		const checkCmd = new GetItemCommand({
			TableName: CHAMPIONS_TABLE,
			Key: marshall({ championID }),
		});
		const { Item } = await client.send(checkCmd);

		if (isNew === true) {
			if (Item) {
				return res.status(400).json({ error: "Tướng với ID này đã tồn tại." });
			}
		} else {
			if (!Item) {
				return res
					.status(404)
					.json({ error: "Tướng không tồn tại để cập nhật." });
			}
		}

		const command = new PutItemCommand({
			TableName: CHAMPIONS_TABLE,
			Item: marshall(cleanData, { removeUndefinedValues: true }),
			...(isNew === true && {
				ConditionExpression: "attribute_not_exists(championID)",
			}),
		});

		await client.send(command);
		championCache.del("all_champions_list");

		res.json({
			message: isNew
				? "Tạo tướng mới thành công."
				: "Cập nhật tướng thành công.",
			champion: cleanData,
		});
	} catch (error) {
		if (error.name === "ConditionalCheckFailedException") {
			return res.status(400).json({ error: "Tướng đã tồn tại." });
		}
		console.error("Lỗi khi lưu dữ liệu tướng:", error);
		res.status(500).json({ error: "Không thể lưu dữ liệu tướng." });
	}
});

/**
 * @route   DELETE /api/champions/:championID
 * @desc    Xóa tướng theo championID
 */
router.delete(
	"/:championID",
	authenticateCognitoToken,
	requireAdmin,
	async (req, res) => {
		const { championID } = req.params;

		if (
			!championID ||
			typeof championID !== "string" ||
			championID.trim().length < 1
		) {
			return res.status(400).json({ error: "championID không hợp lệ." });
		}

		const id = championID.trim();

		try {
			const getCmd = new GetItemCommand({
				TableName: CHAMPIONS_TABLE,
				Key: marshall({ championID: id }),
			});
			const { Item } = await client.send(getCmd);

			if (!Item) {
				return res.status(404).json({ error: "Không tìm thấy tướng để xóa." });
			}

			const deleteCmd = new DeleteItemCommand({
				TableName: CHAMPIONS_TABLE,
				Key: marshall({ championID: id }),
			});

			await client.send(deleteCmd);
			championCache.del("all_champions_list");

			const deletedChampion = unmarshall(Item);
			res.status(200).json({
				message: `Tướng "${deletedChampion.name}" (ID: ${id}) đã được xóa thành công.`,
			});
		} catch (error) {
			console.error("Lỗi khi xóa tướng:", error);
			res.status(500).json({ error: "Không thể xóa tướng." });
		}
	},
);

export default router;
