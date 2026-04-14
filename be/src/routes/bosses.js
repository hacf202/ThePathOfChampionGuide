// be/src/routes/bosses.js
import express from "express";
import {
	ScanCommand,
	PutItemCommand,
	DeleteItemCommand,
	GetItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import cacheManager from "../utils/cacheManager.js";
import client from "../config/db.js";
import { authenticateCognitoToken } from "../middleware/authenticate.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { scanAll } from "../utils/dynamoUtils.js";
import { createAuditLog } from "../utils/auditLogger.js";

const router = express.Router();
const BOSS_TABLE = "guidePocBosses";

const bossCache = cacheManager.getOrCreateCache("bosses", { stdTTL: 86400, checkperiod: 60 });

router.get("/", async (req, res) => {
	const CACHE_KEY = "all_bosses_list";
	try {
		const cached = bossCache.get(CACHE_KEY);
		if (cached) return res.json({ items: cached });

		const rawItems = await scanAll(client, { TableName: BOSS_TABLE });
		const data = rawItems.map(item => unmarshall(item));

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

// [Thêm mới] API Resolve nhiều Boss cùng lúc để tránh N+1 Query trên Frontend
router.post("/resolve", async (req, res) => {
	const { ids } = req.body;

	if (!ids || !Array.isArray(ids)) {
		return res
			.status(400)
			.json({ error: "Tham số 'ids' phải là một mảng (array)." });
	}

	try {
		// Loại bỏ các ID trùng lặp
		const uniqueIds = [...new Set(ids)];
		if (uniqueIds.length === 0) return res.json([]);

		// Tối ưu 1: Kiểm tra xem có sẵn toàn bộ Boss trong cache tổng không (Cực nhanh)
		const allBosses = bossCache.get("all_bosses_list");
		if (allBosses) {
			const resolvedFromCache = allBosses.filter(b =>
				uniqueIds.includes(b.bossID),
			);
			// Nếu cache có chứa đầy đủ tất cả các Boss đang cần tìm
			if (resolvedFromCache.length === uniqueIds.length) {
				return res.json(resolvedFromCache);
			}
		}

		// Tối ưu 2: Nếu Cache thiếu, fetch song song các ID từ DynamoDB
		const fetchPromises = uniqueIds.map(async bossID => {
			const command = new GetItemCommand({
				TableName: BOSS_TABLE,
				Key: marshall({ bossID }),
			});
			const { Item } = await client.send(command);
			return Item ? unmarshall(Item) : null;
		});

		// Chờ tất cả truy vấn hoàn thành và lọc bỏ các giá trị null (không tìm thấy)
		const results = (await Promise.all(fetchPromises)).filter(Boolean);

		res.json(results);
	} catch (error) {
		console.error("Lỗi POST /bosses/resolve:", error);
		res.status(500).json({ error: "Lỗi hệ thống khi resolve danh sách Boss." });
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

		// Ghi log thay đổi
		await createAuditLog({
			action: isNew ? "CREATE" : "UPDATE",
			entityType: "boss",
			entityId: bossID,
			entityName: dataToSave.bossName,
			oldData: Item ? unmarshall(Item) : null,
			newData: dataToSave,
			user: req.user
		});

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
			// Lấy dữ liệu cũ để ghi log
			const getItemCmd = new GetItemCommand({
				TableName: BOSS_TABLE,
				Key: marshall({ bossID }),
			});
			const { Item } = await client.send(getItemCmd);
			const oldData = Item ? unmarshall(Item) : null;

			const deleteCmd = new DeleteItemCommand({
				TableName: BOSS_TABLE,
				Key: marshall({ bossID }),
			});
			await client.send(deleteCmd);

			// Ghi log thay đổi
			await createAuditLog({
				action: "DELETE",
				entityType: "boss",
				entityId: bossID,
				entityName: oldData?.bossName || bossID,
				oldData: oldData,
				newData: null,
				user: req.user
			});

			bossCache.flushAll();
			res.json({ message: "Đã xóa Boss thành công." });
		} catch (error) {
			console.error("Lỗi xóa Boss:", error);
			res.status(500).json({ error: "Lỗi hệ thống khi thực hiện xóa." });
		}
	},
);

export default router;
