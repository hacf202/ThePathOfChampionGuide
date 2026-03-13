// src/hooks/useRelicFilters.jsx
import React, { useMemo, useCallback } from "react";
import { usePersistentState } from "./usePersistentState";
import { removeAccents } from "../utils/vietnameseUtils";
import RarityIcon from "../components/common/rarityIcon";

export const useRelicFilters = (tUI, t, dynamicFilters, knownRelics) => {
	const [searchInput, setSearchInput] = usePersistentState(
		"relicsSearchInput",
		"",
	);
	const [searchTerm, setSearchTerm] = usePersistentState(
		"relicsSearchTerm",
		"",
	);
	const [selectedRarities, setSelectedRarities] = usePersistentState(
		"relicsSelectedRarities",
		[],
	);
	const [selectedTypes, setSelectedTypes] = usePersistentState(
		"relicsSelectedTypes",
		[],
	);
	const [selectedStacks, setSelectedStacks] = usePersistentState(
		"relicsSelectedStacks",
		[],
	);
	const [sortOrder, setSortOrder] = usePersistentState(
		"relicsSortOrder",
		"name-asc",
	);
	const [currentPage, setCurrentPage] = usePersistentState(
		"relicsCurrentPage",
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
		setSelectedStacks([]);
		setSortOrder("name-asc");
		setCurrentPage(1);
	}, [
		setSearchInput,
		setSearchTerm,
		setSelectedRarities,
		setSelectedTypes,
		setSelectedStacks,
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
			// Có fallback || rawRarity để tránh lỗi mất chữ nếu chưa cập nhật file ngôn ngữ
			return tUI(`relic.rarity.${rawRarity.toLowerCase()}`) || rawRarity;
		},
		[tUI, t],
	);

	const filterOptions = useMemo(() => {
		const uniqueRarities = Array.from(new Set(dynamicFilters.rarities || []));

		const rawTypes =
			dynamicFilters.types && dynamicFilters.types.length > 0
				? dynamicFilters.types
				: knownRelics.map(r => r.type).filter(Boolean);
		const uniqueTypes = Array.from(new Set(rawTypes));

		const rawStacks =
			dynamicFilters.stacks && dynamicFilters.stacks.length > 0
				? dynamicFilters.stacks
				: knownRelics.map(r => r.stack).filter(Boolean);
		const uniqueStacks = Array.from(new Set(rawStacks));

		return {
			rarities: uniqueRarities.map(r => {
				const sampleRelic = knownRelics.find(relic => relic.rarity === r);
				return {
					value: r,
					label: getTranslatedRarity(r, sampleRelic),
					iconComponent: <RarityIcon rarity={r} />,
				};
			}),
			types: uniqueTypes.map(t_val => {
				const normalizedType =
					typeof t_val === "string" ? t_val.toLowerCase() : "";
				return {
					value: t_val,
					label: tUI(`relic.types.${normalizedType}`) || t_val,
				};
			}),
			stacks: uniqueStacks.map(s => {
				const stackTemplate = tUI("relicList.stackLabel");
				const labelStr =
					stackTemplate !== "relicList.stackLabel"
						? stackTemplate.replace("{{count}}", s)
						: s;
				return {
					value: s,
					label: labelStr,
				};
			}),
			sort: [
				{ value: "name-asc", label: tUI("sort.nameAsc") },
				{ value: "name-desc", label: tUI("sort.nameDesc") },
			],
		};
	}, [dynamicFilters, knownRelics, tUI, getTranslatedRarity]);

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
		if (selectedStacks.length > 0)
			params.append("stacks", selectedStacks.join(","));
		return params.toString();
	}, [
		currentPage,
		searchTerm,
		selectedRarities,
		selectedTypes,
		selectedStacks,
		sortOrder,
	]);

	return {
		state: {
			searchInput,
			searchTerm,
			selectedRarities,
			selectedTypes,
			selectedStacks,
			sortOrder,
			currentPage,
		},
		actions: {
			setSearchInput,
			setSelectedRarities,
			setSelectedTypes,
			setSelectedStacks,
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
