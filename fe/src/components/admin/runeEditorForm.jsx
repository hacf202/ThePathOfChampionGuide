// src/pages/admin/runeEditorForm.jsx
import { useState, memo, useEffect } from "react";
import Button from "../common/button";
import InputField from "../common/inputField";
import Modal from "../common/modal";

const RuneEditorForm = memo(
	({ rune, onSave, onCancel, onDelete, isSaving }) => {
		const [formData, setFormData] = useState({});
		const [initialData, setInitialData] = useState({});
		const [isDirty, setIsDirty] = useState(false);

		const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
		const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

		// Khởi tạo và deep clone dữ liệu ban đầu để so sánh thay đổi
		useEffect(() => {
			if (rune) {
				const deepCloned = JSON.parse(JSON.stringify(rune));
				setFormData(rune);
				setInitialData(deepCloned);
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
			if (rune && rune.runeCode && !rune.isNew) {
				onDelete(rune.runeCode);
			}
		};

		const handleSubmit = e => {
			e.preventDefault();
			// Giữ nguyên formData (bao gồm cả flag isNew) để Backend kiểm tra ID tồn tại
			onSave(formData);
		};

		return (
			<>
				<form onSubmit={handleSubmit} className='space-y-8'>
					{/* Header Toolbar */}
					<div className='flex justify-between border-border sticky top-0 bg-surface-bg z-20 py-2 border-b mb-4 px-4 shadow-sm'>
						<div>
							<h2 className='block font-semibold text-text-primary text-xl'>
								{formData.isNew
									? "Tạo Ngọc Mới"
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
								onClick={handleAttemptCancel}
								disabled={isSaving}
							>
								Hủy
							</Button>
							{!formData.isNew && (
								<Button
									type='button'
									variant='danger'
									onClick={handleAttemptDelete}
									disabled={isSaving}
								>
									{isSaving ? "Đang xử lý..." : "Xóa ngọc"}
								</Button>
							)}
							<Button
								type='submit'
								variant='primary'
								disabled={isSaving || !formData.runeCode}
							>
								{isSaving
									? "Đang lưu..."
									: formData.isNew
										? "Tạo mới"
										: "Lưu thay đổi"}
							</Button>
						</div>
					</div>

					{/* Nội dung Form */}
					<div className='grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 bg-surface-bg border border-border rounded-xl mx-4'>
						<div className='space-y-5'>
							<InputField
								label='Mã ngọc (Duy nhất, VD: RU001)'
								name='runeCode'
								value={formData.runeCode || ""}
								onChange={handleInputChange}
								required
								disabled={!formData.isNew} // Khóa mã ID khi đang cập nhật để bảo vệ database
								placeholder='RU001, RU002,...'
							/>
							<InputField
								label='Tên ngọc'
								name='name'
								value={formData.name || ""}
								onChange={handleInputChange}
								required
								placeholder='Nhập tên hiển thị...'
							/>
							<InputField
								label='Độ hiếm'
								name='rarity'
								value={formData.rarity || ""}
								onChange={handleInputChange}
								placeholder='VD: Common, Rare, Epic...'
							/>
							<InputField
								label='Loại (Type)'
								name='type'
								value={formData.type || ""}
								onChange={handleInputChange}
								placeholder='VD: Buff, Combat...'
							/>
							<div>
								<label className='block font-semibold text-text-primary mb-2'>
									Mô tả kỹ năng
								</label>
								<textarea
									name='description'
									value={formData.description || ""}
									onChange={handleInputChange}
									className='w-full p-4 rounded-lg border border-border bg-surface-bg text-text-primary focus:ring-2 focus:ring-primary-500 outline-none transition resize-none'
									rows={6}
									placeholder='Mô tả chi tiết tác dụng của ngọc...'
								/>
							</div>
						</div>

						<div className='space-y-5'>
							<div className='flex flex-col items-center p-6 bg-surface-hover/30 rounded-xl border border-dashed border-border'>
								<p className='text-xs font-bold text-text-secondary mb-4 uppercase tracking-widest'>
									Xem trước hình ảnh
								</p>
								{formData.assetAbsolutePath ? (
									<img
										src={formData.assetAbsolutePath}
										alt='Preview'
										className='w-48 h-48 object-contain rounded-xl border-4 border-white dark:border-gray-800 shadow-xl'
										onError={e => {
											e.target.src =
												"https://via.placeholder.com/200?text=Error+Link";
										}}
									/>
								) : (
									<div className='w-48 h-48 bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center text-6xl text-gray-400'>
										?
									</div>
								)}
							</div>

							<InputField
								label='Đường dẫn Ảnh chính'
								name='assetAbsolutePath'
								value={formData.assetAbsolutePath || ""}
								onChange={handleInputChange}
								placeholder='https://...'
							/>
							<InputField
								label='Đường dẫn Ảnh đầy đủ'
								name='assetFullAbsolutePath'
								value={formData.assetFullAbsolutePath || ""}
								onChange={handleInputChange}
								placeholder='https://...'
							/>
							<div>
								<label className='block font-semibold text-text-primary mb-2'>
									Dữ liệu mô tả thô (Raw)
								</label>
								<textarea
									name='descriptionRaw'
									value={formData.descriptionRaw || ""}
									onChange={handleInputChange}
									className='w-full p-4 rounded-lg border border-border bg-surface-bg text-text-primary focus:ring-2 focus:ring-primary-500 outline-none transition font-mono text-sm'
									rows={6}
									placeholder='Dữ liệu mô tả gốc từ hệ thống...'
								/>
							</div>
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
						<p className='mb-6'>
							Bạn có thay đổi chưa lưu. Nếu rời đi, mọi thay đổi sẽ bị mất.
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

				{/* Modal Xác nhận Xóa */}
				<Modal
					isOpen={isDeleteModalOpen}
					onClose={() => setIsDeleteModalOpen(false)}
					title='Xác nhận Xóa Vĩnh Viễn'
				>
					<div className='p-4 text-text-secondary'>
						<p className='mb-6'>
							Bạn có chắc chắn muốn xóa ngọc <strong>{rune?.name}</strong>? Hành
							động này không thể hoàn tác.
						</p>
						<div className='flex justify-end gap-3'>
							<Button
								onClick={() => setIsDeleteModalOpen(false)}
								variant='ghost'
							>
								Hủy
							</Button>
							<Button onClick={confirmDelete} variant='danger'>
								Xác nhận Xóa
							</Button>
						</div>
					</div>
				</Modal>
			</>
		);
	},
);

export default RuneEditorForm;
