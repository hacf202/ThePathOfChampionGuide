// be/src/utils/auditLogger.js
import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { v4 as uuidv4 } from "uuid";
import client from "../config/db.js";

const AUDIT_LOG_TABLE = "guidePocAuditLogs";

/**
 * Ghi nhật ký thay đổi dữ liệu vào DynamoDB
 * 
 * @param {Object} params
 * @param {string} params.action - CREATE, UPDATE, DELETE
 * @param {string} params.entityType - champion, power, relic, item, rune, boss, adventure, bonusStar, etc.
 * @param {string} params.entityId - ID của thực thể (championID, powerCode, etc.)
 * @param {string} params.entityName - Tên hiển thị của thực thể (nếu có)
 * @param {Object} params.oldData - Dữ liệu cũ trước khi thay đổi (null nếu CREATE)
 * @param {Object} params.newData - Dữ liệu mới sau khi thay đổi (null nếu DELETE)
 * @param {Object} params.user - Thông tin user thực hiện (sub, name, email)
 */
export async function createAuditLog({
	action,
	entityType,
	entityId,
	entityName = "",
	oldData = null,
	newData = null,
	user = {}
}) {
	try {
		const logEntry = {
			logId: uuidv4(),
			logType: "LOG", // Cố định để tạo GSI truy vấn theo thời gian
			timestamp: new Date().toISOString(),
			action,
			entityType,
			entityId,
			entityName,
			userId: user.sub || user.userId || "unknown",
			userName: user.name || user.email || "Unknown User",
			oldData: oldData ? JSON.stringify(oldData) : null,
			newData: newData ? JSON.stringify(newData) : null,
		};

		const command = new PutItemCommand({
			TableName: AUDIT_LOG_TABLE,
			Item: marshall(logEntry, { removeUndefinedValues: true }),
		});

		await client.send(command);
		console.log(`Audit Log created: ${action} ${entityType} ${entityId}`);
	} catch (error) {
		console.error("Lỗi khi ghi Audit Log:", error);
		// Không ném lỗi ra ngoài để tránh làm gián đoạn luồng lưu dữ liệu chính
	}
}
