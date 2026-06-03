import { memo, useState, useRef, useCallback, useEffect } from "react";
import { Map as MapIcon, Plus, EyeOff, Eye, Star, Gem } from "lucide-react";
import Button from "@/components/common/button";
import InputField from "@/components/common/inputField";
import {
	NODE_DEFAULT_TEMPLATES,
	ConstellationLine,
	ConstellationConnections,
	NodeEditor,
	getUniqueId,
} from "@/features/champions/admin/championEditorHelpers";

const ConstellationSection = memo(({ constData, setConstData, cachedData, tUI }) => {
	const [selectedNodeIndex, setSelectedNodeIndex] = useState(null);
	const [isMapVisible, setIsMapVisible] = useState(true);
	const [contextMenu, setContextMenu] = useState(null);
	const [activeDragOverNodeIdx, setActiveDragOverNodeIdx] = useState(null);
	const mapRef = useRef(null);

	useEffect(() => {
		if (!contextMenu) return;
		const handleClose = () => setContextMenu(null);
		document.addEventListener("click", handleClose);
		return () => document.removeEventListener("click", handleClose);
	}, [contextMenu]);

	const handleMapClick = e => {
		if (contextMenu) return;
		if (selectedNodeIndex === null || !mapRef.current) return;
		const rect = mapRef.current.getBoundingClientRect();
		const x = parseFloat(
			(((e.clientX - rect.left) / rect.width) * 100).toFixed(1),
		);
		const y = parseFloat(
			(((e.clientY - rect.top) / rect.height) * 100).toFixed(1),
		);

		setConstData(prev => {
			const nextNodes = [...prev.nodes];
			nextNodes[selectedNodeIndex] = {
				...nextNodes[selectedNodeIndex],
				position: { x, y },
			};
			return { ...prev, nodes: nextNodes };
		});
	};

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
			const maxMenuHeight = 150;
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
			setConstData(prev => {
				const nextNodes = [...(prev.nodes || [])];
				let newIndex = nextNodes.length + 1;
				let newID = `n${newIndex}`;
				let attempts = 0;
				while (nextNodes.some(n => n.nodeID === newID) && attempts < 100) {
					attempts++;
					newID = `n${newIndex + attempts}`;
				}

				const template = NODE_DEFAULT_TEMPLATES[newID] || {
					nodeType: type,
					requirements: [],
				};

				const newNode = {
					nodeID: newID,
					nodeName: "",
					nodeType: type,
					position: { x: percentX, y: percentY },
					nextNodes: [],
					requirements: JSON.parse(JSON.stringify(template.requirements)),
					description: "",
					isRecommended: false,
				};

				const updatedNodes = [...nextNodes, newNode];

				setTimeout(() => {
					setSelectedNodeIndex(updatedNodes.length - 1);
				}, 50);

				return { ...prev, nodes: updatedNodes };
			});
			setContextMenu(null);
		},
		[setConstData],
	);

	const handleDropPowerOnMapNode = useCallback((e, nodeIdx) => {
		e.preventDefault();
		e.stopPropagation();
		try {
			const dragged = JSON.parse(e.dataTransfer.getData("text/plain"));
			const uniqueId = dragged.id;

			if (dragged.type === "power" || dragged.type === "bonusStar") {
				const list = dragged.type === "power"
					? cachedData.powers || []
					: cachedData.bonusStars || [];
				let droppedItem = uniqueId
					? list.find(p => getUniqueId(p) === uniqueId)
					: null;
				if (!droppedItem && dragged.name) {
					droppedItem = list.find(p => p.name === dragged.name);
				}

				if (droppedItem) {
					setConstData(prev => {
						const nextNodes = [...(prev.nodes || [])];
						const nodeToUpdate = nextNodes[nodeIdx];
						if (nodeToUpdate) {
							const itemID = uniqueId || getUniqueId(droppedItem);
							const updates = {
								nodeName: droppedItem.name,
								description: droppedItem.descriptionRaw || droppedItem.description || "",
							};
							if (dragged.type === "power") {
								updates.powerCode = itemID;
								updates.nodeType = "starPower";
							}
							if (dragged.type === "bonusStar") {
								updates.bonusStarID = itemID;
								updates.nodeType = "bonusStar";
							}
							nextNodes[nodeIdx] = { ...nodeToUpdate, ...updates };
						}
						return { ...prev, nodes: nextNodes };
					});
				}
			}
		} catch (err) {
			console.warn("Lỗi kéo thả vào Node trên Map", err);
		}
	}, [setConstData, cachedData]);

	const handleNodeChange = useCallback((idx, field, val) => {
		setConstData(prev => {
			const nextNodes = [...prev.nodes];
			nextNodes[idx] = { ...nextNodes[idx], [field]: val };
			return { ...prev, nodes: nextNodes };
		});
	}, [setConstData]);

	const handleNodeMultiChange = useCallback((idx, updates) => {
		setConstData(prev => {
			const nextNodes = [...prev.nodes];
			nextNodes[idx] = { ...nextNodes[idx], ...updates };
			return { ...prev, nodes: nextNodes };
		});
	}, [setConstData]);

	return (
		<section className='bg-surface-bg border border-border rounded-xl p-6 shadow-sm space-y-6'>
			<div className='flex justify-between items-center border-l-4 border-pink-500 pl-3'>
				<h3 className='text-lg font-bold uppercase flex items-center gap-2'>
					<MapIcon size={20} className='text-pink-500' /> {tUI("admin.championForm.constellationTitle")}
				</h3>
				<div className='flex items-center gap-3'>
					<Button
						type='button'
						size='sm'
						variant='outline'
						onClick={() => setIsMapVisible(!isMapVisible)}
						iconLeft={
							isMapVisible ? <EyeOff size={16} /> : <Eye size={16} />
						}
					>
						{isMapVisible ? tUI("admin.championForm.hideMap") : tUI("admin.championForm.showMap")}
					</Button>
					<Button
						type='button'
						size='sm'
						variant='outline'
						iconLeft={<Plus size={16} />}
						onClick={() => {
							const newIndex = constData.nodes.length + 1;
							const newID = `n${newIndex}`;
							const template = NODE_DEFAULT_TEMPLATES[newID] || {
								nodeType: "starPower",
								requirements: [],
							};

							setConstData({
								...constData,
								nodes: [
									...constData.nodes,
									{
										nodeID: newID,
										nodeName: "",
										nodeType: template.nodeType,
										position: { x: 50, y: 50 },
										nextNodes: [],
										requirements: JSON.parse(
											JSON.stringify(template.requirements),
										),
										description: "",
										isRecommended: false,
									},
								],
							});
						}}
					>
						{tUI("admin.championForm.addNode")}
					</Button>
				</div>
			</div>

			<div
				className={`grid grid-cols-1 ${isMapVisible ? "xl:grid-cols-2" : ""} gap-8`}
			>
				{isMapVisible && (
					<div className='space-y-4 sticky top-24'>
						<div
							className='relative aspect-video bg-slate-950 rounded-2xl overflow-hidden border-2 border-border shadow-lg cursor-crosshair'
							ref={mapRef}
							onClick={handleMapClick}
							onContextMenu={handleMapContextMenu}
						>
							<img
								src={
									constData.backgroundImage ||
									"/images/placeholder-bg.jpg"
								}
								className='w-full h-full object-cover opacity-50'
							/>
							<svg className='absolute inset-0 w-full h-full pointer-events-none'>
								<marker
									id='arrowhead'
									markerWidth='5'
									markerHeight='5'
									refX='4.8'
									refY='2.5'
									orient='auto'
								>
									<path
										d='M0,0 L5,2.5 L0,5 Z'
										fill='rgba(234, 179, 8, 0.6)'
									/>
								</marker>
								{constData.nodes.map(node =>
									node.nextNodes?.map(tID => {
										const target = constData.nodes.find(
											n => n.nodeID === tID,
										);
										return (
											target && (
												<ConstellationLine
													key={`${node.nodeID}-${tID}`}
													x1={node.position?.x ?? 0}
													y1={node.position?.y ?? 0}
													x2={target.position?.x ?? 0}
													y2={target.position?.y ?? 0}
												/>
											)
										);
									}),
								)}
							</svg>
							{constData.nodes.map((n, i) => (
								<div
									key={i}
									className={`absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
										selectedNodeIndex === i 
											? "bg-primary-500 border-white scale-125 z-30 shadow-[0_0_10px_white]" 
											: activeDragOverNodeIdx === i
												? "bg-emerald-500 border-emerald-300 scale-125 z-35 shadow-[0_0_12px_rgba(16,185,129,1)]"
												: "bg-white/10 border-white/40 z-20 hover:scale-110"
									}`}
									style={{
										left: `${n.position?.x ?? 0}%`,
										top: `${n.position?.y ?? 0}%`,
									}}
									onClick={e => {
										e.stopPropagation();
										if ((e.ctrlKey || e.metaKey) && selectedNodeIndex !== null && selectedNodeIndex !== i) {
											const startIdx = selectedNodeIndex;
											setConstData(prev => {
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
										e.preventDefault();
										setActiveDragOverNodeIdx(i);
									}}
									onDragLeave={() => {
										if (activeDragOverNodeIdx === i) {
											setActiveDragOverNodeIdx(null);
										}
									}}
									onDragOver={e => {
										e.preventDefault();
									}}
									onDrop={e => {
										handleDropPowerOnMapNode(e, i);
										setActiveDragOverNodeIdx(null);
									}}
								>
									{n.nodeType === "starPower" ? (
										<Star size={10} className='text-white fill-current' />
									) : (
										<Gem size={10} className='text-white fill-current' />
									)}
									<span className='absolute -bottom-5 text-[8px] font-bold text-white bg-black/40 px-1 rounded'>
										{n.nodeID || ""}
									</span>
								</div>
							))}

							{contextMenu && (
								<>
									<div
										className='absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-500 border border-white pointer-events-none z-40 animate-ping shadow-[0_0_10px_rgba(236,72,153,1)]'
										style={{
											left: `${contextMenu.percentX}%`,
											top: `${contextMenu.percentY}%`,
										}}
									/>
									<div
										className='absolute w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-600 border border-white pointer-events-none z-40 shadow-[0_0_8px_rgba(219,39,119,0.9)]'
										style={{
											left: `${contextMenu.percentX}%`,
											top: `${contextMenu.percentY}%`,
										}}
									/>
									<div
										className='absolute bg-slate-900/95 backdrop-blur-md border border-slate-700/60 rounded-xl shadow-2xl p-2 w-48 z-50 animate-in fade-in zoom-in-95 duration-150 flex flex-col gap-1'
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
											className='overflow-y-auto -scrollbar flex flex-col gap-0.5'
											style={{ maxHeight: `${contextMenu.maxListHeight || 150}px` }}
										>
											<button
												type='button'
												className='flex items-center gap-2.5 w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors'
												onClick={() =>
													handleCreateNodeAtPos(
														"starPower",
														contextMenu.percentX,
														contextMenu.percentY,
													)
												}
											>
												<span className='shrink-0 w-4 h-4 flex items-center justify-center'>
													<Star size={14} className='text-yellow-400' />
												</span>
												<span className='truncate'>Star Power</span>
											</button>
											<button
												type='button'
												className='flex items-center gap-2.5 w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors'
												onClick={() =>
													handleCreateNodeAtPos(
														"bonusStar",
														contextMenu.percentX,
														contextMenu.percentY,
													)
												}
											>
												<span className='shrink-0 w-4 h-4 flex items-center justify-center'>
													<Gem size={14} className='text-cyan-400' />
												</span>
												<span className='truncate'>Bonus Star</span>
											</button>
											<button
												type='button'
												className='flex items-center gap-2.5 w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors'
												onClick={() =>
													handleCreateNodeAtPos(
														"bonusStarGem",
														contextMenu.percentX,
														contextMenu.percentY,
													)
												}
											>
												<span className='shrink-0 w-4 h-4 flex items-center justify-center'>
													<Gem size={14} className='text-purple-400' />
												</span>
												<span className='truncate'>Bonus Gem</span>
											</button>
										</div>
									</div>
								</>
							)}
						</div>
						<InputField
							label={tUI("admin.championForm.mapBgLabel")}
							value={constData.backgroundImage || ""}
							onChange={e =>
								setConstData({
									...constData,
									backgroundImage: e.target.value,
								})
							}
							placeholder='Nhập link ảnh...'
						/>
					</div>
				)}

				<div
					className={`max-h-[800px] overflow-y-auto pr-3 -scrollbar ${isMapVisible ? "space-y-2" : "grid grid-cols-1 lg:grid-cols-2 gap-x-6 content-start"}`}
				>
					<div className={!isMapVisible ? "lg:col-span-2" : ""}>
						<ConstellationConnections
							nodes={constData.nodes}
							onChangeNodes={newNodes =>
								setConstData(prev => ({ ...prev, nodes: newNodes }))
							}
						/>
					</div>
					{constData.nodes.length === 0 ? (
						<div
							className={`text-center py-10 text-text-secondary border border-dashed border-border rounded-xl bg-surface-hover/30 ${!isMapVisible ? "lg:col-span-2" : ""}`}
						>
							{tUI("admin.championForm.emptyNodes")}
						</div>
					) : (
						(constData.nodes || []).map((node, idx) => (
							<NodeEditor
								key={idx}
								index={idx}
								node={node}
								isSelected={selectedNodeIndex === idx}
								onSelect={setSelectedNodeIndex}
								onChange={handleNodeChange}
								onMultiChange={handleNodeMultiChange}
								onRemove={i => {
									setConstData({
										...constData,
										nodes: constData.nodes.filter((_, idx) => idx !== i),
									});
									if (selectedNodeIndex === i) setSelectedNodeIndex(null);
								}}
								cachedData={cachedData}
							/>
						))
					)}
				</div>
			</div>
		</section>
	);
});

ConstellationSection.displayName = "ConstellationSection";
export default ConstellationSection;
