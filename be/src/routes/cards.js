// be/src/routes/cards.js
import express from "express";
import {
	ScanCommand,
	PutItemCommand,
	DeleteItemCommand,
	GetItemCommand,
	QueryCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import NodeCache from "node-cache";
import client from "../config/db.js";
import { authenticateCognitoToken } from "../middleware/authenticate.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { removeAccents } from "../utils/vietnameseUtils.js";

const router = express.Router();
const CARDS_TABLE = "guidePocCardList";

// Cache 120 giây
const cardCache = new NodeCache({ stdTTL: 120, checkperiod: 60 });

/**
 * Lấy toàn bộ cards từ DB hoặc cache, sắp xếp A-Z theo cardName
 */
async function getCachedCards() {
	const CACHE_KEY = "all_cards_data";
	let cachedData = cardCache.get(CACHE_KEY);

	if (!cachedData) {
		const command = new ScanCommand({ TableName: CARDS_TABLE });
		const { Items } = await client.send(command);
		cachedData = Items ? Items.map(item => unmarshall(item)) : [];
		cachedData.sort((a, b) =>
			(a.cardName || "").localeCompare(b.cardName || ""),
		);
		cardCache.set(CACHE_KEY, cachedData);
	}
	return cachedData;
}

/**
 * @route   GET /api/cards
 * @desc    Lấy danh sách lá bài với tìm kiếm và phân trang
 */
router.get("/", async (req, res) => {
	try {
		const {
			page = 1,
			limit = 24,
			searchTerm = "",
			sort = "cardName-asc",
		} = req.query;

		const pageSize = parseInt(limit);
		const currentPage = parseInt(page);

		const allCards = await getCachedCards();

		let filtered = [...allCards];

		if (searchTerm) {
			const searchKey = removeAccents(searchTerm.toLowerCase());
			filtered = filtered.filter(c => {
				const nameVi = removeAccents((c.cardName || "").toLowerCase());
				const nameEn = removeAccents(
					(c.translations?.en?.cardName || "").toLowerCase(),
				);
				return nameVi.includes(searchKey) || nameEn.includes(searchKey);
			});
		}

		const [field, order] = sort.split("-");
		filtered.sort((a, b) => {
			let vA = a[field] ?? "";
			let vB = b[field] ?? "";
			if (typeof vA === "string") {
				return order === "asc" ? vA.localeCompare(vB) : vB.localeCompare(vA);
			}
			return order === "asc" ? vA - vB : vB - vA;
		});

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
		});
	} catch (error) {
		console.error("Lỗi lấy danh sách cards:", error);
		res.status(500).json({ error: "Lỗi hệ thống." });
	}
});

/**
 * @route   GET /api/cards/search?name=...
 * @desc    Tìm card theo cardName (dùng GSI name-index)
 */
router.get("/search", async (req, res) => {
	const { name } = req.query;

	if (!name || typeof name !== "string" || name.trim().length < 1) {
		return res.status(400).json({ error: "Tham số 'name' là bắt buộc." });
	}

	try {
		const command = new QueryCommand({
			TableName: CARDS_TABLE,
			IndexName: "name-index",
			KeyConditionExpression: "cardName = :cardName",
			ExpressionAttributeValues: marshall({ ":cardName": name.trim() }),
		});

		const { Items } = await client.send(command);
		const cards = Items ? Items.map(item => unmarshall(item)) : [];

		res.json({ items: cards });
	} catch (error) {
		console.error("Lỗi tìm kiếm card theo tên:", error);
		res.status(500).json({ error: "Không thể tìm kiếm card." });
	}
});

/**
 * @route   POST /api/cards/resolve
 * @desc    Lấy thông tin chi tiết từ mảng cardCodes
 */
router.post("/resolve", async (req, res) => {
	try {
		const { ids } = req.body;
		if (!Array.isArray(ids) || ids.length === 0) {
			return res.json([]);
		}

		const allCards = await getCachedCards();
		const resolvedCards = ids
			.map(code => allCards.find(c => c.cardCode === code) || null)
			.filter(Boolean);

		res.json(resolvedCards);
	} catch (error) {
		console.error("Lỗi resolve cards:", error);
		res.status(500).json({ error: "Lỗi hệ thống khi resolve cards." });
	}
});

