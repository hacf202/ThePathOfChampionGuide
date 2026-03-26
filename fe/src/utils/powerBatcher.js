// src/utils/powerBatcher.js

const API_URL = import.meta.env.VITE_API_URL;

// Cache cục bộ giúp lưu trữ dữ liệu đã tải, không tải lại nếu đã có
const powerCache = new Map();

// Danh sách các ID đang chờ được gọi API
let pendingIds = new Set();

// Lưu trữ các hàm resolve, reject của Promise để trả data về cho đúng component
let callbacks = [];

let timeoutId = null;

export const getPowerBatched = powerId => {
	return new Promise((resolve, reject) => {
		// 1. Kiểm tra Cache: Nếu có rồi thì trả về ngay lập tức (0ms)
		if (powerCache.has(powerId)) {
			return resolve(powerCache.get(powerId));
		}

		// 2. Nếu chưa có, đưa ID vào danh sách chờ (Set giúp tự động loại bỏ ID trùng lặp)
		pendingIds.add(powerId);

		// Lưu lại cách để trả kết quả về cho component gọi hàm này
		callbacks.push({ id: powerId, resolve, reject });

		// 3. Kỹ thuật Debounce/Batch: Gom các request trong vòng 50ms
		if (timeoutId) {
			clearTimeout(timeoutId);
		}

		timeoutId = setTimeout(async () => {
			// Chốt danh sách ID và danh sách chờ trả kết quả
			const idsToFetch = Array.from(pendingIds);
			const callbacksToProcess = [...callbacks];

			// Đặt lại state để sẵn sàng cho đợt gom nhóm tiếp theo
			pendingIds.clear();
			callbacks = [];
			timeoutId = null;

			try {
				// GỌI API ĐÚNG 1 LẦN DÙY NHẤT.
				// Lưu ý: Dựa vào log của bạn, tôi cấu hình gọi POST tới /api/powers/resolve.
				// Body được gửi đi là { ids: [...] }. Bạn có thể đổi tên key 'ids' nếu backend của bạn quy định khác.
				const response = await fetch(`${API_URL}/api/powers/resolve`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ ids: idsToFetch }),
				});

				if (!response.ok) {
					throw new Error(`Batch fetch failed with status: ${response.status}`);
				}

				// Giả định backend trả về 1 mảng dữ liệu các Power
				const data = await response.json();
				const powersArray = Array.isArray(data) ? data : data.data || [];

				// Lưu dữ liệu vào Cache
				const powersMap = new Map();
				powersArray.forEach(power => {
					// ID có thể nằm ở trường _id, id, hoặc powerCode tùy backend của bạn
					const id = power.powerCode || power.id || power._id;
					if (id) {
						powersMap.set(id, power);
						powerCache.set(id, power);
					}
				});

				// 4. Phát kết quả về cho từng component đang chờ
				callbacksToProcess.forEach(({ id, resolve }) => {
					const result = powersMap.get(id);
					// Dù có hay không có data cũng resolve để component thoát khỏi trạng thái loading
					resolve(result || null);
				});
			} catch (error) {
				console.error("Lỗi khi fetch batched powers:", error);
				// Nếu lỗi, từ chối toàn bộ các component trong mẻ này
				callbacksToProcess.forEach(({ reject }) => reject(error));
			}
		}, 50); // Chờ 50 milliseconds để thu thập đủ ID từ các component
	});
};
