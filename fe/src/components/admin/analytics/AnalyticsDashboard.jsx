import React, { useState, useEffect, useCallback, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import axios from "axios";
import { 
	Users, Eye, TrendingUp, BarChart3, Clock, 
	Activity, Globe, RefreshCw, AlertCircle, HelpCircle 
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";

const API_ADMIN_ANALYTICS = `${import.meta.env.VITE_API_URL}/api/admin/analytics`;

export const useAnalyticsStats = () => {
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
		const interval = setInterval(() => fetchStats(true), 30000);
		return () => clearInterval(interval);
	}, [fetchStats]);

	return { stats, loading, error, fetchStats };
};

export const InfoTooltip = ({ text }) => (
	<HelpCircle size={14} className="inline-block ml-1.5 text-text-tertiary hover:text-primary-500 transition-colors cursor-help" title={text} />
);

export const MetricCard = ({ icon, label, value, color, description, className="", tooltip="" }) => {
	const colorMap = {
		emerald: "bg-emerald-50 text-emerald-600 border-emerald-200 shadow-emerald-500/5 group-hover:bg-emerald-500 group-hover:text-white",
		blue: "bg-blue-50 text-blue-600 border-blue-200 shadow-blue-500/5 group-hover:bg-blue-500 group-hover:text-white",
		amber: "bg-amber-50 text-amber-600 border-amber-200 shadow-amber-500/5 group-hover:bg-amber-500 group-hover:text-white",
	};

	return (
		<div className={`p-5 bg-surface-bg border border-border/80 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 group hover:-translate-y-1 relative overflow-hidden cursor-default ${className}`}>
			<div className="absolute top-0 right-0 p-3 opacity-[0.03] transition-opacity group-hover:opacity-[0.08]">
				{icon}
			</div>
			<div className="flex items-center gap-4 relative z-10">
				<div className={`p-3 rounded-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm border ${colorMap[color]}`}>
					{icon}
				</div>
				<div>
					<p className="text-[10px] text-text-tertiary uppercase tracking-widest font-black mb-1 flex items-center">
						{label}
						{tooltip && <InfoTooltip text={tooltip} />}
					</p>
					<p className="text-2xl font-black text-text-primary tracking-tighter group-hover:text-primary-500 transition-colors">
						{value}
					</p>
					{description && (
						<p className="text-[10px] text-text-secondary font-medium mt-0.5 opacity-80">
							{description}
						</p>
					)}
				</div>
			</div>
		</div>
	);
};

export const AnalyticsRealtime = ({ stats }) => (
	<div className="bg-surface-bg border border-border rounded-2xl p-5 shadow-sm">
		<h3 className="text-sm font-black text-text-primary mb-4 flex items-center gap-2 uppercase tracking-widest border-b border-border/50 pb-3">
			<Activity size={16} className="text-emerald-500" />
			Trạng thái trực tiếp
		</h3>
		<div className="space-y-4">
			<div className="flex items-center justify-between p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
				<div className="flex items-center gap-3">
					<div className="relative">
						<div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
						<div className="absolute inset-0 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
					</div>
					<span className="text-xs font-bold text-text-primary uppercase tracking-widest">Đang hoạt động</span>
				</div>
				<span className="text-sm font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md">
					{stats?.onlineUsers || 0}
				</span>
			</div>
			<div className="px-1">
				<p className="text-xs text-text-secondary leading-relaxed font-medium">
					Dữ liệu được tính dựa trên số lượng <b>Identifier</b> có hoạt động trong 5 phút qua tại Redis.
				</p>
			</div>
		</div>
	</div>
);

