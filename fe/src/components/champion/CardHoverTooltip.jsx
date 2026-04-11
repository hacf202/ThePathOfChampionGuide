import { memo } from "react";
import { createPortal } from "react-dom";
import SafeImage from "../common/SafeImage";
import { useTranslation } from "../../hooks/useTranslation";
import { Link } from "react-router-dom";

const CardHoverTooltip = memo(
	({ card, items, cardCode, position, onClose }) => {
		const { tDynamic, language } = useTranslation();
		if (!card && !cardCode) return null;
		if (!position) return null;

		const isEN = language === "en";
		const cardName = card ? tDynamic(card, "cardName") : cardCode;

		// Dùng ảnh EN nếu có khi đang ở ngôn ngữ EN
		const cardImg = isEN
			? (card?.translations?.en?.gameAbsolutePath || card?.gameAbsolutePath || "/fallback-card.png")
			: (card?.gameAbsolutePath || "/fallback-card.png");

		// Mobile detection
		const isMobile = typeof window !== "undefined" && window.innerWidth < 640;

		const content = (
			<>
				{/* Mobile Backdrop for dismissing on touch */}
				{isMobile && (
					<div
						className='fixed inset-0 z-[9998] pointer-events-auto'
						onClick={onClose}
					/>
				)}

				<div
					className={`fixed z-[99999] pointer-events-none transition-all duration-300 ${isMobile ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" : ""}`}
					style={
						!isMobile
							? {
									left: Math.min(position.x + 10, window.innerWidth - 300),
									top: Math.max(10, position.y - 100),
							  }
							: {}
					}
				>
					{/* Container */}
					<div
						className={`relative ${isMobile ? "w-40" : "w-52"} overflow-visible animate-in fade-in zoom-in-95 duration-200`}
					>
						{/* Card Image */}
						<div className='relative aspect-[2/3] w-full'>
							<SafeImage
								src={cardImg}
								alt={cardName}
								className='w-full h-full object-cover rounded-2xl'
							/>
						</div>

						{/* Floating Items */}
						{items && items.length > 0 && (
							<div className='absolute right-[-15px] sm:right-[-20px] top-1/2 -translate-y-1/2 flex flex-col gap-0 z-10'>
								{items.map((item, idx) => {
									const itemName = tDynamic(item, "name") || "Item";
									const itemImg =
										item.assetAbsolutePath ||
										item.image ||
										"/fallback-image.svg";

									return (
										<Link
											key={idx}
											to={`/item/${item.itemCode}`}
											className='relative pointer-events-auto block transition-transform hover:scale-110 active:scale-95'
											title={itemName}
										>
											<div className='w-11 h-11 sm:w-16 sm:h-16 flex items-center justify-center rounded-full overflow-hidden'>
												<SafeImage
													src={itemImg}
													alt={itemName}
													className='w-full h-full object-contain scale-110'
												/>
											</div>
										</Link>
									);
								})}
							</div>
						)}
					</div>
				</div>
			</>
		);

		return createPortal(content, document.body);
	},
);

export default CardHoverTooltip;
