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
import NodeCache from "node-cache";
import client from "../config/db.js";
import { authenticateCognitoToken } from "../middleware/authenticate.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { normalizeBuildFromDynamo } from "../utils/dynamodb.js";
import { invalidatePublicBuildsCache } from "../utils/buildCache.js";
import { removeAccents } from "../utils/vietnameseUtils.js";

const router = express.Router();
const BUILDS_TABLE = "Builds";

// Cache dành riêng cho Admin (60 giây) để giảm tải Scan khi quản lý
const adminBuildCache = new NodeCache({ stdTTL: 60, checkperiod: 30 });

/**
 * Hàm lấy toàn bộ build cho Admin (bao gồm cả ẩn và hiện)
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

		// Mặc định sắp xếp theo ngày tạo mới nhất
		cachedData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

		adminBuildCache.set(CACHE_KEY, cachedData);
	}
	return cachedData;
}

/**
 * GET /api/admin/builds – LẤY TẤT CẢ (Kèm Phân trang, Lọc, Tìm kiếm)
 */
router.get("/", authenticateCognitoToken, requireAdmin, async (req, res) => {
	try {
		const {
			page = 1,
			limit = 20,
			searchTerm = "",
			championNames = "",
			creators = "",
			display = "", // "true" hoặc "false"
			sort = "createdAt-desc",
		} = req.query;

		const pageSize = parseInt(limit);
		const currentPage = parseInt(page);

		// 1. Lấy dữ liệu từ Cache Admin
		const allBuilds = await getAllBuildsAdmin();

		// 2. Trích xuất bộ lọc động cho giao diện Admin
		const availableFilters = {
			championNames: [...new Set(allBuilds.map(b => b.championName))].sort(),
			creators: [...new Set(allBuilds.map(b => b.creator))].sort(),
			displayStatus: ["true", "false"],
		};

		// 3. Lọc dữ liệu
		let filtered = [...allBuilds];

		if (searchTerm) {
			const searchKey = removeAccents(searchTerm);
			filtered = filtered.filter(
				b =>
					removeAccents(b.championName || "").includes(searchKey) ||
					removeAccents(b.creator || "").includes(searchKey) ||
					removeAccents(b.id || "").includes(searchKey),
			);
		}

		if (championNames) {
			const cList = championNames.split(",");
			filtered = filtered.filter(b => cList.includes(b.championName));
		}

		if (creators) {
			const crList = creators.split(",");
			filtered = filtered.filter(b => crList.includes(b.creator));
		}

		if (display) {
			const isDisplay = display === "true";
			filtered = filtered.filter(b => b.display === isDisplay);
		}

		// 4. Sắp xếp
		const [field, order] = sort.split("-");
		filtered.sort((a, b) => {
			let vA = a[field] ?? "";
			let vB = b[field] ?? "";

			if (field === "createdAt") {
				return order === "asc"
					? new Date(vA) - new Date(vB)
					: new Date(vB) - new Date(vA);
			}
			return order === "asc"
				? vA.toString().localeCompare(vB.toString())
				: vB.toString().localeCompare(vA.toString());
		});

		// 5. Phân trang
		const totalItems = filtered.length;
		const totalPages = Math.ceil(totalItems / pageSize);
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
 * POST /api/admin/builds – TẠO MỚI
 */
router.post("/", authenticateCognitoToken, requireAdmin, async (req, res) => {
	const buildData = req.body;

	if (!buildData.championName?.trim()) {
		return res.status(400).json({ error: "Tên tướng là bắt buộc." });
	}

	const id = Date.now().toString();
	const newBuild = {
		id,
		...buildData,
		creator: req.user["cognito:username"],
		sub: req.user.sub,
		createdAt: new Date().toISOString(),
		views: 0,
		like: 0,
		display: buildData.display === true,
	};

	try {
		await client.send(
			new PutItemCommand({
				TableName: BUILDS_TABLE,
				Item: marshall(newBuild, { removeUndefinedValues: true }),
			}),
		);

		// Xóa cả 2 cache
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
 * PUT /api/admin/builds/:id – SỬA
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
		const oldDisplay = oldBuild.display === "true" || oldBuild.display === true;

		let updateExpression = "SET";
		const expressionAttributeNames = {};
		const expressionAttributeValues = {};
		const allowedFields = [
			"championName",
			"description",
			"relicSet",
			"powers",
			"rune",
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
					key === "display" ? (value ? "true" : "false") : value;
			}
		});

		if (!hasUpdates)
			return res
				.status(400)
				.json({ error: "Không có trường nào để cập nhật." });

		updateExpression = updateExpression.slice(0, -1);
		const command = new UpdateItemCommand({
			TableName: BUILDS_TABLE,
			Key: marshall({ id }),
			UpdateExpression: updateExpression,
			ExpressionAttributeNames: expressionAttributeNames,
			ExpressionAttributeValues: marshall(expressionAttributeValues),
			ReturnValues: "ALL_NEW",
		});

		const { Attributes } = await client.send(command);
		const updatedBuild = normalizeBuildFromDynamo(unmarshall(Attributes));

		// Làm mới cache
		adminBuildCache.del("admin_all_builds");
		const newDisplay = updatedBuild.display === true;
		if (oldDisplay || newDisplay) invalidatePublicBuildsCache();

		res.json({ message: "Cập nhật thành công", build: updatedBuild });
	} catch (error) {
		console.error("Lỗi sửa build:", error);
		res.status(500).json({ error: "Không thể cập nhật build." });
	}
});

/**
 * DELETE /api/admin/builds/:id – XÓA
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

			const wasPublic = unmarshall(Item).display === "true";

			await client.send(
				new DeleteItemCommand({
					TableName: BUILDS_TABLE,
					Key: marshall({ id }),
				}),
			);

			// Làm mới cache
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
