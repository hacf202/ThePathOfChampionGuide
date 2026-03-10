// src/routes/images.js
import express from "express";
import multer from "multer";
import sharp from "sharp";
import {
	S3Client,
	PutObjectCommand,
	DeleteObjectCommand,
	DeleteObjectsCommand,
	ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { authenticateCognitoToken } from "../middleware/authenticate.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = express.Router();
const s3Client = new S3Client({
	region: "auto",
	endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
	credentials: {
		accessKeyId: process.env.R2_ACCESS_KEY_ID,
		secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
	},
});

const upload = multer({ storage: multer.memoryStorage() });

/**
 * @route   GET /api/images/folders
 * @desc    Lấy toàn bộ thư mục (Prefix) hiện có
 */
router.get(
	"/folders",
	authenticateCognitoToken,
	requireAdmin,
	async (req, res) => {
		try {
			const command = new ListObjectsV2Command({
				Bucket: process.env.R2_BUCKET_NAME,
				Delimiter: "/",
			});

			const data = await s3Client.send(command);
			const detectedFolders = (data.CommonPrefixes || []).map(cp =>
				cp.Prefix.replace(/\/$/, ""),
			);

			res.json({ folders: detectedFolders });
		} catch (error) {
			console.error("Lỗi lấy danh sách thư mục:", error);
			res.status(500).json({ error: "Không thể quét danh sách thư mục" });
		}
	},
);

/**
 * @route   POST /api/images/folders
 * @desc    Tạo thư mục mới (bằng cách tạo file .keep)
 */
router.post(
	"/folders",
	authenticateCognitoToken,
	requireAdmin,
	async (req, res) => {
		try {
			const { folderName } = req.body;
			if (!folderName)
				return res.status(400).json({ error: "Tên thư mục trống" });

			const cleanFolderName = folderName.replace(/[^a-zA-Z0-9_-]/g, "");
			const fileKey = `${cleanFolderName}/.keep`;

			await s3Client.send(
				new PutObjectCommand({
					Bucket: process.env.R2_BUCKET_NAME,
					Key: fileKey,
					Body: "",
					ContentType: "text/plain",
				}),
			);

			res.json({ message: "Tạo thư mục thành công", folder: cleanFolderName });
		} catch (error) {
			res.status(500).json({ error: "Lỗi khi tạo thư mục" });
		}
	},
);

/**
 * @route   DELETE /api/images/folders/:folderName
 * @desc    Xóa toàn bộ thư mục và nội dung bên trong
 */
router.delete(
	"/folders/:folderName",
	authenticateCognitoToken,
	requireAdmin,
	async (req, res) => {
		try {
			const { folderName } = req.params;

			// 1. Liệt kê tất cả các file có prefix là folderName/
			const listCommand = new ListObjectsV2Command({
				Bucket: process.env.R2_BUCKET_NAME,
				Prefix: `${folderName}/`,
			});
			const listData = await s3Client.send(listCommand);

			if (!listData.Contents || listData.Contents.length === 0) {
				return res.json({ message: "Thư mục trống hoặc không tồn tại" });
			}

			// 2. Xóa hàng loạt (Bulk Delete)
			const deleteParams = {
				Bucket: process.env.R2_BUCKET_NAME,
				Delete: {
					Objects: listData.Contents.map(item => ({ Key: item.Key })),
				},
			};

			await s3Client.send(new DeleteObjectsCommand(deleteParams));
			res.json({
				message: `Đã xóa thư mục ${folderName} và các file bên trong`,
			});
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: "Lỗi khi xóa thư mục" });
		}
	},
);

/**
 * Lấy danh sách ảnh trong một folder
 */
router.get("/", authenticateCognitoToken, requireAdmin, async (req, res) => {
	try {
		const { folder } = req.query;
		const command = new ListObjectsV2Command({
			Bucket: process.env.R2_BUCKET_NAME,
			Prefix: folder ? `${folder}/` : "",
		});
		const data = await s3Client.send(command);
		const files = (data.Contents || [])
			.filter(item => !item.Key.endsWith("/") && !item.Key.endsWith(".keep"))
			.map(item => ({
				key: item.Key,
				url: `${process.env.R2_CUSTOM_DOMAIN}/${item.Key}`,
				lastModified: item.LastModified,
				size: item.Size,
			}))
			.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
		res.json({ files });
	} catch (error) {
		res.status(500).json({ error: "Lỗi lấy danh sách ảnh" });
	}
});

/**
 * Upload nhiều ảnh
 */
router.post(
	"/upload",
	authenticateCognitoToken,
	requireAdmin,
	upload.array("images", 20),
	async (req, res) => {
		try {
			const { folder } = req.body;
			if (!req.files || req.files.length === 0)
				return res.status(400).json({ error: "Chưa chọn ảnh" });

			const results = await Promise.all(
				req.files.map(async file => {
					const originalName = file.originalname;
					const nameWithoutExt =
						originalName.substring(0, originalName.lastIndexOf(".")) ||
						originalName;
					const cleanName = nameWithoutExt
						.replace(/\s+/g, "-")
						.replace(/[^a-zA-Z0-9_-]/g, "");
					const fileKey = `${folder}/${cleanName}.webp`;

					const processedBuffer = await sharp(file.buffer)
						.webp({ quality: 80 })
						.toBuffer();

					await s3Client.send(
						new PutObjectCommand({
							Bucket: process.env.R2_BUCKET_NAME,
							Key: fileKey,
							Body: processedBuffer,
							ContentType: "image/webp",
						}),
					);

					return {
						key: fileKey,
						url: `${process.env.R2_CUSTOM_DOMAIN}/${fileKey}`,
					};
				}),
			);

			res.json({ message: "Tải lên thành công", files: results });
		} catch (error) {
			res.status(500).json({ error: "Lỗi xử lý upload" });
		}
	},
);

/**
 * Cập nhật/Ghi đè ảnh (Sửa Key cụ thể)
 */
router.put(
	"/update-single", // Thay đổi logic endpoint để nhận key từ body hoặc query
	authenticateCognitoToken,
	requireAdmin,
	upload.single("image"),
	async (req, res) => {
		try {
			const { key } = req.body;
			if (!key) return res.status(400).json({ error: "Thiếu Key ảnh" });

			const processedBuffer = await sharp(req.file.buffer)
				.webp({ quality: 80 })
				.toBuffer();
			await s3Client.send(
				new PutObjectCommand({
					Bucket: process.env.R2_BUCKET_NAME,
					Key: key,
					Body: processedBuffer,
					ContentType: "image/webp",
				}),
			);
			res.json({ message: "Cập nhật thành công" });
		} catch (error) {
			res.status(500).json({ error: "Lỗi cập nhật" });
		}
	},
);

/**
 * Xóa 1 ảnh cụ thể
 */
router.delete(
	"/single",
	authenticateCognitoToken,
	requireAdmin,
	async (req, res) => {
		try {
			const { key } = req.query;
			await s3Client.send(
				new DeleteObjectCommand({
					Bucket: process.env.R2_BUCKET_NAME,
					Key: key,
				}),
			);
			res.json({ message: "Đã xóa ảnh" });
		} catch (error) {
			res.status(500).json({ error: "Lỗi xóa ảnh" });
		}
	},
);

export default router;
