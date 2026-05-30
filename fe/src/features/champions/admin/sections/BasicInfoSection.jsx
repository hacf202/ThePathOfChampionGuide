import { memo } from "react";
import { Info } from "lucide-react";
import InputField from "@/components/common/inputField";
import ImagePreviewBox from "@/components/admin/common/imagePreviewBox";

const BasicInfoSection = memo(({ formData, setFormData, handleInputChange, handleTranslationChange, tUI }) => {
	return (
		<section className='bg-surface-bg border border-border rounded-xl p-6 shadow-sm space-y-6'>
			<h3 className='text-lg font-bold border-l-4 border-primary-500 pl-3 uppercase flex items-center gap-2'>
				<Info size={20} className='text-primary-500' /> {tUI("admin.championForm.basicInfo")}
			</h3>
			<div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
				<div className='md:col-span-2 space-y-5'>
					<div className='grid grid-cols-2 gap-4'>
						<InputField
							label={tUI("admin.championForm.idLabel")}
							name='championID'
							value={formData.championID || ""}
							onChange={handleInputChange}
							required
							disabled={!formData.isNew}
						/>
						<InputField
							label="Card Code (Mã lá bài)"
							name='cardCode'
							value={formData.cardCode || ""}
							onChange={handleInputChange}
							placeholder="VD: 01DE012"
						/>
					</div>
					<div className='grid grid-cols-2 gap-4'>
						<InputField
							label={tUI("admin.championForm.nameLabel")}
							name='name'
							value={formData.name || ""}
							onChange={handleInputChange}
							required
						/>
						<InputField
							label='English Name'
							value={formData.translations?.en?.name || ""}
							onChange={e => handleTranslationChange("name", e.target.value)}
						/>
					</div>
					<div className='grid grid-cols-2 gap-4'>
						<InputField
							label={tUI("admin.championForm.manaLabel")}
							name='cost'
							type='number'
							value={formData.cost ?? 0}
							onChange={e =>
								setFormData({
									...formData,
									cost: parseInt(e.target.value) || 0,
								})
							}
						/>
						<InputField
							label={tUI("admin.championForm.maxStarLabel")}
							name='maxStar'
							type='number'
							value={formData.maxStar ?? 3}
							onChange={e =>
								setFormData({
									...formData,
									maxStar: parseInt(e.target.value) || 0,
								})
							}
						/>
					</div>
				</div>

				<ImagePreviewBox
					imageUrl={formData.assets?.[0]?.avatar}
					label={tUI("admin.championForm.avatarLabel")}
					imageClassName='w-32 h-32 object-contain rounded-xl border-4 border-primary-500/20 shadow-xl'
				/>
			</div>
		</section>
	);
});

BasicInfoSection.displayName = "BasicInfoSection";
export default BasicInfoSection;
