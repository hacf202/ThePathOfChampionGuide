// be/scripts/mergeCardSet.js
// Script hợp nhất: Merge card set mới vào cardList + chạy markup engine trên toàn bộ dữ liệu
//
// Cách dùng:
//   node be/scripts/mergeCardSet.js --set 7           → Merge set 7 vào cardList
//   node be/scripts/mergeCardSet.js --set 8           → Merge set 8 vào cardList
//   node be/scripts/mergeCardSet.js --markup          → Chạy markup engine trên dữ liệu thực thể
//   node be/scripts/mergeCardSet.js --set 8 --markup  → Merge set 8 rồi chạy markup
//   (Không có arg)                                    → Chỉ chạy markup engine

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Tìm backup mới nhất ───────────────────────────────────────────────────────
const uploadDataDir = path.resolve(__dirname, "../uploadData");
const latestBackup = fs
	.readdirSync(uploadDataDir)
	.filter((n) => n.startsWith("backup_"))
	.sort()
	.at(-1);

if (!latestBackup) {
	console.error("❌ Không tìm thấy thư mục backup. Chạy backupAllTables.js trước.");
	process.exit(1);
}

const BACKUP_DIR = path.resolve(uploadDataDir, latestBackup);
const CARD_LIST_PATH = path.join(BACKUP_DIR, "cardList.json");
console.log(`📁 Dùng backup: ${latestBackup}\n`);

// ── Parse CLI args ────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const setArg = args.find((_, i) => args[i - 1] === "--set");
const setNumber = setArg ? parseInt(setArg, 10) : null;
const runMarkup = args.includes("--markup") || (!setNumber && args.length === 0);

// ── Mapping tables ────────────────────────────────────────────────────────────
const TYPE_MAP = {
	Unit: "Bài quân",
	Spell: "Bài phép",
	Landmark: "Địa danh",
	Equipment: "Vật phẩm",
};

const RARITY_MAP = {
	EPIC: "Epic",
	RARE: "Rare",
	COMMON: "Common",
	Champion: "Champion",
	None: "None",
};

// ── Shared Markup Engine ──────────────────────────────────────────────────────
const VI_KEYWORDS = {
	"Thách Đấu": "Challenger", "Đột Kích": "QuickStrike", "Hồi Phục": "Regeneration",
	"Áp Đảo": "Overwhelm", "Kiên Cường": "Tough", "Khiên Phép": "SpellShield",
	"Làm Choáng": "Stun", "Đóng Băng": "Frostbite", "Triệu Hồi": "Summon",
	"Xuất Trận": "Play", "Tấn Công": "Attack", "Ra Đòn": "Strike",
	"Bắt Đầu Vòng Đấu": "RoundStart", "Kết Thúc Vòng Đấu": "RoundEnd",
	"Cưỡng Đoạt": "Plunder", "Định Mệnh": "Fated", "Nâng Cấp": "Augment",
	"Linh Hồn": "Spirit", "Khí Lực": "Impact", "Tiến Hóa": "Evolve",
	"Cường Hóa": "Empowered", "Hấp Thụ": "Drain", "Hình Thành": "Manifest",
	"Đếm Ngược": "Countdown", "Huyền Ảo": "Elusive", "Thu Về": "Recall",
	"Tiến Công": "Rally", "Trăng Trối": "LastBreath", "Tiên Đoán": "Predict",
	"Đáng Sợ": "Fearsome", "Cảm Tử": "Ephemeral", "Trinh Sát": "Scout",
	"Hỗ Trợ": "Support", "Rình Rập": "Lurker", "Hút Máu": "Lifesteal",
	"Ngạo Mạn": "Brash", "Bất Diệt": "Deathless", "Siêu Tốc": "Burst",
	"Nhanh": "Fast", "Chậm": "Slow", "Tập Trung": "Focus",
	"Tiêu Hao": "Cost", "Sát Thương": "Damage", "Máu": "Health",
	"Sức Mạnh": "Power", "Máu Nhà Chính": "NexusHealth", "Lượt Đổi": "Reroll",
	"Vàng": "Gold", "Kinh Nghiệm": "XP", "Tùy Tùng": "Follower",
	"Anh Hùng": "Champion", "Lá Chắn": "Barrier",
};

