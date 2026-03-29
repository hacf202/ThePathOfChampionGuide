// fe/src/components/admin/cards/cardEditorForm.jsx
import { useState, memo, useEffect } from "react";
import InputField from "../../common/inputField";
import { useTranslation } from "../../../hooks/useTranslation";
import EditorHeaderToolbar from "../common/editorHeaderToolbar";
import ImagePreviewBox from "../common/imagePreviewBox";

const CardEditorForm = memo(({ card, onSave, onCancel, onDelete, isSaving }) => {
	const [formData, setFormData] = useState({});
	const [initialData, setInitialData] = useState({});
	const [isDirty, setIsDirty] = useState(false);
	const { tUI } = useTranslation();

	useEffect(() => {
		if (card) {
			const deepCloned = JSON.parse(JSON.stringify(card));
			if (!deepCloned.translations) {
				deepCloned.translations = { en: { cardName: "" } };
			}
			if (!deepCloned.translations.en) {
				deepCloned.translations.en = { cardName: "" };
			}
			setFormData(deepCloned);
			setInitialData(JSON.parse(JSON.stringify(deepCloned)));
			setIsDirty(false);
		}
	}, [card]);

	useEffect(() => {
		setIsDirty(JSON.stringify(formData) !== JSON.stringify(initialData));
	}, [formData, initialData]);

	useEffect(() => {
		const handleBeforeUnload = e => {
			if (isDirty) {
				e.preventDefault();
				e.returnValue = "";
			}
		};
		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => window.removeEventListener("beforeunload", handleBeforeUnload);
	}, [isDirty]);

	const handleInputChange = e => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
	};

	const handleTranslationChange = (field, value) => {
		setFormData(prev => ({
			...prev,
			translations: {
				...prev.translations,
				en: { ...(prev.translations?.en || {}), [field]: value },
			},
		}));
	};

	const handleSubmit = e => {
		e.preventDefault();
		if (!formData.cardCode?.trim()) {
			alert(tUI("admin.cardForm.errorCardCodeReq"));
			return;
		}
		if (!formData.cardName?.trim()) {
			alert(tUI("admin.cardForm.errorCardNameReq"));
			return;
		}
		onSave(formData);
	};

	return (
		<form onSubmit={handleSubmit} className='space-y-8'>
			<EditorHeaderToolbar
				title={
					formData.isNew
						? tUI("admin.cardForm.createTitle")
						: `${tUI("admin.cardForm.editTitle")} ${formData.cardName || ""}`
				}
				isNew={formData.isNew}
				isDirty={isDirty}
				isSaving={isSaving}
				onCancel={onCancel}
				onDelete={() => onDelete(formData.cardCode)}
				itemName={formData.cardName}
				disableSave={!formData.cardCode}
			/>

			<div className='grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 bg-surface-bg border border-border rounded-xl mx-4'>
				{/* CỘT TRÁI */}
				<div className='space-y-5'>
					<div className='border border-border rounded-lg p-4 bg-page-bg space-y-4 shadow-sm'>
						<h3 className='text-md font-bold text-text-primary border-b border-border pb-2'>
							{tUI("admin.cardForm.identitySection")}
						</h3>
						<InputField
							label={tUI("admin.cardForm.cardCodeLabel")}
							name='cardCode'
							value={formData.cardCode || ""}
							onChange={handleInputChange}
							required
							disabled={!formData.isNew}
							placeholder='VD: 06RU009'
						/>
						<div className='grid grid-cols-1 gap-4'>
							<InputField
								label={`${tUI("admin.cardForm.cardNameLabel")} (VI)`}
								name='cardName'
								value={formData.cardName || ""}
								onChange={handleInputChange}
								required
								placeholder='Tên lá bài tiếng Việt...'
							/>
							<InputField
								label={`${tUI("admin.cardForm.cardNameLabel")} (EN)`}
								value={formData.translations?.en?.cardName || ""}
								onChange={e =>
									handleTranslationChange("cardName", e.target.value)
								}
								placeholder='English card name...'
							/>
						</div>
					</div>
				</div>

				{/* CỘT PHẢI */}
				<div className='space-y-5'>
					<ImagePreviewBox
						imageUrl={formData.gameAbsolutePath}
						label={tUI("admin.cardForm.previewImage")}
						wrapperClassName='flex flex-col items-center bg-surface-hover/30 p-6 rounded-xl border border-dashed border-border'
						imageClassName='w-44 h-auto max-h-64 object-contain rounded-xl shadow-xl border-4 border-white dark:border-gray-800'
					/>

					<InputField
						label={tUI("admin.cardForm.imageUrlLabel")}
						name='gameAbsolutePath'
						value={formData.gameAbsolutePath || ""}
						onChange={handleInputChange}
						placeholder='https://dd.b.pvp.net/...'
					/>
				</div>
			</div>
		</form>
	);
});

export default CardEditorForm;
