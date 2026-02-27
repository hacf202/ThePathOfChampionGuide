// src/components/build/myFavoriteBuild.jsx
import React, {
	useEffect,
	useState,
	useContext,
	useCallback,
	useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../../context/AuthContext.jsx";
import BuildSummary from "./buildSummary";
import { useBatchFavoriteData } from "../../hooks/useBatchFavoriteData";
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

const MyFavorite = ({
	searchTerm,
	selectedStarLevels,
	selectedRegions,
	championsList,
	relicsList,
	powersList,
	runesList,
	refreshKey,
	onFavoriteToggle,
	onDeleteSuccess,
	sortBy,
	showDesktopFilter,
}) => {
	const { token } = useContext(AuthContext);
	const [favoriteBuilds, setFavoriteBuilds] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [totalItems, setTotalItems] = useState(0);
	const isFetching = useRef(false);

	const apiUrl = import.meta.env.VITE_API_URL;
	const { favoriteCounts } = useBatchFavoriteData(favoriteBuilds, token);

	const fetchFavoriteBuilds = useCallback(async () => {
		if (!token || isFetching.current) return;
		isFetching.current = true;
		setIsLoading(true);

		const params = new URLSearchParams({
			page: currentPage,
			limit: ITEMS_PER_PAGE,
			searchTerm: searchTerm || "",
			sort: sortBy || "favAt-desc",
			regions: selectedRegions || "",
			stars: selectedStarLevels || "",
		});

		try {
			const response = await fetch(
				`${apiUrl}/api/builds/favorites?${params.toString()}`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);
			if (!response.ok) throw new Error("Không thể tải danh sách yêu thích");
			const data = await response.json();
			setFavoriteBuilds(data.items || []);
			setTotalPages(data.pagination?.totalPages || 1);
			setTotalItems(data.pagination?.totalItems || 0);
		} catch (err) {
			setError(err.message);
		} finally {
			setTimeout(() => {
				setIsLoading(false);
				isFetching.current = false;
			}, 400);
		}
	}, [
		token,
		refreshKey,
		currentPage,
		searchTerm,
		sortBy,
		selectedStarLevels,
		selectedRegions,
		apiUrl,
	]);

	// --- SIDE EFFECTS ---

	// 1. Reset về trang 1 khi thay đổi bộ lọc
	useEffect(() => {
		if (currentPage !== 1) {
			setCurrentPage(1);
		}
	}, [searchTerm, selectedStarLevels, selectedRegions, sortBy]);

	// 2. Chỉ gọi fetch dữ liệu qua callback đã tối ưu
	useEffect(() => {
		fetchFavoriteBuilds();
	}, [fetchFavoriteBuilds]);

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
			<div className='text-center py-10'>
				<p className='text-danger-text-dark font-bold'>{error}</p>
				<Button
					variant='outline'
					className='mt-4'
					onClick={fetchFavoriteBuilds}
				>
					Thử lại
				</Button>
			</div>
		);

	return (
		<div className='space-y-4'>
			<div className='flex justify-between items-center px-1'>
				<h2 className='text-xl font-bold text-primary-500 font-primary'>
					Bộ cổ vật yêu thích
				</h2>
				<span className='text-sm text-text-secondary bg-surface-bg-alt px-3 py-1 rounded-full border border-border'>
					{totalItems} build
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
						{favoriteBuilds.length > 0 ? (
							<>
								<div
									className={`grid grid-cols-1 md:grid-cols-2 ${showDesktopFilter ? "xl:grid-cols-3" : "xl:grid-cols-4"} gap-6`}
								>
									{favoriteBuilds.map(build => (
										<motion.div key={build.id} layout>
											<BuildSummary
												build={{
													...build,
													creatorName: build.creator || "Người chơi",
												}}
												initialIsFavorited={true}
												championsList={championsList}
												relicsList={relicsList}
												powersList={powersList}
												runesList={runesList}
												onBuildUpdate={onFavoriteToggle}
												onBuildDelete={onDeleteSuccess}
												initialLikeCount={
													favoriteCounts[build.id] || build.like || 0
												}
												isFavoritePage={true}
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
									Bạn chưa yêu thích bộ cổ vật nào phù hợp.
								</p>
							</div>
						)}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

export default MyFavorite;
