// src/components/Footer.jsx
import React, { memo } from "react";
import { Link } from "react-router-dom";
import { Youtube, Facebook, ChevronRight, Radio } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

function Footer() {
	const { tUI } = useTranslation();

	return (
		<footer className='relative overflow-hidden tactical-section bg-halftone bg-hazard-stripes pt-12 pb-8 border-t border-[var(--tactical-section-border)] text-[var(--tactical-text-sub)]'>
			{/* Giant Background Hollow Stroke Text */}
			<div className="absolute -top-6 left-0 right-0 pointer-events-none select-none overflow-hidden opacity-40">
				<div className="font-display text-[7rem] sm:text-[11rem] leading-none uppercase italic stroke-giant tracking-tighter whitespace-nowrap">
					RUNETERRA // POC ARCHIVE
				</div>
			</div>

			<div className='relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='grid grid-cols-1 md:grid-cols-12 gap-8 mb-10'>
					{/* === CỘT 1: Logo & Mô tả === */}
					<div className='md:col-span-3'>
						<a href='/' className='inline-flex items-center gap-2.5 mb-4 group'>
							<img 
								src="/favicon.ico" 
								alt="PoC Guide Logo" 
								className="h-9 w-9 object-contain group-hover:scale-110 transition-transform duration-300"
							/>
							<div className="bg-[#D2FF28] text-black font-display text-xl sm:text-2xl px-2.5 py-0.5 italic transform -skew-x-12 group-hover:bg-white transition font-black tracking-wide">
								POC GUIDE
							</div>
						</a>

						<div className="p-3.5 bg-[var(--tactical-card-bg)] border border-[var(--tactical-section-border)] clip-chamfer-sm space-y-2">
							<p className='text-xs leading-relaxed text-[var(--tactical-text-sub)] font-primary'>
								<b className='font-bold text-[var(--tactical-text-main)]'>POC GUIDE (Path of champions)</b>
								{tUI("footer.desc1") ||
									" là kho tài nguyên độc lập do cộng đồng người chơi chia sẻ."}
							</p>
							<p className='text-[11px] leading-relaxed text-[var(--tactical-text-dim)] font-primary'>
								<i className='italic text-[var(--tactical-accent-cyan-fg)]'>Path of champions</i>
								{tUI("footer.desc2") ||
									" hay Con Đường Anh Hùng là chế độ chơi PVE của Huyền Thoại Runeterra do Riot phát triển. Tất cả nội dung build, hướng dẫn, hình ảnh đều được tạo ra bởi fan và dành cho fan."}
							</p>
						</div>
					</div>

					{/* === CỘT 2: Hướng dẫn === */}
					<div className='md:col-span-2'>
						<h3 className='font-display uppercase italic tracking-wider text-sm font-bold text-[var(--tactical-text-main)] border-l-2 border-[var(--tactical-accent-lime-fg)] pl-2.5 mb-4'>
							{tUI("footer.guidesTitle") || "Hướng dẫn"}
						</h3>
						<ul className='space-y-2.5 text-xs font-mono-tech uppercase font-bold'>
							<li>
								<a
									href='/champions'
									className='text-[var(--tactical-text-sub)] hover:text-[var(--tactical-accent-lime-fg)] transition-colors flex items-center gap-1.5 group'
								>
									<span className="text-[var(--tactical-accent-lime-fg)] opacity-60 group-hover:opacity-100">//</span>
									<span>{tUI("footer.championsList") || "Danh Sách Tướng"}</span>
								</a>
							</li>
							<li>
								<a
									href='/guides'
									className='text-[var(--tactical-text-sub)] hover:text-[var(--tactical-accent-lime-fg)] transition-colors flex items-center gap-1.5 group'
								>
									<span className="text-[var(--tactical-accent-lime-fg)] opacity-60 group-hover:opacity-100">//</span>
									<span>{tUI("nav.guides") || "Cẩm Nang Hướng Dẫn"}</span>
								</a>
							</li>
							<li>
								<a
									href='/powers'
									className='text-[var(--tactical-text-sub)] hover:text-[var(--tactical-accent-lime-fg)] transition-colors flex items-center gap-1.5 group'
								>
									<span className="text-[var(--tactical-accent-lime-fg)] opacity-60 group-hover:opacity-100">//</span>
									<span>{tUI("footer.powersList") || "Danh sách sức mạnh"}</span>
								</a>
							</li>
							<li>
								<a
									href='/relics'
									className='text-[var(--tactical-text-sub)] hover:text-[var(--tactical-accent-lime-fg)] transition-colors flex items-center gap-1.5 group'
								>
									<span className="text-[var(--tactical-accent-lime-fg)] opacity-60 group-hover:opacity-100">//</span>
									<span>{tUI("footer.relicsList") || "Danh sách cổ vật"}</span>
								</a>
							</li>
						</ul>
					</div>

					{/* === CỘT 3: Giới thiệu === */}
					<div className='md:col-span-2'>
						<h3 className='font-display uppercase italic tracking-wider text-sm font-bold text-[var(--tactical-text-main)] border-l-2 border-[var(--tactical-accent-cyan-fg)] pl-2.5 mb-4'>
							{tUI("footer.aboutTitle") || "Giới thiệu về POC GUIDE"}
						</h3>
						<ul className='space-y-2.5 text-xs font-mono-tech uppercase font-bold'>
							<li>
								<a
									href='/about-us'
									className='text-[var(--tactical-text-sub)] hover:text-[var(--tactical-accent-cyan-fg)] transition-colors flex items-center gap-1.5 group'
								>
									<span className="text-[var(--tactical-accent-cyan-fg)] opacity-60 group-hover:opacity-100">//</span>
									<span>{tUI("footer.aboutUs") || "Về Chúng Tôi"}</span>
								</a>
							</li>
							<li>
								<a
									href='/introduction'
									className='text-[var(--tactical-text-sub)] hover:text-[var(--tactical-accent-cyan-fg)] transition-colors flex items-center gap-1.5 group'
								>
									<span className="text-[var(--tactical-accent-cyan-fg)] opacity-60 group-hover:opacity-100">//</span>
									<span>{tUI("footer.introduction") || "Giới Thiệu"}</span>
								</a>
							</li>
							<li>
								<a
									href='/terms-of-use'
									className='text-[var(--tactical-text-sub)] hover:text-[var(--tactical-accent-cyan-fg)] transition-colors flex items-center gap-1.5 group'
								>
									<span className="text-[var(--tactical-accent-cyan-fg)] opacity-60 group-hover:opacity-100">//</span>
									<span>{tUI("footer.terms") || "Điều Khoản Sử Dụng"}</span>
								</a>
							</li>
						</ul>
					</div>

					{/* === CỘT 4: Theo dõi & Form === */}
					<div className='md:col-span-5'>
						<h3 className='font-display uppercase italic tracking-wider text-sm font-bold text-[var(--tactical-text-main)] border-l-2 border-amber-500 pl-2.5 mb-4'>
							{tUI("footer.followUs") || "Theo dõi chúng tôi"}
						</h3>

						{/* Social Links */}
						<ul className='flex flex-wrap gap-3 mb-6'>
							<li>
								<a
									href='https://www.facebook.com/lkinh.djack/'
									target='_blank'
									rel='noopener noreferrer'
									className='inline-flex items-center gap-2 px-3.5 py-2 bg-[var(--tactical-card-bg)] hover:bg-[var(--tactical-card-hover-bg)] border border-[var(--tactical-section-border)] hover:border-[var(--tactical-accent-cyan)] text-xs font-mono-tech uppercase font-bold text-[var(--tactical-text-main)] hover:text-[var(--tactical-accent-cyan-fg)] clip-chamfer-sm transition-all shadow-sm'
								>
									<Facebook className='w-4 h-4 text-[var(--tactical-accent-cyan-fg)]' />
									<span>Facebook</span>
								</a>
							</li>
							<li>
								<a
									href='https://www.youtube.com/@Evin0126'
									target='_blank'
									rel='noopener noreferrer'
									className='inline-flex items-center gap-2 px-3.5 py-2 bg-[var(--tactical-card-bg)] hover:bg-[var(--tactical-card-hover-bg)] border border-[var(--tactical-section-border)] hover:border-[var(--tactical-accent-lime)] text-xs font-mono-tech uppercase font-bold text-[var(--tactical-text-main)] hover:text-[var(--tactical-accent-lime-fg)] clip-chamfer-sm transition-all shadow-sm'
								>
									<Youtube className='w-4 h-4 text-red-500' />
									<span>Youtube</span>
								</a>
							</li>
						</ul>
					</div>
				</div>

				{/* Bottom Bar */}
				<div className="pt-6 mt-6 border-t border-[var(--tactical-section-border)] flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono-tech text-[var(--tactical-text-dim)]">
					<div>© {new Date().getFullYear()} POC GUIDE // RUNETERRA FAN PLATFORM</div>
					<div className="flex items-center gap-2 text-[var(--tactical-accent-lime-fg)] font-bold">
						<Radio className="w-3 h-3 text-[var(--tactical-accent-lime-fg)] animate-pulse" />
						<span>STATUS: ALL PROTOCOLS OPERATIONAL</span>
					</div>
				</div>
			</div>
		</footer>
	);
}

export default memo(Footer);
