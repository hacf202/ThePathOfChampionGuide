// src/components/editor/editorLayout.jsx
import { memo } from "react";
import Modal from "./modal";
import Button from "./button";
import SidePanel from "./sidePanel";
import { Loader2 } from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation"; // 🟢 Import Hook

const EditorLayout = ({
	state,
	actions,
	renderForm,
	renderCard,
	filterConfigs = {},
	placeholders,
}) => {
	const { tUI, tDynamic } = useTranslation(); // 🟢 Khởi tạo Hook

	// Xử lý Placeholders đa ngôn ngữ bằng tUI
	const currentPlaceholders = placeholders || {
		search: tUI("common.searchPlaceholder"),
		add: tUI("common.addNew"),
	};

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
			<div className='flex flex-col items-center justify-center min-h-screen bg-main-bg text-text-primary'>
				<Loader2 className='w-12 h-12 animate-spin text-primary-500 mb-4' />
				<p className='text-lg font-medium'>{tUI("common.loading")}</p>
			</div>
		);

	if (error)
		return (
			<div className='flex items-center justify-center min-h-screen bg-main-bg text-red-500 p-4 text-center'>
				<div className='max-w-md p-6 bg-surface-bg rounded-lg border border-red-500/20 shadow-xl'>
					<h2 className='text-xl font-bold mb-2'>
						{tUI("common.error")}
					</h2>
					<p>{error}</p>
				</div>
			</div>
		);

	return (
		<div className='flex h-screen bg-main-bg overflow-hidden relative font-primary'>
			{/* Side Panel (Trái) */}
			<div className='w-80 flex-shrink-0 border-r border-border bg-surface-bg z-10'>
				<SidePanel
					data={state.data}
					searchInput={searchInput}
					onSearchChange={actions.handleSearchChange}
					onAddClick={actions.handleAddClick}
					renderCard={renderCard}
					idField={state.idField}
					selectedId={selectedId}
					placeholder={currentPlaceholders.search}
					addLabel={currentPlaceholders.add}
					filterConfigs={filterConfigs}
					currentFilters={state.filters}
					onFilterChange={actions.handleFilterChange}
					sortOrder={sortOrder}
					onSortChange={actions.handleSortChange}
				/>
			</div>

			{/* Form Content (Phải) */}
			<div className='flex-grow overflow-y-auto bg-main-bg custom-scrollbar relative'>
				{viewMode === "edit" || viewMode === "add" ? (
					<div className='max-w-5xl mx-auto p-8'>
						<div className='flex justify-between items-center mb-8 pb-4 border-b border-border'>
							<h2 className='text-2xl font-bold text-text-primary flex items-center gap-3'>
								<span className='w-2 h-8 bg-primary-500 rounded-full'></span>
								{viewMode === "edit"
									? tUI("common.editTitle")
									: tUI("common.addTitle")}
							</h2>
							<div className='flex gap-4'>
								{viewMode === "edit" && (
									<Button
										onClick={() =>
											actions.setModals(p => ({ ...p, delete: true }))
										}
										variant='danger'
										className='px-6'
									>
										{tUI("common.delete")}
									</Button>
								)}
								<Button
									onClick={actions.handleSave}
									disabled={isSaving}
									variant='primary'
									className='px-8 min-w-[120px]'
								>
									{isSaving ? (
										<Loader2 className='w-5 h-5 animate-spin mx-auto' />
									) : (
										tUI("common.save")
									)}
								</Button>
							</div>
						</div>
						<div className='bg-surface-bg rounded-xl p-8 border border-border shadow-sm'>
							{renderForm(selectedItem || {})}
						</div>
					</div>
				) : (
					<div className='flex flex-col items-center justify-center h-full text-text-secondary p-8 text-center'>
						<div className='w-24 h-24 bg-surface-bg rounded-full flex items-center justify-center mb-6 border border-border shadow-inner'>
							<Loader2 className='w-10 h-10 text-primary-500 opacity-20' />
						</div>
						<h3 className='text-xl font-medium mb-2'>
							{tUI("common.noItemTitle")}
						</h3>
						<p className='max-w-xs'>{tUI("common.noItemDesc")}</p>
					</div>
				)}
			</div>

			{/* Modal Xóa */}
			<Modal
				isOpen={modals.delete}
				onClose={() => actions.setModals(p => ({ ...p, delete: false }))}
				title={tUI("common.deleteDataTitle")}
			>
				<div className='text-text-secondary'>
					<p className='mb-6'>
						{tUI("common.deleteConfirmPrefix")}{" "}
						<strong className='text-text-primary'>
							{tDynamic(itemToDelete, "name")}
						</strong>
						{tUI("common.deleteConfirmSuffix")}
					</p>
					<div className='flex justify-end gap-3'>
						<Button
							onClick={() => actions.setModals(p => ({ ...p, delete: false }))}
							variant='ghost'
						>
							{tUI("common.cancel")}
						</Button>
						<Button onClick={actions.handleDelete} variant='danger'>
							{tUI("common.delete")}
						</Button>
					</div>
				</div>
			</Modal>

			{/* Modal Thông báo */}
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
							{tUI("common.ok")}
						</Button>
					</div>
				</div>
			</Modal>
		</div>
	);
};

export default memo(EditorLayout);
