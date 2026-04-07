import { useState, memo, useMemo } from "react";
import {
	DndContext,
	KeyboardSensor,
	PointerSensor,
	TouchSensor,
	useSensor,
	useSensors,
	DragOverlay,
	defaultDropAnimationSideEffects,
	rectIntersection,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
	useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { createPortal } from "react-dom";
import { XCircle, Trash2, Plus, GripVertical } from "lucide-react";
import { useTranslation } from "../../../hooks/useTranslation";
import SafeImage from "../../common/SafeImage";

// --- 1. COMPONENT HÀNG LÁ BÀI (SORTABLE) ---
const SortableCardRow = memo(({ 
	idx, 
	cardEntry, 
	cardInfo, 
	cardName, 
	cardImg, 
	dragOverIdx, 
	handleDropOnCard, 
	handleMouseEnter, 
	handleMouseLeave, 
	handleRemoveCard, 
	handleRemoveItemFromCard,
	cachedData,
	tDynamic
}) => {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ 
		id: `card-${idx}`, 
		data: { type: "card-reorder", index: idx } 
	});

	const style = {
		transform: CSS.Translate.toString(transform),
		transition,
		opacity: isDragging ? 0.3 : 1,
		zIndex: isDragging ? 50 : 1,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			onDragOver={e => {
				// Native drop support (for items from sidebar)
				e.preventDefault();
				e.stopPropagation();
			}}
			onDrop={e => handleDropOnCard(e, idx)}
			className={`flex flex-col md:flex-row items-center gap-2 p-3 bg-surface-bg border rounded-xl shadow-sm transition-all relative group
			${dragOverIdx === idx ? "border-primary-500 ring-4 ring-primary-500/10" : "border-border"}`}
		>
			{/* Grip Handle for dnd-kit */}
			<div 
				{...attributes}
				{...listeners}
				className='cursor-grab active:cursor-grabbing p-1 text-text-tertiary hover:text-primary-500 transition-colors'
			>
				<GripVertical size={18} />
			</div>

			{/* Card Info & Tooltip Target */}
			<div 
				className='flex items-center gap-3 flex-1 min-w-0 w-full cursor-help'
				onMouseEnter={(e) => handleMouseEnter(e, cardInfo, 'card')}
				onMouseLeave={handleMouseLeave}
			>
				<div className='w-10 h-14 rounded-lg bg-black/20 border border-border overflow-hidden shrink-0 pointer-events-none'>
					<SafeImage
						src={cardImg}
						alt={cardName}
						className='w-full h-full object-cover'
						width={40}
						height={56}
					/>
				</div>
				<div className='min-w-0 pointer-events-none'>
					<p className='font-bold text-text-primary text-[11px] sm:text-xs truncate uppercase'>
						{cardEntry.cardCode}
					</p>
					<p className='text-[10px] text-text-secondary truncate mt-0.5'>
						{cardName}
					</p>
				</div>
			</div>

			{/* Items Container */}
			<div className='flex flex-wrap gap-1.5 items-center justify-start md:justify-end flex-grow w-full'>
				{(cardEntry.itemCodes || []).map((itemCode, itemIdx) => {
					const itemInfo = cachedData.items?.[itemCode] || {};
					const itemName = tDynamic(itemInfo, "name") || itemCode;
					const itemImg = itemInfo.assetAbsolutePath || itemInfo.image || "";

					return (
						<div
							key={`${itemCode}-${itemIdx}`}
							className='group/item relative flex items-center gap-1 px-1.5 py-0.5 bg-surface-hover border border-border rounded-lg hover:border-red-500/30 transition-colors cursor-help'
							onMouseEnter={(e) => handleMouseEnter(e, itemInfo, 'item')}
							onMouseLeave={handleMouseLeave}
						>
							<div className='w-5 h-5 rounded bg-white/10 overflow-hidden shrink-0 border border-border/50'>
								<SafeImage 
									src={itemImg} 
									className='w-full h-full object-contain'
									width={20}
									height={20}
								/>
							</div>
							<span className='text-[9px] font-bold text-text-secondary max-w-[80px] truncate'>
								{itemName}
							</span>
							<button
								type='button'
								onClick={() => handleRemoveItemFromCard(idx, itemIdx)}
								className='absolute -top-1.5 -right-1.5 p-0.5 bg-red-500 text-white rounded-full opacity-0 group-hover/item:opacity-100 transition-opacity shadow-sm z-10'
							>
								<XCircle size={10} />
							</button>
						</div>
					);
				})}
				
				<div className='flex items-center gap-1.5 px-2 py-1 rounded-lg border border-dashed border-border bg-surface-hover/50 text-[9px] text-text-tertiary italic'>
					<Plus size={10} /> <span className="hidden sm:inline">Thả Vật phẩm</span>
				</div>
			</div>

			{/* Delete Button */}
			<button
				type='button'
				onClick={() => handleRemoveCard(idx)}
				className='p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg shrink-0 transition-colors opacity-0 group-hover:opacity-100'
				title='Xóa khỏi bộ bài'
			>
				<Trash2 size={16} />
			</button>
		</div>
	);
});

