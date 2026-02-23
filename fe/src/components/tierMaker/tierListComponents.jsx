// src/pages/tierList/tierListComponents.jsx
import React, { useState, useMemo, memo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

/**
 * Component hiển thị item (Tướng/Cổ vật) trong bảng Tier List
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

		// Tự động chọn ảnh fallback dựa trên loại ID (C0... cho Champion, R0... cho Relic)
		const FALLBACK_IMAGE = id?.toString().startsWith("C")
			? "/fallback-champion.png"
			: "/fallback-relic.png";

		const displaySrc = useMemo(() => {
			if (hasError || !avatar) return FALLBACK_IMAGE;
			// Thêm tham số version để tránh cache ảnh lỗi
			const separator = avatar.includes("?") ? "&" : "?";
			return `${avatar}${separator}v=${id}`;
		}, [avatar, hasError, id, FALLBACK_IMAGE]);

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
				className={`w-8 h-8 sm:w-20 sm:h-20 rounded cursor-grab active:cursor-grabbing shrink-0 select-none touch-none transition-all duration-200 ${
					isSelected
						? "ring-1 ring-primary-500 ring-offset-2 ring-offset-surface-bg scale-90 z-10"
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
					alt='tier-item'
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

export const COLOR_OPTIONS = [
	"#ff3e3e",
	"#ff7f7f",
	"#ff9f40",
	"#ffbf7f",
	"#ffff7f",
	"#7fff7f",
	"#a855f7",
	"#3b82f6",
	"#06b6d4",
	"#ec4899",
	"#555555",
];

export const LOCAL_STORAGE_KEY = "poc-custom-tierlist-v3";
export const RELIC_STORAGE_KEY = "poc-relic-tierlist-v3";
