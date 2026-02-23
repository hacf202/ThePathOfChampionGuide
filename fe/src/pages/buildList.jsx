// src/pages/buildList.jsx
import React, { useState, useEffect, useMemo, useContext } from "react";
import BuildCreation from "../components/build/buildCreation";
import MyBuilds from "../components/build/myBuilds";
import MyFavorite from "../components/build/myFavoriteBuild";
import CommunityBuilds from "../components/build/communityBuilds";
import { AuthContext } from "../context/AuthContext.jsx";
import {
	PlusCircle,
	Globe,
	Shield,
	Heart,
	Search,
	XCircle,
	RotateCw,
	ChevronDown,
	ChevronUp,
	Loader2,
} from "lucide-react";
import Button from "../components/common/button";
import MultiSelectFilter from "../components/common/multiSelectFilter";
import InputField from "../components/common/inputField";
import DropdownFilter from "../components/common/dropdownFilter";
import PageTitle from "../components/common/pageTitle";
import iconRegionsData from "../assets/data/iconRegions.json";
import { NavLink, useParams, useNavigate } from "react-router-dom";
import { usePersistentState } from "../hooks/usePersistentState";

// === CACHE CONFIG ===
const CACHE_KEY_PREFIX = "buildsCache_v1";
const CACHE_DURATION = 5 * 60 * 1000; // 5 phút

/**
 * Cập nhật SORT_OPTIONS để khớp chính xác với field name tại Backend
 * Cấu trúc: "fieldName-order" (ví dụ: createdAt-desc)
 */
const SORT_OPTIONS = [
	{ value: "createdAt-desc", label: "Mới nhất" },
	{ value: "createdAt-asc", label: "Cũ nhất" },
	{ value: "championName-asc", label: "Tên tướng (A-Z)" },
	{ value: "championName-desc", label: "Tên tướng (Z-A)" },
	{ value: "like-desc", label: "Lượt thích (Cao nhất)" },
	{ value: "like-asc", label: "Lượt thích (Thấp nhất)" },
	{ value: "views-desc", label: "Lượt xem (Nhiều nhất)" },
];

const getCacheKey = (tab, filters) => {
	const filterStr = JSON.stringify({
		search: filters.searchTerm || "",
		stars: filters.selectedStarLevels || [],
		regions: filters.selectedRegions || [],
		sort: filters.sortBy || "createdAt-desc",
	});
	return `${CACHE_KEY_PREFIX}_${tab}_${filterStr}`;
};

const getCachedData = key => {
	try {
		const cached = localStorage.getItem(key);
		if (!cached) return null;
		const { data, timestamp } = JSON.parse(cached);
		if (Date.now() - timestamp > CACHE_DURATION) {
			localStorage.removeItem(key);
			return null;
		}
		return data;
	} catch (err) {
		console.warn("Lỗi đọc cache:", err);
		return null;
	}
};

const setCachedData = (key, data) => {
	try {
		const cacheObj = { data, timestamp: Date.now() };
		localStorage.setItem(key, JSON.stringify(cacheObj));
	} catch (err) {
		console.warn("Không thể lưu cache:", err);
	}
};

const clearAllBuildsCache = () => {
	Object.keys(localStorage)
		.filter(key => key.startsWith(CACHE_KEY_PREFIX))
		.forEach(key => localStorage.removeItem(key));
};

