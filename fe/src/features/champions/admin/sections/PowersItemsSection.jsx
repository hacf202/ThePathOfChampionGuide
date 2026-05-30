import { memo } from "react";
import { Swords } from "lucide-react";
import DragDropArrayInput from "@/components/admin/common/dragDropArrayInput";

const PowersItemsSection = memo(({ formData, setFormData, dataLookup, tUI }) => {
	return (
		<section className='bg-surface-bg border border-border rounded-xl p-6 shadow-sm space-y-6'>
			<h3 className='text-lg font-bold border-l-4 border-blue-500 pl-3 uppercase flex items-center gap-2'>
				<Swords size={20} className='text-blue-500' /> {tUI("admin.championForm.startPowerLabel")}
			</h3>
			<div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
				<DragDropArrayInput
					label={tUI("admin.championForm.adventurePowerLabel")}
					data={formData.adventurePowerIds || []}
					onChange={d => setFormData({ ...formData, adventurePowerIds: d })}
					cachedData={dataLookup.powers}
				/>
				<DragDropArrayInput
					label={tUI("admin.championForm.deckItemLabel")}
					data={formData.itemIds || []}
					onChange={d => setFormData({ ...formData, itemIds: d })}
					cachedData={dataLookup.items}
				/>
			</div>
		</section>
	);
});

PowersItemsSection.displayName = "PowersItemsSection";
export default PowersItemsSection;
