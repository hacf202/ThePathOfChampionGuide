// src/pages/Home.jsx
import React, { useEffect } from "react"; // Xóa useEffect chèn style
import { NavLink } from "react-router-dom";
import PageTitle from "../components/common/pageTitle";
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
} from "lucide-react";

// Mảng ảnh nền vẫn giữ nguyên
const BACKGROUND_IMAGES = [
	"https://dd.b.pvp.net/6_3_0/set2/vi_vn/img/cards/02NX007T2-full.png",
	"https://dd.b.pvp.net/6_3_0/set3/vi_vn/img/cards/03MT087T1-full.png",
	"https://wiki.leagueoflegends.com/en-us/images/06SI012T1-full.png?0bfd7",
	"https://dd.b.pvp.net/6_8_0/tpoc/vi_vn/img/cards/98SB031T2-full.png",
	"https://wiki.leagueoflegends.com/en-us/images/06SH009-full.png?ff10a",
	"https://dd.b.pvp.net/6_3_0/tpoc/vi_vn/img/cards/98RU004T1-full.png",
];

// Hàm preload vẫn giữ nguyên
const preloadBackgrounds = () => {
	BACKGROUND_IMAGES.forEach(src => {
		const link = document.createElement("link");
		link.rel = "preload";
		link.as = "image";
		link.href = src;
		document.head.appendChild(link);
	});
};

