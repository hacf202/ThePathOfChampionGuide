// be/scripts/updateChampionGuide.js
import { connectToMongoDB } from '../src/config/mongo.js';
import { invalidateChampionCache } from '../src/services/dataService.js';
import { createAuditLog } from '../src/utils/auditLogger.js';

/**
 * Cập nhật an toàn dữ liệu Champion Guide vào bảng guidePocChampionList và xóa cache.
 *
 * @param {string} championID - Mã tướng (ví dụ: 'C076')
 * @param {Object} guideUpdatePayload - Dữ liệu guide cần cập nhật
 * @returns {Promise<{success: boolean, champion: Object}>}
 */
export async function updateChampionGuideData(championID, guideUpdatePayload) {
	if (!championID) {
		throw new Error("championID là bắt buộc");
	}

	const db = await connectToMongoDB();
	const existing = await db.collection("guidePocChampionList").findOne({ championID });
	if (!existing) {
		throw new Error(`Không tìm thấy tướng có ID '${championID}' trong bảng guidePocChampionList.`);
	}

	// Tách các trường meta không ghi đè ngoài ý muốn
	const { _id, isNew, communityRatings, ...dataToSave } = guideUpdatePayload;

	const cleanData = {
		...dataToSave,
		championID,
		updatedAt: new Date().toISOString(),
	};

	// Cập nhật document trong MongoDB
	await db.collection("guidePocChampionList").updateOne(
		{ championID },
		{ $set: cleanData },
		{ upsert: true }
	);

	// Ghi Audit Log nếu có
	try {
		await createAuditLog({
			action: "UPDATE_GUIDE",
			entityType: "champion",
			entityId: championID,
			entityName: cleanData.name || existing.name,
			oldData: existing,
			newData: cleanData,
			user: { email: "system-workflow@pocguide.top" },
		});
	} catch (e) {
		console.warn("[updateChampionGuide] Bỏ qua Audit Log:", e.message);
	}

	// Xóa cache để dữ liệu cập nhật ngay lập tức
	await invalidateChampionCache(championID);
	console.log(`✅ Đã cập nhật thành công dữ liệu tướng ${championID} và xóa cache.`);

	const updatedChampion = await db.collection("guidePocChampionList").findOne({ championID });
	return { success: true, champion: updatedChampion };
}

// Cho phép chạy trực tiếp từ dòng lệnh: node be/scripts/updateChampionGuide.js <championID> <path_to_json_file>
if (process.argv[1]?.endsWith("updateChampionGuide.js") && process.argv[2]) {
	const champId = process.argv[2];
	const jsonFilePath = process.argv[3];
	
	if (!jsonFilePath) {
		console.error("Vui lòng cung cấp đường dẫn file JSON dữ liệu: node updateChampionGuide.js <championID> <path_to_json>");
		process.exit(1);
	}

	import("fs").then(async ({ default: fs }) => {
		try {
			const rawPayload = JSON.parse(fs.readFileSync(jsonFilePath, "utf8"));
			await updateChampionGuideData(champId, rawPayload);
			console.log(`Đã cập nhật xong cho tướng ${champId}`);
			process.exit(0);
		} catch (err) {
			console.error("Lỗi khi cập nhật tướng:", err);
			process.exit(1);
		}
	});
}
