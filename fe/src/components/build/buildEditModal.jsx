// src/components/build/buildEditModal.jsx
import React, { useState, useEffect } from "react";
import BuildModal from "./buildModal";

const BuildEditModal = ({ build, isOpen, onClose, onConfirm }) => {
	const [maxStar, setMaxStar] = useState(7);
	const [isModalOpen, setIsModalOpen] = useState(false);

	/**
	 * Khi mở modal chỉnh sửa, fetch lại thông tin tướng để lấy maxStar chính xác.
	 */
	useEffect(() => {
		if (!isOpen || !build?.championName) return;

		const fetchMaxStar = async () => {
			try {
				const apiUrl = import.meta.env.VITE_API_URL;
				const res = await fetch(
					`${apiUrl}/api/champions/search?name=${encodeURIComponent(build.championName.trim())}`,
				);
				const data = await res.json();

				// Truy cập vào items[0] theo cấu trúc backend mới
				const champion = data.items?.[0];
				setMaxStar(champion?.maxStar ?? 7);
			} catch (err) {
				console.error("Lỗi khi lấy thông tin tướng trong Edit Mode:", err);
				setMaxStar(7);
			}
		};

		fetchMaxStar();
		setIsModalOpen(true);
	}, [isOpen, build?.championName]);

	const handleClose = () => {
		setIsModalOpen(false);
		onClose?.();
	};

	const handleConfirm = updatedBuild => {
		onConfirm(updatedBuild);
		handleClose();
	};

	// Không cho phép thay đổi tướng khi đang trong chế độ chỉnh sửa để đảm bảo tính toàn vẹn dữ liệu
	const handleChampionChange = () => {};

	if (!isOpen || !build) return null;

	return (
		<BuildModal
			isOpen={isModalOpen}
			onClose={handleClose}
			onConfirm={handleConfirm}
			initialData={{
				_id: build.id,
				championName: build.championName,
				description: build.description || "",
				star: build.star || 3,
				display: build.display ?? true,
				// Chuẩn hóa các mảng để Dropdown trong Modal luôn hiển thị đúng số slot
				relicSet: [...(build.relicSet || []), null, null, null].slice(0, 3),
				powers: [
					...(build.powers || []),
					null,
					null,
					null,
					null,
					null,
					null,
				].slice(0, 6),
				rune: [...(build.rune || []), null].slice(0, 1),
				regions: build.regions || [], // Dùng để xác định tướng thuộc Hoa Linh
			}}
			onChampionChange={handleChampionChange}
			maxStar={maxStar}
		/>
	);
};

export default BuildEditModal;
