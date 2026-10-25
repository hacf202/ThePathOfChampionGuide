// components/layout/DesktopNavbar.jsx
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
	Gift,
	BookMarked,
	Map,
	BarChartHorizontalBig,
	Globe,
	Star,
	Sun,
	Moon,
	Palette,
	Book,
	Users,
	Coffee,
	Eye,
} from "lucide-react";

function DesktopNavbar({ language, handleLanguageChange, tUI, isNavVisible }) {
	const { user, logout, isAdmin } = useContext(AuthContext);
	const { theme, toggleTheme } = useTheme();
	const navigate = useNavigate();
	const location = useLocation();

	const [isProfileOpen, setIsProfileOpen] = useState(false);
	const [isDatabaseDropdownOpen, setIsDatabaseDropdownOpen] = useState(false);
	const [isAdventuresDropdownOpen, setIsAdventuresDropdownOpen] = useState(false);
	const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);
	const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
	const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
	const [isThemeSettingsOpen, setIsThemeSettingsOpen] = useState(false);
	const [isDonateOpen, setIsDonateOpen] = useState(false);

	const profileMenuRef = useRef(null);
	const databaseDropdownRef = useRef(null);
	const adventuresDropdownRef = useRef(null);
	const toolsDropdownRef = useRef(null);
	const langDropdownRef = useRef(null);

	const confirmLogout = () => {
		logout();
		setIsLogoutModalOpen(false);
		closeAllMenus();
		navigate("/");
	};

	const closeAllMenus = () => {
		setIsProfileOpen(false);
		setIsDatabaseDropdownOpen(false);
		setIsAdventuresDropdownOpen(false);
		setIsToolsDropdownOpen(false);
		setIsLangDropdownOpen(false);
	};

	useEffect(() => {
		const handleClickOutside = event => {
			const refs = [
				{ ref: profileMenuRef, setter: setIsProfileOpen },
				{ ref: databaseDropdownRef, setter: setIsDatabaseDropdownOpen },
				{ ref: adventuresDropdownRef, setter: setIsAdventuresDropdownOpen },
				{ ref: toolsDropdownRef, setter: setIsToolsDropdownOpen },
				{ ref: langDropdownRef, setter: setIsLangDropdownOpen },
			];

			refs.forEach(({ ref, setter }) => {
				if (ref.current && !ref.current.contains(event.target)) {
					setter(false);
				}
			});
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const navLinkClass = ({ isActive }) =>
		`flex items-center gap-2 py-1.5 px-3.5 text-xs font-mono-tech uppercase font-bold tracking-wider transition-all duration-200 clip-chamfer-sm border ${
			isActive
				? "bg-[var(--tactical-accent-lime)] text-black border-[var(--tactical-accent-lime)] shadow-[0_0_12px_rgba(210,255,40,0.35)] -skew-x-6"
				: "text-[var(--tactical-text-main)] border-transparent hover:border-[var(--tactical-card-border)] hover:text-[var(--tactical-accent-lime-fg)] hover:bg-[var(--tactical-card-hover-bg)]"
		}`;

	const dropdownLinkClass =
		"flex items-center gap-2.5 px-3.5 py-2 text-xs font-mono-tech uppercase font-bold tracking-wide text-[var(--tactical-text-main)] hover:text-[var(--tactical-accent-lime-fg)] hover:bg-[var(--tactical-card-hover-bg)] clip-chamfer-sm transition-all";

	const handleNavClick = () => closeAllMenus();

	return (
		<>
			<header
				className='bg-[var(--tactical-header-bg)] backdrop-blur-md border-b border-[var(--tactical-section-border)] text-[var(--tactical-text-main)] py-2.5 px-2 shadow-2xl fixed top-0 left-0 right-0 z-[100] font-primary hidden xl:block'
				style={{
					transform: isNavVisible ? 'translateY(0)' : 'translateY(-100%)',
					transition: 'transform 0.3s ease',
				}}
			>
				<div className='w-full px-6 flex justify-between items-center'>
					<div className='flex items-center gap-8 flex-1'>
						<NavLink
							to='/'
							className='flex items-center gap-2.5 group'
							onClick={handleNavClick}
						>
							<img
								src="/favicon.ico"
								alt='Logo'
								className='h-8 w-auto object-contain transition-transform duration-300 group-hover:scale-110'
							/>
							<div className="bg-[#D2FF28] text-black font-display text-xl px-2.5 py-0.5 italic transform -skew-x-12 group-hover:bg-white transition font-black tracking-wide">
								POC GUIDE
							</div>
						</NavLink>

						<nav className='flex items-center gap-1.5'>
							{/* Dropdown Từ Điển */}
							<div
								className='relative'
								ref={databaseDropdownRef}
								onMouseEnter={() => setIsDatabaseDropdownOpen(true)}
								onMouseLeave={() => setIsDatabaseDropdownOpen(false)}
							>
								<button className='flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono-tech uppercase font-bold tracking-wider text-[var(--tactical-text-main)] hover:text-[var(--tactical-accent-lime-fg)] hover:bg-[var(--tactical-card-hover-bg)] clip-chamfer-sm border border-transparent hover:border-[var(--tactical-card-border)] transition-all'>
									<Package className='w-4 h-4 text-[var(--tactical-accent-lime-fg)]' />
									<span>{tUI("nav.databaseTitle") || "Từ Điển"}</span>
									<svg
										className={`w-3.5 h-3.5 transition-transform ${
											isDatabaseDropdownOpen ? "rotate-180 text-[var(--tactical-accent-lime-fg)]" : "text-[var(--tactical-text-dim)]"
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

								{isDatabaseDropdownOpen && (
									<div 
										transition={{ duration: 0.2 }}
										className='absolute z-50 left-0 top-full pt-1.5'
									>
										<div className='w-56 bg-[var(--tactical-dropdown-bg)] border border-[var(--tactical-section-border)] clip-chamfer-sm shadow-2xl p-1.5 space-y-0.5'>
											<NavLink to='/champions' className={dropdownLinkClass} onClick={handleNavClick}>
												<Swords className='w-4 h-4 text-[var(--tactical-accent-lime-fg)]' /> {tUI("nav.champions")}
											</NavLink>
											<NavLink to='/sub-champions' className={dropdownLinkClass} onClick={handleNavClick}>
												<Users className='w-4 h-4 text-[var(--tactical-accent-cyan-fg)]' /> {tUI("nav.subChampions") || "Sub-Champions"}
											</NavLink>
											<NavLink to='/relics' className={dropdownLinkClass} onClick={handleNavClick}>
												<Sparkles className='w-4 h-4 text-amber-500' /> {tUI("nav.relics")}
											</NavLink>
											<NavLink to='/items' className={dropdownLinkClass} onClick={handleNavClick}>
												<Package className='w-4 h-4 text-blue-500' /> {tUI("nav.items")}
											</NavLink>
											<NavLink to='/powers' className={dropdownLinkClass} onClick={handleNavClick}>
												<Zap className='w-4 h-4 text-yellow-500' /> {tUI("nav.powers")}
											</NavLink>
											<NavLink to='/runes' className={dropdownLinkClass} onClick={handleNavClick}>
												<Gem className='w-4 h-4 text-purple-500' /> {tUI("nav.runes")}
											</NavLink>
											<NavLink to='/cards' className={dropdownLinkClass} onClick={handleNavClick}>
												<BookOpen className='w-4 h-4 text-emerald-500' /> {tUI("nav.cards")}
											</NavLink>
											<NavLink to='/resources' className={dropdownLinkClass} onClick={handleNavClick}>
												<Book className='w-4 h-4 text-rose-500' /> {tUI("nav.resources")}
											</NavLink>
										</div>
									</div>
								)}
							</div>

							{/* Dropdown Phiêu Lưu */}
							<div
								className='relative'
								ref={adventuresDropdownRef}
								onMouseEnter={() => setIsAdventuresDropdownOpen(true)}
								onMouseLeave={() => setIsAdventuresDropdownOpen(false)}
							>
								<button className='flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono-tech uppercase font-bold tracking-wider text-[var(--tactical-text-main)] hover:text-[var(--tactical-accent-cyan-fg)] hover:bg-[var(--tactical-card-hover-bg)] clip-chamfer-sm border border-transparent hover:border-[var(--tactical-card-border)] transition-all'>
									<Map className='w-4 h-4 text-[var(--tactical-accent-cyan-fg)]' />
									<span>{tUI("nav.adventuresTitle") || "Phiêu Lưu"}</span>
									<svg
										className={`w-3.5 h-3.5 transition-transform ${
											isAdventuresDropdownOpen ? "rotate-180 text-[var(--tactical-accent-cyan-fg)]" : "text-[var(--tactical-text-dim)]"
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

								{isAdventuresDropdownOpen && (
									<div 
										transition={{ duration: 0.2 }}
										className='absolute z-50 left-0 top-full pt-1.5'
									>
										<div className='w-56 bg-[var(--tactical-dropdown-bg)] border border-[var(--tactical-section-border)] clip-chamfer-sm shadow-2xl p-1.5 space-y-0.5'>
											<NavLink to='/maps' className={dropdownLinkClass} onClick={handleNavClick}>
												<Map className='w-4 h-4 text-[var(--tactical-accent-cyan-fg)]' /> {tUI("nav.maps")}
											</NavLink>
											<NavLink to='/bosses' className={dropdownLinkClass} onClick={handleNavClick}>
												<Swords className='w-4 h-4 text-red-500' /> {tUI("nav.bosses")}
											</NavLink>
											<NavLink to='/guides' className={dropdownLinkClass} onClick={handleNavClick}>
												<BookMarked className='w-4 h-4 text-amber-500' /> {tUI("nav.guides")}
											</NavLink>
											<NavLink to='/tools/ratings' className={dropdownLinkClass} onClick={handleNavClick}>
												<Star className='w-4 h-4 text-yellow-500' /> {tUI("nav.championRatings")}
											</NavLink>
											<NavLink to='/tierlist' className={dropdownLinkClass} onClick={handleNavClick}>
												<BarChartHorizontalBig className='w-4 h-4 text-[var(--tactical-accent-lime-fg)]' /> {tUI("nav.tierList")}
											</NavLink>
										</div>
									</div>
								)}
							</div>

							{/* Dropdown Công Cụ */}
							<div
								className='relative'
								ref={toolsDropdownRef}
								onMouseEnter={() => setIsToolsDropdownOpen(true)}
								onMouseLeave={() => setIsToolsDropdownOpen(false)}
							>
								<button className='flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono-tech uppercase font-bold tracking-wider text-[var(--tactical-text-main)] hover:text-amber-500 hover:bg-[var(--tactical-card-hover-bg)] clip-chamfer-sm border border-transparent hover:border-[var(--tactical-card-border)] transition-all'>
									<Wrench className='w-4 h-4 text-amber-500' />
									<span>{tUI("nav.toolsTitle")}</span>
									<svg
										className={`w-3.5 h-3.5 transition-transform ${
											isToolsDropdownOpen ? "rotate-180 text-amber-500" : "text-[var(--tactical-text-dim)]"
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
									<div 
										transition={{ duration: 0.2 }}
										className='absolute z-50 left-0 top-full pt-1.5'
									>
										<div className='w-56 bg-[var(--tactical-dropdown-bg)] border border-[var(--tactical-section-border)] clip-chamfer-sm shadow-2xl p-1.5 space-y-0.5'>
											<NavLink to='/simulator/vaults' className={dropdownLinkClass} onClick={handleNavClick}>
												<Gift className='w-4 h-4 text-blue-500' /> {tUI("nav.vaultSimulator")}
											</NavLink>
											<NavLink to='/tools/card-guess' className={dropdownLinkClass} onClick={handleNavClick}>
												<Eye className='w-4 h-4 text-purple-500' /> {tUI("nav.cardGuess", "Đoán Lá Bài")}
											</NavLink>
											<NavLink to='/randomizer' className={dropdownLinkClass} onClick={handleNavClick}>
												<LoaderPinwheel className='w-4 h-4 text-[var(--tactical-accent-lime-fg)]' /> {tUI("nav.randomizer")}
											</NavLink>
											<NavLink to='/tools/champion-items' className={dropdownLinkClass} onClick={handleNavClick}>
												<Package className='w-4 h-4 text-amber-500' /> {tUI("nav.championItems") || "Item cho tướng"}
											</NavLink>
											<NavLink to='/introduction' className={dropdownLinkClass} onClick={handleNavClick}>
												<BookOpen className='w-4 h-4 text-cyan-500' /> {tUI("nav.about")}
											</NavLink>
										</div>
									</div>
								)}
							</div>
						</nav>
					</div>

					<div className='flex items-center gap-2'>
						{/* Thanh tìm kiếm inline */}
						<GlobalSearch />

						<button 
							onClick={() => setIsThemeSettingsOpen(true)}
							className="p-2 bg-[var(--tactical-card-bg)] hover:bg-[var(--tactical-card-hover-bg)] border border-[var(--tactical-card-border)] hover:border-[var(--tactical-accent-lime)] text-[var(--tactical-text-main)] hover:text-[var(--tactical-accent-lime-fg)] clip-chamfer-sm transition-all"
							title="Theme personalization"
						>
							<Palette className="w-4 h-4" />
						</button>

						<div
							className='relative'
							ref={langDropdownRef}
							onMouseEnter={() => setIsLangDropdownOpen(true)}
							onMouseLeave={() => setIsLangDropdownOpen(false)}
						>
							<button className='flex items-center gap-1.5 py-1.5 px-3 bg-[var(--tactical-card-bg)] hover:bg-[var(--tactical-card-hover-bg)] border border-[var(--tactical-card-border)] hover:border-[var(--tactical-accent-lime)] text-xs font-mono-tech font-bold text-[var(--tactical-text-main)] hover:text-[var(--tactical-accent-lime-fg)] clip-chamfer-sm transition-all'>
								<Globe className='w-3.5 h-3.5 text-[var(--tactical-accent-lime-fg)]' />
								<span>
									{language === "vi" ? "VN" : "EN"}
								</span>
								<svg
									className={`w-3 h-3 transition-transform ${
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
									transition={{ duration: 0.2 }}
									className='absolute z-50 right-0 top-full pt-1.5'
								>
									<div className='w-36 bg-[var(--tactical-dropdown-bg)] border border-[var(--tactical-section-border)] clip-chamfer-sm shadow-2xl p-1 space-y-0.5'>
										<button
											onClick={() => {
												handleLanguageChange("vi");
												closeAllMenus();
											}}
											className={`w-full flex items-center px-3 py-2 text-xs font-mono-tech uppercase font-bold clip-chamfer-sm transition-all ${
												language === "vi"
													? "bg-[var(--tactical-accent-lime)] text-black font-bold"
													: "text-[var(--tactical-text-main)] hover:text-[var(--tactical-accent-lime-fg)] hover:bg-[var(--tactical-card-hover-bg)]"
											}`}
										>
											Tiếng Việt
										</button>
										<button
											onClick={() => {
												handleLanguageChange("en");
												closeAllMenus();
											}}
											className={`w-full flex items-center px-3 py-2 text-xs font-mono-tech uppercase font-bold clip-chamfer-sm transition-all ${
												language === "en"
													? "bg-[var(--tactical-accent-lime)] text-black font-bold"
													: "text-[var(--tactical-text-main)] hover:text-[var(--tactical-accent-lime-fg)] hover:bg-[var(--tactical-card-hover-bg)]"
											}`}
										>
											English
										</button>
									</div>
								</div>
							)}
						</div>

						{/* Nút Donate */}
						<button 
							onClick={() => setIsDonateOpen(true)}
							className="p-2 bg-[var(--tactical-card-bg)] hover:bg-[var(--tactical-card-hover-bg)] border border-[var(--tactical-card-border)] hover:border-amber-400 text-[var(--tactical-text-main)] hover:text-amber-500 clip-chamfer-sm transition-all"
							title={tUI("nav.donateTitle")}
						>
							<Coffee className="w-4 h-4" />
						</button>

						{user ? (
							<div className='relative' ref={profileMenuRef}>
								<button
									onClick={() => setIsProfileOpen(!isProfileOpen)}
									className='flex items-center gap-2 py-1.5 px-3 bg-[var(--tactical-card-bg)] hover:bg-[var(--tactical-card-hover-bg)] border border-[var(--tactical-card-border)] hover:border-[var(--tactical-accent-cyan)] text-xs font-mono-tech font-bold text-[var(--tactical-text-main)] hover:text-[var(--tactical-accent-cyan-fg)] clip-chamfer-sm transition-all'
								>
									<span className='font-bold whitespace-nowrap truncate max-w-[100px] lg:max-w-[150px] xl:max-w-[200px] text-right'>{user.name}</span>
									<User className='h-4 w-4 text-[var(--tactical-accent-cyan-fg)] flex-shrink-0' />
								</button>
								
								{isProfileOpen && (
									<div 
										transition={{ duration: 0.2 }}
										className='absolute z-50 right-0 top-full pt-1.5'
									>
										<div className='w-56 bg-[var(--tactical-dropdown-bg)] border border-[var(--tactical-section-border)] clip-chamfer-sm shadow-2xl p-1.5 space-y-0.5'>
											<NavLink
												to='/profile'
												className={dropdownLinkClass}
												onClick={handleNavClick}
											>
												<Settings className='w-4 h-4 text-[var(--tactical-accent-cyan-fg)]' /> {tUI("nav.profile")}
											</NavLink>
											{isAdmin && (
												<NavLink
													to='/admin'
													className={`${dropdownLinkClass} font-semibold`}
													onClick={handleNavClick}
												>
													<Shield className='w-4 h-4 text-[var(--tactical-accent-lime-fg)]' />
													{tUI("nav.admin")}
												</NavLink>
											)}
											<button
												onClick={() => setIsLogoutModalOpen(true)}
												className={`${dropdownLinkClass} w-full text-left text-red-500 hover:text-red-400 hover:bg-red-500/10`}
											>
												<LogOut className='w-4 h-4' /> {tUI("nav.logout")}
											</button>
										</div>
									</div>
								)}
							</div>
						) : (
							<NavLink
								to={`/auth?mode=login&redirect=${encodeURIComponent(location.pathname + location.search)}`}
								onClick={handleNavClick}
								className='flex items-center gap-1.5 py-1.5 px-3.5 bg-[var(--tactical-accent-lime)] text-black font-display uppercase italic text-xs font-black tracking-wider hover:bg-white transition-all -skew-x-12 shadow-[0_0_12px_rgba(210,255,40,0.35)] whitespace-nowrap flex-shrink-0'
							>
								<LogIn className='h-4 w-4 skew-x-12' />
								<span className='skew-x-12'>{tUI("nav.login")}</span>
							</NavLink>
						)}
					</div>
				</div>
			</header>

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

export default DesktopNavbar;
