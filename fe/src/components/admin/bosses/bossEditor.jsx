// src/components/admin/bossEditor.jsx
import { useState, memo, useEffect, useCallback, useMemo } from "react";
import { useNavigate, Link, Routes, Route, useParams } from "react-router-dom";
import GenericCard from "../../common/genericCard";
import Button from "../../common/button";
import { removeAccents } from "../../../utils/vietnameseUtils";
import SidePanel from "../../common/sidePanel";
import BossEditorForm from "./bossEditorForm";
import DropDragSidePanel from "../components/dropSidePanel"; // 🟢 Import panel kéo thả
import { Loader2 } from "lucide-react";
import { useTranslation } from "../../../hooks/useTranslation";

const NEW_BOSS_TEMPLATE = {
	bossID: "",
	isNew: true,
	bossName: "",
	power: "",
	background: "",
	translations: { en: { bossName: "" } },
};

const ITEMS_PER_PAGE = 20;

const BossListView = memo(
	({
		paginatedItems,
		totalPages,
		currentPage,
		onPageChange,
		sidePanelProps,
	}) => {
		return (
			<div className='flex flex-col lg:flex-row gap-6'>
				<div className='lg:w-4/5 bg-surface-bg rounded-lg p-4'>
					{paginatedItems.length > 0 ? (
						<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6'>
							{paginatedItems.map(item => (
								<Link
									key={item.bossID}
									to={`./${item.bossID}`}
									className='block hover:scale-105 transition-transform duration-200'
								>
									<GenericCard
										item={{
											...item,
											name: item.bossName,
											assetAbsolutePath: item.background,
										}}
										onClick={() => {}}
									/>
								</Link>
							))}
						</div>
					) : (
						<div className='flex items-center justify-center h-full min-h-[300px] text-center text-text-secondary'>
							<p className='font-semibold text-lg'>Không tìm thấy Boss nào.</p>
						</div>
					)}

					{totalPages > 1 && (
						<div className='mt-8 flex justify-center items-center gap-4'>
							<Button
								onClick={() => onPageChange(currentPage - 1)}
								disabled={currentPage === 1}
								variant='outline'
							>
								Trước
							</Button>
							<span className='text-lg font-medium'>
								{currentPage} / {totalPages}
							</span>
							<Button
								onClick={() => onPageChange(currentPage + 1)}
								disabled={currentPage === totalPages}
								variant='outline'
							>
								Sau
							</Button>
						</div>
					)}
				</div>
				<div className='lg:w-1/5'>
					<SidePanel {...sidePanelProps} />
				</div>
			</div>
		);
	},
);

// 🟢 Cập nhật Wrapper để render DropDragSidePanel thay vì SidePanel thường
const BossEditWrapper = ({
	items,
	onSave,
	onDelete,
	isSaving,
	cachedData,
	isDragPanelOpen,
	setIsDragPanelOpen,
}) => {
	const { id } = useParams();
	const navigate = useNavigate();

	const selectedItem = useMemo(() => {
		if (id === "new") return { ...NEW_BOSS_TEMPLATE };
		const found = items.find(i => i.bossID === id);
		return found ? { ...found, isNew: false } : null;
	}, [id, items]);

	const handleBack = useCallback(() => navigate("/admin/bosses"), [navigate]);

	if (!selectedItem && id !== "new" && items.length > 0) {
		return (
			<div className='flex flex-col items-center justify-center py-20 text-text-secondary'>
				<p className='text-xl mb-4'>Không tìm thấy ID {id}</p>
				<Button onClick={handleBack} variant='primary'>
					Quay lại danh sách
				</Button>
			</div>
		);
	}

	return (
		<div className='flex flex-col lg:flex-row gap-6 relative transition-all duration-300'>
			<div
				className={`transition-all duration-300 ${isDragPanelOpen ? "lg:w-3/4 xl:w-4/5" : "w-full"} bg-surface-bg rounded-lg`}
			>
				// Trong file bossEditor.jsx
				{selectedItem && (
					<BossEditorForm
						item={selectedItem}
						cachedData={cachedData} // <--- DÒNG NÀY RẤT QUAN TRỌNG
						onSave={onSave}
						onCancel={handleBack}
						onDelete={onDelete}
						isSaving={isSaving}
						isDragPanelOpen={isDragPanelOpen}
						onToggleDragPanel={() => setIsDragPanelOpen(!isDragPanelOpen)}
					/>
				)}
			</div>

			{/* 🟢 Thanh Sidebar Kéo Thả */}
			{isDragPanelOpen && (
				<div className='lg:w-1/4 xl:w-1/5 shrink-0 transition-all duration-300'>
					<DropDragSidePanel cachedData={cachedData} onClose={handleBack} />
				</div>
			)}
		</div>
	);
};

