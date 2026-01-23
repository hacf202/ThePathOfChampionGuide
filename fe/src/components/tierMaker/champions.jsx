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
	verticalListSortingStrategy,
	useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
	GripVertical,
	CheckSquare,
	Square,
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

// --- Components hỗ trợ ---

const SortableTierRow = ({
	tier,
	isExporting,
	setTiers,
	tiers,
	showColorPicker,
	setShowColorPicker,
	setUnranked,
	children,
}) => {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: tier.id,
		data: { type: "tier" },
	});

	const style = {
		transform: CSS.Translate.toString(transform),
		transition,
		zIndex: isDragging ? 100 : "auto",
		opacity: isDragging ? 0.5 : 1,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className='flex min-h-[60px] sm:min-h-[100px] bg-black/20 group relative border-b border-white/5 last:border-none'
		>
			{!isExporting && (
				<div
					{...attributes}
					{...listeners}
					className='w-6 sm:w-8 flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-white/5 text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity'
				>
					<GripVertical size={20} />
				</div>
			)}

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
									t.id === tier.id ? { ...t, description: e.target.value } : t,
								),
							)
						}
					/>
				)}
				{!isExporting && (
					<button
						onClick={e => {
							e.stopPropagation();
							setShowColorPicker(showColorPicker === tier.id ? null : tier.id);
						}}
						className='absolute top-1 right-1 p-1 bg-white/40 hover:bg-white/60 rounded opacity-0 group-hover:opacity-100 transition-opacity z-[50]'
					>
						<Palette size={16} />
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
										tiers.map(t => (t.id === tier.id ? { ...t, color: c } : t)),
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

			{children}

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
	);
};

// --- Component Chính ---

