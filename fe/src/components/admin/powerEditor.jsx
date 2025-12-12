import { useState, useEffect, memo, useMemo } from "react";
import Button from "../common/button";
import InputField from "../common/inputField";
import GenericCard from "../common/genericCard";
import { useCrudEditor } from "../../hooks/useCrudEditor";
import EditorLayout from "../common/editorLayout";
import { Plus, XCircle } from "lucide-react";

// Component Array Input (Giữ lại logic cũ)
const ArrayInput = ({ label, data = [], onChange }) => (
	<div className='flex flex-col'>
		<div className='flex justify-between items-center mb-2'>
			<label className='font-semibold text-text-secondary'>{label}:</label>
			<Button
				onClick={() => onChange([...data, ""])}
				type='button'
				variant='outline'
				size='sm'
				iconLeft={<Plus size={14} />}
			>
				Thêm
			</Button>
		</div>
		<div className='flex flex-col gap-2'>
			{data.map((item, index) => (
				<div key={index} className='flex items-center gap-2'>
					<span className='font-bold text-text-secondary'>{index + 1}.</span>
					<InputField
						value={item}
						onChange={e => {
							const n = [...data];
							n[index] = e.target.value;
							onChange(n);
						}}
						className='flex-grow'
					/>
					<button
						onClick={() => onChange(data.filter((_, i) => i !== index))}
						className='text-text-secondary hover:text-danger-500'
					>
						<XCircle size={20} />
					</button>
				</div>
			))}
		</div>
	</div>
);

const PowerEditorForm = ({ power, onSave, onCancel, onDelete, isSaving }) => {
	const [formData, setFormData] = useState(power);
	useEffect(() => setFormData(power), [power]);
	const handleChange = e =>
		setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

	return (
		<div className='p-4 bg-surface-bg'>
			<div className='flex justify-between mb-6 pb-4 border-b border-border'>
				<h3 className='text-xl font-bold'>
					{power.isNew ? "Tạo Sức Mạnh Mới" : power.name}
				</h3>
				<div className='flex gap-2'>
					{!power.isNew && (
						<Button variant='danger' onClick={onDelete}>
							Xóa
						</Button>
					)}
					<Button variant='outline' onClick={onCancel}>
						Hủy
					</Button>
					<Button
						variant='primary'
						onClick={() => onSave(formData)}
						disabled={isSaving}
					>
						{isSaving ? "Lưu..." : "Lưu"}
					</Button>
				</div>
			</div>
			<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
				<div className='flex flex-col gap-4'>
					<InputField
						label='Mã:'
						name='powerCode'
						value={formData.powerCode}
						onChange={handleChange}
						disabled={!power.isNew}
					/>
					<InputField
						label='Tên:'
						name='name'
						value={formData.name}
						onChange={handleChange}
					/>
					<InputField
						label='Độ hiếm:'
						name='rarity'
						value={formData.rarity}
						onChange={handleChange}
					/>
					<div className='flex flex-col gap-1'>
						<label className='text-sm font-medium text-text-secondary'>
							Mô tả:
						</label>
						<textarea
							name='description'
							rows={3}
							value={formData.description}
							onChange={handleChange}
							className='p-2 bg-input-bg rounded border border-input-border text-input-text'
						/>
					</div>
				</div>
				<div className='flex flex-col gap-4'>
					<InputField
						label='Đường dẫn Ảnh:'
						name='assetAbsolutePath'
						value={formData.assetAbsolutePath}
						onChange={handleChange}
					/>
					<InputField
						label='Đường dẫn Ảnh đầy đủ:'
						name='assetFullAbsolutePath'
						value={formData.assetFullAbsolutePath}
						onChange={handleChange}
					/>
					<ArrayInput
						label='Loại (Type)'
						data={formData.type || []}
						onChange={newData => setFormData(p => ({ ...p, type: newData }))}
					/>
					<div className='flex flex-col gap-1'>
						<label className='text-sm font-medium text-text-secondary'>
							Mô tả Thô:
						</label>
						<textarea
							name='descriptionRaw'
							rows={3}
							value={formData.descriptionRaw}
							onChange={handleChange}
							className='p-2 bg-input-bg rounded border border-input-border text-input-text'
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

function PowerEditor() {
	// Custom Filter Logic cho Power (Type là mảng)
	const customFilterLogic = (data, filters) => {
		if (filters.types && filters.types.length > 0) {
			return data.filter(p => p.type?.some(t => filters.types.includes(t)));
		}
		return data;
	};

	const { state, actions } = useCrudEditor({
		endpoint: "powers",
		idField: "powerCode",
		routePath: "/admin/powers",
		newItemTemplate: {
			isNew: true,
			name: "Sức Mạnh Mới",
			rarity: "",
			description: "",
			type: [],
		},
		customFilterLogic,
	});

	const filterConfigs = useMemo(
		() => ({
			multiFilters: [
				{
					label: "Độ hiếm",
					placeholder: "Tất cả",
					options: [...new Set(state.data.map(i => i.rarity))]
						.sort()
						.map(r => ({ value: r, label: r })),
					selectedValues: state.selectedRarities,
					onChange: actions.setSelectedRarities,
				},
				{
					label: "Loại",
					placeholder: "Tất cả",
					options: [...new Set(state.data.flatMap(p => p.type || []))]
						.sort()
						.map(t => ({ value: t, label: t })),
					selectedValues: state.customFilterValues.types || [],
					onChange: vals =>
						actions.setCustomFilterValues(p => ({ ...p, types: vals })),
				},
			],
		}),
		[state.data, state.selectedRarities, state.customFilterValues, actions]
	);

	return (
		<EditorLayout
			state={{ ...state, idField: "powerCode" }}
			actions={actions}
			filterConfigs={filterConfigs}
			placeholders={{ search: "Tìm sức mạnh...", add: "Thêm Sức Mạnh" }}
			renderCard={item => (
				<GenericCard
					key={item.powerCode}
					item={item}
					onClick={() => actions.handleSelect(item.powerCode)}
				/>
			)}
			renderForm={item => (
				<PowerEditorForm
					power={item}
					onSave={actions.handleSave}
					isSaving={state.isSaving}
					onCancel={() => actions.handleAttemptClose(false)}
					onDelete={() => {
						actions.setItemToDelete(item);
						actions.setModals(p => ({ ...p, delete: true }));
					}}
				/>
			)}
		/>
	);
}
export default memo(PowerEditor);
