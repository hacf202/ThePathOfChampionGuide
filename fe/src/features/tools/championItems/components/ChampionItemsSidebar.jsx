import React from 'react';
import { Search } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

const ChampionItemsSidebar = ({
  searchTerm,
  setSearchTerm,
  loading,
  filteredChampions,
  selectedChampion,
  setSelectedChampion
}) => {
  const { tUI } = useTranslation();

  return (
    <div className="lg:w-64 flex flex-col gap-3 sm:gap-4 shrink-0 h-[300px] sm:h-[400px] lg:h-full min-h-0 transition-all duration-300">
      <div className="relative group">
        <input
          type="text"
          placeholder={tUI("bestSubChampion.timKiemTuong")}
          className="w-full bg-surface-bg border border-border rounded-xl pl-10 pr-4 py-2 sm:py-2.5 text-xs focus:outline-none focus:border-primary-500/50 transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-primary-500 transition-colors" />
      </div>

      <div className="flex-grow bg-surface-hover/30 rounded-2xl border border-border/50 overflow-hidden flex flex-col">
        <div className="overflow-y-auto flex-grow p-2 space-y-1-scrollbar">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-primary-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
            </div>
          ) : (
            filteredChampions.map(champ => (
              <button
                key={champ.championID}
                onClick={() => setSelectedChampion(champ)}
                className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all group relative ${
                  selectedChampion?.championID === champ.championID
                    ? 'bg-primary-500/10 border border-primary-500/20 text-primary-400'
                    : 'hover:bg-surface-hover/50 border border-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                <img 
                  src={champ.assets?.[0]?.avatar} 
                  alt={champ.name} 
                  className={`w-7 h-7 rounded-md object-cover ${selectedChampion?.championID === champ.championID ? 'ring-1 ring-primary-500' : 'grayscale-[0.4]'}`} 
                />
                <span className="font-bold text-[10px] truncate uppercase">{champ.name}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ChampionItemsSidebar;
