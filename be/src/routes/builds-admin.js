// src/routes/builds-admin.js
import express from "express";
import {
	GetItemCommand,
	ScanCommand,
	UpdateItemCommand,
	DeleteItemCommand,
	PutItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { v4 as uuidv4 } from "uuid";
import NodeCache from "node-cache";
import client from "../config/db.js";
import { authenticateCognitoToken } from "../middleware/authenticate.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { normalizeBuildFromDynamo } from "../utils/dynamodb.js";
import { invalidatePublicBuildsCache } from "../utils/buildCache.js";
import { removeAccents } from "../utils/vietnameseUtils.js";
import { createAuditLog } from "../utils/auditLogger.js";

const router = express.Router();
const BUILDS_TABLE = "Builds";

// Tăng TTL lên 5 phút cho Admin để giảm thiểu Scan liên tục
const adminBuildCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });
// Cache từ điển để tìm kiếm Tiếng Anh / Tiếng Việt
const dictionaryCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

/**
 * Tải từ điển Tướng, Cổ vật, Sức mạnh để phục vụ tính năng tìm kiếm Đa ngôn ngữ
 */
async function getSearchDictionaries() {
	const CACHE_KEY = "builds_search_dicts_admin";
	let dicts = dictionaryCache.get(CACHE_KEY);
	if (dicts) return dicts;

	dicts = { champMap: {}, relicMap: {}, powerMap: {} };

	try {
		const champsRes = await client.send(
			new ScanCommand({ TableName: "guidePocChampionList" }),
		);
		const champs = champsRes.Items
			? champsRes.Items.map(item => unmarshall(item))
			: [];
		champs.forEach(c => {
			if (c.name) dicts.champMap[c.name] = c.translations?.en?.name || "";
		});

		const relicsRes = await client.send(
			new ScanCommand({ TableName: "guidePocRelics" }),
		);
		const relics = relicsRes.Items
			? relicsRes.Items.map(item => unmarshall(item))
			: [];
		relics.forEach(r => {
			const id = r.relicCode || r.itemCode;
			if (id)
				dicts.relicMap[id] = {
					vi: r.name || "",
					en: r.translations?.en?.name || "",
				};
		});

		const powersRes = await client.send(
			new ScanCommand({ TableName: "guidePocPowers" }),
		);
		const powers = powersRes.Items
			? powersRes.Items.map(item => unmarshall(item))
			: [];
		powers.forEach(p => {
			if (p.powerCode)
				dicts.powerMap[p.powerCode] = {
					vi: p.name || "",
					en: p.translations?.en?.name || "",
				};
		});

		dictionaryCache.set(CACHE_KEY, dicts);
	} catch (error) {
		console.error("Lỗi khi tải từ điển tìm kiếm (Admin):", error);
	}

	return dicts;
}

/**
 * Hàm lấy toàn bộ build cho Admin
 */
async function getAllBuildsAdmin() {
	const CACHE_KEY = "admin_all_builds";
	let cachedData = adminBuildCache.get(CACHE_KEY);

	if (!cachedData) {
		const command = new ScanCommand({ TableName: BUILDS_TABLE });
		const { Items } = await client.send(command);
		cachedData = Items
			? Items.map(item => normalizeBuildFromDynamo(unmarshall(item)))
			: [];

		// Sắp xếp mặc định
		cachedData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

		adminBuildCache.set(CACHE_KEY, cachedData);
	}
	return cachedData;
}

/**
 * GET /api/admin/builds
 */
