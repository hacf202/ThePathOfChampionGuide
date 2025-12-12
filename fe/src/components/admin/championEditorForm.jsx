// src/pages/admin/championEditorForm.jsx
import { useState, memo, useEffect } from "react";
import Button from "../common/button";
import InputField from "../common/inputField";
import Modal from "../common/modal";
import { XCircle, Plus, Link2 } from "lucide-react";

// (Giữ nguyên ArrayInputComponent không thay đổi)
const ArrayInputComponent = ({
	label,
	data = [],
	onChange,
	cachedData = {},
	placeholder = "Nhập tên hoặc kéo thả vào đây",
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

	const getItemData = name => cachedData[name] || {};

	const handleDrop = (e, index) => {
		e.preventDefault();
		e.stopPropagation();
		try {
			const dragged = JSON.parse(e.dataTransfer.getData("text/plain"));
			if (dragged.name) handleItemChange(index, dragged.name.trim());
		} catch (err) {
			console.warn("Drag data không hợp lệ");
		}
	};

	const handleDragOver = e => e.preventDefault();

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
				{data.length === 0 ? (
					<p className='text-center text-sm text-text-secondary py-4 bg-surface-hover/50 rounded-lg border border-dashed border-border'>
						Chưa có dữ liệu
					</p>
				) : (
					data.map((value, index) => {
						const safeValue = value || "";
						const item = getItemData(safeValue.trim());

						return (
							<div
								key={index}
								className='flex items-center gap-3 p-3 bg-surface-hover rounded-lg border border-border hover:border-primary-500 transition-all'
								onDrop={e => handleDrop(e, index)}
								onDragOver={handleDragOver}
							>
								<div className='relative group flex-shrink-0'>
									{item.assetAbsolutePath ? (
										<img
											src={item.assetAbsolutePath}
											alt={item.name}
											className='w-10 h-10 rounded object-contain bg-white border border-border'
										/>
									) : (
										<div className='w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center'>
											<span className='text-xs text-gray-500'>?</span>
										</div>
									)}
								</div>

								<InputField
									value={safeValue}
									onChange={e => handleItemChange(index, e.target.value)}
									placeholder={placeholder}
									className='flex-1'
								/>

								<button
									type='button'
									onClick={() => handleRemoveItem(index)}
									className='text-red-500 hover:text-red-600 transition'
									title='Xóa'
								>
									<XCircle size={20} />
								</button>
							</div>
						);
					})
				)}
			</div>
		</div>
	);
};

