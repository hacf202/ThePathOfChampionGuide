import React, { useRef, useState } from "react";
import { createPortal } from "react-dom";

const ConstellationNode = ({ power, index, active, onShowTooltip }) => {
	const nodeRef = useRef(null);
	const leftPos =
		typeof power.pos.x === "number" ? `${power.pos.x}%` : power.pos.x;
	const topPos =
		typeof power.pos.y === "number" ? `${power.pos.y}%` : power.pos.y;

	const handleMouseEnter = () => {
		if (nodeRef.current) {
			const rect = nodeRef.current.getBoundingClientRect();
			onShowTooltip(power, { x: rect.left + rect.width / 2, y: rect.top - 10 });
		}
	};

	const renderNodeContent = () => {
		const isBonusNode =
			power.nodeType === "bonusStar" || power.nodeType === "bonusStarGem";
		const sizeClasses = isBonusNode
			? "w-[25px] h-[25px] sm:w-[55px] sm:h-[55px]"
			: "w-[23px] h-[23px] sm:w-[47px] sm:h-[47px]";

		return (
			<img
				src={power.image || "/images/placeholder.png"}
				alt={power.name}
				className={`${sizeClasses} object-contain p-0.5 transition-all`}
			/>
		);
	};

	return (
		<div
			ref={nodeRef}
			className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 z-10 ${active ? "z-50 scale-125" : "hover:scale-110"}`}
			style={{ left: leftPos, top: topPos }}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={() => onShowTooltip(null, null)}
		>
			<div className='relative flex items-center justify-center'>
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
	);
};

const ConstellationLine = ({ x1, y1, x2, y2, isRecommended }) => {
	const angle = Math.atan2(y2 - y1, x2 - x1);
	const offset = window.innerWidth < 640 ? 1.5 : 3.5;
	const finalX2 = x2 - offset * Math.cos(angle);
	const finalY2 = y2 - offset * Math.sin(angle);

	return (
		<line
			x1={`${x1}%`}
			y1={`${y1}%`}
			x2={`${finalX2}%`}
			y2={`${finalY2}%`}
			stroke={
				isRecommended ? "rgba(234, 179, 8, 1)" : "rgba(234, 179, 8, 0.25)"
			}
			strokeWidth={isRecommended ? "2.5" : "1.5"}
			strokeDasharray={isRecommended ? "0" : "8,4"}
			markerEnd={`url(#${isRecommended ? "arrowhead-recommended" : "arrowhead"})`}
			className={isRecommended ? "drop-shadow-[0_0_8px_rgba(234,179,8,1)]" : ""}
		/>
	);
};

export default function ConstellationMap({ constellationInfo }) {
	const [hoveredNode, setHoveredNode] = useState(null);
	const [tooltipCoords, setTooltipCoords] = useState(null);

	if (!constellationInfo || constellationInfo.nodes.length === 0) return null;

	return (
		<div className='p-1 relative w-full aspect-video bg-black border rounded-lg overflow-hidden shadow-2xl'>
			<img
				src={constellationInfo.backgroundImage}
				className='absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none'
				alt='bg'
			/>
			<svg className='absolute inset-0 w-full h-full pointer-events-none'>
				<defs>
					<marker
						id='arrowhead'
						markerWidth={window.innerWidth < 640 ? "3" : "6"}
						markerHeight={window.innerWidth < 640 ? "2" : "5"}
						refX={window.innerWidth < 640 ? "2.8" : "5.8"}
						refY={window.innerWidth < 640 ? "1" : "2.5"}
						orient='auto'
					>
						<path
							d={
								window.innerWidth < 640
									? "M0,0 L3,1 L0,2 Z"
									: "M0,0 L6,2.5 L0,5 Z"
							}
							fill='rgba(234, 179, 8, 0.6)'
						/>
					</marker>
					<marker
						id='arrowhead-recommended'
						markerWidth={window.innerWidth < 640 ? "3" : "6"}
						markerHeight={window.innerWidth < 640 ? "2" : "5"}
						refX={window.innerWidth < 640 ? "2.8" : "5.8"}
						refY={window.innerWidth < 640 ? "1" : "2.5"}
						orient='auto'
					>
						<path
							d={
								window.innerWidth < 640
									? "M0,0 L3,1 L0,2 Z"
									: "M0,0 L6,2.5 L0,5 Z"
							}
							fill='rgba(234, 179, 8, 1)'
						/>
					</marker>
				</defs>
				{constellationInfo.nodes.map(node =>
					node.nextNodes.map(tID => {
						const target = constellationInfo.nodes.find(n => n.nodeID === tID);
						return (
							target && (
								<ConstellationLine
									key={`${node.nodeID}-${tID}`}
									x1={node.pos.x}
									y1={node.pos.y}
									x2={target.pos.x}
									y2={target.pos.y}
									isRecommended={node.isRecommended && target.isRecommended}
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
					active={hoveredNode?.nodeID === node.nodeID}
					onShowTooltip={(n, c) => {
						setHoveredNode(n);
						setTooltipCoords(c);
					}}
				/>
			))}
			{hoveredNode &&
				tooltipCoords &&
				createPortal(
					<div
						className='fixed bg-surface-bg border border-primary-500 rounded-lg shadow-2xl p-3 z-[9999] pointer-events-none'
						style={{
							left: `${tooltipCoords.x}px`,
							top: `${tooltipCoords.y}px`,
							transform: "translate(-50%, -100%)",
							maxWidth: "280px",
						}}
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
						<div className='absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-primary-500' />
					</div>,
					document.body,
				)}
		</div>
	);
}
