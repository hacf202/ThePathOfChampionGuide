// be/src/routes/runes.js
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
const RUNES_TABLE = "guidePocRunes";

// Khởi tạo cache 120 giây (2 phút)
const runeCache = new NodeCache({ stdTTL: 120 });

/**
 * Lấy toàn bộ Runes từ Database hoặc RAM
 */
async function getCachedRunes() {
	const CACHE_KEY = "all_runes_data";
	let cachedData = runeCache.get(CACHE_KEY);

	if (!cachedData) {
		const command = new ScanCommand({ TableName: RUNES_TABLE });
		const { Items } = await client.send(command);
		cachedData = Items ? Items.map(item => unmarshall(item)) : [];

		// Sắp xếp mặc định theo tên A-Z
		cachedData.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

		runeCache.set(CACHE_KEY, cachedData);
	}
	return cachedData;
}

/**
 * @route   GET /api/runes
 * @desc    Lấy danh sách Ngọc (Phân trang, Lọc gần đúng, Cache)
 */
router.get("/", async (req, res) => {
	try {
		const {
			page = 1,
			limit = 21,
			searchTerm = "",
			rarities = "",
			sort = "name-asc",
		} = req.query;

		const pageSize = parseInt(limit);
		const currentPage = parseInt(page);

		// 1. Lấy dữ liệu từ cache (hoặc scan nếu hết hạn)
		const allRunes = await getCachedRunes();

		// 2. Trích xuất bộ lọc động dựa trên CSDL
		const availableFilters = {
			rarities: [...new Set(allRunes.map(r => r.rarity))]
				.filter(Boolean)
				.sort(),
		};

		// 3. Thực hiện lọc dữ liệu
		let filtered = [...allRunes];

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

		// 4. Sắp xếp
		const [field, order] = sort.split("-");
		filtered.sort((a, b) => {
			let vA = a[field] ?? "";
			let vB = b[field] ?? "";
			return order === "asc"
				? vA.toString().localeCompare(vB.toString())
				: vB.toString().localeCompare(vA.toString());
		});

		// 5. Phân trang
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
		console.error("Lỗi API Runes:", error);
		res.status(500).json({ error: "Could not retrieve runes" });
	}
});

// Cập nhật/Thêm mới - Xóa cache
router.put("/", authenticateCognitoToken, async (req, res) => {
	const runeData = req.body;
	if (!runeData.runeCode)
		return res.status(400).json({ error: "Rune code is required" });
	try {
		const command = new PutItemCommand({
			TableName: RUNES_TABLE,
			Item: marshall(runeData),
		});
		await client.send(command);
		runeCache.del("all_runes_data"); // Xóa cache để cập nhật dữ liệu mới
		res
			.status(200)
			.json({ message: "Rune data updated successfully", rune: runeData });
	} catch (error) {
		res.status(500).json({ error: "Could not update rune data" });
	}
});

// Xóa - Xóa cache
router.delete("/:runeCode", authenticateCognitoToken, async (req, res) => {
	const { runeCode } = req.params;
	try {
		const command = new DeleteItemCommand({
			TableName: RUNES_TABLE,
			Key: marshall({ runeCode }),
		});
		await client.send(command);
		runeCache.del("all_runes_data"); // Xóa cache
		res
			.status(200)
			.json({ message: `Rune with code ${runeCode} deleted successfully` });
	} catch (error) {
		res.status(500).json({ error: "Could not delete rune" });
	}
});

export default router;
