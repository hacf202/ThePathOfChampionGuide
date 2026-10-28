import { useEffect, useState, useMemo } from "react";
import { ChevronRight, ListCollapse, ChevronLeft, Sparkles, Zap, Film, Compass, MessageSquare, Grid } from "lucide-react";

const ChampionTableOfContents = ({ tUI }) => {
	const [activeId, setActiveId] = useState("hero");
	const [isCollapsed, setIsCollapsed] = useState(false);

	const sections = useMemo(
		() => [
			{
				id: "hero",
				label: tUI("championDetail.tactical.navHero") || "Tổng Quan",
				num: "01",
				icon: Sparkles,
			},
			{
				id: "powers-constellation",
				label: tUI("championDetail.tactical.navPowers") || "Sức Mạnh & Chòm Sao",
				num: "02",
				icon: Zap,
			},
			{
				id: "relic-builds",
				label: tUI("championDetail.tactical.navRelics") || "Bộ Cổ Vật & Video",
				num: "03",
				icon: Film,
			},
			{
				id: "priority-items",
				label: tUI("championDetail.tactical.navPriorities") || "Vật Phẩm Ưu Tiên",
				num: "04",
				icon: Compass,
			},
			{
				id: "roster",
				label: tUI("championDetail.tactical.navRoster") || "Tướng Khác",
				num: "05",
				icon: Grid,
			},
			{
				id: "community",
				label: tUI("championDetail.tactical.navDiscussion") || tUI("championDetail.tactical.navCommunity") || "Bình Luận & Thảo Luận",
				num: "06",
				icon: MessageSquare,
			},
		],
		[tUI]
	);

	useEffect(() => {
		const handleScroll = () => {
			const scrollPos = window.scrollY + 180;
			let current = sections[0].id;

			for (let i = sections.length - 1; i >= 0; i--) {
				const el = document.getElementById(sections[i].id);
				if (el) {
					const top = el.offsetTop;
					if (scrollPos >= top) {
						current = sections[i].id;
						break;
					}
				}
			}
			setActiveId(current);
		};

		handleScroll();
		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleScroll);
	}, [sections]);

	const scrollToSection = (id) => {
		const el = document.getElementById(id);
		if (el) {
			const offset = 70; // offset cho top navbar
			const bodyRect = document.body.getBoundingClientRect().top;
			const elementRect = el.getBoundingClientRect().top;
			const elementPosition = elementRect - bodyRect;
			const offsetPosition = elementPosition - offset;

			window.scrollTo({
				top: offsetPosition,
				behavior: "smooth",
			});
		}
	};

	return (
		<aside
			aria-label="Table of Contents"
			className={`fixed z-40 transition-all duration-300 hidden xl:flex flex-col ${
				isCollapsed
					? "right-2 top-24 w-12"
					: "right-3 2xl:right-8 top-24 w-56 2xl:w-64"
			}`}
		>
			<div className="tactical-toc backdrop-blur-md border p-3 clip-chamfer-sm shadow-2xl space-y-3">
				{/* Header */}
				<div className="flex items-center justify-between border-b tactical-section pb-2">
					{!isCollapsed ? (
						<div className="flex items-center space-x-2">
							<span className="w-2 h-2 rounded-full bg-[var(--tactical-accent-lime)] animate-pulse" />
							<span className="text-[11px] font-mono-tech uppercase tracking-widest tactical-accent-lime font-bold">
								{tUI("championDetail.tactical.tocTitle") || "Mục Lục"}
							</span>
						</div>
					) : (
						<span className="w-2 h-2 rounded-full bg-[var(--tactical-accent-lime)] mx-auto animate-pulse" />
					)}

					<button
						type="button"
						onClick={() => setIsCollapsed(!isCollapsed)}
						className="p-1 tactical-text-dim hover:tactical-text-main hover:tactical-box rounded transition"
						title={isCollapsed ? (tUI("championDetail.tactical.expandToc") || "Mở rộng mục lục") : (tUI("championDetail.tactical.collapseToc") || "Thu gọn")}
					>
						{isCollapsed ? <ChevronLeft className="w-3.5 h-3.5" /> : <ListCollapse className="w-3.5 h-3.5" />}
					</button>
				</div>

				{/* Section Items */}
				<nav className="space-y-1">
					{sections.map((sec) => {
						const isActive = activeId === sec.id;
						const Icon = sec.icon;

						if (isCollapsed) {
							return (
								<button
									key={sec.id}
									type="button"
									onClick={() => scrollToSection(sec.id)}
									className={`w-full py-2 flex items-center justify-center transition clip-chamfer-sm ${
										isActive
											? "tactical-tab-active font-bold shadow-md"
											: "tactical-text-dim hover:tactical-text-main hover:tactical-box"
									}`}
									title={sec.label}
								>
									<Icon className="w-4 h-4" />
								</button>
							);
						}

						return (
							<button
								key={sec.id}
								type="button"
								onClick={() => scrollToSection(sec.id)}
								className={`w-full text-left px-2.5 py-2 transition-all flex items-center justify-between text-xs clip-chamfer-sm group ${
									isActive
										? "tactical-card !border-l-4 !border-l-[var(--tactical-accent-lime)] tactical-text-main font-bold shadow-md"
										: "tactical-text-sub hover:tactical-text-main hover:tactical-box border-l-4 border-transparent"
								}`}
							>
								<div className="flex items-center space-x-2 truncate pr-1">
									<Icon
										className={`w-3.5 h-3.5 shrink-0 ${
											isActive ? "tactical-accent-lime" : "tactical-accent-cyan group-hover:tactical-accent-lime"
										}`}
									/>
									<span className="truncate">{sec.label}</span>
								</div>

								<span
									className={`font-mono-tech text-[10px] shrink-0 ${
										isActive ? "tactical-accent-lime font-bold" : "tactical-text-dim"
									}`}
								>
									{sec.num}
								</span>
							</button>
						);
					})}
				</nav>
			</div>
		</aside>
	);
};

export default ChampionTableOfContents;
