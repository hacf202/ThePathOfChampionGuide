// src/pages/admin/AdminPanel.jsx
import React, { useState, lazy, Suspense, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
	NavLink,
	Routes,
	Route,
	useNavigate,
	useLocation,
} from "react-router-dom";
import {
	LayoutDashboard,
	BookOpen,
	Sparkles,
	ShieldCheck,
	Package,
	Gem,
	Library,
	Menu,
	X,
	BookMarked,
	ChevronLeft,
	ChevronRight,
	Target,
	Map,
	CreditCard,
	Settings2,
	History,
	BarChart3,
	Database,
	Users,
	Eye,
	TrendingUp
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useAnalyticsStats, MetricCard, AnalyticsRealtime, AnalyticsTopPages } from "./analytics/AnalyticsDashboard";

// Lazy load các editor
const ChampionEditor = lazy(() => import("@/features/champions/admin/championEditor"));
const PowerEditor = lazy(() => import("@/features/powers/admin/powerEditor"));
const RelicEditor = lazy(() => import("@/features/relics/admin/relicEditor"));
const ItemEditor = lazy(() => import("@/features/items/admin/itemEditor"));
const RuneEditor = lazy(() => import("@/features/runes/admin/runeEditor"));
const BonusStarEditor = lazy(() => import("@/features/bonusStars/admin/bonusStarEditor"));
const BossEditor = lazy(() => import("@/features/bosses/admin/bossEditor"));
const AdventureMapEditor = lazy(
	() => import("@/features/adventureMaps/admin/adventureMapEditor"),
);
const BuildEditor = lazy(() => import("@/features/builds/admin/buildEditor"));
const GuideEditor = lazy(() => import("@/features/guides/admin/guideEditor"));
const ImageManager = lazy(() => import("./images/imageManager"));
const AuditLogList = lazy(() => import("./auditLogs/AuditLogList"));
const CardEditor = lazy(() => import("@/features/cards/admin/cardEditor"));
const CacheManager = lazy(() => import("./cache/cacheManager"));
const AnalyticsDashboard = lazy(() => import("./analytics/AnalyticsDashboard"));
const DbStatsManager = lazy(() => import("./dbStats/dbStatsManager"));

const DashboardNavCard = ({ item, navigate, idx }) => {
	const colors = [
		"text-white bg-blue-500 shadow-lg shadow-blue-500/20 group-hover:bg-blue-400 group-hover:scale-110",
		"text-white bg-emerald-500 shadow-lg shadow-emerald-500/20 group-hover:bg-emerald-400 group-hover:scale-110",
		"text-white bg-amber-500 shadow-lg shadow-amber-500/20 group-hover:bg-amber-400 group-hover:scale-110",
		"text-white bg-purple-500 shadow-lg shadow-purple-500/20 group-hover:bg-purple-400 group-hover:scale-110",
		"text-white bg-rose-500 shadow-lg shadow-rose-500/20 group-hover:bg-rose-400 group-hover:scale-110",
		"text-white bg-cyan-500 shadow-lg shadow-cyan-500/20 group-hover:bg-cyan-400 group-hover:scale-110",
	];
	const colorClass = colors[idx % colors.length];

	return (
		<button
			onClick={() => navigate(item.path)}
			className='nav-card group flex flex-col justify-between p-5 bg-surface-bg/90 backdrop-blur-md border border-border/80 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer text-left'
		>
			<div className="flex items-start justify-between w-full mb-6">
				<div className={`p-3 rounded-2xl transition-all duration-300 ${colorClass}`}>
					<item.icon className='h-6 w-6' />
				</div>
				<div className="w-8 h-8 rounded-full flex items-center justify-center bg-surface-hover/80 text-text-tertiary group-hover:bg-primary-500 group-hover:text-white transition-all">
					<ChevronRight size={16} />
				</div>
			</div>
			<div className="flex flex-col">
				<h4 className="font-bold text-text-primary text-base group-hover:text-primary-500 transition-colors">
					{item.label}
				</h4>
				<p className="text-[10px] font-bold text-text-secondary mt-1 uppercase tracking-widest opacity-70">
					Truy cập module
				</p>
			</div>
		</button>
	);
};

