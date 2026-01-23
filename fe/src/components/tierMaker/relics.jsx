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
import { removeAccents } from "../../utils/vietnameseUtils";
import {
	SortableItem,
	DroppableZone,
	COLOR_OPTIONS,
} from "./tierListComponents";

const RELICS_STORAGE_KEY = "poc-custom-tierlist-relics-v1";

// --- Thành phần bọc từng hàng Tier để có thể kéo thả cả hàng ---
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
			{/* Drag Handle cho Tier */}
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
						className='absolute top-1 right-1 p-1 bg-white/40 hover:bg-white/60 rounded opacity-0 group-hover:opacity-100 z-[50]'
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

function TierListRelics() {
	const [allRelicsRaw, setAllRelicsRaw] = useState([]);
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
	const [selectedRarities, setSelectedRarities] = useState([]);
	const [selectedTypes, setSelectedTypes] = useState([]);
	const [showColorPicker, setShowColorPicker] = useState(null);
	const [isFilterOpen, setIsFilterOpen] = useState(false);

	const tierListRef = useRef(null);
	const warehouseRef = useRef(null);
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
			id: "tier-s+",
			name: "S",
			description: "Mạnh Đa dụng",
			color: "#ff3e3e",
			items: [],
		},
		{
			id: "tier-s",
			name: "S",
			description: "Mạnh cho tướng ",
			color: "#ff7f7f",
			items: [],
		},
		{
			id: "tier-a",
			name: "A",
			description: "Đa dụng",
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
			"tier-s+": ["R0082", "R0125", "R0080"],
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
			],
			"tier-b": [
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
			],
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

	// --- CÁC HÀM XỬ LÝ NÚT CHỨC NĂNG ---

	const handleClearAllToUnranked = () => {
		if (confirm("Xóa toàn bộ cổ vật khỏi bảng và đưa về kho?")) {
			setTiers(getDefaultTiers());
			setUnranked(sortItemsByName(allRelicsRaw));
			setSelectedIds([]);
		}
	};

	const handleResetToSample = () => {
		if (
			confirm(
				"Bạn muốn khôi phục bảng xếp hạng mẫu? Mọi thay đổi hiện tại sẽ mất.",
			)
		) {
			const { sampleTiers, sampleUnranked } = getSampleData(allRelicsRaw);
			setTiers(sampleTiers);
			setUnranked(sampleUnranked);
			setSelectedIds([]);
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
		setSelectedIds([]);
	};

	const filterOptions = useMemo(() => {
		const rarities = [...new Set(allRelicsRaw.map(r => r.rarity))]
			.filter(Boolean)
			.sort()
			.map(v => ({ value: v, label: v }));
		const types = [...new Set(allRelicsRaw.map(r => r.type))]
			.filter(Boolean)
			.sort()
			.map(v => ({ value: v, label: v }));
		return { rarities, types };
	}, [allRelicsRaw]);

	const filteredUnranked = useMemo(() => {
		return unranked.filter(r => {
			const matchesSearch =
				!searchTerm ||
				removeAccents(r.name.toLowerCase()).includes(
					removeAccents(searchTerm.toLowerCase()),
				);
			const matchesRarity =
				selectedRarities.length === 0 || selectedRarities.includes(r.rarity);
			const matchesType =
				selectedTypes.length === 0 || selectedTypes.includes(r.type);
			return matchesSearch && matchesRarity && matchesType;
		});
	}, [unranked, searchTerm, selectedRarities, selectedTypes]);

	const warehouseGroups = useMemo(() => {
		return {
			"SỬ THI": filteredUnranked.filter(r => r.rarity === "SỬ THI"),
			HIẾM: filteredUnranked.filter(r => r.rarity === "HIẾM"),
			THƯỜNG: filteredUnranked.filter(
				r =>
					r.rarity === "THƯỜNG" ||
					(r.rarity !== "SỬ THI" && r.rarity !== "HIẾM"),
			),
		};
	}, [filteredUnranked]);

	// --- LOGIC QUÉT CHỌN (BOX SELECTION) ---
	const onMouseDown = e => {
		if (
			e.target !== e.currentTarget &&
			!e.target.classList.contains("group-rarity-container")
		)
			return;
		const rect = warehouseRef.current.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		setIsSelecting(true);
		setSelectionBox({ startX: x, startY: y, currentX: x, currentY: y });
		if (!e.shiftKey) setSelectedIds([]);
	};

	const onMouseMove = e => {
		if (!isSelecting) return;
		const rect = warehouseRef.current.getBoundingClientRect();
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
		const itemElements = warehouseRef.current.querySelectorAll("[data-id]");

		itemElements.forEach(el => {
			const itemRect = el.getBoundingClientRect();
			const containerRect = warehouseRef.current.getBoundingClientRect();
			const itemTop = itemRect.top - containerRect.top;
			const itemLeft = itemRect.left - containerRect.left;
			const isIntersecting = !(
				itemLeft > right ||
				itemLeft + itemRect.width < left ||
				itemTop > bottom ||
				itemTop + itemRect.height < top
			);
			if (isIntersecting) tempSelectedIds.push(el.getAttribute("data-id"));
		});

		// SỬA LỖI TẠI ĐÂY: Loại bỏ trùng lặp ID trước khi cập nhật state
		const uniqueSelectedIds = [...new Set(tempSelectedIds)];

		if (e.shiftKey)
			setSelectedIds(prev => [...new Set([...prev, ...uniqueSelectedIds])]);
		else setSelectedIds(uniqueSelectedIds);

		setIsSelecting(false);
		setSelectionBox(null);
	};

	// --- LOGIC DND ---
	const findContainer = id => {
		if (id.startsWith("unranked-")) return id;
		const itemInUnranked = unranked.find(i => i.id === id);
		if (itemInUnranked)
			return `unranked-${itemInUnranked.rarity.toUpperCase()}`;
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
		const aCol = findContainer(active.id);
		const oCol = findContainer(over.id);
		if (!aCol || !oCol || aCol === oCol) return;
		if (aCol.startsWith("unranked-") && oCol.startsWith("unranked-")) return;

		const idsToMove = selectedIds.includes(active.id)
			? selectedIds
			: [active.id];
		const getAllItemsFromCol = col =>
			col.startsWith("unranked-")
				? unranked
				: tiers.find(t => t.id === col).items;
		const movingItems = getAllItemsFromCol(aCol).filter(i =>
			idsToMove.includes(i.id),
		);

		if (aCol.startsWith("unranked-") && !oCol.startsWith("unranked-")) {
			setUnranked(prev => prev.filter(i => !idsToMove.includes(i.id)));
			setTiers(prev =>
				prev.map(t =>
					t.id === oCol ? { ...t, items: [...t.items, ...movingItems] } : t,
				),
			);
		} else if (!aCol.startsWith("unranked-") && oCol.startsWith("unranked-")) {
			setTiers(prev =>
				prev.map(t =>
					t.id === aCol
						? { ...t, items: t.items.filter(i => !idsToMove.includes(i.id)) }
						: t,
				),
			);
			setUnranked(prev => [...prev, ...movingItems]);
		} else {
			setTiers(prev =>
				prev.map(t => {
					if (t.id === aCol)
						return {
							...t,
							items: t.items.filter(i => !idsToMove.includes(i.id)),
						};
					if (t.id === oCol)
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
		} else {
			const aCol = findContainer(active.id);
			const oCol = findContainer(over.id);
			if (aCol && oCol) {
				if (aCol.startsWith("unranked-") && oCol.startsWith("unranked-")) {
					const oldIdx = unranked.findIndex(i => i.id === active.id);
					const newIdx = unranked.findIndex(i => i.id === over.id);
					if (oldIdx !== -1 && newIdx !== -1)
						setUnranked(arrayMove(unranked, oldIdx, newIdx));
				} else if (aCol === oCol) {
					setTiers(prev =>
						prev.map(t => {
							if (t.id === aCol) {
								const oldIdx = t.items.findIndex(i => i.id === active.id);
								const newIdx = t.items.findIndex(i => i.id === over.id);
								return { ...t, items: arrayMove(t.items, oldIdx, newIdx) };
							}
							return t;
						}),
					);
				}
			}
		}
		setActiveId(null);
		setActiveType(null);
		if (active.id && !selectedIds.includes(active.id)) setSelectedIds([]);
	};

	const downloadImage = async () => {
		setIsExporting(true);
		setShowColorPicker(null);
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
		<div className='max-w-[1200px] mx-auto p-0 font-secondary text-text-primary select-none'>
			<PageTitle title='Tier List Cổ Vật LoR - Path of Champions' />

			{/* HEADER */}
			<div className='flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 px-2'>
				<h1 className='text-xl sm:text-2xl font-bold uppercase'>
					Tier List Cổ Vật
				</h1>
				<div className='flex flex-wrap items-center justify-center sm:justify-end gap-2 w-full sm:w-auto'>
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
						className='text-xs flex-1 sm:flex-none min-w-[110px]'
					>
						<Plus size={14} className='mr-1' /> Thêm hàng
					</Button>
					<Button
						id='dl-btn-relic'
						onClick={downloadImage}
						className='text-xs bg-primary-600 flex-1 sm:flex-none min-w-[110px]'
					>
						<Download size={14} className='mr-1' /> Lưu ảnh
					</Button>
					<div className='flex gap-2 w-full sm:w-auto justify-center'>
						<Button
							onClick={handleResetToSample}
							variant='outline'
							className='p-2 border-primary-500 text-primary-500 hover:bg-primary-500/10 flex-1 sm:flex-none'
							title='Khôi phục mẫu mặc định'
						>
							<Sparkles size={16} className='mx-auto' />
						</Button>
						<Button
							onClick={handleClearAllToUnranked}
							variant='danger'
							className='p-2 flex-1 sm:flex-none'
							title='Đưa tất cả cổ vật về kho'
						>
							<Trash2 size={16} className='mx-auto' />
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
				{/* Bảng Tier List */}
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
												<SortableItem
													id={item.id}
													avatar={item.avatar}
													title={item.descriptionRaw}
												/>
											</div>
										))}
									</DroppableZone>
								</SortableContext>
							</SortableTierRow>
						))}
					</SortableContext>
				</div>

				{/* Kho Cổ Vật */}
				<div className='p-4 bg-surface-bg border border-border rounded-lg shadow-sm'>
					<div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4'>
						<h2 className='text-xs font-bold text-text-secondary uppercase tracking-widest'>
							Kho cổ vật ({unranked.length})
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

					<div className='grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6'>
						<InputField
							value={searchInput}
							onChange={e => setSearchInput(e.target.value)}
							onKeyPress={e => e.key === "Enter" && handleSearch()}
							placeholder='Tìm cổ vật...'
						/>
						<MultiSelectFilter
							options={filterOptions.rarities}
							selectedValues={selectedRarities}
							onChange={setSelectedRarities}
							placeholder='Độ hiếm'
						/>
						<MultiSelectFilter
							options={filterOptions.types}
							selectedValues={selectedTypes}
							onChange={setSelectedTypes}
							placeholder='Loại'
						/>
						<Button variant='outline' onClick={handleResetFilters}>
							<RotateCw size={14} className='mr-2' /> Reset
						</Button>
					</div>

					{/* VÙNG QUÉT CHỌN KHO ĐỒ */}
					<div
						ref={warehouseRef}
						onMouseDown={onMouseDown}
						onMouseMove={onMouseMove}
						onMouseUp={onMouseUp}
						onMouseLeave={() => setIsSelecting(false) || setSelectionBox(null)}
						className='relative min-h-[400px] flex flex-col gap-10 bg-black/10 rounded-xl p-4 border border-white/5 overflow-hidden'
					>
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

						{Object.entries(warehouseGroups).map(([rarity, items]) => (
							<div
								key={rarity}
								className='flex flex-col gap-3 group-rarity-container'
							>
								<div className='flex items-center gap-2 pointer-events-none'>
									<div className='h-[2px] w-6 bg-primary-500'></div>
									<span className='text-[11px] font-bold tracking-widest text-text-primary uppercase opacity-80'>
										{rarity} ({items.length})
									</span>
								</div>

								<SortableContext
									items={items.map(i => i.id)}
									strategy={rectSortingStrategy}
								>
									<DroppableZone
										id={`unranked-${rarity.toUpperCase()}`}
										className='flex flex-wrap gap-2.5 min-h-[60px] relative pointer-events-none'
									>
										{items.map(item => {
											const isSelected = selectedIds.includes(item.id);
											return (
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
													<SortableItem
														id={item.id}
														avatar={item.avatar}
														title={item.descriptionRaw}
													/>
												</div>
											);
										})}
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
						activeType === "tier" ? (
							<div className='flex min-h-[100px] w-full bg-surface-bg border-2 border-primary-500 opacity-80 rounded-lg overflow-hidden shadow-2xl'>
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
									title={activeItem?.descriptionRaw}
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

export default TierListRelics;
