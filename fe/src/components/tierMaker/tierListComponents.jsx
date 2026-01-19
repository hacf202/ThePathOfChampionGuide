// src/components/tierList/TierListComponents.jsx
import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

/**
 * Component hiển thị một item có thể sắp xếp
 * @param {string} id - ID duy nhất của item
 * @param {string} avatar - Đường dẫn ảnh đại diện
 * @param {boolean} isOverlay - Trạng thái khi đang được kéo (hiển thị trên lớp phủ)
 */
export const SortableItem = ({ id, avatar, isOverlay }) => {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id });

	const style = {
		transform: CSS.Translate.toString(transform),
		transition: transition || "transform 200ms ease",
		opacity: isDragging && !isOverlay ? 0.3 : 1,
		touchAction: "none",
		zIndex: isDragging ? 999 : 1,
	};

	// Xử lý URL ảnh an toàn để tránh lỗi 'includes' của undefined
	// Nếu avatar không tồn tại, sử dụng ảnh fallback mặc định
	const safeAvatar = avatar || "/fallback-relic.png";
	const finalSrc = `${safeAvatar}${safeAvatar.includes("?") ? "&" : "?"}cache-bust=${id}`;

	return (
		<div
			ref={setNodeRef}
			style={style}
			{...attributes}
			{...listeners}
			className={`w-12 h-12 sm:w-20 sm:h-20 rounded cursor-grab active:cursor-grabbing shrink-0 select-none touch-none ${
				isOverlay ? "z-[1000] scale-110 ring-2 ring-primary-400 shadow-2xl" : ""
			}`}
		>
			<img
				src={finalSrc}
				crossOrigin='anonymous'
				className='rounded w-full h-full object-cover border border-white/10 pointer-events-none'
				alt='relic'
				onError={e => {
					// Fallback nếu ảnh từ server bị lỗi load
					e.target.src = "/fallback-relic.png";
				}}
			/>
		</div>
	);
};

/**
 * Vùng chứa các item có thể thả vào
 */
export const DroppableZone = ({ id, children, className }) => {
	const { setNodeRef } = useDroppable({ id });
	return (
		<div ref={setNodeRef} className={className}>
			{children}
		</div>
	);
};

// Danh sách mã màu mặc định cho các hàng Tier
export const COLOR_OPTIONS = [
	"#ff7f7f", // Đỏ (S)
	"#ffbf7f", // Cam (A)
	"#ffff7f", // Vàng (B)
	"#7fff7f", // Xanh lá (C)
	"#7fbfff", // Xanh dương
	"#7f7fff", // Tím
	"#ff7fff", // Hồng
];

export const LOCAL_STORAGE_KEY = "poc-custom-tierlist-v3";
