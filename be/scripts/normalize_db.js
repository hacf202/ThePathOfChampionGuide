import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import dns from 'dns';

// Fix querySrv ECONNREFUSED
dns.setServers(['8.8.8.8', '8.8.4.4']);

// Load .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI is not defined");

const dbName = process.env.MONGODB_DB_NAME || "guidePoc";
const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
});

const normalizeString = (str) => {
    if (!str || typeof str !== 'string') return '';
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase().trim();
};

const mapRarity = (val) => {
    const s = normalizeString(val);
    if (!s) return 'none';
    if (s === 'thuong' || s === 'common') return 'common';
    if (s === 'hiem' || s === 'rare') return 'rare';
    if (s === 'su thi' || s === 'epic') return 'epic';
    if (s === 'huyen thoai' || s === 'legendary') return 'legendary';
    if (s === 'dac biet' || s === 'special') return 'special';
    if (s === 'champion') return 'champion';
    if (s === 'none') return 'none';
    return s.replace(/[^a-z0-9]/g, '');
};

const mapRegion = (val) => {
    const s = normalizeString(val);
    if (!s) return null;
    if (s.includes('demacia')) return 'demacia';
    if (s.includes('noxus')) return 'noxus';
    if (s.includes('freljord')) return 'freljord';
    if (s.includes('ionia')) return 'ionia';
    if (s.includes('targon')) return 'targon';
    if (s.includes('shurima')) return 'shurima';
    if (s.includes('piltover') || s.includes('zaun')) return 'piltoverzaun';
    if (s.includes('quanao bong aem') || s.includes('quan ao bong aem') || s.includes('shadow isles') || s.includes('bong aem') || s.includes('quan dao bong dem')) return 'shadowisles';
    if (s.includes('thanh pho bandle') || s.includes('bandle city')) return 'bandlecity';
    if (s.includes('bilgewater')) return 'bilgewater';
    if (s.includes('runeterra')) return 'runeterra';
    if (s.includes('hoa linh luc aia') || s.includes('spirit blossom') || s.includes('hoa linh luc dia')) return 'spiritblossom';
    if (s.includes('trung lap') || s.includes('neutral')) return 'neutral';
    return s.replace(/[^a-z0-9]/g, '');
};

const mapType = (val) => {
    const s = normalizeString(val);
    if (!s) return null;
    if (s === 'tran' || s === 'signature') return 'signature';
    if (s === 'tieu thu' || s === 'consumable') return 'consumable';
    if (s === 'chung' || s === 'general') return 'general';
    if (s === 'chien dich' || s === 'campaign') return 'campaign';
    if (s === 'arcane power') return 'arcane';
    if (s === 'champion level power') return 'championlevel';
    return s.replace(/[^a-z0-9]/g, '');
};

async function run() {
    try {
        await client.connect();
        const db = client.db(dbName);
        console.log("✅ Connected to MongoDB");

        const collections = [
            'guidePocChampionList',
            'guidePocRelics',
            'guidePocItems',
            'guidePocPowers',
            'guidePocRunes',
            'guidePocCardList'
        ];

        let totalUpdated = 0;

        for (const colName of collections) {
            const col = db.collection(colName);
            const docs = await col.find({}).toArray();
            let updatedCount = 0;

            for (const doc of docs) {
                let changed = false;
                const updateQuery = { $set: {} };

                // 1. Rarity
                if (doc.rarity !== undefined) {
                    const newRarity = mapRarity(doc.rarity);
                    if (doc.rarity !== newRarity) {
                        updateQuery.$set.rarity = newRarity;
                        changed = true;
                    }
                }

                // 2. Type / ItemType
                if (doc.type !== undefined) {
                    const newType = mapType(doc.type);
                    if (doc.type !== newType) {
                        updateQuery.$set.type = newType;
                        changed = true;
                    }
                }
                if (doc.itemType !== undefined) {
                    const newType = mapType(doc.itemType);
                    if (doc.itemType !== newType) {
                        updateQuery.$set.itemType = newType;
                        changed = true;
                    }
                }

                // 3. Regions (Array or String)
                if (doc.regions !== undefined) {
                    if (Array.isArray(doc.regions)) {
                        const newRegions = doc.regions.map(mapRegion).filter(Boolean);
                        // Check if different
                        if (doc.regions.length !== newRegions.length || !doc.regions.every((r, i) => r === newRegions[i])) {
                            updateQuery.$set.regions = newRegions;
                            changed = true;
                        }
                    } else if (typeof doc.regions === 'string') {
                        const newRegion = mapRegion(doc.regions);
                        if (doc.regions !== newRegion) {
                            updateQuery.$set.regions = newRegion;
                            changed = true;
                        }
                    }
                }
                
                // Card specific 'region' field (Array or String)
                if (doc.region !== undefined) {
                    if (Array.isArray(doc.region)) {
                        const newRegion = doc.region.map(mapRegion).filter(Boolean);
                        if (doc.region.length !== newRegion.length || !doc.region.every((r, i) => r === newRegion[i])) {
                            updateQuery.$set.region = newRegion;
                            changed = true;
                        }
                    } else if (typeof doc.region === 'string') {
                        const newRegionStr = mapRegion(doc.region);
                        if (doc.region !== newRegionStr) {
                            updateQuery.$set.region = newRegionStr;
                            changed = true;
                        }
                    }
                }

                if (changed) {
                    await col.updateOne({ _id: doc._id }, updateQuery);
                    updatedCount++;
                }
            }
            console.log(`- Updated ${updatedCount} documents in ${colName}`);
            totalUpdated += updatedCount;
        }

        console.log(`✅ Finished! Total documents updated: ${totalUpdated}`);
        
        // Also flush redis cache so new values reflect immediately
        console.log("ℹ️ Make sure to restart backend server or flush Redis cache to see changes!");

    } catch (error) {
        console.error("Error updating DB:", error);
    } finally {
        await client.close();
    }
}

run();
