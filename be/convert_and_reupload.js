import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { S3Client, DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';

dotenv.config();

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
  }
});

const dir = 'd:/ThePathOfChampionGuide/be/uploadData/downloaded_powers';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.png'));

async function processImages() {
  for (const f of files) {
    const baseName = f.replace('.png', '');
    const webpName = `${baseName}.webp`;
    const p = path.join(dir, f);
    const pWebp = path.join(dir, webpName);
    
    // 1. Delete .png from bucket
    try {
      await s3.send(new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: `powers/${f}`
      }));
      console.log(`Deleted powers/${f} from R2`);
    } catch (e) {
      console.log(`Failed to delete powers/${f}: ${e.message}`);
    }

    // 2. Convert to WebP locally
    try {
      if (!fs.existsSync(pWebp)) {
        await sharp(p)
          .webp({ quality: 80 })
          .toFile(pWebp);
        console.log(`Converted ${f} to WebP`);
      }
    } catch (e) {
      console.log(`Failed to convert ${f} to WebP: ${e.message}`);
    }

    // 3. Upload .webp to bucket
    try {
      const body = fs.readFileSync(pWebp);
      await s3.send(new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: `powers/${webpName}`,
        Body: body,
        ContentType: 'image/webp'
      }));
      console.log(`Uploaded powers/${webpName} to R2`);
    } catch (e) {
      console.log(`Failed to upload powers/${webpName}: ${e.message}`);
    }
  }
}

processImages().then(() => console.log('All operations finished successfully')).catch(console.error);
