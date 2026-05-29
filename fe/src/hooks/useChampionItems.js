import { useState, useMemo, useEffect } from 'react';
import itemData from '../assets/data/filteredPocItems.json';

const positiveKeywords = [
  "Tough", "Challenger", "Elusive", "Overwhelm", "Quick Attack", 
  "Lifesteal", "Regeneration", "Fury", "SpellShield", "Augment", 
  "Impact", "Fated", "Formidable", "Hallowed", "Brash", "Double Attack"
];

const checkCompatibility = (champ, item, selectedRarity) => {
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

export const useChampionItems = () => {
  const [champions, setChampions] = useState([]);
  const [subChampions, setSubChampions] = useState([]);
  const [selectedChampion, setSelectedChampion] = useState(null);
  const [championDetails, setChampionDetails] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedRarity, setSelectedRarity] = useState('All');

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

  const filteredChampions = useMemo(() => {
    return champions.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [champions, searchTerm]);

  const compatibleItems = useMemo(() => {
    if (!championDetails) return [];
    return itemData.filter(item => checkCompatibility(championDetails, item, selectedRarity));
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
    
    const mainChampPool = itemData
      .filter(item => checkCompatibility(championDetails, item, 'All'))
      .map(i => i.itemCode);

    return subChampions
      .filter(sub => sub.name.toLowerCase() !== selectedChampion.name.toLowerCase()) 
      .map(sub => {
        const subItems = sub["Vật phẩm tương thích"] || sub["comfortableItems"] || [];
        const intersection = mainChampPool.filter(code => subItems.includes(code));
        const matched = selectedItems.filter(code => intersection.includes(code));
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

  return {
    champions,
    subChampions,
    selectedChampion,
    setSelectedChampion,
    championDetails,
    searchTerm,
    setSearchTerm,
    loading,
    detailsLoading,
    selectedItems,
    setSelectedItems,
    selectedRarity,
    setSelectedRarity,
    filteredChampions,
    compatibleItems,
    toggleItemSelection,
    bestSubChampions
  };
};
