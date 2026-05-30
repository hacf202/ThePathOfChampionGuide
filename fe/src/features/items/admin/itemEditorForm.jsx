import { useState, memo, useEffect } from "react";
import Swal from "sweetalert2";
import InputField from "@/components/common/inputField";
import { useTranslation } from "@/hooks/useTranslation";
import MarkupEditor from "@/components/admin/MarkupEditor";

// IMPORT CÁC COMPONENT CHUNG (Đường dẫn chuẩn mới)
import EditorHeaderToolbar from "@/components/admin/common/editorHeaderToolbar";
import ImagePreviewBox from "@/components/admin/common/imagePreviewBox";

const ItemEditorForm = memo(
	({ item, onSave, onCancel, onDelete, isSaving }) => {
		const [formData, setFormData] = useState({});
		const [initialData, setInitialData] = useState({});
		const [isDirty, setIsDirty] = useState(false);
		const { tUI } = useTranslation();

		// Khởi tạo và deep clone dữ liệu
		useEffect(() => {
			if (item) {
				const deepCloned = JSON.parse(JSON.stringify(item));

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

				// Đảm bảo logic luôn tồn tại
				if (!deepCloned.logic) {
					deepCloned.logic = {
						minCost: null,
						maxCost: null,
						forbiddenKeywords: [],
						type: [],
						requiresSubtype: false,
						requiresPositiveKeyword: false,
						requiresOtherCondition: null,
						cannotBeChampion: false,
					};
				}

				setFormData(deepCloned);
				setInitialData(JSON.parse(JSON.stringify(deepCloned)));
				setIsDirty(false);
			}
		}, [item]);

		// Kiểm tra trạng thái thay đổi dữ liệu (Dirty check)
		useEffect(() => {
			const isChanged =
				JSON.stringify(formData) !== JSON.stringify(initialData);
			setIsDirty(isChanged);
		}, [formData, initialData]);

		// Bắt sự kiện người dùng cố tình đóng tab/trình duyệt khi chưa lưu
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

		const handleLogicChange = e => {
			const { name, value, type, checked } = e.target;
			const val = type === "checkbox" ? checked : value;
			
			setFormData(prev => ({
				...prev,
				logic: {
					...prev.logic,
					[name]: val,
				},
			}));
		};

		const handleKeywordsChange = e => {
			const { value } = e.target;
			const keywords = value.split(",").map(k => k.trim()).filter(Boolean);
			setFormData(prev => ({
				...prev,
				logic: {
					...prev.logic,
					forbiddenKeywords: keywords,
				},
			}));
		};

		const handleSubmit = e => {
			e.preventDefault();
			if (!formData.itemCode?.trim()) {
				Swal.fire({
					icon: "warning",
					title: "Thiếu dữ liệu",
					text: tUI("admin.itemForm.errorIdReq"),
					confirmButtonColor: "#3b82f6",
				});
				return;
			}
			onSave(formData);
		};

		return (
			<form onSubmit={handleSubmit} className='space-y-8'>
				{/* THANH CÔNG CỤ QUẢN LÝ (Gộp Modal Hủy & Xóa) */}
				<EditorHeaderToolbar
					title={
						formData.isNew
							? tUI("admin.itemForm.createTitle")
							: `${tUI("admin.itemForm.editTitle")} ${formData.name}`
					}
					isNew={formData.isNew}
					isDirty={isDirty}
					isSaving={isSaving}
					onCancel={onCancel}
					onDelete={() => onDelete(formData.itemCode)}
					itemName={formData.name}
					disableSave={!formData.itemCode}
				/>

				{/* KHU VỰC NHẬP LIỆU */}
				<div className='grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 bg-surface-bg border border-border rounded-xl mx-4'>
					{/* CỘT TRÁI */}
					<div className='space-y-5'>
						<div className='grid grid-cols-1 gap-4'>
							<InputField
								label={tUI("admin.itemForm.idLabel")}
								name='itemCode'
								value={formData.itemCode || ""}
								onChange={handleInputChange}
								required
								disabled={!formData.isNew}
								placeholder='VD: I001'
							/>
						</div>

						{/* Khu vực ngôn ngữ Tiếng Việt */}
						<div className='border border-border rounded-lg p-4 bg-page-bg space-y-4 shadow-sm'>
							<h3 className='text-md font-bold text-text-primary border-b border-border pb-2 flex justify-between'>
								{tUI("admin.itemForm.langVI")}
								<span className="text-[10px] text-text-secondary font-normal uppercase tracking-widest self-center opacity-50">Vietnamese</span>
							</h3>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<InputField
									label={`${tUI("admin.itemForm.nameLabel")} (VI)`}
									name='name'
									value={formData.name || ""}
									onChange={handleInputChange}
									required
									placeholder={tUI("admin.itemForm.placeholderName")}
								/>
								<InputField
									label={`${tUI("admin.itemForm.rarityLabel")} (VI)`}
									name='rarity'
									value={formData.rarity || ""}
									onChange={handleInputChange}
									placeholder={tUI("admin.itemForm.placeholderRarity")}
								/>
							</div>
							
							<div className="space-y-2">
								<InputField
									label={`Phân loại (Type) - VI (Cách nhau bằng dấu phẩy)`}
									name='type'
									value={Array.isArray(formData.type) ? formData.type.join(", ") : formData.type || ""}
									onChange={(e) => {
										const val = e.target.value;
										setFormData(prev => ({ ...prev, type: val.split(",").map(s => s.trim()).filter(Boolean) }));
									}}
									placeholder="Vật Phẩm Phép, Vật Phẩm Tùy Tùng..."
								/>
								<div className="flex flex-wrap gap-1.5 mt-1">
									{["Vật Phẩm Phép", "Vật Phẩm Tùy Tùng", "Vật Phẩm Anh Hùng", "Vật Phẩm Đặc Biệt", "Vật Phẩm Trang Bị", "Vật Phẩm Địa Danh", "Vật Phẩm Chung", "Vật Phẩm Di Vật"].map(t => (
										<button
											key={t}
											type="button"
											onClick={() => {
												const current = Array.isArray(formData.type) ? formData.type : [];
												if (!current.includes(t)) {
													setFormData(prev => ({ ...prev, type: [...current, t] }));
												}
											}}
											className="px-2 py-0.5 text-[10px] bg-primary-500/10 hover:bg-primary-500/20 text-primary-500 rounded border border-primary-500/20 transition-colors"
										>
											+ {t}
										</button>
									))}
								</div>
							</div>

							<div className='flex flex-col gap-2'>
								<label className='text-sm font-semibold text-text-primary'>
									{tUI("admin.itemForm.descLabel")} (VI)
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
									placeholder={tUI("admin.itemForm.placeholderDesc")}
								/>
							</div>

							<div className='flex flex-col gap-2'>
								<label className='text-sm font-semibold text-text-primary'>
									Yêu cầu (Requirements) (VI)
								</label>
								<MarkupEditor
									value={formData.requirements || ""}
									onChange={({ markup, raw }) =>
										setFormData(prev => ({
											...prev,
											requirements: markup,
											requirementsRaw: raw,
										}))
									}
									placeholder="Yêu cầu cụ thể của vật phẩm..."
								/>
							</div>
						</div>

						{/* Khu vực ngôn ngữ Tiếng Anh */}
						<div className='border border-border rounded-lg p-4 bg-page-bg space-y-4 shadow-sm'>
							<h3 className='text-md font-bold text-blue-500 border-b border-border pb-2 flex justify-between'>
								{tUI("admin.itemForm.langEN")}
								<span className="text-[10px] text-blue-500/50 font-normal uppercase tracking-widest self-center">English</span>
							</h3>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<InputField
									label={`${tUI("admin.itemForm.nameLabel")} (EN)`}
									name='name'
									value={formData.translations?.en?.name || ""}
									onChange={e => handleTranslationChange(e, "en")}
									placeholder={tUI("admin.itemForm.placeholderName")}
								/>
								<InputField
									label={`${tUI("admin.itemForm.rarityLabel")} (EN)`}
									name='rarity'
									value={formData.translations?.en?.rarity || ""}
									onChange={e => handleTranslationChange(e, "en")}
									placeholder={tUI("admin.itemForm.placeholderRarity")}
								/>
							</div>

							<div className="space-y-2">
								<InputField
									label={`Phân loại (Type) - EN (Cách nhau bằng dấu phẩy)`}
									name='type'
									value={Array.isArray(formData.translations?.en?.type) ? formData.translations.en.type.join(", ") : formData.translations?.en?.type || ""}
									onChange={(e) => {
										const val = e.target.value;
										handleTranslationChange({ target: { name: "type", value: val.split(",").map(s => s.trim()).filter(Boolean) } }, "en");
									}}
									placeholder="Spell Items, Unit Items..."
								/>
								<div className="flex flex-wrap gap-1.5 mt-1">
									{["Spell Items", "Unit Items", "Champion Items", "Special Items", "Equipment Items", "Landmark Items", "General Items", "Relic Items"].map(t => (
										<button
											key={t}
											type="button"
											onClick={() => {
												const current = Array.isArray(formData.translations?.en?.type) ? formData.translations.en.type : [];
												if (!current.includes(t)) {
													handleTranslationChange({ target: { name: "type", value: [...current, t] } }, "en");
												}
											}}
											className="px-2 py-0.5 text-[10px] bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded border border-blue-500/20 transition-colors"
										>
											+ {t}
										</button>
									))}
								</div>
							</div>

							<div className='flex flex-col gap-2'>
								<label className='text-sm font-semibold text-text-primary'>
									{tUI("admin.itemForm.descLabel")} (EN)
								</label>
								<MarkupEditor
									value={formData.translations?.en?.description || ""}
									onChange={({ markup, raw }) =>
										handleTranslationChange(
											{ target: { name: "description", value: markup } },
											"en",
										)
									}
									placeholder={tUI("admin.itemForm.placeholderDesc")}
								/>
							</div>

							<div className='flex flex-col gap-2'>
								<label className='text-sm font-semibold text-text-primary'>
									Requirements (EN)
								</label>
								<MarkupEditor
									value={formData.translations?.en?.requirements || ""}
									onChange={({ markup, raw }) => {
										setFormData(prev => ({
											...prev,
											translations: {
												...prev.translations,
												en: {
													...prev.translations.en,
													requirements: markup,
													requirementsRaw: raw
												}
											}
										}));
									}}
									placeholder="English requirements..."
								/>
							</div>
						</div>
					</div>

					{/* CỘT PHẢI (Hình ảnh & Logic) */}
					<div className='space-y-5'>
						<ImagePreviewBox
							imageUrl={
								formData.assetAbsolutePath || formData.assetFullAbsolutePath
							}
							label={tUI("admin.itemForm.previewImage")}
							wrapperClassName='flex flex-col items-center bg-surface-hover/30 p-6 rounded-xl border border-dashed border-border'
							imageClassName='w-44 h-44 object-contain rounded-xl shadow-xl border-4 border-white dark:border-gray-800'
						/>

						<InputField
							label={
								tUI("admin.itemForm.imageUrlLabel")
							}
							name='assetAbsolutePath'
							value={formData.assetAbsolutePath || ""}
							onChange={handleInputChange}
							placeholder='/images/...'
						/>
						<InputField
							label={
								tUI("admin.itemForm.imageFullUrlLabel")
							}
							name='assetFullAbsolutePath'
							value={formData.assetFullAbsolutePath || ""}
							onChange={handleInputChange}
							placeholder='https://...'
						/>

						{/* LOGIC LỌC (FILTERING LOGIC) */}
						<div className='border border-border rounded-lg p-4 bg-page-bg space-y-4 shadow-sm mt-5'>
							<h3 className='text-md font-bold text-orange-500 border-b border-border pb-2'>
								Logic lọc (Filtering Logic)
							</h3>
							<div className='grid grid-cols-2 gap-4'>
								<div className="space-y-2">
									<InputField
										label='Phân loại Logic (type) - Cách nhau bằng dấu phẩy'
										name='type'
										value={Array.isArray(formData.logic?.type) ? formData.logic.type.join(", ") : formData.logic?.type || ""}
										onChange={(e) => {
											const val = e.target.value;
											setFormData(prev => ({
												...prev,
												logic: {
													...prev.logic,
													type: val.split(",").map(s => s.trim()).filter(Boolean)
												}
											}));
										}}
										placeholder='Equipment Items, Unit Items...'
									/>
									<div className="flex flex-wrap gap-1.5 mt-1">
										{["Spell Items", "Unit Items", "Champion Items", "Special Items", "Equipment Items", "Landmark Items", "General Items", "Relic Items"].map(t => (
											<button
												key={t}
												type="button"
												onClick={() => {
													const current = Array.isArray(formData.logic?.type) ? formData.logic.type : [];
													if (!current.includes(t)) {
														setFormData(prev => ({
															...prev,
															logic: {
																...prev.logic,
																type: [...current, t]
															}
														}));
													}
												}}
												className="px-2 py-0.5 text-[10px] bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 rounded border border-orange-500/20 transition-colors"
											>
												+ {t}
											</button>
										))}
									</div>
								</div>
								<div className="flex flex-col gap-1">
									<label className="text-sm font-semibold text-text-primary">Min/Max Cost</label>
									<div className="flex gap-2">
										<input
											name='minCost'
											type='number'
											value={formData.logic?.minCost ?? ""}
											onChange={handleLogicChange}
											placeholder="Min"
											className="w-full bg-surface-bg border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
										/>
										<input
											name='maxCost'
											type='number'
											value={formData.logic?.maxCost ?? ""}
											onChange={handleLogicChange}
											placeholder="Max"
											className="w-full bg-surface-bg border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
										/>
									</div>
								</div>
							</div>
							<InputField
								label='Từ khóa cấm (Cách nhau bằng dấu phẩy)'
								name='forbiddenKeywords'
								value={formData.logic?.forbiddenKeywords?.join(", ") || ""}
								onChange={handleKeywordsChange}
								placeholder='Challenger, Ephemeral...'
							/>
							<InputField
								label='Điều kiện khác'
								name='requiresOtherCondition'
								value={formData.logic?.requiresOtherCondition || ""}
								onChange={handleLogicChange}
								placeholder='VD: Damaging spell'
							/>
							<div className='grid grid-cols-1 gap-2'>
								<label className='flex items-center gap-2 cursor-pointer text-sm'>
									<input
										type='checkbox'
										name='requiresSubtype'
										checked={formData.logic?.requiresSubtype || false}
										onChange={handleLogicChange}
										className='w-4 h-4 rounded border-border text-blue-500 focus:ring-blue-500'
									/>
									Yêu cầu Subtype (Rồng, Elite...)
								</label>
								<label className='flex items-center gap-2 cursor-pointer text-sm'>
									<input
										type='checkbox'
										name='cannotBeChampion'
										checked={formData.logic?.cannotBeChampion || false}
										onChange={handleLogicChange}
										className='w-4 h-4 rounded border-border text-blue-500 focus:ring-blue-500'
									/>
									Không thể là Anh Hùng
								</label>
							</div>
						</div>
					</div>
				</div>
			</form>
		);
	},
);

export default ItemEditorForm;
