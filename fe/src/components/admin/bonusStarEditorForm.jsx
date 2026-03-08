// src/pages/admin/bonusStarEditorForm.jsx
import { useState, memo, useEffect } from "react";
import Button from "../common/button";
import InputField from "../common/inputField";
import Modal from "../common/modal";

const BonusStarEditorForm = memo(
	({ item, onSave, onCancel, onDelete, isSaving }) => {
		const [formData, setFormData] = useState({});
		const [initialData, setInitialData] = useState({});
		const [isDirty, setIsDirty] = useState(false);
		const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
		const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

		// Khởi tạo và deep clone dữ liệu để theo dõi thay đổi
		useEffect(() => {
			if (item) {
				setFormData(item);
				setInitialData(JSON.parse(JSON.stringify(item)));
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

		// 🟢 Hàm xử lý riêng cho dữ liệu Đa ngôn ngữ (Translations)
		const handleTranslationChange = (e, field, lang = "en") => {
			const { value } = e.target;
			setFormData(prev => ({
				...prev,
				translations: {
					...prev.translations,
					[lang]: {
						...(prev.translations?.[lang] || {}),
						[field]: value,
					},
				},
			}));
		};

		const handleSubmit = e => {
			e.preventDefault();
			if (!formData.bonusStarID?.trim()) return alert("Vui lòng nhập ID!");

			// Giữ nguyên toàn bộ formData bao gồm cả flag isNew
			// Backend sẽ dùng isNew để quyết định logic kiểm tra tồn tại ID
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
									? "Tạo Bonus Star Mới"
									: `Chỉnh sửa: ${formData.name}`}
							</h2>
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
								onClick={() =>
									isDirty ? setIsCancelModalOpen(true) : onCancel()
								}
								disabled={isSaving}
							>
								Hủy
							</Button>
							{!formData.isNew && (
								<Button
									type='button'
									variant='danger'
									onClick={() => setIsDeleteModalOpen(true)}
									disabled={isSaving}
								>
									Xóa
								</Button>
							)}
							<Button
								type='submit'
								variant='primary'
								disabled={isSaving || !formData.bonusStarID}
							>
								{isSaving
									? "Đang lưu..."
									: formData.isNew
										? "Tạo mới"
										: "Lưu thay đổi"}
							</Button>
						</div>
					</div>

					{/* Content Form */}
					<div className='grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 bg-surface-bg border border-border rounded-xl mx-4'>
						<div className='space-y-5'>
							{/* --- THÔNG TIN CƠ BẢN (TIẾNG VIỆT) --- */}
							<InputField
								label='Mã Bonus Star (ID duy nhất)'
								name='bonusStarID'
								value={formData.bonusStarID || ""}
								onChange={handleInputChange}
								required
								disabled={!formData.isNew} // Chặn sửa ID khi cập nhật để tránh sai lệch database
								placeholder='VD: star_power_01'
							/>
							<InputField
								label='Tên hiển thị'
								name='name'
								value={formData.name || ""}
								onChange={handleInputChange}
								required
								placeholder='Nhập tên sức mạnh bonus...'
							/>

							<div className='flex flex-col gap-1'>
								<label className='text-sm font-semibold text-text-primary'>
									Loại Node
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

							<div className='flex flex-col gap-1'>
								<label className='text-sm font-semibold text-text-primary'>
									Mô tả kỹ năng
								</label>
								<textarea
									name='description'
									value={formData.description || ""}
									onChange={handleInputChange}
									className='w-full p-4 rounded-lg border border-border bg-surface-bg text-text-primary min-h-[150px] outline-none focus:ring-2 focus:ring-primary-500 transition resize-none'
									placeholder='Nhập nội dung mô tả kỹ năng...'
								/>
							</div>

							{/* --- THÔNG TIN ĐA NGÔN NGỮ (TIẾNG ANH) --- */}
							<div className='pt-6 mt-6 border-t border-border space-y-5'>
								<h3 className='text-lg font-semibold text-text-primary mb-2'>
									Đa ngôn ngữ (Tiếng Anh)
								</h3>
								<InputField
									label='Tên hiển thị (Tiếng Anh)'
									name='name_en'
									value={formData.translations?.en?.name || ""}
									onChange={e => handleTranslationChange(e, "name", "en")}
									placeholder='VD: English Bonus Star Name...'
								/>
								<div className='flex flex-col gap-1'>
									<label className='text-sm font-semibold text-text-primary'>
										Mô tả kỹ năng (Tiếng Anh)
									</label>
									<textarea
										name='description_en'
										value={formData.translations?.en?.description || ""}
										onChange={e =>
											handleTranslationChange(e, "description", "en")
										}
										className='w-full p-4 rounded-lg border border-border bg-surface-bg text-text-primary min-h-[150px] outline-none focus:ring-2 focus:ring-primary-500 transition resize-none'
										placeholder='Nhập nội dung mô tả bằng Tiếng Anh...'
									/>
								</div>
							</div>
						</div>

						<div className='space-y-5'>
							<div className='flex flex-col items-center bg-surface-hover/30 p-6 rounded-xl border border-dashed border-border'>
								<p className='text-xs font-bold text-text-secondary mb-4 uppercase tracking-widest'>
									Preview Ảnh
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
								label='Đường dẫn Ảnh (URL)'
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
					title='Xác nhận Hủy'
				>
					<div className='p-4 text-text-secondary'>
						<p>Mọi thay đổi chưa lưu sẽ bị mất. Bạn chắc chắn muốn rời đi?</p>
						<div className='flex justify-end gap-3 mt-6'>
							<Button
								onClick={() => setIsCancelModalOpen(false)}
								variant='ghost'
							>
								Ở lại
							</Button>
							<Button onClick={handleConfirmCancel} variant='danger'>
								Rời đi
							</Button>
						</div>
					</div>
				</Modal>

				{/* Modal Xác nhận Xóa */}
				<Modal
					isOpen={isDeleteModalOpen}
					onClose={() => setIsDeleteModalOpen(false)}
					title='Xác nhận Xóa Vĩnh Viễn'
				>
					<div className='p-4 text-text-secondary'>
						<p>
							Bạn có chắc muốn xóa Bonus Star <strong>{formData.name}</strong>?
							Hành động này không thể hoàn tác.
						</p>
						<div className='flex justify-end gap-3 mt-6'>
							<Button
								onClick={() => setIsDeleteModalOpen(false)}
								variant='ghost'
							>
								Hủy
							</Button>
							<Button
								onClick={() => onDelete(formData.bonusStarID)}
								variant='danger'
							>
								Xác nhận Xóa
							</Button>
						</div>
					</div>
				</Modal>
			</>
		);
	},
);

export default BonusStarEditorForm;
