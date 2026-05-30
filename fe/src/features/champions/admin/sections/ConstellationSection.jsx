import { memo, useState, useRef, useCallback } from "react";
import { Map as MapIcon, Plus, EyeOff, Eye, Star, Gem } from "lucide-react";
import Button from "@/components/common/button";
import InputField from "@/components/common/inputField";
import {
	NODE_DEFAULT_TEMPLATES,
	ConstellationLine,
	ConstellationConnections,
	NodeEditor,
} from "@/features/champions/admin/championEditorHelpers";

const ConstellationSection = memo(({ constData, setConstData, cachedData, tUI }) => {
	const [selectedNodeIndex, setSelectedNodeIndex] = useState(null);
	const [isMapVisible, setIsMapVisible] = useState(true);
	const mapRef = useRef(null);

	const handleMapClick = e => {
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
									className={`absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 flex items-center justify-center -all ${selectedNodeIndex === i ? "bg-primary-500 border-white scale-125 z-30 shadow-[0_0_10px_white]" : "bg-white/10 border-white/40 z-20"}`}
									style={{
										left: `${n.position?.x ?? 0}%`,
										top: `${n.position?.y ?? 0}%`,
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
