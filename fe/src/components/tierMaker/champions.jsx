// src/pages/tierList/champions.jsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import {
	DndContext,
	rectIntersection,
	KeyboardSensor,
	PointerSensor,
	TouchSensor,
	useSensor,
	useSensors,
	DragOverlay,
	defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	rectSortingStrategy,
} from "@dnd-kit/sortable";
import {
	Loader2,
	Plus,
	X,
	RotateCw,
	Download,
	Palette,
	XCircle,
	Search,
	ChevronDown,
	ChevronUp,
	Trash2,
	Sparkles,
} from "lucide-react";
import html2canvas from "html2canvas";
import PageTitle from "../../components/common/pageTitle";
import Button from "../../components/common/button";
import InputField from "../../components/common/inputField";
import MultiSelectFilter from "../../components/common/multiSelectFilter";
import iconRegions from "../../assets/data/iconRegions.json";
import { removeAccents } from "../../utils/vietnameseUtils";
import {
	SortableItem,
	DroppableZone,
	COLOR_OPTIONS,
	LOCAL_STORAGE_KEY,
} from "./tierListComponents";

function TierListChampions() {
	const [allChampionsRaw, setAllChampionsRaw] = useState([]);
	const [tiers, setTiers] = useState([]);
	const [unranked, setUnranked] = useState([]);
	const [activeId, setActiveId] = useState(null);
	const [loading, setLoading] = useState(true);
	const [isExporting, setIsExporting] = useState(false);

	const [searchInput, setSearchInput] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedRegions, setSelectedRegions] = useState([]);
	const [selectedCosts, setSelectedCosts] = useState([]);
	const [selectedMaxStars, setSelectedMaxStars] = useState([]);
	const [selectedTags, setSelectedTags] = useState([]);
	const [showColorPicker, setShowColorPicker] = useState(null);
	const [isFilterOpen, setIsFilterOpen] = useState(false);

	const tierListRef = useRef(null);
	const apiUrl = import.meta.env.VITE_API_URL;

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
		useSensor(TouchSensor, {
			activationConstraint: { delay: 250, tolerance: 10 },
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	// Định nghĩa cấu trúc hàng trống mặc định
	const getDefaultTiers = () => [
		{
			id: "tier-s",
			name: "S",
			description: "Bá Đạo",
			color: "#ff7f7f",
			items: [],
		},
		{
			id: "tier-a",
			name: "A",
			description: "Tốt",
			color: "#ffbf7f",
			items: [],
		},
		{ id: "tier-b", name: "B", description: "Ổn", color: "#ffff7f", items: [] },
		{
			id: "tier-c",
			name: "C",
			description: "Yếu",
			color: "#7fff7f",
			items: [],
		},
	];

	// Định nghĩa dữ liệu mẫu (Thay đổi ID tướng tại đây)
	const getSampleData = formattedChampions => {
		const sampleMapping = {
			"tier-s": ["C001", "C002", "C003", "C004", "C005"],
			"tier-a": ["C006", "C007", "C008"],
			"tier-b": ["C009", "C010"],
			"tier-c": ["C011", "C012", "C013"],
		};

		const defaultTiers = getDefaultTiers();
		const usedIds = new Set();

		const sampleTiers = defaultTiers.map(tier => {
			const targetIds = sampleMapping[tier.id] || [];
			const items = formattedChampions.filter(c => targetIds.includes(c.id));
			items.forEach(i => usedIds.add(i.id));
			return { ...tier, items };
		});

		const sampleUnranked = formattedChampions.filter(c => !usedIds.has(c.id));
		return { sampleTiers, sampleUnranked };
	};

	useEffect(() => {
		const initData = async () => {
			try {
				const res = await fetch(`${apiUrl}/api/champions`);
				const data = await res.json();
				const formatted = data.map(c => ({
					id: String(c.championID),
					name: c.name,
					avatar: c.assets?.[0]?.avatar || "/fallback-champion.png",
					regions: Array.isArray(c.regions) ? c.regions : [],
					cost: Number(c.cost) || 0,
					maxStar: Number(c.maxStar) || 3,
					tag: Array.isArray(c.tag) ? c.tag : [],
				}));
				setAllChampionsRaw(formatted);

				const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
				if (saved) {
					const parsed = JSON.parse(saved);
					const hydrateItems = items =>
						items.map(item => {
							const original = formatted.find(f => f.id === item.id);
							return original ? { ...original } : item;
						});
					setTiers(
						parsed.tiers.map(t => ({ ...t, items: hydrateItems(t.items) })),
					);
					setUnranked(hydrateItems(parsed.unranked));
				} else {
					// Lần đầu tải: Tự động dùng mẫu
					const { sampleTiers, sampleUnranked } = getSampleData(formatted);
					setTiers(sampleTiers);
					setUnranked(sampleUnranked);
				}
			} catch (err) {
				console.error(err);
			} finally {
				setLoading(false);
			}
		};
		initData();
	}, [apiUrl]);

	useEffect(() => {
		if (!loading)
			localStorage.setItem(
				LOCAL_STORAGE_KEY,
				JSON.stringify({ tiers, unranked }),
			);
	}, [tiers, unranked, loading]);

	// Chức năng 1: Đặt lại về Tier trống hoàn toàn
	const handleResetToEmpty = () => {
		if (confirm("Xóa toàn bộ tướng khỏi bảng và đưa về kho?")) {
			setTiers(getDefaultTiers());
			setUnranked(allChampionsRaw);
		}
	};

	// Chức năng 2: Đặt lại về dữ liệu mẫu
	const handleResetToSample = () => {
		if (confirm("Bạn muốn khôi phục bảng xếp hạng mẫu?")) {
			const { sampleTiers, sampleUnranked } = getSampleData(allChampionsRaw);
			setTiers(sampleTiers);
			setUnranked(sampleUnranked);
		}
	};

	const filterOptions = useMemo(() => {
		const regions = [...new Set(allChampionsRaw.flatMap(c => c.regions))]
			.sort()
			.map(name => ({
				value: name,
				label: name,
				iconUrl:
					iconRegions.find(r => r.name === name)?.iconAbsolutePath ??
					"/fallback-image.svg",
			}));
		const costs = [...new Set(allChampionsRaw.map(c => c.cost))]
			.filter(c => c > 0)
			.sort((a, b) => a - b)
			.map(v => ({ value: v, isCost: true }));
		const maxStars = [...new Set(allChampionsRaw.map(c => c.maxStar))]
			.sort((a, b) => a - b)
			.map(v => ({ value: v, isStar: true }));
		const tags = [...new Set(allChampionsRaw.flatMap(c => c.tag))]
			.sort()
			.map(v => ({ value: v, label: v, isTag: true }));
		return { regions, costs, maxStars, tags };
	}, [allChampionsRaw]);

	const filteredUnranked = useMemo(() => {
		return unranked.filter(c => {
			const matchesSearch =
				!searchTerm ||
				removeAccents(c.name.toLowerCase()).includes(
					removeAccents(searchTerm.toLowerCase()),
				);
			const matchesRegion =
				selectedRegions.length === 0 ||
				c.regions?.some(r => selectedRegions.includes(r));
			const matchesCost =
				selectedCosts.length === 0 || selectedCosts.includes(c.cost);
			const matchesStar =
				selectedMaxStars.length === 0 || selectedMaxStars.includes(c.maxStar);
			const matchesTag =
				selectedTags.length === 0 || c.tag?.some(t => selectedTags.includes(t));
			return (
				matchesSearch &&
				matchesRegion &&
				matchesCost &&
				matchesStar &&
				matchesTag
			);
		});
	}, [
		unranked,
		searchTerm,
		selectedRegions,
		selectedCosts,
		selectedMaxStars,
		selectedTags,
	]);

	const handleSearch = () => {
		setSearchTerm(searchInput.trim());
		if (window.innerWidth < 1024) setIsFilterOpen(false);
	};

	const handleResetFilters = () => {
		setSearchInput("");
		setSearchTerm("");
		setSelectedRegions([]);
		setSelectedCosts([]);
		setSelectedMaxStars([]);
		setSelectedTags([]);
	};

	const findContainer = id => {
		if (id === "unranked") return "unranked";
		if (unranked.some(i => i.id === id)) return "unranked";
		const tier = tiers.find(t => t.id === id || t.items.some(i => i.id === id));
		return tier ? tier.id : null;
	};

	const handleDragStart = event => setActiveId(event.active.id);

	const handleDragOver = event => {
		const { active, over } = event;
		if (!over) return;
		const activeContainer = findContainer(active.id);
		const overContainer = findContainer(over.id);
		if (!activeContainer || !overContainer || activeContainer === overContainer)
			return;

		const activeItems =
			activeContainer === "unranked"
				? unranked
				: tiers.find(t => t.id === activeContainer).items;
		const item = activeItems.find(i => i.id === active.id);

		if (activeContainer === "unranked") {
			setUnranked(prev => prev.filter(i => i.id !== active.id));
			setTiers(prev =>
				prev.map(t =>
					t.id === overContainer ? { ...t, items: [...t.items, item] } : t,
				),
			);
		} else if (overContainer === "unranked") {
			setTiers(prev =>
				prev.map(t =>
					t.id === activeContainer
						? { ...t, items: t.items.filter(i => i.id !== active.id) }
						: t,
				),
			);
			setUnranked(prev => [...prev, item]);
		} else {
			setTiers(prev =>
				prev.map(t => {
					if (t.id === activeContainer)
						return { ...t, items: t.items.filter(i => i.id !== active.id) };
					if (t.id === overContainer)
						return { ...t, items: [...t.items, item] };
					return t;
				}),
			);
		}
	};

	const handleDragEnd = event => {
		const { active, over } = event;
		if (over && active.id !== over.id) {
			const container = findContainer(active.id);
			if (container === "unranked") {
				const oldIdx = unranked.findIndex(i => i.id === active.id);
				const newIdx = unranked.findIndex(i => i.id === over.id);
				setUnranked(arrayMove(unranked, oldIdx, newIdx));
			} else {
				setTiers(prev =>
					prev.map(t => {
						if (t.id === container) {
							const oldIdx = t.items.findIndex(i => i.id === active.id);
							const newIdx = t.items.findIndex(i => i.id === over.id);
							return { ...t, items: arrayMove(t.items, oldIdx, newIdx) };
						}
						return t;
					}),
				);
			}
		}
		setActiveId(null);
	};

	const downloadImage = async () => {
		setIsExporting(true);
		const btn = document.getElementById("dl-btn");
		const originalText = btn.innerText;
		btn.innerText = "Đang xử lý...";
		await new Promise(r => setTimeout(r, 400));
		try {
			const canvas = await html2canvas(tierListRef.current, {
				useCORS: true,
				backgroundColor: "#121212",
				scale: 2,
				scrollY: -window.scrollY,
			});
			const link = document.createElement("a");
			link.download = `tierlist-champions-${Date.now()}.png`;
			link.href = canvas.toDataURL("image/png", 1.0);
			link.click();
		} catch (e) {
			console.error(e);
		} finally {
			setIsExporting(false);
			btn.innerText = originalText;
		}
	};

	if (loading)
		return (
			<div className='flex justify-center p-20'>
				<Loader2 className='animate-spin text-primary-500' size={40} />
			</div>
		);

	const activeItem = activeId
		? unranked.find(i => i.id === activeId) ||
			tiers.flatMap(t => t.items).find(i => i.id === activeId)
		: null;

	return (
		<div className='max-w-[1200px] mx-auto p-0 font-secondary text-text-primary'>
			<PageTitle title='Tier List Tướng LoR - Path of Champions' />

			<div className='flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 px-2'>
				<h1 className='text-xl sm:text-2xl font-bold uppercase'>
					Tier List Tướng
				</h1>
				<div className='flex gap-2 w-full sm:w-auto text-nowrap'>
					<Button
						onClick={() =>
							setTiers([
								...tiers,
								{
									id: `t-${Date.now()}`,
									name: "NEW",
									description: "Mô tả",
									color: "#555555",
									items: [],
								},
							])
						}
						variant='outline'
						className='text-xs flex-1'
					>
						<Plus size={14} className='mr-1' /> Thêm hàng
					</Button>
					<Button
						id='dl-btn'
						onClick={downloadImage}
						className='text-xs bg-primary-600 flex-1'
					>
						<Download size={14} className='mr-1' /> Lưu ảnh
					</Button>

					{/* Nút Tier Mẫu */}
					<Button
						onClick={handleResetToSample}
						variant='outline'
						className='p-2 border-primary-500 text-primary-500 hover:bg-primary-500/10'
						title='Khôi phục mẫu'
					>
						<Sparkles size={16} />
					</Button>

					{/* Nút Xóa trắng */}
					<Button
						onClick={handleResetToEmpty}
						variant='danger'
						className='p-2'
						title='Xóa toàn bộ bảng'
					>
						<Trash2 size={16} />
					</Button>
				</div>
			</div>

			<DndContext
				sensors={sensors}
				collisionDetection={rectIntersection}
				onDragStart={handleDragStart}
				onDragOver={handleDragOver}
				onDragEnd={handleDragEnd}
			>
				<div
					ref={tierListRef}
					className='bg-surface-bg border border-border rounded-lg flex flex-col gap-1 p-1 shadow-inner overflow-visible'
				>
					{tiers.map(tier => (
						<div
							key={tier.id}
							className='flex min-h-[60px] sm:min-h-[100px] bg-black/20 group relative border-b border-white/5 last:border-none'
						>
							<div
								style={{ backgroundColor: tier.color }}
								className='relative w-20 sm:w-36 flex flex-col items-center justify-center p-1 text-black shrink-0'
							>
								{isExporting ? (
									<span className='font-bold text-sm sm:text-3xl uppercase text-center'>
										{tier.name}
									</span>
								) : (
									<input
										className='bg-transparent text-center w-full font-bold border-none focus:ring-0 text-sm sm:text-3xl uppercase'
										value={tier.name}
										onChange={e =>
											setTiers(
												tiers.map(t =>
													t.id === tier.id ? { ...t, name: e.target.value } : t,
												),
											)
										}
									/>
								)}
								{isExporting ? (
									<span className='text-[9px] sm:text-[12px] italic opacity-70 text-center mt-1'>
										{tier.description}
									</span>
								) : (
									<input
										className='bg-transparent text-center w-full text-[9px] sm:text-[12px] italic border-none focus:ring-0 opacity-60 mt-1'
										value={tier.description}
										onChange={e =>
											setTiers(
												tiers.map(t =>
													t.id === tier.id
														? { ...t, description: e.target.value }
														: t,
												),
											)
										}
									/>
								)}
								{!isExporting && (
									<button
										onClick={e => {
											e.stopPropagation();
											setShowColorPicker(
												showColorPicker === tier.id ? null : tier.id,
											);
										}}
										className='absolute top-1 right-1 p-1 bg-white/40 hover:bg-white/60 rounded opacity-0 group-hover:opacity-100 transition-opacity z-[50]'
									>
										<Palette size={20} />
									</button>
								)}
								{showColorPicker === tier.id && !isExporting && (
									<div className='absolute top-full left-0 z-[200] mt-1 p-1 bg-[#1a1a1a] border border-white/20 rounded flex gap-1 flex-wrap w-[110px] shadow-2xl'>
										{COLOR_OPTIONS.map(c => (
											<div
												key={c}
												onClick={e => {
													e.stopPropagation();
													setTiers(
														tiers.map(t =>
															t.id === tier.id ? { ...t, color: c } : t,
														),
													);
													setShowColorPicker(null);
												}}
												style={{ backgroundColor: c }}
												className='w-5 h-5 rounded-full cursor-pointer border border-white/20 hover:scale-110 transition-transform'
											/>
										))}
									</div>
								)}
							</div>
							<SortableContext
								items={tier.items.map(i => i.id)}
								strategy={rectSortingStrategy}
							>
								<DroppableZone
									id={tier.id}
									className='flex-1 p-1 sm:p-2 flex flex-wrap gap-1 sm:gap-2 items-center'
								>
									{tier.items.map(item => (
										<SortableItem
											key={item.id}
											id={item.id}
											avatar={item.avatar}
										/>
									))}
								</DroppableZone>
							</SortableContext>
							{!isExporting && (
								<button
									onClick={() => {
										setUnranked(prev => [...prev, ...tier.items]);
										setTiers(prev => prev.filter(t => t.id !== tier.id));
									}}
									className='md:px-3 text-red-400 hover:text-red-500 opacity-0 group-hover:opacity-100 self-center'
								>
									<X size={20} className='md:size-9' />
								</button>
							)}
						</div>
					))}
				</div>

				{/* Kho Tướng */}
				<div className='mt-8 p-4 bg-surface-bg border border-border rounded-lg shadow-sm'>
					<h2 className='text-xs font-bold text-text-secondary mb-4 uppercase tracking-widest'>
						Kho tướng ({filteredUnranked.length})
					</h2>
					<div className='lg:hidden mb-4'>
						<div className='flex items-center gap-2'>
							<div className='flex-1 relative'>
								<InputField
									value={searchInput}
									onChange={e => setSearchInput(e.target.value)}
									onKeyPress={e => e.key === "Enter" && handleSearch()}
									placeholder='Tìm tên tướng...'
								/>
								{searchInput && (
									<button
										onClick={() => {
											setSearchInput("");
											setSearchTerm("");
										}}
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
						<div
							className={`transition-all duration-300 ease-in-out ${isFilterOpen ? "max-h-[800px] opacity-100 mt-4" : "max-h-0 opacity-0 overflow-hidden"}`}
						>
							<div className='space-y-4 pt-4 border-t border-border'>
								<MultiSelectFilter
									options={filterOptions.regions}
									selectedValues={selectedRegions}
									onChange={setSelectedRegions}
									placeholder='Vùng'
								/>
								<MultiSelectFilter
									options={filterOptions.costs}
									selectedValues={selectedCosts}
									onChange={setSelectedCosts}
									placeholder='Năng lượng'
								/>
								<MultiSelectFilter
									options={filterOptions.maxStars}
									selectedValues={selectedMaxStars}
									onChange={setSelectedMaxStars}
									placeholder='Số sao'
								/>
								<MultiSelectFilter
									options={filterOptions.tags}
									selectedValues={selectedTags}
									onChange={setSelectedTags}
									placeholder='Thẻ'
								/>
								<Button
									variant='outline'
									onClick={handleResetFilters}
									className='w-full'
								>
									<RotateCw size={14} className='mr-2' /> Đặt lại bộ lọc
								</Button>
							</div>
						</div>
					</div>

					<div className='hidden lg:grid grid-cols-5 gap-3 mb-6'>
						<div className='relative'>
							<InputField
								value={searchInput}
								onChange={e => setSearchInput(e.target.value)}
								onKeyPress={e => e.key === "Enter" && handleSearch()}
								placeholder='Tìm tên tướng...'
							/>
							{searchInput && (
								<button
									onClick={() => {
										setSearchInput("");
										setSearchTerm("");
									}}
									className='absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary'
								>
									<XCircle size={14} />
								</button>
							)}
						</div>
						<MultiSelectFilter
							options={filterOptions.regions}
							selectedValues={selectedRegions}
							onChange={setSelectedRegions}
							placeholder='Vùng'
						/>
						<MultiSelectFilter
							options={filterOptions.costs}
							selectedValues={selectedCosts}
							onChange={setSelectedCosts}
							placeholder='Năng lượng'
						/>
						<MultiSelectFilter
							options={filterOptions.maxStars}
							selectedValues={selectedMaxStars}
							onChange={setSelectedMaxStars}
							placeholder='Số sao'
						/>
						<div className='flex gap-2'>
							<div className='flex-1'>
								<MultiSelectFilter
									options={filterOptions.tags}
									selectedValues={selectedTags}
									onChange={setSelectedTags}
									placeholder='Thẻ'
								/>
							</div>
							<Button
								variant='outline'
								onClick={handleResetFilters}
								className='px-3'
							>
								<RotateCw size={14} />
							</Button>
						</div>
					</div>

					<SortableContext
						items={unranked.map(i => i.id)}
						strategy={rectSortingStrategy}
					>
						<DroppableZone
							id='unranked'
							className='flex flex-wrap gap-1.5 sm:gap-2 min-h-[200px] content-start relative z-0'
						>
							{unranked.map(item =>
								filteredUnranked.some(f => f.id === item.id) ? (
									<SortableItem
										key={item.id}
										id={item.id}
										avatar={item.avatar}
									/>
								) : null,
							)}
						</DroppableZone>
					</SortableContext>
				</div>

				<DragOverlay
					dropAnimation={{
						sideEffects: defaultDropAnimationSideEffects({
							styles: { active: { opacity: "0.4" } },
						}),
					}}
				>
					{activeId ? (
						<SortableItem id={activeId} avatar={activeItem?.avatar} isOverlay />
					) : null}
				</DragOverlay>
			</DndContext>
		</div>
	);
}

export default TierListChampions;
