// src/App.jsx
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Analytics } from "@vercel/analytics/react";
import { useTranslation } from "./hooks/useTranslation";
// Context xác thực
import { AuthProvider } from "./context/AuthContext.jsx";

// Trang chi tiết
import ChampionDetail from "./components/champion/championDetail.jsx";
import RelicDetail from "./components/relic/relicDetail.jsx";
import PowerDetail from "./components/power/powerDetail.jsx";
import ItemDetail from "./components/item/itemDetail.jsx";
import BuildDetail from "./components/build/buildDetail.jsx";
import RuneDetail from "./components/rune/runeDetail.jsx";
import GuideDetail from "./components/guide/guideDetail.jsx";
import AdventureMapDetail from "./components/map/adventureMapDetail.jsx";

// Trang chính
import Home from "./pages/home.jsx";
import Champions from "./pages/championList.jsx";
import Relics from "./pages/relicList.jsx";
import Powers from "./pages/powerList.jsx";
import Items from "./pages/itemList.jsx";
import Builds from "./pages/buildList.jsx";
import Runes from "./pages/runeList.jsx";
import Maps from "./pages/adventureMapList.jsx";
import RandomizerPage from "./pages/randomWheelPage.jsx";
import GuideListPage from "./pages/guideListPage.jsx";
import TierListIndex from "./pages/tierList.jsx";

// Đăng nhập / Đăng ký
import AuthContainer from "./components/auth/authContainer.jsx";
import Profile from "./components/auth/profile.jsx";

// Layout chung
import Navbar from "./components/layout/navbar.jsx";
import Footer from "./components/layout/footer.jsx";

// Trang thông tin
import AboutUs from "./components/about/aboutUs.jsx";
import TermsOfUse from "./components/about/termsOfUse.jsx";
import Introduction from "./components/about/introduction.jsx";
import AnnouncementPopup from "./components/common/AnnouncementPopup";

// Luồng admin
import AdminPanel from "./components/admin/adminPanel.jsx";
import PrivateRoute from "./components/admin/privateRoute.jsx";

import usePageTracking from "./hooks/usePageTracking";

// --- Component chứa Routes ---
function MainContent() {
	usePageTracking();
	const location = useLocation();

	const isAdmin = location.pathname.startsWith("/admin");
	// Danh sách các trang full-width
	const fullWidthPaths = ["/", "/randomizer", "/home", "/introduction"];
	const isFullWidth = isAdmin || fullWidthPaths.includes(location.pathname);

	useEffect(() => {
		if (!location.pathname.startsWith("/admin")) {
			window.scrollTo(0, 0);
		}
	}, [location.pathname]);

	return (
		<main
			className={`flex-grow ${
				isAdmin
					? 'overflow-hidden flex flex-col'
					: !isFullWidth ? "container mx-auto sm:px-4 py-2 sm:py-8" : ""
			}`}
		>
			<Routes>
				{/* Trang chủ & Randomizer - full width */}
				<Route path='/' element={<Home />} />
				<Route path='/home' element={<Home />} />
				<Route path='/randomizer' element={<RandomizerPage />} />

				{/* Các trang khác - có container */}

				<Route path='/profile' element={<Profile />} />
				<Route path='/champions' element={<Champions />} />
				<Route path='/champion/:championID' element={<ChampionDetail />} />
				<Route path='/relics' element={<Relics />} />
				<Route path='/relic/:relicCode' element={<RelicDetail />} />
				<Route path='/powers' element={<Powers />} />
				<Route path='/power/:powerCode' element={<PowerDetail />} />
				<Route path='/items' element={<Items />} />
				<Route path='/item/:itemCode' element={<ItemDetail />} />
				<Route path='/builds' element={<Builds />} />
				<Route path='/builds/:tab' element={<Builds />} />
				<Route path='/builds/detail/:buildId' element={<BuildDetail />} />
				<Route path='/runes' element={<Runes />} />
				<Route path='/rune/:runeCode' element={<RuneDetail />} />
				<Route path='/guides' element={<GuideListPage />} />
				<Route path='/guides/:slug' element={<GuideDetail />} />
				<Route path='/maps' element={<Maps />} />
				<Route path='/map/:adventureID' element={<AdventureMapDetail />} />
				<Route path='/tierlist' element={<TierListIndex />} />
				<Route path='/tierlist/champions' element={<TierListIndex />} />
				<Route path='/tierlist/relics' element={<TierListIndex />} />
				<Route
					path='/auth'
					element={<AuthContainer onClose={() => window.history.back()} />}
				/>
				<Route path='/about-us' element={<AboutUs />} />
				<Route path='/terms-of-use' element={<TermsOfUse />} />
				<Route path='/introduction' element={<Introduction />} />

				{/* Admin Routes - vẫn dùng container */}
				<Route element={<PrivateRoute />}>
					<Route path='/admin/*' element={<AdminPanel />} />
				</Route>
			</Routes>
		</main>
	);
}

// --- Component Layout ---
function AppLayout() {
	const location = useLocation();
	const isAdminRoute = location.pathname.startsWith("/admin");

	return (
		<div className={isAdminRoute
			? 'flex flex-col h-screen overflow-hidden'
			: 'flex flex-col min-h-screen'
		}>
			<Navbar />
			<AnnouncementPopup />
			<MainContent />
			{!isAdminRoute && <Footer />}
		</div>
	);
}

// --- Component App ---
function App() {
	// Lấy cờ trạng thái loading ngôn ngữ
	const { isLangLoading } = useTranslation();

	// Hiển thị màn hình chờ (Skeleton Loading) nếu ngôn ngữ đang được tải
	if (isLangLoading) {
		return (
			<div className='fixed inset-0 z-50 bg-[#0f172a] p-4 flex flex-col'>
				{/* Skeleton Navbar */}
				<div className='h-16 w-full bg-white/5 rounded-2xl animate-pulse mb-8'></div>

				{/* Skeleton Body (Giả lập cấu trúc trang) */}
				<div className='flex-grow flex flex-col items-center justify-center w-full max-w-5xl mx-auto gap-6'>
					{/* Giả lập Badge/Icon */}
					<div className='h-8 w-32 bg-white/5 rounded-full animate-pulse mb-4'></div>

					{/* Giả lập Heading lớn */}
					<div className='h-16 md:h-24 w-3/4 bg-white/5 rounded-3xl animate-pulse'></div>

					{/* Giả lập Đoạn mô tả */}
					<div className='h-6 md:h-8 w-1/2 bg-white/5 rounded-full animate-pulse mb-8'></div>

					{/* Giả lập 2 Nút bấm */}
					<div className='flex flex-col sm:flex-row gap-6'>
						<div className='h-14 w-48 bg-white/5 rounded-full animate-pulse'></div>
						<div className='h-14 w-48 bg-white/5 rounded-full animate-pulse'></div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<HelmetProvider>
			<AuthProvider>
				<BrowserRouter>
					<AppLayout />
				</BrowserRouter>
			</AuthProvider>
		</HelmetProvider>
	);
}

export default App;
