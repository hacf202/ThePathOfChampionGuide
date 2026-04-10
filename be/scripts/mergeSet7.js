import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cardListPath = path.join(__dirname, '../uploadData/cardList.json');
const set7ViPath = path.join(__dirname, '../data/set7-vi_vn.json');
const set7EnPath = path.join(__dirname, '../data/set7-en_us.json');

// --- 1. PREPARE MAPPINGS FOR MARKUP ---
const { viMap, enMap, viKeywords, enKeywords } = loadMappings();

function loadMappings() {
  console.log('Loading mappings for markup engine...');
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

  const viKeywords = {
    'Thách Đấu': 'Challenger', 'Đột Kích': 'QuickStrike', 'Hồi Phục': 'Regeneration',
    'Áp Đảo': 'Overwhelm', 'Kiên Cường': 'Tough', 'Khiên Phép': 'SpellShield',
    'Làm Choáng': 'Stun', 'Đóng Băng': 'Frostbite', 'Triệu Hồi': 'Summon',
    'Xuất Trận': 'Play', 'Tấn Công': 'Attack', 'Ra Đòn': 'Strike',
    'Bắt Đầu Vòng Đấu': 'RoundStart', 'Kết Thúc Vòng Đấu': 'RoundEnd',
    'Cưỡng Đoạt': 'Plunder', 'Định Mệnh': 'Fated', 'Nâng Cấp': 'Augment',
    'Linh Hồn': 'Spirit', 'Khí Lực': 'Impact', 'Tiến Hóa': 'Evolve',
    'Cường Hóa': 'Empowered', 'Hấp Thụ': 'Drain', 'Hình Thành': 'Manifest',
    'Đếm Ngược': 'Countdown', 'Huyền Ảo': 'Elusive', 'Thu Về': 'Recall',
    'Tiến Công': 'Rally', 'Trăng Trối': 'LastBreath', 'Tiên Đoán': 'Predict',
    'Đáng Sợ': 'Fearsome', 'Cảm Tử': 'Ephemeral', 'Trinh Sát': 'Scout',
    'Hỗ Trợ': 'Support', 'Rình Rập': 'Lurker', 'Hút Máu': 'Lifesteal',
    'Ngạo Mạn': 'Brash', 'Bất Diệt': 'Deathless', 'Siêu Tốc': 'Burst',
    'Nhanh': 'Fast', 'Chậm': 'Slow', 'Tập Trung': 'Focus',
    'Tiêu Hao': 'Cost', 'Sát Thương': 'Damage', 'Máu': 'Health',
    'Sức Mạnh': 'Power', 'Máu Nhà Chính': 'NexusHealth', 'Lượt Đổi': 'Reroll',
    'Vàng': 'Gold', 'Kinh Nghiệm': 'XP', 'Tùy Tùng': 'Follower',
    'Anh Hùng': 'Champion', 'Lá Chắn': 'Barrier',
  };

  const enKeywords = {
    'Challenger': 'Challenger', 'Quick Attack': 'QuickStrike', 'Regeneration': 'Regeneration',
    'Overwhelm': 'Overwhelm', 'Tough': 'Tough', 'SpellShield': 'SpellShield',
    'Stun': 'Stun', 'Frostbite': 'Frostbite', 'Summon': 'Summon',
    'Play': 'Play', 'Attack': 'Attack', 'Strike': 'Strike',
    'Round Start': 'RoundStart', 'Round End': 'RoundEnd', 'Plunder': 'Plunder',
    'Fated': 'Fated', 'Augment': 'Augment', 'Spirit': 'Spirit', 'Impact': 'Impact',
    'Evolve': 'Evolve', 'Empowered': 'Empowered', 'Drain': 'Drain',
    'Manifest': 'Manifest', 'Countdown': 'Countdown', 'Elusive': 'Elusive',
    'Recall': 'Recall', 'Rally': 'Rally', 'Last Breath': 'LastBreath',
    'Predict': 'Predict', 'Fearsome': 'Fearsome', 'Ephemeral': 'Ephemeral',
    'Scout': 'Scout', 'Support': 'Support', 'Lurk': 'Lurker',
    'Lifesteal': 'Lifesteal', 'Brash': 'Brash', 'Deathless': 'Deathless',
    'Burst': 'Burst', 'Fast': 'Fast', 'Slow': 'Slow', 'Focus': 'Focus',
    'Cost': 'Cost', 'Damage': 'Damage', 'Health': 'Health', 'Power': 'Power',
    'Nexus Health': 'NexusHealth', 'Reroll': 'Reroll', 'Gold': 'Gold',
    'XP': 'XP', 'Follower': 'Follower', 'Champion': 'Champion', 'Barrier': 'Barrier',
  };

  return { viMap, enMap, viKeywords, enKeywords };
}

