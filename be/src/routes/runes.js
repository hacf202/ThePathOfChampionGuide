// be/src/routes/runes.js
import express from "express";
import {
	ScanCommand,
	PutItemCommand,
	DeleteItemCommand,
	GetItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import cacheManager from "../utils/cacheManager.js";
import client from "../config/db.js";
import { authenticateCognitoToken } from "../middleware/authenticate.js";
import { removeAccents } from "../utils/vietnameseUtils.js";
import { scanAll } from "../utils/dynamoUtils.js";

const router = express.Router();
const RUNES_TABLE = "guidePocRunes";

// Khởi tạo cache 1800 giây (30 phút)
const runeCache = cacheManager.getOrCreateCache("runes", { stdTTL: 86400, checkperiod: 60 });

/**
 * Lấy toàn bộ Runes từ Database hoặc RAM
 */
async function getCachedRunes() {
	const CACHE_KEY = "all_runes_data";
	let cachedData = runeCache.get(CACHE_KEY);

	if (!cachedData) {
		const rawItems = await scanAll(client, { TableName: RUNES_TABLE });
		cachedData = rawItems.map(item => unmarshall(item));

		// Sắp xếp mặc định theo tên A-Z
		cachedData.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

		runeCache.set(CACHE_KEY, cachedData);
	}
	return cachedData;
}

/**
 * @route   GET /api/runes/:runeCode
 * @desc    Lấy chi tiết một ngọc (Ưu tiên RAM -> Database)
 */
router.get("/:runeCode", async (req, res) => {
	const { runeCode } = req.params;
	if (!runeCode)
		return res.status(400).json({ error: "runeCode là bắt buộc." });

	const id = runeCode.trim();
	const CACHE_KEY = `rune_detail_${id}`;

	// 1. Kiểm tra Cache RAM trước
	const cachedRune = runeCache.get(CACHE_KEY);
	if (cachedRune) return res.json(cachedRune);

	try {
		// 2. Truy vấn DynamoDB nếu Cache miss
		const command = new GetItemCommand({
			TableName: RUNES_TABLE,
			Key: marshall({ runeCode: id }),
		});

		const { Item } = await client.send(command);
		if (!Item)
			return res.status(404).json({ error: `Không tìm thấy ngọc: ${id}` });

		const runeData = unmarshall(Item);

		// 3. Lưu vào Cache
		runeCache.set(CACHE_KEY, runeData);

		res.json(runeData);
	} catch (error) {
		console.error(`Lỗi khi lấy chi tiết ngọc ${id}:`, error);
		res.status(500).json({ error: "Lỗi hệ thống khi truy vấn dữ liệu." });
	}
});

/**
 * @route   GET /api/runes
 * @desc    Lấy danh sách Ngọc (Phân trang, Lọc, Cache)
 */
router.get("/", async (req, res) => {
	try {
		const {
			page = 1,
			limit = 24,
			searchTerm = "",
			rarities = "",
			sort = "name-asc",
		} = req.query;

		const pageSize = parseInt(limit);
		const currentPage = parseInt(page);

		const allRunes = await getCachedRunes();

		const availableFilters = {
			rarities: [...new Set(allRunes.map(r => r.rarity))]
				.filter(Boolean)
				.sort(),
		};

		let filtered = [...allRunes];

		if (searchTerm) {
			const searchKey = removeAccents(searchTerm.toLowerCase());
			filtered = filtered.filter(r => {
				const nameVn = removeAccents(r.name || "");
				const descVn = removeAccents(r.description || "");
				const nameEn = removeAccents(r.translations?.en?.name || "");
				const descEn = removeAccents(r.translations?.en?.description || "");

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
			filtered = filtered.filter(r => rList.includes(r.rarity));
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
		console.error("Lỗi API Runes:", error);
		res.status(500).json({ error: "Không thể lấy danh sách ngọc." });
	}
});

/**
 * @route   POST /api/runes/resolve
 * @desc    Lấy chi tiết danh sách Ngọc từ mảng IDs
 */
router.post("/resolve", async (req, res) => {
	const { ids } = req.body;
	if (!Array.isArray(ids))
		return res.status(400).json({ error: "ids must be an array" });

	try {
		const allRunes = await getCachedRunes();
		const result = allRunes.filter(r => ids.includes(r.runeCode));
		res.json(result);
	} catch (error) {
		res.status(500).json({ error: "Lỗi truy vấn Runes" });
	}
});

/**
 * @route   PUT /api/runes
 * @desc    Tạo mới hoặc Cập nhật ngọc (Kiểm tra tồn tại ID)
 */
router.put("/", authenticateCognitoToken, async (req, res) => {
	const runeData = req.body;
	const { runeCode, isNew } = runeData;

	if (!runeCode)
		return res.status(400).json({ error: "Mã ngọc (runeCode) là bắt buộc." });

	try {
		const checkCommand = new GetItemCommand({
			TableName: RUNES_TABLE,
			Key: marshall({ runeCode: runeCode.trim() }),
		});
		const { Item } = await client.send(checkCommand);
		const exists = !!Item;

		if (isNew && exists) {
			return res.status(409).json({
				error: `Mã ngọc "${runeCode}" đã tồn tại. Không thể tạo mới trùng mã.`,
			});
		}

		if (!isNew && !exists) {
			return res.status(404).json({
				error: `Mã ngọc "${runeCode}" không tồn tại. Không thể cập nhật.`,
			});
		}

		const dataToSave = { ...runeData };
		delete dataToSave.isNew;

		await client.send(
			new PutItemCommand({
				TableName: RUNES_TABLE,
				Item: marshall(dataToSave, { removeUndefinedValues: true }),
			}),
		);

		runeCache.del("all_runes_data");
		runeCache.del(`rune_detail_${runeCode}`);

		res.status(200).json({
			message: isNew ? "Tạo mới thành công" : "Cập nhật thành công",
			rune: dataToSave,
		});
	} catch (error) {
		console.error("Lỗi khi lưu ngọc:", error);
		res.status(500).json({ error: "Lỗi hệ thống khi xử lý dữ liệu." });
	}
});

/**
 * @route   DELETE /api/runes/:runeCode
 * @desc    Xóa ngọc
 */
router.delete("/:runeCode", authenticateCognitoToken, async (req, res) => {
	const { runeCode } = req.params;
	try {
		await client.send(
			new DeleteItemCommand({
				TableName: RUNES_TABLE,
				Key: marshall({ runeCode }),
			}),
		);
		runeCache.del("all_runes_data");
		runeCache.del(`rune_detail_${runeCode}`);
		res.status(200).json({ message: "Đã xóa ngọc thành công." });
	} catch (error) {
		console.error("Lỗi khi xóa ngọc:", error);
		res.status(500).json({ error: "Lỗi hệ thống khi xóa dữ liệu." });
	}
});

export default router;
