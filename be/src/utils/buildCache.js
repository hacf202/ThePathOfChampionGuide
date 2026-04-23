import { QueryCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import client from "../config/db.js";
import { normalizeBuildFromDynamo } from "./dynamodb.js";
import { getUserNames } from "./userCache.js";
import cacheManager from "./cacheManager.js";

const BUILDS_TABLE = "Builds";
// Sử dụng cacheManager để quản lý bộ nhớ đệm theo userId (TTL 1 giờ)
const publicBuildsCache = cacheManager.getOrCreateCache("public_builds", { 
	stdTTL: 3600, 
	checkperiod: 600 
});

/**
 * Lấy danh sách build công khai (display: true) theo từng User
 * Cache 1 giờ cho mỗi user/guest để tối ưu hiệu năng server
 */
export const getPublicBuilds = async (userId = "global") => {
	const cached = publicBuildsCache.get(userId);
	if (cached) return cached;

	try {
		console.log(`[BuildCache] Fetching fresh public builds for: ${userId}`);
		const command = new QueryCommand({
			TableName: BUILDS_TABLE,
			IndexName: "display-index",
			KeyConditionExpression: "#display = :display",
			ExpressionAttributeNames: { "#display": "display" },
			ExpressionAttributeValues: marshall({ ":display": "true" }),
		});

		const { Items } = await client.send(command);
		let items = Items
			? Items.map(item => normalizeBuildFromDynamo(unmarshall(item)))
			: [];

		// Gắn tên người tạo
		if (items.length > 0) {
			const usernames = [...new Set(items.map(i => i.creator))];
			const userMap = await getUserNames(usernames);
			items = items.map(item => ({
				...item,
				creatorName: userMap[item.creator] || item.creator,
			}));
		}

		const data = { items };
		publicBuildsCache.set(userId, data);
		return data;
	} catch (error) {
		console.error("Build cache error:", error);
		return { items: [] };
	}
};

/**
 * XÓA CACHE CỦA MỘT NGƯỜI DÙNG CỤ THỂ
 * Gọi khi người đó tạo/sửa/xóa build của chính họ
 */
export const invalidateUserBuildsCache = (userId) => {
	if (!userId) return;
	publicBuildsCache.del(userId);
	console.log(`[BuildCache] Cache invalidated for user: ${userId}`);
};

/**
 * XÓA TOÀN BỘ CACHE (Admin dùng hoặc khi có thay đổi lớn)
 */
export const invalidatePublicBuildsCache = () => {
	publicBuildsCache.flushAll();
	console.log("[BuildCache] Global public builds cache flushed");
};
