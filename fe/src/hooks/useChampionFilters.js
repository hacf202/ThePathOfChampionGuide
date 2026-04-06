// src/hooks/useChampionFilters.js
import { useMemo } from "react";
import { usePersistentState } from "./usePersistentState";
import { useGenericFilters } from "./useGenericFilters";
import { removeAccents } from "../utils/vietnameseUtils";
import iconRegions from "../assets/data/iconRegions.json";

export const useChampionFilters = (tUI, dynamicFilters) => {
	// 1. Gọi Hook dùng chung (Tự động lo liệu việc đồng bộ URL)
	const { state, actions, queryParams } = useGenericFilters({
		prefix: "champions",
		initialCustomFilters: { regions: [], costs: [], maxStars: [], tags: [] },
		defaultSort: "name-asc",
		itemsPerPage: 24,
	});

	// Các State thuần tuý phục vụ đóng/mở giao diện trên Mobile
	const [isFilterOpen, setIsFilterOpen] = usePersistentState(
		"championsIsFilterOpen",
		false,
	);
	const [showDesktopFilter, setShowDesktopFilter] = usePersistentState(
		"championsShowDesktopFilter",
		true,
	);

	// Bọc hàm Search để đóng Menu trên Mobile
	const handleSearch = () => {
		actions.handleSearch();
		if (window.innerWidth < 1024) setIsFilterOpen(false);
	};

	const filterConfigs = useMemo(() => {
		if (!dynamicFilters) return [];

		return [
			{
				key: "regions",
				label: tUI("common.region") || "Khu vực",
				options: (dynamicFilters.regions || []).map(r => {
					// 1. Tìm trong iconRegions.json để lấy tên tiếng Việt chuẩn
					const iconRegion = iconRegions.find(i => 
						i.name === r || // Khớp tên tiếng Việt
						i.nameRef === r || // Khớp mã English CamelCase
						i.nameRef === r.replace(/[\s&]+/g, '') // Khớp mã English không dấu/khoảng cách
					);
					const targetName = iconRegion ? iconRegion.name : r;
					// 2. Slugify tên tiếng Việt để ra key (ví dụ: 'Quần Đảo Bóng Đêm' -> 'quandaobongdem')
					const regionKey = removeAccents(targetName)
						.toLowerCase()
						.replace(/[^a-z0-9]/g, "");

					return {
						value: r,
						label: tUI(`region.${regionKey}`) || r,
						iconUrl: iconRegions.find(i => i.name === r || i.nameRef === r)?.iconAbsolutePath,
					};
				}),
			},
			{
				key: "costs",
				label: tUI("championList.cost") || "Mana",
				options: (dynamicFilters.costs || []).map(c => ({
					value: c.toString(),
					label: `${c} ${tUI("championList.cost") || "Mana"}`,
					isCost: true,
				})),
			},
			{
				key: "maxStars",
				label: tUI("common.star") || "Số sao",
				options: (dynamicFilters.maxStars || []).map(s => ({
					value: s.toString(),
					label: `${s} ⭐`,
					isStar: true,
				})),
			},
			{
				key: "tags",
				label: tUI("common.tag") || "Tags",
				options: (dynamicFilters.tags || []).map(t => ({
					value: t,
					label: t,
					isTag: true,
				})),
			},
		];
	}, [dynamicFilters, tUI]);

	const sortOptions = useMemo(
		() => [
			{ value: "name-asc", label: tUI("sort.nameAsc") },
			{ value: "name-desc", label: tUI("sort.nameDesc") },
			{ value: "cost-asc", label: tUI("sort.costAsc") },
			{ value: "cost-desc", label: tUI("sort.costDesc") },
		],
		[tUI],
	);

	return {
		state: {
			...state,
			isFilterOpen,
			showDesktopFilter,
		},
		actions: {
			...actions,
			handleSearch,
			setIsFilterOpen,
			setShowDesktopFilter,
		},
		filterConfigs,
		sortOptions,
		queryParams,
	};
};
