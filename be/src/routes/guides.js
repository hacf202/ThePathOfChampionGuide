import express from "express";
import {
	GetItemCommand,
	ScanCommand,
	PutItemCommand,
	DeleteItemCommand,
	UpdateItemCommand, // Đảm bảo đã import UpdateItemCommand
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import NodeCache from "node-cache"; // Đảm bảo đã cài đặt npm install node-cache

import client from "../config/db.js";
import { authenticateCognitoToken } from "../middleware/authenticate.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = express.Router();
const GUIDES_TABLE = "guidePocGuideList";

// Khởi tạo Cache: TTL (Time to live) là 600 giây (10 phút)
const cache = new NodeCache({ stdTTL: 600 });
const CACHE_KEY_LIST = "all_guides"; // Key định danh cho danh sách guide

// Hàm tạo key cho từng bài viết chi tiết
const getDetailCacheKey = slug => `guide_${slug}`;

// ==========================================
// PUBLIC ROUTES
// ==========================================

/**
 * @route   GET /api/guides
 * @desc    Lấy danh sách (CÓ CACHE)
 */
router.get("/", async (req, res) => {
	try {
		// 1. Kiểm tra Cache trước
		if (cache.has(CACHE_KEY_LIST)) {
			// console.log("Hit cache: getting guides list from memory");
			return res.status(200).json(cache.get(CACHE_KEY_LIST));
		}

		// 2. Nếu không có cache, gọi DynamoDB
		const command = new ScanCommand({ TableName: GUIDES_TABLE });
		const { Items } = await client.send(command);

		const guides = Items.map(item => unmarshall(item));

		const responseData = {
			success: true,
			count: guides.length,
			data: guides,
		};

		// 3. Lưu kết quả vào Cache
		cache.set(CACHE_KEY_LIST, responseData);

		res.status(200).json(responseData);
	} catch (error) {
		console.error("Error fetching guides:", error);
		res
			.status(500)
			.json({ success: false, message: "Lỗi Server khi lấy danh sách guide." });
	}
});

/**
 * @route   GET /api/guides/:slug
 * @desc    Lấy chi tiết (CACHE CHẶT - Chỉ tăng view khi hết cache)
 */
router.get("/:slug", async (req, res) => {
	const { slug } = req.params;
	const cacheKey = getDetailCacheKey(slug);

	try {
		// 1. KIỂM TRA CACHE
		if (cache.has(cacheKey)) {
			// console.log(`Hit cache for ${slug}. No view increment.`);
			// Nếu có trong cache -> Trả về luôn và KHÔNG gọi DB để tăng view
			return res.status(200).json({
				success: true,
				data: cache.get(cacheKey),
			});
		}

		// 2. NẾU KHÔNG CÓ CACHE (Cache Miss) -> Gọi DB, Tăng view, Lưu Cache
		const params = {
			TableName: GUIDES_TABLE,
			Key: marshall({ slug: slug }),
			// Tăng view + 1
			UpdateExpression: "SET #views = if_not_exists(#views, :start) + :inc",
			ExpressionAttributeNames: { "#views": "views" },
			ExpressionAttributeValues: marshall({ ":inc": 1, ":start": 0 }),
			// Điều kiện: Chỉ update nếu slug đã tồn tại
			ConditionExpression: "attribute_exists(slug)",
			// Trả về dữ liệu mới nhất sau khi tăng view
			ReturnValues: "ALL_NEW",
		};

		const command = new UpdateItemCommand(params);
		const { Attributes } = await client.send(command);
		const guide = unmarshall(Attributes);

		// 3. Lưu vào Cache
		cache.set(cacheKey, guide);

		res.status(200).json({
			success: true,
			data: guide,
		});
	} catch (error) {
		if (error.name === "ConditionalCheckFailedException") {
			return res
				.status(404)
				.json({ success: false, message: "Không tìm thấy bài viết." });
		}
		console.error(`Error guide detail ${slug}:`, error);
		res.status(500).json({ success: false, message: "Lỗi Server." });
	}
});

// ==========================================
// ADMIN ROUTES (Cần xóa Cache khi thay đổi)
// ==========================================

/**
 * @route   POST /api/guides
 * @desc    Tạo mới -> Xóa cache list
 */
router.post("/", authenticateCognitoToken, requireAdmin, async (req, res) => {
	try {
		const guideData = req.body;
		if (!guideData.slug || !guideData.title) {
			return res
				.status(400)
				.json({ success: false, message: "Thiếu thông tin bắt buộc." });
		}

		// Check trùng slug
		const checkParams = {
			TableName: GUIDES_TABLE,
			Key: marshall({ slug: guideData.slug }),
		};
		const checkExisting = await client.send(new GetItemCommand(checkParams));
		if (checkExisting.Item) {
			return res
				.status(400)
				.json({ success: false, message: "Slug đã tồn tại." });
		}

		const preparedData = {
			...guideData,
			publishedDate: guideData.publishedDate || new Date().toISOString(),
			updateDate: guideData.updateDate || new Date().toISOString(),
			views: 0, // Khởi tạo view
		};

		const params = {
			TableName: GUIDES_TABLE,
			Item: marshall(preparedData, { removeUndefinedValues: true }),
		};

		await client.send(new PutItemCommand(params));

		// XÓA CACHE: Chỉ cần xóa list
		cache.del(CACHE_KEY_LIST);

		res.status(201).json({
			success: true,
			message: "Tạo guide thành công",
			data: preparedData,
		});
	} catch (error) {
		console.error("Error creating guide:", error);
		res
			.status(500)
			.json({ success: false, message: "Lỗi Server khi tạo guide." });
	}
});

/**
 * @route   PUT /api/guides/:slug
 * @desc    Cập nhật -> Xóa cache list VÀ cache detail
 */
router.put(
	"/:slug",
	authenticateCognitoToken,
	requireAdmin,
	async (req, res) => {
		try {
			const { slug } = req.params;
			const guideData = req.body;
			guideData.slug = slug;
			guideData.updateDate = new Date().toISOString();

			// Update Item
			const params = {
				TableName: GUIDES_TABLE,
				Item: marshall(guideData, { removeUndefinedValues: true }),
			};

			await client.send(new PutItemCommand(params));

			// XÓA CACHE: Xóa cả 2 để user thấy nội dung mới update
			cache.del(CACHE_KEY_LIST);
			cache.del(getDetailCacheKey(slug));

			res.status(200).json({
				success: true,
				message: "Cập nhật guide thành công",
				data: guideData,
			});
		} catch (error) {
			console.error(`Error updating guide ${req.params.slug}:`, error);
			res
				.status(500)
				.json({ success: false, message: "Lỗi Server khi cập nhật guide." });
		}
	}
);

/**
 * @route   DELETE /api/guides/:slug
 * @desc    Xóa -> Xóa cache list VÀ cache detail
 */
router.delete(
	"/:slug",
	authenticateCognitoToken,
	requireAdmin,
	async (req, res) => {
		try {
			const { slug } = req.params;
			const params = {
				TableName: GUIDES_TABLE,
				Key: marshall({ slug: slug }),
			};

			await client.send(new DeleteItemCommand(params));

			// XÓA CACHE
			cache.del(CACHE_KEY_LIST);
			cache.del(getDetailCacheKey(slug));

			res.status(200).json({
				success: true,
				message: `Đã xóa guide: ${slug}`,
			});
		} catch (error) {
			console.error(`Error deleting guide ${req.params.slug}:`, error);
			res
				.status(500)
				.json({ success: false, message: "Lỗi Server khi xóa guide." });
		}
	}
);

export default router;
