// src/pages/tierList.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import PageTitle from "@/components/common/pageTitle";
import TierListChampions from "@/features/tools/tierList/components/champions";
import TierListRelics from "@/features/tools/tierList/components/relics";
import { Swords, Sparkles, Loader2 } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation"; // 🟢 Import Hook Đa ngôn ngữ

// --- THÀNH PHẦN SKELETON CHO HEADER ---
const TierListHeaderSkeleton = () => (
	<div className='mb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2 px-2 animate-pulse'>
		<div className='h-10 w-64 bg-gray-700/50 rounded-lg' />
		<div className='flex bg-surface-bg p-1 rounded-xl border border-border w-fit'>
			<div className='h-10 w-28 bg-gray-700/30 rounded-lg mr-1' />
			<div className='h-10 w-28 bg-gray-700/30 rounded-lg' />
		</div>
	</div>
);

function TierListIndex() {
	const navigate = useNavigate();
	const location = useLocation();
	const { tUI } = useTranslation(); // 🟢 Sử dụng tUI

	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const timer = setTimeout(() => setIsLoading(false), 800);
		return () => clearTimeout(timer);
	}, []);

	const isRelicsActive = location.pathname.includes("/relics");
	const isChampionsActive = !isRelicsActive;

	return (
		<div className='animate-fadeIn'>
			{/* 🟢 Tiêu đề trang đa ngôn ngữ */}
			<PageTitle
				title={tUI("tierList.pageTitle") || "Bảng Xếp Hạng Tướng & Cổ Vật PoC"}
				description={tUI("tierList.pageDesc") || "Bảng xếp hạng (Tier List) cập nhật mới nhất cho tướng và cổ vật trong chế độ Con Đường Anh Hùng (PoC) Legends of Runeterra."}
				keywords="tier list poc, bảng xếp hạng tướng poc, best champions path of champions, lor pve tier list, xếp hạng cổ vật poc"
			/>

			<div className='max-w-[1400px] mx-auto py-4 sm:py-8 font-secondary'>
				
					{isLoading ? (
						<div
							key='skeleton'
							>
							<TierListHeaderSkeleton />
							<div className='h-[800px] bg-surface-bg/30 rounded-2xl border border-border/50 animate-pulse m-2' />
						</div>
					) : (
						<div
							key='content'
							transition={{ duration: 0.4 }}
						>
							{/* Header: Title & Tab Switcher */}
							<div className='mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-2'>
								<div className='flex items-center gap-3'>
									<div className='w-1.5 h-8 bg-[var(--tactical-accent-lime)] shadow-[0_0_8px_var(--tactical-accent-lime)]' />
									<div>
										<span className='font-mono-tech text-xs uppercase tracking-widest text-[var(--tactical-accent-lime)] font-bold'>
											TACTICAL RANKINGS // TIER MATRIX
										</span>
										<h1 className='text-3xl sm:text-5xl font-bold text-text-primary font-display tracking-tight uppercase'>
											<span className='text-[var(--tactical-accent-lime)]'>POC</span>{" "}
											{tUI("home.tierListTitle")}
										</h1>
									</div>
								</div>

								{/* Tab Switcher */}
								<div className='tactical-box clip-chamfer-sm flex bg-[var(--tactical-inner-box)] p-1 border border-[var(--tactical-card-border)] w-fit'>
									<button
										onClick={() => navigate("/tierlist")}
										className={`flex items-center gap-2 px-5 py-2 clip-chamfer-sm font-mono-tech text-xs uppercase tracking-wider font-bold transition-all duration-200 ${
											isChampionsActive
												? "bg-[var(--tactical-accent-lime)] text-[var(--tactical-accent-lime-fg)] shadow-[0_0_12px_rgba(210,255,40,0.3)]"
												: "text-text-secondary hover:text-[var(--tactical-accent-lime)] hover:bg-white/5"
										}`}
									>
										<Swords size={16} />
										{tUI("tierList.tabChampions")}
									</button>
									<button
										onClick={() => navigate("/tierlist/relics")}
										className={`flex items-center gap-2 px-5 py-2 clip-chamfer-sm font-mono-tech text-xs uppercase tracking-wider font-bold transition-all duration-200 ${
											isRelicsActive
												? "bg-[var(--tactical-accent-lime)] text-[var(--tactical-accent-lime-fg)] shadow-[0_0_12px_rgba(210,255,40,0.3)]"
												: "text-text-secondary hover:text-[var(--tactical-accent-lime)] hover:bg-white/5"
										}`}
									>
										<Sparkles size={16} />
										{tUI("tierList.tabRelics")}
									</button>
								</div>
							</div>



							{/* Nội dung hiển thị dựa trên URL Path */}
							<div className='min-h-[600px]'>
								
									<div
										key={location.pathname}
										transition={{ duration: 0.3 }}
									>
										{isChampionsActive ? (
											<TierListChampions />
										) : (
											<TierListRelics />
										)}
									</div>
								
							</div>
						</div>
					)}
				
			</div>
		</div>
	);
}

export default TierListIndex;
