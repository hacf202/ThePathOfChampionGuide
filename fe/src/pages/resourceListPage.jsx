import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "../hooks/useTranslation";
import GenericListLayout from "../components/layout/genericListLayout";
import SafeImage from "../components/common/SafeImage";
import MarkupRenderer from "../components/common/MarkupRenderer";
import { autoLinkResources, stripMarkup } from "../utils/markupUtils";

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
            <div className="relative group">
              <div className="absolute -inset-x-4 -inset-y-2 bg-primary-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity blur-lg" />
              <div className="relative flex items-center gap-4 border-l-4 border-primary-500 pl-4 py-1">
                <span className="text-2xl font-black text-text-primary tracking-tighter uppercase italic">
                  {item.title}
                </span>
                <div className="h-[1px] flex-grow bg-gradient-to-r from-border via-border/50 to-transparent" />
              </div>
            </div>
          );
        }

        const name = language === 'vi' ? item.name : item.name_en;
        const desc = language === 'vi' ? item.description : item.description_en;

        return (
          <Link
            to={`/resource/${item.id}`}
            className="group relative flex flex-col items-center gap-5 bg-surface-bg/40 backdrop-blur-sm p-8 rounded-2xl transition-all duration-300 border border-border/60 hover:border-primary-500/50 hover:bg-surface-hover/20 hover:scale-[1.03] hover:shadow-2xl hover:shadow-primary-500/10"
          >
            {/* Icon Container with Glow */}
            <div className="relative w-32 h-32 flex items-center justify-center">
               <div className="absolute inset-0 bg-primary-500/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
               <div className="w-28 h-28 flex items-center justify-center bg-surface-hover/40 rounded-3xl p-4 border border-border/50 shadow-inner group-hover:border-primary-500/30 transition-colors">
                 <SafeImage
                  src={item.icon}
                  alt={name}
                  className="w-24 h-24 shrink-0 object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-110"
                />
               </div>
            </div>
            
            <div className="text-center space-y-2 max-w-full">
              <h3 className="font-black text-2xl text-text-primary group-hover:text-primary-500 transition-colors leading-tight">
                {name}
              </h3>
              {desc && (
                <p className="text-sm text-text-secondary line-clamp-2 min-h-[40px] leading-relaxed">
                  {stripMarkup(desc)}
                </p>
              )}
            </div>

            {/* Premium Indicator */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-2 h-2 rounded-full bg-primary-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
            </div>

            {/* Hover Tooltip */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-[110%] mb-3 w-72 p-4 bg-gray-900/95 backdrop-blur-md text-white text-sm rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 invisible group-hover:visible pointer-events-none z-50 border border-white/10 scale-95 group-hover:scale-100">
              <div className="font-bold text-base mb-2 text-primary-400">{name}</div>
              {desc && <MarkupRenderer text={autoLinkResources(desc)} />}
              <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-gray-900/95"></div>
            </div>
          </Link>
        );
      }}
    />
  );};

export default ResourceListPage;
