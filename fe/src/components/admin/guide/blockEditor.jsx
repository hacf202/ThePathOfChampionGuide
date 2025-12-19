// src/components/admin/BlockEditor.jsx
import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
	Plus,
	Trash2,
	GripVertical,
	Image as ImageIcon,
	List,
	Table,
	Type,
	Folder,
	Save,
	ArrowUp,
	ArrowDown,
	LayoutList,
	Link as LinkIcon,
} from "lucide-react";

import Button from "../../common/button";

// --- Helper: StrictModeDroppable ---
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

const BlockEditor = ({
	blocks,
	setBlocks,
	referenceData,
	parentId = "root",
}) => {
	const generateId = () =>
		`block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

	const addBlock = type => {
		const newId = generateId();
		let newBlock = { id: newId, type };

		if (type === "section") {
			newBlock = {
				id: newId,
				type: "section",
				title: "Tiêu đề phần mới",
				content: [],
			};
		} else if (type === "paragraph") {
			newBlock = {
				id: newId,
				type: "paragraph",
				text: "<p>Viết nội dung tại đây...</p>",
			};
		} else if (type === "image") {
			newBlock = { id: newId, type: "image", src: "", alt: "" };
		} else if (type === "link") {
			newBlock = {
				id: newId,
				type: "link",
				url: "",
				image: "",
				label: "Tiêu đề liên kết",
			};
		} else if (type === "list") {
			newBlock = { id: newId, type: "list", items: [""] };
		} else if (type === "table") {
			newBlock = {
				id: newId,
				type: "table",
				title: "Bảng mới",
				headers: ["Tên", "Mô tả", "Hiệu ứng"],
				rows: [["", "", ""]],
				championIds: [""],
				relicIds: [""],
				powerIds: [""],
				idType: "none",
			};
		} else if (type === "conclusion") {
			newBlock = { id: newId, type: "conclusion", title: "Kết luận", text: "" };
		} else if (type === "sublist") {
			newBlock = {
				id: newId,
				type: "sublist",
				title: "Tiêu đề danh sách",
				sublist: [{ title: "Mục 1", desc: "", image: "", list: [""] }],
			};
		}

		setBlocks([...blocks, newBlock]);
	};

	const updateBlock = (index, updated) => {
		const newBlocks = [...blocks];
		newBlocks[index] = { ...newBlocks[index], ...updated };
		setBlocks(newBlocks);
	};

	const removeBlock = index => {
		setBlocks(blocks.filter((_, i) => i !== index));
	};

	const moveBlock = (index, direction) => {
		const newBlocks = [...blocks];
		const targetIndex = direction === "up" ? index - 1 : index + 1;
		if (targetIndex < 0 || targetIndex >= newBlocks.length) return;
		[newBlocks[index], newBlocks[targetIndex]] = [
			newBlocks[targetIndex],
			newBlocks[index],
		];
		setBlocks(newBlocks);
	};

	const onDragEnd = result => {
		if (!result.destination) return;
		if (result.source.droppableId !== result.destination.droppableId) return;
		const items = Array.from(blocks);
		const [reorderedItem] = items.splice(result.source.index, 1);
		items.splice(result.destination.index, 0, reorderedItem);
		setBlocks(items);
	};

	return (
		<DragDropContext onDragEnd={onDragEnd}>
			<StrictModeDroppable droppableId={`droppable-${parentId}`}>
				{provided => (
					<div
						{...provided.droppableProps}
						ref={provided.innerRef}
						className='space-y-4'
					>
						{blocks.map((block, index) => (
							<Draggable key={block.id} draggableId={block.id} index={index}>
								{provided => (
									<div
										ref={provided.innerRef}
										{...provided.draggableProps}
										className='border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition relative group'
									>
										{/* HEADER CONTROL */}
										<div className='flex items-center justify-between mb-3 border-b pb-2'>
											<div className='flex items-center gap-2'>
												<div {...provided.dragHandleProps}>
													<GripVertical className='text-gray-400 cursor-grab hover:text-gray-600' />
												</div>
												<span className='font-bold capitalize text-gray-700 bg-gray-100 px-2 py-0.5 rounded text-sm'>
													{block.type}
												</span>
											</div>
											<div className='flex items-center gap-1'>
												<Button
													variant='ghost'
													onClick={() => moveBlock(index, "up")}
													disabled={index === 0}
													className='p-1 h-auto min-h-0'
												>
													<ArrowUp size={18} />
												</Button>
												<Button
													variant='ghost'
													onClick={() => moveBlock(index, "down")}
													disabled={index === blocks.length - 1}
													className='p-1 h-auto min-h-0'
												>
													<ArrowDown size={18} />
												</Button>
												<div className='w-px h-4 bg-gray-300 mx-2'></div>
												<Button
													variant='ghost'
													onClick={() => removeBlock(index)}
													className='p-1 h-auto min-h-0 text-gray-400 hover:text-red-600 hover:bg-red-50'
												>
													<Trash2 size={18} />
												</Button>
											</div>
										</div>

										{/* SECTION */}
										{block.type === "section" && (
											<div className='space-y-2 pl-2 border-l-2 border-gray-100'>
												<input
													value={block.title || ""}
													onChange={e =>
														updateBlock(index, { title: e.target.value })
													}
													placeholder='Tiêu đề phần'
													className='w-full p-2 border rounded font-bold'
												/>
												<BlockEditor
													blocks={block.content || []}
													setBlocks={newContent =>
														updateBlock(index, { content: newContent })
													}
													referenceData={referenceData}
													parentId={block.id}
												/>
											</div>
										)}

										{/* SUBLIST */}
										{block.type === "sublist" && (
											<div className='space-y-4'>
												<input
													value={block.title || ""}
													onChange={e =>
														updateBlock(index, { title: e.target.value })
													}
													placeholder='Tiêu đề danh sách'
													className='w-full p-2 border rounded font-bold bg-gray-50'
												/>
												<div className='space-y-4 pl-2'>
													{block.sublist?.map((item, itemIdx) => (
														<div
															key={itemIdx}
															className='border p-3 rounded bg-gray-50 relative'
														>
															<Button
																variant='danger'
																onClick={() => {
																	const newSub = block.sublist.filter(
																		(_, i) => i !== itemIdx
																	);
																	updateBlock(index, { sublist: newSub });
																}}
																className='absolute top-2 right-2 p-1 h-8 w-8'
																iconLeft={<Trash2 size={16} />}
															/>

															<div className='grid grid-cols-2 gap-2 mb-2 pr-10'>
																<input
																	value={item.title || ""}
																	onChange={e => {
																		const newSub = [...block.sublist];
																		newSub[itemIdx].title = e.target.value;
																		updateBlock(index, { sublist: newSub });
																	}}
																	placeholder='Tiêu đề mục'
																	className='p-2 border rounded font-semibold'
																/>
																<input
																	value={item.image || ""}
																	onChange={e => {
																		const newSub = [...block.sublist];
																		newSub[itemIdx].image = e.target.value;
																		updateBlock(index, { sublist: newSub });
																	}}
																	placeholder='URL Ảnh'
																	className='p-2 border rounded'
																/>
															</div>
															<textarea
																value={item.desc || ""}
																onChange={e => {
																	const newSub = [...block.sublist];
																	newSub[itemIdx].desc = e.target.value;
																	updateBlock(index, { sublist: newSub });
																}}
																placeholder='Mô tả...'
																rows={2}
																className='w-full p-2 border rounded mb-2 text-sm'
															/>
															<div className='pl-4 border-l-2 border-gray-300 space-y-1'>
																{item.list?.map((li, liIdx) => (
																	<div
																		key={liIdx}
																		className='flex gap-2 items-center'
																	>
																		<input
																			value={li}
																			onChange={e => {
																				const newSub = [...block.sublist];
																				newSub[itemIdx].list[liIdx] =
																					e.target.value;
																				updateBlock(index, { sublist: newSub });
																			}}
																			className='flex-1 p-1 border rounded text-sm'
																		/>
																		<Button
																			variant='ghost'
																			onClick={() => {
																				const newSub = [...block.sublist];
																				newSub[itemIdx].list = newSub[
																					itemIdx
																				].list.filter((_, i) => i !== liIdx);
																				updateBlock(index, { sublist: newSub });
																			}}
																			className='text-red-400 p-1 h-auto min-h-0'
																		>
																			×
																		</Button>
																	</div>
																))}
																<Button
																	variant='ghost'
																	onClick={() => {
																		const newSub = [...block.sublist];
																		if (!newSub[itemIdx].list)
																			newSub[itemIdx].list = [];
																		newSub[itemIdx].list.push("");
																		updateBlock(index, { sublist: newSub });
																	}}
																	className='text-xs text-blue-600 hover:text-blue-800 p-0 h-auto'
																>
																	+ Thêm dòng
																</Button>
															</div>
														</div>
													))}
													<Button
														variant='secondary'
														onClick={() => {
															const newSub = [
																...(block.sublist || []),
																{ title: "", desc: "", image: "", list: [] },
															];
															updateBlock(index, { sublist: newSub });
														}}
														className='w-full border-dashed border-2'
													>
														+ Thêm mục con
													</Button>
												</div>
											</div>
										)}

										{/* PARAGRAPH */}
										{block.type === "paragraph" && (
											<textarea
												value={block.text || ""}
												onChange={e =>
													updateBlock(index, { text: e.target.value })
												}
												rows={4}
												className='w-full p-2 border rounded font-mono text-sm'
												placeholder='Nội dung HTML...'
											/>
										)}

										{/* IMAGE */}
										{block.type === "image" && (
											<div className='space-y-2'>
												<input
													value={block.src || ""}
													onChange={e =>
														updateBlock(index, { src: e.target.value })
													}
													placeholder='URL hình ảnh'
													className='w-full p-2 border rounded'
												/>
												<input
													value={block.alt || ""}
													onChange={e =>
														updateBlock(index, { alt: e.target.value })
													}
													placeholder='Mô tả ảnh'
													className='w-full p-2 border rounded'
												/>
											</div>
										)}

										{/* LINK WITH IMAGE BLOCK */}
										{block.type === "link" && (
											<div className='space-y-3 p-2 bg-blue-50/30 rounded-md border border-blue-100'>
												<div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
													<div>
														<label className='text-[10px] font-bold text-blue-600 uppercase'>
															Nhãn hiển thị
														</label>
														<input
															value={block.label || ""}
															onChange={e =>
																updateBlock(index, { label: e.target.value })
															}
															placeholder='Ví dụ: Link tham khảo'
															className='w-full p-2 border rounded mt-1 text-sm'
														/>
													</div>
													<div>
														<label className='text-[10px] font-bold text-blue-600 uppercase'>
															URL đích
														</label>
														<input
															value={block.url || ""}
															onChange={e =>
																updateBlock(index, { url: e.target.value })
															}
															placeholder='https://...'
															className='w-full p-2 border rounded mt-1 text-sm'
														/>
													</div>
												</div>
												<div>
													<label className='text-[10px] font-bold text-blue-600 uppercase'>
														Link hình ảnh đi kèm
													</label>
													<div className='flex gap-2 mt-1'>
														<input
															value={block.image || ""}
															onChange={e =>
																updateBlock(index, { image: e.target.value })
															}
															placeholder='URL ảnh minh họa'
															className='flex-1 p-2 border rounded text-sm'
														/>
														{block.image && (
															<img
																src={block.image}
																alt='Preview'
																className='h-9 w-9 object-cover rounded border bg-white'
																onError={e => (e.target.style.display = "none")}
															/>
														)}
													</div>
												</div>
											</div>
										)}

										{/* LIST */}
										{block.type === "list" && (
											<div className='space-y-2'>
												{block.items.map((item, i) => (
													<div key={i} className='flex gap-2'>
														<input
															value={item}
															onChange={e => {
																const newItems = [...block.items];
																newItems[i] = e.target.value;
																updateBlock(index, { items: newItems });
															}}
															className='flex-1 p-2 border rounded'
														/>
														<Button
															variant='danger'
															onClick={() => {
																const newItems = block.items.filter(
																	(_, idx) => idx !== i
																);
																updateBlock(index, { items: newItems });
															}}
															className='px-3'
														>
															Xóa
														</Button>
													</div>
												))}
												<Button
													variant='ghost'
													onClick={() =>
														updateBlock(index, { items: [...block.items, ""] })
													}
													className='text-blue-600'
												>
													+ Thêm mục
												</Button>
											</div>
										)}

										{/* TABLE */}
										{block.type === "table" && (
											<div className='space-y-4'>
												<div className='flex gap-4'>
													<input
														value={block.title || ""}
														onChange={e =>
															updateBlock(index, { title: e.target.value })
														}
														placeholder='Tiêu đề bảng'
														className='flex-1 p-2 border rounded font-bold'
													/>
													<select
														value={block.idType || "none"}
														onChange={e =>
															updateBlock(index, { idType: e.target.value })
														}
														className='p-2 border rounded bg-gray-50 text-sm'
													>
														<option value='none'>Không liên kết ID</option>
														<option value='relic'>
															Liên kết Cổ Vật (Relic)
														</option>
														<option value='power'>
															Liên kết Sức Mạnh (Power)
														</option>
														<option value='champion'>
															Liên kết Tướng (Champion)
														</option>
													</select>
												</div>

												<input
													value={block.headers?.join(",") || ""}
													onChange={e =>
														updateBlock(index, {
															headers: e.target.value.split(","),
														})
													}
													placeholder='Header (cách nhau dấu phẩy)'
													className='w-full p-2 border rounded'
												/>

												<div className='overflow-x-auto'>
													<table className='w-full border min-w-[500px]'>
														<thead>
															<tr className='bg-gray-100'>
																{block.idType !== "none" && (
																	<th className='border p-2 text-left text-sm w-32 bg-blue-50 text-blue-700'>
																		<LinkIcon
																			size={14}
																			className='inline mr-1'
																		/>
																		ID{" "}
																		{block.idType === "relic"
																			? "Cổ vật"
																			: block.idType === "power"
																			? "Quyền năng"
																			: "Tướng"}
																	</th>
																)}
																{block.headers?.map((h, i) => (
																	<th
																		key={i}
																		className='border p-2 text-left text-sm'
																	>
																		{h}
																	</th>
																))}
																<th className='border p-2 w-10'></th>
															</tr>
														</thead>
														<tbody>
															{block.rows?.map((row, rIdx) => (
																<tr key={rIdx}>
																	{block.idType !== "none" && (
																		<td className='border p-2 bg-blue-50'>
																			<input
																				value={
																					block.idType === "relic"
																						? block.relicIds?.[rIdx] || ""
																						: block.idType === "power"
																						? block.powerIds?.[rIdx] || ""
																						: block.championIds?.[rIdx] || ""
																				}
																				onChange={e => {
																					const val = e.target.value;
																					if (block.idType === "relic") {
																						const newIds = [
																							...(block.relicIds || []),
																						];
																						newIds[rIdx] = val;
																						updateBlock(index, {
																							relicIds: newIds,
																						});
																					} else if (block.idType === "power") {
																						const newIds = [
																							...(block.powerIds || []),
																						];
																						newIds[rIdx] = val;
																						updateBlock(index, {
																							powerIds: newIds,
																						});
																					} else if (
																						block.idType === "champion"
																					) {
																						const newIds = [
																							...(block.championIds || []),
																						];
																						newIds[rIdx] = val;
																						updateBlock(index, {
																							championIds: newIds,
																						});
																					}
																				}}
																				placeholder='ID...'
																				className='w-full text-sm p-1 border rounded bg-white font-mono text-blue-600'
																			/>
																		</td>
																	)}
																	{row.map((cell, cIdx) => (
																		<td key={cIdx} className='border p-2'>
																			<input
																				value={cell}
																				onChange={e => {
																					const newRows = [...block.rows];
																					newRows[rIdx][cIdx] = e.target.value;
																					updateBlock(index, { rows: newRows });
																				}}
																				className='w-full text-sm'
																			/>
																		</td>
																	))}
																	<td className='border p-2 text-center'>
																		<Button
																			variant='ghost'
																			onClick={() => {
																				const newRows = block.rows.filter(
																					(_, i) => i !== rIdx
																				);
																				const newRelics =
																					block.relicIds?.filter(
																						(_, i) => i !== rIdx
																					) || [];
																				const newPowers =
																					block.powerIds?.filter(
																						(_, i) => i !== rIdx
																					) || [];
																				const newChamps =
																					block.championIds?.filter(
																						(_, i) => i !== rIdx
																					) || [];

																				updateBlock(index, {
																					rows: newRows,
																					relicIds: newRelics,
																					powerIds: newPowers,
																					championIds: newChamps,
																				});
																			}}
																			className='text-red-600 hover:bg-red-50 p-1 h-auto min-h-0'
																		>
																			<Trash2 size={16} />
																		</Button>
																	</td>
																</tr>
															))}
														</tbody>
													</table>
												</div>

												<Button
													variant='ghost'
													onClick={() => {
														const newRows = [
															...block.rows,
															Array(block.headers?.length || 3).fill(""),
														];
														const newRelics = [...(block.relicIds || []), ""];
														const newPowers = [...(block.powerIds || []), ""];
														const newChamps = [
															...(block.championIds || []),
															"",
														];

														updateBlock(index, {
															rows: newRows,
															relicIds: newRelics,
															powerIds: newPowers,
															championIds: newChamps,
														});
													}}
													className='text-blue-600 hover:text-blue-800'
												>
													+ Thêm dòng
												</Button>
											</div>
										)}

										{/* CONCLUSION */}
										{block.type === "conclusion" && (
											<div className='space-y-2'>
												<input
													value={block.title || ""}
													onChange={e =>
														updateBlock(index, { title: e.target.value })
													}
													placeholder='Tiêu đề kết luận'
													className='w-full p-2 border rounded'
												/>
												<textarea
													value={block.text || ""}
													onChange={e =>
														updateBlock(index, { text: e.target.value })
													}
													rows={4}
													className='w-full p-2 border rounded'
													placeholder='Nội dung kết luận'
												/>
											</div>
										)}
									</div>
								)}
							</Draggable>
						))}
						{provided.placeholder}
					</div>
				)}
			</StrictModeDroppable>

			{/* Nút thêm block */}
			<div className='flex flex-wrap gap-3 mt-6'>
				<Button
					onClick={() => addBlock("section")}
					className='bg-blue-600 hover:bg-blue-700 text-white border-transparent'
					iconLeft={<Folder size={16} />}
				>
					Section
				</Button>
				<Button
					onClick={() => addBlock("paragraph")}
					className='bg-green-600 hover:bg-green-700 text-white border-transparent'
					iconLeft={<Type size={16} />}
				>
					Đoạn văn
				</Button>
				<Button
					onClick={() => addBlock("image")}
					className='bg-purple-600 hover:bg-purple-700 text-white border-transparent'
					iconLeft={<ImageIcon size={16} />}
				>
					Hình ảnh
				</Button>
				<Button
					onClick={() => addBlock("link")}
					className='bg-cyan-600 hover:bg-cyan-700 text-white border-transparent'
					iconLeft={<LinkIcon size={16} />}
				>
					Liên kết
				</Button>
				<Button
					onClick={() => addBlock("list")}
					className='bg-orange-600 hover:bg-orange-700 text-white border-transparent'
					iconLeft={<List size={16} />}
				>
					Danh sách
				</Button>
				<Button
					onClick={() => addBlock("sublist")}
					className='bg-indigo-600 hover:bg-indigo-700 text-white border-transparent'
					iconLeft={<LayoutList size={16} />}
				>
					Sublist
				</Button>
				<Button
					onClick={() => addBlock("table")}
					className='bg-teal-600 hover:bg-teal-700 text-white border-transparent'
					iconLeft={<Table size={16} />}
				>
					Bảng
				</Button>
				<Button
					onClick={() => addBlock("conclusion")}
					className='bg-red-600 hover:bg-red-700 text-white border-transparent'
					iconLeft={<Save size={16} />}
				>
					Kết luận
				</Button>
			</div>
		</DragDropContext>
	);
};

export default BlockEditor;
