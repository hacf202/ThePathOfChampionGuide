// src/hooks/useBossFilters.jsx
import { useMemo } from "react";
import { useGenericFilters } from "./useGenericFilters";

export const useBossFilters = (tUI, t, dynamicFilters, knownBosses) => {
	// 1. GỌI HOOK CHUNG
	const { state, actions, queryParams } = useGenericFilters({
		prefix: "bosses",
		initialCustomFilters: {},
		defaultSort: "bossName-asc",
		itemsPerPage: 20,
	});

	// 2. CẤU HÌNH GIAO DIỆN BỘ LỌC
	const filterConfigs = useMemo(() => {
		// Hiện tại dữ liệu Boss chưa có thuộc tính lọc đặc thù nào khác ngoài tên
		return [];
	}, []);

	const sortOptions = useMemo(
		() => [
			{ value: "bossName-asc", label: tUI("common.sortNameAsc") || "Tên A-Z" },
			{ value: "bossName-desc", label: tUI("common.sortNameDesc") || "Tên Z-A" },
		],
		[tUI],
	);

	return {
		state,
		actions,
		filterConfigs,
		sortOptions,
		queryParams,
	};
};
