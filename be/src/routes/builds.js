// src/routes/builds.js
import express from "express";
import {
	PutItemCommand,
	UpdateItemCommand,
	DeleteItemCommand,
	GetItemCommand,
	QueryCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { v4 as uuidv4 } from "uuid";

import client from "../config/db.js";
import { authenticateCognitoToken } from "../middleware/authenticate.js";
import {
	prepareBuildForDynamo,
	normalizeBuildFromDynamo,
} from "../utils/dynamodb.js";
import {
	getPublicBuilds,
	invalidatePublicBuildsCache,
} from "../utils/buildCache.js";
import { removeAccents } from "../utils/vietnameseUtils.js";
import { createAuditLog } from "../utils/auditLogger.js";

// Tận dụng cache đã có sẵn thay vì scan lại DB - import từ DataService (không import chéo từ routes)
import { getCachedChampions, getCachedRelics, getCachedPowers } from "../services/dataService.js";

const router = express.Router();
const BUILDS_TABLE = "Builds";

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
		if (c.name) champMap[c.name] = c.translations?.en?.name || "";
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
			championNames = "",
			regions = "",
			stars = "",
			sort = "createdAt-desc",
		} = req.query;

		const pageSize = parseInt(limit);
		const currentPage = parseInt(page);

		// 1. Lấy toàn bộ build công khai từ Cache
		const { items: allBuilds } = await getPublicBuilds();

		// 2. Lấy bộ từ điển tìm kiếm
		const { champMap, relicMap, powerMap } = await getSearchDictionaries();

		// 3. TRÍCH XUẤT BỘ LỌC ĐỘNG
		const availableFilters = {
			championNames: [...new Set(allBuilds.map(b => b.championName))].sort(),
			regions: [...new Set(allBuilds.flatMap(b => b.regions || []))].sort(),
		};

		// 4. THỰC HIỆN LỌC (Filtering)
		let filtered = [...allBuilds];

		if (searchTerm) {
			const searchKey = removeAccents(searchTerm.toLowerCase());
			filtered = filtered.filter(b => {
				// A. Kiểm tra tên Tướng (Việt & Anh)
				const champNameVi = removeAccents((b.championName || "").toLowerCase());
				const champNameEn = removeAccents(
					(champMap[b.championName] || "").toLowerCase(),
				);
				if (
					champNameVi.includes(searchKey) ||
					champNameEn.includes(searchKey)
				) {
					return true;
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

		if (championNames) {
			const cList = championNames.split(",");
			filtered = filtered.filter(b => cList.includes(b.championName));
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
		const command = new QueryCommand({
			TableName: BUILDS_TABLE,
			IndexName: "creator-index",
			KeyConditionExpression: "creator = :creator",
			ExpressionAttributeValues: marshall({ ":creator": creator }),
		});
		const { Items } = await client.send(command);
		let items = Items
			? Items.map(item => normalizeBuildFromDynamo(unmarshall(item)))
			: [];

		// 🟢 Lấy từ điển để hỗ trợ tìm kiếm Cổ vật / Kỹ năng giống hệt public builds
		const { champMap, relicMap, powerMap } = await getSearchDictionaries();

		// 🟢 1. Lọc theo từ khóa (Tên tướng, Mô tả, Cổ vật, Kỹ năng)
		if (searchTerm) {
			const searchKey = removeAccents(searchTerm.toLowerCase());
			items = items.filter(b => {
				const champNameVi = removeAccents((b.championName || "").toLowerCase());
				const champNameEn = removeAccents(
					(champMap[b.championName] || "").toLowerCase(),
				);
				if (champNameVi.includes(searchKey) || champNameEn.includes(searchKey))
					return true;

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
		const { Item } = await client.send(
			new GetItemCommand({
				TableName: BUILDS_TABLE,
				Key: marshall({ id }),
			}),
		);

		if (!Item) return res.status(404).json({ error: "Build not found" });

		const buildData = unmarshall(Item);
		const build = normalizeBuildFromDynamo(buildData);
		const isPublic = buildData.display === true || buildData.display === "true";

		if (isPublic) {
			client
				.send(
					new UpdateItemCommand({
						TableName: BUILDS_TABLE,
						Key: marshall({ id }),
						UpdateExpression:
							"SET #views = if_not_exists(#views, :zero) + :inc",
						ExpressionAttributeNames: { "#views": "views" },
						ExpressionAttributeValues: marshall({ ":inc": 1, ":zero": 0 }),
					}),
				)
				.catch(e => console.error("View increment error:", e));

			return res.json(build);
		}

		if (!userSub || build.sub !== userSub) {
			return res.status(404).json({ error: "Build not found or not public" });
		}

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
		championName,
		description = "",
		relicSetIds = [],
		powerIds = [],
		runeIds = [],
		star = 0,
		display = false,
		regions = [],
	} = req.body;

	if (
		!championName ||
		!Array.isArray(relicSetIds) ||
		relicSetIds.length === 0
	) {
		return res
			.status(400)
			.json({ error: "Champion name and relicSetIds are required." });
	}

	const displayValue = display === true ? "true" : "false";

	const build = prepareBuildForDynamo({
		id: uuidv4(),
		sub: req.user.sub,
		creator: req.user["cognito:username"],
		description,
		championName,
		relicSetIds,
		powerIds,
		runeIds,
		like: 0,
		star: Number(star),
		display: displayValue,
		views: 0,
		regions,
		createdAt: new Date().toISOString(),
	});

	try {
		await client.send(
			new PutItemCommand({
				TableName: BUILDS_TABLE,
				Item: marshall(build, { removeUndefinedValues: true }),
			}),
		);

		if (displayValue === "true") invalidatePublicBuildsCache();

		await createAuditLog({
			action: "CREATE",
			entityType: "build",
			entityId: build.id,
			entityName: `Build ${build.championName} by ${build.creator} (User)`,
			oldData: null,
			newData: normalizeBuildFromDynamo(build),
			user: req.user
		});

		res.status(201).json({
			message: "Build created successfully",
			build: normalizeBuildFromDynamo(build),
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
		const { Item } = await client.send(
			new GetItemCommand({ TableName: BUILDS_TABLE, Key: marshall({ id }) }),
		);
		if (!Item) return res.status(404).json({ error: "Build not found" });

		const oldBuild = unmarshall(Item);
		if (oldBuild.sub !== userSub) {
			return res.status(403).json({ error: "Unauthorized" });
		}

		let updateExpression = "SET";
		const expressionAttributeNames = {};
		const expressionAttributeValues = {};
		let hasUpdates = false;

		const fields = {
			description,
			relicSetIds,
			powerIds,
			runeIds,
			star,
			display,
			regions,
		};

		Object.entries(fields).forEach(([key, value]) => {
			if (value !== undefined) {
				hasUpdates = true;
				const attrKey = `#${key}`;
				const valKey = `:${key}`;
				updateExpression += ` ${attrKey} = ${valKey},`;
				expressionAttributeNames[attrKey] = key;

				if (key === "display") {
					expressionAttributeValues[valKey] = value === true ? "true" : "false";
				} else {
					expressionAttributeValues[valKey] = value;
				}
			}
		});

		if (!hasUpdates)
			return res.status(400).json({ error: "No fields to update" });

		updateExpression = updateExpression.slice(0, -1);

		const command = new UpdateItemCommand({
			TableName: BUILDS_TABLE,
			Key: marshall({ id }),
			UpdateExpression: updateExpression,
			ExpressionAttributeNames: expressionAttributeNames,
			ExpressionAttributeValues: marshall(expressionAttributeValues, {
				removeUndefinedValues: true,
			}),
			ReturnValues: "ALL_NEW",
		});

		const { Attributes } = await client.send(command);
		const updatedBuild = normalizeBuildFromDynamo(unmarshall(Attributes));

		const wasPublic = oldBuild.display === true || oldBuild.display === "true";
		const isNowPublic = updatedBuild.display === true;

		if (wasPublic || isNowPublic) {
			invalidatePublicBuildsCache();
		}

		await createAuditLog({
			action: "UPDATE",
			entityType: "build",
			entityId: id,
			entityName: `Build ${updatedBuild.championName} by ${updatedBuild.creator} (User)`,
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
		const { Item } = await client.send(
			new GetItemCommand({ TableName: BUILDS_TABLE, Key: marshall({ id }) }),
		);
		if (!Item) return res.status(404).json({ error: "Build not found" });

		const build = unmarshall(Item);
		if (build.sub !== userSub) {
			return res.status(403).json({ error: "Unauthorized" });
		}

		if (build.display === true || build.display === "true") {
			invalidatePublicBuildsCache();
		}

		await client.send(
			new DeleteItemCommand({ TableName: BUILDS_TABLE, Key: marshall({ id }) }),
		);

		await createAuditLog({
			action: "DELETE",
			entityType: "build",
			entityId: id,
			entityName: `Build ${build.championName} by ${build.creator} (User)`,
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
		const { Item } = await client.send(
			new GetItemCommand({
				TableName: BUILDS_TABLE,
				Key: marshall({ id }),
			}),
		);

		if (!Item) return res.status(404).json({ error: "Build not found" });

		const build = unmarshall(Item);

		const result = await client.send(
			new UpdateItemCommand({
				TableName: BUILDS_TABLE,
				Key: marshall({ id }),
				UpdateExpression: "SET #like = if_not_exists(#like, :zero) + :inc",
				ExpressionAttributeNames: { "#like": "like" },
				ExpressionAttributeValues: marshall({ ":inc": 1, ":zero": 0 }),
				ReturnValues: "UPDATED_NEW",
			}),
		);

		if (build.display === true || build.display === "true") {
			invalidatePublicBuildsCache();
		}

		const newLikeCount = result.Attributes
			? unmarshall(result.Attributes).like
			: (Number(build.like) || 0) + 1;

		res.json({ like: newLikeCount });
	} catch (error) {
		console.error("Like error:", error);
		res.status(500).json({ error: "Could not like build" });
	}
});

export default router;
