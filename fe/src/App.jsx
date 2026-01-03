// src/App.jsx
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Analytics } from "@vercel/analytics/react";
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

// Trang chính
import Home from "./pages/home.jsx";
import Champions from "./pages/championList.jsx";
import Relics from "./pages/relicList.jsx";
import Powers from "./pages/powerList.jsx";
import Items from "./pages/itemList.jsx";
import Builds from "./pages/buildList.jsx";
import Runes from "./pages/runeList.jsx";
import Maps from "./pages/mapList.jsx";
import RandomizerPage from "./pages/randomWheelPage.jsx";
import TierList from "./pages/tierList.jsx";
import GuideListPage from "./pages/guideListPage.jsx";
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

// --- Component chứa Routes ---
function MainContent() {
	const location = useLocation();

	const isAdmin = location.pathname.startsWith("/admin");
	// Danh sách các trang full-width
	const fullWidthPaths = ["/", "/randomizer", "/home", "/introduction"];
	const isFullWidth = isAdmin || fullWidthPaths.includes(location.pathname);

	useEffect(() => {
		if (!location.pathname.startsWith("/admin")) {
			window.scrollTo(0, 0);
		}
		window.scrollTo(0, 0);
	}, [location.pathname]);

	return (
		<main
			className={`flex-grow ${
				!isFullWidth ? "container mx-auto px-2 sm:px-4 py-4 sm:py-8" : ""
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
				<Route path='/tierlist' element={<TierList />} />
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

// --- Component Layout (Mới) ---
// Tách ra để có thể dùng useLocation() kiểm tra đường dẫn admin
function AppLayout() {
	const location = useLocation();
	const isAdminRoute = location.pathname.startsWith("/admin");

	return (
		<div className='flex flex-col min-h-screen'>
			<Navbar />
			<AnnouncementPopup />
			<MainContent />
			{/* Chỉ hiển thị Footer nếu KHÔNG phải là trang admin */}
			{!isAdminRoute && <Footer />}
		</div>
	);
}

// --- Component App ---
function App() {
	return (
		<HelmetProvider>
			<AuthProvider>
				<BrowserRouter>
					{/* Sử dụng AppLayout thay vì viết trực tiếp div ở đây */}
					<AppLayout />
					<Analytics />
				</BrowserRouter>
			</AuthProvider>
		</HelmetProvider>
	);
}

export default App;
