// src/hooks/useAccentInsensitiveSearch.js
import { useState, useMemo } from "react";
import { removeAccents } from "../utils/vietnameseUtils";

/**
 * Một custom hook để lọc một danh sách dữ liệu dựa trên tìm kiếm không phân biệt dấu.
 * @param {Array<Object>} initialData - Mảng dữ liệu ban đầu.
 * @param {string} searchKey - Tên thuộc tính trong object của mảng dữ liệu để tìm kiếm.
 */
export const useAccentInsensitiveSearch = (initialData, searchKey) => {
	const [searchTerm, setSearchTerm] = useState("");

	// Tối ưu hóa: Chỉ chuyển đổi dữ liệu gốc sang không dấu một lần
	const processedData = useMemo(() => {
		return initialData.map(item => ({
			...item,
			// Tạo một thuộc tính tạm để lưu phiên bản không dấu của dữ liệu cần tìm
			unaccentedSearchField: removeAccents(item[searchKey] || "").toLowerCase(),
		}));
	}, [initialData, searchKey]);

	// Lọc dữ liệu dựa trên searchTerm
	const filteredData = useMemo(() => {
		const unaccentedSearchTerm = removeAccents(searchTerm).toLowerCase();
		if (!unaccentedSearchTerm) {
			return initialData; // Trả về toàn bộ data nếu không có gì để tìm
		}
		return (
			processedData
				.filter(item =>
					item.unaccentedSearchField.includes(unaccentedSearchTerm)
				)
				// Loại bỏ thuộc tính tạm trước khi trả về
				.map(({ unaccentedSearchField, ...rest }) => rest)
		);
	}, [searchTerm, processedData, initialData]);

	// Hàm để component cha gọi khi input thay đổi
	const handleSearchChange = event => {
		setSearchTerm(event.target.value);
	};

	return {
		searchTerm,
		handleSearchChange,
		filteredData,
	};
};
