// src/pages/admin/BuildEditor.jsx
import { useState, useEffect, memo, useMemo, useCallback } from "react";
import { useNavigate, Routes, Route, useParams, Link } from "react-router-dom"; // Thêm imports
import Modal from "../common/modal";
import Button from "../common/button";
import BuildCard from "./buildCard";
import BuildEditorForm from "./buildEditorForm";
import MultiSelectFilter from "../common/multiSelectFilter";
import InputField from "../common/inputField";
import DropdownFilter from "../common/dropdownFilter";
import { Loader2, Search, XCircle, RotateCw } from "lucide-react";

const ITEMS_PER_PAGE = 12;

// === SẮP XẾP OPTIONS ===
const SORT_OPTIONS = [
	{ value: "newest", label: "Mới nhất" },
	{ value: "oldest", label: "Cũ nhất" },
	{ value: "likes_desc", label: "Lượt thích nhiều nhất" },
	{ value: "likes_asc", label: "Lượt thích ít nhất" },
	{ value: "views_desc", label: "Lượt xem nhiều nhất" },
	{ value: "views_asc", label: "Lượt xem ít nhất" },
];

// === CẤP SAO OPTIONS ===
const STAR_LEVEL_OPTIONS = [
	{ value: "1", label: "1 sao" },
	{ value: "2", label: "2 sao" },
	{ value: "3", label: "3 sao" },
	{ value: "4", label: "4 sao" },
	{ value: "5", label: "5 sao" },
	{ value: "6", label: "6 sao" },
	{ value: "7", label: "7 sao" },
];

// === COMPONENT DANH SÁCH (LIST VIEW) ===
const BuildListView = memo(
	({
		paginatedBuilds,
		totalPages,
		currentPage,
		onPageChange,
		sidePanelProps,
	}) => {
		return (
			<div className='flex flex-col lg:flex-row gap-6'>
				{/* MAIN CONTENT */}
				<div className='lg:w-4/5 w-full lg:order-first bg-surface-bg rounded-lg border border-border p-1 sm:p-2'>
					{paginatedBuilds.length > 0 ? (
						<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'>
							{paginatedBuilds.map(build => (
								// Dùng Link để chuyển trang mà không reload
								<Link key={build.id} to={`./${build.id}`} className='block'>
									<BuildCard build={build} />
								</Link>
							))}
						</div>
					) : (
						<div className='text-center py-16 text-text-secondary'>
							<p className='text-lg font-semibold'>Không tìm thấy build nào.</p>
						</div>
					)}

					{totalPages > 1 && (
						<div className='mt-10 flex justify-center gap-4'>
							<Button
								onClick={() => onPageChange(currentPage - 1)}
								disabled={currentPage === 1}
								variant='outline'
							>
								Trang trước
							</Button>
							<span className='self-center text-lg font-medium text-text-primary'>
								{currentPage} / {totalPages}
							</span>
							<Button
								onClick={() => onPageChange(currentPage + 1)}
								disabled={currentPage === totalPages}
								variant='outline'
							>
								Trang sau
							</Button>
						</div>
					)}
				</div>

				{/* BỘ LỌC + SẮP XẾP */}
				<aside className='lg:w-1/5 w-full space-y-4'>
					<div className='bg-surface-bg rounded-lg border border-border p-4'>
						{/* TÌM KIẾM */}
						<div className='relative mb-4'>
							<InputField
								type='text'
								value={sidePanelProps.searchInput}
								onChange={e => sidePanelProps.setSearchInput(e.target.value)}
								onKeyPress={e =>
									e.key === "Enter" && sidePanelProps.handleSearch()
								}
								placeholder='Tìm theo từ khóa...'
							/>
							{sidePanelProps.searchInput && (
								<button
									onClick={sidePanelProps.handleClearSearch}
									className='absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary'
								>
									<XCircle size={18} />
								</button>
							)}
						</div>
						<Button
							onClick={sidePanelProps.handleSearch}
							className='w-full mb-4'
						>
							<Search size={16} className='mr-2' />
							Tìm kiếm
						</Button>

						{/* CẤP SAO */}
						<MultiSelectFilter
							label='Cấp sao'
							options={STAR_LEVEL_OPTIONS}
							selectedValues={sidePanelProps.selectedStarLevels}
							onChange={sidePanelProps.setSelectedStarLevels}
							placeholder='Tất cả cấp sao'
						/>

						{/* SẮP XẾP */}
						<div className='mt-4'>
							<DropdownFilter
								label='Sắp xếp theo'
								options={SORT_OPTIONS}
								selectedValue={sidePanelProps.sortBy}
								onChange={sidePanelProps.setSortBy}
							/>
						</div>

						{/* ĐẶT LẠI */}
						<div className='pt-4'>
							<Button
								variant='outline'
								onClick={sidePanelProps.handleResetFilters}
								iconLeft={<RotateCw size={16} />}
								className='w-full'
							>
								Đặt lại bộ lọc
							</Button>
						</div>
					</div>
				</aside>
			</div>
		);
	}
);

