import { CATEGORIES, GUIDE_CATEGORY } from "./searchConfig";

export function SearchSuggestions({ 
    recentSearches, 
    setRecentSearches, 
    handleSelect, 
    setQuery, 
    inputRef, 
    tUI 
}) {
    return (
        <div className="py-2">
            <div className="px-3 py-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-secondary)]">
                <span>{recentSearches.length > 0 ? (tUI("globalSearch.recent") || "Tìm kiếm gần đây") : (tUI("globalSearch.popular") || "Gợi ý phổ biến")}</span>
                {recentSearches.length > 0 && (
                    <button 
                        onClick={() => { setRecentSearches([]); localStorage.removeItem("poc_recent_searches"); }} 
                        className="hover:text-red-400 -colors"
                    >
                        {tUI("common.clear") || "Xóa"}
                    </button>
                )}
            </div>
            
            {recentSearches.length > 0 ? (
                recentSearches.map(rs => {
                    const cat = CATEGORIES.find(c => c.key === rs.categoryKey) || GUIDE_CATEGORY;
                    const Icon = cat.icon;
                    return (
                        <button
                            key={`recent-${cat.key}-${rs.id}`}
                            onClick={() => handleSelect({ id: rs.id, category: cat, name: rs.name })}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-left -colors duration-100 text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]"
                        >
                            <span className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${cat.bgColor} border ${cat.borderColor}`}>
                                <Icon className={`w-3 h-3 ${cat.color}`} />
                            </span>
                            <span className="text-sm font-medium truncate flex-1">{rs.name}</span>
                        </button>
                    );
                })
            ) : (
                <div className="px-3 py-2 pb-3">
                    <div className="flex flex-wrap gap-2">
                        {["Aurelion Sol", "Lissandra", "Swain", "Jinx", "Yasuo", "Noxus"].map(sug => (
                            <button 
                                key={sug}
                                onClick={() => { setQuery(sug); inputRef.current?.focus(); }}
                                className="px-2.5 py-1 text-xs rounded-lg bg-[var(--color-surface-hover)] hover:bg-[var(--color-primary-500)]/20 hover:text-[var(--color-primary-400)] text-[var(--color-text-secondary)] -colors border border-[var(--color-border)] hover:border-[var(--color-primary-500)]/40"
                            >
                                {sug}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
