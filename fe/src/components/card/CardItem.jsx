import React, { memo } from "react";
import { Link } from "react-router-dom";
import SafeImage from "../common/SafeImage";
import { useTranslation } from "../../hooks/useTranslation";

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
		<Link to={`/card/${card.cardCode}`} className="block group">
			<div className='relative w-full aspect-[680/1024] bg-surface-bg rounded-xl overflow-hidden shadow-lg border border-border/50 transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:border-primary-500/30'>
				<SafeImage
					src={imageUrl}
					alt={cardName}
					className='absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110'
					loading='lazy'
				/>

				{/* Subtle Glow Effect on Hover */}
				<div className='absolute inset-0 bg-primary-500/0 group-hover:bg-primary-500/5 transition-colors pointer-events-none' />
			</div>
		</Link>
	);
};

export default memo(CardItem);
