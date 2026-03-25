// be/src/routes/adventures.js
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
const ADVENTURE_TABLE = "guidePocAdventureMap";

const advCache = new NodeCache({ stdTTL: 120, checkperiod: 60 });

router.get("/", async (req, res) => {
	const CACHE_KEY = "all_adventures_list";
	try {
		const cached = advCache.get(CACHE_KEY);
		if (cached) return res.json({ items: cached });

		const command = new ScanCommand({ TableName: ADVENTURE_TABLE });
		const { Items } = await client.send(command);
		const data = Items ? Items.map(item => unmarshall(item)) : [];

		data.sort((a, b) => (a.difficulty || 0) - (b.difficulty || 0));

		advCache.set(CACHE_KEY, data);
		res.json({ items: data });
	} catch (error) {
		console.error("Lỗi GET /adventures:", error);
		res
			.status(500)
			.json({ error: "Lỗi hệ thống khi tải danh sách Adventure." });
	}
});

router.get("/:adventureID", async (req, res) => {
	const { adventureID } = req.params;
	try {
		const command = new GetItemCommand({
			TableName: ADVENTURE_TABLE,
			Key: marshall({ adventureID }),
		});
		const { Item } = await client.send(command);
		if (!Item)
			return res.status(404).json({ error: "Không tìm thấy Adventure." });
		res.json(unmarshall(Item));
	} catch (error) {
		res.status(500).json({ error: "Lỗi hệ thống khi tải chi tiết Adventure." });
	}
});

router.put("/", authenticateCognitoToken, requireAdmin, async (req, res) => {
	const data = req.body;
	const { adventureID, isNew, adventureName } = data;

	if (!adventureID || !adventureName) {
		return res
			.status(400)
			.json({ error: "adventureID và adventureName là bắt buộc." });
	}

	try {
		const checkCommand = new GetItemCommand({
			TableName: ADVENTURE_TABLE,
			Key: marshall({ adventureID: adventureID.trim() }),
		});
		const { Item } = await client.send(checkCommand);
		const exists = !!Item;

		if (isNew && exists) {
			return res
				.status(409)
				.json({ error: `Mã Adventure "${adventureID}" đã tồn tại.` });
		}
		if (!isNew && !exists) {
			return res
				.status(404)
				.json({ error: `Không tìm thấy Adventure "${adventureID}".` });
		}

		const dataToSave = { ...data };
		delete dataToSave.isNew;

		// marshall với removeUndefinedValues sẽ tự động dọn dẹp và lưu các cấu trúc lồng nhau (nested array) như mapBonusPower mà không cần định nghĩa Schema
		const command = new PutItemCommand({
			TableName: ADVENTURE_TABLE,
			Item: marshall(dataToSave, { removeUndefinedValues: true }),
		});

		await client.send(command);
		advCache.flushAll();

		res.json({
			message: isNew
				? "Tạo Adventure thành công."
				: "Cập nhật Adventure thành công.",
			data: dataToSave,
		});
	} catch (error) {
		console.error("Lỗi khi lưu Adventure:", error);
		res.status(500).json({ error: "Lỗi hệ thống. Không thể lưu dữ liệu." });
	}
});

router.delete(
	"/:adventureID",
	authenticateCognitoToken,
	requireAdmin,
	async (req, res) => {
		const { adventureID } = req.params;
		try {
			const command = new DeleteItemCommand({
				TableName: ADVENTURE_TABLE,
				Key: marshall({ adventureID }),
			});
			await client.send(command);
			advCache.flushAll();
			res.json({ message: "Đã xóa Adventure thành công." });
		} catch (error) {
			res.status(500).json({ error: "Lỗi hệ thống khi thực hiện xóa." });
		}
	},
);

export default router;
