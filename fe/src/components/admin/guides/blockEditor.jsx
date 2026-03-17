// src/components/admin/guide/blockEditor.jsx
import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
	Plus,
	Trash2,
	GripVertical,
	Image,
	List,
	Table,
	Type,
	LayoutList,
	Link,
	Youtube,
	Layers,
	FileText,
} from "lucide-react";
import Button from "../../common/button";
import { useTranslation } from "../../../hooks/useTranslation";

// --- Helper: StrictModeDroppable để tránh lỗi React 18 ---
const StrictModeDroppable = ({ children, ...props }) => {
	const [enabled, setEnabled] = useState(false);
	useEffect(() => {
		const animation = requestAnimationFrame(() => setEnabled(true));
		return () => {
			cancelAnimationFrame(animation);
			setEnabled(false);
		};
	}, []);
	if (!enabled) return null;
	return <Droppable {...props}>{children}</Droppable>;
};

const BlockItem = ({ block, index, onUpdate, onDelete, referenceData }) => {
	const { tUI } = useTranslation();

	const handleChange = (field, value) => {
		onUpdate({ ...block, [field]: value });
	};

	const renderFields = () => {
		switch (block.type) {
			case "section":
				return (
					<div className='space-y-3 bg-blue-50/30 p-3 rounded-lg border border-blue-100'>
						<div className='grid grid-cols-2 gap-2'>
							<input
								className='w-full p-2 text-sm border rounded bg-white'
								placeholder='Tiêu đề Section (VN)...'
								value={block.title || ""}
								onChange={e => handleChange("title", e.target.value)}
							/>
							<input
								className='w-full p-2 text-sm border rounded bg-white italic'
								placeholder='Title (EN)...'
								value={block.title_en || ""}
								onChange={e => handleChange("title_en", e.target.value)}
							/>
						</div>
						<div className='pl-4 border-l-2 border-blue-200'>
							<BlockEditor
								blocks={block.content || []}
								setBlocks={newVal => handleChange("content", newVal)}
								parentId={block.id}
								referenceData={referenceData}
							/>
						</div>
					</div>
				);
			case "paragraph":
				return (
					<div className='grid grid-cols-1 gap-2'>
						<textarea
							className='w-full p-2 text-sm border rounded'
							placeholder='Nội dung (VN)...'
							value={block.text || ""}
							onChange={e => handleChange("text", e.target.value)}
						/>
						<textarea
							className='w-full p-2 text-sm border rounded bg-gray-50'
							placeholder='Content (EN)...'
							value={block.text_en || ""}
							onChange={e => handleChange("text_en", e.target.value)}
						/>
					</div>
				);
			case "image":
				return (
					<div className='grid grid-cols-2 gap-2'>
						<input
							className='w-full p-2 text-sm border rounded'
							placeholder='URL Hình ảnh'
							value={block.url || ""}
							onChange={e => handleChange("url", e.target.value)}
						/>
						<input
							className='w-full p-2 text-sm border rounded'
							placeholder='Chú thích (Caption)'
							value={block.caption || ""}
							onChange={e => handleChange("caption", e.target.value)}
						/>
					</div>
				);
			case "youtube":
				return (
					<div className='grid grid-cols-2 gap-2'>
						<input
							className='w-full p-2 text-sm border rounded'
							placeholder='YouTube Embed URL'
							value={block.url || ""}
							onChange={e => handleChange("url", e.target.value)}
						/>
						<input
							className='w-full p-2 text-sm border rounded'
							placeholder='Nguồn video'
							value={block.caption || ""}
							onChange={e => handleChange("caption", e.target.value)}
						/>
					</div>
				);
			default:
				return (
					<div className='text-xs text-gray-400 italic'>
						Editor cho loại {block.type} đang được cập nhật...
					</div>
				);
		}
	};

	return (
		<Draggable
			draggableId={String(block.id || `fallback-${index}`)}
			index={index}
		>
			{provided => (
				<div
					ref={provided.innerRef}
					{...provided.draggableProps}
					className='mb-4 bg-white border border-border rounded-xl shadow-sm overflow-hidden group'
				>
					<div className='flex items-start'>
						<div
							{...provided.dragHandleProps}
							className='p-3 text-text-secondary/40 hover:text-text-primary  '
						>
							<GripVertical size={20} />
						</div>
						<div className='flex-grow py-3 pr-3'>
							<div className='flex items-center gap-2 mb-2'>
								<span className='px-2 py-0.5 bg-gray-100 text-[10px] font-bold uppercase rounded text-gray-500 tracking-tighter'>
									{block.type}
								</span>
							</div>
							{renderFields()}
						</div>
						<button
							onClick={onDelete}
							className='p-3 text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all'
						>
							<Trash2 size={18} />
						</button>
					</div>
				</div>
			)}
		</Draggable>
	);
};

const BlockEditor = ({
	blocks,
	setBlocks,
	referenceData,
	parentId = "root",
}) => {
	const generateId = () =>
		`block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

	const addBlock = type => {
		const newBlock = {
			id: generateId(),
			type,
			content: type === "section" ? [] : undefined,
		};
		setBlocks([...blocks, newBlock]);
	};

	const onDragEnd = result => {
		if (!result.destination) return;
		const items = Array.from(blocks);
		const [reorderedItem] = items.splice(result.source.index, 1);
		items.splice(result.destination.index, 0, reorderedItem);
		setBlocks(items);
	};

	return (
		<div className='block-editor-container'>
			<DragDropContext onDragEnd={onDragEnd}>
				<StrictModeDroppable droppableId={parentId}>
					{provided => (
						<div
							{...provided.droppableProps}
							ref={provided.innerRef}
							className='min-h-[50px]'
						>
							{blocks.map((block, index) => (
								<BlockItem
									key={block.id}
									block={block}
									index={index}
									referenceData={referenceData}
									onUpdate={updated => {
										const newBlocks = [...blocks];
										newBlocks[index] = updated;
										setBlocks(newBlocks);
									}}
									onDelete={() =>
										setBlocks(blocks.filter((_, i) => i !== index))
									}
								/>
							))}
							{provided.placeholder}
						</div>
					)}
				</StrictModeDroppable>
			</DragDropContext>

			{/* Nút thêm Block */}
			<div className='mt-6 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2'>
				<Button
					variant='outline'
					size='sm'
					onClick={() => addBlock("section")}
					iconLeft={<Layers size={14} />}
				>
					Section
				</Button>
				<Button
					variant='outline'
					size='sm'
					onClick={() => addBlock("paragraph")}
					iconLeft={<Type size={14} />}
				>
					Đoạn văn
				</Button>
				<Button
					variant='outline'
					size='sm'
					onClick={() => addBlock("image")}
					iconLeft={<Image size={14} />}
				>
					Ảnh
				</Button>
				<Button
					variant='outline'
					size='sm'
					onClick={() => addBlock("youtube")}
					iconLeft={<Youtube size={14} />}
				>
					Video
				</Button>
				<Button
					variant='outline'
					size='sm'
					onClick={() => addBlock("list")}
					iconLeft={<List size={14} />}
				>
					List
				</Button>
				<Button
					variant='outline'
					size='sm'
					onClick={() => addBlock("table")}
					iconLeft={<Table size={14} />}
				>
					Bảng
				</Button>
			</div>
		</div>
	);
};

export default BlockEditor;
