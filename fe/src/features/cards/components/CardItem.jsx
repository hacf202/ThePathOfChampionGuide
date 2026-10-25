import React, { memo } from "react";
import { Link } from "react-router-dom";
import SafeImage from "@/components/common/SafeImage";
import { useTranslation } from "@/hooks/useTranslation";

/**
 * CardItem: Vertical portrait component for LoR cards.
 * Simplified version showing only the card image for a cleaner gallery view.
 */
const CardItem = ({ card }) => {
	const { language } = useTranslation();

	// Logic lấy tên dựa trên ngôn ngữ (để làm alt text)
	const cardName = language === "en" && card.translations?.en?.cardName
		? card.translations.en.cardName
		: card.cardName;

	// Logic lấy URL hình ảnh
	const imageUrl = language === "en" && card.translations?.en?.gameAbsolutePath
		? card.translations.en.gameAbsolutePath
		: card.gameAbsolutePath;

	return (
		<Link to={`/card/${card.cardCode}`} className="block group h-fit overflow-hidden clip-chamfer-sm">
			<div className='relative w-full aspect-[680/1024] bg-[var(--tactical-card-bg)] clip-chamfer-sm overflow-hidden shadow-xl border border-[var(--tactical-card-border)] transform transition-all duration-500 group-hover:scale-105 group-hover:border-[var(--tactical-accent-cyan)] group-hover:shadow-[0_0_15px_rgba(0,245,212,0.2)]'>
				<SafeImage
					src={imageUrl}
					alt={cardName}
					className='absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110'
					loading='lazy'
					width={340}
					height={512}
				/>

				{/* Overlay for better text/detail visibility if added later */}
				<div className='absolute inset-0 bg-gradient-to-t from-[var(--tactical-card-bg)]/80 via-transparent to-transparent opacity-80 group-hover:opacity-30 transition-opacity' />
				
				{/* Hover Glow */}
				<div className='absolute inset-0 bg-[var(--tactical-accent-cyan)]/0 group-hover:bg-[var(--tactical-accent-cyan)]/5 transition-colors pointer-events-none' />
			</div>
		</Link>
	);
};

export default memo(CardItem);
