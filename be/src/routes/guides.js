import express from "express";
import { getDb } from "../config/mongo.js";
import cacheManager from "../utils/cacheManager.js";
import { authenticateCognitoToken } from "../middleware/authenticate.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { createAuditLog } from "../utils/auditLogger.js";

const router = express.Router();
const GUIDES_TABLE = "guidePocGuideList";

// Cache: TTL 24 giờ — guide rất ít thay đổi. Admin tạo/sửa/xóa sẽ invalidate cache ngay.
const cache = cacheManager.getOrCreateCache("guides", { stdTTL: 86400, checkperiod: 120 });
const CACHE_KEY_LIST = "all_guides";

// Hàm tạo key cache cho chi tiết
const getDetailCacheKey = slug => `guide_${slug}`;

const getCurrentDate = () => {
	return new Date().toISOString();
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
		const db = getDb();
		const { page, limit, search } = req.query;

		// Nếu không truyền page/limit, trả về cache (tương thích ngược cho Frontend cũ)
		if (!page && !limit && !search) {
			const cached = await cache.get(CACHE_KEY_LIST);
			if (cached) {
				return res.status(200).json(cached);
			}

			const guides = await db.collection(GUIDES_TABLE).find({}).sort({ updateDate: -1, publishedDate: -1 }).toArray();
			
			// Format cũ cho client cũ
			const responseData = {
				success: true,
				count: guides.length,
				data: guides,
				// Format mới (optional, nhưng để sẵn)
				items: guides,
				pagination: { totalItems: guides.length, totalPages: 1, currentPage: 1, pageSize: guides.length }
			};

			await cache.set(CACHE_KEY_LIST, responseData);
			return res.status(200).json(responseData);
		}

		// Tính năng Search & Pagination cho Admin / useGenericData
		const { searchTerm, sort } = req.query;

		let query = {};
		if (searchTerm) {
			query = {
				$or: [
					{ title: { $regex: searchTerm, $options: "i" } },
					{ slug: { $regex: searchTerm, $options: "i" } },
					{ author: { $regex: searchTerm, $options: "i" } }
				]
			};
		}

		// Parse sort: "updateDate-desc" => { updateDate: -1 }
		let sortObj = { updateDate: -1, publishedDate: -1 }; // Mặc định
		if (sort) {
			const lastDash = sort.lastIndexOf("-");
			if (lastDash !== -1) {
				const field = sort.substring(0, lastDash);
				const dir = sort.substring(lastDash + 1);
				if (field) sortObj = { [field]: dir === "desc" ? -1 : 1 };
			}
		}

		const pageSize = parseInt(limit) || 20;
		const currentPage = parseInt(page) || 1;
		const skip = (currentPage - 1) * pageSize;

		const totalItems = await db.collection(GUIDES_TABLE).countDocuments(query);
		const totalPages = Math.ceil(totalItems / pageSize);

		const items = await db.collection(GUIDES_TABLE)
			.find(query)
			.sort(sortObj)
			.skip(skip)
			.limit(pageSize)
			.toArray();

		const responseData = {
			items,
			pagination: { totalItems, totalPages, currentPage, pageSize },
			// Giữ lại format cũ cho an toàn
			success: true,
			count: items.length,
			data: items,
		};

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
		const cached = await cache.get(cacheKey);
		if (cached) {
			return res.status(200).json({
				success: true,
				data: cached,
			});
		}

		// 2. GỌI DB & TĂNG VIEW
		const db = getDb();
		const guide = await db.collection(GUIDES_TABLE).findOneAndUpdate(
			{ slug: slug },
			{ $inc: { views: 1 } },
			{ returnDocument: 'after' }
		);

		if (!guide) {
			return res.status(404).json({ success: false, message: "Không tìm thấy bài viết." });
		}

		// 3. Lưu Cache
		await cache.set(cacheKey, guide);

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

		const db = getDb();
		const checkExisting = await db.collection(GUIDES_TABLE).findOne({ slug: guideData.slug });
		if (checkExisting) {
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

		await db.collection(GUIDES_TABLE).insertOne(preparedData);

		// Ghi log thay đổi
		await createAuditLog({
			action: "CREATE",
			entityType: "guide",
			entityId: preparedData.slug,
			entityName: preparedData.title,
			oldData: null,
			newData: preparedData,
			user: req.user
		});

		await cache.del(CACHE_KEY_LIST);

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
			const db = getDb();
			const oldItem = await db.collection(GUIDES_TABLE).findOne({ slug: slug });

			if (!oldItem) {
				return res
					.status(404)
					.json({
						success: false,
						message: "Không tìm thấy bài viết để cập nhật.",
					});
			}

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

			delete finalData._id;

			// 3. Ghi vào DB
			await db.collection(GUIDES_TABLE).replaceOne(
				{ slug: slug },
				finalData,
				{ upsert: true }
			);

			// Ghi log thay đổi
			await createAuditLog({
				action: "UPDATE",
				entityType: "guide",
				entityId: slug,
				entityName: finalData.title,
				oldData: oldItem,
				newData: finalData,
				user: req.user
			});

			await cache.del(CACHE_KEY_LIST);
			await cache.del(getDetailCacheKey(slug));

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
			const db = getDb();
			const Item = await db.collection(GUIDES_TABLE).findOne({ slug: slug });
			const oldData = Item ? Item : null;

			await db.collection(GUIDES_TABLE).deleteOne({ slug: slug });

			// Ghi log thay đổi
			await createAuditLog({
				action: "DELETE",
				entityType: "guide",
				entityId: slug,
				entityName: oldData?.title || slug,
				oldData: oldData,
				newData: null,
				user: req.user
			});

			await cache.del(CACHE_KEY_LIST);
			await cache.del(getDetailCacheKey(slug));

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
