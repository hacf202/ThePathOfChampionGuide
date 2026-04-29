// src/pages/tierList.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PageTitle from "../components/common/pageTitle";
import TierListChampions from "../components/tierMaker/champions";
import TierListRelics from "../components/tierMaker/relics";
import { Swords, Sparkles, Loader2 } from "lucide-react";
import { useTranslation } from "../hooks/useTranslation"; // 🟢 Import Hook Đa ngôn ngữ

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
				title={tUI("tierList.pageTitle")}
				description={tUI("metadata.defaultDescription")}
			/>

			<div className='max-w-[1400px] mx-auto py-4 sm:py-8 font-secondary'>
				<AnimatePresence mode='wait'>
					{isLoading ? (
						<motion.div
							key='skeleton'
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
						>
							<TierListHeaderSkeleton />
							<div className='h-[800px] bg-surface-bg/30 rounded-2xl border border-border/50 animate-pulse m-2' />
						</motion.div>
					) : (
						<motion.div
							key='content'
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.4 }}
						>
							{/* Header: Title & Tab Switcher */}
							<div className='mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-2'>
								<div>
									<h1 className='text-3xl sm:text-5xl font-bold text-text-primary font-primary tracking-tight uppercase italic'>
										<span className='text-primary-500'>POC</span>{" "}
										{tUI("home.tierListTitle")}
									</h1>
								</div>

								{/* Tab Switcher */}
								<div className='flex bg-surface-bg p-1 rounded-xl border border-border w-fit shadow-inner'>
									<button
										onClick={() => navigate("/tierlist")}
										className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
											isChampionsActive
												? "bg-primary-500 text-white shadow-lg shadow-primary-500/20"
												: "text-text-secondary hover:text-text-primary hover:bg-white/5"
										}`}
									>
										<Swords size={18} />
										{tUI("tierList.tabChampions")}
									</button>
									<button
										onClick={() => navigate("/tierlist/relics")}
										className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
											isRelicsActive
												? "bg-primary-500 text-white shadow-lg shadow-primary-500/20"
												: "text-text-secondary hover:text-text-primary hover:bg-white/5"
										}`}
									>
										<Sparkles size={18} />
										{tUI("tierList.tabRelics")}
									</button>
								</div>
							</div>



							{/* Nội dung hiển thị dựa trên URL Path */}
							<div className='min-h-[600px]'>
								<AnimatePresence mode='wait'>
									<motion.div
										key={location.pathname}
										initial={{ opacity: 0, x: -10 }}
										animate={{ opacity: 1, x: 0 }}
										exit={{ opacity: 0, x: 10 }}
										transition={{ duration: 0.3 }}
									>
										{isChampionsActive ? (
											<TierListChampions />
										) : (
											<TierListRelics />
										)}
									</motion.div>
								</AnimatePresence>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}

export default TierListIndex;
