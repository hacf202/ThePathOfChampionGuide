// src/pages/admin/BuildEditor.jsx
import { useState, useEffect, memo, useMemo, useCallback } from "react";
import { useNavigate, Routes, Route, useParams, Link } from "react-router-dom";
import Modal from "../common/modal";
import Button from "../common/button";
import BuildCard from "./buildCard";
import BuildEditorForm from "./buildEditorForm";
import MultiSelectFilter from "../common/multiSelectFilter";
import InputField from "../common/inputField";
import DropdownFilter from "../common/dropdownFilter";
import { Loader2, Search, XCircle, RotateCw } from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation"; // IMPORT HOOK

const ITEMS_PER_PAGE = 12;

// === COMPONENT MAIN ===
function BuildEditor() {
	const [items, setItems] = useState([]);
	const [searchInput, setSearchInput] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedStars, setSelectedStars] = useState([]);
	const [sortOrder, setSortOrder] = useState("newest");
	const [currentPage, setCurrentPage] = useState(1);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState(null);

	const API_BASE_URL = import.meta.env.VITE_API_URL;
	const navigate = useNavigate();
	const { tUI } = useTranslation();

	// Đưa SORT_OPTIONS và STAR_LEVEL_OPTIONS vào trong component để dùng tUI
	const SORT_OPTIONS = useMemo(
		() => [
			{ value: "newest", label: tUI("admin.build.sort.newest") },
			{ value: "oldest", label: tUI("admin.build.sort.oldest") },
			{ value: "likes_desc", label: tUI("admin.build.sort.likesDesc") },
			{ value: "likes_asc", label: tUI("admin.build.sort.likesAsc") },
			{ value: "views_desc", label: tUI("admin.build.sort.viewsDesc") },
			{ value: "views_asc", label: tUI("admin.build.sort.viewsAsc") },
		],
		[tUI],
	);

	const STAR_LEVEL_OPTIONS = useMemo(
		() => [
			{ value: "1", label: `1 ${tUI("admin.build.star")}` },
			{ value: "2", label: `2 ${tUI("admin.build.star")}` },
			{ value: "3", label: `3 ${tUI("admin.build.star")}` },
			{ value: "4", label: `4 ${tUI("admin.build.star")}` },
			{ value: "5", label: `5 ${tUI("admin.build.star")}` },
			{ value: "6", label: `6 ${tUI("admin.build.star")}` },
		],
		[tUI],
	);

	// Lấy dữ liệu
	const fetchAllData = useCallback(async () => {
		try {
			setIsLoading(true);
			const token = localStorage.getItem("token");
			const res = await fetch(`${API_BASE_URL}/api/admin/builds`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			if (!res.ok) throw new Error(tUI("admin.common.errorLoad"));
			const data = await res.json();
			setItems(Array.isArray(data) ? data : data.items || []);
		} catch (e) {
			setError(e.message || tUI("admin.common.errorLoad"));
		} finally {
			setIsLoading(false);
		}
	}, [API_BASE_URL, tUI]);

	useEffect(() => {
		fetchAllData();
	}, [fetchAllData]);

	// Lọc & Sắp xếp dữ liệu
	const filteredItems = useMemo(() => {
		let result = [...items];

		// Tìm kiếm theo tên tướng / người tạo
		if (searchTerm) {
			const term = searchTerm.toLowerCase();
			result = result.filter(
				i =>
					(i.championName || "").toLowerCase().includes(term) ||
					(i.creator || "").toLowerCase().includes(term),
			);
		}

		// Lọc theo sao
		if (selectedStars.length > 0) {
			result = result.filter(i => selectedStars.includes(String(i.star)));
		}

		// Sắp xếp
		result.sort((a, b) => {
			if (sortOrder === "newest") {
				return new Date(b.createdAt) - new Date(a.createdAt);
			}
			if (sortOrder === "oldest") {
				return new Date(a.createdAt) - new Date(b.createdAt);
			}
			if (sortOrder === "likes_desc") {
				return (b.like || 0) - (a.like || 0);
			}
			if (sortOrder === "likes_asc") {
				return (a.like || 0) - (b.like || 0);
			}
			if (sortOrder === "views_desc") {
				return (b.views || 0) - (a.views || 0);
			}
			if (sortOrder === "views_asc") {
				return (a.views || 0) - (b.views || 0);
			}
			return 0;
		});

		return result;
	}, [items, searchTerm, selectedStars, sortOrder]);

	// Phân trang
	const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
	const paginatedItems = filteredItems.slice(
		(currentPage - 1) * ITEMS_PER_PAGE,
		currentPage * ITEMS_PER_PAGE,
	);

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
		setSortOrder("newest");
		setCurrentPage(1);
	};

	if (isLoading) {
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

	if (error) {
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
												className='w-full pl-10 pr-10 py-2.5 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] transition-colors'
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
							<div className='lg:w-3/4 flex flex-col'>
								{paginatedItems.length > 0 ? (
									<div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5'>
										{paginatedItems.map(item => (
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

								{/* Phân trang */}
								{totalPages > 1 && (
									<div className='mt-8 flex justify-center items-center gap-4 bg-[var(--color-surface)] py-3 px-6 rounded-full border border-[var(--color-border)] self-center'>
										<Button
											onClick={() => setCurrentPage(p => p - 1)}
											disabled={currentPage === 1}
											variant='outline'
											className='rounded-full px-6'
										>
											{tUI("admin.common.prevPage")}
										</Button>
										<span className='font-bold text-[var(--color-text-primary)]'>
											{currentPage} / {totalPages}
										</span>
										<Button
											onClick={() => setCurrentPage(p => p + 1)}
											disabled={currentPage === totalPages}
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

	const buildToEdit = useMemo(() => {
		return items.find(i => i.id === id);
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

	if (!buildToEdit) {
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
						{tUI("admin.buildForm.editTitle")} {buildToEdit.championName}
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
				item={buildToEdit}
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
					<strong>{buildToEdit?.championName}</strong>?
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
