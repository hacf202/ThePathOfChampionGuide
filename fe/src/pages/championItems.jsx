import React, { useState, useMemo, useEffect } from 'react';
import itemData from '../assets/data/filteredPocItems.json';
import { useTranslation } from '../hooks/useTranslation';
import { Search, Trash2, Zap, Info, ChevronRight, LayoutPanelLeft } from 'lucide-react';

const ChampionItems = () => {
  const { tUI } = useTranslation();
  const [champions, setChampions] = useState([]);
  const [subChampions, setSubChampions] = useState([]); // Dynamic sub-champion data
  const [selectedChampion, setSelectedChampion] = useState(null);
  const [championDetails, setChampionDetails] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedRarity, setSelectedRarity] = useState('All');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Fetch all champions and sub-champions on mount
  useEffect(() => {
    const backendUrl = import.meta.env.VITE_API_URL;

    const fetchChampions = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${backendUrl}/api/champions?limit=-1`);
        const data = await response.json();
        const sortedChamps = (data.items || []).sort((a, b) => a.name.localeCompare(b.name));
        setChampions(sortedChamps);
      } catch (error) {
        console.error('Error fetching champions:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchSubChampions = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/sub-champions?limit=1000`);
        const data = await response.json();
        setSubChampions(data.data || []);
      } catch (error) {
        console.error('Error fetching sub-champions:', error);
      }
    };

    fetchChampions();
    fetchSubChampions();
  }, []);

  // Fetch champion details when selected
  useEffect(() => {
    setSelectedItems([]);
    if (!selectedChampion) {
      setChampionDetails(null);
      return;
    }

    const fetchDetails = async () => {
      if (!selectedChampion.cardCode) {
        setChampionDetails({
          ...selectedChampion,
          isMissingCode: true,
          cost: selectedChampion.cost || 0,
          keywords: [],
          enKeywords: [],
          subtypes: [],
          avatar: selectedChampion.assets?.[0]?.avatar || ''
        });
        setDetailsLoading(false);
        return;
      }

      setDetailsLoading(true);
      try {
        const backendUrl = import.meta.env.VITE_API_URL;
        const timestamp = new Date().getTime();
        const response = await fetch(`${backendUrl}/api/cards/${selectedChampion.cardCode}?t=${timestamp}`);
        if (!response.ok) throw new Error('Card not found');
        const cardInfo = await response.json();

        const normalize = (val) => {
          if (Array.isArray(val)) return val;
          if (typeof val === 'string' && val.trim()) return [val.trim()];
          return [];
        };

        setChampionDetails({
          ...selectedChampion,
          name: cardInfo.cardName || selectedChampion.name,
          cost: cardInfo.cost !== undefined ? cardInfo.cost : (selectedChampion.cost || 0),
          keywords: normalize(cardInfo.keywords),
          enKeywords: normalize(cardInfo.translations?.en?.keywords),
          subtypes: normalize(cardInfo.subtypes),
          avatar: cardInfo.gameAbsolutePath || selectedChampion.assets?.[0]?.avatar || ''
        });
      } catch (error) {
        console.error('Error fetching card details:', error);
        setChampionDetails({
          ...selectedChampion,
          cost: selectedChampion.cost || 0,
          keywords: [],
          enKeywords: [],
          subtypes: [],
          avatar: selectedChampion.assets?.[0]?.avatar || ''
        });
      } finally {
        setDetailsLoading(false);
      }
    };
    fetchDetails();
  }, [selectedChampion]);

  const filteredChampions = champions.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const positiveKeywords = [
    "Tough", "Challenger", "Elusive", "Overwhelm", "Quick Attack", 
    "Lifesteal", "Regeneration", "Fury", "SpellShield", "Augment", 
    "Impact", "Fated", "Formidable", "Hallowed", "Brash", "Double Attack"
  ];

  const checkCompatibility = (champ, item) => {
    if (selectedRarity !== 'All' && item.rarity !== selectedRarity) return false;
    const logic = item.logic;
    if (!logic) return true;
    if (logic.type && logic.type.length > 0) {
      const compatibleTypes = ["Unit Items", "General Items", "Special Items"];
      const isCompatibleType = logic.type.some(t => compatibleTypes.includes(t));
      if (!isCompatibleType) return false;
    }
    if (logic.cannotBeChampion) return false;
    if (logic.minCost !== null && champ.cost < logic.minCost) return false;
    if (logic.maxCost !== null && champ.cost > logic.maxCost) return false;
    if (logic.forbiddenKeywords && logic.forbiddenKeywords.length > 0) {
      const hasForbidden = logic.forbiddenKeywords.some(fk => champ.enKeywords?.includes(fk));
      if (hasForbidden) return false;
    }
    if (logic.requiresSubtype && (!champ.subtypes || champ.subtypes.length === 0)) return false;
    if (logic.requiresPositiveKeyword) {
      const hasPositive = champ.enKeywords?.some(k => positiveKeywords.includes(k));
      if (!hasPositive) return false;
    }
    return true;
  };

  const compatibleItems = useMemo(() => {
    if (!championDetails) return [];
    return itemData.filter(item => checkCompatibility(championDetails, item));
  }, [championDetails, selectedRarity]);

  const toggleItemSelection = (itemCode) => {
    setSelectedItems(prev => 
      prev.includes(itemCode) 
        ? prev.filter(code => code !== itemCode) 
        : [...prev, itemCode]
    );
  };

  const bestSubChampions = useMemo(() => {
    if (selectedItems.length === 0 || !selectedChampion || !championDetails) return [];
    
    // Lấy danh sách toàn bộ vật phẩm mà tướng chính có thể mang (không lọc theo Rarity đang chọn để tính pool chuẩn)
    const mainChampPool = itemData
      .filter(item => checkCompatibility(championDetails, item))
      .map(i => i.itemCode);

    return subChampions
      .filter(sub => sub.name.toLowerCase() !== selectedChampion.name.toLowerCase()) 
      .map(sub => {
        const subItems = sub["Vật phẩm tương thích"] || sub["comfortableItems"] || [];
        
        // Giao điểm: Các vật phẩm mà CẢ TƯỚNG CHÍNH VÀ TƯỚNG PHỤ đều phù hợp
        const intersection = mainChampPool.filter(code => subItems.includes(code));
        
        // Các vật phẩm mong muốn nằm trong giao điểm đó
        const matched = selectedItems.filter(code => intersection.includes(code));
        
        // Tính toán tỉ lệ: (Số vật phẩm mong muốn) / (Tổng số vật phẩm có thể ra trong pool)
        // Nếu intersection trống, score = 0
        const score = intersection.length > 0 ? matched.length / intersection.length : 0;
        
        return { 
          ...sub, 
          matchCount: matched.length, 
          matchedItems: matched, 
          poolSize: intersection.length,
          score 
        };
      })
      .filter(sub => sub.matchCount === selectedItems.length)
      .sort((a, b) => b.score - a.score || b.matchCount - a.matchCount);
  }, [selectedItems, selectedChampion, championDetails, subChampions]);

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

        <div className="flex items-center gap-1 sm:gap-2 bg-surface-bg/50 p-1 rounded-xl border border-border/50 overflow-x-auto custom-scrollbar no-scrollbar-mobile">
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
        
        {/* Sidebar: Champions */}
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
              <div className="overflow-y-auto flex-grow p-2 space-y-1 custom-scrollbar">
                {loading ? (
                  <div className="h-full flex items-center justify-center"><div className="w-5 h-5 border-2 border-primary-500/20 border-t-cyan-500 rounded-full animate-spin"></div></div>
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
        {/* Content Area */}
        <div className="flex-grow flex flex-col gap-4 min-h-0">
          {!selectedChampion ? (
            <div className="flex-grow bg-surface-hover/30 rounded-3xl border border-dashed border-border flex flex-col items-center justify-center text-text-secondary">
              <Zap className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-primary font-bold tracking-widest uppercase text-sm">{tUI("bestSubChampion.vuiLongChonTuongChinhTruoc")}</p>
            </div>
          ) : (
            <div className="flex-grow flex flex-col gap-4 min-h-0">
              
              {/* Profile Bar */}
              <div className="bg-surface-bg backdrop-blur-sm rounded-3xl border border-border/50 p-2 sm:p-4 flex items-center gap-4 shrink-0 shadow-lg">
                <div className="relative">
                  <img src={championDetails?.avatar} alt="" className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl object-cover ring-2 ring-primary-500/50" />
                </div>
                <div className="flex-grow min-w-0">
                  <h2 className="text-sm sm:text-xl font-black text-text-primary uppercase tracking-tighter truncate">{championDetails?.name}</h2>
                  <div className="flex items-center gap-2 mt-0.5 sm:mt-1">
                    <span className="text-[8px] sm:text-[10px] font-bold text-text-secondary uppercase tracking-widest">{tUI("bestSubChampion.nangLuong")}: {championDetails?.cost}</span>
                  </div>
                </div>
              </div>

              {/* Grid Panels */}
              <div className="flex-grow flex flex-col xl:flex-row gap-4 min-h-0">
                
                {/* Panel Items - Narrower */}
                <div className="xl:w-[380px] 2xl:w-[450px] h-[300px] sm:h-[400px] xl:h-auto bg-surface-bg/80 rounded-3xl border border-border/50 p-2 sm:p-6 flex flex-col shrink-0 overflow-hidden shadow-2xl">
                  <div className="flex items-center justify-between mb-4 px-2">
                    <h3 className="text-[10px] sm:text-xs font-bold text-text-secondary uppercase tracking-widest flex items-center gap-2">
                      <ChevronRight className="w-3 h-3 text-primary-500" /> {tUI("bestSubChampion.vatPham")}
                    </h3>
                    {selectedItems.length > 0 && (
                      <button onClick={() => setSelectedItems([])} className="flex items-center gap-1.5 text-[8px] sm:text-[9px] font-bold text-danger-500 hover:text-danger-400 transition-colors uppercase">
                        <Trash2 className="w-3 h-3" /> {tUI("bestSubChampion.xoa")} ({selectedItems.length})
                      </button>
                    )}
                  </div>
                  
                  <div className="flex-grow overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
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
                            <div className="absolute -top-1 -left-1 bg-primary-500 rounded-full p-0.5 shadow-md"><Zap className="w-2 sm:w-2.5 h-2 sm:h-2.5 text-text-primary fill-white" /></div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Panel Recommendations - Wider */}
                <div className="flex-grow bg-surface-bg rounded-3xl border border-border/50 p-2 sm:p-6 flex flex-col min-h-0 shadow-xl">
                  <h3 className="text-[10px] sm:text-xs font-bold text-text-secondary uppercase tracking-widest flex items-center gap-2 mb-3 sm:mb-6 px-2">
                    <ChevronRight className="w-3 h-3 text-primary-500" /> {tUI("bestSubChampion.goiYTuongPhuToiUu")}
                  </h3>

                  <div className="flex-grow overflow-y-auto pr-1 custom-scrollbar">
                    {selectedItems.length === 0 ? (
                      <div className="h-full min-h-[150px] flex flex-col items-center justify-center text-center opacity-40">
                        <Search className="w-6 h-6 sm:w-8 sm:h-8 mb-4" />
                        <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-tighter">{tUI("bestSubChampion.chonItNhatMotVatPham")}</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 gap-2 sm:gap-4">
                        {bestSubChampions.map((sub, idx) => (
                          <div key={sub.cardCode} className="group bg-surface-bg border border-border rounded-xl overflow-hidden hover:border-primary-500/50 transition-all flex flex-col shadow-lg">
                            <div className="relative h-14 sm:h-24 overflow-hidden shrink-0">
                              <img 
                                src={sub.fullAbsolutePath} 
                                alt={sub.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60"
                                onError={(e) => e.target.src = sub.cards[0].image}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-page-bg via-page-bg/40 to-transparent" />
                              <div className="absolute bottom-1 sm:bottom-2 left-2 sm:left-3 right-2 sm:right-3 flex justify-between items-end">
                                <div className="min-w-0">
                                  <h4 className="text-[9px] sm:text-sm font-black text-text-primary uppercase tracking-wider drop-shadow-md truncate">{sub.name}</h4>
                                </div>
                                <div className="flex flex-col items-end shrink-0">
                                  <span className="text-[7px] sm:text-[8px] font-bold text-text-secondary uppercase leading-none mb-0.5">{tUI("bestSubChampion.beVatPham")}: {sub.poolSize}</span>
                                  <span className="text-sm sm:text-xl font-black text-primary-400 drop-shadow-lg leading-none">{Math.round(sub.score * 100)}%</span>
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
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChampionItems;
