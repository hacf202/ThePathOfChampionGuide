import { useState, useEffect, memo } from "react";
import { useTranslation } from "../../../hooks/useTranslation";
import EditorHeaderToolbar from "../common/editorHeaderToolbar";
import MarkupEditor from "../MarkupEditor";

const ArrayInputComponent = ({ label, data = [], onChange }) => {
	const { tUI } = useTranslation();

	const handleItemChange = (index, newValue) => {
		const newData = [...data];
		newData[index] = newValue.trim();
		onChange(newData.filter(Boolean));
	};

	const handleAddItem = () => {
		onChange([...data, ""]);
	};

	const handleRemoveItem = index => {
		onChange(data.filter((_, i) => i !== index));
	};

	return (
		<div className='flex flex-col'>
			<div className='flex justify-between items-center mb-2'>
				<label className='font-semibold text-[var(--color-text-secondary)]'>
					{label}:
				</label>
				<button
					onClick={handleAddItem}
					type='button'
					className='px-3 py-1 text-xs font-semibold text-white bg-[var(--color-primary)] rounded hover:bg-[var(--color-primary-hover)]'
				>
					+ {tUI("admin.common.add")}
				</button>
			</div>
			<div className='flex flex-col gap-2'>
				{data.length > 0 ? (
					data.map((item, index) => (
						<div key={index} className='flex items-center gap-2'>
							<span className='font-bold text-[var(--color-text-secondary)] w-6'>
								{index + 1}.
							</span>
							<input
								type='text'
								value={item}
								onChange={e => handleItemChange(index, e.target.value)}
								className='flex-1 p-2 bg-[var(--color-background)] border border-[var(--color-border)] rounded-md font-mono text-sm focus:outline-none focus:border-[var(--color-primary)]'
							/>
							<button
								type='button'
								onClick={() => handleRemoveItem(index)}
								className='p-2 text-red-500 hover:bg-red-500/10 rounded-md'
								title={tUI("admin.common.delete")}
							>
								X
							</button>
						</div>
					))
				) : (
					<p className='text-sm italic text-[var(--color-text-tertiary)] bg-[var(--color-background)] p-3 rounded-md border border-dashed border-[var(--color-border)]'>
						Không có mục nào.
					</p>
				)}
			</div>
		</div>
	);
};

