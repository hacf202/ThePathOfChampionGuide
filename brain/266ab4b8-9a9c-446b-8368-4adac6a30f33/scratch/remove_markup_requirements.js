import fs from 'fs';

function removeMarkup(text) {
    if (typeof text !== 'string') return text;
    // Regex for [k:Keyword|Label] or [cd:Code|Label|...]
    // It captures the content after the first | until the next | or ]
    return text.replace(/\[[a-z]+:[^|\]]+\|([^|\]]+)(?:\|[^\]]+)*\]/g, '$1');
}

function processFile(filePath) {
    try {
        let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        const processObject = (obj) => {
            if (Array.isArray(obj)) {
                obj.forEach(processObject);
            } else if (obj && typeof obj === 'object') {
                for (let key in obj) {
                    if (key === 'requirementsRaw') {
                        obj[key] = removeMarkup(obj[key]);
                    } else {
                        processObject(obj[key]);
                    }
                }
            }
        };

        processObject(data);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        console.log(`Successfully processed ${filePath}`);
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
    }
}

const files = [
    'd:/ThePathOfChampionGuide/be/uploadData/mongo_backup_2026-05-02T13-40-55/guidePocItems.json',
    'd:/ThePathOfChampionGuide/be/uploadData/mongo_backup_2026-05-02T13-40-55/filteredPocItems.json'
];

files.forEach(processFile);
