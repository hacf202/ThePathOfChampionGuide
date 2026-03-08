// fe/src/context/services/apiHelper.js

const COGNITO_URL = "https://cognito-idp.us-east-1.amazonaws.com";
// Đảm bảo VITE_API_URL trong file .env là http://localhost:3000
const BACKEND_URL = import.meta.env.VITE_API_URL;

/**
 * Hàm chung để gọi API của AWS Cognito.
 */
async function cognitoApiRequest(target, body) {
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
					`Lỗi Cognito (mã: ${response.status})`,
			);
		} catch {
			throw new Error(`Lỗi Cognito (mã: ${response.status}): ${errorText}`);
		}
	}

	const responseText = await response.text();
	return responseText ? JSON.parse(responseText) : {};
}

/**
 * Hàm chung để gọi API backend.
 */
async function backendApiRequest(
	endpoint,
	method = "GET",
	body = null,
	token = null,
) {
	const headers = {
		"Content-Type": "application/json",
	};
	if (token) {
		headers.Authorization = `Bearer ${token}`;
	}

	const config = {
		method,
		headers,
	};
	if (body) {
		config.body = JSON.stringify(body);
	}

	// TỰ ĐỘNG THÊM /api NẾU THIẾU
	const safeEndpoint = endpoint.startsWith("/api")
		? endpoint
		: `/api${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

	// Đảm bảo không có 2 dấu // giữa URL và Endpoint
	const fullUrl = `${BACKEND_URL.replace(/\/$/, "")}${safeEndpoint}`;

	const response = await fetch(fullUrl, config);

	// Kiểm tra xem phản hồi có nội dung không trước khi .json()
	const responseText = await response.text();
	const data = responseText ? JSON.parse(responseText) : {};

	if (!response.ok) {
		throw new Error(data.error || `Lỗi máy chủ (mã: ${response.status})`);
	}
	return data;
}

// Đối tượng API hỗ trợ cú pháp ngắn gọn
export const api = {
	get: (endpoint, token = null) =>
		backendApiRequest(endpoint, "GET", null, token),
	post: (endpoint, body, token = null) =>
		backendApiRequest(endpoint, "POST", body, token),
	put: (endpoint, body, token = null) =>
		backendApiRequest(endpoint, "PUT", body, token),
	delete: (endpoint, token = null) =>
		backendApiRequest(endpoint, "DELETE", null, token),
	patch: (endpoint, body, token = null) =>
		backendApiRequest(endpoint, "PATCH", body, token),

	// --- THÊM MỚI: Hàm Resolve chuyên dụng cho ID-based Schema ---
	/**
	 * Gửi mảng IDs lên Backend để lấy về danh sách chi tiết (Vật phẩm, Sức mạnh, Ngọc...)
	 * @param {string} resourceType - Tên bảng ('items', 'powers', 'relics', 'runes')
	 * @param {Array<string>} ids - Mảng chứa các ID (VD: ['I0091', 'I0092'])
	 */
	resolve: (resourceType, ids) => {
		if (!Array.isArray(ids) || ids.length === 0) return Promise.resolve([]);
		return backendApiRequest(`/${resourceType}/resolve`, "POST", { ids });
	},
};

export { cognitoApiRequest, backendApiRequest };
