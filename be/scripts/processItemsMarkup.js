import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cardListPath = path.join(__dirname, '../uploadData/cardList.json');

// Directories to process
const configs = [
  { dir: path.join(__dirname, '../data'), files: ['ItemsData.json', 'PowersData.json', 'RelicsData.json', 'RunesData.json'] },
  { dir: path.join(__dirname, '../uploadData'), files: [
    'ItemsData.json', 
    'PowersData.json', 
    'RelicsData.json', 
    'RunesData.json',
    'guidePocChampionList.json',
    'guidePocBonusStar.json'
  ] }
];

const { viMap, enMap, viKeywords, enKeywords } = loadMappings();

function loadMappings() {
  console.log('Loading mappings from cardList.json...');
  const cardList = JSON.parse(fs.readFileSync(cardListPath, 'utf8'));
  const viMap = new Map();
  const enMap = new Map();

  cardList.forEach(card => {
    const code = card.cardCode;
    if (card.cardName) {
      const name = card.cardName.trim();
      if (!viMap.has(name) || code.length < viMap.get(name).length) viMap.set(name, code);
    }
    if (card.translations?.en?.cardName) {
      const name = card.translations.en.cardName.trim();
      if (!enMap.has(name) || code.length < enMap.get(name).length) enMap.set(name, code);
    }
  });

  // Manual Keyword Dictionaries (Common LoR Keywords)
  const viKeywords = {
    'Thách Đấu': 'Challenger',
    'Đột Kích': 'QuickStrike',
    'Hồi Phục': 'Regeneration',
    'Áp Đảo': 'Overwhelm',
    'Kiên Cường': 'Tough',
    'Khiên Phép': 'SpellShield',
    'Làm Choáng': 'Stun',
    'Đóng Băng': 'Frostbite',
    'Triệu Hồi': 'Summon',
    'Xuất Trận': 'Play',
    'Tấn Công': 'Attack',
    'Ra Đòn': 'Strike',
    'Bắt Đầu Vòng Đấu': 'RoundStart',
    'Kết Thúc Vòng Đấu': 'RoundEnd',
    'Cưỡng Đoạt': 'Plunder',
    'Định Mệnh': 'Fated',
    'Nâng Cấp': 'Augment',
    'Linh Hồn': 'Spirit',
    'Khí Lực': 'Impact',
    'Tiến Hóa': 'Evolve',
    'Cường Hóa': 'Empowered',
    'Hấp Thụ': 'Drain',
    'Hình Thành': 'Manifest',
    'Đếm Ngược': 'Countdown',
    'Huyền Ảo': 'Elusive',
    'Thu Về': 'Recall',
    'Tiến Công': 'Rally',
    'Trăng Trối': 'LastBreath',
    'Tiên Đoán': 'Predict',
    'Đáng Sợ': 'Fearsome',
    'Cảm Tử': 'Ephemeral',
    'Trinh Sát': 'Scout',
    'Hỗ Trợ': 'Support',
    'Rình Rập': 'Lurker',
    'Hút Máu': 'Lifesteal',
    'Ngạo Mạn': 'Brash',
    'Bất Diệt': 'Deathless',
    'Siêu Tốc': 'Burst',
    'Nhanh': 'Fast',
    'Chậm': 'Slow',
    'Tập Trung': 'Focus',
    'Tiêu Hao': 'Cost',
    'Sát Thương': 'Damage',
    'Máu': 'Health',
    'Sức Mạnh': 'Power',
    'Máu Nhà Chính': 'NexusHealth',
    'Lượt Đổi': 'Reroll',
    'Vàng': 'Gold',
    'Kinh Nghiệm': 'XP',
    'Tùy Tùng': 'Follower',
    'Anh Hùng': 'Champion',
    'Lá Chắn': 'Barrier',
  };

  const enKeywords = {
    'Challenger': 'Challenger',
    'Quick Attack': 'QuickStrike',
    'Regeneration': 'Regeneration',
    'Overwhelm': 'Overwhelm',
    'Tough': 'Tough',
    'SpellShield': 'SpellShield',
    'Stun': 'Stun',
    'Frostbite': 'Frostbite',
    'Summon': 'Summon',
    'Play': 'Play',
    'Attack': 'Attack',
    'Strike': 'Strike',
    'Round Start': 'RoundStart',
    'Round End': 'RoundEnd',
    'Plunder': 'Plunder',
    'Fated': 'Fated',
    'Augment': 'Augment',
    'Spirit': 'Spirit',
    'Impact': 'Impact',
    'Evolve': 'Evolve',
    'Empowered': 'Empowered',
    'Drain': 'Drain',
    'Manifest': 'Manifest',
    'Countdown': 'Countdown',
    'Elusive': 'Elusive',
    'Recall': 'Recall',
    'Rally': 'Rally',
    'Last Breath': 'LastBreath',
    'Predict': 'Predict',
    'Fearsome': 'Fearsome',
    'Ephemeral': 'Ephemeral',
    'Scout': 'Scout',
    'Support': 'Support',
    'Lurk': 'Lurker',
    'Lifesteal': 'Lifesteal',
    'Brash': 'Brash',
    'Deathless': 'Deathless',
    'Burst': 'Burst',
    'Fast': 'Fast',
    'Slow': 'Slow',
    'Focus': 'Focus',
    'Cost': 'Cost',
    'Damage': 'Damage',
    'Health': 'Health',
    'Power': 'Power',
    'Nexus Health': 'NexusHealth',
    'Reroll': 'Reroll',
    'Gold': 'Gold',
    'XP': 'XP',
    'Follower': 'Follower',
    'Champion': 'Champion',
    'Barrier': 'Barrier',
  };

  return { viMap, enMap, viKeywords, enKeywords };
}

