// src/hooks/useChampionFilters.js
import { useMemo, useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { usePersistentState } from "./usePersistentState";
import { removeAccents } from "../utils/vietnameseUtils";
import iconRegions from "../assets/data/iconRegions.json";

export const useChampionFilters = (tUI, dynamicFilters) => {
	const [searchParams, setSearchParams] = useSearchParams();
	const isFirstRender = useRef(true);

	const [searchInput, setSearchInput] = usePersistentState(
		"championsSearchInput",
		"",
	);
	const [searchTerm, setSearchTerm] = usePersistentState(
		"championsSearchTerm",
		"",
	);
	const [selectedRegions, setSelectedRegions] = usePersistentState(
		"championsSelectedRegions",
		[],
	);
	const [selectedCosts, setSelectedCosts] = usePersistentState(
		"championsSelectedCosts",
		[],
	);
	const [selectedMaxStars, setSelectedMaxStars] = usePersistentState(
		"championsSelectedMaxStars",
		[],
	);
	const [selectedTags, setSelectedTags] = usePersistentState(
		"championsSelectedTags",
		[],
	);
	const [sortOrder, setSortOrder] = usePersistentState(
		"championsSortOrder",
		"name-asc",
	);
	const [currentPage, setCurrentPage] = usePersistentState(
		"championsCurrentPage",
		1,
	);
	const [isFilterOpen, setIsFilterOpen] = usePersistentState(
		"championsIsFilterOpen",
		false,
	);
	const [showDesktopFilter, setShowDesktopFilter] = usePersistentState(
		"championsShowDesktopFilter",
		true,
	);

	// --- ĐỌC BỘ LỌC TỪ URL KHI VỪA VÀO TRANG ---
	useEffect(() => {
		const urlRegions = searchParams.get("regions");
		if (urlRegions) {
			setSelectedRegions(urlRegions.split(","));
			setSearchInput("");
			setSearchTerm("");
			setSelectedCosts([]);
			setSelectedMaxStars([]);
			setSelectedTags([]);
			setCurrentPage(1);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// --- CẬP NHẬT URL KHI THAY ĐỔI BỘ LỌC ---
	useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return;
		}

		const params = new URLSearchParams();
		if (currentPage !== 1) params.append("page", currentPage);
		if (sortOrder !== "name-asc") params.append("sort", sortOrder);
		if (searchTerm) params.append("searchTerm", searchTerm);
		if (selectedRegions.length > 0)
			params.append("regions", selectedRegions.join(","));
		if (selectedCosts.length > 0)
			params.append("costs", selectedCosts.join(","));
		if (selectedMaxStars.length > 0)
			params.append("maxStars", selectedMaxStars.join(","));
		if (selectedTags.length > 0) params.append("tags", selectedTags.join(","));

		setSearchParams(params, { replace: true });
	}, [
		currentPage,
		searchTerm,
		selectedRegions,
		selectedCosts,
		selectedMaxStars,
		selectedTags,
		sortOrder,
		setSearchParams,
	]);

	const handleSearch = useCallback(() => {
		setSearchTerm(removeAccents(searchInput.trim()));
		setCurrentPage(1);
		if (window.innerWidth < 1024) setIsFilterOpen(false);
	}, [searchInput, setSearchTerm, setCurrentPage, setIsFilterOpen]);

	const handleResetFilters = useCallback(() => {
		setSearchInput("");
		setSearchTerm("");
		setSelectedRegions([]);
		setSelectedCosts([]);
		setSelectedMaxStars([]);
		setSelectedTags([]);
		setSortOrder("name-asc");
		setCurrentPage(1);
	}, [
		setSearchInput,
		setSearchTerm,
		setSelectedRegions,
		setSelectedCosts,
		setSelectedMaxStars,
		setSelectedTags,
		setSortOrder,
		setCurrentPage,
	]);

	const filterOptions = useMemo(() => {
		if (!dynamicFilters)
			return { regions: [], costs: [], maxStars: [], tags: [], sort: [] };

		return {
			regions: (dynamicFilters.regions || []).map(r => {
				// ĐÃ SỬA: Loại bỏ dấu tiếng Việt để Key tạo ra đồng nhất giữa 2 ngôn ngữ
				const regionKey = removeAccents(r)
					.toLowerCase()
					.replace(/[^a-z0-9]/g, "");
				return {
					value: r,
					label: tUI(`region.${regionKey}`) || r,
					iconUrl: iconRegions.find(i => i.name === r)?.iconAbsolutePath,
				};
			}),
			costs: (dynamicFilters.costs || []).map(c => ({
				value: c.toString(), // Đã chuyển thành String để đồng bộ UI
				label: `${c} ${tUI("championList.cost") || "Mana"}`,
				isCost: true,
			})),
			maxStars: (dynamicFilters.maxStars || []).map(s => ({
				value: s.toString(),
				label: `${s} ⭐`,
				isStar: true,
			})),
			tags: (dynamicFilters.tags || []).map(t => ({
				value: t,
				label: t,
				isTag: true,
			})),
			sort: [
				{ value: "name-asc", label: tUI("sort.nameAsc") },
				{ value: "name-desc", label: tUI("sort.nameDesc") },
				{ value: "cost-asc", label: tUI("sort.costAsc") },
				{ value: "cost-desc", label: tUI("sort.costDesc") },
			],
		};
	}, [dynamicFilters, tUI]);

	const queryParams = useMemo(() => {
		const params = new URLSearchParams();
		params.append("page", currentPage);
		params.append("limit", 20);
		params.append("sort", sortOrder);
		if (searchTerm) params.append("searchTerm", searchTerm);
		if (selectedRegions.length > 0)
			params.append("regions", selectedRegions.join(","));
		if (selectedCosts.length > 0)
			params.append("costs", selectedCosts.join(","));
		if (selectedMaxStars.length > 0)
			params.append("maxStars", selectedMaxStars.join(","));
		if (selectedTags.length > 0) params.append("tags", selectedTags.join(","));
		return params.toString();
	}, [
		currentPage,
		searchTerm,
		selectedRegions,
		selectedCosts,
		selectedMaxStars,
		selectedTags,
		sortOrder,
	]);

	return {
		state: {
			searchInput,
			searchTerm,
			selectedRegions,
			selectedCosts,
			selectedMaxStars,
			selectedTags,
			sortOrder,
			currentPage,
			isFilterOpen,
			showDesktopFilter,
		},
		actions: {
			setSearchInput,
			setSelectedRegions: vals => {
				setSelectedRegions(vals);
				setCurrentPage(1);
			},
			setSelectedCosts: vals => {
				setSelectedCosts(vals);
				setCurrentPage(1);
			},
			setSelectedMaxStars: vals => {
				setSelectedMaxStars(vals);
				setCurrentPage(1);
			},
			setSelectedTags: vals => {
				setSelectedTags(vals);
				setCurrentPage(1);
			},
			setSortOrder: val => {
				setSortOrder(val);
				setCurrentPage(1);
			},
			setCurrentPage,
			setIsFilterOpen,
			setShowDesktopFilter,
			handleSearch,
			handleResetFilters,
		},
		filterOptions,
		queryParams,
	};
};
