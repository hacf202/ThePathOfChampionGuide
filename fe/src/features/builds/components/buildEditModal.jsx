// src/components/build/buildEditModal.jsx
import React, { useState, useEffect } from "react";
import BuildModal from "@/features/builds/components/buildModal";

import { useLazyMetadata } from "@/hooks/useLazyMetadata";
import { useTranslation } from "@/hooks/useTranslation";

const BuildEditModal = ({
	build,
	isOpen,
	onClose,
	onConfirm,
}) => {
	const { tUI } = useTranslation();
	const { metadata, isLoadingMeta, fetchAllMetadata } = useLazyMetadata(tUI);
	const [maxStar, setMaxStar] = useState(7);
	const [isModalOpen, setIsModalOpen] = useState(false);

	useEffect(() => {
		if (isOpen) {
			fetchAllMetadata();
		}
		if (!isOpen || !build?.championID) return;

		const fetchMaxStar = async () => {
			// Tìm nhanh trong list master
			if (metadata.champions.length > 0) {
				const champion = metadata.champions.find(
					c => c.championID === build.championID,
				);
				if (champion) {
					setMaxStar(champion.maxStar ?? 7);
					return;
				}
			}

			try {
				const apiUrl = import.meta.env.VITE_API_URL;
				const res = await fetch(
					`${apiUrl}/api/champions/${encodeURIComponent(build.championID)}`,
				);
				const data = await res.json();
				setMaxStar(data?.maxStar ?? 7);
			} catch (err) {
				console.error("Lỗi khi lấy thông tin tướng trong Edit Mode:", err);
				setMaxStar(7);
			}
		};

		fetchMaxStar();
		setIsModalOpen(true);
	}, [isOpen, build?.championID, metadata.champions, fetchAllMetadata]);

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
			championsList={metadata.champions}
			relicsList={metadata.relics}
			powersList={metadata.powers}
			runesList={metadata.runes}
			isLoadingMeta={isLoadingMeta}
			initialData={{
				_id: build.id,
				championID: build.championID || "",
				description: build.description || "",
				star: build.star || 3,
				display: build.display ?? true,
				relicSetIds: [...(build.relicSetIds || []), null, null, null].slice(0, 3),
				powerIds: [...(build.powerIds || []), null, null, null, null, null, null].slice(0, 6),
				runeIds: [...(build.runeIds || []), null, null, null].slice(0, 3),
			}}
			onChampionChange={handleChampionChange}
			maxStar={maxStar}
		/>
	);
};

export default BuildEditModal;
