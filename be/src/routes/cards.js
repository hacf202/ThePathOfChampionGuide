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
import cacheManager from "../utils/cacheManager.js";
import client from "../config/db.js";
import { authenticateCognitoToken } from "../middleware/authenticate.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { removeAccents } from "../utils/vietnameseUtils.js";
import { scanAll } from "../utils/dynamoUtils.js";
import { createAuditLog } from "../utils/auditLogger.js";

const router = express.Router();
const CARDS_TABLE = "guidePocCardList";

// Cache 30 phút (1800s) vì dữ liệu Card rất lớn và ít thay đổi
const cardCache = cacheManager.getOrCreateCache("cards", { stdTTL: 86400, checkperiod: 60 });

/**
 * Lấy toàn bộ cards từ DB hoặc cache, sắp xếp A-Z theo cardName
 */
export async function getCachedCards() {
	const CACHE_KEY = "all_cards_data";
	let cachedData = cardCache.get(CACHE_KEY);

	if (!cachedData) {
		const rawItems = await scanAll(client, { TableName: CARDS_TABLE });
		cachedData = rawItems.map(item => unmarshall(item));
		cachedData.sort((a, b) =>
			(a.cardName || "").localeCompare(b.cardName || ""),
		);
		cardCache.set(CACHE_KEY, cachedData);
	}
	return cachedData;
}

/**
 * @route   GET /api/cards
 * @desc    Lấy danh sách lá bài với tìm kiếm và phân trang (Tối ưu hóa query)
 */
router.get("/", async (req, res) => {
	try {
		const {
			page = 1,
			limit = 24,
			searchTerm = "",
			rarities = "", // Common, Rare, etc.
			regions = "",  // Noxus, Ionia, etc.
			types = "",    // Unit, Spell, Landmark, Equipment
			costs = "",    // 0, 1, 2, ...
			sort = "cardName-asc",
			onlyBase = "false", // Nếu true, chỉ trả về lá bài gốc (không có hậu tố T)
		} = req.query;

		const pageSize = parseInt(limit);
		const currentPage = parseInt(page);

		// --- Default: Scan all and cache-filter ---
		const allCards = await getCachedCards();
		let filtered = [...allCards];

		// 0. Lọc chỉ lấy lá bài gốc (không có hậu tố T sau phần số)
		if (onlyBase === "true") {
			filtered = filtered.filter(c => !/[A-Z]\d+T\d+$/.test(c.cardCode || ""));
		}

		// 1. Lọc theo Rarity
		if (rarities) {
			const rarityList = rarities.split(",").map(r => r.trim().toLowerCase());
			filtered = filtered.filter(c => {
				const cardRarity = (c.rarity || "None").toLowerCase();
				return rarityList.includes(cardRarity);
			});
		}

		// 2. Lọc theo Regions
		if (regions) {
			const regionList = regions.split(",").map(r => r.trim().toLowerCase());
			filtered = filtered.filter(c => {
				const cardRegions = (c.regions || []).map(r => r.toLowerCase());
				return regionList.some(r => cardRegions.includes(r));
			});
		}

		// 3. Lọc theo Types
		if (types) {
			const typeList = types.split(",").map(t => t.trim().toLowerCase());
			filtered = filtered.filter(c => {
				const typeVi = (c.type || "").toLowerCase();
				const typeEn = (c.translations?.en?.type || "").toLowerCase();
				return typeList.includes(typeVi) || typeList.includes(typeEn);
			});
		}

		// 4. Lọc theo Costs
		if (costs) {
			const costList = costs.split(",").map(c => parseInt(c.trim()));
			filtered = filtered.filter(c => costList.includes(c.cost || 0));
		}

		// 5. Tìm kiếm (Bilingual & Multi-field)
		if (searchTerm) {
			const searchWords = removeAccents(searchTerm.toLowerCase()).split(/\s+/).filter(Boolean);
			filtered = filtered.filter(c => {
				// Các trường dữ liệu để tìm kiếm
				const textSources = [
					c.cardName,
					c.description,
					c.descriptionRaw,
					c.translations?.en?.cardName,
					c.translations?.en?.description,
					c.translations?.en?.descriptionRaw
				].filter(Boolean).map(text => removeAccents(text.toLowerCase()));

				// Kiểm tra: Mọi từ trong keyword phải xuất hiện ở ÍT NHẤT 1 trường dữ liệu
				return searchWords.every(word => textSources.some(source => source.includes(word)));
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
		const paginatedItemsRaw = pageSize < 0 ? filtered : filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

		// Tinh gọn dữ liệu (Projection) cho danh sách để giảm dung lượng gói tin
		const paginatedItems = paginatedItemsRaw.map(c => ({
			cardCode: c.cardCode,
			cardName: c.cardName,
			cost: c.cost,
			rarity: c.rarity,
			regions: c.regions,
			type: c.type,
			description: c.description,
			descriptionRaw: c.descriptionRaw,
			gameAbsolutePath: c.gameAbsolutePath,
			associatedCardRefs: c.associatedCardRefs || [],
			translations: c.translations ? {
				en: {
					cardName: c.translations.en?.cardName,
					description: c.translations.en?.description,
					descriptionRaw: c.translations.en?.descriptionRaw,
					gameAbsolutePath: c.translations.en?.gameAbsolutePath,
					type: c.translations.en?.type,
					regions: c.translations.en?.regions
				}
			} : undefined
		}));

		// --- Trích xuất bộ lọc động từ toàn bộ dữ liệu ---
		const availableFilters = {
			rarities: [...new Set(allCards.map(c => c.rarity || "None"))].sort(),
			regions: [...new Set(allCards.flatMap(c => c.regions || []))].sort(),
			types: [...new Set(allCards.map(c => (c.translations?.en?.type || c.type || "other").toLowerCase()))].sort(),
			costs: [...new Set(allCards.map(c => Number(c.cost || 0)))].sort((a, b) => a - b),
		};

		res.json({
			items: paginatedItems,
			pagination: {
				totalItems,
				totalPages: pageSize > 0 ? Math.ceil(totalItems / pageSize) : 1,
				currentPage,
				pageSize: pageSize < 0 ? totalItems : pageSize,
			},
			availableFilters, // Gửi bộ lọc động về cho FE
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
		const allCards = await getCachedCards();
		const searchTerm = name.trim().toLowerCase();
		
		const cards = allCards.filter(c => 
			(c.cardName && c.cardName.toLowerCase() === searchTerm) ||
			(c.translations?.en?.cardName && c.translations.en.cardName.toLowerCase() === searchTerm)
		);

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

		// Resolve associatedCardRefs thành objects đầy đủ
		if (cardData.associatedCardRefs?.length > 0) {
			const allCards = await getCachedCards();
			cardData.associatedCards = cardData.associatedCardRefs
				.map(code => allCards.find(c => c.cardCode === code))
				.filter(Boolean);
		} else {
			cardData.associatedCards = [];
		}

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

		await createAuditLog({
			action: isNew ? "CREATE" : "UPDATE",
			entityType: "card",
			entityId: cardCode,
			entityName: cleanData.cardName,
			oldData: Item ? unmarshall(Item) : null,
			newData: cleanData,
			user: req.user
		});

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

			// Ghi log thay đổi
			await createAuditLog({
				action: "DELETE",
				entityType: "card",
				entityId: id,
				entityName: deletedCard.cardName,
				oldData: deletedCard,
				newData: null,
				user: req.user
			});

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
