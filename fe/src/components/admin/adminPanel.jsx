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
} from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";

// Lazy load các editor
const ChampionEditor = lazy(() => import("./champions/championEditor"));
const PowerEditor = lazy(() => import("./powers/powerEditor"));
const RelicEditor = lazy(() => import("./relics/relicEditor"));
const ItemEditor = lazy(() => import("./items/itemEditor"));
const RuneEditor = lazy(() => import("./runes/runeEditor"));
const BonusStarEditor = lazy(() => import("./bonusStars/bonusStarEditor"));
const BossEditor = lazy(() => import("./bosses/bossEditor"));
const AdventureMapEditor = lazy(
	() => import("./adventureMaps/adventureMapEditor"),
);
const BuildEditor = lazy(() => import("./builds/buildEditor"));
const GuideEditor = lazy(() => import("./guides/guideEditor"));
const ImageManager = lazy(() => import("./images/imageManager"));
const AuditLogList = lazy(() => import("./auditLogs/AuditLogList"));
const CardEditor = lazy(() => import("./cards/cardEditor"));
const CacheManager = lazy(() => import("./cache/cacheManager"));

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
			label: tUI("admin.nav.cache") || "Quản lý Cache",
			icon: Settings2,
			path: "/admin/cache",
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
		!location.pathname.includes("images") && // Loại trừ ImageManager
		!location.pathname.includes("cache") && // Loại trừ CacheManager
		!location.pathname.includes("audit-logs"); // Loại trừ AuditLogs

	return (
		<div className='flex h-full bg-page-bg font-secondary'>
			{/* Overlay cho Mobile */}
			{isSidebarOpen && (
				<div
					className='fixed inset-0 z-30 bg-black/50 xl:hidden'
					onClick={() => setIsSidebarOpen(false)}
				/>
			)}

			{/* Sidebar - Tự động ẩn hoàn toàn khi ở chế độ Editor Mode */}
			<aside
				className={`fixed inset-y-0 left-0 z-40 bg-surface-bg border-r border-border flex flex-col shadow-lg
        transition-all duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        /* Logic responsive: Mobile full width khi mở, Desktop width tùy chỉnh */
        xl:relative xl:translate-x-0 xl:shadow-sm
        ${isEditorMode ? "xl:w-0 xl:overflow-hidden xl:border-none" : (isCollapsed ? "xl:w-20" : "xl:w-64")} 
        w-64`}
			>
				{/* Sidebar Header */}
				<div className='flex items-center justify-between p-4 h-16 border-b border-border'>
					<div
						className={`text-2xl font-bold text-text-primary font-primary flex items-center gap-2 overflow-hidden whitespace-nowrap transition-all duration-300 ${
							isCollapsed ? "justify-center w-full" : ""
						}`}
					>
						<LayoutDashboard className='text-primary-500 flex-shrink-0' />
						{/* Ẩn chữ Admin khi collapsed trên desktop */}
						<span
							className={`transition-opacity duration-300 ${
								isCollapsed ? "xl:hidden opacity-0" : "opacity-100"
							}`}
						>
							{tUI("admin.sidebar.title")}
						</span>
					</div>

					{/* Nút đóng sidebar trên Mobile */}
					<button
						onClick={() => setIsSidebarOpen(false)}
						className='p-2 rounded-lg text-text-secondary hover:bg-surface-hover xl:hidden'
					>
						<X size={20} />
					</button>
				</div>

				{/* Nút Toggle Sidebar (Chỉ hiện trên Desktop) */}
				<div className='hidden xl:flex justify-end px-2 py-2 bg-primary-500 text-white shadow-md'>
					<button
						onClick={() => setIsCollapsed(!isCollapsed)}
						className=' flex p-1.5 w-full justify-end rounded-lg bg-surface-hover text-text-secondary hover:text-primary-500 hover:bg-btn-primary-bg/10  '
					>
						{isCollapsed ? (
							<ChevronRight size={18} />
						) : (
							<ChevronLeft size={18} />
						)}
					</button>
				</div>

				{/* Nav Menu */}
				<nav className='flex-grow p-4 space-y-1 overflow-y-auto overflow-x-hidden'>
					{navItems.map(item => (
						<NavLink
							key={item.id}
							to={item.path}
							end={item.end}
							onClick={() => setIsSidebarOpen(false)}
							title={isCollapsed ? item.label : ""}
							className={({ isActive }) =>
								`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
									isActive
										? "bg-primary-500 text-white shadow-md"
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

				{/* Footer */}
				<div className='p-4 border-t border-border bg-page-bg overflow-hidden'>
					<p
						className={`text-xs text-center text-text-secondary whitespace-nowrap transition-all duration-300 ${
							isCollapsed ? "xl:opacity-0" : "xl:opacity-100"
						}`}
					>
						{tUI("admin.sidebar.footer")}
					</p>
				</div>
			</aside>

			{/* Main Content */}
			<div className='flex-1 flex flex-col overflow-hidden'>
				{/* Topbar - Ẩn khi ở chế độ Editor Mode để có nhiều không gian hơn */}
				{!isEditorMode && (
					<header className='flex items-center justify-between h-16 bg-surface-bg border-b border-border px-6 flex-shrink-0 sticky top-0 z-20'>
						<button
							onClick={() => setIsSidebarOpen(true)}
							className='p-2 rounded-lg text-text-secondary hover:bg-surface-hover hover:text-text-primary xl:hidden'
						>
							<Menu size={20} />
						</button>

						<div className='flex-1 flex justify-center xl:justify-start'>
							<h1 className='text-2xl font-bold text-text-primary font-primary hidden sm:block'>
								{currentNavItem?.label ||
									tUI("admin.topbar.defaultTitle")}
							</h1>
						</div>
					</header>
				)}

				{/* Scrollable Content */}
				<main className='flex-1 overflow-auto px-4 pb-4 lg:px-6 lg:pb-6'>
					<Suspense
						fallback={
							<div className='flex items-center justify-center min-h-[400px]'>
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
							<Route path='images/*' element={<ImageManager />} />
							<Route path='audit-logs' element={<AuditLogList />} />
							<Route path='bosses/*' element={<BossEditor />} />
							<Route path='adventures/*' element={<AdventureMapEditor />} />
							<Route path='cards/*' element={<CardEditor />} />
							<Route path='cache' element={<CacheManager />} />
						</Routes>
					</Suspense>
				</main>
			</div>
		</div>
	);
};

export default AdminPanel;
