// be/src/routes/ratings.js
import express from "express";
import {
	PutItemCommand,
	GetItemCommand,
	QueryCommand,
	DeleteItemCommand,
	ScanCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import client from "../config/db.js";
import { authenticateCognitoToken } from "../middleware/authenticate.js";
import cacheManager from "../utils/cacheManager.js";
import { syncChampionCommunityRatings } from "../utils/ratingUtils.js";
import { getCachedChampions } from "./champions.js";

const championCache = cacheManager.getOrCreateCache("champions");

const router = express.Router();
const RATINGS_TABLE = "guidePocPlayStyleRating";

/**
 * @route   GET /api/ratings
 * @desc    Lấy tất cả đánh giá của tất cả tướng (Sử dụng GSI để tối ưu Query)
 */
router.get("/", async (req, res) => {
	const { limit = 20, lastKey } = req.query;

	try {
		const command = new QueryCommand({
			TableName: RATINGS_TABLE,
			IndexName: "ReviewTypeCreatedAtIndex",
			KeyConditionExpression: "reviewType = :rt",
			ExpressionAttributeValues: marshall({ ":rt": "CHAMPION_REVIEW" }),
			ScanIndexForward: false, // Lấy mới nhất trước
			Limit: parseInt(limit),
			ExclusiveStartKey: lastKey ? marshall(JSON.parse(lastKey)) : undefined,
		});

		const { Items, LastEvaluatedKey } = await client.send(command);
		const ratings = Items ? Items.map(item => unmarshall(item)) : [];

		res.json({
			items: ratings,
			lastKey: LastEvaluatedKey ? JSON.stringify(unmarshall(LastEvaluatedKey)) : null
		});
	} catch (error) {
		console.error("Lỗi khi lấy danh sách đánh giá tổng hợp:", error);
		res.status(500).json({ error: "Không thể tải danh sách đánh giá." });
	}
});

/**
 * @route   GET /api/ratings/ranking/top
 * @desc    Lấy bảng xếp hạng Top Tướng dựa trên điểm trung bình từ đánh giá
 */
router.get("/ranking/top", async (req, res) => {
	try {
		// Tối ưu hóa: Lấy từ danh sách tướng đã có sẵn điểm trung bình (Cached/Denormalized)
		const allChampions = await getCachedChampions();
		
		const result = allChampions
			.filter(c => c.communityRatings && c.communityRatings.count > 0)
			.map(c => ({
				championID: c.championID,
				championName: c.name,
				championImage: c.assets?.[0]?.avatar || "",
				avgScore: c.communityRatings.damage, // Hoặc tính trung bình các chỉ số
				ratings: c.communityRatings, 
				// Tính điểm trung bình tổng quát (Dựa trên 6 chỉ số)
				overallScore: parseFloat((
					(c.communityRatings.damage + 
					 c.communityRatings.defense + 
					 c.communityRatings.speed + 
					 c.communityRatings.consistency + 
					 c.communityRatings.synergy + 
					 c.communityRatings.independence) / 6
				).toFixed(2))
			}))
			.sort((a, b) => b.overallScore - a.overallScore)
			.slice(0, 10); // Lấy Top 10

		res.json(result);
	} catch (error) {
		console.error("Lỗi khi lấy bảng xếp hạng tối ưu:", error);
		res.status(500).json({ error: "Không thể tải bảng xếp hạng." });
	}
});

/**
 * @route   GET /api/ratings/:championID
 * @desc    Lấy tất cả đánh giá của một tướng cụ thể
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
		// 1. Lấy thông tin tướng để nhúng vào đánh giá (De-normalization)
		const champCommand = new GetItemCommand({
			TableName: "guidePocChampionList",
			Key: marshall({ championID }),
		});
		const { Item: champItem } = await client.send(champCommand);
		const champion = champItem ? unmarshall(champItem) : null;

		const ratingData = {
			championID,
			userSub,
			username,
			ratings,
			comment: comment || "",
			reviewType: "CHAMPION_REVIEW", // Cần cho GSI
			championName: champion ? champion.name : championID,
			championImage: champion?.assets?.[0]?.avatar || "", 
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		const command = new PutItemCommand({
			TableName: RATINGS_TABLE,
			Item: marshall(ratingData, { removeUndefinedValues: true }),
		});

		await client.send(command);
		
		// 3. ĐỒNG BỘ: Tính toán lại và cập nhật điểm trung bình vào ChampionList (Denormalization)
		await syncChampionCommunityRatings(championID);

		res.json({ message: "Đánh giá của bạn đã được lưu.", rating: ratingData });
	} catch (error) {
		console.error("Lỗi khi lưu đánh giá (Detailed):", error);
		res.status(500).json({ error: "Không thể lưu đánh giá." });
	}
});

export default router;
