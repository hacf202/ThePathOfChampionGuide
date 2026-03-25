// src/pages/adventureMapDetail.jsx
import React, { memo, useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
	ChevronLeft,
	Star,
	Swords,
	Gift,
	ShieldAlert,
	Map as MapIcon,
	Compass,
	HelpCircle,
	ZoomIn,
	ZoomOut,
	RefreshCcw,
	Info,
	Flag,
	Skull,
	Plus,
	HandMetal,
	AlertCircle,
	ShoppingBag,
	Package,
	Diamond,
	Zap,
	Eye,
	EyeOff,
} from "lucide-react";

import { useTranslation } from "../../hooks/useTranslation";
import { useMapDetailData } from "../../hooks/useMapDetailData";
import { removeAccents } from "../../utils/vietnameseUtils";
import PageTitle from "../common/pageTitle";
import Button from "../common/button";
import SafeImage from "../common/SafeImage";
import GoogleAd from "../common/googleAd";

import iconData from "../../assets/data/icon.json";
import nodeTypesData from "../../assets/data/nodeTypes.json";

const MapDetailSkeleton = () => (
	<div className='flex flex-col space-y-8 animate-pulse w-full'>
		<div className='relative rounded-2xl overflow-hidden border border-border shadow-md bg-surface-bg w-full h-[250px] md:h-[350px]'>
			<div className='absolute inset-0 bg-surface-hover/40'></div>
			<div className='absolute bottom-0 left-0 w-full p-4 md:p-8 flex flex-col md:flex-row justify-between items-end gap-4'>
				<div className='space-y-3 w-full md:w-1/2'>
					<div className='flex gap-2'>
						<div className='h-6 w-20 bg-slate-700/30 rounded-full'></div>
						<div className='h-6 w-24 bg-slate-700/30 rounded-full'></div>
					</div>
					<div className='h-10 w-3/4 bg-slate-700/40 rounded-lg'></div>
				</div>
				<div className='h-16 w-32 bg-slate-700/30 rounded-lg'></div>
			</div>
		</div>
		<div className='bg-surface-bg border border-border rounded-xl p-2 md:p-4 shadow-sm w-full'>
			<div className='h-6 w-48 bg-slate-700/30 rounded mb-4'></div>
			<div className='w-full aspect-video md:aspect-[21/9] bg-surface-hover/50 rounded-lg border border-border/50'></div>
		</div>
		<div className='bg-surface-bg border border-border rounded-xl p-2 md:p-4 shadow-sm w-full'>
			<div className='h-6 w-48 bg-slate-700/30 rounded mb-4'></div>
			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
				{[1, 2, 3].map(i => (
					<div
						key={i}
						className='flex items-start gap-3 bg-surface-hover/30 border border-border rounded-lg p-3 h-24'
					>
						<div className='w-14 h-14 rounded-md bg-slate-700/30 shrink-0'></div>
						<div className='space-y-2 flex-1'>
							<div className='h-4 w-3/4 bg-slate-700/40 rounded'></div>
							<div className='h-3 w-full bg-slate-700/30 rounded'></div>
							<div className='h-3 w-5/6 bg-slate-700/30 rounded'></div>
						</div>
					</div>
				))}
			</div>
		</div>
	</div>
);

const getMapIcon = type => {
	const t = (type || "").toLowerCase();
	if (t.includes("start"))
		return <Flag size={20} className='text-emerald-400 drop-shadow-md' />;
	if (t.includes("mini"))
		return <Skull size={16} className='text-orange-400 drop-shadow-md' />;
	if (t.includes("boss"))
		return <Skull size={20} className='text-red-500 drop-shadow-md' />;
	if (t.includes("power"))
		return <HandMetal size={20} className='text-yellow-400 drop-shadow-md' />;
	if (t.includes("heal"))
		return <Plus size={20} className='text-green-400 drop-shadow-md' />;
	if (t.includes("encounter"))
		return <AlertCircle size={20} className='text-red-400 drop-shadow-md' />;
	if (t.includes("shop"))
		return <ShoppingBag size={20} className='text-yellow-500 drop-shadow-md' />;
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
	if (t.includes("boss") || t.includes("mini") || t.includes("encounter"))
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
	if (t.includes("champion"))
		return "bg-cyan-950 border-cyan-500 shadow-cyan-500/50";
	return "bg-slate-800/90 border-slate-500 shadow-slate-500/50";
};

