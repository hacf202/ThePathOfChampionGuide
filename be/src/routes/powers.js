// be/src/routes/powers.js
import express from "express";
import {
	ScanCommand,
	PutItemCommand,
	DeleteItemCommand,
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
 * TỐI ƯU: Lấy dữ liệu từ RAM. Chỉ Scan Database 1 lần mỗi 5 phút.
 * Với >1000 items, việc giữ mảng trong RAM (khoảng 2-5MB) hiệu quả hơn nhiều so với gọi DB.
 */
async function getCachedPowers() {
	const CACHE_KEY = "all_powers_data";
	let cachedData = powerCache.get(CACHE_KEY);

	if (!cachedData) {
		console.time("DynamoDB_Scan_Powers");
		const command = new ScanCommand({ TableName: POWERS_TABLE });
		const { Items } = await client.send(command);
		cachedData = Items ? Items.map(item => unmarshall(item)) : [];

		// Sắp xếp mặc định A-Z để Index sẵn trong RAM
		cachedData.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

		powerCache.set(CACHE_KEY, cachedData);
		console.timeEnd("DynamoDB_Scan_Powers");
	}
	return cachedData;
}

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

		// 1. Lấy dữ liệu từ Cache RAM (Tốc độ ~1ms)
		const allPowers = await getCachedPowers();

		// 2. TRÍCH XUẤT BỘ LỌC ĐỘNG (Dựa trên 1000+ items thực tế)
		// Dùng Set để lấy các giá trị duy nhất
		const availableFilters = {
			rarities: [...new Set(allPowers.map(p => p.rarity))]
				.filter(Boolean)
				.sort(),
			types: [...new Set(allPowers.flatMap(p => p.type || []))]
				.filter(Boolean)
				.sort(),
		};

		// 3. LỌC DỮ LIỆU TRÊN RAM (Vô cùng nhanh với mảng 1000 phần tử)
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

		// 4. SẮP XẾP
		const [field, order] = sort.split("-");
		filtered.sort((a, b) => {
			let vA = a[field] ?? "";
			let vB = b[field] ?? "";
			return order === "asc"
				? vA.toString().localeCompare(vB.toString())
				: vB.toString().localeCompare(vA.toString());
		});

		// 5. PHÂN TRANG (Chỉ gửi 21 items về Client để tiết kiệm băng thông)
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
		console.error("Lỗi API Powers:", error);
		res.status(500).json({ error: "Could not retrieve powers" });
	}
});

// Cập nhật & Xóa: Phải xóa cache ngay lập tức
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
		powerCache.del("all_powers_data"); // Ép buộc load lại dữ liệu mới
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
		res.status(200).json({ message: "Deleted" });
	} catch (e) {
		res.status(500).send(e.message);
	}
});

export default router;
