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

const NEW_CARD_TEMPLATE = {
	cardCode: "",
	isNew: true,
	cardName: "",
	cost: 0,
	rarity: "None",
	regions: [],
	type: "Unit",
	description: "",
	descriptionRaw: "",
	gameAbsolutePath: "",
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

const CARDS_PER_PAGE = 20;

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
				<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6'>
					{paginatedItems.map(card => (
						<Link
							key={card.cardCode}
							to={`./${card.cardCode}`}
							className='block hover:scale-105 transition-transform duration-200'
						>
							<div className='bg-surface-bg border border-border rounded-xl overflow-hidden hover:border-primary-500 transition-all shadow-sm'>
								{card.gameAbsolutePath ? (
									<img
										src={card.gameAbsolutePath}
										alt={card.cardName}
										className='w-full h-32 object-contain bg-black/20 p-1'
										onError={e => {
											e.target.src = "/fallback-image.svg";
										}}
									/>
								) : (
									<div className='w-full h-32 bg-surface-hover flex items-center justify-center text-text-secondary'>
										No Image
									</div>
								)}
								<div className='p-2'>
									<p className='text-xs font-bold text-primary-500 truncate'>
										{card.cardCode}
									</p>
									<p className='text-sm font-semibold text-text-primary truncate'>
										{card.cardName || tDynamic(card, "cardName")}
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
			<div className='lg:w-1/5'>
				<SidePanel {...sidePanelProps} />
			</div>
		</div>
	);
};

// === MAIN COMPONENT ===
function CardEditor() {
	const [cards, setCards] = useState([]);
	const [searchInput, setSearchInput] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
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
			const res = await fetch(`${API_BASE_URL}/api/cards?limit=-1`);
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

			await fetchAllData();
			navigate("/admin/cards");
			alert(result.message || tUI("admin.common.saveSuccess"));
		} catch (e) {
			alert(e.message || tUI("admin.common.errorOccurred"));
		} finally {
			setIsSaving(false);
		}
	};

	const handleDeleteCard = async id => {
		if (!id) return;
		setIsSaving(true);
		try {
			const token = localStorage.getItem("token");
			const res = await fetch(`${API_BASE_URL}/api/cards/${id}`, {
				method: "DELETE",
				headers: { Authorization: `Bearer ${token}` },
			});
			if (!res.ok) throw new Error(tUI("admin.common.deleteFailed"));

			await fetchAllData();
			navigate("/admin/cards");
			alert(tUI("admin.common.deleteSuccess"));
		} catch (e) {
			alert(e.message || tUI("admin.common.deleteFailed"));
		} finally {
			setIsSaving(false);
		}
	};

	const filterOptions = useMemo(() => ({
		sort: [
			{ value: "cardName-asc", label: tUI("admin.common.sortNameAsc") },
			{ value: "cardName-desc", label: tUI("admin.common.sortNameDesc") },
			{
				value: "cardCode-asc",
				label: tUI("admin.common.sortIdAsc") || "Mã lá bài A-Z",
			},
			{
				value: "cardCode-desc",
				label: tUI("admin.common.sortIdDesc") || "Mã lá bài Z-A",
			},
		],
	}), [tUI]);

	const filteredCards = useMemo(() => {
		let result = [...cards];

		if (searchTerm) {
			const term = removeAccents(searchTerm.toLowerCase());
			result = result.filter(c => {
				const nameMatch = removeAccents(
					(c.cardName || "").toLowerCase(),
				).includes(term);
				const enMatch = removeAccents(
					(c.translations?.en?.cardName || "").toLowerCase(),
				).includes(term);
				const codeMatch = (c.cardCode || "")
					.toLowerCase()
					.includes(term);
				return nameMatch || enMatch || codeMatch;
			});
		}

		const [field, dir] = sortOrder.split("-");
		result.sort((a, b) => {
			const A = String(a[field] || "");
			const B = String(b[field] || "");
			return dir === "asc" ? A.localeCompare(B) : B.localeCompare(A);
		});

		return result;
	}, [cards, searchTerm, sortOrder]);

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
			setSortOrder("cardName-asc");
			setCurrentPage(1);
		},
		multiFilterConfigs: [],
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
