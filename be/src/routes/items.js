// be/src/routes/items.js
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
const ITEMS_TABLE = "guidePocItems";

// Khởi tạo cache 120 giây (2 phút)
const itemCache = new NodeCache({ stdTTL: 120 });

/**
 * Hàm lấy toàn bộ Items từ DB hoặc RAM.
 */
async function getCachedItems() {
	const CACHE_KEY = "all_items_data";
	let cachedData = itemCache.get(CACHE_KEY);

	if (!cachedData) {
		const command = new ScanCommand({ TableName: ITEMS_TABLE });
		const { Items } = await client.send(command);
		cachedData = Items ? Items.map(item => unmarshall(item)) : [];

		// Sắp xếp mặc định A-Z
		cachedData.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

		itemCache.set(CACHE_KEY, cachedData);
	}
	return cachedData;
}

/**
 * @route   GET /api/items/:itemCode
 * @desc    Lấy chi tiết một vật phẩm (Ưu tiên RAM -> Database)
 */
router.get("/:itemCode", async (req, res) => {
	const { itemCode } = req.params;
	if (!itemCode)
		return res.status(400).json({ error: "itemCode là bắt buộc." });

	const id = itemCode.trim();
	const CACHE_KEY = `item_detail_${id}`;

	const cachedItem = itemCache.get(CACHE_KEY);
	if (cachedItem) return res.json(cachedItem);

	try {
		const command = new GetItemCommand({
			TableName: ITEMS_TABLE,
			Key: marshall({ itemCode: id }),
		});

		const { Item } = await client.send(command);
		if (!Item)
			return res.status(404).json({ error: `Không tìm thấy vật phẩm: ${id}` });

		const itemData = unmarshall(Item);
		itemCache.set(CACHE_KEY, itemData);

		res.json(itemData);
	} catch (error) {
		console.error(`Lỗi lấy chi tiết vật phẩm ${id}:`, error);
		res.status(500).json({ error: "Lỗi hệ thống." });
	}
});

/**
 * @route   GET /api/items
 * @desc    Lấy danh sách vật phẩm (Phân trang, Lọc, Cache)
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

		const allItems = await getCachedItems();
		const availableFilters = {
			rarities: [...new Set(allItems.map(i => i.rarity))]
				.filter(Boolean)
				.sort(),
		};

		let filtered = [...allItems];
		if (searchTerm) {
			const searchKey = removeAccents(searchTerm.toLowerCase());
			filtered = filtered.filter(i =>
				removeAccents((i.name || "").toLowerCase()).includes(searchKey),
			);
		}
		if (rarities) {
			const rList = rarities.split(",");
			filtered = filtered.filter(i => rList.includes(i.rarity));
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
		res.status(500).json({ error: "Không thể lấy danh sách vật phẩm." });
	}
});

/**
 * @route   POST /api/items/resolve
 * @desc    Lấy chi tiết danh sách Vật phẩm từ mảng IDs
 */
router.post("/resolve", async (req, res) => {
	const { ids } = req.body;
	if (!Array.isArray(ids))
		return res.status(400).json({ error: "ids must be an array" });

	try {
		const allItems = await getCachedItems();
		const result = allItems.filter(i => ids.includes(i.itemCode));
		res.json(result);
	} catch (error) {
		res.status(500).json({ error: "Lỗi truy vấn Items" });
	}
});

/**
 * @route   PUT /api/items
 * @desc    Tạo mới hoặc Cập nhật vật phẩm (Kiểm tra tồn tại)
 */
router.put("/", authenticateCognitoToken, async (req, res) => {
	const itemData = req.body;
	const { itemCode, isNew } = itemData;

	if (!itemCode)
		return res
			.status(400)
			.json({ error: "Mã vật phẩm (itemCode) là bắt buộc." });

	try {
		const checkCommand = new GetItemCommand({
			TableName: ITEMS_TABLE,
			Key: marshall({ itemCode: itemCode.trim() }),
		});
		const { Item } = await client.send(checkCommand);
		const exists = !!Item;

		if (isNew && exists) {
			return res.status(409).json({
				error: `Mã vật phẩm "${itemCode}" đã tồn tại. Không thể tạo mới trùng mã.`,
			});
		}

		if (!isNew && !exists) {
			return res.status(404).json({
				error: `Mã vật phẩm "${itemCode}" không tồn tại. Không thể cập nhật.`,
			});
		}

		const dataToSave = { ...itemData };
		delete dataToSave.isNew;

		await client.send(
			new PutItemCommand({
				TableName: ITEMS_TABLE,
				Item: marshall(dataToSave, { removeUndefinedValues: true }),
			}),
		);

		itemCache.del("all_items_data");
		itemCache.del(`item_detail_${itemCode}`);

		res.status(200).json({
			message: isNew ? "Tạo mới thành công" : "Cập nhật thành công",
			item: dataToSave,
		});
	} catch (error) {
		console.error("Lỗi khi lưu vật phẩm:", error);
		res.status(500).json({ error: "Lỗi hệ thống khi xử lý dữ liệu." });
	}
});

/**
 * @route   DELETE /api/items/:itemCode
 * @desc    Xóa vật phẩm
 */
router.delete("/:itemCode", authenticateCognitoToken, async (req, res) => {
	const { itemCode } = req.params;
	try {
		await client.send(
			new DeleteItemCommand({
				TableName: ITEMS_TABLE,
				Key: marshall({ itemCode }),
			}),
		);
		itemCache.del("all_items_data");
		itemCache.del(`item_detail_${itemCode}`);
		res.status(200).json({ message: "Đã xóa vật phẩm thành công." });
	} catch (error) {
		console.error("Lỗi khi xóa vật phẩm:", error);
		res.status(500).json({ error: "Lỗi hệ thống khi xóa." });
	}
});

export default router;