const DashboardHome = ({ navItems }) => {
	const navigate = useNavigate();
	const { tUI } = useTranslation();
	const { stats, loading } = useAnalyticsStats();
	const containerRef = useRef();

	useGSAP(() => {
		gsap.from(".nav-card", {
			y: 30,
			opacity: 0,
			duration: 0.5,
			stagger: 0.05,
			ease: "power2.out",
			clearProps: "all"
		});
		gsap.from(".dashboard-anim", {
			y: 30,
			opacity: 0,
			duration: 0.5,
			stagger: 0.1,
			ease: "power2.out",
			delay: 0.1,
			clearProps: "all"
		});
	}, { scope: containerRef });

	return (
		<div ref={containerRef} className="space-y-8 pb-12 animate-fadeIn">
			{/* Header */}
			<section className="mb-8">
				<h1 className='text-3xl font-black text-text-primary font-primary mb-2 tracking-tight dashboard-anim'>
					{tUI("admin.dashboard.welcome") || "Tổng quan Hệ thống"}
				</h1>
				<p className='text-sm text-text-secondary font-medium dashboard-anim'>
					{tUI("admin.dashboard.overview") || "Theo dõi các chỉ số quan trọng và truy cập nhanh các tính năng quản trị."}
				</p>
			</section>

			<div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
				{/* Left Column: Action Grid (66%) */}
				<section className="xl:col-span-2 space-y-6">
					<div className="flex items-center justify-between border-b border-border/50 pb-3 dashboard-anim">
						<h3 className='text-lg font-black text-text-primary font-primary uppercase tracking-tight flex items-center gap-2'>
							<LayoutDashboard className="text-primary-500" size={20} />
							{tUI("admin.dashboard.selectManage") || "Quản lý Chức năng"}
						</h3>
					</div>
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
						{navItems.slice(1).map((item, idx) => {
							if (item.id === "analytics") return null;
							return <DashboardNavCard key={item.path} item={item} navigate={navigate} idx={idx} />;
						})}
					</div>
				</section>

				{/* Right Column: Analytics Sidebar (33%) */}
				<section className="xl:col-span-1 space-y-5">
					<div className="flex items-center justify-between border-b border-border/50 pb-3 dashboard-anim">
						<h3 className='text-lg font-black text-text-primary font-primary uppercase tracking-tight flex items-center gap-2'>
							<BarChart3 className="text-emerald-500" size={20} />
							Phân tích nhanh
						</h3>
					</div>
					
					{loading && !stats ? (
						<div className="h-40 animate-pulse bg-surface-bg border border-border rounded-3xl flex items-center justify-center dashboard-anim">
							<p className="text-text-tertiary font-bold text-xs uppercase tracking-widest">Đang tải biểu đồ...</p>
						</div>
					) : (
						<div className="flex flex-col gap-4">
							<div className="dashboard-anim">
								<MetricCard icon={<Users size={20}/>} label="Trực tuyến" value={stats?.onlineUsers || 0} color="emerald" />
							</div>
							<div className="dashboard-anim">
								<MetricCard icon={<Eye size={20}/>} label="Lượt xem API" value={stats?.totalViews?.toLocaleString() || 0} color="blue" />
							</div>
							<div className="dashboard-anim">
								<AnalyticsRealtime stats={stats} />
							</div>
						</div>
					)}
				</section>
			</div>

			{/* Bottom Section: Top Pages */}
			{!loading && stats && (
				<section className="mt-8 pt-8 border-t border-border/50 dashboard-anim">
					<AnalyticsTopPages stats={stats} tUI={tUI} />
				</section>
			)}
		</div>
	);
};

