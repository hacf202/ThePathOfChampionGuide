import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import PageTitle from "../components/common/pageTitle";
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
	Star,
	ArrowRight,
	Users,
	Wrench
} from "lucide-react";

const fadeInUp = {
	hidden: { opacity: 0, y: 40 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: { staggerChildren: 0.15 }
	}
};

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
	"https://images.pocguide.top/backgrounds/BG10.webp",
	"https://images.pocguide.top/backgrounds/MAINBG.webp"
];

const Home = () => {
	const { tUI } = useTranslation();
	const navigate = useNavigate();
	const isDragging = useRef(false);

	const TILES = [
		{ to: "/champions", icon: Swords, label: tUI("nav.champions"), img: BACKGROUND_IMAGES[1], top: "15%", left: "10%", size: "w-28 h-28 lg:w-56 lg:h-56" },
		{ to: "/builds", icon: Crown, label: tUI("nav.builds"), img: BACKGROUND_IMAGES[3], top: "30%", left: "85%", size: "w-20 h-20 lg:w-44 lg:h-44" },
		{ to: "/items", icon: Package, label: tUI("nav.items"), img: BACKGROUND_IMAGES[4], top: "64%", left: "20%", size: "w-24 h-24 lg:w-48 lg:h-48" },
		{ to: "/relics", icon: Sparkles, label: tUI("nav.relics"), img: BACKGROUND_IMAGES[8], top: "1%", left: "33%", size: "w-20 h-20 lg:w-40 lg:h-40" },
		{ to: "/powers", icon: Zap, label: tUI("nav.powers"), img: BACKGROUND_IMAGES[5], top: "70%", left: "45%", size: "w-24 h-24 lg:w-48 lg:h-48" },
		{ to: "/runes", icon: Gem, label: tUI("nav.runes"), img: BACKGROUND_IMAGES[6], top: "5%", left: "80%", size: "w-20 h-20 lg:w-40 lg:h-40" },
		{ to: "/maps", icon: Map, label: tUI("nav.maps"), img: BACKGROUND_IMAGES[2], top: "65%", left: "75%", size: "w-18 h-18 lg:w-36 lg:h-36" },
		{ to: "/tools/ratings", icon: Dices, label: tUI("nav.championRatings"), img: BACKGROUND_IMAGES[9], top: "50%", left: "2%", size: "w-20 h-20 lg:w-36 lg:h-36" },
		{ to: "/cards", icon: GalleryHorizontal, label: tUI("nav.cards"), img: BACKGROUND_IMAGES[7], top: "2%", left: "64%", size: "w-24 h-24 lg:w-40 lg:h-40" },
		{ to: "/resources", icon: Archive, label: tUI("nav.resources"), img: BACKGROUND_IMAGES[6], top: "40%", left: "25%", size: "w-20 h-20 lg:w-44 lg:h-44" },
		{ to: "/champion/C085", icon: Star, label: tUI("nav.newChampion"), img: BACKGROUND_IMAGES[0], top: "0%", left: "49%", size: "w-20 h-20 lg:w-48 lg:h-48" },
	];

	useEffect(() => {
		// Images will be loaded naturally by the browser, no artificial delay needed.
	}, []);

	return (
		<div className='bg-page-bg text-text-primary font-primary selection:bg-primary-500 selection:text-white'>
			<PageTitle
				title={tUI("home.pageTitle")}
				description={tUI("home.pageDesc")}
				type='website'
			/>

			{/* --- HERO MOODBOARD --- */}
			<section className='relative w-full h-[calc(100vh-56px)] bg-surface-bg/0 overflow-hidden flex items-center justify-center isolate'>
				{/* BACKGROUND IMAGE & OVERLAYS */}
				<div className='absolute inset-0 z-0 select-none overflow-hidden bg-surface-bg/20'>
					<div className='absolute inset-0 grayscale-[0.2] blur-[2px] transform-gpu'>
						<img
							src={BACKGROUND_IMAGES[10]}
							alt='Hero'
							fetchpriority='high'
							decoding='async'
							className='w-full h-full object-cover opacity-90 scale-105 transition-transform duration-[20s] ease-linear animate-slow-zoom will-change-transform'
						/>
					</div>

					{/* Cinematic Vignette & Gradient Overlays */}
					<div className='absolute inset-0 bg-gradient-to-t from-page-bg via-transparent to-transparent opacity-80' />
					<div className='absolute inset-0 bg-gradient-to-b from-page-bg/20 via-transparent to-page-bg/40 opacity-60' />
					<div className='absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.5)]' />

					{/* GRAIN TEXTURE OVERLAY */}
					<div className='absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay'
						style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }} />

					{/* SCANLINES EFFECT */}
					<div className='absolute inset-0 opacity-[0.05] pointer-events-none'
						style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 1px, #000 1px, #000 2px)', backgroundSize: '100% 4px' }} />
				</div>

				<div className='relative w-full h-full max-w-[1920px] mx-auto z-20 p-4'>
					{/* PROMINENT TITLE */}
					<div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none z-30 w-full px-4 md:px-12 select-none'>
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 1, ease: "easeOut" }}
						>
							<motion.h1
								initial={{ scale: 0.9 }}
								animate={{ scale: 1 }}
								transition={{ duration: 1.5, ease: "easeOut" }}
								className='text-6xl sm:text-7xl md:text-[10rem] lg:text-[14rem] font-black text-white uppercase leading-none tracking-tighter italic mb-8 select-none'
								style={{ filter: 'drop-shadow(0 20px 50px rgba(0, 0, 0, 0.8))' }}
							>
								<span className="relative inline-block overflow-hidden pr-4 md:pr-8">
									{tUI("home.heroTitle1")}
									<motion.div
										className="absolute inset-0 bg-white/20 -translate-x-full skew-x-12"
										animate={{ translateX: '200%' }}
										transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 5 }}
									/>
								</span>
								<br />
								<span className='text-transparent bg-clip-text bg-gradient-to-br from-primary-400 via-primary-600 to-indigo-700 inline-block filter drop-shadow-[0_0_30px_rgba(var(--color-primary-rgb),0.3)] pr-4 md:pr-8'>
									{tUI("home.heroTitle2")}
								</span>
							</motion.h1>
						</motion.div>
					</div>

					{/* TILES */}
					{TILES.map((tile, idx) => (
						<motion.div
							key={idx}
							drag
							dragMomentum={false}
							initial={{ opacity: 0, scale: 0 }}
							animate={{
								opacity: 1,
								scale: 1,
								y: [0, -10, 0],
							}}
							transition={{
								opacity: { duration: 0.5, delay: idx * 0.1 },
								scale: { duration: 0.5, delay: idx * 0.1 },
								y: { duration: 4 + Math.random() * 2, repeat: Infinity, ease: "easeInOut", delay: idx * 0.2 }
							}}
							onDragStart={() => (isDragging.current = true)}
							onDragEnd={() => setTimeout(() => (isDragging.current = false), 50)}
							className={`absolute group flex flex-col items-center cursor-grab active:cursor-grabbing z-10`}
							style={{ top: tile.top, left: tile.left }}
						>
							<div
								onClick={() => !isDragging.current && navigate(tile.to)}
								className={`${tile.size} rounded-none border-[1px] border-white/40 shadow-2xl overflow-hidden bg-surface-bg/80 backdrop-blur-md group-hover:border-primary-500 group-hover:scale-110 group-hover:rotate-1 transition-all duration-300 select-none group-hover:shadow-primary-500/20 group-active:scale-95`}
							>
								<img src={tile.img} alt={tile.label} className='w-full h-full object-cover grayscale-[0.8] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700 pointer-events-none' />

								{/* Glass Reflection Overlay */}
								<div className='absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity' />
							</div>
							<span className='mt-3 text-[9px] lg:text-[10px] tracking-[0.4em] uppercase text-white bg-black/60 backdrop-blur-xl border border-white/10 px-4 py-1.5 shadow-2xl select-none pointer-events-none translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300'>
								{tile.label}
							</span>
						</motion.div>
					))}
				</div>
			</section>

			{/* SECTION 2: GAMEPLAY & STRATEGY */}
			<section className='py-12 md:py-20 px-3 md:px-8 lg:px-12 w-full max-w-[1600px] mx-auto'>
				<motion.div
					variants={fadeInUp}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-100px" }}
					className='mb-10 md:mb-16 text-center md:text-left'
				>
					<h3 className='flex items-center justify-center md:justify-start gap-2 text-primary-500 font-bold uppercase tracking-widest mb-2 md:mb-3 text-xs md:text-sm'>
						<Swords className='w-4 h-4 md:w-5 md:h-5' /> {tUI("home.gameplayTitle1") || "LỐI CHƠI"}
					</h3>
					<h2 className='text-3xl md:text-6xl font-bold mb-3 md:mb-4 text-text-primary uppercase tracking-tighter'>
						{tUI("home.gameplayTitle2") || "CHIẾN THUẬT"}
					</h2>
					<p className='text-text-secondary text-base md:text-lg font-secondary max-w-2xl mx-auto md:mx-0'>
						{tUI("home.gameplayDesc") || "Chinh phục Con Đường Anh Hùng với hướng dẫn chi tiết và cộng đồng mạnh mẽ."}
					</p>
				</motion.div>

				<motion.div
					variants={staggerContainer}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-50px" }}
					className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8'
				>
					{[
						{ to: "/champions", label: tUI("championList.heading"), icon: Swords, color: "primary", img: BACKGROUND_IMAGES[1] },
						{ to: "/sub-champions", label: tUI("nav.supportChampions") || "Tướng Phụ", icon: Users, color: "indigo", desc: "" },
						{ to: "/builds", label: tUI("nav.builds"), icon: Sparkles, color: "emerald", desc: "" }
					].map((item, idx) => (
						<motion.div variants={fadeInUp} key={idx} className='group block rounded-[24px] md:rounded-[30px] overflow-visible'>
							<div className="relative h-48 md:h-56 rounded-[24px] md:rounded-[30px] overflow-hidden shadow-lg">
								<div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url(${item.img || BACKGROUND_IMAGES[idx === 1 ? 5 : 3]})` }} />
							</div>
							<div className={`relative -mt-10 mx-3 p-5 md:-mt-12 md:mx-4 md:p-6 bg-surface-bg/95 backdrop-blur-2xl rounded-[20px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] border border-border/50 text-center z-10 transition-all duration-300 group-hover:-translate-y-2 group-hover:border-${item.color}-500/50`}>
								<div className={`absolute -top-5 md:-top-6 left-1/2 -translate-x-1/2 bg-${item.color}-600 p-2.5 md:p-3 rounded-full border-4 border-page-bg shadow-lg text-white`}>
									<item.icon className="w-5 h-5 md:w-6 md:h-6" />
								</div>
								<h3 className={`text-xl md:text-2xl font-bold mt-3 md:mt-4 mb-2 md:mb-4 uppercase tracking-tighter text-text-primary group-hover:text-${item.color}-500 transition-colors`}>
									{item.label}
								</h3>
								{item.desc && (
									<p className="text-text-secondary font-secondary text-sm md:text-base mb-4 line-clamp-2">
										{item.desc}
									</p>
								)}
								<NavLink to={item.to} className={`inline-flex items-center gap-2 text-${item.color}-500 font-bold uppercase text-xs md:text-sm group-hover:text-${item.color}-400 transition-colors`}>
									Read More <ArrowRight className="w-3 h-3 md:w-4 md:h-4 transition-transform group-hover:translate-x-1" />
								</NavLink>
							</div>
						</motion.div>
					))}
				</motion.div>
			</section>

			{/* SECTION 3: THE GRAND DATABASE */}
			<section className='py-12 md:py-20 bg-black/5'>
				<div className='w-full max-w-[1600px] mx-auto px-3 md:px-8 lg:px-12'>
					<motion.div
						variants={fadeInUp}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true, margin: "-100px" }}
						className='mb-10 md:mb-16 text-center'
					>
						<h3 className='flex items-center justify-center gap-2 text-primary-500 font-bold uppercase tracking-widest mb-2 md:mb-3 text-xs md:text-sm'>
							<Package className='w-4 h-4 md:w-5 md:h-5' /> {tUI("home.databaseTitle")}
						</h3>
						<h2 className='text-3xl md:text-6xl font-bold mb-3 md:mb-4 text-text-primary uppercase tracking-tighter'>
							{tUI("home.databaseTitle")}
						</h2>
						<p className='text-text-secondary text-base md:text-lg font-secondary max-w-2xl mx-auto px-4'>
							{tUI("home.databaseDesc")}
						</p>
					</motion.div>

					<motion.div
						variants={staggerContainer}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true, margin: "-50px" }}
						className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6'
					>
						{[
							{ to: "/relics", label: tUI("nav.relics"), icon: Sparkles, color: "cyan", img: BACKGROUND_IMAGES[0], desc: "Khám phá hàng trăm Cổ Vật mạnh mẽ để trang bị cho Tướng." },
							{ to: "/items", label: tUI("nav.items"), icon: Package, color: "orange", img: BACKGROUND_IMAGES[4], desc: "Tổng hợp các Vật Phẩm rớt ra trong quá trình phiêu lưu." },
							{ to: "/powers", label: tUI("nav.powers"), icon: Zap, color: "yellow", img: BACKGROUND_IMAGES[1], desc: "Danh sách Sức Mạnh Nội Tại giúp định hình lối chơi của bạn." },
							{ to: "/runes", label: tUI("nav.runes"), icon: Gem, color: "pink", img: BACKGROUND_IMAGES[6], desc: "Hệ thống Ngọc bổ trợ và hiệu ứng nâng cấp sức mạnh." },
							{ to: "/cards", label: tUI("cardList.title") || "Cards", icon: GalleryHorizontal, color: "indigo", img: BACKGROUND_IMAGES[2], desc: "Tra cứu toàn bộ thẻ bài xuất hiện trong Path of Champions." },
							{ to: "/resources", label: tUI("nav.resources"), icon: Archive, color: "amber", img: BACKGROUND_IMAGES[8], desc: "Chi tiết về Mảnh Tướng, Bụi Sao, và các tài nguyên khác." },
						].map((item, idx) => (
							<motion.div variants={fadeInUp} key={idx} className="h-full">
								<NavLink
									to={item.to}
									className={`relative flex flex-col h-full gap-3 md:gap-4 p-5 md:p-8 rounded-[24px] md:rounded-[30px] bg-surface-bg border border-border shadow-lg transition-all overflow-hidden hover:shadow-2xl hover:-translate-y-2 group hover:border-${item.color}-500/50`}
								>
									{/* Subtle Background Image */}
									<div
										className="absolute inset-0 bg-cover bg-center opacity-10 group-hover:opacity-20 transition-opacity duration-500 group-hover:scale-110"
										style={{ backgroundImage: `url(${item.img})` }}
									/>
									<div className="absolute inset-0 bg-gradient-to-t from-surface-bg via-surface-bg/90 to-surface-bg/50" />

									<div className="relative z-10 flex items-start gap-4 md:gap-5">
										<div className={`flex-shrink-0 p-3 md:p-4 rounded-xl md:rounded-2xl bg-${item.color}-500/10 text-${item.color}-500 group-hover:bg-${item.color}-500 group-hover:text-white transition-colors duration-300 shadow-inner`}>
											<item.icon className='w-6 h-6 md:w-8 md:h-8' />
										</div>
										<div className="flex flex-col h-full">
											<h3 className={`text-xl md:text-2xl font-bold uppercase tracking-tighter text-text-primary group-hover:text-${item.color}-500 transition-colors mb-1 md:mb-2`}>
												{item.label}
											</h3>
											<p className="text-text-secondary font-secondary text-xs md:text-sm leading-relaxed mb-3 md:mb-4">
												{item.desc}
											</p>
											<span className={`inline-flex items-center gap-1 md:gap-2 text-xs md:text-sm font-bold uppercase tracking-wider text-${item.color}-500 opacity-80 group-hover:opacity-100 transition-opacity mt-auto`}>
												Khám phá ngay <ArrowRight className="w-3 h-3 md:w-4 md:h-4 transition-transform group-hover:translate-x-2" />
											</span>
										</div>
									</div>
								</NavLink>
							</motion.div>
						))}
					</motion.div>
				</div>
			</section>

			{/* SECTION 4: ADVENTURES & BOSSES */}
			<section className='py-12 md:py-20 px-3 md:px-8 lg:px-12 w-full max-w-[1600px] mx-auto'>
				<motion.div
					variants={fadeInUp}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-100px" }}
					className='mb-10 md:mb-16 text-center md:text-left'
				>
					<h3 className='flex items-center justify-center md:justify-start gap-2 text-red-500 font-bold uppercase tracking-widest mb-2 md:mb-3 text-xs md:text-sm'>
						<Map className='w-4 h-4 md:w-5 md:h-5' /> {tUI("home.adventuresTitle1") || "PHIÊU LƯU"}
					</h3>
					<h2 className='text-3xl md:text-6xl font-bold mb-3 md:mb-4 text-text-primary uppercase tracking-tighter'>
						{tUI("home.adventuresTitle2") || "& TRÙM"}
					</h2>
					<p className='text-text-secondary text-base md:text-lg font-secondary max-w-2xl mx-auto md:mx-0'>
						{tUI("home.adventuresDesc")}
					</p>
				</motion.div>

				<motion.div
					variants={staggerContainer}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-50px" }}
					className='grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8'
				>
					{[
						{ to: "/maps", label: tUI("nav.maps"), icon: Map, color: "red", img: BACKGROUND_IMAGES[2] },
						{ to: "/bosses", label: tUI("nav.bosses"), icon: Crown, color: "purple", img: BACKGROUND_IMAGES[8] },
						{ to: "/guides", label: tUI("nav.guides"), icon: BookOpen, color: "blue", img: BACKGROUND_IMAGES[7] },
					].map((item, idx) => (
						<motion.div variants={fadeInUp} key={idx} className='group block rounded-[24px] md:rounded-[30px] overflow-visible'>
							<div className="relative h-48 md:h-56 rounded-[24px] md:rounded-[30px] overflow-hidden shadow-lg">
								<div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url(${item.img})` }} />
							</div>
							<div className={`relative -mt-10 mx-3 p-5 md:-mt-12 md:mx-4 md:p-6 bg-surface-bg/95 backdrop-blur-2xl rounded-[20px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] border border-border/50 text-center z-10 transition-all duration-300 group-hover:-translate-y-2 group-hover:border-${item.color}-500/50`}>
								<div className={`absolute -top-5 md:-top-6 left-1/2 -translate-x-1/2 bg-${item.color}-600 p-2.5 md:p-3 rounded-full border-4 border-page-bg shadow-lg text-white`}>
									<item.icon className="w-5 h-5 md:w-6 md:h-6" />
								</div>
								<h3 className={`text-xl md:text-2xl font-bold mt-3 md:mt-4 mb-2 md:mb-4 uppercase tracking-tighter text-text-primary group-hover:text-${item.color}-500 transition-colors`}>
									{item.label}
								</h3>
								<NavLink to={item.to} className={`inline-flex items-center gap-2 text-${item.color}-500 font-bold uppercase text-xs md:text-sm group-hover:text-${item.color}-400 transition-colors`}>
									Read More <ArrowRight className="w-3 h-3 md:w-4 md:h-4 transition-transform group-hover:translate-x-1" />
								</NavLink>
							</div>
						</motion.div>
					))}
				</motion.div>
			</section>

			{/* SECTION 5: TOOLS & UTILITIES */}
			<section className='py-12 md:py-20 px-3 md:px-8 lg:px-12 w-full max-w-[1600px] mx-auto'>
				<motion.div
					variants={fadeInUp}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-100px" }}
					className='mb-10 md:mb-16 text-center'
				>
					<h3 className='flex items-center justify-center gap-2 text-primary-500 font-bold uppercase tracking-widest mb-2 md:mb-3 text-xs md:text-sm'>
						<Wrench className='w-4 h-4 md:w-5 md:h-5' /> {tUI("home.toolsTitle")}
					</h3>
					<h2 className='text-3xl md:text-6xl font-bold mb-3 md:mb-4 text-text-primary uppercase tracking-tighter'>
						{tUI("home.toolsTitle")}
					</h2>
				</motion.div>

				<motion.div
					variants={staggerContainer}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-50px" }}
					className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6'
				>
					{[
						{ to: "/simulator/vaults", label: tUI("nav.vaultSimulator") || "Vault Simulator", desc: tUI("vaultSimulator.description"), icon: Archive, color: "amber" },
						{ to: "/randomizer", label: tUI("home.luckyWheel"), desc: tUI("home.luckyWheelDesc"), icon: Dices, color: "primary" },
						{ to: "/tools/ratings", label: tUI("nav.championRatings"), desc: tUI("ratings.subtitle"), icon: Star, color: "orange" },
						{ to: "/introduction", label: tUI("nav.about"), desc: tUI("home.aboutDesc") || "Learn about the project", icon: BookOpen, color: "blue" },
					].map((tool, idx) => (
						<motion.div variants={fadeInUp} key={idx} className="h-full">
							<NavLink
								to={tool.to}
								className={`group h-full flex flex-col items-center text-center p-6 md:p-8 rounded-[24px] md:rounded-[30px] bg-surface-bg border border-border shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:border-${tool.color}-500/50`}
							>
								<div className={`p-4 md:p-5 rounded-full bg-${tool.color}-500/10 text-${tool.color}-500 group-hover:bg-${tool.color}-500 group-hover:text-white transition-colors duration-300 mb-4 md:mb-6`}>
									<tool.icon className="w-8 h-8 md:w-10 md:h-10" />
								</div>
								<h3 className={`text-lg md:text-xl font-bold mb-2 md:mb-3 uppercase tracking-tighter text-text-primary group-hover:text-${tool.color}-500 transition-colors`}>
									{tool.label}
								</h3>
								<p className='text-text-secondary text-xs md:text-sm font-secondary line-clamp-3 mb-4 md:mb-6 flex-grow'>
									{tool.desc}
								</p>
								<div className={`inline-flex items-center gap-1 md:gap-2 text-${tool.color}-500 font-bold uppercase text-xs md:text-sm`}>
									{tUI("home.tryNow") || "Explore"} <ArrowRight className="w-3 h-3 md:w-4 md:h-4 transition-transform group-hover:translate-x-1" />
								</div>
							</NavLink>
						</motion.div>
					))}
				</motion.div>
			</section>

			{/* FOOTER CTA */}
			<section className='py-10 text-center border-t border-border relative overflow-hidden'>
				<div className='absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary-100/50 blur-[120px] -z-10 rounded-full' />
				<h2 className='text-6xl md:text-[8rem] font-bold uppercase mb-16 tracking-tighter italic leading-none text-text-primary'>
					{tUI("home.footerCTA1")}{" "}
					<span className='text-primary-600'>{tUI("home.footerCTA2")}</span> <br />
					{tUI("home.footerCTA3")}
				</h2>
				<NavLink
					to='/champions'
					className='inline-flex items-center gap-6 px-6 md:px-10 py-8 bg-primary-600 rounded-full text-3xl font-black text-white hover:-translate-y-2 hover:shadow-primary-600/60 active:scale-95 transition-all shadow-2xl shadow-primary-600/40 focus:outline-none focus:ring-4 focus:ring-primary-500/50'
				>
					{tUI("home.btnExploreNow")} <ChevronRight className='w-10 h-10' />
				</NavLink>
				<p className='mt-24 text-text-secondary opacity-50 uppercase tracking-[1em] text-xs font-secondary'>
					POC GUIDE - LEGEND OF RUNETERRA - 2026
				</p>
			</section>
		</div>
	);
};

export default Home;
