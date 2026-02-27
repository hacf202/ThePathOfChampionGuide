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
	championsList,
	relicsList,
	powersList,
	runesList,
	refreshKey,
	championNameToRegionsMap,
	onEditSuccess,
	onDeleteSuccess,
	getCache,
	setCache,
	sortBy,
	showDesktopFilter,
}) => {
	const { user, token } = useContext(AuthContext);
	const [myBuilds, setMyBuilds] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [currentPage, setCurrentPage] = useState(1);
	const isFetching = useRef(false);

	const apiUrl = import.meta.env.VITE_API_URL;
	const { favoriteStatus, favoriteCounts } = useBatchFavoriteData(
		myBuilds,
		token,
	);

	// --- LOGIC FETCH DỮ LIỆU ---
	const fetchMyBuilds = useCallback(async () => {
		if (!token || isFetching.current) return;
		isFetching.current = true;
		setIsLoading(true);

		const cacheKey = "my-builds";
		const cached = getCache?.(cacheKey);

		if (cached) {
			setMyBuilds(cached);
			setTimeout(() => {
				setIsLoading(false);
				isFetching.current = false;
			}, 400);
			return;
		}

		try {
			const response = await fetch(`${apiUrl}/api/builds/my-builds`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (!response.ok)
				throw new Error("Không thể tải danh sách build của bạn");
			const data = await response.json();
			const items = data.items || [];
			setMyBuilds(items);
			if (setCache) setCache(cacheKey, items);
		} catch (err) {
			setError(err.message);
		} finally {
			setTimeout(() => {
				setIsLoading(false);
				isFetching.current = false;
			}, 400);
		}
	}, [token, refreshKey, apiUrl, getCache, setCache]);

	useEffect(() => {
		fetchMyBuilds();
	}, [fetchMyBuilds]);

	// --- SIDE EFFECTS LỌC ---
	// Tự động về trang 1 khi thay đổi bộ lọc
	useEffect(() => {
		setCurrentPage(1);
	}, [searchTerm, selectedStarLevels, selectedRegions, sortBy]);

	// --- HÀM XỬ LÝ CẬP NHẬT/XÓA ---
	const handleBuildUpdated = useCallback(
		updatedBuild => {
			setMyBuilds(current =>
				current.map(b => (b.id === updatedBuild.id ? updatedBuild : b)),
			);
			if (onEditSuccess) onEditSuccess();
		},
		[onEditSuccess],
	);

	const handleBuildDeleted = useCallback(
		deletedBuildId => {
			setMyBuilds(current => current.filter(b => b.id !== deletedBuildId));
			if (onDeleteSuccess) onDeleteSuccess();
		},
		[onDeleteSuccess],
	);

	// --- LOGIC LỌC VÀ SẮP XẾP ---
	const filteredMyBuilds = useMemo(() => {
		let result = [...myBuilds];
		const starFilters = selectedStarLevels ? selectedStarLevels.split(",") : [];
		const regionFilters = selectedRegions ? selectedRegions.split(",") : [];

		if (searchTerm) {
			const lowerTerm = removeAccents(searchTerm.toLowerCase());
			result = result.filter(
				b =>
					removeAccents((b.championName || "").toLowerCase()).includes(
						lowerTerm,
					) ||
					removeAccents((b.description || "").toLowerCase()).includes(
						lowerTerm,
					),
			);
		}
		if (starFilters.length > 0)
			result = result.filter(b => starFilters.includes(String(b.star)));
		if (regionFilters.length > 0) {
			result = result.filter(b => {
				const bRegs =
					b.regions || championNameToRegionsMap?.get(b.championName) || [];
				return bRegs.some(r => regionFilters.includes(r));
			});
		}

		const [field, order] = sortBy.split("-");
		result.sort((a, b) => {
			let vA = a[field] ?? "";
			let vB = b[field] ?? "";
			if (field === "createdAt") {
				vA = new Date(vA);
				vB = new Date(vB);
			}
			return order === "asc" ? (vA > vB ? 1 : -1) : vA < vB ? 1 : -1;
		});
		return result;
	}, [
		myBuilds,
		searchTerm,
		selectedStarLevels,
		selectedRegions,
		sortBy,
		championNameToRegionsMap,
	]);

	const totalPages = Math.ceil(filteredMyBuilds.length / ITEMS_PER_PAGE);
	const currentBuilds = useMemo(() => {
		return filteredMyBuilds.slice(
			(currentPage - 1) * ITEMS_PER_PAGE,
			currentPage * ITEMS_PER_PAGE,
		);
	}, [filteredMyBuilds, currentPage]);

	// --- ĐIỀU HƯỚNG ---
	const goToNextPage = useCallback(() => {
		if (currentPage < totalPages && !isLoading) {
			setCurrentPage(p => p + 1);
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
	}, [currentPage, totalPages, isLoading]);

	const goToPrevPage = useCallback(() => {
		if (currentPage > 1 && !isLoading) {
			setCurrentPage(p => p - 1);
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
	}, [currentPage, isLoading]);

	useEffect(() => {
		const handleKeyDown = e => {
			if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
				return;
			if (e.key === "ArrowLeft") goToPrevPage();
			if (e.key === "ArrowRight") goToNextPage();
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [goToNextPage, goToPrevPage]);

	if (error)
		return (
			<p className='text-danger-text-dark text-center py-10 font-bold'>
				{error}
			</p>
		);

	return (
		<div className='space-y-4'>
			<div className='flex justify-between items-center px-1'>
				<h2 className='text-xl font-bold text-primary-500 font-primary'>
					Bộ cổ vật của tôi
				</h2>
				<span className='text-sm text-text-secondary bg-surface-bg-alt px-3 py-1 rounded-full border border-border'>
					{filteredMyBuilds.length} build
				</span>
			</div>

			<AnimatePresence mode='wait'>
				{isLoading ? (
					<motion.div
						key='skeleton'
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className={`grid grid-cols-1 md:grid-cols-2 ${showDesktopFilter ? "xl:grid-cols-3" : "xl:grid-cols-4"} gap-6`}
					>
						{[...Array(6)].map((_, i) => (
							<BuildSkeleton key={i} />
						))}
					</motion.div>
				) : (
					<motion.div
						key='content'
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						transition={{ duration: 0.3 }}
					>
						{currentBuilds.length > 0 ? (
							<>
								<div
									className={`grid grid-cols-1 md:grid-cols-2 ${showDesktopFilter ? "xl:grid-cols-3" : "xl:grid-cols-4"} gap-6`}
								>
									{currentBuilds.map(build => (
										<motion.div key={build.id} layout>
											<BuildSummary
												build={{ ...build, creatorName: user?.name || "Tôi" }}
												championsList={championsList}
												relicsList={relicsList}
												powersList={powersList}
												runesList={runesList}
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
											Trang trước
										</Button>
										<span className='font-bold text-primary-500 bg-primary-100/10 px-4 py-1.5 rounded-full border border-primary-500/20'>
											{currentPage} / {totalPages}
										</span>
										<Button
											onClick={goToNextPage}
											disabled={currentPage === totalPages}
											variant='outline'
										>
											Trang sau
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
									Bạn chưa có bộ cổ vật nào phù hợp.
								</p>
							</div>
						)}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

export default MyBuilds;