function BossEditor() {
	const [items, setItems] = useState([]);
	const [powers, setPowers] = useState([]); // 🟢 State lưu danh sách sức mạnh để kéo thả
	const [searchInput, setSearchInput] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [isDragPanelOpen, setIsDragPanelOpen] = useState(true); // 🟢 State quản lý đóng/mở panel

	const API_BASE_URL = import.meta.env.VITE_API_URL;
	const navigate = useNavigate();
	const { tDynamic } = useTranslation();

	const fetchAllData = useCallback(async () => {
		try {
			setIsLoading(true);
			// 🟢 Gọi song song API lấy danh sách Boss và danh sách Power
			const [bossRes, powerRes] = await Promise.all([
				fetch(`${API_BASE_URL}/api/bosses`),
				fetch(`${API_BASE_URL}/api/powers?limit=1000`),
			]);

			const bossData = await bossRes.json();
			const powerData = await powerRes.json();

			setItems(bossData.items || []);
			setPowers(powerData.items || []);
		} catch (e) {
			console.error("Lỗi khi tải dữ liệu:", e);
		} finally {
			setIsLoading(false);
		}
	}, [API_BASE_URL]);

	useEffect(() => {
		fetchAllData();
	}, [fetchAllData]);

	const handleSaveItem = async data => {
		setIsSaving(true);
		try {
			const token = localStorage.getItem("token");
			const res = await fetch(`${API_BASE_URL}/api/bosses`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(data),
			});
			if (!res.ok) throw new Error("Lưu thất bại.");
			await fetchAllData();
			navigate("/admin/bosses");
			alert("Lưu thành công!");
		} catch (e) {
			alert(e.message);
		} finally {
			setIsSaving(false);
		}
	};

	const handleDeleteItem = async id => {
		if (!id || !window.confirm("Bạn có chắc muốn xóa Boss này?")) return;
		setIsSaving(true);
		try {
			const token = localStorage.getItem("token");
			await fetch(`${API_BASE_URL}/api/bosses/${id}`, {
				method: "DELETE",
				headers: { Authorization: `Bearer ${token}` },
			});
			await fetchAllData();
			navigate("/admin/bosses");
			alert("Xóa thành công!");
		} catch (e) {
			alert(e.message);
		} finally {
			setIsSaving(false);
		}
	};

	const filteredItems = useMemo(() => {
		let result = [...items];
		if (searchTerm) {
			const term = removeAccents(searchTerm.toLowerCase());
			result = result.filter(i => {
				const nameVi = removeAccents((i.bossName || "").toLowerCase());
				const nameEn = removeAccents(
					(i.translations?.en?.bossName || "").toLowerCase(),
				);
				return nameVi.includes(term) || nameEn.includes(term);
			});
		}
		return result;
	}, [items, searchTerm]);

	const sidePanelProps = {
		searchPlaceholder: "Tìm kiếm Boss...",
		addLabel: "Thêm Boss mới",
		resetLabel: "Đặt lại bộ lọc",
		searchInput,
		onSearchInputChange: e => setSearchInput(e.target.value),
		onSearchKeyDown: e => {
			if (e.key === "Enter") {
				setSearchTerm(searchInput.trim());
				setCurrentPage(1);
			}
		},
		onSearch: () => {
			setSearchTerm(searchInput.trim());
			setCurrentPage(1);
		},
		onClearSearch: () => {
			setSearchInput("");
			setSearchTerm("");
		},
		onAddNew: () => navigate("new"),
		onResetFilters: () => {
			setSearchInput("");
			setSearchTerm("");
			setCurrentPage(1);
		},
	};

	// 🟢 Truyền dữ liệu cache vào DropDragSidePanel
	const cachedData = { bosses: items, powers };

	if (isLoading)
		return (
			<div className='flex justify-center p-10'>
				<Loader2 className='animate-spin text-primary-500' size={48} />
			</div>
		);

	return (
		<div className='font-secondary'>
			<Routes>
				<Route
					index
					element={
						<BossListView
							paginatedItems={filteredItems.slice(
								(currentPage - 1) * ITEMS_PER_PAGE,
								currentPage * ITEMS_PER_PAGE,
							)}
							totalPages={Math.ceil(filteredItems.length / ITEMS_PER_PAGE)}
							currentPage={currentPage}
							onPageChange={setCurrentPage}
							sidePanelProps={sidePanelProps}
						/>
					}
				/>
				<Route
					path=':id'
					element={
						<BossEditWrapper
							items={items}
							onSave={handleSaveItem}
							onDelete={handleDeleteItem}
							isSaving={isSaving}
							cachedData={cachedData}
							isDragPanelOpen={isDragPanelOpen}
							setIsDragPanelOpen={setIsDragPanelOpen}
						/>
					}
				/>
			</Routes>
		</div>
	);
}

export default memo(BossEditor);
