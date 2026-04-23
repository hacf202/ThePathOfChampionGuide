// src/components/build/myBuilds.jsx
import React, {
	useEffect,
	useState,
	useMemo,
	useContext,
	useCallback,
	useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../../context/AuthContext.jsx";
import BuildSummary from "./buildSummary";
import { useBatchFavoriteData } from "../../hooks/useBatchFavoriteData";
import { useTranslation } from "../../hooks/useTranslation"; // 🟢 Import Hook
import { removeAccents } from "../../utils/vietnameseUtils";
import Button from "../common/button.jsx";
import { XCircle } from "lucide-react";

const ITEMS_PER_PAGE = 12;

const BuildSkeleton = () => (
	<div className='rounded-lg border border-border bg-surface-bg p-4 space-y-4 animate-pulse'>
		<div className='flex items-center gap-3'>
			<div className='w-12 h-12 bg-gray-700/50 rounded-full' />
			<div className='flex-1 space-y-2'>
				<div className='h-4 w-3/4 bg-gray-700/50 rounded' />
				<div className='h-3 w-1/2 bg-gray-700/50 rounded' />
			</div>
		</div>
		<div className='h-24 w-full bg-gray-700/50 rounded-md' />
		<div className='flex gap-2'>
			<div className='h-8 w-8 bg-gray-700/50 rounded-full' />
			<div className='h-8 w-8 bg-gray-700/50 rounded-full' />
			<div className='h-8 w-8 bg-gray-700/50 rounded-full' />
		</div>
	</div>
);

const MyBuilds = ({
	searchTerm,
	selectedStarLevels,
	selectedRegions,
	sortBy,
	currentPage,
	setCurrentPage,
	championsList,
	relicsList,
	powersList,
	runesList,
	refreshKey,
	powerMap,
	championNameToRegionsMap,
	showDesktopFilter,
}) => {
	const { token, user } = useContext(AuthContext);
	const { language, tUI } = useTranslation(); // 🟢 Khởi tạo ngôn ngữ và lấy tUI
	const [allBuilds, setAllBuilds] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const containerRef = useRef(null);

	const fetchMyBuilds = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const apiUrl = import.meta.env.VITE_API_URL;
			const response = await fetch(`${apiUrl}/api/builds/my-builds`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (!response.ok) throw new Error(tUI("common.errorLoadData"));
			const data = await response.json();
			setAllBuilds(data.items || []);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	}, [token, tUI]);

	useEffect(() => {
		if (token) fetchMyBuilds();
	}, [fetchMyBuilds, refreshKey, token]);

	const filteredBuilds = useMemo(() => {
		let result = [...allBuilds];

		if (searchTerm) {
			const searchKey = removeAccents(searchTerm.toLowerCase());
			result = result.filter(
				b =>
					removeAccents((b.championName || "").toLowerCase()).includes(
						searchKey,
					) ||
					removeAccents((b.description || "").toLowerCase()).includes(
						searchKey,
					),
			);
		}

		if (selectedStarLevels.length > 0) {
			const levels = selectedStarLevels.split(",");
			result = result.filter(b => levels.includes(String(b.star)));
		}

		if (selectedRegions.length > 0) {
			const regions = selectedRegions.split(",");
			result = result.filter(b => b.regions?.some(r => regions.includes(r)));
		}

		if (sortBy) {
			const [field, order] = sortBy.split("-");
			result.sort((a, b) => {
				let valA = a[field] || "";
				let valB = b[field] || "";
				if (field === "createdAt") {
					valA = new Date(valA).getTime();
					valB = new Date(valB).getTime();
				}
				if (typeof valA === "string" && typeof valB === "string") {
					return order === "asc"
						? valA.localeCompare(valB)
						: valB.localeCompare(valA);
				}
				return order === "asc" ? valA - valB : valB - valA;
			});
		}

		return result;
	}, [allBuilds, searchTerm, selectedStarLevels, selectedRegions, sortBy]);

	const totalPages = Math.ceil(filteredBuilds.length / ITEMS_PER_PAGE);
	const paginatedBuilds = filteredBuilds.slice(
		(currentPage - 1) * ITEMS_PER_PAGE,
		currentPage * ITEMS_PER_PAGE,
	);

	useEffect(() => {
		if (currentPage > totalPages && totalPages > 0) {
			setCurrentPage(totalPages);
		} else if (totalPages === 0 && currentPage !== 1) {
			setCurrentPage(1);
		}
	}, [totalPages, currentPage, setCurrentPage]);

	const { favoriteStatus, favoriteCounts, toggleFavorite } =
		useBatchFavoriteData(paginatedBuilds, token);

	const handleBuildUpdated = updatedBuild => {
		setAllBuilds(prev =>
			prev.map(b => (b.id === updatedBuild.id ? updatedBuild : b)),
		);
	};

	const handleBuildDeleted = deletedBuildId => {
		setAllBuilds(prev => prev.filter(b => b.id !== deletedBuildId));
	};

	const goToNextPage = () => {
		if (currentPage < totalPages) {
			setCurrentPage(prev => prev + 1);
			containerRef.current?.scrollIntoView({ behavior: "smooth" });
		}
	};

	const goToPrevPage = () => {
		if (currentPage > 1) {
			setCurrentPage(prev => prev - 1);
			containerRef.current?.scrollIntoView({ behavior: "smooth" });
		}
	};

	if (error)
		return (
			<div className='text-center py-10 text-danger-text-dark bg-danger-bg-light rounded-lg'>
				<p>{error}</p>
			</div>
		);

	return (
		<div ref={containerRef} className='min-h-[400px]'>
			<AnimatePresence mode='wait'>
				{loading ? (
					<motion.div
						key='skeleton'
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className={`grid gap-4 ${
							showDesktopFilter
								? "grid-cols-1 md:grid-cols-2"
								: "grid-cols-1 lg:grid-cols-2 xl:grid-cols-4"
						}`}
					>
						{[...Array(ITEMS_PER_PAGE)].map((_, i) => (
							<BuildSkeleton key={i} />
						))}
					</motion.div>
				) : paginatedBuilds.length > 0 ? (
					<>
						<div
							className={`grid gap-4 ${
								showDesktopFilter
									? "grid-cols-1 md:grid-cols-2"
									: "grid-cols-1 lg:grid-cols-2 xl:grid-cols-4"
							}`}
						>
							{paginatedBuilds.map(build => (
								<motion.div
									key={build.id}
									layout
									initial={{ opacity: 0, scale: 0.9 }}
									animate={{ opacity: 1, scale: 1 }}
									transition={{ duration: 0.2 }}
								>
									<BuildSummary
										build={build}
										championsList={championsList}
										relicsList={relicsList}
										powersList={powersList}
										runesList={runesList}
										powerMap={powerMap}
										championNameToRegionsMap={championNameToRegionsMap}
										showDesktopFilter={showDesktopFilter}
										onBuildUpdate={handleBuildUpdated}
										onBuildDelete={handleBuildDeleted}
										initialIsFavorited={!!favoriteStatus[build.id]}
										initialLikeCount={
											favoriteCounts[build.id] || build.like || 0
										}
										isFavoritePage={false}
									/>
								</motion.div>
							))}
						</div>
						{totalPages > 1 && (
							<div className='mt-10 flex justify-center items-center gap-4 border-t border-border pt-6'>
								<Button
									onClick={goToPrevPage}
									disabled={currentPage === 1}
									variant='outline'
								>
									{tUI("common.prevPage")}
								</Button>
								<span className='font-bold text-primary-500 bg-primary-100/10 px-4 py-1.5 rounded-full border border-primary-500/20'>
									{currentPage} / {totalPages}
								</span>
								<Button
									onClick={goToNextPage}
									disabled={currentPage === totalPages}
									variant='outline'
								>
									{tUI("common.nextPage")}
								</Button>
							</div>
						)}
					</>
				) : (
					<div className='text-center py-20 bg-surface-bg-alt rounded-lg border border-dashed border-border'>
						<XCircle
							size={48}
							className='mx-auto mb-4 opacity-20 text-text-secondary'
						/>
						<p className='text-text-secondary italic'>
							{tUI("buildList.noMyBuilds")}
						</p>
					</div>
				)}
			</AnimatePresence>
		</div>
	);
};

export default MyBuilds;
