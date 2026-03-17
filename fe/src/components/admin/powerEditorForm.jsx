// src/pages/admin/powerEditorForm.jsx
import { useState, memo, useEffect } from "react";
import Button from "../common/button";
import InputField from "../common/inputField";
import Modal from "../common/modal";
import { Plus } from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation"; // IMPORT HOOK

/**
 * Component hỗ trợ nhập mảng (Dùng cho field 'type')
 */
const ArrayInputComponent = ({
	label,
	data = [],
	onChange,
	placeholder = "Nhập giá trị...",
}) => {
	const handleItemChange = (index, newValue) => {
		const newData = [...data];
		newData[index] = newValue;
		onChange(newData);
	};

	const handleAddItem = () => {
		onChange([...data, ""]);
	};

	const handleRemoveItem = index => {
		onChange(data.filter((_, i) => i !== index));
	};

	return (
		<div className='flex flex-col gap-3'>
			<div className='flex justify-between items-center'>
				<label className='font-semibold text-text-primary'>{label}</label>
				<Button
					type='button'
					variant='outline'
					size='sm'
					onClick={handleAddItem}
					iconLeft={<Plus size={16} />}
				>
					Thêm
				</Button>
			</div>

			<div className='space-y-2'>
				{data.length > 0 ? (
					data.map((item, index) => (
						<div key={index} className='flex items-center gap-2'>
							<span className='font-bold text-text-secondary w-6'>
								{index + 1}.
							</span>
							<input
								type='text'
								value={item}
								onChange={e => handleItemChange(index, e.target.value)}
								placeholder={placeholder}
								className='flex-1 p-2 bg-surface-bg border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 transition'
							/>
							<button
								type='button'
								onClick={() => handleRemoveItem(index)}
								className='p-2 text-red-500 hover:bg-red-500/10 rounded-md   font-bold'
								title='Xóa'
							>
								X
							</button>
						</div>
					))
				) : (
					<p className='text-sm italic text-text-tertiary bg-surface-bg p-3 rounded-md border border-dashed border-border'>
						Không có mục nào. Nhấn "Thêm" để tạo mới.
					</p>
				)}
			</div>
		</div>
	);
};

