// components/layout/MobileSidebar.jsx
import React, { useContext, useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import ThemeSettings from "../common/ThemeSettings.jsx";

import Modal from "../common/modal.jsx";
import Button from "../common/button.jsx";
import Logo from "/favicon.ico";

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
} from "lucide-react";

function MobileSidebar({ language, handleLanguageChange, tUI }) {
	const { user, logout, isAdmin } = useContext(AuthContext);
	const { theme, toggleTheme } = useTheme();
	const navigate = useNavigate();

	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [isItemsDropdownOpen, setIsItemsDropdownOpen] = useState(false);
	const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);
	const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
	const [isHeaderLangOpen, setIsHeaderLangOpen] = useState(false);
	const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
	const [isThemeSettingsOpen, setIsThemeSettingsOpen] = useState(false);

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
		setIsItemsDropdownOpen(false);
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
			<header className='bg-header-bg text-header-text p-2 shadow-xl sticky top-0 z-50 xl:hidden flex items-center justify-between'>
				<NavLink to='/' className='flex items-center gap-2' onClick={closeSidebar}>
					<img src={Logo} alt='Logo' className='h-8 w-auto rounded' />
					<span className='font-primary text-xl'>POC GUIDE</span>
				</NavLink>

				<div className='flex items-center gap-2'>
					<button
						onClick={() => setIsSidebarOpen(prev => !prev)}
						className='p-2 rounded-lg hover:bg-black/10 transition-all'
						aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
					>
						{isSidebarOpen
							? <X className='w-6 h-6' />
							: <Menu className='w-6 h-6' />
						}
					</button>
				</div>
			</header>

			{/* Sidebar - mở từ bên PHẢI để nhất quán với nút hamburger */}
			<div
				ref={sidebarRef}
				className={`fixed inset-y-0 right-0 z-50 w-72 bg-header-bg shadow-2xl transform transition-transform duration-300 ease-in-out ${
					isSidebarOpen ? "translate-x-0" : "translate-x-full"
				} xl:hidden overflow-y-auto`}
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

						{/* Menu Vật Phẩm */}
						<div>
							<button
								onClick={() => setIsItemsDropdownOpen(!isItemsDropdownOpen)}
								className='w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-black/10 transition-all'
							>
								<div className='flex items-center gap-3'>
									<Package className='w-5 h-5' /> {tUI("nav.itemsTitle")}
								</div>
								<svg
									className={`w-4 h-4 transition-transform ${
										isItemsDropdownOpen ? "rotate-180" : ""
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
							{isItemsDropdownOpen && (
								<div className='ml-6 mt-1 space-y-1 border-l-2 border-gray-600 pl-3'>
									<NavLink
										to='/champions'
										className={dropdownLinkClass}
										onClick={closeSidebar}
									>
										<Swords className='w-4 h-4' /> {tUI("nav.champions")}
									</NavLink>
									<NavLink
										to='/items'
										className={dropdownLinkClass}
										onClick={closeSidebar}
									>
										<Package className='w-4 h-4' /> {tUI("nav.items")}
									</NavLink>
									<NavLink
										to='/relics'
										className={dropdownLinkClass}
										onClick={closeSidebar}
									>
										<Sparkles className='w-4 h-4' /> {tUI("nav.relics")}
									</NavLink>
									<NavLink
										to='/powers'
										className={dropdownLinkClass}
										onClick={closeSidebar}
									>
										<Zap className='w-4 h-4' /> {tUI("nav.powers")}
									</NavLink>
									<NavLink
										to='/runes'
										className={dropdownLinkClass}
										onClick={closeSidebar}
									>
										<Gem className='w-4 h-4' /> {tUI("nav.runes")}
									</NavLink>
									<NavLink
										to='/maps'
										className={dropdownLinkClass}
										onClick={closeSidebar}
									>
										<Map className='w-4 h-4' /> {tUI("nav.maps")}
									</NavLink>
									<NavLink
										to='/builds'
										className={dropdownLinkClass}
										onClick={closeSidebar}
									>
										<ScrollText className='w-4 h-4' /> {tUI("nav.builds")}
									</NavLink>
									<NavLink
										to='/cards'
										className={dropdownLinkClass}
										onClick={closeSidebar}
									>
										<BookOpen className='w-4 h-4' /> {tUI("nav.cards")}
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
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M19 9l-7 7-7-7'
									/>
								</svg>
							</button>
							{isToolsDropdownOpen && (
								<div className='ml-6 mt-1 space-y-1 border-l-2 border-gray-600 pl-3'>
									<NavLink
										to='/tierlist'
										className={dropdownLinkClass}
										onClick={closeSidebar}
									>
										<BarChartHorizontalBig className='w-4 h-4' />{" "}
										{tUI("nav.tierList")}
									</NavLink>
									<NavLink
										to='/randomizer'
										className={dropdownLinkClass}
										onClick={closeSidebar}
									>
										<LoaderPinwheel className='w-4 h-4' />{" "}
										{tUI("nav.randomizer")}
									</NavLink>
									<NavLink
										to='/simulator/vaults'
										className={dropdownLinkClass}
										onClick={closeSidebar}
									>
										<Gift className='w-4 h-4' /> {tUI("nav.vaultSimulator")}
									</NavLink>
									<NavLink
										to='/tools/ratings'
										className={dropdownLinkClass}
										onClick={closeSidebar}
									>
										<Star className='w-4 h-4' />{" "}
										{tUI("nav.championRatings")}
									</NavLink>
									<NavLink
										to='/introduction'
										className={dropdownLinkClass}
										onClick={closeSidebar}
									>
										<BookOpen className='w-4 h-4' /> {tUI("nav.about")}
									</NavLink>
									<NavLink
										to='/guides'
										className={dropdownLinkClass}
										onClick={closeSidebar}
									>
										<BookMarked className='w-4 h-4' /> {tUI("nav.guides")}
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
								<div className='ml-6 mt-1 space-y-1 border-l-2 border-gray-600 pl-3'>
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
								to='/auth?mode=login'
								className='flex items-center gap-3 px-3 py-2 rounded-lg bg-btn-primary-bg text-btn-primary-text hover:bg-btn-primary-hover-bg'
								onClick={closeSidebar}
							>
								<LogIn className='w-5 h-5' /> {tUI("nav.login")}
							</NavLink>
						)}
					</nav>
				</div>
			</div>

			{/* Overlay */}
			{isSidebarOpen && (
				<div
					className='fixed inset-0 bg-black bg-opacity-50 z-40 xl:hidden'
					onClick={closeSidebar}
				></div>
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
		</>
	);
}

export default MobileSidebar;
