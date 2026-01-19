// src/pages/tierList/index.jsx
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PageTitle from "../components/common/pageTitle"; // Chỉnh lại path nếu cần
import TierListChampions from "../components/tierMaker/champions"; // Chỉnh lại path cho đúng cấu trúc folder của bạn
import TierListRelics from "../components/tierMaker/relics"; // Chỉnh lại path cho đúng cấu trúc folder của bạn
import { Swords, Sparkles } from "lucide-react";

function TierListIndex() {
	const navigate = useNavigate();
	const location = useLocation();

	// Xác định tab hiện tại dựa trên đường dẫn URL
	const isChampionsActive = location.pathname.includes("/champions");
	const isRelicsActive = location.pathname.includes("/relics");

	// Kiểm tra nếu đang ở trang gốc /tierlist
	// Ví dụ: path là "/tierlist" hoặc "/tierlist/"
	const isRoot =
		location.pathname === "/tierlist" || location.pathname === "/tierlist/";

	// Logic chuyển hướng tự động
	useEffect(() => {
		if (isRoot) {
			// Điều hướng sang champions mặc định và ghi đè lịch sử (replace)
			navigate("/tierlist/champions", { replace: true });
		}
	}, [isRoot, navigate]);

	// Nếu đang trong quá trình chuyển hướng, có thể trả về null hoặc loader để tránh flicker giao diện cũ
	if (isRoot) return null;

	return (
		<div className='max-w-[1200px] mx-auto p-0 font-secondary text-text-primary'>
			<PageTitle title='Custom Tier List LoR - Huyền Thoại Runeterra' />

			{/* Header Section */}
			<div className='mb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2 px-2'>
				<div>
					<h1 className='text-2xl sm:text-3xl font-bold uppercase mb-0 tracking-tight'>
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

			{/* Nội dung hiển thị dựa trên URL Path */}
			<div className='transition-all duration-300 ease-in-out min-h-[600px]'>
				{/* Hiển thị bảng Tướng khi URL khớp */}
				{isChampionsActive && (
					<div className='animate-in fade-in slide-in-from-bottom-4 duration-500'>
						<TierListChampions />
					</div>
				)}

				{/* Hiển thị bảng Cổ vật khi URL khớp */}
				{isRelicsActive && (
					<div className='animate-in fade-in slide-in-from-bottom-4 duration-500'>
						<TierListRelics />
					</div>
				)}
			</div>
		</div>
	);
}

export default TierListIndex;
