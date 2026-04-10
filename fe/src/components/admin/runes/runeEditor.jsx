import { useState, memo, useEffect, useCallback, useMemo } from "react";
import { useNavigate, Link, Routes, Route, useParams } from "react-router-dom";
import GenericCard from "../../common/genericCard";
import Button from "../../common/button";
import { removeAccents } from "../../../utils/vietnameseUtils";
import SidePanel from "../../common/sidePanel";
import RuneEditorForm from "./runeEditorForm";
import { useTranslation } from "../../../hooks/useTranslation";

// IMPORT CÁC COMPONENT CHUNG
import AdminListLayout from "../common/adminListLayout";
import { LoadingState, ErrorState } from "../common/stateDisplays";

const NEW_RUNE_TEMPLATE = {
	runeCode: "",
	isNew: true,
	name: "",
	region: "",
	rarity: "",
	type: [],
	assetAbsolutePath: "",
	assetFullAbsolutePath: "",
	description: "",
	translations: {
		en: {
			name: "",
			region: "",
			rarity: "",
			description: "",
		},
	},
};

const ITEMS_PER_PAGE = 20;

const RARITY_WEIGHT = {
	Thường: 1,
	Common: 1,
	Hiếm: 2,
	Rare: 2,
	"Sử Thi": 3,
	Epic: 3,
	"Huyền Thoại": 4,
	Legendary: 4,
};

// === LIST VIEW COMPONENT ===
const RuneListView = memo(
	({
		paginatedRunes,
		totalPages,
		currentPage,
		onPageChange,
		sidePanelProps,
	}) => {
		const { tUI } = useTranslation();

		return (
			<AdminListLayout
				dataLength={paginatedRunes.length}
				totalPages={totalPages}
				currentPage={currentPage}
				onPageChange={onPageChange}
				sidePanelProps={sidePanelProps}
				emptyMessageTitle={tUI("admin.rune.notFound")}
				emptyMessageSub={
					tUI("admin.rune.tryOtherFilter")
				}
			>
				<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6'>
					{paginatedRunes.map(rune => (
						<Link
							key={rune.runeCode}
							to={`./${rune.runeCode}`}
							className='block hover:scale-105 transition-transform duration-200'
						>
							<GenericCard displayId={rune.runeCode} item={rune} onClick={() => {}} />
						</Link>
					))}
				</div>
			</AdminListLayout>
		);
	},
);

// === EDIT WRAPPER COMPONENT ===
const RuneEditWrapper = ({
	runes,
	onSave,
	onDelete,
	isSaving,
	sidePanelProps,
}) => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { tUI } = useTranslation();

	const selectedRune = useMemo(() => {
		if (id === "new") return { ...NEW_RUNE_TEMPLATE };
		const safeRunes = Array.isArray(runes) ? runes : [];
		const found = safeRunes.find(r => r.runeCode === id);
		return found ? { ...found, isNew: false } : null;
	}, [id, runes]);

	const handleBack = useCallback(() => navigate("/admin/runes"), [navigate]);

	if (
		!selectedRune &&
		id !== "new" &&
		Array.isArray(runes) &&
		runes.length > 0
	) {
		return (
			<div className='flex flex-col items-center justify-center py-20 text-text-secondary'>
				<p className='text-xl mb-4'>
					{tUI("admin.rune.notFoundId")} {id}
				</p>
				<Button onClick={handleBack} variant='primary'>
					{tUI("admin.common.backToList")}
				</Button>
			</div>
		);
	}

	return (
		<div className='flex flex-col lg:flex-row gap-6'>
			<div className='lg:w-4/5 bg-surface-bg rounded-lg'>
				{selectedRune && (
					<RuneEditorForm
						rune={selectedRune}
						onSave={onSave}
						onCancel={handleBack}
						onDelete={onDelete}
						isSaving={isSaving}
					/>
				)}
			</div>
			<div className='lg:w-1/5'>
				<SidePanel {...sidePanelProps} />
			</div>
		</div>
	);
};

