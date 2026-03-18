import { useState, memo } from "react";
import { XCircle } from "lucide-react";

const DragDropArrayInput = memo(
	({
		label,
		data = [], // Mảng chứa các chuỗi ID (Ví dụ: ['P001', 'I005'])
		onChange, // Hàm callback: (newDataArray) => void
		cachedData = {}, // Object dùng để lookup
		placeholder = "Kéo thả mục từ danh sách vào đây...",
	}) => {
		const [isDragOver, setIsDragOver] = useState(false);

		const handleDragOver = e => {
			e.preventDefault(); // Cần thiết để cho phép Drop
			setIsDragOver(true);
		};

		const handleDragLeave = e => {
			e.preventDefault();
			setIsDragOver(false);
		};

		const handleDrop = e => {
			e.preventDefault();
			setIsDragOver(false);

			// Lấy dữ liệu dạng text được truyền từ Sidebar khi bắt đầu Drag
			let droppedData = e.dataTransfer.getData("text/plain");
			let finalId = droppedData;

			// 🟢 SỬA LỖI TẠI ĐÂY: Xử lý bóc tách JSON nếu dropSidePanel gửi nguyên cục JSON
			if (droppedData) {
				try {
					const parsed = JSON.parse(droppedData);
					// Nếu parse thành công và có chứa key "id", lấy id đó làm kết quả cuối
					if (parsed && parsed.id) {
						finalId = parsed.id;
					}
				} catch (err) {
					// Nếu bị lỗi (tức là text thuần, không phải JSON), thì giữ nguyên finalId
				}
			}

			// Kiểm tra nếu có ID và ID chưa tồn tại trong mảng hiện tại thì mới thêm
			if (finalId && finalId.trim() !== "" && !data.includes(finalId)) {
				onChange([...data, finalId]);
			}
		};

		const handleRemoveItem = indexToRemove => {
			onChange(data.filter((_, index) => index !== indexToRemove));
		};

		return (
			<div className='flex flex-col gap-3'>
				<div className='flex justify-between items-center'>
					<label className='font-semibold text-text-primary text-sm'>
						{label}
					</label>
				</div>

				{/* VÙNG CHỨA DROP-ZONE */}
				<div
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}
					className={`flex flex-col gap-2 p-4 rounded-xl border-2 transition-all duration-200 min-h-[120px] 
					${
						isDragOver
							? "border-primary-500 bg-primary-500/10 border-dashed"
							: "border-border bg-surface-hover/30 border-dashed"
					}`}
				>
					{data.length > 0 ? (
						data.map((id, index) => {
							// Tra cứu thông tin từ cachedData
							const info = cachedData[id] || {};
							const displayName =
								info.name || info.itemCode || info.powerCode || id;
							const imgUrl =
								info.avatar ||
								info.assetAbsolutePath ||
								info.assetFullAbsolutePath ||
								"";

							return (
								<div
									key={`${id}-${index}`}
									className='flex items-center gap-3 p-2 bg-surface-bg border border-border rounded-lg shadow-sm group hover:border-primary-500 transition-colors'
								>
									{/* Số thứ tự */}
									<span className='font-bold text-text-secondary w-5 text-center text-sm'>
										{index + 1}.
									</span>

									{/* Icon Ảnh (Nếu có) */}
									{imgUrl ? (
										<img
											src={imgUrl}
											alt={displayName}
											className='w-8 h-8 rounded-md object-contain bg-black/20 border border-border'
										/>
									) : (
										<div className='w-8 h-8 rounded-md bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs text-gray-400'>
											?
										</div>
									)}

									{/* Tên hiển thị (Tên thật hoặc ID) */}
									<span className='flex-1 text-sm font-medium text-text-primary truncate'>
										{displayName}
									</span>

									{/* Nút Xóa */}
									<button
										type='button'
										onClick={() => handleRemoveItem(index)}
										className='p-1.5 text-red-500 hover:bg-red-500/10 rounded-md transition-colors opacity-70 hover:opacity-100'
										title='Xóa'
									>
										<XCircle size={18} />
									</button>
								</div>
							);
						})
					) : (
						<div className='flex flex-col items-center justify-center h-full text-text-tertiary italic text-sm'>
							{placeholder}
						</div>
					)}
				</div>
			</div>
		);
	},
);

export default DragDropArrayInput;
