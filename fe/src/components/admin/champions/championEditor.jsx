// src/components/admin/championEditor.jsx
import { useState, memo, useEffect, useCallback, useMemo } from "react";
import { useNavigate, Link, Routes, Route, useParams } from "react-router-dom";
import ChampionCard from "../../champion/championCard.jsx";
import Button from "../../common/button";
import { removeAccents } from "../../../utils/vietnameseUtils";
import iconRegions from "../../../assets/data/icon.json";
import ChampionEditorForm from "./championEditorForm";
import DropDragSidePanel from "../common/dropSidePanel.jsx";
import { useTranslation } from "../../../hooks/useTranslation";

// IMPORT CÁC COMPONENT CHUNG
import AdminListLayout from "../common/adminListLayout.jsx";
import { LoadingState, ErrorState } from "../common/stateDisplays";

const NEW_CHAMPION_TEMPLATE = {
	championID: "",
	isNew: true,
	name: "Tướng Mới",
	cost: 1,
	maxStar: 6,
	description: "",
	regions: [],
	tags: [],
	powerStarIds: [],
	adventurePowerIds: [],
	itemIds: [],
	relicSets: [[]],
	runeIds: [],
	startingDeck: { baseCards: [], referenceCards: [] },
	assets: [{ fullAbsolutePath: "", gameAbsolutePath: "", avatar: "" }],
	videoLink: "",
	translations: {
		en: {
			name: "",
			description: "",
			regions: [],
			tags: [],
		},
	},
};

const ITEMS_PER_PAGE = 20;

// Thành phần hiển thị danh sách tướng (Grid View) - ĐÃ ÁP DỤNG AdminListLayout
const ChampionListView = memo(
	({
		paginatedChampions,
		totalPages,
		currentPage,
		onPageChange,
		sidePanelProps,
	}) => {
		const { tUI } = useTranslation();

		return (
			<AdminListLayout
				dataLength={paginatedChampions.length}
				totalPages={totalPages}
				currentPage={currentPage}
				onPageChange={onPageChange}
				sidePanelProps={sidePanelProps}
				emptyMessageTitle={tUI("common.notFound")}
				emptyMessageSub={tUI("admin.build.tryOtherFilter")}
			>
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
			</AdminListLayout>
		);
	},
);

const ChampionEditWrapper = ({
	champions,
	constellations,
	cachedData,
	onSave,
	onDelete,
	isSaving,
	isDragPanelOpen,
	setIsDragPanelOpen,
}) => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { tUI } = useTranslation();
	const [fullChampionData, setFullChampionData] = useState(null);
	const [isDetailLoading, setIsDetailLoading] = useState(false);
	const API_BASE_URL = import.meta.env.VITE_API_URL;

	// Fetch chi tiết khi id thay đổi (để lấy communityRatings)
	useEffect(() => {
		if (id && id !== "new") {
			const fetchDetail = async () => {
				try {
					setIsDetailLoading(true);
					const res = await fetch(`${API_BASE_URL}/api/champions/${id}`);
					if (res.ok) {
						const data = await res.json();
						setFullChampionData(data);
					}
				} catch (err) {
					console.error("Lỗi khi tải chi tiết tướng cho Admin:", err);
				} finally {
					setIsDetailLoading(false);
				}
			};
			fetchDetail();
		} else {
			setFullChampionData(null);
		}
	}, [id, API_BASE_URL]);

	const selectedChampion = useMemo(() => {
		if (id === "new") return { ...NEW_CHAMPION_TEMPLATE };
		// Ưu tiên dùng fullChampionData nếu đã tải xong, nếu chưa thì dùng tạm từ danh sách cached
		if (fullChampionData && fullChampionData.championID === id) return fullChampionData;
		return Array.isArray(champions)
			? champions.find(c => c.championID === id)
			: null;
	}, [id, champions, fullChampionData]);

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
				<p className='text-xl mb-4'>
					{tUI("admin.build.notFoundId")} {id}
				</p>
				<Button onClick={handleBack} variant='primary'>
					{tUI("admin.common.backToList")}
				</Button>
			</div>
		);
	}

	return (
		<div className='flex flex-col lg:flex-row items-stretch gap-6 relative transition-all duration-300'>
			<div
				className={`transition-all duration-300 ${isDragPanelOpen ? "lg:w-3/4 xl:w-4/5" : "w-full"} bg-surface-bg rounded-lg h-fit`}
			>
				{selectedChampion && (
					<ChampionEditorForm
						champion={selectedChampion}
						constellation={selectedConstellation}
						cachedData={cachedData}
						onSave={onSave}
						onCancel={handleBack}
						onDelete={onDelete}
						isSaving={isSaving}
						isDetailLoading={isDetailLoading}
						isDragPanelOpen={isDragPanelOpen}
						onToggleDragPanel={() => setIsDragPanelOpen(!isDragPanelOpen)}
					/>
				)}
			</div>

			{/* Thanh Sidebar Kéo Thả */}
			{isDragPanelOpen && (
				<div className='lg:w-1/4 xl:w-1/5 shrink-0 transition-all duration-300 relative self-stretch'>
					<DropDragSidePanel cachedData={cachedData} onClose={handleBack} />
				</div>
			)}
		</div>
	);
};

