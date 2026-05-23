// src/pages/tierList/champions.jsx
import React, {
	useState,
	useEffect,
	useRef,
	useMemo,
	useCallback,
	memo,
} from "react";
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
	useDraggable,
} from "@dnd-kit/core";
import { createPortal } from "react-dom";
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
	Search,
	ChevronDown,
	ChevronUp,
	Trash2,
	Sparkles,
	GripVertical,
	CheckSquare,
	Square,
	Copy,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas";
import PageTitle from "../../components/common/pageTitle";
import Button from "../../components/common/button";
import InputField from "../../components/common/inputField";
import MultiSelectFilter from "../../components/common/multiSelectFilter";
import iconRegions from "../../assets/data/icon.json";
import { removeAccents } from "../../utils/vietnameseUtils";
import {
	SortableItem,
	DroppableZone,
	COLOR_OPTIONS,
	LOCAL_STORAGE_KEY,
} from "./tierListComponents";
import { useTranslation } from "../../hooks/useTranslation";
import { sampleChampionMapping } from "./championSampleMapping";



// --- 1. ĐỊNH NGHĨA SKELETON (ĐẶT Ở ĐẦU FILE) ---
const ChampionTierSkeleton = () => (
	<div className='max-w-[1200px] mx-auto p-2 sm:p-6 animate-pulse'>
		<div className='flex justify-between items-center mb-6 px-2'>
			<div className='h-8 w-48 bg-gray-700/50 rounded' />
			<div className='flex gap-2'>
				<div className='h-9 w-28 bg-gray-700/50 rounded' />
				<div className='h-9 w-28 bg-gray-700/50 rounded' />
			</div>
		</div>
		<div className='bg-surface-bg border border-border rounded-lg p-1 space-y-1'>
			{[1, 2, 3, 4, 5].map(i => (
				<div key={i} className='flex h-20 sm:h-28 bg-white/5 rounded'>
					<div className='w-12 sm:w-36 bg-gray-700/30 shrink-0' />
					<div className='flex-1 p-2 flex gap-1 sm:gap-2'>
						{[1, 2, 3, 4, 5, 6, 7].map(j => (
							<div
								key={j}
								className='w-[38px] h-[38px] sm:w-[96px] sm:h-[96px] bg-gray-700/20 rounded'
							/>
						))}
					</div>
				</div>
			))}
		</div>
	</div>
);

// --- 2. THÀNH PHẦN HÀNG TIER ---
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
	const { tUI } = useTranslation();
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: tier.id, data: { type: "tier" } });
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
					data-tier-handle='true'
					className='w-6 sm:w-8 flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-white/5 text-text-secondary opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity touch-none'
				>
					<GripVertical size={20} />
				</div>
			)}
			<div
				style={{ backgroundColor: tier.color }}
				className='relative w-12 sm:w-36 flex flex-col items-center justify-center p-1 text-black shrink-0'
			>
				{isExporting ? (
					<div className='bg-transparent text-center w-full font-bold border-none focus:ring-0 text-sm sm:text-3xl uppercase px-0'>
						{tier.name}
					</div>
				) : (
					<input
						className='bg-transparent text-center w-full font-bold border-none focus:ring-0 text-sm sm:text-3xl uppercase px-0'
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
					<div className='bg-transparent text-center w-full text-[9px] sm:text-[12px] italic border-none focus:ring-0 opacity-60 mt-1 break-words'>
						{tier.description}
					</div>
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
						className='absolute top-1 right-1 p-1 bg-white/40 hover:bg-white/60 rounded opacity-0 group-hover:opacity-100 z-[50]'
					>
						<Palette size={16} />
					</button>
				)}
				{showColorPicker === tier.id && !isExporting && (
					<div className='color-picker absolute top-full left-0 z-[200] mt-1 p-1 bg-[#1a1a1a] border border-white/20 rounded flex gap-1 flex-wrap w-[110px] shadow-2xl'>
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
								className='w-5 h-5 rounded-full cursor-pointer border border-white/20 hover:scale-110'
							/>
						))}
					</div>
				)}
			</div>
			{children}
			{!isExporting && (
				<button
					onClick={() => {
						if (
							window.confirm(
								tUI("tierList.confirmDeleteRow").replace("{name}", tier.name),
							)
						) {
							setUnranked(prev => [...prev, ...tier.items]);
							setTiers(prev => prev.filter(t => t.id !== tier.id));
						}
					}}
					className='md:px-3 text-red-400 hover:text-red-500 opacity-0 group-hover:opacity-100 self-center'
				>
					<X size={20} className='md:size-9' />
				</button>
			)}
		</div>
	);
};

