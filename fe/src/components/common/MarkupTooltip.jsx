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
	FloatingPortal,
} from "@floating-ui/react";
import { getRarityKey } from "../../utils/i18nHelpers";

/**
 * MarkupTooltip - Phiên bản cao cấp dành cho Administrator và Người dùng
 * Hỗ trợ Glassmorphism và màu sắc theo độ hiếm
 */
const MarkupTooltip = ({ 
	title, 
	description, 
	text, 
	icon, 
	fullImage, 
	options = [], 
	rarity, 
	type, 
	href, 
	compact = false,
	children 
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const navigate = useNavigate();

	const displayDescription = description || text;
	const showFullImg = options.includes("img-full");
	const showIconImg = options.includes("img-icon");
    const isSpecialType = ["c", "champion", "card", "cd"].includes(type?.toLowerCase());

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
		enabled: true 
	});
	const click = useClick(context);
	const dismiss = useDismiss(context);
	const role = useRole(context, { role: "tooltip" });

	const { getReferenceProps, getFloatingProps } = useInteractions([hover, click, dismiss, role]);

	const theme = useMemo(() => {
		const key = getRarityKey(rarity);
		const config = {
			common: { color: "text-slate-300", border: "border-slate-500/50", glow: "shadow-slate-500/10", label: "THÔNG THƯỜNG", bg: "from-slate-900/40" },
			rare: { color: "text-blue-400", border: "border-blue-500/50", glow: "shadow-blue-500/20", label: "HIẾM", bg: "from-blue-900/40" },
			epic: { color: "text-purple-400", border: "border-purple-500/50", glow: "shadow-purple-500/20", label: "SỨ THI", bg: "from-purple-900/40" },
			legendary: { color: "text-yellow-400", border: "border-yellow-500/50", glow: "shadow-yellow-500/20", label: "HUYỀN THOẠI", bg: "from-yellow-900/40" },
			special: { color: "text-pink-400", border: "border-pink-500/50", glow: "shadow-pink-500/20", label: "ĐẶC BIỆT", bg: "from-pink-900/40" },
			unknown: { color: "text-slate-400", border: "border-slate-500/30", glow: "shadow-slate-500/10", label: "CƠ BẢN", bg: "from-slate-900/40" }
		};
		return config[key] || config.unknown;
	}, [rarity]);

	const typeLabel = useMemo(() => {
		const types = {
			k: "TỪ KHÓA", c: "TƯỚNG", r: "CỔ VẬT", p: "SỨC MẠNH", i: "VẬT PHẨM", cd: "THẺ BÀI", cap: "CẤP SAO",
			keyword: "TỪ KHÓA", champion: "TƯỚNG", relic: "CỔ VẬT", power: "SỨC MẠNH", item: "VẬT PHẨM", card: "THẺ BÀI", star: "CẤP SAO"
		};
		return types[type?.toLowerCase()] || "THÔNG TIN";
	}, [type]);

	return (
		<>
			<span
				ref={refs.setReference}
				{...getReferenceProps()}
				className="inline-flex items-baseline"
			>
				{children}
			</span>

			{isOpen && (
				<FloatingPortal>
					<div
						ref={refs.setFloating}
						style={{ ...floatingStyles, zIndex: 9999 }}
						{...getFloatingProps()}
						className='pointer-events-auto'
					>
						<div className={`bg-slate-950/95 backdrop-blur-xl text-white rounded-xl shadow-2xl border-2 ${theme.border} ${theme.glow} overflow-hidden 
							${isSpecialType ? 'w-[280px] sm:w-[320px]' : compact ? 'max-w-[260px]' : 'max-w-[320px] min-w-[200px]'} 
							animate-in fade-in zoom-in-95 duration-200`}
						>
                            {/* Header với Background Gradient */}
                            <div className={`px-3 py-1.5 flex justify-between items-center bg-gradient-to-r ${theme.bg} to-transparent border-b ${theme.border}`}>
                                <span className="text-[9px] font-black tracking-[0.2em] text-white/50">{typeLabel}</span>
                                <span className={`text-[9px] font-black tracking-[0.1em] ${theme.color}`}>{theme.label}</span>
                            </div>

                            {/* Ảnh hiển thị (Nếu có) */}
                            {(showFullImg || isSpecialType) && fullImage && (
                                <div className="w-full h-32 sm:h-40 bg-black/40 flex justify-center items-center p-2">
                                    <img src={fullImage} alt="" className="h-full w-auto object-contain drop-shadow-xl" />
                                </div>
                            )}

                            <div className="p-4">
                                <div className="flex items-center gap-3 mb-3">
                                    {icon && !showFullImg && (
                                        <div className={`w-10 h-10 p-1.5 rounded-lg bg-white/5 border ${theme.border} flex-shrink-0`}>
                                            <img src={icon} alt="" className="w-full h-full object-contain" />
                                        </div>
                                    )}
                                    <div className={`font-black text-lg leading-tight ${theme.color} tracking-tight`}>
                                        {title}
                                    </div>
                                </div>

                                <div className="text-slate-200 text-[13px] leading-relaxed whitespace-pre-wrap font-medium">
                                    {displayDescription || "Không có mô tả chi tiết."}
                                </div>

                                {href && (
                                    <div className="mt-4 pt-3 border-t border-white/10">
                                        <button 
                                            onClick={() => navigate(href)}
                                            className={`w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 border ${theme.border} text-[10px] font-black tracking-widest uppercase transition-all`}
                                        >
                                            Xem chi tiết
                                        </button>
                                    </div>
                                )}
                            </div>
						</div>
					</div>
				</FloatingPortal>
			)}
		</>
	);
};

export default MarkupTooltip;