/**
 * Advanced scanning engine to markup plain text
 */
function scanAndMarkup(text, lang = 'vi') {
  if (!text) return text;
  
  const currentCardMap = lang === 'vi' ? viMap : enMap;
  const currentKeywordMap = lang === 'vi' ? viKeywords : enKeywords;

  let result = text;

  // 1. Convert existing Riot tags (Standard logic)
  result = result.replace(/<link=(?:keyword|vocab)\.([^>]+)>(?:<sprite name=[^>]+>)?<style=[^>]+>([^<]+)<\/style><\/link>/g, '[k:$1|$2]');
  result = result.replace(/<link=card\.self><style=AssociatedCard>([^<]+)<\/style><\/link>/g, (match, name) => {
    const code = currentCardMap.get(name);
    return code ? `[cd:${code}|${name}|icon,img-full]` : `[c:${name}]`;
  });
  result = result.replace(/<br>/g, '\n');
  result = result.replace(/<[^>]+>/g, '');

  // 2. Scan for Keywords in plain text
  // Sort keywords by length descending to avoid partial matches
  const sortedKeywords = Object.keys(currentKeywordMap).sort((a, b) => b.length - a.length);
  for (const kName of sortedKeywords) {
    const id = currentKeywordMap[kName];
    const regex = new RegExp(`(?<!\\[k:[^|]+\\|)${kName}(?![^\\]]*\\])`, 'g'); // Avoid double marking
    result = result.replace(regex, `[k:${id}|${kName}]`);
  }

  // 3. Scan for Card Names in plain text
  // Prioritize cards with length > 3 to avoid false positives (e.g. "A", "I")
  const sortedCards = Array.from(currentCardMap.keys()).filter(n => n.length > 5).sort((a, b) => b.length - a.length);
  for (const cName of sortedCards) {
    const code = currentCardMap.get(cName);
    // Escape regex special chars
    const escaped = cName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?<!\\[cd:[^|]+\\|)(?<!\\[c:)${escaped}(?![^\\]]*\\])`, 'g'); // Avoid double marking
    result = result.replace(regex, `[cd:${code}|${cName}|icon,img-full]`);
  }

  return result;
}

// Process
configs.forEach(({ dir, files }) => {
  files.forEach(fileName => {
    const filePath = path.join(dir, fileName);
    if (!fs.existsSync(filePath)) return;

    console.log(`Processing ${filePath}...`);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    const updatedData = data.map((item, index) => {
      if (index % 100 === 0) console.log(`  Processing item ${index}...`);
      const rawVi = item.descriptionRaw || item.description;
      if (rawVi) {
        item.descriptionRaw = rawVi;
        item.description = scanAndMarkup(rawVi, 'vi');
      }

      if (item.translations?.en) {
        const en = item.translations.en;
        const rawEn = en.descriptionRaw || en.description;
        if (rawEn) {
          en.descriptionRaw = rawEn;
          en.description = scanAndMarkup(rawEn, 'en');
        }
      }
      return item;
    });

    fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2), 'utf8');
  });
});

console.log('All done!');
