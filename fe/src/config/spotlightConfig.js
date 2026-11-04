/**
 * Cấu hình Tướng Tiêu Điểm (Hero Spotlight Unit) trên trang chủ
 * 
 * HƯỚNG DẪN THAY ĐỔI:
 * 1. Chế độ Tự Động (Mặc định: targetChampion = "auto"):
 *    - Hệ thống sẽ tự động quét danh sách tướng từ API và chọn tướng có tag "Tướng Mới" / "New" / "Spotlight"
 *      hoặc tướng có cờ isSpotlight: true.
 *    - Khi thêm tướng mới trên Admin CMS và gắn tag "Tướng Mới", trang chủ sẽ TỰ ĐỘNG hiển thị tướng đó.
 * 
 * 2. Chế độ Ghim Thủ Công:
 *    - Điền tên tướng (vd: "Xerath", "Garen", "Jinx") hoặc cardCode (vd: "05SH014", "01DE012") vào `targetChampion`.
 */

export const SPOTLIGHT_CONFIG = {
	// "auto" = tự động lấy tướng có tag "Tướng Mới", hoặc điền tên tướng / cardCode cụ thể:
	targetChampion: "auto",

	// Tướng dự phòng mặc định (Offline/First-load fallback khi chưa có cache localStorage):
	fallbackChampion: {
		championID: "C088",
		cardCode: "05SH014",
		name: "Xerath",
		title: "Pháp Sư Thăng Hoa",
		cost: 2,
		maxStar: 6,
		link: "/champion/xerath",
		splashImg: "https://dd.b.pvp.net/7_3_0/set5/en_us/img/cards/05SH014T2-full.png",
		cardImg: "https://dd.b.pvp.net/7_3_0/set5/vi_vn/img/cards/05SH014.png",
		tags: ["NEW 6★", "SHURIMA", "THĂNG HOA", "TƯỚNG MỚI"],
		palette: {
			accent: "#FBBF24",
			secondary: "#F97316",
		},
	},
};

const STORAGE_KEY = "poc_hero_spotlight_champion";

/**
 * Lấy tướng Spotlight đã được lưu trong localStorage để render tức thì (0ms) khi vừa F5.
 */
export function getSavedSpotlightChampion() {
	if (typeof window === "undefined") return SPOTLIGHT_CONFIG.fallbackChampion;
	try {
		const saved = localStorage.getItem(STORAGE_KEY);
		if (saved) {
			const parsed = JSON.parse(saved);
			if (parsed && (parsed.cardCode || parsed.championID || parsed.name)) {
				return parsed;
			}
		}
	} catch (e) {
		// Bỏ qua lỗi parse
	}
	return SPOTLIGHT_CONFIG.fallbackChampion;
}

/**
 * Lưu tướng Spotlight vào localStorage để các lần reload tiếp theo không bị giật hình
 */
export function saveSpotlightChampion(champion) {
	if (typeof window === "undefined" || !champion) return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(champion));
	} catch (e) {
		// Bỏ qua lỗi quota storage
	}
}

/**
 * Tìm tướng Spotlight từ danh sách tướng API theo thứ tự ưu tiên:
 * 1. Khớp theo targetChampion chỉ định (nếu khác "auto").
 * 2. Tướng có cờ isSpotlight: true hoặc isFeatured: true.
 * 3. Tướng có tag chứa từ khóa "Tướng Mới", "New", "Spotlight".
 * 4. Fallback về tướng đầu tiên trong danh sách.
 */
export function resolveSpotlightChampion(formattedChampions) {
	if (!formattedChampions || formattedChampions.length === 0) {
		return null;
	}

	const target = (SPOTLIGHT_CONFIG.targetChampion || "auto").trim().toLowerCase();

	// 1. Ghim thủ công theo tên, championID hoặc mã thẻ
	if (target && target !== "auto") {
		const manual = formattedChampions.find(
			(c) =>
				c.cardCode?.toLowerCase() === target ||
				c.championID?.toLowerCase() === target ||
				c.name?.toLowerCase() === target
		);
		if (manual) return manual;
	}

	// 2. Tướng có cờ isSpotlight hoặc isFeatured
	const featured = formattedChampions.find((c) => c.isSpotlight || c.isFeatured);
	if (featured) return featured;

	// 3. Tự động nhận diện tướng có nhãn "Tướng Mới" / "New" / "Spotlight"
	const newTagMatch = formattedChampions.find((c) => {
		const tags = Array.isArray(c.tags) ? c.tags : [];
		return tags.some((t) => typeof t === "string" && /mới|new|spotlight/i.test(t));
	});
	if (newTagMatch) return newTagMatch;

	// 4. Mặc định lấy tướng đầu tiên
	return formattedChampions[0] || null;
}
