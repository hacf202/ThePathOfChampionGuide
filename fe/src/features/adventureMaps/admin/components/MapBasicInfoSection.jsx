import React from 'react';
import { Package } from 'lucide-react';
import InputField from '@/components/common/inputField';

const MapBasicInfoSection = ({ formData, setFormData }) => {
	const handleChange = e => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
	};

	return (
		<section className='bg-surface-hover/30 p-5 rounded-xl border border-border shadow-sm flex flex-col'>
			<h3 className='font-bold mb-4 text-lg border-l-4 border-emerald-500 pl-3 flex items-center gap-2'>
				<Package size={20} className='text-emerald-500' />
				Thông tin cơ bản
			</h3>
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
				<InputField
					label='Độ khó (Difficulty)'
					name='difficulty'
					type='number'
					step='0.5'
					value={formData.difficulty || 0}
					onChange={e =>
						setFormData(p => ({
							...p,
							difficulty: parseFloat(e.target.value) || 0,
						}))
					}
				/>
				<InputField
					label='Tên Map (VI)'
					name='adventureName'
					value={formData.adventureName || ""}
					onChange={handleChange}
					required
				/>
				<InputField
					label='Tên Map (EN)'
					value={formData.translations?.en?.adventureName || ""}
					onChange={e =>
						setFormData(p => ({
							...p,
							translations: {
								...p.translations,
								en: {
									...p.translations.en,
									adventureName: e.target.value,
								},
							},
						}))
					}
				/>
				<InputField
					label='Loại Map (VI)'
					name='typeAdventure'
					value={formData.typeAdventure || ""}
					onChange={handleChange}
				/>
				<InputField
					label='Loại Map (EN)'
					value={formData.translations?.en?.typeAdventure || ""}
					onChange={e =>
						setFormData(p => ({
							...p,
							translations: {
								...p.translations,
								en: {
									...p.translations.en,
									typeAdventure: e.target.value,
								},
							},
						}))
					}
				/>
				<InputField
					label='Link Background'
					name='background'
					value={formData.background || ""}
					onChange={handleChange}
					placeholder='Nhập URL ảnh nền map...'
				/>
				<div className='flex gap-4 items-end'>
					<div className='flex-1'>
						<InputField
							label='Link Ảnh Đại Diện (Avatar Map)'
							name='assetAbsolutePath'
							value={formData.assetAbsolutePath || ""}
							onChange={handleChange}
							placeholder='Nhập URL ảnh đại diện cho map...'
						/>
					</div>
					{formData.assetAbsolutePath && (
						<div className='shrink-0 mb-1'>
							<img
								src={formData.assetAbsolutePath}
								alt='Avatar Preview'
								className='h-[42px] w-[42px] rounded-lg object-cover border border-border shadow-sm bg-black/40'
								onError={e => (e.target.style.display = "none")}
							/>
						</div>
					)}
				</div>
				<InputField
					label='Kinh nghiệm (XP)'
					name='championXP'
					type='number'
					value={formData.championXP || 0}
					onChange={e =>
						setFormData(p => ({
							...p,
							championXP: parseInt(e.target.value, 10) || 0,
						}))
					}
				/>
			</div>
		</section>
	);
};

export default MapBasicInfoSection;
