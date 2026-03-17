// src/utils/jwt.js
import { jwtDecode } from "jwt-decode";

export const decodeToken = token => {
	try {
		return jwtDecode(token);
	} catch (error) {
		console.error("Invalid token format:", error);
		return null;
	}
};

export const isTokenExpired = token => {
	const payload = decodeToken(token);
	if (!payload || !payload.exp) return true;
	const currentTime = Math.floor(Date.now() / 1000);
	return payload.exp < currentTime;
};
