// src/pages/Home.jsx
import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import PageTitle from "../components/common/pageTitle";
import { useTranslation } from "../hooks/useTranslation";
import {
	Swords,
	Dices,
	ChevronRight,
	Crown,
	ArrowDown,
	Trophy,
	Sparkles,
	BookOpen,
	Package,
	Zap,
	Gem,
	Map,
} from "lucide-react";

const BACKGROUND_IMAGES = [
	"https://images.pocguide.top/backgrounds/NunuAndWillump.webp",
	"https://dd.b.pvp.net/6_3_0/set2/vi_vn/img/cards/02NX007T2-full.png",
	"https://dd.b.pvp.net/6_3_0/set3/vi_vn/img/cards/03MT087T1-full.png",
	"https://wiki.leagueoflegends.com/en-us/images/06SI012T1-full.png?0bfd7",
	"https://dd.b.pvp.net/6_8_0/tpoc/vi_vn/img/cards/98SB031T2-full.png",
	"https://wiki.leagueoflegends.com/en-us/images/06SH009-full.png?ff10a",
	"https://dd.b.pvp.net/6_3_0/tpoc/vi_vn/img/cards/98RU004T1-full.png",
];

const Home = () => {
	const { tUI } = useTranslation();
	const [isLoading, setIsLoading] = useState(true);
	const [scrollY, setScrollY] = useState(0);

	useEffect(() => {
		const handleScroll = () => setScrollY(window.scrollY);
		window.addEventListener("scroll", handleScroll);

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
			setTimeout(() => setIsLoading(false), 800);
		};
		preloadImages();
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	if (isLoading) {
		return (
			<div className='fixed inset-0 z-50 bg-[#121c31] flex flex-col items-center justify-center'>
				<div className='loading-magic-circle mb-8'></div>
				<h2 className='text-white font-primary text-2xl animate-pulse tracking-widest uppercase'>
					{tUI("home.loading")}
				</h2>
			</div>
		);
	}

	return (
		<div className='bg-[#0f172a] text-white font-primary selection:bg-primary-500 selection:text-white'>
			<PageTitle
				title={tUI("home.pageTitle")}
				description={tUI("home.pageDesc")}
				type='website'
			/>

			{/* SECTION 1: HERO */}
			<section className='relative h-screen flex items-center justify-center overflow-hidden snap-start'>
				<div
					className='absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 scale-110 opacity-60'
					style={{
						backgroundImage: `url(${BACKGROUND_IMAGES[0]})`,
						transform: `translateY(${scrollY * 0.3}px) scale(1.1)`,
					}}
				/>
				<div className='absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#0f172a]' />

				<div className='relative z-10 text-center px-4 max-w-5xl'>
					<div className='inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/20 border border-yellow-500/50 rounded-full mb-6 animate-fadeIn'>
						<Crown className='w-5 h-5 text-yellow-500' />
						<span className='text-yellow-500 font-bold tracking-widest text-xs md:text-sm uppercase'>
							{tUI("home.heroBadge")}
						</span>
					</div>
					<h1 className='text-6xl md:text-9xl font-bold mb-6 tracking-tighter drop-shadow-2xl italic uppercase leading-none'>
						{tUI("home.heroTitle1")} <br />{" "}
						<span className='text-primary-400'>{tUI("home.heroTitle2")}</span>
					</h1>
					<p className='text-lg md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto font-secondary'>
						{tUI("home.heroDesc")}
					</p>

					<div className='flex flex-col sm:flex-row items-center justify-center gap-6'>
						<NavLink
							to='/champions'
							className='group relative px-10 py-4 bg-primary-600 rounded-full font-bold overflow-hidden transition-all hover:scale-105 active:scale-95'
						>
							<span className='relative z-10 flex items-center gap-2 text-xl'>
								{tUI("home.btnExplore")} <ChevronRight />
							</span>
							<div className='absolute inset-0 bg-gradient-to-r from-primary-400 to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity' />
						</NavLink>
						<NavLink
							to='/champion/C082'
							className='px-10 py-4 border border-white/30 rounded-full font-bold hover:bg-white/10 transition-all text-xl'
						>
							{tUI("home.btnNewChampion")}
						</NavLink>
					</div>
				</div>

				<div className='absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce flex flex-col items-center gap-2 text-gray-400'>
					<span className='text-xs uppercase tracking-widest'>
						{tUI("home.scrollDown")}
					</span>
					<ArrowDown className='w-6 h-6' />
				</div>
			</section>

			{/* SECTION 2: BENTO GRID */}
			<section className='py-10 px-6 max-w-7xl mx-auto'>
				<div className='flex flex-col md:flex-row justify-between items-end mb-12 gap-6'>
					<div>
						<h2 className='text-4xl md:text-6xl font-bold uppercase mb-4'>
							{tUI("home.resourceTitle1")}{" "}
							<span className='text-primary-500'>
								{tUI("home.resourceTitle2")}
							</span>
						</h2>
						<p className='text-gray-400 text-lg md:text-xl'>
							{tUI("home.resourceDesc")}
						</p>
					</div>
					<NavLink
						to='/champions'
						className='flex items-center gap-2 text-primary-400 hover:text-primary-300   font-bold text-lg underline underline-offset-8'
					>
						{tUI("home.viewAllChamps")} <ChevronRight className='w-5 h-5' />
					</NavLink>
				</div>

				<div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
					<NavLink
						to='/champions'
						className='md:col-span-2 group relative h-80 md:h-auto min-h-[400px] rounded-3xl overflow-hidden border border-white/10'
					>
						<div
							className='absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-700'
							style={{ backgroundImage: `url(${BACKGROUND_IMAGES[1]})` }}
						/>
						<div className='absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent' />
						<div className='absolute bottom-0 left-0 p-8'>
							<div className='p-3 bg-red-600 rounded-2xl w-fit mb-4 shadow-lg shadow-red-600/50'>
								<Swords className='w-8 h-8' />
							</div>
							<h3 className='text-4xl font-bold mb-2 uppercase'>
								{tUI("championList.heading")}
							</h3>
							<p className='text-gray-300 text-lg'>
								{tUI("home.champListDesc")}
							</p>
						</div>
					</NavLink>

					<NavLink
						to='/builds'
						className='md:col-span-2 group relative h-[400px] rounded-3xl overflow-hidden border border-white/10'
					>
						<div
							className='absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-700'
							style={{ backgroundImage: `url(${BACKGROUND_IMAGES[3]})` }}
						/>
						<div className='absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent' />
						<div className='absolute bottom-0 left-0 p-8'>
							<div className='p-3 bg-emerald-600 rounded-2xl w-fit mb-4 shadow-lg shadow-emerald-600/50'>
								<Sparkles className='w-8 h-8' />
							</div>
							<h3 className='text-4xl font-bold mb-2 uppercase'>
								{tUI("home.relicVault")}
							</h3>
							<p className='text-gray-300 text-lg'>
								{tUI("home.relicVaultDesc")}
							</p>
						</div>
					</NavLink>
				</div>
			</section>

			{/* SECTION 3: DATABASE & RESOURCES (KHU VỰC MỚI) */}
			<section className='py-10 px-6 max-w-7xl mx-auto'>
				<div className='mb-12'>
					<h2 className='text-4xl md:text-5xl font-bold uppercase mb-4'>
						<span className='text-primary-500'>+</span>{" "}
						{tUI("home.databaseTitle")}
					</h2>
					<p className='text-gray-400 text-lg'>{tUI("home.databaseDesc")}</p>
				</div>
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
					<NavLink
						to='/items'
						className='group bg-white/5 hover:bg-white/10 p-6 rounded-3xl border border-white/10   flex items-center gap-6'
					>
						<div className='p-4 bg-orange-500/20 text-orange-400 rounded-2xl group-hover:scale-110 transition-transform'>
							<Package className='w-8 h-8' />
						</div>
						<h3 className='text-2xl font-bold uppercase'>{tUI("nav.items")}</h3>
					</NavLink>

					<NavLink
						to='/relics'
						className='group bg-white/5 hover:bg-white/10 p-6 rounded-3xl border border-white/10   flex items-center gap-6'
					>
						<div className='p-4 bg-cyan-500/20 text-cyan-400 rounded-2xl group-hover:scale-110 transition-transform'>
							<Sparkles className='w-8 h-8' />
						</div>
						<h3 className='text-2xl font-bold uppercase'>
							{tUI("nav.relics")}
						</h3>
					</NavLink>

					<NavLink
						to='/powers'
						className='group bg-white/5 hover:bg-white/10 p-6 rounded-3xl border border-white/10   flex items-center gap-6'
					>
						<div className='p-4 bg-yellow-500/20 text-yellow-400 rounded-2xl group-hover:scale-110 transition-transform'>
							<Zap className='w-8 h-8' />
						</div>
						<h3 className='text-2xl font-bold uppercase'>
							{tUI("nav.powers")}
						</h3>
					</NavLink>

					<NavLink
						to='/runes'
						className='group bg-white/5 hover:bg-white/10 p-6 rounded-3xl border border-white/10   flex items-center gap-6'
					>
						<div className='p-4 bg-pink-500/20 text-pink-400 rounded-2xl group-hover:scale-110 transition-transform'>
							<Gem className='w-8 h-8' />
						</div>
						<h3 className='text-2xl font-bold uppercase'>{tUI("nav.runes")}</h3>
					</NavLink>

					<NavLink
						to='/maps'
						className='group bg-white/5 hover:bg-white/10 p-6 rounded-3xl border border-white/10   flex items-center gap-6'
					>
						<div className='p-4 bg-green-500/20 text-green-400 rounded-2xl group-hover:scale-110 transition-transform'>
							<Map className='w-8 h-8' />
						</div>
						<h3 className='text-2xl font-bold uppercase'>{tUI("nav.maps")}</h3>
					</NavLink>

					<NavLink
						to='/introduction'
						className='group bg-white/5 hover:bg-white/10 p-6 rounded-3xl border border-white/10   flex items-center gap-6'
					>
						<div className='p-4 bg-blue-500/20 text-blue-400 rounded-2xl group-hover:scale-110 transition-transform'>
							<BookOpen className='w-8 h-8' />
						</div>
						<h3 className='text-2xl font-bold uppercase'>{tUI("nav.about")}</h3>
					</NavLink>
				</div>
			</section>

			{/* SECTION 4: MONTHLY CHALLENGE */}
			<section className='relative py-2 md:py-4 px-6 overflow-hidden'>
				<div className='absolute top-0 right-0 w-[500px] h-[500px] bg-primary-900/20 blur-[120px] -z-10' />
				<div className='absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-900/20 blur-[120px] -z-10' />

				<div className='max-w-7xl mx-auto bg-white/5 border border-white/10 rounded-[40px] p-8 md:p-16 backdrop-blur-xl relative'>
					<div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
						<div className='order-2 lg:order-1'>
							<div className='flex items-center gap-3 text-primary-400 mb-6 font-bold tracking-widest uppercase'>
								<Trophy className='w-6 h-6' />
								<span>{tUI("home.monthlyEvent")}</span>
							</div>
							<h2 className='text-4xl md:text-7xl font-bold uppercase mb-8 leading-tight'>
								{tUI("home.monthlyTitle1")} <br />
								<span className='text-primary-500'>
									{tUI("home.monthlyTitle2")}
								</span>
							</h2>
							<p className='text-xl text-gray-400 mb-10 leading-relaxed font-secondary'>
								{tUI("home.monthlyDesc")}
							</p>
							<NavLink
								to='/guides/thu-thach-thang'
								className='inline-flex items-center gap-4 px-10 py-5 bg-white text-black font-bold rounded-2xl text-xl hover:bg-primary-400 hover:text-white transition-all'
							>
								{tUI("home.btnViewGuides")}{" "}
								<ArrowDown className='w-6 h-6 -rotate-90' />
							</NavLink>
						</div>
						<div className='order-1 lg:order-2 relative'>
							<img
								src={BACKGROUND_IMAGES[2]}
								alt={tUI("home.monthlyChallengeAlt")}
								className='rounded-3xl shadow-2xl border border-white/20 scale-105 rotate-3 hover:rotate-0 transition-transform duration-500'
							/>
							<div className='absolute -bottom-6 -left-6 bg-primary-600 p-6 rounded-2xl hidden md:block animate-bounce shadow-xl'>
								<p className='font-bold text-2xl'>70/70</p>
								<p className='text-xs uppercase'>
									{tUI("home.challengeStages")}
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* SECTION 5: QUICK TOOLS */}
			<section className='py-10 px-6 max-w-7xl mx-auto'>
				<div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
					<div className='md:col-span-1 bg-gradient-to-br from-primary-900/40 to-transparent p-10 rounded-3xl border border-white/10'>
						<Dices className='w-12 h-12 text-primary-400 mb-6' />
						<h3 className='text-3xl font-bold mb-4 uppercase'>
							{tUI("home.luckyWheel")}
						</h3>
						<p className='text-gray-400 mb-8 font-secondary'>
							{tUI("home.luckyWheelDesc")}
						</p>
						<NavLink
							to='/randomizer'
							className='text-white font-bold flex items-center gap-2 group underline'
						>
							{tUI("home.tryNow")}{" "}
							<ChevronRight className='group-hover:translate-x-2 transition-transform' />
						</NavLink>
					</div>

					<div className='md:col-span-1 bg-gradient-to-br from-purple-900/40 to-transparent p-10 rounded-3xl border border-white/10'>
						<Trophy className='w-12 h-12 text-purple-400 mb-6' />
						<h3 className='text-3xl font-bold mb-4 uppercase'>
							{tUI("home.tierListTitle")}
						</h3>
						<p className='text-gray-400 mb-8 font-secondary'>
							{tUI("home.tierListDesc")}
						</p>
						<NavLink
							to='/tierlist'
							className='text-white font-bold flex items-center gap-2 group underline'
						>
							{tUI("home.viewTierList")}{" "}
							<ChevronRight className='group-hover:translate-x-2 transition-transform' />
						</NavLink>
					</div>

					<div className='md:col-span-1 bg-gradient-to-br from-emerald-900/40 to-transparent p-10 rounded-3xl border border-white/10'>
						<BookOpen className='w-12 h-12 text-emerald-400 mb-6' />
						<h3 className='text-3xl font-bold mb-4 uppercase'>
							{tUI("home.pocGuidesTitle")}
						</h3>
						<p className='text-gray-400 mb-8 font-secondary'>
							{tUI("home.pocGuidesDesc")}
						</p>
						<NavLink
							to='/guides'
							className='text-white font-bold flex items-center gap-2 group underline'
						>
							{tUI("home.learnToPlay")}{" "}
							<ChevronRight className='group-hover:translate-x-2 transition-transform' />
						</NavLink>
					</div>
				</div>
			</section>

			{/* FOOTER CTA */}
			<section className='py-24 text-center border-t border-white/5'>
				<h2 className='text-5xl md:text-7xl font-bold uppercase mb-8 tracking-tighter'>
					{tUI("home.footerCTA1")}{" "}
					<span className='text-primary-500'>{tUI("home.footerCTA2")}</span>{" "}
					{tUI("home.footerCTA3")}
				</h2>
				<NavLink
					to='/champions'
					className='inline-flex items-center gap-4 px-12 py-6 bg-primary-600 rounded-full text-2xl font-bold hover:scale-110 transition-transform shadow-2xl shadow-primary-600/20'
				>
					{tUI("home.btnExploreNow")} <ChevronRight className='w-8 h-8' />
				</NavLink>
				<p className='mt-12 text-gray-500 uppercase tracking-[0.5em] text-sm'>
					POC GUIDE • 2026 • LEGEND OF RUNETERRA
				</p>
			</section>
		</div>
	);
};

export default Home;
