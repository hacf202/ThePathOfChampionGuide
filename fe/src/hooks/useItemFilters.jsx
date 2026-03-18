// src/hooks/useItemFilters.jsx
import React, { useMemo, useCallback } from "react";
import { useGenericFilters } from "./useGenericFilters";
import RarityIcon from "../components/common/rarityIcon";

export const useItemFilters = (tUI, t, dynamicFilters, knownItems) => {
	// 1. GỌI HOOK CHUNG
	const { state, actions, queryParams } = useGenericFilters({
		prefix: "items",
		initialCustomFilters: { rarities: [] },
		defaultSort: "name-asc",
		itemsPerPage: 24,
	});

	// 2. LOGIC DỊCH NGÔN NGỮ
	const getTranslatedRarity = useCallback(
		(rawRarity, item) => {
			if (!rawRarity) return "";
			if (item) {
				const dynTrans = t(item, "rarity");
				if (dynTrans) return dynTrans;
			}
			return tUI(`item.rarity.${rawRarity.toLowerCase()}`);
		},
		[tUI, t],
	);

	// 3. CẤU HÌNH GIAO DIỆN BỘ LỌC
	const filterConfigs = useMemo(() => {
		const uniqueRarities = Array.from(new Set(dynamicFilters.rarities || []));

		return [
			{
				key: "rarities",
				label: tUI("common.rarity") || "Độ hiếm",
				options: uniqueRarities.map(r => {
					const sampleItem = knownItems.find(i => i.rarity === r);
					return {
						value: r,
						label: getTranslatedRarity(r, sampleItem),
						iconComponent: <RarityIcon rarity={r} />,
					};
				}),
			},
		];
	}, [dynamicFilters, knownItems, tUI, getTranslatedRarity]);

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
		filterConfigs,
		sortOptions,
		queryParams,
		getTranslatedRarity,
	};
};