export const AnalyticsTopPages = ({ stats, tUI, className="" }) => {
	const chartData = stats?.topPages?.slice(0, 5).map(page => ({
		name: page.path.length > 15 ? page.path.substring(0, 15) + '...' : page.path,
		fullPath: page.path,
		views: page.count
	})) || [];

	return (
		<div className={`bg-surface-bg border border-border rounded-2xl overflow-hidden shadow-sm ${className}`}>
			<div className="p-5 border-b border-border bg-surface-hover/10">
				<h3 className="text-sm font-black text-text-primary flex items-center gap-2 uppercase tracking-widest">
					<Globe size={16} className="text-primary-500" />
					{tUI("admin.userNav.topPages") || "Trang phổ biến nhất"}
					<InfoTooltip text="Thống kê 5 đường dẫn (API) được gọi nhiều nhất trên hệ thống." />
				</h3>
			</div>

			<div className="p-6 border-b border-border/50">
				{chartData.length > 0 ? (
					<div className="h-48 w-full">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
								<XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--color-text-tertiary)" }} axisLine={false} tickLine={false} />
								<YAxis tick={{ fontSize: 10, fill: "var(--color-text-tertiary)" }} axisLine={false} tickLine={false} />
								<RechartsTooltip 
									cursor={{ fill: 'var(--color-surface-hover)', opacity: 0.5 }}
									contentStyle={{ backgroundColor: 'var(--color-surface-bg)', border: '1px solid var(--color-border)', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}
								/>
								<Bar dataKey="views" radius={[4, 4, 0, 0]}>
									{chartData.map((entry, index) => (
										<Cell key={`cell-${index}`} fill={index === 0 ? "var(--color-primary-500)" : "var(--color-primary-500)"} fillOpacity={1 - (index * 0.15)} />
									))}
								</Bar>
							</BarChart>
						</ResponsiveContainer>
					</div>
				) : (
					<div className="h-48 flex items-center justify-center text-text-tertiary text-xs font-bold uppercase tracking-widest">
						Chưa có dữ liệu biểu đồ
					</div>
				)}
			</div>

			<div className="overflow-x-auto">
				<table className="w-full text-left border-collapse">
					<thead>
						<tr className="bg-surface-hover/50 text-text-secondary text-[10px] uppercase tracking-widest font-black border-b border-border">
							<th className="px-5 py-3">{tUI("admin.userNav.urlPath") || "Đường dẫn"}</th>
							<th className="px-5 py-3 text-right">{tUI("admin.userNav.viewsHeader") || "Lượt xem"}</th>
							<th className="px-5 py-3 text-center">Tỷ lệ</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-border">
						{stats?.topPages?.length > 0 ? stats.topPages.map((page, idx) => {
							const percentage = stats.totalViews > 0 ? ((page.count / stats.totalViews) * 100).toFixed(1) : 0;
							return (
								<tr key={page.path} className="hover:bg-surface-hover/30 transition-colors group">
									<td className="px-5 py-3">
										<div className="flex items-center gap-3">
											<span className="text-[10px] font-black text-text-tertiary w-3">#{idx + 1}</span>
											<code className="text-xs font-mono text-primary-500 bg-primary-50 px-2 py-0.5 rounded font-bold dark:bg-primary-500/10 dark:text-primary-400 border border-primary-500/10">
												{page.path}
											</code>
										</div>
									</td>
									<td className="px-5 py-3 text-right font-mono font-bold text-sm text-text-primary">
										{page.count.toLocaleString()}
									</td>
									<td className="px-5 py-3">
										<div className="flex flex-col items-center gap-1">
											<div className="w-20 h-1 bg-surface-hover rounded-full overflow-hidden border border-border/50">
												<div 
													className="h-full bg-primary-500 transition-all duration-1000 ease-out" 
													style={{ width: `${percentage}%` }}
												/>
											</div>
											<span className="text-[9px] font-black text-text-secondary">{percentage}%</span>
										</div>
									</td>
								</tr>
							);
						}) : (
							<tr>
								<td colSpan="3" className="px-5 py-8 text-center text-text-tertiary font-bold uppercase tracking-widest text-xs">
									Chưa có dữ liệu
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
};

const AnalyticsDashboard = () => {
	const { tUI } = useTranslation();
	const { stats, loading, error, fetchStats } = useAnalyticsStats();
	const containerRef = useRef();

	useGSAP(() => {
		if (!loading && stats) {
			gsap.from(".analytics-anim", {
				y: 20,
				opacity: 0,
				duration: 0.5,
				stagger: 0.05,
				ease: "power2.out",
				clearProps: "all"
			});
		}
	}, { dependencies: [loading, stats], scope: containerRef });

	if (loading && !stats) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
				<RefreshCw className="animate-spin text-primary-500" size={32} />
				<p className="text-text-tertiary font-bold animate-pulse uppercase tracking-widest text-[10px]">
					{tUI("admin.common.loading") || "Đang tải số liệu..."}
				</p>
			</div>
		);
	}

	return (
		<div ref={containerRef} className="max-w-7xl animate-fadeIn font-secondary space-y-6">
			<header className="flex flex-col md:flex-row md:items-end justify-between gap-4 analytics-anim">
				<div>
					<h1 className="text-2xl font-black text-text-primary mb-2 flex items-center gap-2 font-primary uppercase tracking-tight">
						<div className="p-1.5 bg-emerald-500 rounded-lg">
							<BarChart3 className="h-5 w-5 text-white" />
						</div>
						{tUI("admin.userNav.title") || "Hệ thống Phân tích"}
					</h1>
					<p className="text-text-secondary text-sm font-medium">
						{tUI("admin.userNav.trafficSystem") || "Theo dõi lưu lượng truy cập và người dùng trực tuyến."}
					</p>
				</div>
				<button
					onClick={() => fetchStats()}
					disabled={loading}
					className="flex items-center justify-center p-2 bg-surface-bg border border-border rounded-lg hover:bg-surface-hover hover:border-primary-500/50 transition-all text-text-secondary hover:text-primary-500 shadow-sm"
					title="Làm mới"
				>
					<RefreshCw size={18} className={`${loading ? "animate-spin" : ""}`} />
				</button>
			</header>

			{error && (
				<div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-500 text-xs font-bold analytics-anim">
					<AlertCircle size={16} />
					{error}
				</div>
			)}

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				<div className="analytics-anim">
					<MetricCard 
						icon={<Users size={20}/>} 
						label="Trực tuyến" 
						value={stats?.onlineUsers || 0} 
						color="emerald" 
						tooltip="Số lượng IP hoặc tài khoản duy nhất đang hoạt động trong vòng 5 phút qua."
					/>
				</div>
				<div className="analytics-anim">
					<MetricCard 
						icon={<Eye size={20}/>} 
						label="Lượt xem API" 
						value={stats?.totalViews?.toLocaleString() || 0} 
						color="blue" 
						tooltip="Tổng số lần hệ thống nhận yêu cầu từ người dùng kể từ lúc khởi động lại."
					/>
				</div>
				<div className="analytics-anim">
					<MetricCard 
						icon={<TrendingUp size={20}/>} 
						label="Trang phổ biến" 
						value={stats?.topPages?.length || 0} 
						color="amber" 
						tooltip="Số lượng các trang (endpoint) có lưu lượng truy cập cao nhất."
					/>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="lg:col-span-2 analytics-anim">
					<AnalyticsTopPages stats={stats} tUI={tUI} />
				</div>
				<div className="lg:col-span-1 space-y-4 analytics-anim">
					<AnalyticsRealtime stats={stats} />
					
					<div className="p-5 bg-primary-500/5 border border-primary-500/10 rounded-2xl">
						<div className="flex items-center gap-2 text-primary-500 font-black text-[10px] uppercase tracking-widest mb-2">
							<Clock size={14} /> Cập nhật cuối
						</div>
						<p className="text-xl font-black text-text-primary tracking-tighter">
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

export default AnalyticsDashboard;
