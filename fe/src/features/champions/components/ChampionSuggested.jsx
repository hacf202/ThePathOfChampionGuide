import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import SafeImage from "@/components/common/SafeImage";

const ChampionSuggested = ({ suggestedChampions, tUI, tDynamic }) => {
	if (!suggestedChampions || suggestedChampions.length === 0) return null;

	return (
		<div className='mt-12 mb-8 bg-surface-bg border border-border rounded-xl p-1 sm:p-6 shadow-sm'>
			<h2 className='p-1 text-lg sm:text-2xl font-semibold mb-6 font-primary text-primary-500 border-b border-border uppercase flex items-center gap-2'>
				{tUI("championDetail.suggestedTitle")}
			</h2>
			<div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
				{suggestedChampions.map(suggested => (
					<Link
						key={suggested.championID}
						to={`/champion/${suggested.championID}`}
						className='group relative bg-surface-bg border border-border rounded-xl overflow-hidden hover:border-primary-500 transition-all hover:shadow-lg hover:shadow-primary-500/10'
					>
						<div className='aspect-[3/4] relative overflow-hidden'>
							<SafeImage
								src={
									suggested.assets?.[0]?.avatar ||
									suggested.gameAbsolutePath
								}
								className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500'
								width={300}
								height={400}
							/>
							<div className='absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60' />
						</div>
						<div className='absolute bottom-0 left-0 right-0 p-3'>
							<div className='flex justify-between items-end'>
								<h3 className='font-bold text-white text-xs sm:text-sm drop-shadow-md truncate pr-2'>
									{tDynamic(suggested, "name")}
								</h3>
								<div className='flex items-center gap-0.5 text-yellow-500 shrink-0'>
									<span className='text-[10px] font-bold'>
										{suggested.maxStar}
									</span>
									<Star size={10} className='fill-current' />
								</div>
							</div>
						</div>
					</Link>
				))}
			</div>
		</div>
	);
};

export default ChampionSuggested;
