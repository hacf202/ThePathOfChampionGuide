// src/components/build/buildCreation.jsx
import React, { useState } from "react";
import BuildModal from "./buildModal";

const BuildCreation = ({
	onConfirm,
	onClose,
	championsList = [],
	relicsList = [],
	powersList = [],
	runesList = [],
}) => {
	const [isOpen, setIsOpen] = useState(true);
	const [maxStar, setMaxStar] = useState(7);
	const [championID, setChampionID] = useState("");

	const handleChampionChange = async id => {
		setChampionID(id);
		if (!id || !id.trim()) {
			setMaxStar(7);
			return;
		}

		// Ưu tiên tìm trong danh sách truyền xuống để tăng tốc độ
		if (championsList.length > 0) {
			const champion = championsList.find(c => c.championID === id.trim());
			if (champion) {
				setMaxStar(champion.maxStar ?? 7);
				return;
			}
		}

		// Fallback gọi API nếu không tìm thấy trong list
		try {
			const apiUrl = import.meta.env.VITE_API_URL;
			const res = await fetch(
				`${apiUrl}/api/champions/${encodeURIComponent(id.trim())}`,
			);
			const data = await res.json();
			const champion = data;
			setMaxStar(champion?.maxStar ?? 7);
		} catch (err) {
			console.error("Lỗi khi lấy thông tin sao tối đa của tướng:", err);
			setMaxStar(7);
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
			championsList={championsList}
			relicsList={relicsList}
			powersList={powersList}
			runesList={runesList}
		/>
	);
};

export default BuildCreation;
