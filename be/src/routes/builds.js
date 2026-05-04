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
	getPublicBuilds,
	invalidatePublicBuildsCache,
	invalidateUserBuildsCache,
} from "../utils/buildCache.js";
import { removeAccents } from "../utils/vietnameseUtils.js";
import { createAuditLog } from "../utils/auditLogger.js";
import { getUserNames } from "../utils/userCache.js";

// Tận dụng cache đã có sẵn thay vì scan lại DB - import từ DataService (không import chéo từ routes)
import { getCachedChampions, getCachedRelics, getCachedPowers } from "../services/dataService.js";

const router = express.Router();
const BUILDS_TABLE = "guidePocBuilds";

// GET /api/builds/top-by-champion/:championID
// Lấy danh sách build có views cao nhất của 1 tướng (sử dụng GSI)
router.get("/top-by-champion/:championID", async (req, res) => {
	const { championID } = req.params;
	const limit = parseInt(req.query.limit) || 10;

	try {
		const db = getDb();
		let Items = await db.collection(BUILDS_TABLE).find({ championID, display: { $in: [true, "true"] } })
			.sort({ views: -1 })
			.limit(limit)
			.toArray();

		let builds = Items
			? Items.map(item => normalizeDisplay(item))
			: [];

		// Làm giàu tên hiển thị
		if (builds.length > 0) {
			const usernames = [...new Set(builds.map(i => i.creator))];
			const userMap = await getUserNames(usernames);
			builds = builds.map(item => ({
				...item,
				creatorName: userMap[item.creator] || item.creator,
			}));
		}

		res.json(builds);
	} catch (error) {
		console.error("Error getting top builds by champion:", error);
		res.status(500).json({ error: "Could not retrieve top builds" });
	}
});

/**
 * Lấy danh sách tướng, cổ vật, sức mạnh từ cache đã có (không scan lại DB)
 */
async function getSearchDictionaries() {
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

	return { champMap, relicMap, powerMap };
}

/**
 * @route   GET /api/builds
 * @desc    Lấy danh sách build công khai với bộ lọc và phân trang
 */
