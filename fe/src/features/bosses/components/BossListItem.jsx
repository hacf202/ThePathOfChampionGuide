// src/components/boss/BossListItem.jsx
import React from "react";
import { Link } from "react-router-dom";
import SafeImage from "@/components/common/SafeImage";
import MarkupRenderer from "@/components/common/MarkupRenderer";
import { useTranslation } from "@/hooks/useTranslation";
import { Swords, Sparkles } from "lucide-react";

/**
 * BossListItem - Hiển thị Boss dưới dạng hàng ngang (List phong cách Item List)
 * Có Tooltip hiển thị các Sức mạnh (Powers) khi hover.
 */
const BossListItem = ({ boss }) => {
	const { tDynamic, tUI } = useTranslation();

	const bossName = tDynamic(boss, "bossName") || boss.bossName;
	const bossImage = boss.image || boss.background || "/fallback-image.svg";
	const powers = boss.resolvedPowers || (boss.resolvedPower ? [boss.resolvedPower] : []);

	return (
		<Link
			to={`/boss/${encodeURIComponent(boss.bossID)}`}
			className='group relative flex items-center gap-3.5 p-3 sm:p-3.5 tactical-card clip-chamfer-sm border border-[var(--tactical-card-border)] hover:border-rose-500 transition-all duration-300 shadow-sm hover:shadow-[0_0_20px_rgba(244,63,94,0.2)] hover:-translate-y-0.5'
		>
			{/* Avatar nhỏ bên trái */}
			<div className='w-14 h-14 sm:w-16 sm:h-16 shrink-0 relative overflow-hidden clip-chamfer-sm bg-black/40 border border-[var(--tactical-card-border)] group-hover:border-rose-500 transition-colors'>
				<SafeImage
					src={bossImage}
					alt={bossName}
					className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110'
				/>
				<div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity' />
			</div>

			{/* Thông tin chính giữa */}
			<div className='flex-grow overflow-hidden'>
				<h3 className='font-display font-bold text-base sm:text-lg uppercase italic tracking-wide text-[var(--tactical-text-main)] group-hover:text-rose-400 truncate transition-colors'>
					{bossName}
				</h3>
				<div className='flex items-center gap-3 text-xs font-mono-tech text-[var(--tactical-text-dim)] mt-1'>
					{powers.length > 0 && (
						<div className='flex items-center gap-1.5 px-2 py-0.5 bg-rose-500/10 text-rose-400 clip-chamfer-sm border border-rose-500/30 uppercase font-bold text-[11px]'>
							<span>{powers.length} {tUI("nav.powers") || "Powers"}</span>
						</div>
					)}
				</div>
			</div>

			{/* Nút mũi tên chỉ dẫn bên phải (nhẹ nhàng) */}
			<div className='text-[var(--tactical-text-dim)] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:text-rose-400 transition-all pr-2'>
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
					<path d="M9 18l6-6-6-6" />
				</svg>
			</div>

			{/* --- TOOLTIP HIỂN THỊ SỨC MẠNH (POWERS) KHI HOVER --- */}
			{powers.length > 0 && (
				<div className='absolute left-1/2 -translate-x-1/2 bottom-full mb-4 w-80 p-5 bg-slate-950/95 backdrop-blur-xl border border-rose-500/40 clip-chamfer-sm shadow-[0_20px_50px_rgba(0,0,0,0.5)] opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 invisible group-hover:visible pointer-events-none z-[100]'>
					<h4 className='text-rose-400 font-display font-black uppercase italic tracking-wide text-sm mb-4 border-b border-[var(--tactical-stroke-color)] pb-2 flex items-center gap-2'>
						<Sparkles size={16} /> {tUI("bossDetail.powers") || "Sức mạnh"}
					</h4>
					<div className='space-y-4 max-h-60 overflow-y-auto pr-1-scrollbar'>
						{powers.map((p, idx) => (
							<div key={idx} className='space-y-1 group/p'>
								<div className='flex items-center gap-2'>
									{p.image && <SafeImage src={p.image} className='w-6 h-6 clip-chamfer-sm' />}
									<span className='font-display font-bold uppercase italic text-xs text-amber-400'>{tDynamic(p, "name") || p.name}</span>
								</div>
								<MarkupRenderer 
									text={tDynamic(p, "description") || tDynamic(p, "descriptionRaw") || ""} 
									className='text-[11px] font-primary text-slate-300 leading-relaxed pl-2 border-l-2 border-[var(--tactical-card-border)] group-hover/p:border-rose-500/50 transition-colors' 
								/>
							</div>
						))}
					</div>
				</div>
			)}
		</Link>
	);
};

export default BossListItem;
