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
		res.status(500).json({ error: "Lỗi hệ thống." });
	}
});

// Cập nhật chòm sao
router.put("/", authenticateCognitoToken, requireAdmin, async (req, res) => {
	const data = req.body;
	try {
		const command = new PutItemCommand({
			TableName: CONSTELLATIONS_TABLE,
			Item: marshall(data, { removeUndefinedValues: true }),
		});
		await client.send(command);
		constCache.del(`const_detail_${data.constellationID}`);
		res.json({ message: "Cập nhật thành công.", data });
	} catch (error) {
		res.status(500).json({ error: "Lỗi lưu dữ liệu." });
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
			await client.send(
				new DeleteItemCommand({
					TableName: CONSTELLATIONS_TABLE,
					Key: marshall({ constellationID }),
				}),
			);
			res.json({ message: "Đã xóa chòm sao." });
		} catch (error) {
			res.status(500).json({ error: "Lỗi khi xóa." });
		}
	},
);

export default router;
