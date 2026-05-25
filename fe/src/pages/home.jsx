import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
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
	Wrench,
	Clock,
	MessageCircle,
	HelpCircle
} from "lucide-react";

// Tăng cường animation mượt mà hơn
const fadeInUp = {
	hidden: { opacity: 0, y: 60, filter: "blur(10px)" },
	visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: { staggerChildren: 0.2 }
	}
};

const BACKGROUND_IMAGES = [
	"https://images.pocguide.top/backgrounds/BG1.webp",
	"https://images.pocguide.top/backgrounds/BG5.webp",
	"https://images.pocguide.top/backgrounds/BG4.webp",
	"https://images.pocguide.top/backgrounds/BG2.webp",
	"https://images.pocguide.top/backgrounds/BG3.webp",
	"https://images.pocguide.top/backgrounds/BG6.webp",
	"https://images.pocguide.top/backgrounds/BG7.webp",
	"https://images.pocguide.top/backgrounds/BG8.webp",
	"https://images.pocguide.top/backgrounds/BG9.webp",
	"https://images.pocguide.top/backgrounds/BG10.webp",
	"https://images.pocguide.top/backgrounds/MAINBG.webp"
];

// Nâng cấp: Thêm Parallax Scroll Animation cho CinematicSection
const CinematicSection = ({ title1, title2, bgImage, children, reverse = false }) => {
	const ref = useRef(null);
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start end", "end start"]
	});
	
	// Hiệu ứng cuộn cho ảnh nền (Parallax không delay)
	const backgroundY = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);
	const textY = useTransform(scrollYProgress, [0, 1], ["-40px", "40px"]);

	return (
		<section ref={ref} className='relative w-full min-h-[90vh] lg:min-h-screen bg-[#05050A] overflow-hidden flex items-center justify-center isolate py-16 lg:py-24'>
			<div className='absolute inset-0 z-0 select-none overflow-hidden bg-black'>
				{/* 100% Opacity, No Grayscale, Parallax Y */}
				<motion.div 
					className='absolute inset-0 -top-[20%] -bottom-[20%] transform-gpu'
					style={{ y: backgroundY }}
				>
					<img
						src={bgImage}
						alt='Background'
						loading='lazy'
						className='w-full h-full object-cover scale-[1.1] transition-transform duration-[30s] ease-linear hover:scale-[1.15] will-change-transform opacity-100'
					/>
				</motion.div>
				
				{/* Gradients to keep text readable but let colors pop (Dark gradient instead of page-bg) */}
				<div className='absolute inset-0 bg-gradient-to-t from-[#05050A] via-[#05050A]/60 to-transparent opacity-95' />
				<div className='absolute inset-0 bg-gradient-to-b from-[#05050A]/90 via-transparent to-transparent opacity-80' />
				
				{/* GRAIN TEXTURE */}
				<div className='absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay'
					style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }} />
			</div>

			<div className='relative w-full h-full max-w-[1920px] mx-auto z-20 p-4 md:px-12 flex flex-col justify-center overflow-visible'>
				{/* Tiêu đề bay theo parallax nhẹ */}
				<motion.div 
					style={{ y: textY }}
					className={`pointer-events-none z-30 w-full px-4 select-none mb-8 lg:mb-16 overflow-visible ${reverse ? 'lg:text-right text-center' : 'lg:text-left text-center'}`}
				>
					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						whileInView={{ opacity: 1, scale: 1 }}
						viewport={{ once: true, margin: "-100px" }}
						transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
						className="overflow-visible"
					>
						{/* Fix chữ tiêu đề: Đẩy title1 lên 100% opacity */}
						<h2 className='text-5xl sm:text-7xl md:text-[8rem] lg:text-[11rem] font-black uppercase leading-[0.85] tracking-tighter italic text-white filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)] overflow-visible w-full max-w-[100vw]'>
							<span className="inline-block pr-12 lg:pr-24 overflow-visible">{title1}</span> <br />
							<span className='text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.9)] relative inline-block pr-12 lg:pr-24 overflow-visible'>
								{title2}
							</span>
						</h2>
					</motion.div>
				</motion.div>
				<div className="z-40 w-full px-2 lg:px-4">
					{children}
				</div>
			</div>
		</section>
	);
};

