import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { applyMarkup } from './markupUtility.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMP_DIR = path.join(__dirname, '../uploadData/temp');
const uploadDataDir = path.join(__dirname, '../uploadData');
const backupDirs = fs.readdirSync(uploadDataDir).filter(dir => dir.startsWith('mongo_backup_')).sort().reverse();
const BACKUP_DIR = path.join(uploadDataDir, backupDirs[0]);
const PROCESSED_DIR = path.join(__dirname, '../uploadData/processed_temp');

const CARD_REPLACEMENTS_VI = [
    { regex: /(?<!\|)Con Mồi(?!\s*\])/g, code: '04SI014', name: 'Con Mồi' },
    { regex: /(?<!\|)Xúc Tu(?!\s*\])/g, code: '06BW006T3', name: 'Xúc Tu' },
    { regex: /(?<!\|)Valor(?!\s*\])/g, code: '02DE006T2', name: 'Valor' },
    { regex: /(?<!\|)Đại Quảng Trường(?!\s*\])/g, code: '03DE010', name: 'Đại Quảng Trường' },
    { regex: /(?<!\|)Nhền Nhện Điên Cuồng(?!\s*\])/g, code: '01SI056', name: 'Nhền Nhện Điên Cuồng' },
    { regex: /(?<!\|)Cua Phế Liệu(?!\s*\])/g, code: '01PZ032', name: 'Cua Phế Liệu' },
    { regex: /(?<!\|)Huyết Tự Darkin(?!\s*\])/g, code: '06SH004', name: 'Huyết Tự Darkin' },
    { regex: /(?<!\|)Trường Kích Darkin(?!\s*\])/g, code: '06SI007', name: 'Trường Kích Darkin' },
    { regex: /(?<!\|)Cảnh Binh Tuần Tra(?!\s*\])/g, code: '02PZ005', name: 'Cảnh Binh Tuần Tra' },
    { regex: /(?<!\|)Bánh Xe Công Lý(?!\s*\])/g, code: '05PZ015', name: 'Bánh Xe Công Lý' },
    { regex: /(?<!\|)Nhào Lộn(?!\s*\])/g, code: '06DE021T3', name: 'Nhào Lộn' },
];

const CARD_REPLACEMENTS_EN = [
    { regex: /(?<!\|)\bPrey\b(?!\s*\])/g, code: '04SI014', name: 'Prey' },
    { regex: /(?<!\|)\bTentacle\b(?!\s*\])/g, code: '06BW006T3', name: 'Tentacle' },
    { regex: /(?<!\|)\bValor\b(?!\s*\])/g, code: '02DE006T2', name: 'Valor' },
    { regex: /(?<!\|)\bThe Grand Plaza\b(?!\s*\])/g, code: '03DE010', name: 'The Grand Plaza' },
    { regex: /(?<!\|)\bFrenzied Skitterer\b(?!\s*\])/g, code: '01SI056', name: 'Frenzied Skitterer' },
    { regex: /(?<!\|)\bScuttle Crab\b(?!\s*\])/g, code: '01PZ032', name: 'Scuttle Crab' },
    { regex: /(?<!\|)\bThe Darkin Bloodletters\b(?!\s*\])/g, code: '06SH004', name: 'The Darkin Bloodletters' },
    { regex: /(?<!\|)\bThe Darkin Halberd\b(?!\s*\])/g, code: '06SI007', name: 'The Darkin Halberd' },
    { regex: /(?<!\|)\bPatrol Wardens?\b(?!\s*\])/g, code: '02PZ005', name: 'Patrol Warden' },
    { regex: /(?<!\|)\bThe Justice Rider\b(?!\s*\])/g, code: '05PZ015', name: 'The Justice Rider' },
    { regex: /(?<!\|)\bTumble\b(?!\s*\])/g, code: '06DE021T3', name: 'Tumble' },
];

function applyCardMarkup(str, lang = 'vi') {
    if (!str) return '';
    let result = str;
    const replacements = lang === 'en' ? CARD_REPLACEMENTS_EN : CARD_REPLACEMENTS_VI;
    for (const item of replacements) {
        result = result.replace(item.regex, `[cd:${item.code}|${item.name}]`);
    }
    return result;
}

function toTitleCase(str) {
    if (!str) return '';
    return str.toLowerCase().replace(/(?:^|\s)\w/g, function(match) {
        return match.toUpperCase();
    });
}

function cleanDescriptionRaw(str) {
    if (!str) return '';
    let cleaned = str.replace(/<br\s*\/?>/gi, '\n');
    cleaned = cleaned.replace(/<[^>]*>/g, '');
    const regex = /\[(?:k|cd):[^|\]]+\|([^|\]]+)(?:\|[^\]]+)?\]/g;
    cleaned = cleaned.replace(regex, '$1');
    return cleaned;
}

function getRarity(rarityRef, collectionName, rawRarityStr) {
    if (collectionName === 'guidePocPowers') {
        return (rarityRef || rawRarityStr || '').toLowerCase();
    }
    let baseRarity = rawRarityStr || '';
    if (rarityRef === 'Epic') baseRarity = 'Sử thi';
    else if (rarityRef === 'Rare') baseRarity = 'Hiếm';
    else if (rarityRef === 'Common') baseRarity = 'Thường';
    else if (rarityRef === 'Legendary') baseRarity = 'Huyền Thoại';
    else if (rarityRef === 'Special') baseRarity = 'Đặc biệt';
    
    if (collectionName === 'guidePocRelics') {
        return baseRarity.toUpperCase();
    }
    return toTitleCase(baseRarity);
}

