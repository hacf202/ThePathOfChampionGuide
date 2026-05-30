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
import ChampionDetail from "@/features/champions/components/championDetail.jsx";
import RelicDetail from "@/features/relics/components/relicDetail.jsx";
import PowerDetail from "@/features/powers/components/powerDetail.jsx";
import ItemDetail from "@/features/items/components/itemDetail.jsx";
import BuildDetail from "@/features/builds/components/buildDetail.jsx";
import RuneDetail from "@/features/runes/components/runeDetail.jsx";
import GuideDetail from "@/features/guides/components/guideDetail.jsx";
import AdventureMapDetail from "@/features/adventureMaps/components/adventureMapDetail.jsx";
import CardDetail from "@/features/cards/components/cardDetail.jsx";
import ResourceDetailPage from "@/features/resources/pages/resourceDetailPage.jsx";

// Trang chính
import Home from "./pages/home.jsx";
import Champions from "@/features/champions/pages/championList.jsx";
import Relics from "@/features/relics/pages/relicList.jsx";
import Powers from "@/features/powers/pages/powerList.jsx";
import Items from "@/features/items/pages/itemList.jsx";
import Builds from "@/features/builds/pages/buildList.jsx";
import Runes from "@/features/runes/pages/runeList.jsx";
import Maps from "@/features/adventureMaps/pages/adventureMapList.jsx";
import RandomizerPage from "@/features/tools/randomWheel/pages/randomWheelPage.jsx";
import GuideListPage from "@/features/guides/pages/guideListPage.jsx";
import TierListIndex from "@/features/tools/tierList/tierList.jsx";
import VaultSimulator from "@/features/tools/vaultSimulator/vaultSimulator.jsx";
import CardList from "@/features/cards/pages/cardList.jsx";
import ChampionRatingPage from "@/features/tools/championRating/championRatingPage.jsx";
import SubChampionList from "@/features/champions/pages/subChampionList.jsx";
import ResourceListPage from "@/features/resources/pages/resourceListPage.jsx";
import BossListPage from "@/features/bosses/pages/BossListPage.jsx";
import BossDetailPage from "@/features/bosses/components/BossDetailPage.jsx";
import ChampionItems from "@/features/tools/championItems/pages/championItems.jsx";

import ErrorPage from "./pages/ErrorPage.jsx";
import ResetPassword from "@/features/auth/pages/ResetPassword.jsx";


// Đăng nhập / Đăng ký
import AuthContainer from "@/features/auth/pages/authContainer.jsx";
import Profile from "@/features/auth/pages/profile.jsx";

// Layout chung
import Navbar from "./components/layout/navbar.jsx";
import Footer from "./components/layout/footer.jsx";

// Trang thông tin
import AboutUs from "@/features/about/pages/aboutUs.jsx";
import TermsOfUse from "@/features/about/pages/termsOfUse.jsx";
import Introduction from "@/features/about/pages/introduction.jsx";

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
	const fullWidthPaths = ["/", "/randomizer", "/home", "/introduction", "/simulator/vaults", "/tools/ratings", "/tools/champion-items"];
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
					? 'overflow-hidden flex flex-col h-screen'
					: !isFullWidth ? "container mx-auto sm:px-4 py-2 sm:py-8 min-h-[80vh]" : "min-h-screen"
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

	// Danh sách các trang không cần bọc container phụ (đã có riêng hoặc là full-width)
	const isSpecialRoute = 
		isAdminRoute ||
		location.pathname === "/" ||
		location.pathname === "/home" ||
		location.pathname === "/randomizer" ||
		location.pathname === "/introduction" ||
		location.pathname === "/simulator/vaults" ||
		location.pathname === "/tools/ratings" ||
		location.pathname === "/tools/champion-items";

	return (
		<div
			className={
				isAdminRoute
					? "flex flex-col h-screen overflow-hidden"
					: "flex flex-col min-h-screen overflow-x-hidden"
			}
		>
			<Navbar />

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
			{ path: "sub-champions", element: <SubChampionList /> },
			{ path: "tools/ratings", element: <ChampionRatingPage /> },
			{ path: "tools/champion-items", element: <ChampionItems /> },
			{ path: "profile", element: <Profile /> },
			{ path: "reset-password", element: <ResetPassword /> },
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
			{ path: "resources", element: <ResourceListPage /> },
			{ path: "resource/:resourceId", element: <ResourceDetailPage /> },
			{ path: "bosses", element: <BossListPage /> },
			{ path: "boss/:bossID", element: <BossDetailPage /> },
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
