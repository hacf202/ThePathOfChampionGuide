// src/pages/admin/powerEditorForm.jsx
import { useState, memo, useEffect } from "react";
import Button from "../common/button";
import InputField from "../common/inputField";
import Modal from "../common/modal";
import { XCircle, Plus } from "lucide-react";

/**
 * Component hỗ trợ nhập mảng (Dùng cho field 'type')
 */
const ArrayInputComponent = ({
	label,
	data = [],
	onChange,
	placeholder = "Nhập giá trị...",
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
					data.map((value, index) => (
						<div
							key={index}
							className='flex items-center gap-3 p-3 bg-surface-hover rounded-lg border border-border'
						>
							<InputField
								value={value || ""}
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
					))
				)}
			</div>
		</div>
	);
};

const PowerEditorForm = memo(
	({ power, onSave, onCancel, onDelete, isSaving }) => {
		const [formData, setFormData] = useState({});
		const [initialData, setInitialData] = useState({});
		const [isDirty, setIsDirty] = useState(false);

		const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
		const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

		// Khởi tạo và Deep Clone dữ liệu để so sánh thay đổi
		useEffect(() => {
			if (power) {
				const deepCloned = JSON.parse(JSON.stringify(power));
				setFormData(power);
				setInitialData(deepCloned);
				setIsDirty(false);
			}
		}, [power]);

		// Kiểm tra xem dữ liệu có bị thay đổi (Dirty check) không
		useEffect(() => {
			const isChanged =
				JSON.stringify(formData) !== JSON.stringify(initialData);
			setIsDirty(isChanged);
		}, [formData, initialData]);

		// Chặn trình duyệt đóng tab nếu có thay đổi chưa lưu
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

		const handleArrayChange = (field, newArray) => {
			setFormData(prev => ({ ...prev, [field]: newArray }));
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
			if (power && power.powerCode && !power.isNew) {
				onDelete(power.powerCode);
			}
		};

		const handleSubmit = e => {
			e.preventDefault();
			const cleanData = { ...formData };

			// Chỉnh sửa mảng Type: xóa khoảng trắng và lọc bỏ item rỗng
			if (Array.isArray(cleanData.type)) {
				cleanData.type = cleanData.type
					.map(item => item.trim())
					.filter(item => item !== "");
			}

			// Gửi dữ liệu đi (isNew sẽ được Backend dùng để kiểm tra tồn tại ID)
			onSave(cleanData);
		};

		return (
			<>
				<form onSubmit={handleSubmit} className='space-y-8'>
					{/* Header Toolbar */}
					<div className='flex justify-between border-border sticky top-0 bg-surface-bg z-20 py-2 border-b mb-4'>
						<div>
							<h2 className='block font-semibold text-text-primary text-xl'>
								{formData.isNew
									? "Tạo Sức Mạnh Mới"
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
									Xóa sức mạnh
								</Button>
							)}
							<Button
								type='submit'
								variant='primary'
								disabled={isSaving || !formData.powerCode}
							>
								{isSaving
									? "Đang xử lý..."
									: formData.isNew
										? "Tạo mới"
										: "Lưu thay đổi"}
							</Button>
						</div>
					</div>

					{/* Nội dung Form */}
					<div className='grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 bg-surface-bg border border-border rounded-xl'>
						<div className='space-y-5'>
							<InputField
								label='Mã sức mạnh (Duy nhất, VD: P001)'
								name='powerCode'
								value={formData.powerCode || ""}
								onChange={handleInputChange}
								required
								disabled={!formData.isNew} // Không cho sửa ID khi cập nhật
								placeholder='Nhập ID sức mạnh...'
							/>
							<InputField
								label='Tên sức mạnh'
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
								placeholder='VD: Common, Rare, Epic, Legendary...'
							/>
							<div>
								<label className='block font-semibold text-text-primary mb-2'>
									Mô tả hiển thị
								</label>
								<textarea
									name='description'
									value={formData.description || ""}
									onChange={handleInputChange}
									className='w-full p-4 rounded-lg border border-border bg-surface-bg text-text-primary focus:ring-2 focus:ring-primary-500 outline-none transition resize-none'
									rows={6}
									placeholder='Mô tả chi tiết sức mạnh...'
								/>
							</div>
						</div>

						<div className='space-y-5'>
							<div className='flex flex-col items-center p-4 bg-surface-hover rounded-xl border border-border border-dashed'>
								<p className='text-sm font-medium text-text-secondary mb-3'>
									Xem trước hình ảnh
								</p>
								{formData.assetAbsolutePath ? (
									<img
										src={formData.assetAbsolutePath}
										alt='Preview'
										className='w-48 h-48 object-contain rounded-xl border-4 border-white dark:border-gray-800 shadow-lg'
										onError={e => {
											e.target.src =
												"https://via.placeholder.com/200?text=Error+Link";
										}}
									/>
								) : (
									<div className='w-48 h-48 bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center text-4xl text-gray-400'>
										?
									</div>
								)}
							</div>

							<InputField
								label='Đường dẫn Ảnh (Asset Path)'
								name='assetAbsolutePath'
								value={formData.assetAbsolutePath || ""}
								onChange={handleInputChange}
								placeholder='https://...'
							/>

							<ArrayInputComponent
								label='Loại sức mạnh (Tags)'
								data={formData.type || []}
								onChange={d => handleArrayChange("type", d)}
								placeholder='VD: Buff, Round Start, Attack...'
							/>

							<div>
								<label className='block font-semibold text-text-primary mb-2'>
									Mô tả thô (Raw Description)
								</label>
								<textarea
									name='descriptionRaw'
									value={formData.descriptionRaw || ""}
									onChange={handleInputChange}
									className='w-full p-4 rounded-lg border border-border bg-surface-bg text-text-primary focus:ring-2 focus:ring-primary-500 outline-none transition font-mono text-sm'
									rows={4}
									placeholder='Dữ liệu mô tả thô từ hệ thống...'
								/>
							</div>
						</div>
					</div>
				</form>

				{/* Modal Xác nhận Hủy */}
				<Modal
					isOpen={isCancelModalOpen}
					onClose={() => setIsCancelModalOpen(false)}
					title='Bạn có chắc muốn hủy?'
				>
					<div className='text-text-secondary'>
						<p className='mb-6'>
							Các thay đổi bạn vừa thực hiện sẽ không được lưu lại.
						</p>
						<div className='flex justify-end gap-3'>
							<Button
								onClick={() => setIsCancelModalOpen(false)}
								variant='ghost'
							>
								Tiếp tục chỉnh sửa
							</Button>
							<Button onClick={confirmCancel} variant='danger'>
								Hủy bỏ thay đổi
							</Button>
						</div>
					</div>
				</Modal>

				{/* Modal Xác nhận Xóa */}
				<Modal
					isOpen={isDeleteModalOpen}
					onClose={() => setIsDeleteModalOpen(false)}
					title='Xác nhận xóa vĩnh viễn'
				>
					<div className='text-text-secondary'>
						<p className='mb-6'>
							Bạn đang thực hiện xóa sức mạnh <strong>{power?.name}</strong>.
							Hành động này không thể hoàn tác.
						</p>
						<div className='flex justify-end gap-3'>
							<Button
								onClick={() => setIsDeleteModalOpen(false)}
								variant='ghost'
							>
								Đóng
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

export default PowerEditorForm;
