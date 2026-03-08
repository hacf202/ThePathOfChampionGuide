// src/components/champion/championCard.jsx
import { memo } from "react";
// Giả sử bạn có tệp này để lấy icon của các vùng, hãy đảm bảo đường dẫn chính xác
import iconRegions from "../../assets/data/iconRegions.json";
import SafeImage from "../common/SafeImage";
import { useTranslation } from "../../hooks/useTranslation"; // 🟢 Import Hook Đa ngôn ngữ

function ChampionCard({ champion }) {
	// 🟢 Sử dụng tUI cho text tĩnh và tDynamic cho text từ DB
	const { tUI, tDynamic } = useTranslation();

	// Logic lấy URL hình ảnh, ưu tiên avatarUrl đã được xử lý trước, sau đó đến các đường dẫn khác
	const imageUrl = champion.assets?.[0]?.avatar || "/fallback-image.svg";

	// 🟢 Gọi tDynamic để lấy tên Tướng đã dịch (hoặc gọi tUI lấy tên mặc định nếu không có)
	const championName =
		tDynamic(champion, "name") || tUI("championList.unknownChampion");

	return (
		// Khung thẻ chính với các class CSS tiện ích của Tailwind
		<div className='group relative w-full aspect-[340/500] bg-gray-800 rounded-lg overflow-hidden shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl'>
			{/* Hình ảnh nền của tướng */}
			<SafeImage
				className='absolute object-cover w-full h-full transition-transform duration-300 group-hover:scale-105'
				src={imageUrl}
				alt={championName}
				loading='lazy'
			/>

			{/* Lớp phủ gradient để làm nổi bật văn bản */}
			<div className='absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-t from-black/80 via-black/50 to-transparent' />

			{/* Khung chứa thông tin chi tiết */}
			<div className='absolute bottom-0 left-0 right-0 p-4 text-white'>
				<div>
					{/* Tên tướng */}
					<h3 className='text-2xl font-bold truncate drop-shadow-lg'>
						{championName}
					</h3>
					{/* Năng lượng của tướng */}
					<div className='absolute -top-64 left-4 w-12 h-12 flex items-center justify-center bg-blue-600 border-2 border-white rounded-full text-xl font-bold shadow-md'>
						{champion.cost}
					</div>
				</div>

				{/* Các vùng của tướng */}
				<div className='flex items-center gap-2 mt-1'>
					{/* Lặp qua mảng `regions` để lấy tên hiển thị */}
					{champion.regions?.map(regionName => {
						const regionIcon = iconRegions.find(r => r.name === regionName);

						return (
							<div
								key={regionName}
								className='flex items-center gap-1 bg-black/50 px-2 py-1 rounded-full text-xs backdrop-blur-sm'
							>
								{regionIcon && (
									<SafeImage
										src={regionIcon.iconAbsolutePath}
										alt={regionName}
										className='w-8 h-8 flex-shrink-0'
									/>
								)}
								{/* Ẩn tên trên màn hình nhỏ, hiện từ md trở lên */}
								<span className='hidden md:inline'>{regionName}</span>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}

export default memo(ChampionCard);
