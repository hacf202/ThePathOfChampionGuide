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
const constCache = new NodeCache({ stdTTL: 120, checkperiod: 60 });

// Lấy danh sách tất cả chòm sao (phục vụ cho Admin/Editor)
router.get("/", async (req, res) => {
	try {
		const command = new ScanCommand({ TableName: CONSTELLATIONS_TABLE });
		const { Items } = await client.send(command);
		const data = Items ? Items.map(item => unmarshall(item)) : [];
		res.json({ items: data });
	} catch (error) {
		console.error("Error fetching constellations:", error);
		res.status(500).json({ error: "Lỗi hệ thống." });
	}
});

// Lấy chi tiết chòm sao theo ID
router.get("/:constellationID", async (req, res) => {
	const { constellationID } = req.params;
	try {
		const command = new GetItemCommand({
			TableName: CONSTELLATIONS_TABLE,
			Key: marshall({ constellationID }),
		});
		const { Item } = await client.send(command);
		if (!Item)
			return res.status(404).json({ error: "Không tìm thấy chòm sao." });
		res.json(unmarshall(Item));
	} catch (error) {
		console.error("Error fetching constellation detail:", error);
		res.status(500).json({ error: "Lỗi hệ thống." });
	}
});

// Cập nhật chòm sao
router.put("/", authenticateCognitoToken, requireAdmin, async (req, res) => {
	const data = req.body;

	// KIỂM TRA DỮ LIỆU ĐẦU VÀO: Ngăn chặn lỗi 500 do thiếu Primary Key (constellationID)
	if (!data.constellationID || data.constellationID.trim() === "") {
		return res
			.status(400)
			.json({ error: "constellationID là bắt buộc và không được để trống." });
	}

	try {
		const command = new PutItemCommand({
			TableName: CONSTELLATIONS_TABLE,
			Item: marshall(data, { removeUndefinedValues: true }),
		});
		await client.send(command);

		// Xóa cache chi tiết chòm sao sau khi cập nhật thành công
		constCache.del(`const_detail_${data.constellationID}`);

		res.json({ message: "Cập nhật thành công.", data });
	} catch (error) {
		console.error("DynamoDB PutItem Error:", error);
		res.status(500).json({ error: "Lỗi lưu dữ liệu vào cơ sở dữ liệu." });
	}
});

// Xóa chòm sao
router.delete(
	"/:constellationID",
	authenticateCognitoToken,
	requireAdmin,
	async (req, res) => {
		const { constellationID } = req.params;
		try {
			// Kiểm tra sự tồn tại trước khi xóa (tùy chọn nhưng khuyến khích)
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

			// Xóa cache sau khi xóa thành công
			constCache.del(`const_detail_${constellationID}`);

			res.json({ message: "Đã xóa chòm sao thành công." });
		} catch (error) {
			console.error("Delete constellation error:", error);
			res.status(500).json({ error: "Lỗi khi xóa dữ liệu." });
		}
	},
);

export default router;
