// src/components/build/myBuilds.jsx
import React, { useEffect, useState, useMemo, useContext } from "react";
import { AuthContext } from "../../context/AuthContext.jsx";
import BuildSummary from "./buildSummary";
import { useBatchFavoriteData } from "../../hooks/useBatchFavoriteData";
import { removeAccents } from "../../utils/vietnameseUtils";
import Button from "../common/button.jsx";

const ITEMS_PER_PAGE = 12; // Đồng bộ số lượng hiển thị

const MyBuilds = ({
	searchTerm,
	selectedStarLevels, // Chuỗi CSV từ buildList
	selectedRegions, // Chuỗi CSV từ buildList
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
}) => {
	const { user, token } = useContext(AuthContext);
	const [myBuilds, setMyBuilds] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [currentPage, setCurrentPage] = useState(1);

	const apiUrl = import.meta.env.VITE_API_URL;

	const { favoriteStatus, favoriteCounts } = useBatchFavoriteData(
		myBuilds,
		token,
	);

	useEffect(() => {
		const fetchMyBuilds = async () => {
			if (!token) {
				setError("Vui lòng đăng nhập");
				setIsLoading(false);
				return;
			}
			setIsLoading(true);
			const cacheKey = "my-builds";
			const cached = getCache?.(cacheKey);

			if (cached) {
				setMyBuilds(cached);
				setIsLoading(false);
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
				setIsLoading(false);
			}
		};
		fetchMyBuilds();
	}, [token, refreshKey, apiUrl]); // Chỉ fetch lại khi token hoặc refreshKey thay đổi

	// Chuyển đổi chuỗi CSV từ props thành mảng để lọc ở client
	const starFilters = useMemo(
		() => (selectedStarLevels ? selectedStarLevels.split(",") : []),
		[selectedStarLevels],
	);
	const regionFilters = useMemo(
		() => (selectedRegions ? selectedRegions.split(",") : []),
		[selectedRegions],
	);

	useEffect(() => {
		setCurrentPage(1);
	}, [searchTerm, selectedStarLevels, selectedRegions, sortBy]);

	const filteredMyBuilds = useMemo(() => {
		let result = [...myBuilds];

		// --- 1. TÌM KIẾM ---
		if (searchTerm) {
			const lowerTerm = removeAccents(searchTerm.toLowerCase());
			result = result.filter(build => {
				const championName = removeAccents(
					(build.championName || "").toLowerCase(),
				);
				const description = removeAccents(
					(build.description || "").toLowerCase(),
				);
				const hasRelic = (build.relicSet || []).some(r =>
					removeAccents(r.toLowerCase()).includes(lowerTerm),
				);

				return (
					championName.includes(lowerTerm) ||
					description.includes(lowerTerm) ||
					hasRelic
				);
			});
		}

		// --- 2. LỌC SAO ---
		if (starFilters.length > 0) {
			result = result.filter(build => starFilters.includes(String(build.star)));
		}

		// --- 3. LỌC KHU VỰC ---
		if (regionFilters.length > 0) {
			result = result.filter(build => {
				const bRegions =
					build.regions ||
					championNameToRegionsMap?.get(build.championName) ||
					[];
				return bRegions.some(r => regionFilters.includes(r));
			});
		}

		// --- 4. SẮP XẾP (Đồng bộ field-order với Backend) ---
		result.sort((a, b) => {
			const [field, order] = sortBy.split("-");
			let vA = a[field] ?? "";
			let vB = b[field] ?? "";

			if (field === "createdAt") {
				vA = new Date(vA);
				vB = new Date(vB);
			}

			if (order === "asc") {
				return vA > vB ? 1 : -1;
			} else {
				return vA < vB ? 1 : -1;
			}
		});

		return result;
	}, [
		myBuilds,
		searchTerm,
		starFilters,
		regionFilters,
		sortBy,
		championNameToRegionsMap,
	]);

	const totalPages = Math.ceil(filteredMyBuilds.length / ITEMS_PER_PAGE);
	const currentBuilds = useMemo(() => {
		const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
		return filteredMyBuilds.slice(startIndex, startIndex + ITEMS_PER_PAGE);
	}, [filteredMyBuilds, currentPage]);

	const handlePageChange = newPage => {
		if (newPage >= 1 && newPage <= totalPages) {
			setCurrentPage(newPage);
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
	};

	const handleBuildUpdated = updatedBuild => {
		setMyBuilds(current =>
			current.map(b => (b.id === updatedBuild.id ? updatedBuild : b)),
		);
		if (onEditSuccess) onEditSuccess();
	};

	const handleBuildDeleted = deletedBuildId => {
		setMyBuilds(current => current.filter(b => b.id !== deletedBuildId));
		if (onDeleteSuccess) onDeleteSuccess();
	};

	if (isLoading)
		return (
			<p className='text-center py-10 text-text-secondary'>
				Đang tải dữ liệu...
			</p>
		);
	if (error)
		return <p className='text-danger-text-dark text-center py-10'>{error}</p>;
	if (myBuilds.length === 0)
		return (
			<p className='text-center py-10 text-text-secondary'>
				Bạn chưa tạo bộ cổ vật nào.
			</p>
		);

	return (
		<>
			<div className='mb-4 flex justify-between items-center px-2'>
				<h2 className='text-lg font-bold text-primary-500 font-primary'>
					Bộ cổ vật của tôi
				</h2>
				<span className='text-xs text-text-secondary'>
					Tổng số: {filteredMyBuilds.length}
				</span>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
				{currentBuilds.map(build => (
					<BuildSummary
						key={build.id}
						build={{ ...build, creatorName: user?.name || "Tôi" }}
						championsList={championsList}
						relicsList={relicsList}
						powersList={powersList}
						runesList={runesList}
						onBuildUpdate={handleBuildUpdated}
						onBuildDelete={handleBuildDeleted}
						initialIsFavorited={!!favoriteStatus[build.id]}
						initialLikeCount={favoriteCounts[build.id] || build.like || 0}
						isFavoritePage={false}
					/>
				))}
			</div>

			{totalPages > 1 && (
				<div className='mt-8 flex justify-center items-center gap-4 border-t border-border pt-6'>
					<Button
						onClick={() => handlePageChange(currentPage - 1)}
						disabled={currentPage === 1}
						variant='outline'
					>
						Trang trước
					</Button>
					<span className='text-md font-medium text-text-primary'>
						{currentPage} / {totalPages}
					</span>
					<Button
						onClick={() => handlePageChange(currentPage + 1)}
						disabled={currentPage === totalPages}
						variant='outline'
					>
						Trang sau
					</Button>
				</div>
			)}
		</>
	);
};

export default MyBuilds;
