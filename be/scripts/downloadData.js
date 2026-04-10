// be/scripts/downloadData.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { unmarshall } from "@aws-sdk/util-dynamodb";
import client from "../src/config/db.js";
import { scanAll } from "../src/utils/dynamoUtils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Đường dẫn tới thư mục data ở gốc be/
const DATA_DIR = path.join(__dirname, '../data');

const TABLES = [
    {
        name: 'guidePocPowers',
        file: 'PowersData.json',
        sortField: 'name'
    },
    {
        name: 'guidePocItems',
        file: 'ItemsData.json',
        sortField: 'name'
    },
    {
        name: 'guidePocRelics',
        file: 'RelicsData.json',
        sortField: 'name'
    },
    {
        name: 'guidePocRunes',
        file: 'RunesData.json',
        sortField: 'name'
    }
];

async function downloadData() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    for (const table of TABLES) {
        console.log(`Downloading data from table: ${table.name}...`);
        try {
            const rawItems = await scanAll(client, { TableName: table.name });
            const unmarshalledItems = rawItems.map(item => unmarshall(item));
            
            // Sort items by sortField
            unmarshalledItems.sort((a, b) => (a[table.sortField] || "").localeCompare(b[table.sortField] || ""));

            const filePath = path.join(DATA_DIR, table.file);
            fs.writeFileSync(filePath, JSON.stringify(unmarshalledItems, null, 2), 'utf-8');
            console.log(`- Saved ${unmarshalledItems.length} items to ${table.file}`);
        } catch (error) {
            console.error(`Error downloading data for ${table.name}:`, error);
        }
    }

    console.log('Finished downloading all data files.');
}

downloadData().catch(console.error);
