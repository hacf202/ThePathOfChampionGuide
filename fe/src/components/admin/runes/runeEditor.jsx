// src/pages/admin/runeEditor.jsx
import { useState, memo, useEffect, useCallback, useMemo } from "react";
import { useNavigate, Link, Routes, Route, useParams } from "react-router-dom";
import GenericCard from "../../common/genericCard";
import Button from "../../common/button";
import { removeAccents } from "../../../utils/vietnameseUtils";
import SidePanel from "../../common/sidePanel";
import RuneEditorForm from "./runeEditorForm";
import { Loader2 } from "lucide-react";
import { useTranslation } from "../../../hooks/useTranslation"; // IMPORT HOOK ĐA NGÔN NGỮ

const NEW_RUNE_TEMPLATE = {
	runeCode: "",
	isNew: true,
	name: "",
	region: "",
	rarity: "",
	type: [], // Mặc định là mảng để chuẩn hóa với DB
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
			<div className='flex flex-col lg:flex-row gap-6'>
				<div className='lg:w-4/5 bg-surface-bg rounded-lg p-4'>
					{paginatedRunes.length > 0 ? (
						<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6'>
							{paginatedRunes.map(rune => (
								<Link
									key={rune.runeCode}
									to={`./${rune.runeCode}`}
									className='block hover:scale-105 transition-transform duration-200'
								>
									<GenericCard item={rune} onClick={() => {}} />
								</Link>
							))}
						</div>
					) : (
						<div className='flex items-center justify-center h-full min-h-[300px] text-center text-text-secondary'>
							<div>
								<p className='font-semibold text-lg'>
									{tUI("admin.rune.notFound")}
								</p>
								<p>{tUI("admin.rune.tryOtherFilter")}</p>
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
								{tUI("admin.common.prevPage")}
							</Button>
							<span className='text-lg font-medium text-text-primary'>
								{currentPage} / {totalPages}
							</span>
							<Button
								onClick={() => onPageChange(currentPage + 1)}
								disabled={currentPage === totalPages}
								variant='outline'
							>
								{tUI("admin.common.nextPage")}
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
			// SỬA NHANH Ở ĐÂY: Đổi limit=-1 thành limit=1000
			const res = await fetch(`${API_BASE_URL}/api/runes?limit=1000`);
			if (!res.ok) throw new Error(tUI("admin.common.errorLoad"));
			const data = await res.json();
			const items = Array.isArray(data) ? data : data.items || [];
			setRunes(items);
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

			// Dọn dẹp bản dịch rỗng trước khi lưu để tránh rác DB
			const payload = { ...data };
			if (
				!payload.translations?.en?.name &&
				!payload.translations?.en?.description &&
				!payload.translations?.en?.region &&
				!payload.translations?.en?.rarity
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
		if (!id || !window.confirm(tUI("admin.common.deleteConfirm"))) return;
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
		const rarities = [...new Set(runes.map(r => r.rarity).filter(Boolean))];
		const typesList = [];
		runes.forEach(r => {
			if (Array.isArray(r.type)) {
				r.type.forEach(t => {
					if (t && !typesList.includes(t)) typesList.push(t);
				});
			} else if (typeof r.type === "string" && r.type) {
				const parts = r.type.split(",").map(s => s.trim());
				parts.forEach(p => {
					if (p && !typesList.includes(p)) typesList.push(p);
				});
			}
		});

		// Sắp xếp độ hiếm theo trọng số
		rarities.sort((a, b) => (RARITY_WEIGHT[a] || 0) - (RARITY_WEIGHT[b] || 0));

		return {
			rarities: rarities.map(r => ({ value: r, label: r })),
			types: typesList.sort().map(t => ({ value: t, label: t })),
			sort: [
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

		if (selectedRarities.length) {
			result = result.filter(r => selectedRarities.includes(r.rarity));
		}

		if (selectedTypes.length) {
			result = result.filter(r => {
				if (!r.type) return false;
				if (Array.isArray(r.type)) {
					return r.type.some(t => selectedTypes.includes(t));
				}
				const p = r.type.split(",").map(s => s.trim());
				return p.some(t => selectedTypes.includes(t));
			});
		}

		const [field, dir] = sortOrder.split("-");
		result.sort((a, b) => {
			if (field === "name") {
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
	}, [runes, searchTerm, selectedRarities, selectedTypes, sortOrder, tDynamic]);

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
			setSelectedRarities([]);
			setSelectedTypes([]);
			setSortOrder("name-asc");
			setCurrentPage(1);
		},
		multiFilterConfigs: [
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

	if (isLoading) {
		return (
			<div className='flex flex-col items-center justify-center min-h-[400px] text-text-secondary'>
				<Loader2 className='animate-spin text-primary-500' size={48} />
				<div className='text-lg mt-4'>{tUI("admin.common.loading")}</div>
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
