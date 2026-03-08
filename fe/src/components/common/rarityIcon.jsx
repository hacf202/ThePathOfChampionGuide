// src/components/common/rarityIcon.jsx
import React from "react";

const RarityIcon = ({ rarity, size = 16 }) => {
	const normalizedRarity = (rarity || "").toUpperCase();

	const config = {
		// Tiếng Việt & Tiếng Anh Mapping
		THƯỜNG: { shape: "M 8 1 L 1 15 L 15 15 Z", color: "fill-green-500" },
		COMMON: { shape: "M 8 1 L 1 15 L 15 15 Z", color: "fill-green-500" },

		HIẾM: { shape: "M 8 1 L 15 8 L 8 15 L 1 8 Z", color: "fill-blue-500" },
		RARE: { shape: "M 8 1 L 15 8 L 8 15 L 1 8 Z", color: "fill-blue-500" },

		"SỬ THI": {
			shape: "M 8 1 L 15.6 6.5 L 12.8 15 L 3.2 15 L 0.4 6.5 Z",
			color: "fill-purple-500",
		},
		EPIC: {
			shape: "M 8 1 L 15.6 6.5 L 12.8 15 L 3.2 15 L 0.4 6.5 Z",
			color: "fill-purple-500",
		},

		"HUYỀN THOẠI": {
			shape: "M 12 1 L 4 1 L 0 8 L 4 15 L 12 15 L 16 8 Z",
			color: "fill-yellow-500",
		},
		LEGENDARY: {
			shape: "M 12 1 L 4 1 L 0 8 L 4 15 L 12 15 L 16 8 Z",
			color: "fill-yellow-500",
		},
	};

	const current = config[normalizedRarity] || config["COMMON"];

	return (
		<svg
			width={size}
			height={size}
			viewBox='0 0 16 16'
			className={`inline-block ${current.color} drop-shadow-sm`}
		>
			<path d={current.shape} />
		</svg>
	);
};

export default RarityIcon;
