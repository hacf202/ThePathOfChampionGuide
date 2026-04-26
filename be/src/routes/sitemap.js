import express from "express";
import {
	getCachedChampions,
	getCachedRelics,
	getCachedPowers,
	getCachedItems,
	getCachedRunes,
	getCachedCards,
	getCachedGuides,
	getCachedBosses,
	getCachedAdventures,
	getCachedResources
} from "../services/dataService.js";

const router = express.Router();

const BASE_URL = "https://www.pocguide.top";

/**
 * @route   GET /sitemap.xml
 * @desc    Tạo sitemap động chứa toàn bộ link của website
 */
router.get("/", async (req, res) => {
	try {
		// 1. Fetch toàn bộ dữ liệu song song để tối ưu tốc độ
		const [
			champions,
			relics,
			powers,
			items,
			runes,
			cards,
			guidesData,
			bosses,
			adventures,
			resources
		] = await Promise.all([
			getCachedChampions(),
			getCachedRelics(),
			getCachedPowers(),
			getCachedItems(),
			getCachedRunes(),
			getCachedCards(),
			getCachedGuides(),
			getCachedBosses(),
			getCachedAdventures(),
			getCachedResources()
		]);

		const guides = guidesData.data || guidesData; // Xử lý wrap data nếu có

		// 2. Định nghĩa các trang tĩnh
		const staticPages = [
			"",
			"/champions",
			"/relics",
			"/powers",
			"/items",
			"/cards",
			"/tierlist",
			"/guides",
			"/introduction",
			"/resources"
		];

		// 3. Xây dựng nội dung XML
		let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
		xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

		// Thêm trang tĩnh
		staticPages.forEach(page => {
			xml += `  <url>\n`;
			xml += `    <loc>${BASE_URL}${page}</loc>\n`;
			xml += `    <changefreq>weekly</changefreq>\n`;
			xml += `    <priority>${page === "" ? "1.0" : "0.8"}</priority>\n`;
			xml += `  </url>\n`;
		});

		// Thêm Champions
		champions.forEach(c => {
			xml += `  <url>\n`;
			xml += `    <loc>${BASE_URL}/champion/${encodeURIComponent(c.championID)}</loc>\n`;
			xml += `    <changefreq>weekly</changefreq>\n`;
			xml += `    <priority>0.9</priority>\n`;
			xml += `  </url>\n`;
		});

		// Thêm Relics
		relics.forEach(r => {
			xml += `  <url>\n`;
			xml += `    <loc>${BASE_URL}/relic/${encodeURIComponent(r.relicCode)}</loc>\n`;
			xml += `    <changefreq>monthly</changefreq>\n`;
			xml += `    <priority>0.7</priority>\n`;
			xml += `  </url>\n`;
		});

		// Thêm Powers
		powers.forEach(p => {
			xml += `  <url>\n`;
			xml += `    <loc>${BASE_URL}/power/${encodeURIComponent(p.powerCode)}</loc>\n`;
			xml += `    <changefreq>monthly</changefreq>\n`;
			xml += `    <priority>0.6</priority>\n`;
			xml += `  </url>\n`;
		});

		// Thêm Items
		items.forEach(i => {
			xml += `  <url>\n`;
			xml += `    <loc>${BASE_URL}/item/${encodeURIComponent(i.itemCode)}</loc>\n`;
			xml += `    <changefreq>monthly</changefreq>\n`;
			xml += `    <priority>0.6</priority>\n`;
			xml += `  </url>\n`;
		});

		// Thêm Runes
		runes.forEach(run => {
			xml += `  <url>\n`;
			xml += `    <loc>${BASE_URL}/rune/${encodeURIComponent(run.runeCode)}</loc>\n`;
			xml += `    <changefreq>monthly</changefreq>\n`;
			xml += `    <priority>0.5</priority>\n`;
			xml += `  </url>\n`;
		});

		// Thêm Cards
		cards.forEach(card => {
			xml += `  <url>\n`;
			xml += `    <loc>${BASE_URL}/card/${encodeURIComponent(card.cardCode)}</loc>\n`;
			xml += `    <changefreq>daily</changefreq>\n`;
			xml += `    <priority>0.8</priority>\n`;
			xml += `  </url>\n`;
		});

		// Thêm Guides
		if (Array.isArray(guides)) {
			guides.forEach(g => {
				xml += `  <url>\n`;
				xml += `    <loc>${BASE_URL}/guides/${encodeURIComponent(g.slug)}</loc>\n`;
				xml += `    <changefreq>weekly</changefreq>\n`;
				xml += `    <priority>0.8</priority>\n`;
				xml += `  </url>\n`;
			});
		}

		// Thêm Bosses
		bosses.forEach(b => {
			xml += `  <url>\n`;
			xml += `    <loc>${BASE_URL}/boss/${encodeURIComponent(b.bossID)}</loc>\n`;
			xml += `    <changefreq>monthly</changefreq>\n`;
			xml += `    <priority>0.7</priority>\n`;
			xml += `  </url>\n`;
		});

		// Thêm Adventures (Maps)
		adventures.forEach(a => {
			xml += `  <url>\n`;
			xml += `    <loc>${BASE_URL}/map/${encodeURIComponent(a.adventureID)}</loc>\n`;
			xml += `    <changefreq>monthly</changefreq>\n`;
			xml += `    <priority>0.7</priority>\n`;
			xml += `  </url>\n`;
		});

		// Thêm Resources
		resources.forEach(resItem => {
			xml += `  <url>\n`;
			xml += `    <loc>${BASE_URL}/resource/${encodeURIComponent(resItem.resourceId)}</loc>\n`;
			xml += `    <changefreq>monthly</changefreq>\n`;
			xml += `    <priority>0.6</priority>\n`;
			xml += `  </url>\n`;
		});

		xml += `</urlset>`;

		// 4. Trả về kết quả với đúng Content-Type
		res.header("Content-Type", "application/xml");
		res.status(200).send(xml);

	} catch (error) {
		console.error("Lỗi tạo sitemap:", error);
		res.status(500).send("Lỗi tạo sitemap");
	}
});

export default router;