const AdminPanel = () => {
	const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile toggle
	const [isCollapsed, setIsCollapsed] = useState(false); // Desktop toggle
	const location = useLocation();
	const { tUI } = useTranslation();

	// Hàm helper để giữ văn bản dự phòng nếu JSON chưa được cập nhật
	

	const navItems = [
		{
			id: "dashboard",
			label: tUI("admin.nav.dashboard"),
			icon: LayoutDashboard,
			path: "/admin",
			end: true,
		},
		{
			id: "champion",
			label: tUI("admin.nav.champion"),
			icon: BookOpen,
			path: "/admin/champions",
		},
		{
			id: "power",
			label: tUI("admin.nav.power"),
			icon: Sparkles,
			path: "/admin/powers",
		},
		{
			id: "bonusStar",
			label: tUI("admin.nav.bonusStar"),
			icon: Gem,
			path: "/admin/bonusStars",
		},
		{
			id: "relic",
			label: tUI("admin.nav.relic"),
			icon: ShieldCheck,
			path: "/admin/relics",
		},
		{
			id: "item",
			label: tUI("admin.nav.item"),
			icon: Package,
			path: "/admin/items",
		},
		{
			id: "rune",
			label: tUI("admin.nav.rune"),
			icon: Gem,
			path: "/admin/runes",
		},
		{
			id: "boss",
			label: tUI("admin.nav.boss"),
			icon: Target,
			path: "/admin/bosses",
		},
		{
			id: "adventure",
			label: tUI("admin.nav.adventure"),
			icon: Map,
			path: "/admin/adventures",
		},
		{
			id: "build",
			label: tUI("admin.nav.build"),
			icon: Library,
			path: "/admin/builds",
		},
		{
			id: "guide",
			label: tUI("admin.nav.guide"),
			icon: BookMarked,
			path: "/admin/guides",
		},
		{
			id: "images",
			label: tUI("admin.nav.images"),
			icon: LayoutDashboard,
			path: "/admin/images",
		},
		{
			id: "audit-logs",
			label: tUI("admin.nav.auditLog"),
			icon: History,
			path: "/admin/audit-logs",
		},
		{
			id: "cards",
			label: tUI("admin.nav.cards"),
			icon: CreditCard,
			path: "/admin/cards",
		},
		{
			id: "cache",
			label: tUI("admin.nav.cache"),
			icon: Settings2,
			path: "/admin/cache",
		},
		{
			id: "analytics",
			label: tUI("admin.userNav.title") || "Số liệu Web",
			icon: BarChart3,
			path: "/admin/analytics",
		},
		{
			id: "db-stats",
			label: "Giới hạn CSDL",
			icon: Database,
			path: "/admin/db-stats",
		},
	];

	const currentNavItem = [...navItems]
		.sort((a, b) => b.path.length - a.path.length)
		.find(
			item =>
				location.pathname.startsWith(item.path) ||
				(item.path === "/admin" && location.pathname === "/admin"),
		);

	// [FIX] Nhận diện chế độ Editor: Nếu đường dẫn có id cụ thể (dài hơn /admin/champions)
	const isEditorMode = 
		location.pathname.split("/").length > 3 && 
		!location.pathname.includes("images") &&
		!location.pathname.includes("cache") &&
		!location.pathname.includes("analytics") &&
		!location.pathname.includes("audit-logs") &&
		!location.pathname.includes("db-stats");

	return (
		<div className='flex h-full bg-page-bg font-secondary'>
			{/* Mobile Menu Button - Floating when sidebar closed */}
			{!isSidebarOpen && !isEditorMode && (
				<button
					onClick={() => setIsSidebarOpen(true)}
					className='fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-primary-500 text-white shadow-lg shadow-primary-500/30 xl:hidden transition-all active:scale-95'
				>
					<Menu size={20} />
				</button>
			)}

			{/* Sidebar */}
			<aside
				className={`fixed inset-y-0 left-0 z-40 bg-surface-bg border-r border-border flex flex-col shadow-xl
        transition-all duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        xl:relative xl:translate-x-0 xl:shadow-sm
        ${isEditorMode ? "xl:w-0 xl:overflow-hidden xl:border-none" : (isCollapsed ? "xl:w-20" : "xl:w-64")} 
        w-64`}
			>
				{/* Sidebar Header - Logo & Title */}
				<div className='flex items-center justify-between p-4 h-16 border-b border-border bg-surface-bg/50 backdrop-blur-md sticky top-0 z-10'>
					<div
						className={`text-2xl font-bold text-text-primary font-primary flex items-center gap-3 overflow-hidden whitespace-nowrap transition-all duration-300 ${
							isCollapsed ? "justify-center w-full" : ""
						}`}
					>
						<div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center shadow-lg shadow-primary-500/20 flex-shrink-0">
							<LayoutDashboard className='text-white' size={24} />
						</div>
						<div className={`flex flex-col transition-opacity duration-300 ${isCollapsed ? "xl:hidden opacity-0" : "opacity-100"}`}>
							<span className="text-sm font-bold leading-tight">{tUI("admin.sidebar.title")}</span>
							<span className="text-[10px] text-text-secondary uppercase tracking-tighter">Management System</span>
						</div>
					</div>

					<button
						onClick={() => setIsSidebarOpen(false)}
						className='p-2 rounded-lg text-text-secondary hover:bg-surface-hover xl:hidden'
					>
						<X size={20} />
					</button>
				</div>

				{/* Desktop Toggle Button */}
				<div className='hidden xl:flex px-4 py-2 border-b border-border/50'>
					<button
						onClick={() => setIsCollapsed(!isCollapsed)}
						className='flex items-center gap-2 w-full p-2 rounded-lg text-text-secondary hover:bg-surface-hover hover:text-primary-500 transition-all text-xs font-bold uppercase tracking-widest'
					>
						{isCollapsed ? (
							<ChevronRight size={16} />
						) : (
							<>
								<ChevronLeft size={16} />
								<span>Thu gọn</span>
							</>
						)}
					</button>
				</div>

				{/* Nav Menu */}
				<nav className='flex-grow p-4 space-y-1 overflow-y-auto overflow-x-hidden-scrollbar'>
					{navItems.map(item => (
						<NavLink
							key={item.id}
							to={item.path}
							end={item.end}
							onClick={() => setIsSidebarOpen(false)}
							title={isCollapsed ? item.label : ""}
							className={({ isActive }) =>
								`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
									isActive
										? "bg-primary-500 text-white shadow-lg shadow-primary-500/20"
										: "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
								} ${isCollapsed ? "xl:justify-center xl:px-2" : ""}`
							}
						>
							<item.icon className='h-5 w-5 flex-shrink-0' />
							<span
								className={`transition-all duration-200 ${
									isCollapsed
										? "xl:w-0 xl:opacity-0 xl:overflow-hidden"
										: "xl:w-auto xl:opacity-100"
								}`}
							>
								{item.label}
							</span>
						</NavLink>
					))}
				</nav>
			</aside>

			{/* Main Content Area */}
			<div className='flex-1 flex flex-col min-w-0 min-h-0 overflow-y-auto relative'>
				{/* Topbar - Mini Breadcrumb style */}
				{!isEditorMode && (
					<header className='flex items-center justify-between h-14 bg-page-bg px-6 flex-shrink-0 z-20'>
						<div className='flex items-center gap-4'>
							<div className="hidden xl:block">
								<h1 className='text-xl font-bold text-text-primary font-primary tracking-tight'>
									{currentNavItem?.label || tUI("admin.topbar.defaultTitle")}
								</h1>
							</div>
						</div>
						
						{/* Standardized "Add New" can be added here globally if needed, 
						    but usually it's page-specific. We'll leave space for it. */}
						<div id="admin-topbar-actions" className="flex items-center gap-2"></div>
					</header>
				)}

				{/* Scrollable Content */}
				<main className={`flex-1 overflow-auto-scrollbar ${isEditorMode ? "p-0" : "px-4 pb-4 lg:px-6 lg:pb-6"}`}>
					<div className={`${isEditorMode ? "max-w-full w-full px-4 md:px-6" : "max-w-[1600px] mx-auto"}`}>
						<Suspense
							fallback={
								<div className='flex items-center justify-center h-full'>
									<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500'></div>
								</div>
							}
						>
							<Routes>
							<Route index element={<DashboardHome navItems={navItems} />} />
							<Route path='champions/*' element={<ChampionEditor />} />
							<Route path='powers/*' element={<PowerEditor />} />
							<Route path='relics/*' element={<RelicEditor />} />
							<Route path='items/*' element={<ItemEditor />} />
							<Route path='runes/*' element={<RuneEditor />} />
							<Route path='builds/*' element={<BuildEditor />} />
							<Route path='bonusStars/*' element={<BonusStarEditor />} />
							<Route path='guides/*' element={<GuideEditor />} />
							<Route path='images/:folderName' element={<ImageManager />} />
							<Route path='images' element={<ImageManager />} />
							<Route path='audit-logs' element={<AuditLogList />} />
							<Route path='bosses/*' element={<BossEditor />} />
							<Route path='adventures/*' element={<AdventureMapEditor />} />
							<Route path='cards/*' element={<CardEditor />} />
							<Route path='cache' element={<CacheManager />} />
							<Route path='analytics' element={<AnalyticsDashboard />} />
							<Route path='db-stats' element={<DbStatsManager />} />
						</Routes>
						</Suspense>
					</div>
				</main>
			</div>
		</div>
	);
};

export default AdminPanel;
