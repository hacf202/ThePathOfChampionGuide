import { memo } from "react";
import Modal from "./modal";
import Button from "./button";
import SidePanel from "./sidePanel";
import { Loader2 } from "lucide-react";

const EditorLayout = ({
	state,
	actions,
	renderForm,
	renderCard,
	filterConfigs = {}, // Object chứa options cho SidePanel
	placeholders = { search: "Tìm kiếm...", add: "Thêm mới" },
}) => {
	const {
		paginatedData,
		totalPages,
		currentPage,
		isLoading,
		error,
		viewMode,
		searchInput,
		selectedId,
		isSaving,
		notification,
		modals,
		itemToDelete,
		sortOrder,
	} = state;

	const selectedItem = state.data.find(i => i[state.idField] === selectedId);

	if (isLoading)
		return (
			<div className='flex flex-col items-center justify-center min-h-screen text-text-secondary'>
				<Loader2 className='animate-spin text-primary-500' size={48} />
				<div className='mt-4'>Đang tải...</div>
			</div>
		);
	if (error)
		return (
			<div className='text-center text-lg p-10 text-danger-text-dark'>
				{error}{" "}
				<Button onClick={actions.refresh} variant='primary' className='mt-4'>
					Thử lại
				</Button>
			</div>
		);

	return (
		<div className='font-secondary'>
			<div className='flex flex-col lg:flex-row gap-6'>
				{/* --- MAIN CONTENT --- */}
				<div className='lg:w-4/5 bg-surface-bg rounded-lg border border-border p-4 sm:p-6'>
					{viewMode === "list" ? (
						<>
							{paginatedData.length > 0 ? (
								<div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
									{paginatedData.map(item => renderCard(item))}
								</div>
							) : (
								<div className='flex items-center justify-center h-[300px] text-text-secondary'>
									Không tìm thấy dữ liệu.
								</div>
							)}
							{/* Pagination */}
							{totalPages > 1 && (
								<div className='mt-8 flex justify-center items-center gap-4'>
									<Button
										onClick={() => actions.setCurrentPage(c => c - 1)}
										disabled={currentPage === 1}
										variant='outline'
									>
										Trước
									</Button>
									<span className='font-medium'>
										{currentPage} / {totalPages}
									</span>
									<Button
										onClick={() => actions.setCurrentPage(c => c + 1)}
										disabled={currentPage === totalPages}
										variant='outline'
									>
										Sau
									</Button>
								</div>
							)}
						</>
					) : (
						// Render Form thông qua props function
						renderForm(selectedItem)
					)}
				</div>

				{/* --- SIDE PANEL --- */}
				<div className='lg:w-1/5'>
					<SidePanel
						searchPlaceholder={placeholders.search}
						addLabel={placeholders.add}
						searchInput={searchInput}
						onSearchInputChange={e => actions.setSearchInput(e.target.value)}
						onSearch={actions.handleSearch}
						onClearSearch={actions.handleClearSearch}
						onAddNew={actions.handleAddNew}
						onResetFilters={actions.handleResetFilters}
						sortOptions={[
							{ value: "name-asc", label: "Tên A-Z" },
							{ value: "name-desc", label: "Tên Z-A" },
						]}
						sortSelectedValue={sortOrder}
						onSortChange={actions.setSortOrder}
						// Truyền config filter động
						multiFilterConfigs={filterConfigs.multiFilters || []}
					/>
				</div>
			</div>

			{/* --- MODALS --- */}
			<Modal
				isOpen={modals.close}
				onClose={() => actions.setModals(p => ({ ...p, close: false }))}
				title='Xác nhận đóng'
			>
				<div className='text-text-secondary'>
					<p className='mb-6'>
						Bạn có thay đổi chưa lưu. Bạn có chắc muốn đóng không?
					</p>
					<div className='flex justify-end gap-3'>
						<Button
							onClick={() => actions.setModals(p => ({ ...p, close: false }))}
							variant='ghost'
						>
							Hủy
						</Button>
						<Button onClick={actions.handleConfirmClose} variant='primary'>
							Xác nhận
						</Button>
					</div>
				</div>
			</Modal>
			<Modal
				isOpen={modals.delete}
				onClose={() => actions.setModals(p => ({ ...p, delete: false }))}
				title='Xóa dữ liệu'
			>
				<div className='text-text-secondary'>
					<p className='mb-6'>
						Bạn muốn xóa <strong>{itemToDelete?.name}</strong>? Hành động này
						không thể hoàn tác.
					</p>
					<div className='flex justify-end gap-3'>
						<Button
							onClick={() => actions.setModals(p => ({ ...p, delete: false }))}
							variant='ghost'
						>
							Hủy
						</Button>
						<Button onClick={actions.handleDelete} variant='danger'>
							Xóa
						</Button>
					</div>
				</div>
			</Modal>
			<Modal
				isOpen={notification.isOpen}
				onClose={() => actions.setNotification(p => ({ ...p, isOpen: false }))}
				title={notification.title}
			>
				<div className='text-text-secondary'>
					<p className='mb-6'>{notification.message}</p>
					<div className='flex justify-end'>
						<Button
							onClick={() =>
								actions.setNotification(p => ({ ...p, isOpen: false }))
							}
							variant='primary'
						>
							Đã hiểu
						</Button>
					</div>
				</div>
			</Modal>
		</div>
	);
};
export default memo(EditorLayout);
