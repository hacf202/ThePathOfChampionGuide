// src/routes/users.js
import express from "express";
import {
	AdminGetUserCommand,
	AdminUpdateUserAttributesCommand,
	ChangePasswordCommand,
	ListUsersCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { cognitoClient } from "../config/cognito.js";
import { authenticateCognitoToken } from "../middleware/authenticate.js";
import cacheManager from "../utils/cacheManager.js";
import { removeAccents } from "../utils/vietnameseUtils.js";

const router = express.Router();
const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;

// Cache public user info — TTL 1 giờ, flush được qua /api/admin/cache
const userCache = cacheManager.getOrCreateCache("users", { stdTTL: 3600, checkperiod: 120 });

/**
 * 1. GET /api/user/me - Lấy thông tin bản thân (Realtime)
 */
router.get("/user/me", authenticateCognitoToken, async (req, res) => {
	try {
		const command = new AdminGetUserCommand({
			UserPoolId: COGNITO_USER_POOL_ID,
			Username: req.user["cognito:username"],
		});
		const { UserAttributes } = await cognitoClient.send(command);
		const userProfile = UserAttributes.reduce((acc, { Name, Value }) => {
			acc[Name] = Value;
			return acc;
		}, {});
		res.json(userProfile);
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
		const command = new AdminGetUserCommand({
			UserPoolId: COGNITO_USER_POOL_ID,
			Username: username,
		});
		const { UserAttributes } = await cognitoClient.send(command);
		const nameAttr = UserAttributes.find(attr => attr.Name === "name");

		const publicProfile = {
			username,
			name: nameAttr ? nameAttr.Value : username,
		};

		await userCache.set(username, publicProfile);
		res.json(publicProfile);
	} catch (error) {
		if (error.name === "UserNotFoundException")
			return res.status(404).json({ error: "User not found" });
		res.status(500).json({ error: "Could not fetch user info" });
	}
});

/**
 * 3. POST /api/user/change-password
 */
router.post(
	"/user/change-password",
	authenticateCognitoToken,
	async (req, res) => {
		const { previousPassword, proposedPassword, accessToken } = req.body;

		if (!previousPassword || !proposedPassword || !accessToken) {
			return res
				.status(400)
				.json({ error: "Both previous and new passwords are required" });
		}

		try {
			const command = new ChangePasswordCommand({
				PreviousPassword: previousPassword,
				ProposedPassword: proposedPassword,
				AccessToken: accessToken,
			});
			await cognitoClient.send(command);
			res.json({ message: "Password changed successfully" });
		} catch (error) {
			res
				.status(400)
				.json({ error: error.message || "Could not change password" });
		}
	},
);

/**
 * 4. PUT /api/user/change-name - Đổi tên hiển thị (XÓA CACHE)
 */
router.put("/user/change-name", authenticateCognitoToken, async (req, res) => {
	const { name } = req.body;
	const username = req.user["cognito:username"];
	const sub = req.user.sub;

	if (!name || name.trim().length < 3) {
		return res.status(400).json({ error: "Tên phải có ít nhất 3 ký tự" });
	}

	try {
		const command = new AdminUpdateUserAttributesCommand({
			UserPoolId: COGNITO_USER_POOL_ID,
			Username: username,
			UserAttributes: [{ Name: "name", Value: name.trim() }],
		});
		await cognitoClient.send(command);

		// Xóa cache theo cả username và sub để đồng bộ dữ liệu mới ngay lập tức
		await userCache.del(username);
		await userCache.del(sub);

		res.json({ message: "Cập nhật tên thành công" });
	} catch (error) {
		console.error("Change name error:", error);
		res.status(500).json({ error: "Không thể cập nhật tên" });
	}
});

/**
 * @route   POST /api/users/batch
 * @desc    Lấy thông tin nhiều user (FIX LỖI 256 KÝ TỰ)
 */
router.post("/users/batch", async (req, res) => {
	const { userIds } = req.body;
	if (!userIds || !Array.isArray(userIds) || userIds.length === 0)
		return res.json({});

	const uniqueIds = [...new Set(userIds)];
	const result = {};
	const idsToFetch = [];

	// 1. Kiểm tra RAM Cache để đạt tốc độ < 1ms
	for (const id of uniqueIds) {
		const cached = await userCache.get(id);
		if (cached) result[id] = cached.name;
		else idsToFetch.push(id);
	}

	// 2. Fetch song song các ID thiếu (Mỗi ID là 1 request độc lập, không dùng filter string)
	if (idsToFetch.length > 0) {
		try {
			const fetchPromises = idsToFetch.map(async id => {
				try {
					const command = new AdminGetUserCommand({
						UserPoolId: COGNITO_USER_POOL_ID,
						Username: id,
					});
					const { UserAttributes } = await cognitoClient.send(command);
					const name = UserAttributes.find(a => a.Name === "name")?.Value || id;
					await userCache.set(id, { name });
					return { id, name };
				} catch {
					return { id, name: "Người chơi" };
				}
			});

			const fetchedUsers = await Promise.all(fetchPromises);
			fetchedUsers.forEach(u => {
				result[u.id] = u.name;
			});
		} catch (error) {
			console.error("Batch fetch error:", error);
		}
	}
	res.json(result);
});

/**
 * [NÂNG CẤP] 6. GET /api/users - Danh sách User (Dành cho Admin hoặc Search)
 */
router.get("/users", async (req, res) => {
	try {
		const { searchTerm = "", page = 1, limit = 24 } = req.query;
		const pageSize = parseInt(limit);

		// AWS Cognito không hỗ trợ search mạnh như DynamoDB, nên ta lấy danh sách (có giới hạn)
		const command = new ListUsersCommand({
			UserPoolId: COGNITO_USER_POOL_ID,
			Limit: 60, // Lấy một cụm lớn để filter trên RAM
		});

		const { Users } = await cognitoClient.send(command);
		let allUsers = Users.map(u => ({
			username: u.Username,
			name: u.Attributes.find(a => a.Name === "name")?.Value || u.Username,
			enabled: u.Enabled,
			status: u.UserStatus,
			createdAt: u.UserCreateDate,
		}));

		// Lọc trên RAM
		if (searchTerm) {
			const key = removeAccents(searchTerm);
			allUsers = allUsers.filter(
				u =>
					removeAccents(u.name).includes(key) ||
					removeAccents(u.username).includes(key),
			);
		}

		// Phân trang
		const totalItems = allUsers.length;
		const paginatedItems = allUsers.slice(
			(page - 1) * pageSize,
			page * pageSize,
		);

		res.json({
			items: paginatedItems,
			pagination: { totalItems, currentPage: parseInt(page), pageSize },
		});
	} catch (error) {
		res.status(500).json({ error: "Could not retrieve user list" });
	}
});

export default router;
