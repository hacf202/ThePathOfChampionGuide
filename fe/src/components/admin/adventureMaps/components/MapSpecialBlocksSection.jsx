import React from 'react';
import { Info, Plus } from 'lucide-react';
import Button from '../../../common/button';
import SpecialBlockEditor from './SpecialBlockEditor';

const MapSpecialBlocksSection = ({ formData, setFormData, cachedData }) => {
	return (
		<section className='bg-surface-hover/30 p-5 rounded-xl border border-border space-y-6 shadow-sm'>
			<div className='flex justify-between items-center border-b border-border pb-3'>
				<div>
					<h3 className='font-bold text-lg border-l-4 border-yellow-500 pl-3 flex items-center gap-2'>
						<Info size={18} className='text-yellow-500' />
						Yêu cầu / Mô tả đặc biệt (Special Blocks)
					</h3>
					<p className='text-xs text-text-secondary pl-3 mt-1'>
						Thiết lập các khối ghi chú đặc biệt cho bản đồ. Kéo thả tài nguyên từ Sidebar bên phải vào mỗi block.
					</p>
				</div>
				<Button
					type='button'
					variant='primary'
					size='sm'
					onClick={() => {
						const blocks = [...(formData.specialBlocks || [])];
						blocks.push({
							title: "",
							description: "",
							translations: { en: { title: "", description: "" } },
							items: []
						});
						setFormData(p => ({ ...p, specialBlocks: blocks }));
					}}
				>
					<Plus size={14} className='mr-1' /> Thêm Block
				</Button>
			</div>

			{(!formData.specialBlocks || formData.specialBlocks.length === 0) ? (
				<div className='py-8 text-center text-text-secondary italic text-sm bg-surface-bg/30 rounded-xl border border-dashed border-border/50'>
					Chưa có block đặc biệt nào. Bấm "Thêm Block" để tạo mới.
				</div>
			) : (
				<div className='space-y-6'>
					{formData.specialBlocks.map((block, bIdx) => (
						<SpecialBlockEditor
							key={bIdx}
							block={block}
							bIdx={bIdx}
							formData={formData}
							setFormData={setFormData}
							cachedData={cachedData}
						/>
					))}
				</div>
			)}
		</section>
	);
};

export default MapSpecialBlocksSection;