const PowerEditorForm = memo(
	({ power, onSave, onCancel, onDelete, isSaving }) => {
		const [formData, setFormData] = useState({});
		const [initialData, setInitialData] = useState({});
		const [isDirty, setIsDirty] = useState(false);

		const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
		const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
		const { tUI } = useTranslation();

		// Khởi tạo dữ liệu
		useEffect(() => {
			if (power) {
				const deepCloned = JSON.parse(JSON.stringify(power));

				// Đảm bảo array type và object translations tồn tại
				if (!Array.isArray(deepCloned.type)) deepCloned.type = [];
				if (!deepCloned.translations) {
					deepCloned.translations = {
						en: { name: "", rarity: "", description: "" },
					};
				}
				if (!deepCloned.translations.en) {
					deepCloned.translations.en = {
						name: "",
						rarity: "",
						description: "",
					};
				}

				setFormData(deepCloned);
				setInitialData(JSON.parse(JSON.stringify(deepCloned)));
				setIsDirty(false);
			}
		}, [power]);

		// Dirty check
		useEffect(() => {
			const isChanged =
				JSON.stringify(formData) !== JSON.stringify(initialData);
			setIsDirty(isChanged);
		}, [formData, initialData]);

		// Prompt Before Unload
		useEffect(() => {
			const handleBeforeUnload = e => {
				if (isDirty) {
					e.preventDefault();
					e.returnValue = "";
				}
			};
			window.addEventListener("beforeunload", handleBeforeUnload);
			return () =>
				window.removeEventListener("beforeunload", handleBeforeUnload);
		}, [isDirty]);

		const handleInputChange = e => {
			const { name, value } = e.target;
			setFormData(prev => ({ ...prev, [name]: value }));
		};

		const handleTranslationChange = (e, lang) => {
			const { name, value } = e.target;
			setFormData(prev => ({
				...prev,
				translations: {
					...prev.translations,
					[lang]: {
						...prev.translations[lang],
						[name]: value,
					},
				},
			}));
		};

		const handleSubmit = e => {
			e.preventDefault();
			if (!formData.powerCode?.trim()) {
				alert(tUI("admin.powerForm.errorIdReq"));
				return;
			}
			// Loại bỏ các phần tử rỗng trong mảng type trước khi lưu
			const dataToSave = {
				...formData,
				type: formData.type.map(t => t.trim()).filter(Boolean),
			};
			onSave(dataToSave);
		};

		const confirmCancel = () => {
			setIsCancelModalOpen(false);
			onCancel();
		};

		return (
			<>
				<form onSubmit={handleSubmit} className='space-y-8'>
					{/* Header Toolbar */}
					<div className='flex justify-between border-border sticky top-0 bg-surface-bg z-20 py-2 border-b mb-4 shadow-sm px-4'>
						<div>
							<h2 className='block font-semibold text-text-primary text-xl'>
								{formData.isNew
									? tUI("admin.powerForm.createTitle")
									: `${tUI("admin.powerForm.editTitle")} ${formData.name}`}
							</h2>
							{isDirty && (
								<span className='text-xs text-yellow-500 font-medium'>
									{tUI("admin.common.unsavedChanges")}
								</span>
							)}
						</div>
						<div className='flex items-center gap-3'>
							<Button
								type='button'
								variant='ghost'
								onClick={() =>
									isDirty ? setIsCancelModalOpen(true) : onCancel()
								}
								disabled={isSaving}
							>
								{tUI("admin.common.cancel")}
							</Button>
							{!formData.isNew && (
								<Button
									type='button'
									variant='danger'
									onClick={() => setIsDeleteModalOpen(true)}
									disabled={isSaving}
								>
									{tUI("admin.common.delete")}
								</Button>
							)}
							<Button
								type='submit'
								variant='primary'
								disabled={isSaving || !formData.powerCode}
							>
								{isSaving
									? tUI("admin.common.saving")
									: formData.isNew
										? tUI("admin.common.create")
										: tUI("admin.common.saveChanges")}
							</Button>
						</div>
					</div>

					{/* Content Form */}
					<div className='grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 bg-surface-bg border border-border rounded-xl mx-4'>
						{/* CỘT TRÁI */}
						<div className='space-y-5'>
							<div className='grid grid-cols-2 gap-4'>
								<InputField
									label={tUI("admin.powerForm.idLabel")}
									name='powerCode'
									value={formData.powerCode || ""}
									onChange={handleInputChange}
									required
									disabled={!formData.isNew}
									placeholder='VD: P001'
								/>
								<div className='pt-1'>
									<ArrayInputComponent
										label={tUI("admin.powerForm.typeLabel")}
										data={formData.type || []}
										onChange={newArr =>
											setFormData(prev => ({ ...prev, type: newArr }))
										}
										placeholder='VD: Relic Power...'
									/>
								</div>
							</div>

							{/* Khu vực ngôn ngữ Tiếng Việt */}
							<div className='border border-border rounded-lg p-4 bg-page-bg space-y-4 shadow-sm'>
								<h3 className='text-md font-bold text-text-primary border-b border-border pb-2'>
									Ngôn ngữ: Tiếng Việt (Mặc định)
								</h3>
								<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
									<InputField
										label={`${tUI("admin.powerForm.nameLabel")} (VI)`}
										name='name'
										value={formData.name || ""}
										onChange={handleInputChange}
										required
										placeholder='Nhập tên sức mạnh...'
									/>
									<InputField
										label={`${tUI("admin.powerForm.rarityLabel")} (VI)`}
										name='rarity'
										value={formData.rarity || ""}
										onChange={handleInputChange}
										placeholder='Thường, Hiếm, Sử Thi...'
									/>
								</div>
								<div className='flex flex-col gap-1'>
									<label className='text-sm font-semibold text-text-primary'>
										{tUI("admin.powerForm.descLabel")} (VI)
									</label>
									<textarea
										name='description'
										value={formData.description || ""}
										onChange={handleInputChange}
										className='w-full p-4 rounded-lg border border-border bg-surface-bg text-text-primary min-h-[100px] outline-none focus:ring-2 focus:ring-primary-500 transition resize-none'
										placeholder='Nội dung mô tả...'
									/>
								</div>
							</div>

							{/* Khu vực ngôn ngữ Tiếng Anh */}
							<div className='border border-border rounded-lg p-4 bg-page-bg space-y-4 shadow-sm'>
								<h3 className='text-md font-bold text-blue-500 border-b border-border pb-2'>
									Ngôn ngữ: Tiếng Anh (Tùy chọn)
								</h3>
								<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
									<InputField
										label={`${tUI("admin.powerForm.nameLabel")} (EN)`}
										name='name'
										value={formData.translations?.en?.name || ""}
										onChange={e => handleTranslationChange(e, "en")}
										placeholder='English Name...'
									/>
									<InputField
										label={`${tUI("admin.powerForm.rarityLabel")} (EN)`}
										name='rarity'
										value={formData.translations?.en?.rarity || ""}
										onChange={e => handleTranslationChange(e, "en")}
										placeholder='English Rarity...'
									/>
								</div>
								<div className='flex flex-col gap-1'>
									<label className='text-sm font-semibold text-text-primary'>
										{tUI("admin.powerForm.descLabel")} (EN)
									</label>
									<textarea
										name='description'
										value={formData.translations?.en?.description || ""}
										onChange={e => handleTranslationChange(e, "en")}
										className='w-full p-4 rounded-lg border border-border bg-surface-bg text-text-primary min-h-[100px] outline-none focus:ring-2 focus:ring-blue-500 transition resize-none'
										placeholder='English Description...'
									/>
								</div>
							</div>
						</div>

						{/* CỘT PHẢI */}
						<div className='space-y-5'>
							<div className='flex flex-col items-center bg-surface-hover/30 p-6 rounded-xl border border-dashed border-border'>
								<p className='text-xs font-bold text-text-secondary mb-4 uppercase tracking-widest'>
									{tUI("admin.powerForm.previewImage")}
								</p>
								{/* Ưu tiên assetAbsolutePath giống Rune và Relic */}
								{formData.assetAbsolutePath ||
								formData.assetFullAbsolutePath ? (
									<img
										src={
											formData.assetAbsolutePath ||
											formData.assetFullAbsolutePath
										}
										className='w-44 h-44 object-contain rounded-xl shadow-xl border-4 border-white dark:border-gray-800'
										alt='Preview'
										onError={e => {
											e.target.src =
												"https://via.placeholder.com/150?text=No+Image";
										}}
									/>
								) : (
									<div className='w-44 h-44 bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center text-gray-400 text-5xl'>
										?
									</div>
								)}
							</div>
							<InputField
								label={tUI("admin.powerForm.imageUrlLabel")}
								name='assetAbsolutePath'
								value={formData.assetAbsolutePath || ""}
								onChange={handleInputChange}
								placeholder='https://...'
							/>
							<InputField
								label={tUI("admin.powerForm.imageFullUrlLabel")}
								name='assetFullAbsolutePath'
								value={formData.assetFullAbsolutePath || ""}
								onChange={handleInputChange}
								placeholder='https://...'
							/>
						</div>
					</div>
				</form>

				{/* Modal Xác nhận Hủy */}
				<Modal
					isOpen={isCancelModalOpen}
					onClose={() => setIsCancelModalOpen(false)}
					title={tUI("admin.common.cancelConfirmTitle")}
				>
					<div className='text-text-secondary'>
						<p className='mb-6'>{tUI("admin.common.cancelConfirmText")}</p>
						<div className='flex justify-end gap-3'>
							<Button
								onClick={() => setIsCancelModalOpen(false)}
								variant='ghost'
							>
								{tUI("admin.common.stay")}
							</Button>
							<Button onClick={confirmCancel} variant='danger'>
								{tUI("admin.common.leave")}
							</Button>
						</div>
					</div>
				</Modal>

				{/* Modal Xác nhận Xóa */}
				<Modal
					isOpen={isDeleteModalOpen}
					onClose={() => setIsDeleteModalOpen(false)}
					title={tUI("admin.common.deleteConfirmTitle")}
				>
					<div className='text-text-secondary'>
						<p className='mb-6'>
							{tUI("admin.powerForm.deleteConfirmText")}{" "}
							<strong>{power?.name}</strong>?{tUI("admin.common.cannotUndo")}
						</p>
						<div className='flex justify-end gap-3'>
							<Button
								onClick={() => setIsDeleteModalOpen(false)}
								variant='ghost'
							>
								{tUI("admin.common.cancel")}
							</Button>
							<Button
								onClick={() => onDelete(formData.powerCode)}
								variant='danger'
							>
								{tUI("admin.common.delete")}
							</Button>
						</div>
					</div>
				</Modal>
			</>
		);
	},
);

export default PowerEditorForm;