// ==========================================
// COMPONENT CHÍNH
// ==========================================
const ChampionEditorForm = memo(
	({ champion, cachedData, onSave, onCancel, onDelete, isSaving }) => {
		const [formData, setFormData] = useState({});
		const [initialData, setInitialData] = useState({});
		const [isDirty, setIsDirty] = useState(false);

		// Modal state
		const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
		const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

		// 1. LOAD DATA & DEEP CLONE
		useEffect(() => {
			if (champion) {
				const processedData = { ...champion };
				if (typeof processedData.description === "string") {
					processedData.description = processedData.description
						.replace(/\\\\n/g, "\n")
						.replace(/\\n/g, "\n");
				}

				// QUAN TRỌNG: Deep Clone để ngắt tham chiếu của các mảng/object con
				const deepClonedData = JSON.parse(JSON.stringify(processedData));

				setFormData(processedData);
				setInitialData(deepClonedData);
				setIsDirty(false);
			}
		}, [champion]);

		// 2. CHECK DIRTY
		useEffect(() => {
			const isChanged =
				JSON.stringify(formData) !== JSON.stringify(initialData);
			setIsDirty(isChanged);
		}, [formData, initialData]);

		// 3. BEFORE UNLOAD (Đóng Browser Tab)
		// Lưu ý: Chỉ hiện thông báo chuẩn của trình duyệt, không hiện Modal custom
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

		// Handlers
		const handleInputChange = e => {
			const { name, value } = e.target;
			setFormData(prev => ({ ...prev, [name]: value }));
		};

		const handleNumberChange = e => {
			const { name, value } = e.target;
			setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
		};

		const handleArrayChange = (field, newArray) => {
			setFormData(prev => ({ ...prev, [field]: newArray }));
		};

		const handleAssetChange = (index, field, value) => {
			setFormData(prev => {
				const newAssets = [...(prev.assets || [])];
				newAssets[index] = { ...newAssets[index], [field]: value };
				return { ...prev, assets: newAssets };
			});
		};

		const handleAddAsset = () => {
			setFormData(prev => ({
				...prev,
				assets: [
					...(prev.assets || []),
					{ fullAbsolutePath: "", gameAbsolutePath: "", avatar: "" },
				],
			}));
		};

		const handleRemoveAsset = index => {
			setFormData(prev => ({
				...prev,
				assets: prev.assets.filter((_, i) => i !== index),
			}));
		};

		const handleAttemptCancel = () => {
			if (isDirty) {
				setIsCancelModalOpen(true);
			} else {
				onCancel();
			}
		};

		const confirmCancel = () => {
			setIsCancelModalOpen(false);
			onCancel();
		};

		const handleAttemptDelete = () => setIsDeleteModalOpen(true);
		const confirmDelete = () => {
			setIsDeleteModalOpen(false);
			if (champion && !champion.isNew) {
				onDelete(champion.championID);
			}
		};

		const handleSubmit = e => {
			e.preventDefault();
			const cleanData = { ...formData };

			if (typeof cleanData.description === "string") {
				cleanData.description = cleanData.description.replace(/\n/g, "\\n");
			}

			const arrayFields = [
				"regions",
				"tag",
				"powerStars",
				"bonusStars",
				"adventurePowers",
				"defaultItems",
				"rune",
				"startingDeck",
			];
			for (let i = 1; i <= 6; i++) arrayFields.push(`defaultRelicsSet${i}`);

			arrayFields.forEach(field => {
				if (Array.isArray(cleanData[field])) {
					cleanData[field] = cleanData[field]
						.map(item => (typeof item === "string" ? item.trim() : item))
						.filter(item => item !== "");
				}
			});

			onSave(cleanData);
		};

		const dataLookup = {
			powers: Object.fromEntries(
				(cachedData.powers || []).map(p => [p.name, p])
			),
			relics: Object.fromEntries(
				(cachedData.relics || []).map(r => [r.name, r])
			),
			items: Object.fromEntries((cachedData.items || []).map(i => [i.name, i])),
			runes: Object.fromEntries((cachedData.runes || []).map(r => [r.name, r])),
		};

		return (
			<>
				<form onSubmit={handleSubmit} className='space-y-8'>
					<div className='flex justify-between border-border sticky top-0 bg-surface-bg z-20 py-2 border-b mb-4'>
						<div>
							<label className='block font-semibold text-text-primary text-xl'>
								{formData.isNew
									? "Tạo Tướng Mới"
									: `Chỉnh sửa: ${formData.name}`}
							</label>
							{isDirty && (
								<span className='text-xs text-yellow-500 font-medium'>
									● Có thay đổi chưa lưu
								</span>
							)}
						</div>
						<div className='flex items-center gap-3'>
							<Button
								type='button'
								variant='ghost'
								onClick={handleAttemptCancel}
							>
								Hủy
							</Button>
							{champion && !champion.isNew && (
								<Button
									type='button'
									variant='danger'
									onClick={handleAttemptDelete}
								>
									Xóa tướng
								</Button>
							)}
							<Button type='submit' variant='primary' disabled={isSaving}>
								{isSaving ? "Đang lưu..." : champion?.isNew ? "Tạo mới" : "Lưu"}
							</Button>
						</div>
					</div>

					{/* 1. INFO */}
					<div className='grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 bg-surface-bg border border-border rounded-xl'>
						<div className='space-y-5'>
							<InputField
								label='Champion ID (VD: C056)'
								name='championID'
								value={formData.championID || ""}
								onChange={handleInputChange}
								required
								disabled={!formData.isNew}
								placeholder='C056, C057,...'
							/>
							<InputField
								label='Tên tướng'
								name='name'
								value={formData.name || ""}
								onChange={handleInputChange}
								required
							/>
							<div className='grid grid-cols-2 gap-4'>
								<InputField
									label='Năng lượng'
									name='cost'
									type='number'
									value={formData.cost || ""}
									onChange={handleNumberChange}
									min='1'
									max='15'
								/>
								<InputField
									label='Sao tối đa'
									name='maxStar'
									type='number'
									value={formData.maxStar || ""}
									onChange={handleNumberChange}
									min='1'
									max='7'
								/>
							</div>
						</div>
						<div className='flex flex-col items-center justify-center'>
							<p className='text-sm font-medium text-text-secondary mb-3'>
								Avatar Preview
							</p>
							{formData.assets?.[0]?.avatar ? (
								<img
									src={formData.assets[0].avatar}
									alt='Avatar'
									className='w-48 h-48 object-contain rounded-xl border-4 border-primary-500/20 shadow-xl'
								/>
							) : (
								<div className='w-48 h-48 bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center text-6xl text-gray-400'>
									?
								</div>
							)}
						</div>
					</div>

					{/* 2. DESCRIPTION */}
					<div className='grid grid-cols-1 xl:grid-cols-3 gap-6'>
						<div className='xl:col-span-2 space-y-8'>
							<div>
								<label className='block font-semibold text-text-primary mb-3'>
									Mô tả chi tiết
								</label>
								<textarea
									name='description'
									value={formData.description || ""}
									onChange={handleInputChange}
									className='w-full p-4 rounded-lg border border-border bg-surface-bg text-text-primary placeholder:text-text-secondary focus:border-primary-500 resize-none font-mono text-sm'
									rows={10}
								/>
							</div>
							<ArrayInputComponent
								label='Vùng (Regions)'
								data={formData.regions || []}
								onChange={d => handleArrayChange("regions", d)}
								cachedData={cachedData.regions || {}}
							/>
							<ArrayInputComponent
								label='Tags'
								data={formData.tag || []}
								onChange={d => handleArrayChange("tag", d)}
								placeholder='Nhập tag...'
								cachedData={{}}
							/>
						</div>
						<div>
							<label className='block font-semibold text-text-primary mb-2'>
								Video giới thiệu
							</label>
							<InputField
								name='videoLink'
								value={formData.videoLink || ""}
								onChange={handleInputChange}
								placeholder='https://youtube...'
							/>
							{formData.videoLink && (
								<div className='mt-4 aspect-video rounded-xl overflow-hidden border border-border shadow-lg'>
									<iframe
										src={formData.videoLink}
										title='Video Preview'
										className='w-full h-full'
									/>
								</div>
							)}
						</div>
					</div>

					{/* 3. ASSETS */}
					<div>
						<h4 className='text-lg font-bold text-text-primary mb-4 flex items-center gap-2'>
							<Link2 size={20} /> Assets
						</h4>
						{formData.assets?.map((asset, index) => (
							<div
								key={index}
								className='flex items-center gap-4 p-4 bg-surface-hover rounded-lg border border-border mb-3'
							>
								<div className='grid grid-cols-3 gap-3 flex-1'>
									{["avatar", "fullAbsolutePath", "gameAbsolutePath"].map(
										field => (
											<div key={field}>
												<InputField
													label={field}
													value={asset[field] || ""}
													onChange={e =>
														handleAssetChange(index, field, e.target.value)
													}
												/>
												{asset[field] && (
													<img
														src={asset[field]}
														alt={field}
														className='mt-2 h-16 w-auto rounded object-contain bg-black/20'
														onError={e => (e.target.style.display = "none")}
													/>
												)}
											</div>
										)
									)}
								</div>
								{formData.assets.length > 1 && (
									<button
										type='button'
										onClick={() => handleRemoveAsset(index)}
										className='text-red-500 hover:text-red-700'
									>
										<XCircle size={22} />
									</button>
								)}
							</div>
						))}
						<Button type='button' variant='outline' onClick={handleAddAsset}>
							Thêm Asset
						</Button>
					</div>

					{/* 4. CONFIG */}
					<div className='space-y-6'>
						<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
							<ArrayInputComponent
								label='Chòm sao'
								data={formData.powerStars || []}
								onChange={d => handleArrayChange("powerStars", d)}
								cachedData={dataLookup.powers}
							/>
							<ArrayInputComponent
								label='Sức mạnh Phiêu lưu'
								data={formData.adventurePowers || []}
								onChange={d => handleArrayChange("adventurePowers", d)}
								cachedData={dataLookup.powers}
							/>
							<ArrayInputComponent
								label='Vật phẩm mặc định'
								data={formData.defaultItems || []}
								onChange={d => handleArrayChange("defaultItems", d)}
								cachedData={dataLookup.items}
							/>
						</div>
						<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
							{[1, 2, 3, 4, 5, 6].map(n => (
								<ArrayInputComponent
									key={n}
									label={`Bộ Cổ vật ${n}`}
									data={formData[`defaultRelicsSet${n}`] || []}
									onChange={d => handleArrayChange(`defaultRelicsSet${n}`, d)}
									cachedData={dataLookup.relics}
								/>
							))}
						</div>
						<ArrayInputComponent
							label='Ngọc (Runes)'
							data={formData.rune || []}
							onChange={d => handleArrayChange("rune", d)}
							cachedData={dataLookup.runes}
						/>
					</div>
				</form>

				{/* CONFIRM CANCEL MODAL */}
				<Modal
					isOpen={isCancelModalOpen}
					onClose={() => setIsCancelModalOpen(false)}
					title='Xác nhận Hủy'
				>
					<div className='text-text-secondary'>
						<p className='mb-6'>
							Bạn có thay đổi chưa lưu. Nếu rời đi bây giờ, mọi thay đổi sẽ bị
							mất.
						</p>
						<div className='flex justify-end gap-3'>
							<Button
								onClick={() => setIsCancelModalOpen(false)}
								variant='ghost'
							>
								Ở lại
							</Button>
							<Button onClick={confirmCancel} variant='danger'>
								Rời đi
							</Button>
						</div>
					</div>
				</Modal>

				{/* CONFIRM DELETE MODAL */}
				<Modal
					isOpen={isDeleteModalOpen}
					onClose={() => setIsDeleteModalOpen(false)}
					title='Xác nhận Xóa'
				>
					<div className='text-text-secondary'>
						<p className='mb-6'>
							Bạn có chắc chắn muốn xóa{" "}
							<strong className='text-text-primary'>{champion?.name}</strong>?
							Hành động này không thể hoàn tác.
						</p>
						<div className='flex justify-end gap-3'>
							<Button
								onClick={() => setIsDeleteModalOpen(false)}
								variant='ghost'
							>
								Hủy
							</Button>
							<Button onClick={confirmDelete} variant='danger'>
								Xóa Tướng
							</Button>
						</div>
					</div>
				</Modal>
			</>
		);
	}
);

export default ChampionEditorForm;
