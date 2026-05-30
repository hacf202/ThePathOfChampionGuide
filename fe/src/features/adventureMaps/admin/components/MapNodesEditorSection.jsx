import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CircleDot, Eye, EyeOff, Plus, Skull, ShieldQuestion, Zap, Image as ImageIcon, Flag, HandMetal, AlertCircle, ShoppingBag, Package, HelpCircle, Diamond } from 'lucide-react';
import Button from '@/components/common/button';
import { AdventureLine, AdventureConnections, AdventureNodeEditor, getUniqueAdvId, getAdvName, getAdvImage, NODE_TYPES_DATA } from '@/features/adventureMaps/admin/adventureEditorHelpers';

const MapNodesEditorSection = ({ formData, setFormData, cachedData }) => {
	const [isMapVisible, setIsMapVisible] = useState(true);
	const [nodeDisplayMode, setNodeDisplayMode] = useState("icon");
	const [mapAspectRatio, setMapAspectRatio] = useState("21/9");
	const [mapSize, setMapSize] = useState({ width: 1000, height: 400 });
	const [selectedNodeIndex, setSelectedNodeIndex] = useState(null);
	const [selectedNodeType, setSelectedNodeType] = useState("Encounter");
	const [contextMenu, setContextMenu] = useState(null);
	const [activeDragOverNodeIdx, setActiveDragOverNodeIdx] = useState(null);
	const mapRef = useRef(null);

	useEffect(() => {
		if (!contextMenu) return;
		const handleClose = () => setContextMenu(null);
		document.addEventListener("click", handleClose);
		return () => document.removeEventListener("click", handleClose);
	}, [contextMenu]);

	useEffect(() => {
		if (!isMapVisible || !mapRef.current) return;
		const observer = new ResizeObserver(entries => {
			for (let entry of entries) {
				setMapSize({
					width: entry.contentRect.width,
					height: entry.contentRect.height,
				});
			}
		});
		observer.observe(mapRef.current);
		return () => observer.disconnect();
	}, [isMapVisible]);

	const getBossNamesString = useCallback(
		bosses => {
			if (!bosses || bosses.length === 0) return "";
			const names = bosses.map(bId => {
				const found = (cachedData?.bosses || []).find(
					cb => getUniqueAdvId(cb) === bId.trim(),
				);
				return found ? getAdvName(found) : bId;
			});
			return ` (${names.join(", ")})`;
		},
		[cachedData],
	);

	const handleMapClick = useCallback(
		e => {
			if (contextMenu) return;
			if (selectedNodeIndex === null || !mapRef.current) return;
			const rect = mapRef.current.getBoundingClientRect();
			const x = parseFloat(
				(((e.clientX - rect.left) / rect.width) * 100).toFixed(1),
			);
			const y = parseFloat(
				(((e.clientY - rect.top) / rect.height) * 100).toFixed(1),
			);

			setFormData(prev => {
				const nextNodes = [...(prev.nodes || [])];
				if (nextNodes[selectedNodeIndex]) {
					nextNodes[selectedNodeIndex] = {
						...nextNodes[selectedNodeIndex],
						position: { x, y },
					};
				}
				return { ...prev, nodes: nextNodes };
			});
		},
		[selectedNodeIndex, contextMenu, setFormData],
	);

	const handleMapContextMenu = useCallback(
		e => {
			e.preventDefault();
			if (!mapRef.current) return;
			const rect = mapRef.current.getBoundingClientRect();
			const xPx = e.clientX - rect.left;
			const yPx = e.clientY - rect.top;
			const percentX = parseFloat(((xPx / rect.width) * 100).toFixed(1));
			const percentY = parseFloat(((yPx / rect.height) * 100).toFixed(1));

			const menuWidth = 208;
			const maxMenuHeight = 260;
			const menuHeight = Math.min(maxMenuHeight, rect.height - 20);

			let renderX = xPx;
			let renderY = yPx;

			if (xPx + menuWidth > rect.width) renderX = rect.width - menuWidth - 10;
			if (yPx + menuHeight > rect.height) renderY = rect.height - menuHeight - 10;
			if (renderX < 10) renderX = 10;
			if (renderY < 10) renderY = 10;

			setContextMenu({
				x: renderX,
				y: renderY,
				percentX,
				percentY,
				maxListHeight: menuHeight - 50,
			});
		},
		[],
	);

	const handleCreateNodeAtPos = useCallback(
		(type, percentX, percentY) => {
			setFormData(prev => {
				const nextNodes = [...(prev.nodes || [])];
				const newIndex = nextNodes.length + 1;

				let uniqueID = `n${newIndex}`;
				let attempts = 0;
				while (nextNodes.some(n => n.nodeID === uniqueID) && attempts < 100) {
					attempts++;
					uniqueID = `n${newIndex + attempts}`;
				}

				const newNode = {
					nodeID: uniqueID,
					nodeType: type,
					bosses: [],
					nextNodes: [],
					position: { x: percentX, y: percentY },
				};

				const updatedNodes = [...nextNodes, newNode];

				setTimeout(() => {
					setSelectedNodeIndex(updatedNodes.length - 1);
				}, 50);

				return { ...prev, nodes: updatedNodes };
			});
			setContextMenu(null);
		},
		[setFormData],
	);

	const handleNodeChange = useCallback((idx, field, val) => {
		setFormData(prev => {
			const nextNodes = [...(prev.nodes || [])];
			if (nextNodes[idx]) {
				nextNodes[idx] = { ...nextNodes[idx], [field]: val };
			}
			return { ...prev, nodes: nextNodes };
		});
	}, [setFormData]);

	const getNodeIcon = type => {
		const t = (type || "").toLowerCase();
		if (t.includes("start")) return <Flag size={14} className='text-emerald-400' />;
		if (t.includes("mini")) return <Skull size={10} className='text-orange-400' />;
		if (t.includes("boss")) return <Skull size={16} className='text-red-500' />;
		if (t.includes("power")) return <HandMetal size={14} className='text-yellow-400' />;
		if (t.includes("heal")) return <Plus size={14} className='text-green-400' />;
		if (t.includes("encounter")) return <AlertCircle size={14} className='text-red-400' />;
		if (t.includes("shop")) return <ShoppingBag size={14} className='text-yellow-500' />;
		if (t.includes("gold") || t.includes("chest") || t.includes("item") || t.includes("spell")) return <Package size={14} className='text-blue-400' />;
		if (t.includes("event")) return <HelpCircle size={14} className='text-purple-400' />;
		if (t.includes("champion")) return <Diamond size={14} className='text-cyan-400' />;

		return <ShieldQuestion size={14} className='text-white' />;
	};

	const handleDropBossOnMapNode = useCallback((e, nodeIdx) => {
		e.preventDefault();
		e.stopPropagation();
		try {
			constged = JSON.parse(e.dataTransfer.getData("text/plain"));
			if (dragged.type === "boss") {
				const identifier =ged.id ||ged.bossID || getUniqueAdvId(dragged) ||ged.name;
				if (identifier) {
					const trimmedId = identifier.trim();
					setFormData(prev => {
						const nextNodes = [...(prev.nodes || [])];
						const nodeToUpdate = nextNodes[nodeIdx];
						if (nodeToUpdate) {
							const currentBosses = nodeToUpdate.bosses || [];
							if (!currentBosses.includes(trimmedId)) {
								nextNodes[nodeIdx] = {
									...nodeToUpdate,
									bosses: [...currentBosses, trimmedId]
								};
							}
						}
						return { ...prev, nodes: nextNodes };
					});
				}
			}
		} catch (err) {
			console.warn("Drag data không hợp lệ hoặc không phải boss", err);
		}
	}, [setFormData]);

	return (
		<section className='bg-surface-bg border border-border rounded-xl p-6 shadow-sm space-y-6'>
			<div className='flex justify-between items-center border-l-4 border-red-500 pl-3'>
				<h3 className='text-lg font-bold uppercase flex items-center gap-2'>
					<Skull size={20} className='text-red-500' /> Thiết kế Cấu trúc
					Đường đi (Nodes)
				</h3>
				<div className='flex items-center gap-3'>
					<Button
						type='button'
						size='sm'
						variant='outline'
						onClick={() =>
							setNodeDisplayMode(prev =>
								prev === "icon" ? "dot" : "icon",
							)
						}
						iconLeft={
							nodeDisplayMode === "icon" ? (
								<CircleDot size={16} />
							) : (
								<ImageIcon size={16} />
							)
						}
					>
						{nodeDisplayMode === "icon" ? "Chế độ Chấm" : "Chế độ Icon"}
					</Button>

					<Button
						type='button'
						size='sm'
						variant='outline'
						onClick={() => setIsMapVisible(!isMapVisible)}
						iconLeft={
							isMapVisible ? <EyeOff size={16} /> : <Eye size={16} />
						}
					>
						{isMapVisible ? "Ẩn Bản đồ" : "Hiện Bản đồ"}
					</Button>
					<div className='flex items-center gap-2 bg-surface-hover/80 p-1.5 rounded-xl border border-border shrink-0 shadow-sm'>
						<span className='text-xs font-bold text-text-secondary pl-1.5 select-none'>Loại Node:</span>
						<select
							value={selectedNodeType}
							onChange={e => setSelectedNodeType(e.target.value)}
							className='bg-surface-bg border border-border rounded-lg px-2.5 py-1 text-xs text-text-primary outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 font-bold cursor-pointer transition-all'
						>
							<option value='Encounter'>⚔️ Encounter</option>
							<option value='Miniboss'>💀 Miniboss</option>
							<option value='Boss'>🔥 Boss</option>
							<option value='Power'>⚡ Power</option>
							<option value='Healer'>➕ Healer</option>
							<option value='Start'>🚩 Start</option>
							<option value='Shop'>🛒 Shop</option>
							<option value='Champion Node'>💎 Champion Node</option>
						</select>
						<Button
							type='button'
							size='sm'
							variant='primary'
							iconLeft={<Plus size={16} />}
							onClick={() => {
								const newIndex = (formData.nodes || []).length + 1;
								setFormData(p => ({
									...p,
									nodes: [
										...(p.nodes || []),
										{
											nodeID: `n${newIndex}`,
											nodeType: selectedNodeType,
											bosses: [],
											nextNodes: [],
											position: { x: 50, y: 50 },
										},
									],
								}));
							}}
						>
							Thêm Điểm (Node)
						</Button>
					</div>
				</div>
			</div>

			<div className='flex flex-col gap-8'>
				{isMapVisible && (
					<div className='space-y-4'>
						<div
							className='relative w-full bg-slate-950 rounded-2xl overflow-hidden border-2 border-border shadow-lg cursor-crosshair flex items-center justify-center'
							style={{ aspectRatio: mapAspectRatio }}
							ref={mapRef}
							onClick={handleMapClick}
							onContextMenu={handleMapContextMenu}
						>
							<img
								src={formData.background || "/images/placeholder-bg.jpg"}
								className='absolute inset-0 w-full h-full object-fill opacity-60'
								alt='Map Background'
								onLoad={e => {
									const { naturalWidth, naturalHeight } = e.target;
									if (naturalWidth && naturalHeight) {
										setMapAspectRatio(`${naturalWidth}/${naturalHeight}`);
									}
								}}
							/>
							<svg className='absolute inset-0 w-full h-full pointer-events-none'>
								<defs>
									<marker
										id='arrowhead-adv'
										markerWidth='6'
										markerHeight='6'
										refX='5.5'
										refY='3'
										orient='auto-start-reverse'
									>
										<path
											d='M0,0 L6,3 L0,6 L1.5,3 Z'
											fill='rgba(239, 68, 68, 0.9)'
										/>
									</marker>
								</defs>
								{(formData.nodes || []).map(node =>
									(node.nextNodes || []).map(tID => {
										const target = formData.nodes.find(
											n => n.nodeID === tID,
										);
										return (
											target && (
												<AdventureLine
													key={`${node.nodeID}-${tID}`}
													x1={node.position?.x ?? 0}
													y1={node.position?.y ?? 0}
													x2={target.position?.x ?? 0}
													y2={target.position?.y ?? 0}
													mapSize={mapSize}
												/>
											)
										);
									}),
								)}
							</svg>
							{(formData.nodes || []).map((n, i) => {
								const nodeInfo =
									NODE_TYPES_DATA.find(
										t => t.nodeType === (n.nodeType || "Encounter"),
									) || {};
								const isNodeBossOrMiniboss = (n.nodeType || "").toLowerCase().includes("boss");

								let bossImage = null;
								let singleBossName = "";
								if (n.bosses && n.bosses.length === 1) {
									const singleBossId = n.bosses[0];
									const bossData = (cachedData?.bosses || []).find(
										b => getUniqueAdvId(b) === singleBossId,
									);
									if (bossData) {
										bossImage = getAdvImage(bossData);
										singleBossName = getAdvName(bossData);
									}
								}

								if (nodeDisplayMode === "dot") {
									return (
										<div
											key={i}
											title={`${n.nodeID} - ${n.nodeType}${getBossNamesString(n.bosses)}\n${nodeInfo.description || ""}`}
											className={`absolute w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white transition-all cursor-pointer ${
												selectedNodeIndex === i
													? "bg-red-500 scale-150 z-30 shadow-[0_0_10px_rgba(239,68,68,1)]"
													: activeDragOverNodeIdx === i
														? "bg-emerald-500 scale-150 z-35 shadow-[0_0_12px_rgba(16,185,129,1)]"
														: "bg-blue-500 z-20 hover:scale-125 hover:bg-red-400"
											}`}
											style={{
												left: `${n.position?.x ?? 0}%`,
												top: `${n.position?.y ?? 0}%`,
											}}
											onClick={e => {
												e.stopPropagation();
												if ((e.ctrlKey || e.metaKey) && selectedNodeIndex !== null && selectedNodeIndex !== i) {
													const startIdx = selectedNodeIndex;
													setFormData(prev => {
														const nextNodes = [...(prev.nodes || [])];
														const startNode = nextNodes[startIdx];
														const targetNode = nextNodes[i];
														if (startNode && targetNode) {
															const currentNext = startNode.nextNodes || [];
															if (!currentNext.includes(targetNode.nodeID)) {
																nextNodes[startIdx] = {
																	...startNode,
																	nextNodes: [...currentNext, targetNode.nodeID],
																};
															}
														}
														return { ...prev, nodes: nextNodes };
													});
												}
												setSelectedNodeIndex(i);
											}}
											onContextMenu={e => {
												e.stopPropagation();
												e.preventDefault();
												setSelectedNodeIndex(i);
											}}
											onDragEnter={e => {
												if (isNodeBossOrMiniboss) {
													e.preventDefault();
													setActiveDragOverNodeIdx(i);
												}
											}}
											onDragLeave={() => {
												if (activeDragOverNodeIdx === i) {
													setActiveDragOverNodeIdx(null);
												}
											}}
											onDragOver={e => {
												if (isNodeBossOrMiniboss) {
													e.preventDefault();
												}
											}}
											onDrop={e => {
												if (isNodeBossOrMiniboss) {
													handleDropBossOnMapNode(e, i);
													setActiveDragOverNodeIdx(null);
												}
											}}
										/>
									);
								}

								return (
									<div
										key={i}
										title={`${n.nodeID} - ${n.nodeType}${getBossNamesString(n.bosses)}\n${nodeInfo.description || ""}`}
										className={`absolute w-7 h-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
											selectedNodeIndex === i
												? "bg-red-500 border-white scale-125 z-30 shadow-[0_0_15px_rgba(239,68,68,0.8)]"
												: activeDragOverNodeIdx === i
													? "bg-emerald-600 border-emerald-400 scale-125 z-35 shadow-[0_0_15px_rgba(16,185,129,0.8)]"
													: "bg-black/80 border-white/60 z-20 hover:scale-110 hover:border-white"
										}`}
										style={{
											left: `${n.position?.x ?? 0}%`,
											top: `${n.position?.y ?? 0}%`,
										}}
										onClick={e => {
											e.stopPropagation();
											if ((e.ctrlKey || e.metaKey) && selectedNodeIndex !== null && selectedNodeIndex !== i) {
												const startIdx = selectedNodeIndex;
												setFormData(prev => {
													const nextNodes = [...(prev.nodes || [])];
													const startNode = nextNodes[startIdx];
													const targetNode = nextNodes[i];
													if (startNode && targetNode) {
														const currentNext = startNode.nextNodes || [];
														if (!currentNext.includes(targetNode.nodeID)) {
															nextNodes[startIdx] = {
																...startNode,
																nextNodes: [...currentNext, targetNode.nodeID],
															};
														}
													}
													return { ...prev, nodes: nextNodes };
												});
											}
											setSelectedNodeIndex(i);
										}}
										onContextMenu={e => {
											e.stopPropagation();
											e.preventDefault();
											setSelectedNodeIndex(i);
										}}
										onDragEnter={e => {
											if (isNodeBossOrMiniboss) {
												e.preventDefault();
												setActiveDragOverNodeIdx(i);
											}
										}}
										onDragLeave={() => {
											if (activeDragOverNodeIdx === i) {
												setActiveDragOverNodeIdx(null);
											}
										}}
										onDragOver={e => {
											if (isNodeBossOrMiniboss) {
												e.preventDefault();
											}
										}}
										onDrop={e => {
											if (isNodeBossOrMiniboss) {
												handleDropBossOnMapNode(e, i);
												setActiveDragOverNodeIdx(null);
											}
										}}
									>
										{bossImage ? (
											<img
												src={bossImage}
												alt={singleBossName || "Boss"}
												className='w-full h-full object-cover rounded-full pointer-events-none'
											/>
										) : (
											getNodeIcon(n.nodeType)
										)}
										<span className='absolute -bottom-6 text-[10px] font-bold text-white bg-black/70 px-1.5 py-0.5 rounded shadow'>
											{n.nodeID || ""}
										</span>
									</div>
								);
							})}

							{contextMenu && (
								<>
									<div
										className='absolute w-4.5 h-4.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500 border border-white pointer-events-none z-40 animate-ping shadow-[0_0_10px_rgba(239,68,68,1)]'
										style={{
											left: `${contextMenu.percentX}%`,
											top: `${contextMenu.percentY}%`,
										}}
									/>
									<div
										className='absolute w-3.5 h-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-600 border border-white pointer-events-none z-40 shadow-[0_0_8px_rgba(220,38,38,0.9)]'
										style={{
											left: `${contextMenu.percentX}%`,
											top: `${contextMenu.percentY}%`,
										}}
									/>
								</>
							)}

							{contextMenu && (
								<div
									className='absolute bg-slate-900/95 backdrop-blur-md border border-slate-700/60 rounded-xl shadow-2xl p-2 w-52 z-50 animate-in fade-in zoom-in-95 duration-150 flex flex-col gap-1'
									style={{
										left: `${contextMenu.x}px`,
										top: `${contextMenu.y}px`,
									}}
									onClick={e => e.stopPropagation()}
								>
									<div className='px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800/80 mb-1 flex justify-between items-center select-none'>
										<span>Tạo Node tại đây</span>
										<span className='font-mono text-slate-500'>
											{contextMenu.percentX}% {contextMenu.percentY}%
										</span>
									</div>
									<div
										className='overflow-y-auto-scrollbar flex flex-col gap-0.5'
										style={{ maxHeight: `${contextMenu.maxListHeight || 300}px` }}
									>
										{NODE_TYPES_DATA.map(type => (
											<button
												key={type.nodeType}
												type='button'
												className='flex items-center gap-2.5 w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors'
												onClick={() =>
													handleCreateNodeAtPos(
														type.nodeType,
														contextMenu.percentX,
														contextMenu.percentY,
													)
												}
												title={type.description}
											>
												<span className='shrink-0 w-4 h-4 flex items-center justify-center'>
													{getNodeIcon(type.nodeType)}
												</span>
												<span className='truncate'>{type.nodeType}</span>
											</button>
										))}
									</div>
								</div>
							)}
						</div>
						<p className='text-xs text-text-secondary text-center italic'>
							Click chọn Node ở danh sách bên dưới, sau đó bấm lên bản đồ
							để di chuyển vị trí. Hover lên chấm tròn trên Map để xem
							thông tin Node.
						</p>
					</div>
				)}

				<div className='grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-4 max-h-[600px] overflow-y-auto pr-3-scrollbar'>
					<div className='lg:col-span-2'>
						<AdventureConnections
							nodes={formData.nodes || []}
							onChangeNodes={newNodes =>
								setFormData(prev => ({ ...prev, nodes: newNodes }))
							}
						/>
					</div>
					{(formData.nodes || []).length === 0 ? (
						<div className='lg:col-span-2 text-center py-10 text-text-secondary border border-dashed border-border rounded-xl bg-surface-hover/30'>
							Chưa có Node nào trên bản đồ.
						</div>
					) : (
						(formData.nodes || []).map((node, idx) => (
							<AdventureNodeEditor
								key={node.nodeID || idx}
								index={idx}
								node={node}
								isSelected={selectedNodeIndex === idx}
								onSelect={setSelectedNodeIndex}
								onChange={handleNodeChange}
								onRemove={i => {
									setFormData(prev => ({
										...prev,
										nodes: prev.nodes.filter((_, idx2) => idx2 !== i),
									}));
									setSelectedNodeIndex(current => {
										if (current === i) return null;
										if (current > i) return current - 1;
										return current;
									});
								}}
								cachedData={cachedData}
							/>
						))
					)}
				</div>
			</div>
		</section>
	);
};

export default MapNodesEditorSection;
