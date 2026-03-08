import { memo, useState, useRef } from "react";
import PropTypes from "prop-types";
import {
	useFloating,
	autoUpdate,
	offset,
	flip,
	shift,
	useHover,
	useFocus,
	useInteractions,
	FloatingPortal,
	FloatingArrow,
	arrow,
} from "@floating-ui/react";
import RarityIcon from "./rarityIcon";
import { useTranslation } from "../../hooks/useTranslation"; //

const GenericCard = ({
	item,
	onClick,
	placeholderImage = "/images/placeholder.png",
}) => {
	// Khởi tạo Hook đa ngôn ngữ với các hàm tUI và tDynamic
	const { tUI, tDynamic } = useTranslation();
	const [isOpen, setIsOpen] = useState(false);
	const arrowRef = useRef(null);

	// Cấu hình Floating UI để xử lý Tooltip
	const { refs, floatingStyles, context } = useFloating({
		open: isOpen,
		onOpenChange: setIsOpen,
		placement: "top", // Mặc định hiển thị phía trên
		whileElementsMounted: autoUpdate, // Tự động cập nhật vị trí khi scroll hoặc resize
		middleware: [
			offset(12), // Khoảng cách giữa card và tooltip
			flip(), // Tự động nhảy xuống dưới nếu phía trên hết chỗ
			shift(), // Dịch sang trái/phải nếu bị chạm mép màn hình
			arrow({
				element: arrowRef,
			}),
		],
	});

	// Các trigger để hiện tooltip (hover và focus cho accessibility)
	const hover = useHover(context, { move: false });
	const focus = useFocus(context);
	const { getReferenceProps, getFloatingProps } = useInteractions([
		hover,
		focus,
	]);

	// Xác định nguồn ảnh: Ưu tiên đường dẫn tuyệt đối, sau đó là image field, cuối cùng là placeholder
	const imageSrc = item.assetAbsolutePath || item.image || placeholderImage;

	// 🟢 Sử dụng tDynamic để dịch Tên & Mô tả từ dữ liệu động (Database)
	const itemName = tDynamic(item, "name");
	const description =
		tDynamic(item, "descriptionRaw") || tDynamic(item, "description");

	/**
	 * Hàm render nhãn hiển thị khi không có độ hiếm (Rarity)
	 * Sử dụng tUI để lấy text từ file ngôn ngữ tĩnh thay vì hardcode
	 */
	const renderNodeTypeLabel = () => {
		if (item.nodeType === "bonusStarGem") {
			return tUI("constellation.typeGemstone"); // Lấy từ vi.json/en.json
		}
		return tUI("constellation.tabBonusStars"); // Lấy từ vi.json/en.json
	};

	return (
		<>
			{/* --- Component Card --- */}
			<div
				ref={refs.setReference}
				{...getReferenceProps()}
				className='hover:scale-105 transition-transform duration-200 cursor-pointer h-full'
				onClick={onClick}
			>
				<div className='group relative flex items-center gap-4 bg-surface-bg p-4 rounded-lg hover:bg-surface-hover transition border border-border h-full'>
					{/* Phần Ảnh */}
					<div className='flex-shrink-0'>
						<img
							src={imageSrc}
							alt={itemName}
							loading='lazy'
							className='w-16 h-16 object-cover rounded-md border border-border-secondary'
						/>
					</div>

					{/* Phần Thông tin */}
					<div className='flex-grow min-w-0'>
						<h3 className='font-bold text-lg text-text-primary font-primary truncate'>
							{itemName}
						</h3>
						<div className='flex items-center gap-2 text-sm text-text-secondary mt-1'>
							{item.rarity ? (
								<>
									<RarityIcon rarity={item.rarity} />
									<span>{item.rarity}</span>
								</>
							) : (
								<span className='italic text-xs text-text-tertiary'>
									{renderNodeTypeLabel()}
								</span>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* --- Tooltip sử dụng Portal --- */}
			{/* FloatingPortal đưa nội dung ra ngoài cùng của DOM body để tránh lỗi overflow */}
			{isOpen && description && (
				<FloatingPortal>
					<div
						ref={refs.setFloating}
						style={floatingStyles}
						{...getFloatingProps()}
						className='z-[9999] w-72 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-xl border border-gray-700 pointer-events-none'
					>
						<p className='whitespace-pre-wrap leading-relaxed'>{description}</p>

						{/* Mũi tên tooltip sử dụng FloatingArrow để đồng bộ vị trí */}
						<FloatingArrow
							ref={arrowRef}
							context={context}
							fill='#111827' // Tương đương bg-gray-900
							stroke='#374151' // Tương đương border-gray-700
							strokeWidth={1}
						/>
					</div>
				</FloatingPortal>
			)}
		</>
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
		translations: PropTypes.object, // Thêm cấu trúc translations để tDynamic hoạt động
	}).isRequired,
	onClick: PropTypes.func,
	placeholderImage: PropTypes.string,
};

export default memo(GenericCard);
