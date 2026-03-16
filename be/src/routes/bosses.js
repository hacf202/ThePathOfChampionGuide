// be/src/routes/bosses.js
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
const BOSS_TABLE = "guidePocBosses";

const bossCache = new NodeCache({ stdTTL: 120, checkperiod: 60 });

router.get("/", async (req, res) => {
	const CACHE_KEY = "all_bosses_list";
	try {
		const cached = bossCache.get(CACHE_KEY);
		if (cached) return res.json({ items: cached });

		const command = new ScanCommand({ TableName: BOSS_TABLE });
		const { Items } = await client.send(command);
		const data = Items ? Items.map(item => unmarshall(item)) : [];

		data.sort((a, b) => (a.bossName || "").localeCompare(b.bossName || ""));

		bossCache.set(CACHE_KEY, data);
		res.json({ items: data });
	} catch (error) {
		console.error("Lỗi GET /bosses:", error);
		res.status(500).json({ error: "Lỗi hệ thống khi tải danh sách Boss." });
	}
});

router.get("/:bossID", async (req, res) => {
	const { bossID } = req.params;
	try {
		const command = new GetItemCommand({
			TableName: BOSS_TABLE,
			Key: marshall({ bossID }),
		});
		const { Item } = await client.send(command);
		if (!Item) return res.status(404).json({ error: "Không tìm thấy Boss." });
		res.json(unmarshall(Item));
	} catch (error) {
		res.status(500).json({ error: "Lỗi hệ thống khi tải chi tiết Boss." });
	}
});

router.put("/", authenticateCognitoToken, requireAdmin, async (req, res) => {
	const data = req.body;
	const { bossID, isNew, bossName } = data;

	if (!bossID || !bossName) {
		return res.status(400).json({ error: "bossID và bossName là bắt buộc." });
	}

	try {
		const checkCommand = new GetItemCommand({
			TableName: BOSS_TABLE,
			Key: marshall({ bossID: bossID.trim() }),
		});
		const { Item } = await client.send(checkCommand);
		const exists = !!Item;

		if (isNew && exists) {
			return res.status(409).json({ error: `Mã Boss "${bossID}" đã tồn tại.` });
		}
		if (!isNew && !exists) {
			return res
				.status(404)
				.json({ error: `Không tìm thấy Boss "${bossID}".` });
		}

		const dataToSave = { ...data };
		delete dataToSave.isNew;

		const command = new PutItemCommand({
			TableName: BOSS_TABLE,
			Item: marshall(dataToSave, { removeUndefinedValues: true }),
		});

		await client.send(command);
		bossCache.flushAll();

		res.json({
			message: isNew ? "Tạo Boss thành công." : "Cập nhật Boss thành công.",
			data: dataToSave,
		});
	} catch (error) {
		console.error("Lỗi khi lưu Boss:", error);
		res.status(500).json({ error: "Lỗi hệ thống. Không thể lưu dữ liệu." });
	}
});

router.delete(
	"/:bossID",
	authenticateCognitoToken,
	requireAdmin,
	async (req, res) => {
		const { bossID } = req.params;
		try {
			const command = new DeleteItemCommand({
				TableName: BOSS_TABLE,
				Key: marshall({ bossID }),
			});
			await client.send(command);
			bossCache.flushAll();
			res.json({ message: "Đã xóa Boss thành công." });
		} catch (error) {
			res.status(500).json({ error: "Lỗi hệ thống khi thực hiện xóa." });
		}
	},
);

export default router;
