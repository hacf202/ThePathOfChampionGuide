import React from 'react';
import { DragDropArrayInput } from '@/features/adventureMaps/admin/adventureEditorHelpers';
import RegionArrayInput from '@/features/adventureMaps/admin/components/RegionArrayInput';

const MapRequirementsSection = ({ formData, setFormData, cachedData }) => {
	return (
		<section className='grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch'>
			<div className='bg-surface-hover/30 p-5 rounded-xl border border-border shadow-sm flex flex-col h-full'>
				<h3 className='font-bold mb-4 text-lg border-l-4 border-blue-500 pl-3'>
					Yêu cầu tham gia (Requirement)
				</h3>
				<div className='space-y-4 flex-1'>
					<DragDropArrayInput
						label='Tướng bắt buộc (Champions)'
						data={formData.requirement?.champions || []}
						onChange={arr =>
							setFormData(p => ({
								...p,
								requirement: { ...p.requirement, champions: arr },
							}))
						}
						cachedList={cachedData.champions || []}
						placeholder='Kéo thả ID Tướng vào đây...'
					/>
					<div className='border-t border-border/50 pt-4 mt-4'>
						<RegionArrayInput
							label='Vùng bắt buộc (Regions)'
							items={formData.requirement?.regions || []}
							onChange={arr =>
								setFormData(p => ({
									...p,
									requirement: { ...p.requirement, regions: arr },
								}))
							}
						/>
					</div>
				</div>
			</div>
			<div className='bg-surface-hover/30 p-5 rounded-xl border border-border shadow-sm flex flex-col h-full'>
				<h3 className='font-bold mb-4 text-lg border-l-4 border-purple-500 pl-3'>
					Luật Đặc Biệt (Mutators/Powers)
				</h3>
				<div className='flex-1'>
					<DragDropArrayInput
						label='Danh sách Power IDs (VD: P0612)'
						data={formData.specialRules || []}
						onChange={arr =>
							setFormData(p => ({ ...p, specialRules: arr }))
						}
						cachedList={cachedData.powers || []}
						placeholder='Kéo thả ID Power vào đây...'
					/>
				</div>
			</div>
		</section>
	);
};

export default MapRequirementsSection;
