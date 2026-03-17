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
 */
router.get("/builds/:buildId/comments", async (req, res) => {
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
		res.json(Items ? Items.map(unmarshall) : []);
	} catch (error) {
		console.error("Error getting comments:", error);
		res.status(500).json({ error: "Could not retrieve comments" });
	}
});

/**
 * @route   POST /api/builds/:buildId/comments
 */
router.post(
	"/builds/:buildId/comments",
	authenticateCognitoToken,
	async (req, res) => {
		const { buildId } = req.params;
		const {
			content,
			parentId = null,
			replyToUsername = null,
			championName = null,
		} = req.body;

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
				if (Item) build = unmarshall(Item);
			}

			const comment = {
				id: uuidv4(),
				buildId: buildId,
				content: content.trim(),
				sub: req.user.sub, // Lưu thống nhất vào trường 'sub'
				username: req.user["cognito:username"] || req.user.name || "Anonymous",
				createdAt: new Date().toISOString(),
				parentId,
				replyToUsername,
				championName: championName || (build ? build.championName : null),
				type: "comment",
			};

			await client.send(
				new PutItemCommand({
					TableName: COMMENTS_TABLE,
					Item: marshall(comment),
				}),
			);

			if (build && build.display === true) invalidatePublicBuildsCache();

			res.status(201).json(comment);
		} catch (error) {
			console.error("Error posting comment:", error);
			res.status(500).json({ error: "Could not post comment" });
		}
	},
);

/**
 * @route   GET /api/comments/latest
 */
router.get("/comments/latest", async (req, res) => {
	try {
		const { lastKey } = req.query;
		let exclusiveStartKey = lastKey
			? JSON.parse(decodeURIComponent(lastKey))
			: undefined;

		let rootComments = [];
		let lastEvaluatedKey = exclusiveStartKey;
		const ROOT_LIMIT = 10;

		while (rootComments.length < ROOT_LIMIT) {
			const command = new QueryCommand({
				TableName: COMMENTS_TABLE,
				IndexName: "createdAt-index",
				KeyConditionExpression: "#t = :v",
				ExpressionAttributeNames: { "#t": "type" },
				ExpressionAttributeValues: marshall({ ":v": "comment" }),
				ScanIndexForward: false,
				Limit: 50,
				ExclusiveStartKey: lastEvaluatedKey,
			});

			const { Items, LastEvaluatedKey } = await client.send(command);
			const batch = (Items || []).map(unmarshall);
			const roots = batch.filter(c => !c.parentId);
			rootComments.push(...roots);

			lastEvaluatedKey = LastEvaluatedKey;
			if (!lastEvaluatedKey || rootComments.length >= ROOT_LIMIT) break;
		}

		if (rootComments.length > ROOT_LIMIT)
			rootComments = rootComments.slice(0, ROOT_LIMIT);

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
			const rootIds = rootComments.map(c => c.id);
			const validReplies = potentialReplies.filter(
				c => c.parentId && rootIds.includes(c.parentId),
			);

			allCommentsToReturn.push(
				...validReplies.filter(
					r => !allCommentsToReturn.find(a => a.id === r.id),
				),
			);
		}

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
					const { Item } = await client.send(
						new GetItemCommand({
							TableName: BUILDS_TABLE,
							Key: marshall({ id }),
						}),
					);
					if (Item) buildMap[id] = unmarshall(Item).championName;
				}),
			);
		}

		res.json({
			comments: allCommentsToReturn.map(c => ({
				...c,
				championName:
					c.buildId === "global"
						? null
						: buildMap[c.buildId] || "Unknown Build",
			})),
			nextKey: lastEvaluatedKey
				? encodeURIComponent(JSON.stringify(lastEvaluatedKey))
				: null,
		});
	} catch (error) {
		console.error("Latest comments error:", error);
		res.status(500).json({ error: "Could not fetch latest comments" });
	}
});

/**
 * @route   PUT /api/comments/:commentId
 */
router.put(
	"/comments/:commentId",
	authenticateCognitoToken,
	async (req, res) => {
		const { commentId } = req.params;
		const { content, buildId } = req.body;

		if (!content || !buildId)
			return res.status(400).json({ error: "Missing content or buildId" });

		try {
			const { Attributes } = await client.send(
				new UpdateItemCommand({
					TableName: COMMENTS_TABLE,
					Key: marshall({ buildId, id: commentId }),
					// Kiểm tra quyền: Hỗ trợ cả trường 'sub' cũ và mới
					ConditionExpression:
						"attribute_exists(id) AND (#s = :userSub OR user_sub = :userSub)",
					UpdateExpression: "SET content = :c, isEdited = :e, updatedAt = :u",
					ExpressionAttributeNames: { "#s": "sub" },
					ExpressionAttributeValues: marshall({
						":c": content.trim(),
						":e": true,
						":u": new Date().toISOString(),
						":userSub": req.user.sub,
					}),
					ReturnValues: "ALL_NEW",
				}),
			);

			invalidatePublicBuildsCache();
			res.json(unmarshall(Attributes));
		} catch (error) {
			console.error("Update error:", error);
			if (error.name === "ConditionalCheckFailedException") {
				return res
					.status(403)
					.json({ error: "Unauthorized or Comment not found" });
			}
			res.status(500).json({ error: "Update failed" });
		}
	},
);

/**
 * @route   DELETE /api/comments/:commentId
 */
router.delete(
	"/comments/:commentId",
	authenticateCognitoToken,
	async (req, res) => {
		const { commentId } = req.params;
		const { buildId } = req.query;

		if (!buildId) return res.status(400).json({ error: "buildId is required" });

		try {
			await client.send(
				new DeleteItemCommand({
					TableName: COMMENTS_TABLE,
					Key: marshall({ buildId, id: commentId }),
					// Kiểm tra quyền: Hỗ trợ cả trường 'sub' cũ và mới
					ConditionExpression:
						"attribute_exists(id) AND (#s = :userSub OR user_sub = :userSub)",
					ExpressionAttributeNames: { "#s": "sub" },
					ExpressionAttributeValues: marshall({ ":userSub": req.user.sub }),
				}),
			);

			invalidatePublicBuildsCache();
			res.json({ message: "Deleted" });
		} catch (error) {
			console.error("Delete error details:", error);
			if (error.name === "ConditionalCheckFailedException") {
				return res
					.status(403)
					.json({ error: "Unauthorized or Comment not found" });
			}
			res.status(500).json({ error: "Delete failed" });
		}
	},
);

export default router;
