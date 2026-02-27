// src/pages/tierList/index.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion"; // Thêm Framer Motion
import PageTitle from "../components/common/pageTitle"; // Giả sử bạn có component này để đặt tiêu đề trang
import TierListChampions from "../components/tierMaker/champions"; // Điều chỉnh đường dẫn theo cấu trúc của bạn
import TierListRelics from "../components/tierMaker/relics"; // Điều chỉnh đường dẫn theo cấu trúc của bạn
import { Swords, Sparkles, Loader2 } from "lucide-react";

// --- THÀNH PHẦN SKELETON CHO HEADER (Đồng bộ phong cách) ---
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
	const apiUrl = import.meta.env.VITE_API_URL;

	const [champions, setChampions] = useState([]);
	const [relics, setRelics] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	const isChampionsActive = location.pathname.includes("/champions");
	const isRelicsActive = location.pathname.includes("/relics");

	const isRoot =
		location.pathname === "/tierlist" || location.pathname === "/tierlist/";

	const fetchMetadata = useCallback(async () => {
		setIsLoading(true);
		try {
			const queryLimit = "?page=1&limit=1000";
			const [champRes, relicRes] = await Promise.all([
				fetch(`${apiUrl}/api/champions${queryLimit}`),
				fetch(`${apiUrl}/api/relics${queryLimit}`),
			]);

			if (!champRes.ok || !relicRes.ok)
				throw new Error("Không thể tải dữ liệu từ máy chủ");

			const [champData, relicData] = await Promise.all([
				champRes.json(),
				relicRes.json(),
			]);

			setChampions(champData.items || champData || []);
			setRelics(relicData.items || relicData || []);
		} catch (error) {
			console.error("Lỗi khởi tạo dữ liệu Tier List:", error);
		} finally {
			// Thêm delay nhẹ 800ms để hiệu ứng Skeleton mượt mà đồng bộ với các trang khác
			setTimeout(() => setIsLoading(false), 800);
		}
	}, [apiUrl]);

	useEffect(() => {
		fetchMetadata();
	}, [fetchMetadata]);

	useEffect(() => {
		if (isRoot) {
			navigate("/tierlist/champions", { replace: true });
		}
	}, [isRoot, navigate]);

	if (isRoot) return null;

	return (
		<div className='animate-fadeIn'>
			<PageTitle title='Custom Tier List LoR - Huyền Thoại Runeterra' />

			<div className='max-w-[1200px] mx-auto p-0 font-secondary text-text-primary'>
				<AnimatePresence mode='wait'>
					{isLoading ? (
						<motion.div
							key='skeleton-header'
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
						>
							<TierListHeaderSkeleton />
							{/* Phần nội dung Skeleton chi tiết sẽ do component con đảm nhiệm hoặc hiển thị Loader ở đây */}
							<div className='flex flex-col items-center justify-center h-64 gap-4'>
								<Loader2 className='animate-spin text-primary-500' size={40} />
								<p className='text-text-secondary animate-pulse'>
									Đang tải danh sách...
								</p>
							</div>
						</motion.div>
					) : (
						<motion.div
							key='tier-list-content'
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3 }}
						>
							{/* Header Section */}
							<div className='mb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2 px-2'>
								<div>
									<h1 className='text-2xl sm:text-3xl font-bold uppercase mb-0 tracking-tight text-primary-500'>
										Custom Tier List POC
									</h1>
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
										TƯỚNG
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
										CỔ VẬT
									</button>
								</div>
							</div>

							{/* Nội dung hiển thị dựa trên URL Path */}
							<div className='min-h-[600px]'>
								{isChampionsActive && (
									<TierListChampions initialChampions={champions} />
								)}

								{isRelicsActive && <TierListRelics initialRelics={relics} />}
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}

export default TierListIndex;
