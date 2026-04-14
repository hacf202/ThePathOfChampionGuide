// src/pages/admin/relicEditor.jsx
import { useState, memo, useEffect, useCallback, useMemo } from "react";
import { useNavigate, Link, Routes, Route, useParams } from "react-router-dom";
import GenericCard from "../../common/genericCard";
import Button from "../../common/button";
import { removeAccents } from "../../../utils/vietnameseUtils";
import SidePanel from "../../common/sidePanel";
import RelicEditorForm from "./relicEditorForm";
import { useTranslation } from "../../../hooks/useTranslation";
// IMPORT CÁC COMPONENT CHUNG
import AdminListLayout from "../common/adminListLayout";
import { LoadingState, ErrorState } from "../common/stateDisplays";
import { invalidateEntityCache } from "../../../utils/entityLookup";

const NEW_RELIC_TEMPLATE = {
	relicCode: "",
	isNew: true,
	name: "",
	rarity: "",
	stack: 1,
	type: "",
	assetAbsolutePath: "",
	assetFullAbsolutePath: "",
	description: "",
	translations: {
		en: {
			name: "",
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

// === LIST VIEW COMPONENT === Đã áp dụng AdminListLayout
const RelicListView = memo(
	({
		paginatedRelics,
		totalPages,
		currentPage,
		onPageChange,
		sidePanelProps,
	}) => {
		const { tUI } = useTranslation();

		return (
			<AdminListLayout
				dataLength={paginatedRelics.length}
				totalPages={totalPages}
				currentPage={currentPage}
				onPageChange={onPageChange}
				sidePanelProps={sidePanelProps}
				emptyMessageTitle={tUI("admin.relic.notFound")}
				emptyMessageSub={tUI("admin.relic.tryOtherFilter")}
			>
				<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6'>
					{paginatedRelics.map(relic => (
						<Link
							key={relic.relicCode}
							to={`./${relic.relicCode}`}
							className='block hover:scale-105 transition-transform duration-200'
						>
							<GenericCard displayId={relic.relicCode} item={relic} onClick={() => {}} />
						</Link>
					))}
				</div>
			</AdminListLayout>
		);
	},
);

// === EDIT WRAPPER COMPONENT ===
const RelicEditWrapper = ({
	relics,
	onSave,
	onDelete,
	isSaving,
	sidePanelProps,
}) => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { tUI } = useTranslation();

	const selectedRelic = useMemo(() => {
		if (id === "new") return { ...NEW_RELIC_TEMPLATE };
		const safeRelics = Array.isArray(relics) ? relics : [];
		const found = safeRelics.find(r => r.relicCode === id);
		return found ? { ...found, isNew: false } : null;
	}, [id, relics]);

	const handleBack = useCallback(() => navigate("/admin/relics"), [navigate]);

	if (
		!selectedRelic &&
		id !== "new" &&
		Array.isArray(relics) &&
		relics.length > 0
	) {
		return (
			<div className='flex flex-col items-center justify-center py-20 text-text-secondary'>
				<p className='text-xl mb-4'>
					{tUI("admin.relic.notFoundId")} {id}
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
				{selectedRelic && (
					<RelicEditorForm
						relic={selectedRelic}
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
function RelicEditor() {
	const [relics, setRelics] = useState([]);
	const [searchInput, setSearchInput] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedRarities, setSelectedRarities] = useState([]);
	const [selectedTypes, setSelectedTypes] = useState([]);
	const [selectedStacks, setSelectedStacks] = useState([]);
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
			// Sử dụng limit lớn để đảm bảo lấy đủ toàn bộ dữ liệu Cổ vật
			const res = await fetch(`${API_BASE_URL}/api/relics?limit=-1`);
			if (!res.ok) throw new Error(tUI("admin.common.errorLoad"));
			const data = await res.json();
			const items = Array.isArray(data) ? data : data.items || [];
			setRelics(items);
		} catch (e) {
			setError(tUI("admin.common.errorLoad"));
		} finally {
			setIsLoading(false);
		}
	}, [API_BASE_URL, tUI]);

	useEffect(() => {
		fetchAllData();
	}, [fetchAllData]);

	const handleSaveRelic = async data => {
		setIsSaving(true);
		try {
			const token = localStorage.getItem("token");

			// Dọn dẹp object bản dịch rỗng
			const payload = { ...data };
			if (
				!payload.translations?.en?.name &&
				!payload.translations?.en?.description &&
				!payload.translations?.en?.rarity
			) {
				delete payload.translations;
			}

			const res = await fetch(`${API_BASE_URL}/api/relics`, {
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

			invalidateEntityCache("relics");

			await fetchAllData();
			navigate("/admin/relics");
			alert(result.message || tUI("admin.common.saveSuccess"));
		} catch (e) {
			alert(e.message || tUI("admin.common.errorOccurred"));
		} finally {
			setIsSaving(false);
		}
	};

	const handleDeleteRelic = async id => {
		if (!id) return;
		setIsSaving(true);
		try {
			const token = localStorage.getItem("token");
			const res = await fetch(`${API_BASE_URL}/api/relics/${id}`, {
				method: "DELETE",
				headers: { Authorization: `Bearer ${token}` },
			});
			if (!res.ok) throw new Error(tUI("admin.common.deleteFailed"));

			invalidateEntityCache("relics");

			await fetchAllData();
			navigate("/admin/relics");
			alert(tUI("admin.common.deleteSuccess"));
		} catch (e) {
			alert(e.message || tUI("admin.common.deleteFailed"));
		} finally {
			setIsSaving(false);
		}
	};

	const filterOptions = useMemo(() => {
		const rarities = [...new Set(relics.map(r => r.rarity).filter(Boolean))];
		const types = [...new Set(relics.map(r => r.type).filter(Boolean))];
		const stacks = [
			...new Set(relics.map(r => String(r.stack)).filter(Boolean)),
		];

		// Sắp xếp độ hiếm theo trọng số
		rarities.sort((a, b) => (RARITY_WEIGHT[a] || 0) - (RARITY_WEIGHT[b] || 0));

		return {
			rarities: rarities.map(r => ({ value: r, label: r })),
			types: types.sort().map(t => ({ value: t, label: t })),
			stacks: stacks.sort().map(s => ({ value: s, label: s })),
			sort: [
				{ value: "id-asc", label: tUI("admin.common.sortIdAsc") || "ID (Tăng dần)" },
				{ value: "id-desc", label: tUI("admin.common.sortIdDesc") || "ID (Giảm dần)" },
				{ value: "name-asc", label: tUI("admin.common.sortNameAsc") },
				{ value: "name-desc", label: tUI("admin.common.sortNameDesc") },
				{ value: "rarity-asc", label: tUI("admin.relic.sortRarityAsc") },
				{ value: "rarity-desc", label: tUI("admin.relic.sortRarityDesc") },
			],
		};
	}, [relics, tUI]);

	const filteredRelics = useMemo(() => {
		let result = [...relics];

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

		if (selectedRarities.length) {
			result = result.filter(r => selectedRarities.includes(r.rarity));
		}

		if (selectedTypes.length) {
			result = result.filter(r => selectedTypes.includes(r.type));
		}

		if (selectedStacks.length) {
			result = result.filter(r => selectedStacks.includes(String(r.stack)));
		}

		const [field, dir] = sortOrder.split("-");
		result.sort((a, b) => {
			if (field === "id") {
				const A = String(a.relicCode || "");
				const B = String(b.relicCode || "");
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
		relics,
		searchTerm,
		selectedRarities,
		selectedTypes,
		selectedStacks,
		sortOrder,
		tDynamic,
	]);

	const sidePanelProps = {
		searchPlaceholder: tUI("admin.relic.searchPlaceholder"),
		addLabel: tUI("admin.relic.addNew"),
		resetLabel: tUI("admin.relic.resetFilter"),
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
			setSelectedStacks([]);
			setSortOrder("name-asc");
			setCurrentPage(1);
		},
		multiFilterConfigs: [
			{
				label: tUI("admin.relic.rarity"),
				options: filterOptions.rarities,
				selectedValues: selectedRarities,
				onChange: setSelectedRarities,
				placeholder: tUI("admin.relic.allRarities"),
			},
			{
				label: tUI("admin.relic.type"),
				options: filterOptions.types,
				selectedValues: selectedTypes,
				onChange: setSelectedTypes,
				placeholder: tUI("admin.relic.allTypes"),
			},
			{
				label: tUI("admin.relic.stack"),
				options: filterOptions.stacks,
				selectedValues: selectedStacks,
				onChange: setSelectedStacks,
				placeholder: tUI("admin.relic.allStacks"),
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
						<RelicListView
							paginatedRelics={filteredRelics.slice(
								(currentPage - 1) * ITEMS_PER_PAGE,
								currentPage * ITEMS_PER_PAGE,
							)}
							totalPages={Math.ceil(filteredRelics.length / ITEMS_PER_PAGE)}
							currentPage={currentPage}
							onPageChange={setCurrentPage}
							sidePanelProps={sidePanelProps}
						/>
					}
				/>
				<Route
					path=':id'
					element={
						<RelicEditWrapper
							relics={relics}
							onSave={handleSaveRelic}
							onDelete={handleDeleteRelic}
							isSaving={isSaving}
							sidePanelProps={sidePanelProps}
						/>
					}
				/>
			</Routes>
		</div>
	);
}

export default memo(RelicEditor);
