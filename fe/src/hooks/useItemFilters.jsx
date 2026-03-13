// src/hooks/useItemFilters.jsx
import React, { useMemo, useCallback } from "react";
import { usePersistentState } from "./usePersistentState";
import { removeAccents } from "../utils/vietnameseUtils";
import RarityIcon from "../components/common/rarityIcon";

export const useItemFilters = (tUI, t, dynamicFilters, knownItems) => {
	const [searchInput, setSearchInput] = usePersistentState(
		"itemsSearchInput",
		"",
	);
	const [searchTerm, setSearchTerm] = usePersistentState("itemsSearchTerm", "");
	const [selectedRarities, setSelectedRarities] = usePersistentState(
		"itemsSelectedRarities",
		[],
	);
	const [sortOrder, setSortOrder] = usePersistentState(
		"itemsSortOrder",
		"name-asc",
	);
	const [currentPage, setCurrentPage] = usePersistentState(
		"itemsCurrentPage",
		1,
	);

	const handleSearch = useCallback(() => {
		setSearchTerm(removeAccents(searchInput.trim()));
		setCurrentPage(1);
	}, [searchInput, setSearchTerm, setCurrentPage]);

	const handleResetFilters = useCallback(() => {
		setSearchInput("");
		setSearchTerm("");
		setSelectedRarities([]);
		setSortOrder("name-asc");
		setCurrentPage(1);
	}, [
		setSearchInput,
		setSearchTerm,
		setSelectedRarities,
		setSortOrder,
		setCurrentPage,
	]);

	const getTranslatedRarity = useCallback(
		(rawRarity, item) => {
			if (!rawRarity) return "";
			if (item) {
				const dynTrans = t(item, "rarity");
				if (dynTrans) return dynTrans;
			}
			return tUI(`item.rarity.${rawRarity.toLowerCase()}`);
		},
		[tUI, t],
	);

	const filterOptions = useMemo(() => {
		const uniqueRarities = Array.from(new Set(dynamicFilters.rarities || []));

		return {
			rarities: uniqueRarities.map(r => {
				const sampleItem = knownItems.find(i => i.rarity === r);
				return {
					value: r,
					label: getTranslatedRarity(r, sampleItem),
					iconComponent: <RarityIcon rarity={r} />,
				};
			}),
			sort: [
				{ value: "name-asc", label: tUI("sort.nameAsc") },
				{ value: "name-desc", label: tUI("sort.nameDesc") },
			],
		};
	}, [dynamicFilters, knownItems, tUI, getTranslatedRarity]);

	const queryParams = useMemo(() => {
		const params = new URLSearchParams();
		params.append("page", currentPage);
		params.append("limit", 24); // Cố định ITEMS_PER_PAGE
		params.append("sort", sortOrder);
		if (searchTerm) params.append("searchTerm", searchTerm);
		if (selectedRarities.length > 0)
			params.append("rarities", selectedRarities.join(","));
		return params.toString();
	}, [currentPage, searchTerm, selectedRarities, sortOrder]);

	return {
		state: {
			searchInput,
			searchTerm,
			selectedRarities,
			sortOrder,
			currentPage,
		},
		actions: {
			setSearchInput,
			setSelectedRarities,
			setSortOrder,
			setCurrentPage,
			handleSearch,
			handleResetFilters,
		},
		filterOptions,
		queryParams,
		getTranslatedRarity,
	};
};
