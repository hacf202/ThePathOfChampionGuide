import React, { useState, useEffect, useCallback, useMemo } from "react";
import VongQuayNgauNhien from "../components/wheel/radomWheel";
import SidePanel from "../components/wheel/sidePanelWheel";
import PageTitle from "../components/common/pageTitle";
import SafeImage from "@/components/common/SafeImage";

// Giữ nguyên import cho maps
import mapsData from "../assets/data/map.json";

// --- HÀM TIỆN ÍCH: Sắp xếp theo tên ---

const sortByName = (a, b) => {
	const nameA = a?.name || ""; // Nếu a hoặc name không tồn tại, dùng chuỗi rỗng
	const nameB = b?.name || "";
	return nameA.localeCompare(nameB);
};

function RandomizerPage() {
	const [originalWheelsData, setOriginalWheelsData] = useState({});
	const [customItemsText, setCustomItemsText] = useState({});
	const [checkedItems, setCheckedItems] = useState({});
	const [activeWheelKey, setActiveWheelKey] = useState("champions");
	const [isWheelVisible, setIsWheelVisible] = useState(true);
	const [isPanelOpen, setIsPanelOpen] = useState(true);
	const [filterCategories, setFilterCategories] = useState({});
	const [activeFilters, setActiveFilters] = useState({});
	const [isLoading, setIsLoading] = useState(true);

	const backendUrl = import.meta.env.VITE_API_URL;

	// Fetch data từ API
	const fetchData = useCallback(async () => {
		setIsLoading(true);
		try {
			const [championsRes, relicsRes, itemsRes, powersRes] = await Promise.all([
				fetch(`${backendUrl}/api/champions`), // Giả sử có API /api/champions
				fetch(`${backendUrl}/api/relics`),
				fetch(`${backendUrl}/api/items`),
				fetch(`${backendUrl}/api/generalPowers`), // Sử dụng /api/generalPowers cho powers
			]);

			if (!championsRes.ok || !relicsRes.ok || !itemsRes.ok || !powersRes.ok) {
				throw new Error("Failed to fetch data");
			}

			const [championsData, relicsData, itemsData, powersData] =
				await Promise.all([
					championsRes.json(),
					relicsRes.json(),
					itemsRes.json(),
					powersRes.json(),
				]);

			const initialData = {
				champions: {
					key: "champions",
					title: "Tướng",
					items: [...championsData].sort(sortByName),
				},
				maps: {
					key: "maps",
					title: "Map",
					items: [...mapsData].sort(sortByName),
				},
				relics: {
					key: "relics",
					title: "Cổ Vật",
					items: relicsData
						.filter(relic => relic.name)
						.map(relic => ({
							name: relic.name,
							rarity: relic.rarity || "Chung",
							assetAbsolutePath: relic.assetAbsolutePath,
						}))
						.sort(sortByName),
				},
				items: {
					key: "items",
					title: "Vật Phẩm",
					items: itemsData
						.filter(item => item.name)
						.map(item => ({
							name: item.name,
							rarity: item.rarity || "Chung",
							assetAbsolutePath: item.assetAbsolutePath,
						}))
						.sort(sortByName),
				},
				powers: {
					key: "powers",
					title: "Sức Mạnh",
					items: powersData
						.filter(
							power =>
								power.name && power.type && power.type.includes("General Power")
						)
						.map(power => ({
							name: power.name,
							rarity: power.rarity || "Chung",
							type: power.type,
							assetAbsolutePath: power.assetAbsolutePath,
							description: power.description, // Thêm trường description để hiển thị nội dung sức mạnh
						}))
						.sort(sortByName),
				},
			};
			setOriginalWheelsData(initialData);

			const initialChecked = {};
			const initialText = {};
			const initialFilters = {};
			const initialActiveFilters = {};

			for (const key in initialData) {
				const itemChecks = {};
				initialData[key].items.forEach(item => {
					itemChecks[item.name] = true;
				});
				initialChecked[key] = itemChecks;
				initialText[key] = "";

				if (key === "champions") {
					initialFilters.champions = {
						regions: [
							"Tất cả",
							...[
								...new Set(
									initialData[key].items.flatMap(item => item.regions || [])
								),
							].sort(),
						],
						maxStar: ["Tất cả", "3", "4", "6", "7"],
						tags: [
							"Tất cả",
							...[
								...new Set(
									initialData[key].items.flatMap(item => item.tags || [])
								),
							].sort(),
						],
						cost: [
							"Tất cả",
							"1",
							"2",
							"3",
							"4",
							"5",
							"6",
							"7",
							"8",
							"9",
							"10",
							"12",
							"15",
						],
					};
					initialActiveFilters.champions = {
						regions: "Tất cả",
						maxStar: "Tất cả",
						tags: "Tất cả",
						cost: "Tất cả",
					};
				} else if (key === "powers") {
					initialFilters.powers = {
						rarity: [
							"Tất cả",
							...new Set(initialData[key].items.map(item => item.rarity)),
						].sort(),
						type: [
							"Tất cả",
							...new Set(
								initialData[key].items.flatMap(item => item.type || [])
							),
						].sort(),
					};
					initialActiveFilters.powers = {
						rarity: "Tất cả",
						type: "Tất cả",
					};
				} else {
					initialFilters[key] = [
						"Tất cả",
						...new Set(
							initialData[key].items.map(item => item.rarity || "Chung")
						),
					].sort();
					initialActiveFilters[key] = "Tất cả";
				}
			}
			setCheckedItems(initialChecked);
			setCustomItemsText(initialText);
			setFilterCategories(initialFilters);
			setActiveFilters(initialActiveFilters);
		} catch (error) {
			console.error("Error fetching data:", error);
			// Fallback to local data if API fails (optional)
		} finally {
			setIsLoading(false);
		}
	}, [backendUrl]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	// Các hàm xử lý khác giữ nguyên
	const handleSelectWheel = key => {
		setActiveWheelKey(key);
		setIsWheelVisible(false);
		setTimeout(() => setIsWheelVisible(true), 300); // Delay để animation mượt
	};

	const handleCustomItemsChange = (key, value) => {
		setCustomItemsText(prev => ({ ...prev, [key]: value }));
	};

	const handleCheckboxChange = (key, itemName, checked) => {
		setCheckedItems(prev => ({
			...prev,
			[key]: {
				...prev[key],
				[itemName]: checked,
			},
		}));
	};

	// Define handleRemoveItem
	const handleRemoveItem = useCallback(
		winner => {
			// 1. Xóa khỏi danh sách quay
			setOriginalWheelsData(prev => ({
				...prev,
				[activeWheelKey]: {
					...prev[activeWheelKey],
					items: prev[activeWheelKey].items.filter(
						item => item.name !== winner.name
					),
				},
			}));
			handleCheckboxChange(activeWheelKey, winner.name, false);
		},
		[activeWheelKey, handleCheckboxChange]
	);

	const handleSelectAll = key => {
		const wheel = originalWheelsData[key];
		if (wheel) {
			const allChecked = {};
			wheel.items.forEach(item => {
				allChecked[item.name] = true;
			});
			setCheckedItems(prev => ({ ...prev, [key]: allChecked }));
		}
	};

	const handleDeselectAll = key => {
		const wheel = originalWheelsData[key];
		if (wheel) {
			const allUnchecked = {};
			wheel.items.forEach(item => {
				allUnchecked[item.name] = false;
			});
			setCheckedItems(prev => ({ ...prev, [key]: allUnchecked }));
		}
	};

	const handleFilterChange = (key, filterType, value) => {
		setActiveFilters(prev => {
			const current = prev[key];
			if (filterType === null) {
				// For button filters (string)
				return { ...prev, [key]: value };
			} else {
				// For dropdown filters (object)
				return {
					...prev,
					[key]: {
						...(current || {}),
						[filterType]: value,
					},
				};
			}
		});
	};

	const filteredItems = useMemo(() => {
		const wheel = originalWheelsData[activeWheelKey];
		if (!wheel) return [];

		let items = wheel.items;

		// Áp dụng filter cho panel (không áp dụng checked, chỉ filter)
		const filters = activeFilters[activeWheelKey];
		if (filters) {
			items = items.filter(item => {
				if (activeWheelKey === "champions") {
					const { regions, maxStar, tags, cost } = filters;
					if (regions !== "Tất cả" && !item.regions?.includes(regions))
						return false;
					if (maxStar !== "Tất cả" && item.maxStar != maxStar) return false;
					if (tags !== "Tất cả" && !item.tags?.includes(tags)) return false;
					if (cost !== "Tất cả" && item.cost != cost) return false;
				} else if (activeWheelKey === "powers") {
					const { rarity, type } = filters;
					if (rarity !== "Tất cả" && item.rarity !== rarity) return false;
					if (type !== "Tất cả" && !item.type?.includes(type)) return false;
				} else {
					if (
						typeof filters === "string" &&
						filters !== "Tất cả" &&
						item.rarity !== filters
					)
						return false;
				}
				return true;
			});
		}
		return items;
	}, [activeWheelKey, originalWheelsData, activeFilters]);

	const itemsForWheel = useMemo(() => {
		const wheel = originalWheelsData[activeWheelKey];
		if (!wheel) return [];

		let items = wheel.items.filter(
			item => checkedItems[activeWheelKey]?.[item.name]
		);

		// Thêm custom items nếu có
		const customText = customItemsText[activeWheelKey];
		if (customText) {
			const customItems = customText
				.split("\n")
				.filter(line => line.trim())
				.map(line => ({ name: line.trim(), custom: true }));
			items = [...items, ...customItems];
		}

		// Áp dụng filter
		const filters = activeFilters[activeWheelKey];
		if (filters) {
			items = items.filter(item => {
				if (activeWheelKey === "champions") {
					const { regions, maxStar, tags, cost } = filters;
					if (regions !== "Tất cả" && !item.regions?.includes(regions))
						return false;
					if (maxStar !== "Tất cả" && item.maxStar != maxStar) return false;
					if (tags !== "Tất cả" && !item.tags?.includes(tags)) return false;
					if (cost !== "Tất cả" && item.cost != cost) return false;
				} else if (activeWheelKey === "powers") {
					const { rarity, type } = filters;
					if (rarity !== "Tất cả" && item.rarity !== rarity) return false;
					if (type !== "Tất cả" && !item.type?.includes(type)) return false;
				} else {
					if (
						typeof filters === "string" &&
						filters !== "Tất cả" &&
						item.rarity !== filters
					)
						return false;
				}
				return true;
			});
		}
		return items;
	}, [
		activeWheelKey,
		originalWheelsData,
		checkedItems,
		customItemsText,
		activeFilters,
	]);

	const activeWheel = originalWheelsData[activeWheelKey];

	if (isLoading) {
		return (
			<div className='bg-gradient-to-br from-slate-600 to-gray-100 min-h-screen flex items-center justify-center'>
				<div className='animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500'></div>
			</div>
		);
	}

	return (
		<div>
			<PageTitle
				title='Vòng Quay'
				description='POC GUIDE: Vòng Quay con đường anh hùng.'
			/>
			<div className='bg-gradient-to-br from-slate-600 to-gray-100 min-h-screen flex relative overflow-hidden'>
				{isPanelOpen && (
					<div
						onClick={() => setIsPanelOpen(false)}
						className='fixed inset-0 bg-black/0 z-20'
					/>
				)}
				<main className='relative flex-grow min-h-screen bg-gradient-to-br from-slate-600 to-gray-100 overflow-hidden'>
					{/* CĂN GIỮA TUYỆT ĐỐI */}
					<div className='absolute inset-0 flex items-center justify-center p-4'>
						<div
							className={`
								transition-opacity duration-300
								${isWheelVisible ? "opacity-100" : "opacity-0"}
							`}
						>
							{activeWheel && (
								<div
									className='
										scale-75
										sm:scale-75
										md:scale-90
										lg:scale-90
										xl:scale-90
										transform-gpu
									'
									style={{ transformOrigin: "center center" }}
								>
									<VongQuayNgauNhien
										key={activeWheel.key}
										items={itemsForWheel}
										title={activeWheel.title}
										onRemoveWinner={handleRemoveItem}
									/>
								</div>
							)}
						</div>
					</div>
				</main>
				{!isPanelOpen && (
					<button
						onClick={() => setIsPanelOpen(true)}
						className='fixed top-1/2 right-0 -translate-y-1/2 bg-slate-800 text-white p-3 rounded-l-lg shadow-lg z-40 hover:bg-slate-700 transition-colors'
						title='Mở bảng điều khiển'
					>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							className='h-6 w-6'
							fill='none'
							viewBox='0 0 24 24'
							stroke='currentColor'
							strokeWidth={2}
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								d='M11 19l-7-7 7-7m8 14l-7-7 7-7'
							/>
						</svg>
					</button>
				)}
				<aside
					className={`fixed top-20 bottom-0 right-0 transition-transform duration-300 ease-in-out z-30 ${
						isPanelOpen ? "translate-x-0" : "translate-x-full"
					}`}
					style={{ width: "24rem", maxWidth: "100vw" }}
				>
					{activeWheel && (
						<SidePanel
							wheelsData={originalWheelsData}
							activeWheelKey={activeWheelKey}
							onSelectWheel={handleSelectWheel}
							setIsOpen={setIsPanelOpen}
							customItemsText={customItemsText[activeWheelKey] || ""}
							onCustomItemsChange={handleCustomItemsChange}
							originalItems={filteredItems}
							checkedItems={checkedItems[activeWheelKey]}
							onCheckboxChange={handleCheckboxChange}
							onSelectAll={handleSelectAll}
							onDeselectAll={handleDeselectAll}
							filters={filterCategories[activeWheelKey]}
							activeFilter={activeFilters[activeWheelKey]}
							onFilterChange={handleFilterChange}
						/>
					)}
				</aside>
			</div>
		</div>
	);
}

export default RandomizerPage;
