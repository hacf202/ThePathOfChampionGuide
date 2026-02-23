// be/src/routes/items.js
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
const ITEMS_TABLE = "guidePocItems";

// Khởi tạo cache 120 giây (2 phút)
const itemCache = new NodeCache({ stdTTL: 120 });

/**
 * Lấy toàn bộ Items từ DB hoặc RAM
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

		// 1. Trích xuất bộ lọc động
		const availableFilters = {
			rarities: [...new Set(allItems.map(i => i.rarity))]
				.filter(Boolean)
				.sort(),
		};

		// 2. Lọc dữ liệu
		let filtered = [...allItems];

		if (searchTerm) {
			const searchKey = removeAccents(searchTerm);
			filtered = filtered.filter(i =>
				removeAccents(i.name || "").includes(searchKey),
			);
		}

		if (rarities) {
			const rList = rarities.split(",");
			filtered = filtered.filter(i => rList.includes(i.rarity));
		}

		// 3. Sắp xếp
		const [field, order] = sort.split("-");
		filtered.sort((a, b) => {
			let vA = a[field] ?? "";
			let vB = b[field] ?? "";
			return order === "asc"
				? vA.toString().localeCompare(vB.toString())
				: vB.toString().localeCompare(vA.toString());
		});

		// 4. Phân trang
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
		console.error("Lỗi API Items:", error);
		res.status(500).json({ error: "Could not retrieve items" });
	}
});

// Xóa cache khi dữ liệu thay đổi
router.put("/", authenticateCognitoToken, async (req, res) => {
	const itemData = req.body;
	if (!itemData.itemCode)
		return res.status(400).json({ error: "Item code is required" });
	try {
		const command = new PutItemCommand({
			TableName: ITEMS_TABLE,
			Item: marshall(itemData),
		});
		await client.send(command);
		itemCache.del("all_items_data"); // Clear cache
		res
			.status(200)
			.json({ message: "Item data updated successfully", item: itemData });
	} catch (error) {
		res.status(500).json({ error: "Could not update item data" });
	}
});

router.delete("/:itemCode", authenticateCognitoToken, async (req, res) => {
	const { itemCode } = req.params;
	try {
		const command = new DeleteItemCommand({
			TableName: ITEMS_TABLE,
			Key: marshall({ itemCode }),
		});
		await client.send(command);
		itemCache.del("all_items_data"); // Clear cache
		res
			.status(200)
			.json({ message: `Item with code ${itemCode} deleted successfully` });
	} catch (error) {
		res.status(500).json({ error: "Could not delete item" });
	}
});

export default router;
