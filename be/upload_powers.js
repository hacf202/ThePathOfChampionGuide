import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

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
const files = fs.readdirSync(dir);

async function upload() {
  for(const f of files) {
    const p = path.join(dir, f);
    const body = fs.readFileSync(p);
    await s3.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: `powers/${f}`,
      Body: body,
      ContentType: 'image/png'
    }));
    console.log('Uploaded ' + f);
  }
}

upload().then(() => console.log('All done')).catch(console.error);
