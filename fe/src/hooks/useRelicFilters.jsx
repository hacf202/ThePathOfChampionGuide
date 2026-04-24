import { useMemo, useCallback } from "react";
import { useGenericFilters } from "./useGenericFilters"; // Import hook chung
import RarityIcon from "../components/common/rarityIcon";
import { getRarityKey, getTypeKey } from "../utils/i18nHelpers";

export const useRelicFilters = (tUI, t, dynamicFilters, knownRelics) => {
	// 1. GỌI HOOK CHUNG
	const { state, actions, queryParams } = useGenericFilters({
		prefix: "relics",
		initialCustomFilters: { rarities: [], types: [], stacks: [] }, // Khai báo các filter đặc thù
		defaultSort: "name-asc",
	});

	// 2. LOGIC DỊCH NGÔN NGỮ (Giữ nguyên)
	const getTranslatedRarity = useCallback(
		(rawRarity, item) => {
			if (!rawRarity) return "";
			if (item) {
				const dynTrans = t(item, "rarity");
				if (dynTrans) return dynTrans;
			}
			const key = getRarityKey(rawRarity);
			return tUI(`shared.rarity.${key}`) || rawRarity;
		},
		[tUI, t],
	);

	// 3. TẠO CONFIG ĐỂ RENDER UI COMPONENTS
	const filterConfigs = useMemo(() => {
		const uniqueRarities = Array.from(new Set(dynamicFilters.rarities || []));
		const rawTypes = dynamicFilters.types?.length
			? dynamicFilters.types
			: knownRelics.map(r => r.type).filter(Boolean);
		const rawStacks = dynamicFilters.stacks?.length
			? dynamicFilters.stacks
			: knownRelics.map(r => r.stack).filter(Boolean);

		return [
			{
				key: "rarities",
				label: tUI("admin.filters.rarityLabel") || "Độ hiếm",
				options: uniqueRarities.map(r => ({
					value: r,
					label: getTranslatedRarity(
						r,
						knownRelics.find(relic => relic.rarity === r),
					),
					iconComponent: <RarityIcon rarity={r} />,
				})),
			},
			{
				key: "types",
				label: tUI("admin.filters.typeLabel") || "Loại",
				options: Array.from(new Set(rawTypes)).map(t_val => {
					const key = getTypeKey(t_val);
					return {
						value: t_val,
						label: tUI(`relic.types.${key}`) || t_val,
					};
				}),
			},
			{
				key: "stacks",
				label: tUI("admin.filters.stackLabel") || "Cộng dồn",
				options: Array.from(new Set(rawStacks)).map(s => ({
					value: s,
					label: tUI("relicList.stackLabel").replace("{{count}}", s) || s,
				})),
			},
		];
	}, [dynamicFilters, knownRelics, tUI, getTranslatedRarity]);

	const sortOptions = useMemo(
		() => [
			{ value: "name-asc", label: tUI("sort.nameAsc") },
			{ value: "name-desc", label: tUI("sort.nameDesc") },
		],
		[tUI],
	);

	return {
		state,
		actions,
		filterConfigs, // Trả về cho Component FilterPanel
		sortOptions,
		queryParams,
		getTranslatedRarity,
	};
};
