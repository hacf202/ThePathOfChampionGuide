import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { CATEGORIES, GUIDE_CATEGORY, MAX_PER_CATEGORY, API_URL, getSearchIndex, searchInIndex, _searchIndex } from "./searchConfig";

export function useGlobalSearch(onClose) {
    const navigate = useNavigate();

    const containerRef = useRef(null);
    const inputRef = useRef(null);
    const listRef = useRef(null);
    const guideTimer = useRef(null);

    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isDataReady, setIsDataReady] = useState(!!_searchIndex);
    const [isLoadingGuides, setIsLoadingGuides] = useState(false);

    const [recentSearches, setRecentSearches] = useState(() => {
        try {
            const saved = localStorage.getItem("poc_recent_searches");
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    // Fetch search index nhẹ khi browser rảnh
    useEffect(() => {
        if (_searchIndex) { setIsDataReady(true); return; }

        const doFetch = () => {
            getSearchIndex()
                .then(() => setIsDataReady(true))
                .catch(() => {
                    setTimeout(() => getSearchIndex().then(() => setIsDataReady(true)).catch(() => {}), 3000);
                });
        };

        if (typeof requestIdleCallback !== "undefined") {
            const id = requestIdleCallback(doFetch, { timeout: 3000 });
            return () => cancelIdleCallback(id);
        } else {
            const id = setTimeout(doFetch, 2000);
            return () => clearTimeout(id);
        }
    }, []);

    // Ctrl+K focus input
    useEffect(() => {
        const handler = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "k") {
                e.preventDefault();
                inputRef.current?.focus();
                inputRef.current?.select();
            }
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, []);

    // Đóng khi click ngoài
    useEffect(() => {
        const handler = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
                if (onClose) onClose();
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [onClose]);

    // Logic tìm kiếm
    useEffect(() => {
        if (query.length < 2) {
            setResults([]);
            clearTimeout(guideTimer.current);
            return;
        }

        const clientResults = [];
        for (const cat of CATEGORIES) {
            clientResults.push(...searchInIndex(_searchIndex, query, cat));
        }
        setResults(clientResults);
        setIsOpen(true);
        setSelectedIndex(0);

        clearTimeout(guideTimer.current);
        setIsLoadingGuides(true);
        guideTimer.current = setTimeout(async () => {
            try {
                const res = await axios.get(`${API_URL}/api/guides`, {
                    params: { search: query, limit: MAX_PER_CATEGORY },
                });
                const guides = (res.data?.items || res.data || []).slice(0, MAX_PER_CATEGORY);
                const guideResults = guides.map(g => ({
                    id: g.slug || g.id,
                    name: g.title || "",
                    category: GUIDE_CATEGORY,
                }));
                setResults(prev => [
                    ...prev.filter(r => r.category.key !== "guides"),
                    ...guideResults,
                ]);
            } catch { /* silent */ } finally {
                setIsLoadingGuides(false);
            }
        }, 300);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query, isDataReady]);

    // Scroll item vào view
    useEffect(() => {
        listRef.current
            ?.querySelector(`[data-index="${selectedIndex}"]`)
            ?.scrollIntoView({ block: "nearest" });
    }, [selectedIndex]);

    const handleSelect = useCallback((item) => {
        const toSave = { id: item.id, name: item.name, categoryKey: item.category.key };
        setRecentSearches(prev => {
            const nw = [toSave, ...prev.filter(x => !(x.id === toSave.id && x.categoryKey === toSave.categoryKey))].slice(0, 5);
            localStorage.setItem("poc_recent_searches", JSON.stringify(nw));
            return nw;
        });

        navigate(item.category.route(item.id));
        setIsOpen(false);
        setQuery("");
        inputRef.current?.blur();
    }, [navigate]);

    const handleKeyDown = (e) => {
        if (!isOpen) return;
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex(i => Math.min(i + 1, results.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex(i => Math.max(i - 1, 0));
        } else if (e.key === "Enter" && results[selectedIndex]) {
            e.preventDefault();
            handleSelect(results[selectedIndex]);
        } else if (e.key === "Escape") {
            setIsOpen(false);
            setQuery("");
            inputRef.current?.blur();
        }
    };

    return {
        query, setQuery,
        results, setResults,
        isOpen, setIsOpen,
        selectedIndex, setSelectedIndex,
        isDataReady,
        isLoadingGuides,
        recentSearches, setRecentSearches,
        containerRef, inputRef, listRef,
        handleSelect, handleKeyDown
    };
}
