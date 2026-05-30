// src/pages/tierList/tierListComponents.jsx
import React, { useState, useMemo, memo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

export const RelicSlot = memo(({ id, championId, slotIndex, relic, isInTier, onRelicSlotClick }) => {
	return (
		<div 
			className={`flex-1 h-full cursor-pointer flex items-center justify-center relative transition-colors ${!relic && !isInTier ? 'bg-black/40 border border-white/10' : ''}`}
			onClick={(e) => {
				e.stopPropagation();
				e.preventDefault();
				if (onRelicSlotClick) onRelicSlotClick(championId, slotIndex, e);
			}}
			onContextMenu={(e) => {
				e.stopPropagation();
				e.preventDefault();
				if (onRelicSlotClick) onRelicSlotClick(championId, slotIndex, e, true);
			}}
			data-no-dnd="true"
		>
			{relic ? (
				<img src={relic.avatar} alt="relic" className="w-full h-full object-cover pointer-events-none drop-shadow-lg" crossOrigin='anonymous' />
			) : null}
		</div>
	);
});

/**
 * Component hiển thị item (Tướng/Cổ vật) trong bảng Tier List
 */
export const SortableItem = memo(
	({ id, avatar, isOverlay, isSelected, onClick, onContextMenu, title, showRelicSlots, equippedRelics, onRelicSlotClick, isInTier }) => {
		const {
			attributes,
			listeners,
			setNodeRef,
			transform,
			transition,
			isDragging,
		} = useSortable({ id });

		const { isOver: isRelicOver, setNodeRef: setRelicDropRef } = useDroppable({
			id: `relic-drop-${id}`,
			data: { type: "champion-relic-drop" }
		});

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
				className={`flex flex-col cursor-grab active:cursor-grabbing group rounded overflow-hidden`}
			>
				{showRelicSlots ? (
					<div 
						ref={setRelicDropRef}
						className={`relative w-[38px] sm:w-[96px] shrink-0 select-none touch-none rounded overflow-hidden shadow-lg border border-white/10 group cursor-grab active:cursor-grabbing transition-colors ${isRelicOver ? 'ring-2 ring-primary-500 bg-primary-500/20' : ''}`}
						onContextMenu={(e) => {
							if (onContextMenu) {
								e.preventDefault();
								e.stopPropagation();
								onContextMenu(e, id);
							}
						}}
					>
						<div className={`w-full aspect-square ${
							isSelected ? "ring-2 ring-primary-500 z-10" : ""
						}`}>
							<img src={displaySrc} crossOrigin='anonymous' className='w-full h-full object-cover pointer-events-none' alt='tier-item' onError={() => setHasError(true)} />
						</div>
						<div className="absolute bottom-0 left-0 right-0 flex w-full h-[12px] sm:h-[32px] bg-gradient-to-t from-black/80 via-black/40 to-transparent">
							{[0, 1, 2].map((slotIndex) => (
								<RelicSlot 
									key={slotIndex} 
									id={`relic-slot-${id}-${slotIndex}`} 
									championId={id}
									slotIndex={slotIndex}
									relic={equippedRelics?.[slotIndex]} 
									isInTier={isInTier}
									onRelicSlotClick={onRelicSlotClick} 
								/>
							))}
						</div>
					</div>
				) : (
					<div 
						ref={setRelicDropRef}
						className={`w-[38px] h-[38px] sm:w-20 sm:h-20 shrink-0 select-none touch-none transition-all duration-200 ${
							isSelected
								? "ring-1 ring-primary-500 ring-offset-2 ring-offset-surface-bg scale-90 z-10"
								: "ring-1 ring-white/10"
						} ${
							isOverlay
								? "z-[1000] scale-110 ring-2 ring-primary-400 shadow-2xl"
								: ""
						} ${
							isRelicOver ? "ring-2 ring-primary-500 bg-primary-500/20" : ""
						}`}
						onContextMenu={(e) => {
							if (onContextMenu) {
								e.preventDefault();
								e.stopPropagation();
								onContextMenu(e, id);
							}
						}}
					>
						<img
							src={displaySrc}
							crossOrigin='anonymous'
							className='rounded-t sm:rounded w-full h-full object-cover pointer-events-none'
							alt='tier-item'
							onError={() => setHasError(true)}
						/>
					</div>
				)}
			</div>
		);
	},
);

export const DroppableZone = ({ id, children, className, style }) => {
	const { setNodeRef } = useDroppable({ id });
	return (
		<div ref={setNodeRef} className={className} style={style}>
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
