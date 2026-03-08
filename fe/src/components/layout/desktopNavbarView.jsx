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
	Globe, // Import thêm icon Globe cho nút ngôn ngữ
} from "lucide-react";

// Nhận props language và toggleLanguage
function DesktopNavbar({ language, toggleLanguage }) {
	const { user, logout, isAdmin } = useContext(AuthContext);
	const navigate = useNavigate();

	const [isProfileOpen, setIsProfileOpen] = useState(false);
	const [isItemsDropdownOpen, setIsItemsDropdownOpen] = useState(false);
	const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);
	const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

	const profileMenuRef = useRef(null);
	const itemsDropdownRef = useRef(null);
	const toolsDropdownRef = useRef(null);

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
	};

	useEffect(() => {
		const handleClickOutside = event => {
			const refs = [
				{ ref: profileMenuRef, setter: setIsProfileOpen },
				{ ref: itemsDropdownRef, setter: setIsItemsDropdownOpen },
				{ ref: toolsDropdownRef, setter: setIsToolsDropdownOpen },
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
							{language === "vi" ? "Bộ cổ vật" : "Builds"}
						</NavLink>
						<NavLink to='/champions' className={navLinkClass}>
							<Swords className='w-6 h-6' />{" "}
							{language === "vi" ? "Tướng" : "Champions"}
						</NavLink>

						<NavLink to='/tierlist' className={navLinkClass}>
							<BarChartHorizontalBig className='w-6 h-6' />
							{language === "vi" ? "Bảng Xếp Hạng" : "Tier List"}
						</NavLink>

						<div
							className='relative'
							ref={itemsDropdownRef}
							onMouseEnter={() => setIsItemsDropdownOpen(true)}
							onMouseLeave={() => setIsItemsDropdownOpen(false)}
						>
							<button className='flex items-center gap-2 px-4 rounded-lg hover:bg-nav-hover-bg transition-all'>
								<Package className='w-6 h-6' />{" "}
								{language === "vi" ? "Vật phẩm" : "Items"}
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
								<div className='absolute z-50 left-0 w-48 bg-dropdown-bg border border-dropdown-border rounded-lg shadow-xl py-2'>
									<NavLink
										to='/items'
										className={dropdownLinkClass}
										onClick={handleNavClick}
									>
										<Package className='w-5 h-5' />{" "}
										{language === "vi" ? "Vật phẩm" : "Items"}
									</NavLink>
									<NavLink
										to='/relics'
										className={dropdownLinkClass}
										onClick={handleNavClick}
									>
										<Sparkles className='w-5 h-5' />{" "}
										{language === "vi" ? "Cổ vật" : "Relics"}
									</NavLink>
									<NavLink
										to='/powers'
										className={dropdownLinkClass}
										onClick={handleNavClick}
									>
										<Zap className='w-5 h-5' />{" "}
										{language === "vi" ? "Sức mạnh" : "Powers"}
									</NavLink>
									<NavLink
										to='/runes'
										className={dropdownLinkClass}
										onClick={handleNavClick}
									>
										<Gem className='w-5 h-5' />{" "}
										{language === "vi" ? "Ngọc" : "Runes"}
									</NavLink>
									<NavLink
										to='/maps'
										className={dropdownLinkClass}
										onClick={handleNavClick}
									>
										<Map className='w-5 h-5' />{" "}
										{language === "vi" ? "Bản Đồ" : "Maps"}
									</NavLink>
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
								{language === "vi" ? "Công cụ" : "Tools"}
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
								<div className='absolute z-50 left-0 w-48 bg-dropdown-bg border border-dropdown-border rounded-lg shadow-xl py-2'>
									<NavLink
										to='/randomizer'
										className={dropdownLinkClass}
										onClick={handleNavClick}
									>
										<LoaderPinwheel className='w-5 h-5' />{" "}
										{language === "vi" ? "Vòng quay" : "Randomizer"}
									</NavLink>
									<NavLink
										to='/introduction'
										className={dropdownLinkClass}
										onClick={handleNavClick}
									>
										<BookOpen className='w-5 h-5' />{" "}
										{language === "vi" ? "Giới thiệu" : "About"}
									</NavLink>
									<NavLink
										to='/guides'
										className={dropdownLinkClass}
										onClick={handleNavClick}
									>
										<BookMarked className='w-6 h-6' />{" "}
										{language === "vi" ? "Hướng Dẫn" : "Guides"}
									</NavLink>
								</div>
							)}
						</div>

						<div className='ml-4 flex items-center gap-2'>
							{/* === NÚT CHUYỂN NGÔN NGỮ === */}
							<button
								onClick={toggleLanguage}
								className='flex items-center gap-1 py-2 px-3 rounded-lg hover:bg-nav-hover-bg transition-all border border-border'
								title={
									language === "vi"
										? "Chuyển sang Tiếng Anh"
										: "Switch to Vietnamese"
								}
							>
								<Globe className='w-5 h-5' />
								<span className='font-bold'>
									{language === "vi" ? "VN" : "EN"}
								</span>
							</button>

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
										<div className='absolute right-0 mt-2 w-56 bg-dropdown-bg border border-dropdown-border rounded-lg shadow-xl py-2 z-50'>
											<NavLink
												to='/profile'
												className={dropdownLinkClass}
												onClick={handleNavClick}
											>
												<Settings className='w-4 h-4' />{" "}
												{language === "vi" ? "Thông tin" : "Profile"}
											</NavLink>
											{isAdmin && (
												<NavLink
													to='/admin'
													className={`${dropdownLinkClass} font-semibold text-text-link-admin`}
													onClick={handleNavClick}
												>
													<Shield className='w-4 h-4' />
													{language === "vi" ? "Trang quản lý" : "Admin Panel"}
												</NavLink>
											)}
											<button
												onClick={() => setIsLogoutModalOpen(true)}
												className={`${dropdownLinkClass} w-full text-left`}
											>
												<LogOut className='w-4 h-4' />{" "}
												{language === "vi" ? "Đăng xuất" : "Logout"}
											</button>
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
									{language === "vi" ? "Đăng nhập" : "Login"}
								</NavLink>
							)}
						</div>
					</nav>
				</div>
			</header>

			<Modal
				isOpen={isLogoutModalOpen}
				onClose={() => setIsLogoutModalOpen(false)}
				title={language === "vi" ? "Xác nhận Đăng xuất" : "Confirm Logout"}
				maxWidth='max-w-sm'
			>
				<div>
					<p className='text-text-secondary flex items-center gap-2'>
						<LogOut className='w-5 h-5 text-red-500' />
						{language === "vi"
							? "Bạn có chắc chắn muốn kết thúc phiên làm việc này không?"
							: "Are you sure you want to log out?"}
					</p>
					<div className='flex justify-end gap-4 mt-6'>
						<Button variant='ghost' onClick={() => setIsLogoutModalOpen(false)}>
							{language === "vi" ? "Hủy" : "Cancel"}
						</Button>
						<Button variant='danger' onClick={confirmLogout}>
							{language === "vi" ? "Đăng xuất" : "Logout"}
						</Button>
					</div>
				</div>
			</Modal>
		</>
	);
}

export default DesktopNavbar;
