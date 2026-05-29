import ChampionRenderItem from "./ChampionRenderItem";

const ChampionRecommendations = ({ adventurePowersFull, defaultItemsFull, runesFull, tUI }) => {
	if (
		(!adventurePowersFull || adventurePowersFull.length === 0) && 
		(!defaultItemsFull || defaultItemsFull.length === 0) && 
		(!runesFull || runesFull.length === 0)
	) {
		return null;
	}

	return (
		<div className="space-y-6 mt-6">
			{adventurePowersFull && adventurePowersFull.length > 0 && (
				<div className="bg-surface-bg border border-border rounded-xl p-1 sm:p-6 shadow-sm">
					<h2 className='p-1 text-lg sm:text-3xl font-semibold mb-3 font-primary text-primary-500 border-b border-border'>
						{tUI("championDetail.recPowers")}
					</h2>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						{adventurePowersFull.map((power, index) => (
							<ChampionRenderItem key={index} item={power} />
						))}
					</div>
				</div>
			)}

			{defaultItemsFull && defaultItemsFull.length > 0 && (
				<div className="bg-surface-bg border border-border rounded-xl p-1 sm:p-6 shadow-sm">
					<h2 className='p-1 text-lg sm:text-3xl font-semibold mb-3 font-primary text-primary-500 border-b border-border'>
						{tUI("championDetail.recItems")}
					</h2>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						{defaultItemsFull.map((item, index) => (
							<ChampionRenderItem key={index} item={item} />
						))}
					</div>
				</div>
			)}

			{runesFull && runesFull.length > 0 && (
				<div className="bg-surface-bg border border-border rounded-xl p-1 sm:p-6 shadow-sm">
					<h2 className='p-1 text-lg sm:text-3xl font-semibold mb-3 font-primary text-primary-500 border-b border-border'>
						{tUI("championDetail.recRunes")}
					</h2>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						{runesFull.map((runeItem, index) => (
							<ChampionRenderItem key={index} item={runeItem} />
						))}
					</div>
				</div>
			)}
		</div>
	);
};

export default ChampionRecommendations;
