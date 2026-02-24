// be/src/utils/userCache.js
import { AdminGetUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import { cognitoClient } from "../config/cognito.js";
import NodeCache from "node-cache";

const userCache = new NodeCache({ stdTTL: 600 });
const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;

export async function getUserNames(usernames) {
	if (!usernames || usernames.length === 0) return {};

	const uniqueNames = [...new Set(usernames)];
	const result = {};
	const namesToFetch = [];

	uniqueNames.forEach(name => {
		const cached = userCache.get(name);
		if (cached) result[name] = cached.name;
		else namesToFetch.push(name);
	});

	if (namesToFetch.length > 0) {
		// TỐI ƯU: Fetch song song thay vì dùng Filter string gây lỗi 256 ký tự
		const promises = namesToFetch.map(async uname => {
			try {
				const command = new AdminGetUserCommand({
					UserPoolId: COGNITO_USER_POOL_ID,
					Username: uname,
				});
				const { UserAttributes } = await cognitoClient.send(command);
				const name =
					UserAttributes.find(a => a.Name === "name")?.Value || uname;
				userCache.set(uname, { name });
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
