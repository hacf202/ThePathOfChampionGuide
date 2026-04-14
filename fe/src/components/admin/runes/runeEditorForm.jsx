import { useState, memo, useEffect } from "react";
import Button from "../../common/button";
import InputField from "../../common/inputField";
import { Plus } from "lucide-react";
import { useTranslation } from "../../../hooks/useTranslation";

// IMPORT CÁC COMPONENT CHUNG
import EditorHeaderToolbar from "../common/editorHeaderToolbar";
import ImagePreviewBox from "../common/imagePreviewBox";
import MarkupEditor from "../MarkupEditor";

/**
 * Component hỗ trợ nhập mảng (Dùng cho field 'type')
 */
const ArrayInputComponent = ({
	label,
	data = [],
	onChange,
	placeholder = "",
}) => {
	const { tUI } = useTranslation();
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
					{tUI("admin.common.add")}
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
								className='p-2 text-red-500 hover:bg-red-500/10 rounded-md font-bold'
								title={tUI("admin.common.remove")}
							>
								X
							</button>
						</div>
					))
				) : (
					<p className='text-sm italic text-text-tertiary bg-surface-bg p-3 rounded-md border border-dashed border-border'>
						{tUI("admin.common.emptyList")}
					</p>
				)}
			</div>
		</div>
	);
};

const RuneEditorForm = memo(
	({ rune, onSave, onCancel, onDelete, isSaving }) => {
		const [formData, setFormData] = useState({});
		const [initialData, setInitialData] = useState({});
		const [isDirty, setIsDirty] = useState(false);
		const { tUI } = useTranslation();

		// Khởi tạo và deep clone dữ liệu ban đầu
		useEffect(() => {
			if (rune) {
				const deepCloned = JSON.parse(JSON.stringify(rune));

				// Chuẩn hóa mảng type
				if (!Array.isArray(deepCloned.type)) deepCloned.type = [];

				// Đảm bảo object translations luôn tồn tại
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
			if (!formData.runeCode?.trim()) {
				alert(tUI("admin.runeForm.errorIdReq"));
				return;
			}
			const dataToSave = {
				...formData,
				type: formData.type.map(t => t.trim()).filter(Boolean),
			};
			onSave(dataToSave);
		};

		return (
			<form onSubmit={handleSubmit} className='space-y-8'>
				{/* THANH CÔNG CỤ QUẢN LÝ */}
				<EditorHeaderToolbar
					title={
						formData.isNew
							? tUI("admin.runeForm.createTitle")
							: `${tUI("admin.runeForm.editTitle")} ${formData.name}`
					}
					isNew={formData.isNew}
					isDirty={isDirty}
					isSaving={isSaving}
					onCancel={onCancel}
					onDelete={() => onDelete(formData.runeCode)}
					itemName={formData.name}
					disableSave={!formData.runeCode}
				/>

				{/* KHU VỰC NHẬP LIỆU */}
				<div className='grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 bg-surface-bg border border-border rounded-xl mx-4'>
					{/* CỘT TRÁI */}
					<div className='space-y-5'>
						<div className='grid grid-cols-2 gap-4'>
							<InputField
								label={tUI("admin.runeForm.idLabel")}
								name='runeCode'
								value={formData.runeCode || ""}
								onChange={handleInputChange}
								required
								disabled={!formData.isNew}
								placeholder='VD: R001'
							/>
							<div className='pt-1'>
								<ArrayInputComponent
									label={tUI("admin.runeForm.typeLabel")}
									data={formData.type || []}
									onChange={newArr =>
										setFormData(prev => ({ ...prev, type: newArr }))
									}
									placeholder='VD: Minor...'
								/>
							</div>
						</div>

						{/* Khu vực ngôn ngữ Tiếng Việt */}
						<div className='border border-border rounded-lg p-4 bg-page-bg space-y-4 shadow-sm'>
							<h3 className='text-md font-bold text-text-primary border-b border-border pb-2'>
								{tUI("admin.common.langVI")}
							</h3>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<InputField
									label={`${tUI("admin.runeForm.nameLabel")} (VI)`}
									name='name'
									value={formData.name || ""}
									onChange={handleInputChange}
									required
									placeholder={tUI("admin.itemForm.placeholderName")}
								/>
								<InputField
									label={`${tUI("admin.runeForm.regionLabel")} (VI)`}
									name='region'
									value={formData.region || ""}
									onChange={handleInputChange}
									placeholder='VD: Ionia, Noxus...'
								/>
								<InputField
									label={`${tUI("admin.runeForm.rarityLabel")} (VI)`}
									name='rarity'
									value={formData.rarity || ""}
									onChange={handleInputChange}
									placeholder='Thường, Hiếm...'
								/>
							</div>
							<div className='flex flex-col gap-2'>
								<label className='text-sm font-semibold text-text-primary'>
									{tUI("admin.runeForm.descLabel")} (VI)
								</label>
								<MarkupEditor
									value={formData.description || ""}
									onChange={({ markup, raw }) =>
										setFormData(prev => ({
											...prev,
											description: markup,
											descriptionRaw: raw,
										}))
									}
									placeholder='Nội dung mô tả...'
								/>
							</div>
						</div>

						{/* Khu vực ngôn ngữ Tiếng Anh */}
						<div className='border border-border rounded-lg p-4 bg-page-bg space-y-4 shadow-sm'>
							<h3 className='text-md font-bold text-blue-500 border-b border-border pb-2'>
								{tUI("admin.common.langEN")}
							</h3>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<InputField
									label={`${tUI("admin.runeForm.nameLabel")} (EN)`}
									name='name'
									value={formData.translations?.en?.name || ""}
									onChange={e => handleTranslationChange(e, "en")}
									placeholder='English Name...'
								/>
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
							<div className='flex flex-col gap-2'>
								<label className='text-sm font-semibold text-text-primary'>
									{tUI("admin.runeForm.descLabel")} (EN)
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

					{/* CỘT PHẢI (Hình ảnh) */}
					<div className='space-y-5'>
						<ImagePreviewBox
							imageUrl={
								formData.assetAbsolutePath || formData.assetFullAbsolutePath
							}
							label={tUI("admin.runeForm.previewImage")}
							wrapperClassName='flex flex-col items-center bg-surface-hover/30 p-6 rounded-xl border border-dashed border-border'
							imageClassName='w-44 h-44 object-contain rounded-xl shadow-xl border-4 border-white dark:border-gray-800'
						/>

						<InputField
							label={tUI("admin.runeForm.imageUrlLabel")}
							name='assetAbsolutePath'
							value={formData.assetAbsolutePath || ""}
							onChange={handleInputChange}
							placeholder='/images/...'
						/>
						<InputField
							label={
								tUI("admin.runeForm.imageFullUrlLabel")
							}
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

export default RuneEditorForm;
