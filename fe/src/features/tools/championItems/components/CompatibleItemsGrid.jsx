import React from 'react';
import { ChevronRight, Trash2, Zap } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

const CompatibleItemsGrid = ({
  selectedItems,
  setSelectedItems,
  toggleItemSelection,
  compatibleItems
}) => {
  const { tUI } = useTranslation();

  return (
    <div className="xl:w-[380px] 2xl:w-[450px] h-[300px] sm:h-[400px] xl:h-auto bg-surface-bg/80 rounded-3xl border border-border/50 p-2 sm:p-6 flex flex-col shrink-0 overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="text-[10px] sm:text-xs font-bold text-text-secondary uppercase tracking-widest flex items-center gap-2">
          <ChevronRight className="w-3 h-3 text-primary-500" /> {tUI("bestSubChampion.vatPham")}
        </h3>
        {selectedItems.length > 0 && (
          <button 
            onClick={() => setSelectedItems([])} 
            className="flex items-center gap-1.5 text-[8px] sm:text-[9px] font-bold text-danger-500 hover:text-danger-400 transition-colors uppercase"
          >
            <Trash2 className="w-3 h-3" /> {tUI("bestSubChampion.xoa")} ({selectedItems.length})
          </button>
        )}
      </div>
      
      <div className="flex-grow overflow-y-auto pr-1 sm:pr-2-scrollbar">
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-4 2xl:grid-cols-5 gap-1.5 sm:gap-3">
          {compatibleItems.map(item => (
            <div 
              key={item.itemCode} 
              onClick={() => toggleItemSelection(item.itemCode)}
              className={`group relative aspect-square rounded-lg border transition-all duration-200 cursor-pointer ${
                selectedItems.includes(item.itemCode)
                  ? 'bg-primary-500/20 border-primary-500/40 ring-1 ring-primary-500/30'
                  : 'bg-surface-bg border-border/50 hover:border-border-hover'
              }`}
            >
              <div className="w-full h-full p-0 sm:p-1 flex items-center justify-center">
                <img src={item.assetAbsolutePath} alt="" className="w-full h-full object-contain group-hover:scale-105 transition-transform" />
              </div>
              {selectedItems.includes(item.itemCode) && (
                <div className="absolute -top-1 -left-1 bg-primary-500 rounded-full p-0.5 shadow-md">
                  <Zap className="w-2 sm:w-2.5 h-2 sm:h-2.5 text-text-primary fill-white" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompatibleItemsGrid;
