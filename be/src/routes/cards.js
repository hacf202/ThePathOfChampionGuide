// be/src/routes/cards.js
import express from "express";
import cacheManager from "../utils/cacheManager.js";
import { getDb } from "../config/mongo.js";
import { authenticateCognitoToken } from "../middleware/authenticate.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { removeAccents } from "../utils/vietnameseUtils.js";
import { createAuditLog } from "../utils/auditLogger.js";
import { getCachedCards, invalidateCardCache } from "../services/dataService.js";
import fs from 'fs';
import path from 'path';

const router = express.Router();
const CARDS_TABLE = "guidePocCardList";
const cardCache = cacheManager.getOrCreateCache("cards", { stdTTL: 86400, checkperiod: 60 });

// getCachedCards() đã được chuyển vào dataService.js
export { getCachedCards } from "../services/dataService.js";

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
					c.descriptionRaw,
					c.translations?.en?.cardName,
					c.translations?.en?.descriptionRaw,
					...(c.keywords || []),
					...(c.translations?.en?.keywords || [])
				].filter(Boolean).map(text => removeAccents(text.toLowerCase()));

				// Kiểm tra: Mọi từ trong keyword phải xuất hiện ở ÍT NHẤT 1 trường dữ liệu
				return searchWords.every(word => textSources.some(source => source.includes(word)));
			});
		}

		const [field, order] = sort.split("-");
		filtered.sort((a, b) => {
			// Đặc biệt: Ưu tiên loại Anh hùng (Champion) lên đầu cho các kiểu sắp xếp
			// Nếu người dùng muốn "Tiêu hao thấp-cao" nhưng Anh hùng lên trước
			const typeA = (a.translations?.en?.type || a.type || "").toLowerCase();
			const typeB = (b.translations?.en?.type || b.type || "").toLowerCase();
			const isChampA = typeA === "champion";
			const isChampB = typeB === "champion";

			if (isChampA && !isChampB) return -1;
			if (!isChampA && isChampB) return 1;

			// Sau đó mới đến logic sắp xếp theo field
			const targetField = field === "championCost" ? "cost" : field;
			let vA = a[targetField] ?? "";
			let vB = b[targetField] ?? "";
			
			if (typeof vA === "string") {
				return order === "asc" ? vA.localeCompare(vB) : vB.localeCompare(vA);
			}
			return order === "asc" ? vA - vB : vB - vA;
		});

		const totalItems = filtered.length;
		const paginatedItemsRaw = pageSize < 0 ? filtered : filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

		// Tinh gọn dữ liệu (Projection) cho danh sách để giảm dung lượng gói tin
		const normalizeArray = (val) => {
			if (Array.isArray(val)) return val;
			if (typeof val === 'string' && val.trim()) return [val.trim()];
			return [];
		};

		const paginatedItems = paginatedItemsRaw.map(c => ({
			cardCode: c.cardCode,
			cardName: c.cardName,
			descriptionRaw: c.descriptionRaw,
			type: c.type,
			cost: c.cost,
			regions: normalizeArray(c.regions),
			rarity: c.rarity,
			keywords: normalizeArray(c.keywords),
			subtypes: normalizeArray(c.subtypes),
			gameAbsolutePath: c.gameAbsolutePath,
			translations: c.translations ? {
				en: {
					cardName: c.translations.en?.cardName,
					descriptionRaw: c.translations.en?.descriptionRaw,
					gameAbsolutePath: c.translations.en?.gameAbsolutePath,
					type: c.translations.en?.type,
					regions: normalizeArray(c.translations.en?.regions),
					keywords: normalizeArray(c.translations.en?.keywords)
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
		const cached = await cardCache.get(CACHE_KEY);
		let cardData = cached;

		// Chuẩn hóa dữ liệu: đảm bảo các trường danh sách luôn là mảng
		const normalizeArray = (val) => {
			if (Array.isArray(val)) return val;
			if (typeof val === 'string' && val.trim()) return [val.trim()];
			return [];
		};

		if (!cardData) {
			const db = getDb();
			const Item = await db.collection(CARDS_TABLE).findOne({ cardCode });

			if (!Item) {
				return res.status(404).json({ error: "Không tìm thấy lá bài." });
			}
			cardData = Item;
			delete cardData._id;
		}

		cardData.keywords = normalizeArray(cardData.keywords);
		cardData.subtypes = normalizeArray(cardData.subtypes);
		if (cardData.translations?.en) {
			cardData.translations.en.keywords = normalizeArray(cardData.translations.en.keywords);
			cardData.translations.en.regions = normalizeArray(cardData.translations.en.regions);
		}

		// Fallback: Nếu thiếu keywords hoặc subtypes (do lỗi migration hoặc cache cũ), lấy từ backup JSON
		if (cardData.keywords.length === 0 || cardData.subtypes.length === 0) {
			try {
				const backupPath = path.resolve(process.cwd(), 'uploadData/mongo_backup_2026-05-02T13-40-55/guidePocCardList.json');
				if (fs.existsSync(backupPath)) {
					const backupContent = fs.readFileSync(backupPath, 'utf8');
					const backupData = JSON.parse(backupContent);
					const backupCard = backupData.find(c => c.cardCode === cardCode);
					if (backupCard) {
						if (cardData.keywords.length === 0) cardData.keywords = normalizeArray(backupCard.keywords);
						if (cardData.subtypes.length === 0) cardData.subtypes = normalizeArray(backupCard.subtypes);
						
						if (!cardData.translations) cardData.translations = {};
						if (!cardData.translations.en) cardData.translations.en = {};
						
						if (!cardData.translations.en.keywords || cardData.translations.en.keywords.length === 0) {
							cardData.translations.en.keywords = normalizeArray(backupCard.translations?.en?.keywords);
						}
					}
				}
			} catch (e) {
				console.error("Lỗi khi lấy dữ liệu fallback từ JSON:", e);
			}
		}

		// Resolve associatedCardRefs thành objects đầy đủ (nếu chưa có associatedCards)
		if (!cardData.associatedCards || cardData.associatedCards.length === 0) {
			if (cardData.associatedCardRefs?.length > 0) {
				const allCards = await getCachedCards();
				cardData.associatedCards = cardData.associatedCardRefs
					.map(code => allCards.find(c => c.cardCode === code))
					.filter(Boolean);
			} else {
				cardData.associatedCards = [];
			}
		}

		await cardCache.set(CACHE_KEY, cardData);

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
	const { isNew, _id, ...dataToSave } = rawData;

	const cleanData = {
		...dataToSave,
		cardCode,
		cardName: rawData.cardName.trim(),
	};

	try {
		const db = getDb();
		const Item = await db.collection(CARDS_TABLE).findOne({ cardCode });

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

		await db.collection(CARDS_TABLE).replaceOne(
			{ cardCode },
			cleanData,
			{ upsert: true }
		);

		await createAuditLog({
			action: isNew ? "CREATE" : "UPDATE",
			entityType: "card",
			entityId: cardCode,
			entityName: cleanData.cardName,
			oldData: Item ? Item : null,
			newData: cleanData,
			user: req.user
		});

		await invalidateCardCache(cardCode);

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
			const db = getDb();
			const Item = await db.collection(CARDS_TABLE).findOne({ cardCode: id });

			if (!Item) {
				return res.status(404).json({ error: "Không tìm thấy lá bài để xóa." });
			}

			await db.collection(CARDS_TABLE).deleteOne({ cardCode: id });

			await invalidateCardCache(id);

			const deletedCard = Item;

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
