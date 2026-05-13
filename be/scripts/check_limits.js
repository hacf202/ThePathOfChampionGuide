import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import path from 'path';
import dns from 'dns';

// Ép Node.js sử dụng Google DNS để tránh lỗi querySrv ECONNREFUSED
dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config({ path: path.resolve('d:/ThePathOfChampionGuide/be/.env') });

async function checkMongoDB() {
    console.log('--- MONGODB STATS ---');
    const client = new MongoClient(process.env.MONGODB_URI);
    try {
        await client.connect();
        const db = client.db(process.env.MONGODB_DB_NAME);
        const stats = await db.command({ dbStats: 1, scale: 1024 * 1024 });
        
        const storageMB = (stats.storageSize || 0).toFixed(2);
        const limitMB = 512;
        const percent = ((storageMB / limitMB) * 100).toFixed(2);
        
        console.log(`Storage: ${storageMB} MB / ${limitMB} MB (${percent}%)`);
        console.log(`Collections: ${stats.collections}`);
        console.log(`Objects: ${stats.objects}`);
    } catch (e) {
        console.error('Error checking MongoDB:', e.message);
    } finally {
        await client.close();
    }
}

async function checkCloudflareR2() {
    console.log('\n--- CLOUDFLARE R2 STATS ---');
    const s3 = new S3Client({
        region: 'auto',
        endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId: process.env.R2_ACCESS_KEY_ID,
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
        },
    });

    try {
        let totalSize = 0;
        let totalFiles = 0;
        let isTruncated = true;
        let continuationToken;

        while (isTruncated) {
            const command = new ListObjectsV2Command({
                Bucket: process.env.R2_BUCKET_NAME,
                ContinuationToken: continuationToken,
            });

            const data = await s3.send(command);
            (data.Contents || []).forEach(item => {
                totalSize += item.Size;
                totalFiles += 1;
            });

            isTruncated = data.IsTruncated;
            continuationToken = data.NextContinuationToken;
        }

        const sizeMB = (totalSize / (1024 * 1024)).toFixed(2);
        const limitGB = 10;
        const limitMB = limitGB * 1024;
        const percent = ((sizeMB / limitMB) * 100).toFixed(2);

        console.log(`Storage: ${sizeMB} MB / ${limitMB} MB (${percent}%)`);
        console.log(`Files: ${totalFiles}`);
    } catch (e) {
        console.error('Error checking Cloudflare R2:', e.message);
    }
}

async function run() {
    await checkMongoDB();
    await checkCloudflareR2();
}

run();
