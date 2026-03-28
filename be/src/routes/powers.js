// be/src/routes/powers.js
import express from "express";
import {
	ScanCommand,
	PutItemCommand,
	DeleteItemCommand,
	GetItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import NodeCache from "node-cache";
import client from "../config/db.js";
import { authenticateCognitoToken } from "../middleware/authenticate.js";
import { removeAccents } from "../utils/vietnameseUtils.js";

const router = express.Router();
const POWERS_TABLE = "guidePocPowers";

// Cache 5 phút (300s) để tối ưu hiệu suất vì dữ liệu Sức mạnh lớn
const powerCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

/**
 * Hàm hỗ trợ lấy toàn bộ dữ liệu từ RAM hoặc Database
 */
async function getCachedPowers() {
	const CACHE_KEY = "all_powers_data";
	let cachedData = powerCache.get(CACHE_KEY);

	if (!cachedData) {
		const command = new ScanCommand({ TableName: POWERS_TABLE });
		const { Items } = await client.send(command);
		cachedData = Items ? Items.map(item => unmarshall(item)) : [];

		// Sắp xếp mặc định theo tên A-Z
		cachedData.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

		powerCache.set(CACHE_KEY, cachedData);
	}
	return cachedData;
}

/**
 * @route   GET /api/powers/:powerCode
 * @desc    Lấy chi tiết một sức mạnh
 */
router.get("/:powerCode", async (req, res) => {
	const { powerCode } = req.params;
	if (!powerCode)
		return res.status(400).json({ error: "powerCode là bắt buộc." });

	const id = powerCode.trim();
	const CACHE_KEY = `power_detail_${id}`;

	const cachedPower = powerCache.get(CACHE_KEY);
	if (cachedPower) return res.json(cachedPower);

	try {
		const command = new GetItemCommand({
			TableName: POWERS_TABLE,
			Key: marshall({ powerCode: id }),
		});

		const { Item } = await client.send(command);
		if (!Item)
			return res.status(404).json({ error: `Không tìm thấy sức mạnh: ${id}` });

		const powerData = unmarshall(Item);
		powerCache.set(CACHE_KEY, powerData);
		res.json(powerData);
	} catch (error) {
		console.error(`Lỗi lấy chi tiết sức mạnh ${id}:`, error);
		res.status(500).json({ error: "Lỗi hệ thống." });
	}
});

/**
 * @route   GET /api/powers
 * @desc    Lấy danh sách sức mạnh có phân trang và bộ lọc
 */
router.get("/", async (req, res) => {
	try {
		const {
			page = 1,
			limit = 24,
			searchTerm = "",
			rarities = "",
			types = "",
			sort = "name-asc",
		} = req.query;
		const pageSize = parseInt(limit);
		const currentPage = parseInt(page);

		const allPowers = await getCachedPowers();

		const availableFilters = {
			rarities: [...new Set(allPowers.map(p => p.rarity))]
				.filter(Boolean)
				.sort(),
			types: [...new Set(allPowers.flatMap(p => p.type || []))]
				.filter(Boolean)
				.sort(),
		};

		let filtered = [...allPowers];
		if (searchTerm) {
			const searchKey = removeAccents(searchTerm.toLowerCase());
			filtered = filtered.filter(p => {
				const nameVn = removeAccents(p.name);
				const descVn = removeAccents(p.description);
				const nameEn = removeAccents(p.translations?.en?.name);
				const descEn = removeAccents(p.translations?.en?.description);

				return (
					nameVn.includes(searchKey) ||
					descVn.includes(searchKey) ||
					nameEn.includes(searchKey) ||
					descEn.includes(searchKey)
				);
			});
		}
		if (rarities) {
			const rList = rarities.split(",");
			filtered = filtered.filter(p => rList.includes(p.rarity));
		}
		if (types) {
			const tList = types.split(",");
			filtered = filtered.filter(p => p.type?.some(t => tList.includes(t)));
		}

		const [field, order] = sort.split("-");
		filtered.sort((a, b) => {
			let vA = a[field] ?? "";
			let vB = b[field] ?? "";
			return order === "asc"
				? vA.toString().localeCompare(vB.toString())
				: vB.toString().localeCompare(vA.toString());
		});

		const totalItems = filtered.length;
		const totalPages = Math.ceil(totalItems / pageSize);
		const paginatedItems = filtered.slice(
			(currentPage - 1) * pageSize,
			currentPage * pageSize,
		);

		res.json({
			items: paginatedItems,
			pagination: { totalItems, totalPages, currentPage, pageSize },
			availableFilters,
		});
	} catch (error) {
		res.status(500).json({ error: "Không thể lấy danh sách sức mạnh." });
	}
});

/**
 * @route   PUT /api/powers
 * @desc    Tạo mới hoặc Cập nhật sức mạnh (Kiểm tra tồn tại ID)
 */
router.put("/", authenticateCognitoToken, async (req, res) => {
	const powerData = req.body;
	const { powerCode, isNew } = powerData;

	if (!powerCode) {
		return res
			.status(400)
			.json({ error: "Mã sức mạnh (powerCode) là bắt buộc." });
	}

	try {
		const checkCommand = new GetItemCommand({
			TableName: POWERS_TABLE,
			Key: marshall({ powerCode: powerCode.trim() }),
		});
		const { Item } = await client.send(checkCommand);
		const exists = !!Item;

		if (isNew && exists) {
			return res.status(409).json({
				error: `Mã sức mạnh "${powerCode}" đã tồn tại. Không thể tạo trùng.`,
			});
		}

		if (!isNew && !exists) {
			return res.status(404).json({
				error: `Mã sức mạnh "${powerCode}" không tồn tại. Không thể cập nhật.`,
			});
		}

		const dataToSave = { ...powerData };
		delete dataToSave.isNew;

		await client.send(
			new PutItemCommand({
				TableName: POWERS_TABLE,
				Item: marshall(dataToSave),
			}),
		);

		powerCache.del("all_powers_data");
		powerCache.del(`power_detail_${powerCode}`);

		res.status(200).json({
			message: isNew ? "Tạo mới thành công" : "Cập nhật thành công",
			power: dataToSave,
		});
	} catch (e) {
		console.error("Lỗi khi lưu sức mạnh:", e);
		res.status(500).json({ error: "Lỗi hệ thống khi xử lý dữ liệu." });
	}
});

/**
 * @route   DELETE /api/powers/:powerCode
 * @desc    Xóa sức mạnh
 */
router.delete("/:powerCode", authenticateCognitoToken, async (req, res) => {
	const { powerCode } = req.params;
	try {
		await client.send(
			new DeleteItemCommand({
				TableName: POWERS_TABLE,
				Key: marshall({ powerCode: powerCode }),
			}),
		);

		powerCache.del("all_powers_data");
		powerCache.del(`power_detail_${powerCode}`);

		res.status(200).json({ message: "Đã xóa sức mạnh thành công" });
	} catch (e) {
		console.error("Lỗi khi xóa sức mạnh:", e);
		res.status(500).json({ error: "Xóa thất bại." });
	}
});

/**
 * @route   POST /api/powers/resolve
 * @desc    Lấy chi tiết danh sách Sức mạnh từ mảng IDs
 */
router.post("/resolve", async (req, res) => {
	const { ids } = req.body;
	if (!Array.isArray(ids))
		return res.status(400).json({ error: "ids phải là một mảng." });

	try {
		const allPowers = await getCachedPowers();
		const result = allPowers.filter(p => ids.includes(p.powerCode));
		res.json(result);
	} catch (error) {
		res.status(500).json({ error: "Lỗi truy vấn Powers." });
	}
});

export default router;
