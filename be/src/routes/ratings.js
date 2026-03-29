// be/src/routes/ratings.js
import express from "express";
import {
	PutItemCommand,
	GetItemCommand,
	QueryCommand,
	DeleteItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import client from "../config/db.js";
import { authenticateCognitoToken } from "../middleware/authenticate.js";
import { championCache } from "./champions.js";

const router = express.Router();
const RATINGS_TABLE = "guidePocPlayStyleRating";

/**
 * @route   GET /api/ratings/:championID
 * @desc    Lấy tất cả đánh giá của một tướng
 */
router.get("/:championID", async (req, res) => {
	const { championID } = req.params;
	try {
		const command = new QueryCommand({
			TableName: RATINGS_TABLE,
			KeyConditionExpression: "championID = :cid",
			ExpressionAttributeValues: marshall({ ":cid": championID }),
		});

		const { Items } = await client.send(command);
		const ratings = Items ? Items.map(item => unmarshall(item)) : [];

		res.json(ratings);
	} catch (error) {
		console.error("Lỗi khi lấy danh sách đánh giá (Detailed):", error);
		res.status(500).json({ error: "Không thể lấy dữ liệu đánh giá." });
	}
});

/**
 * @route   GET /api/ratings/:championID/my
 * @desc    Lấy đánh giá của bản thân cho tướng này
 */
router.get("/:championID/my", authenticateCognitoToken, async (req, res) => {
	const { championID } = req.params;
	const userSub = req.user.sub;

	try {
		const command = new GetItemCommand({
			TableName: RATINGS_TABLE,
			Key: marshall({ championID, userSub }),
		});

		const { Item } = await client.send(command);
		if (!Item) {
			return res.json(null);
		}

		res.json(unmarshall(Item));
	} catch (error) {
		console.error("Lỗi khi lấy đánh giá cá nhân (Detailed):", error);
		res.status(500).json({ error: "Lỗi hệ thống." });
	}
});

/**
 * @route   POST /api/ratings/:championID
 * @desc    Gửi hoặc cập nhật đánh giá cho tướng
 */
router.post("/:championID", authenticateCognitoToken, async (req, res) => {
	const { championID } = req.params;
	const { ratings, comment } = req.body;
	const userSub = req.user.sub;
	const username = req.user["cognito:username"] || req.user.name || "Anonymous";

	if (!ratings || typeof ratings !== "object") {
		return res.status(400).json({ error: "Dữ liệu đánh giá không hợp lệ." });
	}

	// Kiểm tra đầy đủ 6 chỉ số
	const requiredStats = [
		"damage",
		"defense",
		"speed",
		"consistency",
		"synergy",
		"independence",
	];
	for (const stat of requiredStats) {
		if (typeof ratings[stat] !== "number" || ratings[stat] < 1 || ratings[stat] > 10) {
			return res.status(400).json({ error: `Chỉ số ${stat} phải từ 1 đến 10.` });
		}
	}

	try {
		const ratingData = {
			championID,
			userSub,
			username,
			ratings,
			comment: comment || "",
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		const command = new PutItemCommand({
			TableName: RATINGS_TABLE,
			Item: marshall(ratingData),
		});

		await client.send(command);
		
		// Xóa cache của tướng này để cập nhật lại điểm trung bình mới
		const CACHE_KEY = `champion_detail_${championID}`;
		championCache.del(CACHE_KEY);

		res.json({ message: "Đánh giá của bạn đã được lưu.", rating: ratingData });
	} catch (error) {
		console.error("Lỗi khi lưu đánh giá (Detailed):", error);
		res.status(500).json({ error: "Không thể lưu đánh giá." });
	}
});

export default router;
