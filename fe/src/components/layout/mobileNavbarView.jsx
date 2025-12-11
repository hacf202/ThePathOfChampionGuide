// components/layout/MobileSidebar.jsx
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
	Menu,
	X,
	BookMarked,
	BookCopy,
} from "lucide-react";

function MobileSidebar() {
	const { user, logout, isAdmin } = useContext(AuthContext);
	const navigate = useNavigate();

	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [isItemsDropdownOpen, setIsItemsDropdownOpen] = useState(false);
	const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);
	const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

	const sidebarRef = useRef(null);

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
	};

	useEffect(() => {
		const handleClickOutside = event => {
			if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
				closeSidebar();
			}
		};

		if (isSidebarOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [isSidebarOpen]);

	const dropdownLinkClass =
		"flex items-center gap-2 px-4 py-2 text-sm hover:bg-dropdown-item-hover-bg transition-colors";

	return (
		<>
			{/* Mobile Header */}
			<header className='bg-header-bg text-header-text p-4 shadow-xl sticky top-0 z-50 xl:hidden flex items-center justify-between'>
				<NavLink to='/' className='flex items-center gap-2'>
					<img src={Logo} alt='Logo' className='h-8 w-auto rounded' />
					<span className='font-primary text-xl'>POC GUIDE</span>
				</NavLink>

				<button
					onClick={() => setIsSidebarOpen(true)}
					className='p-2 rounded-lg hover:bg-nav-hover-bg transition-all'
				>
					<Menu className='w-6 h-6' />
				</button>
			</header>

			{/* Sidebar */}
			<div
				ref={sidebarRef}
				className={`fixed inset-y-0 left-0 z-50 w-72 bg-header-bg shadow-2xl transform transition-transform duration-300 ease-in-out ${
					isSidebarOpen ? "translate-x-0" : "-translate-x-full"
				} xl:hidden overflow-y-auto`}
			>
				<div className='flex flex-col h-full'>
					<div className='flex items-center justify-between p-4 border-b border-gray-700'>
						<div className='flex items-center gap-2'>
							<img src={Logo} alt='Logo' className='h-8 w-auto rounded' />
							<span className='font-primary text-xl text-header-text'>
								POC GUIDE
							</span>
						</div>
						<button
							onClick={closeSidebar}
							className='p-1 rounded-lg hover:bg-gray-700 transition-colors'
						>
							<X className='w-6 h-6' />
						</button>
					</div>

					<nav className='flex-1 p-4 space-y-1  text-header-text'>
						<NavLink
							to='/builds'
							className='flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-nav-hover-bg transition-all'
							onClick={closeSidebar}
						>
							<ScrollText className='w-5 h-5' /> Bộ Cổ Vật
						</NavLink>
						<NavLink
							to='/champions'
							className='flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-nav-hover-bg transition-all'
							onClick={closeSidebar}
						>
							<Swords className='w-5 h-5' /> Tướng
						</NavLink>{" "}
						<NavLink
							to='/champions'
							className='flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-nav-hover-bg transition-all'
							onClick={closeSidebar}
						>
							<BookMarked className='w-5 h-5' />
							Hướng Dẫn
						</NavLink>
						<div>
							<button
								onClick={() => setIsItemsDropdownOpen(!isItemsDropdownOpen)}
								className='w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-nav-hover-bg transition-all'
							>
								<div className='flex items-center gap-3 '>
									<Package className='w-5 h-5' /> Vật phẩm
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
								<div className='  ml-6 mt-1 space-y-1 border-l-2 border-gray-600 pl-3'>
									<NavLink
										to='/items'
										className={dropdownLinkClass}
										onClick={closeSidebar}
									>
										<Package className='w-4 h-4' /> Vật phẩm
									</NavLink>
									<NavLink
										to='/relics'
										className={dropdownLinkClass}
										onClick={closeSidebar}
									>
										<Sparkles className='w-4 h-4' /> Cổ vật
									</NavLink>
									<NavLink
										to='/powers'
										className={dropdownLinkClass}
										onClick={closeSidebar}
									>
										<Zap className='w-4 h-4' /> Sức mạnh
									</NavLink>
									<NavLink
										to='/runes'
										className={dropdownLinkClass}
										onClick={closeSidebar}
									>
										<Gem className='w-4 h-4' /> Ngọc
									</NavLink>
								</div>
							)}
						</div>
						<div>
							<button
								onClick={() => setIsToolsDropdownOpen(!isToolsDropdownOpen)}
								className='w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-nav-hover-bg transition-all'
							>
								<div className='flex items-center gap-3'>
									<Wrench className='w-5 h-5' /> Công cụ
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
								<div className='ml-6 mt-1 space-y-1 border-l-2 border-gray-600 pl-3 '>
									<NavLink
										to='/randomizer'
										className={dropdownLinkClass}
										onClick={closeSidebar}
									>
										<LoaderPinwheel className='w-4 h-4 ' /> Vòng quay
									</NavLink>
									<NavLink
										to='/introduction'
										className={dropdownLinkClass}
										onClick={closeSidebar}
									>
										<BookOpen className='w-4 h-4' /> Giới thiệu
									</NavLink>
								</div>
							)}
						</div>
						<div className='my-3 border-t border-gray-700'></div>
						{user ? (
							<>
								<div className='flex items-center gap-3 px-3 py-2 text-sm'>
									<User className='w-5 h-5' />
									<span className='font-medium'>{user.name}</span>
								</div>
								<NavLink
									to='/profile'
									className='flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-nav-hover-bg text-sm'
									onClick={closeSidebar}
								>
									<Settings className='w-4 h-4' /> Thông tin
								</NavLink>
								{isAdmin && (
									<NavLink
										to='/admin'
										className='flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-nav-hover-bg text-sm font-semibold'
										onClick={closeSidebar}
									>
										<Shield className='w-4 h-4' /> Admin Panel
									</NavLink>
								)}
								<button
									onClick={() => {
										setIsLogoutModalOpen(true);
										setIsSidebarOpen(false);
									}}
									className='w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-900/30 text-sm'
								>
									<LogOut className='w-4 h-4' /> Đăng xuất
								</button>
							</>
						) : (
							<NavLink
								to='/auth'
								className='flex items-center gap-3 px-3 py-2 rounded-lg bg-btn-primary-bg text-btn-primary-text hover:bg-btn-primary-hover-bg'
								onClick={closeSidebar}
							>
								<LogIn className='w-5 h-5' /> Đăng nhập
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
				title='Xác nhận Đăng xuất'
				maxWidth='max-w-sm'
			>
				<div>
					<p className='text-text-secondary flex items-center gap-2'>
						<LogOut className='w-5 h-5 text-red-500' />
						Bạn có chắc chắn muốn kết thúc phiên làm việc này không?
					</p>
					<div className='flex justify-end gap-4 mt-6'>
						<Button variant='ghost' onClick={() => setIsLogoutModalOpen(false)}>
							Hủy
						</Button>
						<Button variant='danger' onClick={confirmLogout}>
							Đăng xuất
						</Button>
					</div>
				</div>
			</Modal>
		</>
	);
}

export default MobileSidebar;
