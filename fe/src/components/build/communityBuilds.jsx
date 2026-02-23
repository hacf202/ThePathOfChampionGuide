// src/components/build/communityBuilds.jsx
import React, { useEffect, useState, useContext } from "react";
import BuildSummary from "./buildSummary";
import { useBatchFavoriteData } from "../../hooks/useBatchFavoriteData";
import { AuthContext } from "../../context/AuthContext.jsx";
import Button from "../common/button.jsx";

// Đồng bộ số lượng item mỗi trang với Backend (mặc định nên khớp hoặc gửi limit lên)
const ITEMS_PER_PAGE = 12;

const CommunityBuilds = ({
	searchTerm,
	selectedStarLevels, // Đã là chuỗi CSV từ buildList.jsx
	selectedRegions, // Đã là chuỗi CSV từ buildList.jsx
	championsList,
	relicsList,
	powersList,
	runesList,
	refreshKey,
	onEditSuccess,
	onDeleteSuccess,
	onFavoriteToggle,
	sortBy, // Đã là "field-order" (vd: createdAt-desc)
}) => {
	const { token } = useContext(AuthContext);

	const [communityBuilds, setCommunityBuilds] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [creatorNames, setCreatorNames] = useState({});

	// State phân trang nhận từ Backend
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [totalItems, setTotalItems] = useState(0);

	const apiUrl = import.meta.env.VITE_API_URL;

	// Hook xử lý trạng thái yêu thích cho danh sách hiện tại
	const { favoriteStatus, favoriteCounts } = useBatchFavoriteData(
		communityBuilds,
		token,
	);

	/**
	 * Fetch tên người hiển thị từ Username/Sub của Cognito
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
			console.error("Failed to fetch creator names:", err);
		}
	};

	/**
	 * Effect chính: Fetch dữ liệu mỗi khi filter hoặc page thay đổi
	 */
	useEffect(() => {
		const fetchCommunityBuilds = async () => {
			setIsLoading(true);
			setError(null);

			// Xây dựng Query Params đồng bộ với route GET /api/builds ở backend
			const params = new URLSearchParams({
				page: currentPage,
				limit: ITEMS_PER_PAGE,
				searchTerm: searchTerm || "",
				regions: selectedRegions || "",
				stars: selectedStarLevels || "", // Lưu ý: Backend builds.js cần hỗ trợ filter này
				sort: sortBy || "createdAt-desc",
			});

			try {
				const response = await fetch(
					`${apiUrl}/api/builds?${params.toString()}`,
				);
				if (!response.ok) throw new Error("Không thể kết nối đến máy chủ");

				const data = await response.json();

				// Backend trả về { items, pagination: { totalItems, totalPages, ... } }
				const items = data.items || [];
				const pagination = data.pagination || {};

				setCommunityBuilds(items);
				setTotalPages(pagination.totalPages || 1);
				setTotalItems(pagination.totalItems || 0);

				// Chỉ fetch tên cho những build đang hiển thị
				fetchCreatorNames(items);
			} catch (err) {
				setError(err.message);
			} finally {
				setIsLoading(false);
			}
		};

		fetchCommunityBuilds();
	}, [
		currentPage,
		searchTerm,
		selectedStarLevels,
		selectedRegions,
		sortBy,
		refreshKey,
		apiUrl,
	]);

	// Reset về trang 1 khi các bộ lọc tìm kiếm thay đổi
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
		setCommunityBuilds(current =>
			current.map(b => (b.id === updatedBuild.id ? updatedBuild : b)),
		);
		if (onEditSuccess) onEditSuccess();
	};

	const handleBuildDeleted = deletedBuildId => {
		setCommunityBuilds(current => current.filter(b => b.id !== deletedBuildId));
		if (onDeleteSuccess) onDeleteSuccess();
	};

	if (isLoading)
		return (
			<div className='flex flex-col items-center justify-center py-20'>
				<p className='text-text-secondary animate-pulse'>
					Đang tải danh sách build...
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

	if (communityBuilds.length === 0)
		return (
			<div className='text-center py-20 bg-surface-bg-alt rounded-lg border border-dashed border-border mt-6'>
				<p className='text-text-secondary italic'>
					Không có bộ cổ vật nào phù hợp với tìm kiếm của bạn.
				</p>
			</div>
		);

	return (
		<>
			{/* Header thông tin */}
			<div className='mb-4 flex justify-between items-end px-2'>
				<h2 className='text-lg font-bold text-primary-500 font-primary'>
					Khám phá cộng đồng
				</h2>
				<span className='text-xs text-text-secondary'>
					Hiển thị {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{" "}
					{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} trong số{" "}
					{totalItems} build
				</span>
			</div>

			{/* Lưới Build */}
			<div className='grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
				{communityBuilds.map(build => (
					<BuildSummary
						key={build.id}
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
						initialLikeCount={favoriteCounts[build.id] || build.like || 0}
						isFavoritePage={false}
					/>
				))}
			</div>

			{/* Điều khiển Phân trang */}
			{totalPages > 1 && (
				<div className='mt-12 flex flex-col items-center gap-4 border-t border-border pt-8'>
					<div className='flex items-center gap-2'>
						<Button
							onClick={() => handlePageChange(currentPage - 1)}
							disabled={currentPage === 1}
							variant='outline'
							size='sm'
						>
							Trang trước
						</Button>

						<div className='flex items-center gap-1 mx-2'>
							<span className='w-10 h-10 flex items-center justify-center bg-primary-500 text-white rounded-md font-bold shadow-sm'>
								{currentPage}
							</span>
							<span className='text-text-secondary px-1'>/</span>
							<span className='w-10 h-10 flex items-center justify-center border border-border rounded-md text-text-primary'>
								{totalPages}
							</span>
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
					<p className='text-xs text-text-secondary italic'>
						Mẹo: Sử dụng bộ lọc để thu hẹp kết quả tìm kiếm.
					</p>
				</div>
			)}
		</>
	);
};

export default CommunityBuilds;
