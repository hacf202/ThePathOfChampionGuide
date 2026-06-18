import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import dns from "dns";

dns.setServers(['8.8.8.8', '8.8.4.4']);


dotenv.config();

const uri = process.env.MONGODB_URI;
if (!uri) {
	console.error("Missing MONGODB_URI");
	process.exit(1);
}

const pointsMap = { 1: 10, 2: 7, 3: 5, 4: 3, 5: 2 };

async function syncScores() {
	const client = new MongoClient(uri);
	try {
		await client.connect();
		const db = client.db();

		console.log("Connected to MongoDB");

		// 1. Sync daily scores
		const dailySessions = await db.collection("cardGuessSessions").find({ mode: "daily", isCompleted: true }).toArray();
		let updatedDaily = 0;
		for (const session of dailySessions) {
			const pts = session.won ? (pointsMap[session.guesses.length] || 0) : 0;
			
			if (pts > 0) {
				const playerRecord = await db.collection("cardGuessLeaderboard").findOne({ identifier: session.identifier });
				if (!playerRecord || pts > (playerRecord.dailyScore || 0)) {
					await db.collection("cardGuessLeaderboard").updateOne(
						{ identifier: session.identifier },
						{ 
							$set: { 
								dailyScore: pts,
								dailyDuration: session.durationSeconds,
								dailySolved: 1,
								lastUpdated: new Date()
							}
						},
						{ upsert: true }
					);
					updatedDaily++;
				}
			}
		}
		console.log(`Updated ${updatedDaily} daily records.`);

		// 2. Sync unlimited runs
		const runs = await db.collection("cardGuessUnlimitedRuns").find({}).toArray();
		let updatedRuns = 0;
		let updatedLeaders = 0;

		for (const run of runs) {
			let totalScore = 0;
			for (const historyItem of run.history || []) {
				if (historyItem.won) {
					totalScore += (pointsMap[historyItem.guesses] || 0);
				}
			}

			if (totalScore !== run.score) {
				await db.collection("cardGuessUnlimitedRuns").updateOne(
					{ _id: run._id },
					{ $set: { score: totalScore } }
				);
				updatedRuns++;
			}

			// Update leaderboard if this run is completed
			if (run.status === "completed" && totalScore > 0) {
				const playerRecord = await db.collection("cardGuessLeaderboard").findOne({ identifier: run.identifier });
				if (!playerRecord || totalScore > (playerRecord.unlimitedBestScore || 0)) {
					await db.collection("cardGuessLeaderboard").updateOne(
						{ identifier: run.identifier },
						{
							$set: {
								unlimitedBestScore: totalScore,
								unlimitedBestRunDuration: run.durationSeconds || 0,
								lastUpdated: new Date()
							}
						},
						{ upsert: true }
					);
					updatedLeaders++;
				}
			}
		}

		console.log(`Updated ${updatedRuns} unlimited runs.`);
		console.log(`Updated ${updatedLeaders} leaderboard records for unlimited.`);
		
	} catch (e) {
		console.error("Error:", e);
	} finally {
		await client.close();
		console.log("Disconnected.");
	}
}

syncScores();
