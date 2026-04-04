// src/routes/champions.js
import express from "express";
import {
	ScanCommand,
	PutItemCommand,
	DeleteItemCommand,
	GetItemCommand,
	QueryCommand,
	BatchGetItemCommand
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import cacheManager from "../utils/cacheManager.js";
import client from "../config/db.js";
import { authenticateCognitoToken } from "../middleware/authenticate.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { removeAccents } from "../utils/vietnameseUtils.js";
import { scanAll } from "../utils/dynamoUtils.js";
import { verifier } from "../config/cognito.js"; // For manual token verification if optional

const router = express.Router();
const CHAMPIONS_TABLE = "guidePocChampionList";

const championCache = cacheManager.getOrCreateCache("champions", { stdTTL: 1800, checkperiod: 60 });

/**
 * Hàm lấy toàn bộ dữ liệu từ DB và lưu vào Cache.
 * Sắp xếp mặc định A-Z.
 */
async function getCachedChampions() {
	const CACHE_KEY = "all_champions_list";
	let cachedData = championCache.get(CACHE_KEY);

	if (!cachedData) {
		const rawItems = await scanAll(client, { TableName: CHAMPIONS_TABLE });
		cachedData = rawItems.map(item => unmarshall(item));

		// Sắp xếp mặc định theo tên A-Z
		cachedData.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

		championCache.set(CACHE_KEY, cachedData);
	}
	return cachedData;
}

/**
 * Helper để fetch hàng loạt dữ liệu từ một bảng dựa trên list IDs (Tối ưu dùng BatchGet)
 */
async function fetchBatch(tableName, keyName, ids) {
	if (!ids || ids.length === 0) return [];
	try {
		const distinctIds = [...new Set(ids.filter(Boolean).map(id => String(id).trim()))];
		if (distinctIds.length === 0) return [];

		const results = [];
		// BatchGetItem giới hạn 100 items mỗi call
		for (let i = 0; i < distinctIds.length; i += 100) {
			const chunk = distinctIds.slice(i, i + 100);
			const keys = chunk.map(id => marshall({ [keyName]: id }));

			const command = {
				RequestItems: {
					[tableName]: {
						Keys: keys
					}
				}
			};

			const response = await client.send(new BatchGetItemCommand(command));
			if (response.Responses && response.Responses[tableName]) {
				results.push(...response.Responses[tableName].map(item => unmarshall(item)));
			}
		}
		
		return results;
	} catch (e) {
		console.error(`FetchBatch Error [${tableName}] with BatchGet:`, e);
		return [];
	}
}

/**
 * @route   GET /api/champions
 * @desc    Lấy danh sách tướng với bộ lọc động và phân trang an toàn
 */
router.get("/", async (req, res) => {
	try {
		const {
			page = 1,
			limit = 24,
			searchTerm = "",
			regions = "",
			costs = "",
			tags = "",
			maxStars = "",
			sort = "name-asc",
		} = req.query;

		const pageSize = parseInt(limit);
		const currentPage = parseInt(page);

		// 1. Lấy toàn bộ danh sách từ Cache (hoặc DB)
		const allChampions = await getCachedChampions();

		// 2. TRÍCH XUẤT BỘ LỌC ĐỘNG (Dynamic Filters) - Đã đổi thành tags
		const availableFilters = {
			tags: [...new Set(allChampions.flatMap(c => c.tags || []))].sort(),
			regions: [...new Set(allChampions.flatMap(c => c.regions || []))].sort(),
			costs: [...new Set(allChampions.map(c => Number(c.cost)))]
				.filter(Boolean)
				.sort((a, b) => a - b),
			maxStars: [...new Set(allChampions.map(c => Number(c.maxStar)))]
				.filter(Boolean)
				.sort((a, b) => a - b),
		};

		// 3. THỰC HIỆN LỌC (Filtering)
		let filtered = [...allChampions];

		if (searchTerm) {
			const searchKey = removeAccents(searchTerm.toLowerCase());
			filtered = filtered.filter(c => {
				const nameVn = removeAccents(c.name || "");
				const nameEn = removeAccents(c.translations?.en?.name || "");

				// CHỈ TÌM KIẾM THEO TÊN (Tiếng Việt hoặc Tiếng Anh)
				return nameVn.includes(searchKey) || nameEn.includes(searchKey);
			});
		}

		if (regions) {
			const rList = regions.split(",");
			filtered = filtered.filter(c => c.regions?.some(r => rList.includes(r)));
		}

		if (costs) {
			const cList = costs.split(",").map(Number);
			filtered = filtered.filter(c => cList.includes(Number(c.cost)));
		}

		if (tags) {
			const tList = tags.split(",");
			filtered = filtered.filter(c => c.tags?.some(t => tList.includes(t)));
		}

		if (maxStars) {
			const sList = maxStars.split(",").map(Number);
			filtered = filtered.filter(c => sList.includes(Number(c.maxStar)));
		}

		// 4. SẮP XẾP (Sorting)
		const [field, order] = sort.split("-");
		filtered.sort((a, b) => {
			let vA = a[field] ?? "";
			let vB = b[field] ?? "";
			if (typeof vA === "string") {
				return order === "asc" ? vA.localeCompare(vB) : vB.localeCompare(vA);
			}
			return order === "asc" ? vA - vB : vB - vA;
		});

		// 5. PHÂN TRANG (Pagination)
		const totalItems = filtered.length;
		let paginatedItems;

		if (pageSize < 0) {
			paginatedItems = filtered;
		} else {
			paginatedItems = filtered.slice(
				(currentPage - 1) * pageSize,
				currentPage * pageSize,
			);
		}

		const totalPages = pageSize > 0 ? Math.ceil(totalItems / pageSize) : 1;

		res.json({
			items: paginatedItems,
			pagination: {
				totalItems,
				totalPages,
				currentPage,
				pageSize: pageSize < 0 ? totalItems : pageSize,
			},
			availableFilters,
		});
	} catch (error) {
		console.error("Lỗi Backend:", error);
		res.status(500).json({ error: "Lỗi hệ thống." });
	}
});

/**
 * @route   GET /api/champions/search?name=...
 * @desc    Tìm tướng theo tên (exact match)
 */
router.get("/search", async (req, res) => {
	const { name } = req.query;

	if (!name || typeof name !== "string" || name.trim().length < 1) {
		return res.status(400).json({ error: "Tham số 'name' là bắt buộc." });
	}

	const searchName = name.trim();

	try {
		const command = new QueryCommand({
			TableName: CHAMPIONS_TABLE,
			IndexName: "name-index",
			KeyConditionExpression: "#name = :name",
			ExpressionAttributeNames: { "#name": "name" },
			ExpressionAttributeValues: marshall({ ":name": searchName }),
		});

		const { Items } = await client.send(command);
		const champions = Items ? Items.map(item => unmarshall(item)) : [];

		res.json({ items: champions });
	} catch (error) {
		console.error("Lỗi tìm kiếm tướng theo tên:", error);
		res.status(500).json({ error: "Không thể tìm kiếm tướng." });
	}
});

/**
 * @route   POST /api/champions/resolve
 * @desc    Lấy thông tin chi tiết của một danh sách các tướng dựa trên ID (hoặc tên)
 */
router.post("/resolve", async (req, res) => {
	try {
		const { ids } = req.body;
		if (!Array.isArray(ids) || ids.length === 0) {
			return res.json([]); // Trả về mảng rỗng nếu không có id nào
		}

		// Tận dụng cache có sẵn để tìm kiếm siêu tốc độ mà không cần query DB nhiều lần
		const allChampions = await getCachedChampions();

		// Map qua danh sách ids được yêu cầu từ Frontend
		const resolvedChampions = ids
			.map(id => {
				// Tìm khớp theo championID hoặc name (vì đôi khi requirement lưu theo tên)
				const found = allChampions.find(
					c => c.championID === id || c.name === id,
				);
				return found || null;
			})
			.filter(Boolean); // Lọc bỏ các kết quả null nếu không tìm thấy

		res.json(resolvedChampions);
	} catch (error) {
		console.error("Lỗi khi resolve champions:", error);
		res.status(500).json({ error: "Lỗi hệ thống khi resolve tướng." });
	}
});

/**
 * @route   GET /api/champions/:championID/full
 * @desc    Tối ưu hóa: Lấy toàn bộ dữ liệu cần thiết cho trang chi tiết tướng trong 1 nốt nhạc
 */
router.get("/:championID/full", async (req, res) => {
	const { championID } = req.params;
	if (!championID) return res.status(400).json({ error: "championID là bắt buộc." });

	try {
		// 1. Fetch dữ liệu cơ bản (Tướng + Chòm sao) song song
		const [champRes, constRes] = await Promise.all([
			client.send(new GetItemCommand({ TableName: CHAMPIONS_TABLE, Key: marshall({ championID }) })),
			client.send(new GetItemCommand({ TableName: "guidePocChampionConstellation", Key: marshall({ constellationID: championID }) }))
		]);

		if (!champRes.Item) return res.status(404).json({ error: "Không tìm thấy tướng." });

		const champion = unmarshall(champRes.Item);
		const constellation = constRes.Item ? unmarshall(constRes.Item) : null;

		// 2. Thu thập tất cả ID cần resolve
		const powerIds = new Set([
			...(champion.adventurePowerIds || []),
			...(champion.powerStarIds || []),
			...(constellation?.nodes?.map(n => n.powerCode).filter(Boolean) || [])
		]);
		const relicIds = new Set((champion.relicSets || []).flat());
		const itemIds = new Set([
			...(champion.itemIds || []),
			...(champion.startingDeck?.baseCards?.flatMap(c => c.itemCodes || []) || []),
			...(champion.startingDeck?.referenceCards?.flatMap(c => c.itemCodes || []) || [])
		]);
		const runeIds = new Set(champion.runeIds || []);
		const cardIds = new Set([
			...(champion.startingDeck?.baseCards?.map(c => c.cardCode) || []),
			...(champion.startingDeck?.referenceCards?.map(c => c.cardCode) || [])
		]);
		const bonusStarIds = new Set(constellation?.nodes?.map(n => n.bonusStarID).filter(Boolean) || []);

		// 3. Fetch tất cả dữ liệu liên quan song song
		const [powers, relics, items, runes, cards, bonusStars, allRatings] = await Promise.all([
			fetchBatch("guidePocPowers", "powerCode", Array.from(powerIds)),
			fetchBatch("guidePocRelics", "relicCode", Array.from(relicIds)),
			fetchBatch("guidePocItems", "itemCode", Array.from(itemIds)),
			fetchBatch("guidePocRunes", "runeCode", Array.from(runeIds)),
			fetchBatch("guidePocCardList", "cardCode", Array.from(cardIds)),
			fetchBatch("guidePocBonusStar", "bonusStarID", Array.from(bonusStarIds)),
			client.send(new QueryCommand({
				TableName: "guidePocPlayStyleRating",
				KeyConditionExpression: "championID = :cid",
				ExpressionAttributeValues: marshall({ ":cid": championID }),
			}))
		]);

		// 4. Xử lý Ratings (Cộng đồng + Cá nhân)
		const ratingsList = allRatings.Items ? allRatings.Items.map(r => unmarshall(r)) : [];
		let personalRating = null;
		
		// Check token nếu có để lấy rating cá nhân
		const authHeader = req.headers.authorization;
		if (authHeader && authHeader.startsWith("Bearer ")) {
			const token = authHeader.split(" ")[1];
			try {
				const payload = await verifier.verify(token);
				personalRating = ratingsList.find(r => r.userID === payload.sub || r.sub === payload.sub);
			} catch (e) {
				// Token invalid, bỏ qua personal rating
			}
		}

		if (ratingsList.length > 0) {
			const sum = { damage: 0, defense: 0, speed: 0, consistency: 0, synergy: 0, independence: 0 };
			ratingsList.forEach(r => {
				Object.keys(sum).forEach(k => sum[k] += r.ratings[k] || 0);
			});
			const count = ratingsList.length;
			const adminRatings = champion.ratings || { damage: 5, defense: 5, speed: 5, consistency: 5, synergy: 5, independence: 5 };
			
			champion.communityRatings = {
				damage: parseFloat(((adminRatings.damage + sum.damage) / (count + 1)).toFixed(1)),
				defense: parseFloat(((adminRatings.defense + sum.defense) / (count + 1)).toFixed(1)),
				speed: parseFloat(((adminRatings.speed + sum.speed) / (count + 1)).toFixed(1)),
				consistency: parseFloat(((adminRatings.consistency + sum.consistency) / (count + 1)).toFixed(1)),
				synergy: parseFloat(((adminRatings.synergy + sum.synergy) / (count + 1)).toFixed(1)),
				independence: parseFloat(((adminRatings.independence + sum.independence) / (count + 1)).toFixed(1)),
				count: count + 1,
				communityOnlyAvg: {
					damage: parseFloat((sum.damage / count).toFixed(1)),
					defense: parseFloat((sum.defense / count).toFixed(1)),
					speed: parseFloat((sum.speed / count).toFixed(1)),
					consistency: parseFloat((sum.consistency / count).toFixed(1)),
					synergy: parseFloat((sum.synergy / count).toFixed(1)),
					independence: parseFloat((sum.independence / count).toFixed(1)),
					userCount: count
				}
			};
		}

		res.json({
			champion,
			constellation,
			resolvedData: {
				powers,
				relics,
				items,
				runes,
				cards,
				bonusStars
			},
			allRatings: ratingsList,
			personalRating
		});

	} catch (error) {
		console.error("Lỗi Full Champion Resolve:", error);
		res.status(500).json({ error: "Lỗi hệ thống khi tổng hợp dữ liệu." });
	}
});

/**
 * @route   GET /api/champions/:championID
 * @desc    Lấy chi tiết một tướng
 */
router.get("/:championID", async (req, res) => {
	const { championID } = req.params;

	if (!championID) {
		return res.status(400).json({ error: "championID là bắt buộc." });
	}

	const CACHE_KEY = `champion_detail_${championID}`;

	try {
		const cachedChampion = championCache.get(CACHE_KEY);
		if (cachedChampion) {
			return res.json(cachedChampion);
		}

		const command = new GetItemCommand({
			TableName: CHAMPIONS_TABLE,
			Key: marshall({ championID }),
		});

		const { Item } = await client.send(command);

		if (!Item) {
			return res.status(404).json({ error: "Không tìm thấy tướng yêu cầu." });
		}

		const championData = unmarshall(Item);

		// Thêm phần tính toán điểm trung bình từ cộng đồng
		try {
			const ratingCommand = new QueryCommand({
				TableName: "guidePocPlayStyleRating",
				KeyConditionExpression: "championID = :cid",
				ExpressionAttributeValues: marshall({ ":cid": championID }),
			});
			const { Items: rItems } = await client.send(ratingCommand);
			const allRatings = rItems ? rItems.map(r => unmarshall(r)) : [];

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
				const totalCount = userCount + 1;

				// Lấy điểm Admin làm gốc (coi như 1 lượt đánh giá)
				const adminRatings = championData.ratings || {
					damage: 5, defense: 5, speed: 5, consistency: 5, synergy: 5, independence: 5
				};

				// Tính điểm kết hợp dân chủ: (Admin + Tổng Cộng đồng) / (1 + Count)
				championData.communityRatings = {
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
				
				// Frontend (Public) sẽ dùng communityRatings này làm bộ chỉ số hiển thị chính.
				// Admin vẫn thấy điểm gốc trong championData.ratings.
			} else {
				championData.communityRatings = null;
			}
		} catch (rError) {
			console.error("Lỗi khi tính điểm cộng đồng (Chi tiết):", rError);
			championData.communityRatings = null;
		}

		championCache.set(CACHE_KEY, championData);
		res.json(championData);
	} catch (error) {
		console.error("Lỗi khi lấy chi tiết tướng:", error);
		res.status(500).json({ error: "Lỗi hệ thống khi truy vấn dữ liệu." });
	}
});

/**
 * @route   PUT /api/champions
 * @desc    Tạo mới hoặc cập nhật một tướng
 */
router.put("/", authenticateCognitoToken, requireAdmin, async (req, res) => {
	const rawData = req.body;

	if (!rawData.championID || !rawData.name?.trim()) {
		return res.status(400).json({ error: "championID và name là bắt buộc." });
	}

	const championID = rawData.championID.trim();

	if (championID.length < 2 || championID.length > 50) {
		return res.status(400).json({ error: "championID phải từ 2-50 ký tự." });
	}
	if (!/^[A-Za-z0-9_-]+$/.test(championID)) {
		return res.status(400).json({
			error: "championID chỉ được chứa chữ cái, số, gạch dưới và gạch ngang.",
		});
	}

	const maxStar = Number(rawData.maxStar) || 7;
	if (!Number.isInteger(maxStar) || maxStar < 1 || maxStar > 7) {
		return res.status(400).json({ error: "maxStar phải là số từ 1-7." });
	}

	const { isNew, communityRatings, ...dataToSave } = rawData;

	const cleanData = {
		...dataToSave,
		championID,
		name: rawData.name.trim(),
		maxStar,
	};

	try {
		const checkCmd = new GetItemCommand({
			TableName: CHAMPIONS_TABLE,
			Key: marshall({ championID }),
		});
		const { Item } = await client.send(checkCmd);

		if (isNew === true) {
			if (Item) {
				return res.status(400).json({ error: "Tướng với ID này đã tồn tại." });
			}
		} else {
			if (!Item) {
				return res
					.status(404)
					.json({ error: "Tướng không tồn tại để cập nhật." });
			}
		}

		const command = new PutItemCommand({
			TableName: CHAMPIONS_TABLE,
			Item: marshall(cleanData, { removeUndefinedValues: true }),
			...(isNew === true && {
				ConditionExpression: "attribute_not_exists(championID)",
			}),
		});

		await client.send(command);
		
		// Xóa cache danh sách và cache chi tiết của tướng này
		championCache.del("all_champions_list");
		championCache.del(`champion_detail_${championID}`);

		res.json({
			message: isNew
				? "Tạo tướng mới thành công."
				: "Cập nhật tướng thành công.",
			champion: cleanData,
		});
	} catch (error) {
		if (error.name === "ConditionalCheckFailedException") {
			return res.status(400).json({ error: "Tướng đã tồn tại." });
		}
		console.error("Lỗi khi lưu dữ liệu tướng:", error);
		res.status(500).json({ error: "Không thể lưu dữ liệu tướng." });
	}
});

/**
 * @route   DELETE /api/champions/:championID
 * @desc    Xóa tướng theo championID
 */
router.delete(
	"/:championID",
	authenticateCognitoToken,
	requireAdmin,
	async (req, res) => {
		const { championID } = req.params;

		if (
			!championID ||
			typeof championID !== "string" ||
			championID.trim().length < 1
		) {
			return res.status(400).json({ error: "championID không hợp lệ." });
		}

		const id = championID.trim();

		try {
			const getCmd = new GetItemCommand({
				TableName: CHAMPIONS_TABLE,
				Key: marshall({ championID: id }),
			});
			const { Item } = await client.send(getCmd);

			if (!Item) {
				return res.status(404).json({ error: "Không tìm thấy tướng để xóa." });
			}

			const deleteCmd = new DeleteItemCommand({
				TableName: CHAMPIONS_TABLE,
				Key: marshall({ championID: id }),
			});

			await client.send(deleteCmd);
			
			// Xóa cache danh sách và cache chi tiết của tướng vừa xóa
			championCache.del("all_champions_list");
			championCache.del(`champion_detail_${id}`);

			const deletedChampion = unmarshall(Item);
			res.status(200).json({
				message: `Tướng "${deletedChampion.name}" (ID: ${id}) đã được xóa thành công.`,
			});
		} catch (error) {
			console.error("Lỗi khi xóa tướng:", error);
			res.status(500).json({ error: "Không thể xóa tướng." });
		}
	},
);

export default router;
