// src/pages/tierList/champions.jsx
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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
import { useTranslation } from "../../hooks/useTranslation";

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
					<div className='w-20 sm:w-36 bg-gray-700/30 shrink-0' />
					<div className='flex-1 p-2 flex gap-2'>
						{[1, 2, 3, 4].map(j => (
							<div
								key={j}
								className='w-12 h-12 sm:w-20 sm:h-20 bg-gray-700/20 rounded'
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

// --- 3. COMPONENT CHÍNH ---
function TierListChampions({ initialChampions }) {
	const { tUI, tDynamic } = useTranslation();
	const [allChampionsRaw, setAllChampionsRaw] = useState([]);
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
			activationConstraint: { delay: 300, tolerance: 6 },
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	const getDefaultTiers = useCallback(
		() => [
			{
				id: "tier-s+",
				name: "S+",
				description: tUI("tierList.godTier"),
				color: "#ff3e3e",
				items: [],
			},
			{
				id: "tier-s",
				name: "S",
				description: tUI("tierList.overpowered"),
				color: "#ff7f7f",
				items: [],
			},
			{
				id: "tier-a+",
				name: "A+",
				description: tUI("tierList.veryStrong"),
				color: "#ff9f40",
				items: [],
			},
			{
				id: "tier-a",
				name: "A",
				description: tUI("tierList.good"),
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
					"C082",
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
				"tier-c": [],
			};
			const usedIds = new Set();
			const sampleTiers = getDefaultTiers().map(tier => {
				const targetIds = sampleMapping[tier.id] || [];
				const items = rawData.filter(c => targetIds.includes(c.id));
				items.forEach(i => usedIds.add(i.id));
				return { ...tier, items };
			});
			const sampleUnranked = rawData.filter(c => !usedIds.has(c.id));
			return { sampleTiers, sampleUnranked };
		},
		[getDefaultTiers],
	);

	useEffect(() => {
		const loadInitialData = async () => {
			try {
				setLoading(true);
				let rawData;
				if (initialChampions?.length > 0) rawData = initialChampions;
				else {
					const res = await fetch(`${apiUrl}/api/champions?limit=1000`);
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
				}));
				setAllChampionsRaw(formatted);
				const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
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
						iconRegions.find(r => r.name === name)?.iconAbsolutePath ??
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

	const handleResetToSample = () => {
		if (window.confirm(tUI("tierList.confirmResetToSample"))) {
			const { sampleTiers, sampleUnranked } = getSampleData(allChampionsRaw);
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
			e.target.closest(".color-picker")
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
		setSelectedIds(prev =>
			e.shiftKey || e.ctrlKey || e.metaKey
				? [...new Set([...prev, ...temp])]
				: [...new Set(temp)],
		);
		setIsSelecting(false);
		setSelectionBox(null);
	};

	const findContainer = id => {
		if (id === "unranked" || unranked.some(i => i.id === id)) return "unranked";
		const tier = tiers.find(t => t.id === id || t.items.some(i => i.id === id));
		return tier ? tier.id : null;
	};

	const handleDragOver = event => {
		const { active, over } = event;
		if (!over || activeType === "tier") return;
		const aCol = findContainer(active.id);
		const oCol =
			over.id === "unranked" || unranked.some(i => i.id === over.id)
				? "unranked"
				: tiers.find(
						t => t.id === over.id || t.items.some(i => i.id === over.id),
					)?.id;
		if (!aCol || !oCol || aCol === oCol) return;
		const idsToMove = selectedIds.includes(active.id)
			? selectedIds
			: [active.id];
		const moving = idsToMove
			.map(id => allChampionsRaw.find(i => i.id === id))
			.filter(Boolean);
		setUnranked(p => {
			const f = p.filter(i => !idsToMove.includes(i.id));
			return oCol === "unranked" ? [...f, ...moving] : f;
		});
		setTiers(p =>
			p.map(t => {
				const f = t.items.filter(i => !idsToMove.includes(i.id));
				return t.id === oCol
					? { ...t, items: [...f, ...moving] }
					: { ...t, items: f };
			}),
		);
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

	const activeItem = activeId
		? allChampionsRaw.find(c => c.id === activeId)
		: null;

	return (
		<div className='animate-fadeIn'>
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
																	/>
																</div>
															))}
														</DroppableZone>
													</SortableContext>
												</SortableTierRow>
											))}
										</SortableContext>
									</div>
									<div className='mt-8 p-4 bg-surface-bg border border-border rounded-lg shadow-sm'>
										<div className='flex flex-col sm:flex-row justify-between items-center mb-4 gap-4'>
											<h2 className='text-xs font-bold text-text-secondary uppercase tracking-widest'>
												{tUI("tierList.warehouseChamps")} (
												{filteredUnranked.length})
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
													{tUI("randomWheel.deselectAll")} ({selectedIds.length}
													)
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
												<RotateCw size={14} className='mr-2' />{" "}
												{tUI("common.reset")}
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
														/>
													</div>
												) : null,
											)}
										</DroppableZone>
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
											<div className='flex min-h-[100px] w-full bg-surface-bg border-2 border-primary-500 rounded-lg overflow-hidden'>
												<div
													style={{
														backgroundColor: tiers.find(t => t.id === activeId)
															?.color,
													}}
													className='w-36 flex items-center justify-center font-bold text-3xl text-black uppercase'
												>
													{tiers.find(t => t.id === activeId)?.name}
												</div>
												<div className='flex-1 p-4 bg-black/40 text-text-secondary italic flex items-center'>
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
												{selectedIds.length > 1 &&
													selectedIds.includes(activeId) && (
														<div className='absolute -top-2 -right-2 bg-primary-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg border-2 border-white'>
															{selectedIds.length}
														</div>
													)}
											</div>
										)
									) : null}
								</DragOverlay>
							</DndContext>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}

export default TierListChampions;
