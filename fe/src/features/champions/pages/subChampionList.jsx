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
        <div className="tactical-card clip-chamfer group bg-[var(--tactical-card-bg)] border border-[var(--tactical-card-border)] hover:border-[var(--tactical-accent-lime)] hover:shadow-[0_0_15px_rgba(210,255,40,0.15)] transition-all h-full flex flex-col overflow-hidden">
            {/* Header/Banner */}
            <div className="relative h-36 overflow-hidden flex-shrink-0 border-b border-[var(--tactical-card-border)]">
                <img 
                    src={pkg.fullAbsolutePath} 
                    alt={pkg.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => e.target.src = '/fallback-champion.png'}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--tactical-card-bg)] via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
                    <div className='w-1 h-4 bg-[var(--tactical-accent-lime)] shadow-[0_0_6px_var(--tactical-accent-lime)]' />
                    <h2 className="text-lg sm:text-xl font-bold font-display text-white uppercase tracking-wider drop-shadow-md truncate">
                        {pkg.name}
                    </h2>
                </div>
            </div>

            {/* Card List */}
            <div className="p-3 sm:p-4 flex-1">
                <p className="text-[10px] font-mono-tech font-bold text-[var(--tactical-accent-lime)] uppercase tracking-widest mb-2.5">
                    // {tUI("subChampionList.cardListLabel")}
                </p>
                <div className="space-y-2">
                    {pkg.cards.map(card => (
                        <Link 
                            to={`/card/${card.cardCode}`}
                            key={card.cardCode}
                            className="tactical-box clip-chamfer-sm flex items-center gap-2.5 p-2 bg-[var(--tactical-inner-box)] border border-[var(--tactical-card-border)] hover:border-[var(--tactical-accent-cyan)] transition-all group/card"
                        >
                            <div className="w-11 h-11 clip-chamfer-sm flex-shrink-0 border border-[var(--tactical-card-border)] overflow-hidden bg-black/30">
                                <img 
                                    src={card.image} 
                                    alt={card.name} 
                                    className="w-full h-full object-contain"
                                    onError={(e) => e.target.src = '/fallback-card.png'}
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-text-primary truncate group-hover/card:text-[var(--tactical-accent-cyan)] transition-colors">
                                    {card.name}
                                </p>
                                <p className="text-[10px] font-mono-tech text-[var(--tactical-accent-lime)]">
                                    x{card.count} {tUI("subChampionList.copies")}
                                </p>
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 text-text-tertiary opacity-0 group-hover/card:opacity-100 group-hover/card:text-[var(--tactical-accent-cyan)] transition-opacity" />
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
