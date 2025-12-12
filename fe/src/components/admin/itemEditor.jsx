import { useState, useEffect, memo, useMemo } from "react";
import Button from "../common/button";
import InputField from "../common/inputField";
import GenericCard from "../common/genericCard";
import { useCrudEditor } from "../../hooks/useCrudEditor";
import EditorLayout from "../common/editorLayout";

// Form Component (Đặt nội bộ để gọn file)
const ItemEditorForm = ({ item, onSave, onCancel, onDelete, isSaving }) => {
	const [formData, setFormData] = useState(item);
	useEffect(() => setFormData(item), [item]);
	const handleChange = e =>
		setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

	return (
		<div className='p-4 bg-surface-bg'>
			<div className='flex justify-between items-center mb-6 pb-4 border-b border-border'>
				<h3 className='text-xl font-bold text-text-primary'>
					{item.isNew ? "Tạo Vật Phẩm Mới" : item.name}
				</h3>
				<div className='flex gap-2'>
					{!item.isNew && (
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
						name='itemCode'
						value={formData.itemCode}
						onChange={handleChange}
						disabled={!item.isNew}
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
						label='Rarity Ref:'
						name='rarityRef'
						value={formData.rarityRef}
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

// Main Editor
function ItemEditor() {
	const { state, actions } = useCrudEditor({
		endpoint: "items",
		idField: "itemCode",
		routePath: "/admin/items",
		newItemTemplate: {
			isNew: true,
			name: "Vật Phẩm Mới",
			rarity: "",
			description: "",
		},
	});

	// Config Filter cho SidePanel
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
			state={{ ...state, idField: "itemCode" }}
			actions={actions}
			filterConfigs={filterConfigs}
			placeholders={{ search: "Tìm tên vật phẩm...", add: "Thêm Vật Phẩm" }}
			renderCard={item => (
				<GenericCard
					key={item.itemCode}
					item={item}
					onClick={() => actions.handleSelect(item.itemCode)}
				/>
			)}
			renderForm={item => (
				<ItemEditorForm
					item={item}
					onSave={actions.handleSave}
					isSaving={state.isSaving}
					onCancel={() => actions.handleAttemptClose()}
					onDelete={() => {
						actions.setItemToDelete(item);
						actions.setModals(p => ({ ...p, delete: true }));
					}}
				/>
			)}
		/>
	);
}
export default memo(ItemEditor);
