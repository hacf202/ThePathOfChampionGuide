import express from "express";
import crypto from "crypto";
import { authenticateToken } from "../middleware/authenticate.js";
import { getDb } from "../config/mongo.js";

const router = express.Router();

let dailyCardCache = { date: null, card: null };
let allValidCardsCache = null;

// Middleware to optionally authenticate
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

// POST /api/guess-game/start
router.post("/start", optionalAuth, async (req, res) => {
	try {
		const { mode, deviceId } = req.body; // mode: "daily", "unlimited", "hard"
		const db = getDb();
		const userId = req.user?.sub;
		const today = getTodayStr();

		let sessionId;
		let targetCard;
		let maxGuesses = mode === "hard" ? 3 : 5;
		let isDaily = mode === "daily";

		if (isDaily) {
			const identifier = userId || deviceId || crypto.randomUUID();
			sessionId = `daily_${today}_${identifier}`;
			targetCard = await getDailyCard(db, today);
		} else {
			sessionId = crypto.randomUUID();
			targetCard = await getRandomCard(db);
		}

		if (!targetCard) return res.status(500).json({ error: "No valid cards found" });

		// Check if session exists (mainly for Daily resume)
		let session = await db.collection("cardGuessSessions").findOne({ _id: sessionId });

		if (!session) {
			const cropSeed = isDaily ? getDailySeed(today + "_crop") : Math.floor(Math.random() * 10000);
			session = {
				_id: sessionId,
				userId,
				deviceId,
				mode,
				cardCode: targetCard.cardCode,
				cropSeed,
				guesses: [],
				isCompleted: false,
				won: false,
				createdAt: new Date()
			};
			await db.collection("cardGuessSessions").insertOne(session);
		}

		// Retrieve the full target card if completed, otherwise just partial
		let returnedTarget = null;
		if (session.isCompleted) {
			returnedTarget = await db.collection("guidePocCardList").findOne({ cardCode: session.cardCode });
		}

		// Retrieve full guess objects
		const guessCodes = session.guesses || [];
		let fullGuesses = [];
		if (guessCodes.length > 0) {
			fullGuesses = await db.collection("guidePocCardList").find({ cardCode: { $in: guessCodes } }).toArray();
			// Sort them in the order of guessCodes
			fullGuesses.sort((a, b) => guessCodes.indexOf(a.cardCode) - guessCodes.indexOf(b.cardCode));
		}

		res.json({
			sessionId: session._id,
			mode: session.mode,
			guesses: fullGuesses,
			isCompleted: session.isCompleted,
			won: session.won,
			maxGuesses,
			cropSeed: session.cropSeed,
			targetAttributes: {
				cost: targetCard.cost,
				rarity: targetCard.rarity,
				regions: targetCard.regions,
				type: targetCard.type,
				translations: targetCard.translations
			},
			targetCard: returnedTarget
		});
	} catch (error) {
		console.error("Error in guess-game/start:", error);
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
		const userId = req.user?.sub;
		const userName = req.user?.user_metadata?.name || req.user?.email?.split("@")[0] || "Unknown User";

		let session = await db.collection("cardGuessSessions").findOne({ _id: sessionId });
		if (!session) return res.status(404).json({ error: "Session not found" });

		if (session.isCompleted) {
			return res.status(400).json({ error: "This game is already completed." });
		}

		const targetCard = await db.collection("guidePocCardList").findOne({ cardCode: session.cardCode });
		const guessedCard = await db.collection("guidePocCardList").findOne({ cardCode: guessedCardCode });
		if (!guessedCard) return res.status(404).json({ error: "Guessed card not found" });

		const isCorrect = session.cardCode === guessedCardCode;
		session.guesses.push(guessedCardCode);

		const maxGuesses = session.mode === "hard" ? 3 : 5;

		if (isCorrect || session.guesses.length >= maxGuesses) {
			session.isCompleted = true;
			session.won = isCorrect;
			
			// Leaderboard logic for authenticated users
			if (isCorrect && userId) {
				let points = 0;
				if (session.mode === "daily") {
					const pointsMap = { 1: 10, 2: 8, 3: 6, 4: 4, 5: 2 };
					points = pointsMap[session.guesses.length] || 0;
				} else if (session.mode === "hard") {
					points = 3;
				} else if (session.mode === "unlimited") {
					points = 1;
				}
				
				if (points > 0) {
					const modeScoreField = `${session.mode}Score`;
					const modeSolvedField = `${session.mode}Solved`;
					const modeGuessesField = `${session.mode}Guesses`;

					await db.collection("cardGuessLeaderboard").updateOne(
						{ userId },
						{ 
							$inc: { 
								score: points, 
								solvedPuzzles: 1, 
								totalGuesses: session.guesses.length,
								[modeScoreField]: points,
								[modeSolvedField]: 1,
								[modeGuessesField]: session.guesses.length
							},
							$set: { userName, lastUpdated: new Date() }
						},
						{ upsert: true }
					);
				}
			}
		}

		// Update session
		await db.collection("cardGuessSessions").updateOne(
			{ _id: sessionId },
			{ $set: { guesses: session.guesses, isCompleted: session.isCompleted, won: session.won } }
		);

		res.json({
			correct: isCorrect,
			guessedCard,
			isCompleted: session.isCompleted,
			won: session.won,
			targetCard: session.isCompleted ? targetCard : null,
			hintLevel: session.isCompleted ? 5 : session.guesses.length,
			guessesRemaining: maxGuesses - session.guesses.length
		});
	} catch (error) {
		console.error("Error in guess-game/guess:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// GET /api/guess-game/leaderboard
router.get("/leaderboard", async (req, res) => {
	try {
		const { mode = "all" } = req.query;
		const db = getDb();

		let sortQuery = { score: -1, lastUpdated: 1 };
		if (mode === "daily") sortQuery = { dailyScore: -1, lastUpdated: 1 };
		if (mode === "hard") sortQuery = { hardScore: -1, lastUpdated: 1 };
		if (mode === "unlimited") sortQuery = { unlimitedScore: -1, lastUpdated: 1 };
		
		let matchQuery = {};
		if (mode === "daily") matchQuery = { dailyScore: { $exists: true, $gt: 0 } };
		if (mode === "hard") matchQuery = { hardScore: { $exists: true, $gt: 0 } };
		if (mode === "unlimited") matchQuery = { unlimitedScore: { $exists: true, $gt: 0 } };

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
