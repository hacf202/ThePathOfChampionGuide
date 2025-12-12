import { useState, useEffect, memo, useMemo } from "react";
import Button from "../common/button";
import InputField from "../common/inputField";
import GenericCard from "../common/genericCard";
import { useCrudEditor } from "../../hooks/useCrudEditor";
import EditorLayout from "../common/editorLayout";

const RuneEditorForm = ({ rune, onSave, onCancel, onDelete, isSaving }) => {
	const [formData, setFormData] = useState(rune);
	useEffect(() => setFormData(rune), [rune]);
	const handleChange = e =>
		setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

	return (
		<div className='p-4 bg-surface-bg'>
			<div className='flex justify-between mb-6 pb-4 border-b border-border'>
				<h3 className='text-xl font-bold'>
					{rune.isNew ? "Tạo Ngọc Mới" : rune.name}
				</h3>
				<div className='flex gap-2'>
					{!rune.isNew && (
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
						name='runeCode'
						value={formData.runeCode}
						onChange={handleChange}
						disabled={!rune.isNew}
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
					<InputField
						label='Loại (Type):'
						name='type'
						value={formData.type}
						onChange={handleChange}
					/>
				</div>
				<div className='flex flex-col gap-4'>
					<InputField
						label='Đường dẫn Ảnh:'
						name='assetAbsolutePath'
						value={formData.assetAbsolutePath}
						onChange={handleChange}
					/>
					<InputField
						label='Đường dẫn ảnh đầy đủ:'
						name='assetFullAbsolutePath'
						value={formData.assetFullAbsolutePath}
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

function RuneEditor() {
	const { state, actions } = useCrudEditor({
		endpoint: "runes",
		idField: "runeCode",
		routePath: "/admin/runes",
		newItemTemplate: {
			isNew: true,
			name: "Ngọc Mới",
			rarity: "",
			description: "",
			type: "",
		},
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
			],
		}),
		[state.data, state.selectedRarities, actions]
	);

	return (
		<EditorLayout
			state={{ ...state, idField: "runeCode" }}
			actions={actions}
			filterConfigs={filterConfigs}
			placeholders={{ search: "Tìm tên ngọc...", add: "Thêm Ngọc" }}
			renderCard={item => (
				<GenericCard
					key={item.runeCode}
					item={item}
					onClick={() => actions.handleSelect(item.runeCode)}
				/>
			)}
			renderForm={item => (
				<RuneEditorForm
					rune={item}
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
export default memo(RuneEditor);
