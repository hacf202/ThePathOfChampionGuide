import { Search, X } from "lucide-react";

export function SearchInput({ 
    query, 
    setQuery, 
    handleKeyDown, 
    setIsOpen, 
    compact, 
    showClose, 
    onClose, 
    tUI, 
    inputRef 
}) {
    return (
        <div
            className={`flex items-center gap-2 clip-chamfer-sm border transition-all duration-200
                bg-[var(--tactical-card-bg)]
                border-[var(--tactical-card-border)]
                hover:border-[var(--tactical-accent-lime)]
                focus-within:border-[var(--tactical-accent-lime)]
                focus-within:shadow-[0_0_10px_rgba(210,255,40,0.25)]
                w-full ${compact ? "px-2 py-1" : "px-3 py-1.5"}
            `}
        >
            <Search className={`flex-shrink-0 text-[var(--tactical-text-dim)] ${compact ? "w-3.5 h-3.5" : "w-4 h-4"}`} />
            <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsOpen(true)}
                placeholder={compact ? "Tìm kiếm..." : tUI("globalSearch.placeholder")}
                className={`flex-1 bg-transparent text-[var(--tactical-text-main)] placeholder-[var(--tactical-text-dim)] outline-none min-w-0 font-mono-tech ${compact ? "text-xs" : "text-xs"}`}
                autoComplete="off"
                spellCheck="false"
                aria-label={tUI("globalSearch.ariaLabel")}
            />
            {query ? (
                <button
                    onClick={() => { setQuery(""); setIsOpen(false); }}
                    className="flex-shrink-0 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] -colors"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            ) : (
                <div className="flex items-center gap-1.5">
                    {!compact && (
                        <kbd className="hidden xl:inline-flex text-[10px] px-1 py-0.5 rounded font-mono opacity-40 bg-black/20 border border-white/10 flex-shrink-0 text-[var(--color-text-secondary)]">
                            Ctrl+K
                        </kbd>
                    )}
                    {showClose && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onClose) onClose();
                            }}
                            className="flex-shrink-0 text-[var(--color-text-secondary)] hover:text-red-400 -colors p-0.5 rounded-md hover:bg-white/5"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
