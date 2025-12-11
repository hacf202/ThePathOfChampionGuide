// src/App.jsx
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async"; // Import HelmetProvider

// Context xác thực
import { AuthProvider } from "./context/AuthContext.jsx";

// Trang chi tiết
import ChampionDetail from "./components/champion/championDetail.jsx";
import RelicDetail from "./components/relic/relicDetail.jsx";
import PowerDetail from "./components/power/powerDetail.jsx";
import ItemDetail from "./components/item/itemDetail.jsx";
import BuildDetail from "./components/build/buildDetail.jsx";
import RuneDetail from "./components/rune/runeDetail.jsx";

// Trang chính
import Home from "./pages/home.jsx";
import Champions from "./pages/championList.jsx";
import Relics from "./pages/relicList.jsx";
import Powers from "./pages/powerList.jsx";
import Items from "./pages/itemList.jsx";
import Builds from "./pages/buildList.jsx";
import Runes from "./pages/runeList.jsx";
import RandomizerPage from "./pages/randomWheelPage.jsx";

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
import GuidePage from "./components/guide/GuidePage.jsx";
import GuideListPage from "./pages/guideListPage.jsx";
import AnnouncementPopup from "./components/common/AnnouncementPopup";

// Luồng admin
import AdminPanel from "./components/admin/adminPanel.jsx";
import ChampionEditor from "./components/admin/championEditor.jsx";
import PowerEditor from "./components/admin/powerEditor";
import RelicEditor from "./components/admin/relicEditor.jsx";
import ItemEditor from "./components/admin/itemEditor.jsx";
import RuneEditor from "./components/admin/runeEditor.jsx";
import BuildEditor from "./components/admin/buildEditor.jsx";
import PrivateRoute from "./components/admin/privateRoute.jsx";
import GuideEditor from "./components/admin/guideEditor.jsx";
// --- Component Layout có điều kiện ---
function MainContent() {
	const location = useLocation();

	// Danh sách các trang full-width
	const fullWidthPaths = [
		"/",
		"/randomizer",
		"/home",
		"/admin",
		"/introduction",
	];
	const isFullWidth = fullWidthPaths.includes(location.pathname);

	useEffect(() => {
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

				<Route
					path='/auth'
					element={<AuthContainer onClose={() => window.history.back()} />}
				/>
				<Route path='/about-us' element={<AboutUs />} />
				<Route path='/terms-of-use' element={<TermsOfUse />} />
				<Route path='/introduction' element={<Introduction />} />
				<Route path='/guides' element={<GuideListPage />} />
				<Route path='/guides/:slug' element={<GuidePage />} />

				{/* Admin Routes - vẫn dùng container */}
				<Route element={<PrivateRoute />}>
					<Route path='/admin' element={<AdminPanel />} />
					<Route path='/admin/championEditor' element={<ChampionEditor />} />
					<Route path='/admin/powerEditor' element={<PowerEditor />} />
					<Route path='/admin/relicEditor' element={<RelicEditor />} />
					<Route path='/admin/itemEditor' element={<ItemEditor />} />
					<Route path='/admin/runeEditor' element={<RuneEditor />} />
					<Route path='/admin/buildEditor' element={<BuildEditor />} />
					<Route path='/admin/guideEditor' element={<GuideEditor />} />
					<Route path='/admin/guideEditor/:slug' element={<GuideEditor />} />
				</Route>
			</Routes>
		</main>
	);
}

// --- Component App ---
function App() {
	return (
		<HelmetProvider>
			{/* Bọc toàn bộ ứng dụng */}
			<AuthProvider>
				<BrowserRouter>
					<div className='flex flex-col min-h-screen'>
						<Navbar />
						<AnnouncementPopup />
						<MainContent />
						<Footer />
					</div>
				</BrowserRouter>
			</AuthProvider>
		</HelmetProvider>
	);
}

export default App;