router.get("/", async (req, res) => {
	try {
		const {
			page = 1,
			limit = 24,
			searchTerm = "",
			championIDs = "",
			regions = "",
			stars = "",
			sort = "createdAt-desc",
		} = req.query;

		const pageSize = parseInt(limit);
		const currentPage = parseInt(page);

		// 0. Xác định userId để dùng Cache riêng (nếu có thể)
		let userId = "global";
		const authHeader = req.headers.authorization;
		if (authHeader && authHeader.startsWith("Bearer ")) {
			const token = authHeader.split(" ")[1];
			try {
				const payload = JSON.parse(atob(token.split(".")[1]));
				userId = payload.sub || "global";
			} catch (e) {}
		}

		// 1. Lấy toàn bộ build công khai từ Cache theo User
		const { items: allBuilds } = await getPublicBuilds(userId);

		// 2. Lấy bộ từ điển tìm kiếm
		const { champMap, relicMap, powerMap } = await getSearchDictionaries();

		// 3. TRÍCH XUẤT BỘ LỌC ĐỘNG
		const availableFilters = {
			championIDs: [...new Set(allBuilds.map(b => b.championID))].sort(),
			regions: [...new Set(allBuilds.flatMap(b => b.regions || []))].sort(),
		};

		// 4. THỰC HIỆN LỌC (Filtering)
		let filtered = [...allBuilds];

		if (searchTerm) {
			const searchKey = removeAccents(searchTerm.toLowerCase());
			filtered = filtered.filter(b => {
				// A. Kiểm tra tên Tướng (Việt & Anh)
				const cInfo = champMap[b.championID];
				if (cInfo) {
					const champNameVi = removeAccents(cInfo.vi.toLowerCase());
					const champNameEn = removeAccents(cInfo.en.toLowerCase());
					if (
						champNameVi.includes(searchKey) ||
						champNameEn.includes(searchKey)
					) {
						return true;
					}
				}

				// B. Kiểm tra Mô tả của bài Build
				const desc = removeAccents((b.description || "").toLowerCase());
				if (desc.includes(searchKey)) return true;

				// C. Kiểm tra Cổ vật (Việt & Anh)
				if (Array.isArray(b.relicSetIds)) {
					for (const rId of b.relicSetIds) {
						const rInfo = relicMap[rId];
						if (rInfo) {
							if (
								removeAccents(rInfo.vi.toLowerCase()).includes(searchKey) ||
								removeAccents(rInfo.en.toLowerCase()).includes(searchKey)
							) {
								return true;
							}
						}
					}
				}

				// D. Kiểm tra Sức mạnh (Việt & Anh)
				if (Array.isArray(b.powerIds)) {
					for (const pId of b.powerIds) {
						const pInfo = powerMap[pId];
						if (pInfo) {
							if (
								removeAccents(pInfo.vi.toLowerCase()).includes(searchKey) ||
								removeAccents(pInfo.en.toLowerCase()).includes(searchKey)
							) {
								return true;
							}
						}
					}
				}

				return false;
			});
		}

		if (championIDs) {
			const cList = championIDs.split(",");
			filtered = filtered.filter(b => cList.includes(b.championID));
		}

		if (regions) {
			const rList = regions.split(",");
			filtered = filtered.filter(b => b.regions?.some(r => rList.includes(r)));
		}

		if (stars) {
			const sList = stars.split(",");
			filtered = filtered.filter(b => sList.includes(String(b.star)));
		}

		// 5. SẮP XẾP (Sorting)
		const [field, order] = sort.split("-");
		filtered.sort((a, b) => {
			let vA = a[field] ?? "";
			let vB = b[field] ?? "";
			
			if (field === "championName") {
				vA = champMap[a.championID]?.vi || "";
				vB = champMap[b.championID]?.vi || "";
			}

			if (field === "createdAt") {
				return order === "asc"
					? new Date(vA) - new Date(vB)
					: new Date(vB) - new Date(vA);
			}

			if (typeof vA === "number" && typeof vB === "number") {
				return order === "asc" ? vA - vB : vB - vA;
			}

			return order === "asc"
				? String(vA).localeCompare(String(vB))
				: String(vB).localeCompare(String(vA));
		});

		const totalItems = filtered.length;
		
		let paginatedItems;
		let totalPages;
		
		if (pageSize > 0) {
			totalPages = Math.ceil(totalItems / pageSize);
			paginatedItems = filtered.slice(
				(currentPage - 1) * pageSize,
				currentPage * pageSize,
			);
		} else {
			// Nếu limit <= 0 (như limit=-1), lấy toàn bộ
			totalPages = 1;
			paginatedItems = filtered;
		}

		res.json({
			items: paginatedItems,
			pagination: { totalItems, totalPages, currentPage, pageSize: pageSize > 0 ? pageSize : totalItems },
			availableFilters,
		});
	} catch (error) {
		console.error("Error getting public builds:", error);
		res.status(500).json({ error: "Could not retrieve builds" });
	}
});

