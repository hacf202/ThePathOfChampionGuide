// src/routes/comments.js

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
import { invalidatePublicBuildsCache } from "../utils/buildCache.js";

const router = express.Router();
const BUILDS_TABLE = "Builds";
const COMMENTS_TABLE = "Comments";

/**
 * @route   GET /api/builds/:buildId/comments
 * @desc    Lấy toàn bộ bình luận của một build cụ thể
 */
router.get("/:buildId/comments", async (req, res) => {
	const { buildId } = req.params;
	try {
		const command = new QueryCommand({
			TableName: COMMENTS_TABLE,
			IndexName: "buildId-index",
			KeyConditionExpression: "buildId = :buildId",
			ExpressionAttributeValues: marshall({ ":buildId": buildId }),
			ScanIndexForward: true,
		});
		const { Items } = await client.send(command);
		res.json(Items.map(unmarshall));
	} catch (error) {
		console.error("Error getting comments:", error);
		res.status(500).json({ error: "Could not retrieve comments" });
	}
});

/**
 * @route   POST /api/builds/:buildId/comments
 * @desc    Gửi bình luận (Hỗ trợ cả build cụ thể và 'global')
 */
router.post(
	"/:buildId/comments",
	authenticateCognitoToken,
	async (req, res) => {
		const { buildId } = req.params;
		const { content, parentId = null, replyToUsername = null } = req.body;

		if (!content) return res.status(400).json({ error: "Content required" });

		try {
			let build = null;
			if (buildId !== "global") {
				const { Item } = await client.send(
					new GetItemCommand({
						TableName: BUILDS_TABLE,
						Key: marshall({ id: buildId }),
					}),
				);
				if (!Item) return res.status(404).json({ error: "Build not found" });
				build = unmarshall(Item);
			}

			const comment = {
				id: uuidv4(),
				buildId: buildId,
				content,
				user_sub: req.user.sub,
				username: req.user["cognito:username"] || req.user.name || "Anonymous",
				createdAt: new Date().toISOString(),
				parentId,
				replyToUsername,
				type: "comment", // PK cho GSI createdAt-index
			};

			await client.send(
				new PutItemCommand({
					TableName: COMMENTS_TABLE,
					Item: marshall(comment),
				}),
			);

			if (build && build.display === true) {
				invalidatePublicBuildsCache();
			}

			res.status(201).json(comment);
		} catch (error) {
			console.error("Error posting comment:", error);
			res.status(500).json({ error: "Could not post comment" });
		}
	},
);

/**
 * @route   PUT /api/builds/:buildId/comments/:commentId
 * @desc    Cập nhật nội dung bình luận
 */
router.put(
	"/:buildId/comments/:commentId",
	authenticateCognitoToken,
	async (req, res) => {
		const { buildId, commentId } = req.params;
		const { content } = req.body;
		if (!content) return res.status(400).json({ error: "Content required" });

		try {
			const { Item } = await client.send(
				new GetItemCommand({
					TableName: COMMENTS_TABLE,
					Key: marshall({ buildId, id: commentId }),
				}),
			);
			if (!Item) return res.status(404).json({ error: "Comment not found" });

			const comment = unmarshall(Item);
			if (comment.user_sub !== req.user.sub) {
				return res.status(403).json({ error: "Unauthorized" });
			}

			const { Item: buildItem } = await client.send(
				new GetItemCommand({
					TableName: BUILDS_TABLE,
					Key: marshall({ id: buildId }),
				}),
			);
			const build = buildItem ? unmarshall(buildItem) : null;

			const { Attributes } = await client.send(
				new UpdateItemCommand({
					TableName: COMMENTS_TABLE,
					Key: marshall({ buildId, id: commentId }),
					UpdateExpression: "SET #content = :content, #updatedAt = :updatedAt",
					ExpressionAttributeNames: {
						"#content": "content",
						"#updatedAt": "updatedAt",
					},
					ExpressionAttributeValues: marshall({
						":content": content,
						":updatedAt": new Date().toISOString(),
					}),
					ReturnValues: "ALL_NEW",
				}),
			);

			if (build && build.display === true) invalidatePublicBuildsCache();

			res.json(unmarshall(Attributes));
		} catch (error) {
			console.error("Error updating comment:", error);
			res.status(500).json({ error: "Could not update comment" });
		}
	},
);

/**
 * @route   DELETE /api/builds/:buildId/comments/:commentId
 * @desc    Xóa bình luận (Chỉ chủ sở hữu)
 */
