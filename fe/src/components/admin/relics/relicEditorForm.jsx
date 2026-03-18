// src/pages/admin/relicEditorForm.jsx
import { useState, memo, useEffect } from "react";
import InputField from "../../common/inputField";
import { useTranslation } from "../../../hooks/useTranslation"; // IMPORT HOOK ĐA NGÔN NGỮ

// IMPORT CÁC COMPONENT CHUNG
import EditorHeaderToolbar from "../common/editorHeaderToolbar";
import ImagePreviewBox from "../common/imagePreviewBox";

const RelicEditorForm = memo(
	({ relic, onSave, onCancel, onDelete, isSaving }) => {
		const [formData, setFormData] = useState({});
		const [initialData, setInitialData] = useState({});
		const [isDirty, setIsDirty] = useState(false);
		const { tUI } = useTranslation();

		// Khởi tạo và deep clone dữ liệu để so sánh
		useEffect(() => {
			if (relic) {
				const deepCloned = JSON.parse(JSON.stringify(relic));

				// Đảm bảo object translations luôn tồn tại
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
		}, [relic]);

		// Kiểm tra trạng thái thay đổi dữ liệu (Dirty check)
		useEffect(() => {
			const isChanged =
				JSON.stringify(formData) !== JSON.stringify(initialData);
			setIsDirty(isChanged);
		}, [formData, initialData]);

		// Chặn đóng tab nếu có thay đổi chưa lưu
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
			setFormData(prev => ({
				...prev,
				[name]: name === "stack" ? parseInt(value) || 1 : value,
			}));
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
			if (!formData.relicCode?.trim()) {
				alert(tUI("admin.relicForm.errorIdReq"));
				return;
			}
			onSave(formData);
		};

		return (
			<form onSubmit={handleSubmit} className='space-y-8'>
				{/* ĐÃ ÁP DỤNG COMPONENT Toolbar Gộp Logic Modal */}
				<EditorHeaderToolbar
					title={
						formData.isNew
							? tUI("admin.relicForm.createTitle")
							: `${tUI("admin.relicForm.editTitle")} ${formData.name}`
					}
					isNew={formData.isNew}
					isDirty={isDirty}
					isSaving={isSaving}
					onCancel={onCancel}
					onDelete={() => onDelete(formData.relicCode)}
					itemName={formData.name}
					disableSave={!formData.relicCode}
				/>

				{/* Content Form */}
				<div className='grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 bg-surface-bg border border-border rounded-xl mx-4'>
					{/* CỘT TRÁI */}
					<div className='space-y-5'>
						<InputField
							label={tUI("admin.relicForm.idLabel")}
							name='relicCode'
							value={formData.relicCode || ""}
							onChange={handleInputChange}
							required
							disabled={!formData.isNew}
							placeholder='VD: R001'
						/>

						<div className='grid grid-cols-2 gap-4'>
							<div className='flex flex-col gap-1'>
								<label className='text-sm font-semibold text-text-primary'>
									{tUI("admin.relicForm.stackLabel")}
								</label>
								<input
									type='number'
									name='stack'
									value={formData.stack || 1}
									onChange={handleInputChange}
									min='1'
									className='w-full p-2.5 rounded-lg border border-border bg-surface-bg text-text-primary outline-none focus:ring-2 focus:ring-primary-500 transition'
								/>
							</div>
						</div>

						<div className='flex flex-col gap-1'>
							<label className='text-sm font-semibold text-text-primary'>
								{tUI("admin.relicForm.typeLabel")}
							</label>
							<input
								type='text'
								name='type'
								value={formData.type || ""}
								onChange={handleInputChange}
								placeholder='Chung, Trấn...'
								className='w-full p-2.5 rounded-lg border border-border bg-surface-bg text-text-primary outline-none focus:ring-2 focus:ring-primary-500 transition'
							/>
						</div>

						{/* Khu vực ngôn ngữ Tiếng Việt */}
						<div className='border border-border rounded-lg p-4 bg-page-bg space-y-4 shadow-sm'>
							<h3 className='text-md font-bold text-text-primary border-b border-border pb-2'>
								Ngôn ngữ: Tiếng Việt (Mặc định)
							</h3>

							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<InputField
									label={`${tUI("admin.relicForm.nameLabel")} (VI)`}
									name='name'
									value={formData.name || ""}
									onChange={handleInputChange}
									required
									placeholder='Nhập tên Cổ vật...'
								/>
								<InputField
									label={`${tUI("admin.relicForm.rarityLabel")} (VI)`}
									name='rarity'
									value={formData.rarity || ""}
									onChange={handleInputChange}
									placeholder='Hiếm, Sử Thi...'
								/>
							</div>
							<div className='flex flex-col gap-1'>
								<label className='text-sm font-semibold text-text-primary'>
									{tUI("admin.relicForm.descLabel")} (VI)
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
									label={`${tUI("admin.relicForm.nameLabel")} (EN)`}
									name='name'
									value={formData.translations?.en?.name || ""}
									onChange={e => handleTranslationChange(e, "en")}
									placeholder='English Name...'
								/>
								<InputField
									label={`${tUI("admin.relicForm.rarityLabel")} (EN)`}
									name='rarity'
									value={formData.translations?.en?.rarity || ""}
									onChange={e => handleTranslationChange(e, "en")}
									placeholder='English Rarity...'
								/>
							</div>
							<div className='flex flex-col gap-1'>
								<label className='text-sm font-semibold text-text-primary'>
									{tUI("admin.relicForm.descLabel")} (EN)
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
						{/* ĐÃ ÁP DỤNG COMPONENT ImagePreviewBox */}
						<ImagePreviewBox
							imageUrl={
								formData.assetAbsolutePath || formData.assetFullAbsolutePath
							}
							label={tUI("admin.relicForm.previewImage")}
							wrapperClassName='flex flex-col items-center bg-surface-hover/30 p-6 rounded-xl border border-dashed border-border'
							imageClassName='w-44 h-44 object-contain rounded-xl shadow-xl border-4 border-white dark:border-gray-800'
						/>

						<InputField
							label={tUI("admin.relicForm.imageUrlLabel")}
							name='assetAbsolutePath'
							value={formData.assetAbsolutePath || ""}
							onChange={handleInputChange}
							placeholder='https://...'
						/>
						<InputField
							label={tUI("admin.relicForm.imageFullUrlLabel")}
							name='assetFullAbsolutePath'
							value={formData.assetFullAbsolutePath || ""}
							onChange={handleInputChange}
							placeholder='https://...'
						/>
					</div>
				</div>
			</form>
		);
	},
);

export default RelicEditorForm;
