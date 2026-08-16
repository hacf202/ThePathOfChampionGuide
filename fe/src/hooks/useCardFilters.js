// fe/src/hooks/useCardFilters.js
import { useMemo } from "react";
import { useGenericFilters } from "./useGenericFilters";
import iconRegions from "@/assets/data/icon.json";
import { getRegionKey, getRarityKey, getTypeKey } from "@/utils/i18nHelpers";


export const useCardFilters = (tUI, dynamicFilters) => {
	// 1. Khởi tạo Hook dùng chung (Tự động lo liệu việc đồng bộ URL)
	const { state, actions, queryParams } = useGenericFilters({
		prefix: "cards",
		initialCustomFilters: { rarities: [], regions: [], types: [], costs: [] },
		defaultSort: "championCost-asc",
		itemsPerPage: 20,
		extraParams: { onlyBase: "true" }, // Chỉ hiển thị lá bài gốc (không phải token)
	});

	// --- CẤU HÌNH BỘ LỌC ĐỒNG BỘ VỚI CHAMPION LIST ---
	const filterConfigs = useMemo(() => {
		if (!dynamicFilters) return [];

		return [
			{
				key: "rarities",
				label: tUI("common.rarity"),
				options: (dynamicFilters.rarities || []).map(r => ({
					label: tUI(`shared.rarity.${getRarityKey(r)}`) || r,
					value: r
				}))
			},
			{
				key: "regions",
				label: tUI("common.region"),
				options: (dynamicFilters.regions || []).map(r => {
					// 1. Tìm trong icon.json để lấy tên tiếng Việt chuẩn hoặc khớp mã
					const iconRegion = iconRegions.find(i => getRegionKey(i.name) === getRegionKey(r));
					const targetName = iconRegion ? iconRegion.name : r;
					// 2. Lấy key chuẩn
					const regionKey = getRegionKey(targetName);

					return {
						value: r,
						label: tUI(`shared.region.${regionKey}`) || r,
						iconUrl: iconRegion?.image
					};
				}),
			},
			{
				key: "types",
				label: tUI("common.type") || "Loại bài",
				options: (dynamicFilters.types || []).map(t => ({
					label: tUI(`shared.cardType.${getTypeKey(t)}`) || t,
					value: t
				}))
			},
			{
				key: "costs",
				label: tUI("common.cost") || "Tiêu hao",
				options: (dynamicFilters.costs || []).map(n => ({ 
					label: n.toString(), 
					value: n.toString() 
				}))
			}
		];
	}, [dynamicFilters, tUI]);

	const sortOptions = useMemo(() => [
		{ value: "cardName-asc", label: tUI("sort.nameAsc") || "Tên (A-Z)" },
		{ value: "cardName-desc", label: tUI("sort.nameDesc") || "Tên (Z-A)" },
		{ value: "championCost-asc", label: tUI("sort.championCostAsc") || "Tiêu hao thấp-cao" },
		{ value: "cost-desc", label: tUI("sort.costDesc") || "Tiêu hao cao-thấp" },
	], [tUI]);

	const optionsMap = useMemo(() => 
		filterConfigs.reduce((acc, config) => {
			acc[config.key] = config.options;
			return acc;
		}, {}), 
	[filterConfigs]);

	return {
		state,
		actions,
		queryParams,
		filterConfigs,
		sortOptions,
		optionsMap
	};
};
