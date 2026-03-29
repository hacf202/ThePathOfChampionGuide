// fe/src/context/services/apiHelper.js
const COGNITO_URL = "https://cognito-idp.us-east-1.amazonaws.com";
const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const getAuthToken = () => {
	// Đã sửa: Loại bỏ cảnh báo khi không có token vì đây là hành vi bình thường của khách vãng lai
	return localStorage.getItem("token") || localStorage.getItem("accessToken");
};

const createUrl = endpoint => {
	const cleanBase = BACKEND_URL.replace(/\/$/, "");
	const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
	const finalEndpoint = cleanEndpoint.startsWith("/api")
		? cleanEndpoint
		: `/api${cleanEndpoint}`;
	return `${cleanBase}${finalEndpoint}`;
};

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

export async function backendApiRequest(
	endpoint,
	method = "GET",
	body = null,
	token = null,
) {
	const url = createUrl(endpoint);
	const headers = { "Content-Type": "application/json" };
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

export const api = {
	get: (endpoint, token = null) =>
		backendApiRequest(endpoint, "GET", null, token || getAuthToken()),
	post: (endpoint, body, token = null) =>
		backendApiRequest(endpoint, "POST", body, token || getAuthToken()),
	put: (endpoint, body, token = null) =>
		backendApiRequest(endpoint, "PUT", body, token || getAuthToken()),
	delete: (endpoint, token = null) =>
		backendApiRequest(endpoint, "DELETE", null, token || getAuthToken()),
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

export const getR2Folders = async () => api.get("/images/folders");
export const getBucketStats = async () => api.get("/images/stats");
export const createR2Folder = async folderName =>
	api.post("/images/folders", { folderName });
export const deleteR2Folder = async folderName =>
	api.delete(`/images/folders/${folderName}`);
export const getImagesByFolder = async folder =>
	api.get(`/images?folder=${folder}`);

export const uploadMultipleImagesR2 = async (files, folder) => {
	const token = getAuthToken();
	const url = createUrl("/images/upload");
	const formData = new FormData();
	for (let i = 0; i < files.length; i++) formData.append("images", files[i]);
	formData.append("folder", folder);

	const response = await fetch(url, {
		method: "POST",
		headers: { Authorization: `Bearer ${token}` },
		body: formData,
	});

	if (!response.ok) {
		const err = await response.json();
		throw new Error(err.error || "Lỗi tải ảnh lên");
	}
	return response.json();
};

export const updateImageR2 = async (file, imageKey) => {
	const token = getAuthToken();
	const url = createUrl("/images/update-single");
	const formData = new FormData();
	formData.append("image", file);
	formData.append("key", imageKey);

	const response = await fetch(url, {
		method: "PUT",
		headers: { Authorization: `Bearer ${token}` },
		body: formData,
	});

	if (!response.ok) {
		const err = await response.json();
		throw new Error(err.error || "Lỗi cập nhật ảnh");
	}
	return response.json();
};

export const deleteImageR2 = async imageKey =>
	api.delete(`/images/single?key=${encodeURIComponent(imageKey)}`);