const DraggableRelic = memo(({ relic }) => {
	const { attributes, listeners, setNodeRef, transform } = useDraggable({
		id: `relic-${relic.id}`,
		data: { type: "relic", relic },
	});
	const style = {
		...(transform ? {
			transform: CSS.Translate.toString(transform),
			zIndex: 9999,
		} : {}),
		touchAction: "none",
	};

	return (
		<div
			ref={setNodeRef}
			{...listeners}
			{...attributes}
			style={style}
			data-no-select="true"
			className="w-10 h-10 sm:w-12 sm:h-12 cursor-grab hover:scale-110 transition-transform bg-black/40 border border-white/10 rounded overflow-hidden flex-shrink-0 relative group"
			title={relic.name}
		>
			<img src={relic.avatar} alt={relic.name} className="w-full h-full object-cover pointer-events-none" crossOrigin="anonymous" />
		</div>
	);
});

// --- 3. COMPONENT CHÍNH ---
function TierListChampions({ initialChampions }) {
	const { tUI, tDynamic } = useTranslation();
	const [allChampionsRaw, setAllChampionsRaw] = useState([]);
	const [allRelicsRaw, setAllRelicsRaw] = useState([]);
	const [tiers, setTiers] = useState([]);
	const [unranked, setUnranked] = useState([]);
	const [activeId, setActiveId] = useState(null);
	const [activeType, setActiveType] = useState(null);
	const [loading, setLoading] = useState(true);
	const [isExporting, setIsExporting] = useState(false);
	const [selectedIds, setSelectedIds] = useState([]);
	const boardRectRef = useRef(null);
	const selectionDataRef = useRef({ startX: 0, startY: 0, currentX: 0, currentY: 0 });
	const selectionBoxDivRef = useRef(null);
	const [isSelecting, setIsSelecting] = useState(false);
	const [searchInput, setSearchInput] = useState("");
	const [championMenu, setChampionMenu] = useState(null);
	const [relicSearchInput, setRelicSearchInput] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedRegions, setSelectedRegions] = useState([]);
	const [selectedCosts, setSelectedCosts] = useState([]);
	const [selectedMaxStars, setSelectedMaxStars] = useState([]);
	const [selectedTags, setSelectedTags] = useState([]);
	const [showColorPicker, setShowColorPicker] = useState(null);

	const tierListRef = useRef(null);
	const boardRef = useRef(null);
	const apiUrl = import.meta.env.VITE_API_URL;

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
		useSensor(TouchSensor, {
			activationConstraint: { delay: 150, tolerance: 5 },
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	const getDefaultTiers = useCallback(
		() => sampleChampionMapping.map(tier => ({
			id: tier.id,
			name: tier.name,
			description: tier.description,
			color: tier.color,
			items: []
		})),
		[]
	);

	const getSampleData = useCallback(
		(rawData, relicsData = []) => {
			const usedIds = new Set();
			const sampleTiers = sampleChampionMapping.map(tier => {
				const mappingItems = tier.items || [];
				const items = [];
				mappingItems.forEach(mapping => {
					const isObj = typeof mapping === "object";
					const targetId = isObj ? mapping.id : mapping;
					const found = rawData.find(c => c.id === targetId);
					if (found) {
						let equippedRelics = [null, null, null];
						if (isObj && mapping.relics) {
							equippedRelics = mapping.relics.map(rId => 
								rId ? relicsData.find(r => r.id === rId) || null : null
							);
							while (equippedRelics.length < 3) equippedRelics.push(null);
							equippedRelics = equippedRelics.slice(0, 3);
						}
						items.push({ ...found, equippedRelics });
						usedIds.add(found.id);
					}
				});
				return { ...tier, items };
			});
			const sampleUnranked = rawData.filter(c => !usedIds.has(c.id));
			return { sampleTiers, sampleUnranked };
		},
		[],
	);

	useEffect(() => {
		const loadInitialData = async () => {
			try {
				setLoading(true);
				let rawData;
				if (initialChampions?.length > 0) rawData = initialChampions;
				else {
					const res = await fetch(`${apiUrl}/api/champions?limit=-1`);
					const data = await res.json();
					rawData = data.items || data || [];
				}
				const formatted = rawData.map(c => ({
					id: String(c.championID || c.id || c._id),
					name: c.name,
					avatar:
						c.assets?.[0]?.avatar ||
						c.assetAbsolutePath ||
						"/fallback-champion.png",
					regions: Array.isArray(c.regions) ? c.regions : [],
					cost: Number(c.cost) || 0,
					maxStar: Number(c.maxStar) || 3,
					tag: Array.isArray(c.tag) ? c.tag : [],
					translations: c.translations,
					equippedRelics: [null, null, null]
				}));
				setAllChampionsRaw(formatted);

				const relicRes = await fetch(`${apiUrl}/api/relics?limit=-1`);
				const relicData = await relicRes.json();
				const formattedRelics = (relicData.items || relicData || []).map(r => ({
					id: String(r.relicCode || r.relicID || r.id),
					name: r.name,
					avatar: r.image || "/fallback-relic.png",
					rarity: r.rarity,
				}));
				setAllRelicsRaw(formattedRelics);

				const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
				if (saved) {
					const parsed = JSON.parse(saved);
					const hydrate = items =>
						items.map(i => {
							const baseId = String(i.id).split('-copy-')[0];
							const found = formatted.find(f => f.id === baseId);
							return found ? { ...found, id: i.id, equippedRelics: i.equippedRelics || [null, null, null] } : null;
						}).filter(Boolean);
					setTiers(parsed.tiers.map(t => ({ ...t, items: hydrate(t.items) })));
					setUnranked(hydrate(parsed.unranked));
				} else {
					const { sampleTiers, sampleUnranked } = getSampleData(formatted, formattedRelics);
					setTiers(sampleTiers);
					setUnranked(sampleUnranked);
				}
			} catch (err) {
				console.error(err);
			} finally {
				setTimeout(() => setLoading(false), 800);
			}
		};
		loadInitialData();
	}, [apiUrl, initialChampions, getSampleData]);

	useEffect(() => {
		if (!loading)
			localStorage.setItem(
				LOCAL_STORAGE_KEY,
				JSON.stringify({ tiers, unranked }),
			);
	}, [tiers, unranked, loading]);

	const handleSearch = () => setSearchTerm(searchInput.trim());
	const handleResetFilters = () => {
		setSearchInput("");
		setSearchTerm("");
		setSelectedRegions([]);
		setSelectedCosts([]);
		setSelectedMaxStars([]);
		setSelectedTags([]);
		setSelectedIds([]);
	};

	const filterOptions = useMemo(
		() => ({
			regions: [...new Set(allChampionsRaw.flatMap(c => c.regions))]
				.sort()
				.map(name => ({
					value: name,
					label: name,
					iconUrl:
						iconRegions.find(r => r.name === name)?.image ??
						"/fallback-image.svg",
				})),
			costs: [...new Set(allChampionsRaw.map(c => c.cost))]
				.filter(c => c > 0)
				.sort((a, b) => a - b)
				.map(v => ({ value: v, isCost: true })),
			maxStars: [...new Set(allChampionsRaw.map(c => c.maxStar))]
				.sort((a, b) => a - b)
				.map(v => ({ value: v, isStar: true })),
			tags: [...new Set(allChampionsRaw.flatMap(c => c.tag))]
				.sort()
				.map(v => ({ value: v, label: v, isTag: true })),
		}),
		[allChampionsRaw],
	);

	const filteredUnranked = useMemo(
		() =>
			unranked.filter(c => {
				const cName = tDynamic(c, "name");
				const matchesSearch =
					!searchTerm ||
					removeAccents(cName.toLowerCase()).includes(
						removeAccents(searchTerm.toLowerCase()),
					);
				return (
					matchesSearch &&
					(selectedRegions.length === 0 ||
						c.regions?.some(r => selectedRegions.includes(r))) &&
					(selectedCosts.length === 0 || selectedCosts.includes(c.cost)) &&
					(selectedMaxStars.length === 0 ||
						selectedMaxStars.includes(c.maxStar)) &&
					(selectedTags.length === 0 ||
						c.tag?.some(t => selectedTags.includes(t)))
				);
			}),
		[
			unranked,
			searchTerm,
			selectedRegions,
			selectedCosts,
			selectedMaxStars,
			selectedTags,
			tDynamic,
		],
	);

	const filteredRelics = useMemo(() => {
		if (!relicSearchInput.trim()) return allRelicsRaw;
		const search = removeAccents(relicSearchInput.toLowerCase());
		return allRelicsRaw.filter(r => removeAccents(r.name.toLowerCase()).includes(search));
	}, [allRelicsRaw, relicSearchInput]);

	const groupedRelics = useMemo(() => {
		const normalize = r => {
			if (!r) return "THƯỜNG";
			const u = String(r).toUpperCase().trim();
			if (u === "SỬ THI" || u === "EPIC") return "SỬ THI";
			if (u === "HIẾM" || u === "RARE") return "HIẾM";
			return "THƯỜNG";
		};
		const groups = {
			"SỬ THI": [],
			"HIẾM": [],
			"THƯỜNG": []
		};
		filteredRelics.forEach(relic => {
			groups[normalize(relic.rarity)].push(relic);
		});
		return groups;
	}, [filteredRelics]);

	const handleResetToSample = () => {
		if (window.confirm(tUI("tierList.confirmResetToSample"))) {
			const { sampleTiers, sampleUnranked } = getSampleData(allChampionsRaw, allRelicsRaw);
			setTiers(sampleTiers);
			setUnranked(sampleUnranked);
			setSelectedIds([]);
		}
	};

	const onMouseDown = e => {
		if (
			e.target.closest("button") ||
			e.target.tagName === "INPUT" ||
			e.target.closest("[data-id]") ||
			e.target.closest("[data-no-select]") ||
			e.target.closest(".color-picker") ||
			e.target.closest("[data-tier-handle]")
		)
			return;
		const rect = boardRef.current.getBoundingClientRect();
		boardRectRef.current = rect;
		const startX = e.clientX - rect.left;
		const startY = e.clientY - rect.top;
		selectionDataRef.current = { startX, startY, currentX: startX, currentY: startY };
		setIsSelecting(true);
		if (!e.shiftKey && !e.ctrlKey && !e.metaKey) setSelectedIds([]);
	};
	const onMouseMove = e => {
		if (!isSelecting) return;
		const rect = boardRectRef.current;
		const currentX = e.clientX - rect.left;
		const currentY = e.clientY - rect.top;
		selectionDataRef.current.currentX = currentX;
		selectionDataRef.current.currentY = currentY;

		if (selectionBoxDivRef.current) {
			const { startX, startY } = selectionDataRef.current;
			selectionBoxDivRef.current.style.left = `${Math.min(startX, currentX)}px`;
			selectionBoxDivRef.current.style.top = `${Math.min(startY, currentY)}px`;
			selectionBoxDivRef.current.style.width = `${Math.abs(startX - currentX)}px`;
			selectionBoxDivRef.current.style.height = `${Math.abs(startY - currentY)}px`;
		}
	};
	const onMouseUp = e => {
		if (!isSelecting) return;
		const rect = boardRectRef.current;
		const { startX, startY, currentX, currentY } = selectionDataRef.current;
		const box = {
			left: Math.min(startX, currentX),
			top: Math.min(startY, currentY),
			right: Math.max(startX, currentX),
			bottom: Math.max(startY, currentY),
		};
		const temp = [];
		boardRef.current.querySelectorAll("[data-id]").forEach(el => {
			const r = el.getBoundingClientRect();
			if (
				!(
					r.left - rect.left > box.right ||
					r.right - rect.left < box.left ||
					r.top - rect.top > box.bottom ||
					r.bottom - rect.top < box.top
				)
			)
				temp.push(el.getAttribute("data-id"));
		});
		setSelectedIds(prev =>
			e.shiftKey || e.ctrlKey || e.metaKey
				? [...new Set([...prev, ...temp])]
				: [...new Set(temp)],
		);
		setIsSelecting(false);
	};

	useEffect(() => {
		const handleGlobalMouseUp = (e) => {
			if (isSelecting) {
				onMouseUp(e);
			}
		};

		if (isSelecting) {
			window.addEventListener("mouseup", handleGlobalMouseUp);
		}
		return () => {
			window.removeEventListener("mouseup", handleGlobalMouseUp);
		};
	}, [isSelecting]);

	const findContainer = id => {
		if (id === "unranked" || unranked.some(i => i.id === id)) return "unranked";
		const tier = tiers.find(t => t.id === id || t.items.some(i => i.id === id));
		return tier ? tier.id : null;
	};

	const handleRelicSlotClick = useCallback((championId, slotIndex, e, isRightClick = false) => {
		const updateItem = (item) => {
			if (item.id === championId) {
				const newRelics = [...(item.equippedRelics || [null, null, null])];
				newRelics[slotIndex] = null;
				return { ...item, equippedRelics: newRelics };
			}
			return item;
		};
		setTiers(prev => prev.map(t => ({ ...t, items: t.items.map(updateItem) })));
		setUnranked(prev => prev.map(updateItem));
	}, []);

	const handleChampionRightClick = useCallback((e, champId) => {
		e.preventDefault();
		setChampionMenu({
			x: e.clientX,
			y: e.clientY,
			champId
		});
	}, []);

	const handleDuplicate = (champId) => {
		const duplicateItem = (item) => ({ ...item, id: `${item.id.split('-copy-')[0]}-copy-${Date.now()}` });

		setUnranked(prev => {
			const index = prev.findIndex(i => i.id === champId);
			if (index !== -1) {
				const newArr = [...prev];
				newArr.splice(index + 1, 0, duplicateItem(prev[index]));
				return newArr;
			}
			return prev;
		});

		setTiers(prev => prev.map(t => {
			const index = t.items.findIndex(i => i.id === champId);
			if (index !== -1) {
				const newItems = [...t.items];
				newItems.splice(index + 1, 0, duplicateItem(t.items[index]));
				return { ...t, items: newItems };
			}
			return t;
		}));
	};

	const handleDeleteChampion = (champId) => {
		setUnranked(prev => prev.filter(i => i.id !== champId));
		setTiers(prev => prev.map(t => ({ ...t, items: t.items.filter(i => i.id !== champId) })));
	};

	const handleDragOver = event => {
		const { active, over } = event;
		if (!over || activeType === "tier" || activeType === "relic") return;

		const activeId = active.id;
		const overId = over.id;

		const aCol = findContainer(activeId);
		const oCol = findContainer(overId);

		if (!aCol || !oCol) return;

		if (aCol !== oCol) {
			const idsToMove = selectedIds.includes(activeId)
				? selectedIds
				: [activeId];
			const moving = idsToMove
				.map(id => {
					let found = unranked.find(c => c.id === id);
					if (found) return found;
					for (const t of tiers) {
						found = t.items.find(c => c.id === id);
						if (found) return found;
					}
					const baseId = id.split('-copy-')[0];
					return allChampionsRaw.find(c => c.id === baseId);
				})
				.filter(Boolean);

			setUnranked(prev => {
				const filtered = prev.filter(i => !idsToMove.includes(i.id));
				if (oCol === "unranked") {
					const overIndex = filtered.findIndex(i => i.id === overId);
					const insertIndex = overIndex >= 0 ? overIndex : filtered.length;
					const result = [...filtered];
					result.splice(insertIndex, 0, ...moving);
					return result;
				}
				return filtered;
			});

			setTiers(prev =>
				prev.map(t => {
					const filtered = t.items.filter(i => !idsToMove.includes(i.id));
					if (t.id === oCol) {
						const overIndex = filtered.findIndex(i => i.id === overId);
						const insertIndex = overIndex >= 0 ? overIndex : filtered.length;
						const result = [...filtered];
						result.splice(insertIndex, 0, ...moving);
						return { ...t, items: result };
					}
					return { ...t, items: filtered };
				}),
			);
		} else if (activeId !== overId) {
			if (aCol === "unranked") {
				setUnranked(prev => {
					const oldIndex = prev.findIndex(i => i.id === activeId);
					const newIndex = prev.findIndex(i => i.id === overId);
					return arrayMove(prev, oldIndex, newIndex);
				});
			} else {
				setTiers(prev =>
					prev.map(t => {
						if (t.id === aCol) {
							const oldIndex = t.items.findIndex(i => i.id === activeId);
							const newIndex = t.items.findIndex(i => i.id === overId);
							return { ...t, items: arrayMove(t.items, oldIndex, newIndex) };
						}
						return t;
					}),
				);
			}
		}
	};

	const handleDragEnd = event => {
		const { active, over } = event;
		if (!over) {
			setActiveId(null);
			return;
		}

		if (activeType === "tier") {
			if (active.id !== over.id)
				setTiers(
					arrayMove(
						tiers,
						tiers.findIndex(t => t.id === active.id),
						tiers.findIndex(t => t.id === over.id),
					),
				);
		} else if (activeType === "relic") {
			if (over && over.id) {
				let championId = String(over.id);
				if (championId.startsWith("relic-drop-")) {
					championId = championId.replace("relic-drop-", "");
				} else if (championId === "unranked" || String(championId).startsWith("t-")) {
					return;
				}

				const relic = active.data.current?.relic;
				if (relic) {
					const updateItem = (item) => {
						if (item.id === championId) {
							const newRelics = [...(item.equippedRelics || [null, null, null])];
							const emptyIndex = newRelics.findIndex(r => r === null);
							if (emptyIndex !== -1) {
								newRelics[emptyIndex] = relic;
							} else {
								newRelics.shift();
								newRelics.push(relic);
							}
							return { ...item, equippedRelics: newRelics };
						}
						return item;
					};
					setTiers(prev => prev.map(t => ({ ...t, items: t.items.map(updateItem) })));
					setUnranked(prev => prev.map(updateItem));
				}
			}
		} else {
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
		btn.innerText = tUI("tierList.processing");
		await new Promise(r => setTimeout(r, 400));
		try {
			const canvas = await html2canvas(tierListRef.current, {
				useCORS: true,
				backgroundColor: "#121212",
				scale: 2,
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

	const activeItem = useMemo(() => {
		if (!activeId) return null;
		if (activeType === "relic") {
			return allRelicsRaw.find(r => `relic-${r.id}` === activeId);
		}
		let found = unranked.find(c => c.id === activeId);
		if (found) return found;
		for (const t of tiers) {
			found = t.items.find(c => c.id === activeId);
			if (found) return found;
		}
		const baseId = activeId.split('-copy-')[0];
		return allChampionsRaw.find(c => c.id === baseId);
	}, [activeId, activeType, allRelicsRaw, unranked, tiers, allChampionsRaw]);

	const renderChampionMenu = () => {
		if (!championMenu) return null;
		const baseId = championMenu.champId.split('-copy-')[0];
		let count = 0;
		unranked.forEach(i => { if (i.id.split('-copy-')[0] === baseId) count++; });
		tiers.forEach(t => t.items.forEach(i => { if (i.id.split('-copy-')[0] === baseId) count++; }));
		const canDelete = count > 1;

		return createPortal(
			<div
				className="fixed inset-0 z-[10000]"
				onClick={() => setChampionMenu(null)}
				onContextMenu={(e) => { e.preventDefault(); setChampionMenu(null); }}
			>
				<div
					className="absolute bg-surface-bg border border-white/20 rounded-lg shadow-2xl py-1 w-40 text-sm overflow-hidden"
					style={{ top: championMenu.y, left: championMenu.x }}
					onClick={e => e.stopPropagation()}
				>
					<button
						className="w-full text-left px-4 py-2 hover:bg-white/10 flex items-center gap-2"
						onClick={() => {
							handleDuplicate(championMenu.champId);
							setChampionMenu(null);
						}}
					>
						<Copy size={14} /> Nhân đôi
					</button>
					<button
						className={`w-full text-left px-4 py-2 flex items-center gap-2 ${canDelete ? "hover:bg-red-500/20 text-red-400" : "opacity-50 cursor-not-allowed"}`}
						onClick={() => {
							if (canDelete) {
								handleDeleteChampion(championMenu.champId);
								setChampionMenu(null);
							}
						}}
						disabled={!canDelete}
					>
						<Trash2 size={14} /> Xóa
					</button>
				</div>
			</div>,
			document.body
		);
	};

	return (
				<DndContext
			sensors={sensors}
			collisionDetection={rectIntersection}
			onDragStart={e => {
				setActiveId(e.active.id);
				setActiveType(e.active.data.current?.type || "item");
			}}
			onDragOver={handleDragOver}
			onDragEnd={handleDragEnd}
		>
			<div className='animate-fadeIn pb-20'>
				<PageTitle
					title={tUI("tierList.pageTitle")}
					description={tUI("metadata.defaultDescription")}
				/>
				<div className='max-w-[1200px] mx-auto p-0 font-secondary text-text-primary select-none'>
					<AnimatePresence mode='wait'>
						{loading ? (
							<motion.div
								key='skeleton'
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
							>
								<ChampionTierSkeleton />
							</motion.div>
						) : (
							<motion.div
								key='content'
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.3 }}
							>
								<div className='flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 px-2'>
									<h1 className='text-xl sm:text-2xl font-bold uppercase'>
										{tUI("home.tierListTitle")}
									</h1>
									<div className='flex flex-wrap justify-center sm:justify-end gap-2 w-full sm:w-auto'>
										<Button
											onClick={() =>
												setTiers([
													...tiers,
													{
														id: `t-${Date.now()}`,
														name: "NEW",
														description: tUI("common.description"),
														color: "#555555",
														items: [],
													},
												])
											}
											variant='outline'
											className='text-xs flex-1 sm:flex-none'
										>
											<Plus size={14} className='mr-1' /> {tUI("tierList.addRow")}
										</Button>
										<Button
											id='dl-btn'
											onClick={downloadImage}
											className='text-xs bg-primary-600 flex-1 sm:flex-none'
										>
											<Download size={14} className='mr-1' />{" "}
											{tUI("tierList.downloadImage")}
										</Button>
										<div className='flex gap-2'>
											<Button
												onClick={handleResetToSample}
												variant='outline'
												className='p-2 border-primary-500 text-primary-500 hover:bg-primary-500/10'
											>
												<Sparkles size={16} />
											</Button>
											<Button
												onClick={() => {
													if (window.confirm(tUI("tierList.confirmClearAll"))) {
														setTiers(getDefaultTiers());
														setUnranked([...allChampionsRaw]);
													}
												}}
												variant='danger'
												className='p-2'
											>
												<Trash2 size={16} />
											</Button>
										</div>
									</div>
								</div>
								<div
									ref={boardRef}
									onMouseDown={onMouseDown}
									onMouseMove={onMouseMove}
									onMouseUp={onMouseUp}
									className='relative min-h-screen'
								>
									<div
										ref={selectionBoxDivRef}
										className={`absolute border-2 border-primary-500 bg-primary-500/20 pointer-events-none z-[9999] ${isSelecting ? "block" : "hidden"}`}
									/>
									<div
										ref={tierListRef}
										className='bg-surface-bg border border-border rounded-lg flex flex-col gap-1 p-1 shadow-inner'
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
																	data-id={item.id}
																	onClick={e => {
																		e.stopPropagation();
																		setSelectedIds(prev =>
																			e.ctrlKey || e.metaKey || e.shiftKey
																				? prev.includes(item.id)
																					? prev.filter(x => x !== item.id)
																					: [...prev, item.id]
																				: prev.includes(item.id)
																					? []
																					: [item.id],
																		);
																	}}
																	className={`rounded-md transition-all ${selectedIds.includes(item.id) ? "ring-2 ring-primary-500 ring-offset-2 ring-offset-surface-bg scale-90" : ""}`}
																>
																	<SortableItem
																		id={item.id}
																		avatar={item.avatar}
																		title={tDynamic(item, "name")}
																		showRelicSlots={true}
																		equippedRelics={item.equippedRelics}
																		onRelicSlotClick={handleRelicSlotClick}
																		onContextMenu={handleChampionRightClick}
																		isInTier={true}
																	/>
																</div>
															))}
														</DroppableZone>
													</SortableContext>
												</SortableTierRow>
											))}
										</SortableContext>
									</div>
									<div className='mt-8 flex flex-col lg:flex-row gap-8'>
										<div className='flex-1 p-4 bg-surface-bg border border-border rounded-lg shadow-sm'>
											<div className='flex flex-col sm:flex-row justify-between items-center mb-4 gap-4'>
												<h2 className='text-xs font-bold text-text-secondary uppercase tracking-widest'>
													{tUI("tierList.warehouseChamps")} ({filteredUnranked.length})
												</h2>
												<div className='flex gap-2 w-full sm:w-auto'>
													<Button
														variant='outline'
														size='sm'
														onClick={() =>
															setSelectedIds(filteredUnranked.map(c => c.id))
														}
														className='text-[10px] flex-1 sm:flex-none'
													>
														<CheckSquare size={14} className='mr-1' />{" "}
														{tUI("randomWheel.selectAll")}
													</Button>
													<Button
														variant='outline'
														size='sm'
														onClick={() => setSelectedIds([])}
														className='text-[10px] flex-1 sm:flex-none'
														disabled={selectedIds.length === 0}
													>
														<Square size={14} className='mr-1' />{" "}
														{tUI("randomWheel.deselectAll")} ({selectedIds.length})
													</Button>
												</div>
											</div>
											<div className='grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6 relative z-10'>
												<InputField
													value={searchInput}
													onChange={e => setSearchInput(e.target.value)}
													onKeyDown={e => e.key === "Enter" && handleSearch()}
													placeholder={tUI("championList.searchPlaceholder")}
												/>
												<MultiSelectFilter
													options={filterOptions.regions}
													selectedValues={selectedRegions}
													onChange={setSelectedRegions}
													placeholder={tUI("championList.region")}
												/>
												<MultiSelectFilter
													options={filterOptions.costs}
													selectedValues={selectedCosts}
													onChange={setSelectedCosts}
													placeholder={tUI("championList.cost")}
												/>
												<MultiSelectFilter
													options={filterOptions.maxStars}
													selectedValues={selectedMaxStars}
													onChange={setSelectedMaxStars}
													placeholder={tUI("championList.maxStars")}
												/>
												<Button variant='outline' onClick={handleResetFilters}>
													<RotateCw size={14} className='mr-2' /> {tUI("common.reset")}
												</Button>
											</div>
											<DroppableZone
												id='unranked'
												className='min-h-[300px] border-2 border-dashed border-white/5 rounded-xl p-4 bg-black/10 flex flex-wrap gap-2 content-start'
											>
												{unranked.map(item =>
													filteredUnranked.some(f => f.id === item.id) ? (
														<div
															key={item.id}
															data-id={item.id}
															className={`rounded-md transition-all cursor-pointer ${selectedIds.includes(item.id) ? "ring-2 ring-primary-500 ring-offset-2 ring-offset-surface-bg scale-90" : ""}`}
															onClick={e => {
																e.stopPropagation();
																setSelectedIds(prev =>
																	e.ctrlKey || e.metaKey || e.shiftKey
																		? prev.includes(item.id)
																			? prev.filter(x => x !== item.id)
																			: [...prev, item.id]
																		: prev.includes(item.id)
																			? []
																			: [item.id],
																);
															}}
														>
															<SortableItem
																id={item.id}
																avatar={item.avatar}
																title={tDynamic(item, "name")}
																showRelicSlots={true}
																equippedRelics={item.equippedRelics}
																onRelicSlotClick={handleRelicSlotClick}
																onContextMenu={handleChampionRightClick}
															/>
														</div>
													) : null,
												)}
											</DroppableZone>
										</div>
										<div className='w-full lg:w-[400px] xl:w-[450px] p-4 bg-surface-bg border border-border rounded-lg shadow-sm flex flex-col' data-no-select="true">
											<div className='flex justify-between items-center mb-4'>
												<h2 className='text-xs font-bold text-text-secondary uppercase tracking-widest'>
													{tUI("tierList.relicsPool")}
												</h2>
											</div>
											<div className='mb-6'>
												<InputField
													value={relicSearchInput}
													onChange={e => setRelicSearchInput(e.target.value)}
													placeholder='Search relics...'
												/>
											</div>
											<div className='flex-1 overflow-y-auto max-h-[600px] min-h-[300px] border-2 border-dashed border-white/5 rounded-xl p-4 bg-black/10 flex flex-col gap-4 content-start custom-scrollbar'>
												{Object.entries(groupedRelics).map(([rarity, items]) => 
													items.length > 0 ? (
														<div key={rarity}>
															<h3 className='text-[10px] font-bold text-text-tertiary uppercase mb-2 ml-1 opacity-60'>
																{rarity}
															</h3>
															<div className='flex flex-wrap gap-2'>
																{items.map(relic => (
																	<DraggableRelic key={relic.id} relic={relic} />
																))}
															</div>
														</div>
													) : null
												)}
											</div>
										</div>
									</div>
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</div>
			{activeId && createPortal(
				<DragOverlay
					dropAnimation={{
						sideEffects: defaultDropAnimationSideEffects({
							styles: { active: { opacity: "0.4" } },
						}),
					}}
					zIndex={10000}
				>
					{activeType === "tier" ? (
						<div className='flex min-h-[60px] sm:min-h-[100px] w-[300px] sm:w-[600px] bg-surface-bg border-2 border-primary-500 rounded-lg overflow-hidden shadow-2xl opacity-90'>
							<div className='w-6 sm:w-8 shrink-0 bg-black/20' />
							<div
								style={{
									backgroundColor: tiers.find(t => t.id === activeId)?.color,
								}}
								className='w-12 sm:w-36 flex items-center justify-center font-bold text-sm sm:text-3xl text-black uppercase shrink-0'
							>
								{tiers.find(t => t.id === activeId)?.name}
							</div>
							<div className='flex-1 p-4 bg-black/40 text-text-secondary italic flex items-center text-xs sm:text-base'>
								{tUI("tierList.movingRow")}
							</div>
						</div>
					) : activeType === "relic" ? (
						<div className="w-10 h-10 sm:w-12 sm:h-12 bg-black/40 border-2 border-primary-500 rounded overflow-hidden flex-shrink-0 shadow-2xl scale-125 z-[10000]">
							<img src={activeItem?.avatar} alt={activeItem?.name} className="w-full h-full object-cover" crossOrigin="anonymous" />
						</div>
					) : (
						<div className='relative'>
							<SortableItem
								id={activeId}
								avatar={activeItem?.avatar}
								isOverlay
								showRelicSlots={true}
								equippedRelics={activeItem?.equippedRelics}
							/>
							{selectedIds.length > 1 && selectedIds.includes(activeId) && (
								<div className='absolute -top-2 -right-2 bg-primary-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg border-2 border-white'>
									{selectedIds.length}
								</div>
							)}
						</div>
					)}
				</DragOverlay>,
				document.body
			)}
			{renderChampionMenu && renderChampionMenu()}
		</DndContext>
	);
}

export default TierListChampions;
