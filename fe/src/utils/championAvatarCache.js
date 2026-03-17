// src/utils/championAvatarCache.js
let avatarMap = null;
let isLoading = false;
let loadPromise = null;

export const getChampionAvatar = async championName => {
	if (!championName) return null;

	// Nếu đang tải → chờ
	if (isLoading) {
		await loadPromise;
		return avatarMap[championName] || null;
	}

	// Nếu đã có cache → trả ngay
	if (avatarMap) {
		return avatarMap[championName] || null;
	}

	// Bắt đầu tải
	isLoading = true;
	loadPromise = (async () => {
		const apiUrl = import.meta.env.VITE_API_URL;
		try {
			const res = await fetch(`${apiUrl}/api/champions`);
			if (!res.ok) throw new Error("API lỗi");

			const data = await res.json();

			// Xử lý mọi cấu trúc
			let champions = [];
			if (data && Array.isArray(data.items)) champions = data.items;
			else if (Array.isArray(data)) champions = data;

			avatarMap = champions.reduce((map, champ) => {
				const url = champ?.assets?.[0]?.avatar || champ?.avatar;
				if (champ.name && url) {
					map[champ.name] = url;
				}
				return map;
			}, {});
		} catch (err) {
			console.error("Lỗi cache avatar:", err);
			avatarMap = {};
		} finally {
			isLoading = false;
		}
	})();

	await loadPromise;
	return avatarMap[championName] || null;
};
