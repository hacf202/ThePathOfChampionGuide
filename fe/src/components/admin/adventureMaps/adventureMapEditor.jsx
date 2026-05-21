// src/components/admin/adventureMapEditor.jsx
import { useState, memo, useEffect, useCallback, useMemo } from "react";
import { useNavigate, Link, Routes, Route, useParams } from "react-router-dom";
import Button from "../../common/button";
import { removeAccents } from "../../../utils/vietnameseUtils";
import SidePanel from "../../common/sidePanel";
import DropDragSidePanel from "../common/dropSidePanel";
import AdventureMapEditorForm from "./adventureMapEditorForm";
import AdminListLayout from "../common/adminListLayout";
import { Loader2 } from "lucide-react";
import Swal from "sweetalert2";
import { useTranslation } from "../../../hooks/useTranslation";

// Đã thêm ghi chú cấu trúc ngầm định của Bosses để đồng bộ dữ liệu
const NEW_ADV_TEMPLATE = {
	adventureID: "",
	isNew: true,
	adventureName: "",
	typeAdventure: "",
	assetAbsolutePath: "",
	background: "",
	difficulty: 1,
	championXP: 0,
	specialRules: [],
	Bosses: [], // Cấu trúc khi thêm mới: { bossID: "", note: "", mapBonusPower: [] }
	nodes: [],
	requirement: { champions: [], regions: [] },
	rewards: [],
	translations: { en: { adventureName: "", typeAdventure: "" } },
};

const ITEMS_PER_PAGE = 20;

const AdvListView = memo(
	({
		paginatedItems,
		totalPages,
		currentPage,
		onPageChange,
		sidePanelProps,
	}) => {
		return (
			<AdminListLayout
				dataLength={paginatedItems.length}
				totalPages={totalPages}
				currentPage={currentPage}
				onPageChange={onPageChange}
				sidePanelProps={sidePanelProps}
				emptyMessageTitle="Không tìm thấy Adventure nào."
			>
				<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6'>
					{paginatedItems.map((item) => (
						<Link
							key={item.adventureID}
							to={`./${item.adventureID}`}
							className='block hover:scale-[1.02] transition-transform duration-200'
						>
							<div className='border border-border rounded-lg p-4 bg-surface-hover shadow-sm h-full flex flex-col'>
								<div className='relative w-full h-32 mb-3 bg-slate-900 rounded-md overflow-hidden'>
									<img
										src={item.assetAbsolutePath || item.background}
										alt={item.adventureName}
										className='w-full h-full object-contain'
									/>
								</div>
								<h3 className='font-bold text-lg text-primary-500'>
									{item.adventureName}
								</h3>
								<p className='text-sm text-text-secondary'>
									{item.typeAdventure} | Sao: {item.difficulty}
								</p>
							</div>
						</Link>
					))}
				</div>
			</AdminListLayout>
		);
	},
);

