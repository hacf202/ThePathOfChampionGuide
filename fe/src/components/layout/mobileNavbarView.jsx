// components/layout/MobileSidebar.jsx
import React, { useContext, useState, useRef, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext.jsx";
import { useTheme } from "@/context/ThemeContext.jsx";
import ThemeSettings from "@/components/common/ThemeSettings.jsx";
import GlobalSearch from "@/components/common/GlobalSearch.jsx";

import Modal from "@/components/common/modal.jsx";
import Button from "@/components/common/button.jsx";

import DonateModal from "@/components/common/DonateModal.jsx";

import {
	User,
	LogIn,
	LogOut,
	Settings,
	Shield,
	Swords,
	Package,
	Gem,
	Zap,
	BookOpen,
	Wrench,
	Sparkles,
	LoaderPinwheel,
	Menu,
	X,
	Gift,
	BookMarked,
	Map,
	BarChartHorizontalBig,
	Globe,
	Star,
	Sun,
	Moon,
	Palette,
	Search,
	Book,
	Users,
	Coffee,
	Eye,
} from "lucide-react";

function MobileSidebar({ language, handleLanguageChange, tUI, isNavVisible }) {
	const { user, logout, isAdmin } = useContext(AuthContext);
	const { theme, toggleTheme } = useTheme();
	const navigate = useNavigate();
	const location = useLocation();

	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [isDatabaseDropdownOpen, setIsDatabaseDropdownOpen] = useState(false);
	const [isAdventuresDropdownOpen, setIsAdventuresDropdownOpen] = useState(false);
	const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);
	const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
	const [isHeaderLangOpen, setIsHeaderLangOpen] = useState(false);
	const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
	const [isThemeSettingsOpen, setIsThemeSettingsOpen] = useState(false);
	const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
	const [isDonateOpen, setIsDonateOpen] = useState(false);

	const sidebarRef = useRef(null);
	const headerLangRef = useRef(null);

	const confirmLogout = () => {
		logout();
		setIsLogoutModalOpen(false);
		setIsSidebarOpen(false);
		navigate("/");
	};

	const closeSidebar = () => {
		setIsSidebarOpen(false);
		setIsDatabaseDropdownOpen(false);
		setIsAdventuresDropdownOpen(false);
		setIsToolsDropdownOpen(false);
		setIsLangDropdownOpen(false);
	};

	useEffect(() => {
		const handleClickOutside = event => {
			if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
				closeSidebar();
			}
			if (
				headerLangRef.current &&
				!headerLangRef.current.contains(event.target)
			) {
				setIsHeaderLangOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const dropdownLinkClass =
		"flex items-center gap-2 px-3 py-2 text-xs font-mono-tech uppercase font-bold text-[var(--tactical-text-main)] hover:text-[var(--tactical-accent-lime-fg)] hover:bg-[var(--tactical-card-hover-bg)] clip-chamfer-sm transition-all";

	return (
		<>
			{/* Mobile Header */}
			<header
				className='bg-[var(--tactical-header-bg)] backdrop-blur-md border-b border-[var(--tactical-section-border)] text-[var(--tactical-text-main)] p-2.5 shadow-2xl fixed top-0 left-0 right-0 z-[100] xl:hidden flex items-center justify-between h-14 overflow-visible font-primary'
				style={{
					transform: isNavVisible ? 'translateY(0)' : 'translateY(-100%)',
					transition: 'transform 0.3s ease',
				}}
			>
				{/* Logo Section */}
				<div className="flex items-center gap-2 flex-shrink-0">
					<NavLink to='/' className='flex items-center gap-2' onClick={closeSidebar}>
						<img src="/favicon.ico" alt='Logo' className='h-7 w-auto' />
						<div className="bg-[#D2FF28] text-black font-display text-lg px-2 py-0.5 italic transform -skew-x-12 font-black tracking-wide">
							POC GUIDE
						</div>
					</NavLink>
				</div>

				{/* Search & Menu Section */}
				<div className="flex items-center gap-2">
					<button
						onClick={() => setIsMobileSearchOpen(true)}
						className='p-2 bg-[var(--tactical-card-bg)] hover:bg-[var(--tactical-card-hover-bg)] border border-[var(--tactical-card-border)] rounded hover:border-[var(--tactical-accent-lime)] text-[var(--tactical-text-main)] hover:text-[var(--tactical-accent-lime-fg)] transition-all flex-shrink-0'
						aria-label={tUI("nav.search")}
					>
						<Search className='w-4 h-4' />
					</button>

					{/* Menu Hamburger */}
					<button
						onClick={() => setIsSidebarOpen(prev => !prev)}
						className='p-2 bg-[var(--tactical-card-bg)] hover:bg-[var(--tactical-card-hover-bg)] border border-[var(--tactical-card-border)] rounded hover:border-[var(--tactical-accent-lime)] text-[var(--tactical-text-main)] hover:text-[var(--tactical-accent-lime-fg)] transition-all flex-shrink-0'
						aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
					>
						{isSidebarOpen ? <X className='w-5 h-5' /> : <Menu className='w-5 h-5' />}
					</button>
				</div>

				{/* Full-width Search Bar Overlay when Mobile Search is Open */}
				{isMobileSearchOpen && (
					<div className="absolute inset-0 bg-[var(--tactical-header-bg)] z-[110] px-3 flex items-center gap-2 animate-fadeIn">
						<div className="flex-1 min-w-0">
							<GlobalSearch 
								compact={false} 
								showClose={true} 
								onClose={() => setIsMobileSearchOpen(false)} 
							/>
						</div>
					</div>
				)}
			</header>

			{isSidebarOpen && (
				<>
					{/* Overlay */}
					<div
						transition={{ duration: 0.3 }}
						className='fixed inset-0 bg-black/70 backdrop-blur-sm z-40 xl:hidden'
						onClick={closeSidebar}
					/>

					{/* Sidebar - mở từ bên PHẢI để nhất quán với nút hamburger */}
					<div
						ref={sidebarRef}
						transition={{ type: "spring", damping: 25, stiffness: 200 }}
						className="fixed inset-y-0 right-0 z-50 w-72 bg-[var(--tactical-dropdown-bg)] border-l-2 border-[var(--tactical-section-border)] shadow-2xl xl:hidden overflow-y-auto font-primary text-[var(--tactical-text-main)]"
					>
						<div className='flex flex-col h-full'>
							<div className='flex items-center justify-between p-3.5 border-b border-[var(--tactical-section-border)] bg-[var(--tactical-card-bg)]'>
								<div className='flex items-center gap-2'>
									<img src="/favicon.ico" alt='Logo' className='h-7 w-auto' />
									<div className="bg-[#D2FF28] text-black font-display text-base px-2 py-0.5 italic transform -skew-x-12 font-black">
										POC GUIDE
									</div>
								</div>
								<button
									onClick={closeSidebar}
									className='p-1 text-[var(--tactical-text-dim)] hover:text-[var(--tactical-text-main)] transition'
									aria-label='Close sidebar'
								>
									<X className='w-5 h-5' />
								</button>
							</div>

							<nav className='flex-1 p-4 space-y-1.5 text-[var(--tactical-text-main)]'>
								{/* Menu Từ Điển */}
								<div>
									<button
										onClick={() => setIsDatabaseDropdownOpen(!isDatabaseDropdownOpen)}
										className='w-full flex items-center justify-between px-3 py-2 text-xs font-mono-tech uppercase font-bold text-[var(--tactical-text-main)] hover:text-[var(--tactical-accent-lime-fg)] hover:bg-[var(--tactical-card-hover-bg)] clip-chamfer-sm transition-all'
									>
										<div className='flex items-center gap-2.5'>
											<Package className='w-4 h-4 text-[var(--tactical-accent-lime-fg)]' />
											<span>{tUI("nav.databaseTitle") || "Từ Điển"}</span>
										</div>
										<svg
											className={`w-3.5 h-3.5 transition-transform ${
												isDatabaseDropdownOpen ? "rotate-180" : ""
											}`}
											fill='none'
											stroke='currentColor'
											viewBox='0 0 24 24'
										>
											<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
										</svg>
									</button>
									
									{isDatabaseDropdownOpen && (
										<div 
											className='ml-4 mt-1 space-y-0.5 border-l-2 border-[var(--tactical-accent-lime-fg)]/40 pl-2 overflow-hidden'
										>
											<NavLink to='/champions' className={dropdownLinkClass} onClick={closeSidebar}>
												<Swords className='w-3.5 h-3.5 text-[var(--tactical-accent-lime-fg)]' /> {tUI("nav.champions")}
											</NavLink>
											<NavLink to='/sub-champions' className={dropdownLinkClass} onClick={closeSidebar}>
												<Users className='w-3.5 h-3.5 text-[var(--tactical-accent-cyan-fg)]' /> {tUI("nav.subChampions")}
											</NavLink>
											<NavLink to='/relics' className={dropdownLinkClass} onClick={closeSidebar}>
												<Sparkles className='w-3.5 h-3.5 text-amber-500' /> {tUI("nav.relics")}
											</NavLink>
											<NavLink to='/items' className={dropdownLinkClass} onClick={closeSidebar}>
												<Package className='w-3.5 h-3.5 text-blue-500' /> {tUI("nav.items")}
											</NavLink>
											<NavLink to='/powers' className={dropdownLinkClass} onClick={closeSidebar}>
												<Zap className='w-3.5 h-3.5 text-yellow-500' /> {tUI("nav.powers")}
											</NavLink>
											<NavLink to='/runes' className={dropdownLinkClass} onClick={closeSidebar}>
												<Gem className='w-3.5 h-3.5 text-purple-500' /> {tUI("nav.runes")}
											</NavLink>
											<NavLink to='/cards' className={dropdownLinkClass} onClick={closeSidebar}>
												<BookOpen className='w-3.5 h-3.5 text-emerald-500' /> {tUI("nav.cards")}
											</NavLink>
											<NavLink to='/resources' className={dropdownLinkClass} onClick={closeSidebar}>
												<Book className='w-3.5 h-3.5 text-rose-500' /> {tUI("nav.resources")}
											</NavLink>
										</div>
									)}
								</div>

								{/* Menu Phiêu Lưu */}
								<div>
									<button
										onClick={() => setIsAdventuresDropdownOpen(!isAdventuresDropdownOpen)}
										className='w-full flex items-center justify-between px-3 py-2 text-xs font-mono-tech uppercase font-bold text-[var(--tactical-text-main)] hover:text-[var(--tactical-accent-cyan-fg)] hover:bg-[var(--tactical-card-hover-bg)] clip-chamfer-sm transition-all'
									>
										<div className='flex items-center gap-2.5'>
											<Map className='w-4 h-4 text-[var(--tactical-accent-cyan-fg)]' />
											<span>{tUI("nav.adventuresTitle") || "Phiêu Lưu"}</span>
										</div>
										<svg
											className={`w-3.5 h-3.5 transition-transform ${
												isAdventuresDropdownOpen ? "rotate-180" : ""
											}`}
											fill='none'
											stroke='currentColor'
											viewBox='0 0 24 24'
										>
											<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
										</svg>
									</button>
									
									{isAdventuresDropdownOpen && (
										<div 
											className='ml-4 mt-1 space-y-0.5 border-l-2 border-[var(--tactical-accent-cyan-fg)]/40 pl-2 overflow-hidden'
										>
											<NavLink to='/maps' className={dropdownLinkClass} onClick={closeSidebar}>
												<Map className='w-3.5 h-3.5 text-[var(--tactical-accent-cyan-fg)]' /> {tUI("nav.maps")}
											</NavLink>
											<NavLink to='/bosses' className={dropdownLinkClass} onClick={closeSidebar}>
												<Swords className='w-3.5 h-3.5 text-red-500' /> {tUI("nav.bosses")}
											</NavLink>
											<NavLink to='/guides' className={dropdownLinkClass} onClick={closeSidebar}>
												<BookMarked className='w-3.5 h-3.5 text-amber-500' /> {tUI("nav.guides")}
											</NavLink>
											<NavLink to='/tools/ratings' className={dropdownLinkClass} onClick={closeSidebar}>
												<Star className='w-3.5 h-3.5 text-yellow-500' /> {tUI("nav.championRatings")}
											</NavLink>
											<NavLink to='/tierlist' className={dropdownLinkClass} onClick={closeSidebar}>
												<BarChartHorizontalBig className='w-3.5 h-3.5 text-[var(--tactical-accent-lime-fg)]' /> {tUI("nav.tierList")}
											</NavLink>
										</div>
									)}
								</div>

								{/* Menu Công Cụ */}
								<div>
									<button
										onClick={() => setIsToolsDropdownOpen(!isToolsDropdownOpen)}
										className='w-full flex items-center justify-between px-3 py-2 text-xs font-mono-tech uppercase font-bold text-[var(--tactical-text-main)] hover:text-amber-500 hover:bg-[var(--tactical-card-hover-bg)] clip-chamfer-sm transition-all'
									>
										<div className='flex items-center gap-2.5'>
											<Wrench className='w-4 h-4 text-amber-500' />
											<span>{tUI("nav.toolsTitle")}</span>
										</div>
										<svg
											className={`w-3.5 h-3.5 transition-transform ${
												isToolsDropdownOpen ? "rotate-180" : ""
											}`}
											fill='none'
											stroke='currentColor'
											viewBox='0 0 24 24'
										>
											<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
										</svg>
									</button>
									
									{isToolsDropdownOpen && (
										<div 
											className='ml-4 mt-1 space-y-0.5 border-l-2 border-amber-500/40 pl-2 overflow-hidden'
										>
											<NavLink to='/simulator/vaults' className={dropdownLinkClass} onClick={closeSidebar}>
												<Gift className='w-3.5 h-3.5 text-blue-500' /> {tUI("nav.vaultSimulator")}
											</NavLink>
											<NavLink to='/tools/card-guess' className={dropdownLinkClass} onClick={closeSidebar}>
												<Eye className='w-3.5 h-3.5 text-purple-500' /> {tUI("nav.cardGuess", "Đoán Lá Bài")}
											</NavLink>
											<NavLink to='/randomizer' className={dropdownLinkClass} onClick={closeSidebar}>
												<LoaderPinwheel className='w-3.5 h-3.5 text-[var(--tactical-accent-lime-fg)]' /> {tUI("nav.randomizer")}
											</NavLink>
											<NavLink to='/tools/champion-items' className={dropdownLinkClass} onClick={closeSidebar}>
												<Package className='w-3.5 h-3.5 text-amber-500' /> {tUI("nav.championItems") || "Item cho tướng"}
											</NavLink>
											<NavLink to='/introduction' className={dropdownLinkClass} onClick={closeSidebar}>
												<BookOpen className='w-3.5 h-3.5 text-cyan-500' /> {tUI("nav.about")}
											</NavLink>
										</div>
									)}
								</div>

								{/* Menu Chọn Ngôn Ngữ */}
								<div>
									<button
										onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
										className='w-full flex items-center justify-between px-3 py-2 text-xs font-mono-tech uppercase font-bold text-[var(--tactical-text-main)] hover:text-[var(--tactical-accent-lime-fg)] hover:bg-[var(--tactical-card-hover-bg)] clip-chamfer-sm transition-all'
									>
										<div className='flex items-center gap-2.5'>
											<Globe className='w-4 h-4 text-[var(--tactical-accent-lime-fg)]' />
											<span>{tUI("nav.language")}</span>
										</div>
										<svg
											className={`w-3.5 h-3.5 transition-transform ${
												isLangDropdownOpen ? "rotate-180" : ""
											}`}
											fill='none'
											stroke='currentColor'
											viewBox='0 0 24 24'
										>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												strokeWidth={2}
												d='M19 9l-7 7-7-7'
											/>
										</svg>
									</button>
									
									{isLangDropdownOpen && (
										<div 
											className='ml-4 mt-1 space-y-0.5 border-l-2 border-[var(--tactical-accent-lime-fg)]/40 pl-2 overflow-hidden'
										>
											<button
												onClick={() => {
													handleLanguageChange("vi");
													closeSidebar();
												}}
												className={`w-full text-left flex items-center gap-2 px-3 py-1.5 text-xs font-mono-tech uppercase font-bold clip-chamfer-sm transition-all ${
													language === "vi" ? "bg-[var(--tactical-accent-lime)] text-black" : "text-[var(--tactical-text-main)] hover:text-[var(--tactical-accent-lime-fg)] hover:bg-[var(--tactical-card-hover-bg)]"
												}`}
											>
												Tiếng Việt
											</button>
											<button
												onClick={() => {
													handleLanguageChange("en");
													closeSidebar();
												}}
												className={`w-full text-left flex items-center gap-2 px-3 py-1.5 text-xs font-mono-tech uppercase font-bold clip-chamfer-sm transition-all ${
													language === "en" ? "bg-[var(--tactical-accent-lime)] text-black" : "text-[var(--tactical-text-main)] hover:text-[var(--tactical-accent-lime-fg)] hover:bg-[var(--tactical-card-hover-bg)]"
												}`}
											>
												English
											</button>
										</div>
									)}
								</div>

								{/* Menu Giao Diện */}
								<button 
									onClick={() => {
										setIsThemeSettingsOpen(true);
										setIsSidebarOpen(false);
									}}
									className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-mono-tech uppercase font-bold text-[var(--tactical-text-main)] hover:text-[var(--tactical-accent-lime-fg)] hover:bg-[var(--tactical-card-hover-bg)] clip-chamfer-sm transition-all"
								>
									<Palette className="w-4 h-4 text-[var(--tactical-accent-lime-fg)]" />
									<span>{tUI("nav.customTheme") || "Cá nhân hóa giao diện"}</span>
								</button>

								<button 
									onClick={() => {
										setIsDonateOpen(true);
										setIsSidebarOpen(false);
									}}
									className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-mono-tech uppercase font-bold text-[var(--tactical-text-main)] hover:text-amber-500 hover:bg-[var(--tactical-card-hover-bg)] clip-chamfer-sm transition-all"
								>
									<Coffee className="w-4 h-4 text-amber-500" />
									<span>{tUI("nav.donateBtn")}</span>
								</button>

								<div className='my-3 border-t border-[var(--tactical-section-border)]'></div>
								{user ? (
									<>
										<div className='flex items-center gap-2.5 px-3 py-1.5 text-xs font-mono-tech text-[var(--tactical-text-sub)]'>
											<User className='w-4 h-4 text-[var(--tactical-accent-cyan-fg)]' />
											<span className='font-bold text-[var(--tactical-text-main)]'>{user.name}</span>
										</div>
										<NavLink
											to='/profile'
											className='flex items-center gap-2.5 px-3 py-2 text-xs font-mono-tech uppercase text-[var(--tactical-text-main)] hover:text-[var(--tactical-accent-cyan-fg)] hover:bg-[var(--tactical-card-hover-bg)] clip-chamfer-sm transition-all'
											onClick={closeSidebar}
										>
											<Settings className='w-4 h-4 text-[var(--tactical-accent-cyan-fg)]' /> {tUI("nav.profile")}
										</NavLink>
										{isAdmin && (
											<NavLink
												to='/admin'
												className='flex items-center gap-2.5 px-3 py-2 text-xs font-mono-tech uppercase font-bold text-[var(--tactical-text-main)] hover:text-[var(--tactical-accent-lime-fg)] hover:bg-[var(--tactical-card-hover-bg)] clip-chamfer-sm transition-all'
												onClick={closeSidebar}
											>
												<Shield className='w-4 h-4 text-[var(--tactical-accent-lime-fg)]' /> {tUI("nav.admin")}
											</NavLink>
										)}
										<button
											onClick={() => {
												setIsLogoutModalOpen(true);
												setIsSidebarOpen(false);
											}}
											className='w-full flex items-center gap-2.5 px-3 py-2 text-xs font-mono-tech uppercase text-red-500 hover:text-red-400 hover:bg-red-500/10 clip-chamfer-sm transition-all'
										>
											<LogOut className='w-4 h-4' /> {tUI("nav.logout")}
										</button>
									</>
								) : (
									<NavLink
										to={`/auth?mode=login&redirect=${encodeURIComponent(location.pathname + location.search)}`}
										className='flex items-center justify-center gap-2 px-4 py-2 bg-[var(--tactical-accent-lime)] text-black font-display uppercase italic text-xs font-black tracking-wider hover:bg-white transition-all -skew-x-12 shadow-[0_0_12px_rgba(210,255,40,0.35)] mt-2'
										onClick={closeSidebar}
									>
										<LogIn className='w-4 h-4 skew-x-12' />
										<span className='skew-x-12'>{tUI("nav.login")}</span>
									</NavLink>
								)}
							</nav>
						</div>
					</div>
				</>
			)}
			

			{/* Logout Modal */}
			<Modal
				isOpen={isLogoutModalOpen}
				onClose={() => setIsLogoutModalOpen(false)}
				title={tUI("nav.confirmLogoutTitle")}
				maxWidth='max-w-sm'
			>
				<div>
					<p className='text-text-secondary flex items-center gap-2'>
						<LogOut className='w-5 h-5 text-red-500' />
						{tUI("nav.confirmLogoutDesc")}
					</p>
					<div className='flex justify-end gap-4 mt-6'>
						<Button variant='ghost' onClick={() => setIsLogoutModalOpen(false)}>
							{tUI("nav.cancel")}
						</Button>
						<Button variant='danger' onClick={confirmLogout}>
							{tUI("nav.logout")}
						</Button>
					</div>
				</div>
			</Modal>

			<ThemeSettings 
				isOpen={isThemeSettingsOpen} 
				onClose={() => setIsThemeSettingsOpen(false)} 
			/>

			<DonateModal 
				isOpen={isDonateOpen} 
				onClose={() => setIsDonateOpen(false)} 
			/>
		</>
	);
}

export default MobileSidebar;
