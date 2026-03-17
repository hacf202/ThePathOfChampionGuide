// src/pages/admin/runeEditorForm.jsx
import { useState, memo, useEffect } from "react";
import Button from "../../common/button";
import InputField from "../../common/inputField";
import Modal from "../../common/modal";
import { useTranslation } from "../../../hooks/useTranslation"; // IMPORT HOOK ĐA NGÔN NGỮ

const RuneEditorForm = memo(
	({ rune, onSave, onCancel, onDelete, isSaving }) => {
		const [formData, setFormData] = useState({});
		const [initialData, setInitialData] = useState({});
		const [isDirty, setIsDirty] = useState(false);

		const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
		const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
		const { tUI } = useTranslation();

		// Khởi tạo và deep clone dữ liệu ban đầu để so sánh thay đổi
		useEffect(() => {
			if (rune) {
				const deepCloned = JSON.parse(JSON.stringify(rune));

				// Đảm bảo object translations luôn tồn tại với đầy đủ các field của chuẩn mới
				if (!deepCloned.translations) {
					deepCloned.translations = {
						en: { name: "", region: "", rarity: "", description: "" },
					};
				}
				if (!deepCloned.translations.en) {
					deepCloned.translations.en = {
						name: "",
						region: "",
						rarity: "",
						description: "",
					};
				}

				setFormData(deepCloned);
				setInitialData(JSON.parse(JSON.stringify(deepCloned)));
				setIsDirty(false);
			}
		}, [rune]);

		// Kiểm tra trạng thái thay đổi dữ liệu (Dirty check)
		useEffect(() => {
			const isChanged =
				JSON.stringify(formData) !== JSON.stringify(initialData);
			setIsDirty(isChanged);
		}, [formData, initialData]);

		// Chặn trình duyệt đóng tab hoặc tải lại trang nếu có thay đổi chưa lưu
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

		const handleTypeChange = e => {
			const val = e.target.value;
			const arr = val
				.split(",")
				.map(v => v.trim())
				.filter(Boolean);
			setFormData(prev => ({ ...prev, type: arr }));
		};

		const handleSubmit = e => {
			e.preventDefault();
			if (!formData.runeCode?.trim()) {
				alert(tUI("admin.runeForm.errorIdReq"));
				return;
			}
			onSave(formData);
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
									? tUI("admin.runeForm.createTitle")
									: `${tUI("admin.runeForm.editTitle")} ${formData.name}`}
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
								disabled={isSaving || !formData.runeCode}
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
							<InputField
								label={tUI("admin.runeForm.idLabel")}
								name='runeCode'
								value={formData.runeCode || ""}
								onChange={handleInputChange}
								required
								disabled={!formData.isNew}
								placeholder='P0224, SR001...'
							/>

							<div className='flex flex-col gap-1'>
								<label className='text-sm font-semibold text-text-primary'>
									{tUI("admin.runeForm.typeLabel")}
								</label>
								<input
									type='text'
									value={
										Array.isArray(formData.type)
											? formData.type.join(", ")
											: formData.type || ""
									}
									onChange={handleTypeChange}
									className='w-full p-2.5 rounded-lg border border-border bg-surface-bg text-text-primary outline-none focus:ring-2 focus:ring-primary-500 transition'
									placeholder='Ngọc, Sức Mạnh...'
								/>
							</div>

							{/* Khu vực ngôn ngữ Tiếng Việt */}
							<div className='border border-border rounded-lg p-4 bg-page-bg space-y-4 shadow-sm'>
								<h3 className='text-md font-bold text-text-primary border-b border-border pb-2'>
									Ngôn ngữ: Tiếng Việt (Mặc định)
								</h3>

								<InputField
									label={`${tUI("admin.runeForm.nameLabel")} (VI)`}
									name='name'
									value={formData.name || ""}
									onChange={handleInputChange}
									required
									placeholder='Nhập tên ngọc...'
								/>

								<div className='grid grid-cols-2 gap-4'>
									<InputField
										label={`${tUI("admin.runeForm.regionLabel")} (VI)`}
										name='region'
										value={formData.region || ""}
										onChange={handleInputChange}
										placeholder='Spirit Blossom, Demacia...'
									/>
									<InputField
										label={`${tUI("admin.runeForm.rarityLabel")} (VI)`}
										name='rarity'
										value={formData.rarity || ""}
										onChange={handleInputChange}
										placeholder='Thường, Hiếm, Sử Thi...'
									/>
								</div>

								<div className='flex flex-col gap-1'>
									<label className='text-sm font-semibold text-text-primary'>
										{tUI("admin.runeForm.descLabel")} (VI)
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

								<InputField
									label={`${tUI("admin.runeForm.nameLabel")} (EN)`}
									name='name'
									value={formData.translations?.en?.name || ""}
									onChange={e => handleTranslationChange(e, "en")}
									placeholder='English Name...'
								/>

								<div className='grid grid-cols-2 gap-4'>
									<InputField
										label={`${tUI("admin.runeForm.regionLabel")} (EN)`}
										name='region'
										value={formData.translations?.en?.region || ""}
										onChange={e => handleTranslationChange(e, "en")}
										placeholder='English Region...'
									/>
									<InputField
										label={`${tUI("admin.runeForm.rarityLabel")} (EN)`}
										name='rarity'
										value={formData.translations?.en?.rarity || ""}
										onChange={e => handleTranslationChange(e, "en")}
										placeholder='English Rarity...'
									/>
								</div>

								<div className='flex flex-col gap-1'>
									<label className='text-sm font-semibold text-text-primary'>
										{tUI("admin.runeForm.descLabel")} (EN)
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
									{tUI("admin.runeForm.previewImage")}
								</p>
								{/* Đã sửa ưu tiên assetAbsolutePath */}
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
								label={tUI("admin.runeForm.imageUrlLabel")}
								name='assetAbsolutePath'
								value={formData.assetAbsolutePath || ""}
								onChange={handleInputChange}
								placeholder='https://...'
							/>
							<InputField
								label={tUI("admin.runeForm.imageFullUrlLabel")}
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
					<div className='p-4 text-text-secondary'>
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
					<div className='p-4 text-text-secondary'>
						<p className='mb-6'>
							{tUI("admin.runeForm.deleteConfirmText")}{" "}
							<strong>{rune?.name}</strong>?{tUI("admin.common.cannotUndo")}
						</p>
						<div className='flex justify-end gap-3'>
							<Button
								onClick={() => setIsDeleteModalOpen(false)}
								variant='ghost'
							>
								{tUI("admin.common.cancel")}
							</Button>
							<Button
								onClick={() => onDelete(formData.runeCode)}
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

export default RuneEditorForm;
