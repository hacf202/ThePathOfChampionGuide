import "./src/config/env.js"; // MUST BE FIRST
import express from "express"; //tạo server HTTP, các route GET, PUT, POST, DELETE,..
import cors from "cors"; //cho phép front end gọi api của backend
import morgan from "morgan";
import compression from "compression";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { errorHandler } from "./src/middleware/errorMiddleware.js";

// Import các router từ thư mục src/routes
import authRouter from "./src/routes/auth.js";
import championsRouter from "./src/routes/champions.js";
import usersRouter from "./src/routes/users.js";
import buildsRouter from "./src/routes/builds.js";
import favoritesRouter from "./src/routes/favorites.js";
import powersRoutes from "./src/routes/powers.js";
import relicsRoutes from "./src/routes/relics.js";
import itemsRoutes from "./src/routes/items.js";
import runesRoutes from "./src/routes/runes.js";
import buildsAdminRouter from "./src/routes/builds-admin.js";
import guidesRouter from "./src/routes/guides.js";
import constellationsRouter from "./src/routes/constellations.js";
import bonusStarRoutes from "./src/routes/bonusStars.js";
import bossesRouter from "./src/routes/bosses.js";
import adventuresRouter from "./src/routes/adventures.js";
import imagesRouter from "./src/routes/images.js";
import commentRoutes from "./src/routes/comments.js";
import cardsRouter from "./src/routes/cards.js";
import ratingsRouter from "./src/routes/ratings.js";
import adminCacheRouter from "./src/routes/adminCache.js";
import auditLogsRouter from "./src/routes/auditLogs.js";

// Kiểm tra các biến môi trường cần thiết
const requiredEnvVars = [
	"AWS_REGION", //khu vực
	"AWS_ACCESS_KEY_ID", //Key IAM user
	"AWS_SECRET_ACCESS_KEY", //Secret key của IAM user đó
	"COGNITO_USER_POOL_ID", //id của user pool
	"COGNITO_APP_CLIENT_ID", //client id của app
	"FRONTEND_URL", //domain fe
];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]); //trả về 1 mảng mới missingEnvVars chứa các biến môi tường bị thiếu.
if (missingEnvVars.length > 0) {
	console.error("Lỗi: Thiếu các biến môi trường:", missingEnvVars.join(", "));

	if (!process.env.VERCEL) {
		process.exit(1); //nếu lỗi thiếu biến không phải trên vercel thì thoát.
	}
}

const app = express(); //khởi tạo backend

// --- Middleware ---
app.use(helmet()); // Bảo vệ các HTTP header
app.use(compression()); // Nén dữ liệu truyền tải (Gzip)
app.use(morgan("dev")); // Ghi log request ra console
/*
GET, PUT, POST, DELETE: Phương thức gọi (Method).

/api/champions: Đường dẫn được gọi (URL).

200: thành công trả về dữ liệu, 204: thành công không trả về dữ liệu, 304: Dữ kiệu không đổi dùng cache
404: không tìm thấy, 500 lỗi server

15.234 ms: Thời gian server xử lý yêu cầu (Response time).

3405: Độ lớn của dữ liệu trả về (tính bằng bytes).
*/

// Cấu hình CORS
const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS
	? process.env.CORS_ALLOWED_ORIGINS.split(",")
	: [
			process.env.FRONTEND_URL,
			"http://localhost:5173",
			"https://guidepoc.vercel.app",
			"https://www.pocguide.top",
			"https://pocguide.top",
		].filter(Boolean);

app.use(
	cors({
		origin: function (origin, callback) {
			// Cho phép các yêu cầu không có origin (như từ Postman hoặc mobile app)
			// hoặc các origin có trong danh sách allowedOrigins
			if (!origin || allowedOrigins.indexOf(origin) !== -1) {
				callback(null, true);
			} else {
				console.error(`CORS Blocked for origin: ${origin}`);
				callback(new Error("Không được phép bởi CORS"));
			}
		},
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
		credentials: true,
	}),
);

// Rate limiting for auth routes
const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 20, // Limit each IP to 20 requests per windowMs
	message: { error: "Too many requests from this IP, please try again after 15 minutes" },
	standardHeaders: true,
	legacyHeaders: false,
});
app.use("/api/auth", authLimiter);

app.use(express.json({ limit: "5mb" }));

app.use("/api/auth", authRouter);
app.use("/api/champions", championsRouter);
app.use("/api/powers", powersRoutes);
app.use("/api/relics", relicsRoutes);
app.use("/api/items", itemsRoutes);
app.use("/api/runes", runesRoutes);
app.use("/api", usersRouter);
app.use("/api", commentRoutes);
app.use("/api/builds", favoritesRouter);
app.use("/api/builds", buildsRouter);
app.use("/api/admin/builds", buildsAdminRouter);
app.use("/api/guides", guidesRouter);
app.use("/api/constellations", constellationsRouter);
app.use("/api/bonusStars", bonusStarRoutes);
app.use("/api/images", imagesRouter);
app.use("/api/bosses", bossesRouter);
app.use("/api/adventures", adventuresRouter);
app.use("/api/cards", cardsRouter);
app.use("/api/ratings", ratingsRouter);
app.use("/api/admin/cache", adminCacheRouter);
app.use("/api/admin/audit-logs", auditLogsRouter);

// API để kiểm tra "sức khỏe" của server
app.get("/api/checkheal", (req, res) => {
	res.status(200).json({ status: "OK", message: "Server is healthy" });
});

// --- Xử lý lỗi ---

// Middleware xử lý lỗi 404 cho các route không tồn tại
app.use((req, res) => {
	res.status(404).json({ error: "Route not found" });
});

// Middleware xử lý lỗi tập trung
app.use(errorHandler);

// --- Khởi động Server ---

// 1. Export app cho Vercel (bắt buộc)
// Vercel sẽ sử dụng app này để chạy serverless function
export default app;

// 2. Chạy server local (chỉ khi không ở trên Vercel)
// Vercel tự động set biến môi trường 'VERCEL' = 1
if (!process.env.VERCEL) {
	const port = process.env.PORT; // Dùng port từ .env hoặc fallback 3001
	app.listen(port, () => {
		console.log(
			`✅ Server đang chạy (chế độ local) trên http://localhost:${port}`,
		);
	});
}
