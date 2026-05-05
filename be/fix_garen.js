
import { getDb, connectToMongoDB } from './src/config/mongo.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

async function fixGaren() {
    console.log('Using URI:', process.env.MONGODB_URI ? 'Defined' : 'UNDEFINED');
    try {
        await connectToMongoDB();
        const db = getDb();
        const result = await db.collection('guidePocChampionList').updateOne(
            { championID: 'C011' },
            { $set: { cardCode: '01DE012' } }
        );
        console.log(`Updated ${result.modifiedCount} document(s).`);
        process.exit(0);
    } catch (error) {
        console.error('Error fixing Garen:', error);
        process.exit(1);
    }
}

fixGaren();
