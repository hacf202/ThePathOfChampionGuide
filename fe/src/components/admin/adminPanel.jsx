// src/pages/admin/AdminPanel.jsx
import React, { useState, lazy, Suspense } from "react";
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
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

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

// Component DashboardHome
const DashboardHome = ({ navItems }) => {
	const navigate = useNavigate();
	const { tUI } = useTranslation();
	

	return (
		<>
			<h1 className='text-4xl font-bold text-text-primary font-primary mb-2'>
				{tUI("admin.dashboard.welcome")}
			</h1>
			<p className='text-lg text-text-secondary mb-8'>
				{tUI("admin.dashboard.overview")}
			</p>

			<div>
				<h3 className='text-xl font-semibold text-text-primary mb-6 font-primary'>
					{tUI("admin.dashboard.selectManage")}
				</h3>
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
					{navItems.slice(1).map(item => (
						<button
							key={item.path}
							onClick={() => navigate(item.path)}
							className='group flex items-center gap-3 px-6 py-4 bg-btn-primary-bg text-btn-primary-text font-semibold rounded-xl shadow-md hover:bg-btn-primary-hover-bg transition-all duration-200 transform hover:scale-105 hover:shadow-lg'
						>
							<item.icon className='h-6 w-6 flex-shrink-0' />
							<span>{item.label}</span>
						</button>
					))}
				</div>
			</div>
		</>
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
