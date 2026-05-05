import fs from 'fs';

const filePath = 'd:/ThePathOfChampionGuide/be/uploadData/mongo_backup_2026-05-02T13-40-55/filteredPocItems.json';
const codesToRemove = ['I0009', 'I0010', 'I0011', 'I0035', 'I0073', 'I0142', 'I0146', 'I0147', 'I0158', 'I0163', 'I0175', 'I0176'];

try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const initialCount = data.length;
    const filtered = data.filter(item => !codesToRemove.includes(item.itemCode));
    const removedCount = initialCount - filtered.length;
    
    fs.writeFileSync(filePath, JSON.stringify(filtered, null, 2), 'utf8');
    console.log(`Successfully removed ${removedCount} items. New count: ${filtered.length}`);
} catch (error) {
    console.error('Error:', error.message);
}
