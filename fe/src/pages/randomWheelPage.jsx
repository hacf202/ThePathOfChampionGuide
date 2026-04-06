// src/pages/randomizerPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import VongQuayNgauNhien from "../components/wheel/radomWheel";
import SidePanel from "../components/wheel/sidePanelWheel";
import PageTitle from "../components/common/pageTitle";
import { Loader2 } from "lucide-react";
import { useTranslation } from "../hooks/useTranslation"; // 🟢 Import Hook

// Import dữ liệu bản đồ cố định
import mapsData from "../assets/data/map.json";

// --- HÀM TIỆN ÍCH: Sắp xếp theo tên ---
const sortByName = (a, b) => {
	const nameA = a?.name || "";
	const nameB = b?.name || "";
	return nameA.localeCompare(nameB);
};

function RandomizerPage() {
	const { tUI, tDynamic, language } = useTranslation(); // 🟢 Khởi tạo Hook
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

	const fetchData = useCallback(async () => {
		setIsLoading(true);
		try {
			const queryLimit = "?page=1&limit=-1";

			const [championsRes, relicsRes, itemsRes, powersRes, runesRes] =
				await Promise.all([
					fetch(`${backendUrl}/api/champions${queryLimit}`),
					fetch(`${backendUrl}/api/relics${queryLimit}`),
					fetch(`${backendUrl}/api/items${queryLimit}`),
					// Đã sửa lỗi 404: Gọi đến API /api/powers và thêm query filter types=General Power
					fetch(`${backendUrl}/api/powers${queryLimit}&types=General Power`),
					fetch(`${backendUrl}/api/runes${queryLimit}`),
				]);

			if (!championsRes.ok || !relicsRes.ok || !itemsRes.ok || !powersRes.ok) {
				throw new Error(tUI("randomWheel.errorLoad"));
			}

			const [champData, relicData, itemData, powerData, runeData] =
				await Promise.all([
					championsRes.json(),
					relicsRes.json(),
					itemsRes.json(),
					powersRes.json(),
					runesRes.json(),
				]);

			const championsList = champData.items || champData || [];
			const relicList = relicData.items || relicData || [];
			const itemList = itemData.items || itemData || [];
			const powerList = powerData.items || powerData || [];
			const runeList = runeData.items || runeData || [];

			const initialData = {
				champions: {
					key: "champions",
					title: tUI("randomWheel.champions"),
					items: [...championsList].sort(sortByName),
				},
				maps: {
					key: "maps",
					title: tUI("randomWheel.maps"),
					items: [...mapsData].sort(sortByName),
				},
				relics: {
					key: "relics",
					title: tUI("randomWheel.relics"),
					items: relicList
						.filter(r => r.name)
						.map(r => ({
							...r,
							rarity: r.rarity || tUI("common.commonRarity"),
						}))
						.sort(sortByName),
				},
				items: {
					key: "items",
					title: tUI("randomWheel.items"),
					items: itemList
						.filter(i => i.name)
						.map(i => ({
							...i,
							rarity: i.rarity || tUI("common.commonRarity"),
						}))
						.sort(sortByName),
				},
				powers: {
					key: "powers",
					title: tUI("randomWheel.powers"),
					items: powerList
						.filter(p => p.name)
						.map(p => ({
							...p,
							rarity: p.rarity || tUI("common.commonRarity"),
						}))
						.sort(sortByName),
				},
				runes: {
					key: "runes",
					title: tUI("randomWheel.runes"),
					items: runeList
						.filter(r => r.name)
						.map(r => ({
							...r,
							rarity: r.rarity || tUI("common.commonRarity"),
						}))
						.sort(sortByName),
				},
			};

			setOriginalWheelsData(initialData);

			const initialChecked = {};
			const initialText = {};
			const initialFilters = {};
			const initialActiveFilters = {};

			const allLabel = tUI("common.all");

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
							allLabel,
							...[
								...new Set(
									initialData[key].items.flatMap(i => i.regions || []),
								),
							].sort(),
						],
						maxStar: [allLabel, "3", "4", "6", "7"],
					};
					initialActiveFilters.champions = {
						regions: allLabel,
						maxStar: allLabel,
					};
				} else {
					initialFilters[key] = [
						allLabel,
						...new Set(
							initialData[key].items.map(
								i => i.rarity || tUI("common.commonRarity"),
							),
						),
					].sort();
					initialActiveFilters[key] = allLabel;
				}
			}

			setCheckedItems(initialChecked);
			setCustomItemsText(initialText);
			setFilterCategories(initialFilters);
			setActiveFilters(initialActiveFilters);
		} catch (error) {
			console.error("Lỗi khởi tạo vòng quay:", error);
		} finally {
			setIsLoading(false);
		}
	}, [backendUrl, tUI]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	const handleSelectWheel = key => {
		setActiveWheelKey(key);
		setIsWheelVisible(false);
		setTimeout(() => setIsWheelVisible(true), 300);
	};

	const handleCheckboxChange = (key, itemName, checked) => {
		setCheckedItems(prev => ({
			...prev,
			[key]: { ...prev[key], [itemName]: checked },
		}));
	};

	const handleRemoveItem = useCallback(
		winner => {
			handleCheckboxChange(activeWheelKey, winner.name, false);
		},
		[activeWheelKey],
	);

	const handleFilterChange = (key, filterType, value) => {
		setActiveFilters(prev => {
			if (filterType === null) return { ...prev, [key]: value };
			return {
				...prev,
				[key]: { ...(prev[key] || {}), [filterType]: value },
			};
		});
	};

	const itemsForWheel = useMemo(() => {
		const wheel = originalWheelsData[activeWheelKey];
		if (!wheel) return [];

		let items = wheel.items.filter(
			item => checkedItems[activeWheelKey]?.[item.name],
		);

		const filters = activeFilters[activeWheelKey];
		const allLabel = tUI("common.all");

		if (filters) {
			items = items.filter(item => {
				if (activeWheelKey === "champions") {
					const { regions, maxStar } = filters;
					if (regions !== allLabel && !item.regions?.includes(regions))
						return false;
					if (maxStar !== allLabel && String(item.maxStar) !== maxStar)
						return false;
					return true;
				}
				if (typeof filters === "string") {
					return filters === allLabel || item.rarity === filters;
				}
				return true;
			});
		}

		const customText = customItemsText[activeWheelKey];
		if (customText) {
			const customLines = customText
				.split("\n")
				.filter(l => l.trim())
				.map(l => ({ name: l.trim(), custom: true }));
			items = [...items, ...customLines];
		}

		return items;
	}, [
		activeWheelKey,
		originalWheelsData,
		checkedItems,
		customItemsText,
		activeFilters,
		tUI,
	]);

	if (isLoading) {
		return (
			<div className='bg-slate-600 min-h-screen flex items-center justify-center'>
				<Loader2 className='animate-spin text-white' size={64} />
			</div>
		);
	}

	return (
		<div>
			<PageTitle
				title={tUI("randomWheel.pageTitle")}
				description={tUI("randomWheel.pageDesc")}
			/>
			<div className='bg-gradient-to-br from-slate-600 to-gray-100 min-h-screen flex relative overflow-hidden'>
				{isPanelOpen && (
					<div
						onClick={() => setIsPanelOpen(false)}
						className='fixed inset-0 bg-black/20 z-20'
					/>
				)}

				<main className='relative flex-grow min-h-screen overflow-hidden'>
					<div className='absolute inset-0 flex items-center justify-center p-4'>
						<div
							className={`transition-opacity duration-300 ${isWheelVisible ? "opacity-100" : "opacity-0"}`}
						>
							{originalWheelsData[activeWheelKey] && (
								<div className='scale-75 md:scale-90 transform-gpu'>
									<VongQuayNgauNhien
										key={activeWheelKey}
										items={itemsForWheel}
										title={originalWheelsData[activeWheelKey].title}
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
						className='fixed top-1/2 right-0 -translate-y-1/2 bg-slate-800 text-white p-3 rounded-l-lg shadow-lg z-40 hover:bg-slate-700 transition-all'
					>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							className='h-6 w-6'
							fill='none'
							viewBox='0 0 24 24'
							stroke='currentColor'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M11 19l-7-7 7-7m8 14l-7-7 7-7'
							/>
						</svg>
					</button>
				)}

				<aside
					className={`fixed top-20 bottom-0 right-0 transition-transform duration-300 ease-in-out z-30 ${isPanelOpen ? "translate-x-0" : "translate-x-full"}`}
					style={{ width: "24rem", maxWidth: "100vw" }}
				>
					{originalWheelsData[activeWheelKey] && (
						<SidePanel
							wheelsData={originalWheelsData}
							activeWheelKey={activeWheelKey}
							onSelectWheel={handleSelectWheel}
							setIsOpen={setIsPanelOpen}
							customItemsText={customItemsText[activeWheelKey] || ""}
							onCustomItemsChange={(key, val) =>
								setCustomItemsText(p => ({ ...p, [key]: val }))
							}
							originalItems={originalWheelsData[activeWheelKey].items}
							checkedItems={checkedItems[activeWheelKey]}
							onCheckboxChange={handleCheckboxChange}
							onSelectAll={key => {
								const allChecked = {};
								originalWheelsData[key].items.forEach(
									i => (allChecked[i.name] = true),
								);
								setCheckedItems(p => ({ ...p, [key]: allChecked }));
							}}
							onDeselectAll={key => {
								const allUnchecked = {};
								originalWheelsData[key].items.forEach(
									i => (allUnchecked[i.name] = false),
								);
								setCheckedItems(p => ({ ...p, [key]: allUnchecked }));
							}}
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
