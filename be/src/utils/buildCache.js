// src/utils/buildCache.js
import { QueryCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import client from "../config/db.js";
import { normalizeBuildFromDynamo } from "./dynamodb.js";
import { getUserNames } from "./userCache.js";

const BUILDS_TABLE = "Builds";
let cachedBuilds = null;
let cacheExpiry = 0;
const CACHE_TTL = 2 * 60 * 1000; // 2 phút

/**
 * Lấy danh sách build công khai (display: true)
 * Cache 2 phút, tự động làm mới
 */
export const getPublicBuilds = async () => {
	if (cachedBuilds && Date.now() < cacheExpiry) {
		return cachedBuilds;
	}

	try {
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

		cachedBuilds = { items };
		cacheExpiry = Date.now() + CACHE_TTL;
		return cachedBuilds;
	} catch (error) {
		console.error("Build cache error:", error);
		return { items: [] };
	}
};

/**
 * XÓA CACHE – GỌI SAU MỌI HÀNH ĐỘNG ADMIN
 */
export const invalidatePublicBuildsCache = () => {
	cachedBuilds = null;
	cacheExpiry = 0;
	console.log("Public builds cache invalidated");
};
