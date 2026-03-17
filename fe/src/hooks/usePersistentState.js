import { useState, useEffect, useCallback } from "react";

/**
 * Custom hook để quản lý state đồng bộ với localStorage.
 * @param {string} key - Key để lưu trong localStorage.
 * @param {*} initialValue - Giá trị khởi tạo nếu không có gì trong localStorage.
 * @returns {[*, function]} - Mảng gồm state và hàm setState, tương tự useState.
 */
export function usePersistentState(key, initialValue) {
	const [value, setValue] = useState(() => {
		try {
			const item = window.localStorage.getItem(key);
			return item ? JSON.parse(item) : initialValue;
		} catch (error) {
			console.error(`Error reading localStorage key “${key}”:`, error);
			return initialValue;
		}
	});

	useEffect(() => {
		try {
			window.localStorage.setItem(key, JSON.stringify(value));
		} catch (error) {
			console.error(`Error setting localStorage key “${key}”:`, error);
		}
	}, [key, value]);

	return [value, setValue];
}
