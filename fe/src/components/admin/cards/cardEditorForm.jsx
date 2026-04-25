import { useState, memo, useEffect } from "react";
import Swal from "sweetalert2";
import InputField from "../../common/inputField";
import { useTranslation } from "../../../hooks/useTranslation";
import EditorHeaderToolbar from "../common/editorHeaderToolbar";
import ImagePreviewBox from "../common/imagePreviewBox";
import MarkupEditor from "../MarkupEditor";

const CardEditorForm = memo(({ card, onSave, onCancel, onDelete, isSaving }) => {
	const [formData, setFormData] = useState({});
	const [initialData, setInitialData] = useState({});
	const [isDirty, setIsDirty] = useState(false);
	const { tUI } = useTranslation();

	useEffect(() => {
		if (card) {
			const deepCloned = JSON.parse(JSON.stringify(card));
			if (!deepCloned.translations) {
				deepCloned.translations = { en: {} };
			}
			if (!deepCloned.translations.en) {
				deepCloned.translations.en = {};
			}

            // Chuyển mảng thành string để dễ nhập (có thể gõ dấu cách thoải mái)
            if (Array.isArray(deepCloned.regions)) {
                deepCloned.regions = deepCloned.regions.join(", ");
            }
            if (Array.isArray(deepCloned.associatedCardRefs)) {
                deepCloned.associatedCardRefs = deepCloned.associatedCardRefs.join(", ");
            }
            if (deepCloned.translations?.en && Array.isArray(deepCloned.translations.en.regions)) {
                deepCloned.translations.en.regions = deepCloned.translations.en.regions.join(", ");
            }

			setFormData(deepCloned);
			setInitialData(JSON.parse(JSON.stringify(deepCloned)));
			setIsDirty(false);
		}
	}, [card]);

	useEffect(() => {
		setIsDirty(JSON.stringify(formData) !== JSON.stringify(initialData));
	}, [formData, initialData]);

	const handleInputChange = e => {
		const { name, value, type } = e.target;
        
        let val = value;
        if (type === 'number') val = parseInt(value) || 0;
        
        // Đặc biệt cho Type: Root luôn là viết thường
        if (name === 'type') {
            const lowerType = value.toLowerCase();
            const upperType = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
            
            setFormData(prev => ({ 
                ...prev, 
                type: lowerType,
                translations: {
                    ...prev.translations,
                    en: { ...(prev.translations?.en || {}), type: upperType }
                }
            }));
            return;
        }

		setFormData(prev => ({ ...prev, [name]: val }));
	};

    const handleArrayChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTranslationRegionsChange = (value) => {
        setFormData(prev => ({
            ...prev,
            translations: {
                ...prev.translations,
                en: { ...(prev.translations?.en || {}), regions: value }
            }
        }));
    };

	const handleTranslationChange = (field, value, type) => {
        const val = type === 'number' ? parseInt(value) || 0 : value;
		setFormData(prev => ({
			...prev,
			translations: {
				...prev.translations,
				en: { ...(prev.translations?.en || {}), [field]: val },
			},
		}));
	};

	const handleSubmit = e => {
		e.preventDefault();
		if (!formData.cardCode?.trim()) {
			Swal.fire({
				icon: "warning",
				title: "Thiếu dữ liệu",
				text: tUI("admin.cardForm.errorCardCodeReq"),
				confirmButtonColor: "#3b82f6",
			});
			return;
		}
		if (!formData.cardName?.trim()) {
			Swal.fire({
				icon: "warning",
				title: "Thiếu dữ liệu",
				text: tUI("admin.cardForm.errorCardNameReq"),
				confirmButtonColor: "#3b82f6",
			});
			return;
		}

        // Chuyển ngược lại từ string sang mảng trước khi lưu
        const finalData = JSON.parse(JSON.stringify(formData));
        
        if (typeof finalData.regions === 'string') {
            finalData.regions = finalData.regions.split(",").map(r => r.trim()).filter(Boolean);
        }
        if (typeof finalData.associatedCardRefs === 'string') {
            finalData.associatedCardRefs = finalData.associatedCardRefs.split(",").map(r => r.trim()).filter(Boolean);
        }
        if (finalData.translations?.en && typeof finalData.translations.en.regions === 'string') {
            finalData.translations.en.regions = finalData.translations.en.regions.split(",").map(r => r.trim()).filter(Boolean);
        }

		onSave(finalData);
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

			<div className='grid grid-cols-1 xl:grid-cols-2 gap-8 p-6 bg-surface-bg border border-border rounded-xl mx-4'>
				{/* PHẦN 1: THÔNG TIN CƠ BẢN & CHỈ SỐ (VI) */}
				<div className='space-y-6'>
					<div className='border border-border rounded-xl p-5 bg-page-bg space-y-5 shadow-sm'>
						<h3 className='text-lg font-bold text-primary-500 border-b border-border pb-3 flex items-center gap-2'>
							<span className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
							{tUI("admin.cardForm.identitySection")} (VI)
						</h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    						<InputField
    							label={tUI("admin.cardForm.cardCodeLabel")}
    							name='cardCode'
    							value={formData.cardCode || ""}
    							onChange={handleInputChange}
    							required
    							disabled={!formData.isNew}
    							placeholder='VD: 06RU009'
    						/>
    						<InputField
    							label={tUI("admin.cardForm.cardNameLabel")}
    							name='cardName'
    							value={formData.cardName || ""}
    							onChange={handleInputChange}
    							required
    							placeholder='Tên lá bài...'
    						/>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <InputField
                                label="Cost"
                                name="cost"
                                type="number"
                                value={formData.cost ?? 0}
                                onChange={handleInputChange}
                            />
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-text-secondary">Rarity</label>
                                <select 
                                    name="rarity" 
                                    value={formData.rarity || "None"} 
                                    onChange={handleInputChange}
                                    className="w-full bg-surface-hover border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                                >
                                    <option value="None">None</option>
                                    <option value="Common">Common</option>
                                    <option value="Rare">Rare</option>
                                    <option value="Epic">Epic</option>
                                    <option value="Champion">Champion</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-text-secondary">Type</label>
                                <select 
                                    name="type" 
                                    value={(formData.type || "unit").toLowerCase()} 
                                    onChange={handleInputChange}
                                    className="w-full bg-surface-hover border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                                >
                                    <option value="unit">Unit / Bài quân</option>
                                    <option value="spell">Spell / Kỹ năng (Phép)</option>
                                    <option value="landmark">Landmark / Địa danh</option>
                                    <option value="equipment">Equipment / Trang bị</option>
                                    <option value="ability">Ability / Kỹ năng tướng</option>
                                    <option value="trap">Trap / Bẫy</option>
                                </select>
                            </div>
                            <InputField
                                label="Regions (VI)"
                                value={formData.regions || ""}
                                onChange={(e) => handleArrayChange('regions', e.target.value)}
                                placeholder="Noxus, Ionia..."
                            />
                        </div>

                        <div className="space-y-4 pt-2">
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-text-secondary uppercase tracking-wider">Mô tả lá bài</label>
                                <MarkupEditor
                                    value={formData.description || ""}
                                    onChange={({ markup, raw }) => {
                                        setFormData(prev => ({ 
                                            ...prev, 
                                            description: markup,
                                            descriptionRaw: raw
                                        }));
                                    }}
                                    placeholder="Nhập mô tả lá bài..."
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                             <InputField
                                label="Mã thẻ bài liên quan (associatedCardRefs - phân tách bằng dấu phẩy)"
                                value={formData.associatedCardRefs || ""}
                                onChange={(e) => handleArrayChange('associatedCardRefs', e.target.value)}
                                placeholder="01NX001, 01NX002..."
                            />
                        </div>

                        <div className="space-y-4 pt-4 border-t border-border/50">
                            <InputField
                                label={tUI("admin.cardForm.imageUrlLabel")}
                                name='gameAbsolutePath'
                                value={formData.gameAbsolutePath || ""}
                                onChange={handleInputChange}
                                placeholder='https://dd.b.pvp.net/...'
                            />
                            <ImagePreviewBox
                                imageUrl={formData.gameAbsolutePath}
                                label={tUI("admin.cardForm.previewImage")}
                                wrapperClassName='flex flex-col items-center bg-gray-900/40 p-4 rounded-xl border border-dashed border-border'
                                imageClassName='w-40 h-auto max-h-56 object-contain rounded-lg shadow-2xl border-2 border-white/10'
                            />
                        </div>
					</div>
				</div>

				{/* PHẦN 2: DỊCH THUẬT TIẾNG ANH (EN) */}
				<div className='space-y-6'>
					<div className='border border-border rounded-xl p-5 bg-surface-hover/20 space-y-5 shadow-sm'>
                        <h3 className='text-lg font-bold text-blue-400 border-b border-border pb-3 flex items-center gap-2'>
							<span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
							English Translations (EN)
						</h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField
                                label="English Name"
                                value={formData.translations?.en?.cardName || ""}
                                onChange={e => handleTranslationChange("cardName", e.target.value)}
                                placeholder='English title...'
                            />
                            <InputField
                                label="English Type (Unit, Spell, ...)"
                                value={formData.translations?.en?.type || ""}
                                onChange={e => handleTranslationChange("type", e.target.value)}
                                placeholder='Unit, Spell...'
                            />
                        </div>

                        <InputField
                            label="English Regions (Comma split)"
                            value={formData.translations?.en?.regions || ""}
                            onChange={(e) => handleTranslationRegionsChange(e.target.value)}
                            placeholder="Noxus, Ionia..."
                        />

                        <div className="space-y-4 pt-2">
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-blue-400/80 uppercase tracking-wider">English Description</label>
                                <MarkupEditor
                                    value={formData.translations?.en?.description || ""}
                                    onChange={({ markup, raw }) => {
                                        setFormData(prev => ({
                                            ...prev,
                                            translations: {
                                                ...prev.translations,
                                                en: { 
                                                    ...(prev.translations?.en || {}), 
                                                    description: markup,
                                                    descriptionRaw: raw
                                                }
                                            }
                                        }));
                                    }}
                                    placeholder="Enter English description..."
                                />
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-border/50">
                            <InputField
                                label="English Image URL"
                                value={formData.translations?.en?.gameAbsolutePath || ""}
                                onChange={e => handleTranslationChange("gameAbsolutePath", e.target.value)}
                                placeholder='https://dd.b.pvp.net/...'
                            />
                            <ImagePreviewBox
                                imageUrl={formData.translations?.en?.gameAbsolutePath}
                                label="English Preview"
                                wrapperClassName='flex flex-col items-center bg-gray-900/40 p-4 rounded-xl border border-dashed border-border'
                                imageClassName='w-40 h-auto max-h-56 object-contain rounded-lg shadow-2xl border-2 border-white/10'
                            />
                        </div>
					</div>
				</div>
			</div>
		</form>
	);
});

export default CardEditorForm;
