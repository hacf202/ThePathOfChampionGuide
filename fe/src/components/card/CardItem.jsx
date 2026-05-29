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
		<Link to={`/card/${card.cardCode}`} className="block group h-fit overflow-hidden rounded-xl">
			<div className='relative w-full aspect-[680/1024] bg-gray-800/40 rounded-xl overflow-hidden shadow-2xl border border-white/10 transform transition-all duration-700 group-hover:scale-105 group-hover:shadow-primary-500/20 group-hover:border-primary-500/40'>
				<SafeImage
					src={imageUrl}
					alt={cardName}
					className='absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110'
					loading='lazy'
					width={340}
					height={512}
				/>

				{/* Overlay for better text/detail visibility if added later */}
				<div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-40 transition-opacity' />
				
				{/* Hover Glow */}
				<div className='absolute inset-0 bg-primary-500/0 group-hover:bg-primary-500/10 transition-colors pointer-events-none' />
			</div>
		</Link>
	);
};

export default memo(CardItem);
