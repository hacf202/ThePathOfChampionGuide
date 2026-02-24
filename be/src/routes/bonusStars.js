// src/routes/bonusStars.js
import express from "express";
import {
	ScanCommand,
	PutItemCommand,
	DeleteItemCommand,
	GetItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import client from "../config/db.js";
import NodeCache from "node-cache";
import { authenticateCognitoToken } from "../middleware/authenticate.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = express.Router();
const BONUS_STAR_TABLE = "guidePocBonusStar";
const bonusCache = new NodeCache({ stdTTL: 120, checkperiod: 60 });

/**
 * @route   GET /api/bonusStars
 * @desc    Lấy danh sách tất cả Bonus Star
 */
router.get("/", async (req, res) => {
	const CACHE_KEY = "all_bonus_stars_list";
	try {
		const cached = bonusCache.get(CACHE_KEY);
		if (cached) return res.json({ items: cached });

		const command = new ScanCommand({ TableName: BONUS_STAR_TABLE });
		const { Items } = await client.send(command);
		const data = Items ? Items.map(item => unmarshall(item)) : [];
		data.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

		bonusCache.set(CACHE_KEY, data);
		res.json({ items: data });
	} catch (error) {
		res.status(500).json({ error: "Lỗi hệ thống." });
	}
});

/**
 * @route   PUT /api/bonusStars
 * @desc    Cập nhật hoặc tạo mới Bonus Star (Admin)
 */
router.put("/", authenticateCognitoToken, requireAdmin, async (req, res) => {
	const data = req.body;
	if (!data.bonusStarID || !data.name) {
		return res.status(400).json({ error: "bonusStarID và name là bắt buộc." });
	}
	try {
		const command = new PutItemCommand({
			TableName: BONUS_STAR_TABLE,
			Item: marshall(data, { removeUndefinedValues: true }),
		});
		await client.send(command);
		bonusCache.flushAll();
		res.json({ message: "Cập nhật Bonus Star thành công.", data });
	} catch (error) {
		res.status(500).json({ error: "Không thể lưu dữ liệu." });
	}
});

/**
 * @route   DELETE /api/bonusStars/:bonusStarID
 * @desc    Xóa Bonus Star (Admin)
 */
router.delete(
	"/:bonusStarID",
	authenticateCognitoToken,
	requireAdmin,
	async (req, res) => {
		const { bonusStarID } = req.params;
		try {
			const command = new DeleteItemCommand({
				TableName: BONUS_STAR_TABLE,
				Key: marshall({ bonusStarID }),
			});
			await client.send(command);
			bonusCache.flushAll();
			res.json({ message: "Đã xóa Bonus Star thành công." });
		} catch (error) {
			res.status(500).json({ error: "Lỗi khi xóa." });
		}
	},
);

export default router;