const getGlowColor = type => {
	const t = (type || "").toLowerCase();
	if (t.includes("start")) return "opacity-70 bg-emerald-500 animate-pulse";
	if (t.includes("boss") || t.includes("mini") || t.includes("encounter"))
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
		nodeTypeLower.includes("boss") ||
		nodeTypeLower.includes("mini") ||
		nodeTypeLower.includes("encounter");

	// CẬP NHẬT: Chỉ lấy ảnh nếu có ĐÚNG 1 Boss. Nếu nhiều hơn 1 Boss, bossImage sẽ giữ nguyên là null và tự động fallback về getMapIcon
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
											{tUI("adventureMap.components") || "Thành phần:"}
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
										{tUI("adventureMap.noEnemyInfo") ||
											"Không có thông tin kẻ địch."}
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

const ResolvedPowerCard = ({ powerOrId }) => {
	const { tDynamic } = useTranslation();
	const [power, setPower] = useState(
		typeof powerOrId === "object" ? powerOrId : null,
	);

	useEffect(() => {
		if (typeof powerOrId === "string") {
			const fetchPower = async () => {
				try {
					const API_URL =
						import.meta.env.VITE_API_URL || "http://localhost:5000";
					const res = await fetch(`${API_URL}/api/powers/${powerOrId}`);
					const data = await res.json();
					if (data && !data.error) setPower(data);
				} catch (e) {
					console.error("Error fetching power:", e);
				}
			};
			fetchPower();
		} else {
			setPower(powerOrId);
		}
	}, [powerOrId]);

	if (!power) {
		return (
			<div className='h-[68px] bg-surface-hover/50 rounded-lg animate-pulse border border-border/50'></div>
		);
	}

	const powerName =
		tDynamic(power, "name") || power.name || power.powerCode || powerOrId;
	const powerDesc =
		tDynamic(power, "description") || tDynamic(power, "descriptionRaw") || "";

	return (
		<Link
			to={`/power/${power.powerCode || power.id || powerOrId}`}
			className='block h-full'
		>
			<div className='flex items-start gap-3 bg-surface-hover/50 rounded-lg h-full hover:border-primary-500 transition-colors p-2 shadow-sm border border-border/50'>
				<SafeImage
					src={power.assetAbsolutePath || power.image || "/fallback-image.svg"}
					alt={powerName}
					className='w-10 h-10 rounded-md object-cover bg-surface-bg shrink-0'
				/>
				<div>
					<h4 className='font-bold text-text-primary text-sm md:text-base'>
						{powerName}
					</h4>
					{powerDesc && (
						<p
							className='text-xs md:text-sm text-text-secondary mt-1 line-clamp-3'
							dangerouslySetInnerHTML={{ __html: powerDesc }}
						/>
					)}
				</div>
			</div>
		</Link>
	);
};

function AdventureMapDetail() {
	const { adventureID } = useParams();
	const navigate = useNavigate();
	const { tUI, tDynamic } = useTranslation();

	// Thêm State để điều khiển ẩn hiện bản đồ
	const [isMapVisible, setIsMapVisible] = useState(true);

	const {
		adventure,
		resolvedRules,
		resolvedBosses,
		resolvedChampions,
		loading,
		error,
	} = useMapDetailData(adventureID);

	const getRegionIcon = regionName => {
		if (Array.isArray(iconData)) {
			const found = iconData.find(item => item.name === regionName);
			if (found) return found.image;
		}
		return "/fallback-image.svg";
	};
	const getRewardIcon = rewardName => {
		if (Array.isArray(iconData)) {
			const found = iconData.find(item => item.name === rewardName);
			if (found) return found.image;
		}
		return "/fallback-image.svg";
	};
	const getTranslatedRegion = regionName => {
		const regionKey = removeAccents(regionName)
			.toLowerCase()
			.replace(/[^a-z0-9]/g, "");
		return tUI(`region.${regionKey}`) || regionName;
	};

	if (error) {
		return (
			<div className='flex flex-col items-center justify-center py-20 text-center'>
				<ShieldAlert size={48} className='text-red-500 mb-4 opacity-50' />
				<p className='text-xl text-text-primary mb-6'>
					{tUI("adventureMap.errorLoad") || error}
				</p>
				<Button onClick={() => navigate("/maps")} variant='primary'>
					{tUI("common.backToList") || "Quay lại danh sách"}
				</Button>
			</div>
		);
	}

	return (
		<div className='animate-fadeIn font-secondary max-w-[1000px] mx-auto p-2 md:p-6 pb-20'>
			<PageTitle
				title={
					adventure
						? tDynamic(adventure, "adventureName")
						: tUI("adventureMap.detailTitle") || "Chi tiết bản đồ"
				}
				description={`${tUI("adventureMap.detailDesc") || "Hướng dẫn chi tiết bản đồ"} ${adventure?.adventureName || ""}`}
			/>
			<Button variant='outline' onClick={() => navigate(-1)} className='mb-4'>
				<ChevronLeft size={18} /> {tUI("common.back") || "Quay lại"}
			</Button>

			<AnimatePresence mode='wait'>
				{loading ? (
					<motion.div
						key='skeleton'
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className='w-full'
					>
						<MapDetailSkeleton />
					</motion.div>
				) : (
					<motion.div
						key='content'
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						className='flex flex-col space-y-8 w-full'
					>
						<section className='relative rounded-2xl overflow-hidden border border-border shadow-md bg-surface-bg w-full'>
							<div className='absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent z-10'></div>
							<img
								src={
									adventure.assetAbsolutePath ||
									adventure.background ||
									"/images/placeholder-bg.jpg"
								}
								alt={tDynamic(adventure, "adventureName")}
								className='w-full h-[250px] md:h-[350px] object-cover opacity-80'
							/>
							<div className='absolute bottom-0 left-0 w-full p-2 md:p-8 z-20 flex flex-col md:flex-row justify-between items-end gap-4'>
								<div>
									<div className='flex items-center gap-2 mb-2'>
										<span className='bg-primary-500/20 text-yellow-400 border font-bold px-3 py-1 rounded-full text-sm flex items-center gap-1'>
											{adventure.difficulty}{" "}
											<Star size={14} className='fill-current' />
										</span>
										<span className='bg-primary-500/20 text-white border border-primary-500/50 px-3 py-1 rounded-full text-sm font-semibold'>
											{tDynamic(adventure, "typeAdventure")}
										</span>
									</div>
									<h1 className='text-3xl md:text-5xl font-primary font-bold text-white uppercase tracking-wide'>
										{tDynamic(adventure, "adventureName")}
									</h1>
								</div>
								<div className='bg-emerald-500/20 border border-emerald-500/50 text-white px-4 py-2 rounded-lg flex flex-col items-center'>
									<span className='text-xs uppercase font-bold tracking-wider'>
										{tUI("adventureMap.championXp") || "Champion XP"}
									</span>
									<span className='text-xl font-black'>
										{adventure.championXP?.toLocaleString() || 0}
									</span>
								</div>
							</div>
						</section>

						{adventure.nodes && adventure.nodes.length > 0 && (
							<section className='bg-surface-bg border border-border rounded-xl p-2 md:p-4 shadow-sm w-full'>
								<div className='flex justify-between items-center border-b border-border pb-2'>
									<h2 className='text-xl font-bold text-pink-500 font-primary uppercase flex items-center gap-2'>
										<MapIcon size={20} />{" "}
										{tUI("adventureMap.adventureMapTitle") ||
											"Bản Đồ Phiêu Lưu"}
									</h2>
									<Button
										type='button'
										size='sm'
										variant='outline'
										onClick={() => setIsMapVisible(!isMapVisible)}
										iconLeft={
											isMapVisible ? <EyeOff size={16} /> : <Eye size={16} />
										}
									>
										{isMapVisible
											? tUI("common.hideMap") || "Ẩn bản đồ"
											: tUI("common.showMap") || "Hiện bản đồ"}
									</Button>
								</div>

								<AnimatePresence>
									{isMapVisible && (
										<motion.div
											initial={{ height: 0, opacity: 0 }}
											animate={{ height: "auto", opacity: 1 }}
											exit={{ height: 0, opacity: 0 }}
											className='overflow-hidden'
										>
											<div className='mt-4'>
												<AdventureMapVisualizer
													nodes={adventure.nodes}
													background={adventure.background}
													resolvedBosses={resolvedBosses}
												/>
											</div>
										</motion.div>
									)}
								</AnimatePresence>
							</section>
						)}

						{resolvedRules.length > 0 && (
							<section className='bg-surface-bg border border-border rounded-xl p-2 md:p-4 shadow-sm w-full'>
								<h2 className='text-xl font-bold text-primary-500 font-primary uppercase mb-4 flex items-center gap-2 border-b border-border pb-2'>
									<Swords size={20} />{" "}
									{tUI("adventureMap.specialRules") || "Luật Chơi Đặc Biệt"}
								</h2>
								<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
									{resolvedRules.map((power, idx) => (
										<ResolvedPowerCard key={idx} powerOrId={power} />
									))}
								</div>
							</section>
						)}

						{resolvedBosses.length > 0 && (
							<section className='bg-surface-bg border border-border rounded-xl p-2 md:p-4 shadow-sm w-full'>
								<h2 className='text-xl font-bold text-red-500 font-primary uppercase mb-4 flex items-center gap-2 border-b border-border pb-2'>
									<ShieldAlert size={20} />{" "}
									{tUI("adventureMap.bossList") || "Danh sách Boss"}
								</h2>
								<div className='grid grid-cols-1 gap-6'>
									{resolvedBosses.map((boss, idx) => {
										const originalBossData =
											adventure.Bosses?.find(b => b.bossID === boss.bossID) ||
											{};
										const mapBonusPower = originalBossData.mapBonusPower || [];
										const note = originalBossData.note || boss.note;

										const bossPowers = boss.resolvedPowers
											? boss.resolvedPowers
											: boss.resolvedPower
												? [boss.resolvedPower]
												: [];

										const combinedPowers = [...bossPowers, ...mapBonusPower];

										return (
											<div
												key={idx}
												className='flex flex-col sm:flex-row gap-4 bg-surface-hover/30 rounded-lg p-3 md:p-4 border border-border items-start shadow-sm'
											>
												<SafeImage
													src={boss.background || "/fallback-image.svg"}
													alt={tDynamic(boss, "bossName")}
													className='w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg shadow-sm border border-border bg-surface-bg shrink-0'
												/>
												<div className='flex-1 space-y-3 w-full'>
													<h3 className='text-lg font-bold text-text-primary'>
														{tDynamic(boss, "bossName")}
													</h3>

													{combinedPowers.length > 0 ? (
														<div className='grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2'>
															{combinedPowers.map((p, pIdx) => (
																<div key={pIdx} className='h-full'>
																	<ResolvedPowerCard powerOrId={p} />
																</div>
															))}
														</div>
													) : (
														<p className='text-sm text-text-secondary italic'>
															{tUI("adventureMap.noSpecialPower") ||
																"Không có sức mạnh đặc biệt."}
														</p>
													)}

													{note && (
														<div className='mt-3 p-3 bg-surface-bg rounded-md flex items-start gap-2.5 border border-border/50'>
															<div className='text-sm text-text-secondary leading-relaxed whitespace-pre-line'>
																<span className='font-bold text-primary-500 mt-1 uppercase text-xs tracking-wider'>
																	{tUI("adventureMap.note") || "Lưu ý:"}{" "}
																</span>
																<br />
																{note}
															</div>
														</div>
													)}
												</div>
											</div>
										);
									})}
								</div>
							</section>
						)}

						{(resolvedChampions.length > 0 ||
							adventure.requirement?.regions?.length > 0) && (
							<section className='bg-surface-bg border border-border rounded-xl p-2 md:p-4 shadow-sm w-full'>
								<h2 className='text-xl font-bold text-primary-500 font-primary uppercase mb-4 flex items-center gap-2 border-b border-border pb-2'>
									<Compass size={20} />{" "}
									{tUI("adventureMap.requirementTitle") ||
										"Tướng / Khu Vực Yêu Cầu"}
								</h2>
								<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
									{resolvedChampions.length > 0 && (
										<div>
											<h3 className='text-sm text-text-secondary mb-3 font-semibold'>
												{tUI("adventureMap.champReq") || "Tướng Yêu Cầu:"}
											</h3>
											<div className='flex flex-wrap gap-3'>
												{resolvedChampions.map((champ, i) => {
													const avatarUrl =
														champ.assets?.[0]?.avatar ||
														champ.assets?.[0]?.fullAbsolutePath ||
														champ.image ||
														"/fallback-image.svg";
													return (
														<Link
															key={i}
															to={`/champion/${champ.championID || champ.id || champ.name}`}
															title={tDynamic(champ, "name")}
															className='group flex flex-col items-center gap-1'
														>
															<div className='w-14 h-14 rounded-full border-2 border-border overflow-hidden group-hover:border-primary-500 transition-colors shadow-sm bg-surface-hover'>
																<SafeImage
																	src={avatarUrl}
																	alt={tDynamic(champ, "name")}
																	className='w-full h-full object-cover'
																/>
															</div>
															<span className='text-xs text-text-primary font-medium group-hover:text-primary-500 text-center max-w-[70px] truncate'>
																{tDynamic(champ, "name")}
															</span>
														</Link>
													);
												})}
											</div>
										</div>
									)}
									{adventure.requirement?.regions?.length > 0 && (
										<div>
											<h3 className='text-sm text-text-secondary mb-3 font-semibold'>
												{tUI("adventureMap.regionReq") || "Khu Vực Yêu Cầu:"}
											</h3>
											<div className='flex flex-wrap gap-3'>
												{adventure.requirement.regions.map((reg, i) => (
													<Link
														key={i}
														to={`/champions?regions=${encodeURIComponent(reg)}`}
														title={getTranslatedRegion(reg)}
														className='group flex flex-col items-center gap-1'
													>
														<div className='w-14 h-14 rounded-full border-2 border-border overflow-hidden bg-surface-hover group-hover:border-blue-500 transition-colors shadow-sm flex items-center justify-center p-2'>
															<img
																src={getRegionIcon(reg)}
																alt={reg}
																className='w-full h-full object-contain'
															/>
														</div>
														<span className='text-xs text-text-primary font-medium group-hover:text-blue-500 text-center'>
															{getTranslatedRegion(reg)}
														</span>
													</Link>
												))}
											</div>
										</div>
									)}
								</div>
							</section>
						)}

						{adventure.rewards && adventure.rewards.length > 0 && (
							<section className='w-full'>
								<h2 className='text-xl font-bold text-yellow-500 font-primary uppercase mb-2 flex items-center gap-2'>
									<Gift size={20} />{" "}
									{tUI("adventureMap.rewardMilestone") || "Mốc Thưởng"}
								</h2>
								<div className='bg-surface-bg rounded-lg overflow-hidden border border-border shadow-sm'>
									<div className='overflow-x-auto'>
										<table className='w-full text-left border-collapse min-w-[600px]'>
											<thead>
												<tr className='bg-surface-hover/50 text-text-secondary text-xs sm:text-sm border-b border-border'>
													<th className='py-3 px-3 sm:px-4 w-1/4 font-bold border-r border-border/50 uppercase tracking-wide'>
														{tUI("adventureMap.reward") || "Phần thưởng"}
													</th>
													<th className='py-3 px-3 sm:px-4 font-bold uppercase tracking-wide'>
														{tUI("adventureMap.rewardList") ||
															"Danh sách Phần Thưởng"}
													</th>
												</tr>
											</thead>
											<tbody className='divide-y divide-border'>
												{adventure.rewards.map((rewardPacket, idx) => (
													<tr
														key={idx}
														className='hover:bg-surface-hover/40 transition-colors'
													>
														<td className='py-3 px-3 sm:px-4 align-middle border-r border-border/50 text-xs sm:text-sm font-semibold text-text-primary'>
															{tUI("adventureMap.milestone") || "Mốc thưởng"}{" "}
															{idx + 1}
														</td>
														<td className='py-3 px-3 sm:px-4 align-middle'>
															<div className='flex flex-wrap gap-2 sm:gap-3'>
																{rewardPacket.items?.map((item, i) => (
																	<div
																		key={i}
																		className='flex items-center gap-2 bg-surface-bg px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-border/80 shadow-sm'
																	>
																		<SafeImage
																			src={getRewardIcon(item.name)}
																			alt={item.name}
																			className='w-5 h-5 sm:w-6 sm:h-6 object-contain shrink-0'
																		/>
																		<span className='text-xs sm:text-sm font-semibold text-text-primary whitespace-nowrap'>
																			{item.name}
																		</span>
																		<span className='text-[10px] sm:text-xs font-bold text-text-primary px-1.5 sm:px-2 py-0.5 rounded-full'>
																			x{item.count?.toLocaleString() || 1}
																		</span>
																	</div>
																))}
															</div>
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								</div>
							</section>
						)}

						<div className='mt-8 flex justify-center'>
							<GoogleAd slot='1234567890' format='horizontal' />
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

export default memo(AdventureMapDetail);
