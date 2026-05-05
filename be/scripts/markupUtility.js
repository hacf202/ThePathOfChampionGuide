import fs from 'fs';
import path from 'path';

/**
 * Utility script to apply markup to Path of Champions item/card descriptions.
 * Uses globals-vi_vn.json and globals-en_us.json as sources for keywords and vocab.
 * Format: [k:nameRef|DisplayName]
 */

const GLOBALS_VI = 'd:/ThePathOfChampionGuide/fe/src/assets/data/globals-vi_vn.json';
const GLOBALS_EN = 'd:/ThePathOfChampionGuide/fe/src/assets/data/globals-en_us.json';

function loadTerms() {
    const vi = JSON.parse(fs.readFileSync(GLOBALS_VI, 'utf8'));
    const en = JSON.parse(fs.readFileSync(GLOBALS_EN, 'utf8'));

    const termMap = {
        vi: [],
        en: []
    };

    // Helper to process terms with priority
    const process = (list, lang, type) => {
        list.forEach(item => {
            if (item.name && item.nameRef) {
                termMap[lang].push({
                    name: item.name,
                    ref: item.nameRef,
                    priority: (type === 'keywords' ? 2 : 1) + (item.icon ? 10 : 0)
                });
            }
        });
    };

    process(vi.keywords, 'vi', 'keywords');
    process(vi.vocabTerms, 'vi', 'vocabTerms');
    process(en.keywords, 'en', 'keywords');
    process(en.vocabTerms, 'en', 'vocabTerms');

    // Sort by name length descending (primary) and priority descending (secondary)
    const sorter = (a, b) => {
        if (b.name.length !== a.name.length) {
            return b.name.length - a.name.length;
        }
        return b.priority - a.priority;
    };

    termMap.vi.sort(sorter);
    termMap.en.sort(sorter);

    // Remove duplicates (same name), keeping the one with higher priority
    const filterDuplicates = (list) => {
        const seen = new Set();
        return list.filter(item => {
            if (seen.has(item.name.toLowerCase())) return false;
            seen.add(item.name.toLowerCase());
            return true;
        });
    };

    termMap.vi = filterDuplicates(termMap.vi);
    termMap.en = filterDuplicates(termMap.en);

    return termMap;
}

const terms = loadTerms();

/**
 * Applies markup to a string based on language.
 * @param {string} text 
 * @param {'vi' | 'en'} lang 
 */
export function applyMarkup(text, lang = 'vi') {
    if (!text) return text;
    let result = text;
    const langTerms = terms[lang] || [];

    // We use a temporary placeholder to avoid double-processing already marked terms
    const replacements = [];
    
    langTerms.forEach((term, index) => {
        // Match whole words or phrases. 
        // We use a regex that looks for the term not preceded/followed by letters/numbers 
        // or already inside a markup block.
        // However, Vietnamese has spaces in terms, so simple \b might not work perfectly.
        // We'll use a more robust approach: find and replace with a placeholder.
        
        const escapedName = term.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Avoid matching if already part of a [k:...] block
        const regex = new RegExp(`(?<!\\[k:[^|]*\\|)${escapedName}(?![^[\\]]*\\])`, 'gi');
        
        result = result.replace(regex, (match) => {
            const placeholder = `__MARKUP_${replacements.length}__`;
            replacements.push(`[k:${term.ref}|${match}]`);
            return placeholder;
        });
    });

    // Replace placeholders back
    replacements.forEach((val, i) => {
        result = result.replace(`__MARKUP_${i}__`, val);
    });

    return result;
}

// Simple test execution
const isMain = process.argv[1].endsWith('markupUtility.js');
if (isMain) {
    const testVi = "Khi ta được triệu hồi, ban cho ta Áp Đảo và Cảm Tử.";
    const testEn = "When I'm summoned, grant me Overwhelm and Ephemeral.";
    
    console.log("VI Test:", applyMarkup(testVi, 'vi'));
    console.log("EN Test:", applyMarkup(testEn, 'en'));
}
