import express from "express";
import client from "../config/db.js";
import { PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();
const TABLE_NAME = "WebAnalytics";

/**
 * Tiện ích: Phân loại nguồn traffic từ Referrer
 */
const getTrafficSource = referrer => {
	if (
		!referrer ||
		referrer === "" ||
		referrer.includes("localhost") ||
		referrer.includes("pocguide.top")
	) {
		return "Direct";
	}
	const url = referrer.toLowerCase();
	if (url.includes("google.com")) return "Google Search";
	if (url.includes("facebook.com") || url.includes("fb.me")) return "Facebook";
	if (url.includes("youtube.com")) return "Youtube";
	if (url.includes("t.co") || url.includes("twitter.com")) return "X/Twitter";
	if (url.includes("reddit.com")) return "Reddit";
	return "Others";
};

/**
 * Tiện ích: Lấy định danh tuần (W-YYYY)
 */
const getWeekNumber = d => {
	d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
	d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
	const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
	const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
	return `W${weekNo}-${d.getUTCFullYear()}`;
};

/**
 * 1. API Ghi nhận lượt truy cập (Public)
 */
router.post("/log", async (req, res) => {
	try {
		const { path, referrer, userAgent, userId, loadTime } = req.body;
		const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
		const now = new Date();

		const logEntry = {
			id: uuidv4(),
			timestamp: now.getTime(),
			date: now.toISOString().split("T")[0],
			hour: now.getHours(),
			month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
			week: getWeekNumber(now),
			path: path || "/",
			source: getTrafficSource(referrer),
			userAgent: userAgent || "Unknown",
			userId: userId || "anonymous",
			ip: ip,
			loadTime: loadTime || 0,
			// TTL: Tự động xóa sau 90 ngày để tối ưu dung lượng
			ttl: Math.floor(Date.now() / 1000) + 90 * 24 * 60 * 60,
		};

		await client.send(
			new PutCommand({ TableName: TABLE_NAME, Item: logEntry }),
		);
		res.status(201).json({ success: true });
	} catch (error) {
		console.error("Analytics Log Error:", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

/**
 * 2. API Lấy thống kê chuyên sâu (Admin Only)
 */
router.get("/stats", requireAdmin, async (req, res) => {
	try {
		const now = Date.now();
		const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
		const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000; // Mốc 24h gần nhất

		// Lấy dữ liệu 30 ngày để phân tích xu hướng
		const data = await client.send(
			new ScanCommand({
				TableName: TABLE_NAME,
				FilterExpression: "#ts > :thirtyDaysAgo",
				ExpressionAttributeNames: { "#ts": "timestamp" },
				ExpressionAttributeValues: { ":thirtyDaysAgo": thirtyDaysAgo },
			}),
		);

		const items = data.Items || [];

		const stats = {
			viewsByDate: {},
			viewsByHour: Array(24)
				.fill(0)
				.map((_, i) => ({ hour: `${i}h`, count: 0 })),
			viewsByWeek: {},
			viewsByMonth: {},
			sources: {},
			topPages: {},
			slowPages: [],
			userSessions: {},
		};

		let totalLoadTime24h = 0;
		let count24h = 0;

		items.forEach(item => {
			// Chỉ số thời gian
			if (item.date)
				stats.viewsByDate[item.date] = (stats.viewsByDate[item.date] || 0) + 1;
			if (typeof item.hour === "number" && stats.viewsByHour[item.hour])
				stats.viewsByHour[item.hour].count++;
			if (item.week)
				stats.viewsByWeek[item.week] = (stats.viewsByWeek[item.week] || 0) + 1;
			if (item.month)
				stats.viewsByMonth[item.month] =
					(stats.viewsByMonth[item.month] || 0) + 1;

			// Nguồn và nội dung
			if (item.source)
				stats.sources[item.source] = (stats.sources[item.source] || 0) + 1;
			if (item.path)
				stats.topPages[item.path] = (stats.topPages[item.path] || 0) + 1;

			// Hiệu năng: Tốc độ tải trung bình chỉ tính trong 24h gần nhất
			if (item.timestamp > twentyFourHoursAgo && item.loadTime > 0) {
				totalLoadTime24h += item.loadTime;
				count24h++;
			}

			// Ghi nhận trang chậm (>3s)
			if (item.loadTime > 3000) {
				stats.slowPages.push({ path: item.path, time: item.loadTime });
			}

			// Phân loại phiên (Session)
			const sessionKey = `${item.userId || item.ip}_${item.date || "unknown"}`;
			if (!stats.userSessions[sessionKey]) stats.userSessions[sessionKey] = [];
			stats.userSessions[sessionKey].push(item);
		});

		// Tính toán chỉ số phiên & Tỷ lệ thoát
		const totalSessions = Object.keys(stats.userSessions).length;
		let bouncedSessions = 0;
		let totalEngagementTime = 0;

		Object.values(stats.userSessions).forEach(sessionLogs => {
			if (sessionLogs.length === 1) bouncedSessions++;
			if (sessionLogs.length > 1) {
				const times = sessionLogs.map(l => l.timestamp).sort((a, b) => a - b);
				totalEngagementTime += times[times.length - 1] - times[0];
			}
		});

		res.json({
			summary: {
				totalViews: items.length,
				uniqueVisitors: new Set(
					items.map(i => (i.userId !== "anonymous" ? i.userId : i.ip)),
				).size,
				totalSessions,
				bounceRate:
					totalSessions > 0
						? ((bouncedSessions / totalSessions) * 100).toFixed(1) + "%"
						: "0%",
				avgSessionTime:
					totalSessions > 0
						? (totalEngagementTime / totalSessions / 1000).toFixed(0) + "s"
						: "0s",
				avgLoadTime:
					count24h > 0 ? (totalLoadTime24h / count24h).toFixed(0) : 0, // Dữ liệu 24h
			},
			charts: {
				viewsOverTime: Object.entries(stats.viewsByDate)
					.map(([date, count]) => ({ date, count }))
					.sort((a, b) => a.date.localeCompare(b.date)),
				hourly: stats.viewsByHour,
				weekly: Object.entries(stats.viewsByWeek).map(([name, value]) => ({
					name,
					value,
				})),
				monthly: Object.entries(stats.viewsByMonth).map(([name, value]) => ({
					name,
					value,
				})),
				sources: Object.entries(stats.sources).map(([name, value]) => ({
					name,
					value,
				})),
				topPages: Object.entries(stats.topPages)
					.map(([path, count]) => ({ path, count }))
					.sort((a, b) => b.count - a.count)
					.slice(0, 10),
			},
			slowPages: stats.slowPages.sort((a, b) => b.time - a.time).slice(0, 5),
		});
	} catch (error) {
		console.error("Stats Fetch Error:", error);
		res.status(500).json({ error: error.message });
	}
});

export default router;
