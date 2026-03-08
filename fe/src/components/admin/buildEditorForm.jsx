// src/components/build/BuildEditorForm.jsx
import { useState, useEffect, memo } from "react";
import Button from "../common/button";

const ArrayInputComponent = ({ label, data = [], onChange }) => {
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
					className='px-3 py-1 text-xs font-semibold text-white bg-[var(--color-primary)] rounded hover:bg-[var(--color-primary-hover)] transition-colors'
				>
					+ Thêm
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
								placeholder='Tên...'
								className='flex-grow p-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none'
							/>
							<button
								onClick={() => handleRemoveItem(index)}
								type='button'
								className='text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] transition-colors'
							>
								<svg
									xmlns='http://www.w3.org/2000/svg'
									className='h-5 w-5'
									viewBox='0 0 20 20'
									fill='currentColor'
								>
									<path
										fillRule='evenodd'
										d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
										clipRule='evenodd'
									/>
								</svg>
							</button>
						</div>
					))
				) : (
					<p className='text-sm text-center text-[var(--color-text-secondary)] bg-[var(--color-background)] p-2 rounded-md'>
						Chưa có mục nào.
					</p>
				)}
			</div>
		</div>
	);
};

const BuildEditorForm = memo(
	({ build, onSave, onCancel, onDelete, isSaving, onConfirmExit }) => {
		const [formData, setFormData] = useState({
			id: "",
			championName: "",
			description: "",
			relicSet: [],
			powers: [],
			rune: [],
			star: 0,
			display: false,
			like: 0,
			views: 0,
			creator: "",
			sub: "",
			createdAt: "",
		});

		const [originalData, setOriginalData] = useState(null);

		useEffect(() => {
			if (build) {
				const initData = {
					id: build.id || "",
					championName: build.championName || "",
					description: build.description || "",
					relicSet: Array.isArray(build.relicSet) ? [...build.relicSet] : [],
					powers: Array.isArray(build.powers) ? [...build.powers] : [],
					rune: Array.isArray(build.rune) ? [...build.rune] : [],
					star: Number(build.star) || 0,
					display: build.display === true,
					like: Number(build.like) || 0,
					views: Number(build.views) || 0,
					creator: build.creator || "",
					sub: build.sub || "",
					createdAt: build.createdAt || "",
				};
				setFormData(initData);
				setOriginalData(initData);
			}
		}, [build]);

		const handleInputChange = e => {
			const { name, value, type, checked } = e.target;
			setFormData(prev => ({
				...prev,
				[name]:
					type === "checkbox"
						? checked
						: type === "number"
							? Number(value)
							: value,
			}));
		};

		const handleArrayChange = (field, newArray) => {
			setFormData(prev => ({ ...prev, [field]: newArray }));
		};

		const handleSave = () => {
			const cleaned = {
				...formData,
				relicSet: formData.relicSet.filter(Boolean),
				powers: formData.powers.filter(Boolean),
				rune: formData.rune.filter(Boolean),
			};
			onSave(cleaned);
		};

		// Kiểm tra có thay đổi không
		const hasChanges =
			originalData && JSON.stringify(formData) !== JSON.stringify(originalData);

		const handleExit = () => {
			if (hasChanges && onConfirmExit) {
				onConfirmExit();
			} else {
				onCancel();
			}
		};

		return (
			<div className=' mx-auto p-4 sm:p-6 bg-[var(--color-surface)] rounded-lg '>
				<div className='space-y-6'>
					{/* Các section giữ nguyên */}
					<div className='p-4 border border-[var(--color-border)] rounded-lg bg-[var(--color-background)]'>
						<div className='flex justify-between'>
							<h3 className='text-lg font-semibold text-[var(--color-text-link)]'>
								1. Thông tin cơ bản
							</h3>
							{/* Nút hành động – CHỈ HỦY + LƯU + XÓA */}
							<div className='flex gap-3'>
								<Button
									onClick={onConfirmExit}
									variant='outline'
									disabled={isSaving}
								>
									Hủy
								</Button>
								{onDelete && (
									<Button
										onClick={() => onDelete(build)}
										variant='danger'
										disabled={isSaving}
									>
										Xóa
									</Button>
								)}
								<Button onClick={handleSave} disabled={isSaving}>
									{isSaving ? "Đang lưu..." : "Lưu thay đổi"}
								</Button>
							</div>
						</div>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
							<div>
								<label className='block font-medium mb-1'>Tên tướng</label>
								<input
									type='text'
									name='championName'
									value={formData.championName}
									onChange={handleInputChange}
									className='w-full p-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md'
								/>
							</div>
							<div>
								<label className='block font-medium mb-1'>Sao</label>
								<input
									type='number'
									name='star'
									value={formData.star}
									onChange={handleInputChange}
									min='0'
									max='10'
									className='w-full p-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md'
								/>
							</div>
						</div>
						<div className='mt-4'>
							<label className='block font-medium mb-1'>Mô tả</label>
							<textarea
								name='description'
								value={formData.description}
								onChange={handleInputChange}
								rows={3}
								className='w-full p-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md resize-none'
							/>
						</div>
					</div>

					{/* Trang bị & Sức mạnh */}
					<div className='p-4 border border-[var(--color-border)] rounded-lg bg-[var(--color-background)]'>
						<h3 className='text-lg font-semibold text-[var(--color-text-link)] mb-4'>
							2. Trang bị & Sức mạnh
						</h3>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
							<ArrayInputComponent
								label='Cổ vật'
								data={formData.relicSet}
								onChange={data => handleArrayChange("relicSet", data)}
							/>
							<ArrayInputComponent
								label='Sức mạnh'
								data={formData.powers}
								onChange={data => handleArrayChange("powers", data)}
							/>
						</div>
					</div>

					{/* Ngọc */}
					<div className='p-4 border border-[var(--color-border)] rounded-lg bg-[var(--color-background)]'>
						<h3 className='text-lg font-semibold text-[var(--color-text-link)] mb-4'>
							3. Ngọc
						</h3>
						<ArrayInputComponent
							label='Ngọc'
							data={formData.rune}
							onChange={data => handleArrayChange("rune", data)}
						/>
					</div>

					{/* Hiển thị & Thống kê */}
					<div className='p-4 border border-[var(--color-border)] rounded-lg bg-[var(--color-background)]'>
						<h3 className='text-lg font-semibold text-[var(--color-text-link)] mb-4'>
							4. Hiển thị & Thống kê
						</h3>
						<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
							<div className='flex items-center gap-2'>
								<input
									type='checkbox'
									name='display'
									checked={formData.display}
									onChange={handleInputChange}
									className='w-5 h-5'
								/>
								<label>Hiển thị công khai</label>
							</div>
							<div>
								<label>Lượt thích</label>
								<input
									type='number'
									name='like'
									value={formData.like}
									onChange={handleInputChange}
									min='0'
									className='w-full p-2 mt-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md'
								/>
							</div>
							<div>
								<label>Lượt xem</label>
								<input
									type='number'
									name='views'
									value={formData.views}
									onChange={handleInputChange}
									min='0'
									className='w-full p-2 mt-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md'
								/>
							</div>
						</div>
					</div>

					{/* Thông tin hệ thống */}
					<div className='p-4 border border-[var(--color-border)] rounded-lg bg-[var(--color-background)] text-sm'>
						<h3 className='text-lg font-semibold text-[var(--color-text-link)] mb-4'>
							5. Thông tin hệ thống
						</h3>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-3 text-[var(--color-text-secondary)]'>
							<div>
								<strong>ID:</strong> {formData.id}
							</div>
							<div>
								<strong>Người tạo:</strong> {formData.creator}
							</div>
							<div>
								<strong>Sub:</strong> {formData.sub}
							</div>
							<div>
								<strong>Tạo lúc:</strong>{" "}
								{new Date(formData.createdAt).toLocaleString()}
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	},
);

export default BuildEditorForm;
