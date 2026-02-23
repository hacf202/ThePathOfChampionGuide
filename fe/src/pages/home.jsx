// src/pages/Home.jsx
import React, { useEffect } from "react";
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

const BACKGROUND_IMAGES = [
	"https://dd.b.pvp.net/7_2_0/set3/vi_vn/img/cards/03MT055T1-full.png",
	"https://dd.b.pvp.net/6_3_0/set2/vi_vn/img/cards/02NX007T2-full.png",
	"https://dd.b.pvp.net/6_3_0/set3/vi_vn/img/cards/03MT087T1-full.png",
	"https://wiki.leagueoflegends.com/en-us/images/06SI012T1-full.png?0bfd7",
	"https://dd.b.pvp.net/6_8_0/tpoc/vi_vn/img/cards/98SB031T2-full.png",
	"https://wiki.leagueoflegends.com/en-us/images/06SH009-full.png?ff10a",
	"https://dd.b.pvp.net/6_3_0/tpoc/vi_vn/img/cards/98RU004T1-full.png",
];

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
	useEffect(() => {
		preloadBackgrounds();
	}, []);

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
			label: "MILL",
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
			label: "FTK/OTK",
			shadow: "shadow-role-ftk-otk/50",
			link: "/champions",
		},
	];

	const sections = [
		{
			title: "SORAKA - TINH NỮ",
			subtitle: "Lữ Khách Thượng Giới",
			titleColor: "text-inferno-title",
			subtitleColor: "text-inferno-subtitle",
			btnBg: "bg-inferno-500",
			btnHover: "hover:bg-inferno-700 hover:shadow-inferno-500/60",
			link: "/champion/C082",
			btnText: "Xem chi tiết tướng",
			icon: Flame,
			align: "left",
		},
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
			subtitle: "Hướng Dẫn Vượt Ải Hiệu Quả",
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
			subtitle: "TỐI ƯU HÓA SỨC MẠNH",
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
			subtitle: "BÍ KÍP CON ĐƯỜNG ANH HÙNG",
			titleColor: "text-purple-200",
			subtitleColor: "text-purple-100",
			btnBg: "bg-purple-800",
			btnHover: "hover:bg-purple-700 hover:shadow-purple-800/50",
			link: "/guides",
			btnText: "Xem Hướng Dẫn",
			icon: ScrollText,
			align: "left",
		},
		{
			title: "VÒNG QUAY MAY MẮN",
			subtitle: "NGẪU NHIÊN HOÀN HẢO",
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
			subtitle: "Bảng Xếp Hạng Tướng",
			titleColor: "text-accent1-title",
			subtitleColor: "text-accent1-subtitle",
			btnBg: "bg-red-600",
			btnHover: "hover:bg-red-700 hover:shadow-red-600/50",
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
				description='POC GUIDE - Wiki Hướng Dẫn Con Đường Anh Hùng (Path of Champions)'
				type='website'
			/>

			<div className='text-white overflow-x-hidden font-primary'>
				<div className='fixed inset-0 -z-20 pointer-events-none bg-page-overlay' />

				{sections.map((section, idx) => (
					<section
						key={idx}
						className='relative min-h-screen flex overflow-hidden'
					>
						{/* Background layer */}
						<div
							className='absolute inset-0 w-full h-full -z-10 bg-cover bg-center'
							style={{
								backgroundImage: `url(${BACKGROUND_IMAGES[idx % BACKGROUND_IMAGES.length]})`,
								filter: "brightness(0.8) contrast(1.1)",
							}}
						/>
						<div className='absolute inset-0 bg-black/20 -z-10' />

						{/* Content Container */}
						<div
							className={`
								absolute bottom-0 w-full pb-10 md:pb-16 z-10 px-6
								${section.align === "left" ? "text-left md:pl-12 lg:pl-20" : ""}
								${section.align === "right" ? "text-right md:pr-12 lg:pr-20" : ""}
								${section.align === "center" ? "left-1/2 -translate-x-1/2 text-center max-w-6xl" : ""}
							`}
						>
							{/* Badge - Chỉ hiện ở section đầu */}
							{idx === 0 && section.align === "center" && (
								<div className='flex justify-center mb-6 md:mb-8'>
									<div className='inline-flex items-center gap-2 md:gap-3 px-5 py-2 md:px-7 md:py-3 bg-accent1-badge-bg rounded-full shadow-xl animate-badgeBounce'>
										<Crown className='w-5 h-5 md:w-7 md:h-7 text-white' />
										<span className='font-bold uppercase tracking-wider text-white text-sm md:text-lg'>
											Con Đường Anh Hùng
										</span>
									</div>
								</div>
							)}

							{/* Title */}
							<h2
								className={`
									font-bold mb-2 md:mb-4 tracking-wider drop-shadow-2xl animate-fadeIn
									text-3xl md:text-7xl lg:text-8xl
									${section.titleColor}
								`}
								style={{ textShadow: "0 0 20px rgba(255,255,255,0.3)" }}
							>
								{section.title}
							</h2>

							{/* Subtitle */}
							<p
								className={`
									font-bold uppercase tracking-widest mb-6 md:mb-8 drop-shadow-xl animate-slideUp
									text-sm md:text-3xl lg:text-4xl
									${section.subtitleColor}
								`}
							>
								{section.subtitle}
							</p>

							{/* Role Cards - Chỉ hiện ở section đầu */}
							{idx === 0 && section.align === "center" && (
								<div className='flex flex-wrap justify-center gap-2 md:gap-6 lg:gap-10 mb-8 max-w-full'>
									{roles.map((role, i) => (
										<NavLink
											key={i}
											to={role.link}
											className={`
												group flex flex-col items-center gap-1 md:gap-2 
												p-2 md:p-5 rounded-lg md:rounded-2xl 
												bg-glass-bg backdrop-blur-md border border-glass-border 
												hover:bg-glass-hover-bg transition-all duration-500 
												shadow-lg ${role.shadow} animate-cardFloat
												w-[70px] md:w-auto
											`}
											style={{ animationDelay: `${i * 100}ms` }}
										>
											<div
												className={`p-1.5 md:p-4 rounded-full ${role.bg} shadow-md group-hover:scale-110 transition-transform`}
											>
												<role.icon className='w-6 h-6 md:w-9 lg:w-11 text-white' />
											</div>
											<span className='text-[10px] md:text-sm lg:text-base font-bold text-glass-text text-center'>
												{role.label}
											</span>
										</NavLink>
									))}
								</div>
							)}

							{/* Nút điều hướng (CTA Button) - Đã làm nhỏ lại cho Mobile */}
							<div
								className={`
									flex flex-col sm:flex-row gap-4 animate-slideUp
									${section.align === "left" ? "justify-start" : ""}
									${section.align === "right" ? "justify-end" : ""}
									${section.align === "center" ? "justify-center" : ""}
								`}
							>
								<NavLink
									to={section.link}
									className={`
										inline-flex items-center justify-center gap-2 md:gap-3 
										px-6 py-3 md:px-9 md:py-5 
										${section.btnBg} rounded-full
										font-bold text-base md:text-4xl text-white 
										hover:scale-105 md:hover:scale-110 transition-all duration-300
										shadow-xl ${section.btnHover} backdrop-blur-md group
									`}
								>
									{section.spin ? (
										<section.icon className='w-5 h-5 md:w-10 animate-spin' />
									) : (
										<section.icon className='w-5 h-5 md:w-10' />
									)}
									<span className='whitespace-nowrap'>{section.btnText}</span>
									<ChevronRight className='w-5 h-5 md:w-8 group-hover:translate-x-2 transition-transform' />
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
