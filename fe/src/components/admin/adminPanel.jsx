// src/pages/admin/AdminPanel.jsx
import React, { useState, lazy, Suspense } from "react";
import { NavLink } from "react-router-dom";
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
	Bell,
	Users,
	ChevronLeft,
	BookMarked,
} from "lucide-react";

// Lazy load các editor để tối ưu bundle
const ChampionEditor = lazy(() => import("./championEditor"));
const PowerEditor = lazy(() => import("./powerEditor"));
const RelicEditor = lazy(() => import("./relicEditor"));
const ItemEditor = lazy(() => import("./itemEditor"));
const RuneEditor = lazy(() => import("./runeEditor"));
const BuildEditor = lazy(() => import("./buildEditor"));
const GuideEditor = lazy(() => import("./guideEditor"));

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
	<div className='bg-surface-bg border border-border rounded-lg p-5 flex items-center gap-4 shadow-sm hover:shadow-md hover:border-primary-500 transition-all duration-200'>
		<div
			className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full ${colorClass} bg-opacity-10`}
		>
			<Icon className={`w-6 h-6 ${colorClass}`} />
		</div>
		<div>
			<p className='text-sm font-medium text-text-secondary'>{title}</p>
			<p className='text-2xl font-bold text-text-primary'>{value}</p>
		</div>
	</div>
);

const AdminPanel = () => {
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [activeTab, setActiveTab] = useState("dashboard");

	const stats = { champions: 170, builds: 45, relics: 89, users: 128 };

	const navItems = [
		{
			id: "dashboard",
			label: "Tổng quan",
			icon: LayoutDashboard,
			path: "/admin",
		},
		{ id: "champion", label: "Quản lý Tướng", icon: BookOpen },
		{ id: "power", label: "Quản lý Sức Mạnh", icon: Sparkles },
		{ id: "relic", label: "Quản lý Cổ Vật", icon: ShieldCheck },
		{ id: "item", label: "Quản lý Vật Phẩm", icon: Package },
		{ id: "rune", label: "Quản lý Ngọc", icon: Gem },
		{ id: "build", label: "Quản lý Bộ Cổ Vật", icon: Library },
		{ id: "guide", label: "Quản lý Hướng Dẫn", icon: BookMarked },
	];

	const navLinkClass = id =>
		`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
			activeTab === id
				? "bg-primary-500 text-white shadow-md"
				: "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
		}`;

	const renderEditor = () => {
		const EditorComponent = {
			champion: ChampionEditor,
			power: PowerEditor,
			relic: RelicEditor,
			item: ItemEditor,
			rune: RuneEditor,
			build: BuildEditor,
			guide: GuideEditor,
		}[activeTab];

		if (!EditorComponent) return null;

		return (
			<Suspense
				fallback={
					<div className='flex items-center justify-center min-h-[400px]'>
						<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500'></div>
					</div>
				}
			>
				<EditorComponent />
			</Suspense>
		);
	};

	return (
		<div className='flex h-screen bg-page-bg font-secondary'>
			{/* Overlay */}
			{isSidebarOpen && (
				<div
					className='fixed inset-0 z-30 bg-black/50 xl:hidden'
					onClick={() => setIsSidebarOpen(false)}
				/>
			)}

			{/* Sidebar */}
			<aside
				className={`fixed inset-y-0 left-0 z-40 w-64 bg-surface-bg border-r border-border flex flex-col shadow-lg
        transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        xl:relative xl:translate-x-0 xl:shadow-sm`}
			>
				<div className='flex items-center justify-between p-4 h-16 border-b border-border'>
					<div className='text-2xl font-bold text-text-primary font-primary flex items-center gap-2'>
						<LayoutDashboard className='text-primary-500' />
						Admin
					</div>
					<button
						onClick={() => setIsSidebarOpen(false)}
						className='p-2 rounded-lg text-text-secondary hover:bg-surface-hover xl:hidden'
					>
						<X size={20} />
					</button>
				</div>

				<nav className='flex-grow p-4 space-y-1 overflow-y-auto'>
					{navItems.map(item => (
						<button
							key={item.id}
							onClick={() => {
								setActiveTab(item.id);
								setIsSidebarOpen(false);
							}}
							className={navLinkClass(item.id)}
						>
							<item.icon className='h-5 w-5 flex-shrink-0' />
							<span>{item.label}</span>
						</button>
					))}
				</nav>

				<div className='p-4 border-t border-border bg-page-bg'>
					<p className='text-xs text-center text-text-secondary'>
						© 2025 Path of champions guide
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
							{navItems.find(i => i.id === activeTab)?.label || "Admin Panel"}
						</h1>
					</div>
				</header>

				{/* Scrollable Content */}
				<main className='flex-1 overflow-auto p-0 lg:p-2'>
					{activeTab === "dashboard" ? (
						<>
							<h1 className='text-4xl font-bold text-text-primary font-primary mb-2'>
								Chào mừng, Admin!
							</h1>
							<p className='text-lg text-text-secondary mb-8'>
								Tổng quan nhanh về hệ thống.
							</p>

							<div>
								<h3 className='text-xl font-semibold text-text-primary mb-6 font-primary'>
									Chọn mục để quản lý
								</h3>
								<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
									{navItems.slice(1).map(item => (
										<button
											key={item.id}
											onClick={() => setActiveTab(item.id)}
											className='group flex items-center gap-3 px-6 py-4 bg-btn-primary-bg text-btn-primary-text font-semibold rounded-xl shadow-md hover:bg-btn-primary-hover-bg transition-all duration-200 transform hover:scale-105 hover:shadow-lg'
										>
											<item.icon className='h-6 w-6 flex-shrink-0' />
											<span>{item.label}</span>
										</button>
									))}
								</div>
							</div>
						</>
					) : (
						renderEditor()
					)}
				</main>
			</div>
		</div>
	);
};

export default AdminPanel;
