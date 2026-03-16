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
} from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";

// Lazy load các editor
const ChampionEditor = lazy(() => import("./championEditor"));
const PowerEditor = lazy(() => import("./powerEditor"));
const RelicEditor = lazy(() => import("./relicEditor"));
const ItemEditor = lazy(() => import("./itemEditor"));
const RuneEditor = lazy(() => import("./runeEditor"));
const BonusStarEditor = lazy(() => import("./bonusStarEditor"));
const BossEditor = lazy(() => import("./bossEditor"));
const AdventureMapEditor = lazy(() => import("./adventureMapEditor"));
const BuildEditor = lazy(() => import("./buildEditor"));
const GuideEditor = lazy(() => import("./guideEditor"));
const AnalyticsDashboard = lazy(() => import("./analyticsDashboard"));
const ImageManager = lazy(() => import("./imageManager"));

// Component DashboardHome
const DashboardHome = ({ navItems }) => {
	const navigate = useNavigate();
	const { tUI } = useTranslation();
	const t = (key, fallback) => (tUI(key) === key ? fallback : tUI(key));

	return (
		<>
			<h1 className='text-4xl font-bold text-text-primary font-primary mb-2'>
				{t("admin.dashboard.welcome", "Chào mừng, Admin!")}
			</h1>
			<p className='text-lg text-text-secondary mb-8'>
				{t("admin.dashboard.overview", "Tổng quan nhanh về hệ thống.")}
			</p>

			<div>
				<h3 className='text-xl font-semibold text-text-primary mb-6 font-primary'>
					{t("admin.dashboard.selectManage", "Chọn mục để quản lý")}
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
	const t = (key, fallback) => (tUI(key) === key ? fallback : tUI(key));

	const navItems = [
		{
			id: "dashboard",
			label: t("admin.nav.dashboard", "Tổng quan"),
			icon: LayoutDashboard,
			path: "/admin",
			end: true,
		},
		{
			id: "champion",
			label: t("admin.nav.champion", "Quản lý Tướng"),
			icon: BookOpen,
			path: "/admin/champions",
		},
		{
			id: "power",
			label: t("admin.nav.power", "Quản lý Sức Mạnh"),
			icon: Sparkles,
			path: "/admin/powers",
		},
		{
			id: "bonusStar",
			label: t("admin.nav.bonusStar", "Quản lý Tăng Thưởng"),
			icon: Gem,
			path: "/admin/bonusStars",
		},
		{
			id: "relic",
			label: t("admin.nav.relic", "Quản lý Cổ Vật"),
			icon: ShieldCheck,
			path: "/admin/relics",
		},
		{
			id: "item",
			label: t("admin.nav.item", "Quản lý Vật Phẩm"),
			icon: Package,
			path: "/admin/items",
		},
		{
			id: "rune",
			label: t("admin.nav.rune", "Quản lý Ngọc"),
			icon: Gem,
			path: "/admin/runes",
		},
		{
			id: "boss",
			label: t("admin.nav.boss", "Quản lý Boss"),
			icon: Target,
			path: "/admin/bosses",
		},
		{
			id: "adventure",
			label: t("admin.nav.adventure", "Quản lý Hành Trình"),
			icon: Map,
			path: "/admin/adventures",
		},
		{
			id: "build",
			label: t("admin.nav.build", "Quản lý Bộ Cổ Vật"),
			icon: Library,
			path: "/admin/builds",
		},
		{
			id: "guide",
			label: t("admin.nav.guide", "Quản lý Hướng Dẫn"),
			icon: BookMarked,
			path: "/admin/guides",
		},
		{
			id: "analytics",
			label: t("admin.nav.analytics", "Phân tích hệ thống"),
			icon: LayoutDashboard,
			path: "/admin/analytics",
		},
		{
			id: "images",
			label: t("admin.nav.images", "Quản lý Ảnh"),
			icon: LayoutDashboard,
			path: "/admin/images",
		},
	];

	const currentNavItem = [...navItems]
		.sort((a, b) => b.path.length - a.path.length)
		.find(
			item =>
				location.pathname.startsWith(item.path) ||
				(item.path === "/admin" && location.pathname === "/admin"),
		);

	return (
		<div className='flex h-screen bg-page-bg font-secondary'>
			{/* Overlay cho Mobile */}
			{isSidebarOpen && (
				<div
					className='fixed inset-0 z-30 bg-black/50 xl:hidden'
					onClick={() => setIsSidebarOpen(false)}
				/>
			)}

			{/* Sidebar */}
			<aside
				className={`fixed inset-y-0 left-0 z-40 bg-surface-bg border-r border-border flex flex-col shadow-lg
        transition-all duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        /* Logic responsive: Mobile full width khi mở, Desktop width tùy chỉnh */
        xl:relative xl:translate-x-0 xl:shadow-sm
        ${isCollapsed ? "xl:w-20" : "xl:w-64"} 
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
							{t("admin.sidebar.title", "Admin")}
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
						{t("admin.sidebar.footer", "© 2025 Path of champions")}
					</p>
				</div>
			</aside>

			{/* Main Content */}
			<div className='flex-1 flex flex-col overflow-hidden'>
				{/* Topbar */}
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
								t("admin.topbar.defaultTitle", "Admin Panel")}
						</h1>
					</div>
				</header>

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
							<Route path='analytics' element={<AnalyticsDashboard />} />
							<Route path='images/*' element={<ImageManager />} />
							<Route path='bosses/*' element={<BossEditor />} />
							<Route path='adventures/*' element={<AdventureMapEditor />} />
						</Routes>
					</Suspense>
				</main>
			</div>
		</div>
	);
};

export default AdminPanel;
