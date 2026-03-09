// components/layout/DesktopNavbar.jsx
import React, { useContext, useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext.jsx";

import Modal from "../common/modal.jsx";
import Button from "../common/button.jsx";
import Logo from "/ahriicon.png";

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
	BookMarked,
	Map,
	BarChartHorizontalBig,
	Globe,
} from "lucide-react";

function DesktopNavbar({ language, handleLanguageChange, tUI }) {
	const { user, logout, isAdmin } = useContext(AuthContext);
	const navigate = useNavigate();

	const [isProfileOpen, setIsProfileOpen] = useState(false);
	const [isItemsDropdownOpen, setIsItemsDropdownOpen] = useState(false);
	const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);
	const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
	const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

	const profileMenuRef = useRef(null);
	const itemsDropdownRef = useRef(null);
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
		setIsItemsDropdownOpen(false);
		setIsToolsDropdownOpen(false);
		setIsLangDropdownOpen(false);
	};

	useEffect(() => {
		const handleClickOutside = event => {
			const refs = [
				{ ref: profileMenuRef, setter: setIsProfileOpen },
				{ ref: itemsDropdownRef, setter: setIsItemsDropdownOpen },
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
		`flex items-center gap-2 py-2 px-4 rounded-lg transition-all duration-200 hover:bg-nav-hover-bg hover:scale-105 text-nav-link-text relative ${
			isActive
				? "font-bold underline-active-center active"
				: "underline-active-center"
		}`;

	const dropdownLinkClass =
		"flex items-center gap-2 px-4 py-2 text-sm text-dropdown-item-text hover:bg-dropdown-item-hover-bg transition-colors";

	const handleNavClick = () => closeAllMenus();

	return (
		<>
			<header className='bg-header-bg text-header-text p-2 shadow-xl sticky top-0 z-50 font-secondary hidden xl:block'>
				<div className='container mx-auto flex justify-between items-center'>
					<NavLink
						to='/'
						className='flex items-center group'
						onClick={handleNavClick}
					>
						<img
							src={Logo}
							alt='Logo'
							className='h-10 w-auto object-contain rounded-lg transition-transform duration-300 group-hover:scale-110'
						/>
						<span className='ml-2 font-primary text-3xl'>POC GUIDE</span>
					</NavLink>

					<nav className='flex items-center gap-1'>
						<NavLink to='/builds' className={navLinkClass}>
							<ScrollText className='w-6 h-6' />{" "}
							{tUI("nav.builds") || "Bộ cổ vật"}
						</NavLink>
						<NavLink to='/champions' className={navLinkClass}>
							<Swords className='w-6 h-6' /> {tUI("nav.champions") || "Tướng"}
						</NavLink>

						<NavLink to='/tierlist' className={navLinkClass}>
							<BarChartHorizontalBig className='w-6 h-6' />
							{tUI("nav.tierList") || "Bảng Xếp Hạng"}
						</NavLink>

						<div
							className='relative'
							ref={itemsDropdownRef}
							onMouseEnter={() => setIsItemsDropdownOpen(true)}
							onMouseLeave={() => setIsItemsDropdownOpen(false)}
						>
							<button className='flex items-center gap-2 px-4 rounded-lg hover:bg-nav-hover-bg transition-all'>
								<Package className='w-6 h-6' />{" "}
								{tUI("nav.itemsTitle") || "Vật phẩm"}
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
								<div className='absolute z-50 left-0 top-full pt-1'>
									<div className='w-48 bg-dropdown-bg border border-dropdown-border rounded-lg shadow-xl py-2'>
										<NavLink
											to='/items'
											className={dropdownLinkClass}
											onClick={handleNavClick}
										>
											<Package className='w-5 h-5' />{" "}
											{tUI("nav.items") || "Vật phẩm"}
										</NavLink>
										<NavLink
											to='/relics'
											className={dropdownLinkClass}
											onClick={handleNavClick}
										>
											<Sparkles className='w-5 h-5' />{" "}
											{tUI("nav.relics") || "Cổ vật"}
										</NavLink>
										<NavLink
											to='/powers'
											className={dropdownLinkClass}
											onClick={handleNavClick}
										>
											<Zap className='w-5 h-5' />{" "}
											{tUI("nav.powers") || "Sức mạnh"}
										</NavLink>
										<NavLink
											to='/runes'
											className={dropdownLinkClass}
											onClick={handleNavClick}
										>
											<Gem className='w-5 h-5' /> {tUI("nav.runes") || "Ngọc"}
										</NavLink>
										<NavLink
											to='/maps'
											className={dropdownLinkClass}
											onClick={handleNavClick}
										>
											<Map className='w-5 h-5' /> {tUI("nav.maps") || "Bản Đồ"}
										</NavLink>
									</div>
								</div>
							)}
						</div>

						<div
							className='relative'
							ref={toolsDropdownRef}
							onMouseEnter={() => setIsToolsDropdownOpen(true)}
							onMouseLeave={() => setIsToolsDropdownOpen(false)}
						>
							<button className='flex items-center gap-2 py-2 px-4 rounded-lg hover:bg-nav-hover-bg transition-all'>
								<Wrench className='w-6 h-6' />{" "}
								{tUI("nav.toolsTitle") || "Công cụ"}
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
								<div className='absolute z-50 left-0 top-full pt-1'>
									<div className='w-48 bg-dropdown-bg border border-dropdown-border rounded-lg shadow-xl py-2'>
										<NavLink
											to='/randomizer'
											className={dropdownLinkClass}
											onClick={handleNavClick}
										>
											<LoaderPinwheel className='w-5 h-5' />{" "}
											{tUI("nav.randomizer") || "Vòng quay"}
										</NavLink>
										<NavLink
											to='/introduction'
											className={dropdownLinkClass}
											onClick={handleNavClick}
										>
											<BookOpen className='w-5 h-5' />{" "}
											{tUI("nav.about") || "Giới thiệu"}
										</NavLink>
										<NavLink
											to='/guides'
											className={dropdownLinkClass}
											onClick={handleNavClick}
										>
											<BookMarked className='w-6 h-6' />{" "}
											{tUI("nav.guides") || "Hướng Dẫn"}
										</NavLink>
									</div>
								</div>
							)}
						</div>

						<div className='ml-4 flex items-center gap-2'>
							{/* === DROPDOWN NGÔN NGỮ ĐÃ ĐƯỢC FIX LỖI HOVER === */}
							<div
								className='relative'
								ref={langDropdownRef}
								onMouseEnter={() => setIsLangDropdownOpen(true)}
								onMouseLeave={() => setIsLangDropdownOpen(false)}
							>
								<button className='flex items-center gap-1 py-2 px-3 rounded-lg hover:bg-nav-hover-bg transition-all border border-border'>
									<Globe className='w-5 h-5' />
									<span className='font-bold'>
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
									<div className='absolute z-50 right-0 top-full pt-1'>
										<div className='w-32 bg-dropdown-bg border border-dropdown-border rounded-lg shadow-xl py-2'>
											<button
												onClick={() => {
													handleLanguageChange("vi");
													closeAllMenus();
												}}
												className={`w-full flex items-center px-4 py-2 text-sm transition-colors hover:bg-dropdown-item-hover-bg ${
													language === "vi"
														? "font-bold text-blue-500"
														: "text-dropdown-item-text"
												}`}
											>
												Tiếng Việt
											</button>
											<button
												onClick={() => {
													handleLanguageChange("en");
													closeAllMenus();
												}}
												className={`w-full flex items-center px-4 py-2 text-sm transition-colors hover:bg-dropdown-item-hover-bg ${
													language === "en"
														? "font-bold text-blue-500"
														: "text-dropdown-item-text"
												}`}
											>
												English
											</button>
										</div>
									</div>
								)}
							</div>

							{user ? (
								<div className='relative' ref={profileMenuRef}>
									<button
										onClick={() => setIsProfileOpen(!isProfileOpen)}
										className='flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-nav-hover-bg transition-all hover:scale-105'
									>
										<span className='text-sm font-medium'>{user.name}</span>
										<User className='h-8 w-8' />
									</button>
									{isProfileOpen && (
										<div className='absolute z-50 right-0 top-full pt-1'>
											<div className='w-56 bg-dropdown-bg border border-dropdown-border rounded-lg shadow-xl py-2'>
												<NavLink
													to='/profile'
													className={dropdownLinkClass}
													onClick={handleNavClick}
												>
													<Settings className='w-4 h-4' />{" "}
													{tUI("nav.profile") || "Thông tin"}
												</NavLink>
												{isAdmin && (
													<NavLink
														to='/admin'
														className={`${dropdownLinkClass} font-semibold text-text-link-admin`}
														onClick={handleNavClick}
													>
														<Shield className='w-4 h-4' />
														{tUI("nav.admin") || "Trang quản lý"}
													</NavLink>
												)}
												<button
													onClick={() => setIsLogoutModalOpen(true)}
													className={`${dropdownLinkClass} w-full text-left`}
												>
													<LogOut className='w-4 h-4' />{" "}
													{tUI("nav.logout") || "Đăng xuất"}
												</button>
											</div>
										</div>
									)}
								</div>
							) : (
								<NavLink
									to='/auth'
									onClick={handleNavClick}
									className='flex items-center gap-2 py-2 px-4 rounded-lg bg-btn-primary-bg text-btn-primary-text hover:bg-btn-primary-hover-bg transition-all hover:scale-105'
								>
									<LogIn className='h-5 w-5' />{" "}
									{tUI("nav.login") || "Đăng nhập"}
								</NavLink>
							)}
						</div>
					</nav>
				</div>
			</header>

			<Modal
				isOpen={isLogoutModalOpen}
				onClose={() => setIsLogoutModalOpen(false)}
				title={tUI("nav.confirmLogoutTitle") || "Xác nhận Đăng xuất"}
				maxWidth='max-w-sm'
			>
				<div>
					<p className='text-text-secondary flex items-center gap-2'>
						<LogOut className='w-5 h-5 text-red-500' />
						{tUI("nav.confirmLogoutDesc") ||
							"Bạn có chắc chắn muốn kết thúc phiên làm việc này không?"}
					</p>
					<div className='flex justify-end gap-4 mt-6'>
						<Button variant='ghost' onClick={() => setIsLogoutModalOpen(false)}>
							{tUI("nav.cancel") || "Hủy"}
						</Button>
						<Button variant='danger' onClick={confirmLogout}>
							{tUI("nav.logout") || "Đăng xuất"}
						</Button>
					</div>
				</div>
			</Modal>
		</>
	);
}

export default DesktopNavbar;
