// src/pages/admin/bonusStarEditor.jsx
import { useState, memo, useEffect, useCallback, useMemo } from "react";
import { useNavigate, Link, Routes, Route, useParams } from "react-router-dom";
import GenericCard from "../common/genericCard";
import Button from "../common/button";
import { removeAccents } from "../../utils/vietnameseUtils";
import SidePanel from "../common/sidePanel";
import BonusStarEditorForm from "./bonusStarEditorForm";
import { Loader2 } from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";

const NEW_BONUS_STAR_TEMPLATE = {
	bonusStarID: "",
	isNew: true,
	name: "",
	description: "",
	image: "",
	nodeType: "bonusStar",
	translations: {
		en: {
			name: "",
			description: "",
		},
	},
};

const ITEMS_PER_PAGE = 20;

// === LIST VIEW COMPONENT ===
const BonusStarListView = memo(
	({
		paginatedItems,
		totalPages,
		currentPage,
		onPageChange,
		sidePanelProps,
	}) => {
		const { tUI } = useTranslation();

		return (
			<div className='flex flex-col lg:flex-row gap-6 '>
				<div className='lg:w-4/5 bg-surface-bg rounded-lg p-4'>
					{paginatedItems.length > 0 ? (
						<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 '>
							{paginatedItems.map(item => (
								<Link
									key={item.bonusStarID}
									to={`./${item.bonusStarID}`}
									className='block hover:scale-105 transition-transform duration-200'
								>
									<GenericCard
										item={{ ...item, assetAbsolutePath: item.image }}
										onClick={() => {}}
									/>
								</Link>
							))}
						</div>
					) : (
						<div className='flex items-center justify-center h-full min-h-[300px] text-center text-text-secondary'>
							<div>
								<p className='font-semibold text-lg'>
									{tUI("admin.bonusStar.notFound")}
								</p>
								<p>{tUI("admin.bonusStar.tryOtherFilter")}</p>
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
const BonusStarEditWrapper = ({
	items,
	onSave,
	onDelete,
	isSaving,
	sidePanelProps,
}) => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { tUI } = useTranslation();

	const selectedItem = useMemo(() => {
		if (id === "new") return { ...NEW_BONUS_STAR_TEMPLATE };
		const safeItems = Array.isArray(items) ? items : [];
		const found = safeItems.find(i => i.bonusStarID === id);
		return found ? { ...found, isNew: false } : null;
	}, [id, items]);

	const handleBack = useCallback(
		() => navigate("/admin/bonusStars"),
		[navigate],
	);

	if (
		!selectedItem &&
		id !== "new" &&
		Array.isArray(items) &&
		items.length > 0
	) {
		return (
			<div className='flex flex-col items-center justify-center py-20 text-text-secondary'>
				<p className='text-xl mb-4'>
					{tUI("admin.bonusStar.notFoundId")} {id}
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
				{selectedItem && (
					<BonusStarEditorForm
						item={selectedItem}
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
function BonusStarEditor() {
	const [items, setItems] = useState([]);
	const [searchInput, setSearchInput] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
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
			const res = await fetch(`${API_BASE_URL}/api/bonusStars`);
			if (!res.ok) throw new Error(tUI("admin.common.errorLoad"));
			const data = await res.json();
			const finalItems = Array.isArray(data) ? data : data.items || [];
			setItems(finalItems);
		} catch (e) {
			setError(tUI("admin.common.errorLoad"));
		} finally {
			setIsLoading(false);
		}
	}, [API_BASE_URL, tUI]);

	useEffect(() => {
		fetchAllData();
	}, [fetchAllData]);

	const handleSaveItem = async data => {
		setIsSaving(true);
		try {
			const token = localStorage.getItem("token");

			// Dọn dẹp object translations rỗng trước khi save để tối ưu DB
			const payload = { ...data };
			if (
				!payload.translations?.en?.name &&
				!payload.translations?.en?.description
			) {
				delete payload.translations;
			}

			const res = await fetch(`${API_BASE_URL}/api/bonusStars`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(payload),
			});

			const result = await res.json();

			if (!res.ok) {
				throw new Error(result.error || tUI("admin.common.errorOccurred"));
			}

			await fetchAllData();
			navigate("/admin/bonusStars");
			alert(result.message || tUI("admin.common.saveSuccess"));
		} catch (e) {
			alert(e.message || tUI("admin.common.errorOccurred"));
		} finally {
			setIsSaving(false);
		}
	};

	const handleDeleteItem = async id => {
		if (!id || !window.confirm(tUI("admin.common.deleteConfirm"))) return;
		setIsSaving(true);
		try {
			const token = localStorage.getItem("token");
			const res = await fetch(`${API_BASE_URL}/api/bonusStars/${id}`, {
				method: "DELETE",
				headers: { Authorization: `Bearer ${token}` },
			});
			if (!res.ok) throw new Error(tUI("admin.common.deleteFailed"));
			await fetchAllData();
			navigate("/admin/bonusStars");
			alert(tUI("admin.common.deleteSuccess"));
		} catch (e) {
			alert(e.message || tUI("admin.common.deleteFailed"));
		} finally {
			setIsSaving(false);
		}
	};

	const filterOptions = useMemo(() => {
		const types = [
			...new Set(items.map(i => i.nodeType).filter(Boolean)),
		].sort();
		return {
			types: types.map(t => ({ value: t, label: t })),
			sort: [
				{ value: "name-asc", label: tUI("admin.common.sortNameAsc") },
				{ value: "name-desc", label: tUI("admin.common.sortNameDesc") },
			],
		};
	}, [items, tUI]);

	const filteredItems = useMemo(() => {
		let result = [...items];
		if (searchTerm) {
			const term = removeAccents(searchTerm.toLowerCase());
			result = result.filter(i => {
				const nameVi = removeAccents((i.name || "").toLowerCase());
				const descVi = removeAccents((i.description || "").toLowerCase());
				const nameEn = removeAccents(
					(i.translations?.en?.name || "").toLowerCase(),
				);
				const descEn = removeAccents(
					(i.translations?.en?.description || "").toLowerCase(),
				);

				return (
					nameVi.includes(term) ||
					descVi.includes(term) ||
					nameEn.includes(term) ||
					descEn.includes(term)
				);
			});
		}
		if (selectedTypes.length) {
			result = result.filter(i => selectedTypes.includes(i.nodeType));
		}

		const [field, dir] = sortOrder.split("-");
		result.sort((a, b) => {
			const A = tDynamic(a, "name") || "";
			const B = tDynamic(b, "name") || "";
			return dir === "asc" ? A.localeCompare(B) : B.localeCompare(A);
		});
		return result;
	}, [items, searchTerm, selectedTypes, sortOrder, tDynamic]);

	const sidePanelProps = {
		searchPlaceholder: tUI("admin.bonusStar.searchPlaceholder"),
		addLabel: tUI("admin.bonusStar.addLabel"),
		resetLabel: tUI("admin.bonusStar.resetLabel"),
		searchInput,
		onSearchInputChange: e => setSearchInput(e.target.value),
		onSearchKeyDown: e => {
			if (e.key === "Enter") {
				setSearchTerm(searchInput.trim());
				setCurrentPage(1);
			}
		},
		onKeyDown: e => {
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
			setSelectedTypes([]);
			setSortOrder("name-asc");
			setCurrentPage(1);
		},
		multiFilterConfigs: [
			{
				label: tUI("admin.bonusStar.nodeType"),
				options: filterOptions.types,
				selectedValues: selectedTypes,
				onChange: setSelectedTypes,
				placeholder: tUI("admin.bonusStar.allTypes"),
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
				<div className='mt-4'>{tUI("admin.common.loading")}</div>
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
						<BonusStarListView
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
						<BonusStarEditWrapper
							items={items}
							onSave={handleSaveItem}
							onDelete={handleDeleteItem}
							isSaving={isSaving}
							sidePanelProps={sidePanelProps}
						/>
					}
				/>
			</Routes>
		</div>
	);
}

export default memo(BonusStarEditor);
