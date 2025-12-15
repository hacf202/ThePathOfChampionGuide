// src/pages/admin/championEditor.jsx
import { useState, memo, useEffect, useCallback, useMemo } from "react";
import { useNavigate, Link, Routes, Route, useParams } from "react-router-dom";
import ChampionCard from "../champion/championCard";
import Button from "../common/button";
import { removeAccents } from "../../utils/vietnameseUtils";
import iconRegions from "../../assets/data/iconRegions.json";
import ChampionEditorForm from "./championEditorForm";
import SidePanel from "../common/sidePanel";
import DropDragSidePanel from "./dropSidePanel.jsx";
import { Loader2 } from "lucide-react";

const NEW_CHAMPION_TEMPLATE = {
	championID: "",
	isNew: true,
	name: "Tướng Mới",
	cost: 1,
	maxStar: 3,
	description: "",
	regions: [],
	regionRefs: [],
	tag: [],
	powerStars: [],
	bonusStars: [],
	adventurePowers: [],
	defaultItems: [],
	defaultRelicsSet1: [],
	defaultRelicsSet2: [],
	defaultRelicsSet3: [],
	defaultRelicsSet4: [],
	defaultRelicsSet5: [],
	defaultRelicsSet6: [],
	rune: [],
	startingDeck: [],
	assets: [{ fullAbsolutePath: "", gameAbsolutePath: "", avatar: "" }],
	videoLink: "",
};

const ITEMS_PER_PAGE = 20;