// Nâng cấp: Thêm 3D Hover & Glow mượt hơn cho Cards
const CinematicCard = ({ to, icon: Icon, title, desc, img, small = false }) => {
	return (
		<motion.div variants={fadeInUp} className="h-full group cursor-pointer" whileHover={{ scale: 1.02 }} transition={{ duration: 0.4, ease: "easeOut" }}>
			<NavLink
				to={to}
				className={`relative flex flex-col h-full ${small ? 'min-h-[180px] p-5' : 'min-h-[250px] lg:min-h-[350px] p-6 lg:p-8'} rounded-2xl lg:rounded-none border-[1px] border-white/10 bg-[#05050A] overflow-hidden transition-all duration-500 hover:border-primary-400 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.9)] hover:shadow-[0_0_40px_-5px_rgba(var(--color-primary-rgb),0.5)]`}
			>
				<img src={img} alt={title} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-[1s] ease-out group-hover:scale-110 pointer-events-none" />
				{/* Đảm bảo gradient đen đủ đậm để đọc chữ dễ dàng */}
				<div className="absolute inset-0 bg-gradient-to-t from-[#05050A] via-[#05050A]/70 to-transparent pointer-events-none opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
				
				<div className="relative z-10 flex flex-col h-full justify-end">
					<div className="mb-auto">
						<Icon className={`${small ? 'w-8 h-8' : 'w-10 h-10 lg:w-12 lg:h-12'} text-white group-hover:text-primary-300 transition-all duration-500 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] group-hover:scale-110`} />
					</div>
					<h3 className={`${small ? 'text-xl md:text-2xl' : 'text-2xl md:text-3xl lg:text-4xl'} font-black uppercase tracking-tighter text-white mb-2 group-hover:text-primary-300 transition-colors drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]`}>
						{title}
					</h3>
					<div className="grid grid-rows-[0fr] lg:group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-in-out">
						<div className="overflow-hidden">
							<p className="text-white/90 font-secondary text-xs sm:text-sm md:text-base leading-relaxed pt-2 pb-1 opacity-0 lg:group-hover:opacity-100 transition-opacity duration-500 delay-100 drop-shadow-[0_2px_5px_rgba(0,0,0,0.8)]">
								{desc}
							</p>
						</div>
					</div>
					<p className="lg:hidden text-white/90 font-secondary text-xs mt-2 leading-relaxed drop-shadow-[0_2px_5px_rgba(0,0,0,0.8)]">
						{desc}
					</p>
				</div>
				
				{/* Neon Glow Corner Upgrade */}
				<div className="absolute -top-16 -right-16 w-40 h-40 bg-primary-500/0 blur-[50px] rounded-full group-hover:bg-primary-500/60 transition-all duration-700 pointer-events-none mix-blend-screen" />
			</NavLink>
		</motion.div>
	);
};

