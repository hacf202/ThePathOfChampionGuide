import express from "express";
import crypto from "crypto";
import { authenticateToken } from "../middleware/authenticate.js";
import { getDb } from "../config/mongo.js";

const router = express.Router();

let dailyCardCache = { date: null, card: null };
let allValidCardsCache = null;

const optionalAuth = async (req, res, next) => {
	const authHeader = req.headers.authorization;
	if (authHeader && authHeader !== "Bearer null" && authHeader !== "Bearer undefined") {
		return authenticateToken(req, res, next);
	}
	next();
};

const getAllValidCards = async (db) => {
	if (allValidCardsCache) return allValidCardsCache;
	const cards = await db.collection("guidePocCardList").find({
		gameAbsolutePath: { $ne: null },
		cardName: { $ne: null },
		cardCode: { $not: /T\d+$/ },
		$or: [
			{ type: { $regex: /quân/i } },
			{ type: { $regex: /champion/i } },
			{ "translations.en.type": { $regex: /unit/i } },
			{ "translations.en.type": { $regex: /champion/i } }
		]
	}).toArray();
	allValidCardsCache = cards;
	return cards;
};

const getDailySeed = (dateStr) => {
	let hash = 0;
	const s = dateStr + "_event_seed";
	for (let i = 0; i < s.length; i++) {
		hash = (Math.imul(31, hash) + s.charCodeAt(i)) | 0;
	}
	return Math.abs(hash);
};

const getDailyCard = async (db, dateStr) => {
	if (dailyCardCache.date === dateStr && dailyCardCache.card) {
		return dailyCardCache.card;
	}
	const cards = await getAllValidCards(db);
	if (cards.length === 0) return null;

	let seed = getDailySeed(dateStr);
	const rng = () => {
		let t = seed += 0x6D2B79F5;
		t = Math.imul(t ^ t >>> 15, t | 1);
		t ^= t + Math.imul(t ^ t >>> 7, t | 61);
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	};

	const index = Math.floor(rng() * cards.length);
	dailyCardCache = { date: dateStr, card: cards[index] };
	return cards[index];
};

const getRandomCard = async (db) => {
	const cards = await getAllValidCards(db);
	if (cards.length === 0) return null;
	const index = Math.floor(Math.random() * cards.length);
	return cards[index];
};

const getTodayStr = () => new Date().toISOString().slice(0, 10);

const mapSessionToResponse = async (db, session) => {
	let returnedTarget = null;
	if (session.isCompleted) {
		returnedTarget = await db.collection("guidePocCardList").findOne({ cardCode: session.cardCode });
	}

	const guessCodes = (session.guesses || []).map(g => g.cardCode || g);
	let fullGuesses = [];
	if (guessCodes.length > 0) {
		fullGuesses = await db.collection("guidePocCardList").find({ cardCode: { $in: guessCodes } }).toArray();
		fullGuesses.sort((a, b) => guessCodes.indexOf(a.cardCode) - guessCodes.indexOf(b.cardCode));
	}

	const targetCard = await db.collection("guidePocCardList").findOne({ cardCode: session.cardCode });

	return {
		sessionId: session._id,
		mode: session.mode,
		guesses: fullGuesses,
		isCompleted: session.isCompleted,
		won: session.won,
		maxGuesses: 5,
		cropSeed: session.cropSeed,
		targetAttributes: targetCard ? {
			cost: targetCard.cost,
			rarity: targetCard.rarity,
			regions: targetCard.regions,
			type: targetCard.type,
			translations: targetCard.translations
		} : null,
		targetCard: returnedTarget
	};
};

