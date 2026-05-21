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
import { getPublicBuilds } from "../utils/buildCache.js";

const router = express.Router();

const BASE_URL = "https://www.pocguide.top";

// Ngày hôm nay dùng làm lastmod fallback
const today = () => new Date().toISOString().split("T")[0];

/**
 * Helper: tạo một <url> entry
 */
function urlEntry(loc, changefreq, priority, lastmod) {
	return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod || today()}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>\n`;
}

/**
 * @route   GET /sitemap.xml
 * @desc    Sitemap Index — trỏ tới các sitemap con
 */
router.get("/", (req, res) => {
	const subs = [
		"static",
		"champions",
		"relics",
		"powers",
		"items",
		"runes",
		"cards",
		"guides",
		"bosses",
		"maps",
		"resources",
		"builds",
	];

	let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
	xml += `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

	subs.forEach(name => {
		xml += `  <sitemap>\n`;
		xml += `    <loc>${BASE_URL}/api/sitemap/${name}.xml</loc>\n`;
		xml += `    <lastmod>${today()}</lastmod>\n`;
		xml += `  </sitemap>\n`;
	});

	xml += `</sitemapindex>`;

	res.header("Content-Type", "application/xml");
	res.status(200).send(xml);
});

/**
 * @route   GET /sitemap/static.xml
 */
router.get("/static.xml", (req, res) => {
	const staticPages = [
		{ path: "", priority: "1.0", changefreq: "daily" },
		{ path: "/champions", priority: "0.9", changefreq: "weekly" },
		{ path: "/relics", priority: "0.8", changefreq: "weekly" },
		{ path: "/powers", priority: "0.8", changefreq: "weekly" },
		{ path: "/items", priority: "0.7", changefreq: "weekly" },
		{ path: "/cards", priority: "0.8", changefreq: "daily" },
		{ path: "/tierlist", priority: "0.8", changefreq: "weekly" },
		{ path: "/tierlist/champions", priority: "0.7", changefreq: "weekly" },
		{ path: "/tierlist/relics", priority: "0.7", changefreq: "weekly" },
		{ path: "/guides", priority: "0.9", changefreq: "weekly" },
		{ path: "/introduction", priority: "0.6", changefreq: "monthly" },
		{ path: "/resources", priority: "0.6", changefreq: "weekly" },
		{ path: "/randomizer", priority: "0.5", changefreq: "monthly" },
		{ path: "/simulator/vaults", priority: "0.7", changefreq: "weekly" },
		{ path: "/sub-champions", priority: "0.6", changefreq: "weekly" },
		{ path: "/tools/ratings", priority: "0.7", changefreq: "weekly" },
		{ path: "/tools/champion-items", priority: "0.6", changefreq: "weekly" },
		{ path: "/builds", priority: "0.8", changefreq: "daily" },
		{ path: "/runes", priority: "0.6", changefreq: "monthly" },
		{ path: "/maps", priority: "0.7", changefreq: "monthly" },
		{ path: "/bosses", priority: "0.7", changefreq: "monthly" },
		{ path: "/about-us", priority: "0.4", changefreq: "monthly" },
		{ path: "/terms-of-use", priority: "0.3", changefreq: "monthly" },
	];

	let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
	xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
	staticPages.forEach(({ path, priority, changefreq }) => {
		xml += urlEntry(`${BASE_URL}${path}`, changefreq, priority);
	});
	xml += `</urlset>`;

	res.header("Content-Type", "application/xml");
	res.status(200).send(xml);
});

/**
 * Helper: tạo sub-sitemap XML cho một loại entity
 */
async function sendEntitySitemap(res, fetchFn, mapFn) {
	try {
		const data = await fetchFn();
		let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
		xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
		(Array.isArray(data) ? data : (data.data || data.items || [])).forEach(item => {
			const entry = mapFn(item);
			if (entry) xml += urlEntry(entry.loc, entry.changefreq, entry.priority, entry.lastmod);
		});
		xml += `</urlset>`;
		res.header("Content-Type", "application/xml");
		res.status(200).send(xml);
	} catch (error) {
		console.error("Lỗi tạo sitemap:", error);
		res.status(500).send("Lỗi tạo sitemap");
	}
}

router.get("/champions.xml", (req, res) => sendEntitySitemap(res, getCachedChampions, c => ({
	loc: `${BASE_URL}/champion/${encodeURIComponent(c.championID)}`,
	changefreq: "weekly", priority: "0.9",
	lastmod: c.updatedAt ? new Date(c.updatedAt).toISOString().split("T")[0] : today(),
})));

