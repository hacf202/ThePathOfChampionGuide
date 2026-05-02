// src/routes/comments.js
import express from "express";
import { getDb } from "../config/mongo.js";
import { authenticateCognitoToken } from "../middleware/authenticate.js";
import { invalidatePublicBuildsCache } from "../utils/buildCache.js";
import { getUserNames } from "../utils/userCache.js";

const router = express.Router();
const BUILDS_TABLE = "Builds";
const COMMENTS_TABLE = "Comments";

/**
 * @route   GET /api/builds/:buildId/comments
 */
router.get("/builds/:buildId/comments", async (req, res) => {
	const { buildId } = req.params;
	try {
		const db = getDb();
		let items = await db.collection(COMMENTS_TABLE)
			.find({ buildId })
			.sort({ createdAt: 1 })
			.toArray();

		// Làm giàu tên hiển thị
		if (items.length > 0) {
			const usernames = [...new Set(items.map(i => i.username))];
			const userMap = await getUserNames(usernames);
			items = items.map(item => ({
				...item,
				displayName: userMap[item.username] || item.username,
			}));
		}

		res.json(items);
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
			const db = getDb();
			let build = null;
			if (buildId !== "global") {
				const Item = await db.collection(BUILDS_TABLE).findOne({ id: buildId });
				if (Item) build = Item;
			}

			const comment = {
				id: uuidv4(),
				buildId: buildId,
				content: content.trim(),
				sub: req.user.sub, // Lưu thống nhất vào trường 'sub'
				username: req.user["cognito:username"] || "Anonymous",
				displayName: req.user.name || req.user["cognito:username"] || "Anonymous",
				createdAt: new Date().toISOString(),
				parentId,
				replyToUsername,
				championName: championName || (build ? build.championName : null),
				type: "comment",
			};

			await db.collection(COMMENTS_TABLE).insertOne(comment);

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

		const db = getDb();
		let rootComments = [];
		let lastEvaluatedKey = exclusiveStartKey;
		const ROOT_LIMIT = 24;

		while (rootComments.length < ROOT_LIMIT) {
			let query = db.collection(COMMENTS_TABLE).find({ type: "comment" }).sort({ createdAt: -1 }).limit(50);
			if (lastEvaluatedKey) {
				query = query.filter({ $and: [{ type: "comment" }, { createdAt: { $lt: lastEvaluatedKey.createdAt } }] });
			}

			const batch = await query.toArray();
			if (batch.length === 0) break;

			const roots = batch.filter(c => !c.parentId);
			rootComments.push(...roots);

			lastEvaluatedKey = batch[batch.length - 1];
			if (rootComments.length >= ROOT_LIMIT) break;
		}

		if (rootComments.length > ROOT_LIMIT)
			rootComments = rootComments.slice(0, ROOT_LIMIT);

		const buildIdsOfRoots = [...new Set(rootComments.map(c => c.buildId))];
		let allCommentsToReturn = [...rootComments];

		if (buildIdsOfRoots.length > 0) {
			const repliesPromises = buildIdsOfRoots.map(async bId => {
				return await db.collection(COMMENTS_TABLE).find({ buildId: bId }).toArray();
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
					const Item = await db.collection(BUILDS_TABLE).findOne({ id });
					if (Item) buildMap[id] = Item.championName;
				}),
			);
		}

		// Làm giàu tên hiển thị cho allCommentsToReturn
		if (allCommentsToReturn.length > 0) {
			const usernames = [...new Set(allCommentsToReturn.map(c => c.username))];
			const userMap = await getUserNames(usernames);
			allCommentsToReturn = allCommentsToReturn.map(item => ({
				...item,
				displayName: userMap[item.username] || item.username,
			}));
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
			const db = getDb();
			// Kiểm tra comment có tồn tại và thuộc quyền
			const existingComment = await db.collection(COMMENTS_TABLE).findOne({ id: commentId, buildId });
			if (!existingComment) {
				return res.status(403).json({ error: "Unauthorized or Comment not found" });
			}
			if (existingComment.sub !== req.user.sub && existingComment.user_sub !== req.user.sub) {
				return res.status(403).json({ error: "Unauthorized or Comment not found" });
			}

			const updatedComment = await db.collection(COMMENTS_TABLE).findOneAndUpdate(
				{ id: commentId, buildId },
				{ $set: { content: content.trim(), isEdited: true, updatedAt: new Date().toISOString() } },
				{ returnDocument: 'after' }
			);

			invalidatePublicBuildsCache();
			res.json(updatedComment);
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
			const db = getDb();
			const existingComment = await db.collection(COMMENTS_TABLE).findOne({ id: commentId, buildId });
			if (!existingComment || (existingComment.sub !== req.user.sub && existingComment.user_sub !== req.user.sub)) {
				return res.status(403).json({ error: "Unauthorized or Comment not found" });
			}

			await db.collection(COMMENTS_TABLE).deleteOne({ id: commentId, buildId });

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
