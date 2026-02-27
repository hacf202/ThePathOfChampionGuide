// src/components/build/communityBuilds.jsx
import React, {
	useEffect,
	useState,
	useContext,
	useCallback,
	useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import BuildSummary from "./buildSummary";
import { useBatchFavoriteData } from "../../hooks/useBatchFavoriteData";
import { AuthContext } from "../../context/AuthContext.jsx";
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

const CommunityBuilds = ({
	searchTerm,
	selectedStarLevels,
	selectedRegions,
	championsList,
	relicsList,
	powersList,
	runesList,
	refreshKey,
	onEditSuccess,
	onDeleteSuccess,
	onFavoriteToggle,
	sortBy,
	showDesktopFilter,
	currentPage, // Nhận từ cha
	setCurrentPage, // Nhận từ cha
}) => {
	const { token } = useContext(AuthContext);
	const apiUrl = import.meta.env.VITE_API_URL;

	const [communityBuilds, setCommunityBuilds] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [creatorNames, setCreatorNames] = useState({});
	const [totalPages, setTotalPages] = useState(1);
	const [totalItems, setTotalItems] = useState(0);

	const isFetching = useRef(false);

	const { favoriteStatus, favoriteCounts } = useBatchFavoriteData(
		communityBuilds,
		token,
	);

	const fetchCreatorNames = async builds => {
		const userIds = [...new Set(builds.map(b => b.creator).filter(Boolean))];
		const idsToFetch = userIds.filter(id => !creatorNames[id]);
		if (idsToFetch.length === 0) return;

		try {
			const res = await fetch(`${apiUrl}/api/users/batch`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ userIds: idsToFetch }),
			});
			if (res.ok) {
				const newNames = await res.json();
				setCreatorNames(prev => ({ ...prev, ...newNames }));
			}
		} catch (err) {
			console.error("Lỗi lấy thông tin người dùng:", err);
		}
	};

	const fetchCommunityBuilds = useCallback(async () => {
		if (isFetching.current) return;
		isFetching.current = true;

		setIsLoading(true);
		setError(null);

		const params = new URLSearchParams({
			page: currentPage,
			limit: ITEMS_PER_PAGE,
			searchTerm: searchTerm || "",
			regions: selectedRegions || "",
			stars: selectedStarLevels || "",
			sort: sortBy || "createdAt-desc",
		});

		try {
			const response = await fetch(`${apiUrl}/api/builds?${params.toString()}`);
			if (!response.ok) throw new Error("Không thể kết nối đến máy chủ");

			const data = await response.json();
			setCommunityBuilds(data.items || []);
			setTotalPages(data.pagination?.totalPages || 1);
			setTotalItems(data.pagination?.totalItems || 0);

			fetchCreatorNames(data.items || []);
		} catch (err) {
			setError(err.message);
		} finally {
			setTimeout(() => {
				setIsLoading(false);
				isFetching.current = false;
			}, 400);
		}
	}, [
		currentPage,
		searchTerm,
		selectedStarLevels,
		selectedRegions,
		sortBy,
		refreshKey,
		apiUrl,
	]);

	useEffect(() => {
		fetchCommunityBuilds();
	}, [fetchCommunityBuilds]);

	const goToNextPage = useCallback(() => {
		if (currentPage < totalPages && !isLoading) {
			setCurrentPage(prev => prev + 1);
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
	}, [currentPage, totalPages, isLoading, setCurrentPage]);

	const goToPrevPage = useCallback(() => {
		if (currentPage > 1 && !isLoading) {
			setCurrentPage(prev => prev - 1);
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
	}, [currentPage, isLoading, setCurrentPage]);

	useEffect(() => {
		const handleKeyDown = event => {
			if (
				event.target.tagName === "INPUT" ||
				event.target.tagName === "TEXTAREA"
			)
				return;
			if (event.key === "ArrowLeft") goToPrevPage();
			else if (event.key === "ArrowRight") goToNextPage();
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [goToPrevPage, goToNextPage]);

	const handleBuildUpdated = updatedBuild => {
		setCommunityBuilds(current =>
			current.map(b => (b.id === updatedBuild.id ? updatedBuild : b)),
		);
		if (onEditSuccess) onEditSuccess();
	};

	const handleBuildDeleted = deletedBuildId => {
		setCommunityBuilds(current => current.filter(b => b.id !== deletedBuildId));
		if (onDeleteSuccess) onDeleteSuccess();
	};

	if (error) {
		return (
			<div className='text-center py-10'>
				<p className='text-danger-text-dark font-bold'>{error}</p>
				<Button
					variant='outline'
					className='mt-4'
					onClick={fetchCommunityBuilds}
				>
					Thử lại
				</Button>
			</div>
		);
	}

	return (
		<div className='space-y-4'>
			<div className='flex justify-between items-center px-1'>
				<h2 className='text-xl font-bold text-primary-500 font-primary'>
					Bộ cổ vật cộng đồng
				</h2>
				<span className='text-sm text-text-secondary bg-surface-bg-alt px-3 py-1 rounded-full border border-border'>
					{totalItems} bộ cổ vật
				</span>
			</div>

			<AnimatePresence mode='wait'>
				{isLoading ? (
					<motion.div
						key='skeleton-grid'
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
						key='content-grid'
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						transition={{ duration: 0.3 }}
					>
						{communityBuilds.length > 0 ? (
							<>
								<div
									className={`grid grid-cols-1 md:grid-cols-2 ${showDesktopFilter ? "xl:grid-cols-3" : "xl:grid-cols-4"} gap-6`}
								>
									{communityBuilds.map(build => (
										<motion.div key={build.id} layout>
											<BuildSummary
												build={{
													...build,
													creatorName:
														creatorNames[build.creator] ||
														build.creatorName ||
														"Người chơi",
												}}
												championsList={championsList}
												relicsList={relicsList}
												powersList={powersList}
												runesList={runesList}
												onBuildUpdate={handleBuildUpdated}
												onBuildDelete={handleBuildDeleted}
												onFavoriteToggle={onFavoriteToggle}
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
									Không tìm thấy bộ cổ vật nào phù hợp.
								</p>
							</div>
						)}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

export default CommunityBuilds;