function scanAndMarkup(text, lang = 'vi') {
  if (!text) return text;
  const currentCardMap = lang === 'vi' ? viMap : enMap;
  const currentKeywordMap = lang === 'vi' ? viKeywords : enKeywords;
  let result = text;

  // 1. Convert Riot tags
  result = result.replace(/<link=(?:keyword|vocab)\.([^>]+)>(?:<sprite name=[^>]+>)?<style=[^>]+>([^<]+)<\/style><\/link>/g, '[k:$1|$2]');
  result = result.replace(/<link=card\.self><style=AssociatedCard>([^<]+)<\/style><\/link>/g, (match, name) => {
    const code = currentCardMap.get(name);
    return code ? `[cd:${code}|${name}|icon,img-full]` : `[c:${name}]`;
  });
  result = result.replace(/<br>/g, '\n');
  result = result.replace(/<[^>]+>/g, '');

  // 2. Scan Keywords
  const sortedKeywords = Object.keys(currentKeywordMap).sort((a, b) => b.length - a.length);
  for (const kName of sortedKeywords) {
    const id = currentKeywordMap[kName];
    const regex = new RegExp(`(?<!\\[k:[^|]+\\|)${kName}(?![^\\]]*\\])`, 'g');
    result = result.replace(regex, `[k:${id}|${kName}]`);
  }

  // 3. Scan Card Names
  const sortedCards = Array.from(currentCardMap.keys()).filter(n => n.length > 5).sort((a, b) => b.length - a.length);
  for (const cName of sortedCards) {
    const code = currentCardMap.get(cName);
    const escaped = cName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?<!\\[cd:[^|]+\\|)(?<!\\[c:)${escaped}(?![^\\]]*\\])`, 'g');
    result = result.replace(regex, `[cd:${code}|${cName}|icon,img-full]`);
  }

  return result;
}

// --- 2. MERGE LOGIC ---
console.log('Starting merge process...');

const masterData = JSON.parse(fs.readFileSync(cardListPath, 'utf8'));
const set7Vi = JSON.parse(fs.readFileSync(set7ViPath, 'utf8'));
const set7En = JSON.parse(fs.readFileSync(set7EnPath, 'utf8'));

// Create maps for quick access
const masterMap = new Map(masterData.map(c => [c.cardCode, c]));
const enSourceMap = new Map(set7En.map(c => [c.cardCode, c]));

const typeMapping = {
    'Unit': 'Bài quân',
    'Spell': 'Bài phép',
    'Landmark': 'Địa danh',
    'Equipment': 'Vật phẩm'
};

const rarityMapping = {
    'EPIC': 'Epic',
    'RARE': 'Rare',
    'COMMON': 'Common',
    'Champion': 'Champion',
    'None': 'None'
};

let addedCount = 0;
let updatedCount = 0;

set7Vi.forEach(viCard => {
    const code = viCard.cardCode;
    const enCard = enSourceMap.get(code);
    
    if (!enCard) {
        console.warn(`Missing English version for card ${code}`);
        return;
    }

    const rarity = rarityMapping[viCard.rarity] || viCard.rarityRef || viCard.rarity;
    const typeVi = typeMapping[viCard.type] || viCard.type;

    const mergedCard = {
        cardCode: code,
        cardName: viCard.name,
        cost: viCard.cost,
        description: scanAndMarkup(viCard.descriptionRaw || viCard.description, 'vi'),
        descriptionRaw: viCard.descriptionRaw || viCard.description,
        gameAbsolutePath: viCard.assets?.[0]?.gameAbsolutePath || '',
        rarity: rarity,
        regions: viCard.regions,
        translations: {
            en: {
                cardName: enCard.name,
                description: scanAndMarkup(enCard.descriptionRaw || enCard.description, 'en'),
                descriptionRaw: enCard.descriptionRaw || enCard.description,
                gameAbsolutePath: enCard.assets?.[0]?.gameAbsolutePath || '',
                regions: enCard.regions,
                type: enCard.type
            }
        },
        type: typeVi,
        associatedCardRefs: viCard.associatedCardRefs || []
    };

    if (masterMap.has(code)) {
        updatedCount++;
    } else {
        addedCount++;
    }
    masterMap.set(code, mergedCard);
});

// Convert back to array
const updatedMasterList = Array.from(masterMap.values());

// Sort by cardCode to maintain order if possible (optional but good)
updatedMasterList.sort((a, b) => a.cardCode.localeCompare(b.cardCode));

console.log(`Merge complete: Added ${addedCount}, Updated ${updatedCount} cards.`);

fs.writeFileSync(cardListPath, JSON.stringify(updatedMasterList, null, 4), 'utf8');
console.log('Result saved to cardList.json');
