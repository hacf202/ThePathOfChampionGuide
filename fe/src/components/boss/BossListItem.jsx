// src/components/boss/BossListItem.jsx
import React from "react";
import { Link } from "react-router-dom";
import SafeImage from "../common/SafeImage";
import MarkupRenderer from "../common/MarkupRenderer";
import { useTranslation } from "../../hooks/useTranslation";
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
			className='group relative flex items-center gap-3 sm:gap-4 bg-surface-bg p-2 sm:p-4 rounded-xl transition border border-border hover:border-primary-500 hover:shadow-lg active:scale-[0.98]'
		>
			{/* Avatar nhỏ bên trái */}
			<div className='w-14 h-14 sm:w-16 sm:h-16 shrink-0 relative overflow-hidden rounded-lg bg-surface-hover border border-border group-hover:border-primary-500/30 transition-colors'>
				<SafeImage
					src={bossImage}
					alt={bossName}
					className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110'
				/>
				<div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity' />
			</div>

			{/* Thông tin chính giữa */}
			<div className='flex-grow overflow-hidden'>
				<h3 className='font-bold text-lg text-text-primary group-hover:text-primary-500 truncate transition-colors font-primary uppercase tracking-tight'>
					{bossName}
				</h3>
				<div className='flex items-center gap-3 text-xs text-text-tertiary mt-1'>
					{powers.length > 0 && (
						<div className='flex items-center gap-1.5 px-2 py-0.5 bg-yellow-500/10 text-yellow-500 rounded-full border border-yellow-500/20'>
							<span className='font-bold'>{powers.length} {tUI("nav.powers") || "Powers"}</span>
						</div>
					)}
				</div>
			</div>

			{/* Nút mũi tên chỉ dẫn bên phải (nhẹ nhàng) */}
			<div className='text-text-tertiary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all pr-2'>
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
					<path d="M9 18l6-6-6-6" />
				</svg>
			</div>

			{/* --- TOOLTIP HIỂN THỊ SỨC MẠNH (POWERS) KHI HOVER --- */}
			{powers.length > 0 && (
				<div className='absolute left-1/2 -translate-x-1/2 bottom-full mb-4 w-80 p-5 bg-slate-950/95 backdrop-blur-xl border border-primary-500/30 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 invisible group-hover:visible pointer-events-none z-[100]'>
					<h4 className='text-primary-500 font-primary font-black uppercase text-sm mb-4 border-b border-border/20 pb-2 flex items-center gap-2'>
						<Sparkles size={16} /> {tUI("bossDetail.powers") || "Sức mạnh"}
					</h4>
					<div className='space-y-4 max-h-60 overflow-y-auto pr-1 custom-scrollbar'>
						{powers.map((p, idx) => (
							<div key={idx} className='space-y-1 group/p'>
								<div className='flex items-center gap-2'>
									{p.image && <SafeImage src={p.image} className='w-6 h-6 rounded' />}
									<span className='font-bold text-white text-xs uppercase text-yellow-500'>{tDynamic(p, "name") || p.name}</span>
								</div>
								<MarkupRenderer 
									text={tDynamic(p, "description") || tDynamic(p, "descriptionRaw") || ""} 
									className='text-[11px] text-slate-300 leading-relaxed pl-2 border-l-2 border-border group-hover/p:border-primary-500/50 transition-colors' 
								/>
							</div>
						))}
					</div>
					{/* Mũi tên tooltip */}
					<div className='absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-slate-950/95'></div>
				</div>
			)}
		</Link>
	);
};

export default BossListItem;
