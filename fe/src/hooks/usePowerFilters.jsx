// src/hooks/usePowerFilters.js
import React, { useMemo, useCallback } from "react";
import { useGenericFilters } from "./useGenericFilters";
import RarityIcon from "../components/common/rarityIcon";
import { getRarityKey, getTypeKey } from "../utils/i18nHelpers";

export const usePowerFilters = (tUI, t, dynamicFilters, knownPowers) => {
	const { state, actions, queryParams } = useGenericFilters({
		prefix: "powers",
		initialCustomFilters: { rarities: [], types: [] },
		defaultSort: "name-asc",
		itemsPerPage: 20,
	});

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

	const filterConfigs = useMemo(() => {
		const uniqueRarities = Array.from(new Set(dynamicFilters.rarities || []));
		const uniqueTypes = Array.from(new Set(dynamicFilters.types || []));

		return [
			{
				key: "rarities",
				label: tUI("common.rarity") || "Độ hiếm",
				options: uniqueRarities.map(r => {
					const samplePower = knownPowers.find(p => p.rarity === r);
					return {
						value: r,
						label: getTranslatedRarity(r, samplePower),
						iconComponent: <RarityIcon rarity={r} />,
					};
				}),
			},
			{
				key: "types",
				label: tUI("common.type") || "Loại",
				options: uniqueTypes.map(type => {
					const key = getTypeKey(type);
					return {
						value: type,
						label: tUI(`power.types.${key.toLowerCase().replace(/\s+/g, "")}`) || type,
					};
				}),
			},
		];
	}, [dynamicFilters, knownPowers, tUI, getTranslatedRarity]);

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
