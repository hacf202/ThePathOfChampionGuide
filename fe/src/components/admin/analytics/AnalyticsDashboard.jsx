import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { 
	Users, Eye, TrendingUp, BarChart3, Clock, 
	Activity, Globe, MousePointer2, RefreshCw, AlertCircle 
} from "lucide-react";
import { useTranslation } from "../../../hooks/useTranslation";

const API_ADMIN_ANALYTICS = `${import.meta.env.VITE_API_URL}/api/admin/analytics`;

const AnalyticsDashboard = () => {
	const { tUI } = useTranslation();
	const [stats, setStats] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const fetchStats = useCallback(async (silent = false) => {
		if (!silent) setLoading(true);
		try {
			const token = localStorage.getItem("token");
			const response = await axios.get(`${API_ADMIN_ANALYTICS}/stats`, {
				headers: { Authorization: `Bearer ${token}` }
			});
			setStats(response.data);
			setError(null);
		} catch (err) {
			console.error("Error fetching analytics stats:", err);
			setError("Không thể tải dữ liệu thống kê.");
		} finally {
			if (!silent) setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchStats();
		// Tự động làm mới mỗi 30 giây
		const interval = setInterval(() => fetchStats(true), 30000);
		return () => clearInterval(interval);
	}, [fetchStats]);

	if (loading && !stats) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
				<RefreshCw className="animate-spin text-primary-500" size={40} />
				<p className="text-text-tertiary font-bold animate-pulse uppercase tracking-widest text-xs">
					{tUI("admin.common.loading") || "Đang tải số liệu..."}
				</p>
			</div>
		);
	}

	return (
		<div className="max-w-7xl animate-fadeIn font-secondary space-y-8">
			{/* Header */}
			<header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
				<div>
					<h1 className="text-3xl font-black text-text-primary mb-2 flex items-center gap-3 font-primary uppercase tracking-tight">
						<div className="p-2 bg-emerald-500 rounded-xl">
							<BarChart3 className="h-7 w-7 text-white" />
						</div>
						{tUI("admin.userNav.title") || "Hệ thống Phân tích"}
					</h1>
					<p className="text-text-secondary max-w-2xl font-medium">
						{tUI("admin.userNav.trafficSystem") || "Theo dõi lưu lượng truy cập và người dùng trực tuyến."}
					</p>
				</div>
				<button
					onClick={() => fetchStats()}
					disabled={loading}
					className="group flex items-center gap-2 px-4 py-2.5 bg-surface-bg border border-border rounded-xl hover:bg-surface-hover hover:border-primary-500/50 transition-all text-sm font-bold shadow-sm"
				>
					<RefreshCw size={18} className={`${loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} />
					{tUI("admin.common.refresh") || "Làm mới"}
				</button>
			</header>

			{error && (
				<div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-sm font-bold">
					<AlertCircle size={20} />
					{error}
				</div>
			)}

			{/* Main Metrics */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
				<MetricCard 
					icon={<Users className="h-6 w-6" />} 
					label={tUI("admin.userNav.onlineUsers") || "Đang trực tuyến"} 
					value={stats?.onlineUsers || 0} 
					color="emerald"
					description="Hoạt động trong 5 phút qua"
				/>
				<MetricCard 
					icon={<Eye className="h-6 w-6" />} 
					label={tUI("admin.userNav.totalViews") || "Tổng lượt xem"} 
					value={stats?.totalViews?.toLocaleString() || 0} 
					color="blue"
					description="Lượt truy cập API hệ thống"
				/>
				<MetricCard 
					icon={<TrendingUp className="h-6 w-6" />} 
					label="Trang phổ biến" 
					value={stats?.topPages?.length || 0} 
					color="amber"
					description="Số trang có lượt truy cập"
				/>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* Top Pages Table */}
				<div className="lg:col-span-2 bg-surface-bg border border-border rounded-3xl overflow-hidden shadow-xl shadow-black/5">
					<div className="p-6 border-b border-border bg-surface-hover/10">
						<h3 className="text-lg font-black text-text-primary flex items-center gap-2 uppercase tracking-tight">
							<Globe size={20} className="text-primary-500" />
							{tUI("admin.userNav.topPages") || "Trang hoạt động mạnh nhất"}
						</h3>
					</div>
					<div className="overflow-x-auto">
						<table className="w-full text-left border-collapse">
							<thead>
								<tr className="bg-surface-hover/30 text-text-tertiary text-[10px] uppercase tracking-widest font-black border-b border-border">
									<th className="px-6 py-4">{tUI("admin.userNav.urlPath") || "Đường dẫn (Path)"}</th>
									<th className="px-6 py-4 text-right">{tUI("admin.userNav.viewsHeader") || "Lượt xem"}</th>
									<th className="px-6 py-4 text-center">Tỷ lệ</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-border">
								{stats?.topPages?.length > 0 ? stats.topPages.map((page, idx) => {
									const percentage = stats.totalViews > 0 ? ((page.count / stats.totalViews) * 100).toFixed(1) : 0;
									return (
										<tr key={page.path} className="hover:bg-surface-hover/20 transition-colors group">
											<td className="px-6 py-4">
												<div className="flex items-center gap-3">
													<span className="text-xs font-black text-text-tertiary w-4">#{idx + 1}</span>
													<code className="text-xs font-mono text-primary-400 bg-primary-500/5 px-2 py-1 rounded">
														{page.path}
													</code>
												</div>
											</td>
											<td className="px-6 py-4 text-right font-mono font-bold text-text-primary">
												{page.count.toLocaleString()}
											</td>
											<td className="px-6 py-4">
												<div className="flex flex-col items-center gap-1">
													<div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
														<div 
															className="h-full bg-primary-500 transition-all duration-1000 ease-out" 
															style={{ width: `${percentage}%` }}
														/>
													</div>
													<span className="text-[10px] font-black text-text-tertiary">{percentage}%</span>
												</div>
											</td>
										</tr>
									);
								}) : (
									<tr>
										<td colSpan="3" className="px-6 py-12 text-center text-text-tertiary font-bold uppercase tracking-widest text-xs">
											Chưa có dữ liệu lượt xem
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>

				{/* Real-time Feed or Info */}
				<div className="lg:col-span-1 space-y-6">
					<div className="bg-surface-bg border border-border rounded-3xl p-6 shadow-xl">
						<h3 className="text-lg font-black text-text-primary mb-6 flex items-center gap-2 uppercase tracking-tight border-b border-border pb-4">
							<Activity size={20} className="text-emerald-500" />
							Trạng thái trực tiếp
						</h3>
						<div className="space-y-4">
							<div className="flex items-center justify-between p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
								<div className="flex items-center gap-3">
									<div className="relative">
										<div className="w-3 h-3 bg-emerald-500 rounded-full" />
										<div className="absolute inset-0 w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
									</div>
									<span className="text-sm font-bold text-text-primary">Đang hoạt động</span>
								</div>
								<span className="text-xs font-black text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg">
									{stats?.onlineUsers || 0}
								</span>
							</div>
							
							<div className="p-4 space-y-2">
								<h4 className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">Ghi chú hệ thống</h4>
								<p className="text-xs text-text-secondary leading-relaxed">
									Dữ liệu người dùng Online được tính dựa trên số lượng <b>Identifier</b> (IP hoặc ID người dùng) có hoạt động trong 5 phút qua được lưu tại Redis.
								</p>
							</div>
						</div>
					</div>

					<div className="p-6 bg-primary-500/5 border border-primary-500/10 rounded-3xl">
						<div className="flex items-center gap-3 text-primary-400 font-black text-xs uppercase tracking-[0.2em] mb-4">
							<Clock size={16} />
							Cập nhật cuối
						</div>
						<p className="text-2xl font-black text-text-primary tracking-tighter">
							{new Date().toLocaleTimeString()}
						</p>
						<p className="text-[10px] text-text-tertiary font-bold mt-1 uppercase">
							{new Date().toLocaleDateString()}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

const MetricCard = ({ icon, label, value, color, description }) => {
	const colorMap = {
		emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-emerald-500/5",
		blue: "bg-blue-500/10 text-blue-500 border-blue-500/20 shadow-blue-500/5",
		amber: "bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-amber-500/5",
	};

	return (
		<div className="p-6 bg-surface-bg border border-border rounded-[2rem] shadow-sm hover:shadow-2xl transition-all duration-500 group hover:-translate-y-2 relative overflow-hidden">
			<div className="absolute top-0 right-0 p-4 opacity-[0.03] transition-opacity group-hover:opacity-[0.08]">
				{icon}
			</div>
			<div className="flex items-center gap-5 relative z-10">
				<div className={`p-4 rounded-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-inner ${colorMap[color]}`}>
					{icon}
				</div>
				<div>
					<p className="text-[10px] text-text-tertiary uppercase tracking-[0.25em] font-black mb-1.5 opacity-60">
						{label}
					</p>
					<p className="text-3xl font-black text-text-primary tracking-tighter">
						{value}
					</p>
					{description && (
						<p className="text-[10px] text-text-tertiary font-bold mt-1 opacity-40 italic">
							{description}
						</p>
					)}
				</div>
			</div>
		</div>
	);
};

export default AnalyticsDashboard;
