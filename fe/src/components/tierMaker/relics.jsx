// src/pages/tierList/relics.jsx
import React, {
	useState,
	useEffect,
	useRef,
	useMemo,
	useCallback,
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
	Trash2,
	Sparkles,
	GripVertical,
	CheckSquare,
	Square,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
	RELIC_STORAGE_KEY,
} from "./tierListComponents";
import { useTranslation } from "../../hooks/useTranslation";

// --- 0. HÀM CHUẨN HÓA ĐỘ HIẾM ---
const normalizeRarity = rarity => {
	if (!rarity) return "THƯỜNG";
	const upper = String(rarity).toUpperCase().trim();
	if (upper === "SỬ THI" || upper === "EPIC") return "SỬ THI";
	if (upper === "HIẾM" || upper === "RARE") return "HIẾM";
	if (upper === "THƯỜNG" || upper === "COMMON") return "THƯỜNG";
	return "THƯỜNG"; // Fallback mặc định
};

// --- 1. ĐỊNH NGHĨA SKELETON (ĐẶT Ở ĐẦU FILE) ---
const RelicTierSkeleton = () => (
	<div className='max-w-[1200px] mx-auto p-2 sm:p-6 animate-pulse'>
		<div className='flex justify-between items-center mb-6 px-2'>
			<div className='h-8 w-48 bg-gray-700/50 rounded' />
			<div className='flex gap-2'>
				<div className='h-9 w-28 bg-gray-700/50 rounded' />
				<div className='h-9 w-28 bg-gray-700/50 rounded' />
			</div>
		</div>
		<div className='bg-surface-bg border border-border rounded-lg p-1 space-y-1 mb-8'>
			{[1, 2, 3, 4].map(i => (
				<div key={i} className='flex h-20 sm:h-24 bg-white/5 rounded'>
					<div className='w-20 sm:w-36 bg-gray-700/30 shrink-0' />
					<div className='flex-1 p-2 flex gap-2'>
						{[1, 2, 3, 4, 5].map(j => (
							<div
								key={j}
								className='w-12 h-12 sm:w-16 sm:h-16 bg-gray-700/20 rounded'
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
					className='w-6 sm:w-8 flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-white/5 text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity'
				>
					<GripVertical size={20} />
				</div>
			)}
			<div
				style={{ backgroundColor: tier.color }}
				className='relative w-20 sm:w-36 flex flex-col items-center justify-center p-1 text-black shrink-0'
			>
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
					readOnly={isExporting}
				/>
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
					readOnly={isExporting}
				/>
				{!isExporting && (
					<button
						onClick={e => {
							e.stopPropagation();
							setShowColorPicker(showColorPicker === tier.id ? null : tier.id);
						}}
						className='absolute top-1 right-1 p-1 bg-white/40 hover:bg-white/60 rounded opacity-0 group-hover:opacity-100 z-[50]'
					>
						<Palette size={20} />
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

// --- 3. COMPONENT CHÍNH ---
function TierListRelics() {
	const { tUI, tDynamic } = useTranslation();
	const [allRelicsRaw, setAllRelicsRaw] = useState([]);
	const [tiers, setTiers] = useState([]);
	const [unranked, setUnranked] = useState([]);
	const [activeId, setActiveId] = useState(null);
	const [activeType, setActiveType] = useState(null);
	const [loading, setLoading] = useState(true);
	const [isExporting, setIsExporting] = useState(false);
	const [selectedIds, setSelectedIds] = useState([]);
	const [selectionBox, setSelectionBox] = useState(null);
	const [isSelecting, setIsSelecting] = useState(false);
	const [searchInput, setSearchInput] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedRarities, setSelectedRarities] = useState([]);
	const [selectedTypes, setSelectedTypes] = useState([]);
	const [showColorPicker, setShowColorPicker] = useState(null);

	const tierListRef = useRef(null);
	const boardRef = useRef(null);
	const apiUrl = import.meta.env.VITE_API_URL;

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
		useSensor(TouchSensor, {
			activationConstraint: { delay: 300, tolerance: 6 },
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);
	const sortItemsByName = useCallback(
		items => [...items].sort((a, b) => a.name.localeCompare(b.name, "vi")),
		[],
	);

	const getDefaultTiers = useCallback(
		() => [
			{
				id: "tier-s-plus",
				name: "S+",
				description: tUI("tierList.versatileStrong"),
				color: "#ff3e3e",
				items: [],
			},
			{
				id: "tier-s",
				name: "S",
				description: tUI("tierList.strongSpecific"),
				color: "#ff7f7f",
				items: [],
			},
			{
				id: "tier-a",
				name: "A",
				description: tUI("tierList.versatile"),
				color: "#ffbf7f",
				items: [],
			},
			{
				id: "tier-b",
				name: "B",
				description: tUI("tierList.decent"),
				color: "#ffff7f",
				items: [],
			},
			{
				id: "tier-c",
				name: "C",
				description: tUI("tierList.weak"),
				color: "#7fff7f",
				items: [],
			},
		],
		[tUI],
	);

	const getSampleData = useCallback(
		rawData => {
			const sampleMapping = {
				"tier-s-plus": ["R0082", "R0125", "R0080"],
				"tier-s": [
					"R0121",
					"R0136",
					"R0060",
					"R0100",
					"R0094",
					"R0139",
					"R0104",
					"R0098",
					"R0123",
					"R0092",
					"R0116",
					"R0124",
					"R0061",
					"R0103",
					"R0065",
					"R0150",
					"R0153",
					"R0166"
				],
				"tier-a": [
					"R0066",
					"R0099",
					"R0115",
					"R0109",
					"R0111",
					"R0086",
					"R0079",
					"R0064",
					"R0097",
					"R0113",
					"R0108",
					"R0091",
					"R0062",
					"R0085",
					"R0159",
					"R0161"
				],
				"tier-b": [
					"R0160",
					"R0134",
					"R0127",
					"R0141",
					"R0112",
					"R0059",
					"R0146",
					"R0144",
					"R0130",
					"R0114",
					"R0133",
					"R0128",
					"R0140",
					"R0137",
					"R0058",
					"R0145",
					"R0151",
					"R0131",
					"R0138",
					"R0105",
					"R0147",
					"R0107",
					"R0122",
					"R0148",
					"R0117",
					"R0089",
					"R0135",
					"R0154",
					"R0155",
					"R0164"
				],
				"tier-c": [
					"R0118",
					"R0120",
					"R0142",
					"R0143",
					"R0119",
					"R0106",
					"R0126",
					"R0149",
					"R0132",
					"R0175"
				],
			};
			const usedIds = new Set();
			const sampleTiers = getDefaultTiers().map(tier => {
				const targetIds = sampleMapping[tier.id] || [];
				const items = rawData.filter(r => targetIds.includes(r.id));
				items.forEach(i => usedIds.add(i.id));
				return { ...tier, items };
			});
			return {
				sampleTiers,
				sampleUnranked: sortItemsByName(
					rawData.filter(r => !usedIds.has(r.id)),
				),
			};
		},
		[getDefaultTiers, sortItemsByName],
	);

	useEffect(() => {
		const initData = async () => {
			try {
				setLoading(true);
				const res = await fetch(`${apiUrl}/api/relics?limit=-1`);
				const data = await res.json();
				const formatted = sortItemsByName(
					(data.items || []).map((r, index) => ({
						id: String(r.relicCode || r.relicID || r.id),
						name: r.name,
						avatar: r.image || "/fallback-relic.png",
						rarity: normalizeRarity(r.rarity),
						type: r.type || "Chung",
						descriptionRaw: r.descriptionRaw || "",
						translations: r.translations,
					})),
				);
				setAllRelicsRaw(formatted);
				const saved = localStorage.getItem(RELIC_STORAGE_KEY);
				if (saved) {
					const parsed = JSON.parse(saved);
					const hydrate = items =>
						items.map(i => formatted.find(f => f.id === i.id)).filter(Boolean);
					setTiers(parsed.tiers.map(t => ({ ...t, items: hydrate(t.items) })));
					setUnranked(hydrate(parsed.unranked));
				} else {
					const { sampleTiers, sampleUnranked } = getSampleData(formatted);
					setTiers(sampleTiers);
					setUnranked(sampleUnranked);
				}
			} catch (err) {
				console.error(err);
			} finally {
				setTimeout(() => setLoading(false), 800);
			}
		};
		initData();
	}, [apiUrl, getSampleData, sortItemsByName]);

	useEffect(() => {
		if (!loading)
			localStorage.setItem(
				RELIC_STORAGE_KEY,
				JSON.stringify({ tiers, unranked }),
			);
	}, [tiers, unranked, loading]);

	const handleSearch = () => setSearchTerm(searchInput.trim());
	const handleResetFilters = () => {
		setSearchInput("");
		setSearchTerm("");
		setSelectedRarities([]);
		setSelectedTypes([]);
		setSelectedIds([]);
	};

	const filterOptions = useMemo(
		() => ({
			rarities: [...new Set(allRelicsRaw.map(r => r.rarity))]
				.filter(Boolean)
				.sort()
				.map(v => ({ value: v, label: v })),
			types: [...new Set(allRelicsRaw.map(r => r.type))]
				.filter(Boolean)
				.sort()
				.map(v => ({ value: v, label: v })),
		}),
		[allRelicsRaw],
	);

	const filteredUnranked = useMemo(
		() =>
			unranked.filter(r => {
				const rName = tDynamic(r, "name");
				const matchesSearch =
					!searchTerm ||
					removeAccents(rName.toLowerCase()).includes(
						removeAccents(searchTerm.toLowerCase()),
					);
				return (
					matchesSearch &&
					(selectedRarities.length === 0 ||
						selectedRarities.includes(r.rarity)) &&
					(selectedTypes.length === 0 || selectedTypes.includes(r.type))
				);
			}),
		[unranked, searchTerm, selectedRarities, selectedTypes, tDynamic],
	);

	const handleResetToSample = () => {
		if (window.confirm(tUI("tierList.confirmResetToSample"))) {
			const { sampleTiers, sampleUnranked } = getSampleData(allRelicsRaw);
			setTiers(sampleTiers);
			setUnranked(sampleUnranked);
			setSelectedIds([]);
		}
	};

	const warehouseGroups = useMemo(
		() => ({
			"SỬ THI": filteredUnranked.filter(r => r.rarity === "SỬ THI"),
			HIẾM: filteredUnranked.filter(r => r.rarity === "HIẾM"),
			THƯỜNG: filteredUnranked.filter(
				r => r.rarity !== "SỬ THI" && r.rarity !== "HIẾM",
			),
		}),
		[filteredUnranked],
	);

	const onMouseDown = e => {
		if (
			e.target.closest("button") ||
			e.target.tagName === "INPUT" ||
			e.target.closest("[data-id]") ||
			e.target.closest(".color-picker") ||
			e.target.closest("[data-tier-handle]")
		)
			return;
		const rect = boardRef.current.getBoundingClientRect();
		setIsSelecting(true);
		setSelectionBox({
			startX: e.clientX - rect.left,
			startY: e.clientY - rect.top,
			currentX: e.clientX - rect.left,
			currentY: e.clientY - rect.top,
		});
		if (!e.shiftKey && !e.ctrlKey && !e.metaKey) setSelectedIds([]);
	};
	const onMouseMove = e => {
		if (!isSelecting) return;
		const rect = boardRef.current.getBoundingClientRect();
		setSelectionBox(prev => ({
			...prev,
			currentX: e.clientX - rect.left,
			currentY: e.clientY - rect.top,
		}));
	};
	const onMouseUp = e => {
		if (!isSelecting) return;
		const rect = boardRef.current.getBoundingClientRect();
		const box = {
			left: Math.min(selectionBox.startX, selectionBox.currentX),
			top: Math.min(selectionBox.startY, selectionBox.currentY),
			right: Math.max(selectionBox.startX, selectionBox.currentX),
			bottom: Math.max(selectionBox.startY, selectionBox.currentY),
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
		setSelectedIds(p =>
			e.shiftKey || e.ctrlKey || e.metaKey
				? [...new Set([...p, ...temp])]
				: [...new Set(temp)],
		);
		setIsSelecting(false);
		setSelectionBox(null);
	};

	const findContainer = id => {
		if (id === "unranked" || id?.toString().startsWith("unranked") || unranked.some(i => i.id === id)) return "unranked";
		const tier = tiers.find(t => t.id === id || t.items.some(i => i.id === id));
		return tier ? tier.id : null;
	};

	const handleDragOver = event => {
		const { active, over } = event;
		if (!over || activeType === "tier") return;

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
				.map(id => allRelicsRaw.find(i => i.id === id))
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
			// Reorder within same container
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
		} else {
			// Item reordering is already handled by handleDragOver
		}

		setActiveId(null);
		setActiveType(null);
		if (!selectedIds.includes(active.id)) setSelectedIds([]);
	};

	const activeItem = activeId
		? allRelicsRaw.find(r => r.id === activeId)
		: null;

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
					title={tUI("tierList.relicPageTitle")}
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
								<RelicTierSkeleton />
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
										{tUI("home.tierListTitle")} (Cổ vật)
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
											onClick={async () => {
												setIsExporting(true);
												setShowColorPicker(null);
												await new Promise(r => setTimeout(r, 400));
												try {
													const canvas = await html2canvas(tierListRef.current, {
														useCORS: true,
														backgroundColor: "#121212",
														scale: 2,
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
											}}
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
														setUnranked(sortItemsByName(allRelicsRaw));
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
									{isSelecting && selectionBox && (
										<div
											style={{
												left: Math.min(
													selectionBox.startX,
													selectionBox.currentX,
												),
												top: Math.min(
													selectionBox.startY,
													selectionBox.currentY,
												),
												width: Math.abs(
													selectionBox.startX - selectionBox.currentX,
												),
												height: Math.abs(
													selectionBox.startY - selectionBox.currentY,
												),
											}}
											className='absolute z-[9999] border border-primary-500 bg-primary-500/20 pointer-events-none'
										/>
									)}
									<div
										ref={tierListRef}
										className='bg-surface-bg border border-border rounded-lg flex flex-col gap-1 p-1 shadow-inner overflow-visible mb-8'
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
																	/>
																</div>
															))}
														</DroppableZone>
													</SortableContext>
												</SortableTierRow>
											))}
										</SortableContext>
									</div>
									<div className='mt-8 p-4 bg-surface-bg border border-border rounded-lg shadow-sm mb-12'>
										<div className='flex flex-col sm:flex-row justify-between items-center mb-4 gap-4'>
											<h2 className='text-xs font-bold text-text-secondary uppercase tracking-widest'>
												CỔ VẬT CHƯA PHÂN LOẠI ({filteredUnranked.length})
											</h2>
											<div className='flex gap-2 w-full sm:w-auto'>
												<Button
													variant='outline'
													size='sm'
													onClick={() =>
														setSelectedIds(filteredUnranked.map(r => r.id))
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
										<div className='grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 relative z-10'>
											<InputField
												value={searchInput}
												onChange={e => setSearchInput(e.target.value)}
												onKeyDown={e => e.key === "Enter" && handleSearch()}
												placeholder={tUI("championList.searchPlaceholder")}
											/>
											<MultiSelectFilter
												options={filterOptions.rarities}
												selectedValues={selectedRarities}
												onChange={setSelectedRarities}
												placeholder={tUI("relicList.rarity")}
											/>
											<MultiSelectFilter
												options={filterOptions.types}
												selectedValues={selectedTypes}
												onChange={setSelectedTypes}
												placeholder={tUI("relicList.type")}
											/>
											<Button variant='outline' onClick={handleResetFilters}>
												<RotateCw size={14} className='mr-2' /> {tUI("common.reset")}
											</Button>
										</div>

										<div className='space-y-6'>
											{Object.entries(warehouseGroups).map(([rarity, items]) =>
												items.length > 0 ? (
													<div key={rarity}>
														<h3 className='text-[10px] font-bold text-text-tertiary uppercase mb-2 ml-1 opacity-60'>
															{rarity}
														</h3>
														<DroppableZone
															id={`unranked-${rarity}`}
															className='min-h-[100px] border-2 border-dashed border-white/5 rounded-xl p-3 bg-black/10 flex flex-wrap gap-2 content-start'
														>
															{items.map(item => (
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
																	/>
																</div>
															))}
														</DroppableZone>
													</div>
												) : null,
											)}
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
								className='w-20 sm:w-36 flex items-center justify-center font-bold text-sm sm:text-3xl text-black uppercase shrink-0'
							>
								{tiers.find(t => t.id === activeId)?.name}
							</div>
							<div className='flex-1 p-4 bg-black/40 text-text-secondary italic flex items-center text-xs sm:text-base'>
								{tUI("tierList.movingRow")}
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
					)}
				</DragOverlay>,
				document.body
			)}
		</DndContext>
	);
}

export default TierListRelics;
