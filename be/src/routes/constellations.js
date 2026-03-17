// be/src/routes/constellations.js
import express from "express";
import {
	GetItemCommand,
	PutItemCommand,
	DeleteItemCommand,
	ScanCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import client from "../config/db.js";
import NodeCache from "node-cache";
import { authenticateCognitoToken } from "../middleware/authenticate.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = express.Router();
const CONSTELLATIONS_TABLE = "guidePocChampionConstellation";

// Cache 2 phút, check hết hạn mỗi phút
const constCache = new NodeCache({ stdTTL: 120, checkperiod: 60 });

/**
 * Hàm lấy danh sách Chòm sao có sử dụng Cache
 */
async function getCachedConstellations() {
	const CACHE_KEY = "all_constellations_list";
	let cachedData = constCache.get(CACHE_KEY);

	if (!cachedData) {
		const command = new ScanCommand({ TableName: CONSTELLATIONS_TABLE });
		const { Items } = await client.send(command);
		cachedData = Items ? Items.map(item => unmarshall(item)) : [];

		// Sắp xếp mặc định theo tên A-Z
		cachedData.sort((a, b) =>
			(a.championName || "").localeCompare(b.championName || ""),
		);

		constCache.set(CACHE_KEY, cachedData);
	}
	return cachedData;
}

/**
 * @route   GET /api/constellations
 * @desc    Lấy danh sách tất cả chòm sao (phục vụ cho Admin/Editor)
 */
router.get("/", async (req, res) => {
	try {
		const data = await getCachedConstellations();
		res.json({ items: data });
	} catch (error) {
		console.error("Lỗi fetching constellations:", error);
		res.status(500).json({ error: "Lỗi hệ thống khi tải chòm sao." });
	}
});

/**
 * @route   GET /api/constellations/:constellationID
 * @desc    Lấy chi tiết chòm sao theo ID
 */
router.get("/:constellationID", async (req, res) => {
	const { constellationID } = req.params;

	if (!constellationID) {
		return res.status(400).json({ error: "constellationID là bắt buộc." });
	}

	const CACHE_KEY = `const_detail_${constellationID}`;

	try {
		// 1. Kiểm tra Cache
		const cachedData = constCache.get(CACHE_KEY);
		if (cachedData) return res.json(cachedData);

		// 2. Query DynamoDB
		const command = new GetItemCommand({
			TableName: CONSTELLATIONS_TABLE,
			Key: marshall({ constellationID }),
		});

		const { Item } = await client.send(command);

		if (!Item) {
			return res.status(404).json({ error: "Không tìm thấy chòm sao." });
		}

		const data = unmarshall(Item);

		// 3. Set Cache
		constCache.set(CACHE_KEY, data);

		res.json(data);
	} catch (error) {
		console.error("Lỗi chi tiết chòm sao:", error);
		res.status(500).json({ error: "Lỗi truy vấn cơ sở dữ liệu." });
	}
});

/**
 * @route   PUT /api/constellations
 * @desc    Tạo mới hoặc cập nhật chòm sao (Sẵn sàng cho schema mới)
 */
router.put("/", authenticateCognitoToken, requireAdmin, async (req, res) => {
	const data = req.body;

	if (!data.constellationID) {
		return res
			.status(400)
			.json({ error: "Thiếu mã định danh chòm sao (constellationID)." });
	}

	try {
		// BƯỚC LỌC DỮ LIỆU RÁC (Data Sanitization)
		// Đảm bảo không có data rác (nodeName, description) bị lọt vào DB theo schema mới
		if (Array.isArray(data.nodes)) {
			data.nodes = data.nodes.map(node => {
				const cleanNode = { ...node };
				if (
					cleanNode.referenceId ||
					cleanNode.powerCode ||
					cleanNode.bonusStarID
				) {
					delete cleanNode.nodeName;
					delete cleanNode.description;
				}
				return cleanNode;
			});
		}

		// Xóa cờ isNew nếu có gửi từ frontend
		delete data.isNew;

		const command = new PutItemCommand({
			TableName: CONSTELLATIONS_TABLE,
			Item: marshall(data, { removeUndefinedValues: true }),
		});

		await client.send(command);

		// Xóa cache để dữ liệu mới được hiển thị ngay
		constCache.del(`const_detail_${data.constellationID}`);
		constCache.del("all_constellations_list");

		res.json({ message: "Cập nhật chòm sao thành công.", data });
	} catch (error) {
		console.error("DynamoDB PutItem Error:", error);
		res.status(500).json({ error: "Lỗi lưu dữ liệu chòm sao vào hệ thống." });
	}
});

/**
 * @route   DELETE /api/constellations/:constellationID
 * @desc    Xóa chòm sao
 */
router.delete(
	"/:constellationID",
	authenticateCognitoToken,
	requireAdmin,
	async (req, res) => {
		const { constellationID } = req.params;
		try {
			// Kiểm tra sự tồn tại trước khi xóa
			const checkCmd = new GetItemCommand({
				TableName: CONSTELLATIONS_TABLE,
				Key: marshall({ constellationID }),
			});
			const { Item } = await client.send(checkCmd);

			if (!Item) {
				return res
					.status(404)
					.json({ error: "Không tìm thấy chòm sao để xóa." });
			}

			await client.send(
				new DeleteItemCommand({
					TableName: CONSTELLATIONS_TABLE,
					Key: marshall({ constellationID }),
				}),
			);

			// Xóa Cache
			constCache.del(`const_detail_${constellationID}`);
			constCache.del("all_constellations_list");

			res.json({ message: "Xóa chòm sao thành công." });
		} catch (error) {
			console.error("Error deleting constellation:", error);
			res.status(500).json({ error: "Lỗi hệ thống khi xóa chòm sao." });
		}
	},
);

export default router;
