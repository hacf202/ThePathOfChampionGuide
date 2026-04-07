// be/scripts/createAuditLogTable.js
import { CreateTableCommand, DescribeTableCommand, DeleteTableCommand } from "@aws-sdk/client-dynamodb";
import client from "../src/config/db.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const TABLE_NAME = "guidePocAuditLogs";

const tableSchema = {
	TableName: TABLE_NAME,
	KeySchema: [
		{ AttributeName: "logId", KeyType: "HASH" }, // Partition key
		{ AttributeName: "timestamp", KeyType: "RANGE" }, // Sort key
	],
	AttributeDefinitions: [
		{ AttributeName: "logId", AttributeType: "S" },
		{ AttributeName: "timestamp", AttributeType: "S" },
		{ AttributeName: "logType", AttributeType: "S" },
		{ AttributeName: "entityType", AttributeType: "S" },
		{ AttributeName: "action", AttributeType: "S" },
		{ AttributeName: "userId", AttributeType: "S" },
	],
	GlobalSecondaryIndexes: [
		{
			IndexName: "LogTypeTimestampIndex",
			KeySchema: [
				{ AttributeName: "logType", KeyType: "HASH" },
				{ AttributeName: "timestamp", KeyType: "RANGE" },
			],
			Projection: { ProjectionType: "ALL" },
			ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
		},
		{
			IndexName: "EntityTypeTimestampIndex",
			KeySchema: [
				{ AttributeName: "entityType", KeyType: "HASH" },
				{ AttributeName: "timestamp", KeyType: "RANGE" },
			],
			Projection: { ProjectionType: "ALL" },
			ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
		},
		{
			IndexName: "ActionTimestampIndex",
			KeySchema: [
				{ AttributeName: "action", KeyType: "HASH" },
				{ AttributeName: "timestamp", KeyType: "RANGE" },
			],
			Projection: { ProjectionType: "ALL" },
			ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
		},
		{
			IndexName: "UserTimestampIndex",
			KeySchema: [
				{ AttributeName: "userId", KeyType: "HASH" },
				{ AttributeName: "timestamp", KeyType: "RANGE" },
			],
			Projection: { ProjectionType: "ALL" },
			ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
		},
	],
	ProvisionedThroughput: {
		ReadCapacityUnits: 5,
		WriteCapacityUnits: 5,
	},
};

const run = async () => {
	try {
		console.log(`Checking if table ${TABLE_NAME} exists...`);
		try {
			await client.send(new DescribeTableCommand({ TableName: TABLE_NAME }));
			console.log(`Table ${TABLE_NAME} already exists.`);
            
            // Nếu bạn muốn xóa và tạo lại, bỏ comment dòng dưới
            /*
            console.log("Deleting existing table...");
            await client.send(new DeleteTableCommand({ TableName: TABLE_NAME }));
            console.log("Table deleted. Waiting 20s for deletion to complete...");
            await new Promise(resolve => setTimeout(resolve, 20000));
            */
            // Nếu bảng đã tồn tại thì dừng lại (tránh lỗi)
            return;
		} catch (err) {
			if (err.name !== "ResourceNotFoundException") throw err;
			console.log(`Table ${TABLE_NAME} does not exist. Creating...`);
		}

		const command = new CreateTableCommand(tableSchema);
		const response = await client.send(command);
		console.log("Table creation initiated successfully:", response.TableDescription.TableStatus);
	} catch (error) {
		console.error("Error creating table:", error);
	}
};

run();
