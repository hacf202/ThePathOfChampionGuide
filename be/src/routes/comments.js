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

// GET /api/builds/:buildId/comments
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
			// Kiểm tra nếu là bình luận global thì bỏ qua bước check Build tồn tại
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
				buildId: buildId, // Sẽ lưu là 'global' hoặc buildId thực tế
				content,
				user_sub: req.user.sub,
				username: req.user["cognito:username"] || req.user.name || "Anonymous",
				createdAt: new Date().toISOString(),
				parentId,
				replyToUsername,
				type: "comment", // Dùng để Query GSI 100 bình luận mới nhất
			};

			await client.send(
				new PutItemCommand({
					TableName: COMMENTS_TABLE,
					Item: marshall(comment),
				}),
			);

			// Chỉ invalidate cache nếu là bình luận của một build đang hiển thị công khai
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

// PUT /api/builds/:buildId/comments/:commentId
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

// DELETE /api/builds/:buildId/comments/:commentId
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
 * @desc    Lấy 100 bình luận mới nhất trên toàn hệ thống sử dụng GSI
 * @access  Public
 */
router.get("/latest", async (req, res) => {
	try {
		const command = new QueryCommand({
			TableName: COMMENTS_TABLE,
			IndexName: "createdAt-index", // Tên Index bạn đã tạo
			KeyConditionExpression: "#t = :v",
			ExpressionAttributeNames: {
				"#t": "type", // Partition Key của GSI
			},
			ExpressionAttributeValues: marshall({
				":v": "comment", // Giá trị chung để nhóm dữ liệu
			}),
			ScanIndexForward: false, // Lấy dữ liệu mới nhất (Z -> A)
			Limit: 100, // Giới hạn 100 bản ghi
		});

		const { Items } = await client.send(command);
		const comments = Items ? Items.map(item => unmarshall(item)) : [];

		res.json(comments);
	} catch (error) {
		console.error("Lỗi lấy bình luận mới nhất:", error);
		res.status(500).json({ error: "Không thể lấy danh sách bình luận mới." });
	}
});

export default router;
