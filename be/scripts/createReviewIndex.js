import { DynamoDBClient, UpdateTableCommand } from "@aws-sdk/client-dynamodb";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const client = new DynamoDBClient({ region: process.env.AWS_REGION });

const RATINGS_TABLE = "guidePocPlayStyleRating";

async function createIndex() {
	console.log(`🚀 Creating GSI for table: ${RATINGS_TABLE}...`);

	const command = new UpdateTableCommand({
		TableName: RATINGS_TABLE,
		AttributeDefinitions: [
			{ AttributeName: "reviewType", AttributeType: "S" },
			{ AttributeName: "createdAt", AttributeType: "S" },
		],
		GlobalSecondaryIndexUpdates: [
			{
				Create: {
					IndexName: "ReviewTypeCreatedAtIndex",
					KeySchema: [
						{ AttributeName: "reviewType", KeyType: "HASH" }, // Partition Key
						{ AttributeName: "createdAt", KeyType: "RANGE" }, // Sort Key
					],
					Projection: {
						ProjectionType: "ALL",
					},
					ProvisionedThroughput: {
						ReadCapacityUnits: 5,
						WriteCapacityUnits: 5,
					},
				},
			},
		],
	});

	try {
		const response = await client.send(command);
		console.log("✅ GSI Create Requested Successfully!");
		console.log("⏳ Waiting for Index to be ACTIVE (This may take a few minutes)...");
	} catch (error) {
		if (error.name === "ResourceInUseException") {
			console.warn("⚠️ Index already exists or is being updated.");
		} else {
			console.error("❌ Error creating GSI:", error);
		}
	}
}

createIndex();
