// fe/src/pages/subChampionList.jsx
import React, { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';
import axios from 'axios';
import { useTranslation } from '@/hooks/useTranslation';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import GenericListLayout from '@/components/layout/genericListLayout';

const API_BASE = import.meta.env.VITE_API_URL;

const SubChampionList = () => {
    const { tUI } = useTranslation();
    const [subChamps, setSubChamps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
    const [currentPage, setCurrentPage] = useState(1);

    const fetchData = async (pageNum = 1, searchTerm = '') => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE}/api/sub-champions`, {
                params: { searchTerm, page: pageNum, limit: 20 }
            });
            setSubChamps(res.data.data);
            setPagination(res.data.pagination);
        } catch (error) {
            console.error("Error fetching sub-champions:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(currentPage, search);
    }, [currentPage]);

    const handleSearchSubmit = () => {
        setCurrentPage(1);
        fetchData(1, search);
    };

    const renderSubChampion = (pkg) => (
        <div className="group bg-surface-bg border border-border rounded-xl overflow-hidden hover:border-primary-500/50 transition-all hover:shadow-2xl hover:shadow-primary-500/10 h-full flex flex-col">
            {/* Header/Banner */}
            <div className="relative h-36 overflow-hidden flex-shrink-0">
                <img 
                    src={pkg.fullAbsolutePath} 
                    alt={pkg.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => e.target.src = '/fallback-champion.png'}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-bg via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                    <h2 className="text-xl font-black text-white drop-shadow-md uppercase tracking-wider truncate">{pkg.name}</h2>
                </div>
            </div>

            {/* Card List */}
            <div className="p-2 sm:p-3 flex-1">
                <p className="text-[9px] font-bold text-text-secondary uppercase tracking-widest mb-2 opacity-50">
                    {tUI("subChampionList.cardListLabel")}
                </p>
                <div className="space-y-2">
                    {pkg.cards.map(card => (
                        <Link 
                            to={`/card/${card.cardCode}`}
                            key={card.cardCode}
                            className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-100/50 dark:bg-white/5 hover:bg-slate-200/50 dark:hover:bg-white/10 border border-border/30 dark:border-white/10 transition-all group/card"
                        >
                            <div className="w-12 h-12 rounded-md flex-shrink-0 border border-border/30 dark:border-white/10">
                                <img 
                                    src={card.image} 
                                    alt={card.name} 
                                    className="w-full h-full object-contain"
                                    onError={(e) => e.target.src = '/fallback-card.png'}
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-text-primary truncate">{card.name}</p>
                                <p className="text-[10px] text-text-secondary">
                                    x{card.count} {tUI("subChampionList.copies")}
                                </p>
                            </div>
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover/card:opacity-50 transition-opacity" />
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <>
            <Helmet>
                <title>{tUI("subChampionList.title")} | POC GUIDE</title>
                <meta name="description" content={tUI("subChampionList.metaDesc")} />
            </Helmet>

            <GenericListLayout
                pageTitle={tUI("subChampionList.title")}
                pageDescription={tUI("subChampionList.pageDescription")}
                heading={tUI("subChampionList.heading")}
                data={subChamps}
                loading={loading}
                pagination={pagination}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                searchValue={search}
                onSearchChange={setSearch}
                onSearchSubmit={handleSearchSubmit}
                searchPlaceholder={tUI("subChampionList.searchPlaceholder")}
                renderItem={renderSubChampion}
                gridClassName="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6"
                showFilterToggle={false}
                emptyMessage={tUI("subChampionList.notFound")}
                renderFilters={() => null}
            />
        </>
    );
};

export default SubChampionList;
