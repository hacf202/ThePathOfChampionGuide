// src/components/build/buildCreation.jsx
import React, { useState } from "react";
import BuildModal from "./buildModal";

const BuildCreation = ({ onConfirm, onClose }) => {
	const [isOpen, setIsOpen] = useState(true);
	const [maxStar, setMaxStar] = useState(7); // Mặc định là 7 nếu không tìm thấy
	const [championName, setChampionName] = useState("");

	/**
	 * Xử lý khi chọn tướng trong Modal.
	 * Gọi API search để lấy thông tin chi tiết (đặc biệt là maxStar) của tướng đó.
	 */
	const handleChampionChange = async name => {
		setChampionName(name);
		if (!name || !name.trim()) {
			setMaxStar(7);
			return;
		}

		try {
			const apiUrl = import.meta.env.VITE_API_URL;
			// Endpoint search trả về { items: [champion] }
			const res = await fetch(
				`${apiUrl}/api/champions/search?name=${encodeURIComponent(name.trim())}`,
			);
			const data = await res.json();

			// Đồng bộ cấu trúc: Lấy champion từ mảng items
			const champion = data.items?.[0];
			setMaxStar(champion?.maxStar ?? 7);
		} catch (err) {
			console.error("Lỗi khi lấy thông tin sao tối đa của tướng:", err);
			setMaxStar(7); // Fallback về 7 nếu lỗi API
		}
	};

	const handleConfirm = build => {
		onConfirm(build);
		setIsOpen(false);
	};

	const handleClose = () => {
		setIsOpen(false);
		onClose?.();
	};

	return (
		<BuildModal
			isOpen={isOpen}
			onClose={handleClose}
			onConfirm={handleConfirm}
			onChampionChange={handleChampionChange}
			maxStar={maxStar}
			// initialData mặc định của Modal sẽ được dùng cho mode tạo mới
		/>
	);
};

export default BuildCreation;
