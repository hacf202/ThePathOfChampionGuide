import express from "express";
import {
	GetItemCommand,
	ScanCommand,
	PutItemCommand,
	DeleteItemCommand,
	UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import NodeCache from "node-cache";

import client from "../config/db.js";
import { authenticateCognitoToken } from "../middleware/authenticate.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = express.Router();
const GUIDES_TABLE = "guidePocGuideList";

// Khởi tạo Cache: TTL 10 phút
const cache = new NodeCache({ stdTTL: 600 });
const CACHE_KEY_LIST = "all_guides";

// Hàm tạo key cache cho chi tiết
const getDetailCacheKey = slug => `guide_${slug}`;

const getCurrentDate = () => {
	const date = new Date();
	const day = date.getDate().toString().padStart(2, "0"); // Thêm số 0 nếu < 10
	const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Tháng bắt đầu từ 0
	const year = date.getFullYear();
	return `${day}-${month}-${year}`;
};
// ==========================================
// PUBLIC ROUTES
// ==========================================

/**
 * @route   GET /api/guides
 * @desc    Lấy danh sách (CÓ CACHE)
 */
router.get("/", async (req, res) => {
	try {
		// 1. Kiểm tra Cache
		if (cache.has(CACHE_KEY_LIST)) {
			return res.status(200).json(cache.get(CACHE_KEY_LIST));
		}

		// 2. Gọi DynamoDB
		const command = new ScanCommand({ TableName: GUIDES_TABLE });
		const { Items } = await client.send(command);

		// Unmarshall dữ liệu từ định dạng DynamoDB sang JSON thường
		const guides = Items.map(item => unmarshall(item));

		const responseData = {
			success: true,
			count: guides.length,
			data: guides,
		};

		// 3. Lưu Cache
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
 * @desc    Lấy chi tiết (Tăng view + Cache chặt)
 */
router.get("/:slug", async (req, res) => {
	const { slug } = req.params;
	const cacheKey = getDetailCacheKey(slug);

	try {
		// 1. KIỂM TRA CACHE
		if (cache.has(cacheKey)) {
			return res.status(200).json({
				success: true,
				data: cache.get(cacheKey),
			});
		}

		// 2. GỌI DB & TĂNG VIEW
		// Lưu ý: Dữ liệu trong DB trường 'views' BẮT BUỘC phải là Number (N).
		// Nếu 'views' đang là String (S), lệnh này sẽ lỗi ValidationException.
		const params = {
			TableName: GUIDES_TABLE,
			Key: marshall({ slug: slug }),
			// Logic: views = views cũ + 1. Nếu chưa có views thì bắt đầu từ 0 + 1
			UpdateExpression: "SET #views = if_not_exists(#views, :start) + :inc",
			ExpressionAttributeNames: { "#views": "views" },
			ExpressionAttributeValues: marshall({
				":inc": 1,
				":start": 0,
			}),
			ConditionExpression: "attribute_exists(slug)",
			ReturnValues: "ALL_NEW",
		};

		const command = new UpdateItemCommand(params);
		const { Attributes } = await client.send(command);
		const guide = unmarshall(Attributes);

		// 3. Lưu Cache
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
// ADMIN ROUTES
// ==========================================

/**
 * @route   POST /api/guides
 * @desc    Tạo mới: Format ngày dd-mm-yyyy
 */
router.post("/", authenticateCognitoToken, requireAdmin, async (req, res) => {
	try {
		const guideData = req.body;
		if (!guideData.slug || !guideData.title) {
			return res
				.status(400)
				.json({ success: false, message: "Thiếu thông tin bắt buộc." });
		}

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

		// Sử dụng hàm getCurrentDate()
		const todayStr = getCurrentDate();

		const preparedData = {
			...guideData,
			views: 0,
			publishedDate: guideData.publishedDate || todayStr, // VD: "12-12-2025"
			updateDate: todayStr, // VD: "12-12-2025"
		};

		const params = {
			TableName: GUIDES_TABLE,
			Item: marshall(preparedData, { removeUndefinedValues: true }),
		};

		await client.send(new PutItemCommand(params));
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
 * @desc    Cập nhật: Format ngày updateDate thành dd-mm-yyyy
 */
router.put(
	"/:slug",
	authenticateCognitoToken,
	requireAdmin,
	async (req, res) => {
		try {
			const { slug } = req.params;
			const incomingData = req.body;

			// Sử dụng hàm getCurrentDate()
			const todayStr = getCurrentDate();

			// 1. Lấy dữ liệu CŨ
			const getOldItemParams = {
				TableName: GUIDES_TABLE,
				Key: marshall({ slug: slug }),
			};
			const { Item: oldItemRaw } = await client.send(
				new GetItemCommand(getOldItemParams)
			);

			if (!oldItemRaw) {
				return res
					.status(404)
					.json({
						success: false,
						message: "Không tìm thấy bài viết để cập nhật.",
					});
			}
			const oldItem = unmarshall(oldItemRaw);

			// 2. Gộp dữ liệu
			const finalData = {
				...incomingData,
				slug: slug,
				views: oldItem.views !== undefined ? oldItem.views : 0,

				// Giữ ngày cũ, nếu chưa có (data cũ quá) thì mới gán ngày hôm nay
				publishedDate: oldItem.publishedDate || todayStr,

				// Luôn cập nhật ngày sửa là hôm nay (dd-mm-yyyy)
				updateDate: todayStr,
			};

			// 3. Ghi vào DB
			const putParams = {
				TableName: GUIDES_TABLE,
				Item: marshall(finalData, { removeUndefinedValues: true }),
			};

			await client.send(new PutItemCommand(putParams));

			cache.del(CACHE_KEY_LIST);
			cache.del(getDetailCacheKey(slug));

			res.status(200).json({
				success: true,
				message: "Cập nhật guide thành công",
				data: finalData,
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
 * @desc    Xóa
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
