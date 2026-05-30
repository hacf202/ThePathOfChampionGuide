import React from 'react';
import { Zap } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useChampionItems } from '@/hooks/useChampionItems';
import ChampionItemsSidebar from '@/features/tools/championItems/components/ChampionItemsSidebar';
import ChampionProfileBar from '@/features/tools/championItems/components/ChampionProfileBar';
import CompatibleItemsGrid from '@/features/tools/championItems/components/CompatibleItemsGrid';
import SubChampionRecommendations from '@/features/tools/championItems/components/SubChampionRecommendations';

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
    <div className="w-full min-h-screen lg:h-[calc(100vh-72px)] bg-page-bg text-text-primary font-secondary overflow-y-auto lg:overflow-hidden flex flex-col p-2 sm:p-4 gap-4 relative z-0">
      
      {/* Unified Header */}
      <header className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-bg px-4 sm:px-6 py-3 sm:py-4 rounded-2xl border border-border/50 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-lg sm:text-xl font-primary font-bold tracking-wide">
              {tUI("nav.championItems") === "nav.championItems" ? "VẬT PHẨM CHO TƯỚNG" : tUI("nav.championItems")}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 bg-surface-bg/50 p-1 rounded-xl border border-border/50 overflow-x-auto-scrollbar no-scrollbar-mobile">
          {['All', 'Thường', 'Hiếm', 'Sử Thi'].map(r => {
            let label = r;
            if (r === 'All') label = tUI("common.all") || "Tất cả";
            else if (r === 'Thường') label = tUI("shared.rarity.thuong");
            else if (r === 'Hiếm') label = tUI("shared.rarity.hiem");
            else if (r === 'Sử Thi') label = tUI("shared.rarity.suthi");

            return (
              <button
                key={r}
                onClick={() => setSelectedRarity(r)}
                className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg text-[9px] sm:text-[10px] font-bold transition-all whitespace-nowrap ${
                  selectedRarity === r
                    ? 'bg-primary-600 text-text-primary shadow-lg shadow-primary-900/20'
                    : 'text-text-secondary hover:text-text-primary'
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
            <div className="flex-grow bg-surface-hover/30 rounded-3xl border border-dashed border-border flex flex-col items-center justify-center text-text-secondary">
              <Zap className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-primary font-bold tracking-widest uppercase text-sm">
                {tUI("bestSubChampion.vuiLongChonTuongChinhTruoc")}
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
