// be/src/routes/relics.js
import express from "express";
import {
	ScanCommand,
	PutItemCommand,
	DeleteItemCommand,
	GetItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import NodeCache from "node-cache";
import axios from "axios";
import client from "../config/db.js";
import { authenticateCognitoToken } from "../middleware/authenticate.js";
import { removeAccents } from "../utils/vietnameseUtils.js";

const router = express.Router();
const RELICS_TABLE = "guidePocRelics";

const imageCache = new Map();
const relicCache = new NodeCache({ stdTTL: 120 });

/**
 * Lấy toàn bộ dữ liệu Relics từ DB hoặc Cache
 */
async function getCachedRelics() {
	const CACHE_KEY = "all_relics_data";
	let cachedData = relicCache.get(CACHE_KEY);

	if (!cachedData) {
		const command = new ScanCommand({ TableName: RELICS_TABLE });
		const { Items } = await client.send(command);
		cachedData = Items ? Items.map(item => unmarshall(item)) : [];
		cachedData.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
		relicCache.set(CACHE_KEY, cachedData);
	}
	return cachedData;
}

/**
 * @route   GET /api/relics/proxy-image
 * @desc    Proxy hình ảnh từ Riot để tránh lỗi CORS và Referer
 */
router.get("/proxy-image", async (req, res) => {
	const imageUrl = req.query.url;

	if (!imageUrl) {
		return res.status(400).json({ error: "URL là bắt buộc." });
	}

	try {
		if (imageCache.has(imageUrl)) {
			const cached = imageCache.get(imageUrl);
			res.set("Content-Type", cached.contentType);
			res.set("Cache-Control", "public, max-age=86400");
			return res.send(cached.data);
		}

		const response = await axios({
			url: imageUrl,
			method: "GET",
			responseType: "arraybuffer",
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
			},
			timeout: 10000,
		});

		const contentType = response.headers["content-type"];
		const buffer = Buffer.from(response.data, "binary");

		if (imageCache.size < 500) {
			imageCache.set(imageUrl, {
				data: buffer,
				contentType: contentType,
			});
		}

		res.set("Content-Type", contentType);
		res.set("Cache-Control", "public, max-age=86400");
		res.send(buffer);
	} catch (error) {
		console.error(`Proxy lỗi cho ${imageUrl}:`, error.message);
		res.status(404).json({ error: "Không thể tải ảnh." });
	}
});

/**
 * @route   GET /api/relics/:relicCode
 * @desc    Lấy chi tiết một cổ vật
 */
router.get("/:relicCode", async (req, res) => {
	const { relicCode } = req.params;
	if (!relicCode)
		return res.status(400).json({ error: "relicCode là bắt buộc." });

	const id = relicCode.trim();
	const CACHE_KEY = `relic_detail_${id}`;

	const cachedRelic = relicCache.get(CACHE_KEY);
	if (cachedRelic) return res.json(cachedRelic);

	try {
		const command = new GetItemCommand({
			TableName: RELICS_TABLE,
			Key: marshall({ relicCode: id }),
		});

		const { Item } = await client.send(command);
		if (!Item)
			return res.status(404).json({ error: `Không tìm thấy cổ vật: ${id}` });

		const relicData = unmarshall(Item);
		relicCache.set(CACHE_KEY, relicData);
		res.json(relicData);
	} catch (error) {
		console.error(`Lỗi khi lấy chi tiết cổ vật ${id}:`, error);
		res.status(500).json({ error: "Lỗi hệ thống khi truy vấn dữ liệu." });
	}
});

/**
 * @route   GET /api/relics
 * @desc    Lấy danh sách cổ vật
 */
