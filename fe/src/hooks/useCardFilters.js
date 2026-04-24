// fe/src/hooks/useCardFilters.js
import { useMemo } from "react";
import { useGenericFilters } from "./useGenericFilters";
import { removeAccents } from "../utils/vietnameseUtils";
import iconRegions from "../assets/data/icon.json";

export const useCardFilters = (tUI, dynamicFilters) => {
	// 1. Khởi tạo Hook dùng chung (Tự động lo liệu việc đồng bộ URL)
	const { state, actions, queryParams } = useGenericFilters({
		prefix: "cards",
		initialCustomFilters: { rarities: [], regions: [], types: [], costs: [] },
		defaultSort: "cardName-asc",
		itemsPerPage: 20,
		extraParams: { onlyBase: "true" }, // Chỉ hiển thị lá bài gốc (không phải token)
	});

	// --- CẤU HÌNH BỘ LỌC ĐỒNG BỘ VỚI CHAMPION LIST ---
	const filterConfigs = useMemo(() => {
		if (!dynamicFilters) return [];

		return [
			{
				key: "rarities",
				label: tUI("common.rarity") || "Độ hiếm",
				options: (dynamicFilters.rarities || []).map(r => ({
					label: tUI(`shared.rarity.${r.toLowerCase()}`) || r,
					value: r
				}))
			},
			{
				key: "regions",
				label: tUI("common.region") || "Khu vực",
				options: (dynamicFilters.regions || []).map(r => {
					// 1. Tìm trong icon.json để lấy tên tiếng Việt chuẩn hoặc khớp mã
					const iconRegion = iconRegions.find(i => 
						i.name === r || 
						i.nameRef === r || 
						i.nameRef === r.replace(/[\s&]+/g, '')
					);
					const targetName = iconRegion ? iconRegion.name : r;
					// 2. Slugify tên tiếng Việt để ra key (ví dụ: 'Quần Đảo Bóng Đêm' -> 'quandaobongdem')
					const regionKey = removeAccents(targetName)
						.toLowerCase()
						.replace(/[^a-z0-9]/g, "");

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
					label: tUI(`shared.cardType.${t.toLowerCase()}`) || t,
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
		{ value: "cost-asc", label: tUI("sort.costAsc") || "Tiêu hao (Thấp-Cao)" },
		{ value: "cost-desc", label: tUI("sort.costDesc") || "Tiêu hao (Cao-Thấp)" },
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
