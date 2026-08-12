import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { applyMarkup } from './markupUtility.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMP_DIR = path.join(__dirname, '../uploadData/temp');
const uploadDataDir = path.join(__dirname, '../uploadData');
const backupDirs = fs.readdirSync(uploadDataDir).filter(dir => dir.startsWith('mongo_backup_'));
const BACKUP_DIR = backupDirs.length > 0 
    ? path.join(uploadDataDir, backupDirs.sort().reverse()[0]) 
    : path.join(uploadDataDir, 'mongo_backup_2026-07-14T23-41-53');
const PROCESSED_DIR = path.join(__dirname, '../uploadData/processed_temp');

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
    
    for (const viItem of viData) {
        if (!existingMap.has(viItem[idKey])) {
            const enItem = enMap.get(viItem[idKey]) || {};
            
            const cleanDescVi = cleanDescriptionRaw(viItem.description || viItem.descriptionRaw);
            const cleanDescEn = cleanDescriptionRaw(enItem.description || enItem.descriptionRaw);
            
            const newItem = { ...viItem };
            
            newItem.descriptionRaw = cleanDescVi;
            newItem.description = applyMarkup(cleanDescVi, 'vi');
            newItem.rarity = getRarity(viItem.rarityRef, collectionName, viItem.rarity);
            
            newItem.translations = {
                en: {
                    name: enItem.name || '',
                    descriptionRaw: cleanDescEn,
                    description: applyMarkup(cleanDescEn, 'en'),
                    rarity: toTitleCase(enItem.rarityRef || enItem.rarity || '')
                }
            };
            
            if (collectionName === 'guidePocRelics') {
                newItem.type = ["Chung"];
                newItem.stack = "1";
                const code = viItem[idKey];
                newItem.image = `https://images.pocguide.top/relics/${code}.webp`;
            } else if (collectionName === 'guidePocPowers') {
                newItem.type = ["Star Power"];
            } else if (collectionName === 'guidePocItems') {
                newItem.type = ["Vật Phẩm Phép"];
            }
            
            existingData.push(newItem);
            addedCount++;
            console.log(`[${collectionName}] Added new item: ${viItem[idKey]} - ${viItem.name}`);
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
    
    console.log(`✅ [${collectionName}] Finished. Added ${addedCount} items. Saved to ${outPath}\n`);
}

function main() {
    console.log("🚀 Bắt đầu quá trình cập nhật dữ liệu PoC...");
    processCollection("guidePocPowers", "powers-vi_vn.json", "powers-en_us.json", "powerCode");
    processCollection("guidePocRelics", "relics-vi_vn.json", "relics-en_us.json", "relicCode");
    processCollection("guidePocItems", "items-vi_vn.json", "items-en_us.json", "itemCode");
    console.log("🎉 Hoàn tất!");
}

main();
