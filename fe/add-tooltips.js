import fs from 'fs';
import path from 'path';

const basePath = 'd:/ThePathOfChampionGuide/fe/src/locales';

const viPath = path.join(basePath, 'vi.json');
let viRaw = fs.readFileSync(viPath, 'utf8');
if (viRaw.charCodeAt(0) === 0xFEFF) viRaw = viRaw.slice(1);
const vi = JSON.parse(viRaw);

vi.championDetail.ratings.infoBtn = "Tìm hiểu thêm về các chỉ số";
vi.championDetail.ratings.infoModalTitle = "Ý Nghĩa 6 Tiêu Chí Đánh Giá";
vi.championDetail.ratings.criteriaDesc = {
    damage: {
        title: "1. Sát thương (Damage / Offense)",
        meaning: "Khả năng gây sát thương dứt điểm lên Nhà Chính (Burst/OTK) và khả năng hạ gục các đơn vị địch lớn.",
        radar: "Điểm cao (như Illaoi, Jinx) mũi nhọn sẽ đâm thẳng lên trên, thể hiện sức công phá khủng khiếp."
    },
    defense: {
        title: "2. An toàn & Phòng ngự (Safety / Defense)",
        meaning: "Khả năng sinh tồn qua nhiều trận đấu (Hồi máu, Làm choáng, Đóng băng, Khống chế bàn cờ).",
        radar: "Điểm cao (như Yasuo, Morgana, Gwen) cho thấy đây là một vị tướng \"sống dai\", ít rủi ro khi đối đầu Boss khó."
    },
    speed: {
        title: "3. Tốc độ & Nhịp độ (Speed / Tempo)",
        meaning: "Tốc độ triển khai đội hình (Mana thấp) và tốc độ hoàn thành ván đấu (Hoạt ảnh nhanh, thao tác dứt khoát).",
        radar: "Nhấn mạnh vào khả năng đánh phủ đầu (Aggro) ngay từ Lượt 1 hoặc 2."
    },
    consistency: {
        title: "4. Vận hành & Ổn định (Deck Flow / Consistency)",
        meaning: "Mức độ mượt mà của bộ bài khởi điểm. Tướng có khả năng tự rút bài, không bị kẹt mana và không phụ thuộc vào may rủi (RNG).",
        radar: "Điểm cao chứng tỏ bộ bài được thiết kế rất chặt chẽ, ít khi rơi vào tình trạng \"tay chết\" (brick hand)."
    },
    synergy: {
        title: "5. Tiềm năng Combo (Combo / Synergy)",
        meaning: "Khả năng tạo ra các chuỗi hiệu ứng liên hoàn giữa Tướng, Quyền Năng Sao và Cổ Vật.",
        radar: "Các tướng như Nilah, Master Yi hay Ekko sẽ có mũi nhọn này vươn xa, thể hiện lối chơi hoa mỹ và đột biến."
    },
    independence: {
        title: "6. Tính Độc lập (Independence)",
        meaning: "Khả năng bộ bài tự chiến thắng mà không cần rút được lá bài Tướng chính ra sân.",
        radar: "Điểm cao (như Norra) nghĩa là bộ bài tự vận hành rất tốt. Điểm thấp (như Evelynn, Ornn) cảnh báo người chơi rằng nếu tướng bị diệt hoặc không bốc được, tỷ lệ thua là rất cao."
    }
};

fs.writeFileSync(viPath, JSON.stringify(vi, null, 4), 'utf8');

const enPath = path.join(basePath, 'en.json');
let enRaw = fs.readFileSync(enPath, 'utf8');
if (enRaw.charCodeAt(0) === 0xFEFF) enRaw = enRaw.slice(1);
const en = JSON.parse(enRaw);

en.championDetail.ratings.infoBtn = "Learn more about these stats";
en.championDetail.ratings.infoModalTitle = "Understanding the 6 Playstyle Metrics";
en.championDetail.ratings.criteriaDesc = {
    damage: {
        title: "1. Offense (Damage)",
        meaning: "Ability to deal lethal burst damage to the Nexus (OTK) and take down large enemy units.",
        radar: "High scores (like Illaoi, Jinx) show massive destructive power."
    },
    defense: {
        title: "2. Defense (Safety)",
        meaning: "Survivability across encounters (Healing, Stuns, Frostbites, Board Control).",
        radar: "High scores (like Yasuo, Morgana, Gwen) indicate a resilient champion with low risk against tough Bosses."
    },
    speed: {
        title: "3. Speed (Tempo)",
        meaning: "Speed of board development (Low mana cost) and match completion (Fast animations, decisive actions).",
        radar: "Emphasizes the ability to overwhelm the enemy aggro-style from Turn 1 or 2."
    },
    consistency: {
        title: "4. Consistency (Deck Flow)",
        meaning: "The fluidity of the starting deck. Ability to draw cards, avoid mana bricks, and rely less on RNG.",
        radar: "High scores prove a tightly designed deck that rarely suffers from 'brick hands'."
    },
    synergy: {
        title: "5. Synergy (Combo)",
        meaning: "Ability to create chain effects between the Champion, Star Powers, and Relics.",
        radar: "Champions like Nilah, Master Yi, or Ekko excel here, showcasing a flashy and highly explosive playstyle."
    },
    independence: {
        title: "6. Independence",
        meaning: "The deck's capability to win without needing the main Champion card on the board.",
        radar: "High scores (like Norra) mean the deck functions well on its own. Low scores (like Evelynn, Ornn) warn that relying solely on the champion is risky."
    }
};

fs.writeFileSync(enPath, JSON.stringify(en, null, 4), 'utf8');

console.log("Updated translation files successfully");
