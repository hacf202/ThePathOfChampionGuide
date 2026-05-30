import { memo } from "react";
import { Swords } from "lucide-react";
import DragDropDeckInput from "@/components/admin/common/DragDropDeckInput";

const StartingDeckSection = memo(({ formData, setFormData, dataLookup, tUI }) => {
	return (
		<section className='bg-surface-bg border border-border rounded-xl p-6 shadow-sm space-y-8'>
			<div className='flex items-center gap-3 border-l-4 border-blue-400 pl-4 py-1'>
				<Swords size={28} className='text-blue-400' />
				<div>
					<h3 className='text-xl font-bold uppercase text-text-primary tracking-tight'>
						{tUI("admin.championForm.deckTitle")}
					</h3>
					<p className='text-xs text-text-secondary font-medium'>
						{tUI("admin.championForm.deckSub")}
					</p>
				</div>
			</div>

			{/* Base Cards */}
			<DragDropDeckInput
				label={tUI("admin.championForm.baseCardsLabel")}
				data={formData.startingDeck?.baseCards || []}
				onChange={d =>
					setFormData({
						...formData,
						startingDeck: {
							...(formData.startingDeck || { baseCards: [], referenceCards: [] }),
							baseCards: d,
						},
					})
				}
				cachedData={dataLookup}
				placeholder={tUI("admin.championForm.deckPlaceholder")}
				isReference={false}
			/>

			{/* Reference Cards */}
			<div className='pt-6 border-t border-border/50'>
				<DragDropDeckInput
					label={tUI("admin.championForm.referenceCardsLabel")}
					data={formData.startingDeck?.referenceCards || []}
					onChange={d =>
						setFormData({
							...formData,
							startingDeck: {
								...(formData.startingDeck || { baseCards: [], referenceCards: [] }),
								referenceCards: d,
							},
						})
					}
					cachedData={dataLookup}
					placeholder={tUI("admin.championForm.deckPlaceholder")}
					isReference={true}
				/>
			</div>
		</section>
	);
});

StartingDeckSection.displayName = "StartingDeckSection";
export default StartingDeckSection;
