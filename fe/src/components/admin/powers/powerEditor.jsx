// src/pages/admin/powerEditor.jsx
import { useState, memo, useEffect, useCallback, useMemo } from "react";
import { useNavigate, Link, Routes, Route, useParams } from "react-router-dom";
import GenericCard from "../../common/genericCard";
import SidePanel from "../../common/sidePanel";
import PowerEditorForm from "./powerEditorForm";
import { removeAccents } from "../../../utils/vietnameseUtils";
import { useTranslation } from "../../../hooks/useTranslation";

// IMPORT CÁC COMPONENT CHUNG
import AdminListLayout from "../common/adminListLayout";
import { LoadingState, ErrorState } from "../common/stateDisplays";

const NEW_POWER_TEMPLATE = {
	powerCode: "",
	isNew: true,
	name: "",
	rarity: "",
	description: "",
	type: [],
	assetAbsolutePath: "",
	assetFullAbsolutePath: "",
	translations: {
		en: {
			name: "",
			rarity: "",
			description: "",
		},
	},
};

const ITEMS_PER_PAGE = 21;

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

// === LIST VIEW COMPONENT === Đã áp dụng AdminListLayout
const PowerListView = memo(
	({
		paginatedPowers,
		totalPages,
		currentPage,
		onPageChange,
		sidePanelProps,
	}) => {
		const { tUI } = useTranslation();

		return (
			<AdminListLayout
				dataLength={paginatedPowers.length}
				totalPages={totalPages}
				currentPage={currentPage}
				onPageChange={onPageChange}
				sidePanelProps={sidePanelProps}
				emptyMessageTitle={
					tUI("admin.power.notFound")
				}
				emptyMessageSub={
					tUI("admin.power.tryOtherFilter")
				}
			>
				<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6'>
					{paginatedPowers.map(power => (
						<Link
							key={power.powerCode}
							to={`./${power.powerCode}`}
							// Thêm 'relative group' để xử lý tooltip hover
							className='block hover:scale-105 transition-transform duration-200 relative group'
						>
							<GenericCard displayId={power.powerCode} item={power} onClick={() => {}} />

							{/* Tooltip hiển thị ID khi hover */}
							<div className='absolute top-2 right-2 bg-gray-900/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10'>
								ID: {power.powerCode}
							</div>
						</Link>
					))}
				</div>
			</AdminListLayout>
		);
	},
);

