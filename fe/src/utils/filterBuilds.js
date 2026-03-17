// src/utils/filterBuilds.js

/**
 * Hàm lọc build chung cho CommunityBuilds, MyBuilds, MyFavorite
 * @param {Array} builds - Danh sách build gốc
 * @param {string} searchTerm - Từ khóa tìm kiếm
 * @param {string[]} selectedStarLevels - Mảng cấp sao đã chọn (["1", "3", ...])
 * @param {string[]} selectedRegions - Mảng khu vực đã chọn (["Noxus", "Demacia", ...])
 * @param {Map<string, string>} powerMap - Map từ powerId → powerName
 * @param {Map<string, string[]>} championNameToRegionsMap - Map từ championName → [regions]
 * @returns {Array} Danh sách build đã lọc
 */
export const filterBuilds = (
	builds,
	searchTerm,
	selectedStarLevels,
	selectedRegions,
	powerMap,
	championNameToRegionsMap
) => {
	if (!builds || builds.length === 0) return [];

	return builds.filter(build => {
		// === 1. LỌC SAO ===
		if (
			selectedStarLevels.length > 0 &&
			!selectedStarLevels.includes(String(build.star))
		) {
			return false;
		}

		// === 2. LỌC KHU VỰC ===
		if (selectedRegions.length > 0) {
			const championRegions =
				championNameToRegionsMap.get(build.championName) || [];
			if (!selectedRegions.some(region => championRegions.includes(region))) {
				return false;
			}
		}

		// === 3. TÌM KIẾM ===
		if (searchTerm) {
			const lowercasedTerm = searchTerm.toLowerCase();
			const searchString = [
				build.championName || "",
				build.description || "",
				...(build.powers || []).map(p => powerMap.get(p) || ""),
			]
				.join(" ")
				.toLowerCase();

			if (!searchString.includes(lowercasedTerm)) {
				return false;
			}
		}

		return true;
	});
};
