import React from 'react';
import { ChevronRight, Search } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

const SubChampionRecommendations = ({
  selectedItems,
  bestSubChampions
}) => {
  const { tUI } = useTranslation();

  return (
    <div className="flex-grow bg-surface-bg rounded-3xl border border-border/50 p-2 sm:p-6 flex flex-col min-h-0 shadow-xl">
      <h3 className="text-[10px] sm:text-xs font-bold text-text-secondary uppercase tracking-widest flex items-center gap-2 mb-3 sm:mb-6 px-2">
        <ChevronRight className="w-3 h-3 text-primary-500" /> {tUI("bestSubChampion.goiYTuongPhuToiUu")}
      </h3>

      <div className="flex-grow overflow-y-auto pr-1 custom-scrollbar">
        {selectedItems.length === 0 ? (
          <div className="h-full min-h-[150px] flex flex-col items-center justify-center text-center opacity-40">
            <Search className="w-6 h-6 sm:w-8 sm:h-8 mb-4" />
            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-tighter">
              {tUI("bestSubChampion.chonItNhatMotVatPham")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 gap-2 sm:gap-4">
            {bestSubChampions.map((sub) => (
              <div key={sub.cardCode} className="group bg-surface-bg border border-border rounded-xl overflow-hidden hover:border-primary-500/50 transition-all flex flex-col shadow-lg">
                <div className="relative h-14 sm:h-24 overflow-hidden shrink-0">
                  <img 
                    src={sub.fullAbsolutePath} 
                    alt={sub.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60"
                    onError={(e) => { e.target.src = sub.cards[0]?.image; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-page-bg via-page-bg/40 to-transparent" />
                  <div className="absolute bottom-1 sm:bottom-2 left-2 sm:left-3 right-2 sm:right-3 flex justify-between items-end">
                    <div className="min-w-0">
                      <h4 className="text-[9px] sm:text-sm font-black text-text-primary uppercase tracking-wider drop-shadow-md truncate">
                        {sub.name}
                      </h4>
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                      <span className="text-[7px] sm:text-[8px] font-bold text-text-secondary uppercase leading-none mb-0.5">
                        {tUI("bestSubChampion.beVatPham")}: {sub.poolSize}
                      </span>
                      <span className="text-sm sm:text-xl font-black text-primary-400 drop-shadow-lg leading-none">
                        {Math.round(sub.score * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-1 sm:p-2 space-y-1 overflow-y-hidden max-h-18 sm:max-h-36 custom-scrollbar bg-page-bg/50">
                  {sub.cards.map((card, cIdx) => (
                    <div 
                      key={cIdx} 
                      className="flex items-center gap-1.5 sm:gap-2 p-0.5 sm:p-1 rounded-md bg-white/5 border border-transparent hover:border-white/10 transition-all"
                    >
                      <img 
                        src={card.image} 
                        alt={card.name} 
                        className="w-6 h-6 sm:w-8 sm:h-8 rounded object-contain bg-black/20"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[8px] sm:text-[10px] font-bold text-text-primary truncate uppercase leading-tight">{card.name}</p>
                        <p className="text-[7px] text-text-secondary uppercase leading-none">x{card.count || 1}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubChampionRecommendations;
