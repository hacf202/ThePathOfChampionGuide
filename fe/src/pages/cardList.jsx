import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "../hooks/useTranslation.js";
import { Loader2, Info } from "lucide-react";
import CardItem from "../components/card/CardItem.jsx";
import GenericListLayout from "../components/layout/genericListLayout.jsx";
import MultiSelectFilter from "../components/common/multiSelectFilter.jsx";
import Button from "../components/common/button.jsx";

/**
 * Skeleton for Card Item
 */
const CardSkeleton = () => (
	<div className='rounded-xl border border-border bg-surface-bg p-0 overflow-hidden space-y-0 animate-pulse'>
		<div className='aspect-[680/1024] w-full bg-gray-700/50' />
	</div>
);

/**
 * Trang Khám Phá Lá Bài (Card Explorer) - Standardized Version
 */
const CardList = () => {
	const { tUI } = useTranslation();
	
	// State quản lý danh sách và phân trang
	const [cards, setCards] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [page, setPage] = useState(1);
	const [pagination, setPagination] = useState(null);
	
	// State quản lý tìm kiếm và hiệu ứng
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedRarities, setSelectedRarities] = useState([]);
	const [selectedRegions, setSelectedRegions] = useState([]);
	const [selectedTypes, setSelectedTypes] = useState([]);
	const [selectedCosts, setSelectedCosts] = useState([]);
	const [sort, setSort] = useState("cardName-asc");

	/**
	 * Hàm fetch dữ liệu lá bài (Page-based)
	 */
	const fetchCards = useCallback(async (targetPage = 1, isNewSearch = false) => {
		try {
			setLoading(true);
			if (isNewSearch) {
				setCards([]);
			}

			const API_URL = `${import.meta.env.VITE_API_URL}/api/cards`;
			const params = {
				page: targetPage,
				limit: 24,
				searchTerm: searchTerm,
				rarities: selectedRarities.join(","),
				regions: selectedRegions.join(","),
				types: selectedTypes.join(","),
				costs: selectedCosts.join(","),
				sort: sort,
			};

			const response = await axios.get(API_URL, { params });
			const { items, pagination: pagData } = response.data;

			// Replace items for standard pagination
			setCards(items || []);
			setPagination(pagData);
			setPage(targetPage);
			setError(null);
		} catch (err) {
			console.error("Error fetching cards:", err);
			setError(tUI("common.errorLoadData"));
		} finally {
			setLoading(false);
		}
	}, [tUI, searchTerm, selectedRarities, selectedRegions, selectedTypes, selectedCosts, sort]);

	/**
	 * hook tự động fetch khi bộ lọc hoặc trang thay đổi
	 */
	useEffect(() => {
		fetchCards(page, false);
	}, [page, selectedRarities, selectedRegions, selectedTypes, selectedCosts, sort]);

    /**
     * Tìm kiếm thủ công cho text input (để tránh spam API khi gõ)
     */
	const handleSearch = () => {
		fetchCards(1, true);
	};

	const handleResetFilters = () => {
		setSearchTerm("");
		setSelectedRarities([]);
		setSelectedRegions([]);
		setSelectedTypes([]);
		setSelectedCosts([]);
        setSort("cardName-asc");
		setPage(1);
	};

	return (
		<GenericListLayout
			pageTitle={tUI("cardList.title")}
			pageDescription={tUI("cardList.metaDesc")}
			heading={tUI("cardList.heading")}
			
			// Data & Pagination
			data={cards}
			loading={loading}
			pagination={pagination}
			currentPage={page}
			onPageChange={(newPage) => setPage(newPage)}
			
			// Search
			searchValue={searchTerm}
			onSearchChange={setSearchTerm}
			onSearchSubmit={handleSearch}
			searchPlaceholder={tUI("cardList.placeholder")}
			
			// Actions
			onResetFilters={handleResetFilters}
			
			// Render
			renderSkeleton={() => <CardSkeleton />}
			skeletonCount={12}
			renderItem={(card) => (
				<CardItem card={card} key={card.cardCode} />
			)}
			renderFilters={() => (
				<div className="space-y-6">
                    {/* Bộ lọc sắp xếp */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-text-secondary">
                            {tUI("championList.sortBy") || "Sắp xếp"}
                        </label>
                        <select 
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                            className="w-full bg-surface-hover border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary-500 transition-colors"
                        >
                            <option value="cardName-asc">{tUI("sort.nameAsc") || "Tên (A-Z)"}</option>
                            <option value="cardName-desc">{tUI("sort.nameDesc") || "Tên (Z-A)"}</option>
                            <option value="cost-asc">{tUI("sort.costAsc") || "Tiêu hao (Thấp-Cao)"}</option>
                            <option value="cost-desc">{tUI("sort.costDesc") || "Tiêu hao (Cao-Thấp)"}</option>
                        </select>
                    </div>

                    <hr className="border-border/50" />

					<MultiSelectFilter
						label={tUI("common.rarity")}
						options={[
							{ label: tUI("rarity.common"), value: "Common" },
							{ label: tUI("rarity.rare"), value: "Rare" },
							{ label: tUI("rarity.epic"), value: "Epic" },
							{ label: tUI("rarity.champion"), value: "Champion" },
							{ label: tUI("rarity.none"), value: "None" },
						]}
						selectedValues={selectedRarities}
						onChange={(vals) => { setSelectedRarities(vals); setPage(1); }}
					/>

					<MultiSelectFilter
						label={tUI("common.region") || "Khu vực"}
						options={[
							{ label: "Demacia", value: "Demacia" },
							{ label: "Noxus", value: "Noxus" },
							{ label: "Ionia", value: "Ionia" },
							{ label: "Freljord", value: "Freljord" },
							{ label: "Shadow Isles", value: "ShadowIsles" },
							{ label: "Bilgewater", value: "Bilgewater" },
							{ label: "Shurima", value: "Shurima" },
							{ label: "Targon", value: "Targon" },
							{ label: "Piltover & Zaun", value: "PiltoverZaun" },
							{ label: "Bandle City", value: "BandleCity" },
							{ label: "Runeterra", value: "Runeterra" },
						]}
						selectedValues={selectedRegions}
						onChange={(vals) => { setSelectedRegions(vals); setPage(1); }}
					/>

					<MultiSelectFilter
						label={tUI("common.type") || "Loại bài"}
						options={[
							{ label: "Unit", value: "Unit" },
							{ label: "Spell", value: "Spell" },
							{ label: "Landmark", value: "Landmark" },
							{ label: "Equipment", value: "Equipment" },
						]}
						selectedValues={selectedTypes}
						onChange={(vals) => { setSelectedTypes(vals); setPage(1); }}
					/>

					<MultiSelectFilter
						label={tUI("common.cost") || "Tiêu hao"}
						options={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => ({ label: n.toString(), value: n.toString() }))}
						selectedValues={selectedCosts}
						onChange={(vals) => { setSelectedCosts(vals); setPage(1); }}
					/>
				</div>
			)}
			
			// Pagination adapt (Handled by GenericListLayout)
			customTabs={null}
		/>
	);
};

export default CardList;
