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

const CARD_REPLACEMENTS_VI = [
    { regex: /(?<!\|)(?<!\[cd:[^|\]]+\|)(?<!\p{L})Con Mồi(?!\s*\])(?!\p{L})/gu, code: '04SI014', name: 'Con Mồi' },
    { regex: /(?<!\|)(?<!\[cd:[^|\]]+\|)(?<!\p{L})Xúc Tu(?!\s*\])(?!\p{L})/gu, code: '06BW006T3', name: 'Xúc Tu' },
    { regex: /(?<!\|)(?<!\[cd:[^|\]]+\|)(?<!\p{L})Valor(?!\s*\])(?!\p{L})/gu, code: '02DE006T2', name: 'Valor' },
    { regex: /(?<!\|)(?<!\[cd:[^|\]]+\|)(?<!\p{L})Đại Quảng Trường(?!\s*\])(?!\p{L})/gu, code: '03DE010', name: 'Đại Quảng Trường' },
    { regex: /(?<!\|)(?<!\[cd:[^|\]]+\|)(?<!\p{L})Nhền Nhện Điên Cuồng(?!\s*\])(?!\p{L})/gu, code: '01SI056', name: 'Nhền Nhện Điên Cuồng' },
    { regex: /(?<!\|)(?<!\[cd:[^|\]]+\|)(?<!\p{L})Cua Phế Liệu(?!\s*\])(?!\p{L})/gu, code: '01PZ032', name: 'Cua Phế Liệu' },
    { regex: /(?<!\|)(?<!\[cd:[^|\]]+\|)(?<!\p{L})Huyết Tự Darkin(?!\s*\])(?!\p{L})/gu, code: '06SH004', name: 'Huyết Tự Darkin' },
    { regex: /(?<!\|)(?<!\[cd:[^|\]]+\|)(?<!\p{L})Trường Kích Darkin(?!\s*\])(?!\p{L})/gu, code: '06SI007', name: 'Trường Kích Darkin' },
    { regex: /(?<!\|)(?<!\[cd:[^|\]]+\|)(?<!\p{L})Cảnh Binh Tuần Tra(?!\s*\])(?!\p{L})/gu, code: '02PZ005', name: 'Cảnh Binh Tuần Tra' },
    { regex: /(?<!\|)(?<!\[cd:[^|\]]+\|)(?<!\p{L})Bánh Xe Công Lý(?!\s*\])(?!\p{L})/gu, code: '05PZ015', name: 'Bánh Xe Công Lý' },
    { regex: /(?<!\|)(?<!\[cd:[^|\]]+\|)(?<!\p{L})Nhào Lộn(?!\s*\])(?!\p{L})/gu, code: '06DE021T3', name: 'Nhào Lộn' },
    { regex: /(?<!\|)(?<!\[cd:[^|\]]+\|)(?<!\p{L})Áp Chế(?!\s*\])(?!\p{L})/gu, code: '08DE017T1', name: 'Áp Chế' },
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
    { regex: /(?<!\|)\bSuppression\b(?!\s*\])/g, code: '08DE017T1', name: 'Suppression' },
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

function cleanDescriptionRaw(str) {
    if (!str) return '';
    let cleaned = str.replace(/<br\s*\/?>/gi, '\n');
    cleaned = cleaned.replace(/<[^>]*>/g, '');
    const regex = /\[(?:k|cd):[^|\]]+\|([^|\]]+)(?:\|[^\]]+)?\]/g;
    cleaned = cleaned.replace(regex, '$1');
    return cleaned;
}

function normalizeText(s) {
    if (!s) return '';
    return s.replace(/\r\n/g, '\n').trim();
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
    let updatedCount = 0;
    
    for (const viItem of viData) {
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
        } else if (viItem.type === 'Phép' || viItem.type === 'Bài phép') {
            rootType = 'spell';
        } else if (viItem.type === 'Địa danh') {
            rootType = 'landmark';
        } else if (viItem.type === 'Trang bị') {
            rootType = 'equipment';
        }

        const mkVi = applyCardMarkup(applyMarkup(cleanDescVi, 'vi'), 'vi');
        const mkEn = applyCardMarkup(applyMarkup(cleanDescEn, 'en'), 'en');

        if (!existingMap.has(viItem.cardCode)) {
            const newItem = {
                gameAbsolutePath: gameAbsolutePath,
                cardCode: viItem.cardCode,
                cost: viItem.cost,
                regions: viItem.regions || [],
                translations: {
                    en: {
                        description: mkEn,
                        gameAbsolutePath: gameAbsolutePathEn,
                        regions: enItem.regions || [],
                        cardName: enItem.name || '',
                        type: enItem.type || '',
                        descriptionRaw: cleanDescEn,
                        keywords: enItem.keywords || []
                    }
                },
                rarity: enItem.rarityRef || viItem.rarityRef || 'None',
                associatedCardRefs: viItem.associatedCardRefs || [],
                descriptionRaw: cleanDescVi,
                description: mkVi,
                cardName: viItem.name,
                type: rootType,
                keywords: viItem.keywords || [],
                subtypes: viItem.subtypes || []
            };
            
            existingData.push(newItem);
            existingMap.set(viItem.cardCode, newItem);
            addedCount++;
            console.log(`[guidePocCardList] Added new card: ${viItem.cardCode} - ${viItem.name}`);
        } else {
            const existingItem = existingMap.get(viItem.cardCode);
            let hasChanged = false;

            if (gameAbsolutePath && existingItem.gameAbsolutePath !== gameAbsolutePath) {
                existingItem.gameAbsolutePath = gameAbsolutePath;
                hasChanged = true;
            }

            if (normalizeText(existingItem.descriptionRaw) !== normalizeText(cleanDescVi)) {
                existingItem.descriptionRaw = cleanDescVi;
                existingItem.description = mkVi;
                hasChanged = true;
            } else if (!existingItem.description?.includes('[') && mkVi.includes('[')) {
                // Was raw, now enriched with markup
                existingItem.description = mkVi;
                hasChanged = true;
            }

            if (!existingItem.translations) {
                existingItem.translations = {};
            }
            if (!existingItem.translations.en) {
                existingItem.translations.en = {};
            }

            if (gameAbsolutePathEn && existingItem.translations.en.gameAbsolutePath !== gameAbsolutePathEn) {
                existingItem.translations.en.gameAbsolutePath = gameAbsolutePathEn;
                hasChanged = true;
            }

            if (normalizeText(existingItem.translations.en.descriptionRaw) !== normalizeText(cleanDescEn)) {
                existingItem.translations.en.descriptionRaw = cleanDescEn;
                existingItem.translations.en.description = mkEn;
                hasChanged = true;
            } else if (!existingItem.translations.en.description?.includes('[') && mkEn.includes('[')) {
                existingItem.translations.en.description = mkEn;
                hasChanged = true;
            }

            if (hasChanged) {
                updatedCount++;
                console.log(`[guidePocCardList] Updated existing card: ${viItem.cardCode} - ${viItem.name}`);
            }
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
    
    console.log(`✅ [guidePocCardList] Finished. Added ${addedCount} items, Updated ${updatedCount} items. Saved to ${outPath}\n`);
}

function main() {
    console.log("🚀 Bắt đầu quá trình cập nhật dữ liệu PoC Cards...");
    console.log(`📁 Thư mục backup nguồn: ${BACKUP_DIR}`);
    processCards();
    console.log("🎉 Hoàn tất!");
}

main();
