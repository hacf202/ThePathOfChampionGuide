/**
 * analyze_locales.cjs
 * Script kiểm tra sự đồng bộ giữa en.json và vi.json.
 * Chạy từ root: node scripts/analyze_locales.cjs
 */

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../fe/src');
const enPath = path.join(srcDir, 'locales', 'en.json');
const viPath = path.join(srcDir, 'locales', 'vi.json');

const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const viData = JSON.parse(fs.readFileSync(viPath, 'utf8'));

// Flatten an object to dot notation keys
function flattenObj(obj, parent = '', res = {}) {
    for (let key in obj) {
        let propName = parent ? parent + '.' + key : key;
        if (typeof obj[key] == 'object' && obj[key] !== null) {
            flattenObj(obj[key], propName, res);
        } else {
            res[propName] = obj[key];
        }
    }
    return res;
}

const flatEn = flattenObj(enData);
const flatVi = flattenObj(viData);

// 1. Find mismatched keys
const enKeys = Object.keys(flatEn);
const viKeys = Object.keys(flatVi);

const onlyInEn = enKeys.filter(k => !viKeys.includes(k));
const onlyInVi = viKeys.filter(k => !enKeys.includes(k));

console.log(`--- Key Matches ---`);
console.log(`Total EN keys: ${enKeys.length}`);
console.log(`Total VI keys: ${viKeys.length}`);
console.log(`Only in EN (${onlyInEn.length}):`, onlyInEn.slice(0, 10));
console.log(`Only in VI (${onlyInVi.length}):`, onlyInVi.slice(0, 10));

// 2. Find keys used in the codebase
const tUIRegex = /tUI\(\s*['\"`](([^'\"`\\]|\\.)*)['\"`]\s*\)/g;
const usedKeys = new Set();
let jsFileCount = 0;

function traverseDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            traverseDir(fullPath);
        } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
            jsFileCount++;
            const content = fs.readFileSync(fullPath, 'utf8');
            let match;
            while ((match = tUIRegex.exec(content)) !== null) {
                usedKeys.add(match[1]);
            }
        }
    }
}

traverseDir(srcDir);
const usedKeysArray = Array.from(usedKeys);
console.log(`\n--- Codebase Usage ---`);
console.log(`Scanned ${jsFileCount} JS/JSX files.`);
console.log(`Total unique tUI keys found in code: ${usedKeysArray.length}`);

// 3. Find Unused and Missing keys
const allLocaleKeys = Array.from(new Set([...enKeys, ...viKeys]));

const dynamicUsedKeys = usedKeysArray.filter(k => k.includes('${'));
const staticUsedKeys = usedKeysArray.filter(k => !k.includes('${'));

const unusedKeys = allLocaleKeys.filter(lk => {
    if (staticUsedKeys.includes(lk)) return false;
    for (const dk of dynamicUsedKeys) {
        const prefix = dk.split('${')[0];
        if (prefix && lk.startsWith(prefix)) return false;
    }
    return true;
});

const missingKeys = staticUsedKeys.filter(sk => !allLocaleKeys.includes(sk));

console.log(`Dynamic keys in code (${dynamicUsedKeys.length}):`, dynamicUsedKeys);
console.log(`Potentially Unused keys in JSON (${unusedKeys.length}):`, unusedKeys.slice(0, 20), unusedKeys.length > 20 ? '...' : '');
console.log(`Missing keys in JSON (${missingKeys.length}):`, missingKeys);

// 4. Top level namespaces
console.log(`\n--- Top Level Namespaces ---`);
console.log(Object.keys(enData));
