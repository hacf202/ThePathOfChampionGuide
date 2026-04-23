import React, { useState, memo } from "react";
import { Link } from "react-router-dom";
import SafeImage from "../common/SafeImage";
import { useTranslation } from "../../hooks/useTranslation";
import CardHoverTooltip from "./CardHoverTooltip";

const CardNameCell = memo(({ card, items, cardCode, isReference = false, onOpenCarousel, className = "" }) => {
	const { tDynamic, language } = useTranslation();
	const [hoverPos, setHoverPos] = useState(null);

	const cardName = card ? tDynamic(card, "cardName") : cardCode;
	const isEN = language === "en";
	const cardImg = isEN
		? (card?.translations?.en?.gameAbsolutePath || card?.gameAbsolutePath || "/fallback-card.png")
		: (card?.gameAbsolutePath || "/fallback-card.png");

	return (
		<div
			className={`flex items-center gap-3 cursor-zoom-in w-max ${className}`}
			onMouseEnter={e => {
				if (window.innerWidth < 640) return; // Skip hover on mobile
				const rect = e.currentTarget.getBoundingClientRect();
				setHoverPos({
					x: rect.right,
					y: rect.top,
				});
			}}
			onMouseLeave={() => setHoverPos(null)}
			onClick={e => {
				if (window.innerWidth < 640) {
					// On mobile: Open Carousel!
					if (onOpenCarousel) onOpenCarousel(card, cardCode);
					return;
				}
				// Desktop: Toggle tooltip or nothing
				if (hoverPos) {
					setHoverPos(null);
				} else {
					const rect = e.currentTarget.getBoundingClientRect();
					setHoverPos({
						x: rect.right,
						y: rect.top,
					});
				}
			}}
			onContextMenu={e => {
				e.preventDefault();
				if (onOpenCarousel) onOpenCarousel(card, cardCode);
			}}
		>
			{/* Small Thumbnail */}
			<div className='w-11 h-16 rounded border border-white/10 overflow-hidden bg-black/20 shrink-0 shadow-sm'>
				<SafeImage src={cardImg} className='w-full h-full object-cover' />
			</div>

			<Link 
				to={`/card/${cardCode}`}
				onClick={(e) => e.stopPropagation()}
				className={`text-sm sm:text-base font-bold pb-0.5 transition-all border-b border-dashed hover:underline ${
					isReference
						? "text-purple-500 border-purple-500/30 hover:text-purple-400"
						: "text-primary-500 border-primary-500/30 hover:text-primary-400"
				}`}
			>
				{cardName}
			</Link>

			{/* Tooltip Portal */}
			{hoverPos && card && (
				<CardHoverTooltip
					card={card}
					items={items}
					x={hoverPos.x}
					y={hoverPos.y}
				/>
			)}
		</div>
	);
});

export default CardNameCell;
