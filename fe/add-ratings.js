import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const viPath = path.join(__dirname, "src/locales/vi.json");
let raw = fs.readFileSync(viPath, "utf8");
if (raw.charCodeAt(0) === 0xFEFF) {
  raw = raw.slice(1);
}
const vi = JSON.parse(raw);

if (!vi.championDetail.ratings) {
  vi.championDetail.ratings = {
    title: "Chỉ số Đánh giá",
    damage: "Sát thương",
    defense: "Phòng ngự",
    speed: "Tốc độ",
    consistency: "Ổn định",
    synergy: "Combo",
    independence: "Tính Độc lập",
    note: "Ghi chú Lối chơi"
  };
  fs.writeFileSync(viPath, JSON.stringify(vi, null, 4), "utf8");
  console.log("Updated vi.json successfully");
} else {
  console.log("ratings already exist in vi.json");
}
