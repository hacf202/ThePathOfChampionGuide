import MarkupRenderer from "@/components/common/MarkupRenderer";
import ChampionRenderItem from "@/features/champions/components/ChampionRenderItem";

const ChampionRelicSets = ({ relicSetsToRender, tUI }) => {
	if (!relicSetsToRender || relicSetsToRender.length === 0) return null;

	return (
		<div className="bg-surface-bg border border-border rounded-xl p-1 sm:p-6 shadow-sm mt-6">
			<h2 className='p-1 text-lg sm:text-3xl font-semibold mb-3 font-primary text-primary-500 border-b border-border'>
				{tUI("championDetail.relicSets")}
			</h2>
			<div className='grid gap-4 bg-surface-hover/50 rounded-lg'>
				{relicSetsToRender.map((set, idx) => (
					<div
						key={idx}
						className='bg-surface-bg border border-border rounded-lg p-4 flex flex-col gap-4'
					>
						<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
							{set.relics.map((r, i) => (
								<ChampionRenderItem key={i} item={r} />
							))}
						</div>
						{(set.description || set.video) && (
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 pt-4 border-t border-border'>
								{set.video && (
									<div className='aspect-video rounded-lg overflow-hidden border border-border'>
										<iframe
											width='100%'
											height='100%'
											src={set.video}
											frameBorder='0'
											allowFullScreen
											loading='lazy'
											className='rounded-lg'
										></iframe>
									</div>
								)}
								{set.description && (
									<div className={`text-sm text-text-secondary bg-surface-hover/30 p-3 rounded-lg border border-border ${!set.video ? 'md:col-span-2' : ''}`}>
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
