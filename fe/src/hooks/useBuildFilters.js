// src/hooks/useBuildFilters.js
import { useMemo } from "react";
import { useGenericFilters } from "./useGenericFilters";
import iconRegionsData from "../assets/data/icon.json";

export const useBuildFilters = (tUI, dynamicFilters = {}) => {
	const { state, actions, queryParams } = useGenericFilters({
		prefix: "builds",
		initialCustomFilters: { stars: [], regions: [], championIDs: [] },
		defaultSort: "createdAt-desc",
		itemsPerPage: 20,
	});

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

	const filterConfigs = useMemo(() => {
		return [
			{
				key: "regions",
				label: tUI("common.region") || "Khu vực",
				options: (dynamicFilters.regions || []).map(name => ({
					value: name,
					label: name,
					iconUrl:
						iconRegionsData.find(r => r.name === name)?.image ??
						"/fallback-image.svg",
				})),
			},
			{
				key: "stars",
				label: tUI("common.star") || "Số sao",
				options: [1, 2, 3, 4, 5, 6, 7].map(s => ({
					value: s.toString(),
					label: "",
					isStar: true,
				})),
			},
		];
	}, [dynamicFilters, tUI]);

	return {
		state,
		actions,
		filterConfigs,
		sortOptions,
		queryParams,
	};
};
