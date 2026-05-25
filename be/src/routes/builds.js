// src/routes/builds.js
import express from "express";
import { getDb } from "../config/mongo.js";
import { v4 as uuidv4 } from "uuid";

import { authenticateCognitoToken } from "../middleware/authenticate.js";
import {
	normalizeDisplay,
	prepareDisplayForSave,
} from "../utils/dbHelpers.js";
import {
	invalidateUserBuildsCache,
} from "../utils/buildCache.js";
import { removeAccents } from "../utils/vietnameseUtils.js";
import { createAuditLog } from "../utils/auditLogger.js";
import { getUserNames } from "../utils/userCache.js";
import cacheManager from "../utils/cacheManager.js";
import kv from "../utils/redis.js";

import { getCachedChampions, getCachedRelics, getCachedPowers } from "../services/dataService.js";

const router = express.Router();
const BUILDS_TABLE = "guidePocBuilds";
const availableFiltersCache = cacheManager.getOrCreateCache("available_filters", { stdTTL: 3600 });
const searchDictionariesCache = cacheManager.getOrCreateCache("search_dictionaries", { stdTTL: 3600 });

// --- UTILITY FUNCTIONS ---

/**
 * Builds and caches search dictionaries (champion, relic, power maps) to avoid recreating them on every request.
 */
async function getSearchDictionaries() {
	let dicts = await searchDictionariesCache.get("maps");
	if (dicts) return dicts;

	const [champs, relics, powers] = await Promise.all([
		getCachedChampions(),
		getCachedRelics(),
		getCachedPowers(),
	]);

	const champMap = {};
	champs.forEach(c => {
		if (c.championID) champMap[c.championID] = { vi: c.name || "", en: c.translations?.en?.name || "" };
	});

	const relicMap = {};
	relics.forEach(r => {
		const id = r.relicCode || r.itemCode;
		if (id) relicMap[id] = { vi: r.name || "", en: r.translations?.en?.name || "" };
	});

	const powerMap = {};
	powers.forEach(p => {
		if (p.powerCode) powerMap[p.powerCode] = { vi: p.name || "", en: p.translations?.en?.name || "" };
	});

	dicts = { champMap, relicMap, powerMap };
	await searchDictionariesCache.set("maps", dicts);
	return dicts;
}

/**
 * Helper to build common query logic for builds (public and user-specific)
 */
async function buildBuildsQueryObj(reqQuery, baseQuery = {}) {
	const {
		searchTerm = "",
		championIDs = "",
		regions = "",
		stars = "",
		sort = "createdAt-desc",
	} = reqQuery;

	let query = { ...baseQuery };

	// 1. Build Query for Filters
	if (championIDs) {
		query.championID = { $in: championIDs.split(",") };
	}
	if (regions) {
		query.regions = { $in: regions.split(",") };
	}
	if (stars) {
		const sList = stars.split(",").map(Number);
		const sListStr = stars.split(",");
		query.star = { $in: [...sList, ...sListStr] };
	}

	// 2. Build Query for Search Term
	if (searchTerm) {
		const { champMap, relicMap, powerMap } = await getSearchDictionaries();
		const searchKey = removeAccents(searchTerm.toLowerCase());
		
		const matchingChampIds = Object.keys(champMap).filter(id => 
			removeAccents(champMap[id].vi.toLowerCase()).includes(searchKey) || 
			removeAccents(champMap[id].en.toLowerCase()).includes(searchKey)
		);
		const matchingRelicIds = Object.keys(relicMap).filter(id => 
			removeAccents(relicMap[id].vi.toLowerCase()).includes(searchKey) || 
			removeAccents(relicMap[id].en.toLowerCase()).includes(searchKey)
		);
		const matchingPowerIds = Object.keys(powerMap).filter(id => 
			removeAccents(powerMap[id].vi.toLowerCase()).includes(searchKey) || 
			removeAccents(powerMap[id].en.toLowerCase()).includes(searchKey)
		);

		const regexPattern = new RegExp(searchKey, 'i');
		const searchOr = [
			{ description: regexPattern },
			{ creator: regexPattern }
		];

		if (matchingChampIds.length > 0) searchOr.push({ championID: { $in: matchingChampIds } });
		if (matchingRelicIds.length > 0) searchOr.push({ relicSetIds: { $in: matchingRelicIds } });
		if (matchingPowerIds.length > 0) searchOr.push({ powerIds: { $in: matchingPowerIds } });

		query.$or = searchOr;
	}

	// 3. Build Sort Object
	const [field, order] = sort.split("-");
	let sortObj = {};
	const sortDir = order === "asc" ? 1 : -1;
	if (field === "championName") {
		sortObj["championID"] = sortDir;
	} else {
		sortObj[field || "createdAt"] = sortDir;
	}

	return { query, sortObj };
}