const EN_KEYWORDS = {
	"Challenger": "Challenger", "Quick Attack": "QuickStrike", "Regeneration": "Regeneration",
	"Overwhelm": "Overwhelm", "Tough": "Tough", "SpellShield": "SpellShield",
	"Stun": "Stun", "Frostbite": "Frostbite", "Summon": "Summon",
	"Play": "Play", "Attack": "Attack", "Strike": "Strike",
	"Round Start": "RoundStart", "Round End": "RoundEnd", "Plunder": "Plunder",
	"Fated": "Fated", "Augment": "Augment", "Spirit": "Spirit", "Impact": "Impact",
	"Evolve": "Evolve", "Empowered": "Empowered", "Drain": "Drain",
	"Manifest": "Manifest", "Countdown": "Countdown", "Elusive": "Elusive",
	"Recall": "Recall", "Rally": "Rally", "Last Breath": "LastBreath",
	"Predict": "Predict", "Fearsome": "Fearsome", "Ephemeral": "Ephemeral",
	"Scout": "Scout", "Support": "Support", "Lurk": "Lurker",
	"Lifesteal": "Lifesteal", "Brash": "Brash", "Deathless": "Deathless",
	"Burst": "Burst", "Fast": "Fast", "Slow": "Slow", "Focus": "Focus",
	"Cost": "Cost", "Damage": "Damage", "Health": "Health", "Power": "Power",
	"Nexus Health": "NexusHealth", "Reroll": "Reroll", "Gold": "Gold",
	"XP": "XP", "Follower": "Follower", "Champion": "Champion", "Barrier": "Barrier",
};

/**
 * Load card maps từ cardList để dùng cho markup engine
 */
function loadCardMaps(cardListPath) {
	console.log("🗂️  Loading card name maps from cardList...");
	const cardList = JSON.parse(fs.readFileSync(cardListPath, "utf8"));
	const viMap = new Map();
	const enMap = new Map();

	cardList.forEach((card) => {
		const code = card.cardCode;
		if (card.cardName) {
			const name = card.cardName.trim();
			if (!viMap.has(name) || code.length < viMap.get(name).length)
				viMap.set(name, code);
		}
		if (card.translations?.en?.cardName) {
			const name = card.translations.en.cardName.trim();
			if (!enMap.has(name) || code.length < enMap.get(name).length)
				enMap.set(name, code);
		}
	});

	console.log(`   → ${viMap.size} card names (VI) | ${enMap.size} card names (EN)\n`);
	return { viMap, enMap };
}

/**
 * Markup engine: chuyển text thuần thành markup có tag
 */
function scanAndMarkup(text, lang, viMap, enMap) {
	if (!text) return text;

	const cardMap = lang === "vi" ? viMap : enMap;
	const keywords = lang === "vi" ? VI_KEYWORDS : EN_KEYWORDS;
	let result = text;

	// 1. Convert Riot HTML tags
	result = result.replace(
		/<link=(?:keyword|vocab)\.([^>]+)>(?:<sprite name=[^>]+>)?<style=[^>]+>([^<]+)<\/style><\/link>/g,
		"[k:$1|$2]"
	);
	result = result.replace(
		/<link=card\.self><style=AssociatedCard>([^<]+)<\/style><\/link>/g,
		(_, name) => {
			const code = cardMap.get(name);
			return code ? `[cd:${code}|${name}|icon,img-full]` : `[c:${name}]`;
		}
	);
	result = result.replace(/<br>/g, "\n");
	result = result.replace(/<[^>]+>/g, "");

	// 2. Scan keywords
	const sortedKeywords = Object.keys(keywords).sort((a, b) => b.length - a.length);
	for (const kName of sortedKeywords) {
		const id = keywords[kName];
		const regex = new RegExp(`(?<!\\[k:[^|]+\\|)${kName}(?![^\\]]*\\])`, "g");
		result = result.replace(regex, `[k:${id}|${kName}]`);
	}

	// 3. Scan card names (length > 5 để tránh false positive)
	const sortedCards = Array.from(cardMap.keys())
		.filter((n) => n.length > 5)
		.sort((a, b) => b.length - a.length);
	for (const cName of sortedCards) {
		const code = cardMap.get(cName);
		const escaped = cName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		const regex = new RegExp(`(?<!\\[cd:[^|]+\\|)(?<!\\[c:)${escaped}(?![^\\]]*\\])`, "g");
		result = result.replace(regex, `[cd:${code}|${cName}|icon,img-full]`);
	}

	return result;
}

