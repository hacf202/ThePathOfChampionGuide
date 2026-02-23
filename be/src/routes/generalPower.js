// be/src/routes/generalPower.js
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
const GENERAL_POWER_TABLE = "guidePocGeneralPowers";

// Khởi tạo cache: 300 giây (5 phút) vì dữ liệu này thường cố định
const generalPowerCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

/**
 * Hàm lấy toàn bộ dữ liệu từ DB và lưu vào Cache.
 */
async function getCachedGeneralPowers() {
	const CACHE_KEY = "all_general_powers_data";
	let cachedData = generalPowerCache.get(CACHE_KEY);

	if (!cachedData) {
		const command = new ScanCommand({ TableName: GENERAL_POWER_TABLE });
		const { Items } = await client.send(command);
		cachedData = Items ? Items.map(item => unmarshall(item)) : [];

		// Sắp xếp mặc định A-Z theo tên
		cachedData.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

		generalPowerCache.set(CACHE_KEY, cachedData);
	}
	return cachedData;
}

/**
 * @route   GET /api/generalPower
 * @desc    Lấy danh sách General Power (Phân trang, Tìm kiếm, Lọc, Cache)
 */
router.get("/", async (req, res) => {
	try {
		const {
			page = 1,
			limit = 20,
			searchTerm = "",
			rarities = "",
			sort = "name-asc",
		} = req.query;

		const pageSize = parseInt(limit);
		const currentPage = parseInt(page);

		// 1. Lấy dữ liệu từ Cache
		const allPowers = await getCachedGeneralPowers();

		// 2. Trích xuất bộ lọc động (ví dụ: Rarity)
		const availableFilters = {
			rarities: [...new Set(allPowers.map(p => p.rarity))]
				.filter(Boolean)
				.sort(),
		};

		// 3. Thực hiện lọc trên RAM
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

		// 4. Sắp xếp
		const [field, order] = sort.split("-");
		filtered.sort((a, b) => {
			let vA = a[field] ?? "";
			let vB = b[field] ?? "";

			// Xử lý kiểu chuỗi hoặc số
			if (typeof vA === "string") {
				return order === "asc"
					? vA.localeCompare(vB.toString())
					: vB.toString().localeCompare(vA);
			}
			return order === "asc" ? vA - vB : vB - vA;
		});

		// 5. Phân trang
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
		console.error("Lỗi API General Power:", error);
		res.status(500).json({ error: "Could not retrieve general powers" });
	}
});

/**
 * @route   PUT /api/generalPower
 * @desc    Cập nhật hoặc thêm mới (Xóa cache sau khi thành công)
 */
router.put("/", authenticateCognitoToken, async (req, res) => {
	const generalPowerData = req.body;

	if (!generalPowerData.generalPowerCode) {
		return res.status(400).json({ error: "General power code is required" });
	}

	try {
		const command = new PutItemCommand({
			TableName: GENERAL_POWER_TABLE,
			Item: marshall(generalPowerData, { removeUndefinedValues: true }),
		});

		await client.send(command);

		// Xóa cache để dữ liệu mới được cập nhật ở lần gọi GET tiếp theo
		generalPowerCache.del("all_general_powers_data");

		res.status(200).json({
			message: "General power data updated successfully",
			generalPower: generalPowerData,
		});
	} catch (error) {
		console.error("Error updating general power data:", error);
		res.status(500).json({ error: "Could not update general power data" });
	}
});

/**
 * @route   DELETE /api/generalPower/:generalPowerCode
 * @desc    Xóa theo mã (Xóa cache sau khi thành công)
 */
router.delete(
	"/:generalPowerCode",
	authenticateCognitoToken,
	async (req, res) => {
		const { generalPowerCode } = req.params;

		try {
			const command = new DeleteItemCommand({
				TableName: GENERAL_POWER_TABLE,
				Key: marshall({ generalPowerCode }),
			});

			await client.send(command);

			// Xóa cache
			generalPowerCache.del("all_general_powers_data");

			res.status(200).json({
				message: `General power with code ${generalPowerCode} deleted successfully`,
			});
		} catch (error) {
			console.error("Error deleting general power:", error);
			res.status(500).json({ error: "Could not delete general power" });
		}
	},
);

export default router;
