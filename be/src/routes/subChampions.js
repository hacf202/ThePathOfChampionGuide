// be/src/routes/subChampions.js
import express from 'express';
import { getDb } from "../config/mongo.js";
import { removeAccents } from "../utils/vietnameseUtils.js";
import cacheManager from "../utils/cacheManager.js";

const router = express.Router();
const SUB_CHAMPIONS_TABLE = "guidePocSubChampions";
const subChampionCache = cacheManager.getOrCreateCache("sub-champions", { stdTTL: 1800, checkperiod: 60 });

/**
 * @route   GET /api/sub-champions
 * @desc    Lấy danh sách các gói viện trợ tướng phụ từ MongoDB (có phân trang)
 */
router.get('/', async (req, res) => {
    try {
        const { searchTerm = "", page = 1, limit = 20 } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        
        const CACHE_KEY = "all_sub_champions";
        let allSubChamps = await subChampionCache.get(CACHE_KEY);

        if (!allSubChamps) {
            const db = getDb();
            allSubChamps = await db.collection(SUB_CHAMPIONS_TABLE).find({}).toArray();
            // Xóa _id từ MongoDB
            allSubChamps = allSubChamps.map(s => {
                const { _id, ...rest } = s;
                return rest;
            });
            await subChampionCache.set(CACHE_KEY, allSubChamps);
        }

        let filtered = [...allSubChamps];

        if (searchTerm) {
            const searchKey = removeAccents(searchTerm.toLowerCase());
            filtered = filtered.filter(s => {
                const name = removeAccents(s.name || "");
                const pkgName = removeAccents(s.packageName || "");
                return name.includes(searchKey) || pkgName.includes(searchKey);
            });
        }

        const total = filtered.length;
        const totalPages = Math.ceil(total / limitNum);
        const start = (pageNum - 1) * limitNum;
        const paginatedData = filtered.slice(start, start + limitNum);

        res.json({
            data: paginatedData,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages
            }
        });
    } catch (error) {
        console.error("Lỗi lấy danh sách tướng phụ:", error);
        res.status(500).json({ error: "Lỗi hệ thống khi truy vấn dữ liệu tướng phụ." });
    }
});

/**
 * @route   GET /api/sub-champions/:code
 * @desc    Lấy thông tin chi tiết một gói viện trợ tướng phụ
 */
router.get('/:code', async (req, res) => {
    try {
        const { code } = req.params;
        const CACHE_KEY = `sub_champion_${code}`;
        let subChamp = await subChampionCache.get(CACHE_KEY);

        if (!subChamp) {
            const db = getDb();
            subChamp = await db.collection(SUB_CHAMPIONS_TABLE).findOne({ cardCode: code });
            
            if (subChamp) {
                delete subChamp._id;
                await subChampionCache.set(CACHE_KEY, subChamp);
            }
        }

        if (!subChamp) {
            return res.status(404).json({ error: "Không tìm thấy tướng phụ." });
        }
        
        res.json(subChamp);
    } catch (error) {
        console.error("Lỗi lấy chi tiết tướng phụ:", error);
        res.status(500).json({ error: "Lỗi hệ thống." });
    }
});

export default router;
