// fe/src/context/services/apiHelper.js

// --- Cấu hình URLs ---
const COGNITO_URL = "https://cognito-idp.us-east-1.amazonaws.com";
const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * Hàm lấy Token từ LocalStorage để gắn vào Header Authorization.
 */
const getAuthToken = () => {
	const token =
		localStorage.getItem("token") || localStorage.getItem("accessToken");
	if (!token) {
		console.warn("API Helper: Không tìm thấy Token xác thực.");
	}
	return token;
};

/**
 * Hàm bổ trợ để tạo URL tuyệt đối chuẩn xác cho Backend.
 */
const createUrl = endpoint => {
	const cleanBase = BACKEND_URL.replace(/\/$/, ""); // Loại bỏ dấu / ở cuối nếu có
	const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

	// Đảm bảo luôn có tiền tố /api
	const finalEndpoint = cleanEndpoint.startsWith("/api")
		? cleanEndpoint
		: `/api${cleanEndpoint}`;
	return `${cleanBase}${finalEndpoint}`;
};

// --- API XÁC THỰC (COGNITO) ---

/**
 * Hàm chung để gọi API của AWS Cognito (Dành cho Login/Register).
 */
export async function cognitoApiRequest(target, body) {
	const response = await fetch(COGNITO_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-amz-json-1.1",
			"X-Amz-Target": target,
		},
		body: JSON.stringify(body),
	});

	if (!response.ok) {
		const errorText = await response.text();
		try {
			const errorJson = JSON.parse(errorText);
			throw new Error(
				errorJson.message ||
					errorJson.__type ||
					`Lỗi Cognito ${response.status}`,
			);
		} catch {
			throw new Error(`Lỗi Cognito: ${errorText}`);
		}
	}
	return response.json();
}

// --- API BACKEND CHUNG (JSON) ---

/**
 * Hàm lõi xử lý các request JSON tới Backend NodeJS.
 */
export async function backendApiRequest(
	endpoint,
	method = "GET",
	body = null,
	token = null,
) {
	const url = createUrl(endpoint);
	const headers = {
		"Content-Type": "application/json",
	};
	if (token) headers.Authorization = `Bearer ${token}`;

	const config = {
		method,
		headers,
		body: body ? JSON.stringify(body) : null,
	};

	const response = await fetch(url, config);
	const responseText = await response.text();
	const data = responseText ? JSON.parse(responseText) : {};

	if (!response.ok) {
		throw new Error(data.error || `Lỗi máy chủ (mã: ${response.status})`);
	}
	return data;
}

/**
 * Đối tượng API hỗ trợ các phương thức chuẩn (CRUD).
 * Đã bao gồm hàm resolve bạn cần cho việc lấy dữ liệu hàng loạt.
 */
export const api = {
	get: (endpoint, token = null) =>
		backendApiRequest(endpoint, "GET", null, token || getAuthToken()),
	post: (endpoint, body, token = null) =>
		backendApiRequest(endpoint, "POST", body, token || getAuthToken()),
	put: (endpoint, body, token = null) =>
		backendApiRequest(endpoint, "PUT", body, token || getAuthToken()),
	delete: (endpoint, token = null) =>
		backendApiRequest(endpoint, "DELETE", null, token || getAuthToken()),

	// Hàm resolve đặc biệt để lấy chi tiết nhiều ID cùng lúc
	resolve: (resourceType, ids) => {
		if (!Array.isArray(ids) || ids.length === 0) return Promise.resolve([]);
		return backendApiRequest(
			`/${resourceType}/resolve`,
			"POST",
			{ ids },
			getAuthToken(),
		);
	},
};

// --- QUẢN LÝ THƯ MỤC (FOLDER) R2 ---

/** Lấy danh sách toàn bộ thư mục */
export const getR2Folders = async () => {
	return api.get("/images/folders");
};

/** Tạo một thư mục mới (tạo file .keep bên trong) */
export const createR2Folder = async folderName => {
	return api.post("/images/folders", { folderName });
};

/** Xóa toàn bộ thư mục và nội dung bên trong */
export const deleteR2Folder = async folderName => {
	return api.delete(`/images/folders/${folderName}`);
};

// --- QUẢN LÝ ẢNH (IMAGES) R2 ---

/** Lấy danh sách ảnh theo folder */
export const getImagesByFolder = async folder => {
	return api.get(`/images?folder=${folder}`);
};

/**
 * Tải NHIỀU ảnh lên cùng lúc (FormData)
 */
export const uploadMultipleImagesR2 = async (files, folder) => {
	const token = getAuthToken();
	const url = createUrl("/images/upload");

	const formData = new FormData();
	for (let i = 0; i < files.length; i++) {
		formData.append("images", files[i]);
	}
	formData.append("folder", folder);

	const response = await fetch(url, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${token}`,
			// Lưu ý: Không set Content-Type JSON ở đây vì trình duyệt sẽ tự xử lý Multipart
		},
		body: formData,
	});

	if (!response.ok) {
		const err = await response.json();
		throw new Error(err.error || "Lỗi tải ảnh lên");
	}
	return response.json();
};

/**
 * Cập nhật/Ghi đè 1 ảnh cụ thể (Giữ nguyên Key)
 */
export const updateImageR2 = async (file, imageKey) => {
	const token = getAuthToken();
	const url = createUrl("/images/update-single");

	const formData = new FormData();
	formData.append("image", file);
	formData.append("key", imageKey);

	const response = await fetch(url, {
		method: "PUT",
		headers: {
			Authorization: `Bearer ${token}`,
		},
		body: formData,
	});

	if (!response.ok) {
		const err = await response.json();
		throw new Error(err.error || "Lỗi cập nhật ảnh");
	}
	return response.json();
};

/** Xóa 1 ảnh cụ thể dựa trên Key */
export const deleteImageR2 = async imageKey => {
	return api.delete(`/images/single?key=${encodeURIComponent(imageKey)}`);
};
