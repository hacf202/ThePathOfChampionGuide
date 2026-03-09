// src/pages/admin/BuildEditor.jsx
import { useState, useEffect, memo, useMemo, useCallback } from "react";
import { useNavigate, Routes, Route, useParams, Link } from "react-router-dom";
import Modal from "../common/modal";
import Button from "../common/button";
import BuildCard from "./buildCard";
import BuildEditorForm from "./buildEditorForm";
import MultiSelectFilter from "../common/multiSelectFilter";
import DropdownFilter from "../common/dropdownFilter";
import { Loader2, Search, XCircle, RotateCw } from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation"; // IMPORT HOOK

const ITEMS_PER_PAGE = 12;

// === COMPONENT MAIN ===
function BuildEditor() {
	const [items, setItems] = useState([]);
	const [pagination, setPagination] = useState({
		totalPages: 1,
		totalItems: 0,
		currentPage: 1,
	});
	const [searchInput, setSearchInput] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedStars, setSelectedStars] = useState([]);
	const [sortOrder, setSortOrder] = useState("createdAt-desc");
	const [currentPage, setCurrentPage] = useState(1);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState(null);

	const API_BASE_URL = import.meta.env.VITE_API_URL;
	const navigate = useNavigate();
	const { tUI } = useTranslation();

	const SORT_OPTIONS = useMemo(
		() => [
			{
				value: "createdAt-desc",
				label: tUI("admin.build.sort.newest") || "Mới nhất",
			},
			{
				value: "createdAt-asc",
				label: tUI("admin.build.sort.oldest") || "Cũ nhất",
			},
			{
				value: "likes-desc",
				label: tUI("admin.build.sort.likesDesc") || "Nhiều Like",
			},
			{
				value: "likes-asc",
				label: tUI("admin.build.sort.likesAsc") || "Ít Like",
			},
			{
				value: "views-desc",
				label: tUI("admin.build.sort.viewsDesc") || "Nhiều View",
			},
			{
				value: "views-asc",
				label: tUI("admin.build.sort.viewsAsc") || "Ít View",
			},
		],
		[tUI],
	);

	const STAR_LEVEL_OPTIONS = useMemo(
		() => [
			{ value: "1", label: `1 ${tUI("admin.build.star") || "Sao"}` },
			{ value: "2", label: `2 ${tUI("admin.build.star") || "Sao"}` },
			{ value: "3", label: `3 ${tUI("admin.build.star") || "Sao"}` },
			{ value: "4", label: `4 ${tUI("admin.build.star") || "Sao"}` },
			{ value: "5", label: `5 ${tUI("admin.build.star") || "Sao"}` },
			{ value: "6", label: `6 ${tUI("admin.build.star") || "Sao"}` },
		],
		[tUI],
	);

	const queryParams = useMemo(() => {
		const params = new URLSearchParams();
		params.append("page", currentPage);
		params.append("limit", ITEMS_PER_PAGE);
		params.append("sort", sortOrder);
		if (searchTerm) params.append("searchTerm", searchTerm);
		if (selectedStars.length > 0)
			params.append("stars", selectedStars.join(","));
		return params.toString();
	}, [currentPage, searchTerm, selectedStars, sortOrder]);

	// Fetch Data with Server-Side Filtering
	const fetchAllData = useCallback(async () => {
		try {
			setIsLoading(true);
			const token = localStorage.getItem("token");
			const res = await fetch(
				`${API_BASE_URL}/api/admin/builds?${queryParams}`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);
			if (!res.ok) throw new Error(tUI("admin.common.errorLoad"));
			const data = await res.json();
			setItems(data.items || []);
			if (data.pagination) {
				setPagination(data.pagination);
			}
		} catch (e) {
			setError(e.message || tUI("admin.common.errorLoad"));
		} finally {
			setIsLoading(false);
		}
	}, [API_BASE_URL, queryParams, tUI]);

	useEffect(() => {
		fetchAllData();
	}, [fetchAllData]);

	// Handlers
	const handleSaveItem = async data => {
		setIsSaving(true);
		try {
			const token = localStorage.getItem("token");
			const res = await fetch(`${API_BASE_URL}/api/admin/builds/${data.id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(data),
			});

			const result = await res.json();
			if (!res.ok)
				throw new Error(result.error || tUI("admin.common.errorOccurred"));

			await fetchAllData();
			navigate("/admin/builds");
			alert(tUI("admin.common.saveSuccess"));
		} catch (e) {
			alert(e.message || tUI("admin.common.errorOccurred"));
		} finally {
			setIsSaving(false);
		}
	};

	const handleDeleteItem = async id => {
		setIsSaving(true);
		try {
			const token = localStorage.getItem("token");
			const res = await fetch(`${API_BASE_URL}/api/admin/builds/${id}`, {
				method: "DELETE",
				headers: { Authorization: `Bearer ${token}` },
			});
			if (!res.ok) throw new Error(tUI("admin.common.deleteFailed"));
			await fetchAllData();
			navigate("/admin/builds");
			alert(tUI("admin.common.deleteSuccess"));
		} catch (e) {
			alert(e.message || tUI("admin.common.deleteFailed"));
		} finally {
			setIsSaving(false);
		}
	};

	const handleResetFilters = () => {
		setSearchInput("");
		setSearchTerm("");
		setSelectedStars([]);
		setSortOrder("createdAt-desc");
		setCurrentPage(1);
	};

	if (isLoading && items.length === 0) {
		return (
			<div className='flex flex-col items-center justify-center min-h-[400px] text-[var(--color-text-secondary)]'>
				<Loader2
					className='animate-spin text-[var(--color-primary)]'
					size={48}
				/>
				<div className='mt-4'>{tUI("admin.common.loading")}</div>
			</div>
		);
	}

	if (error && items.length === 0) {
		return <div className='text-center p-10 text-red-500'>{error}</div>;
	}

	return (
		<div className='font-secondary text-[var(--color-text-primary)]'>
			{/* Header */}
			<div className='mb-6 border-b border-[var(--color-border)] pb-4'>
				<h1 className='text-3xl font-bold font-primary text-[var(--color-text-primary)]'>
					{tUI("admin.build.title")}
				</h1>
			</div>

			<Routes>
				{/* === DANH SÁCH BUILDS === */}
				<Route
					index
					element={
						<div className='flex flex-col lg:flex-row gap-6'>
							{/* Bảng điều khiển bộ lọc (Bên phải trên Desktop, nằm trên cùng trên Mobile) */}
							<div className='lg:w-1/4 flex flex-col gap-4 order-first lg:order-last'>
								<div className='bg-[var(--color-surface)] p-5 rounded-xl border border-[var(--color-border)] shadow-sm'>
									<div className='flex justify-between items-center mb-4 pb-2 border-b border-[var(--color-border)]'>
										<h2 className='font-bold text-lg'>
											{tUI("admin.common.search")}
										</h2>
										<button
											onClick={handleResetFilters}
											className='text-xs font-semibold text-[var(--color-primary)] hover:underline flex items-center gap-1'
										>
											<RotateCw size={12} /> {tUI("admin.build.resetFilter")}
										</button>
									</div>

									<div className='flex flex-col gap-5'>
										{/* Tìm kiếm Text */}
										<div className='relative'>
											<input
												type='text'
												placeholder={tUI("admin.build.searchPlaceholder")}
												value={searchInput}
												onChange={e => setSearchInput(e.target.value)}
												onKeyDown={e => {
													if (e.key === "Enter") {
														setSearchTerm(searchInput.trim());
														setCurrentPage(1);
													}
												}}
												className='w-full pl-10 pr-10 py-2.5 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]'
											/>
											<Search
												className='absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]'
												size={18}
											/>
											{searchInput && (
												<button
													onClick={() => {
														setSearchInput("");
														setSearchTerm("");
														setCurrentPage(1);
													}}
													className='absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] hover:text-red-400'
												>
													<XCircle size={18} />
												</button>
											)}
										</div>
										<Button
											onClick={() => {
												setSearchTerm(searchInput.trim());
												setCurrentPage(1);
											}}
											variant='primary'
											className='w-full py-2.5 flex justify-center'
										>
											<Search size={18} className='mr-2' />{" "}
											{tUI("admin.common.search")}
										</Button>

										<DropdownFilter
											label={tUI("admin.build.sortTitle")}
											options={SORT_OPTIONS}
											selectedValue={sortOrder}
											onChange={setSortOrder}
										/>

										<MultiSelectFilter
											label={tUI("admin.build.starLevel")}
											options={STAR_LEVEL_OPTIONS}
											selectedValues={selectedStars}
											onChange={setSelectedStars}
											placeholder={tUI("admin.common.all")}
										/>
									</div>
								</div>
							</div>

							{/* Danh sách thẻ */}
							<div className='lg:w-3/4 flex flex-col relative'>
								{/* Overlay Loading khi chuyển trang/lọc */}
								{isLoading && items.length > 0 && (
									<div className='absolute inset-0 bg-black/20 z-10 flex items-center justify-center rounded-lg backdrop-blur-sm'>
										<Loader2 className='animate-spin text-white' size={48} />
									</div>
								)}

								{items.length > 0 ? (
									<div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5'>
										{items.map(item => (
											<Link
												key={item.id}
												to={`./${item.id}`}
												className='block transform transition duration-200 hover:-translate-y-1'
											>
												<BuildCard build={item} />
											</Link>
										))}
									</div>
								) : (
									<div className='flex flex-col items-center justify-center min-h-[300px] bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] text-[var(--color-text-secondary)]'>
										<p className='font-semibold text-lg'>
											{tUI("admin.build.notFound")}
										</p>
										<p>{tUI("admin.build.tryOtherFilter")}</p>
									</div>
								)}

								{/* Phân trang API */}
								{pagination.totalPages > 1 && (
									<div className='mt-8 flex justify-center items-center gap-4 bg-[var(--color-surface)] py-3 px-6 rounded-full border border-[var(--color-border)] self-center'>
										<Button
											onClick={() => setCurrentPage(p => p - 1)}
											disabled={currentPage === 1 || isLoading}
											variant='outline'
											className='rounded-full px-6'
										>
											{tUI("admin.common.prevPage")}
										</Button>
										<span className='font-bold text-[var(--color-text-primary)]'>
											{currentPage} / {pagination.totalPages}
										</span>
										<Button
											onClick={() => setCurrentPage(p => p + 1)}
											disabled={
												currentPage === pagination.totalPages || isLoading
											}
											variant='outline'
											className='rounded-full px-6'
										>
											{tUI("admin.common.nextPage")}
										</Button>
									</div>
								)}
							</div>
						</div>
					}
				/>

				{/* === CHỈNH SỬA BUILD === */}
				<Route
					path=':id'
					element={
						<BuildEditWrapper
							items={items}
							onSave={handleSaveItem}
							onDelete={handleDeleteItem}
							isSaving={isSaving}
						/>
					}
				/>
			</Routes>
		</div>
	);
}

// === COMPONENT CON QUẢN LÝ VIỆC SỬA ===
const BuildEditWrapper = ({ items, onSave, onDelete, isSaving }) => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { tUI } = useTranslation();

	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [isCloseConfirmOpen, setIsCloseConfirmOpen] = useState(false);
	const [isDirty, setIsDirty] = useState(false);
	const [notification, setNotification] = useState({
		isOpen: false,
		message: "",
		title: "",
	});

	const [localBuild, setLocalBuild] = useState(null);
	const [isLoadingSingle, setIsLoadingSingle] = useState(false);

	// Nếu user refresh trang trực tiếp ở đường dẫn /admin/builds/:id,
	// state `items` của Parent có thể chưa kịp load hoặc item nằm ở trang khác.
	// Component sẽ gọi phụ một API fetch bằng searchTerm = id để kéo lại đúng item đó.
	useEffect(() => {
		const found = items.find(i => i.id === id);
		if (found) {
			setLocalBuild(found);
		} else {
			const fetchSingle = async () => {
				setIsLoadingSingle(true);
				try {
					const token = localStorage.getItem("token");
					const res = await fetch(
						`${import.meta.env.VITE_API_URL}/api/admin/builds?searchTerm=${id}`,
						{
							headers: { Authorization: `Bearer ${token}` },
						},
					);
					const data = await res.json();
					const fetchedItems = Array.isArray(data) ? data : data.items || [];
					const itemFound = fetchedItems.find(i => i.id === id);
					if (itemFound) setLocalBuild(itemFound);
				} catch (e) {
					console.error("Lỗi khi tải lẻ build:", e);
				} finally {
					setIsLoadingSingle(false);
				}
			};
			fetchSingle();
		}
	}, [id, items]);

	const handleBack = useCallback(() => {
		if (isDirty) {
			setIsCloseConfirmOpen(true);
		} else {
			navigate("/admin/builds");
		}
	}, [isDirty, navigate]);

	const handleConfirmClose = () => {
		setIsCloseConfirmOpen(false);
		navigate("/admin/builds");
	};

	const handleConfirmDelete = async () => {
		setIsDeleteModalOpen(false);
		await onDelete(id);
	};

	if (isLoadingSingle) {
		return (
			<div className='flex justify-center items-center py-20'>
				<Loader2
					className='animate-spin text-[var(--color-primary)]'
					size={40}
				/>
			</div>
		);
	}

	if (!localBuild) {
		return (
			<div className='flex flex-col items-center justify-center py-20 text-[var(--color-text-secondary)]'>
				<p className='text-xl mb-4'>
					{tUI("admin.build.notFoundId")} {id}
				</p>
				<Button onClick={() => navigate("/admin/builds")} variant='primary'>
					{tUI("admin.common.backToList")}
				</Button>
			</div>
		);
	}

	return (
		<div className='flex flex-col max-w-5xl mx-auto'>
			{/* Toolbar Header Cố định */}
			<div className='sticky top-0 z-30 bg-[var(--color-surface)] border-b border-[var(--color-border)] p-4 mb-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 rounded-b-xl'>
				<div>
					<h2 className='text-xl font-bold font-primary'>
						{tUI("admin.buildForm.editTitle")} {localBuild.championName}
					</h2>
					{isDirty && (
						<span className='text-xs font-semibold text-yellow-500'>
							{tUI("admin.common.unsavedChanges")}
						</span>
					)}
				</div>
				<div className='flex items-center gap-3 w-full sm:w-auto'>
					<Button
						type='button'
						onClick={handleBack}
						variant='outline'
						disabled={isSaving}
						className='flex-1 sm:flex-none'
					>
						{tUI("admin.common.cancel")}
					</Button>
					<Button
						type='button'
						onClick={() => setIsDeleteModalOpen(true)}
						variant='danger'
						disabled={isSaving}
						className='flex-1 sm:flex-none'
					>
						{tUI("admin.common.delete")}
					</Button>
					<Button
						type='button'
						onClick={() => {
							document.getElementById("btn-submit-build").click();
						}}
						variant='primary'
						disabled={isSaving}
						className='flex-1 sm:flex-none'
					>
						{isSaving
							? tUI("admin.common.saving")
							: tUI("admin.common.saveChanges")}
					</Button>
				</div>
			</div>

			<BuildEditorForm
				item={localBuild}
				onSave={onSave}
				isSaving={isSaving}
				onDirtyChange={setIsDirty}
			/>

			{/* MODALS */}
			<Modal
				isOpen={isDeleteModalOpen}
				onClose={() => setIsDeleteModalOpen(false)}
				title={tUI("admin.common.deleteConfirmTitle")}
			>
				<p className='mb-4 text-text-secondary'>
					{tUI("admin.build.deleteConfirmText")}{" "}
					<strong>{localBuild?.championName}</strong>?
				</p>
				<div className='flex justify-end gap-3'>
					<Button onClick={() => setIsDeleteModalOpen(false)} variant='ghost'>
						{tUI("admin.common.cancel")}
					</Button>
					<Button onClick={handleConfirmDelete} variant='danger'>
						{tUI("admin.common.delete")}
					</Button>
				</div>
			</Modal>

			<Modal
				isOpen={isCloseConfirmOpen}
				onClose={() => setIsCloseConfirmOpen(false)}
				title={tUI("admin.common.cancelConfirmTitle")}
			>
				<p className='mb-6 text-text-secondary'>
					{tUI("admin.common.cancelConfirmText")}
				</p>
				<div className='flex justify-end gap-3'>
					<Button onClick={() => setIsCloseConfirmOpen(false)} variant='ghost'>
						{tUI("admin.common.stay")}
					</Button>
					<Button onClick={handleConfirmClose} variant='danger'>
						{tUI("admin.common.leave")}
					</Button>
				</div>
			</Modal>

			<Modal
				isOpen={notification.isOpen}
				onClose={() => setNotification({ ...notification, isOpen: false })}
				title={notification.title}
			>
				<p className='text-text-secondary'>{notification.message}</p>
				<div className='flex justify-end gap-3 mt-4'>
					<Button
						onClick={() => setNotification({ ...notification, isOpen: false })}
						variant='primary'
					>
						{tUI("admin.common.ok")}
					</Button>
				</div>
			</Modal>
		</div>
	);
};

export default memo(BuildEditor);
