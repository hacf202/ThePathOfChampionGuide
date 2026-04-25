// fe/src/components/admin/cards/cardEditor.jsx
import { useState, memo, useEffect, useCallback, useMemo } from "react";
import { useNavigate, Link, Routes, Route, useParams } from "react-router-dom";
import GenericCard from "../../common/genericCard";
import Button from "../../common/button";
import { removeAccents } from "../../../utils/vietnameseUtils";
import SidePanel from "../../common/sidePanel";
import CardEditorForm from "./cardEditorForm";
import { useTranslation } from "../../../hooks/useTranslation";
import AdminListLayout from "../common/adminListLayout";
import { LoadingState, ErrorState } from "../common/stateDisplays";
import { invalidateEntityCache } from "../../../utils/entityLookup";
import Swal from "sweetalert2";

const NEW_CARD_TEMPLATE = {
	cardCode: "",
	isNew: true,
	cardName: "",
	cost: 0,
	rarity: "None",
	regions: [],
	type: "unit",
	description: "",
	descriptionRaw: "",
	gameAbsolutePath: "",
    associatedCardRefs: [],
	translations: {
		en: {
			cardName: "",
			description: "",
			descriptionRaw: "",
			gameAbsolutePath: "",
			regions: [],
			type: "Unit"
		},
	},
};

const CARDS_PER_PAGE = 30;

// === LIST VIEW ===
const CardListView = memo(
	({ paginatedItems, totalPages, currentPage, onPageChange, sidePanelProps }) => {
		const { tUI, tDynamic } = useTranslation();

		return (
			<AdminListLayout
				dataLength={paginatedItems.length}
				totalPages={totalPages}
				currentPage={currentPage}
				onPageChange={onPageChange}
				sidePanelProps={sidePanelProps}
				emptyMessageTitle={tUI("admin.card.notFound")}
				emptyMessageSub={tUI("admin.card.tryOtherFilter")}
			>
				<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4'>
					{paginatedItems.map(card => (
						<Link
							key={card.cardCode}
							to={`./${card.cardCode}`}
							className='block hover:scale-105 transition-transform duration-200'
						>
							<div className='bg-surface-bg border border-border rounded-xl overflow-hidden hover:border-primary-500 transition-all shadow-sm h-full flex flex-col'>
								<div className="relative aspect-[2/3] bg-black/5 overflow-hidden">
									{card.gameAbsolutePath ? (
										<img
											src={card.gameAbsolutePath}
											alt={card.cardName}
											className='w-full h-full object-contain p-1'
											loading="lazy"
											onError={e => {
												e.target.src = "/fallback-image.svg";
											}}
										/>
									) : (
										<div className='w-full h-full flex items-center justify-center text-[10px] text-text-secondary uppercase font-black opacity-30'>
											No Image
										</div>
									)}
									<div className="absolute top-1 left-1 bg-black/60 backdrop-blur-md text-[9px] text-white px-1.5 py-0.5 rounded-md font-mono border border-white/10">
										{card.cost}
									</div>
								</div>
								<div className='p-2 flex-grow'>
									<p className='text-[10px] font-black text-primary-500 uppercase tracking-tighter truncate'>
										{card.cardCode}
									</p>
									<p className='text-xs font-bold text-text-primary truncate'>
										{card.cardName}
									</p>
									<p className='text-[9px] text-text-secondary font-medium uppercase'>
										{card.type}
									</p>
								</div>
							</div>
						</Link>
					))}
				</div>
			</AdminListLayout>
		);
	},
);