function ChampionEditor() {
	const { tUI, tDynamic } = useTranslation();
	const [champions, setChampions] = useState([]);
	const [constellations, setConstellations] = useState([]);
	const [bonusStars, setBonusStars] = useState([]);
	const [runes, setRunes] = useState([]);
	const [relics, setRelics] = useState([]);
	const [powers, setPowers] = useState([]);
	const [items, setItems] = useState([]);
	const [cards, setCards] = useState([]);

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

	const [isDragPanelOpen, setIsDragPanelOpen] = useState(true);

	const API_BASE_URL = import.meta.env.VITE_API_URL;
	const navigate = useNavigate();

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
				cardRes,
			] = await Promise.all([
				fetch(`${API_BASE_URL}/api/champions?limit=-1`),
				fetch(`${API_BASE_URL}/api/constellations`),
				fetch(`${API_BASE_URL}/api/bonusStars`),
				fetch(`${API_BASE_URL}/api/runes?limit=-1`),
				fetch(`${API_BASE_URL}/api/relics?limit=-1`),
				fetch(`${API_BASE_URL}/api/powers?limit=-1`),
				fetch(`${API_BASE_URL}/api/items?limit=-1`),
				fetch(`${API_BASE_URL}/api/cards?limit=-1`),
			]);

			const [
				champData,
				constData,
				bonusData,
				runeData,
				relicData,
				powerData,
				itemData,
				cardData,
			] = await Promise.all([
				champRes.json(),
				constRes.json(),
				bonusRes.json(),
				runeRes.json(),
				relicRes.json(),
				powerRes.json(),
				itemRes.json(),
				cardRes.json(),
			]);

			setChampions(champData.items || []);
			setConstellations(constData.items || []);
			setBonusStars(bonusData.items || []);
			setRunes(runeData.items || []);
			setRelics(relicData.items || []);
			setPowers(powerData.items || []);
			setItems(itemData.items || []);
			setCards(cardData.items || []);
		} catch (e) {
			setError(tUI("admin.common.errorLoad"));
		} finally {
			setIsLoading(false);
		}
	}, [API_BASE_URL, tUI]);

	useEffect(() => {
		fetchAllData();
	}, [fetchAllData]);

	const handleSaveChampion = async (champData, constData) => {
		setIsSaving(true);
		try {
			const token = localStorage.getItem("token");
			const headers = {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			};

			const resChamp = await fetch(`${API_BASE_URL}/api/champions`, {
				method: "PUT",
				headers,
				body: JSON.stringify(champData),
			});
			const champResult = await resChamp.json();

			if (!resChamp.ok)
				throw new Error(champResult.error || tUI("admin.common.errorOccurred"));

			if (constData && Object.keys(constData).length > 0) {
				const resConst = await fetch(`${API_BASE_URL}/api/constellations`, {
					method: "PUT",
					headers,
					body: JSON.stringify(constData),
				});

				if (!resConst.ok) {
					throw new Error(
						"Tướng đã lưu nhưng lưu Chòm sao thất bại. Vui lòng kiểm tra lại.",
					);
				}
			}

			await fetchAllData();
			navigate("/admin/champions");
			alert(tUI("admin.common.saveSuccess"));
		} catch (e) {
			alert(e.message);
		} finally {
			setIsSaving(false);
		}
	};

	const handleDeleteChampion = async championID => {
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
			alert(tUI("admin.common.deleteSuccess"));
		} catch (e) {
			alert(e.message);
		} finally {
			setIsSaving(false);
		}
	};

	const filterOptions = useMemo(() => {
		const safeChampions = Array.isArray(champions) ? champions : [];

		const regions = [...new Set(safeChampions.flatMap(c => c.regions || []))]
			.sort()
			.map(r => ({
				value: r,
				label: r,
				iconUrl: iconRegions.find(i => i.name === r)?.image || "",
			}));

		const costs = [...new Set(safeChampions.map(c => Number(c.cost)))]
			.filter(Boolean)
			.sort((a, b) => a - b);
		const maxStars = [...new Set(safeChampions.map(c => Number(c.maxStar)))]
			.filter(Boolean)
			.sort((a, b) => a - b);
		const tags = [...new Set(safeChampions.flatMap(c => c.tags || []))].sort();

		return {
			regions,
			costs: costs.map(c => ({ value: c, label: `${c} Mana` })),
			maxStars: maxStars.map(s => ({ value: s, label: `${s} Star` })),
			tags: tags.map(t => ({ value: t, label: t })),
			sort: [
				{ value: "id-asc", label: tUI("admin.common.sortIdAsc") || "ID (Tăng dần)" },
				{ value: "id-desc", label: tUI("admin.common.sortIdDesc") || "ID (Giảm dần)" },
				{ value: "name-asc", label: tUI("sort.nameAsc") },
				{ value: "name-desc", label: tUI("sort.nameDesc") },
				{ value: "cost-asc", label: tUI("sort.costAsc") },
				{ value: "cost-desc", label: tUI("sort.costDesc") },
			],
		};
	}, [champions, tUI]);

	const filteredChampions = useMemo(() => {
		let result = Array.isArray(champions) ? [...champions] : [];
		if (searchTerm) {
			const term = removeAccents(searchTerm.toLowerCase());
			result = result.filter(c =>
				removeAccents((tDynamic(c, "name") || "").toLowerCase()).includes(term),
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
			result = result.filter(c => c.tags?.some(t => selectedTags.includes(t)));

		const [field, dir] = sortOrder.split("-");
		result.sort((a, b) => {
			if (field === "id") {
				const A = String(a.championID || "");
				const B = String(b.championID || "");
				return dir === "asc" ? A.localeCompare(B) : B.localeCompare(A);
			} else {
				const A = field === "name" ? tDynamic(a, "name") || "" : a[field] || "";
				const B = field === "name" ? tDynamic(b, "name") || "" : b[field] || "";
				return dir === "asc" ? (A > B ? 1 : -1) : A < B ? 1 : -1;
			}
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
		tDynamic,
	]);

	const totalPages = Math.ceil(filteredChampions.length / ITEMS_PER_PAGE);
	const paginatedChampions = filteredChampions.slice(
		(currentPage - 1) * ITEMS_PER_PAGE,
		currentPage * ITEMS_PER_PAGE,
	);

	const sidePanelProps = {
		searchPlaceholder: tUI("championList.searchPlaceholder"),
		addLabel: tUI("common.addNew"),
		resetLabel: tUI("championList.resetFilter"),
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
				label: tUI("championList.region"),
				options: filterOptions.regions,
				selectedValues: selectedRegions,
				onChange: setSelectedRegions,
				placeholder: tUI("common.all"),
			},
			{
				label: tUI("championList.cost"),
				options: filterOptions.costs,
				selectedValues: selectedCosts,
				onChange: setSelectedCosts,
				placeholder: tUI("common.all"),
			},
			{
				label: tUI("championList.maxStars"),
				options: filterOptions.maxStars,
				selectedValues: selectedMaxStars,
				onChange: setSelectedMaxStars,
				placeholder: tUI("common.all"),
			},
			{
				label: tUI("championList.tags"),
				options: filterOptions.tags,
				selectedValues: selectedTags,
				onChange: setSelectedTags,
				placeholder: tUI("common.all"),
			},
		],
		sortOptions: filterOptions.sort,
		sortSelectedValue: sortOrder,
		onSortChange: setSortOrder,
	};

	const cachedData = { runes, relics, powers, items, cards, bonusStars, regions: [] };

	// SỬ DỤNG COMPONENT LoadingState VÀ ErrorState
	if (isLoading) return <LoadingState text={tUI("common.loading")} />;
	if (error) return <ErrorState message={error} />;

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
							isDragPanelOpen={isDragPanelOpen}
							setIsDragPanelOpen={setIsDragPanelOpen}
						/>
					}
				/>
			</Routes>
		</div>
	);
}

export default memo(ChampionEditor);
