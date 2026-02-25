// be/src/routes/relics.js
import express from "express";
import {
	ScanCommand,
	PutItemCommand,
	DeleteItemCommand,
	GetItemCommand, // THÊM: Import để lấy chi tiết lẻ
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import NodeCache from "node-cache";
import axios from "axios"; // BỔ SUNG: Để xử lý proxy hình ảnh
import client from "../config/db.js";
import { authenticateCognitoToken } from "../middleware/authenticate.js";
import { removeAccents } from "../utils/vietnameseUtils.js";

const router = express.Router();
const RELICS_TABLE = "guidePocRelics";

const imageCache = new Map();
const relicCache = new NodeCache({ stdTTL: 120 });

/**
 * Lấy toàn bộ dữ liệu Relics từ DB hoặc Cache
 */
async function getCachedRelics() {
	const CACHE_KEY = "all_relics_data";
	let cachedData = relicCache.get(CACHE_KEY);

	if (!cachedData) {
		const command = new ScanCommand({ TableName: RELICS_TABLE });
		const { Items } = await client.send(command);
		cachedData = Items ? Items.map(item => unmarshall(item)) : [];
		cachedData.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
		relicCache.set(CACHE_KEY, cachedData);
	}
	return cachedData;
}

/**
 * @route   GET /api/relics/proxy-image
 * @desc    Proxy hình ảnh từ Riot để tránh lỗi CORS và Referer
 * FIX: Route này phục vụ việc hiển thị ảnh tại frontend
 */
router.get("/proxy-image", async (req, res) => {
	const imageUrl = req.query.url;

	if (!imageUrl) {
		return res.status(400).json({ error: "URL là bắt buộc." });
	}

	try {
		// 1. Kiểm tra trong Cache RAM trước
		if (imageCache.has(imageUrl)) {
			const cached = imageCache.get(imageUrl);
			res.set("Content-Type", cached.contentType);
			res.set("Cache-Control", "public, max-age=86400");
			return res.send(cached.data);
		}

		// 2. Fetch ảnh từ server gốc
		const response = await axios({
			url: imageUrl,
			method: "GET",
			responseType: "arraybuffer",
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
			},
			timeout: 10000,
		});

		const contentType = response.headers["content-type"];
		const buffer = Buffer.from(response.data, "binary");

		// 3. Lưu vào Cache để tối ưu
		if (imageCache.size < 500) {
			imageCache.set(imageUrl, {
				data: buffer,
				contentType: contentType,
			});
		}

		res.set("Content-Type", contentType);
		res.set("Cache-Control", "public, max-age=86400");
		res.send(buffer);
	} catch (error) {
		console.error(`Proxy lỗi cho ${imageUrl}:`, error.message);
		res.status(404).json({ error: "Không thể tải ảnh." });
	}
});

/**
 * @route   GET /api/relics/:relicCode
 * @desc    Lấy chi tiết một cổ vật (Ưu tiên RAM -> Database)
 * FIX: Thêm route này để đồng bộ với Frontend
 */
router.get("/:relicCode", async (req, res) => {
	const { relicCode } = req.params;
	if (!relicCode)
		return res.status(400).json({ error: "relicCode là bắt buộc." });

	const id = relicCode.trim();
	const CACHE_KEY = `relic_detail_${id}`;

	// 1. Kiểm tra trong Cache RAM trước
	const cachedRelic = relicCache.get(CACHE_KEY);
	if (cachedRelic) return res.json(cachedRelic);

	try {
		// 2. Truy vấn chính xác từ DynamoDB
		const command = new GetItemCommand({
			TableName: RELICS_TABLE,
			Key: marshall({ relicCode: id }),
		});

		const { Item } = await client.send(command);
		if (!Item)
			return res.status(404).json({ error: `Không tìm thấy cổ vật: ${id}` });

		const relicData = unmarshall(Item);

		// 3. Lưu vào Cache để tối ưu các lần gọi sau
		relicCache.set(CACHE_KEY, relicData);
		res.json(relicData);
	} catch (error) {
		console.error(`Lỗi khi lấy chi tiết cổ vật ${id}:`, error);
		res.status(500).json({ error: "Lỗi hệ thống khi truy vấn dữ liệu." });
	}
});

