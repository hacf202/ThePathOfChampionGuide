// src/App.jsx
import { useEffect, useMemo } from "react";
import { 
	createBrowserRouter, 
	RouterProvider, 
	Routes, 
	Route, 
	useLocation, 
	Outlet,
	Navigate,
	useNavigate
} from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Analytics } from "@vercel/analytics/react";
import { useTranslation } from "./hooks/useTranslation";
// Context xác thực
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";

// Trang chi tiết
import ChampionDetail from "./components/champion/championDetail.jsx";
import RelicDetail from "./components/relic/relicDetail.jsx";
import PowerDetail from "./components/power/powerDetail.jsx";
import ItemDetail from "./components/item/itemDetail.jsx";
import BuildDetail from "./components/build/buildDetail.jsx";
import RuneDetail from "./components/rune/runeDetail.jsx";
import GuideDetail from "./components/guide/guideDetail.jsx";
import AdventureMapDetail from "./components/map/adventureMapDetail.jsx";
import CardDetail from "./components/card/cardDetail.jsx";

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
import VaultSimulator from "./pages/vaultSimulator.jsx";
import CardList from "./pages/cardList.jsx";
import ChampionRatingPage from "./pages/championRatingPage.jsx";
import ErrorPage from "./pages/ErrorPage.jsx";


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
import GoogleAd from "./components/common/googleAd";

// Luồng admin
import AdminPanel from "./components/admin/adminPanel.jsx";
import PrivateRoute from "./components/admin/privateRoute.jsx";

import usePageTracking from "./hooks/usePageTracking";
import { initEntities } from "./utils/entityLookup";

// --- Component chứa Logic Main Content ---
function MainContentContainer() {
	usePageTracking();
	const location = useLocation();

	const isAdmin = location.pathname.startsWith("/admin");
	// Danh sách các trang full-width
	const fullWidthPaths = ["/", "/randomizer", "/home", "/introduction", "/simulator/vaults", "/tools/ratings"];
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
			<Outlet />
		</main>
	);
}

// --- Component Layout chính của Router ---
function AppLayout() {
	const location = useLocation();
	const isAdminRoute = location.pathname.startsWith("/admin");

	// Danh sách các trang không cần bọc container phụ (đã có layout riêng hoặc là full-width)
	const isSpecialRoute = 
		isAdminRoute ||
		location.pathname === "/" ||
		location.pathname === "/home" ||
		location.pathname === "/randomizer" ||
		location.pathname === "/introduction" ||
		location.pathname === "/simulator/vaults";

	return (
		<div
			className={
				isAdminRoute
					? "flex flex-col h-screen overflow-hidden"
					: "flex flex-col min-h-screen"
			}
		>
			<Navbar />
			<AnnouncementPopup />

			{isSpecialRoute ? (
				<MainContentContainer />
			) : (
				<div className='flex justify-center relative w-full'>
					{/* MAIN CONTENT AREA for sub-pages - Center without side ads */}
					<div className='flex-1 min-w-0 max-w-[1500px]'>
						<MainContentContainer />
					</div>
				</div>
			)}

			{!isAdminRoute && <Footer />}
			<Analytics />
		</div>
	);
}

// --- Định nghĩa Cấu trúc Route Objects cho Data Router ---
const router = createBrowserRouter([
	{
		path: "/",
		element: <AppLayout />,
		errorElement: <ErrorPage />,
		children: [
			{ index: true, element: <Home /> },
			{ path: "home", element: <Home /> },
			{ path: "randomizer", element: <RandomizerPage /> },
			{ path: "simulator/vaults", element: <VaultSimulator /> },
			{ path: "tools/ratings", element: <ChampionRatingPage /> },
			{ path: "profile", element: <Profile /> },
			{ path: "champions", element: <Champions /> },
			{ path: "champion/:championID", element: <ChampionDetail /> },
			{ path: "relics", element: <Relics /> },
			{ path: "relic/:relicCode", element: <RelicDetail /> },
			{ path: "powers", element: <Powers /> },
			{ path: "power/:powerCode", element: <PowerDetail /> },
			{ path: "items", element: <Items /> },
			{ path: "item/:itemCode", element: <ItemDetail /> },
			{ path: "builds", element: <Builds /> },
			{ path: "builds/:tab", element: <Builds /> },
			{ path: "builds/detail/:buildId", element: <BuildDetail /> },
			{ path: "runes", element: <Runes /> },
			{ path: "rune/:runeCode", element: <RuneDetail /> },
			{ path: "guides", element: <GuideListPage /> },
			{ path: "guides/:slug", element: <GuideDetail /> },
			{ path: "maps", element: <Maps /> },
			{ path: "map/:adventureID", element: <AdventureMapDetail /> },
			{ path: "cards", element: <CardList /> },
			{ path: "card/:cardCode", element: <CardDetail /> },
			{ path: "tierlist", element: <TierListIndex /> },
			{ path: "tierlist/champions", element: <TierListIndex /> },
			{ path: "tierlist/relics", element: <TierListIndex /> },
			{ 
				path: "auth", 
				element: <AuthContainer onClose={() => window.history.back()} /> 
			},
			{ path: "about-us", element: <AboutUs /> },
			{ path: "terms-of-use", element: <TermsOfUse /> },
			{ path: "introduction", element: <Introduction /> },
			// Admin Routes Protected
			{
				element: <PrivateRoute />,
				children: [
					{ path: "admin/*", element: <AdminPanel /> }
				]
			}
		]
	}
]);

// --- Component App Gốc ---
function App() {
	const { isLangLoading } = useTranslation();

	useEffect(() => {
		initEntities();
	}, []);

	if (isLangLoading) {
		return (
			<div className='fixed inset-0 z-50 bg-[#0f172a] p-4 flex flex-col'>
				<div className='h-16 w-full bg-white/5 rounded-2xl animate-pulse mb-8'></div>
				<div className='flex-grow flex flex-col items-center justify-center w-full max-w-5xl mx-auto gap-6'>
					<div className='h-8 w-32 bg-white/5 rounded-full animate-pulse mb-4'></div>
					<div className='h-16 md:h-24 w-3/4 bg-white/5 rounded-3xl animate-pulse'></div>
					<div className='h-6 md:h-8 w-1/2 bg-white/5 rounded-full animate-pulse mb-8'></div>
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
				<ThemeProvider>
					<RouterProvider router={router} />
				</ThemeProvider>
			</AuthProvider>
		</HelmetProvider>
	);
}

export default App;
