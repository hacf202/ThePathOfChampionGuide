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
	Shield,
	Zap,
	Swords,
	ListTree,
	PlusCircle,
	XCircle,
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
	const { tUI, tDynamic } = useTranslation();

	const handleChange = (field, value) => {
		onUpdate({ ...block, [field]: value });
	};

	const renderFields = () => {
		switch (block.type) {
			case "section":
				return (
					<div className='space-y-3 bg-blue-50/30 p-4 rounded-lg border border-blue-100'>
						<div className='grid grid-cols-2 gap-3'>
							<input
								className='w-full p-2.5 text-sm border border-border rounded bg-surface-bg text-text-primary focus:ring-2 focus:ring-blue-500 outline-none font-bold'
								placeholder='Tiêu đề Section (VN)...'
								value={block.title || ""}
								onChange={e => handleChange("title", e.target.value)}
							/>
							<input
								className='w-full p-2.5 text-sm border border-border rounded bg-surface-hover/30 text-text-primary italic focus:ring-2 focus:ring-blue-500 outline-none font-bold'
								placeholder='Title (EN)...'
								value={block.title_en || ""}
								onChange={e => handleChange("title_en", e.target.value)}
							/>
						</div>
						<div className='pl-4 border-l-2 border-blue-300'>
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
					<div className='grid grid-cols-1 gap-3'>
						<textarea
							className='w-full p-3 text-sm border border-border rounded bg-surface-bg text-text-primary focus:ring-2 focus:ring-primary-500 outline-none'
							placeholder='Nội dung (VN) - Hỗ trợ thẻ HTML cơ bản như <b>, <i>, <br>...'
							value={block.text || ""}
							onChange={e => handleChange("text", e.target.value)}
							rows={4}
						/>
						<textarea
							className='w-full p-3 text-sm border border-border rounded bg-surface-hover/30 text-text-primary focus:ring-2 focus:ring-primary-500 outline-none'
							placeholder='Content (EN)...'
							value={block.text_en || ""}
							onChange={e => handleChange("text_en", e.target.value)}
							rows={4}
						/>
					</div>
				);

			case "image":
				return (
					<div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
						<input
							className='w-full p-2.5 text-sm border border-border rounded bg-surface-bg text-text-primary focus:ring-2 focus:ring-primary-500 outline-none'
							placeholder='URL Hình ảnh (https://...)'
							value={block.url || ""}
							onChange={e => handleChange("url", e.target.value)}
						/>
						<input
							className='w-full p-2.5 text-sm border border-border rounded bg-surface-bg text-text-primary focus:ring-2 focus:ring-primary-500 outline-none'
							placeholder='Chú thích ảnh (Caption)'
							value={block.caption || ""}
							onChange={e => handleChange("caption", e.target.value)}
						/>
					</div>
				);

			case "youtube":
				return (
					<div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
						<input
							className='w-full p-2.5 text-sm border border-border rounded bg-surface-bg text-text-primary focus:ring-2 focus:ring-primary-500 outline-none'
							placeholder='YouTube Embed URL (VD: https://www.youtube.com/embed/...)'
							value={block.url || ""}
							onChange={e => handleChange("url", e.target.value)}
						/>
						<input
							className='w-full p-2.5 text-sm border border-border rounded bg-surface-bg text-text-primary focus:ring-2 focus:ring-primary-500 outline-none'
							placeholder='Nguồn video (Caption)'
							value={block.caption || ""}
							onChange={e => handleChange("caption", e.target.value)}
						/>
					</div>
				);

			case "list":
				return (
					<div className='space-y-2 bg-surface-hover/10 p-3 rounded border border-border'>
						<p className='text-xs font-bold text-text-secondary uppercase mb-2'>
							Danh sách dạng dấu chấm (Bullet List)
						</p>
						{(block.items || []).map((item, i) => (
							<div key={i} className='flex gap-2 items-center'>
								<span className='text-text-tertiary font-bold w-4'>
									{i + 1}.
								</span>
								<input
									className='flex-1 p-2 text-sm border border-border rounded bg-surface-bg text-text-primary focus:ring-2 focus:ring-primary-500 outline-none'
									value={item}
									placeholder='Nhập nội dung mục...'
									onChange={e => {
										const newItems = [...(block.items || [])];
										newItems[i] = e.target.value;
										handleChange("items", newItems);
									}}
								/>
								<button
									onClick={() => {
										const newItems = [...(block.items || [])];
										newItems.splice(i, 1);
										handleChange("items", newItems);
									}}
									className='p-2 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors'
									title='Xóa dòng'
								>
									<XCircle size={16} />
								</button>
							</div>
						))}
						<Button
							variant='outline'
							size='sm'
							onClick={() =>
								handleChange("items", [...(block.items || []), ""])
							}
							iconLeft={<PlusCircle size={14} />}
						>
							Thêm mục
						</Button>
					</div>
				);

			case "quote":
				return (
					<div className='space-y-3 bg-surface-hover/10 p-3 rounded border border-border border-l-4 border-l-gray-400'>
						<textarea
							className='w-full p-3 text-sm border border-border rounded bg-surface-bg text-text-primary focus:ring-2 focus:ring-gray-500 outline-none font-serif italic'
							placeholder='Nội dung trích dẫn...'
							value={block.text || ""}
							onChange={e => handleChange("text", e.target.value)}
							rows={3}
						/>
						<input
							className='w-full p-2.5 text-sm border border-border rounded bg-surface-bg text-text-primary focus:ring-2 focus:ring-gray-500 outline-none'
							placeholder='Tác giả / Nguồn'
							value={block.author || ""}
							onChange={e => handleChange("author", e.target.value)}
						/>
					</div>
				);

			case "conclusion":
				return (
					<div className='space-y-3 bg-blue-50/20 p-4 rounded border border-blue-200'>
						<input
							className='w-full p-2.5 text-sm font-bold border border-border rounded bg-surface-bg text-blue-700 focus:ring-2 focus:ring-blue-500 outline-none'
							placeholder='Tiêu đề Tổng kết (VD: Lời kết)'
							value={block.title || ""}
							onChange={e => handleChange("title", e.target.value)}
						/>
						<textarea
							className='w-full p-3 text-sm border border-border rounded bg-surface-bg text-text-primary focus:ring-2 focus:ring-blue-500 outline-none'
							placeholder='Nội dung tổng kết...'
							value={block.text || ""}
							onChange={e => handleChange("text", e.target.value)}
							rows={4}
						/>
					</div>
				);

			case "champion":
			case "relic":
			case "power":
				const refMap = {
					champion: "champions",
					relic: "relics",
					power: "powers",
				};
				const idFieldMap = {
					champion: "championID",
					relic: "relicCode",
					power: "powerCode",
				};
				const refData = referenceData?.[refMap[block.type]] || {};
				const foundItem = refData[block.id];

				return (
					<div className='flex flex-col gap-2 bg-surface-hover/10 p-3 rounded border border-border'>
						<p className='text-xs font-bold text-text-secondary uppercase'>
							Nhúng dữ liệu {block.type}
						</p>
						<div className='flex gap-3 items-center'>
							<input
								className='flex-1 p-2.5 text-sm border border-border rounded bg-surface-bg text-text-primary focus:ring-2 focus:ring-primary-500 outline-none font-mono'
								placeholder={`Nhập ID của ${block.type} (VD: ${idFieldMap[block.type]})`}
								value={block.id || ""}
								onChange={e => handleChange("id", e.target.value)}
							/>
							<div className='w-1/2 p-2 border border-dashed border-border rounded bg-surface-bg text-sm flex items-center gap-2'>
								{foundItem ? (
									<>
										<span className='w-6 h-6 rounded bg-black/20 flex items-center justify-center overflow-hidden'>
											<img
												src={
													foundItem.avatar ||
													foundItem.assetAbsolutePath ||
													foundItem.assets?.[0]?.avatar ||
													"/fallback.png"
												}
												alt='icon'
												className='w-full h-full object-contain'
											/>
										</span>
										<span className='font-bold text-primary-600 truncate'>
											{tDynamic(foundItem, "name") || foundItem.name}
										</span>
									</>
								) : (
									<span className='text-red-400 italic text-xs'>
										Chưa tìm thấy dữ liệu. Hãy kiểm tra lại ID.
									</span>
								)}
							</div>
						</div>
					</div>
				);

			// =====================================
			// BẢN CẬP NHẬT UI TABLE (THÂN THIỆN HƠN)
			// =====================================
			case "table":
				return (
					<div className='space-y-4 bg-surface-hover/10 p-5 rounded-xl border border-border overflow-x-auto relative shadow-inner'>
						{/* Header của Table Editor */}
						<div className='flex justify-between items-center mb-2'>
							<p className='text-xs font-bold text-text-secondary uppercase tracking-widest flex items-center gap-1.5'>
								<Table size={14} className='text-teal-500' /> Trình quản lý Bảng
							</p>
							<div className='flex gap-2'>
								<Button
									variant='outline'
									size='sm'
									onClick={() => {
										const newHeaders = [
											...(block.headers || []),
											`Cột ${(block.headers?.length || 0) + 1}`,
										];
										const newRows = (block.rows || [[]]).map(row => [
											...row,
											"",
										]);
										handleChange("headers", newHeaders);
										handleChange("rows", newRows);
									}}
									className='text-xs py-1 h-auto bg-surface-bg'
								>
									+ Thêm Cột
								</Button>
								<Button
									variant='outline'
									size='sm'
									onClick={() => {
										const colCount = block.headers?.length || 1;
										const newRows = [
											...(block.rows || []),
											Array(colCount).fill(""),
										];
										handleChange("rows", newRows);
									}}
									className='text-xs py-1 h-auto bg-surface-bg'
								>
									+ Thêm Dòng
								</Button>
							</div>
						</div>

						{/* Giao diện Bảng nhập liệu */}
						<div className='border border-border rounded-xl overflow-hidden bg-surface-bg shadow-sm'>
							<table className='min-w-full divide-y divide-border'>
								<thead className='bg-surface-hover/50'>
									<tr>
										{(block.headers || ["Cột 1", "Cột 2"]).map((head, cIdx) => (
											<th
												key={cIdx}
												className='p-2 border-r border-border last:border-r-0 relative group min-w-[150px]'
											>
												<div className='flex items-center gap-2'>
													<input
														className='w-full p-2 text-sm font-bold text-center bg-transparent focus:bg-white dark:focus:bg-gray-800 rounded outline-none border border-transparent focus:border-primary-500 transition-colors'
														value={head}
														placeholder='Tên cột...'
														onChange={e => {
															const newHeaders = [
																...(block.headers || ["Cột 1", "Cột 2"]),
															];
															newHeaders[cIdx] = e.target.value;
															handleChange("headers", newHeaders);
														}}
													/>
													{/* Nút xóa cột (Chỉ hiện khi di chuột) */}
													<button
														onClick={() => {
															const newHeaders = [...(block.headers || [])];
															newHeaders.splice(cIdx, 1);
															const newRows = (block.rows || []).map(r => {
																const nr = [...r];
																nr.splice(cIdx, 1);
																return nr;
															});
															handleChange("headers", newHeaders);
															handleChange("rows", newRows);
														}}
														className='opacity-0 group-hover:opacity-100 absolute -top-3 -right-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all shadow-md transform scale-90'
														title='Xóa cột này'
													>
														<XCircle size={16} />
													</button>
												</div>
											</th>
										))}
										<th className='w-12 bg-surface-hover/30 border-l border-border'></th>
									</tr>
								</thead>
								<tbody className='divide-y divide-border bg-surface-bg'>
									{(block.rows || [["", ""]]).map((row, rIdx) => (
										<tr
											key={rIdx}
											className='group hover:bg-surface-hover/30 transition-colors'
										>
											{(block.headers || ["Cột 1", "Cột 2"]).map((_, cIdx) => (
												<td
													key={cIdx}
													className='p-2 border-r border-border last:border-r-0 align-top'
												>
													<textarea
														className='w-full p-2.5 text-sm bg-transparent focus:bg-white dark:focus:bg-gray-800 rounded outline-none border border-transparent focus:border-primary-500 transition-colors min-h-[42px] overflow-hidden'
														value={row[cIdx] || ""}
														placeholder='Nhập nội dung ô...'
														rows={1}
														onChange={e => {
															const newRows = [...(block.rows || [["", ""]])];
															if (!newRows[rIdx]) newRows[rIdx] = [];
															newRows[rIdx][cIdx] = e.target.value;
															handleChange("rows", newRows);
														}}
														onInput={e => {
															// Tự động giãn chiều cao theo nội dung
															e.target.style.height = "auto";
															e.target.style.height =
																e.target.scrollHeight + "px";
														}}
													/>
												</td>
											))}
											<td className='p-2 text-center align-middle border-l border-border bg-surface-hover/10'>
												{/* Nút xóa dòng (Chỉ hiện khi di chuột) */}
												<button
													onClick={() => {
														const newRows = [...(block.rows || [])];
														newRows.splice(rIdx, 1);
														handleChange("rows", newRows);
													}}
													className='opacity-0 group-hover:opacity-100 text-red-500 hover:text-white hover:bg-red-500 p-2 rounded-lg transition-all'
													title='Xóa dòng này'
												>
													<Trash2 size={16} />
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				);

			case "tier_list":
				return (
					<div className='space-y-4 bg-purple-50/20 p-4 rounded border border-purple-200'>
						<p className='text-xs font-bold text-purple-600 uppercase mb-2'>
							Danh sách Tier / Phân loại
						</p>
						{(block.items || []).map((tItem, i) => (
							<div
								key={i}
								className='p-3 border border-purple-100 bg-white rounded shadow-sm relative'
							>
								<button
									onClick={() => {
										const newItems = [...(block.items || [])];
										newItems.splice(i, 1);
										handleChange("items", newItems);
									}}
									className='absolute top-2 right-2 text-red-400 hover:text-red-600'
								>
									<XCircle size={16} />
								</button>

								<div className='grid grid-cols-1 md:grid-cols-2 gap-3 mb-2'>
									<input
										className='p-2 text-sm border border-border rounded outline-none focus:border-purple-500 font-bold'
										placeholder='Tiêu đề mục...'
										value={tItem.title || ""}
										onChange={e => {
											const newItems = [...block.items];
											newItems[i].title = e.target.value;
											handleChange("items", newItems);
										}}
									/>
									<input
										className='p-2 text-sm border border-border rounded outline-none focus:border-purple-500'
										placeholder='URL Hình ảnh (Tuỳ chọn)'
										value={tItem.image || ""}
										onChange={e => {
											const newItems = [...block.items];
											newItems[i].image = e.target.value;
											handleChange("items", newItems);
										}}
									/>
								</div>
								<textarea
									className='w-full p-2 text-sm border border-border rounded outline-none focus:border-purple-500 mb-2'
									placeholder='Mô tả chi tiết...'
									rows={2}
									value={tItem.desc || ""}
									onChange={e => {
										const newItems = [...block.items];
										newItems[i].desc = e.target.value;
										handleChange("items", newItems);
									}}
								/>

								<div className='space-y-1'>
									<p className='text-xs text-gray-500 font-bold'>
										Danh sách con (Tuỳ chọn):
									</p>
									{(tItem.list || []).map((liStr, liIdx) => (
										<div key={liIdx} className='flex gap-2'>
											<input
												className='flex-1 p-1.5 text-xs border border-border rounded outline-none'
												value={liStr}
												onChange={e => {
													const newItems = [...block.items];
													if (!newItems[i].list) newItems[i].list = [];
													newItems[i].list[liIdx] = e.target.value;
													handleChange("items", newItems);
												}}
											/>
											<button
												onClick={() => {
													const newItems = [...block.items];
													newItems[i].list.splice(liIdx, 1);
													handleChange("items", newItems);
												}}
												className='text-red-400'
											>
												<XCircle size={14} />
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
					<div className='text-xs text-text-tertiary italic p-3 bg-surface-hover/30 rounded border border-dashed border-border'>
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
				return <Layers size={14} className='text-blue-500' />;
			case "paragraph":
				return <Type size={14} className='text-gray-500' />;
			case "image":
				return <Image size={14} className='text-emerald-500' />;
			case "youtube":
				return <Youtube size={14} className='text-red-500' />;
			case "list":
				return <List size={14} className='text-orange-500' />;
			case "table":
				return <Table size={14} className='text-teal-500' />;
			case "quote":
				return <Quote size={14} className='text-gray-600' />;
			case "conclusion":
				return <Flag size={14} className='text-blue-600' />;
			case "tier_list":
				return <ListTree size={14} className='text-purple-500' />;
			case "champion":
				return <Swords size={14} className='text-yellow-600' />;
			case "relic":
				return <Shield size={14} className='text-indigo-500' />;
			case "power":
				return <Zap size={14} className='text-cyan-500' />;
			default:
				return <Layers size={14} />;
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
					className='mb-4 bg-surface-bg border border-border rounded-xl shadow-sm overflow-hidden group hover:border-primary-500/50 transition-colors'
				>
					<div className='flex items-start'>
						<div
							{...provided.dragHandleProps}
							className='p-4 text-text-tertiary hover:text-primary-500 cursor-grab active:cursor-grabbing transition-colors'
						>
							<GripVertical size={20} />
						</div>
						<div className='flex-grow py-3 pr-3 min-w-0'>
							<div className='flex items-center gap-2 mb-3'>
								<span className='flex items-center gap-1.5 px-2.5 py-1 bg-surface-hover/50 border border-border text-[11px] font-bold uppercase rounded text-text-secondary tracking-tighter'>
									{getIconForType(block.type)} {block.type}
								</span>
							</div>
							{renderFields()}
						</div>
						<button
							onClick={onDelete}
							className='p-4 text-red-400 hover:text-white hover:bg-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-bl-xl h-full'
							title='Xóa Block này'
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
							className={`min-h-[100px] ${blocks.length === 0 ? "border-2 border-dashed border-border rounded-xl flex items-center justify-center bg-surface-hover/30 relative" : ""}`}
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

			{/* KHU VỰC NÚT THÊM BLOCK */}
			<div className='mt-8 pt-6 border-t border-border'>
				<p className='text-xs font-bold text-text-secondary uppercase mb-3 tracking-widest text-center'>
					Thêm Block Mới
				</p>
				<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3'>
					<Button
						variant='outline'
						size='sm'
						onClick={() => addBlock("section")}
						iconLeft={<Layers size={14} className='text-blue-500' />}
						className='w-full justify-start bg-surface-bg'
					>
						Section
					</Button>
					<Button
						variant='outline'
						size='sm'
						onClick={() => addBlock("paragraph")}
						iconLeft={<Type size={14} className='text-gray-500' />}
						className='w-full justify-start bg-surface-bg'
					>
						Đoạn văn
					</Button>
					<Button
						variant='outline'
						size='sm'
						onClick={() => addBlock("image")}
						iconLeft={<Image size={14} className='text-emerald-500' />}
						className='w-full justify-start bg-surface-bg'
					>
						Hình Ảnh
					</Button>
					<Button
						variant='outline'
						size='sm'
						onClick={() => addBlock("youtube")}
						iconLeft={<Youtube size={14} className='text-red-500' />}
						className='w-full justify-start bg-surface-bg'
					>
						Video YT
					</Button>
					<Button
						variant='outline'
						size='sm'
						onClick={() => addBlock("list")}
						iconLeft={<List size={14} className='text-orange-500' />}
						className='w-full justify-start bg-surface-bg'
					>
						Danh sách
					</Button>
					<Button
						variant='outline'
						size='sm'
						onClick={() => addBlock("table")}
						iconLeft={<Table size={14} className='text-teal-500' />}
						className='w-full justify-start bg-surface-bg'
					>
						Bảng
					</Button>
					<Button
						variant='outline'
						size='sm'
						onClick={() => addBlock("quote")}
						iconLeft={<Quote size={14} className='text-gray-600' />}
						className='w-full justify-start bg-surface-bg'
					>
						Trích dẫn
					</Button>
					<Button
						variant='outline'
						size='sm'
						onClick={() => addBlock("tier_list")}
						iconLeft={<ListTree size={14} className='text-purple-500' />}
						className='w-full justify-start bg-surface-bg'
					>
						Tier List
					</Button>
					<Button
						variant='outline'
						size='sm'
						onClick={() => addBlock("conclusion")}
						iconLeft={<Flag size={14} className='text-blue-600' />}
						className='w-full justify-start bg-surface-bg'
					>
						Tổng kết
					</Button>

					{/* Nhóm Block Game Data */}
					<Button
						variant='outline'
						size='sm'
						onClick={() => addBlock("champion")}
						iconLeft={<Swords size={14} className='text-yellow-600' />}
						className='w-full justify-start bg-yellow-50/50 dark:bg-yellow-900/10 border-yellow-200'
					>
						Tướng
					</Button>
					<Button
						variant='outline'
						size='sm'
						onClick={() => addBlock("relic")}
						iconLeft={<Shield size={14} className='text-indigo-500' />}
						className='w-full justify-start bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-200'
					>
						Cổ vật
					</Button>
					<Button
						variant='outline'
						size='sm'
						onClick={() => addBlock("power")}
						iconLeft={<Zap size={14} className='text-cyan-500' />}
						className='w-full justify-start bg-cyan-50/50 dark:bg-cyan-900/10 border-cyan-200'
					>
						Sức mạnh
					</Button>
				</div>
			</div>
		</div>
	);
};

export default BlockEditor;
