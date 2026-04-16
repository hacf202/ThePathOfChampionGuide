// fe/src/hooks/useMarkupResolution.js
import { useState, useCallback } from "react";
import axios from "axios";
import { parseMarkup } from "../utils/markupParser";
import { initEntities, checkCache, markInvestigated, markPending, clearPending } from "../utils/entityLookup";
import { useTranslation } from "./useTranslation";

const API_BASE = import.meta.env.VITE_API_URL;

/**
 * GLOBAL REQUEST BATCHING SYSTEM
 * Thu thập tất cả yêu cầu resolve từ các component đang mount cùng lúc
 * và gửi duy nhất 1 yêu cầu gộp sau 50ms.
 */
let resolutionQueue = {
    cd: new Set(),
    c: new Set(),
    p: new Set(),
    r: new Set(),
    i: new Set(),
    rune: new Set()
};
let debounceTimer = null;

const processQueue = async (language) => {
    const categories = {
        cd: { ids: Array.from(resolutionQueue.cd), endpoint: "cards", type: "cards", mark: "cd" },
        c:  { ids: Array.from(resolutionQueue.c),  endpoint: "champions", type: "champions", mark: "c" },
        p:  { ids: Array.from(resolutionQueue.p),  endpoint: "powers", type: "powers", mark: "p" },
        r:  { ids: Array.from(resolutionQueue.r),  endpoint: "relics", type: "relics", mark: "r" },
        i:  { ids: Array.from(resolutionQueue.i),  endpoint: "items", type: "items", mark: "i" },
        rune: { ids: Array.from(resolutionQueue.rune), endpoint: "runes", type: "runes", mark: "rune" }
    };

    // Clear queue ngay lập tức để nhận đợt tiếp theo
    resolutionQueue = { cd: new Set(), c: new Set(), p: new Set(), r: new Set(), i: new Set(), rune: new Set() };
    debounceTimer = null;

    const promises = Object.values(categories)
        .filter(cat => cat.ids.length > 0)
        .map(cat => {
            return axios.post(`${API_BASE}/api/${cat.endpoint}/resolve`, { ids: cat.ids })
                .then(res => {
                    if (res.data) initEntities(res.data, cat.type);
                    cat.ids.forEach(id => markInvestigated(id, cat.mark));
                })
                .catch(err => {
                    console.error(`Failed to batch resolve ${cat.endpoint}:`, err);
                    // Nếu lỗi, xóa khỏi pending để có thể thử lại
                    cat.ids.forEach(id => clearPending(id, cat.mark));
                });
        });

    await Promise.all(promises);
};

/**
 * Hook quét text để tìm các thực thể markup và nạp chúng vào entityLookup cache nếu chưa có.
 */
export const useMarkupResolution = () => {
    const [resolving, setResolving] = useState(false);
    const { language } = useTranslation();

    const resolveEntities = useCallback(async (text) => {
        if (!text) return;

        const segments = parseMarkup(text);
        const tags = segments.filter(s => s.type === "tag");
        if (tags.length === 0) return;

        let hasNewIds = false;

        const addIdToQueue = (idVal, typeVal) => {
            if (!idVal) return;
            
            // Chuẩn hóa type
            const typeMap = { card: "cd", champion: "c", power: "p", relic: "r", item: "i" };
            const type = typeMap[typeVal] || typeVal;

            if (checkCache(idVal, type, language, true)) return;

            if (resolutionQueue[type]) {
                resolutionQueue[type].add(idVal);
                markPending(idVal, type);
                hasNewIds = true;
            }
        };

        tags.forEach(tag => {
            const type = tag.tagType;
            const id = tag.tagValue;
            
            // Thêm ID chính
            addIdToQueue(id, type);

            // Kiểm tra các item/relic trong options (nếu có)
            if (["cd", "card", "c", "champion"].includes(type) && tag.tagOptions) {
                tag.tagOptions.forEach(opt => {
                    const reserved = ["icon", "no-icon", "no-link", "only-icon", "img-full", "img-icon"];
                    if (!reserved.includes(opt.toLowerCase())) {
                        addIdToQueue(opt, "i");
                        addIdToQueue(opt, "r");
                    }
                });
            }
        });

        if (hasNewIds) {
            setResolving(true);
            if (debounceTimer) clearTimeout(debounceTimer);
            debounceTimer = setTimeout(async () => {
                await processQueue(language);
                setResolving(false);
            }, 50); // Đợi 50ms để gom nhóm từ các component khác
        }
    }, [language]);

    return { resolveEntities, resolving };
};
