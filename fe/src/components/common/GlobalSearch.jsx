import React from "react";
import { Search } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useGlobalSearch } from "./search/useGlobalSearch";
import { SearchInput } from "./search/SearchInput";
import { SearchSuggestions } from "./search/SearchSuggestions";
import { SearchResults } from "./search/SearchResults";

function GlobalSearch({ compact = false, showClose = false, onClose = null }) {
    const { tUI } = useTranslation();

    const {
        query, setQuery,
        results,
        isOpen, setIsOpen,
        selectedIndex, setSelectedIndex,
        isDataReady,
        isLoadingGuides,
        recentSearches, setRecentSearches,
        containerRef, inputRef, listRef,
        handleSelect, handleKeyDown
    } = useGlobalSearch(onClose);

    const grouped = results.reduce((acc, item) => {
        const k = item.category.key;
        if (!acc[k]) acc[k] = { meta: item.category, items: [] };
        acc[k].items.push(item);
        return acc;
    }, {});

    const hasResults = results.length > 0;
    const showEmpty = query.length >= 2 && !hasResults && !isLoadingGuides;

    return (
        <div ref={containerRef} className={`relative ${compact ? "w-full max-w-[400px]" : "w-full min-w-[240px] max-w-[320px] lg:max-w-[400px]"}`}>
            <SearchInput
                query={query}
                setQuery={setQuery}
                handleKeyDown={handleKeyDown}
                setIsOpen={setIsOpen}
                compact={compact}
                showClose={showClose}
                onClose={onClose}
                tUI={tUI}
                inputRef={inputRef}
            />

            {isOpen && (
                <div
                    className="absolute top-full mt-2 left-0 w-full
                        bg-[var(--color-modal-bg)] border border-[var(--color-border)]
                        rounded-xl shadow-2xl z-[9999] overflow-hidden"
                >
                    <div ref={listRef} className="max-h-[70vh] overflow-y-auto-scrollbar">
                        {query.length < 2 && (
                            <SearchSuggestions
                                recentSearches={recentSearches}
                                setRecentSearches={setRecentSearches}
                                handleSelect={handleSelect}
                                setQuery={setQuery}
                                inputRef={inputRef}
                                tUI={tUI}
                            />
                        )}

                        {showEmpty && (
                            <div className="py-8 text-center text-[var(--color-text-secondary)]">
                                <Search className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                <p className="text-sm">{tUI("globalSearch.noResults", { query })}</p>
                            </div>
                        )}

                        {!isDataReady && query.length >= 2 && !hasResults && (
                            <div className="py-6 text-center text-[var(--color-text-secondary)]">
                                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                                <p className="text-xs">Đang tải dữ liệu tìm kiếm...</p>
                            </div>
                        )}

                        {hasResults && (
                            <SearchResults
                                results={results}
                                grouped={grouped}
                                selectedIndex={selectedIndex}
                                setSelectedIndex={setSelectedIndex}
                                handleSelect={handleSelect}
                                tUI={tUI}
                            />
                        )}

                        {isLoadingGuides && query.length >= 2 && (
                            <div className="px-3 py-2 flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                                <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                                {tUI("globalSearch.searching")}
                            </div>
                        )}
                    </div>

                    {hasResults && (
                        <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 border-t border-[var(--color-border)] text-[10px] text-[var(--color-text-secondary)]">
                            <span>
                                <kbd className="px-1 py-0.5 rounded bg-[var(--color-surface-bg)] border border-[var(--color-border)] font-mono text-[9px] mr-0.5">↑↓</kbd>
                                điều hướng
                            </span>
                            <span>
                                <kbd className="px-1 py-0.5 rounded bg-[var(--color-surface-bg)] border border-[var(--color-border)] font-mono text-[9px] mr-0.5">↵</kbd>
                                {tUI("globalSearch.pressEnterHint")}
                            </span>
                            <span>
                                <kbd className="px-1 py-0.5 rounded bg-[var(--color-surface-bg)] border border-[var(--color-border)] font-mono text-[9px] mr-0.5">Esc</kbd>
                                {tUI("globalSearch.pressEscHint")}
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default GlobalSearch;
