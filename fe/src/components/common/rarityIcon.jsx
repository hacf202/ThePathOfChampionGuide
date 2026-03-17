// src/components/common/rarityIcon.jsx
import React from "react";

const RarityIcon = ({ rarity, size = 16 }) => {
	const normalizedRarity = (rarity || "").toUpperCase();

	// 🟢 XỬ LÝ RIÊNG: Bắt trường hợp Đặc biệt / Special và trả về thẻ div Gradient
	if (normalizedRarity === "ĐẶC BIỆT" || normalizedRarity === "SPECIAL") {
		return (
			<div
				style={{
					width: `${size}px`,
					height: `${size}px`,
					borderRadius: "50%",
					background: "linear-gradient(to top, #e8b4e6, #3b82f6)", // Hồng tím nhạt -> Xanh dương, hướng từ dưới lên
					display: "inline-block",
					verticalAlign: "middle",
					flexShrink: 0,
				}}
				title={rarity}
			/>
		);
	}

	// 🟢 GIỮ NGUYÊN CẤU TRÚC SVG PATH GỐC CỦA BẠN DÀNH CHO CÁC ĐỘ HIẾM KHÁC
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
			shape: "M 8 1 L 15 5 L 12 15 L 4 15 L 1 5 Z",
			color: "fill-yellow-500",
		},
		LEGENDARY: {
			shape: "M 8 1 L 15 5 L 12 15 L 4 15 L 1 5 Z",
			color: "fill-yellow-500",
		},
	};

	const defaultShape = {
		shape: "M 8 1 L 1 15 L 15 15 Z",
		color: "fill-gray-400",
	};
	const current = config[normalizedRarity] || defaultShape;

	return (
		<svg
			width={size}
			height={size}
			viewBox='0 0 16 16'
			xmlns='http://www.w3.org/2000/svg'
			className={`inline-block align-middle flex-shrink-0 ${current.color}`}
			title={rarity}
		>
			<path d={current.shape} />
		</svg>
	);
};

export default RarityIcon;
