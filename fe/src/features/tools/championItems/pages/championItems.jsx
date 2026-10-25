import React from 'react';
import { Zap } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useChampionItems } from '@/hooks/useChampionItems';
import ChampionItemsSidebar from '@/features/tools/championItems/components/ChampionItemsSidebar';
import ChampionProfileBar from '@/features/tools/championItems/components/ChampionProfileBar';
import CompatibleItemsGrid from '@/features/tools/championItems/components/CompatibleItemsGrid';
import SubChampionRecommendations from '@/features/tools/championItems/components/SubChampionRecommendations';
import { getRarityKey } from '@/utils/i18nHelpers';

const ChampionItems = () => {
  const { tUI } = useTranslation();
  
  // Custom hook manages all state, fetching and calculations
  const {
    searchTerm,
    setSearchTerm,
    loading,
    selectedChampion,
    setSelectedChampion,
    championDetails,
    selectedItems,
    setSelectedItems,
    selectedRarity,
    setSelectedRarity,
    filteredChampions,
    compatibleItems,
    toggleItemSelection,
    bestSubChampions
  } = useChampionItems();

  return (
    <div className="w-full min-h-screen lg:h-[calc(100vh-72px)] bg-[var(--tactical-page-bg)] text-text-primary overflow-y-auto lg:overflow-hidden flex flex-col p-2 sm:p-4 gap-4 relative z-0">
      
      {/* Unified Header */}
      <header className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 tactical-panel clip-chamfer bg-[var(--tactical-panel-bg)] border border-[var(--tactical-card-border)] px-4 sm:px-6 py-3 sm:py-4 shrink-0 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-5 bg-[var(--tactical-accent-lime)] shadow-[0_0_8px_var(--tactical-accent-lime)]" />
          <h1 className="text-lg sm:text-xl font-display font-bold uppercase tracking-wider text-[var(--tactical-accent-lime)]">
            {tUI("nav.championItems") === "nav.championItems" ? "VẬT PHẨM CHO TƯỚNG" : tUI("nav.championItems")}
          </h1>
        </div>

        <div className="tactical-box clip-chamfer-sm flex items-center gap-1 sm:gap-2 bg-[var(--tactical-inner-box)] p-1 border border-[var(--tactical-card-border)] overflow-x-auto-scrollbar no-scrollbar-mobile">
          {['All', 'Thường', 'Hiếm', 'Sử Thi'].map(r => {
            let label = r;
            if (r === 'All') label = tUI("common.all") || "Tất cả";
            else label = tUI(`shared.rarity.${getRarityKey(r)}`) || r;

            return (
              <button
                key={r}
                onClick={() => setSelectedRarity(r)}
                className={`px-3 sm:px-4 py-1 sm:py-1.5 clip-chamfer-sm text-[10px] sm:text-xs font-mono-tech font-bold transition-all whitespace-nowrap uppercase tracking-wider ${
                  selectedRarity === r
                    ? 'bg-[var(--tactical-accent-lime)] text-[var(--tactical-accent-lime-fg)] shadow-[0_0_10px_rgba(210,255,40,0.3)]'
                    : 'text-text-secondary hover:text-[var(--tactical-accent-lime)]'
                }`}
              >
                {label.toUpperCase()}
              </button>
            );
          })}
        </div>
      </header>

      {/* Dashboard Body */}
      <div className="flex-grow flex flex-col lg:flex-row gap-4 min-h-0 relative">
        
        <ChampionItemsSidebar 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          loading={loading}
          filteredChampions={filteredChampions}
          selectedChampion={selectedChampion}
          setSelectedChampion={setSelectedChampion}
        />

        {/* Content Area */}
        <div className="flex-grow flex flex-col gap-4 min-h-0">
          {!selectedChampion ? (
            <div className="flex-grow tactical-panel clip-chamfer bg-[var(--tactical-inner-box)]/50 border border-dashed border-[var(--tactical-card-border)] flex flex-col items-center justify-center text-text-secondary">
              <Zap className="w-12 h-12 mb-4 text-[var(--tactical-accent-lime)] opacity-30 drop-shadow-[0_0_8px_var(--tactical-accent-lime)]" />
              <p className="font-mono-tech font-bold tracking-widest uppercase text-xs sm:text-sm text-[var(--tactical-accent-lime)]">
                {tUI("bestSubChampion.selectMainFirst")}
              </p>
            </div>
          ) : (
            <div className="flex-grow flex flex-col gap-4 min-h-0">
              
              <ChampionProfileBar championDetails={championDetails} />

              {/* Grid Panels */}
              <div className="flex-grow flex flex-col xl:flex-row gap-4 min-h-0">
                
                <CompatibleItemsGrid 
                  selectedItems={selectedItems}
                  setSelectedItems={setSelectedItems}
                  toggleItemSelection={toggleItemSelection}
                  compatibleItems={compatibleItems}
                />

                <SubChampionRecommendations 
                  selectedItems={selectedItems}
                  bestSubChampions={bestSubChampions}
                />

              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChampionItems;
