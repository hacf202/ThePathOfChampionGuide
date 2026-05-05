import fs from 'fs';

const filePath = 'd:/ThePathOfChampionGuide/be/uploadData/mongo_backup_2026-05-02T13-40-55/filteredPocItems.json';

try {
    let content = fs.readFileSync(filePath, 'utf8');
    const updatedContent = content.replace(/\[k:Equipment\|trang bị\]/g, 'trang bị');
    
    if (content !== updatedContent) {
        fs.writeFileSync(filePath, updatedContent, 'utf8');
        console.log(`Successfully updated ${filePath}.`);
    } else {
        console.log('No matches found to replace.');
    }
} catch (error) {
    console.error('Error:', error.message);
}