function processCollection(collectionName, tempViFile, tempEnFile, idKey) {
    const backupFilePath = path.join(BACKUP_DIR, `${collectionName}.json`);
    const viFilePath = path.join(TEMP_DIR, tempViFile);
    const enFilePath = path.join(TEMP_DIR, tempEnFile);
    
    if (!fs.existsSync(backupFilePath) || !fs.existsSync(viFilePath) || !fs.existsSync(enFilePath)) {
        console.error(`Missing files for ${collectionName}. Skipping.`);
        return;
    }
    
    const existingData = JSON.parse(fs.readFileSync(backupFilePath, 'utf-8'));
    const viData = JSON.parse(fs.readFileSync(viFilePath, 'utf-8'));
    const enData = JSON.parse(fs.readFileSync(enFilePath, 'utf-8'));
    
    const existingMap = new Map();
    existingData.forEach(item => existingMap.set(item[idKey], item));
    
    const enMap = new Map();
    enData.forEach(item => enMap.set(item[idKey], item));
    
    let addedCount = 0;
    const forceUpdateKeys = ["P0171", "P0173", "I0072"];
    let updatedCount = 0;
    
    for (const viItem of viData) {
        const isForceUpdate = forceUpdateKeys.includes(viItem[idKey]);
        if (!existingMap.has(viItem[idKey]) || isForceUpdate) {
            const enItem = enMap.get(viItem[idKey]) || {};
            
            const cleanDescVi = cleanDescriptionRaw(viItem.description || viItem.descriptionRaw);
            const cleanDescEn = cleanDescriptionRaw(enItem.description || enItem.descriptionRaw);
            
            let markedDescVi = applyCardMarkup(applyMarkup(cleanDescVi, 'vi'), 'vi');
            let markedDescEn = applyCardMarkup(applyMarkup(cleanDescEn, 'en'), 'en');

            const newItem = { ...viItem };
            delete newItem.rarityRef;
            
            newItem.descriptionRaw = cleanDescVi;
            newItem.description = markedDescVi;
            newItem.rarity = getRarity(viItem.rarityRef, collectionName, viItem.rarity);
            
            newItem.translations = {
                en: {
                    name: enItem.name || '',
                    descriptionRaw: cleanDescEn,
                    description: markedDescEn,
                    rarity: toTitleCase(enItem.rarityRef || enItem.rarity || '')
                }
            };
            
            if (collectionName === 'guidePocRelics') {
                newItem.type = ["Chung"];
                newItem.stack = "1";
                newItem.source = null;
                const code = viItem[idKey];
                newItem.image = `https://images.pocguide.top/relics/${code}.webp`;
            } else if (collectionName === 'guidePocPowers') {
                const isFoe = viItem.powerCode.startsWith('FP') || 
                              viItem.descriptionRaw?.includes('Địch Thủ') || 
                              viItem.descriptionRaw?.includes('Địch thủ') || 
                              viItem.descriptionRaw?.includes('người chơi') ||
                              enItem.descriptionRaw?.includes('Foe');
                const isStar = ['P1080', 'P1090', 'P1091', 'P1092', 'P1093', 'P1094'].includes(viItem.powerCode);
                
                if (isFoe) {
                    newItem.type = ["Foe Power"];
                } else if (isStar) {
                    newItem.type = ["Star Power"];
                } else {
                    newItem.type = ["General Power"];
                }
            } else if (collectionName === 'guidePocItems') {
                if (viItem.logic?.type?.includes("Unit Items")) {
                    newItem.type = ["Vật Phẩm Tùy Tùng"];
                } else if (viItem.logic?.type?.includes("Spell Items")) {
                    newItem.type = ["Vật Phẩm Phép"];
                } else if (viItem.logic?.type?.includes("Landmark Items")) {
                    newItem.type = ["Vật Phẩm Địa Danh"];
                } else if (viItem.logic?.type?.includes("Equipment Items")) {
                    newItem.type = ["Vật Phẩm Trang Bị"];
                } else {
                    newItem.type = ["Vật Phẩm Phép"];
                }
            }
            
            if (isForceUpdate && existingMap.has(viItem[idKey])) {
                 const index = existingData.findIndex(item => item[idKey] === viItem[idKey]);
                 if (index !== -1) {
                     existingData[index] = { ...existingData[index], ...newItem, translations: { ...existingData[index].translations, ...newItem.translations } };
                     updatedCount++;
                     console.log(`[${collectionName}] Force updated item: ${viItem[idKey]} - ${viItem.name}`);
                 }
            } else {
                 existingData.push(newItem);
                 addedCount++;
                 console.log(`[${collectionName}] Added new item: ${viItem[idKey]} - ${viItem.name}`);
            }
        }
    }
    
    existingData.sort((a, b) => {
        if (a[idKey] && b[idKey]) {
            return a[idKey].localeCompare(b[idKey]);
        }
        return 0;
    });
    
    if (!fs.existsSync(PROCESSED_DIR)) {
        fs.mkdirSync(PROCESSED_DIR, { recursive: true });
    }
    
    const outPath = path.join(PROCESSED_DIR, `${collectionName}.json`);
    fs.writeFileSync(outPath, JSON.stringify(existingData, null, 2));
    
    console.log(`✅ [${collectionName}] Finished. Added ${addedCount} items, Updated ${updatedCount}. Saved to ${outPath}\n`);
}

function main() {
    console.log(`🚀 Bắt đầu quá trình cập nhật dữ liệu PoC từ backup: ${BACKUP_DIR}`);
    processCollection("guidePocPowers", "powers-vi_vn.json", "powers-en_us.json", "powerCode");
    processCollection("guidePocRelics", "relics-vi_vn.json", "relics-en_us.json", "relicCode");
    processCollection("guidePocItems", "items-vi_vn.json", "items-en_us.json", "itemCode");
    console.log("🎉 Hoàn tất xử lý và chuẩn hóa dữ liệu!");
}

main();
