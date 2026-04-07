import { DynamoDBClient, ScanCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const client = new DynamoDBClient({ region: process.env.AWS_REGION });

const RATINGS_TABLE = "guidePocPlayStyleRating";
const CHAMPIONS_TABLE = "guidePocChampionList";

async function backfill() {
	console.log("🚀 Starting backfill process...");

	try {
		// 1. Lấy danh sách Tướng để làm Mapping
		console.log("📥 Fetching champion mapping...");
		const champCommand = new ScanCommand({ TableName: CHAMPIONS_TABLE });
		const champRes = await client.send(champCommand);
		const champions = champRes.Items.map(item => unmarshall(item));
		
		const champMap = {};
		champions.forEach(c => {
			champMap[c.championID] = {
				name: c.name,
				image: c.assets?.[0]?.avatar || ""
			};
		});

		// 2. Lấy toàn bộ Đánh giá
		console.log("📥 Fetching all ratings...");
		const ratingsCommand = new ScanCommand({ TableName: RATINGS_TABLE });
		const ratingsRes = await client.send(ratingsCommand);
		const ratings = ratingsRes.Items ? ratingsRes.Items.map(item => unmarshall(item)) : [];

		console.log(`📝 Total ratings to process: ${ratings.length}`);

		// 3. Cập nhật từng đánh giá
		for (const rating of ratings) {
			const champInfo = champMap[rating.championID] || { name: rating.championID, image: "" };
			
			const updatedRating = {
				...rating,
				reviewType: "CHAMPION_REVIEW", // Cần cho GSI
				championName: champInfo.name,
				championImage: champInfo.image,
				updatedAt: rating.updatedAt || new Date().toISOString(),
				createdAt: rating.createdAt || new Date().toISOString()
			};

			const putCommand = new PutItemCommand({
				TableName: RATINGS_TABLE,
				Item: marshall(updatedRating, { removeUndefinedValues: true })
			});

			await client.send(putCommand);
			console.log(`✅ Updated rating for ${champInfo.name} by ${rating.username}`);
		}

		console.log("✨ Backfill completed successfully!");
	} catch (error) {
		console.error("❌ Backfill failed:", error);
	}
}

backfill();