router.get("/", async (req, res) => {
	try {
		const {
			page = 1,
			limit = 24,
			searchTerm = "",
			rarities = "",
			types = "",
			stacks = "",
			sort = "name-asc",
		} = req.query;
		const pageSize = parseInt(limit);
		const currentPage = parseInt(page);
		const allRelics = await getCachedRelics();

		const availableFilters = {
			rarities: [...new Set(allRelics.map(r => r.rarity))]
				.filter(Boolean)
				.sort(),
			types: [...new Set(allRelics.map(r => r.type))].filter(Boolean).sort(),
			stacks: [...new Set(allRelics.map(r => String(r.stack)))]
				.filter(Boolean)
				.sort(),
		};

		let filtered = [...allRelics];
		if (searchTerm) {
			const searchKey = removeAccents(searchTerm.toLowerCase());
			filtered = filtered.filter(r => {
				const nameVn = removeAccents(r.name || "");
				const descVn = removeAccents(r.description || "");
				const nameEn = removeAccents(r.translations?.en?.name || "");
				const descEn = removeAccents(r.translations?.en?.description || "");

				return (
					nameVn.includes(searchKey) ||
					descVn.includes(searchKey) ||
					nameEn.includes(searchKey) ||
					descEn.includes(searchKey)
				);
			});
		}
		if (rarities) {
			const rList = rarities.split(",");
			filtered = filtered.filter(r => rList.includes(r.rarity));
		}
		if (types) {
			const tList = types.split(",");
			filtered = filtered.filter(r => tList.includes(r.type));
		}
		if (stacks) {
			const sList = stacks.split(",");
			filtered = filtered.filter(r => sList.includes(String(r.stack)));
		}

		const [field, order] = sort.split("-");
		filtered.sort((a, b) => {
			let vA = a[field] ?? "";
			let vB = b[field] ?? "";
			return order === "asc"
				? vA.toString().localeCompare(vB.toString())
				: vB.toString().localeCompare(vA.toString());
		});

		if (pageSize === -1) {
			return res.json({
				items: filtered,
				pagination: {
					totalItems: filtered.length,
					totalPages: 1,
					currentPage: 1,
					pageSize: filtered.length,
				},
				availableFilters,
			});
		}

		const totalItems = filtered.length;
		const totalPages = Math.ceil(totalItems / pageSize);
		const paginatedItems = filtered.slice(
			(currentPage - 1) * pageSize,
			currentPage * pageSize,
		);

		res.json({
			items: paginatedItems,
			pagination: { totalItems, totalPages, currentPage, pageSize },
			availableFilters,
		});
	} catch (error) {
		res.status(500).json({ error: "Không thể lấy danh sách cổ vật." });
	}
});

/**
 * @route   POST /api/relics/resolve
 * @desc    Lấy chi tiết danh sách Cổ vật từ mảng IDs
 */
router.post("/resolve", async (req, res) => {
	const { ids } = req.body;
	if (!Array.isArray(ids))
		return res.status(400).json({ error: "ids must be an array" });
	try {
		const allRelics = await getCachedRelics();
		const result = allRelics.filter(r => ids.includes(r.relicCode));
		res.json(result);
	} catch (error) {
		res.status(500).json({ error: "Lỗi truy vấn Relics" });
	}
});

/**
 * @route   PUT /api/relics
 * @desc    Tạo mới hoặc cập nhật Cổ vật (Kiểm tra tồn tại)
 */
router.put("/", authenticateCognitoToken, async (req, res) => {
	const relicData = req.body;
	const { relicCode, isNew } = relicData;

	if (!relicCode)
		return res
			.status(400)
			.json({ error: "Mã cổ vật (relicCode) là bắt buộc." });

	try {
		const checkCommand = new GetItemCommand({
			TableName: RELICS_TABLE,
			Key: marshall({ relicCode: relicCode.trim() }),
		});
		const { Item } = await client.send(checkCommand);
		const exists = !!Item;

		if (isNew && exists) {
			return res.status(409).json({
				error: `Mã cổ vật "${relicCode}" đã tồn tại. Không thể tạo trùng.`,
			});
		}

		if (!isNew && !exists) {
			return res.status(404).json({
				error: `Mã cổ vật "${relicCode}" không tồn tại. Không thể cập nhật.`,
			});
		}

		const dataToSave = { ...relicData };
		delete dataToSave.isNew;

		await client.send(
			new PutItemCommand({
				TableName: RELICS_TABLE,
				Item: marshall(dataToSave),
			}),
		);

		relicCache.del("all_relics_data");
		relicCache.del(`relic_detail_${relicCode}`);

		res.status(200).json({
			message: isNew ? "Tạo mới thành công" : "Cập nhật thành công",
			relic: dataToSave,
		});
	} catch (error) {
		console.error("Lỗi cập nhật Relics:", error);
		res.status(500).json({ error: "Lỗi hệ thống khi lưu cổ vật." });
	}
});

/**
 * @route   DELETE /api/relics/:relicCode
 * @desc    Xóa cổ vật
 */
router.delete("/:relicCode", authenticateCognitoToken, async (req, res) => {
	const { relicCode } = req.params;
	try {
		await client.send(
			new DeleteItemCommand({
				TableName: RELICS_TABLE,
				Key: marshall({ relicCode }),
			}),
		);
		relicCache.del("all_relics_data");
		relicCache.del(`relic_detail_${relicCode}`);
		res.status(200).json({ message: "Đã xóa cổ vật thành công." });
	} catch (error) {
		console.error("Lỗi xóa Relics:", error);
		res.status(500).json({ error: "Lỗi hệ thống khi xóa dữ liệu." });
	}
});

export default router;
