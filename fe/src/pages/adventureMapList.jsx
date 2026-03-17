// src/pages/mapList.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import GenericListLayout from "../components/layout/genericListLayout";
import MultiSelectFilter from "../components/common/multiSelectFilter"; // Đảm bảo đã import component filter
import { useTranslation } from "../hooks/useTranslation";
import { removeAccents } from "../utils/vietnameseUtils";

export default function MapList() {
	const { tUI, tDynamic } = useTranslation();
	const [adventures, setAdventures] = useState([]);
	const [loading, setLoading] = useState(true);

	const API_BASE_URL = import.meta.env.VITE_API_URL;

	useEffect(() => {
		const fetchMaps = async () => {
			try {
				const res = await fetch(`${API_BASE_URL}/api/adventures`);
				const data = await res.json();
				setAdventures(data.items || []);
			} catch (error) {
				console.error("Lỗi fetch adventures:", error);
			} finally {
				setLoading(false);
			}
		};
		fetchMaps();
	}, [API_BASE_URL]);

	const [searchTerm, setSearchTerm] = useState("");
	const [selectedDifficulty, setSelectedDifficulty] = useState([]);

	const filterOptions = useMemo(() => {
		const difficulties = [...new Set(adventures.map(a => a.difficulty))]
			.filter(Boolean)
			.sort((a, b) => a - b);
		return {
			difficulties: difficulties.map(d => ({
				value: d.toString(),
				label: `${d} Sao`,
			})),
		};
	}, [adventures]);

	const filteredAdventures = useMemo(() => {
		let result = [...adventures];

		if (searchTerm) {
			const term = removeAccents(searchTerm.toLowerCase());
			result = result.filter(item => {
				const nameVi = removeAccents((item.adventureName || "").toLowerCase());
				const nameEn = removeAccents(
					(item.translations?.en?.adventureName || "").toLowerCase(),
				);
				return nameVi.includes(term) || nameEn.includes(term);
			});
		}

		if (selectedDifficulty.length > 0) {
			result = result.filter(item =>
				selectedDifficulty.includes(item.difficulty?.toString()),
			);
		}

		return result;
	}, [adventures, searchTerm, selectedDifficulty]);

	// Hàm render các bộ lọc (truyền vào GenericListLayout)
	const renderFilters = () => (
		<MultiSelectFilter
			label={tUI("mapList.difficulty", "Độ khó")}
			options={filterOptions.difficulties}
			selectedValues={selectedDifficulty}
			onChange={setSelectedDifficulty}
			placeholder='Tất cả độ khó'
		/>
	);

	// Hàm render Skeleton khi đang tải (truyền vào GenericListLayout)
	const renderSkeleton = () => (
		<div className='w-full h-48 bg-surface-hover animate-pulse rounded-xl border border-border'></div>
	);

	return (
		<GenericListLayout
			pageTitle={tUI("mapList.pageTitle", "Danh Sách Bản Đồ")}
			pageDescription='Tổng hợp tất cả bản đồ (Adventures) và Boss trong trò chơi.'
			heading={tUI("mapList.pageTitle", "Danh Sách Bản Đồ")}
			// Data
			data={filteredAdventures}
			loading={loading}
			// Search
			searchValue={searchTerm}
			onSearchChange={setSearchTerm}
			onSearchSubmit={() => {}} // Có thể để trống nếu tìm kiếm realtime
			searchPlaceholder={tUI("mapList.searchPlaceholder", "Tìm kiếm bản đồ...")}
			// Actions & Filters
			onResetFilters={() => {
				setSearchTerm("");
				setSelectedDifficulty([]);
			}}
			renderFilters={renderFilters} // Truyền function render filters
			renderSkeleton={renderSkeleton} // Truyền function render skeleton
			skeletonCount={8}
			// Render Item
			renderItem={item => (
				<Link
					key={item.adventureID}
					to={`/map/${item.adventureID}`}
					className='block h-full group'
				>
					<div className='bg-surface-bg border border-border rounded-xl overflow-hidden shadow-sm hover:border-primary-500 transition-all h-full'>
						<div className='relative w-full aspect-video bg-surface-hover'>
							<img
								src={item.assetAbsolutePath || "/fallback-image.svg"}
								alt={tDynamic(item, "adventureName")}
								className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
								onError={e => {
									e.target.src = "/fallback-image.svg";
								}}
							/>
							<div className='absolute top-2 right-2 bg-black/70 text-yellow-400 font-bold px-2 py-1 rounded text-sm backdrop-blur-sm shadow-md'>
								{item.difficulty} ★
							</div>
						</div>
						<div className='p-4'>
							<h3 className='font-bold text-lg text-text-primary group-hover:text-primary-500 line-clamp-1'>
								{tDynamic(item, "adventureName")}
							</h3>
							<p className='text-text-secondary text-sm mt-1 line-clamp-1'>
								{tDynamic(item, "typeAdventure")}
							</p>
							<div className='mt-3 flex justify-between items-center border-t border-border pt-3'>
								<span className='text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded'>
									XP: {item.championXP || 0}
								</span>
								<span className='text-xs text-text-secondary'>
									{item.Bosses?.length || 0} Bosses
								</span>
							</div>
						</div>
					</div>
				</Link>
			)}
		/>
	);
}
