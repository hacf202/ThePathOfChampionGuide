// src/pages/tierList/index.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PageTitle from "../components/common/pageTitle";
import TierListChampions from "../components/tierMaker/champions";
import TierListRelics from "../components/tierMaker/relics";
import { Swords, Sparkles, Loader2 } from "lucide-react";

function TierListIndex() {
	const navigate = useNavigate();
	const location = useLocation();
	const apiUrl = import.meta.env.VITE_API_URL;

	// State quản lý dữ liệu Metadata để truyền xuống component con
	const [champions, setChampions] = useState([]);
	const [relics, setRelics] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	// Xác định tab hiện tại dựa trên đường dẫn URL
	const isChampionsActive = location.pathname.includes("/champions");
	const isRelicsActive = location.pathname.includes("/relics");

	// Kiểm tra nếu đang ở trang gốc /tierlist
	const isRoot =
		location.pathname === "/tierlist" || location.pathname === "/tierlist/";

	/**
	 * Logic Tải dữ liệu Metadata (Tướng & Cổ vật)
	 * SỬA LỖI: Sử dụng limit=1000 để lấy đầy đủ danh sách cho bảng Tier List,
	 * tránh việc chỉ lấy 20 mục mặc định từ Backend.
	 */
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

			// [SỬA LỖI]: Backend trả về { items: [...] }, cần bóc tách mảng để tránh lỗi .map()
			setChampions(champData.items || champData || []);
			setRelics(relicData.items || relicData || []);
		} catch (error) {
			console.error("Lỗi khởi tạo dữ liệu Tier List:", error);
		} finally {
			setIsLoading(false);
		}
	}, [apiUrl]);

	useEffect(() => {
		fetchMetadata();
	}, [fetchMetadata]);

	// Logic chuyển hướng tự động sang Champions khi vào trang gốc
	useEffect(() => {
		if (isRoot) {
			navigate("/tierlist/champions", { replace: true });
		}
	}, [isRoot, navigate]);

	if (isRoot) return null;

	return (
		<div className='max-w-[1200px] mx-auto p-0 font-secondary text-text-primary'>
			<PageTitle title='Custom Tier List LoR - Huyền Thoại Runeterra' />

			{/* Header Section - Giữ nguyên giao diện CSS của bạn */}
			<div className='mb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2 px-2'>
				<div>
					<h1 className='text-2xl sm:text-3xl font-bold uppercase mb-0 tracking-tight text-primary-500'>
						Custom Tier List POC
					</h1>
				</div>

				{/* Hệ thống nút chuyển đổi Tab qua Route */}
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

			{/* Nội dung hiển thị dựa trên URL Path và trạng thái Loading */}
			<div className='transition-all duration-300 ease-in-out min-h-[600px]'>
				{isLoading ? (
					<div className='flex flex-col items-center justify-center h-64 gap-4'>
						<Loader2 className='animate-spin text-primary-500' size={40} />
						<p className='text-text-secondary animate-pulse'>
							Đang tải danh sách...
						</p>
					</div>
				) : (
					<>
						{/* Hiển thị bảng Tướng khi URL khớp */}
						{isChampionsActive && (
							<div className='animate-in fade-in slide-in-from-bottom-4 duration-500'>
								{/* Truyền dữ liệu đã bóc tách từ .items xuống component con */}
								<TierListChampions initialChampions={champions} />
							</div>
						)}

						{/* Hiển thị bảng Cổ vật khi URL khớp */}
						{isRelicsActive && (
							<div className='animate-in fade-in slide-in-from-bottom-4 duration-500'>
								{/* Truyền dữ liệu đã bóc tách từ .items xuống component con */}
								<TierListRelics initialRelics={relics} />
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
}

export default TierListIndex;
