import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
	House,
	Skull,
	Plus,
	HandFist,
	AlertCircle,
	Handbag,
	Package,
	HelpCircle,
	Diamond,
	ShieldQuestion,
	ZoomIn,
	ZoomOut,
	RefreshCcw,
} from "lucide-react";
import SafeImage from "../common/SafeImage";
import { useTranslation } from "../../hooks/useTranslation";
import nodeTypesData from "../../assets/data/nodeTypes.json";

const getMapIcon = type => {
	const t = (type || "").toLowerCase();
	if (t.includes("start"))
		return <House size={20} className='text-emerald-400 drop-shadow-md' />;
	if (t.includes("mini"))
		return <Skull size={16} className='text-orange-400 drop-shadow-md' />;
	if (t.includes("boss"))
		return <Skull size={20} className='text-red-500 drop-shadow-md' />;
	if (t.includes("power"))
		return <HandFist size={20} className='text-yellow-400 drop-shadow-md' />;
	if (t.includes("heal"))
		return <Plus size={20} className='text-green-400 drop-shadow-md' />;
	if (t.includes("encounter"))
		return <AlertCircle size={20} className='text-cyan-400 drop-shadow-md' />;
	if (t.includes("shop"))
		return <Handbag size={20} className='text-yellow-500 drop-shadow-md' />;
	if (
		t.includes("gold") ||
		t.includes("chest") ||
		t.includes("item") ||
		t.includes("spell")
	)
		return <Package size={20} className='text-blue-400 drop-shadow-md' />;
	if (t.includes("event") || t.includes("?"))
		return <HelpCircle size={20} className='text-purple-400 drop-shadow-md' />;
	if (t.includes("champion"))
		return <Diamond size={20} className='text-cyan-400 drop-shadow-md' />;
	return <ShieldQuestion size={20} className='text-white drop-shadow-md' />;
};

const getBgColor = type => {
	const t = (type || "").toLowerCase();
	if (t.includes("start"))
		return "bg-emerald-950 border-emerald-500 shadow-emerald-500/50";
	if (t.includes("boss") || t.includes("mini"))
		return "bg-red-950 border-red-500 shadow-red-500/50";
	if (t.includes("heal"))
		return "bg-green-950 border-green-500 shadow-green-500/50";
	if (t.includes("shop") || t.includes("power"))
		return "bg-yellow-950 border-yellow-500 shadow-yellow-500/50";
	if (
		t.includes("gold") ||
		t.includes("chest") ||
		t.includes("item") ||
		t.includes("spell")
	)
		return "bg-blue-950 border-blue-500 shadow-blue-500/50";
	if (t.includes("event") || t.includes("?"))
		return "bg-purple-950 border-purple-500 shadow-purple-500/50";
	if (t.includes("champion") || t.includes("encounter"))
		return "bg-cyan-950 border-cyan-500 shadow-cyan-500/50";
	return "bg-slate-800/90 border-slate-500 shadow-slate-500/50";
};

const getGlowColor = type => {
	const t = (type || "").toLowerCase();
	if (t.includes("start")) return "opacity-70 bg-emerald-500 animate-pulse";
	if (t.includes("boss") || t.includes("mini"))
		return "opacity-70 bg-red-500 animate-pulse";
	if (t.includes("shop") || t.includes("power"))
		return "opacity-70 bg-yellow-400 animate-pulse";
	if (t.includes("heal")) return "opacity-70 bg-green-500 animate-pulse";
	if (
		t.includes("gold") ||
		t.includes("chest") ||
		t.includes("item") ||
		t.includes("spell")
	)
		return "opacity-70 bg-blue-500 animate-pulse";
	if (t.includes("encounter")) return "opacity-70 bg-green-500 animate-pulse";
	return "opacity-50 bg-slate-500";
};

