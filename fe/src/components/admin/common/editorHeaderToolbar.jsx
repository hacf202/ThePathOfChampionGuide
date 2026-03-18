import { useState, memo } from "react";
import Button from "../../common/button";
import Modal from "../../common/modal";
import { PanelRightClose, PanelRightOpen } from "lucide-react";
import { useTranslation } from "../../../hooks/useTranslation";

const EditorHeaderToolbar = memo(
	({
		title,
		isNew,
		isDirty,
		isSaving,
		onCancel, // Hàm chạy thực sự khi xác nhận Hủy
		onDelete, // Hàm chạy thực sự khi xác nhận Xóa
		itemName = "",
		disableSave = false,
		isSidebarOpen = false,
		onToggleSidebar = null, // Nếu truyền hàm này vào, nút đóng/mở sidebar mới xuất hiện
	}) => {
		const { tUI } = useTranslation();
		const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
		const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

		const handleCancelClick = () => {
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

		return (
			<>
				{/* THANH CÔNG CỤ (STICKY HEADER) */}
				<div className='flex justify-between items-center border-border sticky top-0 bg-surface-bg z-40 py-3 border-b shadow-sm px-6 rounded-t-lg mb-4'>
					<div>
						<h2 className='block font-semibold text-text-primary text-xl'>
							{title}
						</h2>
						{isDirty && (
							<span className='text-xs text-yellow-500 font-medium'>
								{tUI("admin.common.unsavedChanges") || "● Có thay đổi chưa lưu"}
							</span>
						)}
					</div>
					<div className='flex items-center gap-3'>
						{/* NÚT ĐÓNG/MỞ SIDEBAR */}
						{onToggleSidebar && (
							<Button
								type='button'
								variant='outline'
								onClick={onToggleSidebar}
								title={
									isSidebarOpen ? "Ẩn thanh kéo thả" : "Hiện thanh kéo thả"
								}
								className='mr-2'
							>
								{isSidebarOpen ? (
									<PanelRightClose size={18} />
								) : (
									<PanelRightOpen size={18} />
								)}
							</Button>
						)}

						{/* NÚT HỦY */}
						<Button
							type='button'
							variant='ghost'
							onClick={handleCancelClick}
							disabled={isSaving}
						>
							{tUI("admin.common.cancel") || "Hủy"}
						</Button>

						{/* NÚT XÓA (Chỉ hiện khi đang sửa, không phải tạo mới) */}
						{!isNew && onDelete && (
							<Button
								type='button'
								variant='danger'
								onClick={() => setIsDeleteModalOpen(true)}
								disabled={isSaving}
							>
								{tUI("admin.common.delete") || "Xóa"}
							</Button>
						)}

						{/* NÚT LƯU */}
						<Button
							type='submit'
							variant='primary'
							disabled={isSaving || disableSave}
						>
							{isSaving
								? tUI("admin.common.saving") || "Đang lưu..."
								: isNew
									? tUI("admin.common.create") || "Tạo mới"
									: tUI("admin.common.saveChanges") || "Lưu & Đồng bộ"}
						</Button>
					</div>
				</div>

				{/* MODAL XÁC NHẬN HỦY */}
				<Modal
					isOpen={isCancelModalOpen}
					onClose={() => setIsCancelModalOpen(false)}
					title={tUI("admin.common.cancelConfirmTitle") || "Xác nhận Hủy"}
				>
					<div className='p-4 text-text-secondary'>
						<p className='mb-6'>
							{tUI("admin.common.cancelConfirmText") ||
								"Bạn có thay đổi chưa lưu."}
						</p>
						<div className='flex justify-end gap-3'>
							<Button
								onClick={() => setIsCancelModalOpen(false)}
								variant='ghost'
							>
								{tUI("admin.common.stay") || "Ở lại"}
							</Button>
							<Button onClick={confirmCancel} variant='danger'>
								{tUI("admin.common.leave") || "Rời đi"}
							</Button>
						</div>
					</div>
				</Modal>

				{/* MODAL XÁC NHẬN XÓA */}
				{onDelete && (
					<Modal
						isOpen={isDeleteModalOpen}
						onClose={() => setIsDeleteModalOpen(false)}
						title={tUI("admin.common.deleteConfirmTitle") || "Xác nhận Xóa"}
					>
						<div className='p-4 text-text-secondary'>
							<p className='mb-6'>
								Xóa <strong>{itemName}</strong>? Hành động này không thể hoàn
								tác.
							</p>
							<div className='flex justify-end gap-3'>
								<Button
									onClick={() => setIsDeleteModalOpen(false)}
									variant='ghost'
								>
									{tUI("admin.common.cancel") || "Hủy"}
								</Button>
								<Button
									onClick={() => {
										setIsDeleteModalOpen(false);
										onDelete();
									}}
									variant='danger'
								>
									{tUI("admin.common.delete") || "Xác nhận Xóa"}
								</Button>
							</div>
						</div>
					</Modal>
				)}
			</>
		);
	},
);

export default EditorHeaderToolbar;