// === COMPONENT EDIT WRAPPER ===
const BuildEditWrapper = ({
	builds,
	onSave,
	onDelete,
	isSaving,
	onCancel, // Hàm xử lý quay lại
}) => {
	const { id } = useParams();
	// Tìm build từ list đã fetch (hoặc có thể fetch riêng lẻ nếu cần)
	const selectedBuild = useMemo(
		() => builds.find(b => b.id === id),
		[builds, id]
	);

	if (!selectedBuild && builds.length > 0) {
		return (
			<div className='p-10 text-center'>Không tìm thấy Build có ID: {id}</div>
		);
	}

	return (
		<div className='bg-surface-bg rounded-lg border border-border p-4'>
			<div className='mb-2 flex justify-between items-center'>
				<h2 className='text-2xl font-bold text-text-primary font-primary'>
					Chỉnh sửa Build
				</h2>
			</div>
			{selectedBuild && (
				<BuildEditorForm
					build={selectedBuild}
					onSave={onSave}
					onCancel={onCancel}
					onDelete={onDelete}
					isSaving={isSaving}
					onConfirmExit={onCancel} // Nút Hủy trong form sẽ gọi hàm này
				/>
			)}
		</div>
	);
};

function BuildEditor() {
	const navigate = useNavigate();
	const apiUrl = import.meta.env.VITE_API_URL;

	const [builds, setBuilds] = useState([]);

	// Filter States
	const [searchInput, setSearchInput] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedStarLevels, setSelectedStarLevels] = useState([]);
	const [sortBy, setSortBy] = useState("newest");
	const [currentPage, setCurrentPage] = useState(1);

	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [notification, setNotification] = useState({
		isOpen: false,
		title: "",
		message: "",
	});

	// Modal States
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [buildToDelete, setBuildToDelete] = useState(null);

	// Confirm Close logic (Nên chuyển vào form nếu muốn chặt chẽ hơn, ở đây giữ đơn giản)
	const [isCloseConfirmOpen, setIsCloseConfirmOpen] = useState(false);
	const [pendingExit, setPendingExit] = useState(null);

	// === LẤY DỮ LIỆU ===
	const fetchBuilds = useCallback(async () => {
		try {
			setIsLoading(true);
			const token = localStorage.getItem("token");
			const res = await fetch(`${apiUrl}/api/admin/builds`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (!res.ok) throw new Error("Lỗi tải dữ liệu");
			const { items } = await res.json();
			setBuilds(items || []);
		} catch (err) {
			setNotification({ isOpen: true, title: "Lỗi", message: err.message });
		} finally {
			setIsLoading(false);
		}
	}, [apiUrl]);

	useEffect(() => {
		fetchBuilds();
	}, [fetchBuilds]);

	// === LỌC & SẮP XẾP ===
	const filteredAndSortedBuilds = useMemo(() => {
		let result = [...builds];

		if (searchTerm) {
			result = result.filter(build => {
				const q = searchTerm;
				const champ = build.championName?.toLowerCase() || "";
				const creator =
					build.creatorName?.toLowerCase() ||
					build.creator?.toLowerCase() ||
					"";
				// ... (giữ nguyên logic search)
				const relicSet = (build.relicSet || []).join(" ").toLowerCase();
				const powers = (build.powers || []).join(" ").toLowerCase();
				const rune = (build.rune || []).join(" ").toLowerCase();
				return (
					champ.includes(q) ||
					creator.includes(q) ||
					relicSet.includes(q) ||
					powers.includes(q) ||
					rune.includes(q)
				);
			});
		}

		if (selectedStarLevels.length > 0) {
			result = result.filter(build =>
				selectedStarLevels.includes(String(build.star || 0))
			);
		}

		result.sort((a, b) => {
			switch (sortBy) {
				case "newest":
					return new Date(b.createdAt) - new Date(a.createdAt);
				case "oldest":
					return new Date(a.createdAt) - new Date(b.createdAt);
				case "likes_desc":
					return (b.like || 0) - (a.like || 0);
				case "likes_asc":
					return (a.like || 0) - (b.like || 0);
				case "views_desc":
					return (b.views || 0) - (a.views || 0);
				case "views_asc":
					return (a.views || 0) - (b.views || 0);
				default:
					return 0;
			}
		});
		return result;
	}, [builds, searchTerm, selectedStarLevels, sortBy]);

	const paginatedBuilds = filteredAndSortedBuilds.slice(
		(currentPage - 1) * ITEMS_PER_PAGE,
		currentPage * ITEMS_PER_PAGE
	);
	const totalPages = Math.ceil(filteredAndSortedBuilds.length / ITEMS_PER_PAGE);

	// === HANDLERS ===
	const handleSearch = () => {
		setSearchTerm(searchInput.trim().toLowerCase());
		setCurrentPage(1);
	};

	const handleClearSearch = () => {
		setSearchInput("");
		setSearchTerm("");
		setCurrentPage(1);
	};

	const handleResetFilters = () => {
		setSearchInput("");
		setSearchTerm("");
		setSelectedStarLevels([]);
		setSortBy("newest");
		setCurrentPage(1);
	};

	const handleBackToList = useCallback(() => {
		navigate("/admin/builds");
	}, [navigate]);

	// Logic thoát an toàn
	const handleAttemptClose = () => {
		// Có thể check isDirty ở đây nếu muốn (cần lift state lên hoặc dùng Context)
		// Hiện tại tạm thời hiện Modal luôn
		setPendingExit(() => handleBackToList);
		setIsCloseConfirmOpen(true);
	};

	const handleConfirmClose = () => {
		setIsCloseConfirmOpen(false);
		if (pendingExit) pendingExit();
		setPendingExit(null);
	};

	const handleSaveBuild = async updatedBuild => {
		setIsSaving(true);
		try {
			const token = localStorage.getItem("token");
			const res = await fetch(`${apiUrl}/api/admin/builds/${updatedBuild.id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(updatedBuild),
			});
			if (!res.ok) throw new Error("Cập nhật thất bại");

			// Update local state để không cần fetch lại
			const data = await res.json();
			const savedBuild = data.build || updatedBuild; // Fallback nếu API trả về khác

			setBuilds(prev =>
				prev.map(b => (b.id === savedBuild.id ? savedBuild : b))
			);

			setNotification({
				isOpen: true,
				title: "Thành công",
				message: "Cập nhật thành công!",
			});
			handleBackToList();
		} catch (err) {
			setNotification({ isOpen: true, title: "Lỗi", message: err.message });
		} finally {
			setIsSaving(false);
		}
	};

	const handleAttemptDelete = build => {
		setBuildToDelete(build);
		setIsDeleteModalOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!buildToDelete) return;
		try {
			const token = localStorage.getItem("token");
			await fetch(`${apiUrl}/api/admin/builds/${buildToDelete.id}`, {
				method: "DELETE",
				headers: { Authorization: `Bearer ${token}` },
			});
			setBuilds(prev => prev.filter(b => b.id !== buildToDelete.id));
			setNotification({
				isOpen: true,
				title: "Thành công",
				message: "Đã xóa!",
			});
			navigate("/admin/builds"); // Nếu đang ở trang detail thì về list
		} catch (err) {
			setNotification({ isOpen: true, title: "Lỗi", message: err.message });
		} finally {
			setIsDeleteModalOpen(false);
			setBuildToDelete(null);
		}
	};

	// Props gom nhóm cho SidePanel
	const sidePanelProps = {
		searchInput,
		setSearchInput,
		handleSearch,
		handleClearSearch,
		selectedStarLevels,
		setSelectedStarLevels,
		sortBy,
		setSortBy,
		handleResetFilters,
	};

	if (isLoading) {
		return (
			<div className='flex flex-col items-center justify-center min-h-[600px] text-text-secondary'>
				<Loader2 className='animate-spin text-primary-500' size={48} />
				<p className='mt-4'>Đang tải...</p>
			</div>
		);
	}

	return (
		<div className='mx-auto max-w-[1600px] p-1 sm:p-2 font-secondary'>
			<Routes>
				{/* Route LIST */}
				<Route
					index
					element={
						<BuildListView
							paginatedBuilds={paginatedBuilds}
							totalPages={totalPages}
							currentPage={currentPage}
							onPageChange={setCurrentPage}
							sidePanelProps={sidePanelProps}
						/>
					}
				/>

				{/* Route EDIT */}
				<Route
					path=':id'
					element={
						<BuildEditWrapper
							builds={builds}
							onSave={handleSaveBuild}
							onDelete={handleAttemptDelete}
							isSaving={isSaving}
							onCancel={handleAttemptClose}
						/>
					}
				/>
			</Routes>

			{/* MODALS */}
			<Modal
				isOpen={isDeleteModalOpen}
				onClose={() => setIsDeleteModalOpen(false)}
				title='Xác nhận Xóa'
			>
				<p className='mb-4 text-text-secondary'>
					Xóa build <strong>{buildToDelete?.championName}</strong>?
				</p>
				<div className='flex justify-end gap-3'>
					<Button onClick={() => setIsDeleteModalOpen(false)} variant='ghost'>
						Hủy
					</Button>
					<Button onClick={handleConfirmDelete} variant='danger'>
						Xóa
					</Button>
				</div>
			</Modal>

			<Modal
				isOpen={isCloseConfirmOpen}
				onClose={() => setIsCloseConfirmOpen(false)}
				title='Xác nhận thoát'
			>
				<p className='mb-6 text-text-secondary'>
					Bạn có thay đổi chưa lưu. Thoát sẽ mất dữ liệu.
				</p>
				<div className='flex justify-end gap-3'>
					<Button onClick={() => setIsCloseConfirmOpen(false)} variant='ghost'>
						Ở lại
					</Button>
					<Button onClick={handleConfirmClose} variant='danger'>
						Thoát không lưu
					</Button>
				</div>
			</Modal>

			<Modal
				isOpen={notification.isOpen}
				onClose={() => setNotification({ ...notification, isOpen: false })}
				title={notification.title}
			>
				<p className='text-text-secondary'>{notification.message}</p>
				<div className='flex justify-end mt-4'>
					<Button
						onClick={() => setNotification({ ...notification, isOpen: false })}
					>
						Đóng
					</Button>
				</div>
			</Modal>
		</div>
	);
}

export default memo(BuildEditor);