// === EDIT WRAPPER COMPONENT ===
const PowerEditWrapper = ({
	powers,
	onSave,
	onDelete,
	isSaving,
	sidePanelProps,
}) => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { tUI } = useTranslation();

	const selectedPower = useMemo(() => {
		if (id === "new") return { ...NEW_POWER_TEMPLATE };
		const safePowers = Array.isArray(powers) ? powers : [];
		const found = safePowers.find(p => p.powerCode === id);
		return found ? { ...found, isNew: false } : null;
	}, [id, powers]);

	const handleBack = useCallback(() => navigate("/admin/powers"), [navigate]);

	if (
		!selectedPower &&
		id !== "new" &&
		Array.isArray(powers) &&
		powers.length > 0
	) {
		return (
			<div className='flex flex-col items-center justify-center py-20 text-text-secondary'>
				<p className='text-xl mb-4'>
					{tUI("admin.power.notFoundId")} {id}
				</p>
				<button onClick={handleBack} className='btn-primary'>
					{tUI("admin.common.backToList")}
				</button>
			</div>
		);
	}

	return (
		<div className='flex flex-col lg:flex-row gap-6'>
			<div className='lg:w-4/5 bg-surface-bg rounded-lg'>
				{selectedPower && (
					<PowerEditorForm
						power={selectedPower}
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
function PowerEditor() {
	const [powers, setPowers] = useState([]);
	const [searchInput, setSearchInput] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
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
			const res = await fetch(`${API_BASE_URL}/api/powers?limit=1000`);
			if (!res.ok) throw new Error(tUI("admin.common.errorLoad"));
			const data = await res.json();
			const powerList = Array.isArray(data) ? data : data.items || [];
			setPowers(powerList);
		} catch (e) {
			setError(tUI("admin.common.errorLoad"));
		} finally {
			setIsLoading(false);
		}
	}, [API_BASE_URL, tUI]);

	useEffect(() => {
		fetchAllData();
	}, [fetchAllData]);

	const handleSavePower = async data => {
		setIsSaving(true);
		try {
			const token = localStorage.getItem("token");

			const payload = { ...data };
			if (
				!payload.translations?.en?.name &&
				!payload.translations?.en?.description &&
				!payload.translations?.en?.rarity
			) {
				delete payload.translations;
			}

			const res = await fetch(`${API_BASE_URL}/api/powers`, {
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
			navigate("/admin/powers");
			alert(result.message || tUI("admin.common.saveSuccess"));
		} catch (e) {
			alert(e.message || tUI("admin.common.errorOccurred"));
		} finally {
			setIsSaving(false);
		}
	};

	const handleDeletePower = async id => {
		if (!id) return;
		setIsSaving(true);
		try {
			const token = localStorage.getItem("token");
			const res = await fetch(`${API_BASE_URL}/api/powers/${id}`, {
				method: "DELETE",
				headers: { Authorization: `Bearer ${token}` },
			});
			if (!res.ok) throw new Error(tUI("admin.common.deleteFailed"));

			await fetchAllData();
			navigate("/admin/powers");
			alert(tUI("admin.common.deleteSuccess"));
		} catch (e) {
			alert(e.message || tUI("admin.common.deleteFailed"));
		} finally {
			setIsSaving(false);
		}
	};

	const filterOptions = useMemo(() => {
		const rarities = [...new Set(powers.map(p => p.rarity).filter(Boolean))];
		rarities.sort((a, b) => (RARITY_WEIGHT[a] || 0) - (RARITY_WEIGHT[b] || 0));

		const types = [...new Set(powers.flatMap(p => p.type || []))]
			.filter(Boolean)
			.sort();

		return {
			rarities: rarities.map(r => ({ value: r, label: r })),
			types: types.map(t => ({ value: t, label: t })),
			sort: [
				{
					value: "id-asc",
					label: tUI("admin.power.sortIdAsc"),
				},
				{
					value: "id-desc",
					label: tUI("admin.power.sortIdDesc"),
				},
				{ value: "name-asc", label: tUI("admin.common.sortNameAsc") },
				{ value: "name-desc", label: tUI("admin.common.sortNameDesc") },
				{ value: "rarity-asc", label: tUI("admin.power.sortRarityAsc") },
				{ value: "rarity-desc", label: tUI("admin.power.sortRarityDesc") },
			],
		};
	}, [powers, tUI]);

	const filteredPowers = useMemo(() => {
		let result = [...powers];

		if (searchTerm) {
			const term = removeAccents(searchTerm.toLowerCase());
			result = result.filter(p => {
				const nameMatch = removeAccents(
					(tDynamic(p, "name") || "").toLowerCase(),
				).includes(term);
				const descMatch = removeAccents(
					(tDynamic(p, "description") || "").toLowerCase(),
				).includes(term);
				return nameMatch || descMatch;
			});
		}

		if (selectedRarities.length) {
			result = result.filter(p => selectedRarities.includes(p.rarity));
		}

		if (selectedTypes.length) {
			result = result.filter(p => p.type?.some(t => selectedTypes.includes(t)));
		}

		const [field, dir] = sortOrder.split("-");
		result.sort((a, b) => {
			if (field === "id") {
				const A = a.powerCode || "";
				const B = b.powerCode || "";
				// Sử dụng numeric: true để sắp xếp các số trong chuỗi ID một cách tự nhiên (vd: id2 đứng trước id10)
				return dir === "asc"
					? A.localeCompare(B, undefined, { numeric: true })
					: B.localeCompare(A, undefined, { numeric: true });
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
		powers,
		searchTerm,
		selectedRarities,
		selectedTypes,
		sortOrder,
		tDynamic,
	]);

	const sidePanelProps = {
		searchPlaceholder: tUI("admin.power.searchPlaceholder"),
		addLabel: tUI("admin.power.addNew"),
		resetLabel: tUI("admin.power.resetFilter"),
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
			setSelectedRarities([]);
			setSelectedTypes([]);
			setSortOrder("name-asc");
			setCurrentPage(1);
		},
		multiFilterConfigs: [
			{
				label: tUI("admin.power.rarity"),
				options: filterOptions.rarities,
				selectedValues: selectedRarities,
				onChange: setSelectedRarities,
				placeholder: tUI("admin.power.allRarities"),
			},
			{
				label: tUI("admin.power.type"),
				options: filterOptions.types,
				selectedValues: selectedTypes,
				onChange: setSelectedTypes,
				placeholder: tUI("admin.power.allTypes"),
			},
		],
		sortOptions: filterOptions.sort,
		sortSelectedValue: sortOrder,
		onSortChange: setSortOrder,
	};

	// SỬ DỤNG COMPONENT LoadingState VÀ ErrorState
	if (isLoading) return <LoadingState text={tUI("admin.common.loading")} />;
	if (error) return <ErrorState message={error} />;

	return (
		<div className='font-secondary'>
			<Routes>
				<Route
					index
					element={
						<PowerListView
							paginatedPowers={filteredPowers.slice(
								(currentPage - 1) * ITEMS_PER_PAGE,
								currentPage * ITEMS_PER_PAGE,
							)}
							totalPages={Math.ceil(filteredPowers.length / ITEMS_PER_PAGE)}
							currentPage={currentPage}
							onPageChange={setCurrentPage}
							sidePanelProps={sidePanelProps}
						/>
					}
				/>
				<Route
					path=':id'
					element={
						<PowerEditWrapper
							powers={powers}
							onSave={handleSavePower}
							onDelete={handleDeletePower}
							isSaving={isSaving}
							sidePanelProps={sidePanelProps}
						/>
					}
				/>
			</Routes>
		</div>
	);
}

export default memo(PowerEditor);