// === COMPONENT DANH SÁCH (LIST VIEW) ===
const ChampionListView = memo(
	({
		paginatedChampions,
		totalPages,
		currentPage,
		onPageChange,
		sidePanelProps,
	}) => {
		return (
			<div className='flex flex-col lg:flex-row gap-6'>
				<div className='lg:w-4/5 bg-surface-bg rounded-lg p-4'>
					{paginatedChampions.length > 0 ? (
						<div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6'>
							{paginatedChampions.map(champion => (
								<Link
									key={champion.championID}
									to={`./${champion.championID}`}
									className='block hover:scale-105 transition-transform duration-200'
								>
									<ChampionCard champion={champion} />
								</Link>
							))}
						</div>
					) : (
						<div className='flex items-center justify-center h-full min-h-[300px] text-center text-text-secondary'>
							<div>
								<p className='font-semibold text-lg'>
									Không tìm thấy tướng nào phù hợp.
								</p>
								<p>Vui lòng thử lại với bộ lọc khác.</p>
							</div>
						</div>
					)}

					{totalPages > 1 && (
						<div className='mt-8 flex justify-center items-center gap-2 md:gap-4'>
							<Button
								onClick={() => onPageChange(currentPage - 1)}
								disabled={currentPage === 1}
								variant='outline'
							>
								Trang trước
							</Button>
							<span className='text-lg font-medium text-text-primary'>
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
				<div className='lg:w-1/5'>
					<SidePanel {...sidePanelProps} />
				</div>
			</div>
		);
	}
);

// === COMPONENT EDIT WRAPPER ===
const ChampionEditWrapper = ({
	champions,
	cachedData,
	onSave,
	onDelete,
	isSaving,
}) => {
	const { id } = useParams(); // 'id' sẽ là "new" hoặc mã tướng (VD: C056)
	const navigate = useNavigate();

	const selectedChampion = useMemo(() => {
		if (id === "new") return { ...NEW_CHAMPION_TEMPLATE };
		return champions.find(c => c.championID === id);
	}, [id, champions]);

	// Callback quay lại
	const handleBack = useCallback(() => {
		navigate("/admin/champions");
	}, [navigate]);

	// Logic hiển thị lỗi khi không tìm thấy ID hợp lệ
	if (!selectedChampion && champions.length > 0) {
		return (
			<div className='flex flex-col items-center justify-center py-20 text-text-secondary'>
				<p className='text-xl mb-4'>Không tìm thấy tướng có ID: {id}</p>
				<Button onClick={handleBack} variant='primary'>
					Quay lại danh sách
				</Button>
			</div>
		);
	}

	return (
		<div className='flex flex-col lg:flex-row gap-6'>
			<div className='lg:w-4/5 bg-surface-bg rounded-lg'>
				{selectedChampion && (
					<ChampionEditorForm
						champion={selectedChampion}
						cachedData={cachedData}
						onSave={onSave}
						onCancel={handleBack}
						onDelete={onDelete}
						isSaving={isSaving}
					/>
				)}
			</div>
			<div className='lg:w-1/5'>
				<DropDragSidePanel cachedData={cachedData} onClose={handleBack} />
			</div>
		</div>
	);
};

// === MAIN COMPONENT ===
function ChampionEditor() {
	const [champions, setChampions] = useState([]);
	const [runes, setRunes] = useState([]);
	const [relics, setRelics] = useState([]);
	const [powers, setPowers] = useState([]);
	const [items, setItems] = useState([]);

	const [searchInput, setSearchInput] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedRegions, setSelectedRegions] = useState([]);
	const [selectedCosts, setSelectedCosts] = useState([]);
	const [selectedMaxStars, setSelectedMaxStars] = useState([]);
	const [selectedTags, setSelectedTags] = useState([]);
	const [sortOrder, setSortOrder] = useState("name-asc");
	const [currentPage, setCurrentPage] = useState(1);

	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState(null);

	const API_BASE_URL = import.meta.env.VITE_API_URL;
	const navigate = useNavigate();

	const fetchAllData = useCallback(async () => {
		try {
			setIsLoading(true);
			const [champRes, runeRes, relicRes, powerRes, itemRes] =
				await Promise.all([
					fetch(`${API_BASE_URL}/api/champions`),
					fetch(`${API_BASE_URL}/api/runes`),
					fetch(`${API_BASE_URL}/api/relics`),
					fetch(`${API_BASE_URL}/api/powers`),
					fetch(`${API_BASE_URL}/api/items`),
				]);

			if (![champRes, runeRes, relicRes, powerRes, itemRes].every(r => r.ok)) {
				throw new Error("Không thể tải dữ liệu");
			}

			const [champData, runeData, relicData, powerData, itemData] =
				await Promise.all([
					champRes.json(),
					runeRes.json(),
					relicRes.json(),
					powerRes.json(),
					itemRes.json(),
				]);

			setChampions(champData);
			setRunes(runeData);
			setRelics(relicData);
			setPowers(powerData);
			setItems(itemData);
		} catch (e) {
			setError("Không thể tải dữ liệu từ server.");
		} finally {
			setIsLoading(false);
		}
	}, [API_BASE_URL]);

	useEffect(() => {
		fetchAllData();
	}, [fetchAllData]);

	const filterOptions = useMemo(() => {
		const regions = [...new Set(champions.flatMap(c => c.regions || []))]
			.sort()
			.map(r => ({
				value: r,
				label: r,
				iconUrl: iconRegions.find(i => i.name === r)?.iconAbsolutePath || "",
			}));

		const costs = [...new Set(champions.map(c => c.cost))].sort(
			(a, b) => a - b
		);
		const maxStars = [...new Set(champions.map(c => c.maxStar))].sort(
			(a, b) => a - b
		);
		const tags = [...new Set(champions.flatMap(c => c.tag || []))].sort();

		return {
			regions,
			costs: costs.map(c => ({ value: c, label: `${c} Mana` })),
			maxStars: maxStars.map(s => ({ value: s, label: `${s} Star` })),
			tags: tags.map(t => ({ value: t, label: t })),
			sort: [
				{ value: "name-asc", label: "Tên A-Z" },
				{ value: "name-desc", label: "Tên Z-A" },
				{ value: "cost-asc", label: "Mana thấp → cao" },
				{ value: "cost-desc", label: "Mana cao → thấp" },
			],
		};
	}, [champions]);

	const filteredChampions = useMemo(() => {
		let result = [...champions];
		if (searchTerm) {
			const term = removeAccents(searchTerm.toLowerCase());
			result = result.filter(c =>
				removeAccents(c.name.toLowerCase()).includes(term)
			);
		}
		if (selectedRegions.length)
			result = result.filter(c =>
				c.regions?.some(r => selectedRegions.includes(r))
			);
		if (selectedCosts.length)
			result = result.filter(c => selectedCosts.includes(c.cost));
		if (selectedMaxStars.length)
			result = result.filter(c => selectedMaxStars.includes(c.maxStar));
		if (selectedTags.length)
			result = result.filter(c => c.tag?.some(t => selectedTags.includes(t)));

		const [field, dir] = sortOrder.split("-");
		result.sort((a, b) => {
			const A = field === "name" ? a.name : a[field];
			const B = field === "name" ? b.name : b[field];
			return dir === "asc" ? (A > B ? 1 : -1) : A < B ? 1 : -1;
		});
		return result;
	}, [
		champions,
		searchTerm,
		selectedRegions,
		selectedCosts,
		selectedMaxStars,
		selectedTags,
		sortOrder,
	]);

	const totalPages = Math.ceil(filteredChampions.length / ITEMS_PER_PAGE);
	const paginatedChampions = filteredChampions.slice(
		(currentPage - 1) * ITEMS_PER_PAGE,
		currentPage * ITEMS_PER_PAGE
	);

	const handleSaveChampion = async data => {
		setIsSaving(true);
		try {
			const token = localStorage.getItem("token");

			// === LOGIC XỬ LÝ LƯU (KHỚP VỚI BACKEND CŨ) ===
			// Backend cũ dùng chung 1 endpoint PUT cho cả tạo mới và sửa
			const method = "PUT";
			const url = `${API_BASE_URL}/api/champions`;

			const res = await fetch(url, {
				method,
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				// Gửi toàn bộ data bao gồm isNew để backend xử lý
				body: JSON.stringify(data),
			});

			if (!res.ok) {
				let errorMessage = "Lưu thất bại.";
				try {
					const errorBody = await res.json();
					errorMessage = errorBody.error || errorBody.message || errorMessage;
				} catch (e) {
					errorMessage = `Lỗi Server: ${res.status} ${res.statusText}`;
				}
				throw new Error(errorMessage);
			}

			await fetchAllData();
			navigate("/admin/champions");
			alert(
				data.isNew ? "Tạo tướng mới thành công" : "Cập nhật tướng thành công"
			);
		} catch (e) {
			alert(e.message || "Đã có lỗi xảy ra");
		} finally {
			setIsSaving(false);
		}
	};

	const handleDeleteChampion = async championID => {
		setIsSaving(true);
		try {
			const token = localStorage.getItem("token");
			const res = await fetch(`${API_BASE_URL}/api/champions/${championID}`, {
				method: "DELETE",
				headers: { Authorization: `Bearer ${token}` },
			});
			if (!res.ok) throw new Error("Xóa thất bại");

			await fetchAllData();
			navigate("/admin/champions");
			alert("Đã xóa tướng thành công");
		} catch (e) {
			alert(e.message);
		} finally {
			setIsSaving(false);
		}
	};

	const sidePanelProps = {
		searchPlaceholder: "Nhập tên tướng...",
		addLabel: "Thêm Tướng Mới",
		resetLabel: "Đặt lại bộ lọc",
		searchInput,
		onSearchInputChange: e => setSearchInput(e.target.value),
		onSearch: () => {
			setSearchTerm(searchInput.trim());
			setCurrentPage(1);
		},
		onClearSearch: () => {
			setSearchInput("");
			setSearchTerm("");
		},
		onAddNew: () => navigate("new"), // Điều hướng đến /new
		onResetFilters: () => {
			setSearchInput("");
			setSearchTerm("");
			setSelectedRegions([]);
			setSelectedCosts([]);
			setSelectedMaxStars([]);
			setSelectedTags([]);
			setSortOrder("name-asc");
			setCurrentPage(1);
		},
		multiFilterConfigs: [
			{
				label: "Vùng",
				options: filterOptions.regions,
				selectedValues: selectedRegions,
				onChange: setSelectedRegions,
				placeholder: "Tất cả Vùng",
			},
			{
				label: "Năng lượng",
				options: filterOptions.costs,
				selectedValues: selectedCosts,
				onChange: setSelectedCosts,
				placeholder: "Tất cả Năng lượng",
			},
			{
				label: "Số sao tối đa",
				options: filterOptions.maxStars,
				selectedValues: selectedMaxStars,
				onChange: setSelectedMaxStars,
				placeholder: "Tất cả Sao",
			},
			{
				label: "Thẻ",
				options: filterOptions.tags,
				selectedValues: selectedTags,
				onChange: setSelectedTags,
				placeholder: "Tất cả Thẻ",
			},
		],
		sortOptions: filterOptions.sort,
		sortSelectedValue: sortOrder,
		onSortChange: setSortOrder,
	};

	const cachedData = { runes, relics, powers, items, regions: [] };

	if (isLoading) {
		return (
			<div className='flex flex-col items-center justify-center min-h-[400px] text-text-secondary'>
				<Loader2 className='animate-spin text-primary-500' size={48} />
				<div className='text-lg mt-4'>Đang tải dữ liệu...</div>
			</div>
		);
	}

	if (error) {
		return <div className='text-center p-10 text-red-500'>{error}</div>;
	}

	return (
		<div className='font-secondary'>
			<Routes>
				<Route
					index
					element={
						<ChampionListView
							paginatedChampions={paginatedChampions}
							totalPages={totalPages}
							currentPage={currentPage}
							onPageChange={setCurrentPage}
							sidePanelProps={sidePanelProps}
						/>
					}
				/>
				{/* GỘP ROUTE: :id sẽ bắt cả trường hợp "new" và "Cxxx" */}
				<Route
					path=':id'
					element={
						<ChampionEditWrapper
							champions={champions}
							cachedData={cachedData}
							onSave={handleSaveChampion}
							onDelete={handleDeleteChampion}
							isSaving={isSaving}
						/>
					}
				/>
			</Routes>
		</div>
	);
}

export default memo(ChampionEditor);
