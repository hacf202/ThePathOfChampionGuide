// src/utils/dynamodb.js

/**
 * Chuyển boolean → string cho DynamoDB
 */
export const boolToString = value => {
	if (value === true) return "true";
	if (value === false) return "false";
	return undefined;
};

/**
 * Chuyển string từ DynamoDB → boolean
 */
export const stringToBool = value => {
	if (value === "true") return true;
	if (value === "false") return false;
	return undefined;
};

/**
 * Áp dụng chuyển đổi display trong object trước khi lưu vào DynamoDB
 * Tối ưu: Tạo bản sao (Clone) để tránh lỗi mutate object gốc (Side-effects)
 */
export const prepareBuildForDynamo = build => {
	const newBuild = { ...build };
	if (newBuild.display !== undefined) {
		newBuild.display = boolToString(newBuild.display);
	}
	return newBuild;
};

/**
 * Áp dụng chuyển đổi display từ DynamoDB về boolean
 * Tối ưu: Tạo bản sao (Clone) để tránh lỗi mutate object gốc
 */
export const normalizeBuildFromDynamo = build => {
	const newBuild = { ...build };
	if (newBuild.display !== undefined) {
		newBuild.display = stringToBool(newBuild.display);
	}
	return newBuild;
};
