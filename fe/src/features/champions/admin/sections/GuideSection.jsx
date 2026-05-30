import { memo } from "react";
import { Youtube } from "lucide-react";
import InputField from "@/components/common/inputField";
import MarkupEditor from "@/components/admin/MarkupEditor";

const GuideSection = memo(({ formData, setFormData, updateTranslationFields, tUI, convertToEmbedUrl }) => {
	return (
		<section className='bg-surface-bg border border-border rounded-xl p-6 shadow-sm space-y-6'>
			<h3 className='text-lg font-bold border-l-4 border-red-500 pl-3 uppercase flex items-center gap-2'>
				<Youtube size={20} className='text-red-500' /> {tUI("admin.championForm.guideSection")}
			</h3>
			<div className='space-y-6'>
				<div className='space-y-2'>
					<label className='block font-semibold text-text-primary text-sm'>
						{tUI("admin.championForm.videoLabel")}
					</label>
					<InputField
						name='videoLink'
						value={formData.videoLink || ""}
						onChange={e => setFormData(prev => ({ ...prev, videoLink: convertToEmbedUrl(e.target.value) }))}
						placeholder='https://www.youtube.com/embed/...'
					/>
				</div>
				<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
					<div className='flex flex-col gap-2'>
						<label className='block font-semibold text-text-primary text-sm'>
							{tUI("admin.championForm.descLabel")} (VI)
						</label>
						<MarkupEditor
							value={formData.description || ""}
							onChange={({ markup, raw }) =>
								setFormData(prev => ({
									...prev,
									description: markup,
									descriptionRaw: raw,
								}))
							}
							placeholder={tUI("admin.championForm.descPlaceholder")}
						/>
					</div>
					<div className='flex flex-col gap-2'>
						<label className='block font-semibold text-text-primary text-sm'>
							{tUI("admin.championForm.descLabel")} (EN)
						</label>
						<MarkupEditor
							value={formData.translations?.en?.description || ""}
							onChange={({ markup, raw }) =>
								updateTranslationFields("en", {
									description: markup,
									descriptionRaw: raw,
								})
							}
							placeholder='Enter description, strategy, combos...'
						/>
					</div>
				</div>
			</div>
		</section>
	);
});

GuideSection.displayName = "GuideSection";
export default GuideSection;
