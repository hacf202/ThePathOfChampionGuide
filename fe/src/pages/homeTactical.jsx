import React, { useState, useEffect, useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import PageTitle from "@/components/common/pageTitle";
import { useTranslation } from "@/hooks/useTranslation";
import { api } from "@/context/services/apiHelper";
import { generateSlug } from "@/utils/slugify";
import SafeImage from "@/components/common/SafeImage";
import {
	Swords,
	Dices,
	ChevronRight,
	ChevronLeft,
	ChevronsLeft,
	ChevronsRight,
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
	Users,
	Clock,
	HelpCircle,
	Radio,
	ArrowUpRight,
	Crosshair,
	Loader2,
} from "lucide-react";

const BACKGROUND_IMAGES = {
	hero: "https://images.pocguide.top/backgrounds/1920px-01DE012_Rugged-full.webp",
	champions: "https://images.pocguide.top/backgrounds/BG5.webp",
	relics: "https://images.pocguide.top/backgrounds/BG8.webp",
	powers: "https://images.pocguide.top/backgrounds/BG7.webp",
	items: "https://images.pocguide.top/backgrounds/BG4.webp",
	runes: "https://images.pocguide.top/backgrounds/BG6.webp",
	maps: "https://images.pocguide.top/backgrounds/BG2.webp",
	bosses: "https://images.pocguide.top/backgrounds/BG8.webp",
	ratings: "https://images.pocguide.top/backgrounds/BG9.webp",
	cards: "https://images.pocguide.top/backgrounds/BG10.webp",
	guides: "https://images.pocguide.top/backgrounds/BG3.webp",
	event: "https://images.pocguide.top/backgrounds/1920px-01DE012T1_Rugged-full.webp",
};

// --- Cấu hình Tướng Mới Nổi Bật trên Hero ---
const FEATURED_CHAMPION = {
	championID: "01DE012",
	cardCode: "01DE012",
	name: "Garen",
	title: "Sức Mạnh Demacia",
	cost: 5,
	maxStar: 6,
	link: "/champion/garen",
	splashImg: "https://images.pocguide.top/backgrounds/1920px-01DE012_Rugged-full.webp",
	cardImg: "https://dd.b.pvp.net/latest/set1/vi_vn/img/cards/01DE012.png",
	tags: ["NEW 6★", "DEMACIA", "ELITE", "STRIKE", "RALLY"],
	palette: {
		accent: "#d2ff28",
		secondary: "#00f0ff",
	},
};

// --- Bảng tên khu vực chuẩn hóa theo ngôn ngữ ---
const REGION_NAMES = {
	vi: {
		demacia: "Demacia",
		ionia: "Ionia",
		noxus: "Noxus",
		piltoverzaun: "Piltover & Zaun",
		shadowisles: "Quần Đảo Bóng Đêm",
		freljord: "Freljord",
		shurima: "Shurima",
		bilgewater: "Bilgewater",
		targon: "Targon",
		bandlecity: "Thành Phố Bandle",
		runeterra: "Runeterra",
		spiritblossom: "Hoa Linh Lục Địa",
	},
	en: {
		demacia: "Demacia",
		ionia: "Ionia",
		noxus: "Noxus",
		piltoverzaun: "Piltover & Zaun",
		shadowisles: "Shadow Isles",
		freljord: "Freljord",
		shurima: "Shurima",
		bilgewater: "Bilgewater",
		targon: "Targon",
		bandlecity: "Bandle City",
		runeterra: "Runeterra",
		spiritblossom: "Spirit Blossom",
	},
};

const REGION_PALETTES = {
	piltoverzaun: { accent: "#D2FF28", secondary: "#00F5D4", gradient: "from-[#4c1d95] via-[#6d28d9] to-[#2e1065]" },
	noxus: { accent: "#FF4655", secondary: "#FFAA00", gradient: "from-[#881337] via-[#b91c1c] to-[#450a0a]" },
	ionia: { accent: "#FF75D8", secondary: "#00F5D4", gradient: "from-[#0369a1] via-[#0284c7] to-[#0c4a6e]" },
	demacia: { accent: "#FFD700", secondary: "#4DA8DA", gradient: "from-[#1e3a8a] via-[#2563eb] to-[#172554]" },
	shadowisles: { accent: "#00F5D4", secondary: "#10B981", gradient: "from-[#064e3b] via-[#059669] to-[#022c22]" },
	freljord: { accent: "#38BDF8", secondary: "#818CF8", gradient: "from-[#164e63] via-[#0891b2] to-[#083344]" },
	bilgewater: { accent: "#F59E0B", secondary: "#EF4444", gradient: "from-[#78350f] via-[#b45309] to-[#451a03]" },
	shurima: { accent: "#FBBF24", secondary: "#F97316", gradient: "from-[#854d0e] via-[#ca8a04] to-[#422006]" },
	targon: { accent: "#A855F7", secondary: "#38BDF8", gradient: "from-[#581c87] via-[#7c3aed] to-[#3b0764]" },
	bandlecity: { accent: "#A3E635", secondary: "#F472B6", gradient: "from-[#365314] via-[#4d7c0f] to-[#1a2e05]" },
	runeterra: { accent: "#FCD34D", secondary: "#60A5FA", gradient: "from-[#1f2937] via-[#374151] to-[#111827]" },
	spiritblossom: { accent: "#F472B6", secondary: "#A855F7", gradient: "from-[#831843] via-[#db2777] to-[#500724]" },
};

// Chuẩn hóa dữ liệu tướng từ API thành định dạng hiển thị cho Tactical Showcase
const formatChampionForShowcase = (c, tDynamic, language = "vi") => {
	const isEn = language === "en";
	const champName = tDynamic(c, "name") || c.name || "Unknown";
	const champTitle =
		tDynamic(c, "title") ||
		c.title ||
		tDynamic(c, "playStyle") ||
		c.playStyle ||
		(isEn ? "Runeterra Champion" : "Vị Tướng Runeterra");
	const rawDesc =
		tDynamic(c, "descriptionRaw") ||
		c.descriptionRaw ||
		tDynamic(c, "description") ||
		c.description ||
		"";
	const cleanDesc = rawDesc.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();

	const primaryRegion = (c.regions?.[0] || "runeterra").toLowerCase().replace(/[^a-z]/g, "");
	const paletteInfo = REGION_PALETTES[primaryRegion] || REGION_PALETTES.runeterra;

	let tier = "S";
	if (c.tier) {
		const match = c.tier.match(/([SABCD][+]?)/i);
		tier = match ? match[1].toUpperCase() : c.tier.split(" ")[0];
	} else if (c.ratings) {
		const avg =
			(Number(c.ratings.damage || 5) +
				Number(c.ratings.defense || 5) +
				Number(c.ratings.synergy || 5)) /
			3;
		if (avg >= 8.5) tier = "S+";
		else if (avg >= 7) tier = "S";
		else if (avg >= 5.5) tier = "A";
		else tier = "B";
	} else if (Number(c.maxStar) >= 6) {
		tier = "S+";
	}

	const avatar =
		c.assets?.[0]?.avatar ||
		c.assets?.[0]?.fullAbsolutePath ||
		"/fallback-champion.png";
	const portrait =
		c.assets?.[0]?.fullAbsolutePath ||
		c.assets?.[0]?.avatar ||
		"/fallback-champion.png";
	const cardImg = c.assets?.[0]?.gameAbsolutePath || "";

	const slug = generateSlug(c.name) || c.championID;
	const regionDisplay = (
		REGION_NAMES[isEn ? "en" : "vi"]?.[primaryRegion] ||
		c.regions?.[0] ||
		"Runeterra"
	).toUpperCase();

	return {
		id: String(c.championID || c.id || slug),
		championID: c.championID,
		cardCode: c.cardCode || c.championID,
		name: champName,
		title: champTitle,
		primaryRegion,
		region: regionDisplay,
		tier,
		cost: Number(c.cost) || 0,
		maxStar: Number(c.maxStar) || 3,
		link: `/champion/${slug}`,
		desc:
			cleanDesc ||
			(isEn
				? "Explore 6★ Constellation powers, Best-in-Slot relics, and complete champion builds."
				: "Khám phá sức mạnh Chòm sao 6★, bộ Cổ vật tối ưu và cẩm nang xây dựng Tướng."),
		avatar,
		portrait,
		cardImg,
		bgGradient: paletteInfo.gradient,
		accentColor: paletteInfo.accent,
		tags: (isEn && c.translations?.en?.tags?.length ? c.translations.en.tags : c.tags) || [],
		palette: {
			accent: paletteInfo.accent,
			secondary: paletteInfo.secondary,
		},
	};
};

// --- Tactical Card Component (Dùng cho các Tab khác) ---
const CommandCard = ({ to, icon: CardIcon, title, desc, img, badge, highlight = false }) => {
	return (
		<NavLink
			to={to}
			className={`group relative flex flex-col justify-between min-h-[220px] sm:min-h-[250px] p-5 sm:p-6 clip-chamfer border transition-all duration-300 overflow-hidden ${
				highlight
					? "border-[var(--tactical-accent-lime)]/70 bg-[#12151e] shadow-[0_0_25px_rgba(210,255,40,0.18)]"
					: "border-[var(--tactical-card-border)] tactical-card hover:border-[var(--tactical-accent-lime)] hover:shadow-[0_0_30px_rgba(210,255,40,0.22)] shadow-md"
			}`}
		>
			<img
				src={img}
				alt={title}
				loading="lazy"
				className="absolute inset-0 w-full h-full object-cover opacity-35 group-hover:opacity-75 group-hover:scale-105 transition-all duration-700 pointer-events-none"
			/>

			<div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/30 pointer-events-none" />
			<div className="absolute inset-0 bg-halftone opacity-25 pointer-events-none" />

			<div className="absolute top-0 right-0 w-8 h-8 pointer-events-none border-t-2 border-r-2 border-transparent group-hover:border-[var(--tactical-accent-lime)] transition-colors duration-300 z-10" />
			<div className="absolute bottom-0 left-0 w-8 h-8 pointer-events-none border-b-2 border-l-2 border-transparent group-hover:border-[var(--tactical-accent-cyan)] transition-colors duration-300 z-10" />

			<div className="relative z-10 flex items-center justify-between">
				<div
					className={`p-2.5 bg-black/85 border clip-chamfer-sm transition-colors ${
						highlight
							? "border-[var(--tactical-accent-lime)] text-[var(--tactical-accent-lime)]"
							: "border-white/15 text-white group-hover:border-[var(--tactical-accent-lime)] group-hover:text-[var(--tactical-accent-lime)]"
					}`}
				>
					{CardIcon && <CardIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
				</div>

				<div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/85 border border-white/15 clip-chamfer-sm text-[10px] font-mono-tech uppercase tactical-text-dim group-hover:text-[var(--tactical-accent-cyan)] group-hover:border-[var(--tactical-accent-cyan)]/50 transition-colors">
					<span>{badge}</span>
					<ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
				</div>
			</div>

			<div className="relative z-10 mt-6">
				<h3 className="font-display text-2xl sm:text-3xl uppercase italic tracking-wide text-white group-hover:text-[var(--tactical-accent-lime)] transition-colors drop-shadow-md">
					{title}
				</h3>

				<p className="text-gray-300 font-primary text-xs sm:text-sm leading-relaxed mt-1.5 line-clamp-2 group-hover:text-white transition-colors">
					{desc}
				</p>
			</div>
		</NavLink>
	);
};

// --- Skeleton Loader cho Tactical Champion Showcase ---
const ChampionShowcaseSkeleton = () => (
	<div className="relative overflow-hidden border-2 border-[#1E2330] bg-[#0D1017] p-6 sm:p-10 lg:p-12 clip-chamfer shadow-2xl animate-pulse">
		<div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
			<div className="lg:col-span-7 flex flex-col items-center lg:items-start space-y-4">
				<div className="h-12 w-64 bg-white/10 clip-chamfer-sm" />
				<div className="h-4 w-96 max-w-full bg-white/5 rounded" />
				<div className="flex gap-4 pt-2">
					<div className="h-12 w-48 bg-white/10 -skew-x-12" />
					<div className="h-12 w-48 bg-white/5 -skew-x-12" />
				</div>
				<div className="w-full pt-6">
					<div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4">
						{[...Array(6)].map((_, i) => (
							<div key={i} className="flex flex-col items-center gap-2">
								<div className="w-full aspect-square bg-white/5 border border-white/10 clip-chamfer-sm" />
								<div className="h-3 w-12 bg-white/5 rounded" />
							</div>
						))}
					</div>
					<div className="mt-6 h-2 w-full bg-white/10 rounded" />
				</div>
			</div>
			<div className="lg:col-span-5">
				<div className="h-[380px] sm:h-[430px] bg-white/5 clip-chamfer" />
			</div>
		</div>
	</div>
);

// --- Component Tactical Champion Showcase (Dành riêng cho Tab TƯỚNG & XẾP HẠNG) ---
const ChampionTacticalShowcase = ({
	champions = [],
	loading = false,
	isEn = false,
}) => {
	const [selectedRegion, setSelectedRegion] = useState("ALL");
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [pageStart, setPageStart] = useState(0);
	const visibleCount = 6; // Hiển thị đúng 6 ô ngang theo layout chiến thuật

	const regionOptions = useMemo(
		() => [
			{ id: "ALL", label: isEn ? "ALL" : "TẤT CẢ" },
			{ id: "demacia", label: "DEMACIA" },
			{ id: "ionia", label: "IONIA" },
			{ id: "noxus", label: "NOXUS" },
			{ id: "piltoverzaun", label: "PILTOVER & ZAUN" },
			{
				id: "shadowisles",
				label: isEn ? "SHADOW ISLES" : "QUẦN ĐẢO BÓNG ĐÊM",
			},
			{ id: "freljord", label: "FRELJORD" },
			{ id: "shurima", label: "SHURIMA" },
			{ id: "bilgewater", label: "BILGEWATER" },
			{ id: "targon", label: "TARGON" },
			{
				id: "bandlecity",
				label: isEn ? "BANDLE CITY" : "THÀNH PHỐ BANDLE",
			},
			{ id: "runeterra", label: "RUNETERRA" },
		],
		[isEn]
	);

	// Lọc danh sách tướng theo khu vực
	const filteredChamps = useMemo(() => {
		if (!champions || champions.length === 0) return [];
		if (selectedRegion === "ALL") return champions;
		return champions.filter(
			(c) =>
				c.primaryRegion === selectedRegion ||
				(c.region && c.region.toLowerCase() === selectedRegion)
		);
	}, [champions, selectedRegion]);

	const list = filteredChamps.length > 0 ? filteredChamps : champions;

	const handleRegionChange = (regionId) => {
		setSelectedRegion(regionId);
		setSelectedIndex(0);
		setPageStart(0);
	};

	const activeChamp = list[selectedIndex] || list[0];
	const visibleChamps = list.slice(pageStart, pageStart + visibleCount);

	const handleSelectChamp = (globalIdx) => {
		setSelectedIndex(globalIdx);
	};

	const handlePrev = () => {
		if (list.length === 0) return;
		const nextIdx = selectedIndex > 0 ? selectedIndex - 1 : list.length - 1;
		setSelectedIndex(nextIdx);
		if (nextIdx < pageStart) {
			setPageStart(Math.max(0, nextIdx));
		} else if (nextIdx >= pageStart + visibleCount) {
			setPageStart(Math.max(0, list.length - visibleCount));
		}
	};

	const handleNext = () => {
		if (list.length === 0) return;
		const nextIdx = selectedIndex < list.length - 1 ? selectedIndex + 1 : 0;
		setSelectedIndex(nextIdx);
		if (nextIdx >= pageStart + visibleCount) {
			setPageStart(Math.min(list.length - visibleCount, nextIdx - visibleCount + 1));
		} else if (nextIdx < pageStart) {
			setPageStart(0);
		}
	};

	const handlePrevPage = () => {
		if (list.length === 0) return;
		const newStart = Math.max(0, pageStart - visibleCount);
		setPageStart(newStart);
		setSelectedIndex(newStart);
	};

	const handleNextPage = () => {
		if (list.length === 0) return;
		const maxStart = Math.max(0, list.length - visibleCount);
		const newStart = Math.min(maxStart, pageStart + visibleCount);
		setPageStart(newStart);
		setSelectedIndex(newStart);
	};

	// Tiến trình thanh ngang bên dưới
	const progressPercent =
		list.length > 0 ? ((selectedIndex + 1) / list.length) * 100 : 0;

	if (loading) {
		return <ChampionShowcaseSkeleton />;
	}

	if (!activeChamp) {
		return (
			<div className="p-8 text-center border border-white/10 bg-[#0D1017] clip-chamfer">
				<p className="text-gray-400 font-mono-tech text-sm">
					{isEn
						? "// NO CHAMPION DATA IN THIS REGION //"
						: "// KHÔNG CÓ DỮ LIỆU TƯỚNG TRONG KHU VỰC NÀY //"}
				</p>
			</div>
		);
	}

	return (
		<div className="relative overflow-hidden border-2 border-[var(--tactical-section-border)] tactical-panel p-6 sm:p-10 lg:p-12 clip-chamfer shadow-2xl animate-fadeIn">
			{/* Hoạ tiết Halftone và Typography chìm làm nền */}
			<div className="absolute inset-0 bg-halftone opacity-20 pointer-events-none" />
			<div className="absolute -right-10 -top-10 text-[140px] sm:text-[200px] font-display font-black uppercase italic text-white/[0.03] select-none pointer-events-none leading-none truncate max-w-full">
				{activeChamp.name}
			</div>

			<div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
				{/* ============================================================
				    CỘT TRÁI (7 CỘT): TIÊU ĐỀ, 2 NÚT NGHIÊNG & BỘ LỌC + 6 AVATAR TƯỚNG
				   ============================================================ */}
				<div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
					{/* Heading lớn phong cách Tactical */}
					<h3 className="text-4xl sm:text-6xl font-display font-black uppercase tracking-wider text-[var(--tactical-text-main)] leading-[0.95] drop-shadow-sm">
						{isEn ? (
							<>
								CHOOSE YOUR
								<br />
								<span className="tactical-accent-lime">CHAMPION</span>
							</>
						) : (
							<>
								CHỌN TƯỚNG
								<br />
								<span className="tactical-accent-lime">CỦA BẠN</span>
							</>
						)}
					</h3>

					<p className="mt-3 text-[var(--tactical-text-sub)] font-primary text-sm sm:text-base max-w-lg leading-relaxed">
						{isEn
							? `Explore 6★ Constellation powers, optimal Relic setups, and upgrade paths for ${list.length} Champions.`
							: `Khám phá sức mạnh Chòm sao 6★, bộ Cổ vật tối ưu và lộ trình nâng cấp của ${list.length} vị Tướng.`}
					</p>

					{/* Khung Portrait Tướng trên Mobile (chỉ hiển thị trên màn hình < lg, nằm TRÊN nút xem chi tiết) */}
					<div className="w-full mt-6 block lg:hidden">
						<div className="relative mx-auto max-w-sm sm:max-w-md">
							{/* Lớp đổ bóng cứng lệch góc dưới phải (Hard Offset Shadow) */}
							<div
								className="absolute inset-0 translate-x-2.5 translate-y-2.5 bg-black border-2 border-[var(--tactical-accent-lime)]/50 pointer-events-none"
								style={{
									clipPath:
										"polygon(36px 0, 100% 0, 100% calc(100% - 36px), calc(100% - 36px) 100%, 0 100%, 0 36px)",
								}}
							/>

							{/* Khung Portrait chính */}
							<div
								key={`mobile-${activeChamp.id}`}
								className={`relative h-[340px] sm:h-[400px] w-full border-[3px] border-black dark:border-white overflow-hidden bg-gradient-to-br ${activeChamp.bgGradient} group shadow-2xl`}
								style={{
									clipPath:
										"polygon(36px 0, 100% 0, 100% calc(100% - 36px), calc(100% - 36px) 100%, 0 100%, 0 36px)",
								}}
							>
								{/* Hoạ tiết Halftone nền */}
								<div className="absolute inset-0 bg-halftone opacity-35 mix-blend-overlay pointer-events-none" />

								{/* Ảnh Nghệ thuật của Tướng */}
								<SafeImage
									src={activeChamp.portrait}
									alt={activeChamp.name}
									className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 contrast-110"
								/>

								{/* Lớp phủ tối dần ở đáy */}
								<div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

								{/* Badge Tier & Sao ở góc trên bên phải */}
								<div className="absolute top-3.5 right-3.5 z-20 flex items-center gap-2">
									<span className="px-2 py-0.5 bg-black/85 border border-[var(--tactical-accent-lime)] font-mono-tech text-[11px] font-bold text-[var(--tactical-accent-lime)]">
										{isEn ? `TIER ${activeChamp.tier}` : `BẬC ${activeChamp.tier}`}
									</span>
									<span className="px-2 py-0.5 bg-black/85 border border-amber-400 font-mono-tech text-[11px] font-bold text-amber-400 flex items-center gap-1">
										<Star className="w-3 h-3 fill-current" />
										{activeChamp.maxStar}★
									</span>
								</div>

								{/* Thông tin tóm tắt của Tướng ở góc dưới khung */}
								<div className="absolute bottom-4 left-4 right-5 z-20 text-left">
									<div className="flex items-center gap-2 text-[10px] font-mono-tech uppercase tracking-widest text-[var(--tactical-accent-cyan)]">
										<span>// {activeChamp.region}</span>
										<span>•</span>
										<span className="flex items-center gap-1 text-blue-300">
											<Zap className="w-3 h-3 fill-current" />
											{activeChamp.cost} {isEn ? "MANA" : "NĂNG LƯỢNG"}
										</span>
									</div>

									<h4 className="text-2xl sm:text-3xl font-display font-black uppercase italic tracking-wide text-white mt-0.5 truncate">
										{activeChamp.name}{" "}
										<span className="text-xs sm:text-sm font-primary not-italic font-normal text-gray-300">
											— {activeChamp.title}
										</span>
									</h4>

									<p className="text-xs text-gray-200 font-primary line-clamp-2 mt-1 leading-relaxed">
										{activeChamp.desc}
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* 2 Nút bấm hình bình hành nghiêng */}
					<div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mt-7">
						<NavLink
							to={activeChamp.link}
							className="group relative px-7 py-3.5 bg-[var(--tactical-accent-lime)] border-2 border-[var(--tactical-accent-lime)] text-black font-black hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300 -skew-x-12 shadow-[4px_4px_0px_rgba(39,98,0,0.3)] dark:shadow-[4px_4px_0px_rgba(210,255,40,0.35)]"
						>
							<span className="block skew-x-12 font-display text-sm sm:text-base font-black uppercase tracking-wider">
								{isEn
									? `LEARN ABOUT ${activeChamp.name}`
									: `XEM CHI TIẾT ${activeChamp.name}`}
							</span>
						</NavLink>

						<NavLink
							to="/champions"
							className="group relative px-7 py-3.5 bg-[var(--tactical-card-bg)] border-2 border-[var(--tactical-section-border)] text-[var(--tactical-text-main)] hover:border-[var(--tactical-accent-cyan)] hover:bg-[var(--tactical-accent-cyan)] hover:text-black transition-all duration-300 -skew-x-12 shadow-[4px_4px_0px_rgba(0,0,0,0.08)] dark:shadow-[4px_4px_0px_rgba(255,255,255,0.15)]"
						>
							<span className="block skew-x-12 font-display text-sm sm:text-base font-bold uppercase tracking-wider">
								{isEn ? "VIEW ALL CHAMPIONS" : "XEM TẤT CẢ TƯỚNG"}
							</span>
						</NavLink>
					</div>

					{/* Dải Tab chọn Khu vực (Region Quick Selector) */}
					<div className="w-full mt-8">
						<div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
							{regionOptions.map((reg) => (
								<button
									key={reg.id}
									type="button"
									onClick={() => handleRegionChange(reg.id)}
									className={`px-2.5 py-1 text-[11px] font-mono-tech uppercase font-bold clip-chamfer-sm border whitespace-nowrap transition-all ${
										selectedRegion === reg.id
											? "bg-[var(--tactical-accent-lime)] text-black border-[var(--tactical-accent-lime)] shadow-[0_0_10px_rgba(210,255,40,0.3)]"
											: "bg-[var(--tactical-card-bg)] text-[var(--tactical-text-sub)] border-[var(--tactical-card-border)] hover:border-[var(--tactical-accent-lime)] hover:text-[var(--tactical-text-main)] shadow-sm"
									}`}
								>
									{reg.label}
								</button>
							))}
						</div>
					</div>

					{/* Dải 6 ô Avatar Tướng (Thumbnail Selector Row) */}
					<div className="w-full mt-4">
						<div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4">
							{visibleChamps.map((champ, idx) => {
								const globalIdx = pageStart + idx;
								const isSelected = globalIdx === selectedIndex;

								return (
									<button
										key={champ.id}
										type="button"
										onClick={() => handleSelectChamp(globalIdx)}
										className="group flex flex-col items-center focus:outline-none"
									>
										<div
											className={`relative w-full aspect-square overflow-hidden border-2 transition-all duration-300 ${
												isSelected
													? "border-[var(--tactical-accent-lime)] scale-105 shadow-[0_0_20px_rgba(210,255,40,0.4)] opacity-100"
													: "border-[var(--tactical-card-border)] opacity-70 grayscale-[35%] hover:opacity-100 hover:grayscale-0 hover:border-[var(--tactical-accent-lime)]"
											}`}
										>
											<SafeImage
												src={champ.avatar}
												alt={champ.name}
												className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
												loading="lazy"
											/>
											{isSelected && (
												<div className="absolute inset-x-0 bottom-0 h-1.5 bg-[var(--tactical-accent-lime)]" />
											)}
										</div>

										<span
											className={`mt-2.5 font-display text-xs sm:text-sm uppercase tracking-wider truncate max-w-full transition-colors ${
												isSelected
													? "tactical-accent-lime font-bold"
													: "text-[var(--tactical-text-sub)] group-hover:text-[var(--tactical-text-main)]"
											}`}
										>
											{champ.name}
										</span>
									</button>
								);
							})}
						</div>

						{/* Thanh đường kẻ ngang + Cụm nút điều hướng Chevron */}
						<div className="mt-6 flex items-center gap-4">
							{/* Đường kẻ hiển thị tiến độ và chỉ số */}
							<div className="relative flex-1">
								<div className="flex items-center justify-between text-[10px] font-mono-tech mb-1">
									<span className="text-[var(--tactical-accent-cyan)] font-bold [text-shadow:0_1px_2px_rgba(0,0,0,0.5)]">
										{isEn ? "CHAMPION" : "TƯỚNG"} {selectedIndex + 1} / {list.length}
									</span>
									<span className="uppercase text-[var(--tactical-text-dim)] font-semibold">
										{selectedRegion !== "ALL"
											? (regionOptions.find((r) => r.id === selectedRegion)?.label || selectedRegion)
											: (isEn ? "ROSTER" : "DANH SÁCH")}
									</span>
								</div>
								<div className="relative h-[2px] bg-black/10 dark:bg-white/15 overflow-hidden">
									<div
										className="absolute top-0 left-0 h-full bg-[var(--tactical-accent-lime)] transition-all duration-300"
										style={{ width: `${progressPercent}%` }}
									/>
								</div>
							</div>

							{/* Cụm nút << < > >> vát chéo */}
							<div className="flex items-center gap-1.5">
								{list.length > visibleCount && (
									<button
										type="button"
										onClick={handlePrevPage}
										title={isEn ? "Previous 6 champions" : "Trang trước (6 tướng)"}
										className="flex items-center justify-center px-2 py-1.5 bg-[var(--tactical-card-bg)] border border-[var(--tactical-card-border)] hover:bg-[var(--tactical-card-hover-bg)] text-[var(--tactical-text-sub)] hover:text-[var(--tactical-text-main)] -skew-x-12 transition-colors shadow-sm"
									>
										<ChevronsLeft className="w-3.5 h-3.5 skew-x-12" />
									</button>
								)}

								<button
									type="button"
									onClick={handlePrev}
									aria-label="Previous Champion"
									className="flex items-center justify-center px-3 py-1.5 bg-[var(--tactical-card-bg)] border border-[var(--tactical-card-border)] hover:bg-[var(--tactical-accent-lime)] text-[var(--tactical-text-main)] hover:text-black -skew-x-12 transition-colors shadow-sm"
								>
									<div className="flex items-center -space-x-1.5 skew-x-12">
										<ChevronLeft className="w-4 h-4 stroke-[3]" />
										<ChevronLeft className="w-4 h-4 stroke-[3] opacity-60" />
									</div>
								</button>

								<button
									type="button"
									onClick={handleNext}
									aria-label="Next Champion"
									className="flex items-center justify-center px-3.5 py-1.5 bg-[var(--tactical-accent-lime)] hover:bg-[var(--tactical-accent-cyan)] text-black -skew-x-12 transition-colors shadow-[0_0_12px_rgba(210,255,40,0.4)]"
								>
									<div className="flex items-center -space-x-1.5 skew-x-12">
										<ChevronRight className="w-4 h-4 stroke-[3]" />
										<ChevronRight className="w-4 h-4 stroke-[3]" />
									</div>
								</button>

								{list.length > visibleCount && (
									<button
										type="button"
										onClick={handleNextPage}
										title={isEn ? "Next 6 champions" : "Trang kế (6 tướng)"}
										className="flex items-center justify-center px-2 py-1.5 bg-[var(--tactical-card-bg)] border border-[var(--tactical-card-border)] hover:bg-[var(--tactical-card-hover-bg)] text-[var(--tactical-text-sub)] hover:text-[var(--tactical-text-main)] -skew-x-12 transition-colors shadow-sm"
									>
										<ChevronsRight className="w-3.5 h-3.5 skew-x-12" />
									</button>
								)}
							</div>
						</div>
					</div>
				</div>

				{/* ============================================================
				    CỘT PHẢI (5 CỘT): KHUNG PORTRAIT VÁT GÓC (Chỉ hiển thị trên Desktop >= lg)
				   ============================================================ */}
				<div className="hidden lg:block lg:col-span-5">
					<div className="relative mx-auto max-w-md lg:max-w-none">
						{/* Lớp đổ bóng cứng lệch góc dưới phải (Hard Offset Shadow) */}
						<div
							className="absolute inset-0 translate-x-3 translate-y-3 bg-black border-2 border-[var(--tactical-accent-lime)]/50 pointer-events-none"
							style={{
								clipPath:
									"polygon(48px 0, 100% 0, 100% calc(100% - 48px), calc(100% - 48px) 100%, 0 100%, 0 48px)",
							}}
						/>

						{/* Khung Portrait chính có vát góc Top-Left & Bottom-Right */}
						<div
							key={activeChamp.id}
							className={`relative h-[380px] sm:h-[430px] w-full border-[3px] border-black dark:border-white overflow-hidden bg-gradient-to-br ${activeChamp.bgGradient} group shadow-2xl`}
							style={{
								clipPath:
									"polygon(48px 0, 100% 0, 100% calc(100% - 48px), calc(100% - 48px) 100%, 0 100%, 0 48px)",
							}}
						>
							{/* Hoạ tiết tia sáng / Halftone nền phía sau nhân vật */}
							<div className="absolute inset-0 bg-halftone opacity-35 mix-blend-overlay pointer-events-none" />

							{/* Ảnh Nghệ thuật của Tướng */}
							<SafeImage
								src={activeChamp.portrait}
								alt={activeChamp.name}
								className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 contrast-110"
							/>

							{/* Lớp phủ tối dần ở đáy để làm nổi bật thông tin Tướng */}
							<div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />

							{/* Badge Tier & Sao ở góc trên bên phải */}
							<div className="absolute top-4 right-4 z-20 flex items-center gap-2">
								<span className="px-2.5 py-1 bg-black/85 border border-[var(--tactical-accent-lime)] font-mono-tech text-xs font-bold text-[var(--tactical-accent-lime)]">
									{isEn ? `TIER ${activeChamp.tier}` : `BẬC ${activeChamp.tier}`}
								</span>
								<span className="px-2.5 py-1 bg-black/85 border border-amber-400 font-mono-tech text-xs font-bold text-amber-400 flex items-center gap-1">
									<Star className="w-3 h-3 fill-current" />
									{activeChamp.maxStar}★
								</span>
							</div>

							{/* Thông tin tóm tắt của Tướng đang chọn ở góc dưới khung */}
							<div className="absolute bottom-5 left-5 right-6 z-20">
								<div className="flex items-center gap-2 text-[11px] font-mono-tech uppercase tracking-widest text-[var(--tactical-accent-cyan)]">
									<span>// {activeChamp.region}</span>
									<span>•</span>
									<span className="flex items-center gap-1 text-blue-300">
										<Zap className="w-3 h-3 fill-current" />
										{activeChamp.cost} {isEn ? "MANA" : "NĂNG LƯỢNG"}
									</span>
								</div>

								<h4 className="text-3xl sm:text-4xl font-display font-black uppercase italic tracking-wide text-white mt-0.5 truncate">
									{activeChamp.name}{" "}
									<span className="text-sm sm:text-base font-primary not-italic font-normal text-gray-300">
										— {activeChamp.title}
									</span>
								</h4>

								<p className="text-xs sm:text-sm text-gray-200 font-primary line-clamp-2 mt-1.5 leading-relaxed">
									{activeChamp.desc}
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* ============================================================
			    THANH ĐIỀU HƯỚNG PHỤ (Giữ lại liên kết tới Tier List, Sub-Champs & Biểu đồ)
			   ============================================================ */}
			<div className="relative z-10 mt-10 pt-5 border-t border-[var(--tactical-section-border)] flex flex-wrap items-center justify-between gap-4">
				<span className="text-xs font-mono-tech uppercase font-bold tracking-widest text-[var(--tactical-text-dim)]">
					{isEn
						? "// CHAMPION & META ANALYSIS TOOLS:"
						: "// CÔNG CỤ PHÂN TÍCH TƯỚNG & META:"}
				</span>

				<div className="flex flex-wrap items-center gap-3">
					<NavLink
						to="/tierlist/champions"
						className="inline-flex items-center gap-2 px-3.5 py-2 bg-[var(--tactical-card-bg)] border border-[var(--tactical-card-border)] hover:border-[var(--tactical-accent-lime)] text-xs font-mono-tech font-bold uppercase text-[var(--tactical-text-main)] hover:text-[var(--tactical-accent-lime-fg)] transition-all clip-chamfer-sm shadow-sm"
					>
						<Trophy className="w-3.5 h-3.5 text-[var(--tactical-accent-lime-fg)]" />
						<span>{isEn ? "Champion Tier List" : "Bảng Xếp Hạng Tướng"}</span>
						<ArrowUpRight className="w-3.5 h-3.5" />
					</NavLink>

					<NavLink
						to="/sub-champions"
						className="inline-flex items-center gap-2 px-3.5 py-2 bg-[var(--tactical-card-bg)] border border-[var(--tactical-card-border)] hover:border-[var(--tactical-accent-cyan)] text-xs font-mono-tech font-bold uppercase text-[var(--tactical-text-main)] hover:text-[var(--tactical-accent-cyan-fg)] transition-all clip-chamfer-sm shadow-sm"
					>
						<Users className="w-3.5 h-3.5 text-[var(--tactical-accent-cyan-fg)]" />
						<span>{isEn ? "Supporting Champions" : "Tướng Hỗ Trợ (Sub-Champs)"}</span>
						<ArrowUpRight className="w-3.5 h-3.5" />
					</NavLink>

					<NavLink
						to="/tools/ratings"
						className="inline-flex items-center gap-2 px-3.5 py-2 bg-[var(--tactical-card-bg)] border border-[var(--tactical-card-border)] hover:border-amber-400 text-xs font-mono-tech font-bold uppercase text-[var(--tactical-text-main)] hover:text-amber-500 transition-all clip-chamfer-sm shadow-sm"
					>
						<Zap className="w-3.5 h-3.5 text-amber-500" />
						<span>{isEn ? "Champion Stat Radar" : "Biểu Đồ Chỉ Số Tướng"}</span>
						<ArrowUpRight className="w-3.5 h-3.5" />
					</NavLink>
				</div>
			</div>
		</div>
	);
};

