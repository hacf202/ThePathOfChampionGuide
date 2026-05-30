import MarkupRenderer from "@/components/common/MarkupRenderer";
import ChampionRenderItem from "@/features/champions/components/ChampionRenderItem";
import { Play } from "lucide-react";

const ChampionRelicSets = ({ relicSetsToRender, tUI }) => {
	if (!relicSetsToRender || relicSetsToRender.length === 0) return null;

	return (
		<div className="bg-surface-bg border border-border rounded-2xl p-1 sm:p-4 shadow-lg shadow-black/10 mt-8 backdrop-blur-md">
			<h2 className='text-xl sm:text-2xl font-bold font-primary text-primary-400 border-b border-border/60 pb-4 mb-6 flex items-center gap-3'>
				<span className="w-1.5 h-6 bg-primary-500 rounded-full" />
				{tUI("championDetail.relicSets") || "Cổ vật đề xuất"}
			</h2>
			<div className='flex flex-col gap-6'>
				{relicSetsToRender.map((set, idx) => (
					<div
						key={idx}
						className='relative bg-surface-hover/30 border border-border/80 rounded-xl p-1 sm:p-4 flex flex-col gap-5 hover:border-border transition-all duration-200 shadow-sm'
					>
						{/* Badge & Header */}
						<div className='flex items-center justify-between border-b border-border/40 pb-3'>
							<div className='flex items-center gap-2'>
								<span className='text-xs font-black uppercase tracking-wider bg-primary-500/10 text-primary-400 border border-primary-500/20 px-3 py-1 rounded-lg'>
									{tUI("championDetail.setLabel") || "Set"} {set.setNumber}
								</span>
							</div>
						</div>

						{/* Relic grid items */}
						<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
							{set.relics.map((r, i) => (
								<ChampionRenderItem key={i} item={r} />
							))}
						</div>

						{/* Extra info: Video or Description */}
						{(set.description || set.video) && (
							<div className='grid grid-cols-1 md:grid-cols-2 gap-5 mt-1 pt-4 border-t border-border/40'>
								{set.video && (
									<div className='aspect-video rounded-xl overflow-hidden border border-border/80 shadow-md relative group'>
										<iframe
											width='100%'
											height='100%'
											src={set.video}
											frameBorder='0'
											allowFullScreen
											loading='lazy'
											className='rounded-xl'
										></iframe>
									</div>
								)}
								{set.description && (
									<div className={`text-sm leading-relaxed text-text-secondary bg-surface-hover/50 p-4 rounded-xl border border-border/50 ${!set.video ? 'md:col-span-2' : ''}`}>
										<MarkupRenderer text={set.description} />
									</div>
								)}
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	);
};

export default ChampionRelicSets;
