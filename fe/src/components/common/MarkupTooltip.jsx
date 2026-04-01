import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
	useFloating,
	autoUpdate,
	offset,
	flip,
	shift,
	useHover,
	useRole,
	useClick,
	useDismiss,
	useInteractions,
} from "@floating-ui/react";
import { getRarityKey } from "../../utils/i18nHelpers";

/**
 * MarkupTooltip - Premium version with Rarity support and Glassmorphism
 */
const MarkupTooltip = ({ title, description, icon, fullImage, options = [], rarity, type, href, children }) => {
	const [isOpen, setIsOpen] = useState(false);
	const navigate = useNavigate();

	const showFullImg = options.includes("img-full");
	const showIconImg = options.includes("img-icon");

	const { refs, floatingStyles, context } = useFloating({
		open: isOpen,
		onOpenChange: setIsOpen,
		placement: "top",
		whileElementsMounted: autoUpdate,
		middleware: [
			offset(12),
			flip(),
			shift({ padding: 10 }),
		],
	});

	const hover = useHover(context, { 
		delay: 150,
		move: false,
		enabled: true // Always enabled, but mobile "hover" usually triggers on tap
	});
	const click = useClick(context);
	const dismiss = useDismiss(context);
	const role = useRole(context, { role: "tooltip" });

	const { getReferenceProps, getFloatingProps } = useInteractions([hover, click, dismiss, role]);

	// Rarity Styling
	const theme = useMemo(() => {
		const key = getRarityKey(rarity);
		const config = {
			common: { color: "text-slate-300", border: "border-slate-500/50", glow: "shadow-slate-500/10", label: "THÔNG THƯỜNG" },
			rare: { color: "text-blue-400", border: "border-blue-500/50", glow: "shadow-blue-500/20", label: "HIẾM" },
			epic: { color: "text-purple-400", border: "border-purple-500/50", glow: "shadow-purple-500/20", label: "SỨ THI" },
			legendary: { color: "text-yellow-400", border: "border-yellow-500/50", glow: "shadow-yellow-500/20", label: "HUYỀN THOẠI" },
			special: { color: "text-pink-400", border: "border-pink-500/50", glow: "shadow-pink-500/20", label: "ĐẶC BIỆT" },
			unknown: { color: "text-gray-400", border: "border-gray-500/30", glow: "shadow-gray-500/10", label: "" }
		};
		return config[key] || config.unknown;
	}, [rarity]);

	const typeLabel = useMemo(() => {
		const types = {
			k: "TỪ KHÓA",
			c: "TƯỚNG",
			r: "CỔ VẬT",
			p: "SỨC MẠNH",
			i: "VẬT PHẨM",
			cd: "BÀI QUÂN",
			keyword: "TỪ KHÓA",
			champion: "TƯỚNG",
			relic: "CỔ VẬT",
			power: "SỨC MẠNH",
			item: "VẬT PHẨM",
			card: "BÀI QUÂN"
		};
		return types[type?.toLowerCase()] || "THÔNG TIN";
	}, [type]);

	const handleReferenceClick = (e) => {
		// On Desktop (non-touch), secondary click navigates
		const isTouch = window.matchMedia("(pointer: coarse)").matches;
		if (!isTouch && href) {
			navigate(href);
		}
	};

	return (
		<>
			<span
				ref={refs.setReference}
				{...getReferenceProps({
					onClick: handleReferenceClick
				})}
				className='inline-flex items-baseline pointer-events-auto'
			>
				{children}
			</span>

			{isOpen && (
				<div
					ref={refs.setFloating}
					style={{
						...floatingStyles,
						zIndex: 9999,
					}}
					{...getFloatingProps()}
					className='pointer-events-auto cursor-default'
				>
					<div className={`bg-slate-950/90 backdrop-blur-xl text-white rounded-xl shadow-2xl border-2 ${theme.border} ${theme.glow} overflow-hidden max-w-[320px] min-w-[220px] animate-in fade-in zoom-in-95 duration-200`}>
						
						{/* Top Badge: Type | Rarity */}
						<div className={`px-3 py-1.5 flex justify-between items-center bg-white/5 border-b ${theme.border}`}>
							<span className="text-[9px] font-black tracking-[0.2em] text-white/50 uppercase">
								{typeLabel}
							</span>
							<span className={`text-[9px] font-black tracking-[0.1em] ${theme.color} uppercase`}>
								{theme.label}
							</span>
						</div>

						{/* Images */}
						{showFullImg && fullImage && (
							<div className="w-full px-4 py-4 flex justify-center bg-white/5 border-b border-white/5 overflow-hidden">
								<img 
									src={fullImage} 
									alt={title} 
									className="w-auto h-20 sm:h-28 object-contain drop-shadow-2xl" 
								/>
							</div>
						)}
						{showIconImg && icon && !showFullImg && (
							<div className="w-full p-6 flex justify-center bg-white/5 border-b border-white/5">
								<img src={icon} alt={title} className="w-20 h-20 object-contain drop-shadow-lg" />
							</div>
						)}

						<div className="p-4">
							{/* Title with Icon */}
							<div className='flex items-center gap-3 mb-3'>
								{icon && !showIconImg && !showFullImg && (
									<div className={`w-8 h-8 rounded-lg bg-white/5 border ${theme.border} flex items-center justify-center p-1.5`}>
										<img src={icon} alt="" className="w-full h-full object-contain" />
									</div>
								)}
								<div className={`font-bold text-lg sm:text-xl tracking-tight leading-tight ${theme.color}`}>
									{title}
								</div>
							</div>
							
							{/* Description */}
							<div className='text-slate-200 leading-relaxed text-[13px] sm:text-[14px] whitespace-pre-wrap break-words font-medium'>
								{description || "Không có mô tả chi tiết."}
							</div>

							{/* Footer Actions */}
							<div className="mt-4 pt-3 border-t border-white/5 flex flex-col gap-2">
								{href && (
									<button 
										onClick={() => navigate(href)}
										className={`w-full py-2 px-4 rounded-lg bg-white/10 hover:bg-white/20 border ${theme.border} text-[11px] font-bold tracking-widest uppercase transition-all active:scale-95 text-center`}
									>
										Xem chi tiết
									</button>
								)}
								<div className="flex justify-between items-center opacity-30 px-1">
									<span className="text-[9px] italic">The Path of Champions</span>
									<span className="text-[9px]">POC GUIDE</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default MarkupTooltip;
