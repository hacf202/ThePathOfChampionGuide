// src/components/build/buildEditModal.jsx
import React, { useState, useEffect } from "react";
import BuildModal from "./buildModal";

const BuildEditModal = ({
	build,
	isOpen,
	onClose,
	onConfirm,
	championsList = [],
	relicsList = [],
	powersList = [],
	runesList = [],
}) => {
	const [maxStar, setMaxStar] = useState(7);
	const [isModalOpen, setIsModalOpen] = useState(false);

	useEffect(() => {
		if (!isOpen || !build?.championName) return;

		const fetchMaxStar = async () => {
			// Tìm nhanh trong list master
			if (championsList.length > 0) {
				const champion = championsList.find(
					c => c.name === build.championName.trim(),
				);
				if (champion) {
					setMaxStar(champion.maxStar ?? 7);
					return;
				}
			}

			try {
				const apiUrl = import.meta.env.VITE_API_URL;
				const res = await fetch(
					`${apiUrl}/api/champions/search?name=${encodeURIComponent(build.championName.trim())}`,
				);
				const data = await res.json();
				const champion = data.items?.[0];
				setMaxStar(champion?.maxStar ?? 7);
			} catch (err) {
				console.error("Lỗi khi lấy thông tin tướng trong Edit Mode:", err);
				setMaxStar(7);
			}
		};

		fetchMaxStar();
		setIsModalOpen(true);
	}, [isOpen, build?.championName, championsList]);

	const handleClose = () => {
		setIsModalOpen(false);
		onClose?.();
	};

	const handleConfirm = updatedBuild => {
		onConfirm(updatedBuild);
		handleClose();
	};

	// Không cho phép thay đổi tướng khi đang trong chế độ chỉnh sửa
	const handleChampionChange = () => {};

	if (!isOpen || !build) return null;

	return (
		<BuildModal
			isOpen={isModalOpen}
			onClose={handleClose}
			onConfirm={handleConfirm}
			championsList={championsList}
			relicsList={relicsList}
			powersList={powersList}
			runesList={runesList}
			initialData={{
				_id: build.id,
				championName: build.championName,
				description: build.description || "",
				star: build.star || 3,
				display: build.display ?? true,
				// Ánh xạ sang cấu trúc Ids mới để Modal nhận diện đúng slot
				relicSetIds: [...(build.relicSetIds || []), null, null, null].slice(
					0,
					3,
				),
				powerIds: [
					...(build.powerIds || []),
					null,
					null,
					null,
					null,
					null,
					null,
				].slice(0, 6),
				runeIds: [...(build.runeIds || []), null, null, null].slice(0, 3),
			}}
			onChampionChange={handleChampionChange}
			maxStar={maxStar}
		/>
	);
};

export default BuildEditModal;
