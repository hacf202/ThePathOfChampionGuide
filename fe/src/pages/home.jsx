// src/pages/Home.jsx
import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import PageTitle from "../components/common/pageTitle";
import { useTranslation } from "../hooks/useTranslation"; // 🟢 Import Hook Đa ngôn ngữ
import {
	Swords,
	ScrollText,
	Dices,
	ChevronRight,
	Crown,
	Zap,
	Shield,
	Flame,
	HandFist,
	Skull,
	Target,
	ArrowDown,
	Trophy,
	Sparkles,
	BookOpen,
} from "lucide-react";

const BACKGROUND_IMAGES = [
	"https://dd.b.pvp.net/7_2_0/set3/vi_vn/img/cards/03MT055T1-full.png", // Soraka
	"https://dd.b.pvp.net/6_3_0/set2/vi_vn/img/cards/02NX007T2-full.png", // Champions
	"https://dd.b.pvp.net/6_3_0/set3/vi_vn/img/cards/03MT087T1-full.png", // Monthly
	"https://wiki.leagueoflegends.com/en-us/images/06SI012T1-full.png?0bfd7", // Relics
	"https://dd.b.pvp.net/6_8_0/tpoc/vi_vn/img/cards/98SB031T2-full.png", // Guides
	"https://wiki.leagueoflegends.com/en-us/images/06SH009-full.png?ff10a", // Random
	"https://dd.b.pvp.net/6_3_0/tpoc/vi_vn/img/cards/98RU004T1-full.png", // Tierlist
];

