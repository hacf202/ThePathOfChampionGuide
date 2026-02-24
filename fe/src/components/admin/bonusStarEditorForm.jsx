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

		// Load và deep clone data
		useEffect(() => {
			if (item) {
				const deepCloned = JSON.parse(JSON.stringify(item));
				setFormData(item);
				setInitialData(deepCloned);
				setIsDirty(false);
			}
		}, [item]);

		// Kiểm tra dirty
		useEffect(() => {
			const isChanged =
				JSON.stringify(formData) !== JSON.stringify(initialData);
			setIsDirty(isChanged);
		}, [formData, initialData]);

		// Cảnh báo khi rời tab nếu có thay đổi chưa lưu
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
			if (item && item.bonusStarID && !item.isNew) {
				onDelete(item.bonusStarID);
			}
		};

		const handleSubmit = e => {
			e.preventDefault();
			const cleanData = { ...formData };
			delete cleanData.isNew;
			onSave(cleanData);
		};

		return (
			<>
				<form onSubmit={handleSubmit} className='space-y-8'>
					{/* Header */}
					<div className='flex justify-between border-border sticky top-0 bg-surface-bg z-20 py-2 border-b mb-4 shadow-sm'>
						<div>
							<label className='block font-semibold text-text-primary text-xl'>
								{formData.isNew
									? "Tạo Bonus Star Mới"
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
									{isSaving ? "Đang xử lý..." : "Xóa Bonus Star"}
								</Button>
							)}
							<Button type='submit' variant='primary' disabled={isSaving}>
								{isSaving ? "Đang lưu..." : formData.isNew ? "Tạo mới" : "Lưu"}
							</Button>
						</div>
					</div>

					{/* Form nội dung */}
					<div className='grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 bg-surface-bg border border-border rounded-xl'>
						<div className='space-y-5'>
							<InputField
								label='Mã Bonus Star (ID)'
								name='bonusStarID'
								value={formData.bonusStarID || ""}
								onChange={handleInputChange}
								required
								disabled={!formData.isNew}
								placeholder='VD: yasuo_star_3'
							/>
							<InputField
								label='Tên hiển thị'
								name='name'
								value={formData.name || ""}
								onChange={handleInputChange}
								required
							/>
							<div className='flex flex-col gap-1'>
								<label className='text-sm font-semibold text-text-primary'>
									Loại Node (nodeType)
								</label>
								<select
									name='nodeType'
									value={formData.nodeType || "bonusStar"}
									onChange={handleInputChange}
									className='w-full p-2.5 rounded-lg border border-border bg-surface-bg text-text-primary outline-none focus:border-primary-500'
								>
									<option value='bonusStar'>Bonus Star</option>
									<option value='bonusStarGem'>Bonus Gem</option>
								</select>
							</div>
							<div>
								<label className='block font-semibold text-text-primary mb-2'>
									Mô tả kỹ năng
								</label>
								<textarea
									name='description'
									value={formData.description || ""}
									onChange={handleInputChange}
									className='w-full p-4 rounded-lg border border-border bg-surface-bg text-text-primary resize-none h-48 focus:border-primary-500 outline-none'
									rows={6}
									placeholder='Nhập mô tả chi tiết...'
								/>
							</div>
						</div>

						<div className='space-y-5'>
							<div className='flex flex-col items-center bg-surface-hover/50 p-4 rounded-xl border border-dashed border-border'>
								<p className='text-sm font-bold text-text-secondary mb-3 uppercase tracking-widest'>
									Preview Ảnh
								</p>
								{formData.image ? (
									<img
										src={formData.image}
										alt='Preview'
										className='w-48 h-48 object-contain rounded-xl border-4 border-primary-500/20 shadow-2xl'
									/>
								) : (
									<div className='w-48 h-48 bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center text-6xl text-gray-400'>
										?
									</div>
								)}
							</div>

							<InputField
								label='Đường dẫn Ảnh (URL)'
								name='image'
								value={formData.image || ""}
								onChange={handleInputChange}
								placeholder='Nhập link ảnh tài nguyên...'
							/>

							<div className='p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg'>
								<h4 className='text-xs font-bold text-blue-500 uppercase mb-2'>
									Ghi chú:
								</h4>
								<p className='text-xs text-text-secondary leading-relaxed'>
									Dữ liệu này sẽ được dùng để hiển thị trong các bản đồ chòm sao
									và danh sách kéo thả tài nguyên của Admin. Hãy đảm bảo tên
									khớp với dữ liệu game.
								</p>
							</div>
						</div>
					</div>
				</form>

				{/* Modal Hủy */}
				<Modal
					isOpen={isCancelModalOpen}
					onClose={() => setIsCancelModalOpen(false)}
					title='Xác nhận Hủy'
				>
					<div className='text-text-secondary'>
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

				{/* Modal Xóa */}
				<Modal
					isOpen={isDeleteModalOpen}
					onClose={() => setIsDeleteModalOpen(false)}
					title='Xác nhận Xóa'
				>
					<div className='text-text-secondary'>
						<p className='mb-6'>
							Bạn có chắc chắn muốn xóa <strong>{formData.name}</strong>? Hành
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
								Xóa Bonus Star
							</Button>
						</div>
					</div>
				</Modal>
			</>
		);
	},
);

export default BonusStarEditorForm;
