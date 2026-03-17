// src/hooks/useBuildFilters.js
import { useMemo, useCallback } from "react";
import { usePersistentState } from "./usePersistentState";
import iconRegionsData from "../assets/data/iconRegions.json";

export const useBuildFilters = (tUI, dynamicFilters = {}) => {
	const [searchInput, setSearchInput] = usePersistentState(
		"buildsSearchInput",
		"",
	);
	const [searchTerm, setSearchTerm] = usePersistentState(
		"buildsSearchTerm",
		"",
	);
	const [selectedStarLevels, setSelectedStarLevels] = usePersistentState(
		"buildsSelectedStarLevels",
		[],
	);
	const [selectedRegions, setSelectedRegions] = usePersistentState(
		"buildsSelectedRegions",
		[],
	);
	const [sortBy, setSortBy] = usePersistentState(
		"buildsSortBy",
		"createdAt-desc",
	);
	const [currentPage, setCurrentPage] = usePersistentState(
		"buildsCurrentPage",
		1,
	);

	const handleSearch = useCallback(() => {
		setSearchTerm(searchInput.trim());
		setCurrentPage(1);
	}, [searchInput, setSearchTerm, setCurrentPage]);

	const handleResetFilters = useCallback(() => {
		setSearchInput("");
		setSearchTerm("");
		setSelectedStarLevels([]);
		setSelectedRegions([]);
		setSortBy("createdAt-desc");
		setCurrentPage(1);
	}, [
		setSearchInput,
		setSearchTerm,
		setSelectedStarLevels,
		setSelectedRegions,
		setSortBy,
		setCurrentPage,
	]);

	// Tùy chọn sắp xếp (Lấy từ từ điển)
	const sortOptions = useMemo(
		() => [
			{ value: "createdAt-desc", label: tUI("sort.createdAtDesc") },
			{ value: "createdAt-asc", label: tUI("sort.createdAtAsc") },
			{ value: "championName-asc", label: tUI("sort.nameAsc") },
			{ value: "championName-desc", label: tUI("sort.nameDesc") },
			{ value: "like-desc", label: tUI("sort.likeDesc") },
			{ value: "like-asc", label: tUI("sort.likeAsc") },
			{ value: "views-desc", label: tUI("sort.viewsDesc") },
		],
		[tUI],
	);

	const filterOptions = useMemo(() => {
		return {
			regions: (dynamicFilters.regions || []).map(name => ({
				value: name,
				label: name,
				iconUrl:
					iconRegionsData.find(r => r.name === name)?.iconAbsolutePath ??
					"/fallback-image.svg",
			})),
			starLevels: [1, 2, 3, 4, 5, 6, 7].map(s => ({
				value: s.toString(),
				label: "",
				isStar: true,
			})),
			sort: sortOptions,
		};
	}, [dynamicFilters, sortOptions]);

	const queryParams = useMemo(() => {
		const params = new URLSearchParams();
		params.append("page", currentPage);
		params.append("limit", 20); // Phân trang chuẩn
		params.append("sort", sortBy);

		// 🟢 ĐỔI "search" THÀNH "searchTerm" ĐỂ KHỚP VỚI BACKEND
		if (searchTerm) params.append("searchTerm", searchTerm);

		if (selectedStarLevels.length > 0)
			params.append("stars", selectedStarLevels.join(","));
		if (selectedRegions.length > 0)
			params.append("regions", selectedRegions.join(","));
		return params.toString();
	}, [currentPage, searchTerm, selectedStarLevels, selectedRegions, sortBy]);

	return {
		state: {
			searchInput,
			searchTerm,
			selectedStarLevels,
			selectedRegions,
			sortBy,
			currentPage,
		},
		actions: {
			setSearchInput,
			setSelectedStarLevels,
			setSelectedRegions,
			setSortBy,
			setCurrentPage,
			handleSearch,
			handleResetFilters,
		},
		filterOptions,
		queryParams,
	};
};
