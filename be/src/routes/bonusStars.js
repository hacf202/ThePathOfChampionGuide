// be/src/routes/bonusStars.js
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
const BONUS_STAR_TABLE = "guidePocBonusStar";

// Cache dữ liệu trong 2 phút để giảm tải cho DynamoDB
const bonusCache = new NodeCache({ stdTTL: 120, checkperiod: 60 });

/**
 * @route   GET /api/bonusStars
 * @desc    Lấy danh sách tất cả Bonus Star (Có sử dụng Cache)
 */
router.get("/", async (req, res) => {
	const CACHE_KEY = "all_bonus_stars_list";
	try {
		const cached = bonusCache.get(CACHE_KEY);
		if (cached) return res.json({ items: cached });

		const command = new ScanCommand({ TableName: BONUS_STAR_TABLE });
		const { Items } = await client.send(command);
		const data = Items ? Items.map(item => unmarshall(item)) : [];

		// Sắp xếp theo tên A-Z
		data.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

		bonusCache.set(CACHE_KEY, data);
		res.json({ items: data });
	} catch (error) {
		console.error("Lỗi GET /bonusStars:", error);
		res.status(500).json({ error: "Lỗi hệ thống khi tải danh sách." });
	}
});

/**
 * @route   PUT /api/bonusStars
 * @desc    Tạo mới hoặc Cập nhật Bonus Star (Kiểm tra tồn tại ID)
 */
router.put("/", authenticateCognitoToken, requireAdmin, async (req, res) => {
	const data = req.body;
	const { bonusStarID, isNew, name } = data;

	// Kiểm tra các trường bắt buộc
	if (!bonusStarID || !name) {
		return res.status(400).json({ error: "bonusStarID và name là bắt buộc." });
	}

	try {
		// Bước 1: Kiểm tra thực tế trong Database bằng GetItem
		const checkCommand = new GetItemCommand({
			TableName: BONUS_STAR_TABLE,
			Key: marshall({ bonusStarID: bonusStarID.trim() }),
		});
		const { Item } = await client.send(checkCommand);
		const exists = !!Item;

		// Bước 2: Kiểm tra logic nghiệp vụ theo yêu cầu
		// Trường hợp TẠO MỚI: Nếu ID đã tồn tại -> Báo lỗi 409 Conflict
		if (isNew && exists) {
			return res.status(409).json({
				error: `Mã Bonus Star "${bonusStarID}" đã tồn tại. Vui lòng sử dụng mã khác.`,
			});
		}

		// Trường hợp CẬP NHẬT: Nếu ID chưa có trong DB -> Báo lỗi 404 Not Found
		if (!isNew && !exists) {
			return res.status(404).json({
				error: `Không tìm thấy Bonus Star với mã "${bonusStarID}" để cập nhật.`,
			});
		}

		// Bước 3: Chuẩn bị dữ liệu để lưu
		const dataToSave = { ...data };
		delete dataToSave.isNew; // Xóa cờ hiệu của frontend trước khi lưu vào DB

		const command = new PutItemCommand({
			TableName: BONUS_STAR_TABLE,
			Item: marshall(dataToSave, { removeUndefinedValues: true }),
		});

		await client.send(command);

		// Bước 4: Làm mới Cache để UI cập nhật ngay lập tức
		bonusCache.flushAll();

		res.json({
			message: isNew
				? "Tạo mới Bonus Star thành công."
				: "Cập nhật Bonus Star thành công.",
			data: dataToSave,
		});
	} catch (error) {
		console.error("Lỗi khi lưu Bonus Star:", error);
		res.status(500).json({ error: "Lỗi hệ thống. Không thể lưu dữ liệu." });
	}
});

/**
 * @route   DELETE /api/bonusStars/:bonusStarID
 * @desc    Xóa Bonus Star theo ID
 */
router.delete(
	"/:bonusStarID",
	authenticateCognitoToken,
	requireAdmin,
	async (req, res) => {
		const { bonusStarID } = req.params;
		try {
			const command = new DeleteItemCommand({
				TableName: BONUS_STAR_TABLE,
				Key: marshall({ bonusStarID }),
			});
			await client.send(command);

			// Xóa toàn bộ cache sau khi xóa thành công
			bonusCache.flushAll();

			res.json({ message: "Đã xóa Bonus Star thành công." });
		} catch (error) {
			console.error("Lỗi khi xóa Bonus Star:", error);
			res.status(500).json({ error: "Lỗi hệ thống khi thực hiện xóa." });
		}
	},
);

export default router;