const BuildEditorForm = ({ item, onSave, onDelete, onCancel, isSaving }) => {
	const { tUI } = useTranslation();
	const [formData, setFormData] = useState({});
	const [initialData, setInitialData] = useState({});
	const [isDirty, setIsDirty] = useState(false);

	// Khởi tạo và đồng bộ object đa ngôn ngữ
	useEffect(() => {
		if (item) {
			const clonedItem = JSON.parse(JSON.stringify(item));

			if (!clonedItem.translations) {
				clonedItem.translations = { en: { description: "" } };
			}
			if (!clonedItem.translations.en) {
				clonedItem.translations.en = { description: "" };
			}

			setFormData(clonedItem);
			setInitialData(JSON.parse(JSON.stringify(clonedItem)));
		}
	}, [item]);

	useEffect(() => {
		setIsDirty(JSON.stringify(formData) !== JSON.stringify(initialData));
	}, [formData, initialData]);

	const handleInputChange = e => {
		const { name, value, type, checked } = e.target;
		setFormData(prev => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
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
		const payload = { ...formData };
		if (!payload.translations?.en?.description) {
			delete payload.translations;
		}
		onSave(payload);
	};

	return (
		<form onSubmit={handleSubmit} className='space-y-6'>
			{/* ÁP DỤNG TOOLBAR QUẢN LÝ CHUNG */}
			<EditorHeaderToolbar
				title={`${tUI("admin.buildForm.editTitle")} ${formData.championName || ""}`}
				isNew={false} // Chỉnh sửa Build từ Admin chỉ là Edit, không có Create
				isDirty={isDirty}
				isSaving={isSaving}
				onCancel={onCancel}
				onDelete={() => onDelete(formData.id)}
				itemName={formData.championName}
			/>

			<div className='grid grid-cols-1 lg:grid-cols-2 gap-6 pb-24'>
				{/* Cột trái */}
				<div className='space-y-6'>
					<div className='p-5 border border-[var(--color-border)] rounded-xl bg-[var(--color-surface)] shadow-sm'>
						<h3 className='text-lg font-bold text-[var(--color-primary)] mb-4 border-b border-[var(--color-border)] pb-2'>
							{tUI("admin.buildForm.basicInfo")}
						</h3>
						<div className='space-y-4'>
							<div>
								<label className='font-semibold text-[var(--color-text-secondary)]'>
									{tUI("admin.buildForm.champion")}
								</label>
								<input
									type='text'
									name='championName'
									value={formData.championName || ""}
									onChange={handleInputChange}
									className='w-full p-2.5 mt-1 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg font-bold text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]'
									required
								/>
							</div>
							<div>
								<label className='font-semibold text-[var(--color-text-secondary)]'>
									{tUI("admin.buildForm.regions")}
								</label>
								<input
									type='text'
									value={formData.regions?.join(", ") || ""}
									onChange={e =>
										setFormData({
											...formData,
											regions: e.target.value.split(",").map(r => r.trim()),
										})
									}
									className='w-full p-2.5 mt-1 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]'
									placeholder='Demacia, Noxus...'
								/>
							</div>
							<div>
								<label className='font-semibold text-[var(--color-text-secondary)]'>
									{tUI("admin.buildForm.starLevel")}
								</label>
								<input
									type='number'
									name='star'
									value={formData.star || 0}
									onChange={handleInputChange}
									min='0'
									max='7'
									className='w-full p-2.5 mt-1 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]'
								/>
							</div>
							<div>
								<label className='font-semibold text-[var(--color-text-secondary)] mb-1 block'>
									{tUI("admin.buildForm.descLabel")} (VI)
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
								/>
							</div>
							<div>
								<label className='font-semibold text-[var(--color-text-secondary)] mb-1 block'>
									{tUI("admin.buildForm.descLabel")} (EN)
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
				</div>

				{/* Cột phải */}
				<div className='space-y-6'>
					<div className='p-5 border border-[var(--color-border)] rounded-xl bg-[var(--color-surface)] shadow-sm'>
						<h3 className='text-lg font-bold text-amber-500 mb-4 border-b border-[var(--color-border)] pb-2'>
							{tUI("admin.buildForm.equipment")}
						</h3>
						<div className='space-y-6'>
							<ArrayInputComponent
								label={tUI("admin.buildForm.relicsCode")}
								data={formData.relicSetIds || formData.relicSet || []}
								onChange={val => setFormData({ ...formData, relicSetIds: val })}
							/>
							<ArrayInputComponent
								label={tUI("admin.buildForm.powersCode")}
								data={formData.powerIds || formData.powers || []}
								onChange={val => setFormData({ ...formData, powerIds: val })}
							/>
							<ArrayInputComponent
								label={tUI("admin.buildForm.runesCode")}
								data={formData.runeIds || formData.rune || []}
								onChange={val => setFormData({ ...formData, runeIds: val })}
							/>
						</div>
					</div>

					<div className='p-5 border border-[var(--color-border)] rounded-xl bg-[var(--color-surface)] shadow-sm grid grid-cols-2 gap-4'>
						<div className='col-span-2'>
							<h3 className='text-lg font-bold text-emerald-500 mb-3 border-b border-[var(--color-border)] pb-2'>
								{tUI("admin.buildForm.displaySettings")}
							</h3>
							<div className='flex items-center gap-4'>
								<label className='flex items-center gap-2 cursor-pointer p-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-background)] flex-1'>
									<input
										type='radio'
										name='display'
										value='true'
										checked={
											formData.display === true || formData.display === "true"
										}
										onChange={() => setFormData({ ...formData, display: true })}
										className='w-4 h-4 text-emerald-500'
									/>
									<span className='font-medium text-[var(--color-text-primary)]'>
										{tUI("admin.buildForm.public")}
									</span>
								</label>
								<label className='flex items-center gap-2 cursor-pointer p-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-background)] flex-1'>
									<input
										type='radio'
										name='display'
										value='false'
										checked={
											formData.display === false || formData.display === "false"
										}
										onChange={() =>
											setFormData({ ...formData, display: false })
										}
										className='w-4 h-4 text-gray-500'
									/>
									<span className='font-medium text-[var(--color-text-primary)]'>
										{tUI("admin.buildForm.private")}
									</span>
								</label>
							</div>
						</div>

						<div className='col-span-2 mt-2'>
							<h3 className='text-lg font-bold text-blue-500 mb-3 border-b border-[var(--color-border)] pb-2'>
								{tUI("admin.buildForm.interactions")}
							</h3>
							<div className='grid grid-cols-2 gap-4'>
								<div>
									<label className='font-semibold text-[var(--color-text-secondary)]'>
										{tUI("admin.buildForm.likes")}
									</label>
									<input
										type='number'
										name='like'
										value={formData.like || 0}
										onChange={handleInputChange}
										min='0'
										className='w-full p-2.5 mt-1 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:outline-none focus:border-blue-500'
									/>
								</div>
								<div>
									<label className='font-semibold text-[var(--color-text-secondary)]'>
										{tUI("admin.buildForm.views")}
									</label>
									<input
										type='number'
										name='views'
										value={formData.views || 0}
										onChange={handleInputChange}
										min='0'
										className='w-full p-2.5 mt-1 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:outline-none focus:border-blue-500'
									/>
								</div>
							</div>
						</div>
					</div>

					{/* Thông tin hệ thống */}
					<div className='p-4 border border-[var(--color-border)] rounded-xl bg-[var(--color-background)] text-sm shadow-inner'>
						<h3 className='text-md font-bold text-[var(--color-text-tertiary)] mb-3 uppercase tracking-wider'>
							{tUI("admin.buildForm.systemInfo")}
						</h3>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-3 text-[var(--color-text-secondary)]'>
							<div className='truncate' title={formData.id}>
								<strong className='text-[var(--color-text-primary)]'>
									ID:
								</strong>{" "}
								{formData.id}
							</div>
							<div className='truncate' title={formData.creator}>
								<strong className='text-[var(--color-text-primary)]'>
									{tUI("admin.buildForm.creator")}:
								</strong>{" "}
								{formData.creator}
							</div>
							<div
								className='truncate col-span-1 md:col-span-2'
								title={formData.sub}
							>
								<strong className='text-[var(--color-text-primary)]'>
									Sub:
								</strong>{" "}
								{formData.sub}
							</div>
							<div>
								<strong className='text-[var(--color-text-primary)]'>
									{tUI("admin.buildForm.createdAt")}:
								</strong>{" "}
								{new Date(formData.createdAt).toLocaleString()}
							</div>
						</div>
					</div>
				</div>
			</div>
		</form>
	);
};

export default memo(BuildEditorForm);