function TierListChampions() {
	const [allChampionsRaw, setAllChampionsRaw] = useState([]);
	const [tiers, setTiers] = useState([]);
	const [unranked, setUnranked] = useState([]);
	const [activeId, setActiveId] = useState(null);
	const [activeType, setActiveType] = useState(null);
	const [loading, setLoading] = useState(true);
	const [isExporting, setIsExporting] = useState(false);

	// Multi-select & Selection Box States
	const [selectedIds, setSelectedIds] = useState([]);
	const [selectionBox, setSelectionBox] = useState(null);
	const [isSelecting, setIsSelecting] = useState(false);

	const [searchInput, setSearchInput] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedRegions, setSelectedRegions] = useState([]);
	const [selectedCosts, setSelectedCosts] = useState([]);
	const [selectedMaxStars, setSelectedMaxStars] = useState([]);
	const [selectedTags, setSelectedTags] = useState([]);
	const [showColorPicker, setShowColorPicker] = useState(null);
	const [isFilterOpen, setIsFilterOpen] = useState(false);

	const tierListRef = useRef(null);
	const unrankedRef = useRef(null);
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

	const getDefaultTiers = () => [
		{
			id: "tier-s+",
			name: "S+",
			description: "Thần Thánh",
			color: "#ff3e3e",
			items: [],
		},
		{
			id: "tier-s",
			name: "S",
			description: "Bá Đạo",
			color: "#ff7f7f",
			items: [],
		},
		{
			id: "tier-a+",
			name: "A+",
			description: "Rất Mạnh",
			color: "#ff9f40",
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

	const getSampleData = formattedChampions => {
		const sampleMapping = {
			"tier-s+": [
				"C039",
				"C043",
				"C081",
				"C014",
				"C028",
				"C024",
				"C049",
				"C074",
				"C046",
				"C016",
				"C027",
				"C075",
				"C047",
				"C036",
				"C062",
				"C048",
				"C079",
			],
			"tier-s": [
				"C063",
				"C006",
				"C060",
				"C041",
				"C031",
				"C065",
				"C042",
				"C056",
				"C018",
				"C066",
				"C033",
				"C045",
				"C055",
				"C044",
				"C026",
			],
			"tier-a+": [
				"C076",
				"C017",
				"C015",
				"C067",
				"C050",
				"C069",
				"C009",
				"C029",
				"C080",
				"C059",
				"C021",
				"C078",
				"C077",
				"C010",
				"C020",
				"C057",
				"C004",
				"C002",
				"C005",
				"C013",
				"C037",
				"C040",
				"C008",
				"C052",
				"C022",
				"C053",
				"C068",
			],
			"tier-a": [
				"C058",
				"C030",
				"C032",
				"C001",
				"C023",
				"C038",
				"C035",
				"C054",
				"C012",
				"C051",
				"C072",
				"C034",
			],
			"tier-b": [
				"C011",
				"C007",
				"C025",
				"C003",
				"C073",
				"C061",
				"C070",
				"C064",
				"C019",
			],
			"tier-c": [""],
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
					const { sampleTiers, sampleUnranked } = getSampleData(formatted);
					setTiers(sampleTiers);
					setUnranked(sampleUnranked);
				}
			} catch (err) {
				console.error("Lỗi khởi tạo:", err);
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

	const handleResetFilters = () => {
		setSearchInput("");
		setSearchTerm("");
		setSelectedRegions([]);
		setSelectedCosts([]);
		setSelectedMaxStars([]);
		setSelectedTags([]);
		setSelectedIds([]);
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

	// --- LOGIC QUÉT CHỌN (BOX SELECTION) ---

	const onMouseDown = e => {
		if (e.target !== e.currentTarget) return;

		const rect = unrankedRef.current.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		setIsSelecting(true);
		setSelectionBox({ startX: x, startY: y, currentX: x, currentY: y });

		if (!e.shiftKey) setSelectedIds([]);
	};

	const onMouseMove = e => {
		if (!isSelecting) return;
		const rect = unrankedRef.current.getBoundingClientRect();
		setSelectionBox(prev => ({
			...prev,
			currentX: e.clientX - rect.left,
			currentY: e.clientY - rect.top,
		}));
	};

	const onMouseUp = e => {
		if (!isSelecting) return;

		const left = Math.min(selectionBox.startX, selectionBox.currentX);
		const top = Math.min(selectionBox.startY, selectionBox.currentY);
		const right = Math.max(selectionBox.startX, selectionBox.currentX);
		const bottom = Math.max(selectionBox.startY, selectionBox.currentY);

		const tempSelectedIds = [];
		const itemElements = unrankedRef.current.querySelectorAll("[data-id]");

		itemElements.forEach(el => {
			const itemRect = el.getBoundingClientRect();
			const containerRect = unrankedRef.current.getBoundingClientRect();

			const itemTop = itemRect.top - containerRect.top;
			const itemLeft = itemRect.left - containerRect.left;
			const itemBottom = itemTop + itemRect.height;
			const itemRight = itemLeft + itemRect.width;

			const isIntersecting = !(
				itemLeft > right ||
				itemRight < left ||
				itemTop > bottom ||
				itemBottom < top
			);

			if (isIntersecting) {
				tempSelectedIds.push(el.getAttribute("data-id"));
			}
		});

		// SỬA LỖI TẠI ĐÂY: Loại bỏ các ID trùng lặp bằng Set trước khi cập nhật state
		const uniqueSelectedIds = [...new Set(tempSelectedIds)];

		if (e.shiftKey) {
			setSelectedIds(prev => [...new Set([...prev, ...uniqueSelectedIds])]);
		} else {
			setSelectedIds(uniqueSelectedIds);
		}

		setIsSelecting(false);
		setSelectionBox(null);
	};

	// --- LOGIC DND ---

	const findContainer = id => {
		if (id === "unranked") return "unranked";
		if (unranked.some(i => i.id === id)) return "unranked";
		const tier = tiers.find(t => t.id === id || t.items.some(i => i.id === id));
		return tier ? tier.id : null;
	};

	const handleDragStart = event => {
		const { active } = event;
		setActiveId(active.id);
		setActiveType(active.data.current?.type || "item");
	};

	const handleDragOver = event => {
		const { active, over } = event;
		if (!over || activeType === "tier") return;
		const activeContainer = findContainer(active.id);
		const overContainer = findContainer(over.id);
		if (!activeContainer || !overContainer || activeContainer === overContainer)
			return;

		const idsToMove = selectedIds.includes(active.id)
			? selectedIds
			: [active.id];
		const getAllItems = container =>
			container === "unranked"
				? unranked
				: tiers.find(t => t.id === container).items;
		const movingItems = getAllItems(activeContainer).filter(i =>
			idsToMove.includes(i.id),
		);

		if (activeContainer === "unranked") {
			setUnranked(prev => prev.filter(i => !idsToMove.includes(i.id)));
			setTiers(prev =>
				prev.map(t =>
					t.id === overContainer
						? { ...t, items: [...t.items, ...movingItems] }
						: t,
				),
			);
		} else if (overContainer === "unranked") {
			setTiers(prev =>
				prev.map(t =>
					t.id === activeContainer
						? { ...t, items: t.items.filter(i => !idsToMove.includes(i.id)) }
						: t,
				),
			);
			setUnranked(prev => [...prev, ...movingItems]);
		} else {
			setTiers(prev =>
				prev.map(t => {
					if (t.id === activeContainer)
						return {
							...t,
							items: t.items.filter(i => !idsToMove.includes(i.id)),
						};
					if (t.id === overContainer)
						return { ...t, items: [...t.items, ...movingItems] };
					return t;
				}),
			);
		}
	};

	const handleDragEnd = event => {
		const { active, over } = event;
		if (!over) {
			setActiveId(null);
			return;
		}

		if (activeType === "tier") {
			if (active.id !== over.id) {
				const oldIdx = tiers.findIndex(t => t.id === active.id);
				const newIdx = tiers.findIndex(t => t.id === over.id);
				if (oldIdx !== -1 && newIdx !== -1)
					setTiers(arrayMove(tiers, oldIdx, newIdx));
			}
		} else if (active.id !== over.id) {
			const container = findContainer(active.id);
			if (container === "unranked") {
				const oldIdx = unranked.findIndex(i => i.id === active.id);
				const newIdx = unranked.findIndex(i => i.id === over.id);
				if (newIdx !== -1) setUnranked(arrayMove(unranked, oldIdx, newIdx));
			} else {
				setTiers(prev =>
					prev.map(t => {
						if (t.id === container) {
							const oldIdx = t.items.findIndex(i => i.id === active.id);
							const newIdx = t.items.findIndex(i => i.id === over.id);
							if (newIdx !== -1)
								return { ...t, items: arrayMove(t.items, oldIdx, newIdx) };
						}
						return t;
					}),
				);
			}
		}
		setActiveId(null);
		setActiveType(null);
		if (!selectedIds.includes(active.id)) setSelectedIds([]);
	};

	const downloadImage = async () => {
		setIsExporting(true);
		setShowColorPicker(null);
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
			console.error("Lỗi xuất ảnh:", e);
		} finally {
			setIsExporting(false);
			btn.innerText = originalText;
		}
	};

	// --- HÀM XỬ LÝ NÚT CHỨC NĂNG ---

	const handleResetToSample = () => {
		if (confirm("Khôi phục danh sách mẫu? Mọi thay đổi hiện tại sẽ mất.")) {
			const { sampleTiers, sampleUnranked } = getSampleData(allChampionsRaw);
			setTiers(sampleTiers);
			setUnranked(sampleUnranked);
			setSelectedIds([]);
		}
	};

	const handleClearAllToUnranked = () => {
		if (confirm("Đưa tất cả tướng về kho?")) {
			setTiers(getDefaultTiers());
			setUnranked([...allChampionsRaw]);
			setSelectedIds([]);
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
		<div className='max-w-[1200px] mx-auto p-0 font-secondary text-text-primary select-none'>
			<PageTitle title='Tier List Tướng LoR - Path of Champions' />

			{/* HEADER */}
			<div className='flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 px-2'>
				<h1 className='text-xl sm:text-2xl font-bold uppercase'>
					Tier List Tướng
				</h1>
				<div className='flex flex-wrap justify-center sm:justify-end gap-2 w-full sm:w-auto'>
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
						className='text-xs flex-1 sm:flex-none'
					>
						<Plus size={14} className='mr-1' /> Thêm hàng
					</Button>
					<Button
						id='dl-btn'
						onClick={downloadImage}
						className='text-xs bg-primary-600 flex-1 sm:flex-none'
					>
						<Download size={14} className='mr-1' /> Lưu ảnh
					</Button>
					<div className='flex gap-2'>
						<Button
							onClick={handleResetToSample}
							variant='outline'
							className='p-2 border-primary-500 text-primary-500 hover:bg-primary-500/10'
							title='Đặt lại mẫu mặc định'
						>
							<Sparkles size={16} />
						</Button>
						<Button
							onClick={handleClearAllToUnranked}
							variant='danger'
							className='p-2'
							title='Xóa toàn bộ tướng về kho'
						>
							<Trash2 size={16} />
						</Button>
					</div>
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
					<SortableContext
						items={tiers.map(t => t.id)}
						strategy={verticalListSortingStrategy}
					>
						{tiers.map(tier => (
							<SortableTierRow
								key={tier.id}
								tier={tier}
								isExporting={isExporting}
								setTiers={setTiers}
								tiers={tiers}
								showColorPicker={showColorPicker}
								setShowColorPicker={setShowColorPicker}
								setUnranked={setUnranked}
							>
								<SortableContext
									items={tier.items.map(i => i.id)}
									strategy={rectSortingStrategy}
								>
									<DroppableZone
										id={tier.id}
										className='flex-1 p-1 sm:p-2 flex flex-wrap gap-1 sm:gap-2 items-center'
									>
										{tier.items.map(item => (
											<div
												key={item.id}
												onClick={e => {
													if (e.ctrlKey || e.metaKey)
														setSelectedIds(prev =>
															prev.includes(item.id)
																? prev.filter(x => x !== item.id)
																: [...prev, item.id],
														);
													else
														setSelectedIds(prev =>
															prev.includes(item.id) ? [] : [item.id],
														);
												}}
												className={`rounded-md transition-all ${selectedIds.includes(item.id) ? "ring-2 ring-primary-500 ring-offset-2 ring-offset-surface-bg scale-90" : ""}`}
											>
												<SortableItem id={item.id} avatar={item.avatar} />
											</div>
										))}
									</DroppableZone>
								</SortableContext>
							</SortableTierRow>
						))}
					</SortableContext>
				</div>

				{/* KHO TƯỚNG */}
				<div className='mt-8 p-4 bg-surface-bg border border-border rounded-lg shadow-sm'>
					<div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4'>
						<h2 className='text-xs font-bold text-text-secondary uppercase tracking-widest'>
							Kho tướng ({filteredUnranked.length})
						</h2>
						<div className='flex gap-2 w-full sm:w-auto'>
							<Button
								variant='outline'
								size='sm'
								onClick={() => setSelectedIds(filteredUnranked.map(c => c.id))}
								className='text-[10px] h-8 flex-1 sm:flex-none'
							>
								<CheckSquare size={14} className='mr-1' /> Chọn tất cả
							</Button>
							<Button
								variant='outline'
								size='sm'
								onClick={() => setSelectedIds([])}
								className='text-[10px] h-8 flex-1 sm:flex-none'
								disabled={selectedIds.length === 0}
							>
								<Square size={14} className='mr-1' /> Bỏ chọn (
								{selectedIds.length})
							</Button>
						</div>
					</div>

					{/* FILTERS */}
					<div className='grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6'>
						<InputField
							value={searchInput}
							onChange={e => setSearchInput(e.target.value)}
							onKeyPress={e => e.key === "Enter" && handleSearch()}
							placeholder='Tìm tên tướng...'
						/>
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
						<Button variant='outline' onClick={handleResetFilters}>
							<RotateCw size={14} className='mr-2' /> Reset
						</Button>
					</div>

					{/* VÙNG QUÉT CHỌN */}
					<div
						ref={unrankedRef}
						onMouseDown={onMouseDown}
						onMouseMove={onMouseMove}
						onMouseUp={onMouseUp}
						onMouseLeave={() => setIsSelecting(false) || setSelectionBox(null)}
						className='relative min-h-[300px] border-2 border-dashed border-white/5 rounded-xl p-4 bg-black/10'
					>
						{/* Khung quét visual */}
						{isSelecting && selectionBox && (
							<div
								style={{
									left: Math.min(selectionBox.startX, selectionBox.currentX),
									top: Math.min(selectionBox.startY, selectionBox.currentY),
									width: Math.abs(selectionBox.startX - selectionBox.currentX),
									height: Math.abs(selectionBox.startY - selectionBox.currentY),
								}}
								className='absolute z-[100] border border-primary-500 bg-primary-500/20 pointer-events-none'
							/>
						)}

						<SortableContext
							items={unranked.map(i => i.id)}
							strategy={rectSortingStrategy}
						>
							<DroppableZone
								id='unranked'
								className='flex flex-wrap gap-2 content-start pointer-events-none'
							>
								{unranked.map(item => {
									const isVisible = filteredUnranked.some(
										f => f.id === item.id,
									);
									const isSelected = selectedIds.includes(item.id);
									return isVisible ? (
										<div
											key={item.id}
											data-id={item.id}
											className={`rounded-md transition-all pointer-events-auto cursor-pointer ${isSelected ? "ring-2 ring-primary-500 ring-offset-2 ring-offset-surface-bg scale-90" : ""}`}
											onClick={e => {
												e.stopPropagation();
												if (e.ctrlKey || e.metaKey)
													setSelectedIds(prev =>
														prev.includes(item.id)
															? prev.filter(x => x !== item.id)
															: [...prev, item.id],
													);
												else
													setSelectedIds(prev =>
														prev.includes(item.id) ? [] : [item.id],
													);
											}}
										>
											<SortableItem id={item.id} avatar={item.avatar} />
										</div>
									) : null;
								})}
							</DroppableZone>
						</SortableContext>
					</div>
				</div>

				<DragOverlay
					dropAnimation={{
						sideEffects: defaultDropAnimationSideEffects({
							styles: { active: { opacity: "0.4" } },
						}),
					}}
				>
					{activeId ? (
						activeType === "tier" ? (
							<div className='flex min-h-[100px] w-full bg-surface-bg border-2 border-primary-500 opacity-80 rounded-lg overflow-hidden'>
								<div
									style={{
										backgroundColor: tiers.find(t => t.id === activeId)?.color,
									}}
									className='w-36 flex items-center justify-center font-bold text-3xl text-black uppercase'
								>
									{tiers.find(t => t.id === activeId)?.name}
								</div>
								<div className='flex-1 p-4 bg-black/40 text-text-secondary italic flex items-center'>
									Di chuyển hàng...
								</div>
							</div>
						) : (
							<div className='relative'>
								<SortableItem
									id={activeId}
									avatar={activeItem?.avatar}
									isOverlay
								/>
								{selectedIds.length > 1 && selectedIds.includes(activeId) && (
									<div className='absolute -top-2 -right-2 bg-primary-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg border-2 border-white'>
										{selectedIds.length}
									</div>
								)}
							</div>
						)
					) : null}
				</DragOverlay>
			</DndContext>
		</div>
	);
}

export default TierListChampions;
