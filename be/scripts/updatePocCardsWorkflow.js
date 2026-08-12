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

function cleanDescriptionRaw(str) {
    if (!str) return '';
    let cleaned = str.replace(/<br\s*\/?>/gi, '\n');
    cleaned = cleaned.replace(/<[^>]*>/g, '');
    const regex = /\[(?:k|cd):[^|\]]+\|([^|\]]+)(?:\|[^\]]+)?\]/g;
    cleaned = cleaned.replace(regex, '$1');
    return cleaned;
}

function processCards() {
    const backupFilePath = path.join(BACKUP_DIR, 'guidePocCardList.json');
    const viFilePath = path.join(TEMP_DIR, 'tpoc-vi_vn.json');
    const enFilePath = path.join(TEMP_DIR, 'tpoc-en_us.json');
    
    if (!fs.existsSync(backupFilePath) || !fs.existsSync(viFilePath) || !fs.existsSync(enFilePath)) {
        console.error(`Missing files for guidePocCardList. Skipping.`);
        return;
    }
    
    const existingData = JSON.parse(fs.readFileSync(backupFilePath, 'utf-8'));
    const viData = JSON.parse(fs.readFileSync(viFilePath, 'utf-8'));
    const enData = JSON.parse(fs.readFileSync(enFilePath, 'utf-8'));
    
    const existingMap = new Map();
    existingData.forEach(item => existingMap.set(item.cardCode, item));
    
    const enMap = new Map();
    enData.forEach(item => enMap.set(item.cardCode, item));
    
    let addedCount = 0;
    
    for (const viItem of viData) {
        // Collectible check? The prompt said "filter new cards", which means all that are not in existing list.
        if (!existingMap.has(viItem.cardCode)) {
            const enItem = enMap.get(viItem.cardCode) || {};
            
            const cleanDescVi = cleanDescriptionRaw(viItem.description || viItem.descriptionRaw);
            const cleanDescEn = cleanDescriptionRaw(enItem.description || enItem.descriptionRaw);
            
            let gameAbsolutePath = viItem.assets && viItem.assets.length > 0 ? viItem.assets[0].gameAbsolutePath : '';
            gameAbsolutePath = gameAbsolutePath.replace('http://', 'https://');
            
            let gameAbsolutePathEn = enItem.assets && enItem.assets.length > 0 ? enItem.assets[0].gameAbsolutePath : '';
            gameAbsolutePathEn = gameAbsolutePathEn.replace('http://', 'https://');

            let rootType = 'unit';
            if (enItem.type) {
                rootType = enItem.type.toLowerCase();
            } else if (viItem.type === 'Phép') {
                rootType = 'spell';
            } else if (viItem.type === 'Địa danh') {
                rootType = 'landmark';
            } else if (viItem.type === 'Trang bị') {
                rootType = 'equipment';
            }

            const newItem = {
                gameAbsolutePath: gameAbsolutePath,
                cardCode: viItem.cardCode,
                cost: viItem.cost,
                regions: viItem.regions || [],
                rarity: enItem.rarityRef || viItem.rarityRef,
                associatedCardRefs: viItem.associatedCardRefs || [],
                descriptionRaw: cleanDescVi,
                description: applyMarkup(cleanDescVi, 'vi'),
                cardName: viItem.name,
                type: rootType,
                keywords: viItem.keywords || [],
                subtypes: viItem.subtypes || [],
                translations: {
                    en: {
                        description: applyMarkup(cleanDescEn, 'en'),
                        gameAbsolutePath: gameAbsolutePathEn,
                        regions: enItem.regions || [],
                        cardName: enItem.name || '',
                        type: enItem.type || '',
                        descriptionRaw: cleanDescEn,
                        keywords: enItem.keywords || []
                    }
                }
            };
            
            existingData.push(newItem);
            addedCount++;
            console.log(`[guidePocCardList] Added new card: ${viItem.cardCode} - ${viItem.name}`);
        }
    }
    
    existingData.sort((a, b) => {
        if (a.cardCode && b.cardCode) {
            return a.cardCode.localeCompare(b.cardCode);
        }
        return 0;
    });
    
    if (!fs.existsSync(PROCESSED_DIR)) {
        fs.mkdirSync(PROCESSED_DIR, { recursive: true });
    }
    
    const outPath = path.join(PROCESSED_DIR, `guidePocCardList.json`);
    fs.writeFileSync(outPath, JSON.stringify(existingData, null, 2));
    
    console.log(`✅ [guidePocCardList] Finished. Added ${addedCount} items. Saved to ${outPath}\n`);
}

function main() {
    console.log("🚀 Bắt đầu quá trình cập nhật dữ liệu PoC Cards...");
    processCards();
    console.log("🎉 Hoàn tất!");
}

main();
