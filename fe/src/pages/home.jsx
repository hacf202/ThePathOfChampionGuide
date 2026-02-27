// src/pages/Home.jsx
import React, { useState, useEffect } from "react";
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

// Hiệu ứng tải trang Skeleton với tông màu tối đồng bộ
const HomeSkeleton = () => (
	<div className='fixed inset-0 z-50 bg-surface-bg flex flex-col items-center justify-center p-6 space-y-8'>
		<div className='w-3/4 h-16 md:h-24 bg-gray-700/50 rounded-lg animate-pulse'></div>
		<div className='w-1/2 h-6 md:h-10 bg-gray-700/50 rounded animate-pulse'></div>
		<div className='flex gap-4 mt-4'>
			{[1, 2, 3, 4].map(i => (
				<div
					key={i}
					className='w-16 h-20 md:w-24 md:h-32 bg-gray-700/50 rounded-xl animate-pulse'
				></div>
			))}
		</div>
		<div className='w-48 md:w-80 h-12 md:h-20 bg-gray-700/50 rounded-full mt-8 animate-pulse'></div>
	</div>
);

const Home = () => {
	const [isLoading, setIsLoading] = useState(true);

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
			setTimeout(() => setIsLoading(false), 800);
		};
		preloadImages();
	}, []);

	const roles = [
		{
			icon: Swords,
			bg: "bg-[var(--color-role-aggro)]",
			label: "AGGRO",
			shadow: "shadow-[var(--color-role-aggro)]/50",
			link: "/champions",
		},
		{
			icon: Zap,
			bg: "bg-[var(--color-role-combo)]",
			label: "COMBO",
			shadow: "shadow-[var(--color-role-combo)]/60",
			link: "/champions",
		},
		{
			icon: Shield,
			bg: "bg-[var(--color-role-control)]",
			label: "CONTROL",
			shadow: "shadow-[var(--color-role-control)]/50",
			link: "/champions",
		},
		{
			icon: Skull,
			bg: "bg-[var(--color-role-mill)]",
			label: "MILL",
			shadow: "shadow-[var(--color-role-mill)]/50",
			link: "/champions",
		},
		{
			icon: Target,
			bg: "bg-[var(--color-role-midrange)]",
			label: "MIDRANGE",
			shadow: "shadow-[var(--color-role-midrange)]/50",
			link: "/champions",
		},
		{
			icon: Flame,
			bg: "bg-[var(--color-role-burn)]",
			label: "BURN",
			shadow: "shadow-[var(--color-role-burn)]/50",
			link: "/champions",
		},
		{
			icon: HandFist,
			bg: "bg-[var(--color-role-ftk-otk)]",
			label: "FTK/OTK",
			shadow: "shadow-[var(--color-role-ftk-otk)]/50",
			link: "/champions",
		},
	];

	const sections = [
		{
			title: "SORAKA - TINH NỮ",
			subtitle: "Lữ Khách Thượng Giới",
			titleColor: "text-[var(--color-inferno-title)]",
			subtitleColor: "text-[var(--color-inferno-subtitle)]",
			btnBg: "bg-[var(--color-inferno-500)]",
			btnHover:
				"hover:bg-[var(--color-inferno-700)] shadow-[var(--color-inferno-500)]/40",
			link: "/champion/C082",
			btnText: "Xem chi tiết tướng",
			icon: Flame,
			align: "left",
		},
		{
			title: "DANH SÁCH TƯỚNG",
			subtitle: "KHÁM PHÁ SỨC MẠNH – TRỞ THÀNH CAO THỦ",
			titleColor: "text-[var(--color-accent1-title)]",
			subtitleColor: "text-[var(--color-accent1-subtitle)]",
			btnBg: "bg-[var(--color-accent1-cta-bg)]",
			btnHover:
				"hover:bg-[var(--color-accent1-cta-hover)] shadow-[var(--color-accent1-cta-bg)]/50",
			link: "/champions",
			btnText: "Xem Danh Sách Tướng",
			icon: Swords,
			align: "center",
		},
		{
			title: "THỬ THÁCH THÁNG",
			subtitle: "Hướng Dẫn Vượt Ải Hiệu Quả",
			titleColor: "text-[var(--color-accent2-title)]",
			subtitleColor: "text-[var(--color-accent2-subtitle)]",
			btnBg: "bg-[var(--color-accent2-cta-bg)]",
			btnHover:
				"hover:bg-[var(--color-accent2-cta-hover)] shadow-[var(--color-accent2-cta-bg)]/50",
			link: "/guides/thu-thach-thang",
			btnText: "Xem Hướng Dẫn",
			icon: ScrollText,
			align: "center",
		},
		{
			title: "DANH SÁCH CỔ VẬT",
			subtitle: "TỐI ƯU HÓA SỨC MẠNH",
			titleColor: "text-[var(--color-emerald-title)]",
			subtitleColor: "text-[var(--color-emerald-subtitle)]",
			btnBg: "bg-[var(--color-emerald-500)]",
			btnHover:
				"hover:bg-[var(--color-emerald-700)] shadow-[var(--color-emerald-500)]/40",
			link: "/builds",
			btnText: "Xem Bộ Cổ Vật",
			icon: ScrollText,
			align: "left",
		},
		{
			title: "HƯỚNG DẪN POC",
			subtitle: "BÍ KÍP CON ĐƯỜNG ANH HÙNG",
			titleColor: "text-[var(--color-celestial-title)]",
			subtitleColor: "text-[var(--color-celestial-subtitle)]",
			btnBg: "bg-[var(--color-celestial-500)]",
			btnHover:
				"hover:bg-[var(--color-celestial-700)] shadow-[var(--color-celestial-500)]/40",
			link: "/guides",
			btnText: "Xem Hướng Dẫn",
			icon: ScrollText,
			align: "left",
		},
		{
			title: "VÒNG QUAY MAY MẮN",
			subtitle: "NGẪU NHIÊN HOÀN HẢO",
			titleColor: "text-[var(--color-accent3-title)]",
			subtitleColor: "text-[var(--color-accent3-subtitle)]",
			btnBg: "bg-[var(--color-accent3-cta-bg)]",
			btnHover:
				"hover:bg-[var(--color-accent3-cta-hover)] shadow-[var(--color-accent3-cta-bg)]/50",
			link: "/randomizer",
			btnText: "Quay Ngay",
			icon: Dices,
			spin: true,
			align: "right",
		},
		{
			title: "TIER LIST POC",
			subtitle: "Bảng Xếp Hạng Tướng",
			titleColor: "text-[var(--color-blood-title)]",
			subtitleColor: "text-[var(--color-blood-subtitle)]",
			btnBg: "bg-[var(--color-blood-500)]",
			btnHover:
				"hover:bg-[var(--color-blood-700)] shadow-[var(--color-blood-500)]/40",
			link: "/tierlist",
			btnText: "Xem Bảng Xếp Hạng",
			icon: Swords,
			align: "right",
		},
	];

	if (isLoading) return <HomeSkeleton />;

	return (
		<div className='animate-reveal'>
			<PageTitle
				title='Con Đường Anh Hùng'
				description='POC GUIDE - Wiki Hướng Dẫn Con Đường Anh Hùng (Path of Champions)'
				type='website'
			/>

			<div className='text-white overflow-x-hidden font-primary'>
				<div className='fixed inset-0 -z-20 pointer-events-none bg-[var(--color-bg-overlay)]' />

				{sections.map((section, idx) => (
					<section
						key={idx}
						className='relative min-h-screen flex overflow-hidden'
					>
						{/* Background layer */}
						<div
							className='absolute inset-0 w-full h-full -z-10 bg-cover bg-center transition-opacity duration-1000'
							style={{
								backgroundImage: `url(${BACKGROUND_IMAGES[idx % BACKGROUND_IMAGES.length]})`,
								filter: "brightness(1) contrast(1.1)",
							}}
						/>
						<div className='absolute inset-0 bg-black/40 -z-10' />

						{/* Content Container */}
						<div
							className={`
								absolute bottom-0 w-full pb-10 md:pb-16 z-10 px-6
								${section.align === "left" ? "text-left md:pl-12 lg:pl-20" : ""}
								${section.align === "right" ? "text-right md:pr-12 lg:pr-20" : ""}
								${section.align === "center" ? "left-1/2 -translate-x-1/2 text-center max-w-6xl" : ""}
							`}
						>
							{/* Badge - Section 0 */}
							{idx === 0 && section.align === "left" && (
								<div className='flex justify-start mb-6 md:mb-8'>
									<div className='inline-flex items-center gap-2 md:gap-3 px-5 py-2 md:px-7 md:py-3 bg-[var(--color-accent1-badge-bg)] rounded-full shadow-xl animate-badgeBounce'>
										<Crown className='w-5 h-5 md:w-7 md:h-7 text-white' />
										<span className='font-bold uppercase tracking-wider text-white text-sm md:text-lg'>
											Con Đường Anh Hùng
										</span>
									</div>
								</div>
							)}

							{/* Title & Subtitle */}
							<h2
								className={`font-bold mb-2 md:mb-4 tracking-wider drop-shadow-2xl animate-fadeIn text-3xl md:text-7xl lg:text-8xl ${section.titleColor}`}
							>
								{section.title}
							</h2>
							<p
								className={`font-bold uppercase tracking-widest mb-6 md:mb-8 drop-shadow-xl animate-slideUp text-sm md:text-3xl lg:text-4xl ${section.subtitleColor}`}
							>
								{section.subtitle}
							</p>

							{/* Role Cards - Di chuyển sang Section 1 (Index 1) */}
							{idx === 1 && (
								<div
									className={`
        flex flex-wrap gap-2 md:gap-6 lg:gap-10 mb-8 max-w-full
        ${section.align === "center" ? "justify-center" : "justify-start"}
    `}
								>
									{roles.map((role, i) => (
										<NavLink
											key={i}
											to={role.link}
											className={`
                    group flex flex-col items-center gap-1 md:gap-2 
                    p-2 md:p-5 rounded-lg md:rounded-2xl 
                    bg-[var(--color-glass-bg)] border border-[var(--color-glass-border)] 
                    hover:bg-[var(--color-glass-hover-bg)] transition-all duration-500 
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
											<span className='text-[10px] md:text-sm lg:text-base font-bold text-white text-center uppercase'>
												{role.label}
											</span>
										</NavLink>
									))}
								</div>
							)}

							{/* Nút điều hướng (CTA Button) */}
							<div
								className={`flex flex-col sm:flex-row gap-4 animate-slideUp ${section.align === "left" ? "justify-start" : section.align === "right" ? "justify-end" : "justify-center"}`}
							>
								<NavLink
									to={section.link}
									className={`
										inline-flex items-center justify-center gap-2 md:gap-3 
										px-6 py-3 md:px-9 md:py-5 
										${section.btnBg} rounded-full
										font-bold text-base md:text-4xl text-white 
										hover:scale-105 md:hover:scale-110 transition-all duration-300
										shadow-xl ${section.btnHover}  group
									`}
								>
									<section.icon
										className={`w-5 h-5 md:w-10 md:h-10 ${section.spin ? "animate-spin" : ""}`}
									/>
									<span className='whitespace-nowrap uppercase'>
										{section.btnText}
									</span>
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
