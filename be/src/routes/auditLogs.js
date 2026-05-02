// be/src/routes/auditLogs.js
import express from "express";
import { getDb } from "../config/mongo.js";
import { authenticateCognitoToken } from "../middleware/authenticate.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import cacheManager from "../utils/cacheManager.js";
import { createAuditLog } from "../utils/auditLogger.js";

const router = express.Router();
const AUDIT_LOG_TABLE = "guidePocAuditLogs";

/**
 * @route   GET /api/admin/audit-logs
 * @desc    Lấy danh sách nhật ký thay đổi dữ liệu
 */
router.get("/", authenticateCognitoToken, requireAdmin, async (req, res) => {
	try {
		const {
			page = 1,
			limit = 50,
			entityType = "",
			action = "",
			userId = "",
			startDate = "",
			endDate = "",
		} = req.query;

		const pageSize = parseInt(limit);
		const currentPage = parseInt(page);

		const db = getDb();
		const query = {};

		// Các bộ lọc linh hoạt (FilterExpression)
		if (entityType) {
			query.entityType = entityType;
		}
		if (action) {
			query.action = action;
		}
		if (userId) {
			query.userId = userId;
		}

		// Lọc thời gian (Timestamp)
		if (startDate || endDate) {
			query.timestamp = {};
			if (startDate) query.timestamp.$gte = startDate;
			if (endDate) query.timestamp.$lte = endDate;
		}
		
		// Fallback logType (trong MongoDB thì query theo LOG, MongoDB ta query tất cả nếu không có filter)
		if (!entityType && !action && !userId && !startDate && !endDate) {
			// Query mặc định: Có thể lọc logType = "LOG" hoặc lấy hết
		}

		const totalItems = await db.collection(AUDIT_LOG_TABLE).countDocuments(query);
		const totalPages = Math.ceil(totalItems / pageSize);

		let logs = await db.collection(AUDIT_LOG_TABLE)
			.find(query)
			.sort({ timestamp: -1 })
			.skip((currentPage - 1) * pageSize)
			.limit(pageSize)
			.toArray();
		
		// Parse JSON strings back to objects
		logs = logs.map(log => ({
			...log,
			oldData: log.oldData ? JSON.parse(log.oldData) : null,
			newData: log.newData ? JSON.parse(log.newData) : null,
		}));

		res.json({
			items: logs,
			pagination: {
				currentPage,
				pageSize,
				totalItems,
				totalPages
			},
			lastEvaluatedKey: null // No longer used in MongoDB pagination
		});

	} catch (error) {
		console.error("Lỗi khi lấy Audit Logs:", error);
		res.status(500).json({ error: "Lỗi hệ thống khi truy vấn nhật ký." });
	}
});

const ENTITY_TABLE_MAP = {
	champion: { table: "guidePocChampionList", key: "championID" },
	power: { table: "guidePocPowers", key: "powerCode" },
	relic: { table: "guidePocRelics", key: "relicCode" },
	item: { table: "guidePocItems", key: "itemCode" },
	rune: { table: "guidePocRunes", key: "runeCode" },
	boss: { table: "guidePocBosses", key: "bossID" },
	adventure: { table: "guidePocAdventureMap", key: "adventureID" },
	bonusStar: { table: "guidePocBonusStar", key: "bonusStarID" },
	guide: { table: "guidePocGuideList", key: "slug" },
	card: { table: "guidePocCardList", key: "cardCode" },
	build: { table: "Builds", key: "id" },
};

const ENTITY_CACHE_MAP = {
	champion: "champions",
	power: "powers",
	relic: "relics",
	item: "items",
	rune: "runes",
	boss: "bosses",
	adventure: "adventures",
	guide: "guides",
	bonusStar: "bonusStars",
	card: "cards",
	build: "builds",
};

/**
 * @route   POST /api/admin/audit-logs/rollback/:logId
 * @desc    Hoàn tác một thay đổi dữ liệu
 */
router.post("/rollback/:logId", authenticateCognitoToken, requireAdmin, async (req, res) => {
	const { logId } = req.params;

	try {
		// 1. Lấy thông tin log
		const db = getDb();
		const log = await db.collection(AUDIT_LOG_TABLE).findOne({ logId });
		if (!log) return res.status(404).json({ error: "Không tìm thấy nhật ký này." });

		const { entityType, entityId, action, oldData: oldDataRaw, newData: newDataRaw } = log;
		
		const tableInfo = ENTITY_TABLE_MAP[entityType];
		if (!tableInfo) return res.status(400).json({ error: `Thực thể '${entityType}' không hỗ trợ hoàn tác.` });

		const oldData = oldDataRaw ? JSON.parse(oldDataRaw) : null;
		const newData = newDataRaw ? JSON.parse(newDataRaw) : null;

		// 2. Thực hiện khôi phục
		if (action === "CREATE") {
			// Rollback CREATE -> DELETE
			await db.collection(tableInfo.table).deleteOne({ [tableInfo.key]: entityId });
		} else if (action === "UPDATE" || action === "DELETE") {
			// Rollback UPDATE/DELETE -> Restore oldData
			if (!oldData) return res.status(400).json({ error: "Không có dữ liệu cũ để khôi phục." });
			
			delete oldData._id;
			
			await db.collection(tableInfo.table).replaceOne(
				{ [tableInfo.key]: entityId },
				oldData,
				{ upsert: true }
			);
		}

		// 3. Ghi log hoàn tác
		await createAuditLog({
			action: "ROLLBACK",
			entityType,
			entityId,
			entityName: log.entityName || entityId,
			oldData: newData, // Dữ liệu trước khi rollback (chính là dữ liệu hiện tại)
			newData: oldData, // Dữ liệu sau khi rollback
			user: req.user
		});

		// 4. Xóa cache
		const cacheName = ENTITY_CACHE_MAP[entityType];
		if (cacheName) {
			await cacheManager.flushCache(cacheName);
		}

		res.json({ message: "Hoàn tác thành công.", entityType, entityId });
	} catch (error) {
		console.error("Lỗi khi thực hiện Rollback:", error);
		res.status(500).json({ error: "Lỗi hệ thống khi hoàn tác dữ liệu." });
	}
});

export default router;
