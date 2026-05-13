// src/routes/users.js
import express from "express";
import { supabase } from "../config/supabase.js";
import { getDb } from "../config/mongo.js";
import { authenticateCognitoToken } from "../middleware/authenticate.js";
import cacheManager from "../utils/cacheManager.js";
import { removeAccents } from "../utils/vietnameseUtils.js";

const router = express.Router();

// Cache public user info — TTL 1 giờ, flush được qua /api/admin/cache
const userCache = cacheManager.getOrCreateCache("users", { stdTTL: 3600, checkperiod: 120 });

/**
 * 1. GET /api/user/me - Lấy thông tin bản thân (Realtime)
 */
router.get("/user/me", authenticateCognitoToken, async (req, res) => {
	try {
		const db = getDb();
		const user = await db.collection("guidePocUsers").findOne({ _id: req.user.id });
		
		if (!user) {
			// Fallback thông tin cơ bản từ Supabase token
			return res.json({ email: req.user.email, name: req.user.email.split('@')[0] });
		}
		res.json(user);
	} catch (error) {
		console.error("Error fetching user profile:", error);
		res.status(500).json({ error: "Could not fetch user profile" });
	}
});

/**
 * 2. GET /api/users/:username - Lấy thông tin công khai (CÓ CACHE)
 */
router.get("/users/:username", async (req, res) => {
	const { username } = req.params;

	const cachedData = await userCache.get(username);
	if (cachedData) return res.json(cachedData);

	try {
		const db = getDb();
		// Tìm theo username hoặc email prefix trong MongoDB
		const user = await db.collection("guidePocUsers").findOne({ 
			$or: [{ username: username }, { email: new RegExp('^' + username + '@', 'i') }] 
		});

		const publicProfile = {
			username,
			name: user ? (user.name || username) : username,
		};

		await userCache.set(username, publicProfile);
		res.json(publicProfile);
	} catch (error) {
		res.status(500).json({ error: "Could not fetch user info" });
	}
});

/**
 * 2b. GET /api/user/info/:sub - Lấy thông tin công khai qua SUB (Dùng cho comment/audit)
 */
router.get("/user/info/:sub", async (req, res) => {
	const { sub } = req.params;

	const cachedData = await userCache.get(sub);
	if (cachedData) return res.json(cachedData);

	try {
		const db = getDb();
		const user = await db.collection("guidePocUsers").findOne({ _id: sub });

		const publicProfile = {
			sub,
			name: user ? (user.name || "Người chơi") : "Người chơi",
		};

		await userCache.set(sub, publicProfile);
		res.json(publicProfile);
	} catch (error) {
		res.json({ sub, name: "Người chơi" });
	}
});

/**
 * 3. POST /api/user/change-password
 */
router.post(
	"/user/change-password",
	authenticateCognitoToken,
	async (req, res) => {
		const { proposedPassword } = req.body;

		if (!proposedPassword) {
			return res.status(400).json({ error: "New password is required" });
		}

		try {
			// Yêu cầu token hợp lệ (đã có nhờ middleware) để update
			const { error } = await supabase.auth.admin.updateUserById(
				req.user.id,
				{ password: proposedPassword }
			);

			if (error) throw error;

			res.json({ message: "Password changed successfully" });
		} catch (error) {
			res.status(400).json({ error: error.message || "Could not change password" });
		}
	},
);

/**
 * 4. PUT /api/user/change-name - Đổi tên hiển thị (XÓA CACHE)
 */
router.put("/user/change-name", authenticateCognitoToken, async (req, res) => {
	const { name } = req.body;
	const sub = req.user.id; // Supabase user id

	if (!name || name.trim().length < 3) {
		return res.status(400).json({ error: "Tên phải có ít nhất 3 ký tự" });
	}

	try {
		const db = getDb();
		await db.collection("guidePocUsers").updateOne(
			{ _id: sub },
			{ $set: { name: name.trim() } },
			{ upsert: true }
		);

		// Cập nhật metadata trong Supabase nếu muốn đồng bộ 2 chiều
		await supabase.auth.admin.updateUserById(sub, { user_metadata: { name: name.trim() } });

		await userCache.del(sub);
		
		res.json({ message: "Cập nhật tên thành công" });
	} catch (error) {
		console.error("Change name error:", error);
		res.status(500).json({ error: "Không thể cập nhật tên" });
	}
});

/**
 * @route   POST /api/users/batch
 * @desc    Lấy thông tin nhiều user 
 */
router.post("/users/batch", async (req, res) => {
	const { userIds } = req.body;
	if (!userIds || !Array.isArray(userIds) || userIds.length === 0)
		return res.json({});

	const uniqueIds = [...new Set(userIds)];
	const result = {};
	const idsToFetch = [];

	for (const id of uniqueIds) {
		const cached = await userCache.get(id);
		if (cached) result[id] = cached.name;
		else idsToFetch.push(id);
	}

	if (idsToFetch.length > 0) {
		try {
			const db = getDb();
			const users = await db.collection("guidePocUsers").find({ _id: { $in: idsToFetch } }).toArray();
			
			const usersMap = {};
			users.forEach(u => usersMap[u._id] = u.name);

			idsToFetch.forEach(id => {
				const name = usersMap[id] || "Người chơi";
				result[id] = name;
				userCache.set(id, { name }); // Caching kết quả
			});

		} catch (error) {
			console.error("Batch fetch error:", error);
		}
	}
	res.json(result);
});

/**
 * 6. GET /api/users - Danh sách User (Dành cho Admin hoặc Search)
 */
router.get("/users", async (req, res) => {
	try {
		const { searchTerm = "", page = 1, limit = 24 } = req.query;
		const pageSize = parseInt(limit);
		const skip = (parseInt(page) - 1) * pageSize;

		const db = getDb();
		let query = {};
		
		if (searchTerm) {
			query = {
				$or: [
					{ name: { $regex: searchTerm, $options: 'i' } },
					{ email: { $regex: searchTerm, $options: 'i' } }
				]
			};
		}

		const totalItems = await db.collection("guidePocUsers").countDocuments(query);
		const paginatedItems = await db.collection("guidePocUsers")
			.find(query)
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(pageSize)
			.toArray();

		// Format lại kết quả cho giống với client hiện tại mong đợi
		const formattedItems = paginatedItems.map(u => ({
			username: u.email ? u.email.split('@')[0] : u._id,
			name: u.name || "Người chơi",
			enabled: true,
			status: "CONFIRMED",
			createdAt: u.createdAt || new Date(),
		}));

		res.json({
			items: formattedItems,
			pagination: { totalItems, currentPage: parseInt(page), pageSize },
		});
	} catch (error) {
		res.status(500).json({ error: "Could not retrieve user list" });
	}
});

export default router;
