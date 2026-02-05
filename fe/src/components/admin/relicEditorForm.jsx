// src/pages/admin/relicEditorForm.jsx (file mới)
import { useState, memo, useEffect } from "react";
import Button from "../common/button";
import InputField from "../common/inputField";
import Modal from "../common/modal";
import { XCircle } from "lucide-react";

const RelicEditorForm = memo(
	({ relic, onSave, onCancel, onDelete, isSaving }) => {
		const [formData, setFormData] = useState({});
		const [initialData, setInitialData] = useState({});
		const [isDirty, setIsDirty] = useState(false);

		const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
		const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

		// Load và deep clone data
		useEffect(() => {
			if (relic) {
				const deepCloned = JSON.parse(JSON.stringify(relic));
				setFormData(relic);
				setInitialData(deepCloned);
				setIsDirty(false);
			}
		}, [relic]);

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
			const parsedValue = name === "stack" ? parseInt(value) || 0 : value;
			setFormData(prev => ({ ...prev, [name]: parsedValue }));
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
			if (relic && relic.relicCode && !relic.isNew) {
				onDelete(relic.relicCode);
			}
		};

		const handleSubmit = e => {
			e.preventDefault();
			const cleanData = { ...formData };

			// XÓA isNew khỏi data gửi đi
			delete cleanData.isNew;

			onSave(cleanData);
		};

		return (
			<>
				<form onSubmit={handleSubmit} className='space-y-8'>
					{/* Header */}
					<div className='flex justify-between border-border sticky top-0 bg-surface-bg z-20 py-2 border-b mb-4'>
						<div>
							<label className='block font-semibold text-text-primary text-xl'>
								{formData.isNew
									? "Tạo Cổ Vật Mới"
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
									{isSaving ? "Đang xử lý..." : "Xóa cổ vật"}
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
								label='Mã cổ vật (VD: R001)'
								name='relicCode'
								value={formData.relicCode || ""}
								onChange={handleInputChange}
								required
								disabled={!formData.isNew}
								placeholder='R001, R002,...'
							/>
							<InputField
								label='Tên cổ vật'
								name='name'
								value={formData.name || ""}
								onChange={handleInputChange}
								required
							/>
							<InputField
								label='Độ hiếm'
								name='rarity'
								value={formData.rarity || ""}
								onChange={handleInputChange}
							/>
							<InputField
								label='Độ hiếm tham chiếu'
								name='rarityRef'
								value={formData.rarityRef || ""}
								onChange={handleInputChange}
							/>
							<InputField
								label='Stack'
								name='stack'
								type='number'
								value={formData.stack ?? ""}
								onChange={handleInputChange}
								min='1'
							/>
							<InputField
								label='Loại (Type)'
								name='type'
								value={formData.type || ""}
								onChange={handleInputChange}
							/>
						</div>

						<div className='space-y-5'>
							<div className='flex flex-col items-center'>
								<p className='text-sm font-medium text-text-secondary mb-3'>
									Preview Ảnh
								</p>
								{formData.assetAbsolutePath ? (
									<img
										src={formData.assetAbsolutePath}
										alt='Preview'
										className='w-48 h-48 object-contain rounded-xl border-4 border-primary-500/20 shadow-xl'
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
							/>
							<InputField
								label='Đường dẫn Ảnh đầy đủ'
								name='assetFullAbsolutePath'
								value={formData.assetFullAbsolutePath || ""}
								onChange={handleInputChange}
							/>
							<div>
								<label className='block font-semibold text-text-primary mb-2'>
									Mô tả
								</label>
								<textarea
									name='description'
									value={formData.description || ""}
									onChange={handleInputChange}
									className='w-full p-4 rounded-lg border border-border bg-surface-bg text-text-primary resize-none'
									rows={6}
								/>
							</div>
							<div>
								<label className='block font-semibold text-text-primary mb-2'>
									Mô tả thô (Raw)
								</label>
								<textarea
									name='descriptionRaw'
									value={formData.descriptionRaw || ""}
									onChange={handleInputChange}
									className='w-full p-4 rounded-lg border border-border bg-surface-bg text-text-primary resize-none'
									rows={6}
								/>
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
							Bạn có chắc chắn muốn xóa <strong>{relic?.name}</strong>? Hành
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
								Xóa cổ vật
							</Button>
						</div>
					</div>
				</Modal>
			</>
		);
	},
);

export default RelicEditorForm;
