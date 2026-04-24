import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, '../uploadData/backup_2026-04-24T01-31-12/RelicsData.json');

function updateRelicsData() {
    try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        const updatedData = data.map(item => ({
            ...item,
            image: `https://images.pocguide.top/relics/${item.relicCode}.webp`
        }));
        
        fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2), 'utf8');
        console.log(`Successfully updated ${updatedData.length} relics with the 'image' property.`);
    } catch (error) {
        console.error('Error updating RelicsData.json:', error.message);
    }
}

updateRelicsData();