/**
 * @route   GET /api/cards/:cardCode
 * @desc    Lấy chi tiết một lá bài
 */
router.get("/:cardCode", async (req, res) => {
	const { cardCode } = req.params;

	if (!cardCode) {
		return res.status(400).json({ error: "cardCode là bắt buộc." });
	}

	const CACHE_KEY = `card_detail_${cardCode}`;

	try {
		const cached = cardCache.get(CACHE_KEY);
		if (cached) return res.json(cached);

		const command = new GetItemCommand({
			TableName: CARDS_TABLE,
			Key: marshall({ cardCode }),
		});

		const { Item } = await client.send(command);

		if (!Item) {
			return res.status(404).json({ error: "Không tìm thấy lá bài." });
		}

		const cardData = unmarshall(Item);
		cardCache.set(CACHE_KEY, cardData);

		res.json(cardData);
	} catch (error) {
		console.error("Lỗi lấy chi tiết card:", error);
		res.status(500).json({ error: "Lỗi hệ thống." });
	}
});

/**
 * @route   PUT /api/cards
 * @desc    Tạo mới hoặc cập nhật lá bài (Admin only)
 */
router.put("/", authenticateCognitoToken, requireAdmin, async (req, res) => {
	const rawData = req.body;

	if (!rawData.cardCode?.trim() || !rawData.cardName?.trim()) {
		return res
			.status(400)
			.json({ error: "cardCode và cardName là bắt buộc." });
	}

	const cardCode = rawData.cardCode.trim();
	const { isNew, ...dataToSave } = rawData;

	const cleanData = {
		...dataToSave,
		cardCode,
		cardName: rawData.cardName.trim(),
	};

	try {
		const checkCmd = new GetItemCommand({
			TableName: CARDS_TABLE,
			Key: marshall({ cardCode }),
		});
		const { Item } = await client.send(checkCmd);

		if (isNew === true && Item) {
			return res
				.status(400)
				.json({ error: "Lá bài với mã này đã tồn tại." });
		}
		if (!isNew && !Item) {
			return res
				.status(404)
				.json({ error: "Lá bài không tồn tại để cập nhật." });
		}

		await client.send(
			new PutItemCommand({
				TableName: CARDS_TABLE,
				Item: marshall(cleanData, { removeUndefinedValues: true }),
			}),
		);

		// Xóa cache
		cardCache.del("all_cards_data");
		cardCache.del(`card_detail_${cardCode}`);

		res.json({
			message: isNew ? "Tạo lá bài mới thành công." : "Cập nhật lá bài thành công.",
			card: cleanData,
		});
	} catch (error) {
		console.error("Lỗi lưu card:", error);
		res.status(500).json({ error: "Không thể lưu lá bài." });
	}
});

/**
 * @route   DELETE /api/cards/:cardCode
 * @desc    Xóa lá bài (Admin only)
 */
router.delete(
	"/:cardCode",
	authenticateCognitoToken,
	requireAdmin,
	async (req, res) => {
		const { cardCode } = req.params;

		if (!cardCode?.trim()) {
			return res.status(400).json({ error: "cardCode không hợp lệ." });
		}

		const id = cardCode.trim();

		try {
			const getCmd = new GetItemCommand({
				TableName: CARDS_TABLE,
				Key: marshall({ cardCode: id }),
			});
			const { Item } = await client.send(getCmd);

			if (!Item) {
				return res.status(404).json({ error: "Không tìm thấy lá bài để xóa." });
			}

			await client.send(
				new DeleteItemCommand({
					TableName: CARDS_TABLE,
					Key: marshall({ cardCode: id }),
				}),
			);

			cardCache.del("all_cards_data");
			cardCache.del(`card_detail_${id}`);

			const deletedCard = unmarshall(Item);
			res.status(200).json({
				message: `Lá bài "${deletedCard.cardName}" (${id}) đã được xóa.`,
			});
		} catch (error) {
			console.error("Lỗi xóa card:", error);
			res.status(500).json({ error: "Không thể xóa lá bài." });
		}
	},
);

export default router;
