import { memo } from "react";
import { Box, Link2, XCircle, Plus } from "lucide-react";
import InputField from "@/components/common/inputField";
import SafeImage from "@/components/common/SafeImage";
import Button from "@/components/common/button";
import DragDropArrayInput from "@/components/admin/common/dragDropArrayInput";
import MarkupEditor from "@/components/admin/MarkupEditor";
import { ArrayInputComponent } from "@/features/champions/admin/championEditorHelpers";

const AssetsRelicsSection = memo(({ formData, setFormData, dataLookup, handleTranslationChange, tUI, convertToEmbedUrl }) => {
	return (
		<section className='bg-surface-bg border border-border rounded-xl p-6 shadow-sm space-y-8'>
			<h3 className='text-lg font-bold border-l-4 border-emerald-500 pl-3 uppercase flex items-center gap-2'>
				<Box size={20} className='text-emerald-500' /> {tUI("admin.championForm.assetSection")}
			</h3>

			<div className='grid grid-cols-1 gap-4 bg-surface-hover/30 p-4 rounded-xl border border-border'>
				<h4 className='text-sm font-bold flex items-center gap-2 mb-2'>
					<Link2 size={16} /> {tUI("admin.championForm.assetLabel")}
				</h4>
				{(formData.assets || []).map((asset, index) => (
					<div
						key={index}
						className='flex flex-col md:flex-row items-center gap-6 p-4 bg-surface-bg rounded-xl border border-border relative group'
					>
						<div className='grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 w-full'>
							{["avatar", "fullAbsolutePath", "gameAbsolutePath"].map(
								field => (
									<div key={field} className='space-y-2'>
										<InputField
											label={field}
											value={asset[field] || ""}
											onChange={e => {
												const newAssets = [...formData.assets];
												newAssets[index][field] = e.target.value;
												setFormData({ ...formData, assets: newAssets });
											}}
										/>
										{asset[field] && (
											<SafeImage
												src={asset[field]}
												className='h-20 w-auto rounded-lg object-contain bg-black/40 border shadow-inner'
												alt={field}
												width={200}
											/>
										)}
									</div>
								),
							)}
						</div>
						<button
							type='button'
							onClick={() =>
								setFormData({
									...formData,
									assets: formData.assets.filter((_, i) => i !== index),
								})
							}
							className='text-red-500 shrink-0 hover:bg-red-500/10 p-2 rounded-full'
						>
							<XCircle size={22} />
						</button>
					</div>
				))}
				<Button
					type='button'
					variant='outline'
					size='sm'
					onClick={() =>
						setFormData({
							...formData,
							assets: [
								...(formData.assets || []),
								{
									fullAbsolutePath: "",
									gameAbsolutePath: "",
									avatar: "",
								},
							],
						})
					}
					className='w-max mt-2'
				>
					+ {tUI("admin.championForm.addAsset")}
				</Button>
			</div>

			<div className='space-y-6'>
				<div className='grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-border pb-6'>
					<ArrayInputComponent
						label={tUI("admin.championForm.regionLabel") + " (VI)"}
						data={formData.regions || []}
						onChange={d => setFormData({ ...formData, regions: d })}
						cachedData={dataLookup.regions}
					/>
					<ArrayInputComponent
						label={tUI("admin.championForm.regionLabel") + " (EN)"}
						data={formData.translations?.en?.regions || []}
						onChange={d => handleTranslationChange("regions", d)}
						cachedData={dataLookup.regions}
					/>
				</div>
				<div className='grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-border pb-6'>
					<ArrayInputComponent
						label={tUI("admin.championForm.tagLabel") + " (VI)"}
						data={formData.tags || []}
						onChange={d => setFormData({ ...formData, tags: d })}
					/>
					<div className='hidden md:block opacity-30 pointer-events-none'></div>
				</div>
			</div>

			<div className='flex flex-col gap-4 pt-4 border-t border-border'>
				<div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
					{(formData.relicSets || []).map((set, idx) => (
						<div
							key={idx}
							className='relative bg-surface-hover/20 p-4 rounded-xl border border-border flex flex-col gap-4'
						>
							<button
								type='button'
								onClick={() => {
									const newSets = (formData.relicSets || []).filter(
										(_, i) => i !== idx,
									);
									setFormData({ ...formData, relicSets: newSets });
								}}
								className='absolute top-2 right-2 text-xs text-red-500 hover:bg-red-500/10 p-1 rounded font-bold'
							>
								{tUI("admin.championForm.deleteSet")}
							</button>

							<DragDropArrayInput
								label={tUI("admin.championForm.relicSuggest", { idx: idx + 1 })}
								data={set.items || []}
								onChange={d => {
									const newSets = [...(formData.relicSets || [])];
									newSets[idx] = { ...newSets[idx], items: d };
									setFormData({ ...formData, relicSets: newSets });
								}}
								cachedData={dataLookup.relics}
								allowDuplicates={true}
							/>
							
							<div className='flex flex-col gap-2'>
								<label className='block font-semibold text-text-primary text-sm'>
									{tUI("admin.championForm.descLabel")}
								</label>
								<MarkupEditor
									value={set.description || ""}
									onChange={({ markup, raw }) => {
										const newSets = [...(formData.relicSets || [])];
										newSets[idx] = { ...newSets[idx], description: markup, descriptionRaw: raw };
										setFormData({ ...formData, relicSets: newSets });
									}}
									placeholder="Nhập mô tả bộ cổ vật..."
								/>
							</div>

							<div className='flex flex-col gap-2'>
								<label className='block font-semibold text-text-primary text-sm'>
									{tUI("admin.championForm.videoLabel")}
								</label>
								<InputField
									value={set.videoLink || ""}
									onChange={e => {
										const newSets = [...(formData.relicSets || [])];
										newSets[idx] = { ...newSets[idx], videoLink: convertToEmbedUrl(e.target.value) };
										setFormData({ ...formData, relicSets: newSets });
									}}
									placeholder="https://www.youtube.com/embed/..."
								/>
							</div>
						</div>
					))}
				</div>
				<Button
					type='button'
					variant='outline'
					size='sm'
					onClick={() =>
						setFormData(prev => ({
							...prev,
							relicSets: [...(prev.relicSets || []), { items: [], description: "", videoLink: "" }],
						}))
					}
					className='w-max mt-2 border-dashed border-primary-500 text-primary-500 hover:bg-primary-500/10'
					iconLeft={<Plus size={16} />}
				>
					{tUI("admin.championForm.addRelicSet")}
				</Button>
			</div>

			<div className='w-full md:w-1/3'>
				<DragDropArrayInput
					label={tUI("admin.championForm.runeSuggest")}
					data={formData.runeIds || []}
					onChange={d => setFormData({ ...formData, runeIds: d })}
					cachedData={{ ...dataLookup.powers, ...dataLookup.runes }}
				/>
			</div>
		</section>
	);
});

AssetsRelicsSection.displayName = "AssetsRelicsSection";
export default AssetsRelicsSection;
