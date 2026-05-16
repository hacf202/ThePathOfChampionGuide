import sharp from "sharp";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BG_DIR = path.join(__dirname, "../bg");

async function checkSize() {
    try {
        const files = await fs.readdir(BG_DIR);
        const imageFiles = files.filter(file => 
            file.toLowerCase().endsWith(".png") || 
            file.toLowerCase().endsWith(".jpg") || 
            file.toLowerCase().endsWith(".jpeg")
        );

        let totalOriginalSize = 0;
        let totalWebpSize = 0;
        let count = 0;

        console.log(`Analyzing ${imageFiles.length} images...`);

        for (const file of imageFiles) {
            const filePath = path.join(BG_DIR, file);
            const stats = await fs.stat(filePath);
            totalOriginalSize += stats.size;

            // Get webp size without saving
            const webpBuffer = await sharp(filePath)
                .webp({ quality: 80 })
                .toBuffer();
            totalWebpSize += webpBuffer.length;
            
            count++;
            if (count % 50 === 0) {
                console.log(`Processed ${count}/${imageFiles.length}...`);
            }
        }

        const toMB = (bytes) => (bytes / (1024 * 1024)).toFixed(2);

        console.log("\n--- Kết quả kiểm tra dung lượng ---");
        console.log(`Tổng số tệp: ${imageFiles.length}`);
        console.log(`Tổng dung lượng gốc: ${toMB(totalOriginalSize)} MB`);
        console.log(`Tổng dung lượng WebP: ${toMB(totalWebpSize)} MB`);
        console.log(`Tiết kiệm được: ${toMB(totalOriginalSize - totalWebpSize)} MB (${((1 - totalWebpSize / totalOriginalSize) * 100).toFixed(2)}%)`);

    } catch (err) {
        console.error("Lỗi khi kiểm tra:", err);
    }
}

checkSize();