const Home = () => {
	const { language } = useTranslation(); // 🟢 Khởi tạo Hook
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
				<h2 className='text-white font-primary text-2xl animate-pulse tracking-widest'>
					{language === "vi"
						? "ĐANG KHỞI TẠO POC GUIDE..."
						: "INITIALIZING POC GUIDE..."}
				</h2>
			</div>
		);
	}

	return (
		<div className='bg-[#0f172a] text-white font-primary selection:bg-primary-500 selection:text-white'>
			<PageTitle
				title={
					language === "vi"
						? "POC GUIDE - Con Đường Anh Hùng"
						: "POC GUIDE - The Path of Champions"
				}
				description={
					language === "vi"
						? "Wiki & Hướng Dẫn Path of Champions chuyên nghiệp nhất"
						: "The most professional Path of Champions Wiki & Guide"
				}
				type='website'
			/>

			{/* SECTION 1: HERO - Cực kỳ ấn tượng */}
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
							The Ultimate Guide
						</span>
					</div>
					<h1 className='text-6xl md:text-9xl font-bold mb-6 tracking-tighter drop-shadow-2xl italic uppercase leading-none'>
						{language === "vi" ? (
							<>
								CON ĐƯỜNG <br />{" "}
								<span className='text-primary-400'>ANH HÙNG</span>
							</>
						) : (
							<>
								PATH OF <br />{" "}
								<span className='text-primary-400'>CHAMPIONS</span>
							</>
						)}
					</h1>
					<p className='text-lg md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto font-secondary'>
						{language === "vi"
							? "Khám phá sức mạnh tối thượng, tối ưu hóa lối chơi và chinh phục mọi thử thách trong Con Đường Anh Hùng."
							: "Discover ultimate power, optimize your gameplay, and conquer all challenges in The Path of Champions."}
					</p>

					<div className='flex flex-col sm:flex-row items-center justify-center gap-6'>
						<NavLink
							to='/champions'
							className='group relative px-10 py-4 bg-primary-600 rounded-full font-bold overflow-hidden transition-all hover:scale-105 active:scale-95'
						>
							<span className='relative z-10 flex items-center gap-2 text-xl'>
								{language === "vi" ? "KHÁM PHÁ NGAY" : "EXPLORE NOW"}{" "}
								<ChevronRight />
							</span>
							<div className='absolute inset-0 bg-gradient-to-r from-primary-400 to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity' />
						</NavLink>
						<NavLink
							to='/guides'
							className='px-10 py-4 border border-white/30 rounded-full font-bold hover:bg-white/10 transition-all text-xl'
						>
							{language === "vi" ? "HƯỚNG DẪN MỚI" : "NEW GUIDES"}
						</NavLink>
					</div>
				</div>

				<div className='absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce flex flex-col items-center gap-2 text-gray-400'>
					<span className='text-xs uppercase tracking-widest'>
						{language === "vi" ? "Cuộn xuống" : "Scroll down"}
					</span>
					<ArrowDown className='w-6 h-6' />
				</div>
			</section>

			{/* SECTION 2: BENTO GRID - Các tính năng cốt lõi */}
			<section className='py-10 px-6 max-w-7xl mx-auto'>
				<div className='flex flex-col md:flex-row justify-between items-end mb-12 gap-6'>
					<div>
						<h2 className='text-4xl md:text-6xl font-bold uppercase mb-4'>
							{language === "vi" ? (
								<>
									TÀI NGUYÊN{" "}
									<span className='text-primary-500'>HÀNH TRÌNH</span>
								</>
							) : (
								<>
									JOURNEY <span className='text-primary-500'>RESOURCES</span>
								</>
							)}
						</h2>
						<p className='text-gray-400 text-lg md:text-xl'>
							{language === "vi"
								? "Mọi thứ bạn cần để trở thành cao thủ Runeterra"
								: "Everything you need to become a Runeterra master"}
						</p>
					</div>
					<NavLink
						to='/champions'
						className='flex items-center gap-2 text-primary-400 hover:text-primary-300 transition-colors font-bold text-lg underline underline-offset-8'
					>
						{language === "vi" ? "XEM TẤT CẢ TƯỚNG" : "VIEW ALL CHAMPIONS"}{" "}
						<ChevronRight className='w-5 h-5' />
					</NavLink>
				</div>

				<div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
					{/* Card Lớn: Champion List */}
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
								{language === "vi" ? "Danh Sách Tướng" : "Champions List"}
							</h3>
							<p className='text-gray-300 text-lg'>
								{language === "vi"
									? "Chi tiết sức mạnh, lối chơi và mẹo nâng cấp cho từng anh hùng."
									: "Detailed powers, gameplay, and upgrade tips for each hero."}
							</p>
						</div>
					</NavLink>

					{/* Card Vừa: Relics */}
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
								{language === "vi" ? "Kho Cổ Vật" : "Relics Vault"}
							</h3>
							<p className='text-gray-300 text-lg'>
								{language === "vi"
									? "Kết hợp cổ vật tối ưu nhất cho từng vị tướng."
									: "The most optimal relic combinations for each champion."}
							</p>
						</div>
					</NavLink>
				</div>
			</section>

			{/* SECTION 3: FEATURED FEATURE - Thử thách tháng (Glassmorphism) */}
			<section className='relative py-2 md:py-4 px-6 overflow-hidden'>
				<div className='absolute top-0 right-0 w-[500px] h-[500px] bg-primary-900/20 blur-[120px] -z-10' />
				<div className='absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-900/20 blur-[120px] -z-10' />

				<div className='max-w-7xl mx-auto bg-white/5 border border-white/10 rounded-[40px] p-8 md:p-16 backdrop-blur-xl relative'>
					<div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
						<div className='order-2 lg:order-1'>
							<div className='flex items-center gap-3 text-primary-400 mb-6 font-bold tracking-widest uppercase'>
								<Trophy className='w-6 h-6' />
								<span>
									{language === "vi" ? "Sự kiện hàng tháng" : "Monthly Event"}
								</span>
							</div>
							<h2 className='text-4xl md:text-7xl font-bold uppercase mb-8 leading-tight'>
								{language === "vi" ? (
									<>
										Vượt Qua <br />
										<span className='text-primary-500'>Thử Thách Tháng</span>
									</>
								) : (
									<>
										Conquer <br />
										<span className='text-primary-500'>Monthly Challenges</span>
									</>
								)}
							</h2>
							<p className='text-xl text-gray-400 mb-10 leading-relaxed font-secondary'>
								{language === "vi"
									? "Đừng để 70 màn chơi làm bạn chùn bước. Chúng tôi cung cấp lộ trình chi tiết, gợi ý tướng và cách phân bổ lượt đi thông minh nhất để nhận trọn phần thưởng."
									: "Don't let 70 stages hold you back. We provide detailed routes, champion suggestions, and smart pacing to claim all rewards."}
							</p>
							<NavLink
								to='/guides/thu-thach-thang'
								className='inline-flex items-center gap-4 px-10 py-5 bg-white text-black font-bold rounded-2xl text-xl hover:bg-primary-400 hover:text-white transition-all'
							>
								{language === "vi" ? "XEM HƯỚNG DẪN" : "VIEW GUIDES"}{" "}
								<ArrowDown className='w-6 h-6 -rotate-90' />
							</NavLink>
						</div>
						<div className='order-1 lg:order-2 relative'>
							<img
								src={BACKGROUND_IMAGES[2]}
								alt='Monthly Challenge'
								className='rounded-3xl shadow-2xl border border-white/20 scale-105 rotate-3 hover:rotate-0 transition-transform duration-500'
							/>
							<div className='absolute -bottom-6 -left-6 bg-primary-600 p-6 rounded-2xl hidden md:block animate-bounce shadow-xl'>
								<p className='font-bold text-2xl'>70/70</p>
								<p className='text-xs uppercase'>
									{language === "vi" ? "Màn thử thách" : "Challenge Stages"}
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* SECTION 4: QUICK TOOLS - Các công cụ khác */}
			<section className='py-10 px-6 max-w-7xl mx-auto'>
				<div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
					<div className='md:col-span-1 bg-gradient-to-br from-primary-900/40 to-transparent p-10 rounded-3xl border border-white/10'>
						<Dices className='w-12 h-12 text-primary-400 mb-6' />
						<h3 className='text-3xl font-bold mb-4 uppercase'>
							{language === "vi" ? "Vòng Quay May Mắn" : "Lucky Wheel"}
						</h3>
						<p className='text-gray-400 mb-8 font-secondary'>
							{language === "vi"
								? "Không biết chơi tướng nào? Hãy để định mệnh quyết định giúp bạn với công cụ quay ngẫu nhiên."
								: "Don't know which champion to play? Let fate decide with our randomizer tool."}
						</p>
						<NavLink
							to='/randomizer'
							className='text-white font-bold flex items-center gap-2 group underline'
						>
							{language === "vi" ? "THỬ NGAY" : "TRY IT OUT"}{" "}
							<ChevronRight className='group-hover:translate-x-2 transition-transform' />
						</NavLink>
					</div>

					<div className='md:col-span-1 bg-gradient-to-br from-purple-900/40 to-transparent p-10 rounded-3xl border border-white/10'>
						<Trophy className='w-12 h-12 text-purple-400 mb-6' />
						<h3 className='text-3xl font-bold mb-4 uppercase'>
							{language === "vi" ? "Bảng Xếp Hạng" : "Tier List"}
						</h3>
						<p className='text-gray-400 mb-8 font-secondary'>
							{language === "vi"
								? "Tier List cập nhật mới nhất. Xem tướng nào đang làm bá chủ Con Đường Anh Hùng."
								: "Latest updated Tier List. See which champions dominate The Path of Champions."}
						</p>
						<NavLink
							to='/tierlist'
							className='text-white font-bold flex items-center gap-2 group underline'
						>
							{language === "vi" ? "XEM XẾP HẠNG" : "VIEW TIER LIST"}{" "}
							<ChevronRight className='group-hover:translate-x-2 transition-transform' />
						</NavLink>
					</div>

					<div className='md:col-span-1 bg-gradient-to-br from-emerald-900/40 to-transparent p-10 rounded-3xl border border-white/10'>
						<BookOpen className='w-12 h-12 text-emerald-400 mb-6' />
						<h3 className='text-3xl font-bold mb-4 uppercase'>
							{language === "vi" ? "Hướng Dẫn POC" : "POC Guides"}
						</h3>
						<p className='text-gray-400 mb-8 font-secondary'>
							{language === "vi"
								? "Từ cơ bản đến nâng cao: Cách tích mảnh tướng, tối ưu bụi cổ vật và nâng cấp sức mạnh sao."
								: "From basic to advanced: How to farm champion fragments, optimize relics, and upgrade star powers."}
						</p>
						<NavLink
							to='/guides'
							className='text-white font-bold flex items-center gap-2 group underline'
						>
							{language === "vi" ? "HỌC CÁCH CHƠI" : "LEARN HOW TO PLAY"}{" "}
							<ChevronRight className='group-hover:translate-x-2 transition-transform' />
						</NavLink>
					</div>
				</div>
			</section>

			{/* FOOTER CTA */}
			<section className='py-24 text-center border-t border-white/5'>
				<h2 className='text-5xl md:text-7xl font-bold uppercase mb-8 tracking-tighter'>
					{language === "vi" ? (
						<>
							Bắt đầu <span className='text-primary-500'>Hành trình</span> của
							bạn?
						</>
					) : (
						<>
							Start <span className='text-primary-500'>Your Journey</span>{" "}
							today?
						</>
					)}
				</h2>
				<NavLink
					to='/champions'
					className='inline-flex items-center gap-4 px-12 py-6 bg-primary-600 rounded-full text-2xl font-bold hover:scale-110 transition-transform shadow-2xl shadow-primary-600/20'
				>
					{language === "vi" ? "KHÁM PHÁ NGAY" : "EXPLORE NOW"}{" "}
					<ChevronRight className='w-8 h-8' />
				</NavLink>
				<p className='mt-12 text-gray-500 uppercase tracking-[0.5em] text-sm'>
					POC GUIDE • 2026 • LEGEND OF RUNETERRA
				</p>
			</section>
		</div>
	);
};

export default Home;
