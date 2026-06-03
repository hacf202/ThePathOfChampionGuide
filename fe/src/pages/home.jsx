import React, { useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Draggable } from "gsap/Draggable";

gsap.registerPlugin(Draggable);

import { SlideUp } from "@/components/common/animations";

import PageTitle from "@/components/common/pageTitle";
import CinematicSection from "@/components/home/components/CinematicSection";
import CinematicCard from "@/components/home/components/CinematicCard";
import { useTranslation } from "@/hooks/useTranslation";
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



const BACKGROUND_IMAGES = [
	"https://images.pocguide.top/backgrounds/1920px-06BW006T1-full.webp",
	"https://images.pocguide.top/backgrounds/BG5.webp",
	"https://images.pocguide.top/backgrounds/BG4.webp",
	"https://images.pocguide.top/backgrounds/BG2.webp",
	"https://images.pocguide.top/backgrounds/BG3.webp",
	"https://images.pocguide.top/backgrounds/BG6.webp",
	"https://images.pocguide.top/backgrounds/BG7.webp",
	"https://images.pocguide.top/backgrounds/BG8.webp",
	"https://images.pocguide.top/backgrounds/BG9.webp",
	"https://images.pocguide.top/backgrounds/BG10.webp",
	"https://images.pocguide.top/backgrounds/1920px-06BW011-full.webp"
];


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
		{ to: "/champion/C080", icon: Star, label: tUI("nav.newChampion"), img: BACKGROUND_IMAGES[0], top: "0%", left: "49%", size: "w-20 h-20 lg:w-48 lg:h-48", mobileHidden: false },
	];

	const containerRef = useRef(null);
	const tilesRef = useRef([]);

	useGSAP(() => {
		// Tiêu đề hero slide up nhẹ nhàng
		gsap.from(".hero-title", {
			y: 50,
			opacity: 0,
			duration: 1.5,
			ease: "power3.out",
		});

		// Hiệu ứng ánh sáng chạy qua chữ
		gsap.to(".title-shine", {
			x: "200%",
			duration: 3,
			repeat: -1,
			ease: "power2.inOut",
			repeatDelay: 5
		});

		// Floating animations and Draggable cho từng tile
		tilesRef.current.forEach((tile, idx) => {
			if (!tile) return;

			// Entry animation
			gsap.fromTo(tile, 
				{ opacity: 0, scale: 0.8, y: 50 },
				{
					opacity: 1,
					scale: 1,
					y: 0,
					duration: 1,
					ease: "back.out(1.5)",
					delay: 0.2 + idx * 0.1,
					onComplete: () => {
						// Sau khi entry xong thì mới float
						gsap.to(tile, {
							y: "+=15",
							duration: 3 + Math.random() * 2,
							repeat: -1,
							yoyo: true,
							ease: "sine.inOut",
							delay: Math.random() * 2
						});
					}
				}
			);
		});

		// Khởi tạo Draggable
		Draggable.create(tilesRef.current, {
			type: "x,y",
			bounds: containerRef.current,
			inertia: true,
			zIndexBoost: true,
			onDragStart: () => {
				isDragging.current = true;
			},
			onDragEnd: () => {
				// Prevent click from firing immediately after drag
				setTimeout(() => (isDragging.current = false), 50);
			}
		});
	}, { scope: containerRef });

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
					<div className='absolute inset-0 grayscale-[0.2] transform-gpu'>
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

				<div className='relative w-full h-full max-w-[1920px] mx-auto z-20 p-4' ref={containerRef}>
					{/* PROMINENT TITLE */}
					<div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none z-30 w-full px-4 md:px-12 select-none'>
						<div>
							<h1
								className='hero-title text-5xl sm:text-7xl md:text-[10rem] lg:text-[14rem] font-black text-white uppercase leading-none tracking-tighter italic mb-8 select-none'
								style={{ filter: 'drop-shadow(0 20px 50px rgba(0, 0, 0, 0.8))' }}
							>
								<span className="relative inline-block overflow-hidden pr-4 md:pr-8">
									{tUI("home.heroTitle1")}
									<div
										className="title-shine absolute inset-0 bg-white/20 -translate-x-full skew-x-12"
									/>
								</span>
								<br />
								<span className='text-transparent bg-clip-text bg-gradient-to-br from-primary-400 via-primary-600 to-indigo-700 inline-block filter drop-shadow-[0_0_30px_rgba(var(--color-primary-rgb),0.3)] pr-4 md:pr-8'>
									{tUI("home.heroTitle2")}
								</span>
							</h1>
						</div>
					</div>

					{/* TILES */}
					{TILES.map((tile, idx) => (
						<div
							key={idx}
							ref={el => (tilesRef.current[idx] = el)}
							className={`absolute group flex-col items-center cursor-grab active:cursor-grabbing z-10 opacity-0 ${tile.mobileHidden ? 'hidden lg:flex' : 'flex'}`}
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
						</div>
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
				<div
					className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto'
				>
					<CinematicCard to="/champions" icon={Swords} title={tUI("championList.heading") || "Danh Sách Tướng"} desc="Khám phá toàn bộ danh sách Tướng, chỉ số cơ bản, kỹ năng và cách tối ưu hóa sức mạnh." img={BACKGROUND_IMAGES[0]} />
					<CinematicCard to="/builds" icon={Crown} title={tUI("nav.builds") || "Builds Tối Ưu"} desc="Tham khảo các bản build mạnh mẽ nhất kết hợp giữa Tướng, Cổ Vật và Sức Mạnh Nội Tại." img={BACKGROUND_IMAGES[3]} />
					<CinematicCard to="/sub-champions" icon={Users} title={tUI("nav.supportChampions") || "Tướng Phụ"} desc="Phân tích sức mạnh và khả năng phối hợp của các Tướng Phụ trong mỗi lượt đi." img={BACKGROUND_IMAGES[5]} />
				</div>
			</CinematicSection>

			{/* --- SECTION 3: TÀI NGUYÊN (DATABASE) --- */}
			<CinematicSection 
				title1={tUI("home.databaseTitle1") || "THƯ VIỆN"} 
				title2={tUI("home.databaseTitle2") || "DỮ LIỆU"} 
				bgImage={BACKGROUND_IMAGES[4]}
				reverse={true}
			>
				<div
					className='grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 ml-auto max-w-7xl'
				>
					<CinematicCard small to="/relics" icon={Sparkles} title={tUI("nav.relics")} desc="Cổ Vật cường hóa Tướng." img={BACKGROUND_IMAGES[8]} />
					<CinematicCard small to="/items" icon={Package} title={tUI("nav.items")} desc="Vật Phẩm rớt trong hành trình." img={BACKGROUND_IMAGES[2]} />
					<CinematicCard small to="/powers" icon={Zap} title={tUI("nav.powers")} desc="Sức Mạnh Nội Tại." img={BACKGROUND_IMAGES[7]} />
					<CinematicCard small to="/runes" icon={Gem} title={tUI("nav.runes")} desc="Ngọc Bổ Trợ (Runes)." img={BACKGROUND_IMAGES[6]} />
					<CinematicCard small to="/cards" icon={GalleryHorizontal} title={tUI("nav.cards")} desc="Thẻ bài trong game." img={BACKGROUND_IMAGES[9]} />
					<CinematicCard small to="/resources" icon={Archive} title={tUI("nav.resources")} desc="Mảnh Tướng & Bụi Sao." img={BACKGROUND_IMAGES[5]} />
				</div>
			</CinematicSection>

			{/* --- SECTION 4: PHIÊU LƯU & CÔNG CỤ (ADVENTURES & TOOLS) --- */}
			<CinematicSection 
				title1={tUI("home.adventuresTitle1") || "CÔNG CỤ &"} 
				title2={tUI("home.adventuresTitle2") || "THỬ THÁCH"} 
				bgImage={BACKGROUND_IMAGES[9]}
				reverse={false}
			>
				<div
					className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto'
				>
					<CinematicCard to="/maps" icon={Map} title={tUI("nav.maps")} desc="Bản đồ các khu vực, thông tin nhánh rẽ và phần thưởng chi tiết." img={BACKGROUND_IMAGES[2]} />
					<CinematicCard to="/bosses" icon={Crown} title={tUI("nav.bosses")} desc="Phân tích điểm yếu và chiến thuật đối đầu các Trùm nguy hiểm nhất." img={BACKGROUND_IMAGES[8]} />
					<CinematicCard to="/tools/champion-items" icon={Users} title={"Tướng Phụ Tương Thích"} desc="Tra cứu và tìm kiếm Tướng Phụ (Sub-champion) phù hợp nhất với Tướng chính dựa trên vật phẩm." img={BACKGROUND_IMAGES[7]} />
					<CinematicCard to="/simulator/vaults" icon={Archive} title={tUI("nav.vaultSimulator") || "Vault Simulator"} desc="Giả lập mở rương để kiểm tra tỷ lệ rớt đồ và mảnh tướng." img={BACKGROUND_IMAGES[4]} />
					<CinematicCard to="/randomizer" icon={Dices} title={tUI("home.luckyWheel") || "Randomizer"} desc="Tạo ngẫu nhiên Tướng và thử thách cho các pha chạy tự do." img={BACKGROUND_IMAGES[1]} />
					<CinematicCard to="/guides" icon={BookOpen} title={tUI("nav.guides")} desc="Hướng dẫn chiến thuật từ cơ bản đến nâng cao từ cộng đồng." img={BACKGROUND_IMAGES[3]} />
				</div>
			</CinematicSection>

			{/* --- SECTION 5: BẢNG XẾP HẠNG & META (TIER LIST) --- */}
			<CinematicSection 
				title1={tUI("home.tierListTitle1") || "BẢNG XẾP HẠNG"} 
				title2={tUI("home.tierListTitle2") || "& META"} 
				bgImage={BACKGROUND_IMAGES[7]}
				reverse={true}
			>
				<div
					className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl ml-auto'
				>
					<CinematicCard to="/tierlist/champions" icon={Trophy} title={"Bảng Xếp Hạng Tướng"} desc="Xếp hạng sức mạnh (Tier List) của tất cả Tướng trong Meta hiện tại." img={BACKGROUND_IMAGES[1]} />
					<CinematicCard to="/tierlist/relics" icon={Sparkles} title={"Bảng Xếp Hạng Cổ Vật"} desc="Đánh giá độ hiệu quả và tính linh hoạt của các Cổ Vật (Relic Tier List)." img={BACKGROUND_IMAGES[8]} />
					<CinematicCard to="/tools/ratings" icon={Zap} title={"Đánh Giá Sức Mạnh"} desc="Xem biểu đồ phân tích và đánh giá chi tiết sức mạnh của từng vị Tướng." img={BACKGROUND_IMAGES[4]} />
				</div>
			</CinematicSection>

			{/* --- SECTION 6: CẨM NANG & THÔNG TIN (GUIDES & INFO) --- */}
			<CinematicSection 
				title1={tUI("home.guidesTitle1") || "CẨM NANG"} 
				title2={tUI("home.guidesTitle2") || "& HƯỚNG DẪN"} 
				bgImage={BACKGROUND_IMAGES[6]}
				reverse={false}
			>
				<div
					className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto'
				>
					<CinematicCard to="/guides" icon={BookOpen} title={"Bài Viết Hướng Dẫn"} desc="Tuyển tập các bài hướng dẫn chi tiết từ cộng đồng game thủ." img={BACKGROUND_IMAGES[3]} small />
					<CinematicCard to="/introduction" icon={HelpCircle} title={"Cơ Chế Trò Chơi"} desc="Giới thiệu và giải thích các cơ chế hoạt động của The Path of Champions." img={BACKGROUND_IMAGES[5]} small />
					<CinematicCard to="/about-us" icon={Users} title={"Về Chúng Tôi"} desc="Thông tin về đội ngũ phát triển và mục tiêu của dự án." img={BACKGROUND_IMAGES[10]} small />
				</div>
			</CinematicSection>

			{/* FOOTER CTA */}
			<section className='py-20 lg:py-40 text-center border-t border-white/10 relative overflow-hidden isolate px-4 bg-[#05050A]'>
				{/* Cinematic Background & Overlay */}
				<div className='absolute inset-0 -z-20'>
					<img src={BACKGROUND_IMAGES[2]} className='w-full h-full object-cover opacity-60 mix-blend-luminosity' alt='' />
					<div className='absolute inset-0 bg-gradient-to-t from-[#05050A] via-[#05050A]/90 to-[#05050A]/60 opacity-95' />
					<div className='absolute inset-0 bg-gradient-to-b from-[#05050A] via-transparent to-transparent opacity-90' />
				</div>
				<div className='absolute top-0 left-1/2 -translate-x-1/2 w-full lg:w-[1000px] h-[500px] bg-primary-600/20 md:blur-[200px] blur-[100px] -z-10 rounded-full animate-pulse-slow' />
				
				<div>
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
				</div>
				
				<p className='mt-24 lg:mt-40 text-white/50 uppercase tracking-[0.5em] lg:tracking-[1em] text-[10px] lg:text-sm font-black'>
					POC GUIDE - LEGEND OF RUNETERRA - 2026
				</p>
			</section>
		</div>
	);
};

export default Home;
