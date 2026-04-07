// be/src/routes/auditLogs.js
import express from "express";
import {
	ScanCommand,
	QueryCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import client from "../config/db.js";
import { authenticateCognitoToken } from "../middleware/authenticate.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

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

export default router;