const Home = () => {
	const { tUI } = useTranslation();
	const navigate = useNavigate();
	const isDragging = useRef(false);

	const TILES = [
		{ to: "/champions", icon: Swords, label: tUI("nav.champions"), img: BACKGROUND_IMAGES[1], top: "15%", left: "10%", size: "w-28 h-28 lg:w-56 lg:h-56", mobileHidden: false },
		{ to: "/builds", icon: Crown, label: tUI("nav.builds"), img: BACKGROUND_IMAGES[3], top: "30%", left: "85%", size: "w-20 h-20 lg:w-44 lg:h-44", mobileHidden: false },
		{ to: "/items", icon: Package, label: tUI("nav.items"), img: BACKGROUND_IMAGES[4], top: "64%", left: "20%", size: "w-24 h-24 lg:w-48 lg:h-48", mobileHidden: true },
		{ to: "/relics", icon: Sparkles, label: tUI("nav.relics"), img: BACKGROUND_IMAGES[8], top: "1%", left: "33%", size: "w-20 h-20 lg:w-40 lg:h-40", mobileHidden: true },
		{ to: "/powers", icon: Zap, label: tUI("nav.powers"), img: BACKGROUND_IMAGES[5], top: "70%", left: "45%", size: "w-24 h-24 lg:w-48 lg:h-48", mobileHidden: false },
		{ to: "/runes", icon: Gem, label: tUI("nav.runes"), img: BACKGROUND_IMAGES[6], top: "5%", left: "80%", size: "w-20 h-20 lg:w-40 lg:h-40", mobileHidden: true },
		{ to: "/maps", icon: Map, label: tUI("nav.maps"), img: BACKGROUND_IMAGES[2], top: "65%", left: "75%", size: "w-18 h-18 lg:w-36 lg:h-36", mobileHidden: true },
		{ to: "/tools/ratings", icon: Dices, label: tUI("nav.championRatings"), img: BACKGROUND_IMAGES[9], top: "50%", left: "2%", size: "w-20 h-20 lg:w-36 lg:h-36", mobileHidden: false },
		{ to: "/cards", icon: GalleryHorizontal, label: tUI("nav.cards"), img: BACKGROUND_IMAGES[7], top: "2%", left: "64%", size: "w-24 h-24 lg:w-40 lg:h-40", mobileHidden: true },
		{ to: "/resources", icon: Archive, label: tUI("nav.resources"), img: BACKGROUND_IMAGES[6], top: "40%", left: "25%", size: "w-20 h-20 lg:w-44 lg:h-44", mobileHidden: true },
		{ to: "/champion/C085", icon: Star, label: tUI("nav.newChampion"), img: BACKGROUND_IMAGES[0], top: "0%", left: "49%", size: "w-20 h-20 lg:w-48 lg:h-48", mobileHidden: false },
	];

	useEffect(() => {}, []);

	return (
		<div className='bg-[#05050A] text-text-primary font-primary selection:bg-primary-500 selection:text-white overflow-x-hidden'>
			<PageTitle
				title={tUI("home.pageTitle")}
				description={tUI("home.pageDesc")}
				type='website'
			/>

			{/* --- SECTION 1: HERO MOODBOARD --- */}
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

			{/* --- SECTION 2: CHIẾN THUẬT (GAMEPLAY) --- */}
			<CinematicSection 
				title1={tUI("home.gameplayTitle1") || "LỐI CHƠI"} 
				title2={tUI("home.gameplayTitle2") || "CHIẾN THUẬT"} 
				bgImage={BACKGROUND_IMAGES[1]}
				reverse={false}
			>
				<motion.div
					variants={staggerContainer}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-150px" }}
					className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto'
				>
					<CinematicCard to="/champions" icon={Swords} title={tUI("championList.heading") || "Danh Sách Tướng"} desc="Khám phá toàn bộ danh sách Tướng, chỉ số cơ bản, kỹ năng và cách tối ưu hóa sức mạnh." img={BACKGROUND_IMAGES[0]} />
					<CinematicCard to="/builds" icon={Crown} title={tUI("nav.builds") || "Builds Tối Ưu"} desc="Tham khảo các bản build mạnh mẽ nhất kết hợp giữa Tướng, Cổ Vật và Sức Mạnh Nội Tại." img={BACKGROUND_IMAGES[3]} />
					<CinematicCard to="/sub-champions" icon={Users} title={tUI("nav.supportChampions") || "Tướng Phụ"} desc="Phân tích sức mạnh và khả năng phối hợp của các Tướng Phụ trong mỗi lượt đi." img={BACKGROUND_IMAGES[5]} />
				</motion.div>
			</CinematicSection>

			{/* --- SECTION 3: TÀI NGUYÊN (DATABASE) --- */}
			<CinematicSection 
				title1={tUI("home.databaseTitle1") || "THƯ VIỆN"} 
				title2={tUI("home.databaseTitle2") || "DỮ LIỆU"} 
				bgImage={BACKGROUND_IMAGES[4]}
				reverse={true}
			>
				<motion.div
					variants={staggerContainer}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-150px" }}
					className='grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 ml-auto max-w-7xl'
				>
					<CinematicCard small to="/relics" icon={Sparkles} title={tUI("nav.relics")} desc="Cổ Vật cường hóa Tướng." img={BACKGROUND_IMAGES[8]} />
					<CinematicCard small to="/items" icon={Package} title={tUI("nav.items")} desc="Vật Phẩm rớt trong hành trình." img={BACKGROUND_IMAGES[2]} />
					<CinematicCard small to="/powers" icon={Zap} title={tUI("nav.powers")} desc="Sức Mạnh Nội Tại." img={BACKGROUND_IMAGES[7]} />
					<CinematicCard small to="/runes" icon={Gem} title={tUI("nav.runes")} desc="Ngọc Bổ Trợ (Runes)." img={BACKGROUND_IMAGES[6]} />
					<CinematicCard small to="/cards" icon={GalleryHorizontal} title={tUI("nav.cards")} desc="Thẻ bài trong game." img={BACKGROUND_IMAGES[9]} />
					<CinematicCard small to="/resources" icon={Archive} title={tUI("nav.resources")} desc="Mảnh Tướng & Bụi Sao." img={BACKGROUND_IMAGES[5]} />
				</motion.div>
			</CinematicSection>

			{/* --- SECTION 4: PHIÊU LƯU & CÔNG CỤ (ADVENTURES & TOOLS) --- */}
			<CinematicSection 
				title1={tUI("home.adventuresTitle1") || "CÔNG CỤ &"} 
				title2={tUI("home.adventuresTitle2") || "THỬ THÁCH"} 
				bgImage={BACKGROUND_IMAGES[9]}
				reverse={false}
			>
				<motion.div
					variants={staggerContainer}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-150px" }}
					className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto'
				>
					<CinematicCard to="/maps" icon={Map} title={tUI("nav.maps")} desc="Bản đồ các khu vực, thông tin nhánh rẽ và phần thưởng chi tiết." img={BACKGROUND_IMAGES[2]} />
					<CinematicCard to="/bosses" icon={Crown} title={tUI("nav.bosses")} desc="Phân tích điểm yếu và chiến thuật đối đầu các Trùm nguy hiểm nhất." img={BACKGROUND_IMAGES[8]} />
					<CinematicCard to="/tools/champion-items" icon={Users} title={"Tướng Phụ Tương Thích"} desc="Tra cứu và tìm kiếm Tướng Phụ (Sub-champion) phù hợp nhất với Tướng chính dựa trên vật phẩm." img={BACKGROUND_IMAGES[7]} />
					<CinematicCard to="/simulator/vaults" icon={Archive} title={tUI("nav.vaultSimulator") || "Vault Simulator"} desc="Giả lập mở rương để kiểm tra tỷ lệ rớt đồ và mảnh tướng." img={BACKGROUND_IMAGES[4]} />
					<CinematicCard to="/randomizer" icon={Dices} title={tUI("home.luckyWheel") || "Randomizer"} desc="Tạo ngẫu nhiên Tướng và thử thách cho các pha chạy tự do." img={BACKGROUND_IMAGES[1]} />
					<CinematicCard to="/guides" icon={BookOpen} title={tUI("nav.guides")} desc="Hướng dẫn chiến thuật từ cơ bản đến nâng cao từ cộng đồng." img={BACKGROUND_IMAGES[3]} />
				</motion.div>
			</CinematicSection>

			{/* --- SECTION 5: BẢNG XẾP HẠNG & META (TIER LIST) --- */}
			<CinematicSection 
				title1={tUI("home.tierListTitle1") || "BẢNG XẾP HẠNG"} 
				title2={tUI("home.tierListTitle2") || "& META"} 
				bgImage={BACKGROUND_IMAGES[7]}
				reverse={true}
			>
				<motion.div
					variants={staggerContainer}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-150px" }}
					className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl ml-auto'
				>
					<CinematicCard to="/tierlist/champions" icon={Trophy} title={"Bảng Xếp Hạng Tướng"} desc="Xếp hạng sức mạnh (Tier List) của tất cả Tướng trong Meta hiện tại." img={BACKGROUND_IMAGES[1]} />
					<CinematicCard to="/tierlist/relics" icon={Sparkles} title={"Bảng Xếp Hạng Cổ Vật"} desc="Đánh giá độ hiệu quả và tính linh hoạt của các Cổ Vật (Relic Tier List)." img={BACKGROUND_IMAGES[8]} />
					<CinematicCard to="/tools/ratings" icon={Zap} title={"Đánh Giá Sức Mạnh"} desc="Xem biểu đồ phân tích và đánh giá chi tiết sức mạnh của từng vị Tướng." img={BACKGROUND_IMAGES[4]} />
				</motion.div>
			</CinematicSection>

			{/* --- SECTION 6: CẨM NANG & THÔNG TIN (GUIDES & INFO) --- */}
			<CinematicSection 
				title1={tUI("home.guidesTitle1") || "CẨM NANG"} 
				title2={tUI("home.guidesTitle2") || "& HƯỚNG DẪN"} 
				bgImage={BACKGROUND_IMAGES[6]}
				reverse={false}
			>
				<motion.div
					variants={staggerContainer}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-150px" }}
					className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto'
				>
					<CinematicCard to="/guides" icon={BookOpen} title={"Bài Viết Hướng Dẫn"} desc="Tuyển tập các bài hướng dẫn chi tiết từ cộng đồng game thủ." img={BACKGROUND_IMAGES[3]} small />
					<CinematicCard to="/introduction" icon={HelpCircle} title={"Cơ Chế Trò Chơi"} desc="Giới thiệu và giải thích các cơ chế hoạt động của The Path of Champions." img={BACKGROUND_IMAGES[5]} small />
					<CinematicCard to="/about-us" icon={Users} title={"Về Chúng Tôi"} desc="Thông tin về đội ngũ phát triển và mục tiêu của dự án." img={BACKGROUND_IMAGES[10]} small />
				</motion.div>
			</CinematicSection>

			{/* FOOTER CTA */}
			<section className='py-20 lg:py-40 text-center border-t border-white/10 relative overflow-hidden isolate px-4 bg-[#05050A]'>
				{/* Cinematic Background & Overlay */}
				<div className='absolute inset-0 -z-20'>
					<img src={BACKGROUND_IMAGES[2]} className='w-full h-full object-cover opacity-60 mix-blend-luminosity' alt='' />
					<div className='absolute inset-0 bg-gradient-to-t from-[#05050A] via-[#05050A]/90 to-[#05050A]/60 opacity-95' />
					<div className='absolute inset-0 bg-gradient-to-b from-[#05050A] via-transparent to-transparent opacity-90' />
				</div>
				<div className='absolute top-0 left-1/2 -translate-x-1/2 w-full lg:w-[1000px] h-[500px] bg-primary-600/20 blur-[200px] -z-10 rounded-full animate-pulse-slow' />
				
				<motion.div 
					initial={{ opacity: 0, scale: 0.9 }}
					whileInView={{ opacity: 1, scale: 1 }}
					viewport={{ once: true, margin: "-100px" }}
					transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
				>
					<h2 className='text-5xl md:text-7xl lg:text-[10rem] font-black uppercase mb-12 lg:mb-20 tracking-tighter italic leading-none text-white/90 drop-shadow-2xl overflow-visible w-full'>
						<span className="inline-block pr-6 -mr-6 lg:pr-12 lg:-mr-12 overflow-visible">
							{tUI("home.footerCTA1")}
						</span>{" "}
						<span className='inline-block pr-8 -mr-8 lg:pr-16 lg:-mr-16 overflow-visible text-transparent bg-clip-text bg-gradient-to-br from-white via-primary-100 to-primary-300 drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]'>
							{tUI("home.footerCTA2")}
						</span> <br />
						<span className="inline-block pr-6 -mr-6 lg:pr-12 lg:-mr-12 overflow-visible">
							{tUI("home.footerCTA3")}
						</span>
					</h2>
					
					<NavLink
						to='/champions'
						className='group inline-flex items-center gap-4 lg:gap-8 px-10 lg:px-14 py-6 lg:py-8 bg-primary-600/20 border-2 border-primary-500/50 backdrop-blur-xl rounded-2xl text-xl lg:text-4xl font-black text-white hover:bg-primary-500 hover:text-white transition-all duration-500 focus:outline-none shadow-[0_0_50px_rgba(var(--color-primary-rgb),0.4)] hover:shadow-[0_0_80px_rgba(var(--color-primary-rgb),0.8)] hover:scale-105 active:scale-95'
					>
						{tUI("home.btnExploreNow")} 
						<ChevronRight className='w-8 h-8 lg:w-12 lg:h-12 group-hover:translate-x-4 transition-transform duration-500' />
					</NavLink>
				</motion.div>
				
				<p className='mt-24 lg:mt-40 text-white/50 uppercase tracking-[0.5em] lg:tracking-[1em] text-[10px] lg:text-sm font-black'>
					POC GUIDE - LEGEND OF RUNETERRA - 2026
				</p>
			</section>
		</div>
	);
};

export default Home;