const Home = () => {
	// CHỈ CÒN LẠI useEffect cho preload ảnh
	useEffect(() => {
		preloadBackgrounds();
	}, []);

	// SỬ DỤNG CLASS MÀU TỪ TAILWIND CONFIG
	const roles = [
		{
			icon: Swords,
			bg: "bg-role-aggro",
			label: "AGGRO",
			shadow: "shadow-role-aggro/50",
			link: "/champions",
		},
		{
			icon: Zap,
			bg: "bg-role-combo",
			label: "COMBO",
			shadow: "shadow-role-combo/60",
			link: "/champions",
		},

		{
			icon: Shield,
			bg: "bg-role-control",
			label: "CONTROL",
			shadow: "shadow-role-control/50",
			link: "/champions",
		},
		{
			icon: Skull,
			bg: "bg-role-mill",
			label: "MILL (MAIKA)",
			shadow: "shadow-role-mill/50",
			link: "/champions",
		},
		{
			icon: Target,
			bg: "bg-role-midrange",
			label: "MIDRANGE",
			shadow: "shadow-role-midrange/50",
			link: "/champions",
		},
		{
			icon: Flame,
			bg: "bg-role-burn",
			label: "BURN",
			shadow: "shadow-role-burn/50",
			link: "/champions",
		},

		{
			icon: HandFist,
			bg: "bg-role-ftk-otk",
			label: "FTK / OTK",
			shadow: "shadow-role-ftk-otk/50",
			link: "/champions",
		},
	];

	// SỬ DỤNG CLASS MÀU TỪ TAILWIND CONFIG
	const sections = [
		{
			title: "DANH SÁCH TƯỚNG",
			subtitle: "KHÁM PHÁ SỨC MẠNH – TRỞ THÀNH CAO THỦ",
			titleColor: "text-accent1-title",
			subtitleColor: "text-accent1-subtitle",
			btnBg: "bg-accent1-cta-bg",
			btnHover: "hover:bg-accent1-cta-hover hover:shadow-accent1-cta-bg/70",
			link: "/champions",
			btnText: "Xem Danh Sách Tướng",
			icon: Swords,
			align: "center",
		},
		{
			title: "THỬ THÁCH THÁNG",
			subtitle: "Hướng Dẫn Từ A-Z Vượt Ải Tháng Hiệu Quả",
			titleColor: "text-accent2-title",
			subtitleColor: "text-accent2-subtitle",
			btnBg: "bg-accent2-cta-bg",
			btnHover: "hover:bg-accent2-cta-hover hover:shadow-accent2-cta-bg/70",
			link: "/guides/thu-thach-thang",
			btnText: "Xem Hướng Dẫn",
			icon: ScrollText,
			align: "center",
		},
		{
			title: "DANH SÁCH CỔ VẬT",
			subtitle: "TỐI ƯU HÓA SỨC MẠNH – THỐNG TRỊ CHIẾN TRƯỜNG",
			titleColor: "text-accent2-title",
			subtitleColor: "text-accent2-subtitle",
			btnBg: "bg-accent2-cta-bg",
			btnHover: "hover:bg-accent2-cta-hover hover:shadow-accent2-cta-bg/70",
			link: "/builds",
			btnText: "Xem Bộ Cổ Vật",
			icon: ScrollText,
			align: "left",
		},
		{
			title: "Hướng Dẫn POC",
			subtitle: "CÁC BÀI HƯỚNG DẪN VỀ CON ĐƯỜNG ANH HÙNG",
			titleColor: "text-purple-200",
			subtitleColor: "text-purple-100",
			btnBg: "bg-purple-800",
			btnHover: "hover:bg-purple-80 hover:bg-purple-800/70",
			link: "/guides",
			btnText: "Xem Bộ Cổ Vật",
			icon: ScrollText,
			align: "left",
		},
		{
			title: "VÒNG QUAY MAY MẮN",
			subtitle: "NGẪU NHIÊN HOÀN HẢO – THỬ NGẪU CHIẾN THẮNG",
			titleColor: "text-accent3-title",
			subtitleColor: "text-accent3-subtitle",
			btnBg: "bg-accent3-cta-bg",
			btnHover: "hover:bg-accent3-cta-hover hover:shadow-accent3-cta-bg/70",
			link: "/randomizer",
			btnText: "Quay Ngay",
			icon: Dices,
			spin: true,
			align: "right",
		},
		{
			title: "TIER LIST POC",
			subtitle: "Tạo Bảng Xếp Hạng Tướng Của Bạn",
			titleColor: "text-accent1-title",
			subtitleColor: "text-accent1-subtitle",
			btnBg: "bg-red-600",
			btnHover: "hover:bg-accent1-cta-hover hover:shadow-accent1-cta-bg/70",
			link: "/tierlist",
			btnText: "Tạo Bảng Xếp Hạng",
			icon: Swords,
			align: "right",
		},
	];

	return (
		<div>
			<PageTitle
				title='Con Đường Anh Hùng'
				description='POC GUIDE - Wiki Hướng Dẫn Con Đường Anh Hùng (Path of Champions): Tier list tướng S/A/B mới nhất 2025 (Jinx, LeBlanc, Swain, A.Sol dẫn đầu), build relic/power/rune tối ưu, cổ vật Epic, vòng quay may mắn. Chiến thuật AGGRO/COMBO/CONTROL đánh boss Galio/A.Sol dễ dàng!'
				type='website'
			/>

			<div className='text-white overflow-x-hidden font-primary'>
				{/* Lớp phủ này giờ đọc từ theme.css (thông qua tailwind.config) */}
				<div className='fixed inset-0 -z-20 pointer-events-none bg-page-overlay' />

				{sections.map((section, idx) => (
					<section
						key={idx}
						className='relative min-h-screen flex overflow-hidden'
						style={{
							padding:
								section.align === "center" ? "0 1.5rem md:3rem lg:6rem" : "0",
						}}
					>
						{/* Ảnh nền */}
						<div
							className='absolute inset-0 w-full h-full -z-10 bg-cover bg-center'
							style={{
								backgroundImage: `url(${
									BACKGROUND_IMAGES[idx % BACKGROUND_IMAGES.length]
								})`,
								filter: "brightness(0.9) contrast(1.1) saturate(1.2)",
							}}
						/>
						{/* Lớp phủ mờ trên ảnh */}
						<div className='absolute inset-0 bg-black/15 -z-10' />

						{/* === NỘI DUNG – DÍNH SÁT GÓC DƯỚI === */}
						<div
							className={`
              absolute bottom-0 w-full
              ${section.align === "left" ? "left-0 pl-6 md:pl-12 lg:pl-20" : ""}
              ${
								section.align === "right"
									? "right-0 pr-6 md:pr-12 lg:pr-20"
									: ""
							}
              ${
								section.align === "center"
									? "left-1/2 -translate-x-1/2 max-w-6xl px-6 md:px-12 lg:px-24"
									: ""
							}
              pb-12 md:pb-16 z-10
            `}
						>
							{/* Badge */}
							{idx === 0 && section.align === "center" && (
								<div className='flex justify-center mb-8'>
									{/* SỬ DỤNG CLASS MỚI TỪ theme.css VÀ TAILWIND CONFIG */}
									<div className='inline-flex items-center gap-3 px-7 py-3 bg-accent1-badge-bg rounded-full shadow-xl animate-badgeBounce'>
										<Crown className='w-7 h-7 text-white' />
										<span className='font-bold uppercase tracking-wider text-white text-lg '>
											Con Đường Anh Hùng
										</span>
									</div>
								</div>
							)}

							{/* Tiêu đề */}
							<h2
								className={`
                text-5xl md:text-7xl lg:text-8xl font-bold mb-4 tracking-wider drop-shadow-2xl animate-fadeIn
                ${
									section.align === "left"
										? "text-left"
										: section.align === "right"
											? "text-right"
											: "text-center"
								}
                ${section.titleColor}
              `}
								style={{
									textShadow:
										"0 0 20px rgba(255,255,255,0.7), 0 0 40px currentColor",
								}}
							>
								{section.title}
							</h2>

							{/* Phụ đề */}
							<p
								className={`
                text-xl md:text-3xl lg:text-4xl font-bold uppercase tracking-widest mb-8 drop-shadow-xl animate-slideUp
                ${
									section.align === "left"
										? "text-left"
										: section.align === "right"
											? "text-right"
											: "text-center"
								}
                ${section.subtitleColor}
              `}
								style={{ textShadow: "0 0 15px rgba(255,255,255,0.6)" }}
							>
								{section.subtitle}
							</p>

							{/* CARD VAI TRÒ */}
							{idx === 0 && section.align === "center" && (
								<div className='flex flex-wrap justify-center gap-3 sm:gap-6 md:gap-10 mb-8 px-4 sm:px-0'>
									{roles.map((role, i) => (
										<NavLink
											key={i}
											to={role.link}
											className={`
					group flex flex-col items-center gap-2 
					p-3 sm:p-4 md:p-5 
					rounded-xl md:rounded-2xl 
					bg-glass-bg backdrop-blur-md 
					border border-glass-border 
					hover:bg-glass-hover-bg hover:border-glass-hover-border 
					transition-all duration-500 cursor-pointer 
					shadow-lg md:shadow-2xl 
					animate-cardFloat 
					${role.shadow}
					/* Giảm scale trên mobile để tránh tràn */
					hover:scale-105 sm:hover:scale-110 md:hover:scale-115
				`}
											style={{
												animationDelay: `${i * 100}ms`,
												boxShadow: `0 0 15px var(--color-role-${role.label
													.toLowerCase()
													.replace(
														/[^a-z]/g,
														"",
													)}), 0 8px 20px rgba(0,0,0,0.15)`,
												maxWidth: "100px", // Giới hạn chiều rộng trên mobile
											}}
										>
											<div
												className={`
						p-2.5 sm:p-3 md:p-4 
						rounded-full ${role.bg} 
						shadow-md 
						group-hover:scale-110 transition-transform duration-300
					`}
											>
												<role.icon
													className='
						w-6 h-6 
						sm:w-8 sm:h-8 
						md:w-9 md:h-9 
						lg:w-11 lg:h-11 
						text-white drop-shadow-sm
					'
												/>
											</div>
											<span
												className='
					text-xs sm:text-sm md:text-base 
					font-bold tracking-wider 
					text-glass-text font-secondary 
					text-center leading-tight
				'
											>
												{role.label}
											</span>
										</NavLink>
									))}
								</div>
							)}

							{/* NÚT BẤM */}
							<div
								className={`
                flex flex-col sm:flex-row gap-6 animate-slideUp
                ${
									section.align === "left"
										? "justify-start"
										: section.align === "right"
											? "justify-end"
											: "justify-center"
								}
              `}
							>
								<NavLink
									to={section.link}
									className={`
                  flex items-center justify-center gap-3 px-9 py-5 ${section.btnBg} rounded-full
                  font-bold text-lg md:text-4xl text-white hover:scale-110 transition-all duration-300
                  shadow-2xl ${section.btnHover} backdrop-blur-md group
                `}
								>
									{section.spin ? (
										<section.icon className='w-6 h-6 md:w-10 md:h-10 animate-spin' />
									) : (
										<section.icon className='w-6 h-6 md:w-10 md:h-10' />
									)}
									{section.btnText}
									<ChevronRight className='w-6 h-6 group-hover:translate-x-2 transition-transform duration-300' />
								</NavLink>
							</div>
						</div>
					</section>
				))}
			</div>
		</div>
	);
};

export default Home;