// --- 2. COMPONENT CHÍNH ---
const DragDropDeckInput = memo(
	({
		label,
		data = [], // Mảng chứa các object: [{ cardCode: '01RU001', itemCodes: [] }]
		onChange, // (newData) => void
		cachedData = {}, // { powers: {}, relics: {}, items: {}, cards: {} }
		placeholder = "Kéo lá bài từ danh sách vào đây...",
	}) => {
		const { tDynamic, tUI } = useTranslation();
		const [isDragOverMain, setIsDragOverMain] = useState(false);
		const [dragOverIdx, setDragOverIdx] = useState(null);
		const [tooltipData, setTooltipData] = useState(null);
		const [activeId, setActiveId] = useState(null);

		const sensors = useSensors(
			useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
			useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
			useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
		);

		// Logic Drop từ Sidebar (Native HTML5)
		const handleDropMain = e => {
			e.preventDefault();
			setIsDragOverMain(false);
			setTooltipData(null);

			const rawData = e.dataTransfer.getData("text/plain");
			if (!rawData) return;

			try {
				const parsed = JSON.parse(rawData);
				if (parsed.type === "card" && parsed.id) {
					onChange([...data, { cardCode: parsed.id, itemCodes: [] }]);
				}
			} catch (err) {
				console.error("Drop Error:", err);
			}
		};

		// Logic Drop Item vào Card (Native HTML5)
		const handleDropOnCard = (e, index) => {
			e.preventDefault();
			setDragOverIdx(null);
			setTooltipData(null);

			const rawData = e.dataTransfer.getData("text/plain");
			if (!rawData) return;

			try {
				const parsed = JSON.parse(rawData);
				// Phân biệt: Nếu là reorder dnd-kit thì bỏ qua vì dnd-kit handle riêng qua onDragEnd
				if (parsed.type === "card-reorder") return;

				if (parsed.type === "item" && parsed.id) {
					const newData = [...data];
					const currentItemCodes = newData[index].itemCodes || [];
					newData[index].itemCodes = [...currentItemCodes, parsed.id];
					onChange(newData);
				}
			} catch (err) {
				console.error("Drop Error on Card:", err);
			}
		};

		const handleDragEnd = (event) => {
			const { active, over } = event;
			setActiveId(null);

			if (over && active.id !== over.id) {
				const oldIndex = active.data.current.index;
				const newIndex = over.data.current?.index ?? data.length - 1;
				onChange(arrayMove(data, oldIndex, newIndex));
			}
		};

		const handleRemoveCard = index => {
			onChange(data.filter((_, i) => i !== index));
			setTooltipData(null);
		};

		const handleRemoveItemFromCard = (cardIdx, itemIdx) => {
			const newData = [...data];
			newData[cardIdx].itemCodes = newData[cardIdx].itemCodes.filter(
				(_, i) => i !== itemIdx,
			);
			onChange(newData);
			setTooltipData(null);
		};

		const handleMouseEnter = (e, item, type) => {
			const rect = e.currentTarget.getBoundingClientRect();
			setTooltipData({
				item,
				type,
				x: rect.right + 10,
				y: rect.top + rect.height / 2,
			});
		};

		const handleMouseLeave = () => {
			setTooltipData(null);
		};

		const activeEntry = activeId ? data[parseInt(activeId.split("-")[1])] : null;

		return (
			<DndContext
				sensors={sensors}
				collisionDetection={rectIntersection}
				onDragStart={(e) => setActiveId(e.active.id)}
				onDragEnd={handleDragEnd}
			>
				<div className='flex flex-col gap-3 relative'>
					<label className='font-bold text-text-primary text-xs sm:text-sm uppercase tracking-wider opacity-80'>
						{label}
					</label>

					<div
						onDragOver={(e) => { e.preventDefault(); setIsDragOverMain(true); }}
						onDragLeave={() => setIsDragOverMain(false)}
						onDrop={handleDropMain}
						className={`flex flex-col gap-2 p-3 sm:p-4 rounded-xl border-2 border-dashed transition-all duration-200 min-h-[120px]
						${isDragOverMain ? "border-primary-500 bg-primary-500/10" : "border-border bg-surface-hover/30"}`}
					>
						{data.length > 0 ? (
							<SortableContext
								items={data.map((_, i) => `card-${i}`)}
								strategy={verticalListSortingStrategy}
							>
								<div className='space-y-2'>
									{data.map((cardEntry, idx) => {
										const cardInfo = cachedData.cards?.[cardEntry.cardCode] || {};
										const cardName = tDynamic(cardInfo, "cardName") || cardEntry.cardCode;
										const cardImg = cardInfo.gameAbsolutePath || "";

										return (
											<SortableCardRow 
												key={`${cardEntry.cardCode}-${idx}`}
												idx={idx}
												cardEntry={cardEntry}
												cardInfo={cardInfo}
												cardName={cardName}
												cardImg={cardImg}
												dragOverIdx={dragOverIdx}
												handleDropOnCard={handleDropOnCard}
												handleMouseEnter={handleMouseEnter}
												handleMouseLeave={handleMouseLeave}
												handleRemoveCard={handleRemoveCard}
												handleRemoveItemFromCard={handleRemoveItemFromCard}
												cachedData={cachedData}
												tDynamic={tDynamic}
											/>
										);
									})}
								</div>
							</SortableContext>
						) : (
							<div className='flex flex-col items-center justify-center flex-1 text-text-tertiary italic text-[11px] sm:text-sm py-8 opacity-60'>
								{placeholder}
							</div>
						)}
					</div>

					{/* Drag Overlay with Portal to document.body */}
					{createPortal(
						<DragOverlay
							dropAnimation={{
								sideEffects: defaultDropAnimationSideEffects({
									styles: { active: { opacity: "0.4" } },
								}),
							}}
							zIndex={99999}
						>
							{activeId && activeEntry ? (
								<div className='flex items-center gap-3 p-3 bg-surface-bg border-2 border-primary-500 rounded-xl shadow-2xl opacity-90 w-[300px] sm:w-[400px] pointer-events-none'>
									<div className='w-10 h-14 rounded-lg bg-black/20 border border-border overflow-hidden shrink-0'>
										<SafeImage
											src={cachedData.cards?.[activeEntry.cardCode]?.gameAbsolutePath || ""}
											alt={activeEntry.cardCode}
											className='w-full h-full object-cover'
											width={40}
											height={56}
										/>
									</div>
									<div className='flex-1 min-w-0'>
										<p className='font-bold text-text-primary text-xs uppercase truncate'>
											{activeEntry.cardCode}
										</p>
										<p className='text-[10px] text-text-secondary truncate mt-0.5 italic'>
											Đang di chuyển...
										</p>
									</div>
									<GripVertical size={18} className="text-primary-500" />
								</div>
							) : null}
						</DragOverlay>,
						document.body
					)}

					{/* Tooltip Hover Preview */}
					{tooltipData && !activeId && (
						<div
							className='fixed z-[99999] p-2 bg-slate-900/90 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl pointer-events-none transform -translate-y-1/2 animate-in fade-in zoom-in-95 duration-200 overflow-hidden'
							style={{ top: tooltipData.y, left: tooltipData.x }}
						>
							<div className='relative'>
								<SafeImage
									src={
										tooltipData.item.gameAbsolutePath ||
										tooltipData.item.assetAbsolutePath ||
										tooltipData.item.image ||
										tooltipData.item.avatar ||
										tooltipData.item.assets?.[0]?.avatar
									}
									alt='Preview'
									className={`${tooltipData.type === 'card' ? 'w-48 sm:w-64 h-auto' : 'w-24 h-24'} object-contain drop-shadow-2xl`}
								/>
								<div className='absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent'>
									<p className='text-xs font-bold text-white truncate'>
										{tDynamic(tooltipData.item, "name") || tooltipData.item.cardName}
									</p>
									<p className='text-[10px] text-white/60 font-mono italic opacity-70'>
										{tooltipData.item.cardCode || tooltipData.item.itemCode || ""}
									</p>
								</div>
							</div>
						</div>
					)}
				</div>
			</DndContext>
		);
	},
);

export default DragDropDeckInput;