// === MAIN COMPONENT ===
function RuneEditor() {
	const [runes, setRunes] = useState([]);
	const [searchInput, setSearchInput] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedRegions, setSelectedRegions] = useState([]);
	const [selectedRarities, setSelectedRarities] = useState([]);
	const [selectedTypes, setSelectedTypes] = useState([]);
	const [sortOrder, setSortOrder] = useState("name-asc");
	const [currentPage, setCurrentPage] = useState(1);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState(null);

	const API_BASE_URL = import.meta.env.VITE_API_URL;
	const navigate = useNavigate();
	const { tUI, tDynamic } = useTranslation();

	const fetchAllData = useCallback(async () => {
		try {
			setIsLoading(true);
			const res = await fetch(`${API_BASE_URL}/api/runes?limit=-1`);
			if (!res.ok) throw new Error(tUI("admin.common.errorLoad"));
			const data = await res.json();
			const runeList = Array.isArray(data) ? data : data.items || [];
			setRunes(runeList);
		} catch (e) {
			setError(tUI("admin.common.errorLoad"));
		} finally {
			setIsLoading(false);
		}
	}, [API_BASE_URL, tUI]);

	useEffect(() => {
		fetchAllData();
	}, [fetchAllData]);

	const handleSaveRune = async data => {
		setIsSaving(true);
		try {
			const token = localStorage.getItem("token");

			const payload = { ...data };
			if (
				!payload.translations?.en?.name &&
				!payload.translations?.en?.description &&
				!payload.translations?.en?.rarity &&
				!payload.translations?.en?.region
			) {
				delete payload.translations;
			}

			const res = await fetch(`${API_BASE_URL}/api/runes`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(payload),
			});

			const result = await res.json();
			if (!res.ok)
				throw new Error(result.error || tUI("admin.common.saveFailed"));

			await fetchAllData();
			navigate("/admin/runes");
			alert(result.message || tUI("admin.common.saveSuccess"));
		} catch (e) {
			alert(e.message || tUI("admin.common.errorOccurred"));
		} finally {
			setIsSaving(false);
		}
	};

	const handleDeleteRune = async id => {
		if (!id) return;
		setIsSaving(true);
		try {
			const token = localStorage.getItem("token");
			const res = await fetch(`${API_BASE_URL}/api/runes/${id}`, {
				method: "DELETE",
				headers: { Authorization: `Bearer ${token}` },
			});
			if (!res.ok) throw new Error(tUI("admin.common.deleteFailed"));

			await fetchAllData();
			navigate("/admin/runes");
			alert(tUI("admin.common.deleteSuccess"));
		} catch (e) {
			alert(e.message || tUI("admin.common.deleteFailed"));
		} finally {
			setIsSaving(false);
		}
	};

	const filterOptions = useMemo(() => {
		const regions = [
			...new Set(runes.map(r => r.region).filter(Boolean)),
		].sort();
		const rarities = [...new Set(runes.map(r => r.rarity).filter(Boolean))];
		rarities.sort((a, b) => (RARITY_WEIGHT[a] || 0) - (RARITY_WEIGHT[b] || 0));

		const types = [...new Set(runes.flatMap(r => Array.isArray(r.type) ? r.type : (r.type ? [r.type] : [])))]
			.filter(Boolean)
			.sort();

		return {
			regions: regions.map(r => ({ value: r, label: r })),
			rarities: rarities.map(r => ({ value: r, label: r })),
			types: types.map(t => ({ value: t, label: t })),
			sort: [
				{ value: "id-asc", label: tUI("admin.common.sortIdAsc") || "ID (Tăng dần)" },
				{ value: "id-desc", label: tUI("admin.common.sortIdDesc") || "ID (Giảm dần)" },
				{ value: "name-asc", label: tUI("admin.common.sortNameAsc") },
				{ value: "name-desc", label: tUI("admin.common.sortNameDesc") },
				{ value: "rarity-asc", label: tUI("admin.rune.sortRarityAsc") },
				{ value: "rarity-desc", label: tUI("admin.rune.sortRarityDesc") },
			],
		};
	}, [runes, tUI]);

	const filteredRunes = useMemo(() => {
		let result = [...runes];

		if (searchTerm) {
			const term = removeAccents(searchTerm.toLowerCase());
			result = result.filter(r => {
				const nameMatch = removeAccents(
					(tDynamic(r, "name") || "").toLowerCase(),
				).includes(term);
				const descMatch = removeAccents(
					(tDynamic(r, "description") || "").toLowerCase(),
				).includes(term);
				return nameMatch || descMatch;
			});
		}

		if (selectedRegions.length) {
			result = result.filter(r => selectedRegions.includes(r.region));
		}

		if (selectedRarities.length) {
			result = result.filter(r => selectedRarities.includes(r.rarity));
		}

		if (selectedTypes.length) {
			result = result.filter(r => {
				const rTypes = Array.isArray(r.type) ? r.type : (r.type ? [r.type] : []);
				return rTypes.some(t => selectedTypes.includes(t));
			});
		}

		const [field, dir] = sortOrder.split("-");
		result.sort((a, b) => {
			if (field === "id") {
				const A = String(a.runeCode || "");
				const B = String(b.runeCode || "");
				return dir === "asc" ? A.localeCompare(B) : B.localeCompare(A);
			} else if (field === "name") {
				const A = tDynamic(a, "name") || "";
				const B = tDynamic(b, "name") || "";
				return dir === "asc" ? A.localeCompare(B) : B.localeCompare(A);
			} else if (field === "rarity") {
				const A = RARITY_WEIGHT[a.rarity] || 0;
				const B = RARITY_WEIGHT[b.rarity] || 0;
				if (A === B) {
					const na = tDynamic(a, "name") || "";
					const nb = tDynamic(b, "name") || "";
					return na.localeCompare(nb);
				}
				return dir === "asc" ? A - B : B - A;
			}
			return 0;
		});

		return result;
	}, [
		runes,
		searchTerm,
		selectedRegions,
		selectedRarities,
		selectedTypes,
		sortOrder,
		tDynamic,
	]);

	const sidePanelProps = {
		searchPlaceholder: tUI("admin.rune.searchPlaceholder"),
		addLabel: tUI("admin.rune.addNew"),
		resetLabel: tUI("admin.rune.resetFilter"),
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
			setSelectedRarities([]);
			setSelectedTypes([]);
			setSortOrder("name-asc");
			setCurrentPage(1);
		},
		multiFilterConfigs: [
			{
				label: tUI("admin.rune.region"),
				options: filterOptions.regions,
				selectedValues: selectedRegions,
				onChange: setSelectedRegions,
				placeholder: tUI("admin.rune.allRegions"),
			},
			{
				label: tUI("admin.rune.rarity"),
				options: filterOptions.rarities,
				selectedValues: selectedRarities,
				onChange: setSelectedRarities,
				placeholder: tUI("admin.rune.allRarities"),
			},
			{
				label: tUI("admin.rune.type"),
				options: filterOptions.types,
				selectedValues: selectedTypes,
				onChange: setSelectedTypes,
				placeholder: tUI("admin.rune.allTypes"),
			},
		],
		sortOptions: filterOptions.sort,
		sortSelectedValue: sortOrder,
		onSortChange: setSortOrder,
	};

	if (isLoading) return <LoadingState text={tUI("admin.common.loading")} />;
	if (error) return <ErrorState message={error} />;

	return (
		<div className='font-secondary'>
			<Routes>
				<Route
					index
					element={
						<RuneListView
							paginatedRunes={filteredRunes.slice(
								(currentPage - 1) * ITEMS_PER_PAGE,
								currentPage * ITEMS_PER_PAGE,
							)}
							totalPages={Math.ceil(filteredRunes.length / ITEMS_PER_PAGE)}
							currentPage={currentPage}
							onPageChange={setCurrentPage}
							sidePanelProps={sidePanelProps}
						/>
					}
				/>
				<Route
					path=':id'
					element={
						<RuneEditWrapper
							runes={runes}
							onSave={handleSaveRune}
							onDelete={handleDeleteRune}
							isSaving={isSaving}
							sidePanelProps={sidePanelProps}
						/>
					}
				/>
			</Routes>
		</div>
	);
}

export default memo(RuneEditor);
