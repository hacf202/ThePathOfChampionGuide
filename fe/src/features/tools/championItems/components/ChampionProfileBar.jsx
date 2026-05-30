import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';

const ChampionProfileBar = ({ championDetails }) => {
  const { tUI } = useTranslation();

  return (
    <div className="bg-surface-bg backdrop-blur-sm rounded-3xl border border-border/50 p-2 sm:p-4 flex items-center gap-4 shrink-0 shadow-lg">
      <div className="relative">
        <img 
          src={championDetails?.avatar} 
          alt={championDetails?.name} 
          className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl object-cover ring-2 ring-primary-500/50" 
        />
      </div>
      <div className="flex-grow min-w-0">
        <h2 className="text-sm sm:text-xl font-black text-text-primary uppercase tracking-tighter truncate">
          {championDetails?.name}
        </h2>
        <div className="flex items-center gap-2 mt-0.5 sm:mt-1">
          <span className="text-[8px] sm:text-[10px] font-bold text-text-secondary uppercase tracking-widest">
            {tUI("bestSubChampion.nangLuong")}: {championDetails?.cost}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChampionProfileBar;
