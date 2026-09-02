import { useState } from "react";
import { Star } from "lucide-react";
import SafeImage from "@/components/common/SafeImage";
import MarkupRenderer from "@/components/common/MarkupRenderer";
import iconRegions from "@/assets/data/icon.json";
import { getRegionKey } from "@/utils/i18nHelpers";


const ChampionHeader = ({ champion, tDynamic, tUI }) => {
	const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

	if (!champion) return null;

	return (
		<div className='flex flex-col md:flex-row border border-border gap-4 rounded-xl bg-surface-bg sm:p-6 shadow-sm overflow-hidden'>
			<SafeImage
				className='h-[300px] w-full md:w-[300px] object-contain rounded-lg mt-4 transform-gpu will-change-transform'
				src={champion.assets?.[0]?.avatar}
				alt={tDynamic(champion, "name")}
				fetchpriority='high'
				decoding='async'
				loading='eager'
				width={400}
				height={400}
			/>
			<div className='flex-1'>
				<div className='flex flex-col sm:flex-row sm:justify-between p-1 gap-2'>
					<h1 className='text-2xl sm:text-4xl font-bold font-primary'>
						{tDynamic(champion, "name")}
					</h1>
					<div className='flex flex-wrap gap-2 items-center'>
						<div className='flex items-center gap-1 px-2.5 py-1.5 bg-yellow-500/20 border border-yellow-500 rounded-full'>
							<span className='text-sm font-bold'>
								{champion.maxStar}
							</span>
							<Star
								size={16}
								className='text-yellow-600 fill-current'
							/>
						</div>
						{champion.regions?.map((r, i) => (
							<img
								key={i}
								src={
									iconRegions.find(item => getRegionKey(item.name) === getRegionKey(r))
										?.image || "/fallback-image.svg"
								}
								alt={r}
								className='w-10 h-10'
							/>
						))}
					</div>
				</div>
				<div className="mt-2 mx-1 flex items-center justify-end">
					<button
						onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
						className='text-primary-500 text-sm font-bold hover:underline px-2'
					>
						{isDescriptionExpanded
							? tUI("championDetail.showLess")
							: tUI("championDetail.showMore")}
					</button>
				</div>
				<div
					className={`mt-2 mx-1 p-3 border border-border rounded-lg bg-surface-bg-alt/30 ${!isDescriptionExpanded ? "overflow-y-auto h-48 sm:h-60" : "h-auto"}`}
				>
					<MarkupRenderer text={tDynamic(champion, "description")} />
				</div>
			</div>
		</div>
	);
};

export default ChampionHeader;