router.get("/relics.xml", (req, res) => sendEntitySitemap(res, getCachedRelics, r => ({
	loc: `${BASE_URL}/relic/${encodeURIComponent(r.relicCode)}`,
	changefreq: "monthly", priority: "0.7",
	lastmod: r.updatedAt ? new Date(r.updatedAt).toISOString().split("T")[0] : today(),
})));

router.get("/powers.xml", (req, res) => sendEntitySitemap(res, getCachedPowers, p => ({
	loc: `${BASE_URL}/power/${encodeURIComponent(p.powerCode)}`,
	changefreq: "monthly", priority: "0.6",
	lastmod: p.updatedAt ? new Date(p.updatedAt).toISOString().split("T")[0] : today(),
})));

router.get("/items.xml", (req, res) => sendEntitySitemap(res, getCachedItems, i => ({
	loc: `${BASE_URL}/item/${encodeURIComponent(i.itemCode)}`,
	changefreq: "monthly", priority: "0.6",
	lastmod: i.updatedAt ? new Date(i.updatedAt).toISOString().split("T")[0] : today(),
})));

router.get("/runes.xml", (req, res) => sendEntitySitemap(res, getCachedRunes, r => ({
	loc: `${BASE_URL}/rune/${encodeURIComponent(r.runeCode)}`,
	changefreq: "monthly", priority: "0.5",
	lastmod: r.updatedAt ? new Date(r.updatedAt).toISOString().split("T")[0] : today(),
})));

router.get("/cards.xml", (req, res) => sendEntitySitemap(res, getCachedCards, c => ({
	loc: `${BASE_URL}/card/${encodeURIComponent(c.cardCode)}`,
	changefreq: "monthly", priority: "0.7",
	lastmod: c.updatedAt ? new Date(c.updatedAt).toISOString().split("T")[0] : today(),
})));

router.get("/guides.xml", async (req, res) => {
	try {
		const guidesData = await getCachedGuides();
		const guides = Array.isArray(guidesData) ? guidesData : (guidesData.data || []);
		let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
		xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
		guides.forEach(g => {
			xml += urlEntry(
				`${BASE_URL}/guides/${encodeURIComponent(g.slug)}`,
				"weekly", "0.9",
				g.updatedAt ? new Date(g.updatedAt).toISOString().split("T")[0] : today()
			);
		});
		xml += `</urlset>`;
		res.header("Content-Type", "application/xml");
		res.status(200).send(xml);
	} catch (error) {
		res.status(500).send("Lỗi tạo sitemap guides");
	}
});

router.get("/bosses.xml", (req, res) => sendEntitySitemap(res, getCachedBosses, b => ({
	loc: `${BASE_URL}/boss/${encodeURIComponent(b.bossID)}`,
	changefreq: "monthly", priority: "0.7",
	lastmod: b.updatedAt ? new Date(b.updatedAt).toISOString().split("T")[0] : today(),
})));

router.get("/maps.xml", (req, res) => sendEntitySitemap(res, getCachedAdventures, a => ({
	loc: `${BASE_URL}/map/${encodeURIComponent(a.adventureID)}`,
	changefreq: "monthly", priority: "0.7",
	lastmod: a.updatedAt ? new Date(a.updatedAt).toISOString().split("T")[0] : today(),
})));

router.get("/resources.xml", (req, res) => sendEntitySitemap(res, getCachedResources, r => ({
	loc: `${BASE_URL}/resource/${encodeURIComponent(r.resourceId)}`,
	changefreq: "monthly", priority: "0.6",
	lastmod: r.updatedAt ? new Date(r.updatedAt).toISOString().split("T")[0] : today(),
})));

router.get("/builds.xml", async (req, res) => {
	try {
		const publicBuildsData = await getPublicBuilds("global");
		const builds = publicBuildsData.items || [];
		let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
		xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
		builds.forEach(build => {
			xml += urlEntry(
				`${BASE_URL}/builds/detail/${encodeURIComponent(build.id)}`,
				"weekly", "0.7",
				build.updatedAt ? new Date(build.updatedAt).toISOString().split("T")[0] : today()
			);
		});
		xml += `</urlset>`;
		res.header("Content-Type", "application/xml");
		res.status(200).send(xml);
	} catch (error) {
		res.status(500).send("Lỗi tạo sitemap builds");
	}
});

export default router;
