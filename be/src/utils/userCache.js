// be/src/utils/userCache.js
// Dùng chung cacheManager để có thể quản lý qua /api/admin/cache
import { getDb } from "../config/mongo.js";
import cacheManager from "./cacheManager.js";

// Dùng chung cache "users" với users.js (TTL 1 giờ)
const userCache = cacheManager.getOrCreateCache("users", { stdTTL: 3600, checkperiod: 120 });

export async function getUserNames(usernames) {
	if (!usernames || usernames.length === 0) return {};

	const uniqueNames = [...new Set(usernames)];
	const result = {};
	const namesToFetch = [];

	for (const name of uniqueNames) {
		const cached = await userCache.get(name);
		if (cached) result[name] = cached.name;
		else namesToFetch.push(name);
	}

	if (namesToFetch.length > 0) {
		try {
			const db = getDb();
			const users = await db.collection("guidePocUsers").find({ 
				$or: [
					{ _id: { $in: namesToFetch } },
					{ username: { $in: namesToFetch } }
				]
			}).toArray();

			const usersMap = {};
			users.forEach(u => {
				usersMap[u._id] = u.name;
				if (u.username) usersMap[u.username] = u.name;
			});

			namesToFetch.forEach(uname => {
				const name = usersMap[uname] || uname;
				result[uname] = name;
				userCache.set(uname, { name });
			});
		} catch (error) {
			console.error("Error fetching user names:", error);
			namesToFetch.forEach(uname => {
				result[uname] = uname;
			});
		}
	}

	return result;
}