const AdventureNode = ({
	node,
	active,
	onShowTooltip,
	isDragging,
	zoom,
	resolvedBosses,
}) => {
	const nodeRef = useRef(null);

	const leftPos =
		typeof node.position?.x === "number"
			? `${node.position.x}%`
			: node.position?.x || "0%";
	const topPos =
		typeof node.position?.y === "number"
			? `${node.position.y}%`
			: node.position?.y || "0%";

	const inverseScale = 1 / Math.pow(zoom, 0.75);

	const handleInteraction = e => {
		if (e) e.stopPropagation();
		if (nodeRef.current && !isDragging) {
			const rect = nodeRef.current.getBoundingClientRect();
			onShowTooltip(node, { x: rect.left + rect.width / 2, y: rect.top - 10 });
		}
	};

	const handleMouseLeave = () => {
		if (active) onShowTooltip(null, null);
	};

	let bossImage = null;
	const nodeTypeLower = (node.nodeType || "").toLowerCase();
	const isCombatNode =
		nodeTypeLower.includes("boss") || nodeTypeLower.includes("mini");

	if (isCombatNode && node.bosses && node.bosses.length === 1) {
		const singleBossId = node.bosses[0];
		const bossData = resolvedBosses?.find(b => b.bossID === singleBossId);
		if (bossData && bossData.background) {
			bossImage = bossData.background;
		}
	}

	return (
		<div
			className={`absolute transform -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none ${active ? "z-50" : ""}`}
			style={{ left: leftPos, top: topPos }}
		>
			<div
				ref={nodeRef}
				className='pointer-events-auto cursor-pointer'
				style={{
					transform: `scale(${inverseScale})`,
					transition: isDragging ? "none" : "transform 0.3s ease-out",
					transformOrigin: "center center",
				}}
				onMouseEnter={handleInteraction}
				onMouseLeave={handleMouseLeave}
				onTouchStart={handleInteraction}
				onTouchEnd={handleMouseLeave}
				onClick={handleInteraction}
			>
				<div
					className={`relative flex items-center justify-center transition-transform duration-300 ${active ? "scale-125" : "hover:scale-110"}`}
				>
					<div
						className={`absolute inset-0 rounded-full blur-xl transition-opacity duration-500 will-change-opacity ${active ? getGlowColor(node.nodeType) : "opacity-0"}`}
					/>
					<div
						className={`relative flex items-center justify-center w-[25px] h-[25px] sm:w-[40px] sm:h-[40px] rounded-full border-2 overflow-hidden shadow-lg ${getBgColor(node.nodeType)}`}
					>
						{isCombatNode && bossImage ? (
							<SafeImage
								src={bossImage}
								alt='Boss Node'
								className='w-full h-full object-cover opacity-90 transition-opacity pointer-events-none'
							/>
						) : (
							getMapIcon(node.nodeType)
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

const AdventureLine = ({
	x1,
	y1,
	x2,
	y2,
	zoom,
	mapSize = { width: 1000, height: 400 },
}) => {
	if (!mapSize.width || !mapSize.height) return null;

	const dx = (x2 - x1) * mapSize.width;
	const dy = (y2 - y1) * mapSize.height;
	const angle = Math.atan2(dy, dx);

	const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
	const inverseScale = 1 / Math.pow(zoom, 0.75);

	const baseOffsetPx = isMobile ? 18 : 28;
	const offsetPx = baseOffsetPx * inverseScale;

	const offsetX_pct = ((offsetPx * Math.cos(angle)) / mapSize.width) * 100;
	const offsetY_pct = ((offsetPx * Math.sin(angle)) / mapSize.height) * 100;

	const startX_pct = x1 + offsetX_pct;
	const startY_pct = y1 + offsetY_pct;
	const finalX2_pct = x2 - offsetX_pct;
	const finalY2_pct = y2 - offsetY_pct;

	const strokeW = isMobile ? "1.5" : "2";

	return (
		<line
			x1={`${startX_pct}%`}
			y1={`${startY_pct}%`}
			x2={`${finalX2_pct}%`}
			y2={`${finalY2_pct}%`}
			stroke='rgba(234, 179, 8, 0.8)'
			strokeWidth={strokeW}
			strokeDasharray='6,4'
			markerEnd='url(#arrowhead)'
		/>
	);
};

const AdventureMapVisualizer = ({ nodes, background, resolvedBosses }) => {
	const mapRef = useRef(null);
	const { tUI, tDynamic } = useTranslation();
	const [zoom, setZoom] = useState(1);
	const [pan, setPan] = useState({ x: 0, y: 0 });
	const [isDragging, setIsDragging] = useState(false);
	const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
	const [hoveredNode, setHoveredNode] = useState(null);
	const [tooltipCoords, setTooltipCoords] = useState(null);

	const [aspectRatio, setAspectRatio] = useState("16/9");
	const [mapSize, setMapSize] = useState({ width: 1000, height: 400 });

	const [isMobile, setIsMobile] = useState(
		typeof window !== "undefined" ? window.innerWidth < 640 : false,
	);

	useEffect(() => {
		const handleResize = () => setIsMobile(window.innerWidth < 640);
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	useEffect(() => {
		if (!mapRef.current) return;
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
	}, []);

	if (!nodes || nodes.length === 0) return null;

	useEffect(() => {
		const el = mapRef.current;
		if (!el) return;
		const handleWheel = e => {
			e.preventDefault();
			const zoomSensitivity = 0.002;
			const delta = -e.deltaY * zoomSensitivity;
			setZoom(prev => Math.min(Math.max(prev + delta, 0.5), 3));
			setHoveredNode(null);
		};
		el.addEventListener("wheel", handleWheel, { passive: false });
		return () => el.removeEventListener("wheel", handleWheel);
	}, []);

	const handleMouseDown = e => {
		setIsDragging(true);
		setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
		setHoveredNode(null);
	};
	const handleMouseMove = e => {
		if (!isDragging) return;
		setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
	};
	const handleMouseUpOrLeave = () => setIsDragging(false);
	const handleReset = () => {
		setZoom(1);
		setPan({ x: 0, y: 0 });
	};

	const handleTouchStart = e => {
		if (e.touches.length === 1) {
			setIsDragging(true);
			setDragStart({
				x: e.touches[0].clientX - pan.x,
				y: e.touches[0].clientY - pan.y,
			});
		}
	};
	const handleTouchMove = e => {
		if (!isDragging || e.touches.length !== 1) return;
		setPan({
			x: e.touches[0].clientX - dragStart.x,
			y: e.touches[0].clientY - dragStart.y,
		});
	};

	const screenW = typeof window !== "undefined" ? window.innerWidth : 1000;
	let tooltipStyle = {};
	let arrowStyle = {};

	if (tooltipCoords) {
		if (isMobile) {
			const mobileMargin = 16;
			const mobileWidth = screenW - mobileMargin * 2;
			const arrowX = Math.max(
				mobileMargin + 10,
				Math.min(tooltipCoords.x - mobileMargin, mobileWidth - 10),
			);
			tooltipStyle = {
				left: `${mobileMargin}px`,
				top: `${tooltipCoords.y}px`,
				transform: "translate(0, -100%)",
				width: `${mobileWidth}px`,
			};
			arrowStyle = { left: `${arrowX}px`, transform: "translateX(-50%)" };
		} else {
			const isNearRight = tooltipCoords.x > screenW - 160;
			const isNearLeft = tooltipCoords.x < 160;
			const tooltipTransformX = isNearRight
				? "calc(-100% + 30px)"
				: isNearLeft
					? "-30px"
					: "-50%";
			const arrowLeft = isNearRight
				? "calc(100% - 30px)"
				: isNearLeft
					? "30px"
					: "50%";
			tooltipStyle = {
				left: `${tooltipCoords.x}px`,
				top: `${tooltipCoords.y}px`,
				transform: `translate(${tooltipTransformX}, -100%)`,
				width: "max-content",
				maxWidth: "300px",
			};
			arrowStyle = { left: arrowLeft, transform: "translateX(-50%)" };
		}
	}

	return (
		<div
			className={`relative w-full bg-surface-bg border border-border rounded-lg overflow-hidden shadow-2xl group select-none touch-none ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
			style={{ aspectRatio: aspectRatio }}
			ref={mapRef}
			onMouseDown={handleMouseDown}
			onMouseMove={handleMouseMove}
			onMouseUp={handleMouseUpOrLeave}
			onMouseLeave={handleMouseUpOrLeave}
			onTouchStart={handleTouchStart}
			onTouchMove={handleTouchMove}
			onTouchEnd={handleMouseUpOrLeave}
		>
			<div
				className='absolute bottom-2 right-2 sm:bottom-4 sm:right-4 z-50 flex flex-col gap-1 sm:gap-2 bg-surface-bg/90 backdrop-blur-md p-1 sm:p-1.5 rounded-xl border border-border shadow-xl'
				onMouseDown={e => e.stopPropagation()}
				onTouchStart={e => e.stopPropagation()}
			>
				<button
					onClick={() => setZoom(z => Math.min(z + 0.5, 3))}
					title={tUI("common.zoomIn") || "Phóng to"}
					className='p-1.5 sm:p-2 text-text-primary bg-surface-hover hover:bg-primary-500 hover:text-white rounded-lg transition-all duration-200 shadow-sm'
				>
					<ZoomIn size={isMobile ? 18 : 22} />
				</button>
				<button
					onClick={handleReset}
					title={tUI("common.reset") || "Đặt lại"}
					className='p-1.5 sm:p-2 text-text-primary bg-surface-hover hover:bg-primary-500 hover:text-white rounded-lg transition-all duration-200 shadow-sm'
				>
					<RefreshCcw size={isMobile ? 16 : 20} />
				</button>
				<button
					onClick={() => setZoom(z => Math.max(z - 0.5, 0.5))}
					title={tUI("common.zoomOut") || "Thu nhỏ"}
					className='p-1.5 sm:p-2 text-text-primary bg-surface-hover hover:bg-primary-500 hover:text-white rounded-lg transition-all duration-200 shadow-sm'
				>
					<ZoomOut size={isMobile ? 18 : 22} />
				</button>
			</div>

			<div
				className={`w-full h-full origin-center bg-black ${!isDragging ? "transition-transform duration-300 ease-out" : ""}`}
				style={{
					transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
				}}
			>
				{background && (
					<img
						src={background}
						alt='Map Background'
						onLoad={e => {
							const { naturalWidth, naturalHeight } = e.target;
							if (naturalWidth && naturalHeight) {
								setAspectRatio(`${naturalWidth}/${naturalHeight}`);
							}
						}}
						className='absolute inset-0 w-full h-full object-fill opacity-30 pointer-events-none'
						draggable={false}
					/>
				)}

				<svg className='absolute inset-0 w-full h-full pointer-events-none'>
					<defs>
						<marker
							id='arrowhead'
							markerWidth='8'
							markerHeight='8'
							refX='7'
							refY='4'
							orient='auto'
						>
							<path d='M0,0 L8,4 L0,8 L2,4 Z' fill='rgba(234, 179, 8, 0.8)' />
						</marker>
					</defs>
					{nodes.map(node =>
						(node.nextNodes || []).map(targetID => {
							const targetNode = nodes.find(n => n.nodeID === targetID);
							if (!targetNode) return null;
							return (
								<AdventureLine
									key={`${node.nodeID}-${targetID}`}
									x1={node.position?.x}
									y1={node.position?.y}
									x2={targetNode.position?.x}
									y2={targetNode.position?.y}
									zoom={zoom}
									mapSize={mapSize}
								/>
							);
						}),
					)}
				</svg>

				{nodes.map((node, index) => (
					<AdventureNode
						key={node.nodeID || index}
						node={node}
						index={index}
						zoom={zoom}
						isDragging={isDragging}
						resolvedBosses={resolvedBosses}
						active={hoveredNode?.nodeID === node.nodeID}
						onShowTooltip={(n, c) => {
							setHoveredNode(n);
							setTooltipCoords(c);
						}}
					/>
				))}
			</div>

			{hoveredNode &&
				tooltipCoords &&
				!isDragging &&
				createPortal(
					(() => {
						const nodeInfo =
							nodeTypesData.find(t => t.nodeType === hoveredNode.nodeType) ||
							{};
						const nodeDescription =
							tDynamic(nodeInfo, "description") ||
							tUI("adventureMap.noNodeDescription") ||
							"Không có mô tả chi tiết cho loại Node này.";
						return (
							<div
								className='fixed bg-surface-bg border border-primary-500 rounded-lg shadow-2xl p-3 z-[9999] pointer-events-none'
								style={tooltipStyle}
							>
								<h3 className='text-primary-500 font-bold text-sm uppercase mb-1 flex items-center justify-between'>
									<span>{hoveredNode.nodeType}</span>
									<span className='text-[10px] bg-primary-500/20 px-1.5 py-0.5 rounded ml-2'>
										{hoveredNode.nodeID}
									</span>
								</h3>
								<p className='text-xs text-text-primary mb-2 opacity-90 italic border-b border-border/50 pb-2'>
									{nodeDescription}
								</p>
								{hoveredNode.bosses && hoveredNode.bosses.length > 0 ? (
									<div className='mt-2 space-y-1'>
										<p className='text-text-secondary text-xs font-semibold'>
											{tUI("adventureMap.components")}
										</p>
										<ul className='text-sm font-bold text-text-primary list-disc pl-4 marker:text-yellow-500'>
											{hoveredNode.bosses.map((b, i) => {
												const bName =
													resolvedBosses?.find(rb => rb.bossID === b)
														?.bossName || b;
												return <li key={i}>{bName}</li>;
											})}
										</ul>
									</div>
								) : (
									<p className='text-text-secondary text-xs italic mt-1'>
										{tUI("adventureMap.noEnemyInfo") || "Không có thông tin"}
									</p>
								)}
								<div
									className='absolute top-full border-8 border-transparent border-t-primary-500'
									style={arrowStyle}
								/>
							</div>
						);
					})(),
					document.body,
				)}
		</div>
	);
};

export default AdventureMapVisualizer;
