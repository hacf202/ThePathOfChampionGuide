// be/src/routes/relics.js
import express from "express";
import {
	ScanCommand,
	PutItemCommand,
	DeleteItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import client from "../config/db.js";
import { authenticateCognitoToken } from "../middleware/authenticate.js";

const router = express.Router();
const RELICS_TABLE = "guidePocRelics";

// Bộ nhớ đệm đơn giản để "Batch" quản lý tài nguyên hình ảnh
const imageCache = new Map();

// GET /api/relics - Lấy BATCH toàn bộ dữ liệu (JSON)
router.get("/", async (req, res) => {
	try {
		const command = new ScanCommand({ TableName: RELICS_TABLE });
		const { Items } = await client.send(command);
		const relics = Items ? Items.map(item => unmarshall(item)) : [];
		res.json(relics);
	} catch (error) {
		console.error("Error getting relics:", error);
		res.status(500).json({ error: "Could not retrieve relics" });
	}
});

// GET /api/relics/proxy-image - Proxy có Caching để tăng tốc độ tải ảnh
router.get("/proxy-image", async (req, res) => {
	const { url } = req.query;
	if (!url) return res.status(400).json({ error: "URL parameter is required" });

	// Kiểm tra xem ảnh đã có trong bộ nhớ đệm chưa
	if (imageCache.has(url)) {
		const cached = imageCache.get(url);
		res.set("Content-Type", cached.contentType);
		res.set("Cache-Control", "public, max-age=86400");
		return res.send(cached.buffer);
	}

	try {
		const response = await fetch(url, {
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
			},
		});

		if (!response.ok)
			throw new Error(`Failed to fetch image: ${response.status}`);

		const contentType = response.headers.get("content-type");
		const arrayBuffer = await response.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		// Lưu vào bộ nhớ đệm
		imageCache.set(url, { buffer, contentType });

		res.set("Content-Type", contentType);
		res.set("Cache-Control", "public, max-age=86400");
		res.send(buffer);
	} catch (error) {
		console.error("Error proxying image:", error);
		res.status(500).json({ error: "Could not fetch image" });
	}
});

// Giữ nguyên các route PUT và DELETE của bạn
router.put("/", authenticateCognitoToken, async (req, res) => {
	const relicData = req.body;
	if (!relicData.relicCode)
		return res.status(400).json({ error: "Relic code is required" });
	try {
		const command = new PutItemCommand({
			TableName: RELICS_TABLE,
			Item: marshall(relicData),
		});
		await client.send(command);
		res
			.status(200)
			.json({ message: "Relic data updated successfully", relic: relicData });
	} catch (error) {
		console.error("Error updating relic data:", error);
		res.status(500).json({ error: "Could not update relic data" });
	}
});

router.delete("/:relicCode", authenticateCognitoToken, async (req, res) => {
	const { relicCode } = req.params;
	try {
		const command = new DeleteItemCommand({
			TableName: RELICS_TABLE,
			Key: marshall({ relicCode }),
		});
		await client.send(command);
		res
			.status(200)
			.json({ message: `Relic with code ${relicCode} deleted successfully` });
	} catch (error) {
		console.error("Error deleting relic:", error);
		res.status(500).json({ error: "Could not delete relic" });
	}
});

export default router;
