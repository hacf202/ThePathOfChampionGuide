// src/pages/admin/bonusStarEditorForm.jsx
import { useState, memo, useEffect } from "react";
import Button from "../../common/button";
import InputField from "../../common/inputField";
import Modal from "../../common/modal";
import { useTranslation } from "../../../hooks/useTranslation";

const BonusStarEditorForm = memo(
	({ item, onSave, onCancel, onDelete, isSaving }) => {
		const [formData, setFormData] = useState({});
		const [initialData, setInitialData] = useState({});
		const [isDirty, setIsDirty] = useState(false);
		const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
		const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

		const { tUI } = useTranslation();

		// Khởi tạo và deep clone dữ liệu để theo dõi thay đổi
		useEffect(() => {
			if (item) {
				const clonedItem = JSON.parse(JSON.stringify(item));
				// Đảm bảo object translations luôn tồn tại để tránh lỗi undefined
				if (!clonedItem.translations) {
					clonedItem.translations = { en: { name: "", description: "" } };
				}
				if (!clonedItem.translations.en) {
					clonedItem.translations.en = { name: "", description: "" };
				}

				setFormData(clonedItem);
				setInitialData(JSON.parse(JSON.stringify(clonedItem)));
				setIsDirty(false);
			}
		}, [item]);

		// Kiểm tra trạng thái dữ liệu đã bị thay đổi hay chưa
		useEffect(() => {
			setIsDirty(JSON.stringify(formData) !== JSON.stringify(initialData));
		}, [formData, initialData]);

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
			if (!formData.bonusStarID?.trim()) {
				alert(tUI("admin.bonusStarForm.errorIdReq"));
				return;
			}
			onSave(formData);
		};

		const handleConfirmCancel = () => {
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
									? tUI("admin.bonusStarForm.createTitle")
									: `${tUI("admin.bonusStarForm.editTitle")} ${formData.name}`}
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
								disabled={isSaving || !formData.bonusStarID}
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
						<div className='space-y-5'>
							<InputField
								label={tUI("admin.bonusStarForm.idLabel")}
								name='bonusStarID'
								value={formData.bonusStarID || ""}
								onChange={handleInputChange}
								required
								disabled={!formData.isNew}
								placeholder='VD: C0006'
							/>

							<div className='flex flex-col gap-1'>
								<label className='text-sm font-semibold text-text-primary'>
									{tUI("admin.bonusStarForm.nodeTypeLabel")}
								</label>
								<select
									name='nodeType'
									value={formData.nodeType || "bonusStar"}
									onChange={handleInputChange}
									className='w-full p-2.5 rounded-lg border border-border bg-surface-bg text-text-primary outline-none focus:ring-2 focus:ring-primary-500 transition'
								>
									<option value='bonusStar'>Bonus Star</option>
									<option value='bonusStarGem'>Bonus Gem</option>
								</select>
							</div>

							<div className='border border-border rounded-lg p-4 bg-page-bg space-y-4'>
								<InputField
									label={`${tUI("admin.bonusStarForm.nameLabel")} (VI)`}
									name='name'
									value={formData.name || ""}
									onChange={handleInputChange}
									required
									placeholder='Nhập tên...'
								/>
								<div className='flex flex-col gap-1'>
									<label className='text-sm font-semibold text-text-primary'>
										{tUI("admin.bonusStarForm.descLabel")} (VI)
									</label>
									<textarea
										name='description'
										value={formData.description || ""}
										onChange={handleInputChange}
										className='w-full p-4 rounded-lg border border-border bg-surface-bg text-text-primary min-h-[100px] outline-none focus:ring-2 focus:ring-primary-500 transition resize-none'
										placeholder='Nhập nội dung mô tả kỹ năng...'
									/>
								</div>
							</div>

							<div className='border border-border rounded-lg p-4 bg-page-bg space-y-4'>
								<InputField
									label={`${tUI("admin.bonusStarForm.nameLabel")} (EN)`}
									name='name'
									value={formData.translations?.en?.name || ""}
									onChange={e => handleTranslationChange(e, "en")}
									placeholder='English Name...'
								/>
								<div className='flex flex-col gap-1'>
									<label className='text-sm font-semibold text-text-primary'>
										{tUI("admin.bonusStarForm.descLabel")} (EN)
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

						<div className='space-y-5'>
							<div className='flex flex-col items-center bg-surface-hover/30 p-6 rounded-xl border border-dashed border-border'>
								<p className='text-xs font-bold text-text-secondary mb-4 uppercase tracking-widest'>
									{tUI("admin.bonusStarForm.previewImage")}
								</p>
								{formData.image ? (
									<img
										src={formData.image}
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
								label={tUI("admin.bonusStarForm.imageUrlLabel")}
								name='image'
								value={formData.image || ""}
								onChange={handleInputChange}
								placeholder='https://example.com/image.png'
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
					<div className='p-4 text-text-secondary'>
						<p>{tUI("admin.common.cancelConfirmText")}</p>
						<div className='flex justify-end gap-3 mt-6'>
							<Button
								onClick={() => setIsCancelModalOpen(false)}
								variant='ghost'
							>
								{tUI("admin.common.stay")}
							</Button>
							<Button onClick={handleConfirmCancel} variant='danger'>
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
					<div className='p-4 text-text-secondary'>
						<p>
							{tUI("admin.bonusStarForm.deleteConfirmText")}{" "}
							<strong>{formData.name}</strong>
							{tUI("admin.common.cannotUndo")}
						</p>
						<div className='flex justify-end gap-3 mt-6'>
							<Button
								onClick={() => setIsDeleteModalOpen(false)}
								variant='ghost'
							>
								{tUI("admin.common.cancel")}
							</Button>
							<Button
								onClick={() => onDelete(formData.bonusStarID)}
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

export default BonusStarEditorForm;