// === EDIT WRAPPER ===
const CardEditWrapper = ({ cards, onSave, onDelete, isSaving, sidePanelProps }) => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { tUI } = useTranslation();

	const selectedCard = useMemo(() => {
		if (id === "new") return { ...NEW_CARD_TEMPLATE };
		const safeCards = Array.isArray(cards) ? cards : [];
		const found = safeCards.find(c => c.cardCode === id);
		return found ? { ...found, isNew: false } : null;
	}, [id, cards]);

	const handleBack = useCallback(() => navigate("/admin/cards"), [navigate]);

	if (!selectedCard && id !== "new" && Array.isArray(cards) && cards.length > 0) {
		return (
			<div className='flex flex-col items-center justify-center py-20 text-text-secondary'>
				<p className='text-xl mb-4'>
					{tUI("admin.card.notFoundId")} {id}
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
				{selectedCard && (
					<CardEditorForm
						card={selectedCard}
						onSave={onSave}
						onCancel={handleBack}
						onDelete={onDelete}
						isSaving={isSaving}
					/>
				)}
			</div>
			<div className='lg:w-1/5 shrink-0'>
				<div className="sticky top-20">
					<SidePanel {...sidePanelProps} />
				</div>
			</div>
		</div>
	);
};

// === MAIN COMPONENT ===
function CardEditor() {
	const [cards, setCards] = useState([]);
	const [searchInput, setSearchInput] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	
	const [selectedRegions, setSelectedRegions] = useState([]);
	const [selectedRarities, setSelectedRarities] = useState([]);
	const [selectedTypes, setSelectedTypes] = useState([]);
	const [selectedCosts, setSelectedCosts] = useState([]);
	
	const [sortOrder, setSortOrder] = useState("cardName-asc");
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
			const timestamp = Date.now();
			const res = await fetch(`${API_BASE_URL}/api/cards?limit=-1&t=${timestamp}`, {
				cache: "no-store"
			});
			if (!res.ok) throw new Error(tUI("admin.common.errorLoad"));
			const data = await res.json();
			const cardList = Array.isArray(data) ? data : data.items || [];
			setCards(cardList);
		} catch (e) {
			setError(tUI("admin.common.errorLoad"));
		} finally {
			setIsLoading(false);
		}
	}, [API_BASE_URL, tUI]);

	useEffect(() => {
		fetchAllData();
	}, [fetchAllData]);

	const handleSaveCard = async data => {
		setIsSaving(true);
		try {
			const token = localStorage.getItem("token");
			const res = await fetch(`${API_BASE_URL}/api/cards`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(data),
			});
			const result = await res.json();
			if (!res.ok) throw new Error(result.error || tUI("admin.common.saveSuccess"));

			// Invalidate entity cache frontend để MarkupEditor thấy lá bài mới ngay lập tức
			invalidateEntityCache("cards");

			await fetchAllData();
			navigate("/admin/cards");
			
			Swal.fire({
				icon: "success",
				title: "Đã lưu!",
				text: result.message || tUI("admin.common.saveSuccess"),
				timer: 2000,
				showConfirmButton: false,
				toast: true,
				position: "top-end",
			});
		} catch (e) {
			Swal.fire({
				icon: "error",
				title: "Lỗi",
				text: e.message || tUI("admin.common.errorOccurred"),
				confirmButtonColor: "#3b82f6",
			});
		} finally {
			setIsSaving(false);
		}
	};

	const handleDeleteCard = async id => {
		if (!id) return;
		
		const result = await Swal.fire({
			title: "Xác nhận xóa?",
			text: "Bạn có chắc chắn muốn xóa lá bài này? Dữ liệu không thể khôi phục!",
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
			const res = await fetch(`${API_BASE_URL}/api/cards/${id}`, {
				method: "DELETE",
				headers: { Authorization: `Bearer ${token}` },
			});
			if (!res.ok) throw new Error(tUI("admin.common.deleteFailed"));

			// Invalidate entity cache frontend
			invalidateEntityCache("cards");

			await fetchAllData();
			navigate("/admin/cards");
			
			Swal.fire({
				icon: "success",
				title: "Đã xóa!",
				text: tUI("admin.common.deleteSuccess"),
				timer: 2000,
				showConfirmButton: false,
				toast: true,
				position: "top-end",
			});
		} catch (e) {
			Swal.fire({
				icon: "error",
				title: "Lỗi",
				text: e.message || tUI("admin.common.deleteFailed"),
				confirmButtonColor: "#3b82f6",
			});
		} finally {
			setIsSaving(false);
		}
	};

	const filterOptions = useMemo(() => {
		const safeCards = Array.isArray(cards) ? cards : [];
		
		const regions = [...new Set(safeCards.flatMap(c => c.regions || []))].sort().map(r => ({ value: r, label: r }));
		const rarities = [...new Set(safeCards.map(c => c.rarity || "None"))].sort().map(r => ({ value: r, label: r }));
		const types = [...new Set(safeCards.map(c => c.type || "unit"))].sort().map(t => ({ value: t, label: t }));
		const costs = [...new Set(safeCards.map(c => Number(c.cost || 0)))].sort((a, b) => a - b).map(c => ({ value: c, label: `${c} Mana` }));

		return {
			regions,
			rarities,
			types,
			costs,
			sort: [
				{ value: "cardName-asc", label: tUI("admin.common.sortNameAsc") },
				{ value: "cardName-desc", label: tUI("admin.common.sortNameDesc") },
				{ value: "cardCode-asc", label: "Mã lá bài A-Z" },
				{ value: "cardCode-desc", label: "Mã lá bài Z-A" },
				{ value: "cost-asc", label: "Mana (Tăng dần)" },
				{ value: "cost-desc", label: "Mana (Giảm dần)" },
			],
		};
	}, [cards, tUI]);

	const filteredCards = useMemo(() => {
		let result = [...cards];

		if (searchTerm) {
			const term = removeAccents(searchTerm.toLowerCase());
			result = result.filter(c => {
				const nameMatch = removeAccents((c.cardName || "").toLowerCase()).includes(term);
				const enMatch = removeAccents((c.translations?.en?.cardName || "").toLowerCase()).includes(term);
				const codeMatch = (c.cardCode || "").toLowerCase().includes(term);
				return nameMatch || enMatch || codeMatch;
			});
		}
		
		if (selectedRegions.length) result = result.filter(c => c.regions?.some(r => selectedRegions.includes(r)));
		if (selectedRarities.length) result = result.filter(c => selectedRarities.includes(c.rarity));
		if (selectedTypes.length) result = result.filter(c => selectedTypes.includes(c.type));
		if (selectedCosts.length) result = result.filter(c => selectedCosts.includes(Number(c.cost || 0)));

		const [field, dir] = sortOrder.split("-");
		result.sort((a, b) => {
			const A = a[field] ?? "";
			const B = b[field] ?? "";
			if (typeof A === 'string') return dir === "asc" ? A.localeCompare(B) : B.localeCompare(A);
			return dir === "asc" ? A - B : B - A;
		});

		return result;
	}, [cards, searchTerm, sortOrder, selectedRegions, selectedRarities, selectedTypes, selectedCosts]);

	const sidePanelProps = {
		searchPlaceholder: tUI("admin.card.searchPlaceholder"),
		addLabel: tUI("admin.card.addNew"),
		resetLabel: tUI("admin.card.resetFilter"),
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
			setSelectedCosts([]);
			setSortOrder("cardName-asc");
			setCurrentPage(1);
		},
		multiFilterConfigs: [
			{ label: "Khu vực", options: filterOptions.regions, selectedValues: selectedRegions, onChange: setSelectedRegions },
			{ label: "Độ hiếm", options: filterOptions.rarities, selectedValues: selectedRarities, onChange: setSelectedRarities },
			{ label: "Loại bài", options: filterOptions.types, selectedValues: selectedTypes, onChange: setSelectedTypes },
			{ label: "Mana", options: filterOptions.costs, selectedValues: selectedCosts, onChange: setSelectedCosts },
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
						<CardListView
							paginatedItems={filteredCards.slice(
								(currentPage - 1) * CARDS_PER_PAGE,
								currentPage * CARDS_PER_PAGE,
							)}
							totalPages={Math.ceil(filteredCards.length / CARDS_PER_PAGE)}
							currentPage={currentPage}
							onPageChange={setCurrentPage}
							sidePanelProps={sidePanelProps}
						/>
					}
				/>
				<Route
					path=':id'
					element={
						<CardEditWrapper
							cards={cards}
							onSave={handleSaveCard}
							onDelete={handleDeleteCard}
							isSaving={isSaving}
							sidePanelProps={sidePanelProps}
						/>
					}
				/>
			</Routes>
		</div>
	);
}

export default memo(CardEditor);
