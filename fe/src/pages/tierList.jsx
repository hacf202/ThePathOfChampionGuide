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
	const { language } = useTranslation(); // 🟢 Khởi tạo Hook

	const [isInitializing, setIsInitializing] = useState(true);

	const isChampionsActive =
		location.pathname === "/tierlist/champions" ||
		location.pathname === "/tierlist";
	const isRelicsActive = location.pathname === "/tierlist/relics";

	useEffect(() => {
		const timer = setTimeout(() => {
			setIsInitializing(false);
		}, 300); // Giả lập độ trễ ngắn để tạo hiệu ứng chuyển cảnh mượt
		return () => clearTimeout(timer);
	}, [location.pathname]);

	const renderContent = useCallback(() => {
		if (isChampionsActive) return <TierListChampions />;
		if (isRelicsActive) return <TierListRelics />;
		return <TierListChampions />; // Fallback
	}, [isChampionsActive, isRelicsActive]);

	return (
		<div className='min-h-screen bg-bg-primary text-text-primary animate-fadeIn'>
			<PageTitle
				title={
					language === "vi"
						? "Xếp hạng Tướng & Cổ vật"
						: "Champions & Relics Tier List"
				}
			/>

			<div className='max-w-[1400px] mx-auto p-2 sm:p-4 md:p-6 font-secondary'>
				<AnimatePresence mode='wait'>
					{isInitializing ? (
						<motion.div
							key='skeleton'
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.2 }}
						>
							<TierListHeaderSkeleton />
							<div className='h-[600px] w-full bg-surface-bg border border-border rounded-xl mt-4 animate-pulse' />
						</motion.div>
					) : (
						<motion.div
							key='content'
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3 }}
						>
							{/* Header: Title + Navigation Buttons */}
							<div className='mb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-2'>
								<div>
									<h1 className='text-2xl sm:text-3xl md:text-4xl font-bold font-primary uppercase text-primary-500'>
										{language === "vi" ? "BẢNG XẾP HẠNG" : "TIER LIST"}
									</h1>
									<p className='text-sm text-text-secondary mt-1 max-w-xl'>
										{language === "vi"
											? "Khám phá sức mạnh của các Tướng và Cổ vật trong Path of Champions hiện tại."
											: "Discover the power rankings of Champions and Relics in the current Path of Champions meta."}
									</p>
								</div>

								<div className='flex bg-surface-bg p-1 rounded-xl border border-border shadow-sm w-fit'>
									<button
										onClick={() => navigate("/tierlist/champions")}
										className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
											isChampionsActive
												? "bg-primary-500 text-white shadow-lg shadow-primary-500/20"
												: "text-text-secondary hover:text-text-primary hover:bg-white/5"
										}`}
									>
										<Swords size={18} />
										{language === "vi" ? "TƯỚNG" : "CHAMPIONS"}
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
										{language === "vi" ? "CỔ VẬT" : "RELICS"}
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
										transition={{ duration: 0.2 }}
									>
										{renderContent()}
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