const AdvEditWrapper = ({
	items,
	cachedData,
	onSave,
	onDelete,
	isSaving,
	sidePanelProps,
	isDragPanelOpen,
	setIsDragPanelOpen,
}) => {
	const { id } = useParams();
	const navigate = useNavigate();

	const selectedItem = useMemo(() => {
		if (id === "new") return { ...NEW_ADV_TEMPLATE };
		const found = items.find(i => i.adventureID === id);
		return found ? { ...found, isNew: false } : null;
	}, [id, items]);

	const handleBack = useCallback(
		() => navigate("/admin/adventures"),
		[navigate],
	);

	if (!selectedItem && id !== "new" && items.length > 0) {
		return (
			<div className='flex flex-col items-center justify-center py-20'>
				<p className='text-xl mb-4'>Không tìm thấy ID {id}</p>
				<Button onClick={handleBack} variant='primary'>
					Quay lại
				</Button>
			</div>
		);
	}

	return (
		<div className='flex flex-col lg:flex-row items-stretch gap-6 relative transition-all duration-300'>
			<div
				className={`transition-all duration-300 ${isDragPanelOpen ? "lg:w-3/4 xl:w-4/5" : "w-full"} bg-surface-bg rounded-lg h-fit`}
			>
				{selectedItem && (
					<AdventureMapEditorForm
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
			{isDragPanelOpen && (
				<div className='lg:w-1/4 xl:w-1/5 shrink-0 transition-all duration-300 relative self-stretch'>
					<DropDragSidePanel cachedData={cachedData} onClose={handleBack} />
				</div>
			)}
		</div>
	);
};

function AdventureMapEditor() {
	const [items, setItems] = useState([]);
	const [powers, setPowers] = useState([]);
	const [bosses, setBosses] = useState([]);
	const [champions, setChampions] = useState([]);
	const [itemsData, setItemsData] = useState([]);
	const [cards, setCards] = useState([]);

	const [searchInput, setSearchInput] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [filterDifficulty, setFilterDifficulty] = useState([]);
	const [filterType, setFilterType] = useState([]);
	const [sortBy, setSortBy] = useState("diff_desc");
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [isDragPanelOpen, setIsDragPanelOpen] = useState(true);

	const { tUI } = useTranslation();

	const API_BASE_URL = import.meta.env.VITE_API_URL;
	const navigate = useNavigate();

	const fetchAllData = useCallback(async () => {
		try {
			setIsLoading(true);
			const timestamp = Date.now();
			const fetchOptions = { cache: "no-store" };
			const [advRes, powerRes, bossRes, champRes, itemRes, cardRes] = await Promise.all([
				fetch(`${API_BASE_URL}/api/adventures?limit=-1&t=${timestamp}`, fetchOptions),
				fetch(`${API_BASE_URL}/api/powers?limit=-1&t=${timestamp}`, fetchOptions),
				fetch(`${API_BASE_URL}/api/bosses?limit=-1&t=${timestamp}`, fetchOptions),
				fetch(`${API_BASE_URL}/api/champions?limit=-1&t=${timestamp}`, fetchOptions),
				fetch(`${API_BASE_URL}/api/items?limit=-1&t=${timestamp}`, fetchOptions),
				fetch(`${API_BASE_URL}/api/cards?limit=-1&t=${timestamp}`, fetchOptions),
			]);

			const [advData, powerData, bossData, champData, itemJson, cardData] =
				await Promise.all([
					advRes.json(),
					powerRes.json(),
					bossRes.json(),
					champRes.json(),
					itemRes.json(),
					cardRes.json(),
				]);

			setItems(advData.items || []);
			setPowers(powerData.items || []);
			setBosses(bossData.items || []);
			setChampions(champData.items || []);
			setItemsData(itemJson.items || []);
			setCards(cardData.items || []);
			setCards(cardData.items || []);
		} catch (e) {
			console.error(e);
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
			const res = await fetch(`${API_BASE_URL}/api/adventures`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(data),
			});
			if (!res.ok) throw new Error("Lưu thất bại.");
			await fetchAllData();
			navigate("/admin/adventures");
			
			Swal.fire({
				icon: "success",
				title: "Đã lưu!",
				text: "Bản đồ phiêu lưu đã được cập nhật thành công.",
				timer: 2000,
				showConfirmButton: false,
				toast: true,
				position: "top-end",
			});
		} catch (e) {
			Swal.fire({
				icon: "error",
				title: "Lỗi",
				text: e.message || "Không thể lưu dữ liệu.",
				confirmButtonColor: "#3b82f6",
			});
		} finally {
			setIsSaving(false);
		}
	};

	const handleDeleteItem = async id => {
		if (!id) return;
		
		const result = await Swal.fire({
			title: "Xác nhận xóa?",
			text: "Bạn sẽ không thể khôi phục lại bản đồ phiêu lưu này!",
			icon: "warning",
			showCancelButton: true,
			confirmButtonColor: "#ef4444",
			cancelButtonColor: "#6b7280",
			confirmButtonText: "Vâng, xóa nó!",
			cancelButtonText: "Hủy bỏ",
			background: "#1f2937",
			color: "#f3f4f6",
		});

		if (!result.isConfirmed) return;

		setIsSaving(true);
		try {
			const token = localStorage.getItem("token");
			await fetch(`${API_BASE_URL}/api/adventures/${id}`, {
				method: "DELETE",
				headers: { Authorization: `Bearer ${token}` },
			});
			await fetchAllData();
			navigate("/admin/adventures");
			
			Swal.fire({
				icon: "success",
				title: "Đã xóa!",
				text: "Bản đồ đã được loại bỏ.",
				timer: 2000,
				showConfirmButton: false,
				toast: true,
				position: "top-end",
			});
		} catch (e) {
			Swal.fire({
				icon: "error",
				title: "Lỗi",
				text: e.message || "Không thể xóa bản đồ.",
				confirmButtonColor: "#3b82f6",
			});
		} finally {
			setIsSaving(false);
		}
	};

	const filteredItems = useMemo(() => {
		let result = [...items];
		if (searchTerm) {
			const term = removeAccents(searchTerm.toLowerCase());
			result = result.filter(i =>
				removeAccents((i.adventureName || "").toLowerCase()).includes(term),
			);
		}
		
		if (filterDifficulty.length > 0) {
			result = result.filter(i => filterDifficulty.includes(String(i.difficulty)));
		}
		if (filterType.length > 0) {
			result = result.filter(i => filterType.includes(i.typeAdventure));
		}
		
		result.sort((a, b) => {
			if (sortBy === "id_asc") return String(a.adventureID).localeCompare(String(b.adventureID));
			if (sortBy === "id_desc") return String(b.adventureID).localeCompare(String(a.adventureID));
			if (sortBy === "xp_asc") return (a.championXP || 0) - (b.championXP || 0);
			if (sortBy === "xp_desc") return (b.championXP || 0) - (a.championXP || 0);
			if (sortBy === "diff_asc") return (a.difficulty || 0) - (b.difficulty || 0);
			if (sortBy === "diff_desc") return (b.difficulty || 0) - (a.difficulty || 0);
			return 0;
		});

		return result;
	}, [items, searchTerm, filterDifficulty, filterType, sortBy]);

	const uniqueDifficulties = useMemo(() => {
		const diffs = Array.from(new Set(items.map(i => i.difficulty).filter(d => d !== null && d !== undefined)));
		return diffs.sort((a, b) => a - b).map(d => ({ label: `${d} Sao`, value: String(d) }));
	}, [items]);

	const uniqueTypes = useMemo(() => {
		const types = Array.from(new Set(items.map(i => i.typeAdventure).filter(Boolean)));
		return types.sort().map(t => ({ label: t, value: t }));
	}, [items]);

	const sidePanelProps = {
		searchPlaceholder: "Tìm Adventure...",
		addLabel: "Thêm Adventure",
		resetLabel: "Xóa bộ lọc",
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
			setFilterDifficulty([]);
			setFilterType([]);
			setSortBy("diff_desc");
			setCurrentPage(1);
		},
		multiFilterConfigs: [
			{
				label: tUI("mapList.difficulty") || "Cấp Sao",
				placeholder: "Chọn cấp sao...",
				options: uniqueDifficulties,
				selectedValues: filterDifficulty,
				onChange: (vals) => {
					setFilterDifficulty(vals);
					setCurrentPage(1);
				},
			},
			{
				label: tUI("mapList.type") || "Loại Phiêu Lưu",
				placeholder: "Chọn loại...",
				options: uniqueTypes,
				selectedValues: filterType,
				onChange: (vals) => {
					setFilterType(vals);
					setCurrentPage(1);
				},
			},
		],
		sortOptions: [
			{ label: tUI("mapList.sort.difficultyDesc") || "Độ khó cao - thấp", value: "diff_desc" },
			{ label: tUI("mapList.sort.difficultyAsc") || "Độ khó thấp - cao", value: "diff_asc" },
			{ label: tUI("mapList.sort.championXPDesc") || "Kinh nghiệm cao - thấp", value: "xp_desc" },
			{ label: tUI("mapList.sort.championXPAsc") || "Kinh nghiệm thấp - cao", value: "xp_asc" },
			{ label: tUI("mapList.sort.adventureIDDesc") || "ID cao - thấp", value: "id_desc" },
			{ label: tUI("mapList.sort.adventureIDAsc") || "ID thấp - cao", value: "id_asc" },
		],
		sortSelectedValue: sortBy,
		onSortChange: val => {
			setSortBy(val);
			setCurrentPage(1);
		},
	};

	const cachedData = { powers, bosses, champions, items: itemsData, cards };

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
						<AdvListView
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
						<AdvEditWrapper
							items={items}
							cachedData={cachedData}
							onSave={handleSaveItem}
							onDelete={handleDeleteItem}
							isSaving={isSaving}
							sidePanelProps={sidePanelProps}
							isDragPanelOpen={isDragPanelOpen}
							setIsDragPanelOpen={setIsDragPanelOpen}
						/>
					}
				/>
			</Routes>
		</div>
	);
}

export default memo(AdventureMapEditor);
