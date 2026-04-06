import { useState, useCallback } from "react";
import axios from "axios";
import { parseMarkup } from "../utils/markupParser";
import { initEntities } from "../utils/entityLookup";

const API_BASE = import.meta.env.VITE_API_URL;

/**
 * Hook quét text để tìm các thực thể markup và nạp chúng vào entityLookup cache
 */
export const useMarkupResolution = () => {
    const [resolving, setResolving] = useState(false);

    const resolveEntities = useCallback(async (text) => {
        if (!text) return;

        const segments = parseMarkup(text);
        const tags = segments.filter(s => s.type === "tag");
        if (tags.length === 0) return;

        // Group IDs by type
        const groups = tags.reduce((acc, tag) => {
            const type = tag.tagType;
            const id = tag.tagValue;
            if (!acc[type]) acc[type] = new Set();
            acc[type].add(id);
            return acc;
        }, {});

        setResolving(true);
        try {
            const promises = [];

            // 1. Resolve Cards
            if (groups.cd || groups.card) {
                const cardIds = Array.from(new Set([...(groups.cd || []), ...(groups.card || [])]));
                promises.push(
                    axios.post(`${API_BASE}/api/cards/resolve`, { ids: cardIds })
                        .then(res => {
                            if (res.data) initEntities(res.data);
                        })
                );
            }

            // 2. Resolve Powers
            if (groups.p || groups.power) {
                const powerIds = Array.from(new Set([...(groups.p || []), ...(groups.power || [])]));
                promises.push(
                    axios.post(`${API_BASE}/api/powers/resolve`, { ids: powerIds })
                        .then(res => {
                            // powers are usually already in bundle, but we can inject them if needed
                            // initEntities(res.data, "power"); // Need to update entityLookup to support this
                        })
                );
            }

            // Currently our backend and entityLookup focus heavily on Cards for dynamic resolution
            // because other entities (Powers, Relics) are mostly bundled in assets/data/poc/*.json
            
            await Promise.all(promises);
        } catch (error) {
            console.warn("Failed to resolve markup entities:", error);
        } finally {
            setResolving(false);
        }
    }, []);

    return { resolveEntities, resolving };
};
