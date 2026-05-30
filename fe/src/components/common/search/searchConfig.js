import {
    Swords, Sparkles, Zap, Package,
    Gem, BookOpen, BookMarked, Skull, Compass
} from "lucide-react";
import { removeAccents } from "@/utils/vietnameseUtils";
import axios from "axios";

export const MAX_PER_CATEGORY = 4;
export const API_URL = import.meta.env.VITE_API_URL;

export const GUIDE_CATEGORY = {
    key: "guides",
    labelKey: "globalSearch.categoryGuide",
    icon: BookMarked,
    route: (id) => `/guides/${id}`,
    color: "text-rose-400",
    bgColor: "bg-rose-400/10",
    borderColor: "border-rose-400/20",
};

export const CATEGORIES = [
    { key: "adventures",labelKey: "globalSearch.categoryAdventure",icon: Compass,   route: (id) => `/map/${id}`,      color: "text-emerald-400",bgColor: "bg-emerald-400/10",borderColor: "border-emerald-400/20" },
    { key: "champions", labelKey: "globalSearch.categoryChampion", icon: Swords,    route: (id) => `/champion/${id}`, color: "text-yellow-400", bgColor: "bg-yellow-400/10", borderColor: "border-yellow-400/20" },
    { key: "bosses",    labelKey: "globalSearch.categoryBoss",     icon: Skull,     route: (id) => `/boss/${id}`,     color: "text-red-500",    bgColor: "bg-red-500/10",    borderColor: "border-red-500/20" },
    { key: "relics",    labelKey: "globalSearch.categoryRelic",    icon: Sparkles,  route: (id) => `/relic/${id}`,    color: "text-purple-400", bgColor: "bg-purple-400/10", borderColor: "border-purple-400/20" },
    { key: "powers",    labelKey: "globalSearch.categoryPower",    icon: Zap,       route: (id) => `/power/${id}`,    color: "text-blue-400",   bgColor: "bg-blue-400/10",   borderColor: "border-blue-400/20" },
    { key: "items",     labelKey: "globalSearch.categoryItem",     icon: Package,   route: (id) => `/item/${id}`,     color: "text-green-400",  bgColor: "bg-green-400/10",  borderColor: "border-green-400/20" },
    { key: "runes",     labelKey: "globalSearch.categoryRune",     icon: Gem,       route: (id) => `/rune/${id}`,     color: "text-cyan-400",   bgColor: "bg-cyan-400/10",   borderColor: "border-cyan-400/20" },
    { key: "cards",     labelKey: "globalSearch.categoryCard",     icon: BookOpen,  route: (id) => `/card/${id}`,     color: "text-orange-400", bgColor: "bg-orange-400/10", borderColor: "border-orange-400/20" },
    { key: "resources", labelKey: "globalSearch.categoryResource", icon: Gem,       route: (id) => `/resource/${id}`, color: "text-amber-400",  bgColor: "bg-amber-400/10",  borderColor: "border-amber-400/20" },
];

export const norm = (str) => removeAccents((str || "").toLowerCase().trim());

export function searchInIndex(index, query, cat) {
    const q = norm(query);
    if (!q || !index?.[cat.key]) return [];
    return index[cat.key]
        .filter(item => norm(item.nameVi).includes(q) || norm(item.nameEn).includes(q) || norm(String(item.id || "")).includes(q))
        .slice(0, MAX_PER_CATEGORY)
        .map(item => ({ id: item.id, name: item.nameVi || item.nameEn, category: cat }));
}

// Search index cache toàn cục (module-level singleton)
export let _searchIndex = null;
let _fetchPromise = null;

export async function getSearchIndex() {
    if (_searchIndex) return _searchIndex;
    if (_fetchPromise) return _fetchPromise;

    _fetchPromise = axios
        .get(`${API_URL}/api/search/index`)
        .then(res => {
            _searchIndex = res.data;
            _fetchPromise = null;
            return _searchIndex;
        })
        .catch(err => {
            _fetchPromise = null;
            throw err;
        });

    return _fetchPromise;
}
