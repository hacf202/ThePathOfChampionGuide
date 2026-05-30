import React from 'react';
import { REGION_OPTIONS } from '@/features/adventureMaps/admin/components/mapEditorConstants';

const RegionArrayInput = ({ label, items, onChange }) => {
	const currentItems = items || [];
	const availableRegions = REGION_OPTIONS;
	return (
		<div className='space-y-2'>
			<label className='block font-semibold text-sm text-text-secondary'>
				{label}
			</label>
			<div className='flex flex-wrap gap-2 mb-2'>
				{currentItems.map((val, idx) => (
					<div key={idx} className='flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/30 px-2.5 py-1 rounded-lg text-xs font-semibold text-blue-700 dark:text-blue-400'>
						<span>{val}</span>
						<button
							type='button'
							className='text-red-500 hover:text-red-700 transition-colors shrink-0 ml-1 font-bold'
							onClick={() => onChange(currentItems.filter((_, i) => i !== idx))}
						>
							✕
						</button>
					</div>
				))}
			</div>
			{availableRegions.length > 0 && (
				<select
					className='bg-surface-bg border border-border rounded-xl px-2.5 py-1.5 text-xs text-text-primary outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all font-semibold cursor-pointer max-w-[200px]'
					value=''
					onChange={e => {
						const newVal = e.target.value;
						if (newVal) {
							onChange([...currentItems, newVal]);
						}
					}}
				>
					<option value=''>-- Chọn vùng --</option>
					{availableRegions.map(opt => (
						<option key={opt.value} value={opt.value}>
							{opt.label}
						</option>
					))}
				</select>
			)}
		</div>
	);
};

export default RegionArrayInput;
