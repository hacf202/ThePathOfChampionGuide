import fs from 'fs';
import path from 'path';

const datacardDir = path.join(process.cwd(), 'be/datacard');
const cardListPath = path.join(datacardDir, 'cardList.json');

console.log('--- Đang xây dựng bản đồ tên lá bài -> mã (Name-to-Code mapping) ---');
console.log('Thư mục dữ liệu:', datacardDir);

const nameToCodeMap = {}; // name -> cardCode

// Đọc tất cả các tệp set*-en_us.json và set*-vi_vn.json để lấy map tên
const files = fs.readdirSync(datacardDir);
const setFiles = files.filter(f => f.startsWith('set') && f.endsWith('.json') && !f.includes('cardList'));

setFiles.forEach(file => {
    try {
        const filePath = path.join(datacardDir, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        data.forEach(card => {
            if (card.name && card.cardCode) {
                // Ưu tiên các lá bài collectible hoặc có độ hiếm cao nếu trùng tên
                if (!nameToCodeMap[card.name] || card.collectible) {
                    nameToCodeMap[card.name] = card.cardCode;
                }
            }
        });
    } catch (err) {
        console.error(`Lỗi khi đọc tệp ${file}:`, err);
    }
});

console.log(`Đã nạp ${Object.keys(nameToCodeMap).length} tên lá bài vào từ điển.`);

// Hàm xử lý markup cho một chuỗi văn bản
function processMarkup(text) {
    if (!text) return text;

    // Pattern 1: Tìm các thẻ [c:Tên] (cấu trúc cũ)
    // pattern: [c:Aatrox] -> [cd:06RU026|Aatrox|icon,img-full]
    let result = text.replace(/\[c:([^\]|]+)\]/g, (match, name) => {
        const code = nameToCodeMap[name];
        if (code) {
            return `[cd:${code}|${name}|icon,img-full]`;
        }
        return match; // Giữ nguyên nếu không tìm thấy mã
    });

    // Pattern 2: Tìm các thẻ [card:Tên] (nếu có)
    result = result.replace(/\[card:([^\]|]+)\]/g, (match, name) => {
        const code = nameToCodeMap[name];
        if (code) {
            return `[cd:${code}|${name}|icon,img-full]`;
        }
        return match;
    });

    // Pattern 3: Tìm các thẻ [cd:NAME] mà thiếu mã hoặc sai định dạng (tự động fix)
    // pattern: [cd:The Darkin Blade] -> [cd:06RU026T1|The Darkin Blade|icon,img-full]
    result = result.replace(/\[cd:([^\]|:]+)\]/g, (match, name) => {
        const code = nameToCodeMap[name];
        if (code) {
           return `[cd:${code}|${name}|icon,img-full]`;
        }
        return match;
    });

    return result;
}

console.log('--- Đang xử lý tệp cardList.json ---');

try {
    const cardList = JSON.parse(fs.readFileSync(cardListPath, 'utf8'));
    let updateCount = 0;

    cardList.forEach(card => {
        // Xử lý tiếng Việt (Mô tả chính)
        if (card.description) {
            const newDesc = processMarkup(card.description);
            if (newDesc !== card.description) {
                card.description = newDesc;
                updateCount++;
            }
        }

        // Xử lý tiếng Anh (Translations)
        if (card.translations?.en?.description) {
            const newDescEn = processMarkup(card.translations.en.description);
            if (newDescEn !== card.translations.en.description) {
                card.translations.en.description = newDescEn;
                updateCount++;
            }
        }
    });

    fs.writeFileSync(cardListPath, JSON.stringify(cardList, null, 1), 'utf8');
    console.log(`Đã cập nhật thành công ${updateCount} trường mô tả có chứa thẻ bài.`);

} catch (err) {
    console.error('Lỗi khi xử lý cardList.json:', err);
}

console.log('--- Hoàn tất ---');
