// src/components/build/myFavoriteBuild.jsx
import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext.jsx";
import BuildSummary from "./buildSummary";
import { useBatchFavoriteData } from "../../hooks/useBatchFavoriteData";
import Button from "../common/button.jsx";

const ITEMS_PER_PAGE = 12; // Số lượng build mỗi trang

const MyFavorite = ({
	searchTerm,
	selectedStarLevels, // Chuỗi CSV từ buildList
	selectedRegions, // Chuỗi CSV từ buildList
	championsList,
	relicsList,
	powersList,
	runesList,
	refreshKey,
	onFavoriteToggle,
	onDeleteSuccess,
	sortBy, // Định dạng: "field-order"
}) => {
	const { token } = useContext(AuthContext);
	const [favoriteBuilds, setFavoriteBuilds] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [creatorNames, setCreatorNames] = useState({});

	// State phân trang đồng bộ với Backend
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [totalItems, setTotalItems] = useState(0);

	const apiUrl = import.meta.env.VITE_API_URL;

	// Lấy lượt like realtime cho danh sách đang hiển thị
	const { favoriteCounts } = useBatchFavoriteData(favoriteBuilds, token);

	/**
	 * Fetch tên người tạo từ danh sách User ID (sub)
	 */
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
			console.error("Lỗi lấy tên người tạo:", err);
		}
	};

	/**
	 * Effect: Fetch danh sách yêu thích khi filter/page thay đổi
	 */
	useEffect(() => {
		const fetchFavoriteBuilds = async () => {
			if (!token) {
				setFavoriteBuilds([]);
				setIsLoading(false);
				return;
			}
			setIsLoading(true);
			setError(null);

			// Xây dựng params gửi lên Backend
			const params = new URLSearchParams({
				page: currentPage,
				limit: ITEMS_PER_PAGE,
				searchTerm: searchTerm || "",
				sort: sortBy || "favAt-desc", // Sắp xếp theo ngày yêu thích mặc định
				// Nếu backend favorites.js đã hỗ trợ thêm regions/stars, ta truyền vào đây:
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

				// Xử lý dữ liệu theo cấu trúc { items, pagination }
				const items = data.items || [];
				const pagination = data.pagination || {};

				setFavoriteBuilds(items);
				setTotalPages(pagination.totalPages || 1);
				setTotalItems(pagination.totalItems || 0);

				fetchCreatorNames(items);
			} catch (err) {
				setError(err.message);
			} finally {
				setIsLoading(false);
			}
		};
		fetchFavoriteBuilds();
	}, [
		token,
		refreshKey,
		currentPage,
		searchTerm,
		sortBy,
		selectedStarLevels,
		selectedRegions,
	]);

	// Reset về trang 1 khi người dùng thay đổi bộ lọc
	useEffect(() => {
		setCurrentPage(1);
	}, [searchTerm, selectedStarLevels, selectedRegions, sortBy]);

	const handlePageChange = newPage => {
		if (newPage >= 1 && newPage <= totalPages) {
			setCurrentPage(newPage);
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
	};

	const handleBuildUpdated = updatedBuild => {
		// Nếu người dùng bỏ yêu thích, xóa build khỏi danh sách hiện tại
		if (updatedBuild.isFavorited === false) {
			setFavoriteBuilds(current =>
				current.filter(b => b.id !== updatedBuild.id),
			);
			setTotalItems(prev => Math.max(0, prev - 1));
		}
		if (onFavoriteToggle) onFavoriteToggle();
	};

	const handleBuildDeleted = deletedBuildId => {
		setFavoriteBuilds(current => current.filter(b => b.id !== deletedBuildId));
		if (onDeleteSuccess) onDeleteSuccess();
	};

	if (isLoading)
		return (
			<div className='flex justify-center py-20'>
				<p className='text-text-secondary animate-pulse'>
					Đang tải danh sách yêu thích...
				</p>
			</div>
		);

	if (error)
		return (
			<div className='text-center py-10'>
				<p className='text-danger-text-dark font-bold'>{error}</p>
				<Button
					variant='outline'
					className='mt-4'
					onClick={() => window.location.reload()}
				>
					Thử lại
				</Button>
			</div>
		);

	if (favoriteBuilds.length === 0)
		return (
			<div className='text-center py-20 bg-surface-bg-alt rounded-lg border border-dashed border-border mt-6'>
				<p className='text-text-secondary italic'>
					{searchTerm || selectedRegions || selectedStarLevels
						? "Không tìm thấy kết quả phù hợp trong danh sách yêu thích."
						: "Bạn chưa yêu thích bộ cổ vật nào."}
				</p>
			</div>
		);

	return (
		<>
			<div className='mb-4 flex justify-between items-center px-2'>
				<h2 className='text-lg font-bold text-primary-500 font-primary'>
					Yêu thích của tôi
				</h2>
				<span className='text-xs text-text-secondary'>
					Tổng số: {totalItems}
				</span>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mt-6'>
				{favoriteBuilds.map(build => (
					<BuildSummary
						key={build.id}
						build={{
							...build,
							creatorName:
								creatorNames[build.creator] ||
								build.creatorName ||
								"Người chơi",
						}}
						initialIsFavorited={true} // Trang này mặc định là đã fav
						championsList={championsList}
						relicsList={relicsList}
						powersList={powersList}
						runesList={runesList}
						onBuildUpdate={handleBuildUpdated}
						onBuildDelete={handleBuildDeleted}
						onFavoriteToggle={onFavoriteToggle}
						initialLikeCount={favoriteCounts[build.id] || build.like || 0}
						isFavoritePage={true}
					/>
				))}
			</div>

			{/* UI Phân trang */}
			{totalPages > 1 && (
				<div className='mt-12 flex justify-center items-center gap-4 border-t border-border pt-8'>
					<Button
						onClick={() => handlePageChange(currentPage - 1)}
						disabled={currentPage === 1}
						variant='outline'
						size='sm'
					>
						Trang trước
					</Button>

					<div className='flex items-center gap-2'>
						<span className='text-sm font-medium text-text-primary'>
							Trang {currentPage}
						</span>
						<span className='text-text-secondary text-sm'>/ {totalPages}</span>
					</div>

					<Button
						onClick={() => handlePageChange(currentPage + 1)}
						disabled={currentPage === totalPages}
						variant='outline'
						size='sm'
					>
						Trang sau
					</Button>
				</div>
			)}
		</>
	);
};

export default MyFavorite;