router.get("/", authenticateCognitoToken, requireAdmin, async (req, res) => {
	try {
		const {
			page = 1,
			limit = 24,
			searchTerm = "",
			championNames = "",
			creators = "",
			display = "",
			stars = "",
			sort = "createdAt-desc",
		} = req.query;

		const allBuilds = await getAllBuildsAdmin();
		const { champMap, relicMap, powerMap } = await getSearchDictionaries();

		const availableFilters = {
			championNames: [...new Set(allBuilds.map(b => b.championName))].sort(),
			creators: [...new Set(allBuilds.map(b => b.creator))].sort(),
			displayStatus: [true, false],
		};

		let filtered = [...allBuilds];

		if (searchTerm) {
			const searchKey = removeAccents(searchTerm.toLowerCase());
			filtered = filtered.filter(b => {
				// 1. Kiểm tra Tên Tướng (Việt & Anh)
				const champNameVi = removeAccents((b.championName || "").toLowerCase());
				const champNameEn = removeAccents(
					(champMap[b.championName] || "").toLowerCase(),
				);
				if (champNameVi.includes(searchKey) || champNameEn.includes(searchKey))
					return true;

				// 2. Kiểm tra Mô tả
				const desc = removeAccents((b.description || "").toLowerCase());
				if (desc.includes(searchKey)) return true;

				// 3. Kiểm tra Người tạo và ID
				if (removeAccents((b.creator || "").toLowerCase()).includes(searchKey))
					return true;
				if (String(b.id).includes(searchKey)) return true;

				// 4. Kiểm tra Cổ vật (Việt & Anh)
				if (Array.isArray(b.relicSetIds)) {
					for (const rId of b.relicSetIds) {
						const rInfo = relicMap[rId];
						if (
							rInfo &&
							(removeAccents(rInfo.vi.toLowerCase()).includes(searchKey) ||
								removeAccents(rInfo.en.toLowerCase()).includes(searchKey))
						)
							return true;
					}
				}

				// 5. Kiểm tra Sức mạnh (Việt & Anh)
				if (Array.isArray(b.powerIds)) {
					for (const pId of b.powerIds) {
						const pInfo = powerMap[pId];
						if (
							pInfo &&
							(removeAccents(pInfo.vi.toLowerCase()).includes(searchKey) ||
								removeAccents(pInfo.en.toLowerCase()).includes(searchKey))
						)
							return true;
					}
				}

				return false;
			});
		}

		if (championNames) {
			const cList = championNames.split(",");
			filtered = filtered.filter(b => cList.includes(b.championName));
		}

		if (creators) {
			const crList = creators.split(",");
			filtered = filtered.filter(b => crList.includes(b.creator));
		}

		if (display !== "") {
			const isDisplay = display === "true";
			filtered = filtered.filter(b => b.display === isDisplay);
		}

		if (stars) {
			const sList = stars.split(",");
			filtered = filtered.filter(b => sList.includes(String(b.star)));
		}

		// Sắp xếp
		const [field, order] = sort.split("-");
		filtered.sort((a, b) => {
			let vA = a[field] ?? "";
			let vB = b[field] ?? "";

			if (field === "createdAt") {
				return order === "asc"
					? new Date(vA) - new Date(vB)
					: new Date(vB) - new Date(vA);
			}

			if (field === "likes") {
				vA = a.like || 0;
				vB = b.like || 0;
			}

			if (typeof vA === "number" || typeof vB === "number") {
				return order === "asc"
					? Number(vA) - Number(vB)
					: Number(vB) - Number(vA);
			}

			return order === "asc"
				? String(vA).localeCompare(String(vB))
				: String(vB).localeCompare(String(vA));
		});

		// Phân trang
		let pageSize = parseInt(limit);
		if (isNaN(pageSize) || pageSize <= 0) {
			pageSize = 1000;
		}

		const currentPage = parseInt(page) || 1;
		const totalItems = filtered.length;
		const totalPages = Math.ceil(totalItems / pageSize) || 1;
		const paginatedItems = filtered.slice(
			(currentPage - 1) * pageSize,
			currentPage * pageSize,
		);

		res.json({
			items: paginatedItems,
			pagination: { totalItems, totalPages, currentPage, pageSize },
			availableFilters,
		});
	} catch (error) {
		console.error("Lỗi lấy danh sách build (admin):", error);
		res.status(500).json({ error: "Không thể lấy danh sách build." });
	}
});

/**
 * POST /api/admin/builds
 */
