// src/routes/favorites.js
import express from "express";
import {
	PutItemCommand,
	DeleteItemCommand,
	GetItemCommand,
	QueryCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

import client from "../config/db.js";
import { authenticateCognitoToken } from "../middleware/authenticate.js";
import { normalizeBuildFromDynamo } from "../utils/dynamodb.js";
import { invalidatePublicBuildsCache } from "../utils/buildCache.js";
import { removeAccents } from "../utils/vietnameseUtils.js";

const router = express.Router();
const BUILDS_TABLE = "Builds";
const FAVORITES_TABLE = "guidePocFavoriteBuilds";

/**
 * 1. LẤY DANH SÁCH FAVORITE (Có Phân trang, Lọc, Tìm kiếm)
 */
router.get("/favorites", authenticateCognitoToken, async (req, res) => {
	const userSub = req.user.sub;
	try {
		const {
			page = 1,
			limit = 24,
			searchTerm = "",
			championNames = "",
			sort = "favAt-desc",
		} = req.query;

		const pageSize = parseInt(limit);
		const currentPage = parseInt(page);

		// Lấy danh sách ID build đã thích từ FAVORITES_TABLE
		const { Items: favItems } = await client.send(
			new QueryCommand({
				TableName: FAVORITES_TABLE,
				IndexName: "user_sub-index",
				KeyConditionExpression: "user_sub = :userSub",
				ExpressionAttributeValues: marshall({ ":userSub": userSub }),
				ScanIndexForward: false, // Lấy cái mới nhất trước
			}),
		);

		if (!favItems || favItems.length === 0) {
			return res.json({
				items: [],
				pagination: { totalItems: 0, totalPages: 0, currentPage, pageSize },
				availableFilters: { championNames: [] },
			});
		}

		// Lấy chi tiết build từ BUILDS_TABLE
		const allBuilds = await Promise.all(
			favItems.map(async fItem => {
				const favData = unmarshall(fItem);
				const { Item } = await client.send(
					new GetItemCommand({
						TableName: BUILDS_TABLE,
						Key: marshall({ id: favData.id }),
					}),
				);
				if (!Item) return null;

				const build = normalizeBuildFromDynamo(unmarshall(Item));
				// Gắn thêm ngày Favorite để sắp xếp
				return { ...build, favAt: favData.createdAt };
			}),
		);

		let filtered = allBuilds.filter(Boolean);

		// A. Trích xuất bộ lọc động
		const availableFilters = {
			championNames: [...new Set(filtered.map(b => b.championName))].sort(),
		};

		// B. Tìm kiếm
		if (searchTerm) {
			const searchKey = removeAccents(searchTerm);
			filtered = filtered.filter(
				b =>
					removeAccents(b.championName || "").includes(searchKey) ||
					removeAccents(b.description || "").includes(searchKey),
			);
		}

		// C. Lọc theo tướng
		if (championNames) {
			const cList = championNames.split(",");
			filtered = filtered.filter(b => cList.includes(b.championName));
		}

		// D. Sắp xếp
		const [field, order] = sort.split("-");
		filtered.sort((a, b) => {
			let vA = a[field] ?? "";
			let vB = b[field] ?? "";
			if (field === "favAt" || field === "createdAt") {
				return order === "asc"
					? new Date(vA) - new Date(vB)
					: new Date(vB) - new Date(vA);
			}
			return order === "asc"
				? vA.toString().localeCompare(vB.toString())
				: vB.toString().localeCompare(vA.toString());
		});

		// E. Phân trang
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
		console.error("Error fetching favorites:", error);
		res.status(500).json({ error: "Could not fetch favorites" });
	}
});

/**
 * 2. TOGGLE FAVORITE
 */
router.patch("/:id/favorite", authenticateCognitoToken, async (req, res) => {
	const { id: buildId } = req.params;
	const userSub = req.user.sub;
	const username = req.user["cognito:username"] || "Anonymous";

	try {
		const { Item: buildItem } = await client.send(
			new GetItemCommand({
				TableName: BUILDS_TABLE,
				Key: marshall({ id: buildId }),
			}),
		);
		if (!buildItem) return res.status(404).json({ error: "Build not found" });

		const build = normalizeBuildFromDynamo(unmarshall(buildItem));

		// Kiểm tra trạng thái hiện tại (Dùng Query để tìm PK + SK)
		const { Items } = await client.send(
			new QueryCommand({
				TableName: FAVORITES_TABLE,
				KeyConditionExpression: "id = :buildId AND user_sub = :userSub",
				ExpressionAttributeValues: marshall({
					":buildId": buildId,
					":userSub": userSub,
				}),
			}),
		);

		let isFavorited = false;
		if (Items?.length > 0) {
			await client.send(
				new DeleteItemCommand({
					TableName: FAVORITES_TABLE,
					Key: marshall({ id: buildId, user_sub: userSub }),
				}),
			);
		} else {
			isFavorited = true;
			await client.send(
				new PutItemCommand({
					TableName: FAVORITES_TABLE,
					Item: marshall(
						{
							id: buildId,
							user_sub: userSub,
							username,
							championName: build.championName,
							creatorName: build.creatorName || "Vô Danh",
							createdAt: new Date().toISOString(),
						},
						{ removeUndefinedValues: true },
					),
				}),
			);
		}

		// Invalidate cache công khai để cập nhật số lượng yêu thích nếu cần
		if (build.display === true || build.display === "true") {
			invalidatePublicBuildsCache();
		}

		res.json({
			...build,
			isFavorited,
			message: isFavorited ? "Favorited" : "Unfavorited",
		});
	} catch (error) {
		console.error("Toggle favorite error:", error);
		res.status(500).json({ error: "Could not toggle favorite" });
	}
});

/**
 * 3. CHECK STATUS (Single)
 */
router.get(
	"/:id/favorite/status",
	authenticateCognitoToken,
	async (req, res) => {
		const { id: buildId } = req.params;
		const userSub = req.user.sub;
		try {
			const { Count } = await client.send(
				new QueryCommand({
					TableName: FAVORITES_TABLE,
					KeyConditionExpression: "id = :buildId AND user_sub = :userSub",
					ExpressionAttributeValues: marshall({
						":buildId": buildId,
						":userSub": userSub,
					}),
					Select: "COUNT",
				}),
			);
			res.json({ isFavorited: Count > 0 });
		} catch (error) {
			res.status(500).json({ error: "Error checking status" });
		}
	},
);

/**
 * 4. COUNT (Single)
 */
router.get("/:id/favorite/count", async (req, res) => {
	const { id: buildId } = req.params;
	try {
		const { Count } = await client.send(
			new QueryCommand({
				TableName: FAVORITES_TABLE,
				IndexName: "id-index",
				KeyConditionExpression: "id = :buildId",
				ExpressionAttributeValues: marshall({ ":buildId": buildId }),
				Select: "COUNT",
			}),
		);
		res.json({ count: Count || 0 });
	} catch (error) {
		res.json({ count: 0 });
	}
});

/**
 * 5. BATCH STATUS
 */
router.get("/favorites/batch", authenticateCognitoToken, async (req, res) => {
	const { ids } = req.query;
	const userSub = req.user.sub;

	if (!ids || !userSub) return res.json({});
	const buildIds = ids.split(",").filter(Boolean);
	if (buildIds.length === 0) return res.json({});

	try {
		const results = await Promise.all(
			buildIds.map(async buildId => {
				try {
					const { Count } = await client.send(
						new QueryCommand({
							TableName: FAVORITES_TABLE,
							KeyConditionExpression: "id = :buildId AND user_sub = :userSub",
							ExpressionAttributeValues: marshall({
								":buildId": buildId,
								":userSub": userSub,
							}),
							Select: "COUNT",
						}),
					);
					return { id: buildId, isFavorited: Count > 0 };
				} catch {
					return { id: buildId, isFavorited: false };
				}
			}),
		);

		const statusMap = Object.fromEntries(
			results.map(r => [r.id, r.isFavorited]),
		);
		res.setHeader("Cache-Control", "no-store");
		res.json(statusMap);
	} catch (error) {
		console.error("Batch error:", error);
		res.status(500).json({ error: "Batch failed" });
	}
});

/**
 * 6. BATCH COUNT
 */
router.get("/favorites/count/batch", async (req, res) => {
	const { ids } = req.query;
	if (!ids) return res.json({});

	const buildIds = ids.split(",").filter(Boolean);
	if (buildIds.length === 0) return res.json({});

	try {
		const results = await Promise.all(
			buildIds.map(async buildId => {
				try {
					const { Count } = await client.send(
						new QueryCommand({
							TableName: FAVORITES_TABLE,
							IndexName: "id-index",
							KeyConditionExpression: "id = :buildId",
							ExpressionAttributeValues: marshall({ ":buildId": buildId }),
							Select: "COUNT",
						}),
					);
					return { id: buildId, count: Count || 0 };
				} catch {
					return { id: buildId, count: 0 };
				}
			}),
		);

		const countMap = Object.fromEntries(results.map(r => [r.id, r.count]));
		res.json(countMap);
	} catch (error) {
		console.error("Batch count error:", error);
		res.status(500).json({ error: "Batch count failed" });
	}
});

export default router;
