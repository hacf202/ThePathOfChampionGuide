import { useState, memo, useEffect } from "react";
import Button from "../../common/button";
import Modal from "../../common/modal";
import { PanelRightClose, PanelRightOpen, AlertTriangle } from "lucide-react";
import { useTranslation } from "../../../hooks/useTranslation";
import useUnsavedChanges from "../../../hooks/useUnsavedChanges";

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
		const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

		// Tích hợp Navigation Blocker
		const blocker = useUnsavedChanges(isDirty && !isSaving);

		const handleCancelClick = () => {
			onCancel(); //useBlocker sẽ tự động chặn và hiện Modal nếu isDirty
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
								{tUI("admin.common.unsavedChanges")}
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
							{tUI("admin.common.cancel")}
						</Button>

						{/* NÚT XÓA (Chỉ hiện khi đang sửa, không phải tạo mới) */}
						{!isNew && onDelete && (
							<Button
								type='button'
								variant='danger'
								onClick={() => setIsDeleteModalOpen(true)}
								disabled={isSaving}
							>
								{tUI("admin.common.delete")}
							</Button>
						)}

						{/* NÚT LƯU */}
						<Button
							type='submit'
							variant='primary'
							disabled={isSaving || disableSave}
						>
							{isSaving
								? tUI("admin.common.saving")
								: isNew
									? tUI("admin.common.create")
									: tUI("admin.common.saveChanges")}
						</Button>
					</div>
				</div>

				{/* MODAL XÁC NHẬN THAY ĐỔI CHƯA LƯU (Dùng chung cho mọi hành động rời trang) */}
				<Modal
					isOpen={blocker.state === "blocked"}
					onClose={() => blocker.reset()}
					title={tUI("admin.common.cancelConfirmTitle")}
				>
					<div className='p-2 text-text-secondary'>
						<div className="flex items-start gap-4 mb-6 bg-yellow-500/10 p-4 rounded-xl border border-yellow-500/20">
							<AlertTriangle className="text-yellow-500 shrink-0" size={24} />
							<div>
								<h4 className="font-bold text-text-primary mb-1">
									{tUI("admin.common.unsavedChanges")}
								</h4>
								<p className="text-sm leading-relaxed">
									{tUI("admin.common.cancelConfirmText")}
								</p>
							</div>
						</div>

						<div className='flex justify-end gap-3'>
							<Button
								onClick={() => blocker.reset()}
								variant='ghost'
							>
								{tUI("admin.common.stay")}
							</Button>
							<Button 
								onClick={() => blocker.proceed()} 
								variant='danger'
								className="shadow-lg shadow-red-500/20"
							>
								{tUI("admin.common.leave")}
							</Button>
						</div>
					</div>
				</Modal>

				{/* MODAL XÁC NHẬN XÓA */}
				{onDelete && (
					<Modal
						isOpen={isDeleteModalOpen}
						onClose={() => setIsDeleteModalOpen(false)}
						title={tUI("admin.common.deleteConfirmTitle")}
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
									{tUI("admin.common.cancel")}
								</Button>
								<Button
									onClick={() => {
										setIsDeleteModalOpen(false);
										onDelete();
									}}
									variant='danger'
								>
									{tUI("admin.common.delete")}
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
