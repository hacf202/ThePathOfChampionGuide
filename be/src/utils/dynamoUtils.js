// be/src/utils/dynamoUtils.js
import { ScanCommand } from "@aws-sdk/client-dynamodb";

/**
 * Thực hiện quét toàn bộ bảng DynamoDB (Recursive Scan)
 * Để vượt qua giới hạn 1MB dữ liệu cho mỗi lần Scan.
 * 
 * @param {DynamoDBClient} client - AWS SDK Client
 * @param {Object} params - Tham số truyền cho ScanCommand (TableName, etc.)
 * @returns {Array} - Danh sách tất cả các Items tìm được
 */
export async function scanAll(client, params) {
	let items = [];
	let lastEvaluatedKey = undefined;

	do {
		const command = new ScanCommand({
			...params,
			ExclusiveStartKey: lastEvaluatedKey,
		});

		const result = await client.send(command);
		if (result.Items) {
			items = items.concat(result.Items);
		}
		lastEvaluatedKey = result.LastEvaluatedKey;

	} while (lastEvaluatedKey);

	return items;
}
