// src/components/champion/championCard.jsx
import { memo } from "react";
import { Zap, Star } from "lucide-react";
import iconRegions from "@/assets/data/icon.json";
import SafeImage from "@/components/common/SafeImage";
import { useTranslation } from "@/hooks/useTranslation";
import { HoverCard } from "@/components/common/animations";
import { getRegionKey } from "@/utils/i18nHelpers";

function ChampionCard({ champion }) {
	const { tUI, tDynamic } = useTranslation();

	const imageUrl = champion.assets?.[0]?.avatar || "/fallback-image.svg";
	const championName =
		tDynamic(champion, "name") || tUI("championList.unknownChampion");

	return (
		<HoverCard>
			{/* Khung thẻ chính chuẩn Tactical với clip-chamfer & border neon */}
			<div className='group relative w-full aspect-[340/500] tactical-card border clip-chamfer overflow-hidden shadow-xl transition-all duration-300 hover:!border-[var(--tactical-accent-lime)] hover:shadow-[0_0_25px_rgba(210,255,40,0.22)]'>
				{/* Góc viền phụ phong cách Cyber Tactical khi hover */}
				<div className='absolute top-0 right-0 w-8 h-8 pointer-events-none border-t-2 border-r-2 border-[var(--tactical-accent-lime)]/0 group-hover:border-[var(--tactical-accent-lime)] transition-colors duration-300 z-10' />

				{/* Hình ảnh nền của tướng */}
				<SafeImage
					className='absolute object-cover w-full h-full transition-transform duration-500 group-hover:scale-105 contrast-105'
					src={imageUrl}
					alt={championName}
					loading='lazy'
					width={340}
					height={500}
				/>

				{/* Năng lượng (Mana / Cost) của tướng chuẩn Cyber Tech */}
				<div className='absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 bg-black/85 backdrop-blur-md border border-blue-500/50 clip-chamfer-sm shadow-[0_0_12px_rgba(59,130,246,0.35)]'>
					<Zap className='w-3.5 h-3.5 text-blue-400 fill-current' />
					<span className='font-mono-tech font-bold text-sm md:text-base text-blue-400'>
						{champion.cost ?? 0}
					</span>
				</div>

				{/* Ngôi sao tối đa (Max Star) chuẩn phong cách Tactical */}
				{champion.maxStar && (
					<div className='absolute top-3 right-3 z-10 flex items-center gap-1 px-2 py-0.5 bg-black/85 backdrop-blur-md border border-amber-400/40 clip-chamfer-sm font-mono-tech text-xs text-amber-400 shadow-md'>
						<span>{champion.maxStar}</span>
						<Star className='w-3 h-3 fill-current' />
					</div>
				)}

				{/* Lớp phủ gradient sâu để làm nổi bật văn bản */}
				<div className='absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent' />

				{/* Khung chứa thông tin chi tiết */}
				<div className='absolute bottom-0 left-0 right-0 p-4 text-white z-10'>
					{/* Tên tướng font-display Tactical */}
					<h3 className='font-display text-2xl md:text-3xl uppercase italic tracking-wide text-white group-hover:text-[var(--tactical-accent-lime)] transition-colors drop-shadow-lg truncate'>
						{championName}
					</h3>

					{/* Các vùng của tướng */}
					<div className='flex flex-wrap items-center gap-1.5 mt-2'>
						{champion.regions?.map(regionName => {
							const regionIcon = iconRegions.find(r => getRegionKey(r.name) === getRegionKey(regionName));
							const regionKey = getRegionKey(regionName);
							const translatedRegion = tUI(`shared.region.${regionKey}`) || regionName;

							return (
								<div
									key={regionName}
									className='flex items-center gap-1.5 bg-black/75 border border-white/20 px-2 py-0.5 clip-chamfer-sm text-[11px] font-mono-tech uppercase backdrop-blur-md text-gray-100 group-hover:border-[var(--tactical-accent-cyan)]/60 transition-colors'
								>
									{regionIcon && (
										<SafeImage
											src={regionIcon.image}
											alt={translatedRegion}
											className='w-4 h-4 md:w-5 md:h-5 object-contain flex-shrink-0'
											width={64}
											height={64}
										/>
									)}
									<span className='hidden sm:inline'>{translatedRegion}</span>
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</HoverCard>
	);
}

export default memo(ChampionCard);
