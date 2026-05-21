// fe/src/hooks/useMapFilters.js
import { useMemo } from "react";
import { usePersistentState } from "./usePersistentState";
import { useGenericFilters } from "./useGenericFilters";

export const useMapFilters = (tUI, dynamicFilters) => {
	const { state, actions, queryParams } = useGenericFilters({
		prefix: "maps",
		initialCustomFilters: { difficulty: [], type: [] },
		defaultSort: "difficulty-desc",
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
			{
				key: "type",
				label: tUI("mapList.type") || "Loại Phiêu Lưu",
				options: (dynamicFilters.types || []).map(t => {
					// Chuyển đổi tên type (VD: "Hoa Linh Lục Địa" -> "hoaLinhLucDia")
					const toCamel = (str) => {
						const { removeAccents } = require("../../../utils/vietnameseUtils");
						const parts = removeAccents(str).split(' ').filter(Boolean);
						if (parts.length === 0) return "";
						return parts[0].toLowerCase() + parts.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join('');
					};
					// Import dynamically would be tricky in useMemo, let's just do a simple replace since it's hardcoded types.
					const typeMap = {
						"Phiêu Lưu Khắp Thế Giới": "phieuLuuKhapTheGioi",
						"Huyền Thoại Arcane": "huyenThoaiArcane",
						"Người Khổng Lồ Của Runeterra": "nguoiKhongLoCuaRuneterra",
						"Hoa Linh Lục Địa": "hoaLinhLucDia",
						"Tên Cướp Runeterra": "tenCuopRuneterra",
						"Ác Mộng": "acMong"
					};
					const typeKey = typeMap[t];
					
					return {
						value: t,
						label: typeKey ? tUI(`shared.adventureTypes.${typeKey}`) : t,
					};
				}),
			},
		];
	}, [dynamicFilters, tUI]);

	const sortOptions = useMemo(
		() => [
			{ value: "difficulty-desc", label: tUI("mapList.sort.difficultyDesc") || "Độ khó cao - thấp" },
			{ value: "difficulty-asc", label: tUI("mapList.sort.difficultyAsc") || "Độ khó thấp - cao" },
			{ value: "championXP-desc", label: tUI("mapList.sort.championXPDesc") || "Kinh nghiệm cao - thấp" },
			{ value: "championXP-asc", label: tUI("mapList.sort.championXPAsc") || "Kinh nghiệm thấp - cao" },
			{ value: "adventureID-desc", label: tUI("mapList.sort.adventureIDDesc") || "ID cao - thấp" },
			{ value: "adventureID-asc", label: tUI("mapList.sort.adventureIDAsc") || "ID thấp - cao" },
			{ value: "adventureName-asc", label: tUI("mapList.sort.adventureNameAsc") || "Tên (A-Z)" },
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
