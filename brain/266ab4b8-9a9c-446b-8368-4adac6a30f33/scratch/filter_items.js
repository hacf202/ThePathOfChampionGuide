import fs from 'fs';

const sourceFile = 'd:/ThePathOfChampionGuide/be/uploadData/mongo_backup_2026-05-02T13-40-55/guidePocItems.json';
const targetFile = 'd:/ThePathOfChampionGuide/be/uploadData/mongo_backup_2026-05-02T13-40-55/filteredPocItems.json';

try {
    const data = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));
    const filtered = data.filter(item => {
        if (!item.type || !Array.isArray(item.type)) return false;
        return item.type.includes("Vật Phẩm Tùy Tùng") || item.type.includes("Vật Phẩm Chung");
    });
    
    fs.writeFileSync(targetFile, JSON.stringify(filtered, null, 2), 'utf8');
    console.log(`Successfully created ${targetFile} with ${filtered.length} items.`);
} catch (error) {
    console.error('Error:', error.message);
}
