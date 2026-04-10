// fe/src/hooks/useMarkupResolution.js
import { useState, useCallback } from "react";
import axios from "axios";
import { parseMarkup } from "../utils/markupParser";
import { initEntities, checkCache, markInvestigated } from "../utils/entityLookup";
import { useTranslation } from "./useTranslation";

const API_BASE = import.meta.env.VITE_API_URL;

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

        // Group IDs by type and filter out already cached ones
        const groups = tags.reduce((acc, tag) => {
            const type = tag.tagType;
            const id = tag.tagValue;
            
            // Nếu đã có trong cache rồi thì bỏ qua không nạp lại
            if (checkCache(id, type, language)) return acc;

            if (!acc[type]) acc[type] = new Set();
            acc[type].add(id);
            return acc;
        }, {});

        // Nếu tất cả đã có trong cache, không cần gọi API
        if (Object.keys(groups).length === 0) return;

        setResolving(true);
        try {
            const promises = [];

            // 1. Resolve Cards
            if (groups.cd || groups.card) {
                const cardIds = Array.from(new Set([
                    ...(groups.cd || []), 
                    ...(groups.card || [])
                ]));
                promises.push(
                    axios.post(`${API_BASE}/api/cards/resolve`, { ids: cardIds })
                        .then(res => {
                            if (res.data) initEntities(res.data, "cards");
                            cardIds.forEach(id => markInvestigated(id, "cd"));
                        })
                );
            }

            // 2. Resolve Champions
            if (groups.c || groups.champion) {
                const champIds = Array.from(new Set([...(groups.c || []), ...(groups.champion || [])]));
                promises.push(
                    axios.post(`${API_BASE}/api/champions/resolve`, { ids: champIds })
                        .then(res => {
                            if (res.data) initEntities(res.data, "champions");
                            champIds.forEach(id => markInvestigated(id, "c"));
                        })
                );
            }

            // 3. Resolve Powers
            if (groups.p || groups.power) {
                const powerIds = Array.from(new Set([...(groups.p || []), ...(groups.power || [])]));
                promises.push(
                    axios.post(`${API_BASE}/api/powers/resolve`, { ids: powerIds })
                        .then(res => {
                            if (res.data) initEntities(res.data, "powers");
                            powerIds.forEach(id => markInvestigated(id, "p"));
                        })
                );
            }

            // 4. Resolve Relics
            if (groups.r || groups.relic) {
                const relicIds = Array.from(new Set([...(groups.r || []), ...(groups.relic || [])]));
                promises.push(
                    axios.post(`${API_BASE}/api/relics/resolve`, { ids: relicIds })
                        .then(res => {
                            if (res.data) initEntities(res.data, "relics");
                            relicIds.forEach(id => markInvestigated(id, "r"));
                        })
                );
            }

            // 5. Resolve Items
            if (groups.i) {
                const itemIds = Array.from(groups.i);
                promises.push(
                    axios.post(`${API_BASE}/api/items/resolve`, { ids: itemIds })
                        .then(res => {
                            if (res.data) initEntities(res.data, "items");
                            itemIds.forEach(id => markInvestigated(id, "i"));
                        })
                );
            }

            // 6. Resolve Runes
            if (groups.rune) {
                const runeIds = Array.from(groups.rune);
                promises.push(
                    axios.post(`${API_BASE}/api/runes/resolve`, { ids: runeIds })
                        .then(res => {
                            if (res.data) initEntities(res.data, "runes");
                            runeIds.forEach(id => markInvestigated(id, "rune"));
                        })
                );
            }
            
            await Promise.all(promises);
        } catch (error) {
            console.warn("Failed to resolve markup entities dynamics:", error);
        } finally {
            setResolving(false);
        }
    }, [language]);

    return { resolveEntities, resolving };
};
