// src/components/tierList/TierListComponents.jsx
import React, { useState, useEffect, useMemo, memo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

/**
 * Component hiển thị item (Tướng/Cổ vật)
 * Khắc phục lỗi loop fallback bằng cách quản lý hasError state
 */
export const SortableItem = memo(
	({ id, avatar, isOverlay, isSelected, onClick, title }) => {
		const {
			attributes,
			listeners,
			setNodeRef,
			transform,
			transition,
			isDragging,
		} = useSortable({ id });

		const [hasError, setHasError] = useState(false);
		const FALLBACK_IMAGE = "/fallback-relic.png";

		// Tạo URL ổn định, chỉ thay đổi khi avatar hoặc trạng thái lỗi thay đổi
		const displaySrc = useMemo(() => {
			if (hasError || !avatar) return FALLBACK_IMAGE;
			// Thêm version ổn định dựa trên id để cache tốt hơn
			return `${avatar}${avatar.includes("?") ? "&" : "?"}v=${id}`;
		}, [avatar, hasError, id]);

		const style = {
			transform: CSS.Translate.toString(transform),
			transition: transition || "transform 200ms ease",
			opacity: isDragging && !isOverlay ? 0.3 : 1,
			touchAction: "none",
			zIndex: isDragging ? 999 : 1,
		};

		return (
			<div
				ref={setNodeRef}
				style={style}
				{...attributes}
				{...listeners}
				onClick={onClick}
				data-id={id}
				title={title}
				className={`w-12 h-12 sm:w-20 sm:h-20 rounded cursor-grab active:cursor-grabbing shrink-0 select-none touch-none transition-all duration-200 ${
					isSelected
						? "ring-4 ring-primary-500 ring-offset-2 ring-offset-surface-bg scale-90 z-10"
						: "ring-1 ring-white/10"
				} ${
					isOverlay
						? "z-[1000] scale-110 ring-2 ring-primary-400 shadow-2xl"
						: ""
				}`}
			>
				<img
					src={displaySrc}
					crossOrigin='anonymous'
					className='rounded w-full h-full object-cover pointer-events-none'
					alt='item'
					onError={() => setHasError(true)}
				/>
			</div>
		);
	},
);

export const DroppableZone = ({ id, children, className }) => {
	const { setNodeRef } = useDroppable({ id });
	return (
		<div ref={setNodeRef} className={className}>
			{children}
		</div>
	);
};

// Danh sách các tùy chọn màu sắc cho hàng Tier
export const COLOR_OPTIONS = [
	"#ff3e3e", // Đỏ đậm
	"#ff7f7f", // Đỏ nhạt
	"#ff9f40", // Cam
	"#ffbf7f", // Cam nhạt
	"#ffff7f", // Vàng
	"#7fff7f", // Xanh lá
	"#a855f7", // Tím (Mới thêm)
	"#3b82f6", // Xanh dương (Mới thêm)
	"#06b6d4", // Xanh lơ / Cyan (Mới thêm)
	"#ec4899", // Hồng (Mới thêm)
	"#555555", // Xám mặc định
];

export const LOCAL_STORAGE_KEY = "poc-custom-tierlist-v3";