// POST /api/guess-game/start
router.post("/start", optionalAuth, async (req, res) => {
	try {
		const { mode, deviceId } = req.body;
		if (mode === "hard") return res.status(400).json({ error: "Hard mode is deprecated" });
		
		const db = getDb();
		const userId = req.user?.sub;
		const identifier = userId || deviceId || crypto.randomUUID();
		const today = getTodayStr();

		if (mode === "daily") {
			const sessionId = `daily_${today}_${identifier}`;
			let session = await db.collection("cardGuessSessions").findOne({ _id: sessionId });

			if (!session) {
				const targetCard = await getDailyCard(db, today);
				if (!targetCard) return res.status(500).json({ error: "No valid cards" });

				session = {
					_id: sessionId, userId, deviceId, identifier, mode,
					cardCode: targetCard.cardCode,
					cropSeed: getDailySeed(today + "_crop"),
					guesses: [], isCompleted: false, won: false,
					createdAt: new Date()
				};
				await db.collection("cardGuessSessions").insertOne(session);
			}

			const dailySolversCount = await db.collection("cardGuessSessions").countDocuments({ 
				_id: { $regex: `^daily_${today}` }, 
				won: true 
			});

			const response = await mapSessionToResponse(db, session);
			return res.json({ ...response, dailySolversCount });

		} else if (mode === "unlimited") {
			const run = await db.collection("cardGuessUnlimitedRuns").findOne({
				identifier,
				status: "playing"
			});

			if (!run) {
				return res.json({ requireNewRun: true });
			}

			const session = await db.collection("cardGuessSessions").findOne({ _id: run.currentSessionId });
			const response = await mapSessionToResponse(db, session);
			return res.json({ ...response, run: { lives: run.lives, score: run.score, playerName: run.playerName, status: run.status } });
		}
	} catch (error) {
		console.error("Error in start:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// POST /api/guess-game/unlimited/new-run
router.post("/unlimited/new-run", optionalAuth, async (req, res) => {
	try {
		const { deviceId, playerName } = req.body;
		const db = getDb();
		const userId = req.user?.sub;
		const identifier = userId || deviceId || crypto.randomUUID();

		// Close any playing runs
		await db.collection("cardGuessUnlimitedRuns").updateMany(
			{ identifier, status: "playing" },
			{ $set: { status: "completed", completedAt: new Date() } }
		);

		const runId = crypto.randomUUID();
		const sessionId = crypto.randomUUID();
		const targetCard = await getRandomCard(db);

		let finalPlayerName = String(playerName || "").trim();
		if (!finalPlayerName || finalPlayerName.toLowerCase() === "guest" || finalPlayerName.toLowerCase() === "khách") {
			finalPlayerName = `Guest#${identifier.substring(0, 4).toUpperCase()}`;
		}

		const session = {
			_id: sessionId, userId, deviceId, identifier, mode: "unlimited", runId,
			cardCode: targetCard.cardCode, cropSeed: Math.floor(Math.random() * 10000),
			guesses: [], isCompleted: false, won: false, createdAt: new Date()
		};
		await db.collection("cardGuessSessions").insertOne(session);

		const run = {
			_id: runId, userId, deviceId, identifier, playerName: finalPlayerName,
			lives: 3, score: 0, status: "playing", currentSessionId: sessionId,
			history: [], createdAt: new Date()
		};
		await db.collection("cardGuessUnlimitedRuns").insertOne(run);

		const response = await mapSessionToResponse(db, session);
		return res.json({ ...response, run: { lives: run.lives, score: run.score, playerName: run.playerName, status: run.status } });
	} catch (error) {
		console.error("Error in new-run:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// POST /api/guess-game/unlimited/next
router.post("/unlimited/next", optionalAuth, async (req, res) => {
	try {
		const { deviceId } = req.body;
		const db = getDb();
		const userId = req.user?.sub;
		const identifier = userId || deviceId || crypto.randomUUID();

		const run = await db.collection("cardGuessUnlimitedRuns").findOne({ identifier, status: "playing" });
		if (!run) return res.status(400).json({ error: "No active run" });

		const prevSession = await db.collection("cardGuessSessions").findOne({ _id: run.currentSessionId });
		if (prevSession && !prevSession.isCompleted) {
			return res.status(400).json({ error: "Current card not finished" });
		}

		if (run.lives <= 0) return res.status(400).json({ error: "Run is over" });

		const targetCard = await getRandomCard(db);
		const sessionId = crypto.randomUUID();
		const session = {
			_id: sessionId, userId, deviceId, identifier, mode: "unlimited", runId: run._id,
			cardCode: targetCard.cardCode, cropSeed: Math.floor(Math.random() * 10000),
			guesses: [], isCompleted: false, won: false, createdAt: new Date()
		};
		await db.collection("cardGuessSessions").insertOne(session);
		await db.collection("cardGuessUnlimitedRuns").updateOne({ _id: run._id }, { $set: { currentSessionId: sessionId } });

		const response = await mapSessionToResponse(db, session);
		return res.json({ ...response, run: { lives: run.lives, score: run.score, playerName: run.playerName, status: run.status } });
	} catch (error) {
		console.error("Error in next card:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// GET /api/guess-game/image/:sessionId
router.get("/image/:sessionId", async (req, res) => {
	try {
		const db = getDb();
		const { sessionId } = req.params;
		
		const session = await db.collection("cardGuessSessions").findOne({ _id: sessionId });
		if (!session) return res.status(404).send("Session not found");

		const card = await db.collection("guidePocCardList").findOne({ cardCode: session.cardCode });
		if (!card) return res.status(404).send("Card not found");

		const url = card.gameAbsolutePath.replace(/(\.[a-zA-Z]+)$/, "-full$1");
		const imageRes = await fetch(url);
		
		if (!imageRes.ok) return res.status(imageRes.status).send("Image fetch failed");
		
		const contentType = imageRes.headers.get("content-type");
		const arrayBuffer = await imageRes.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		res.setHeader("Content-Type", contentType || "image/png");
		res.setHeader("Cache-Control", "public, max-age=3600");
		res.setHeader("Access-Control-Allow-Origin", "*");
		res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
		res.send(buffer);
	} catch (error) {
		console.error("Error in guess-game image:", error);
		res.status(500).send("Internal server error");
	}
});

// POST /api/guess-game/guess
router.post("/guess", optionalAuth, async (req, res) => {
	try {
		const { sessionId, guessedCardCode } = req.body;
		if (!sessionId || !guessedCardCode) return res.status(400).json({ error: "Missing payload" });

		const db = getDb();
		let session = await db.collection("cardGuessSessions").findOne({ _id: sessionId });
		if (!session) return res.status(404).json({ error: "Session not found" });

		if (session.isCompleted) {
			return res.status(400).json({ error: "This game is already completed." });
		}

		const targetCard = await db.collection("guidePocCardList").findOne({ cardCode: session.cardCode });
		const guessedCard = await db.collection("guidePocCardList").findOne({ cardCode: guessedCardCode });
		if (!guessedCard) return res.status(404).json({ error: "Guessed card not found" });

		const isCorrect = session.cardCode === guessedCardCode;
		
		const guessObj = {
			cardCode: guessedCardCode,
			guessedAt: new Date()
		};
		session.guesses.push(guessObj);
		const numGuesses = session.guesses.length;

		const maxGuesses = 5;
		const pointsMap = { 1: 10, 2: 7, 3: 5, 4: 3, 5: 2 };

		let updatedRunState = null;

		if (isCorrect || numGuesses >= maxGuesses) {
			session.isCompleted = true;
			session.won = isCorrect;
			session.completedAt = new Date();
			session.durationSeconds = (session.completedAt - session.createdAt) / 1000;

			const incrementPayload = { totalPlayed: 1, totalWon: isCorrect ? 1 : 0 };
			if (isCorrect) incrementPayload[`distribution.${numGuesses}`] = 1;
			await db.collection("cardGuessStats").updateOne(
				{ cardCode: session.cardCode },
				{ $inc: incrementPayload },
				{ upsert: true }
			);
			
			const points = isCorrect ? (pointsMap[numGuesses] || 0) : 0;
			
			if (session.mode === "daily") {
				const userName = req.user?.user_metadata?.name || "Guest_" + session.identifier.slice(0, 4);
				await db.collection("cardGuessLeaderboard").updateOne(
					{ identifier: session.identifier },
					{ 
						$inc: { 
							dailyScore: points, 
							dailySolved: isCorrect ? 1 : 0, 
							dailyGuesses: numGuesses,
							dailyDuration: session.durationSeconds
						},
						$set: { userName, lastUpdated: new Date() }
					},
					{ upsert: true }
				);
			} else if (session.mode === "unlimited" && session.runId) {
				const run = await db.collection("cardGuessUnlimitedRuns").findOne({ _id: session.runId });
				if (run) {
					let newLives = run.lives;
					let newScore = run.score;
					if (isCorrect) newScore += points;
					else newLives -= 1;
					
					const runHistoryItem = {
						cardCode: session.cardCode,
						guesses: numGuesses,
						won: isCorrect,
						points,
						durationSeconds: session.durationSeconds,
						completedAt: session.completedAt
					};
					
					const updateOps = {
						$set: { lives: newLives, score: newScore },
						$push: { history: runHistoryItem }
					};
					
					if (newLives <= 0) {
						updateOps.$set.status = "completed";
						updateOps.$set.completedAt = new Date();
						const finalDuration = (new Date() - run.createdAt) / 1000;
						updateOps.$set.totalDurationSeconds = finalDuration;
						
						// Update Leaderboard
						const playerRecord = await db.collection("cardGuessLeaderboard").findOne({ identifier: run.identifier });
						if (!playerRecord || newScore > (playerRecord.unlimitedBestScore || 0)) {
							await db.collection("cardGuessLeaderboard").updateOne(
								{ identifier: run.identifier },
								{
									$set: {
										userName: run.playerName,
										unlimitedBestScore: newScore,
										unlimitedBestRunDuration: finalDuration,
										lastUpdated: new Date()
									},
									$inc: { unlimitedRunsPlayed: 1 }
								},
								{ upsert: true }
							);
						} else {
							await db.collection("cardGuessLeaderboard").updateOne(
								{ identifier: run.identifier },
								{
									$set: { userName: run.playerName },
									$inc: { unlimitedRunsPlayed: 1 }
								}
							);
						}
					}
					
					await db.collection("cardGuessUnlimitedRuns").updateOne({ _id: run._id }, updateOps);
					updatedRunState = { lives: newLives, score: newScore, playerName: run.playerName, status: newLives <= 0 ? "completed" : "playing" };
				}
			}
		}

		await db.collection("cardGuessSessions").updateOne(
			{ _id: sessionId },
			{ $set: { 
				guesses: session.guesses, 
				isCompleted: session.isCompleted, 
				won: session.won,
				completedAt: session.completedAt,
				durationSeconds: session.durationSeconds
			} }
		);

		res.json({
			correct: isCorrect,
			guessedCard,
			isCompleted: session.isCompleted,
			won: session.won,
			targetCard: session.isCompleted ? targetCard : null,
			hintLevel: session.isCompleted ? 5 : numGuesses,
			guessesRemaining: maxGuesses - numGuesses,
			run: updatedRunState
		});
	} catch (error) {
		console.error("Error in guess-game/guess:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// POST /api/guess-game/give-up
router.post("/give-up", optionalAuth, async (req, res) => {
	const { sessionId } = req.body;
	if (!sessionId) return res.status(400).json({ error: "Missing sessionId" });

	try {
		const db = getDb();
		const session = await db.collection("cardGuessSessions").findOne({ _id: sessionId });
		if (!session) return res.status(404).json({ error: "Session not found" });
		if (session.isCompleted) return res.status(400).json({ error: "Game already completed" });

		const now = new Date();
		session.isCompleted = true;
		session.won = false;
		session.completedAt = now;
		session.durationSeconds = Math.round((now - new Date(session.createdAt)) / 1000);

		await db.collection("cardGuessStats").updateOne(
			{ cardCode: session.cardCode },
			{ $inc: { totalPlayed: 1, totalWon: 0 } },
			{ upsert: true }
		);

		// Thêm một dummy guess để cho biết là đã give up? Không bắt buộc.
		
		const targetCard = await db.collection("guidePocCardList").findOne({ cardCode: session.cardCode });

		let updatedRunState = null;
		
		// Xử lý Survival run if unlimited
		if (session.mode === "unlimited") {
			const run = await db.collection("cardGuessUnlimitedRuns").findOne({ currentSessionId: sessionId });
			if (run && run.status === "playing") {
				const newLives = 0; // Force end run
				const runHistoryItem = {
					sessionId: session._id,
					cardCode: session.cardCode,
					won: false,
					timeSeconds: session.durationSeconds,
					guesses: session.guesses.length
				};
				
				const updateOps = {
					$push: { history: runHistoryItem },
					$set: { 
						lives: 0, 
						status: "completed", 
						completedAt: now, 
						durationSeconds: Math.round((now - new Date(run.createdAt)) / 1000)
					}
				};
				
				const playerRecord = await db.collection("cardGuessLeaderboard").findOne({ identifier: run.identifier });
				if (!playerRecord || run.score > (playerRecord.unlimitedBestScore || 0)) {
					await db.collection("cardGuessLeaderboard").updateOne(
						{ identifier: run.identifier },
						{
							$set: {
								userName: run.playerName,
								userId: run.userId,
								unlimitedBestScore: run.score,
								unlimitedBestRunDuration: updateOps.$set.durationSeconds,
								lastUpdated: now
							},
							$inc: { unlimitedRunsPlayed: 1 }
						},
						{ upsert: true }
					);
				} else {
					await db.collection("cardGuessLeaderboard").updateOne(
						{ identifier: run.identifier },
						{ $inc: { unlimitedRunsPlayed: 1 } },
						{ upsert: true }
					);
				}
				
				await db.collection("cardGuessUnlimitedRuns").updateOne({ _id: run._id }, updateOps);
				updatedRunState = { lives: 0, score: run.score, playerName: run.playerName, status: "completed" };
			}
		}

		await db.collection("cardGuessSessions").updateOne(
			{ _id: sessionId },
			{ $set: { 
				isCompleted: session.isCompleted, 
				won: session.won,
				completedAt: session.completedAt,
				durationSeconds: session.durationSeconds
			} }
		);

		res.json({
			isCompleted: true,
			won: false,
			targetCard: targetCard,
			hintLevel: 5,
			run: updatedRunState
		});
	} catch (error) {
		console.error("Error in guess-game/give-up:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// GET /api/guess-game/leaderboard
router.get("/leaderboard", async (req, res) => {
	try {
		const { mode = "all" } = req.query;
		const db = getDb();

		let sortQuery = { score: -1, lastUpdated: 1 };
		if (mode === "daily") sortQuery = { dailyScore: -1, dailyDuration: 1, lastUpdated: 1 };
		if (mode === "unlimited") sortQuery = { unlimitedBestScore: -1, unlimitedBestRunDuration: 1, lastUpdated: 1 };
		
		let matchQuery = {};
		if (mode === "daily") matchQuery = { dailyScore: { $exists: true, $gt: 0 } };
		if (mode === "unlimited") matchQuery = { unlimitedBestScore: { $exists: true, $gt: 0 } };

		const leaders = await db.collection("cardGuessLeaderboard")
			.find(matchQuery)
			.sort(sortQuery)
			.limit(50)
			.toArray();
			
		res.json(leaders);
	} catch (error) {
		console.error("Error fetching leaderboard:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

export default router;
