// fe/src/components/admin/analyticsDashboard.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../context/services/apiHelper"; // ĐÃ SỬA LỖI IMPORT (Thêm ngoặc nhọn)
import { useTranslation } from "../../hooks/useTranslation";
import {
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
} from "recharts";
import {
	Users,
	Zap,
	AlertTriangle,
	Layout,
	MousePointerClick,
	Clock,
	TrendingUp,
	MousePointer2,
	ChevronRight,
	Activity,
	Smartphone,
	Globe,
	Monitor,
} from "lucide-react";

const COLORS = [
	"#3b82f6",
	"#10b981",
	"#f59e0b",
	"#ef4444",
	"#8b5cf6",
	"#06b6d4",
];

const AnalyticsDashboard = () => {
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [viewType, setViewType] = useState("daily");
	const { token } = useAuth();

	const { tUI } = useTranslation();
	const t = (key, fallback) => (tUI(key) === key ? fallback : tUI(key));

	useEffect(() => {
		const fetchStats = async () => {
			try {
				const idToken = token || localStorage.getItem("idToken");
				if (!idToken) return;

				const response = await api.get("/api/analytics/stats", idToken);
				setData(response);
			} catch (err) {
				console.error("Lỗi tải dashboard:", err.message);
			} finally {
				setLoading(false);
			}
		};
		fetchStats();
	}, [token]);

	const getActiveChartData = () => {
		if (!data) return [];
		switch (viewType) {
			case "hourly":
				return data.charts.hourly;
			case "weekly":
				return data.charts.weekly;
			case "monthly":
				return data.charts.monthly;
			default:
				return data.charts.viewsOverTime;
		}
	};

	if (loading)
		return (
			<div className='flex flex-col items-center justify-center min-h-[400px] space-y-4'>
				<div className='w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin'></div>
				<p className='text-text-secondary animate-pulse font-primary text-lg'>
					{t(
						"admin.analytics.loading",
						"Đang tổng hợp dữ liệu thời gian thực...",
					)}
				</p>
			</div>
		);

	if (!data)
		return (
			<div className='p-10 text-red-500 text-center font-primary'>
				{t(
					"admin.analytics.error",
					"Lỗi: Không thể kết nối dịch vụ phân tích.",
				)}
			</div>
		);

	return (
		<div className='space-y-8 pb-12 font-secondary w-full animate-in fade-in duration-500'>
			{/* HEADER & TỔNG QUAN */}
			<div className='flex flex-col md:flex-row md:items-end justify-between gap-4'>
				<div>
					<h2 className='text-3xl font-black text-text-primary font-primary tracking-tight'>
						{t("admin.analytics.title", "Hệ thống Phân tích")}
					</h2>
					<p className='text-text-secondary text-sm'>
						{t(
							"admin.analytics.lastUpdated",
							"Dữ liệu 30 ngày qua • Cập nhật lần cuối:",
						)}{" "}
						{new Date().toLocaleTimeString()}
					</p>
				</div>
				<div className='flex items-center gap-2 bg-surface-bg p-1 rounded-xl border border-border shadow-inner'>
					{["hourly", "daily", "weekly", "monthly"].map(type => (
						<button
							key={type}
							onClick={() => setViewType(type)}
							className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-300 ${
								viewType === type
									? "bg-primary-500 text-white shadow-lg"
									: "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
							}`}
						>
							{type.toUpperCase()}
						</button>
					))}
				</div>
			</div>

			{/* 1. METRICS CẤP CAO - GRADIENT CARDS */}
			<div className='grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6'>
				<StatCard
					title={t("admin.analytics.uniqueVisitors", "Khách Duy Nhất")}
					value={data.summary.uniqueVisitors.toLocaleString()}
					icon={<Users size={22} />}
					subText={t("admin.analytics.users", "Người dùng")}
					gradient='from-indigo-600/20 to-indigo-400/5'
					border='border-indigo-500/30'
					iconColor='text-indigo-500'
				/>
				<StatCard
					title={t("admin.analytics.sessions", "Phiên Truy Cập")}
					value={data.summary.totalSessions.toLocaleString()}
					icon={<Layout size={22} />}
					subText={`~${(data.summary.totalViews / (data.summary.totalSessions || 1)).toFixed(1)} ${t("admin.analytics.viewsPerSession", "view/phiên")}`}
					gradient='from-blue-600/20 to-blue-400/5'
					border='border-blue-500/30'
					iconColor='text-blue-500'
				/>
				<StatCard
					title={t("admin.analytics.bounceRate", "Tỷ lệ Thoát")}
					value={data.summary.bounceRate}
					icon={<MousePointerClick size={22} />}
					subText={t("admin.analytics.onlyOnePage", "Chỉ xem 1 trang")}
					gradient='from-red-600/20 to-red-400/5'
					border='border-red-500/30'
					iconColor='text-red-500'
				/>
				<StatCard
					title={t("admin.analytics.avgSessionTime", "Thời gian / Phiên")}
					value={data.summary.avgSessionTime}
					icon={<Clock size={22} />}
					subText={t("admin.analytics.average", "Trung bình")}
					gradient='from-emerald-600/20 to-emerald-400/5'
					border='border-emerald-500/30'
					iconColor='text-emerald-500'
				/>
				<StatCard
					title={t("admin.analytics.totalViews", "Tổng Lượt Xem")}
					value={data.summary.totalViews.toLocaleString()}
					icon={<Activity size={22} />}
					subText={t("admin.analytics.pageviews", "Pageviews")}
					gradient='from-purple-600/20 to-purple-400/5'
					border='border-purple-500/30'
					iconColor='text-purple-500'
				/>
			</div>

			{/* 2. BIỂU ĐỒ LƯU LƯỢNG - AREA CHART VỚI GRADIENT */}
			<div className='bg-surface-bg p-6 md:p-8 rounded-3xl border border-border shadow-xl overflow-hidden relative'>
				<div className='absolute top-0 right-0 p-8 opacity-10 pointer-events-none'>
					<TrendingUp size={120} />
				</div>
				<h3 className='text-xl font-bold font-primary text-text-primary mb-8 flex items-center gap-3'>
					<div className='w-2 h-8 bg-primary-500 rounded-full'></div>
					{t("admin.analytics.trafficSystem", "Lưu lượng truy cập hệ thống")}
				</h3>
				<div className='w-full h-[350px]'>
					<ResponsiveContainer width='100%' height='100%' minWidth={0}>
						<AreaChart data={getActiveChartData()}>
							<defs>
								<linearGradient id='colorCount' x1='0' y1='0' x2='0' y2='1'>
									<stop offset='5%' stopColor='#3b82f6' stopOpacity={0.3} />
									<stop offset='95%' stopColor='#3b82f6' stopOpacity={0} />
								</linearGradient>
							</defs>
							<CartesianGrid
								strokeDasharray='3 3'
								stroke='#334155'
								vertical={false}
							/>
							<XAxis
								dataKey={
									viewType === "hourly"
										? "hour"
										: viewType === "daily"
											? "date"
											: "name"
								}
								stroke='#94a3b8'
								fontSize={12}
								tickMargin={15}
							/>
							<YAxis stroke='#94a3b8' fontSize={12} tickMargin={15} />
							<Tooltip
								contentStyle={{
									backgroundColor: "#0f172a",
									border: "1px solid #334155",
									borderRadius: "12px",
									boxShadow: "0 10px 15px -3px rgba(0,0,0,0.5)",
								}}
								itemStyle={{ color: "#3b82f6", fontWeight: "bold" }}
							/>
							<Area
								type='monotone'
								dataKey='count'
								stroke='#3b82f6'
								strokeWidth={4}
								fillOpacity={1}
								fill='url(#colorCount)'
							/>
						</AreaChart>
					</ResponsiveContainer>
				</div>
			</div>

			{/* 3. SECTION PHÂN TÍCH NHÂN KHẨU HỌC & MÔI TRƯỜNG */}
			<div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
				<MiniDonutChart
					title={t("admin.analytics.trafficSource", "Nguồn Traffic")}
					icon={<Globe size={20} className='text-emerald-500' />}
					data={data.charts.sources}
					total={data.summary.totalViews}
				/>
				<MiniDonutChart
					title={t("admin.analytics.devices", "Thiết bị sử dụng")}
					icon={<Smartphone size={20} className='text-blue-500' />}
					data={data.charts.devices}
					total={data.summary.totalViews}
				/>
				<MiniDonutChart
					title={t("admin.analytics.os", "Hệ điều hành")}
					icon={<Monitor size={20} className='text-amber-500' />}
					data={data.charts.os}
					total={data.summary.totalViews}
				/>
			</div>

			{/* 4. SECTION CHI TIẾT: TOP PAGES & HIỆU NĂNG */}
			<div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
				{/* Bảng Top Pages */}
				<div className='lg:col-span-2 bg-surface-bg p-6 md:p-8 rounded-3xl border border-border shadow-lg'>
					<div className='flex justify-between items-center mb-6'>
						<h3 className='text-lg font-bold font-primary flex items-center gap-2'>
							<MousePointer2 size={20} className='text-purple-500' />{" "}
							{t("admin.analytics.topPages", "Trang hoạt động mạnh nhất")}
						</h3>
					</div>
					<div className='overflow-x-auto'>
						<table className='w-full text-left text-sm'>
							<thead>
								<tr className='text-text-secondary uppercase text-[10px] tracking-widest border-b border-border'>
									<th className='pb-4 font-black'>
										{t("admin.analytics.urlPath", "URL PATH")}
									</th>
									<th className='pb-4 font-black text-right'>
										{t("admin.analytics.viewsHeader", "VIEWS")}
									</th>
									<th className='pb-4 font-black text-right'>
										{t("admin.analytics.popularity", "POPULARITY")}
									</th>
								</tr>
							</thead>
							<tbody className='divide-y divide-border/50'>
								{data.charts.topPages.map((page, i) => (
									<tr
										key={i}
										className='group hover:bg-page-bg/40 transition-all duration-200'
									>
										<td
											className='py-4 truncate max-w-[280px] text-text-secondary group-hover:text-primary-400 font-medium   cursor-default'
											title={page.path}
										>
											{page.path}
										</td>
										<td className='py-4 font-black text-right'>
											{page.count.toLocaleString()}
										</td>
										<td className='py-4 pl-8'>
											<div className='w-full max-w-[120px] h-2 bg-page-bg rounded-full overflow-hidden ml-auto border border-border/50'>
												<div
													className='h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full'
													style={{
														width: `${(page.count / data.summary.totalViews) * 100}%`,
													}}
												></div>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>

				{/* Avg Load Time Gauge Card & Cảnh báo */}
				<div className='space-y-8 flex flex-col'>
					<div className='bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-3xl border border-border shadow-2xl flex flex-col items-center justify-center relative overflow-hidden flex-1'>
						<div className='absolute -bottom-10 -right-10 opacity-5 rotate-12'>
							<Zap size={200} />
						</div>
						<p className='text-text-secondary uppercase font-black tracking-widest text-[10px] mb-2 z-10'>
							{t("admin.analytics.avgLoadTime", "Tốc độ tải trung bình (24h)")}
						</p>
						<div className='text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-600 mb-2 z-10'>
							{data.summary.avgLoadTime}ms
						</div>
						<div
							className={`px-4 py-1 rounded-full text-xs font-bold z-10 ${data.summary.avgLoadTime < 1000 ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}
						>
							{data.summary.avgLoadTime < 1000
								? t("admin.analytics.veryFast", "RẤT NHANH")
								: t("admin.analytics.needsOpt", "CẦN TỐI ƯU")}
						</div>
					</div>

					<div className='bg-surface-bg p-6 rounded-3xl border border-border border-l-4 border-l-red-500 shadow-lg flex-1'>
						<h3 className='text-md font-bold mb-4 flex items-center gap-2 text-red-500 font-primary'>
							<AlertTriangle size={18} />{" "}
							{t("admin.analytics.slowLoadWarning", "Cảnh báo tải chậm (>3s)")}
						</h3>
						<div className='space-y-3 max-h-[150px] overflow-y-auto custom-scrollbar pr-2'>
							{data.slowPages && data.slowPages.length > 0 ? (
								data.slowPages.map((page, i) => (
									<div
										key={i}
										className='flex justify-between items-center p-3 bg-red-500/5 rounded-xl border border-red-500/10 hover:border-red-500/30 transition-all'
									>
										<span
											className='text-xs truncate w-2/3 text-text-secondary'
											title={page.path}
										>
											{page.path}
										</span>
										<span className='text-xs font-black text-red-500 bg-red-500/10 px-2 py-1 rounded-lg'>
											{(page.time / 1000).toFixed(1)}s
										</span>
									</div>
								))
							) : (
								<div className='flex flex-col items-center justify-center py-6 opacity-50'>
									<Zap size={30} className='text-emerald-500 mb-2' />
									<p className='text-xs italic'>
										{t(
											"admin.analytics.systemSuperFast",
											"Hệ thống đang tải cực nhanh!",
										)}
									</p>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

// COMPONENT CARD CHỈ SỐ
const StatCard = ({
	title,
	value,
	icon,
	subText,
	gradient,
	border,
	iconColor,
}) => (
	<div
		className={`bg-surface-bg bg-gradient-to-br ${gradient} p-4 md:p-6 rounded-3xl border ${border} flex items-center justify-between shadow-lg transform hover:-translate-y-1 transition-all duration-300`}
	>
		<div className='flex flex-col gap-1'>
			<p className='text-text-secondary text-[10px] font-black uppercase tracking-widest'>
				{title}
			</p>
			<p className='text-2xl md:text-3xl font-black text-text-primary'>
				{value || 0}
			</p>
			<span className='text-[10px] font-bold text-text-secondary'>
				{subText}
			</span>
		</div>
		<div
			className={`hidden sm:flex p-3 md:p-4 rounded-2xl bg-surface-bg/80 backdrop-blur-md shadow-lg ${iconColor}`}
		>
			{icon}
		</div>
	</div>
);

// COMPONENT BIỂU ĐỒ DONUT DÙNG CHUNG
const MiniDonutChart = ({ title, icon, data, total }) => {
	const { tUI } = useTranslation();
	const t = (key, fallback) => (tUI(key) === key ? fallback : tUI(key));

	return (
		<div className='bg-surface-bg p-6 rounded-3xl border border-border shadow-lg flex flex-col justify-between'>
			<h3 className='text-lg font-bold mb-4 font-primary flex items-center gap-2'>
				{icon} {title}
			</h3>
			<div className='h-48 relative'>
				<ResponsiveContainer width='100%' height='100%' minWidth={0}>
					<PieChart>
						<Pie
							data={data}
							innerRadius={55}
							outerRadius={75}
							paddingAngle={5}
							dataKey='value'
							nameKey='name'
							stroke='none'
						>
							{data.map((_, i) => (
								<Cell
									key={i}
									fill={COLORS[i % COLORS.length]}
									cornerRadius={4}
								/>
							))}
						</Pie>
						<Tooltip
							contentStyle={{
								backgroundColor: "#0f172a",
								border: "1px solid #334155",
								borderRadius: "8px",
							}}
							itemStyle={{ color: "#fff", fontSize: "12px" }}
						/>
					</PieChart>
				</ResponsiveContainer>
				<div className='absolute inset-0 flex flex-col items-center justify-center pointer-events-none'>
					<p className='text-text-secondary text-[10px] uppercase font-bold'>
						{t("admin.analytics.total", "Tổng")}
					</p>
					<p className='text-lg font-black text-text-primary'>{total}</p>
				</div>
			</div>
			<div className='mt-4 grid grid-cols-2 gap-2 max-h-[100px] overflow-y-auto custom-scrollbar pr-1'>
				{[...data] // ĐÃ SỬA: Tạo bản sao (shallow copy) của mảng trước khi sort
					.sort((a, b) => b.value - a.value)
					.map((item, i) => (
						<div
							key={i}
							className='flex items-center gap-2 p-1.5 rounded-lg bg-page-bg/50 border border-border/50'
						>
							<div
								className='w-2 h-2 rounded-full shrink-0'
								style={{ backgroundColor: COLORS[i % COLORS.length] }}
							></div>
							<div className='flex flex-col min-w-0'>
								<span
									className='text-[10px] text-text-secondary uppercase font-bold truncate'
									title={item.name}
								>
									{item.name}
								</span>
								<span className='text-xs font-black'>{item.value}</span>
							</div>
						</div>
					))}
			</div>
		</div>
	);
};

export default AnalyticsDashboard;