// ── PHASE 1: Merge Card Set ───────────────────────────────────────────────────
async function mergeCardSet(setNum) {
	console.log(`\n${"═".repeat(54)}`);
	console.log(`🃏  MERGE CARD SET ${setNum}`);
	console.log(`${"═".repeat(54)}`);

	const viPath = path.join(__dirname, `../data/set${setNum}-vi_vn.json`);
	const enPath = path.join(__dirname, `../data/set${setNum}-en_us.json`);

	if (!fs.existsSync(viPath)) {
		console.error(`❌ Không tìm thấy: ${viPath}`);
		process.exit(1);
	}
	if (!fs.existsSync(enPath)) {
		console.error(`❌ Không tìm thấy: ${enPath}`);
		process.exit(1);
	}

	const { viMap, enMap } = loadCardMaps(CARD_LIST_PATH);

	console.log("📖 Loading data files...");
	const masterData = JSON.parse(fs.readFileSync(CARD_LIST_PATH, "utf8"));
	const setVi = JSON.parse(fs.readFileSync(viPath, "utf8"));
	const setEn = JSON.parse(fs.readFileSync(enPath, "utf8"));

	const masterMap = new Map(masterData.map((c) => [c.cardCode, c]));
	const enSourceMap = new Map(setEn.map((c) => [c.cardCode, c]));

	let added = 0;
	let updated = 0;

	console.log(`🔄 Merging ${setVi.length} cards from set ${setNum}...`);

	setVi.forEach((viCard) => {
		const code = viCard.cardCode;
		const enCard = enSourceMap.get(code);

		if (!enCard) {
			console.warn(`   ⚠️  Missing EN version for card: ${code}`);
			return;
		}

		const mergedCard = {
			cardCode: code,
			cardName: viCard.name,
			cost: viCard.cost,
			description: scanAndMarkup(viCard.descriptionRaw || viCard.description, "vi", viMap, enMap),
			descriptionRaw: viCard.descriptionRaw || viCard.description,
			gameAbsolutePath: viCard.assets?.[0]?.gameAbsolutePath || "",
			rarity: RARITY_MAP[viCard.rarity] || viCard.rarityRef || viCard.rarity,
			regions: viCard.regions,
			type: TYPE_MAP[viCard.type] || viCard.type,
			associatedCardRefs: viCard.associatedCardRefs || [],
			translations: {
				en: {
					cardName: enCard.name,
					description: scanAndMarkup(enCard.descriptionRaw || enCard.description, "en", viMap, enMap),
					descriptionRaw: enCard.descriptionRaw || enCard.description,
					gameAbsolutePath: enCard.assets?.[0]?.gameAbsolutePath || "",
					regions: enCard.regions,
					type: enCard.type,
				},
			},
		};

		masterMap.has(code) ? updated++ : added++;
		masterMap.set(code, mergedCard);
	});

	const result = Array.from(masterMap.values()).sort((a, b) =>
		a.cardCode.localeCompare(b.cardCode)
	);

	fs.writeFileSync(CARD_LIST_PATH, JSON.stringify(result, null, 2), "utf8");

	console.log(`✅ Hoàn thành: +${added} mới, ~${updated} cập nhật → ${result.length} lá tổng cộng`);
	console.log(`💾 Đã lưu vào: ${CARD_LIST_PATH}`);
}

// ── PHASE 2: Markup Processing ────────────────────────────────────────────────
async function runMarkupProcessing() {
	console.log(`\n${"═".repeat(54)}`);
	console.log("🖊️   MARKUP PROCESSING");
	console.log(`${"═".repeat(54)}`);

	const { viMap, enMap } = loadCardMaps(CARD_LIST_PATH);

	// Dữ liệu thực thể cần xử lý markup
	const ENTITY_FILES = [
		{ dir: BACKUP_DIR, files: [
			"ItemsData.json",
			"PowersData.json",
			"RelicsData.json",
			"RunesData.json",
			"guidePocChampionList.json",
			"guidePocBonusStar.json",
		]},
		{ dir: path.join(__dirname, "../data"), files: [
			"ItemsData.json",
			"PowersData.json",
			"RelicsData.json",
			"RunesData.json",
		]},
	];

	for (const { dir, files } of ENTITY_FILES) {
		for (const fileName of files) {
			const filePath = path.join(dir, fileName);
			if (!fs.existsSync(filePath)) {
				console.log(`   ⏭️  Bỏ qua (không tồn tại): ${path.relative(process.cwd(), filePath)}`);
				continue;
			}

			console.log(`\n📝 Processing: ${path.relative(process.cwd(), filePath)}`);
			const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

			const updated = data.map((item, i) => {
				if (i % 200 === 0) process.stdout.write(`   ${i}/${data.length}...\r`);

				const rawVi = item.descriptionRaw || item.description;
				if (rawVi) {
					item.descriptionRaw = rawVi;
					item.description = scanAndMarkup(rawVi, "vi", viMap, enMap);
				}

				if (item.translations?.en) {
					const en = item.translations.en;
					const rawEn = en.descriptionRaw || en.description;
					if (rawEn) {
						en.descriptionRaw = rawEn;
						en.description = scanAndMarkup(rawEn, "en", viMap, enMap);
					}
				}
				return item;
			});

			fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), "utf8");
			console.log(`   ✅ ${data.length} items processed`);
		}
	}

	console.log("\n✅ Markup processing hoàn thành!");
}

// ── Main ──────────────────────────────────────────────────────────────────────
console.log("╔══════════════════════════════════════════════════════╗");
console.log("║        🃏  Card Merge & Markup Tool                  ║");
console.log("╚══════════════════════════════════════════════════════╝");

if (!setNumber && !runMarkup) {
	console.log("\nUsage:");
	console.log("  node mergeCardSet.js --set <N>           Merge set N cards");
	console.log("  node mergeCardSet.js --markup            Process markup on entity data");
	console.log("  node mergeCardSet.js --set <N> --markup  Both");
	process.exit(0);
}

if (setNumber) await mergeCardSet(setNumber);
if (runMarkup) await runMarkupProcessing();

console.log("\n🏁 Xong!");
