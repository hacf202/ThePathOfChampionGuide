// src/components/build/buildCreation.jsx
import React, { useState } from "react";
import BuildModal from "./buildModal";

const BuildCreation = ({ onConfirm, onClose }) => {
	const [isOpen, setIsOpen] = useState(true);
	const [maxStar, setMaxStar] = useState(7);
	const [championName, setChampionName] = useState("");

	const handleChampionChange = async name => {
		setChampionName(name);
		if (!name || !name.trim()) {
			setMaxStar(7);
			return;
		}

		try {
			const apiUrl = import.meta.env.VITE_API_URL;
			const res = await fetch(
				`${apiUrl}/api/champions/search?name=${encodeURIComponent(name.trim())}`,
			);
			const data = await res.json();

			const champion = data.items?.[0];
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
		/>
	);
};

export default BuildCreation;