// --- ROUTES ---

// GET /api/builds/top-by-champion/:championID
router.get("/top-by-champion/:championID", async (req, res) => {
	const { championID } = req.params;
	const limit = parseInt(req.query.limit) || 10;

	try {
		const db = getDb();
		const Items = await db.collection(BUILDS_TABLE)
			.find({ championID, display: { $in: [true, "true"] } })
			.sort({ views: -1 })
			.limit(limit)
			.toArray();

		let builds = Items.map(normalizeDisplay);

		if (builds.length > 0) {
			const usernames = [...new Set(builds.map(i => i.creator).filter(Boolean))];
			const userMap = await getUserNames(usernames);
			builds = builds.map(item => ({
				...item,
				creatorName: item.creator ? (userMap[item.creator] || item.creator) : "Người chơi ẩn danh",
			}));
		}

		res.json(builds);
	} catch (error) {
		console.error("Error getting top builds by champion:", error);
		res.status(500).json({ error: "Could not retrieve top builds" });
	}
});

// GET /api/builds
router.get("/", async (req, res) => {
	try {
		// Use stable stringify for query to generate consistent cache key
		const queryParamsStr = new URLSearchParams(req.query).toString();
		const cacheKey = `api:builds:public:${queryParamsStr}`;

		if (kv) {
			const cachedData = await kv.get(cacheKey);
			if (cachedData) {
				return res.json(JSON.parse(cachedData));
			}
		}

		const { page = 1, limit = 24 } = req.query;
		const pageSize = parseInt(limit);
		const currentPage = parseInt(page);
		const db = getDb();

		const { query, sortObj } = await buildBuildsQueryObj(req.query, { display: { $in: [true, "true"] } });

		// Cache available filters logic asynchronously if missing
		let availableFilters = await availableFiltersCache.get("global");
		if (!availableFilters) {
			availableFilters = {
				championIDs: (await db.collection(BUILDS_TABLE).aggregate([
					{ $match: { display: { $in: [true, "true"] } } },
					{ $group: { _id: "$championID" } }
				]).toArray()).map(d => d._id).filter(Boolean).sort(),
				regions: (await db.collection(BUILDS_TABLE).aggregate([
					{ $match: { display: { $in: [true, "true"] } } },
					{ $unwind: "$regions" },
					{ $group: { _id: "$regions" } }
				]).toArray()).map(d => d._id).filter(Boolean).sort()
			};
			await availableFiltersCache.set("global", availableFilters);
		}

		const totalItems = await db.collection(BUILDS_TABLE).countDocuments(query);
		
		let paginatedItems = [];
		let totalPages = 1;

		if (pageSize > 0) {
			totalPages = Math.ceil(totalItems / pageSize);
			paginatedItems = await db.collection(BUILDS_TABLE)
				.find(query)
				.sort(sortObj)
				.skip((currentPage - 1) * pageSize)
				.limit(pageSize)
				.toArray();
		} else {
			paginatedItems = await db.collection(BUILDS_TABLE)
				.find(query)
				.sort(sortObj)
				.toArray();
		}

		paginatedItems = paginatedItems.map(normalizeDisplay);

		if (paginatedItems.length > 0) {
			const usernames = [...new Set(paginatedItems.map(i => i.creator).filter(Boolean))];
			const userMap = await getUserNames(usernames);
			paginatedItems = paginatedItems.map(item => ({
				...item,
				creatorName: item.creator ? (userMap[item.creator] || item.creator) : "Người chơi ẩn danh",
			}));
		}

		const responseData = {
			items: paginatedItems,
			pagination: { totalItems, totalPages, currentPage, pageSize: pageSize > 0 ? pageSize : totalItems },
			availableFilters,
		};
		
		// Cache for 5 minutes (300 seconds)
		if (kv) {
			await kv.setex(cacheKey, 300, JSON.stringify(responseData));
		}

		res.json(responseData);
	} catch (error) {
		console.error("Error getting public builds:", error);
		res.status(500).json({ error: "Could not retrieve builds" });
	}
});