const Builds = () => {
	const { user } = useContext(AuthContext);
	const { tab } = useParams();
	const navigate = useNavigate();

	const activeTab = useMemo(() => {
		const validTabs = ["community", "my-builds", "favorites"];
		return validTabs.includes(tab) ? tab : "community";
	}, [tab]);

	const [showCreateModal, setShowCreateModal] = useState(false);
	const [refreshKey, setRefreshKey] = useState(0);

	// === FILTER STATE (PERSISTENT) ===
	const [searchInput, setSearchInput] = usePersistentState(
		"buildsSearchInput",
		"",
	);
	const [searchTerm, setSearchTerm] = usePersistentState(
		"buildsSearchTerm",
		"",
	);
	const [selectedStarLevels, setSelectedStarLevels] = usePersistentState(
		"buildsSelectedStarLevels",
		[],
	);
	const [selectedRegions, setSelectedRegions] = usePersistentState(
		"buildsSelectedRegions",
		[],
	);
	const [sortBy, setSortBy] = usePersistentState(
		"buildsSortBy",
		"createdAt-desc",
	);

	const [isFilterOpen, setIsFilterOpen] = usePersistentState(
		"buildsIsFilterOpen",
		false,
	);

	// === DATA STATE ===
	const [championsList, setChampionsList] = useState([]);
	const [relicsList, setRelicsList] = useState([]);
	const [powersList, setPowersList] = useState([]);
	const [runesList, setRunesList] = useState([]);
	const [iconRegions, setIconRegions] = useState([]);
	const [loadingData, setLoadingData] = useState(true);
	const [errorData, setErrorData] = useState(null);

	// === FETCH DATA ===
	useEffect(() => {
		const fetchAllData = async () => {
			setLoadingData(true);
			setErrorData(null);
			try {
				const apiUrl = import.meta.env.VITE_API_URL;

				/**
				 * KHẮC PHỤC: Thêm tham số limit lớn (ví dụ: 1000)
				 * để lấy toàn bộ dữ liệu phục vụ việc hiển thị hình ảnh trong Build.
				 */
				const fetchOptions = "?page=1&limit=1000";

				const [champRes, relicRes, powerRes, runeRes] = await Promise.all([
					fetch(`${apiUrl}/api/champions${fetchOptions}`),
					fetch(`${apiUrl}/api/relics${fetchOptions}`),
					fetch(`${apiUrl}/api/generalPowers${fetchOptions}`),
					fetch(`${apiUrl}/api/runes${fetchOptions}`), // Nếu runes cũng có phân trang
				]);

				if (!champRes.ok || !relicRes.ok || !powerRes.ok || !runeRes.ok) {
					throw new Error("Không thể tải dữ liệu từ server");
				}

				const [champData, relicData, powerData, runeData] = await Promise.all([
					champRes.json(),
					relicRes.json(),
					powerRes.json(),
					runeRes.json(),
				]);

				// Backend trả về { items: [...] }, ta gán mảng items vào state
				setChampionsList(champData.items || []);
				setRelicsList(relicData.items || []);
				setPowersList(powerData.items || []);
				setRunesList(runeData.items || []);

				setIconRegions(iconRegionsData);
			} catch (err) {
				console.error("Lỗi tải dữ liệu metadata:", err);
				setErrorData(err.message);
			} finally {
				setLoadingData(false);
			}
		};

		fetchAllData();
	}, []);

	// === MAPS & OPTIONS ===
	const powerMap = useMemo(
		() =>
			new Map(
				powersList.map(p => [
					p.id || p.powerCode || p.generalPowerCode,
					p.name,
				]),
			),
		[powersList],
	);

	const championNameToRegionsMap = useMemo(() => {
		const map = new Map();
		championsList.forEach(champion => {
			if (champion.name && Array.isArray(champion.regions)) {
				map.set(champion.name, champion.regions);
			}
		});
		return map;
	}, [championsList]);

	const regionOptions = useMemo(() => {
		const allRegions = championsList.flatMap(c => c.regions || []);
		const uniqueRegions = [...new Set(allRegions)].sort();
		return uniqueRegions.map(regionName => {
			const regionData = iconRegions.find(r => r.name === regionName);
			return {
				value: regionName,
				label: regionName,
				iconUrl: regionData?.iconAbsolutePath ?? "/fallback-image.svg",
			};
		});
	}, [championsList, iconRegions]);

	const starLevelOptions = useMemo(
		() =>
			[1, 2, 3, 4, 5, 6, 7].map(s => ({
				value: s.toString(),
				label: "",
				isStar: true,
			})),
		[],
	);

	// === HANDLERS ===
	const handleSearch = () => {
		setSearchTerm(searchInput);
		if (window.innerWidth < 1024) {
			setIsFilterOpen(false);
		}
	};

	const handleClearSearch = () => {
		setSearchInput("");
		setSearchTerm("");
	};

	const handleResetFilters = () => {
		handleClearSearch();
		setSelectedStarLevels([]);
		setSelectedRegions([]);
		setSortBy("createdAt-desc");
	};

	const triggerRefresh = () => {
		clearAllBuildsCache();
		setRefreshKey(prev => prev + 1);
	};

	const handleCreateSuccess = () => {
		setShowCreateModal(false);
		triggerRefresh();
		navigate("/builds/my-builds");
	};

	const handleEditSuccess = () => triggerRefresh();
	const handleDeleteSuccess = () => triggerRefresh();
	const handleFavoriteToggle = () => triggerRefresh();

	const changeTab = newTab => {
		navigate(`/builds/${newTab}`);
	};

	// === CACHE UTILS ===
	const cacheUtils = {
		getCache: tabName => {
			const key = getCacheKey(tabName, {
				searchTerm,
				selectedStarLevels,
				selectedRegions,
				sortBy,
			});
			return getCachedData(key);
		},
		setCache: (tabName, data) => {
			const key = getCacheKey(tabName, {
				searchTerm,
				selectedStarLevels,
				selectedRegions,
				sortBy,
			});
			setCachedData(key, data);
		},
		clearCache: clearAllBuildsCache,
	};

	// === COMMON PROPS ===
	const commonProps = {
		searchTerm,
		/** * Backend sử dụng split(",") nên ta chuyển mảng thành chuỗi CSV
		 */
		selectedStarLevels: selectedStarLevels.join(","),
		selectedRegions: selectedRegions.join(","),
		sortBy,
		championsList,
		relicsList,
		powersList,
		runesList,
		refreshKey,
		powerMap,
		championNameToRegionsMap,
		onEditSuccess: handleEditSuccess,
		onDeleteSuccess: handleDeleteSuccess,
		onFavoriteToggle: handleFavoriteToggle,
		...cacheUtils,
	};

	// === RENDER CONTENT ===
	const renderContent = () => {
		if (loadingData) {
			return (
				<div className='flex justify-center items-center h-64'>
					<Loader2 className='animate-spin text-primary-500' size={48} />
				</div>
			);
		}

		if (errorData) {
			return (
				<div className='text-center p-10 bg-danger-bg-light text-danger-text-dark rounded-lg'>
					<h2 className='text-xl font-bold mb-2'>Đã xảy ra lỗi</h2>
					<p className='mb-4'>{errorData}</p>
					<Button onClick={() => window.location.reload()} variant='danger'>
						Tải lại trang
					</Button>
				</div>
			);
		}

		switch (activeTab) {
			case "community":
				return <CommunityBuilds {...commonProps} />;
			case "my-builds":
				return user ? (
					<MyBuilds {...commonProps} />
				) : (
					<p className='text-center p-4'>
						Vui lòng đăng nhập để xem build của bạn.
					</p>
				);
			case "favorites":
				return user ? (
					<MyFavorite {...commonProps} />
				) : (
					<p className='text-center p-4'>
						Vui lòng đăng nhập để xem danh sách yêu thích.
					</p>
				);
			default:
				return <CommunityBuilds {...commonProps} />;
		}
	};

	return (
		<div>
			<PageTitle
				title='Danh sách bộ cổ vật'
				description='Khám phá và chia sẻ các bộ cổ vật (build) tối ưu cho các tướng trong Path of Champions.'
				type='website'
			/>
			<div className='container mx-auto p-2 sm:p-4 text-text-primary font-secondary'>
				<h1 className='text-3xl font-bold text-primary-500 font-primary mb-2'>
					Danh Sách Bộ Cổ Vật
				</h1>

				{/* TABS CONTROL */}
				<div className='flex flex-wrap justify-between gap-2 border-b border-border mb-6'>
					<div className='flex gap-1'>
						<Button
							variant={activeTab === "community" ? "primary" : "ghost"}
							onClick={() => changeTab("community")}
							iconLeft={<Globe size={18} />}
						>
							Cộng Đồng
						</Button>
						{user && (
							<>
								<Button
									variant={activeTab === "my-builds" ? "primary" : "ghost"}
									onClick={() => changeTab("my-builds")}
									iconLeft={<Shield size={18} />}
								>
									Của Tôi
								</Button>
								<Button
									variant={activeTab === "favorites" ? "primary" : "ghost"}
									onClick={() => changeTab("favorites")}
									iconLeft={<Heart size={18} />}
								>
									Yêu Thích
								</Button>
							</>
						)}
					</div>
					{user ? (
						<Button
							variant='primary'
							onClick={() => setShowCreateModal(true)}
							iconLeft={<PlusCircle size={20} />}
						>
							Tạo Bộ Cổ Vật Mới
						</Button>
					) : (
						<NavLink
							to='/auth'
							className='text-md font-bold text-primary-500 hover:underline flex items-center'
						>
							Đăng Nhập Để Tạo Bộ Cổ Vật
						</NavLink>
					)}
				</div>

				<div className='flex flex-col lg:flex-row gap-4 sm:gap-8'>
					{/* ASIDE: FILTERS */}
					<aside className='lg:w-1/5 w-full lg:sticky lg:top-24 h-fit'>
						{/* MOBILE FILTER */}
						<div className='lg:hidden p-4 rounded-lg border border-border bg-surface-bg space-y-4 shadow-sm'>
							<div className='flex items-center gap-2'>
								<div className='flex-1 relative'>
									<InputField
										value={searchInput}
										onChange={e => setSearchInput(e.target.value)}
										onKeyPress={e => e.key === "Enter" && handleSearch()}
										placeholder='Tìm bộ cổ vật...'
									/>
									{searchInput && (
										<button
											onClick={handleClearSearch}
											className='absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary'
										>
											<XCircle size={18} />
										</button>
									)}
								</div>
								<Button onClick={handleSearch}>
									<Search size={16} />
								</Button>
								<Button
									variant='outline'
									onClick={() => setIsFilterOpen(!isFilterOpen)}
								>
									{isFilterOpen ? (
										<ChevronUp size={18} />
									) : (
										<ChevronDown size={18} />
									)}
								</Button>
							</div>

							{isFilterOpen && (
								<div className='pt-4 space-y-4 border-t border-border animate-in fade-in slide-in-from-top-2'>
									<MultiSelectFilter
										label='Cấp sao'
										options={starLevelOptions}
										selectedValues={selectedStarLevels}
										onChange={setSelectedStarLevels}
										placeholder='Tất cả cấp sao'
									/>
									<MultiSelectFilter
										label='Khu vực'
										options={regionOptions}
										selectedValues={selectedRegions}
										onChange={setSelectedRegions}
										placeholder='Tất cả khu vực'
									/>
									<DropdownFilter
										label='Sắp xếp theo'
										options={SORT_OPTIONS}
										selectedValue={sortBy}
										onChange={setSortBy}
									/>
									<Button
										variant='outline'
										onClick={handleResetFilters}
										iconLeft={<RotateCw size={16} />}
										className='w-full'
									>
										Đặt lại
									</Button>
								</div>
							)}
						</div>

						{/* DESKTOP FILTER */}
						<div className='hidden lg:block p-4 rounded-lg border border-border bg-surface-bg space-y-4 shadow-sm'>
							<div>
								<label className='block text-sm font-medium mb-1 text-text-secondary'>
									Tìm kiếm
								</label>
								<div className='relative'>
									<InputField
										value={searchInput}
										onChange={e => setSearchInput(e.target.value)}
										onKeyPress={e => e.key === "Enter" && handleSearch()}
										placeholder='Tên tướng, mô tả...'
									/>
									{searchInput && (
										<button
											onClick={handleClearSearch}
											className='absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary'
										>
											<XCircle size={18} />
										</button>
									)}
								</div>
								<Button onClick={handleSearch} className='w-full mt-2'>
									<Search size={16} className='mr-2' /> Tìm kiếm
								</Button>
							</div>
							<MultiSelectFilter
								label='Cấp sao'
								options={starLevelOptions}
								selectedValues={selectedStarLevels}
								onChange={setSelectedStarLevels}
								placeholder='Tất cả cấp sao'
							/>
							<MultiSelectFilter
								label='Khu vực'
								options={regionOptions}
								selectedValues={selectedRegions}
								onChange={setSelectedRegions}
								placeholder='Tất cả khu vực'
							/>
							<DropdownFilter
								label='Sắp xếp theo'
								options={SORT_OPTIONS}
								selectedValue={sortBy}
								onChange={setSortBy}
							/>
							<Button
								variant='outline'
								onClick={handleResetFilters}
								iconLeft={<RotateCw size={16} />}
								className='w-full pt-2'
							>
								Đặt lại bộ lọc
							</Button>
						</div>
					</aside>

					{/* MAIN CONTENT Area */}
					<div className='lg:w-4/5 w-full lg:order-first'>
						<div className='bg-surface-bg rounded-lg border border-border p-2 sm:p-6 min-h-[400px]'>
							{renderContent()}
						</div>
					</div>
				</div>

				{showCreateModal && (
					<BuildCreation
						onConfirm={handleCreateSuccess}
						onClose={() => setShowCreateModal(false)}
					/>
				)}
			</div>
		</div>
	);
};

export default Builds;
