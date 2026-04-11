import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
	Trash2,
	GripVertical,
	Image,
	List,
	Table,
	Type,
	Youtube,
	Layers,
	Quote,
	Flag,
	ListTree,
	PlusCircle,
	XCircle,
} from "lucide-react";
import Button from "../../common/button";
import { useTranslation } from "../../../hooks/useTranslation";

// --- Helper: StrictModeDroppable để tránh lỗi React 18 ---
import MarkupEditor from "../MarkupEditor";

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

const BlockItem = ({ block, index, onUpdate, onDelete }) => {
	const { tUI } = useTranslation();

	const handleChange = (field, value) => {
		onUpdate({ ...block, [field]: value });
	};

	const renderFields = () => {
		switch (block.type) {
			case "section":
				return (
					<div className='space-y-2'>
						<input
							className='w-full p-2 text-sm border border-border rounded bg-surface-bg text-text-primary focus:ring-2 focus:ring-blue-500 outline-none font-bold'
							placeholder='Tiêu đề chương / phần...'
							value={block.title || ""}
							onChange={e => handleChange("title", e.target.value)}
						/>
						<div className='pl-3 border-l-2 border-blue-300'>
							<BlockEditor
								blocks={block.content || []}
								setBlocks={newVal => handleChange("content", newVal)}
								parentId={block.id}
							/>
						</div>
					</div>
				);

			case "paragraph":
				return (
					<MarkupEditor
						value={block.text || ""}
						onChange={({ markup, raw }) => onUpdate({ ...block, text: markup, textRaw: raw })}
						placeholder='Nội dung đoạn văn...'
					/>
				);


			case "image":
				return (
					<div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
						<input
							className='w-full p-2 text-sm border border-border rounded bg-surface-bg text-text-primary focus:ring-2 focus:ring-primary-500 outline-none'
							placeholder='URL hình ảnh (https://...)'
							value={block.url || ""}
							onChange={e => handleChange("url", e.target.value)}
						/>
						<input
							className='w-full p-2 text-sm border border-border rounded bg-surface-bg text-text-primary focus:ring-2 focus:ring-primary-500 outline-none'
							placeholder='Chú thích ảnh'
							value={block.caption || ""}
							onChange={e => handleChange("caption", e.target.value)}
						/>
					</div>
				);

			case "youtube":
				return (
					<div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
						<input
							className='w-full p-2 text-sm border border-border rounded bg-surface-bg text-text-primary focus:ring-2 focus:ring-primary-500 outline-none'
							placeholder='YouTube Embed URL (https://www.youtube.com/embed/...)'
							value={block.url || ""}
							onChange={e => handleChange("url", e.target.value)}
						/>
						<input
							className='w-full p-2 text-sm border border-border rounded bg-surface-bg text-text-primary focus:ring-2 focus:ring-primary-500 outline-none'
							placeholder='Nguồn video'
							value={block.caption || ""}
							onChange={e => handleChange("caption", e.target.value)}
						/>
					</div>
				);

			case "list":
				return (
					<div className='space-y-2'>
						{(block.items || []).map((item, i) => (
							<div key={i} className='flex gap-2 items-start'>
								<span className='text-text-tertiary font-bold w-5 text-xs pt-2.5 shrink-0'>{i + 1}.</span>
								<div className='flex-1 min-w-0'>
									<MarkupEditor
										value={item}
										onChange={({ markup }) => {
											const newItems = [...(block.items || [])];
											newItems[i] = markup;
											handleChange("items", newItems);
										}}
										placeholder='Nhập nội dung mục...'
									/>
								</div>
								<button
									onClick={() => {
										const newItems = [...(block.items || [])];
										newItems.splice(i, 1);
										handleChange("items", newItems);
									}}
									className='p-1.5 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors mt-1 shrink-0'
								>
									<XCircle size={15} />
								</button>
							</div>
						))}
						<Button
							variant='outline'
							size='sm'
							onClick={() => handleChange("items", [...(block.items || []), ""])}
							iconLeft={<PlusCircle size={13} />}
						>
							Thêm mục
						</Button>
					</div>
				);

			case "quote":
				return (
					<div className='space-y-2'>
						<MarkupEditor
							value={block.text || ""}
							onChange={({ markup, raw }) => onUpdate({ ...block, text: markup, textRaw: raw })}
							placeholder='Nội dung trích dẫn...'
						/>
						<input
							className='w-full p-2 text-sm border border-border rounded bg-surface-bg text-text-primary focus:ring-2 focus:ring-gray-500 outline-none'
							placeholder='Tác giả / Nguồn'
							value={block.author || ""}
							onChange={e => handleChange("author", e.target.value)}
						/>
					</div>
				);

			case "conclusion":
				return (
					<div className='space-y-2'>
						<input
							className='w-full p-2 text-sm font-bold border border-border rounded bg-surface-bg text-blue-600 dark:text-blue-400 focus:ring-2 focus:ring-blue-500 outline-none'
							placeholder='Tiêu đề tổng kết (VD: Lời kết)'
							value={block.title || ""}
							onChange={e => handleChange("title", e.target.value)}
						/>
						<MarkupEditor
							value={block.text || ""}
							onChange={({ markup, raw }) => onUpdate({ ...block, text: markup, textRaw: raw })}
							placeholder='Nội dung tổng kết...'
						/>
					</div>
				);

			// =====================================
			// BẢN CẬP NHẬT UI TABLE (FLEX + MARKUP)
			// =====================================
			case "table": {
				const headers = block.headers || ["Cột 1", "Cột 2"];
				const rows = block.rows || [];
				const colMinWidth = 280;
				const totalMinWidth = headers.length * colMinWidth + 44; // +44 for action col
				return (
					<div className='space-y-2'>
						{/* Controls */}
						<div className='flex justify-between items-center'>
							<p className='text-xs font-bold text-text-secondary uppercase tracking-widest flex items-center gap-1.5'>
								<Table size={13} className='text-teal-500' /> Bảng ({headers.length} cột • {rows.length} dòng)
							</p>
							<div className='flex gap-1.5'>
								<Button variant='outline' size='sm' className='text-xs py-1 h-auto bg-surface-bg'
									onClick={() => {
										onUpdate({
											...block,
											headers: [...headers, `Cột ${headers.length + 1}`],
											rows: rows.map(r => [...r, ""]),
										});
									}}>
									+ Thêm Cột
								</Button>
								<Button variant='outline' size='sm' className='text-xs py-1 h-auto bg-surface-bg'
									onClick={() => {
										handleChange("rows", [...rows, Array(headers.length).fill("")]);
									}}>
									+ Thêm Dòng
								</Button>
							</div>
						</div>

						{/* Table body - flex layout with horizontal scroll */}
						<div className='overflow-x-auto rounded-lg border border-border'>
							<div style={{ minWidth: `${totalMinWidth}px` }}>

								{/* Header row */}
								<div className='flex bg-surface-hover/60 border-b-2 border-border'>
									{headers.map((head, cIdx) => (
										<div
											key={cIdx}
											className='relative group border-r border-border last:border-r-0'
											style={{ minWidth: `${colMinWidth}px`, flex: 1 }}
										>
											<div className='flex items-center gap-1 p-1.5'>
												<input
													className='flex-1 p-1.5 text-sm font-bold text-center bg-transparent focus:bg-white dark:focus:bg-gray-800 rounded outline-none border border-transparent focus:border-primary-500 transition-colors'
													value={head}
													placeholder='Tên cột...'
													onChange={e => {
														const nh = [...headers];
														nh[cIdx] = e.target.value;
														handleChange("headers", nh);
													}}
												/>
												<button
													onClick={() => {
														const nh = [...headers]; nh.splice(cIdx, 1);
														const nr = rows.map(r => { const x = [...r]; x.splice(cIdx, 1); return x; });
														onUpdate({ ...block, headers: nh, rows: nr });
													}}
													className='opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-500 hover:text-white p-0.5 rounded transition-all shrink-0'
													title='Xóa cột'
												>
													<XCircle size={14} />
												</button>
											</div>
										</div>
									))}
									{/* Action column header */}
									<div className='w-11 shrink-0 border-l border-border bg-surface-hover/30' />
								</div>

								{/* Data rows */}
								{rows.length === 0 ? (
									<div className='py-6 text-center text-text-tertiary text-sm italic'>
										Chưa có dòng nào. Nhấn "+ Thêm Dòng" để bắt đầu.
									</div>
								) : rows.map((row, rIdx) => (
									<div key={rIdx} className='flex border-t border-border group hover:bg-surface-hover/20 transition-colors'>
										{headers.map((_, cIdx) => (
											<div
												key={cIdx}
												className='border-r border-border last:border-r-0 p-1.5'
												style={{ minWidth: `${colMinWidth}px`, flex: 1 }}
											>
												<MarkupEditor
													value={row[cIdx] || ""}
													onChange={({ markup }) => {
														const nr = rows.map(r => [...r]);
														if (!nr[rIdx]) nr[rIdx] = [];
														nr[rIdx][cIdx] = markup;
														handleChange("rows", nr);
													}}
													placeholder='Nội dung ô...'
												/>
											</div>
										))}
										{/* Row action */}
										<div className='w-11 shrink-0 flex items-start justify-center pt-2 border-l border-border bg-surface-hover/10'>
											<button
												onClick={() => {
													const nr = [...rows]; nr.splice(rIdx, 1);
													handleChange("rows", nr);
												}}
												className='opacity-0 group-hover:opacity-100 text-red-500 hover:text-white hover:bg-red-500 p-1.5 rounded-lg transition-all'
												title='Xóa dòng'
											>
												<Trash2 size={14} />
											</button>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				);
			}

			case "tier_list":
				return (
					<div className='space-y-3'>
						{(block.items || []).map((tItem, i) => (
							<div
								key={i}
								className='p-3 border border-border bg-surface-hover/10 rounded-lg relative'
							>
								<button
									onClick={() => {
										const newItems = [...(block.items || [])];
										newItems.splice(i, 1);
										handleChange("items", newItems);
									}}
									className='absolute top-2 right-2 text-red-400 hover:text-red-600'
								>
									<XCircle size={15} />
								</button>

								<div className='grid grid-cols-1 md:grid-cols-2 gap-2 mb-2 pr-6'>
									<input
										className='p-2 text-sm border border-border rounded outline-none focus:border-purple-500 font-bold bg-surface-bg text-text-primary'
										placeholder='Tiêu đề mục...'
										value={tItem.title || ""}
										onChange={e => {
											const newItems = [...block.items];
											newItems[i].title = e.target.value;
											handleChange("items", newItems);
										}}
									/>
									<input
										className='p-2 text-sm border border-border rounded outline-none focus:border-purple-500 bg-surface-bg text-text-primary'
										placeholder='URL hình ảnh (tuỳ chọn)'
										value={tItem.image || ""}
										onChange={e => {
											const newItems = [...block.items];
											newItems[i].image = e.target.value;
											handleChange("items", newItems);
										}}
									/>
								</div>
								<MarkupEditor
									value={tItem.desc || ""}
									onChange={({ markup, raw }) => {
										const newItems = [...block.items];
										newItems[i] = { ...newItems[i], desc: markup, descRaw: raw };
										handleChange("items", newItems);
									}}
									placeholder='Mô tả chi tiết...'
								/>

								<div className='space-y-1 mt-2'>
									<p className='text-xs text-text-tertiary font-bold'>Danh sách con (tuỳ chọn):</p>
									{(tItem.list || []).map((liStr, liIdx) => (
										<div key={liIdx} className='flex gap-1.5 items-start'>
											<span className='text-text-tertiary text-xs pt-2.5 shrink-0'>•</span>
											<div className='flex-1 min-w-0'>
												<MarkupEditor
													value={liStr}
													onChange={({ markup }) => {
														const newItems = [...block.items];
														if (!newItems[i].list) newItems[i].list = [];
														newItems[i].list[liIdx] = markup;
														handleChange("items", newItems);
													}}
													placeholder='Mục con...'
												/>
											</div>
											<button
												onClick={() => {
													const newItems = [...block.items];
													newItems[i].list.splice(liIdx, 1);
													handleChange("items", newItems);
												}}
												className='text-red-400 hover:text-red-600 mt-1 shrink-0'
											>
												<XCircle size={13} />
											</button>
										</div>
									))}
									<Button
										variant='ghost'
										size='sm'
										onClick={() => {
											const newItems = [...block.items];
											if (!newItems[i].list) newItems[i].list = [];
											newItems[i].list.push("");
											handleChange("items", newItems);
										}}
									>
										+ Dòng con
									</Button>
								</div>
							</div>
						))}
						<Button
							variant='outline'
							size='sm'
							onClick={() =>
								handleChange("items", [
									...(block.items || []),
									{ title: "", desc: "", list: [], image: "" },
								])
							}
							className='w-full justify-center'
						>
							+ Thêm Mục Tier List
						</Button>
					</div>
				);

			default:
				return (
					<div className='text-xs text-text-tertiary italic p-2 bg-surface-hover/30 rounded border border-dashed border-border'>
						Editor cho block loại{" "}
						<strong className='text-red-500'>{block.type}</strong> hiện chưa
						được thiết kế UI cụ thể. <br />
						Tuy nhiên dữ liệu vẫn được bảo toàn.
					</div>
				);
		}
	};

	// ICON CHO TỪNG LOẠI BLOCK
	const getIconForType = type => {
		switch (type) {
			case "section":
				return <Layers size={13} className='text-blue-500' />;
			case "paragraph":
				return <Type size={13} className='text-gray-500' />;
			case "image":
				return <Image size={13} className='text-emerald-500' />;
			case "youtube":
				return <Youtube size={13} className='text-red-500' />;
			case "list":
				return <List size={13} className='text-orange-500' />;
			case "table":
				return <Table size={13} className='text-teal-500' />;
			case "quote":
				return <Quote size={13} className='text-gray-600' />;
			case "conclusion":
				return <Flag size={13} className='text-blue-600' />;
			case "tier_list":
				return <ListTree size={13} className='text-purple-500' />;
			default:
				return <Layers size={13} />;
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
					className='mb-2 bg-surface-bg border border-border rounded-lg shadow-sm overflow-hidden group hover:border-primary-500/50 transition-colors'
				>
					<div className='flex'>
						<div
							{...provided.dragHandleProps}
							className='px-2 py-3 text-text-tertiary hover:text-primary-500 cursor-grab active:cursor-grabbing transition-colors flex items-start pt-3'
						>
							<GripVertical size={17} />
						</div>
						<div className='flex-grow py-2 pr-2 min-w-0'>
							<div className='flex items-center gap-1.5 mb-2'>
								<span className='flex items-center gap-1 px-2 py-0.5 bg-surface-hover/50 border border-border text-[10px] font-bold uppercase rounded text-text-secondary tracking-tighter'>
									{getIconForType(block.type)} {block.type}
								</span>
							</div>
							{renderFields()}
						</div>
						<button
							onClick={onDelete}
							className='px-3 text-red-400 hover:text-white hover:bg-red-500 opacity-0 group-hover:opacity-100 transition-all'
							title='Xóa Block này'
						>
							<Trash2 size={16} />
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
							className={`min-h-[80px] ${blocks.length === 0 ? "border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-surface-hover/30 relative" : ""}`}
						>
							{blocks.length === 0 && (
								<p className='text-text-tertiary italic text-sm absolute'>
									Chưa có nội dung. Bấm nút bên dưới để thêm.
								</p>
							)}
							{blocks.map((block, index) => (
								<BlockItem
									key={block.id}
									block={block}
									index={index}
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

			{/* KHU VỰC NÚT THÊM BLOCK */}
			<div className='mt-4 pt-3 border-t border-border'>
				<p className='text-[10px] font-bold text-text-secondary uppercase mb-2 tracking-widest text-center'>
					Thêm Block Mới
				</p>
				<div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-1.5'>
					<Button
						variant='outline'
						size='sm'
						onClick={() => addBlock("section")}
						iconLeft={<Layers size={13} className='text-blue-500' />}
						className='w-full justify-start bg-surface-bg text-xs py-1 h-auto'
					>
						Section
					</Button>
					<Button
						variant='outline'
						size='sm'
						onClick={() => addBlock("paragraph")}
						iconLeft={<Type size={13} className='text-gray-500' />}
						className='w-full justify-start bg-surface-bg text-xs py-1 h-auto'
					>
						Đoạn văn
					</Button>
					<Button
						variant='outline'
						size='sm'
						onClick={() => addBlock("image")}
						iconLeft={<Image size={13} className='text-emerald-500' />}
						className='w-full justify-start bg-surface-bg text-xs py-1 h-auto'
					>
						Hình ảnh
					</Button>
					<Button
						variant='outline'
						size='sm'
						onClick={() => addBlock("youtube")}
						iconLeft={<Youtube size={13} className='text-red-500' />}
						className='w-full justify-start bg-surface-bg text-xs py-1 h-auto'
					>
						Video YT
					</Button>
					<Button
						variant='outline'
						size='sm'
						onClick={() => addBlock("list")}
						iconLeft={<List size={13} className='text-orange-500' />}
						className='w-full justify-start bg-surface-bg text-xs py-1 h-auto'
					>
						Danh sách
					</Button>
					<Button
						variant='outline'
						size='sm'
						onClick={() => addBlock("table")}
						iconLeft={<Table size={13} className='text-teal-500' />}
						className='w-full justify-start bg-surface-bg text-xs py-1 h-auto'
					>
						Bảng
					</Button>
					<Button
						variant='outline'
						size='sm'
						onClick={() => addBlock("quote")}
						iconLeft={<Quote size={13} className='text-gray-600' />}
						className='w-full justify-start bg-surface-bg text-xs py-1 h-auto'
					>
						Trích dẫn
					</Button>
					<Button
						variant='outline'
						size='sm'
						onClick={() => addBlock("tier_list")}
						iconLeft={<ListTree size={13} className='text-purple-500' />}
						className='w-full justify-start bg-surface-bg text-xs py-1 h-auto'
					>
						Tier List
					</Button>
					<Button
						variant='outline'
						size='sm'
						onClick={() => addBlock("conclusion")}
						iconLeft={<Flag size={13} className='text-blue-600' />}
						className='w-full justify-start bg-surface-bg text-xs py-1 h-auto'
					>
						Tổng kết
					</Button>
				</div>
			</div>
		</div>
	);
};

export default BlockEditor;
