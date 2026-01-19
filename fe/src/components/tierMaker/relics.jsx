// src/pages/tierList/relics.jsx
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
import { removeAccents } from "../../utils/vietnameseUtils";
import {
	SortableItem,
	DroppableZone,
	COLOR_OPTIONS,
} from "./tierListComponents";

const RELICS_STORAGE_KEY = "poc-custom-tierlist-relics-v1";

function TierListRelics() {
	const [allRelicsRaw, setAllRelicsRaw] = useState([]);
	const [tiers, setTiers] = useState([]);
	const [unranked, setUnranked] = useState([]);
	const [activeId, setActiveId] = useState(null);
	const [loading, setLoading] = useState(true);
	const [isExporting, setIsExporting] = useState(false);

	const [searchInput, setSearchInput] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedRarities, setSelectedRarities] = useState([]);
	const [selectedTypes, setSelectedTypes] = useState([]);
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

	const sortItemsByName = items => {
		return [...items].sort((a, b) => a.name.localeCompare(b.name, "vi"));
	};

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

	const getSampleData = formattedRelics => {
		const sampleMapping = {
			"tier-s": ["R0066", "R0077", "R0088"],
			"tier-a": ["R0011", "R0022", "R0033"],
			"tier-b": ["R0044", "R0055"],
			"tier-c": ["R0099"],
		};
		const defaultTiers = getDefaultTiers();
		const usedIds = new Set();
		const sampleTiers = defaultTiers.map(tier => {
			const targetIds = sampleMapping[tier.id] || [];
			const items = formattedRelics.filter(r => targetIds.includes(r.id));
			items.forEach(i => usedIds.add(i.id));
			return { ...tier, items };
		});
		const remaining = formattedRelics.filter(r => !usedIds.has(r.id));
		const sampleUnranked = sortItemsByName(remaining);
		return { sampleTiers, sampleUnranked };
	};

	useEffect(() => {
		let isMounted = true;
		const initData = async () => {
			try {
				const res = await fetch(`${apiUrl}/api/relics`);
				const data = await res.json();
				if (!isMounted) return;

				const formatted = sortItemsByName(
					data.map((r, index) => {
						const rawPath =
							r.assetAbsolutePath ||
							r.avatar ||
							(r.assets && r.assets[0]?.avatar);
						return {
							id: String(r.relicCode || r.relicID || r.id || `relic-${index}`),
							name: r.name || "Unknown Relic",
							avatar: rawPath
								? `${apiUrl}/api/relics/proxy-image?url=${encodeURIComponent(rawPath)}`
								: "/fallback-relic.png",
							rarity: r.rarity || "THƯỜNG",
							type: r.type || "Chung",
							descriptionRaw: r.descriptionRaw || r.description || "",
						};
					}),
				);

				setAllRelicsRaw(formatted);
				const saved = localStorage.getItem(RELICS_STORAGE_KEY);
				if (saved) {
					const parsed = JSON.parse(saved);
					const hydrateItems = items =>
						(items || [])
							.map(item => formatted.find(f => f.id === item.id))
							.filter(Boolean);
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
				console.error(err);
			} finally {
				if (isMounted) setLoading(false);
			}
		};
		initData();
		return () => {
			isMounted = false;
		};
	}, [apiUrl]);

	useEffect(() => {
		if (!loading)
			localStorage.setItem(
				RELICS_STORAGE_KEY,
				JSON.stringify({ tiers, unranked }),
			);
	}, [tiers, unranked, loading]);

	const handleResetToEmpty = () => {
		if (confirm("Xóa toàn bộ cổ vật khỏi bảng?")) {
			setTiers(getDefaultTiers());
			setUnranked(sortItemsByName(allRelicsRaw));
		}
	};

	const handleResetToSample = () => {
		if (confirm("Khôi phục mẫu?")) {
			const { sampleTiers, sampleUnranked } = getSampleData(allRelicsRaw);
			setTiers(sampleTiers);
			setUnranked(sampleUnranked);
		}
	};

	const handleSearch = () => {
		setSearchTerm(searchInput.trim());
		if (window.innerWidth < 1024) setIsFilterOpen(false);
	};

	const handleResetFilters = () => {
		setSearchInput("");
		setSearchTerm("");
		setSelectedRarities([]);
		setSelectedTypes([]);
	};

	// Phân loại kho theo độ hiếm để hiển thị
	const warehouseGroups = useMemo(() => {
		return {
			"SỬ THI": unranked.filter(r => r.rarity === "SỬ THI"),
			HIẾM: unranked.filter(r => r.rarity === "HIẾM"),
			THƯỜNG: unranked.filter(
				r =>
					r.rarity === "THƯỜNG" ||
					(r.rarity !== "SỬ THI" && r.rarity !== "HIẾM"),
			),
		};
	}, [unranked]);

	// HÀM QUAN TRỌNG: Tìm Container chứa ID
	const findContainer = id => {
		if (id.startsWith("unranked-")) return id;
		// Kiểm tra trong unranked
		const itemInUnranked = unranked.find(i => i.id === id);
		if (itemInUnranked)
			return `unranked-${itemInUnranked.rarity.toUpperCase()}`;
		// Kiểm tra trong các Tier
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

		// TRƯỜNG HỢP 1: Di chuyển giữa các vùng độ hiếm trong KHO (Cả 2 đều bắt đầu bằng unranked-)
		// Không làm gì ở DragOver để tránh mất item, DragEnd sẽ xử lý di chuyển vị trí.
		if (
			activeContainer.startsWith("unranked-") &&
			overContainer.startsWith("unranked-")
		) {
			return;
		}

		// Lấy item đang được kéo
		const activeItem =
			unranked.find(i => i.id === active.id) ||
			tiers.flatMap(t => t.items).find(i => i.id === active.id);

		if (!activeItem) return;

		// TRƯỜNG HỢP 2: Kéo từ KHO vào TIER
		if (
			activeContainer.startsWith("unranked-") &&
			!overContainer.startsWith("unranked-")
		) {
			setUnranked(prev => prev.filter(i => i.id !== active.id));
			setTiers(prev =>
				prev.map(t =>
					t.id === overContainer
						? { ...t, items: [...t.items, activeItem] }
						: t,
				),
			);
		}
		// TRƯỜNG HỢP 3: Kéo từ TIER vào KHO
		else if (
			!activeContainer.startsWith("unranked-") &&
			overContainer.startsWith("unranked-")
		) {
			setTiers(prev =>
				prev.map(t =>
					t.id === activeContainer
						? { ...t, items: t.items.filter(i => i.id !== active.id) }
						: t,
				),
			);
			setUnranked(prev => [...prev, activeItem]);
		}
		// TRƯỜNG HỢP 4: Kéo giữa các TIER
		else {
			setTiers(prev =>
				prev.map(t => {
					if (t.id === activeContainer)
						return { ...t, items: t.items.filter(i => i.id !== active.id) };
					if (t.id === overContainer)
						return { ...t, items: [...t.items, activeItem] };
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

		const activeContainer = findContainer(active.id);
		const overContainer = findContainer(over.id);

		if (activeContainer && overContainer) {
			// Di chuyển vị trí bên trong KHO
			if (
				activeContainer.startsWith("unranked-") &&
				overContainer.startsWith("unranked-")
			) {
				const oldIdx = unranked.findIndex(i => i.id === active.id);
				const newIdx = unranked.findIndex(i => i.id === over.id);
				if (oldIdx !== -1 && newIdx !== -1) {
					setUnranked(arrayMove(unranked, oldIdx, newIdx));
				}
			}
			// Di chuyển vị trí bên trong cùng 1 TIER
			else if (activeContainer === overContainer) {
				setTiers(prev =>
					prev.map(t => {
						if (t.id === activeContainer) {
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
		await new Promise(r => setTimeout(r, 400));
		try {
			const canvas = await html2canvas(tierListRef.current, {
				useCORS: true,
				backgroundColor: "#121212",
				scale: 2,
				scrollY: -window.scrollY,
			});
			const link = document.createElement("a");
			link.download = `tierlist-relics-${Date.now()}.png`;
			link.href = canvas.toDataURL("image/png", 1.0);
			link.click();
		} catch (e) {
			console.error(e);
		} finally {
			setIsExporting(false);
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
			<PageTitle title='Tier List Cổ Vật LoR - Path of Champions' />

			<div className='flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 px-2'>
				<h1 className='text-xl sm:text-2xl font-bold uppercase'>
					Tier List Cổ Vật
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
						id='dl-btn-relic'
						onClick={downloadImage}
						className='text-xs bg-primary-600 flex-1'
					>
						<Download size={14} className='mr-1' /> Lưu ảnh
					</Button>
					<Button
						onClick={handleResetToSample}
						variant='outline'
						className='p-2 border-primary-500 text-primary-500 hover:bg-primary-500/10'
						title='Khôi phục mẫu'
					>
						<Sparkles size={16} />
					</Button>
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
					className='bg-surface-bg border border-border rounded-lg flex flex-col gap-1 p-1 shadow-inner'
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
										className='absolute top-1 right-1 p-1 bg-white/40 hover:bg-white/60 rounded opacity-0 group-hover:opacity-100 z-[50] transition-opacity'
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
												className='w-5 h-5 rounded-full cursor-pointer border border-white/20 hover:scale-110'
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
											title={item.descriptionRaw}
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

				{/* Kho Cổ Vật */}
				<div className='mt-8 p-4 bg-surface-bg border border-border rounded-lg shadow-sm'>
					<h2 className='text-xs font-bold text-text-secondary mb-4 uppercase tracking-widest'>
						Kho cổ vật ({unranked.length})
					</h2>

					<div className='flex flex-col gap-8'>
						{Object.entries(warehouseGroups).map(([rarity, items]) => (
							<div key={rarity} className='flex flex-col gap-3'>
								<div className='flex items-center gap-2'>
									<div className='h-[2px] w-6 bg-primary-500'></div>
									<span className='text-xs font-bold tracking-widest text-text-primary uppercase'>
										{rarity} ({items.length})
									</span>
								</div>

								<SortableContext
									items={items.map(i => i.id)}
									strategy={rectSortingStrategy}
								>
									<DroppableZone
										id={`unranked-${rarity.toUpperCase()}`}
										className='flex flex-wrap gap-2 min-h-[80px] p-3 bg-black/10 rounded-lg border border-white/5'
									>
										{items.map(item =>
											// Bộ lọc search và filter
											(searchTerm === "" ||
												removeAccents(item.name.toLowerCase()).includes(
													removeAccents(searchTerm.toLowerCase()),
												)) &&
											(selectedRarities.length === 0 ||
												selectedRarities.includes(item.rarity)) &&
											(selectedTypes.length === 0 ||
												selectedTypes.includes(item.type)) ? (
												<SortableItem
													key={item.id}
													id={item.id}
													avatar={item.avatar}
													title={item.descriptionRaw}
												/>
											) : null,
										)}
									</DroppableZone>
								</SortableContext>
							</div>
						))}
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
						<SortableItem
							id={activeId}
							avatar={activeItem?.avatar}
							title={activeItem?.descriptionRaw}
							isOverlay
						/>
					) : null}
				</DragOverlay>
			</DndContext>
		</div>
	);
}

export default TierListRelics;
