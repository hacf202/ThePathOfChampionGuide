// be/src/routes/powers.js
import express from "express";
import {
	ScanCommand,
	PutItemCommand,
	DeleteItemCommand,
	GetItemCommand, // THÊM: Để lấy chi tiết sức mạnh lẻ
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import NodeCache from "node-cache";
import client from "../config/db.js";
import { authenticateCognitoToken } from "../middleware/authenticate.js";
import { removeAccents } from "../utils/vietnameseUtils.js";

const router = express.Router();
const POWERS_TABLE = "guidePocPowers";

// Cache 5 phút (300s) vì dữ liệu Sức mạnh rất lớn và ít thay đổi liên tục
const powerCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

/**
 * Lấy dữ liệu từ RAM. Chỉ Scan Database 1 lần mỗi 5 phút.
 */
async function getCachedPowers() {
	const CACHE_KEY = "all_powers_data";
	let cachedData = powerCache.get(CACHE_KEY);

	if (!cachedData) {
		const command = new ScanCommand({ TableName: POWERS_TABLE });
		const { Items } = await client.send(command);
		cachedData = Items ? Items.map(item => unmarshall(item)) : [];

		// Sắp xếp mặc định A-Z để Index sẵn trong RAM
		cachedData.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

		powerCache.set(CACHE_KEY, cachedData);
	}
	return cachedData;
}

/**
 * @route   GET /api/powers/:powerCode
 * @desc    Lấy chi tiết một sức mạnh (Ưu tiên RAM -> Database)
 * FIX: Đồng bộ với Frontend
 */
router.get("/:powerCode", async (req, res) => {
	const { powerCode } = req.params;
	if (!powerCode)
		return res.status(400).json({ error: "powerCode là bắt buộc." });

	const id = powerCode.trim();
	const CACHE_KEY = `power_detail_${id}`;

	// 1. Kiểm tra Cache RAM trước
	const cachedPower = powerCache.get(CACHE_KEY);
	if (cachedPower) return res.json(cachedPower);

	try {
		// 2. Truy vấn DynamoDB
		const command = new GetItemCommand({
			TableName: POWERS_TABLE,
			Key: marshall({ powerCode: id }),
		});

		const { Item } = await client.send(command);
		if (!Item)
			return res.status(404).json({ error: `Không tìm thấy sức mạnh: ${id}` });

		const powerData = unmarshall(Item);

		// 3. Lưu vào Cache
		powerCache.set(CACHE_KEY, powerData);
		res.json(powerData);
	} catch (error) {
		console.error(`Lỗi lấy chi tiết sức mạnh ${id}:`, error);
		res.status(500).json({ error: "Lỗi hệ thống." });
	}
});

/**
 * @route   GET /api/powers
 * @desc    Lấy danh sách sức mạnh (Tối ưu cho >1000 items)
 */
router.get("/", async (req, res) => {
	try {
		const {
			page = 1,
			limit = 21,
			searchTerm = "",
			rarities = "",
			types = "",
			sort = "name-asc",
		} = req.query;
		const pageSize = parseInt(limit);
		const currentPage = parseInt(page);

		const allPowers = await getCachedPowers();

		const availableFilters = {
			rarities: [...new Set(allPowers.map(p => p.rarity))]
				.filter(Boolean)
				.sort(),
			types: [...new Set(allPowers.flatMap(p => p.type || []))]
				.filter(Boolean)
				.sort(),
		};

		let filtered = [...allPowers];
		if (searchTerm) {
			const searchKey = removeAccents(searchTerm);
			filtered = filtered.filter(p =>
				removeAccents(p.name || "").includes(searchKey),
			);
		}
		if (rarities) {
			const rList = rarities.split(",");
			filtered = filtered.filter(p => rList.includes(p.rarity));
		}
		if (types) {
			const tList = types.split(",");
			filtered = filtered.filter(p => p.type?.some(t => tList.includes(t)));
		}

		const [field, order] = sort.split("-");
		filtered.sort((a, b) => {
			let vA = a[field] ?? "";
			let vB = b[field] ?? "";
			return order === "asc"
				? vA.toString().localeCompare(vB.toString())
				: vB.toString().localeCompare(vA.toString());
		});

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
		res.status(500).json({ error: "Could not retrieve powers" });
	}
});

/**
 * @route   POST /api/powers/resolve
 * @desc    Lấy chi tiết danh sách Sức mạnh từ mảng tên
 */
router.post("/resolve", async (req, res) => {
	const { names } = req.body;
	if (!Array.isArray(names))
		return res.status(400).json({ error: "Names must be an array" });

	try {
		const allPowers = await getCachedPowers();
		const result = allPowers.filter(p => names.includes(p.name));
		res.json(result);
	} catch (error) {
		res.status(500).json({ error: "Lỗi truy vấn Powers" });
	}
});

// Cập nhật và Xóa xóa cache chi tiết
router.put("/", authenticateCognitoToken, async (req, res) => {
	const powerData = req.body;
	if (!powerData.powerCode)
		return res.status(400).json({ error: "Power code is required" });
	try {
		await client.send(
			new PutItemCommand({
				TableName: POWERS_TABLE,
				Item: marshall(powerData),
			}),
		);
		powerCache.del("all_powers_data");
		powerCache.del(`power_detail_${powerData.powerCode}`);
		res.status(200).json({ message: "Updated", power: powerData });
	} catch (e) {
		res.status(500).send(e.message);
	}
});

router.delete("/:powerCode", authenticateCognitoToken, async (req, res) => {
	try {
		await client.send(
			new DeleteItemCommand({
				TableName: POWERS_TABLE,
				Key: marshall({ powerCode: req.params.powerCode }),
			}),
		);
		powerCache.del("all_powers_data");
		powerCache.del(`power_detail_${req.params.powerCode}`);
		res.status(200).json({ message: "Deleted" });
	} catch (e) {
		res.status(500).send(e.message);
	}
});

export default router;
