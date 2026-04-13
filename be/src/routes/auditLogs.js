// be/src/routes/auditLogs.js
import express from "express";
import {
	ScanCommand,
	QueryCommand,
	GetItemCommand,
	PutItemCommand,
	DeleteItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import client from "../config/db.js";
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

		let indexName = "LogTypeTimestampIndex";
		let keyConditionExpression = "logType = :logType";
		let expressionAttributeValues = { ":logType": "LOG" };
		let expressionAttributeNames = {};
		let filterExpressions = [];

		// Các bộ lọc linh hoạt (FilterExpression)
		if (entityType) {
			// Nếu lọc theo entityType, ta chọn index theo entityType
			indexName = "EntityTypeTimestampIndex";
			keyConditionExpression = "entityType = :entityType";
			expressionAttributeValues = { ":entityType": entityType };
		} else if (action) {
			// Nếu không có entityType nhưng có action, ta chọn action index
			indexName = "ActionTimestampIndex";
			keyConditionExpression = "#action = :action";
			expressionAttributeNames["#action"] = "action";
			expressionAttributeValues = { ":action": action };
		} else if (userId) {
			// Nếu không có cả trên nhưng có userId, chọn user index
			indexName = "UserTimestampIndex";
			keyConditionExpression = "userId = :userId";
			expressionAttributeValues = { ":userId": userId };
		}

		// Xử lý lọc chéo và lọc ngày tháng bằng FilterExpression
		if (entityType && indexName !== "EntityTypeTimestampIndex") {
			filterExpressions.push("entityType = :entityType");
			expressionAttributeValues[":entityType"] = entityType;
		}
		if (action && indexName !== "ActionTimestampIndex") {
			filterExpressions.push("#action = :action");
			expressionAttributeNames["#action"] = "action";
			expressionAttributeValues[":action"] = action;
		}
		if (userId && indexName !== "UserTimestampIndex") {
			filterExpressions.push("userId = :userId");
			expressionAttributeValues[":userId"] = userId;
		}

		// Lọc thời gian (Timestamp)
		if (startDate || endDate) {
			expressionAttributeNames["#timestamp"] = "timestamp";
			if (startDate && endDate) {
				filterExpressions.push("#timestamp BETWEEN :startDate AND :endDate");
				expressionAttributeValues[":startDate"] = startDate;
				expressionAttributeValues[":endDate"] = endDate;
			} else if (startDate) {
				filterExpressions.push("#timestamp >= :startDate");
				expressionAttributeValues[":startDate"] = startDate;
			} else if (endDate) {
				filterExpressions.push("#timestamp <= :endDate");
				expressionAttributeValues[":endDate"] = endDate;
			}
		}

		const queryParams = {
			TableName: AUDIT_LOG_TABLE,
			IndexName: indexName,
			KeyConditionExpression: keyConditionExpression,
			ExpressionAttributeValues: marshall(expressionAttributeValues, { removeUndefinedValues: true }),
			ScanIndexForward: false, // Mới nhất trước
			Limit: pageSize,
		};

		if (Object.keys(expressionAttributeNames).length > 0) {
			queryParams.ExpressionAttributeNames = expressionAttributeNames;
		}
		if (filterExpressions.length > 0) {
			queryParams.FilterExpression = filterExpressions.join(" AND ");
		}

		const command = new QueryCommand(queryParams);
		let { Items, LastEvaluatedKey } = await client.send(command);
		
		let logs = Items ? Items.map(item => unmarshall(item)) : [];

		// --- FALLBACK LOGIC ---
		// Nếu Query mặc định (LogTypeTimestampIndex) không có dữ liệu, 
		// thử Scan một lần để lấy các log cũ chưa có logType
		if (logs.length === 0 && indexName === "LogTypeTimestampIndex") {
			console.log("No logs found via Index. Falling back to Scan for old data...");
			const scanParams = {
				TableName: AUDIT_LOG_TABLE,
				Limit: pageSize,
			};
			const scanCommand = new ScanCommand(scanParams);
			const scanResult = await client.send(scanCommand);
			if (scanResult.Items && scanResult.Items.length > 0) {
				logs = scanResult.Items.map(item => unmarshall(item));
				// Sắp xếp tay vì Scan không tự sắp xếp
				logs.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
				LastEvaluatedKey = scanResult.LastEvaluatedKey;
			}
		}
		
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
				totalItems: logs.length,
			},
			lastEvaluatedKey: LastEvaluatedKey ? unmarshall(LastEvaluatedKey) : null
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
		// Sử dụng Scan + Filter thay vì GetItem vì cấu trúc Primary Key của bảng log có thể phức tạp (composite key)
		const scanLogCmd = new ScanCommand({
			TableName: AUDIT_LOG_TABLE,
			FilterExpression: "logId = :logId",
			ExpressionAttributeValues: marshall({ ":logId": logId })
		});
		const { Items } = await client.send(scanLogCmd);
		if (!Items || Items.length === 0) return res.status(404).json({ error: "Không tìm thấy nhật ký này." });

		const log = unmarshall(Items[0]);
		const { entityType, entityId, action, oldData: oldDataRaw, newData: newDataRaw } = log;
		
		const tableInfo = ENTITY_TABLE_MAP[entityType];
		if (!tableInfo) return res.status(400).json({ error: `Thực thể '${entityType}' không hỗ trợ hoàn tác.` });

		const oldData = oldDataRaw ? JSON.parse(oldDataRaw) : null;
		const newData = newDataRaw ? JSON.parse(newDataRaw) : null;

		// 2. Thực hiện khôi phục
		if (action === "CREATE") {
			// Rollback CREATE -> DELETE
			const deleteCmd = new DeleteItemCommand({
				TableName: tableInfo.table,
				Key: marshall({ [tableInfo.key]: entityId })
			});
			await client.send(deleteCmd);
		} else if (action === "UPDATE" || action === "DELETE") {
			// Rollback UPDATE/DELETE -> Restore oldData
			if (!oldData) return res.status(400).json({ error: "Không có dữ liệu cũ để khôi phục." });
			
			const restoreCmd = new PutItemCommand({
				TableName: tableInfo.table,
				Item: marshall(oldData, { removeUndefinedValues: true })
			});
			await client.send(restoreCmd);
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
			cacheManager.flushCache(cacheName);
		}

		res.json({ message: "Hoàn tác thành công.", entityType, entityId });
	} catch (error) {
		console.error("Lỗi khi thực hiện Rollback:", error);
		res.status(500).json({ error: "Lỗi hệ thống khi hoàn tác dữ liệu." });
	}
});

export default router;
