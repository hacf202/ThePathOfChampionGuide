// src/hooks/useRuneFilters.jsx
import React, { useMemo, useCallback } from "react";
import { useGenericFilters } from "./useGenericFilters";
import RarityIcon from "../components/common/rarityIcon";
import { getRarityKey } from "../utils/i18nHelpers";

export const useRuneFilters = (tUI, t, dynamicFilters, knownRunes) => {
	const { state, actions, queryParams } = useGenericFilters({
		prefix: "runes",
		initialCustomFilters: { rarities: [] },
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
			return tUI(`rune.rarity.${key}`) || rawRarity;
		},
		[tUI, t],
	);

	const filterConfigs = useMemo(() => {
		const uniqueRarities = Array.from(new Set(dynamicFilters.rarities || []));

		return [
			{
				key: "rarities",
				label: tUI("common.rarity") || "Độ hiếm",
				options: uniqueRarities.map(r => {
					const sampleRune = knownRunes.find(rune => rune.rarity === r);
					return {
						value: r,
						label: getTranslatedRarity(r, sampleRune),
						iconComponent: <RarityIcon rarity={r} />,
					};
				}),
			},
		];
	}, [dynamicFilters, knownRunes, tUI, getTranslatedRarity]);

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
