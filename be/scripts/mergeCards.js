// be/scripts/mergeCards.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Đường dẫn tới thư mục datacard ở gốc be/
const DATACARD_DIR = path.resolve(__dirname, "../datacard");
const OUTPUT_FILE = path.join(DATACARD_DIR, "cardList.json");

/**
 * transformRiotMarkup - Converts Riot's internal XML-like markup 
 * into the website's standardized [type:value|label] format.
 */
function transformRiotMarkup(text) {
    if (!text) return "";

    let processed = text;

    // 1. Standardize newlines
    processed = processed.replace(/\r\n/g, "\n");

    // 2. Handle Keywords with sprites: <link=keyword.X><sprite name=X><style=Keyword>Label</style></link>
    // Note: Some keywords have sprite markers after the link or inside. Riot's JSON description usually has them inside.
    processed = processed.replace(/<link=keyword\.([^>]+)><sprite name=[^>]+><style=Keyword>([^<]+)<\/style><\/link>/gi, "[k:$1|$2]");

    // 3. Handle Keywords without sprites: <link=keyword.X><style=Keyword>Label</style></link>
    processed = processed.replace(/<link=keyword\.([^>]+)><style=Keyword>([^<]+)<\/style><\/link>/gi, "[k:$1|$2]");

    // 4. Handle Vocab terms: <link=vocab\.X><style=Vocab>Label</style></link>
    processed = processed.replace(/<link=vocab\.([^>]+)><style=Vocab>([^<]+)<\/style><\/link>/gi, "[k:$1|$2]");

    // 5. Handle Associated Cards: <link=card\.([^>]+)><style=AssociatedCard>([^<]+)<\/style><\/link>
    // Sometimes it's card.summon, card.cardref, etc.
    processed = processed.replace(/<link=card\.[^>]+><style=AssociatedCard>([^<]+)<\/style><\/link>/gi, "[c:$1]");

    // 6. Handle plain link tags: <link=keyword.X>Label</link>
    processed = processed.replace(/<link=(?:keyword|vocab)\.([^>]+)>([^<]+)<\/link>/gi, "[k:$1|$2]");
    processed = processed.replace(/<link=card\.[^>]+>([^<]+)<\/link>/gi, "[c:$1]");
    processed = processed.replace(/<link=[^>]+>([^<]+)<\/link>/gi, "$1");
    
    // 7. Remove style tags while keeping content
    processed = processed.replace(/<style=[^>]+>([^<]*)<\/style>/gi, "$1");

    // 8. Final pass: Remove any remaining XML-like tags
    processed = processed.replace(/<[^>]+>/g, "");

    // 9. Clean up whitespace
    processed = processed.trim();

    return processed;
}

/**
 * Script to merge all set JSON files into a single cardList.json
 * standardizing fields for both Vietnamese and English.
 */
async function mergeCards() {
    try {
        const files = fs.readdirSync(DATACARD_DIR);
        const viFiles = files.filter(f => f.endsWith("-vi_vn.json"));
        
        const allCardsMap = new Map();

        console.log(`Found ${viFiles.length} Vietnamese set files. Starting merge...`);

        for (const viFile of viFiles) {
            const setName = viFile.replace("-vi_vn.json", "");
            
            // Try to find matching en_us file.
            let enFile = `${setName}-en_us.json`;
            
            if (!files.includes(enFile)) {
                const possibleEn = files.find(f => f.startsWith(setName.slice(0, 4)) && f.endsWith("-en_us.json"));
                if (possibleEn) enFile = possibleEn;
            }

            const viPath = path.join(DATACARD_DIR, viFile);
            const enPath = path.join(DATACARD_DIR, enFile);

            const viData = JSON.parse(fs.readFileSync(viPath, 'utf8'));
            const enData = fs.existsSync(enPath) ? JSON.parse(fs.readFileSync(enPath, 'utf8')) : [];

            const enMap = new Map();
            enData.forEach(c => enMap.set(c.cardCode, c));

            viData.forEach(viCard => {
                const enCard = enMap.get(viCard.cardCode);
                
                const viImage = viCard.assets?.[0]?.gameAbsolutePath || "";
                
                // Using .description (with markup) instead of .descriptionRaw
                const rawViDesc = viCard.description || viCard.descriptionRaw || "";
                const rawEnDesc = enCard ? (enCard.description || enCard.descriptionRaw || "") : rawViDesc;

                const mergedCard = {
                    cardCode: viCard.cardCode,
                    cardName: viCard.name,
                    cost: viCard.cost || 0,
                    description: transformRiotMarkup(rawViDesc),
                    descriptionRaw: viCard.descriptionRaw || "",
                    gameAbsolutePath: viImage,
                    rarity: viCard.rarityRef || viCard.rarity || "",
                    regions: viCard.regions || [],
                    translations: {
                        en: {
                            cardName: enCard ? enCard.name : viCard.name,
                            description: transformRiotMarkup(rawEnDesc),
                            descriptionRaw: enCard ? enCard.descriptionRaw : (viCard.descriptionRaw || ""),
                            gameAbsolutePath: enCard?.assets?.[0]?.gameAbsolutePath || viImage,
                            regions: enCard ? enCard.regions : (viCard.regions || []),
                            type: enCard ? enCard.type : viCard.type,
                        }
                    },
                    type: viCard.type
                };

                allCardsMap.set(mergedCard.cardCode, mergedCard);
            });
            
            console.log(`Processed ${setName}: ${viData.length} cards.`);
        }

        const finalCards = Array.from(allCardsMap.values());
        finalCards.sort((a, b) => a.cardCode.localeCompare(b.cardCode));

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(finalCards, null, 1), 'utf8');
        
        console.log(`Success! Created ${OUTPUT_FILE} with ${finalCards.length} cards.`);
    } catch (error) {
        console.error("Error merging cards:", error);
    }
}

mergeCards();
