// be/src/routes/adventures.js
import express from "express";
import {
	PutItemCommand,
	DeleteItemCommand,
	GetItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import client from "../config/db.js";
import { authenticateCognitoToken } from "../middleware/authenticate.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { createAuditLog } from "../utils/auditLogger.js";
import { getCachedAdventures, invalidateAdventureCache } from "../services/dataService.js";

const router = express.Router();
const ADVENTURE_TABLE = "guidePocAdventureMap";
// cache hầu cần thiết được quản lý bởi DataService

router.get("/", async (req, res) => {
	try {
		const {
			page = 1,
			limit = 24,
			searchTerm = "",
			difficulty = "",
			sort = "difficulty-asc",
		} = req.query;

		const pageSize = parseInt(limit);
		const currentPage = parseInt(page);

		// Lấy từ DataService (RAM → DynamoDB)
		let allAdventures = await getCachedAdventures();

		// 2. Trích xuất bộ lọc động (Dynamic Filters)
		const availableFilters = {
			difficulties: [...new Set(allAdventures.map(a => Number(a.difficulty)))]
				.filter(Boolean)
				.sort((a, b) => a - b),
		};

		// 3. Thực hiện lọc (Filtering)
		let filtered = [...allAdventures];

		if (searchTerm) {
			const { removeAccents } = await import("../utils/vietnameseUtils.js");
			const searchKey = removeAccents(searchTerm.toLowerCase());
			filtered = filtered.filter(a => {
				const nameVn = removeAccents(a.adventureName || "");
				const nameEn = removeAccents(a.translations?.en?.adventureName || "");
				return nameVn.includes(searchKey) || nameEn.includes(searchKey);
			});
		}

		if (difficulty) {
			const dList = difficulty.split(",").map(Number);
			filtered = filtered.filter(a => dList.includes(Number(a.difficulty)));
		}

		// 4. Sắp xếp (Sorting)
		const [field, order] = sort.split("-");
		filtered.sort((a, b) => {
			let vA = a[field] ?? "";
			let vB = b[field] ?? "";
			if (typeof vA === "string") {
				return order === "asc" ? vA.localeCompare(vB) : vB.localeCompare(vA);
			}
			return order === "asc" ? vA - vB : vB - vA;
		});

		// 5. Phân trang (Pagination)
		const totalItems = filtered.length;
		let paginatedItems;

		if (pageSize < 0) {
			paginatedItems = filtered;
		} else {
			paginatedItems = filtered.slice(
				(currentPage - 1) * pageSize,
				currentPage * pageSize,
			);
		}

		const totalPages = pageSize > 0 ? Math.ceil(totalItems / pageSize) : 1;

		res.json({
			items: paginatedItems,
			pagination: {
				totalItems,
				totalPages,
				currentPage,
				pageSize: pageSize < 0 ? totalItems : pageSize,
			},
			availableFilters,
		});
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

		// Ghi log thay đổi
		await createAuditLog({
			action: isNew ? "CREATE" : "UPDATE",
			entityType: "adventure",
			entityId: adventureID,
			entityName: dataToSave.adventureName,
			oldData: Item ? unmarshall(Item) : null,
			newData: dataToSave,
			user: req.user
		});

		await invalidateAdventureCache();

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
			// Lấy dữ liệu cũ để ghi log
			const getItemCmd = new GetItemCommand({
				TableName: ADVENTURE_TABLE,
				Key: marshall({ adventureID }),
			});
			const { Item } = await client.send(getItemCmd);
			const oldData = Item ? unmarshall(Item) : null;

			const deleteCmd = new DeleteItemCommand({
				TableName: ADVENTURE_TABLE,
				Key: marshall({ adventureID }),
			});
			await client.send(deleteCmd);

			// Ghi log thay đổi
			await createAuditLog({
				action: "DELETE",
				entityType: "adventure",
				entityId: adventureID,
				entityName: oldData?.adventureName || adventureID,
				oldData: oldData,
				newData: null,
				user: req.user
			});

			await invalidateAdventureCache();
			res.json({ message: "Đã xóa Adventure thành công." });
		} catch (error) {
			res.status(500).json({ error: "Lỗi hệ thống khi thực hiện xóa." });
		}
	},
);

export default router;
