import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import PageTitle from "../components/common/pageTitle";
import GoogleAd from "../components/common/googleAd";
import { useTranslation } from "../hooks/useTranslation";
import {
	Swords,
	Dices,
	ChevronRight,
	Crown,
	Trophy,
	Sparkles,
	BookOpen,
	Package,
	Zap,
	Gem,
	Map,
	GalleryHorizontal,
	Archive,
	Star
} from "lucide-react";

const BACKGROUND_IMAGES = [
	"https://images.pocguide.top/backgrounds/BG1.webp", // Ahri (Hero)
	"https://images.pocguide.top/backgrounds/BG5.webp", // Jinx (Vanguard)
	"https://images.pocguide.top/backgrounds/BG4.webp", // Lux (Archive)
	"https://images.pocguide.top/backgrounds/BG2.webp", // Monthly (Tactical)
	"https://images.pocguide.top/backgrounds/BG3.webp", // Deck (Workshop)
	"https://images.pocguide.top/backgrounds/BG6.webp", 
	"https://images.pocguide.top/backgrounds/BG7.webp",
	"https://images.pocguide.top/backgrounds/BG8.webp",
	"https://images.pocguide.top/backgrounds/BG9.webp",
	"https://images.pocguide.top/backgrounds/BG10.webp"
];