/**
 * @route   GET /api/relics
 * @desc    Lấy danh sách cổ vật với phân trang, lọc và cache
 */
router.get("/", async (req, res) => {
	try {
		const {
			page = 1,
			limit = 21,
			searchTerm = "",
			rarities = "",
			types = "",
			stacks = "",
			sort = "name-asc",
		} = req.query;
		const pageSize = parseInt(limit);
		const currentPage = parseInt(page);
		const allRelics = await getCachedRelics();

		const availableFilters = {
			rarities: [...new Set(allRelics.map(r => r.rarity))]
				.filter(Boolean)
				.sort(),
			types: [...new Set(allRelics.map(r => r.type))].filter(Boolean).sort(),
			stacks: [...new Set(allRelics.map(r => String(r.stack)))]
				.filter(Boolean)
				.sort(),
		};

		let filtered = [...allRelics];
		if (searchTerm) {
			const searchKey = removeAccents(searchTerm);
			filtered = filtered.filter(r =>
				removeAccents(r.name || "").includes(searchKey),
			);
		}
		if (rarities) {
			const rList = rarities.split(",");
			filtered = filtered.filter(r => rList.includes(r.rarity));
		}
		if (types) {
			const tList = types.split(",");
			filtered = filtered.filter(r => tList.includes(r.type));
		}
		if (stacks) {
			const sList = stacks.split(",");
			filtered = filtered.filter(r => sList.includes(String(r.stack)));
		}

		const [field, order] = sort.split("-");
		filtered.sort((a, b) => {
			let vA = a[field] ?? "";
			let vB = b[field] ?? "";
			return order === "asc"
				? vA.toString().localeCompare(vB.toString())
				: vB.toString().localeCompare(vA.toString());
		});

		// Logic xử lý lấy toàn bộ khi limit = -1 (dành cho Tier List)
		if (pageSize === -1) {
			return res.json({
				items: filtered,
				pagination: {
					totalItems: filtered.length,
					totalPages: 1,
					currentPage: 1,
					pageSize: filtered.length,
				},
				availableFilters,
			});
		}

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
		res.status(500).json({ error: "Could not retrieve relics" });
	}
});

/**
 * @route   POST /api/relics/resolve
 * @desc    Lấy chi tiết danh sách Cổ vật từ mảng tên
 */
router.post("/resolve", async (req, res) => {
	const { names } = req.body;
	if (!Array.isArray(names))
		return res.status(400).json({ error: "Names must be an array" });
	try {
		const allRelics = await getCachedRelics();
		const result = allRelics.filter(r => names.includes(r.name));
		res.json(result);
	} catch (error) {
		res.status(500).json({ error: "Lỗi truy vấn Relics" });
	}
});

// Proxy image và các route PUT/DELETE giữ nguyên logic xóa cache chi tiết
router.put("/", authenticateCognitoToken, async (req, res) => {
	const relicData = req.body;
	if (!relicData.relicCode)
		return res.status(400).json({ error: "Relic code is required" });
	try {
		await client.send(
			new PutItemCommand({
				TableName: RELICS_TABLE,
				Item: marshall(relicData),
			}),
		);
		relicCache.del("all_relics_data");
		relicCache.del(`relic_detail_${relicData.relicCode}`);
		res.status(200).json({ message: "Updated", relic: relicData });
	} catch (error) {
		res.status(500).json({ error: "Could not update" });
	}
});

router.delete("/:relicCode", authenticateCognitoToken, async (req, res) => {
	const { relicCode } = req.params;
	try {
		await client.send(
			new DeleteItemCommand({
				TableName: RELICS_TABLE,
				Key: marshall({ relicCode }),
			}),
		);
		relicCache.del("all_relics_data");
		relicCache.del(`relic_detail_${relicCode}`);
		res.status(200).json({ message: "Deleted" });
	} catch (error) {
		res.status(500).json({ error: "Could not delete" });
	}
});

export default router;
