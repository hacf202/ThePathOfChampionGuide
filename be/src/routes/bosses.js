// be/src/routes/bosses.js
import express from "express";
import { getDb } from "../config/mongo.js";
import { authenticateCognitoToken } from "../middleware/authenticate.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { removeAccents } from "../utils/vietnameseUtils.js";
import { createAuditLog } from "../utils/auditLogger.js";
import { AppError, asyncHandler } from "../middleware/errorMiddleware.js";

// --- Import từ DataService (Giai đoạn 2) ---
import {
	getCachedBosses,
	resolveBossPowers,
	invalidateBossCache,
} from "../services/dataService.js";

const router = express.Router();
const BOSS_TABLE = "guidePocBosses";

/**
 * @route   GET /api/bosses
 * @desc    Danh sách Boss với tìm kiếm, sắp xếp, phân trang
 */
router.get("/", asyncHandler(async (req, res) => {
	const {
		page = 1,
		limit = 20,
		searchTerm = "",
		sort = "bossName-asc",
	} = req.query;

	const pageSize    = parseInt(limit);
	const currentPage = parseInt(page);

	// Lấy từ DataService (RAM → MongoDB)
	let allBosses = await getCachedBosses();

	// 1. Lọc theo searchTerm
	let filtered = [...allBosses];
	if (searchTerm.trim()) {
		const searchKey = removeAccents(searchTerm.trim().toLowerCase());
		filtered = filtered.filter(b => {
			const nameVn  = removeAccents(b.bossName || "");
			const nameEn  = removeAccents(b.translations?.en?.bossName || "");
			const bossID  = (b.bossID || "").toLowerCase();
			return nameVn.includes(searchKey) || nameEn.includes(searchKey) || bossID.includes(searchKey);
		});
	}

	// 2. Sắp xếp
	const [field, order] = sort.split("-");
	filtered.sort((a, b) => {
		let vA = a[field] ?? "";
		let vB = b[field] ?? "";
		if (typeof vA === "string") return order === "asc" ? vA.localeCompare(vB) : vB.localeCompare(vA);
		return order === "asc" ? vA - vB : vB - vA;
	});

	// 3. Phân trang
	const totalItems = filtered.length;
	const paginatedItems = pageSize < 0
		? filtered
		: filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
	const totalPages = pageSize > 0 ? Math.ceil(totalItems / pageSize) : 1;

	// 4. Resolve Powers (gộp thông tin đầy đủ)
	const resolvedItems = await resolveBossPowers(paginatedItems);

	res.json({
		items: resolvedItems,
		pagination: {
			totalItems,
			totalPages,
			currentPage,
			pageSize: pageSize < 0 ? totalItems : pageSize,
		},
	});
}));

/**
 * @route   GET /api/bosses/:bossID
 * @desc    Chi tiết một Boss (kèm resolvedPowers)
 */
router.get("/:bossID", asyncHandler(async (req, res) => {
	const { bossID } = req.params;
	const db = getDb();
	const Item = await db.collection(BOSS_TABLE).findOne({ bossID });
	if (!Item) throw new AppError("Không tìm thấy Boss.", 404);

	const bossData = Item;
	const resolvedBoss = await resolveBossPowers(bossData);
	res.json(resolvedBoss);
}));

/**
 * @route   POST /api/bosses/resolve
 * @desc    Lấy nhiều Boss theo danh sách IDs (tránh N+1 Query)
 */
router.post("/resolve", asyncHandler(async (req, res) => {
	const { ids } = req.body;
	if (!ids || !Array.isArray(ids)) {
		throw new AppError("Tham số 'ids' phải là một mảng (array).", 400);
	}

	const uniqueIds = [...new Set(ids)];
	if (uniqueIds.length === 0) return res.json([]);

	// Tìm trong DataService cache trước (cực nhanh)
	const allBosses = await getCachedBosses();
	const resolvedFromCache = allBosses.filter(b => uniqueIds.includes(b.bossID));

	// Nếu cache có đủ, trả ngay
	if (resolvedFromCache.length === uniqueIds.length) {
		return res.json(resolvedFromCache);
	}

	// Nếu thiếu, fetch song song từ MongoDB
	const fetchPromises = uniqueIds.map(async bossID => {
		const db = getDb();
		const Item = await db.collection(BOSS_TABLE).findOne({ bossID });
		return Item ? Item : null;
	});
	const results = (await Promise.all(fetchPromises)).filter(Boolean);
	res.json(results);
}));

/**
 * @route   PUT /api/bosses
 * @desc    Tạo mới hoặc cập nhật Boss (Admin only)
 */
router.put("/", authenticateCognitoToken, requireAdmin, asyncHandler(async (req, res) => {
	const data = req.body;
	const { bossID, isNew, bossName } = data;

	if (!bossID || !bossName) {
		throw new AppError("bossID và bossName là bắt buộc.", 400);
	}

	const db = getDb();
	const Item = await db.collection(BOSS_TABLE).findOne({ bossID: bossID.trim() });
	const exists = !!Item;

	if (isNew && exists)  throw new AppError(`Mã Boss "${bossID}" đã tồn tại.`, 409);
	if (!isNew && !exists) throw new AppError(`Không tìm thấy Boss "${bossID}".`, 404);

	const dataToSave = { ...data };
	delete dataToSave.isNew;
	delete dataToSave._id;

	await db.collection(BOSS_TABLE).replaceOne({ bossID }, dataToSave, { upsert: true });

	await createAuditLog({
		action: isNew ? "CREATE" : "UPDATE",
		entityType: "boss",
		entityId: bossID,
		entityName: dataToSave.bossName,
		oldData: Item ? Item : null,
		newData: dataToSave,
		user: req.user,
	});

	// Xóa cache qua DataService
	await invalidateBossCache();

	res.json({
		message: isNew ? "Tạo Boss thành công." : "Cập nhật Boss thành công.",
		data: dataToSave,
	});
}));

/**
 * @route   DELETE /api/bosses/:bossID
 * @desc    Xóa Boss (Admin only)
 */
router.delete("/:bossID", authenticateCognitoToken, requireAdmin, asyncHandler(async (req, res) => {
	const { bossID } = req.params;

	const db = getDb();
	const Item = await db.collection(BOSS_TABLE).findOne({ bossID });
	const oldData = Item ? Item : null;

	if (!Item) throw new AppError(`Không tìm thấy Boss "${bossID}" để xóa.`, 404);

	await db.collection(BOSS_TABLE).deleteOne({ bossID });

	await createAuditLog({
		action: "DELETE",
		entityType: "boss",
		entityId: bossID,
		entityName: oldData?.bossName || bossID,
		oldData,
		newData: null,
		user: req.user,
	});

	await invalidateBossCache();
	res.json({ message: "Đã xóa Boss thành công." });
}));

export default router;
