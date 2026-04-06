// src/components/admin/bossEditor.jsx
import { useState, memo, useEffect, useCallback, useMemo } from "react";
import { useNavigate, Link, Routes, Route, useParams } from "react-router-dom";
import GenericCard from "../../common/genericCard";
import Button from "../../common/button";
import { removeAccents } from "../../../utils/vietnameseUtils";
import SidePanel from "../../common/sidePanel";
import BossEditorForm from "./bossEditorForm";
import DropDragSidePanel from "../common/dropSidePanel";
import AdminListLayout from "../common/adminListLayout";
import { Loader2 } from "lucide-react";
import { useTranslation } from "../../../hooks/useTranslation";

const CustomBossTooltip = ({ bossID, powers, cachedData, tUI }) => {
	return (
		<div className='flex flex-col gap-2'>
			<div className='font-bold text-primary-400'>[ID: {bossID}]</div>
			{!powers || powers.length === 0 ? (
				<div className='italic text-gray-400'>{tUI("admin.boss.noPowers")}</div>
			) : (
				powers.map((pCode, idx) => {
					const powerItem = cachedData?.powers?.find(
						p => p.powerCode === pCode,
					);
					const name = powerItem
						? powerItem.translations?.vi?.name || powerItem.name
						: pCode;
					const icon =
						powerItem?.assetAbsolutePath || "/images/placeholder.png";

					return (
						<div key={idx} className='flex items-center gap-3'>
							<img
								src={icon}
								alt='icon'
								className='w-8 h-8 rounded border border-gray-600 bg-gray-800 object-cover shrink-0'
							/>
							<span className='text-sm text-gray-200 line-clamp-2'>
								{name}
							</span>
						</div>
					);
				})
			)}
		</div>
	);
};

const NEW_BOSS_TEMPLATE = {
	bossID: "",
	isNew: true,
	bossName: "",
	power: [], // Đã thay đổi thành mảng để chứa nhiều power
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
		cachedData,
	}) => {
		const { tUI } = useTranslation();
		return (
			<AdminListLayout
				dataLength={paginatedItems.length}
				totalPages={totalPages}
				currentPage={currentPage}
				onPageChange={onPageChange}
				sidePanelProps={sidePanelProps}
				emptyMessageTitle="Không tìm thấy Boss nào."
			>
				<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6'>
					{paginatedItems.map(item => (
						<Link
							key={item.bossID}
							to={`./${item.bossID}`}
							className='block hover:scale-105 transition-transform duration-200'
						>
							<GenericCard
								displayId={item.bossID}
								item={{
									...item,
									name: item.bossName,
									assetAbsolutePath: item.background,
								}}
								onClick={() => {}}
								customTooltip={
									<CustomBossTooltip
										bossID={item.bossID}
										powers={item.power}
										cachedData={cachedData}
										tUI={tUI}
									/>
								}
							/>
						</Link>
					))}
				</div>
			</AdminListLayout>
		);
	},
);

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
				{/* Đã sửa lỗi syntax comment tại đây */}
				{selectedItem && (
					<BossEditorForm
						item={selectedItem}
						cachedData={cachedData}
						onSave={onSave}
						onCancel={handleBack}
						onDelete={onDelete}
						isSaving={isSaving}
						isDragPanelOpen={isDragPanelOpen}
						onToggleDragPanel={() => setIsDragPanelOpen(!isDragPanelOpen)}
					/>
				)}
			</div>

			{/* Thanh Sidebar Kéo Thả */}
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
	const [powers, setPowers] = useState([]);
	const [searchInput, setSearchInput] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	const [sortOrder, setSortOrder] = useState("id-asc");
	const [currentPage, setCurrentPage] = useState(1);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [isDragPanelOpen, setIsDragPanelOpen] = useState(true);

	const API_BASE_URL = import.meta.env.VITE_API_URL;
	const navigate = useNavigate();
	const { tDynamic, tUI } = useTranslation();

	const fetchAllData = useCallback(async () => {
		try {
			setIsLoading(true);

			const [bossRes, powerRes] = await Promise.all([
				fetch(`${API_BASE_URL}/api/bosses`),
				fetch(`${API_BASE_URL}/api/powers?limit=-1`),
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

		const [field, dir] = sortOrder.split("-");
		result.sort((a, b) => {
			if (field === "id") {
				const A = String(a.bossID || "");
				const B = String(b.bossID || "");
				return dir === "asc" ? A.localeCompare(B) : B.localeCompare(A);
			}
			return 0;
		});

		return result;
	}, [items, searchTerm, sortOrder]);

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
			setSortOrder("id-asc");
			setCurrentPage(1);
		},
		sortOptions: [
			{ value: "id-asc", label: tUI("admin.common.sortIdAsc") },
			{ value: "id-desc", label: tUI("admin.common.sortIdDesc") },
		],
		sortSelectedValue: sortOrder,
		onSortChange: setSortOrder,
	};

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
							cachedData={cachedData}
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