const Home = () => {
	const { tUI } = useTranslation();
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(true);
	const isDragging = useRef(false);

	const TILES = [
		{ to: "/champions", icon: Swords, label: tUI("nav.champions"), img: BACKGROUND_IMAGES[1], top: "15%", left: "10%", size: "w-28 h-28 lg:w-56 lg:h-56" },
		{ to: "/builds", icon: Crown, label: tUI("nav.builds"), img: BACKGROUND_IMAGES[3], top: "30%", left: "85%", size: "w-20 h-20 lg:w-44 lg:h-44" },
		{ to: "/items", icon: Package, label: tUI("nav.items"), img: BACKGROUND_IMAGES[4], top: "64%", left: "20%", size: "w-24 h-24 lg:w-48 lg:h-48" },
		{ to: "/relics", icon: Sparkles, label: tUI("nav.relics"), img: BACKGROUND_IMAGES[0], top: "1%", left: "33%", size: "w-20 h-20 lg:w-40 lg:h-40" },
		{ to: "/powers", icon: Zap, label: tUI("nav.powers"), img: BACKGROUND_IMAGES[5], top: "70%", left: "45%", size: "w-24 h-24 lg:w-48 lg:h-48" },
		{ to: "/runes", icon: Gem, label: tUI("nav.runes"), img: BACKGROUND_IMAGES[6], top: "5%", left: "80%", size: "w-20 h-20 lg:w-40 lg:h-40" },
		{ to: "/maps", icon: Map, label: tUI("nav.maps"), img: BACKGROUND_IMAGES[2], top: "65%", left: "75%", size: "w-18 h-18 lg:w-36 lg:h-36" },
		{ to: "/randomizer", icon: Dices, label: tUI("nav.randomizer"), img: BACKGROUND_IMAGES[8], top: "50%", left: "2%", size: "w-20 h-20 lg:w-36 lg:h-36" },
		{ to: "/cards", icon: GalleryHorizontal, label: tUI("nav.cards"), img: BACKGROUND_IMAGES[7], top: "2%", left: "64%", size: "w-24 h-24 lg:w-40 lg:h-40" },
		{ to: "/tools/ratings", icon: Star, label: tUI("nav.championRatings"), img: BACKGROUND_IMAGES[9], top: "7%", left: "49%", size: "w-20 h-20 lg:w-60 lg:h-60" },
	];

	useEffect(() => {
		const preloadImages = async () => {
			const promises = BACKGROUND_IMAGES.map(src => {
				return new Promise(resolve => {
					const img = new Image();
					img.src = src;
					img.onload = resolve;
					img.onerror = resolve;
				});
			});
			await Promise.all(promises);
			setTimeout(() => setIsLoading(false), 500);
		};
		preloadImages();
	}, []);

	if (isLoading) {
		return (
			<div className='fixed inset-0 z-50 bg-slate-50 p-4 flex flex-col'>
				{/* Skeleton Navbar */}
				<div className='h-16 w-full bg-slate-200 rounded-2xl animate-pulse mb-8'></div>
				{/* Skeleton Hero Section */}
				<div className='flex-grow flex flex-col items-center justify-center w-full max-w-5xl mx-auto gap-6'>
					<div className='h-8 w-32 bg-slate-200 rounded-full animate-pulse mb-4'></div>
					<div className='h-16 md:h-24 w-3/4 bg-slate-200 rounded-3xl animate-pulse'></div>
					<div className='h-6 md:h-8 w-1/2 bg-slate-200 rounded-full animate-pulse mb-8'></div>
					<div className='flex flex-col sm:flex-row gap-6'>
						<div className='h-14 w-48 bg-slate-200 rounded-full animate-pulse'></div>
						<div className='h-14 w-48 bg-slate-200 rounded-full animate-pulse'></div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className='bg-slate-50 text-slate-900 font-primary selection:bg-primary-500 selection:text-white'>
			<PageTitle
				title={tUI("home.pageTitle")}
				description={tUI("home.pageDesc")}
				type='website'
			/>

			{/* --- HERO MOODBOARD --- */}
			<section className='relative w-full h-[calc(100vh-56px)] bg-white overflow-hidden flex items-center justify-center'>
				<div className='absolute inset-0 z-0 select-none overflow-hidden bg-white'>
					<img
						src={BACKGROUND_IMAGES[0]}
						alt='Hero'
						className='w-full h-full object-cover grayscale-[0.2] opacity-90 blur-[3px] scale-110 transition-all duration-[2s]'
					/>
					<div className='absolute inset-0' />
				</div>

				<div className='relative w-full h-full max-w-[1920px] mx-auto z-20 p-4'>
					{/* PROMINENT TITLE */}
					<div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none z-10 w-full px-16'>
						<motion.h1 
							initial={{ opacity: 0, scale: 0.8 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ duration: 1 }}
							className='text-7xl md:text-[14rem] font-black text-slate-950 uppercase leading-none tracking-tighter italic md:pr-12 mb-8'
							style={{ 
								filter: "drop-shadow(-2px -2px 0 #fff) drop-shadow(2px -2px 0 #fff) drop-shadow(-2px 2px 0 #fff) drop-shadow(2px 2px 0 #fff) drop-shadow(-2px 0 0 #fff) drop-shadow(2px 0 0 #fff) drop-shadow(0 -2px 0 #fff) drop-shadow(0 2px 0 #fff)" 
							}}
						>
							<span>{tUI("home.heroTitle1")}</span> 
							<br />
							<span className='text-transparent bg-clip-text bg-gradient-to-br from-primary-600 via-primary-500 to-indigo-600 md:pr-16 inline-block'>
								{tUI("home.heroTitle2")}
							</span>
						</motion.h1>
					</div>

					{/* TILES */}
					{TILES.map((tile, idx) => (
						<motion.div
							key={idx}
							drag
							dragMomentum={false}
							initial={{ opacity: 0, scale: 0 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ duration: 0.5, delay: idx * 0.1 }}
							onDragStart={() => (isDragging.current = true)}
							onDragEnd={() => setTimeout(() => (isDragging.current = false), 50)}
							className={`absolute group flex flex-col items-center cursor-grab`}
							style={{ top: tile.top, left: tile.left }}
						>
							<div 
								onClick={() => !isDragging.current && navigate(tile.to)}
								className={`${tile.size} rounded-none border-2 border-white shadow-2xl overflow-hidden bg-white group-hover:border-primary-500 group-hover:scale-110 transition-all duration-500 select-none`}
							>
								<img src={tile.img} alt={tile.label} className='w-full h-full object-cover grayscale-[0.7] group-hover:grayscale-0 transition-all duration-700 pointer-events-none' />
								<div className='absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all'>
									<tile.icon className='w-1/4 h-1/4 text-primary-600' />
								</div>
							</div>
							<span className='mt-2 text-[9px] lg:text-[11px] font-black tracking-[0.3em] uppercase text-slate-800 bg-white/80 backdrop-blur-md px-3 py-1 shadow-sm select-none pointer-events-none'>
								{tile.label}
							</span>
						</motion.div>
					))}
				</div>
			</section>

			{/* SECTION 2: BENTO GRID */}
			<section className='py-10 px-1 md:px-6 max-w-7xl mx-auto'>
				<div className='flex flex-col md:flex-row justify-between items-end mb-16 gap-6'>
					<div>
						<h2 className='text-5xl md:text-7xl font-bold uppercase mb-4 tracking-tighter text-slate-900'>
							{tUI("home.resourceTitle1")}{" "}
							<span className='text-primary-600'>
								{tUI("home.resourceTitle2")}
							</span>
						</h2>
						<p className='text-slate-600 text-xl font-secondary'>
							{tUI("home.resourceDesc")}
						</p>
					</div>
					<NavLink
						to='/champions'
						className='flex items-center gap-2 text-primary-600 hover:text-primary-700 font-bold text-xl underline underline-offset-8 transition-all'
					>
						{tUI("home.viewAllChamps")} <ChevronRight className='w-6 h-6' />
					</NavLink>
				</div>

				<div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
					<NavLink
						to='/champions'
						className='md:col-span-2 group relative min-h-[500px] rounded-[40px] overflow-hidden border border-slate-200 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] transition-all hover:-translate-y-2'
					>
						<div
							className='absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-1000'
							style={{ backgroundImage: `url(${BACKGROUND_IMAGES[1]})` }}
						/>
						<div className='absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent' />
						<div className='absolute bottom-0 left-0 p-5 md:p-10'>
							<div className='p-4 bg-red-600 rounded-2xl w-fit mb-6 shadow-xl shadow-red-600/30'>
								<Swords className='w-10 h-10 text-white' />
							</div>
							<h3 className='text-5xl font-bold mb-4 uppercase tracking-tighter text-white'>
								{tUI("championList.heading")}
							</h3>
							<p className='text-slate-200 text-xl font-secondary'>
								{tUI("home.champListDesc")}
							</p>
						</div>
					</NavLink>

					<NavLink
						to='/builds'
						className='md:col-span-2 group relative min-h-[500px] rounded-[40px] overflow-hidden border border-slate-200 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] transition-all hover:-translate-y-2'
					>
						<div
							className='absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-1000'
							style={{ backgroundImage: `url(${BACKGROUND_IMAGES[3]})` }}
						/>
						<div className='absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent' />
						<div className='absolute bottom-0 left-0 p-5 md:p-10'>
							<div className='p-4 bg-emerald-600 rounded-2xl w-fit mb-6 shadow-xl shadow-emerald-600/30'>
								<Sparkles className='w-10 h-10 text-white' />
							</div>
							<h3 className='text-5xl font-bold mb-4 uppercase tracking-tighter text-white'>
								{tUI("home.relicVault")}
							</h3>
							<p className='text-slate-200 text-xl font-secondary'>
								{tUI("home.relicVaultDesc")}
							</p>
						</div>
					</NavLink>
				</div>
			</section>

			{/* SECTION 3: DATABASE & RESOURCES */}
			<section className='py-10 px-1 md:px-6 max-w-7xl mx-auto'>
				<div className='flex flex-col md:flex-row justify-between items-end mb-16 gap-6'>
					<div>
						<h2 className='text-5xl md:text-7xl font-bold uppercase mb-4 tracking-tighter text-slate-900'>
							{tUI("home.databaseTitle")}
						</h2>
						<p className='text-slate-600 text-xl font-secondary max-w-2xl'>
							{tUI("home.databaseDesc")}
						</p>
					</div>
				</div>

				<div className='grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[180px] md:auto-rows-[200px]'>
					{[
						{ to: "/items", label: tUI("nav.items"), icon: Package, color: "orange", img: BACKGROUND_IMAGES[4], span: "md:col-span-2 md:row-span-2" },
						{ to: "/relics", label: tUI("nav.relics"), icon: Sparkles, color: "cyan", img: BACKGROUND_IMAGES[0], span: "md:col-span-2 md:row-span-1" },
						{ to: "/powers", label: tUI("nav.powers"), icon: Zap, color: "yellow", img: BACKGROUND_IMAGES[1], span: "md:col-span-2 md:row-span-1" },
						{ to: "/cards", label: tUI("cardList.title"), icon: GalleryHorizontal, color: "indigo", img: BACKGROUND_IMAGES[2], span: "md:col-span-2 md:row-span-2" },
						{ to: "/runes", label: tUI("nav.runes"), icon: Gem, color: "pink", img: BACKGROUND_IMAGES[6], span: "md:col-span-1 md:row-span-1" },
						{ to: "/maps", label: tUI("nav.maps"), icon: Map, color: "green", img: BACKGROUND_IMAGES[5], span: "md:col-span-1 md:row-span-1" },
						{ to: "/introduction", label: tUI("nav.about"), icon: BookOpen, color: "blue", img: BACKGROUND_IMAGES[3], span: "md:col-span-2 md:row-span-1" },
					].map((item, idx) => (
						<NavLink
							key={idx}
							to={item.to}
							className={`group relative ${item.span} rounded-[40px] overflow-hidden border border-slate-200 transition-all hover:shadow-[0_45px_70px_-20px_rgba(0,0,0,0.3)] hover:-translate-y-2 active:scale-95 hover:border-primary-500/50 shadow-[0_15px_35px_-8px_rgba(0,0,0,0.15)] isolate`}
						>
							{/* Background Image with Cinematic Overlay */}
							<div 
								className='absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110'
								style={{ backgroundImage: `url(${item.img})` }}
							/>
							<div className='absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent' />
							
							{/* Content Layout */}
							<div className='absolute inset-0 p-8 md:p-5 md:p-10 flex flex-col justify-end h-full w-full'>
								<div className={`p-5 bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-2xl shadow-2xl w-fit mb-6 transition-all group-hover:bg-${item.color}-500/40 group-hover:scale-110 group-hover:rotate-12`}>
									<item.icon className='w-8 h-8 md:w-10 md:h-10' />
								</div>
								<h3 className={`font-black uppercase tracking-tighter text-white drop-shadow-2xl ${item.span.includes("row-span-2") ? "text-3xl md:text-6xl" : "text-3xl md:text-4xl"}`}>
									{item.label}
								</h3>
							</div>

							{/* Dynamic Aura Glow */}
							<div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-br from-${item.color}-500/0 to-${item.color}-500/5 opacity-0 group-hover:opacity-100 transition-opacity`} />
							<div className={`absolute -top-20 -right-20 w-40 h-40 bg-${item.color}-500/20 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
						</NavLink>
					))}
				</div>
			</section>

			{/* SECTION 4: MONTHLY CHALLENGE */}
			<section className='relative py-10 overflow-hidden'>
				<div className='absolute top-0 right-0 w-[600px] h-[600px] bg-primary-200/20 blur-[150px] -z-10' />
				<div className='absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-200/20 blur-[150px] -z-10' />

				<div className='max-w-7xl mx-auto px-1 md:px-6'>
					<div className='bg-white border border-slate-200 rounded-[60px] p-5 md:p-10 lg:p-20 backdrop-blur-2xl relative shadow-2xl shadow-slate-200/70'>
						<div className='grid grid-cols-1 lg:grid-cols-2 gap-20 items-center'>
							<div className='order-2 lg:order-1'>
								<div className='flex items-center gap-4 text-primary-600 mb-8 font-bold tracking-[0.3em] uppercase text-sm'>
									<Trophy className='w-8 h-8' />
									<span>{tUI("home.monthlyEvent")}</span>
								</div>
								<h2 className='text-5xl md:text-8xl font-bold uppercase mb-10 leading-[0.9] tracking-tighter text-slate-900'>
									{tUI("home.monthlyTitle1")} <br />
									<span className='text-primary-600'>
										{tUI("home.monthlyTitle2")}
									</span>
								</h2>
								<p className='text-2xl text-slate-600 mb-12 leading-relaxed font-secondary opacity-90'>
									{tUI("home.monthlyDesc")}
								</p>
								<NavLink
									to='/guides/thu-thach-thang'
									className='inline-flex items-center gap-6 px-12 py-6 bg-slate-900 text-white font-bold rounded-2xl text-2xl hover:bg-primary-600 transition-all shadow-xl active:scale-95'
								>
									{tUI("home.btnViewGuides")}{" "}
									<ChevronRight className='w-8 h-8' />
								</NavLink>
							</div>
							<div className='order-1 lg:order-2 relative group'>
								<img
									src={BACKGROUND_IMAGES[2]}
									alt={tUI("home.monthlyChallengeAlt")}
									className='rounded-[40px] shadow-2xl border border-slate-200 scale-105 rotate-2 group-hover:rotate-0 transition-all duration-700'
								/>
								<div className='absolute -bottom-8 -left-8 bg-primary-600 p-8 rounded-3xl hidden md:block animate-pulse shadow-2xl'>
									<p className='font-bold text-4xl mb-1 text-white'>70/70</p>
									<p className='text-sm uppercase tracking-widest font-black text-white'>
										{tUI("home.challengeStages")}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>
			{/* SECTION 5: QUICK TOOLS */}
			<section className='py-10 px-1 md:px-6 max-w-7xl mx-auto'>
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10'>
					{[
						{ to: "/randomizer", label: tUI("home.luckyWheel"), desc: tUI("home.luckyWheelDesc"), icon: Dices, color1: "primary-100", btn: tUI("home.tryNow"), iconColor: "primary-600" },
						{ to: "/tools/ratings", label: tUI("nav.championRatings"), desc: tUI("ratings.subtitle"), icon: Star, color1: "orange-100", btn: tUI("home.viewAllChamps"), iconColor: "orange-600" },
						{ to: "/tierlist", label: tUI("home.tierListTitle"), desc: tUI("home.tierListDesc"), icon: Trophy, color1: "purple-100", btn: tUI("home.viewTierList"), iconColor: "purple-600" },
						{ to: "/guides", label: tUI("home.pocGuidesTitle"), desc: tUI("home.pocGuidesDesc"), icon: BookOpen, color1: "emerald-100", btn: tUI("home.learnToPlay"), iconColor: "emerald-600" },
						{ to: "/vault-simulator", label: tUI("nav.vaultSimulator"), desc: tUI("vaultSimulator.description"), icon: Archive, color1: "amber-100", btn: tUI("home.tryNow"), iconColor: "amber-600" },
					].map((tool, idx) => (
						<div key={idx} className={`bg-gradient-to-br from-${tool.color1} to-white p-5 md:p-10 rounded-[40px] border border-slate-200 shadow-xl shadow-slate-200/50 transition-all hover:scale-105`}>
							<tool.icon className={`w-16 h-16 text-${tool.iconColor} mb-8`} />
							<h3 className='text-3xl font-bold mb-6 uppercase tracking-tighter text-slate-800'>
								{tool.label}
							</h3>
							<p className='text-slate-600 mb-10 text-lg font-secondary leading-relaxed line-clamp-2'>
								{tool.desc}
							</p>
							<NavLink
								to={tool.to}
								className='text-slate-900 font-bold flex items-center gap-3 group underline underline-offset-8 hover:text-primary-600'
							>
								{tool.btn}{" "}
								<ChevronRight className='group-hover:translate-x-2 transition-transform w-6 h-6' />
							</NavLink>
						</div>
					))}
				</div>
			</section>

			{/* AD PLACEMENT */}
			<div className='max-w-7xl mx-auto px-1 md:px-6 mb-10'>
				<div className='bg-white border border-slate-200 rounded-3xl p-4 shadow-md shadow-slate-200/50'>
					<GoogleAd slot='2943049680' format='horizontal' />
				</div>
			</div>

			{/* FOOTER CTA */}
			<section className='py-10 text-center border-t border-slate-200 relative overflow-hidden'>
				<div className='absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary-100/50 blur-[120px] -z-10 rounded-full' />
				<h2 className='text-6xl md:text-[8rem] font-bold uppercase mb-16 tracking-tighter italic leading-none text-slate-900'>
					{tUI("home.footerCTA1")}{" "}
					<span className='text-primary-600'>{tUI("home.footerCTA2")}</span> <br />
					{tUI("home.footerCTA3")}
				</h2>
				<NavLink
					to='/champions'
					className='inline-flex items-center gap-6 px-6 md:px-10 py-8 bg-primary-600 rounded-full text-3xl font-black text-white hover:scale-110 active:scale-95 transition-all shadow-2xl shadow-primary-600/40'
				>
					{tUI("home.btnExploreNow")} <ChevronRight className='w-10 h-10' />
				</NavLink>
				<p className='mt-24 text-slate-400 uppercase tracking-[1em] text-xs font-secondary'>
					POC GUIDE - LEGEND OF RUNETERRA - 2026
				</p>
			</section>
		</div>
	);
};

export default Home;