const HomeTactical = () => {
	const translation = useTranslation();
	const language = translation?.language || "vi";
	const isEn = language === "en";
	const tDynamic = translation?.tDynamic;

	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState("champions");

	// Tải danh sách Tướng từ Backend API
	const [rawChampions, setRawChampions] = useState([]);
	const [loadingChampions, setLoadingChampions] = useState(true);

	useEffect(() => {
		let isMounted = true;
		const fetchChampions = async () => {
			try {
				setLoadingChampions(true);
				const data = await api.get("/champions?limit=-1&fields=summary");
				if (isMounted) {
					const items = (data.items || (Array.isArray(data) ? data : [])).map((c) => ({
						championID: c.championID,
						cardCode: c.cardCode,
						name: c.name,
						title: c.title,
						regions: c.regions || [],
						cost: Number(c.cost) || 0,
						maxStar: Number(c.maxStar) || 3,
						tier: c.tier,
						ratings: c.ratings,
						playStyle: c.playStyle,
						descriptionRaw:
							c.descriptionRaw ||
							(c.description || "").replace(/<[^>]*>/g, "").trim(),
						assets: c.assets,
						tags: c.tags,
						translations: c.translations,
					}));
					setRawChampions(items);
				}
			} catch (err) {
				console.error("Lỗi khi tải danh sách tướng từ API:", err);
			} finally {
				if (isMounted) setLoadingChampions(false);
			}
		};

		fetchChampions();
		return () => {
			isMounted = false;
		};
	}, []);

	// Danh sách Tướng đã được chuẩn hóa cho Showcase
	const formattedChampions = useMemo(() => {
		if (!rawChampions || rawChampions.length === 0) return [];
		return rawChampions.map((c) => formatChampionForShowcase(c, tDynamic, language));
	}, [rawChampions, tDynamic, language]);

	// Tướng Spotlight hiển thị trên Hero: Ưu tiên Garen hoặc tướng đầu tiên từ API
	const champion = useMemo(() => {
		if (formattedChampions.length === 0) return FEATURED_CHAMPION;
		const found = formattedChampions.find(
			(c) => c.cardCode === "01DE012" || c.name?.toLowerCase() === "garen"
		);
		if (found) {
			return {
				...found,
				splashImg: FEATURED_CHAMPION.splashImg || found.portrait,
				cardImg: FEATURED_CHAMPION.cardImg || found.cardImg,
				palette: FEATURED_CHAMPION.palette,
			};
		}
		return formattedChampions[0] || FEATURED_CHAMPION;
	}, [formattedChampions]);

	const palette = champion.palette || FEATURED_CHAMPION.palette;
	const cardCost = champion.cost;
	const splashImg = champion.splashImg || champion.portrait;
	const champName = champion.name;
	const cardImg = champion.cardImg;
	const currentCard = champion;

	const onOpenCarousel = () => {
		if (champion.link) {
			navigate(champion.link);
		}
	};

	// Định nghĩa các Phân hệ Hub chiến thuật
	const COMMAND_TABS = useMemo(
		() => [
			{
				id: "champions",
				code: "SYS_01",
				label: isEn ? "CHAMPIONS & TIER" : "TƯỚNG & XẾP HẠNG",
				sub: isEn ? "ROSTER & META" : "DANH SÁCH & META",
				icon: Swords,
				badge: isEn ? "ROSTER" : "DANH SÁCH",
			},
			{
				id: "gear",
				code: "SYS_02",
				label: isEn ? "RELICS & POWERS" : "CỔ VẬT & SỨC MẠNH",
				sub: isEn ? "ITEMS & RUNES" : "TRANG BỊ & NGỌC",
				icon: Sparkles,
				badge: isEn ? "EQUIPMENT" : "TRANG BỊ",
			},
			{
				id: "expedition",
				code: "SYS_03",
				label: isEn ? "MAPS & BOSSES" : "BẢN ĐỒ & TRÙM",
				sub: isEn ? "ADVENTURES & GUIDES" : "ẢI ĐẤU & CHIẾN THUẬT",
				icon: Map,
				badge: isEn ? "ADVENTURES" : "THÁM HIỂM",
			},
			{
				id: "tools",
				code: "SYS_04",
				label: isEn ? "CARDS & UTILITIES" : "THƯ VIỆN & CÔNG CỤ",
				sub: isEn ? "DATABASE & SIMULATOR" : "TRA CỨU & GIẢ LẬP",
				icon: Crosshair,
				badge: isEn ? "UTILITIES" : "TIỆN ÍCH",
			},
		],
		[isEn]
	);

	// Danh mục dữ liệu cho các Tab còn lại (Tab "champions" đã dùng ChampionTacticalShowcase)
	const MODULE_DATA = useMemo(
		() => ({
			gear: [
				{
					to: "/relics",
					icon: Sparkles,
					title: isEn ? "Relic Vault" : "Kho Cổ Vật",
					desc: isEn
						? "Common, Rare, Epic, and Mythic Relics for explosive combo setups."
						: "Kho Cổ vật Thường, Hiếm, Sử Thi và Thần Thoại giúp kích hoạt các combo bùng nổ.",
					img: BACKGROUND_IMAGES.relics,
					badge: isEn ? "RELICS" : "CỔ VẬT",
					highlight: true,
				},
				{
					to: "/tierlist/relics",
					icon: Trophy,
					title: isEn ? "Relic Tier List" : "Bảng Xếp Hạng Cổ Vật",
					desc: isEn
						? "Versatility rankings and Stardust investment priority for Epic Relics."
						: "Đánh giá độ đa dụng và thứ tự ưu tiên đầu tư Bụi Sao cho các Cổ vật Sử thi.",
					img: BACKGROUND_IMAGES.relics,
					badge: isEn ? "RELIC META" : "META CỔ VẬT",
				},
				{
					to: "/items",
					icon: Package,
					title: isEn ? "In-Run Items" : "Vật Phẩm Trong Trận",
					desc: isEn
						? "Random items found at adventure nodes to empower cards during a run."
						: "Trang bị rớt ngẫu nhiên trên các node bài để cường hóa lá bài trong ván đấu.",
					img: BACKGROUND_IMAGES.items,
					badge: isEn ? "ITEMS" : "VẬT PHẨM",
				},
				{
					to: "/powers",
					icon: Zap,
					title: isEn ? "Passive Powers" : "Sức Mạnh Nội Tại",
					desc: isEn
						? "Passive powers library that completely redefines how your run plays out."
						: "Tổng hợp sức mạnh nội tại thụ động biến đổi hoàn toàn lối vận hành trận đấu.",
					img: BACKGROUND_IMAGES.powers,
					badge: isEn ? "POWERS" : "NỘI TẠI",
				},
				{
					to: "/runes",
					icon: Gem,
					title: isEn ? "Runes System" : "Hệ Thống Ngọc Bổ Trợ",
					desc: isEn
						? "Runes system enhancing initial stats and archetype-specific passive bonuses."
						: "Hệ thống ngọc bổ trợ nâng cao chỉ số khởi đầu và hiệu ứng đặc thù theo hệ.",
					img: BACKGROUND_IMAGES.runes,
					badge: isEn ? "RUNES" : "NGỌC BỔ TRỢ",
				},
			],
			expedition: [
				{
					to: "/maps",
					icon: Map,
					title: isEn ? "Adventure Maps" : "Bản Đồ Phiêu Lưu",
					desc: isEn
						? "Node branches, shops, healer nodes, and encounter rewards across all paths."
						: "Thông tin nhánh rẽ, node cửa hàng, node hồi máu và phần thưởng toàn bộ các Ải.",
					img: BACKGROUND_IMAGES.maps,
					badge: isEn ? "MAPS" : "BẢN ĐỒ",
					highlight: true,
				},
				{
					to: "/bosses",
					icon: Crown,
					title: isEn ? "Boss Encounters" : "Khắc Chế Trùm",
					desc: isEn
						? "Weakness breakdown and counter-strategies against deadly bosses like Lissandra and Swain."
						: "Phân tích điểm yếu và phương án đối đầu các Trùm nguy hiểm như Lissandra, Swain.",
					img: BACKGROUND_IMAGES.bosses,
					badge: isEn ? "BOSSES" : "TRÙM NGUY HIỂM",
				},
				{
					to: "/tools/champion-items",
					icon: Users,
					title: isEn ? "Supporting Champions Matrix" : "Ghép Cặp Tướng Hỗ Trợ",
					desc: isEn
						? "Synergy matrix recommending supporting champions and items tailored to your main deck."
						: "Ma trận đề xuất Tướng Hỗ Trợ có trang bị tương thích mạnh nhất với bài gốc.",
					img: BACKGROUND_IMAGES.champions,
					badge: isEn ? "SYNERGY" : "TƯƠNG THÍCH",
				},
			],
			tools: [
				{
					to: "/cards",
					icon: GalleryHorizontal,
					title: isEn ? "Card Database" : "Thư Viện Thẻ Bài",
					desc: isEn
						? "Look up all Champion, Follower, and Spell cards in Legends of Runeterra."
						: "Tra cứu tất cả các lá bài Tướng, Quân lính và Phép thuật trong Legends of Runeterra.",
					img: BACKGROUND_IMAGES.cards,
					badge: isEn ? "CARDS" : "THẺ BÀI",
				},
				{
					to: "/simulator/vaults",
					icon: Archive,
					title: isEn ? "Vault Opening Simulator" : "Giả Lập Mở Rương",
					desc: isEn
						? "Simulate Silver, Gold, and Diamond Vaults to calculate drop rates for Shards and Relics."
						: "Giả lập mở rương Bạc, Vàng, Kim Cương để tính xác suất nhận Mảnh và Cổ vật.",
					img: BACKGROUND_IMAGES.items,
					badge: isEn ? "SIMULATOR" : "GIẢ LẬP",
				},
				{
					to: "/randomizer",
					icon: Dices,
					title: isEn ? "Challenge Randomizer" : "Vòng Quay Thử Thách",
					desc: isEn
						? "Spin for random champion picks and challenge conditions for fun adventure runs."
						: "Vòng quay ngẫu nhiên chọn Tướng và điều kiện chạy Ải cho các thử thách thú vị.",
					img: BACKGROUND_IMAGES.powers,
					badge: isEn ? "RANDOMIZER" : "THỬ THÁCH",
				},
				{
					to: "/resources",
					icon: Archive,
					title: isEn ? "Champion Shards & Stardust" : "Mảnh Tướng & Bụi Sao",
					desc: isEn
						? "Resource guide for Constellation materials, Stardust, and upgrade crystals."
						: "Bảng quy đổi và quản lý nguyên liệu Chòm sao, Bụi sao, Pha lê cường hóa.",
					img: BACKGROUND_IMAGES.event,
					badge: isEn ? "RESOURCES" : "TÀI NGUYÊN",
				},
			],
		}),
		[isEn]
	);

	return (
		<div className="min-h-screen tactical-page font-primary selection:bg-[var(--tactical-accent-lime)] selection:text-white dark:selection:text-black overflow-x-hidden">
			<PageTitle
				title={
					isEn
						? "POC GUIDE - The Path of Champions Guide | Legends of Runeterra"
						: "POC GUIDE - Cẩm Nang Con Đường Anh Hùng | Legends of Runeterra"
				}
				description={
					isEn
						? "Comprehensive encyclopedia for Champions, Relics, 6★ Constellations and Meta analysis for Legends of Runeterra The Path of Champions."
						: "Bách khoa toàn thư tra cứu Tướng, Cổ vật, sức mạnh Chòm sao 6★ và phân tích Meta chuẩn xác nhất cho chế độ Con Đường Anh Hùng (The Path of Champions) Legends of Runeterra."
				}
				keywords={
					isEn
						? "poc guide, the path of champions, lor pve guide, lor champion builds, relics tier list"
						: "poc guide, con đường anh hùng, the path of champions, lor pve guide, build tướng poc"
				}
			/>

			{/* ==============================================================
			    1. HERO COMMAND DECK
			    ============================================================== */}
			<section
				id="hero"
				className="relative overflow-hidden border-b tactical-section pt-8 pb-12 sm:pb-16 bg-halftone bg-hazard-stripes isolate"
			>
				{/* Giant Background Hollow Stroke Text chuẩn trang Chi tiết Tướng */}
				<div className="absolute -top-6 left-0 right-0 pointer-events-none select-none overflow-hidden">
					<div className="font-display text-[8rem] sm:text-[14rem] lg:text-[18rem] leading-none uppercase italic stroke-giant tracking-tighter whitespace-nowrap">
						{isEn ? "THE PATH OF CHAMPIONS // RUNETERRA ARCHIVE" : "CON ĐƯỜNG ANH HÙNG // KHO LƯU TRỮ"}
					</div>
				</div>

				{/* Ambient Neon Glows giống hệt Hero Section trang Chi tiết Tướng */}
				<div
					className="absolute top-1/4 right-10 w-96 h-96 rounded-full blur-[140px] pointer-events-none opacity-20"
					style={{ backgroundColor: palette?.accent || "#D2FF28" }}
				/>
				<div
					className="absolute bottom-10 left-1/4 w-80 h-80 rounded-full blur-[130px] pointer-events-none opacity-15"
					style={{ backgroundColor: palette?.secondary || "#00F5D4" }}
				/>

				{/* Lớp phủ ảnh nền hòa trộn mờ */}
				<div className="absolute inset-0 z-0 select-none overflow-hidden pointer-events-none">
					<img
						src={BACKGROUND_IMAGES.hero}
						alt="Hero Wallpaper"
						className="w-full h-full object-cover opacity-15 scale-105 mix-blend-luminosity"
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-[var(--tactical-page-bg)] via-[var(--tactical-page-bg)]/80 to-[var(--tactical-page-bg)]/90" />
				</div>

				<div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					{/* Top Telemetry Ticker */}
					<div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
						<div className="inline-flex items-center gap-2.5 px-3 py-1 bg-black/80 border border-[var(--tactical-accent-lime)] clip-chamfer-sm">
							<Radio className="w-3.5 h-3.5 tactical-accent-lime animate-pulse" />
							<span className="font-mono-tech text-xs uppercase font-bold tracking-widest text-[var(--tactical-accent-lime)]">
								{isEn
									? "// THE PATH OF CHAMPIONS // RUNETERRA ARCHIVE"
									: "// CON ĐƯỜNG ANH HÙNG // KHO LƯU TRỮ RUNETERRA"}
							</span>
						</div>

						<div className="hidden sm:flex items-center gap-2 font-mono-tech text-xs tactical-text-dim">
							<span className="px-2 py-0.5 bg-black/60 border border-white/10 clip-chamfer-sm">
								{isEn ? "STATUS: ONLINE" : "TRẠNG THÁI: TRỰC TUYẾN"}
							</span>
							<span className="px-2 py-0.5 bg-black/60 border border-white/10 clip-chamfer-sm text-[var(--tactical-accent-cyan)]">
								{isEn ? "VER: 2026.1" : "PHIÊN BẢN: 2026.1"}
							</span>
						</div>
					</div>

					{/* Center Hero Identity + Khối Hiển Thị Tướng Mới */}
					<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
						<div className="lg:col-span-7 space-y-4">
							<h1 className="text-5xl sm:text-7xl md:text-8xl font-display uppercase italic tracking-tight leading-none text-[var(--tactical-text-main)] drop-shadow-sm">
								{isEn ? (
									<>
										<span className="block">PATH OF</span>
										<span className="block tactical-accent-lime drop-shadow-[0_0_30px_rgba(210,255,40,0.4)]">
											CHAMPIONS
										</span>
									</>
								) : (
									<>
										<span className="block">CON ĐƯỜNG</span>
										<span className="block tactical-accent-lime drop-shadow-[0_0_30px_rgba(210,255,40,0.4)]">
											ANH HÙNG
										</span>
									</>
								)}
							</h1>

							<p className="text-[var(--tactical-text-sub)] font-primary text-sm sm:text-base md:text-lg max-w-2xl leading-relaxed">
								{isEn
									? "Comprehensive encyclopedia for Champions, Relics, 6★ Constellations, and accurate PvE Meta builds for Legends of Runeterra."
									: "Bách khoa toàn thư tra cứu Tướng, Cổ vật, sức mạnh Chòm sao 6★ và phân tích Meta chuẩn xác nhất cho chế độ PvE Legends of Runeterra."}
							</p>

							<div className="flex flex-wrap items-center gap-3 pt-2">
								<NavLink
									to="/champions"
									className="px-6 py-3 tactical-btn-primary clip-chamfer-sm font-display text-sm sm:text-base uppercase italic tracking-wider transition-all duration-300 flex items-center gap-2 shadow-[0_0_25px_rgba(210,255,40,0.35)] hover:scale-105 active:scale-95"
								>
									<Swords className="w-4 h-4" />
									<span>{isEn ? "EXPLORE ALL CHAMPIONS" : "KHÁM PHÁ DANH SÁCH TƯỚNG"}</span>
									<ChevronRight className="w-4 h-4" />
								</NavLink>

								<NavLink
									to="/tierlist/champions"
									className="px-6 py-3 bg-[var(--tactical-card-bg)] border-2 border-[var(--tactical-section-border)] text-[var(--tactical-text-main)] clip-chamfer-sm font-display text-sm sm:text-base uppercase italic tracking-wider transition-all duration-300 flex items-center gap-2 hover:border-[var(--tactical-accent-cyan)] hover:text-[var(--tactical-accent-cyan-fg)] shadow-sm"
								>
									<Trophy className="w-4 h-4 text-[var(--tactical-accent-cyan-fg)]" />
									<span>{isEn ? "TIER LIST & META" : "BẢNG XẾP HẠNG & META"}</span>
								</NavLink>
							</div>
						</div>

						{/* Khối Hiển Thị Tướng Mới */}
						<div className="lg:col-span-5">
							<div className="relative mx-auto max-w-md lg:max-w-none">
								<div
									className="absolute -inset-2.5 opacity-35 clip-chamfer blur-sm transition-colors duration-500"
									style={{
										background: `linear-gradient(135deg, ${palette.accent}, ${palette.secondary}, transparent)`,
									}}
								/>

								<div className="relative tactical-panel border-2 clip-chamfer overflow-hidden group shadow-xl">
									<div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2">
										<div className="inline-flex items-center space-x-1.5 tactical-tab-active px-3 py-1 font-display uppercase text-xs tracking-wider clip-chamfer-sm">
											<span>{isEn ? "SPOTLIGHT UNIT" : "TƯỚNG TIÊU ĐIỂM"}</span>
										</div>

										<div className="flex items-center space-x-2 tactical-box border px-3 py-1 font-mono-tech text-xs bg-black/80 backdrop-blur-sm">
											<span className="tactical-accent-cyan font-bold">
												ID: {champion.championID || champion.cardCode}
											</span>
											<span className="tactical-text-dim">|</span>
											<span className="text-blue-400 font-bold flex items-center gap-1">
												<Zap className="w-3 h-3 text-blue-400 fill-current" />
												{cardCost} {isEn ? "MANA" : "NĂNG LƯỢNG"}
											</span>
											<span className="tactical-text-dim">|</span>
											<span className="text-amber-400 font-bold flex items-center gap-1">
												<Star className="w-3 h-3 text-amber-400 fill-current" />
												{champion.maxStar || 6}★
											</span>
										</div>
									</div>

									<div
										onClick={onOpenCarousel}
										className="relative h-[320px] sm:h-[360px] w-full bg-black overflow-hidden cursor-pointer"
									>
										<img
											src={splashImg}
											alt={champName}
											className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-700 contrast-110"
										/>
										<div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />

										<div className="absolute bottom-4 left-4 z-20 pr-32">
											<div className="text-[10px] font-mono-tech uppercase tracking-widest text-[var(--tactical-accent-lime)]">
												{isEn ? "// SPOTLIGHT CHAMPION" : "// TIÊU ĐIỂM TƯỚNG"}
											</div>
											<h3 className="text-3xl sm:text-4xl font-display uppercase italic tracking-wide text-white group-hover:text-[var(--tactical-accent-lime)] transition-colors drop-shadow-lg">
												{champName}
											</h3>
											{champion.title && (
												<p className="text-xs text-gray-300 font-primary">{champion.title}</p>
											)}
										</div>

										{cardImg && (
											<div
												onClick={(e) => {
													e.stopPropagation();
													(currentCard || champion.cardCode) &&
														onOpenCarousel &&
														onOpenCarousel(currentCard, currentCard?.cardCode || champion.cardCode);
												}}
												className="absolute bottom-4 right-4 z-20 w-24 sm:w-28 drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)] cursor-pointer transform group-hover:-translate-y-2 transition duration-500"
												title={isEn ? "Click to view champion details" : "Nhấn để xem chi tiết tướng"}
											>
												<img
													src={cardImg}
													alt={`${champName} Card`}
													className="w-full h-auto rounded-md shadow-2xl"
													loading="lazy"
												/>
											</div>
										)}
									</div>

									<div className="p-4 tactical-box border-t border-l-4 border-l-[var(--tactical-accent-cyan)]">
										<div className="flex items-center justify-between mb-2">
											<span className="text-[11px] uppercase tracking-widest tactical-accent-cyan font-bold flex items-center gap-1.5">
												<Sparkles className="w-3.5 h-3.5" />
												<span>{isEn ? "CHAMPION TAGS" : "NHÃN ĐẶC TRƯNG"}</span>
											</span>
											<span className="text-[11px] font-mono-tech tactical-accent-lime">
												{champion.championID}
											</span>
										</div>
										<div className="flex flex-wrap gap-2 pt-1">
											{(() => {
												const dynamicTags = tDynamic(champion, "tags");
												const tagsToRender =
													Array.isArray(dynamicTags) && dynamicTags.length > 0
														? dynamicTags
														: champion.tags || [];
												return tagsToRender.length > 0 ? (
													tagsToRender.map((tag, tIdx) => (
														<span
															key={tIdx}
															className="px-2.5 py-1 text-xs font-mono-tech font-bold uppercase tactical-card border border-[var(--tactical-accent-cyan)]/40 text-[var(--tactical-accent-cyan)] clip-chamfer-sm hover:border-[var(--tactical-accent-lime)] hover:text-[var(--tactical-accent-lime)] transition"
														>
															#{tag}
														</span>
													))
												) : (
													<span className="text-xs tactical-text-sub font-mono-tech">
														{isEn ? "#STANDARD #TACTICAL" : "#TIÊU_CHUẨN #CHIẾN_THUẬT"}
													</span>
												);
											})()}
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* ==============================================================
			    2. TACTICAL COMMAND TABS CONTROLLER
			    ============================================================== */}
			<section className="sticky top-14 z-40 bg-[var(--tactical-header-bg)] backdrop-blur-md border-b border-[var(--tactical-section-border)] py-3 shadow-md">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
						{COMMAND_TABS.map((tab) => {
							const isActive = activeTab === tab.id;
							const TabIcon = tab.icon;

							return (
								<button
									key={tab.id}
									type="button"
									onClick={() => setActiveTab(tab.id)}
									className={`group relative flex items-center gap-2.5 px-4 sm:px-5 py-2.5 clip-chamfer-sm border font-display text-xs sm:text-sm uppercase italic tracking-wider whitespace-nowrap transition-all duration-300 ${
										isActive
											? "bg-[var(--tactical-accent-lime)] text-black border-[var(--tactical-accent-lime)] font-black shadow-[0_0_20px_rgba(210,255,40,0.35)] scale-[1.02]"
											: "bg-[var(--tactical-card-bg)] border-[var(--tactical-card-border)] text-[var(--tactical-text-main)] hover:border-[var(--tactical-accent-lime)] hover:text-[var(--tactical-accent-lime-fg)] shadow-sm"
									}`}
								>
									<TabIcon
										className={`w-4 h-4 transition-colors ${
											isActive ? "text-black" : "text-[var(--tactical-text-dim)] group-hover:text-[var(--tactical-accent-lime-fg)]"
										}`}
									/>
									<span>{tab.label}</span>
									<span
										className={`hidden sm:inline font-mono-tech text-[10px] px-1.5 py-0.5 rounded font-bold ${
											isActive ? "bg-black text-[var(--tactical-accent-lime)]" : "bg-black/10 dark:bg-black/60 text-[var(--tactical-text-dim)]"
										}`}
									>
										{tab.code}
									</span>
								</button>
							);
						})}
					</div>
				</div>
			</section>

			{/* ==============================================================
			    3. ACTIVE TAB CONTENT MODULE
			    ============================================================== */}
			<main className="relative overflow-hidden tactical-section bg-halftone py-10 sm:py-16">
				{/* Ambient Neon Glow dịu nhẹ góc dưới phải */}
				<div
					className="absolute bottom-1/4 right-10 w-96 h-96 rounded-full blur-[160px] pointer-events-none opacity-10"
					style={{ backgroundColor: palette?.accent || "#D2FF28" }}
				/>

				<div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					{/* Tab Header Banner */}
					<div className="flex items-end justify-between mb-8 pb-4 border-b border-[var(--tactical-section-border)]">
						<div>
							<div className="text-xs font-mono-tech uppercase font-bold text-[var(--tactical-accent-cyan-fg)] flex items-center gap-2">
								<span>{isEn ? "// ACTIVE PROTOCOL //" : "// PHÂN HỆ ĐANG CHỌN //"}</span>
								<span className="tactical-accent-lime font-bold">
									{COMMAND_TABS.find((t) => t.id === activeTab)?.badge}
								</span>
							</div>
							<h2 className="text-3xl sm:text-5xl font-display uppercase italic tracking-tight text-[var(--tactical-text-main)] mt-1">
								{COMMAND_TABS.find((t) => t.id === activeTab)?.label}{" "}
								<span className="tactical-accent-lime">
									{COMMAND_TABS.find((t) => t.id === activeTab)?.sub}
								</span>
							</h2>
						</div>

						<div className="hidden sm:block text-right font-mono-tech text-xs text-[var(--tactical-text-dim)]">
							<div className="font-bold text-[var(--tactical-text-sub)]">
								{activeTab === "champions"
									? `${loadingChampions ? "..." : (formattedChampions.length || 0)} ${isEn ? "CHAMPIONS READY" : "TƯỚNG SẴN SÀNG"}`
									: `${MODULE_DATA[activeTab]?.length || 0} ${isEn ? "MODULES LOADED" : "DANH MỤC KHẢ DỤNG"}`}
							</div>
							<div className="text-[10px] text-[var(--tactical-accent-cyan-fg)] font-bold">
								{activeTab === "champions"
									? (isEn ? "SELECT UNIT TO INSPECT" : "CHỌN TƯỚNG ĐỂ XEM CHI TIẾT")
									: (isEn ? "CLICK TO EXECUTE" : "CHỌN ĐỂ TRUY CẬP")}
							</div>
						</div>
					</div>

					{/* Nếu đang ở Tab "champions" -> Render Section Choose Your Champion.
					    Ngược lại -> Render Grid các ô CommandCard cho các Tab khác */}
					{activeTab === "champions" ? (
						<ChampionTacticalShowcase
							champions={formattedChampions}
							loading={loadingChampions}
							isEn={isEn}
						/>
					) : (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 animate-fadeIn">
							{MODULE_DATA[activeTab]?.map((item, idx) => (
								<CommandCard
									key={idx}
									to={item.to}
									icon={item.icon}
									title={item.title}
									desc={item.desc}
									img={item.img}
									badge={item.badge}
									highlight={item.highlight}
								/>
							))}
						</div>
					)}
				</div>
			</main>
		</div>
	);
};

export default HomeTactical;