router.post("/", authenticateCognitoToken, requireAdmin, async (req, res) => {
	const buildData = req.body;

	if (!buildData.championName?.trim()) {
		return res.status(400).json({ error: "Tên tướng là bắt buộc." });
	}

	const id = uuidv4();
	const newBuild = {
		...buildData,
		id,
		creator: req.user["cognito:username"],
		sub: req.user.sub,
		createdAt: new Date().toISOString(),
		views: 0,
		like: 0,
		display: buildData.display === true,
		star: Number(buildData.star || 0),
	};

	try {
		await client.send(
			new PutItemCommand({
				TableName: BUILDS_TABLE,
				Item: marshall(newBuild, { removeUndefinedValues: true }),
			}),
		);
		
		await createAuditLog({
			action: "CREATE",
			entityType: "build",
			entityId: id,
			entityName: `Build ${newBuild.championName} by ${newBuild.creator}`,
			oldData: null,
			newData: newBuild,
			user: req.user
		});

		adminBuildCache.del("admin_all_builds");
		if (newBuild.display) invalidatePublicBuildsCache();

		res.status(201).json({
			message: "Tạo build thành công",
			build: normalizeBuildFromDynamo(newBuild),
		});
	} catch (error) {
		console.error("Lỗi tạo build:", error);
		res.status(500).json({ error: "Không thể tạo build." });
	}
});

/**
 * PUT /api/admin/builds/:id
 */
router.put("/:id", authenticateCognitoToken, requireAdmin, async (req, res) => {
	const { id } = req.params;
	const updates = req.body;

	try {
		const { Item } = await client.send(
			new GetItemCommand({ TableName: BUILDS_TABLE, Key: marshall({ id }) }),
		);
		if (!Item) return res.status(404).json({ error: "Build không tồn tại." });

		const oldBuild = unmarshall(Item);
		const oldDisplay = oldBuild.display === true || oldBuild.display === "true";

		let updateExpression = "SET";
		const expressionAttributeNames = {};
		const expressionAttributeValues = {};

		const allowedFields = [
			"championName",
			"description",
			"relicSetIds",
			"powerIds",
			"runeIds",
			"star",
			"display",
			"like",
			"views",
			"regions",
		];

		let hasUpdates = false;
		Object.entries(updates).forEach(([key, value]) => {
			if (allowedFields.includes(key) && value !== undefined) {
				hasUpdates = true;
				const attrKey = `#${key}`;
				const valKey = `:${key}`;
				updateExpression += ` ${attrKey} = ${valKey},`;
				expressionAttributeNames[attrKey] = key;
				expressionAttributeValues[valKey] =
					key === "display" ? value === true : value;
			}
		});

		if (!hasUpdates)
			return res
				.status(400)
				.json({ error: "Không có trường nào hợp lệ để cập nhật." });

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

		await createAuditLog({
			action: "UPDATE",
			entityType: "build",
			entityId: id,
			entityName: `Build ${updatedBuild.championName} by ${updatedBuild.creator}`,
			oldData: oldBuild,
			newData: updatedBuild,
			user: req.user
		});

		adminBuildCache.del("admin_all_builds");
		if (oldDisplay || updatedBuild.display === true)
			invalidatePublicBuildsCache();

		res.json({ message: "Cập nhật thành công", build: updatedBuild });
	} catch (error) {
		console.error("Lỗi sửa build:", error);
		res.status(500).json({ error: "Không thể cập nhật build." });
	}
});

/**
 * DELETE /api/admin/builds/:id
 */
router.delete(
	"/:id",
	authenticateCognitoToken,
	requireAdmin,
	async (req, res) => {
		const { id } = req.params;
		try {
			const { Item } = await client.send(
				new GetItemCommand({ TableName: BUILDS_TABLE, Key: marshall({ id }) }),
			);
			if (!Item) return res.status(404).json({ error: "Build không tồn tại." });

			const build = unmarshall(Item);
			const wasPublic = build.display === true || build.display === "true";

			await client.send(
				new DeleteItemCommand({
					TableName: BUILDS_TABLE,
					Key: marshall({ id }),
				}),
			);

			await createAuditLog({
				action: "DELETE",
				entityType: "build",
				entityId: id,
				entityName: `Build ${build.championName} by ${build.creator}`,
				oldData: build,
				newData: null,
				user: req.user
			});

			adminBuildCache.del("admin_all_builds");
			if (wasPublic) invalidatePublicBuildsCache();

			res.json({ message: "Xóa build thành công" });
		} catch (error) {
			console.error("Lỗi xóa build:", error);
			res.status(500).json({ error: "Không thể xóa build." });
		}
	},
);

export default router;