// GET /api/builds/my-builds
router.get("/my-builds", authenticateCognitoToken, async (req, res) => {
	const creator = req.user["cognito:username"];
	const { page = 1, limit = 24 } = req.query;
	const pageSize = parseInt(limit);
	const currentPage = parseInt(page);

	try {
		const db = getDb();
		const { query, sortObj } = await buildBuildsQueryObj(req.query, { creator });

		const totalItems = await db.collection(BUILDS_TABLE).countDocuments(query);
		
		let paginatedItems = [];
		let totalPages = 1;

		if (pageSize > 0) {
			totalPages = Math.ceil(totalItems / pageSize);
			paginatedItems = await db.collection(BUILDS_TABLE)
				.find(query)
				.sort(sortObj)
				.skip((currentPage - 1) * pageSize)
				.limit(pageSize)
				.toArray();
		} else {
			paginatedItems = await db.collection(BUILDS_TABLE)
				.find(query)
				.sort(sortObj)
				.toArray();
		}

		paginatedItems = paginatedItems.map(normalizeDisplay);

		if (paginatedItems.length > 0) {
			const usernames = [...new Set(paginatedItems.map(i => i.creator).filter(Boolean))];
			const userMap = await getUserNames(usernames);
			paginatedItems = paginatedItems.map(item => ({
				...item,
				creatorName: item.creator ? (userMap[item.creator] || item.creator) : "Người chơi ẩn danh",
			}));
		}

		res.json({
			items: paginatedItems,
			pagination: { totalItems, totalPages, currentPage, pageSize: pageSize > 0 ? pageSize : totalItems },
		});
	} catch (error) {
		console.error("Error getting user's builds:", error);
		res.status(500).json({ error: "Could not retrieve your builds" });
	}
});

// GET /api/builds/:id
router.get("/:id", async (req, res) => {
	const { id } = req.params;
	let userSub = null;

	const authHeader = req.headers.authorization;
	if (authHeader && authHeader.startsWith("Bearer ")) {
		const token = authHeader.split(" ")[1];
		try {
			const payload = JSON.parse(atob(token.split(".")[1]));
			userSub = payload.sub;
		} catch (err) {
			console.warn("Invalid token format");
		}
	}

	try {
		const db = getDb();
		const Item = await db.collection(BUILDS_TABLE).findOne({ id });

		if (!Item) return res.status(404).json({ error: "Build not found" });

		const build = normalizeDisplay(Item);
		const isPublic = Item.display === true || Item.display === "true";

		if (isPublic) {
			db.collection(BUILDS_TABLE).updateOne(
				{ id },
				{ $inc: { views: 1 } }
			).catch(e => console.error("View increment error:", e));
		} else if (!userSub || build.sub !== userSub) {
			return res.status(404).json({ error: "Build not found or not public" });
		}

		if (build.creator) {
			const userMap = await getUserNames([build.creator]);
			build.creatorName = userMap[build.creator] || build.creator;
		} else {
			build.creatorName = "Người chơi ẩn danh";
		}

		res.json(build);
	} catch (error) {
		console.error("Error getting build:", error);
		res.status(500).json({ error: "Could not retrieve build" });
	}
});

// POST /api/builds
router.post("/", authenticateCognitoToken, async (req, res) => {
	const {
		championID,
		description = "",
		relicSetIds = [],
		powerIds = [],
		runeIds = [],
		star = 0,
		display = false,
		regions = [],
	} = req.body;

	if (!championID || !Array.isArray(relicSetIds) || relicSetIds.length === 0) {
		return res.status(400).json({ error: "Champion ID and relicSetIds are required." });
	}

	const build = {
		id: uuidv4(),
		sub: req.user.sub,
		creator: req.user["cognito:username"],
		description,
		championID,
		relicSetIds,
		powerIds,
		runeIds,
		like: 0,
		star: Number(star),
		display: prepareDisplayForSave(display),
		views: 0,
		regions,
		createdAt: new Date().toISOString(),
	};

	try {
		const db = getDb();
		await db.collection(BUILDS_TABLE).insertOne(build);

		if (display === true) invalidateUserBuildsCache(req.user.sub);

		await createAuditLog({
			action: "CREATE",
			entityType: "build",
			entityId: build.id,
			entityName: `Build ${build.championID} by ${build.creator} (User)`,
			oldData: null,
			newData: normalizeDisplay(build),
			user: req.user
		});

		res.status(201).json({
			message: "Build created successfully",
			build: normalizeDisplay(build),
		});
	} catch (error) {
		console.error("Error creating build:", error);
		res.status(500).json({ error: "Could not create build" });
	}
});

