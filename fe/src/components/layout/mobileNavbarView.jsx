// components/layout/MobileSidebar.jsx
import React, { useContext, useState, useRef, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext.jsx";
import { useTheme } from "@/context/ThemeContext.jsx";
import ThemeSettings from "@/components/common/ThemeSettings.jsx";
import GlobalSearch from "@/components/common/GlobalSearch.jsx";

import Modal from "@/components/common/modal.jsx";
import Button from "@/components/common/button.jsx";
import Logo from "/favicon.ico";

import DonateModal from "@/components/common/DonateModal.jsx";

import {
	User,
	LogIn,
	LogOut,
	Settings,
	Shield,
	Swords,
	Package,
	ScrollText,
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
		"flex items-center gap-2 px-4 py-2 text-sm hover:bg-black/10 ";

	return (
		<>
			{/* Mobile Header */}
			<header
				className='bg-header-bg text-header-text p-2 shadow-xl fixed top-0 left-0 right-0 z-[100] xl:hidden flex items-center justify-between h-14 overflow-visible'
				style={{
					transform: isNavVisible ? 'translateY(0)' : 'translateY(-100%)',
					transition: 'transform 0.3s ease',
				}}
			>
				{/* Logo Section */}
				<div className="flex items-center gap-2 flex-shrink-0">
					<NavLink to='/' className='flex items-center gap-2' onClick={closeSidebar}>
						<img src={Logo} alt='Logo' className='h-8 w-auto rounded' />
						<span className='font-primary text-xl whitespace-nowrap'>
							POC GUIDE
						</span>
					</NavLink>
				</div>

				{/* Search & Menu Section */}
				<div className="flex-1 flex items-center justify-end gap-1 ml-2 min-w-0">
					<div 
						className="relative h-10 flex items-center justify-end"
						transition={{ type: "spring", damping: 25, stiffness: 200 }}
					>
						
							{!isMobileSearchOpen ? (
								<button
									key="search-icon"
									onClick={() => setIsMobileSearchOpen(true)}
									className='p-2 rounded-lg hover:bg-black/10 transition-all text-header-text flex-shrink-0'
									aria-label="Tìm kiếm"
								>
									<Search className='w-5 h-5' />
								</button>
							) : (
								<div 
									key="search-input"
									className="w-full"
								>
									<GlobalSearch 
										compact={true} 
										showClose={true} 
										onClose={() => setIsMobileSearchOpen(false)} 
									/>
								</div>
							)}
						
					</div>
				</div>

				<div className="flex items-center gap-1 flex-shrink-0">
					{/* Menu Hamburger */}
					<button
						onClick={() => setIsSidebarOpen(prev => !prev)}
						className='p-2 rounded-lg hover:bg-black/10 transition-all text-header-text flex-shrink-0'
						aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
					>
						{isSidebarOpen ? <X className='w-6 h-6' /> : <Menu className='w-6 h-6' />}
					</button>
				</div>
			</header>

			
				{isSidebarOpen && (
					<>
						{/* Overlay */}
						<div
							transition={{ duration: 0.3 }}
							className='fixed inset-0 bg-black bg-opacity-50 z-40 xl:hidden'
							onClick={closeSidebar}
						/>

						{/* Sidebar - mở từ bên PHẢI để nhất quán với nút hamburger */}
						<div
							ref={sidebarRef}
							transition={{ type: "spring", damping: 25, stiffness: 200 }}
							className="fixed inset-y-0 right-0 z-50 w-64 bg-header-bg shadow-2xl xl:hidden overflow-y-auto"
						>
							<div className='flex flex-col h-full'>
					<div className='flex items-center justify-between p-3 border-b border-gray-700'>
						<div className='flex items-center gap-2'>
							<img src={Logo} alt='Logo' className='h-8 w-auto rounded' />
							<span className='font-primary text-xl text-header-text'>
								POC GUIDE
							</span>
						</div>
					</div>

					<nav className='flex-1 p-4 space-y-1 text-header-text'>

						{/* Menu Từ Điển */}
						<div>
							<button
								onClick={() => setIsDatabaseDropdownOpen(!isDatabaseDropdownOpen)}
								className='w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-black/10 transition-all'
							>
								<div className='flex items-center gap-3'>
									<Package className='w-5 h-5' /> {tUI("nav.databaseTitle") || "Từ Điển"}
								</div>
								<svg
									className={`w-4 h-4 transition-transform ${
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
										className='ml-6 mt-1 space-y-1 border-l-2 border-gray-600 pl-3 overflow-hidden'
									>
										<NavLink to='/champions' className={dropdownLinkClass} onClick={closeSidebar}>
											<Swords className='w-4 h-4' /> {tUI("nav.champions")}
										</NavLink>
										<NavLink to='/sub-champions' className={dropdownLinkClass} onClick={closeSidebar}>
											<Users className='w-4 h-4' /> {tUI("nav.subChampions")}
										</NavLink>
										<NavLink to='/relics' className={dropdownLinkClass} onClick={closeSidebar}>
											<Sparkles className='w-4 h-4' /> {tUI("nav.relics")}
										</NavLink>
										<NavLink to='/items' className={dropdownLinkClass} onClick={closeSidebar}>
											<Package className='w-4 h-4' /> {tUI("nav.items")}
										</NavLink>
										<NavLink to='/powers' className={dropdownLinkClass} onClick={closeSidebar}>
											<Zap className='w-4 h-4' /> {tUI("nav.powers")}
										</NavLink>
										<NavLink to='/runes' className={dropdownLinkClass} onClick={closeSidebar}>
											<Gem className='w-4 h-4' /> {tUI("nav.runes")}
										</NavLink>
										<NavLink to='/cards' className={dropdownLinkClass} onClick={closeSidebar}>
											<BookOpen className='w-4 h-4' /> {tUI("nav.cards")}
										</NavLink>
										<NavLink to='/resources' className={dropdownLinkClass} onClick={closeSidebar}>
											<Book className='w-4 h-4' /> {tUI("nav.resources")}
										</NavLink>
									</div>
								)}
							
						</div>

						{/* Menu Phiêu Lưu */}
						<div>
							<button
								onClick={() => setIsAdventuresDropdownOpen(!isAdventuresDropdownOpen)}
								className='w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-black/10 transition-all'
							>
								<div className='flex items-center gap-3'>
									<Map className='w-5 h-5' /> {tUI("nav.adventuresTitle") || "Phiêu Lưu"}
								</div>
								<svg
									className={`w-4 h-4 transition-transform ${
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
										className='ml-6 mt-1 space-y-1 border-l-2 border-gray-600 pl-3 overflow-hidden'
									>
										<NavLink to='/maps' className={dropdownLinkClass} onClick={closeSidebar}>
											<Map className='w-4 h-4' /> {tUI("nav.maps")}
										</NavLink>
										<NavLink to='/bosses' className={dropdownLinkClass} onClick={closeSidebar}>
											<Swords className='w-4 h-4' /> {tUI("nav.bosses")}
										</NavLink>
										<NavLink to='/guides' className={dropdownLinkClass} onClick={closeSidebar}>
											<BookMarked className='w-4 h-4' /> {tUI("nav.guides")}
										</NavLink>
										<NavLink to='/builds' className={dropdownLinkClass} onClick={closeSidebar}>
											<ScrollText className='w-4 h-4' /> {tUI("nav.builds")}
										</NavLink>
										<NavLink to='/tools/ratings' className={dropdownLinkClass} onClick={closeSidebar}>
											<Star className='w-4 h-4' /> {tUI("nav.championRatings")}
										</NavLink>
										<NavLink to='/tierlist' className={dropdownLinkClass} onClick={closeSidebar}>
											<BarChartHorizontalBig className='w-4 h-4' /> {tUI("nav.tierList")}
										</NavLink>
									</div>
								)}
							
						</div>

						{/* Menu Công Cụ */}
						<div>
							<button
								onClick={() => setIsToolsDropdownOpen(!isToolsDropdownOpen)}
								className='w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-black/10 transition-all'
							>
								<div className='flex items-center gap-3'>
									<Wrench className='w-5 h-5' /> {tUI("nav.toolsTitle")}
								</div>
								<svg
									className={`w-4 h-4 transition-transform ${
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
										className='ml-6 mt-1 space-y-1 border-l-2 border-gray-600 pl-3 overflow-hidden'
									>
										<NavLink to='/simulator/vaults' className={dropdownLinkClass} onClick={closeSidebar}>
											<Gift className='w-4 h-4' /> {tUI("nav.vaultSimulator")}
										</NavLink>
										<NavLink to='/randomizer' className={dropdownLinkClass} onClick={closeSidebar}>
											<LoaderPinwheel className='w-4 h-4' /> {tUI("nav.randomizer")}
										</NavLink>
										<NavLink to='/tools/champion-items' className={dropdownLinkClass} onClick={closeSidebar}>
											<Package className='w-4 h-4' /> {tUI("nav.championItems") || "Item cho tướng"}
										</NavLink>
										<NavLink to='/introduction' className={dropdownLinkClass} onClick={closeSidebar}>
											<BookOpen className='w-4 h-4' /> {tUI("nav.about")}
										</NavLink>
									</div>
								)}
							
						</div>

						{/* Menu Chọn Ngôn Ngữ */}
						<div>
							<button
								onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
								className='w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-black/10 transition-all'
							>
								<div className='flex items-center gap-3'>
									<Globe className='w-5 h-5' /> {tUI("nav.language")}
								</div>
								<svg
									className={`w-4 h-4 transition-transform ${
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
										className='ml-6 mt-1 space-y-1 border-l-2 border-gray-600 pl-3 overflow-hidden'
									>
										<button
											onClick={() => {
												handleLanguageChange("vi");
												closeSidebar();
											}}
											className={`w-full text-left flex items-center gap-2 px-4 py-2 text-sm hover:bg-black/10  ${language === "vi" ? "font-bold  text-nav-link-text" : ""}`}
										>
											Tiếng Việt
										</button>
										<button
											onClick={() => {
												handleLanguageChange("en");
												closeSidebar();
											}}
											className={`w-full text-left flex items-center gap-2 px-4 py-2 text-sm hover:bg-black/10   ${language === "en" ? "font-bold  text-nav-link-text" : ""}`}
										>
											English
										</button>
									</div>
								)}
							
						</div>

						{/* Menu Giao Diện - Repositioned near Language */}
						<button 
							onClick={() => {
								setIsThemeSettingsOpen(true);
								setIsSidebarOpen(false);
							}}
							className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-black/10 text-sm transition-all text-header-text"
						>
							<Palette className="w-5 h-5" /> {tUI("nav.customTheme") || "Cá nhân hóa giao diện"}
						</button>

						<button 
							onClick={() => {
								setIsDonateOpen(true);
								setIsSidebarOpen(false);
							}}
							className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-black/10 text-sm transition-all text-header-text"
						>
							<Coffee className="w-5 h-5" /> {tUI("nav.donateBtn")}
						</button>

						<div className='my-3 border-t border-gray-700'></div>
						{user ? (
							<>
								<div className='flex items-center gap-3 px-3 py-2 text-sm'>
									<User className='w-5 h-5' />
									<span className='font-medium'>{user.name}</span>
								</div>
								<NavLink
									to='/profile'
									className='flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-black/10 text-sm'
									onClick={closeSidebar}
								>
									<Settings className='w-4 h-4' /> {tUI("nav.profile")}
								</NavLink>
								{isAdmin && (
									<NavLink
										to='/admin'
										className='flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-black/10 text-sm font-semibold'
										onClick={closeSidebar}
									>
										<Shield className='w-4 h-4' /> {tUI("nav.admin")}
									</NavLink>
								)}
								<button
									onClick={() => {
										setIsLogoutModalOpen(true);
										setIsSidebarOpen(false);
									}}
									className='w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-black/10 text-sm'
								>
									<LogOut className='w-4 h-4' /> {tUI("nav.logout")}
								</button>
							</>
						) : (
							<NavLink
								to={`/auth?mode=login&redirect=${encodeURIComponent(location.pathname + location.search)}`}
								className='flex items-center gap-3 px-3 py-2 rounded-lg bg-btn-primary-bg text-btn-primary-text hover:bg-btn-primary-hover-bg'
								onClick={closeSidebar}
							>
								<LogIn className='w-5 h-5' /> {tUI("nav.login")}
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
