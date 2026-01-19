// src/components/tierList/TierListComponents.jsx
import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

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
				src={`${avatar}${avatar.includes("?") ? "&" : "?"}cache-bust=${id}`}
				crossOrigin='anonymous'
				className='rounded w-full h-full object-cover border border-white/10 pointer-events-none'
				alt='champion'
				onError={e => {
					e.target.src = "/fallback-champion.png";
				}}
			/>
		</div>
	);
};

export const DroppableZone = ({ id, children, className }) => {
	const { setNodeRef } = useDroppable({ id });
	return (
		<div ref={setNodeRef} className={className}>
			{children}
		</div>
	);
};

export const COLOR_OPTIONS = [
	"#ff7f7f",
	"#ffbf7f",
	"#ffff7f",
	"#7fff7f",
	"#7fbfff",
	"#7f7fff",
	"#ff7fff",
];

export const LOCAL_STORAGE_KEY = "poc-custom-tierlist-v3";
