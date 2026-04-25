// be/src/utils/userCache.js
// Dùng chung cacheManager để có thể quản lý qua /api/admin/cache
import { AdminGetUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import { cognitoClient } from "../config/cognito.js";
import cacheManager from "./cacheManager.js";

// Dùng chung cache "users" với users.js (TTL 1 giờ)
const userCache = cacheManager.getOrCreateCache("users", { stdTTL: 3600, checkperiod: 120 });
const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;

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
		const promises = namesToFetch.map(async uname => {
			try {
				const command = new AdminGetUserCommand({
					UserPoolId: COGNITO_USER_POOL_ID,
					Username: uname,
				});
				const { UserAttributes } = await cognitoClient.send(command);
				const name = UserAttributes.find(a => a.Name === "name")?.Value || uname;
				await userCache.set(uname, { name });
				return { uname, name };
			} catch {
				return { uname, name: uname };
			}
		});

		const fetched = await Promise.all(promises);
		fetched.forEach(u => {
			result[u.uname] = u.name;
		});
	}

	return result;
}
