// src/pages/tierList/index.jsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PageTitle from "../components/common/pageTitle";
import TierListChampions from "../components/tierMaker/champions";
import TierListRelics from "../components/tierMaker/relics";
import { Users, Diamond, LayoutGrid, ArrowRight } from "lucide-react";

function TierListIndex() {
	const navigate = useNavigate();
	const location = useLocation();

	// Xác định tab hiện tại dựa trên đường dẫn URL
	const isChampionsActive = location.pathname.includes("/champions");
	const isRelicsActive = location.pathname.includes("/relics");

	// Kiểm tra nếu đang ở trang gốc /tierlist
	const isRoot = !isChampionsActive && !isRelicsActive;

	return (
		<div className='max-w-[1200px] mx-auto p-0 font-secondary text-text-primary'>
			<PageTitle title='Custom Tier List LoR - Huyền Thoại Runeterra' />

			{/* Header Section */}
			<div className='mb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2'>
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
						<Users size={18} />
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
						<Diamond size={18} />
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

				{/* Giao diện lựa chọn khi ở trang chủ Tier List */}
				{isRoot && (
					<div className='grid sm:grid-cols-2 gap-8 mt-10 px-2 animate-in zoom-in-95 duration-700'>
						<div
							onClick={() => navigate("/tierlist/champions")}
							className='group cursor-pointer p-12 bg-surface-bg border border-border rounded-3xl hover:border-primary-500/40 transition-all hover:shadow-2xl hover:shadow-primary-500/5 relative overflow-hidden'
						>
							<div className='absolute -right-8 -top-8 w-32 h-32 bg-primary-500/5 rounded-full group-hover:scale-150 transition-transform duration-700'></div>
							<div className='w-16 h-16 bg-primary-500/10 rounded-2xl flex items-center justify-center mb-8 group-hover:rotate-6 transition-transform'>
								<Users size={32} className='text-primary-400' />
							</div>
							<h2 className='text-3xl font-bold mb-4 group-hover:text-primary-400 transition-colors'>
								Tier List Tướng
							</h2>
							<p className='text-text-secondary leading-relaxed mb-6'>
								Xây dựng bảng xếp hạng sức mạnh cho các anh hùng trong Path of
								Champions.
							</p>
							<div className='flex items-center gap-2 text-primary-400 font-bold text-sm'>
								Bắt đầu ngay <ArrowRight size={16} />
							</div>
						</div>

						<div
							onClick={() => navigate("/tierlist/relics")}
							className='group cursor-pointer p-12 bg-surface-bg border border-border rounded-3xl hover:border-primary-500/40 transition-all hover:shadow-2xl hover:shadow-primary-500/5 relative overflow-hidden'
						>
							<div className='absolute -right-8 -top-8 w-32 h-32 bg-primary-500/5 rounded-full group-hover:scale-150 transition-transform duration-700'></div>
							<div className='w-16 h-16 bg-primary-500/10 rounded-2xl flex items-center justify-center mb-8 group-hover:rotate-6 transition-transform'>
								<Diamond size={32} className='text-primary-400' />
							</div>
							<h2 className='text-3xl font-bold mb-4 group-hover:text-primary-400 transition-colors'>
								Tier List Cổ Vật
							</h2>
							<p className='text-text-secondary leading-relaxed mb-6'>
								Phân loại di vật dựa trên độ hiếm và khả năng kết hợp với tướng.
							</p>
							<div className='flex items-center gap-2 text-primary-400 font-bold text-sm'>
								Bắt đầu ngay <ArrowRight size={16} />
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

export default TierListIndex;
