import { ChevronRight, Search } from "lucide-react";

export function SearchResults({
    results,
    grouped,
    selectedIndex,
    setSelectedIndex,
    handleSelect,
    tUI
}) {
    return (
        <>
            {Object.values(grouped).map(({ meta, items }) => {
                const Icon = meta.icon;
                return (
                    <div key={meta.key}>
                        <div className="flex items-center gap-1.5 px-3 pt-3 pb-1">
                            <Icon className={`w-3 h-3 ${meta.color}`} />
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${meta.color}`}>
                                {tUI(meta.labelKey)}
                            </span>
                        </div>
                        {items.map((item) => {
                            const globalIdx = results.indexOf(item);
                            const isSel = globalIdx === selectedIndex;
                            return (
                                <button
                                    key={`${meta.key}-${item.id}`}
                                    data-index={globalIdx}
                                    onClick={() => handleSelect(item)}
                                    onMouseEnter={() => setSelectedIndex(globalIdx)}
                                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-left -colors duration-100
                                        ${isSel
                                            ? `${meta.bgColor} text-[var(--color-text-primary)]`
                                            : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]"
                                        }`}
                                >
                                    <span className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${meta.bgColor} border ${meta.borderColor}`}>
                                        <Icon className={`w-3 h-3 ${meta.color}`} />
                                    </span>
                                    <span className="text-sm font-medium truncate flex-1">{item.name}</span>
                                    {isSel && <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 ${meta.color}`} />}
                                </button>
                            );
                        })}
                    </div>
                );
            })}
        </>
    );
}
