import express from "express";
import crypto from "crypto";
import sharp from "sharp";
import { authenticateToken } from "../middleware/authenticate.js";
import { getDb } from "../config/mongo.js";
import rateLimit from "express-rate-limit";

const router = express.Router();

const newRunLimiter = rateLimit({
	windowMs: 60 * 1000,
	max: 15,
	message: { error: "Too many new runs created. Please try again later." }
});

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
	}).sort({ cardCode: 1 }).toArray();
	allValidCardsCache = cards;
	return cards;
};

const getDailySeed = (dateStr) => {
	let hash = 0;
	const s = dateStr + "_event_seed" + (process.env.DAILY_SEED_SECRET || "default_fallback_secret_xyz");
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

// Thời gian sự kiện (Cài đặt thủ công tại đây)
const EVENT_START_TIME = "2099-01-01T00:00:00Z"; // UTC (Khóa sự kiện - chờ mở lại)
const EVENT_END_TIME = "2099-01-01T23:59:59Z";   // UTC

const isEventActive = () => {
	const start = new Date(EVENT_START_TIME);
	const end = new Date(EVENT_END_TIME);
	const now = new Date();
	return now >= start && now <= end;
};

const getTodayStr = () => new Date().toISOString().slice(0, 10);

const compareAttribute = (guessVal, targetVal) => {
	if (!guessVal || !targetVal) return "wrong";
	return String(guessVal).toLowerCase() === String(targetVal).toLowerCase() ? "correct" : "wrong";
};

const compareCost = (guessCost, targetCost) => {
	const g = Number(guessCost ?? 0);
	const t = Number(targetCost ?? 0);
	if (g === t) return "correct";
	return g < t ? "higher" : "lower";
};

const compareRegions = (guessRegions, targetRegions) => {
	const gSet = new Set((guessRegions || []).map(r => String(r).toLowerCase()));
	const tSet = new Set((targetRegions || []).map(r => String(r).toLowerCase()));
	if (gSet.size === tSet.size && [...gSet].every(r => tSet.has(r))) return "correct";
	if ([...gSet].some(r => tSet.has(r))) return "partial";
	return "wrong";
};

const mapSessionToResponse = async (db, session) => {
	let returnedTarget = null;
	if (session.isCompleted) {
		returnedTarget = await db.collection("guidePocCardList").findOne({ cardCode: session.cardCode });
	}

	const guessCodes = (session.guesses || []).map(g => g.cardCode || g);
	let fullGuesses = [];
	const targetCard = await db.collection("guidePocCardList").findOne({ cardCode: session.cardCode });

	if (guessCodes.length > 0 && targetCard) {
		fullGuesses = await db.collection("guidePocCardList").find({ cardCode: { $in: guessCodes } }).toArray();
		fullGuesses.sort((a, b) => guessCodes.indexOf(a.cardCode) - guessCodes.indexOf(b.cardCode));
		fullGuesses = fullGuesses.map(g => ({
			...g,
			diffs: {
				region: compareRegions(g.regions, targetCard.regions),
				rarity: compareAttribute(g.rarity, targetCard.rarity),
				cost: compareCost(g.cost, targetCard.cost)
			}
		}));
	}

	return {
		sessionId: session._id,
		mode: session.mode,
		guesses: fullGuesses,
		isCompleted: session.isCompleted,
		won: session.won,
		maxGuesses: 5,
		cropSeed: session.cropSeed,
		targetAttributes: targetCard ? {
			type: targetCard.type,
			descriptionRaw: session.guesses?.length >= 3 ? targetCard.descriptionRaw : undefined,
			translations: targetCard.translations ? Object.fromEntries(
				Object.entries(targetCard.translations).map(([lang, data]) => [
					lang, 
					{ 
						type: data.type,
						descriptionRaw: session.guesses?.length >= 3 ? data.descriptionRaw : undefined
					}
				])
			) : undefined
		} : null,
		targetCard: returnedTarget
	};
};

// POST /api/guess-game/start
router.post("/start", optionalAuth, newRunLimiter, async (req, res) => {
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
		} else if (mode === "event") {
			if (!isEventActive()) return res.json({ error: "Event closed" });
			const run = await db.collection("cardGuessEventRuns").findOne({
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
router.post("/unlimited/new-run", optionalAuth, newRunLimiter, async (req, res) => {
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

// POST /api/guess-game/event/new-run
router.post("/event/new-run", optionalAuth, newRunLimiter, async (req, res) => {
	try {
		if (!isEventActive()) return res.status(400).json({ error: "Event is closed" });
		const { deviceId, playerName } = req.body;
		if (!playerName || !playerName.trim()) return res.status(400).json({ error: "Riot ID required" });
		const db = getDb();
		const userId = req.user?.sub;
		const identifier = userId || deviceId || crypto.randomUUID();

		await db.collection("cardGuessEventRuns").updateMany(
			{ identifier, status: "playing" },
			{ $set: { status: "completed", completedAt: new Date() } }
		);

		const runId = crypto.randomUUID();
		const sessionId = crypto.randomUUID();
		const targetCard = await getRandomCard(db);

		const session = {
			_id: sessionId, userId, deviceId, identifier, mode: "event", runId,
			cardCode: targetCard.cardCode, cropSeed: Math.floor(Math.random() * 10000),
			guesses: [], isCompleted: false, won: false, createdAt: new Date()
		};
		await db.collection("cardGuessSessions").insertOne(session);

		const run = {
			_id: runId, userId, deviceId, identifier, playerName: playerName.trim(),
			lives: 3, score: 0, status: "playing", currentSessionId: sessionId,
			history: [], createdAt: new Date()
		};
		await db.collection("cardGuessEventRuns").insertOne(run);

		const response = await mapSessionToResponse(db, session);
		return res.json({ ...response, run: { lives: run.lives, score: run.score, playerName: run.playerName, status: run.status } });
	} catch (error) {
		console.error("Error in event new-run:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// POST /api/guess-game/event/next
router.post("/event/next", optionalAuth, async (req, res) => {
	try {
		if (!isEventActive()) return res.status(400).json({ error: "Event is closed" });
		const { deviceId } = req.body;
		const db = getDb();
		const userId = req.user?.sub;
		const identifier = userId || deviceId || crypto.randomUUID();

		const run = await db.collection("cardGuessEventRuns").findOne({ identifier, status: "playing" });
		if (!run) return res.status(400).json({ error: "No active event run" });

		const prevSession = await db.collection("cardGuessSessions").findOne({ _id: run.currentSessionId });
		if (prevSession && !prevSession.isCompleted) return res.status(400).json({ error: "Current card not finished" });

		if (run.lives <= 0) return res.status(400).json({ error: "Run is over" });

		const targetCard = await getRandomCard(db);
		const sessionId = crypto.randomUUID();
		const session = {
			_id: sessionId, userId, deviceId, identifier, mode: "event", runId: run._id,
			cardCode: targetCard.cardCode, cropSeed: Math.floor(Math.random() * 10000),
			guesses: [], isCompleted: false, won: false, createdAt: new Date()
		};
		await db.collection("cardGuessSessions").insertOne(session);
		await db.collection("cardGuessEventRuns").updateOne({ _id: run._id }, { $set: { currentSessionId: sessionId } });

		const response = await mapSessionToResponse(db, session);
		return res.json({ ...response, run: { lives: run.lives, score: run.score, playerName: run.playerName, status: run.status } });
	} catch (error) {
		console.error("Error in event next card:", error);
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
		let buffer = Buffer.from(arrayBuffer);
		let finalContentType = contentType || "image/png";

		// Prevent image inspect cheat by blacking out unrevealed regions
		if (!session.isCompleted) {
			const HINT_LEVELS = [
				{ cropSize: 15 },
				{ cropSize: 20 },
				{ cropSize: 25 },
				{ cropSize: 35 },
				{ cropSize: 50 },
				{ cropSize: 100 },
			];
			const maxAllowedHintLevel = session.guesses ? session.guesses.length : 0;
			const hintLevelIndex = Math.min(maxAllowedHintLevel, HINT_LEVELS.length - 1);
			const cropPercent = HINT_LEVELS[hintLevelIndex].cropSize;

			if (cropPercent < 100) {
				const image = sharp(buffer);
				const metadata = await image.metadata();
				const w = metadata.width;
				const h = metadata.height;

				const seed = session.cropSeed || 0;
				const seededRandom = (s) => {
					const x = Math.sin(s * 9301 + 49297) * 233280;
					return x - Math.floor(x);
				};
				const cropPositionX = 20 + seededRandom(seed) * 60;
				const cropPositionY = 20 + seededRandom(seed + 1) * 60;

				const cx = w * (cropPositionX / 100);
				const cy = h * (cropPositionY / 100);

				const cropWidth = w * (cropPercent / 100) * 1.2; // 20% margin
				const cropHeight = h * (cropPercent / 100) * 1.2;

				let left = Math.round(cx - cropWidth / 2);
				let top = Math.round(cy - cropHeight / 2);
				let right = Math.round(cx + cropWidth / 2);
				let bottom = Math.round(cy + cropHeight / 2);

				left = Math.max(0, left);
				top = Math.max(0, top);
				right = Math.min(w, right);
				bottom = Math.min(h, bottom);

				const boxWidth = right - left;
				const boxHeight = bottom - top;

				if (boxWidth > 0 && boxHeight > 0) {
					const extracted = await image.extract({ left, top, width: boxWidth, height: boxHeight }).toBuffer();
					
					buffer = await sharp({
						create: {
							width: w,
							height: h,
							channels: 4,
							background: { r: 0, g: 0, b: 0, alpha: 1 }
						}
					})
					.composite([
						{
							input: extracted,
							top: top,
							left: left
						}
					])
					.webp({ quality: 80 })
					.toBuffer();
					
					finalContentType = "image/webp";
				}
			}
		}

		res.setHeader("Content-Type", finalContentType);
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

		guessedCard.diffs = {
			region: compareRegions(guessedCard.regions, targetCard.regions),
			rarity: compareAttribute(guessedCard.rarity, targetCard.rarity),
			cost: compareCost(guessedCard.cost, targetCard.cost)
		};

		const isCorrect = session.cardCode === guessedCardCode;
		
		const guessObj = {
			cardCode: guessedCardCode,
			guessedAt: new Date()
		};
		const numGuesses = session.guesses.length + 1;
		const maxGuesses = 5;
		const isCompleting = isCorrect || numGuesses >= maxGuesses;
		const now = new Date();
		const durationSeconds = (now - session.createdAt) / 1000;

		let updateDoc = { $push: { guesses: guessObj } };
		if (isCompleting) {
			updateDoc.$set = {
				isCompleted: true,
				won: isCorrect,
				completedAt: now,
				durationSeconds: durationSeconds
			};
		}

		const updateResult = await db.collection("cardGuessSessions").updateOne(
			{ 
				_id: sessionId, 
				isCompleted: false, 
				"guesses.cardCode": { $ne: guessedCardCode },
				guesses: { $size: session.guesses.length } 
			},
			updateDoc
		);

		if (updateResult.modifiedCount === 0) {
			return res.status(400).json({ error: "Duplicate guess or game already completed by another request." });
		}

		session.guesses.push(guessObj);
		if (isCompleting) {
			session.isCompleted = true;
			session.won = isCorrect;
			session.completedAt = now;
			session.durationSeconds = durationSeconds;
		}

		const pointsMap = { 1: 10, 2: 7, 3: 5, 4: 3, 5: 2 };
		let updatedRunState = null;

		if (isCompleting) {
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
			} else if ((session.mode === "unlimited" || session.mode === "event") && session.runId) {
				const colName = session.mode === "unlimited" ? "cardGuessUnlimitedRuns" : "cardGuessEventRuns";
				const run = await db.collection(colName).findOne({ _id: session.runId });
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
						
						const solvedCount = run.history.filter(h => h.won).length + (isCorrect ? 1 : 0);

						// Update Leaderboard
						if (session.mode === "unlimited") {
							const playerRecord = await db.collection("cardGuessLeaderboard").findOne({ identifier: run.identifier });
							if (!playerRecord || newScore > (playerRecord.unlimitedBestScore || 0)) {
								await db.collection("cardGuessLeaderboard").updateOne(
									{ identifier: run.identifier },
									{
										$set: {
											userName: run.playerName,
											unlimitedBestScore: newScore,
											unlimitedBestRunDuration: finalDuration,
											unlimitedBestSolved: solvedCount,
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
						} else if (session.mode === "event") {
							if (isEventActive()) {
								const playerRecord = await db.collection("cardGuessEventLeaderboard").findOne({ riotId: run.playerName });
								if (!playerRecord || newScore > (playerRecord.bestScore || 0)) {
									await db.collection("cardGuessEventLeaderboard").updateOne(
										{ riotId: run.playerName },
										{
											$set: {
												userName: run.playerName,
												bestScore: newScore,
												bestRunDuration: finalDuration,
												bestSolved: solvedCount,
												lastUpdated: new Date()
											},
											$inc: { runsPlayed: 1 }
										},
										{ upsert: true }
									);
								} else {
									await db.collection("cardGuessEventLeaderboard").updateOne(
										{ riotId: run.playerName },
										{ $inc: { runsPlayed: 1 } },
										{ upsert: true }
									);
								}
							}
						}
					}
					
					await db.collection(colName).updateOne({ _id: run._id }, updateOps);
					updatedRunState = { lives: newLives, score: newScore, playerName: run.playerName, status: newLives <= 0 ? "completed" : "playing" };
				}
			}
		}

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
		
		// Xử lý Survival run if unlimited or event
		if (session.mode === "unlimited" || session.mode === "event") {
			const colName = session.mode === "unlimited" ? "cardGuessUnlimitedRuns" : "cardGuessEventRuns";
			const run = await db.collection(colName).findOne({ currentSessionId: sessionId });
			if (run && run.status === "playing") {
				const newLives = 0; // Force end run
				const runHistoryItem = {
					sessionId: session._id,
					cardCode: session.cardCode,
					won: false,
					timeSeconds: session.durationSeconds,
					guesses: session.guesses.length
				};
				
				const solvedCount = run.history.filter(h => h.won).length;

				const updateOps = {
					$push: { history: runHistoryItem },
					$set: { 
						lives: 0, 
						status: "completed", 
						completedAt: now, 
						durationSeconds: Math.round((now - new Date(run.createdAt)) / 1000)
					}
				};
				if (session.mode === "unlimited") {
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
									unlimitedBestSolved: solvedCount,
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
				} else if (session.mode === "event") {
					if (isEventActive()) {
						const playerRecord = await db.collection("cardGuessEventLeaderboard").findOne({ riotId: run.playerName });
						if (!playerRecord || run.score > (playerRecord.bestScore || 0)) {
							await db.collection("cardGuessEventLeaderboard").updateOne(
								{ riotId: run.playerName },
								{
									$set: {
										userName: run.playerName,
										bestScore: run.score,
										bestRunDuration: updateOps.$set.durationSeconds,
										bestSolved: solvedCount,
										lastUpdated: now
									},
									$inc: { runsPlayed: 1 }
								},
								{ upsert: true }
							);
						} else {
							await db.collection("cardGuessEventLeaderboard").updateOne(
								{ riotId: run.playerName },
								{ $inc: { runsPlayed: 1 } },
								{ upsert: true }
							);
						}
					}
				}
				
				await db.collection(colName).updateOne({ _id: run._id }, updateOps);
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

		if (mode === "event") {
			const eventLeaders = await db.collection("cardGuessEventLeaderboard")
				.find({ bestScore: { $exists: true, $gt: 0 } })
				.sort({ bestScore: -1, bestRunDuration: 1, lastUpdated: 1 })
				.limit(50)
				.toArray();
			return res.json(eventLeaders);
		}

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

// POST /api/guess-game/merge-account
router.post("/merge-account", authenticateToken, async (req, res) => {
	try {
		const userId = req.user?.id;
		const { deviceId } = req.body;

		if (!userId) return res.status(401).json({ error: "Unauthorized" });
		if (!deviceId) return res.status(400).json({ error: "Missing deviceId" });
		if (userId === deviceId) return res.json({ success: true, message: "No merge needed" });

		const db = getDb();
		const userName = req.user?.user_metadata?.name || "Player";

		// 1. Update Sessions
		await db.collection("cardGuessSessions").updateMany(
			{ identifier: deviceId },
			{ $set: { identifier: userId, userId: userId } }
		);

		// 2. Update Unlimited Runs
		await db.collection("cardGuessUnlimitedRuns").updateMany(
			{ identifier: deviceId },
			{ $set: { identifier: userId, userId: userId, playerName: userName } }
		);

		// 3. Merge Leaderboard
		const guestRecord = await db.collection("cardGuessLeaderboard").findOne({ identifier: deviceId });
		if (guestRecord) {
			const userRecord = await db.collection("cardGuessLeaderboard").findOne({ identifier: userId });
			
			if (userRecord) {
				// User already has a record, merge best scores
				const bestDailyScore = Math.max(userRecord.dailyScore || 0, guestRecord.dailyScore || 0);
				const bestDailyDuration = (bestDailyScore === guestRecord.dailyScore && guestRecord.dailyScore > (userRecord.dailyScore || 0)) 
					? guestRecord.dailyDuration 
					: userRecord.dailyDuration;
				
				const bestUnlimitedScore = Math.max(userRecord.unlimitedBestScore || 0, guestRecord.unlimitedBestScore || 0);
				const isGuestBest = bestUnlimitedScore === guestRecord.unlimitedBestScore && guestRecord.unlimitedBestScore > (userRecord.unlimitedBestScore || 0);
				
				const bestUnlimitedDuration = isGuestBest ? guestRecord.unlimitedBestRunDuration : userRecord.unlimitedBestRunDuration;
				const bestUnlimitedSolved = isGuestBest ? guestRecord.unlimitedBestSolved : userRecord.unlimitedBestSolved;

				await db.collection("cardGuessLeaderboard").updateOne(
					{ identifier: userId },
					{
						$set: {
							dailyScore: bestDailyScore,
							dailyDuration: bestDailyDuration,
							unlimitedBestScore: bestUnlimitedScore,
							unlimitedBestRunDuration: bestUnlimitedDuration,
							unlimitedBestSolved: bestUnlimitedSolved,
							userName: userName,
							lastUpdated: new Date()
						},
						$inc: { 
							unlimitedRunsPlayed: guestRecord.unlimitedRunsPlayed || 0,
							dailySolved: guestRecord.dailySolved || 0
						}
					}
				);
			} else {
				// User has no record, just update identifier and name
				await db.collection("cardGuessLeaderboard").updateOne(
					{ identifier: deviceId },
					{ 
						$set: { 
							identifier: userId, 
							userId: userId, 
							userName: userName 
						} 
					}
				);
			}

			// Clean up guest record if user record existed (or if we already transferred it)
			if (userRecord) {
				await db.collection("cardGuessLeaderboard").deleteOne({ _id: guestRecord._id });
			}
		}

		res.json({ success: true, message: "Account merged successfully" });
	} catch (error) {
		console.error("Error merging accounts:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

export default router;
