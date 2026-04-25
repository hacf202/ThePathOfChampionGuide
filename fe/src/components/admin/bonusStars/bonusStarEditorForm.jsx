// src/pages/admin/bonusStarEditorForm.jsx
import { useState, memo, useEffect } from "react";
import Button from "../../common/button";
import InputField from "../../common/inputField";
import { useTranslation } from "../../../hooks/useTranslation";
import MarkupEditor from "../MarkupEditor";
import Swal from "sweetalert2";

const BonusStarEditorForm = memo(
	({ item, onSave, onCancel, onDelete, isSaving }) => {
		const [formData, setFormData] = useState({});
		const [initialData, setInitialData] = useState({});
		const [isDirty, setIsDirty] = useState(false);

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

		// Kiểm tra trạng thái dữ liệu đã bị thay đổi hay chưa (Deep comparison)
		useEffect(() => {
			setIsDirty(JSON.stringify(formData) !== JSON.stringify(initialData));
		}, [formData, initialData]);

		const handleInputChange = e => {
			const { name, value } = e.target;
			setFormData(prev => ({ ...prev, [name]: value }));
		};

		// Tối ưu hóa xử lý dịch thuật, bảo vệ bằng fallback object trống
		const handleTranslationChange = (e, lang) => {
			const { name, value } = e.target;
			setFormData(prev => ({
				...prev,
				translations: {
					...(prev.translations || {}),
					[lang]: {
						...(prev.translations?.[lang] || {}),
						[name]: value,
					},
				},
			}));
		};

		const handleSubmit = e => {
			e.preventDefault();
			if (!formData.bonusStarID?.trim()) {
				Swal.fire({
					icon: "warning",
					title: "Thiếu dữ liệu",
					text: tUI("admin.bonusStarForm.errorIdReq"),
					confirmButtonColor: "#3b82f6",
				});
				return;
			}
			onSave(formData);
		};

		const handleCancel = async () => {
			if (isDirty) {
				const result = await Swal.fire({
					title: tUI("admin.common.cancelConfirmTitle"),
					text: tUI("admin.common.cancelConfirmText"),
					icon: "warning",
					showCancelButton: true,
					confirmButtonColor: "#ef4444",
					cancelButtonColor: "#6b7280",
					confirmButtonText: tUI("admin.common.leave"),
					cancelButtonText: tUI("admin.common.stay"),
					background: "#1f2937",
					color: "#f3f4f6",
				});
				if (!result.isConfirmed) return;
			}
			onCancel();
		};

		const handleDelete = async () => {
			const result = await Swal.fire({
				title: tUI("admin.common.deleteConfirmTitle"),
				text: `${tUI("admin.bonusStarForm.deleteConfirmText")} ${formData.name}. ${tUI("admin.common.cannotUndo")}`,
				icon: "warning",
				showCancelButton: true,
				confirmButtonColor: "#ef4444",
				cancelButtonColor: "#6b7280",
				confirmButtonText: tUI("admin.common.delete"),
				cancelButtonText: tUI("admin.common.cancel"),
				background: "#1f2937",
				color: "#f3f4f6",
			});
			if (result.isConfirmed) {
				onDelete(formData.bonusStarID);
			}
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
								onClick={handleCancel}
								disabled={isSaving}
							>
								{tUI("admin.common.cancel")}
							</Button>
							{!formData.isNew && (
								<Button
									type='button'
									variant='danger'
									onClick={handleDelete}
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
								<div className='flex flex-col gap-2'>
									<label className='text-sm font-semibold text-text-primary'>
										{tUI("admin.bonusStarForm.descLabel")} (VI)
									</label>
									<MarkupEditor
										value={formData.description || ""}
										onChange={({ markup, raw }) => {
											setFormData(prev => ({
												...prev,
												description: markup,
												descriptionRaw: raw,
											}));
										}}
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
								<div className='flex flex-col gap-2'>
									<label className='text-sm font-semibold text-text-primary'>
										{tUI("admin.bonusStarForm.descLabel")} (EN)
									</label>
									<MarkupEditor
										value={formData.translations?.en?.description || ""}
										onChange={({ markup, raw }) =>
											handleTranslationChange(
												{ target: { name: "description", value: markup } },
												"en",
											)
										}
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
			</>
		);
	},
);

export default BonusStarEditorForm;
