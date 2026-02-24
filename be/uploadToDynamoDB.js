// src/routes/constellations.js
import express from "express";
import {
	ScanCommand,
	PutItemCommand,
	DeleteItemCommand,
	GetItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import client from "../config/db.js";
import NodeCache from "node-cache";
import { authenticateCognitoToken } from "../middleware/authenticate.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = express.Router();
const CONSTELLATIONS_TABLE = "guidePocChampionConstellation";

// Khởi tạo cache cho chòm sao: TTL 120 giây (2 phút)
const constCache = new NodeCache({ stdTTL: 120, checkperiod: 60 });

/**
 * @route   GET /api/constellations
 * @desc    Lấy danh sách tất cả các chòm sao (Admin/Editor)
 */
router.get("/", async (req, res) => {
	try {
		const command = new ScanCommand({ TableName: CONSTELLATIONS_TABLE });
		const { Items } = await client.send(command);
		const data = Items ? Items.map(item => unmarshall(item)) : [];
		res.json({ items: data });
	} catch (error) {
		console.error("Lỗi lấy danh sách chòm sao:", error);
		res.status(500).json({ error: "Lỗi hệ thống khi tải danh sách chòm sao." });
	}
});

/**
 * @route   GET /api/constellations/:constellationID
 * @desc    Lấy chi tiết chòm sao của một tướng
 */
router.get("/:constellationID", async (req, res) => {
	const { constellationID } = req.params;
	const CACHE_KEY = `const_detail_${constellationID}`;

	try {
		// Kiểm tra Cache
		const cached = constCache.get(CACHE_KEY);
		if (cached) return res.json(cached);

		const command = new GetItemCommand({
			TableName: CONSTELLATIONS_TABLE,
			Key: marshall({ constellationID }),
		});

		const { Item } = await client.send(command);
		if (!Item) {
			return res
				.status(404)
				.json({ error: "Không tìm thấy dữ liệu chòm sao cho tướng này." });
		}

		const data = unmarshall(Item);
		constCache.set(CACHE_KEY, data); // Lưu vào Cache
		res.json(data);
	} catch (error) {
		console.error("Lỗi lấy chi tiết chòm sao:", error);
		res.status(500).json({ error: "Lỗi hệ thống khi truy vấn chòm sao." });
	}
});

/**
 * @route   PUT /api/constellations
 * @desc    Tạo mới hoặc cập nhật chòm sao (Admin)
 */
router.put("/", authenticateCognitoToken, requireAdmin, async (req, res) => {
	const data = req.body;

	if (!data.constellationID || !Array.isArray(data.nodes)) {
		return res
			.status(400)
			.json({
				error: "championID (constellationID) và danh sách nodes là bắt buộc.",
			});
	}

	try {
		const command = new PutItemCommand({
			TableName: CONSTELLATIONS_TABLE,
			Item: marshall(data, { removeUndefinedValues: true }),
		});

		await client.send(command);

		// Xóa cache cũ sau khi cập nhật
		constCache.del(`const_detail_${data.constellationID}`);

		res.json({
			message: "Cập nhật dữ liệu chòm sao thành công.",
			constellationID: data.constellationID,
		});
	} catch (error) {
		console.error("Lỗi lưu chòm sao:", error);
		res
			.status(500)
			.json({ error: "Không thể lưu dữ liệu chòm sao vào hệ thống." });
	}
});

/**
 * @route   POST /api/constellations/sync
 * @desc    Đồng bộ dữ liệu hàng loạt từ mảng JSON (Dành cho việc đẩy data ban đầu)
 */
router.post(
	"/sync",
	authenticateCognitoToken,
	requireAdmin,
	async (req, res) => {
		const { data } = req.body;

		if (!Array.isArray(data)) {
			return res
				.status(400)
				.json({ error: "Dữ liệu gửi lên phải là một mảng chòm sao." });
		}

		try {
			const syncPromises = data.map(item => {
				const command = new PutItemCommand({
					TableName: CONSTELLATIONS_TABLE,
					Item: marshall(item, { removeUndefinedValues: true }),
				});
				return client.send(command);
			});

			await Promise.all(syncPromises);
			constCache.flushAll(); // Xóa toàn bộ cache

			res.json({
				message: `Đồng bộ thành công ${data.length} bản ghi chòm sao.`,
			});
		} catch (error) {
			console.error("Lỗi đồng bộ hàng loạt:", error);
			res.status(500).json({ error: "Quá trình đồng bộ dữ liệu thất bại." });
		}
	},
);

/**
 * @route   DELETE /api/constellations/:constellationID
 * @desc    Xóa dữ liệu chòm sao
 */
router.delete(
	"/:constellationID",
	authenticateCognitoToken,
	requireAdmin,
	async (req, res) => {
		const { constellationID } = req.params;

		try {
			const command = new DeleteItemCommand({
				TableName: CONSTELLATIONS_TABLE,
				Key: marshall({ constellationID }),
			});

			await client.send(command);
			constCache.del(`const_detail_${constellationID}`);

			res.json({ message: "Đã xóa dữ liệu chòm sao thành công." });
		} catch (error) {
			console.error("Lỗi khi xóa chòm sao:", error);
			res.status(500).json({ error: "Không thể xóa chòm sao." });
		}
	},
);

export default router;