// PUT /api/builds/:id
router.put("/:id", authenticateCognitoToken, async (req, res) => {
	const { id } = req.params;
	const userSub = req.user.sub;

	try {
		const db = getDb();
		const oldBuild = await db.collection(BUILDS_TABLE).findOne({ id });
		if (!oldBuild) return res.status(404).json({ error: "Build not found" });

		if (oldBuild.sub !== userSub) {
			return res.status(403).json({ error: "Unauthorized" });
		}

		const allowedFields = [
			"description",
			"relicSetIds",
			"powerIds",
			"runeIds",
			"star",
			"display",
			"regions",
		];

		let hasUpdates = false;
		const fieldsToUpdate = {};
		Object.entries(req.body).forEach(([key, value]) => {
			if (allowedFields.includes(key) && value !== undefined) {
				hasUpdates = true;
				fieldsToUpdate[key] = key === "display" ? (value === true || value === "true") : value;
			}
		});

		if (!hasUpdates) return res.status(400).json({ error: "No fields to update" });

		const result = await db.collection(BUILDS_TABLE).findOneAndUpdate(
			{ id },
			{ $set: fieldsToUpdate },
			{ returnDocument: 'after' }
		);
		const updatedBuild = normalizeDisplay(result);

		const wasPublic = oldBuild.display === true || oldBuild.display === "true";
		const isNowPublic = updatedBuild.display === true;

		if (wasPublic || isNowPublic) {
			invalidateUserBuildsCache(req.user.sub);
		}

		await createAuditLog({
			action: "UPDATE",
			entityType: "build",
			entityId: id,
			entityName: `Build ${updatedBuild.championID} by ${updatedBuild.creator} (User)`,
			oldData: oldBuild,
			newData: updatedBuild,
			user: req.user
		});

		res.json({ message: "Build updated successfully", build: updatedBuild });
	} catch (error) {
		console.error("Error updating build:", error);
		res.status(500).json({ error: "Could not update build" });
	}
});

// DELETE /api/builds/:id
router.delete("/:id", authenticateCognitoToken, async (req, res) => {
	const { id } = req.params;
	const userSub = req.user.sub;

	try {
		const db = getDb();
		const build = await db.collection(BUILDS_TABLE).findOne({ id });
		if (!build) return res.status(404).json({ error: "Build not found" });

		if (build.sub !== userSub) {
			return res.status(403).json({ error: "Unauthorized" });
		}

		if (build.display === true || build.display === "true") {
			invalidateUserBuildsCache(req.user.sub);
		}

		await db.collection(BUILDS_TABLE).deleteOne({ id });

		await createAuditLog({
			action: "DELETE",
			entityType: "build",
			entityId: id,
			entityName: `Build ${build.championID} by ${build.creator} (User)`,
			oldData: build,
			newData: null,
			user: req.user
		});
		res.json({ message: "Build deleted successfully" });
	} catch (error) {
		console.error("Error deleting build:", error);
		res.status(500).json({ error: "Could not delete build" });
	}
});

// PATCH /api/builds/:id/like
router.patch("/:id/like", async (req, res) => {
	const { id } = req.params;

	try {
		const db = getDb();
		const build = await db.collection(BUILDS_TABLE).findOne({ id });

		if (!build) return res.status(404).json({ error: "Build not found" });

		const result = await db.collection(BUILDS_TABLE).findOneAndUpdate(
			{ id },
			{ $inc: { like: 1 } },
			{ returnDocument: 'after' }
		);

		if (build.display === true || build.display === "true") {
			let userId = "global";
			const authHeader = req.headers.authorization;
			if (authHeader && authHeader.startsWith("Bearer ")) {
				try {
					const token = authHeader.split(" ")[1];
					const payload = JSON.parse(atob(token.split(".")[1]));
					userId = payload.sub || "global";
				} catch (e) {}
			}
			invalidateUserBuildsCache(userId);
		}

		const newLikeCount = result ? result.like : (Number(build.like) || 0) + 1;

		res.json({ like: newLikeCount });
	} catch (error) {
		console.error("Like error:", error);
		res.status(500).json({ error: "Could not like build" });
	}
});

export default router;