router.delete(
	"/:buildId/comments/:commentId",
	authenticateCognitoToken,
	async (req, res) => {
		const { buildId, commentId } = req.params;
		try {
			const { Item: buildItem } = await client.send(
				new GetItemCommand({
					TableName: BUILDS_TABLE,
					Key: marshall({ id: buildId }),
				}),
			);
			const build = buildItem ? unmarshall(buildItem) : null;

			await client.send(
				new DeleteItemCommand({
					TableName: COMMENTS_TABLE,
					Key: marshall({ buildId, id: commentId }),
					ConditionExpression: "user_sub = :user_sub",
					ExpressionAttributeValues: marshall({ ":user_sub": req.user.sub }),
				}),
			);

			if (build && build.display === true) invalidatePublicBuildsCache();

			res.json({ message: "Comment deleted" });
		} catch (error) {
			if (error.name === "ConditionalCheckFailedException") {
				return res.status(403).json({ error: "Unauthorized or not found" });
			}
			console.error("Error deleting comment:", error);
			res.status(500).json({ error: "Could not delete comment" });
		}
	},
);

/**
 * @route   GET /api/comments/latest
 * @desc    Lấy 10 bình luận gốc mới nhất kèm theo toàn bộ reply của chúng
 * @access  Public
 */
router.get("/latest", async (req, res) => {
	try {
		const { lastKey } = req.query;
		let exclusiveStartKey = lastKey
			? JSON.parse(decodeURIComponent(lastKey))
			: undefined;

		let rootComments = [];
		let lastEvaluatedKey = exclusiveStartKey;
		const ROOT_LIMIT = 10;

		// 1. Quét tìm đủ 10 bình luận gốc (parentId = null)
		while (rootComments.length < ROOT_LIMIT) {
			const command = new QueryCommand({
				TableName: COMMENTS_TABLE,
				IndexName: "createdAt-index",
				KeyConditionExpression: "#t = :v",
				ExpressionAttributeNames: { "#t": "type" },
				ExpressionAttributeValues: marshall({ ":v": "comment" }),
				ScanIndexForward: false,
				Limit: 50, // Quét rộng để lọc root
				ExclusiveStartKey: lastEvaluatedKey,
			});

			const { Items, LastEvaluatedKey } = await client.send(command);
			const batch = (Items || []).map(unmarshall);

			const roots = batch.filter(c => !c.parentId);
			rootComments.push(...roots);

			lastEvaluatedKey = LastEvaluatedKey;
			if (!lastEvaluatedKey || rootComments.length >= ROOT_LIMIT) break;
		}

		if (rootComments.length > ROOT_LIMIT) {
			rootComments = rootComments.slice(0, ROOT_LIMIT);
		}

		// 2. Lấy tất cả các Reply liên quan đến các root này
		const rootIds = rootComments.map(c => c.id);
		const buildIdsOfRoots = [...new Set(rootComments.map(c => c.buildId))];
		let allCommentsToReturn = [...rootComments];

		if (buildIdsOfRoots.length > 0) {
			const repliesPromises = buildIdsOfRoots.map(async bId => {
				const cmd = new QueryCommand({
					TableName: COMMENTS_TABLE,
					IndexName: "buildId-index",
					KeyConditionExpression: "buildId = :bId",
					ExpressionAttributeValues: marshall({ ":bId": bId }),
				});
				const { Items } = await client.send(cmd);
				return (Items || []).map(unmarshall);
			});

			const results = await Promise.all(repliesPromises);
			const potentialReplies = results.flat();

			// Chỉ lấy những reply thuộc về các root đang hiển thị
			const validReplies = potentialReplies.filter(
				c => c.parentId && rootIds.includes(c.parentId),
			);

			// Gộp và loại bỏ trùng lặp
			const uniqueReplies = validReplies.filter(
				r => !allCommentsToReturn.find(a => a.id === r.id),
			);
			allCommentsToReturn.push(...uniqueReplies);
		}

		// 3. Truy vấn ChampionName cho các buildId (trừ 'global')
		const uniqueBuildIds = [
			...new Set(
				allCommentsToReturn
					.filter(c => c.buildId !== "global")
					.map(c => c.buildId),
			),
		];
		const buildMap = {};

		if (uniqueBuildIds.length > 0) {
			await Promise.all(
				uniqueBuildIds.map(async id => {
					try {
						const { Item } = await client.send(
							new GetItemCommand({
								TableName: BUILDS_TABLE,
								Key: marshall({ id }),
							}),
						);
						if (Item) buildMap[id] = unmarshall(Item).championName;
					} catch (e) {
						console.error(`Error for build ${id}`, e);
					}
				}),
			);
		}

		// 4. Chuẩn hóa dữ liệu trả về
		const finalData = allCommentsToReturn.map(c => ({
			...c,
			championName:
				c.buildId === "global" ? null : buildMap[c.buildId] || "Unknown Build",
		}));

		res.json({
			comments: finalData,
			nextKey: lastEvaluatedKey
				? encodeURIComponent(JSON.stringify(lastEvaluatedKey))
				: null,
		});
	} catch (error) {
		console.error("Lỗi lấy bình luận:", error);
		res.status(500).json({ error: "Không thể lấy danh sách bình luận." });
	}
});

export default router;
