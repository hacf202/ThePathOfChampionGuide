// src/components/champion/constellationMap.jsx
import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { RenderRequirements } from "./requirementIcon";
import { useTranslation } from "../../hooks/useTranslation";
import { ZoomIn, ZoomOut, RefreshCcw } from "lucide-react";

const ConstellationNode = ({
	power,
	index,
	active,
	onShowTooltip,
	isDragging,
	zoom,
}) => {
	const nodeRef = useRef(null);

	const leftPos =
		typeof power.pos?.x === "number" ? `${power.pos.x}%` : power.pos?.x || "0%";
	const topPos =
		typeof power.pos?.y === "number" ? `${power.pos.y}%` : power.pos?.y || "0%";

	const inverseScale = 1 / Math.pow(zoom, 0.75);

	const handleInteraction = e => {
		if (e) e.stopPropagation();
		if (nodeRef.current && !isDragging) {
			const rect = nodeRef.current.getBoundingClientRect();
			onShowTooltip(power, { x: rect.left + rect.width / 2, y: rect.top - 10 });
		}
	};

	const handleMouseLeave = () => {
		if (active) {
			onShowTooltip(null, null);
		}
	};

	const renderNodeContent = () => {
		const sizeClasses = "w-[31px] h-[31px] sm:w-[47px] sm:h-[47px]";

		return (
			<img
				src={power.image || "/images/placeholder.png"}
				alt={power.name || "Constellation Node"}
				className={`${sizeClasses} object-contain p-0.5 transition-all pointer-events-none`}
			/>
		);
	};

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
				onClick={handleInteraction}
			>
				<div
					className={`relative flex items-center justify-center transition-transform duration-300 ${active ? "scale-125" : "hover:scale-110"}`}
				>
					<div
						className={`absolute inset-0 rounded-full blur-2xl transition-opacity duration-500 ${power.isRecommended || active ? "opacity-80 bg-yellow-400 animate-pulse" : "opacity-0"}`}
					/>
					<div className='relative flex items-center justify-center'>
						{renderNodeContent()}
						{power.nodeType === "starPower" && (
							<div
								className={`absolute -bottom-1 -right-1 text-black text-[6px] sm:text-[8px] font-black px-1 rounded-sm border border-black shadow-sm ${power.isRecommended ? "bg-yellow-400" : "bg-yellow-500"}`}
							>
								{index + 1}★
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

const ConstellationLine = ({ x1, y1, x2, y2, isRecommended, zoom }) => {
	const angle = Math.atan2(y2 - y1, x2 - x1);

	const isMobile = typeof window !== "undefined" && window.innerWidth < 640;

	const baseOffset = isMobile ? 2.2 : 3.8;
	const offset = baseOffset / Math.pow(zoom, 0.75);

	const finalX2 = x2 - offset * Math.cos(angle);
	const finalY2 = y2 - offset * Math.sin(angle);

	const strokeW = isMobile
		? isRecommended
			? "1.5"
			: "1"
		: isRecommended
			? "2.5"
			: "1.5";

	return (
		<line
			x1={`${x1}%`}
			y1={`${y1}%`}
			x2={`${finalX2}%`}
			y2={`${finalY2}%`}
			stroke={
				isRecommended ? "rgba(234, 179, 8, 1)" : "rgba(234, 179, 8, 0.25)"
			}
			strokeWidth={strokeW}
			strokeDasharray={isRecommended ? "0" : "8,4"}
			markerEnd={`url(#${isRecommended ? "arrowhead-recommended" : "arrowhead"})`}
			className={isRecommended ? "drop-shadow-[0_0_8px_rgba(234,179,8,1)]" : ""}
		/>
	);
};

export default function ConstellationMap({ constellationInfo }) {
	const { tUI } = useTranslation();
	const [hoveredNode, setHoveredNode] = useState(null);
	const [tooltipCoords, setTooltipCoords] = useState(null);

	const [zoom, setZoom] = useState(1);
	const [pan, setPan] = useState({ x: 0, y: 0 });

	const [isPointerDown, setIsPointerDown] = useState(false);
	const [isDragging, setIsDragging] = useState(false);
	const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
	const dragTimeout = useRef(null);

	const [isMobile, setIsMobile] = useState(
		typeof window !== "undefined" ? window.innerWidth < 640 : false,
	);

	useEffect(() => {
		const handleResize = () => setIsMobile(window.innerWidth < 640);
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	if (
		!constellationInfo ||
		!constellationInfo.nodes ||
		constellationInfo.nodes.length === 0
	)
		return null;

	const handlePointerDown = (clientX, clientY) => {
		setIsPointerDown(true);
		setIsDragging(false);
		setDragStart({ x: clientX - pan.x, y: clientY - pan.y });
	};

	const handlePointerMove = (clientX, clientY) => {
		if (!isPointerDown) return;
		setIsDragging(true);
		setPan({
			x: clientX - dragStart.x,
			y: clientY - dragStart.y,
		});
		setHoveredNode(null);
	};

	const handlePointerUp = () => {
		setIsPointerDown(false);
		if (dragTimeout.current) clearTimeout(dragTimeout.current);
		dragTimeout.current = setTimeout(() => setIsDragging(false), 50);
	};

	const handleMouseDown = e => handlePointerDown(e.clientX, e.clientY);
	const handleMouseMove = e => handlePointerMove(e.clientX, e.clientY);
	const handleMouseUp = () => handlePointerUp();

	const handleTouchStart = e => {
		if (e.touches.length === 1) {
			handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
		}
	};
	const handleTouchMove = e => {
		if (e.touches.length === 1) {
			handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
		}
	};
	const handleTouchEnd = () => handlePointerUp();

	const handleZoomIn = () => setZoom(z => Math.min(z + 0.5, 3));
	const handleZoomOut = () => setZoom(z => Math.max(z - 0.5, 0.5));
	const handleReset = () => {
		setZoom(1);
		setPan({ x: 0, y: 0 });
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
			arrowStyle = {
				left: `${arrowX}px`,
				transform: "translateX(-50%)",
			};
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
				maxWidth: "280px",
			};
			arrowStyle = {
				left: arrowLeft,
				transform: "translateX(-50%)",
			};
		}
	}

	return (
		<div
			className={`relative w-full aspect-video bg-surface-bg border border-border rounded-lg overflow-hidden shadow-2xl group select-none touch-none ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
			onMouseDown={handleMouseDown}
			onMouseMove={handleMouseMove}
			onMouseUp={handleMouseUp}
			onMouseLeave={handleMouseUp}
			onTouchStart={handleTouchStart}
			onTouchMove={handleTouchMove}
			onTouchEnd={handleTouchEnd}
			onClick={() => setHoveredNode(null)}
		>
			{/* ĐÃ CẬP NHẬT: Giao diện nút Zoom được thu gọn trên Mobile */}
			{/* Đổi bottom-4 right-4 thành bottom-2 right-2 sm:bottom-4 sm:right-4 */}
			{/* Đổi gap-2 thành gap-1 sm:gap-2, p-1.5 thành p-1 sm:p-1.5 */}
			<div
				className='absolute bottom-2 right-2 sm:bottom-4 sm:right-4 z-50 flex flex-col gap-1 sm:gap-2 bg-surface-bg/90 backdrop-blur-md p-1 sm:p-1.5 rounded-xl border border-border shadow-xl'
				onMouseDown={e => e.stopPropagation()}
				onTouchStart={e => e.stopPropagation()}
				onClick={e => e.stopPropagation()}
			>
				<button
					onClick={handleZoomIn}
					title='Phóng to'
					className='p-1.5 sm:p-2 text-text-primary bg-surface-hover hover:bg-primary-500 hover:text-white rounded-lg transition-all duration-200 shadow-sm'
				>
					{/* Giảm kích thước Icon trên Mobile */}
					<ZoomIn size={isMobile ? 18 : 22} />
				</button>
				<button
					onClick={handleReset}
					title='Đặt lại'
					className='p-1.5 sm:p-2 text-text-primary bg-surface-hover hover:bg-primary-500 hover:text-white rounded-lg transition-all duration-200 shadow-sm'
				>
					<RefreshCcw size={isMobile ? 16 : 20} />
				</button>
				<button
					onClick={handleZoomOut}
					title='Thu nhỏ'
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
				<img
					src={constellationInfo.backgroundImage}
					className='absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none'
					alt='Constellation Background'
					draggable='false'
				/>

				<svg className='absolute inset-0 w-full h-full pointer-events-none'>
					<defs>
						<marker
							id='arrowhead'
							markerWidth={isMobile ? "5" : "8"}
							markerHeight={isMobile ? "4" : "7"}
							refX={isMobile ? "4.5" : "7.5"}
							refY={isMobile ? "2" : "3.5"}
							orient='auto'
						>
							<path
								d={
									isMobile
										? "M0,0 L5,2 L0,4 L1.5,2 Z"
										: "M0,0 L8,3.5 L0,7 L2,3.5 Z"
								}
								fill='rgba(234, 179, 8, 0.6)'
							/>
						</marker>
						<marker
							id='arrowhead-recommended'
							markerWidth={isMobile ? "5" : "8"}
							markerHeight={isMobile ? "4" : "7"}
							refX={isMobile ? "4.5" : "7.5"}
							refY={isMobile ? "2" : "3.5"}
							orient='auto'
						>
							<path
								d={
									isMobile
										? "M0,0 L5,2 L0,4 L1.5,2 Z"
										: "M0,0 L8,3.5 L0,7 L2,3.5 Z"
								}
								fill='rgba(234, 179, 8, 1)'
							/>
						</marker>
					</defs>
					{constellationInfo.nodes.map(node =>
						node.nextNodes.map(tID => {
							const target = constellationInfo.nodes.find(
								n => n.nodeID === tID,
							);
							return (
								target && (
									<ConstellationLine
										key={`${node.nodeID}-${tID}`}
										x1={node.pos.x}
										y1={node.pos.y}
										x2={target.pos.x}
										y2={target.pos.y}
										isRecommended={node.isRecommended && target.isRecommended}
										zoom={zoom}
									/>
								)
							);
						}),
					)}
				</svg>

				{constellationInfo.nodes.map((node, index) => (
					<ConstellationNode
						key={node.nodeID || index}
						index={index}
						power={node}
						isDragging={isDragging}
						zoom={zoom}
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
					<div
						className='fixed bg-surface-bg border border-primary-500 rounded-lg shadow-2xl p-3 z-[9999] pointer-events-none'
						style={tooltipStyle}
					>
						<h3 className='text-primary-500 font-bold text-sm uppercase mb-1'>
							{hoveredNode.name}
						</h3>
						<div
							className='text-text-secondary text-xs leading-relaxed'
							dangerouslySetInnerHTML={{
								__html: hoveredNode.description,
							}}
						/>

						<div
							className='absolute top-full border-8 border-transparent border-t-primary-500'
							style={arrowStyle}
						/>
					</div>,
					document.body,
				)}
		</div>
	);
}
