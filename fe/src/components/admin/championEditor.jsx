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

// Template khởi tạo cho tướng mới
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

// Thành phần hiển thị danh sách tướng (Grid View)
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
	},
);

// Thành phần bao bọc logic chỉnh sửa (Edit/New)
const ChampionEditWrapper = ({
	champions,
	constellations,
	cachedData,
	onSave,
	onDelete,
	isSaving,
}) => {
	const { id } = useParams();
	const navigate = useNavigate();

	// Lọc dữ liệu tướng được chọn hoặc dùng template mới
	const selectedChampion = useMemo(() => {
		if (id === "new") return { ...NEW_CHAMPION_TEMPLATE };
		return Array.isArray(champions)
			? champions.find(c => c.championID === id)
			: null;
	}, [id, champions]);

	// Lọc dữ liệu chòm sao tương ứng
	const selectedConstellation = useMemo(() => {
		return Array.isArray(constellations)
			? constellations.find(c => c.constellationID === id)
			: null;
	}, [id, constellations]);

	const handleBack = useCallback(() => {
		navigate("/admin/champions");
	}, [navigate]);

	if (
		!selectedChampion &&
		Array.isArray(champions) &&
		champions.length > 0 &&
		id !== "new"
	) {
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
						constellation={selectedConstellation}
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

function ChampionEditor() {
	const [champions, setChampions] = useState([]);
	const [constellations, setConstellations] = useState([]);
	const [bonusStars, setBonusStars] = useState([]); // State cho API bonusStars mới
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

	// Hàm tải toàn bộ dữ liệu từ các API cần thiết
	const fetchAllData = useCallback(async () => {
		try {
			setIsLoading(true);
			const [
				champRes,
				constRes,
				bonusRes,
				runeRes,
				relicRes,
				powerRes,
				itemRes,
			] = await Promise.all([
				fetch(`${API_BASE_URL}/api/champions?limit=1000`),
				fetch(`${API_BASE_URL}/api/constellations`),
				fetch(`${API_BASE_URL}/api/bonusStars`), // API bonusStars mới
				fetch(`${API_BASE_URL}/api/runes?limit=1000`),
				fetch(`${API_BASE_URL}/api/relics?limit=1000`),
				fetch(`${API_BASE_URL}/api/powers?limit=1000`),
				fetch(`${API_BASE_URL}/api/items?limit=1000`),
			]);

			const [
				champData,
				constData,
				bonusData,
				runeData,
				relicData,
				powerData,
				itemData,
			] = await Promise.all([
				champRes.json(),
				constRes.json(),
				bonusRes.json(),
				runeRes.json(),
				relicRes.json(),
				powerRes.json(),
				itemRes.json(),
			]);

			setChampions(champData.items || []);
			setConstellations(constData.items || []);
			setBonusStars(bonusData.items || []);
			setRunes(runeData.items || []);
			setRelics(relicData.items || []);
			setPowers(powerData.items || []);
			setItems(itemData.items || []);
		} catch (e) {
			setError("Không thể tải dữ liệu từ server.");
		} finally {
			setIsLoading(false);
		}
	}, [API_BASE_URL]);

	useEffect(() => {
		fetchAllData();
	}, [fetchAllData]);

	// Xử lý lưu đồng bộ lên 2 bảng dữ liệu
	const handleSaveChampion = async (champData, constData) => {
		setIsSaving(true);
		try {
			const token = localStorage.getItem("token");
			const headers = {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			};

			const [resChamp, resConst] = await Promise.all([
				fetch(`${API_BASE_URL}/api/champions`, {
					method: "PUT",
					headers,
					body: JSON.stringify(champData),
				}),
				fetch(`${API_BASE_URL}/api/constellations`, {
					method: "PUT",
					headers,
					body: JSON.stringify(constData),
				}),
			]);

			if (!resChamp.ok || !resConst.ok) {
				throw new Error("Lưu dữ liệu thất bại.");
			}

			await fetchAllData();
			navigate("/admin/champions");
			alert("Cập nhật tướng và chòm sao thành công!");
		} catch (e) {
			alert(e.message || "Đã có lỗi xảy ra");
		} finally {
			setIsSaving(false);
		}
	};

	// Xử lý xóa đồng bộ trên 2 bảng dữ liệu
	const handleDeleteChampion = async championID => {
		if (
			!window.confirm(
				"Bạn có chắc chắn muốn xóa tướng này? Chòm sao tương ứng cũng sẽ bị xóa.",
			)
		)
			return;
		setIsSaving(true);
		try {
			const token = localStorage.getItem("token");
			await Promise.all([
				fetch(`${API_BASE_URL}/api/champions/${championID}`, {
					method: "DELETE",
					headers: { Authorization: `Bearer ${token}` },
				}),
				fetch(`${API_BASE_URL}/api/constellations/${championID}`, {
					method: "DELETE",
					headers: { Authorization: `Bearer ${token}` },
				}),
			]);

			await fetchAllData();
			navigate("/admin/champions");
			alert("Đã xóa tướng và chòm sao thành công");
		} catch (e) {
			alert(e.message);
		} finally {
			setIsSaving(false);
		}
	};

	// Cấu hình các bộ lọc dựa trên dữ liệu hiện có
	const filterOptions = useMemo(() => {
		const safeChampions = Array.isArray(champions) ? champions : [];

		const regions = [...new Set(safeChampions.flatMap(c => c.regions || []))]
			.sort()
			.map(r => ({
				value: r,
				label: r,
				iconUrl: iconRegions.find(i => i.name === r)?.iconAbsolutePath || "",
			}));

		const costs = [...new Set(safeChampions.map(c => Number(c.cost)))]
			.filter(Boolean)
			.sort((a, b) => a - b);
		const maxStars = [...new Set(safeChampions.map(c => Number(c.maxStar)))]
			.filter(Boolean)
			.sort((a, b) => a - b);
		const tags = [...new Set(safeChampions.flatMap(c => c.tag || []))].sort();

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

	// Logic lọc và sắp xếp danh sách hiển thị
	const filteredChampions = useMemo(() => {
		let result = Array.isArray(champions) ? [...champions] : [];
		if (searchTerm) {
			const term = removeAccents(searchTerm.toLowerCase());
			result = result.filter(c =>
				removeAccents((c.name || "").toLowerCase()).includes(term),
			);
		}
		if (selectedRegions.length)
			result = result.filter(c =>
				c.regions?.some(r => selectedRegions.includes(r)),
			);
		if (selectedCosts.length)
			result = result.filter(c => selectedCosts.includes(Number(c.cost)));
		if (selectedMaxStars.length)
			result = result.filter(c => selectedMaxStars.includes(Number(c.maxStar)));
		if (selectedTags.length)
			result = result.filter(c => c.tag?.some(t => selectedTags.includes(t)));

		const [field, dir] = sortOrder.split("-");
		result.sort((a, b) => {
			const A = field === "name" ? a.name || "" : a[field] || "";
			const B = field === "name" ? b.name || "" : b[field] || "";
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
		currentPage * ITEMS_PER_PAGE,
	);

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
		onAddNew: () => navigate("new"),
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

	// Gom dữ liệu hỗ trợ vào cache để truyền cho các thành phần con
	const cachedData = { runes, relics, powers, items, bonusStars, regions: [] };

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
				<Route
					path=':id'
					element={
						<ChampionEditWrapper
							champions={champions}
							constellations={constellations}
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
