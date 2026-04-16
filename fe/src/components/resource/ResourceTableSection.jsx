import React from "react";
import { ShoppingBag } from "lucide-react";
import DataTable from "../common/DataTable";
import SafeImage from "../common/SafeImage";
import MarkupRenderer from "../common/MarkupRenderer";
import { ICONS } from "../../assets/data/assets";
import { useTranslation } from "../../hooks/useTranslation";
import { autoLinkResources } from "../../utils/markupUtils";
import { getEntityData } from "../../utils/entityLookup";
import { useNavigate } from "react-router-dom";
import MarkupTooltip from "../common/MarkupTooltip";

export const ResourceTableSection = ({ section, isEn }) => {
  const { tUI } = useTranslation();
  const navigate = useNavigate();
  const { language } = useTranslation();

  const ResourceLink = ({ id, type = "res", children, className = "" }) => {
    const data = getEntityData(id, type, language);
    if (!data || !id) return <div className={className}>{children}</div>;

    return (
      <MarkupTooltip
        title={data.name}
        description={data.description}
        icon={data.icon}
        type={data.type}
        href={`/resource/${data.id}`}
      >
        <div 
          onClick={(e) => {
             e.stopPropagation();
             navigate(`/resource/${data.id}`);
          }}
          className={`cursor-pointer transition-all duration-200 hover:text-primary-500 active:scale-95 group/res-link ${className}`}
        >
          {children}
        </div>
      </MarkupTooltip>
    );
  };

  if (section.type === "fragment_sources") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {section.data.map((cat, idx) => (
          <div key={idx} className="bg-surface-bg border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="bg-surface-hover/50 px-4 py-2 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-primary-500" />
                <h4 className="text-xs font-black uppercase text-text-primary tracking-widest">
                  <MarkupRenderer text={isEn ? cat.category_en : cat.category} />
                </h4>
              </div>
            </div>
            <div className="p-4">
              <ul className="space-y-2">
                {cat.sources ? (
                  cat.sources.map((src, sIdx) => (
                    <li key={sIdx} className="flex items-start gap-2 group">
                      <div className="mt-1.5 w-1 h-1 rounded-full bg-primary-500/50 group-hover:bg-primary-500 transition-colors" />
                      <span className="text-sm text-text-secondary leading-relaxed">
                        <MarkupRenderer text={autoLinkResources(src)} />
                      </span>
                    </li>
                  ))
                ) : (
                   cat.sources_en?.map((src, sIdx) => (
                    <li key={sIdx} className="flex items-start gap-2 group">
                      <div className="mt-1.5 w-1 h-1 rounded-full bg-primary-500/50 group-hover:bg-primary-500 transition-colors" />
                      <span className="text-sm text-text-secondary leading-relaxed">
                        <MarkupRenderer text={src} />
                      </span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const getHeaders = () => {
    if (section.type === "stardust_usage") {
      return [
        { key: "item", label: isEn ? "Item" : "Vật phẩm", align: "left", minWidth: "120px" },
        { key: "amount", label: isEn ? "Cost" : "Giá", align: "center", width: "90px" }
      ];
    }

    if (section.type === "glory_road") {
      return [
        { key: "tier", label: isEn ? "Tier" : "Bậc", align: "center", width: "60px" },
        { key: "needed", label: isEn ? "Challenge XP Needed" : "XP Thử Thách Cần", align: "center", width: "140px" },
        { key: "total", label: isEn ? "Total Challenge XP" : "Tổng XP Thử Thách", align: "center", width: "140px" }
      ];
    }

    if (section.type === "star_crystal_usage" || section.type === "nova_crystal_usage" || section.type === "gemstone_usage") {
      const isNova = section.type === "nova_crystal_usage";
      const isGem = section.type === "gemstone_usage";
      const headers = [
        { key: "action", label: tUI("resourceDetail.table.action"), align: "left", minWidth: "140px" },
        { key: "amount", label: isEn 
          ? (isNova ? "Nova Crystals" : isGem ? "Gemstones" : "Star Crystals") 
          : (isNova ? "Pha Lê Sao Băng" : isGem ? "Đá Quý" : "Pha Lê Tinh Tú"), 
          align: "center", width: "120px" }
      ];
      if (section.hasFragments) {
        headers.push({ key: "fragments", label: isEn ? "Fragments" : "Mảnh tướng", align: "center", width: "110px" });
      }
      return headers;
    }

    if (section.type === "reliquary_tiers") {
      return [
        { key: "tier", label: isEn ? "Tier" : "Bậc", align: "left", width: "130px" },
        { key: "content", label: isEn ? "Content" : "Nội dung", align: "left", minWidth: "180px" },
        { key: "forge", label: isEn ? "Spirit Forge" : "Tôi Luyện Linh Hồn", align: "center", width: "110px" },
        { key: "dup", label: isEn ? "Duplicate Protection" : "Bảo hiểm", align: "center", width: "90px" },
        { key: "source", label: isEn ? "Source" : "Nguồn", align: "left", minWidth: "150px" }
      ];
    }

    if (section.type === "vault_tiers") {
      return [
        { key: "tier", label: isEn ? "Tier" : "Bậc", align: "left", width: "140px" },
        { key: "champ_frags", label: isEn ? "Champion Fragments" : "Mảnh Tướng", align: "left", width: "180px" },
        { key: "wild_frags", label: isEn ? "Wild Fragments" : "Mảnh Ghép Bí Ẩn", align: "center", width: "120px" },
        { key: "relic", label: isEn ? "Relic" : "Cổ Vật", align: "left", width: "140px" },
        { key: "bonus", label: isEn ? "Bonus Drops" : "Thưởng Thêm", align: "left", width: "140px" },
        { key: "source", label: isEn ? "Source" : "Nguồn", align: "left", minWidth: "150px" }
      ];
    }

    if (section.type === "vessel_tiers") {
      return [
        { key: "tier", label: isEn ? "Tier" : "Bậc", align: "left", width: "140px" },
        { key: "star_crystals", label: isEn ? "Star Crystals" : "Pha Lê Tinh Tú", align: "left", width: "150px" },
        { key: "stardust", label: isEn ? "Stardust" : "Bụi Tinh Tú", align: "left", width: "140px" },
        { key: "nova", label: isEn ? "Nova Items" : "Vật phẩm Nova", align: "left", width: "140px" },
        { key: "gemstones", label: isEn ? "Gemstones" : "Đá Quý", align: "left", width: "140px" },
        { key: "source", label: isEn ? "Source" : "Nguồn", align: "left", minWidth: "150px" }
      ];
    }

    if (section.type === "gemstone_vessel_tiers") {
      return [
        { key: "tier", label: isEn ? "Tier" : "Bậc", align: "left", width: "140px" },
        { key: "gemstones", label: isEn ? "Gemstones" : "Đá Quý", align: "left", width: "180px" },
        { key: "source", label: isEn ? "Source" : "Nguồn", align: "left", minWidth: "150px" }
      ];
    }

    if (section.type === "runic_vessel_tiers") {
      return [
        { key: "tier", label: isEn ? "Type" : "Loại", align: "left", width: "120px" },
        { key: "region", label: isEn ? "Region" : "Khu vực", align: "left", width: "120px" },
        { key: "runes", label: isEn ? "Runes" : "Ngọc", align: "left", width: "200px" },
        { key: "rune_shards", label: isEn ? "Rune Shards" : "Mảnh Ngọc", align: "left", width: "120px" },
        { key: "source", label: isEn ? "Source" : "Nguồn", align: "left", minWidth: "150px" }
      ];
    }

    if (section.type === "spirit_blossom_tiers") {
      return [
        { key: "tier", label: isEn ? "Tier" : "Bậc", align: "left", width: "130px" },
        { key: "bundle", label: isEn ? "Bundle" : "Gói thưởng", align: "left", width: "90px" },
        { key: "champ_frags", label: isEn ? "Fragments" : "Mảnh tướng", align: "left", width: "160px" },
        { key: "star_crystals", label: isEn ? "Star Crystals" : "Pha Lê Tinh Tú", align: "left", width: "160px" },
        { key: "nova", label: isEn ? "Nova Items" : "Vật phẩm Nova", align: "left", width: "160px" },
        { key: "bonus", label: isEn ? "Bonus Drops Bundle" : "Gói thưởng thêm", align: "left", width: "180px" }
      ];
    }

    const headers = [
      { key: "action", label: tUI("resourceDetail.table.action"), align: "left", minWidth: "140px" },
      { key: "amount", label: tUI("resourceDetail.table.amount"), align: "center", width: "120px" }
    ];

    if (section.type === "fragment_star_upgrade") {
      headers.push(
        { key: "crystals", label: tUI("resourceDetail.table.starCrystals"), align: "center", width: "120px" },
        { key: "nova_crystal", label: tUI("resourceDetail.table.novaCrystals"), align: "center", width: "120px" }
      );
    }

    return headers;
  };

  const renderSpiritBlossomHeader = (headers) => {
    return (
      <>
        <tr className="bg-surface-hover/70 text-text-secondary text-[10px] md:text-[11px] font-bold uppercase tracking-widest border-b border-border/80">
          <th rowSpan={2} className="py-2.5 px-3 border-r border-border text-center w-[120px] md:w-[150px]">{isEn ? "Tier" : "Bậc"}</th>
          <th colSpan={5} className="py-1.5 px-3 border-r border-border text-center bg-primary-500/10 text-primary-400 border-b border-border/50">
            {isEn ? "Content" : "Nội dung"}
          </th>
        </tr>
        <tr className="bg-surface-hover/40 text-text-secondary text-[10px] font-black uppercase tracking-wider border-b border-border">
          <th className="py-2 px-3 border-r border-border text-center">{isEn ? "Bundle" : "Gói thưởng"}</th>
          <th className="py-2 px-4 border-r border-border text-left">
            <div className="flex items-center gap-1.5">
              <SafeImage src={ICONS.item.fragment_small} className="w-3.5 h-3.5" />
              <span>{isEn ? "Fragments" : "Mảnh tướng"}</span>
            </div>
          </th>
          <th className="py-2 px-4 border-r border-border text-left">
            <div className="flex items-center gap-1.5 text-amber-500">
              <SafeImage src={ICONS.item.star_crystal} className="w-3.5 h-3.5" />
              <span>{isEn ? "Star Crystals" : "Pha Lê Tinh Tú"}</span>
            </div>
          </th>
            <th className="py-2 px-4 border-r border-border text-left">
              <div className="flex items-center gap-1.5 text-cyan-500">
                <SafeImage src={ICONS.item.nova_shard} className="w-3.5 h-3.5" />
                <span>{isEn ? "Nova Shards" : "Mảnh Sao Băng"}</span>
            </div>  
          </th>
           <th className="py-2.5 px-4 text-center w-[200px]">{isEn ? "Bonus Drops Bundle" : "Gói thưởng thêm"}</th>
        </tr>
      </>
    );
  };

  const renderRow = (row, idx, headers, allData) => {
    const isStardustSection = section.type === "stardust_usage" || section.type === "stardust_acquisition";
    const isGloryRoad = section.type === "glory_road";
    const isStarCrystalUsage = section.type === "star_crystal_usage";
    const isNovaCrystalUsage = section.type === "nova_crystal_usage";
    const isReliquaryTiers = section.type === "reliquary_tiers";
    const isVaultTiers = section.type === "vault_tiers";
    const isVesselTiers = section.type === "vessel_tiers";
    const isGemstoneVesselTiers = section.type === "gemstone_vessel_tiers";
    const isRunicVesselTiers = section.type === "runic_vessel_tiers";
    const isSpiritBlossomTiers = section.type === "spirit_blossom_tiers";
    
    const getCurrencyIcon = (headerKey) => {
      if (isStardustSection) return ICONS.item.stardust;
      if (isGloryRoad) return ICONS.item.challenge_xp;
      if (headerKey === "crystals") return ICONS.item.star_crystal;
      if (headerKey === "nova" || (headerKey === "amount" && isNovaCrystalUsage)) return ICONS.item.nova;
      if (headerKey === "amount" && isStarCrystalUsage) return ICONS.item.star_crystal;
      if (headerKey === "amount" && section.type === "gemstone_usage") return ICONS.item.gemstone;
      if (headerKey === "rune_shards") return ICONS.rune.shard;
      return ICONS.item.fragment_small;
    };

    const cells = [];

    headers.forEach((header, colIdx) => {
      // Row Spanning Logic for Spirit Blossom
      if (isSpiritBlossomTiers) {
        if (header.key === "tier") {
          const isFirstInTier = idx === 0 || (idx > 0 && allData[idx-1].tier_id !== row.tier_id);
          if (!isFirstInTier) return;
          
          let rowSpan = 1;
          for (let i = idx + 1; i < allData.length; i++) {
            if (allData[i].tier_id === row.tier_id) rowSpan++;
            else break;
          }

          let tierIcon = ICONS.vessel[row.tier_id];
          const tierText = isEn ? (row.tier_en || row.tier) : (row.tier);

          cells.push(
            <td key={colIdx} rowSpan={rowSpan} className="py-2 md:py-3 px-2 md:px-3 border-r border-border text-center bg-surface-bg/30">
              <ResourceLink id={row.tier_id} className="flex flex-col items-center gap-1.5 group/tier-sb">
                <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-surface-hover/50 rounded-lg p-1 border border-border/50 shadow-inner group-hover/tier-sb:border-primary-500/50 group-hover/tier-sb:bg-primary-500/5 transition-all">
                  <SafeImage src={tierIcon} className="w-8 h-8 md:w-10 md:h-10 object-contain drop-shadow-lg group-hover/tier-sb:scale-110 transition-transform" />
                </div>
                <span className="font-black text-text-primary text-[11px] md:text-[13px] uppercase tracking-tight leading-none group-hover/tier-sb:text-primary-400 transition-colors">{tierText}</span>
              </ResourceLink>
            </td>
          );
          return;
        }

        if (header.key === "bonus") {
          const isFirstInTier = idx === 0 || (idx > 0 && allData[idx-1].tier_id !== row.tier_id);
          if (!isFirstInTier) return;

          let rowSpan = 1;
          for (let i = idx + 1; i < allData.length; i++) {
            if (allData[i].tier_id === row.tier_id) rowSpan++;
            else break;
          }

          const fullText = isEn ? (row[header.key + "_en"] || row[header.key]) : row[header.key];
          const lines = fullText ? String(fullText).split('\n') : [];

          cells.push(
            <td key={colIdx} rowSpan={rowSpan} className="py-2.5 px-3 md:px-4 border-l border-border bg-surface-bg/20">
              <div className="flex flex-col gap-1.5">
                {lines.map((line, lIdx) => {
                  let subIcon = "";
                  if (line.includes("Mảnh Ngọc") || line.includes("Rune Shard")) {
                    subIcon = ICONS.rune.shard;
                  } else if (line.includes("Pha Lê Tinh Tú") || line.includes("Star Crystal")) {
                    subIcon = ICONS.item.star_crystal;
                  } else if (line.includes("Đá Quý") || line.includes("Gemstones")) {
                    subIcon = ICONS.item.gemstone;
                  } else if (line.includes("Nova") || line.includes("Sao Băng")) {
                    const isCrystal = line.includes("Tinh Thể") || line.includes("Crystal") || line.includes("Pha Lê");
                    subIcon = isCrystal ? ICONS.item.nova_crystal : ICONS.item.nova_shard;
                  } else if (line.includes("Mảnh Ngọc") || line.includes("2 Mảnh") || line.includes("10 Mảnh")) {
                    subIcon = ICONS.rune.shard;
                  }

                  return (
                    <div key={lIdx} className="flex items-center gap-1.5 group whitespace-nowrap">
                       {subIcon && <SafeImage src={subIcon} className="w-3.5 h-3.5 md:w-4 md:h-4 object-contain transition-transform group-hover:scale-110" />}
                       <span className={`text-[10px] md:text-[11px] font-black uppercase tracking-tight transition-colors ${line.includes("NO BONUS") || line.includes("Không") ? "text-text-tertiary" : "text-text-secondary group-hover:text-text-primary"}`}>
                         <MarkupRenderer text={autoLinkResources(line)} />
                       </span>
                    </div>
                  );
                })}
              </div>
            </td>
          );
          return;
        }
      }

      // Normal Rendering Logic
      let content = null;
      const currencyIcon = getCurrencyIcon(header.key);

      if (header.key === "action" || header.key === "item") {
        const text = isEn ? (row.action_en || row.item_en || row.action || row.item) : (row.action || row.item || row.action_en || row.item_en);
        content = <MarkupRenderer text={autoLinkResources(text)} />;
      } else if (header.key === "amount" || header.key === "needed" || header.key === "total" || header.key === "fragments" || header.key === "rune_shards") {
        const val = row[header.key] || row.fragments || row.amount || row.glory || row.cost || 0;
        
        let targetId = "fragment";
        if (isStardustSection) targetId = "stardust";
        else if (isGloryRoad) targetId = "glory";
        else if (header.key === "crystals") targetId = "star_crystal";
        else if (header.key === "nova" || header.key === "nova_crystal" || (header.key === "amount" && isNovaCrystalUsage)) targetId = "nova_crystal";
        else if (header.key === "amount" && isStarCrystalUsage) targetId = "star_crystal";
        else if (header.key === "amount" && section.type === "gemstone_usage") targetId = "gemstone";
        else if (header.key === "rune_shards") targetId = "rune_shard";

        content = (
          <ResourceLink id={targetId} className="flex items-center justify-center gap-1 md:gap-1.5 py-0.5 md:py-1 whitespace-nowrap">
            <span className="text-[11px] md:text-[12px] font-bold text-text-primary leading-none group-hover/res-link:text-primary-400">{val}</span>
            <SafeImage 
              src={header.key === "fragments" ? ICONS.item.fragment_small : currencyIcon} 
              className="w-4 h-4 md:w-5 md:h-5 object-contain drop-shadow-sm transition-transform group-hover/res-link:scale-110" 
            />
          </ResourceLink>
        );
      } else if (header.key === "tier") {
          let tierIcon = "";
          const tierText = isEn ? (row.tier_en || row.tier) : (row.tier);
          
          if (isReliquaryTiers) tierIcon = ICONS.reliquary[`${row.tier_id}_full`];
          else if (isVaultTiers) tierIcon = ICONS.vault[`${row.tier_id}_full`];
          else if (isVesselTiers || isGemstoneVesselTiers || isRunicVesselTiers) {
            if (row.tier_id === 'nova_crystal') tierIcon = ICONS.vessel.nova_crystal;
            else tierIcon = ICONS.vessel[`${row.tier_id}_full`];
          }

          if (tierIcon) {
            content = (
              <ResourceLink id={row.tier_id} className="flex items-center gap-2 md:gap-3 py-0.5 md:py-1 group/tier whitespace-nowrap">
                <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-surface-hover/30 rounded-lg p-1 border border-border/50 group-hover/tier:border-primary-500/50 group-hover/tier:bg-primary-500/5 transition-all">
                  <SafeImage src={tierIcon} className="w-6 h-6 md:w-8 md:h-8 object-contain drop-shadow-md group-hover/tier:scale-110 transition-transform" />
                </div>
                <span className="font-black text-text-primary text-[11px] md:text-sm capitalize group-hover/tier:text-primary-400 transition-colors uppercase tracking-tight">{tierText}</span>
              </ResourceLink>
            );
          } else {
            content = (
              <div className="flex items-center justify-center w-8 h-8 md:w-12 md:h-12 bg-primary-500/10 rounded-lg md:rounded-xl border border-primary-500/25 shadow-sm">
                <span className="text-sm md:text-xl font-black text-primary-500">{tierText}</span>
              </div>
            );
          }
      } else if (header.key === "bundle") {
        content = <span className="text-xs font-black text-text-tertiary uppercase tracking-tighter">{isEn ? (row.bundle_en || row.bundle) : (row.bundle)}</span>;
      } else if (header.key === "dup" || header.key === "forge") {
        const isTrue = row[header.key] === true || row[header.key] || row[header.key] === "Có";
        const isForge = header.key === "forge";
        content = (
          <div className="flex flex-col items-center gap-2">
            <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${isTrue ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
              {isEn ? (isTrue ? "Yes" : "No") : (isTrue ? "Có" : "Không")}
            </span>
            {isTrue && isForge && (
              <div className="p-1 bg-surface-hover/50 rounded flex items-center justify-center border border-border/30">
                <SafeImage src={ICONS.special.spirit_forge} className="w-7 h-7 object-contain" />
              </div>
            )}
          </div>
        );
      } else if (header.key === "region") {
        const regionText = isEn ? (row.region_en || row.region) : (row.region || row.region_en);
        const regionIcon = ICONS.item.spirit_blossom_region;
        content = (
          <div className="flex items-center gap-2">
            <SafeImage src={regionIcon} className="w-6 h-6 object-contain" />
            <span className="text-sm font-semibold text-text-primary">{regionText}</span>
          </div>
        );
      } else if (header.key === "champ_frags" || header.key === "wild_frags" || header.key === "relic" || header.key === "bonus" || header.key === "content" || header.key === "source" ||
                 header.key === "star_crystals" || header.key === "stardust" || header.key === "nova" || header.key === "gemstones" || header.key === "runes" || header.key === "rune_shards") {
        const fullText = isEn ? (row[header.key + "_en"] || row[header.key]) : row[header.key];
        const lines = fullText ? String(fullText).split('\n') : [];
        const hasIcon = (header.key === "champ_frags" || header.key === "wild_frags" || header.key === "star_crystals" || header.key === "stardust" || header.key === "nova" || header.key === "gemstones" || header.key === "runes" || header.key === "rune_shards" || header.key === "bonus");
        const totalChance = isSpiritBlossomTiers ? (row[header.key + "_total"] || null) : null;
        const subIconBase = header.key === "champ_frags" ? ICONS.item.fragment_small : 
                           header.key === "star_crystals" ? ICONS.item.star_crystal :
                           header.key === "nova" ? ICONS.item.nova_shard :
                           header.key === "nova_crystal" ? ICONS.item.nova_crystal : null;

        content = (
          <div className="flex flex-col gap-2.5 py-2">
            {totalChance && (
              <div className="flex items-center gap-1.5 mb-1 bg-amber-500/10 border border-amber-500/20 rounded px-2 py-0.5 self-center">
                <span className="text-[10px] font-black uppercase text-amber-500 tracking-wider">TOTAL</span>
                {subIconBase && <SafeImage src={subIconBase} className="w-3.5 h-3.5 object-contain" />}
                <span className="text-[10px] font-black uppercase text-amber-500 tracking-wider">CHANCE: {totalChance}</span>
              </div>
            )}
            {lines.map((line, lIdx) => {
              if (line === "—" || line === "None" || line === "Không") return <span key={lIdx} className="text-[10px] md:text-xs font-bold text-text-tertiary text-center uppercase py-1">None</span>;
              
              let subIcon = "";
              if (header.key === "wild_frags") subIcon = ICONS.item.wild_fragment_small;
              else if (header.key === "champ_frags") subIcon = ICONS.item.fragment_small;
              else if (header.key === "star_crystals") subIcon = ICONS.item.star_crystal;
              else if (header.key === "stardust") subIcon = ICONS.item.stardust;
              else if (header.key === "nova") {
                const isCrystal = line.includes("Tinh Thể") || line.includes("Crystal") || line.includes("Pha Lê");
                subIcon = isCrystal ? ICONS.item.nova_crystal : ICONS.item.nova_shard;
              }
              else if (header.key === "gemstones") subIcon = ICONS.item.gemstone;
              else if (header.key === "runes") {
                if (line.includes("Common") || line.includes("Thường")) subIcon = ICONS.rune.common;
                else if (line.includes("Rare") || line.includes("Hiếm")) subIcon = ICONS.rune.rare;
                else if (line.includes("Legendary") || line.includes("Huyền Thoại")) subIcon = ICONS.rune.legendary;
                else if (line.includes("Charms")) subIcon = ICONS.special.rune_irresistible_charms;
                else if (line.includes("Awakening")) subIcon = ICONS.special.rune_spiritual_awakening;
                else if (line.includes("Thieves")) subIcon = ICONS.special.rune_thieves_in_the_night;
                else subIcon = ICONS.item.rune;
              }
              else if (header.key === "rune_shards") subIcon = ICONS.rune.shard;

              return (
                <div key={lIdx} className="flex items-center gap-1.5 justify-start group whitespace-nowrap">
                  {hasIcon && subIcon && (
                    <SafeImage 
                      src={subIcon} 
                      className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0 object-contain drop-shadow-sm transition-transform group-hover:scale-110" 
                    />
                  )}
                  <span className={`text-[10px] md:text-[11px] leading-tight block font-black uppercase tracking-tight ${header.key === "content" || header.key === "source" ? "italic text-text-secondary/70 whitespace-pre-line" : "text-text-primary/95 group-hover:text-primary-400"}`}>
                     <MarkupRenderer text={autoLinkResources(line)} />
                  </span>
                </div>
              );
            })}
          </div>
        );
      } else if (header.key === "crystals") {
        content = row.crystals ? (
          <ResourceLink id="star_crystal" className="flex items-center justify-center gap-2.5 py-1">
            <span className="text-sm font-bold text-text-primary group-hover/res-link:text-primary-400">{row.crystals}</span>
            <SafeImage src={ICONS.item.star_crystal} className="w-7 h-7 object-contain drop-shadow-sm group-hover/res-link:scale-110 transition-transform" />
          </ResourceLink>
        ) : "—";
      } else if (header.key === "nova" || header.key === "nova_crystal") {
        const val = row.nova_crystal || row.nova;
        content = val ? (
          <ResourceLink id="nova_crystal" className="flex items-center justify-center gap-2.5 py-1">
            <span className="text-sm font-bold text-text-primary group-hover/res-link:text-primary-400">{val}</span>
            <SafeImage src={ICONS.item.nova_crystal} className="w-7 h-7 object-contain drop-shadow-sm group-hover/res-link:scale-110 transition-transform" />
          </ResourceLink>
        ) : "—";
      }

      cells.push(
        <td
          key={colIdx}
          className={`py-4 px-4 border-r border-border last:border-r-0 text-text-secondary ${
            header.align === "center" ? "text-center" : "text-left"
          }`}
        >
          {content}
        </td>
      );
    });

    return cells;
  };

  const isSpiritBlossom = section.type === "spirit_blossom_tiers";

  return (
    <DataTable 
      headers={getHeaders()} 
      data={section.data} 
      renderHead={isSpiritBlossom ? renderSpiritBlossomHeader : null}
      renderRow={renderRow}
      note={isEn ? section.note_en : section.note}
    />
  );
};
