// src/hooks/usePowerFilters.js
import React, { useMemo, useCallback } from "react";
import { usePersistentState } from "./usePersistentState";
import { removeAccents } from "../utils/vietnameseUtils";
import RarityIcon from "../components/common/rarityIcon";

export const usePowerFilters = (tUI, t, dynamicFilters, knownPowers) => {
	const [searchInput, setSearchInput] = usePersistentState(
		"powersSearchInput",
		"",
	);
	const [searchTerm, setSearchTerm] = usePersistentState(
		"powersSearchTerm",
		"",
	);
	const [selectedRarities, setSelectedRarities] = usePersistentState(
		"powersSelectedRarities",
		[],
	);
	const [selectedTypes, setSelectedTypes] = usePersistentState(
		"powersSelectedTypes",
		[],
	);
	const [sortOrder, setSortOrder] = usePersistentState(
		"powersSortOrder",
		"name-asc",
	);
	const [currentPage, setCurrentPage] = usePersistentState(
		"powersCurrentPage",
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
		setSelectedTypes([]);
		setSortOrder("name-asc");
		setCurrentPage(1);
	}, [
		setSearchInput,
		setSearchTerm,
		setSelectedRarities,
		setSelectedTypes,
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
			return tUI(`power.rarity.${rawRarity.toLowerCase()}`);
		},
		[tUI, t],
	);

	const filterOptions = useMemo(() => {
		const uniqueRarities = Array.from(new Set(dynamicFilters.rarities || []));
		const uniqueTypes = Array.from(new Set(dynamicFilters.types || []));

		return {
			rarities: uniqueRarities.map(r => {
				const samplePower = knownPowers.find(p => p.rarity === r);
				return {
					value: r,
					label: getTranslatedRarity(r, samplePower),
					iconComponent: <RarityIcon rarity={r} />,
				};
			}),
			types: uniqueTypes.map(type => ({
				value: type,
				label:
					tUI(`power.types.${type.toLowerCase().replace(/\s+/g, "")}`) || type,
			})),
			sort: [
				{ value: "name-asc", label: tUI("sort.nameAsc") },
				{ value: "name-desc", label: tUI("sort.nameDesc") },
			],
		};
	}, [dynamicFilters, knownPowers, tUI, getTranslatedRarity]);

	const queryParams = useMemo(() => {
		const params = new URLSearchParams();
		params.append("page", currentPage);
		params.append("limit", 24); // Cố định ITEMS_PER_PAGE
		params.append("sort", sortOrder);
		if (searchTerm) params.append("searchTerm", searchTerm);
		if (selectedRarities.length > 0)
			params.append("rarities", selectedRarities.join(","));
		if (selectedTypes.length > 0)
			params.append("types", selectedTypes.join(","));
		return params.toString();
	}, [currentPage, searchTerm, selectedRarities, selectedTypes, sortOrder]);

	return {
		state: {
			searchInput,
			searchTerm,
			selectedRarities,
			selectedTypes,
			sortOrder,
			currentPage,
		},
		actions: {
			setSearchInput,
			setSelectedRarities,
			setSelectedTypes,
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
