import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Button from '../../../common/button';
import InputField from '../../../common/inputField';

const StringArrayInput = ({ label, items, onChange, placeholder }) => (
	<div className='space-y-2'>
		<label className='block font-semibold text-sm text-text-secondary'>
			{label}
		</label>
		{items.map((val, idx) => (
			<div key={idx} className='flex gap-2'>
				<InputField
					value={val}
					onChange={e => {
						const newArr = [...items];
						newArr[idx] = e.target.value;
						onChange(newArr);
					}}
					placeholder={placeholder}
				/>
				<Button
					type='button'
					variant='danger'
					onClick={() => onChange(items.filter((_, i) => i !== idx))}
				>
					<Trash2 size={16} />
				</Button>
			</div>
		))}
		<Button
			type='button'
			variant='outline'
			size='sm'
			onClick={() => onChange([...items, ""])}
		>
			<Plus size={14} /> Thêm
		</Button>
	</div>
);

export default StringArrayInput;