router.get("/my-builds", authenticateCognitoToken, async (req, res) => {
	const creator = req.user["cognito:username"];

	// 🟢 Nhận tham số từ Frontend
	const {
		page = 1,
		limit = 24,
		searchTerm = "",
		regions = "",
		stars = "",
		sort = "createdAt-desc",
	} = req.query;

	const pageSize = parseInt(limit);
	const currentPage = parseInt(page);

	try {
		const db = getDb();
		let Items = await db.collection(BUILDS_TABLE).find({ creator }).toArray();
		let items = Items
			? Items.map(item => normalizeDisplay(item))
			: [];

		// 🟢 Lấy từ điển để hỗ trợ tìm kiếm Cổ vật / Kỹ năng giống hệt public builds
		const { champMap, relicMap, powerMap } = await getSearchDictionaries();

		// 🟢 1. Lọc theo từ khóa (Tên tướng, Mô tả, Cổ vật, Kỹ năng)
		if (searchTerm) {
			const searchKey = removeAccents(searchTerm.toLowerCase());
			items = items.filter(b => {
				const cInfo = champMap[b.championID];
				if (cInfo) {
					const champNameVi = removeAccents(cInfo.vi.toLowerCase());
					const champNameEn = removeAccents(cInfo.en.toLowerCase());
					if (champNameVi.includes(searchKey) || champNameEn.includes(searchKey))
						return true;
				}

				const desc = removeAccents((b.description || "").toLowerCase());
				if (desc.includes(searchKey)) return true;

				if (Array.isArray(b.relicSetIds)) {
					for (const rId of b.relicSetIds) {
						const rInfo = relicMap[rId];
						if (
							rInfo &&
							(removeAccents(rInfo.vi.toLowerCase()).includes(searchKey) ||
								removeAccents(rInfo.en.toLowerCase()).includes(searchKey))
						) {
							return true;
						}
					}
				}

				if (Array.isArray(b.powerIds)) {
					for (const pId of b.powerIds) {
						const pInfo = powerMap[pId];
						if (
							pInfo &&
							(removeAccents(pInfo.vi.toLowerCase()).includes(searchKey) ||
								removeAccents(pInfo.en.toLowerCase()).includes(searchKey))
						) {
							return true;
						}
					}
				}

				return false;
			});
		}

		// 🟢 2. Lọc theo vùng và sao
		if (regions) {
			const rList = regions.split(",");
			items = items.filter(b => b.regions?.some(r => rList.includes(r)));
		}

		if (stars) {
			const sList = stars.split(",");
			items = items.filter(b => sList.includes(String(b.star)));
		}

		// 🟢 3. Sắp xếp
		const [field, order] = sort.split("-");
		items.sort((a, b) => {
			let vA = a[field] ?? "";
			let vB = b[field] ?? "";
			
			if (field === "championName") {
				vA = champMap[a.championID]?.vi || "";
				vB = champMap[b.championID]?.vi || "";
			}

			if (field === "createdAt") {
				return order === "asc"
					? new Date(vA) - new Date(vB)
					: new Date(vB) - new Date(vA);
			}

			if (typeof vA === "number" && typeof vB === "number") {
				return order === "asc" ? vA - vB : vB - vA;
			}

			return order === "asc"
				? String(vA).localeCompare(String(vB))
				: String(vB).localeCompare(String(vA));
		});

		const totalItems = items.length;
		
		let paginatedItems;
		let totalPages;
		
		if (pageSize > 0) {
			totalPages = Math.ceil(totalItems / pageSize);
			paginatedItems = items.slice(
				(currentPage - 1) * pageSize,
				currentPage * pageSize,
			);
		} else {
			// Nếu limit <= 0 (như limit=-1), lấy toàn bộ
			totalPages = 1;
			paginatedItems = items;
		}

		// Làm giàu tên hiển thị
		if (paginatedItems.length > 0) {
			const usernames = [...new Set(paginatedItems.map(i => i.creator))];
			const userMap = await getUserNames(usernames);
			paginatedItems = paginatedItems.map(item => ({
				...item,
				creatorName: userMap[item.creator] || item.creator,
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

		const buildData = Item;
		const build = normalizeDisplay(buildData);
		const isPublic = buildData.display === true || buildData.display === "true";

		if (isPublic) {
			db.collection(BUILDS_TABLE).updateOne(
				{ id },
				{ $inc: { views: 1 } }
			).catch(e => console.error("View increment error:", e));

			// Làm giàu tên hiển thị cho chi tiết đơn lẻ
			const userMap = await getUserNames([build.creator]);
			build.creatorName = userMap[build.creator] || build.creator;

			return res.json(build);
		}

		if (!userSub || build.sub !== userSub) {
			return res.status(404).json({ error: "Build not found or not public" });
		}

		// Làm giàu tên hiển thị cho chi tiết đơn lẻ
		const userMap = await getUserNames([build.creator]);
		build.creatorName = userMap[build.creator] || build.creator;

		res.json(build);
	} catch (error) {
		console.error("Error getting build:", error);
		res.status(500).json({ error: "Could not retrieve build" });
	}
});

// POST /api/builds
router.post("/", authenticateCognitoToken, async (req, res) => {
	// Sử dụng đúng các tên mảng dựa trên ID như schema đã chốt
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

	if (
		!championID ||
		!Array.isArray(relicSetIds) ||
		relicSetIds.length === 0
	) {
		return res
			.status(400)
			.json({ error: "Champion ID and relicSetIds are required." });
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
	// Sử dụng đúng các tên mảng dựa trên ID như schema đã chốt
	const {
		description,
		relicSetIds,
		powerIds,
		runeIds,
		star,
		display,
		regions,
	} = req.body;
	const userSub = req.user.sub;

	try {
		const db = getDb();
		const Item = await db.collection(BUILDS_TABLE).findOne({ id });
		if (!Item) return res.status(404).json({ error: "Build not found" });

		const oldBuild = Item;
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

		if (!hasUpdates)
			return res.status(400).json({ error: "No fields to update" });

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
		const Item = await db.collection(BUILDS_TABLE).findOne({ id });
		if (!Item) return res.status(404).json({ error: "Build not found" });

		const build = Item;
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
		const Item = await db.collection(BUILDS_TABLE).findOne({ id });

		if (!Item) return res.status(404).json({ error: "Build not found" });

		const build = Item;

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
