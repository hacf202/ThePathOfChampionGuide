// be/src/routes/dbStats.js
// API để quản lý và theo dõi mức sử dụng CSDL MongoDB
import express from "express";
import { getDb } from "../config/mongo.js";
import { authenticateCognitoToken } from "../middleware/authenticate.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = express.Router();

// Danh sách tất cả collection, kèm giới hạn tùy chỉnh (documents)
// MongoDB Atlas Free Tier: 512MB storage
const COLLECTION_CONFIGS = [
	{ name: "guidePocChampionList",          label: "Champions",            limit: 200 },
	{ name: "guidePocPowers",                label: "Powers",               limit: 2000 },
	{ name: "guidePocRelics",                label: "Relics",               limit: 500 },
	{ name: "guidePocItems",                 label: "Items",                limit: 500 },
	{ name: "guidePocRunes",                 label: "Runes",                limit: 200 },
	{ name: "guidePocBonusStar",             label: "Bonus Stars",          limit: 100 },
	{ name: "guidePocCardList",              label: "Cards",                limit: 5000 },
	{ name: "guidePocBosses",               label: "Bosses",               limit: 200 },
	{ name: "guidePocAdventureMap",         label: "Adventure Maps",        limit: 100 },
	{ name: "guidePocChampionConstellation", label: "Constellations",       limit: 200 },
	{ name: "guidePocGuideList",            label: "Guides",               limit: 500 },
	{ name: "guidePocFavoriteBuilds",       label: "Favorites",            limit: 100000 },
	{ name: "guidePocPlayStyleRating",      label: "Ratings",              limit: 50000 },
	{ name: "guidePocAuditLogs",            label: "Audit Logs",           limit: 100000 },
];

// Free tier Atlas: 512MB
const FREE_TIER_STORAGE_LIMIT_MB = 512;

/**
 * @route   GET /api/admin/db-stats/overview
 * @desc    Tổng quan về tình trạng sử dụng CSDL
 * @access  Private (Admin only)
 */
router.get("/overview", authenticateCognitoToken, requireAdmin, async (req, res) => {
	try {
		const db = getDb();

		// Lấy thông tin storage tổng thể từ database stats
		const dbStats = await db.command({ dbStats: 1, scale: 1024 * 1024 }); // scale to MB

		const totalStorageMB = parseFloat((dbStats.storageSize || 0).toFixed(2));
		const dataStorageMB = parseFloat((dbStats.dataSize || 0).toFixed(2));
		const indexStorageMB = parseFloat((dbStats.indexSize || 0).toFixed(2));
		const totalObjects = dbStats.objects || 0;
		const collections = dbStats.collections || 0;

		res.json({
			storage: {
				totalStorageMB,
				dataStorageMB,
				indexStorageMB,
				limitMB: FREE_TIER_STORAGE_LIMIT_MB,
				usagePercent: parseFloat(((totalStorageMB / FREE_TIER_STORAGE_LIMIT_MB) * 100).toFixed(1)),
			},
			objects: {
				total: totalObjects,
				collections,
			},
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error("[DbStats] Error fetching overview:", error);
		res.status(500).json({ error: error.message });
	}
});

/**
 * @route   GET /api/admin/db-stats/collections
 * @desc    Chi tiết từng collection: số documents, storage size, % limit
 * @access  Private (Admin only)
 */
router.get("/collections", authenticateCognitoToken, requireAdmin, async (req, res) => {
	try {
		const db = getDb();

		const results = await Promise.all(
			COLLECTION_CONFIGS.map(async (config) => {
				try {
					// collStats trả về thông tin chi tiết của collection
					const stats = await db.command({ collStats: config.name, scale: 1024 });
					const count = stats.count || 0;
					const storageSizeKB = parseFloat((stats.storageSize || 0).toFixed(2));
					const avgObjSizeBytes = count > 0 ? parseFloat((stats.avgObjSize || 0).toFixed(0)) : 0;
					const indexSizeKB = parseFloat(((stats.totalIndexSize || 0) / 1024).toFixed(2));

					return {
						name: config.name,
						label: config.label,
						count,
						limit: config.limit,
						usagePercent: parseFloat(((count / config.limit) * 100).toFixed(1)),
						storageSizeKB,
						indexSizeKB,
						avgObjSizeBytes,
						status: count >= config.limit ? "critical" : count >= config.limit * 0.8 ? "warning" : "ok",
					};
				} catch {
					// Collection chưa tồn tại hoặc trống
					return {
						name: config.name,
						label: config.label,
						count: 0,
						limit: config.limit,
						usagePercent: 0,
						storageSizeKB: 0,
						indexSizeKB: 0,
						avgObjSizeBytes: 0,
						status: "empty",
					};
				}
			})
		);

		// Tổng hợp
		const totalDocs = results.reduce((sum, r) => sum + r.count, 0);
		const criticalCount = results.filter(r => r.status === "critical").length;
		const warningCount = results.filter(r => r.status === "warning").length;

		res.json({
			collections: results,
			summary: {
				totalDocs,
				criticalCount,
				warningCount,
			},
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error("[DbStats] Error fetching collection stats:", error);
		res.status(500).json({ error: error.message });
	}
});

/**
 * @route   PUT /api/admin/db-stats/collection-limit
 * @desc    Cập nhật giới hạn document cho collection (lưu vào memory, reset khi restart)
 * @access  Private (Admin only)
 */
router.put("/collection-limit", authenticateCognitoToken, requireAdmin, async (req, res) => {
	const { collectionName, newLimit } = req.body;

	if (!collectionName || !newLimit || newLimit < 1) {
		return res.status(400).json({ error: "Thiếu collectionName hoặc newLimit không hợp lệ." });
	}

	const config = COLLECTION_CONFIGS.find(c => c.name === collectionName);
	if (!config) {
		return res.status(404).json({ error: `Không tìm thấy collection: ${collectionName}` });
	}

	config.limit = parseInt(newLimit);

	res.json({
		message: `Đã cập nhật giới hạn cho "${collectionName}" thành ${config.limit} documents.`,
		collection: collectionName,
		newLimit: config.limit,
	});
});

export default router;
