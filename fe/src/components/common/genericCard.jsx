import { memo } from "react";
import PropTypes from "prop-types";
import RarityIcon from "./rarityIcon";

const GenericCard = ({
	item,
	onClick,
	placeholderImage = "/images/placeholder.png",
}) => {
	// Logic hiển thị ảnh: Dùng assetAbsolutePath hoặc image từ dữ liệu mới, nếu không thì dùng placeholder
	const imageSrc = item.assetAbsolutePath || item.image || placeholderImage;

	return (
		<div
			className='hover:scale-105 transition-transform duration-200 cursor-pointer h-full'
			onClick={onClick}
		>
			<div className='group relative flex items-center gap-4 bg-surface-bg p-4 rounded-lg hover:bg-surface-hover transition border border-border h-full'>
				{/* --- Phần Ảnh --- */}
				<div className='flex-shrink-0'>
					<img
						src={imageSrc}
						alt={item.name}
						loading='lazy'
						className='w-16 h-16 object-cover rounded-md border border-border-secondary'
					/>
				</div>

				{/* --- Phần Thông tin (Tên & Độ hiếm) --- */}
				<div className='flex-grow min-w-0'>
					<h3 className='font-bold text-lg text-text-primary font-primary truncate'>
						{item.name}
					</h3>
					<div className='flex items-center gap-2 text-sm text-text-secondary mt-1'>
						{item.rarity ? (
							<>
								<RarityIcon rarity={item.rarity} />
								<span>{item.rarity}</span>
							</>
						) : (
							<span className='italic text-xs text-text-tertiary'>
								{item.nodeType === "bonusStarGem"
									? "Bonus Star Gem"
									: "Bonus Star"}
							</span>
						)}
					</div>
				</div>

				{/* --- Tooltip (Hiện khi hover) --- */}
				{/* SỬA ĐỔI: Kiểm tra cả descriptionRaw HOẶC description */}
				{(item.descriptionRaw || item.description) && (
					<div className='absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-72 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 invisible group-hover:visible pointer-events-none z-50 border border-gray-700'>
						<p className='whitespace-pre-wrap leading-relaxed'>
							{item.descriptionRaw || item.description || "Không có mô tả"}
						</p>
						{/* Mũi tên tooltip */}
						<div className='absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-gray-900'></div>
					</div>
				)}
			</div>
		</div>
	);
};

GenericCard.propTypes = {
	item: PropTypes.shape({
		name: PropTypes.string.isRequired,
		rarity: PropTypes.string,
		assetAbsolutePath: PropTypes.string,
		image: PropTypes.string,
		descriptionRaw: PropTypes.string,
		description: PropTypes.string,
		nodeType: PropTypes.string,
	}).isRequired,
	onClick: PropTypes.func,
	placeholderImage: PropTypes.string,
};

export default memo(GenericCard);
