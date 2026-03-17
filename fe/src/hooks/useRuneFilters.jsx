// src/hooks/useRuneFilters.jsx
import React, { useMemo, useCallback } from "react";
import { usePersistentState } from "./usePersistentState";
import { removeAccents } from "../utils/vietnameseUtils";
import RarityIcon from "../components/common/rarityIcon";

export const useRuneFilters = (tUI, t, dynamicFilters, knownRunes) => {
	const [searchInput, setSearchInput] = usePersistentState(
		"runesSearchInput",
		"",
	);
	const [searchTerm, setSearchTerm] = usePersistentState("runesSearchTerm", "");
	const [selectedRarities, setSelectedRarities] = usePersistentState(
		"runesSelectedRarities",
		[],
	);
	const [sortOrder, setSortOrder] = usePersistentState(
		"runesSortOrder",
		"name-asc",
	);
	const [currentPage, setCurrentPage] = usePersistentState(
		"runesCurrentPage",
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
			// Dự phòng (fallback) nếu JSON chưa kịp cập nhật độ hiếm mới
			return tUI(`rune.rarity.${rawRarity.toLowerCase()}`) || rawRarity;
		},
		[tUI, t],
	);

	const filterOptions = useMemo(() => {
		const uniqueRarities = Array.from(new Set(dynamicFilters.rarities || []));

		return {
			rarities: uniqueRarities.map(r => {
				const sampleRune = knownRunes.find(rune => rune.rarity === r);
				return {
					value: r,
					label: getTranslatedRarity(r, sampleRune),
					iconComponent: <RarityIcon rarity={r} />,
				};
			}),
			sort: [
				{ value: "name-asc", label: tUI("sort.nameAsc") },
				{ value: "name-desc", label: tUI("sort.nameDesc") },
			],
		};
	}, [dynamicFilters, knownRunes, tUI, getTranslatedRarity]);

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
