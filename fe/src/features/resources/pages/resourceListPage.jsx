import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "@/hooks/useTranslation";
import GenericListLayout from "@/components/layout/genericListLayout";
import SafeImage from "@/components/common/SafeImage";
import MarkupRenderer from "@/components/common/MarkupRenderer";
import { autoLinkResources, stripMarkup } from "@/utils/markupUtils";

const ResourceListPage = () => {
  const { tUI, language } = useTranslation();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const response = await axios.get(`${apiUrl}/api/resources`);
        setResources(response.data || []);
      } catch (error) {
        console.error("Lỗi khi tải danh sách tài nguyên:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  const groupedResources = useMemo(() => {
    const currencies = resources.filter(r => r.category_en?.trim().toLowerCase() === 'currency');
    const treasures = resources.filter(r => r.category_en?.trim().toLowerCase() === 'treasure');

    const result = [];
    if (currencies.length > 0) {
      result.push({ isHeader: true, title: tUI("resourceList.categoryCurrency") || (language === 'vi' ? "TÀI NGUYÊN" : "RESOURCES"), type: 'currency', id: 'header-currency' });
      result.push(...currencies);
    }
    if (treasures.length > 0) {
      result.push({ isHeader: true, title: tUI("resourceList.categoryTreasure") || (language === 'vi' ? "RƯƠNG TÀI NGUYÊN" : "CHESTS & TREASURES"), type: 'treasure', id: 'header-treasure' });
      result.push(...treasures);
    }
    return result;
  }, [resources, language, tUI]);

  return (
    <GenericListLayout
      pageTitle={tUI("resourceList.pageTitle")}
      pageDescription={tUI("resourceList.pageDesc")}
      heading={tUI("resourceList.pageTitle")}
      data={groupedResources}
      loading={loading}
      skeletonCount={8}
      renderSkeleton={() => (
        <div className="bg-surface-hover/20 animate-pulse rounded-2xl h-[360px] border border-border/40" />
      )}
      showFilterToggle={false}
      gridClassName={showDesktopFilter =>
        `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${showDesktopFilter ? "xl:grid-cols-3" : "xl:grid-cols-3"}`
      }
      itemClassName={(item) => item.isHeader ? 'col-span-full mt-8 first:mt-2 mb-4' : ''}
      onResetFilters={null}
      renderFilters={() => null}
      renderItem={(item) => {
        if (item.isHeader) {
          return (
            <div className="relative group my-2">
              <div className="flex items-center gap-3 border-l-4 border-[var(--tactical-accent-lime)] pl-4 py-1.5">
                <span className="text-2xl sm:text-3xl font-display font-black text-[var(--tactical-text-main)] tracking-wide uppercase italic">
                  {item.title}
                </span>
                <div className="h-[2px] flex-grow bg-gradient-to-r from-[var(--tactical-accent-lime)]/40 via-[var(--tactical-stroke-color)] to-transparent" />
              </div>
            </div>
          );
        }

        const name = language === 'vi' ? item.name : item.name_en;
        const desc = language === 'vi' ? item.description : item.description_en;

        return (
          <Link
            to={`/resource/${item.id}`}
            className="group relative flex flex-col items-center gap-4 tactical-card clip-chamfer border border-[var(--tactical-card-border)] hover:border-[var(--tactical-accent-lime)] transition-all duration-300 p-6 shadow-md hover:shadow-[0_0_25px_rgba(210,255,40,0.2)] hover:-translate-y-1"
          >
            {/* Icon Container with Glow */}
            <div className="relative w-28 h-28 flex items-center justify-center">
               <div className="absolute inset-0 bg-[var(--tactical-accent-lime)]/10 clip-chamfer blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
               <div className="w-24 h-24 flex items-center justify-center tactical-box clip-chamfer-sm p-3 border border-[var(--tactical-card-border)] group-hover:border-[var(--tactical-accent-lime)] transition-colors">
                 <SafeImage
                  src={item.icon}
                  alt={name}
                  className="w-20 h-20 shrink-0 object-contain drop-shadow-xl transition-transform duration-500 group-hover:scale-110"
                />
               </div>
            </div>
            
            <div className="text-center space-y-1.5 max-w-full">
              <h3 className="font-display font-bold text-lg sm:text-xl text-[var(--tactical-text-main)] group-hover:text-[var(--tactical-accent-lime)] transition-colors leading-tight uppercase italic tracking-wide">
                {name}
              </h3>
              {desc && (
                <p className="text-xs sm:text-sm text-[var(--tactical-text-sub)] line-clamp-2 min-h-[36px] leading-relaxed font-primary">
                  {stripMarkup(desc)}
                </p>
              )}
            </div>

            {/* Tactical Indicator Tag */}
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-2 h-2 clip-chamfer-sm bg-[var(--tactical-accent-lime)] shadow-[0_0_8px_rgba(210,255,40,0.6)]" />
            </div>

            {/* Hover Tooltip */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-[105%] mb-3 w-80 p-4 bg-slate-950/95 backdrop-blur-md text-[var(--tactical-text-main)] text-xs clip-chamfer-sm shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 invisible group-hover:visible pointer-events-none z-50 border border-[var(--tactical-accent-lime)]/40 scale-95 group-hover:scale-100 leading-relaxed">
              <div className="font-display font-bold text-sm mb-1.5 text-[var(--tactical-accent-lime)] uppercase italic">{name}</div>
              {desc && <MarkupRenderer text={autoLinkResources(desc)} />}
            </div>
          </Link>
        );
      }}
    />
  );};

export default ResourceListPage;
