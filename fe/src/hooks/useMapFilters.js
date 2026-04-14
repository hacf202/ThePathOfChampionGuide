// fe/src/hooks/useMapFilters.js
import { useMemo } from "react";
import { usePersistentState } from "./usePersistentState";
import { useGenericFilters } from "./useGenericFilters";

export const useMapFilters = (tUI, dynamicFilters) => {
	const { state, actions, queryParams } = useGenericFilters({
		prefix: "maps",
		initialCustomFilters: { difficulty: [] },
		defaultSort: "difficulty-asc",
		itemsPerPage: 20,
	});

	const [isFilterOpen, setIsFilterOpen] = usePersistentState(
		"mapsIsFilterOpen",
		false,
	);
	const [showDesktopFilter, setShowDesktopFilter] = usePersistentState(
		"mapsShowDesktopFilter",
		true,
	);

	const handleSearch = () => {
		actions.handleSearch();
		if (window.innerWidth < 1024) setIsFilterOpen(false);
	};

	const filterConfigs = useMemo(() => {
		if (!dynamicFilters) return [];

		return [
			{
				key: "difficulty",
				label: tUI("mapList.difficulty") || "Độ khó",
				options: (dynamicFilters.difficulties || []).map(d => ({
					value: d.toString(),
					label: `${d} ★`,
				})),
			},
		];
	}, [dynamicFilters, tUI]);

	const sortOptions = useMemo(
		() => [
			{ value: "difficulty-asc", label: "Độ khó (Thấp-Cao)" },
			{ value: "difficulty-desc", label: "Độ khó (Cao-Thấp)" },
			{ value: "adventureName-asc", label: "Tên (A-Z)" },
		],
		[],
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
