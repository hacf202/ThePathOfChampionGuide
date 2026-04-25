// be/src/utils/ratingUtils.js
import { 
	QueryCommand, 
	GetItemCommand, 
	PutItemCommand 
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import client from "../config/db.js";
import cacheManager from "./cacheManager.js";

const championCache = cacheManager.getOrCreateCache("champions");

/**
 * Tính toán lại điểm trung bình cộng đồng và cập nhật vào bảng ChampionList
 * @param {string} championID - ID của tướng cần đồng bộ
 */
export async function syncChampionCommunityRatings(championID) {
	if (!championID) return;

	try {
		// 1. Lấy tất cả đánh giá của tướng này
		const ratingCommand = new QueryCommand({
			TableName: "guidePocPlayStyleRating",
			KeyConditionExpression: "championID = :cid",
			ExpressionAttributeValues: marshall({ ":cid": championID }),
		});
		const { Items: rItems } = await client.send(ratingCommand);
		const allRatings = rItems ? rItems.map(r => unmarshall(r)) : [];

		// 2. Lấy thông tin tướng hiện tại
		const champCommand = new GetItemCommand({
			TableName: "guidePocChampionList",
			Key: marshall({ championID }),
		});
		const { Item: cItem } = await client.send(champCommand);
		if (!cItem) return;
		const championData = unmarshall(cItem);

		// 3. Tính toán điểm trung bình
		let communityRatings = null;

		if (allRatings.length > 0) {
			const sum = {
				damage: 0,
				defense: 0,
				speed: 0,
				consistency: 0,
				synergy: 0,
				independence: 0,
			};
			allRatings.forEach(r => {
				sum.damage += r.ratings.damage || 0;
				sum.defense += r.ratings.defense || 0;
				sum.speed += r.ratings.speed || 0;
				sum.consistency += r.ratings.consistency || 0;
				sum.synergy += r.ratings.synergy || 0;
				sum.independence += r.ratings.independence || 0;
			});

			const userCount = allRatings.length;
			const totalCount = userCount + 1; // +1 cho Admin Ratings

			// Lấy điểm Admin làm gốc
			const adminRatings = championData.ratings || {
				damage: 5, defense: 5, speed: 5, consistency: 5, synergy: 5, independence: 5
			};

			communityRatings = {
				damage: parseFloat(((adminRatings.damage + sum.damage) / totalCount).toFixed(1)),
				defense: parseFloat(((adminRatings.defense + sum.defense) / totalCount).toFixed(1)),
				speed: parseFloat(((adminRatings.speed + sum.speed) / totalCount).toFixed(1)),
				consistency: parseFloat(((adminRatings.consistency + sum.consistency) / totalCount).toFixed(1)),
				synergy: parseFloat(((adminRatings.synergy + sum.synergy) / totalCount).toFixed(1)),
				independence: parseFloat(((adminRatings.independence + sum.independence) / totalCount).toFixed(1)),
				count: totalCount,
				communityOnlyAvg: {
					damage: parseFloat((sum.damage / userCount).toFixed(1)),
					defense: parseFloat((sum.defense / userCount).toFixed(1)),
					speed: parseFloat((sum.speed / userCount).toFixed(1)),
					consistency: parseFloat((sum.consistency / userCount).toFixed(1)),
					synergy: parseFloat((sum.synergy / userCount).toFixed(1)),
					independence: parseFloat((sum.independence / userCount).toFixed(1)),
					userCount: userCount
				}
			};
		}

		// 4. Cập nhật vào DB
		const updatedChampion = {
			...championData,
			communityRatings
		};

		await client.send(new PutItemCommand({
			TableName: "guidePocChampionList",
			Item: marshall(updatedChampion, { removeUndefinedValues: true })
		}));

		// 5. Xóa cache
		await championCache.del("all_champions_list");
		await championCache.del(`champion_detail_${championID}`);
		
		console.log(`Successfully synced community ratings for ${championID}`);
		return updatedChampion;

	} catch (error) {
		console.error(`Error syncing ratings for champion ${championID}:`, error);
		throw error;
	}
}
