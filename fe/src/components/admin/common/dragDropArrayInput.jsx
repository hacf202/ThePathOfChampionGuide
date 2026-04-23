import { useState, memo } from "react";
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
import { XCircle, GripVertical } from "lucide-react";
import SafeImage from "../../common/SafeImage";

// --- 1. COMPONENT HÀNG MỤC (SORTABLE) ---
const SortableArrayItem = memo(({ id, index, info, displayName, imgUrl, handleRemoveItem }) => {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ 
		id: `item-${id}-${index}`, 
		data: { index } 
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
			className='flex items-center gap-3 p-2 bg-surface-bg border border-border rounded-lg shadow-sm group hover:border-primary-500 transition-colors relative'
		>
			{/* Tay cầm kéo thả dnd-kit */}
			<div 
				{...attributes}
				{...listeners}
				className='cursor-grab active:cursor-grabbing p-1 text-text-tertiary hover:text-primary-500 transition-colors'
			>
				<GripVertical size={16} />
			</div>

			{/* Số thứ tự */}
			<span className='font-bold text-text-secondary w-4 text-center text-[10px]'>
				{index + 1}.
			</span>

			{/* Icon Ảnh */}
			{imgUrl ? (
				<SafeImage
					src={imgUrl}
					alt={displayName}
					className='w-7 h-7 rounded-md object-contain bg-black/20 border border-border shrink-0'
					width={28}
					height={28}
				/>
			) : (
				<div className='w-7 h-7 rounded-md bg-white/5 border border-border flex items-center justify-center text-[10px] text-text-tertiary shrink-0'>
					?
				</div>
			)}

			{/* Tên hiển thị */}
			<span className='flex-1 text-xs font-medium text-text-primary truncate'>
				{displayName}
			</span>

			{/* Nút Xóa */}
			<button
				type='button'
				onClick={() => handleRemoveItem(index)}
				className='p-1.5 text-red-500 hover:bg-red-500/10 rounded-md transition-colors opacity-0 group-hover:opacity-100'
				title='Xóa'
			>
				<XCircle size={16} />
			</button>
		</div>
	);
});

// --- 2. COMPONENT CHÍNH ---
const DragDropArrayInput = memo(
	({
		label,
		data = [], // Mảng chứa các chuỗi ID (Ví dụ: ['P001', 'I005'])
		onChange, // Hàm callback: (newDataArray) => void
		cachedData = {}, // Object dùng để lookup
		placeholder = "Kéo thả mục từ danh sách vào đây...",
		allowDuplicates = false,
	}) => {
		const [isDragOverNative, setIsDragOverNative] = useState(false);
		const [activeId, setActiveId] = useState(null);

		const sensors = useSensors(
			useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
			useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
			useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
		);

		// Logic Drop từ Sidebar (Native HTML5)
		const handleDropMain = e => {
			e.preventDefault();
			setIsDragOverNative(false);

			let droppedData = e.dataTransfer.getData("text/plain");
			let finalId = droppedData;

			if (droppedData) {
				try {
					const parsed = JSON.parse(droppedData);
					if (parsed && parsed.id) finalId = parsed.id;
				} catch (err) {}
			}

			if (finalId && finalId.trim() !== "" && (allowDuplicates || !data.includes(finalId))) {
				onChange([...data, finalId]);
			}
		};

		const handleDragEnd = (event) => {
			const { active, over } = event;
			setActiveId(null);

			if (over && active.id !== over.id) {
				const oldIndex = active.data.current.index;
				const newIndex = over.data.current.index;
				onChange(arrayMove(data, oldIndex, newIndex));
			}
		};

		const handleRemoveItem = indexToRemove => {
			onChange(data.filter((_, index) => index !== indexToRemove));
		};

		const activeItemIdx = activeId ? parseInt(activeId.split("-").pop()) : -1;
		const activeItemId = activeItemIdx !== -1 ? data[activeItemIdx] : null;

		return (
			<DndContext
				sensors={sensors}
				collisionDetection={rectIntersection}
				onDragStart={(e) => setActiveId(e.active.id)}
				onDragEnd={handleDragEnd}
			>
				<div className='flex flex-col gap-3'>
					<label className='font-bold text-text-primary text-xs uppercase tracking-wider opacity-80'>
						{label}
					</label>

					<div
						onDragOver={(e) => { e.preventDefault(); setIsDragOverNative(true); }}
						onDragLeave={() => setIsDragOverNative(false)}
						onDrop={handleDropMain}
						className={`flex flex-col gap-2 p-3 sm:p-4 rounded-xl border-2 border-dashed transition-all duration-200 min-h-[100px] 
						${isDragOverNative ? "border-primary-500 bg-primary-500/10" : "border-border bg-surface-hover/30"}`}
					>
						{data.length > 0 ? (
							<SortableContext
								items={data.map((id, i) => `item-${id}-${i}`)}
								strategy={verticalListSortingStrategy}
							>
								<div className='space-y-1.5'>
									{data.map((id, index) => {
										const info = cachedData[id] || {};
										const displayName = info.name || info.itemCode || info.powerCode || id;
										const imgUrl = info.avatar || info.assetAbsolutePath || info.assetFullAbsolutePath || "";

										return (
											<SortableArrayItem 
												key={`${id}-${index}`}
												id={id}
												index={index}
												info={info}
												displayName={displayName}
												imgUrl={imgUrl}
												handleRemoveItem={handleRemoveItem}
											/>
										);
									})}
								</div>
							</SortableContext>
						) : (
							<div className='flex flex-col items-center justify-center flex-1 text-text-tertiary italic text-xs py-6 opacity-60'>
								{placeholder}
							</div>
						)}
					</div>
				</div>

				{/* Drag Overlay with Portal */}
				{createPortal(
					<DragOverlay
						dropAnimation={{
							sideEffects: defaultDropAnimationSideEffects({
								styles: { active: { opacity: "0.4" } },
							}),
						}}
						zIndex={99999}
					>
						{activeId && activeItemId ? (
							<div className='flex items-center gap-3 p-2 bg-surface-bg border-2 border-primary-500 rounded-lg shadow-2xl opacity-90 w-[250px] pointer-events-none'>
								<div className='w-8 h-8 rounded-md bg-black/20 border border-border overflow-hidden shrink-0'>
									<SafeImage
										src={cachedData[activeItemId]?.avatar || cachedData[activeItemId]?.assetAbsolutePath || ""}
										alt={activeItemId}
										className='w-full h-full object-contain'
										width={32}
										height={32}
									/>
								</div>
								<div className='flex-1 min-w-0'>
									<p className='font-bold text-text-primary text-xs truncate'>
										{cachedData[activeItemId]?.name || activeItemId}
									</p>
								</div>
								<GripVertical size={16} className="text-primary-500" />
							</div>
						) : null}
					</DragOverlay>,
					document.body
				)}
			</DndContext>
		);
	},
);

export default DragDropArrayInput;
