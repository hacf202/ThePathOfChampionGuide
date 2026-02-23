// be/src/routes/relics.js
import express from "express";
import {
	ScanCommand,
	PutItemCommand,
	DeleteItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import NodeCache from "node-cache";
import client from "../config/db.js";
import { authenticateCognitoToken } from "../middleware/authenticate.js";
import { removeAccents } from "../utils/vietnameseUtils.js";

const router = express.Router();
const RELICS_TABLE = "guidePocRelics";

// Bộ nhớ đệm đơn giản để "Batch" quản lý tài nguyên hình ảnh
const imageCache = new Map();

// Khởi tạo cache 120 giây (2 phút)
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

		// Sắp xếp mặc định theo tên A-Z
		cachedData.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

		relicCache.set(CACHE_KEY, cachedData);
	}
	return cachedData;
}

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
			stacks = "", // Nhận chuỗi các stack lọc
			sort = "name-asc",
		} = req.query;

		const pageSize = parseInt(limit);
		const currentPage = parseInt(page);

		const allRelics = await getCachedRelics();

		// 1. Trích xuất bộ lọc động - Stack xử lý như chuỗi
		const availableFilters = {
			rarities: [...new Set(allRelics.map(r => r.rarity))]
				.filter(Boolean)
				.sort(),
			types: [...new Set(allRelics.map(r => r.type))].filter(Boolean).sort(),
			stacks: [...new Set(allRelics.map(r => String(r.stack)))]
				.filter(Boolean)
				.sort(),
		};

		// 2. Thực hiện lọc (Filtering)
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
			const sList = stacks.split(","); // So sánh chuỗi stack
			filtered = filtered.filter(r => sList.includes(String(r.stack)));
		}

		// 3. Sắp xếp (Sorting)
		const [field, order] = sort.split("-");
		filtered.sort((a, b) => {
			let vA = a[field] ?? "";
			let vB = b[field] ?? "";
			return order === "asc"
				? vA.toString().localeCompare(vB.toString())
				: vB.toString().localeCompare(vA.toString());
		});

		// 4. Phân trang (Pagination)
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
		console.error("Lỗi API Relics:", error);
		res.status(500).json({ error: "Could not retrieve relics" });
	}
});

// GET /api/relics/proxy-image - Proxy có Caching để tăng tốc độ tải ảnh
router.get("/proxy-image", async (req, res) => {
	const { url } = req.query;
	if (!url) return res.status(400).json({ error: "URL parameter is required" });

	// Kiểm tra xem ảnh đã có trong bộ nhớ đệm chưa
	if (imageCache.has(url)) {
		const cached = imageCache.get(url);
		res.set("Content-Type", cached.contentType);
		res.set("Cache-Control", "public, max-age=86400");
		return res.send(cached.buffer);
	}

	try {
		const response = await fetch(url, {
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
			},
		});

		if (!response.ok)
			throw new Error(`Failed to fetch image: ${response.status}`);

		const contentType = response.headers.get("content-type");
		const arrayBuffer = await response.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		// Lưu vào bộ nhớ đệm
		imageCache.set(url, { buffer, contentType });

		res.set("Content-Type", contentType);
		res.set("Cache-Control", "public, max-age=86400");
		res.send(buffer);
	} catch (error) {
		console.error("Error proxying image:", error);
		res.status(500).json({ error: "Could not fetch image" });
	}
});

// Giữ nguyên các route PUT và DELETE của bạn
router.put("/", authenticateCognitoToken, async (req, res) => {
	const relicData = req.body;
	if (!relicData.relicCode)
		return res.status(400).json({ error: "Relic code is required" });
	try {
		const command = new PutItemCommand({
			TableName: RELICS_TABLE,
			Item: marshall(relicData),
		});
		await client.send(command);
		res
			.status(200)
			.json({ message: "Relic data updated successfully", relic: relicData });
		relicCache.del("all_relics_data");
	} catch (error) {
		console.error("Error updating relic data:", error);
		res.status(500).json({ error: "Could not update relic data" });
	}
});

router.delete("/:relicCode", authenticateCognitoToken, async (req, res) => {
	const { relicCode } = req.params;
	try {
		const command = new DeleteItemCommand({
			TableName: RELICS_TABLE,
			Key: marshall({ relicCode }),
		});
		await client.send(command);
		res
			.status(200)
			.json({ message: `Relic with code ${relicCode} deleted successfully` });
		relicCache.del("all_relics_data");
	} catch (error) {
		console.error("Error deleting relic:", error);
		res.status(500).json({ error: "Could not delete relic" });
	}
});

export default router;
