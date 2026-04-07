// be/scripts/migrateAuditLogs.js
import { ScanCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import client from "../src/config/db.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const TABLE_NAME = "guidePocAuditLogs";

const run = async () => {
	try {
		console.log(`Starting migration for table ${TABLE_NAME}...`);
		
		// 1. Quét toàn bộ bảng để tìm các mục thiếu logType
		const scanCommand = new ScanCommand({
			TableName: TABLE_NAME,
			FilterExpression: "attribute_not_exists(logType)",
		});
		
		const { Items } = await client.send(scanCommand);
		
		if (!Items || Items.length === 0) {
			console.log("No items need migration. Everything looks correct!");
			return;
		}

		console.log(`Found ${Items.length} items missing 'logType'. Updating...`);

		// 2. Lặp qua từng mục và cập nhật logType = 'LOG'
		let successCount = 0;
		for (const item of Items) {
			const unmarshalled = unmarshall(item);
			const { logId, timestamp } = unmarshalled;

			try {
				const updateCommand = new UpdateItemCommand({
					TableName: TABLE_NAME,
					Key: marshall({ logId, timestamp }),
					UpdateExpression: "SET logType = :logType",
					ExpressionAttributeValues: marshall({ ":logType": "LOG" }),
				});
				
				await client.send(updateCommand);
				successCount++;
				process.stdout.write(".");
			} catch (err) {
				console.error(`\nFailed to update logId: ${logId}`, err.message);
			}
		}

		console.log(`\nMigration completed! Successfully updated ${successCount}/${Items.length} items.`);
	} catch (error) {
		console.error("Error during migration:", error);
	}
};

run();
