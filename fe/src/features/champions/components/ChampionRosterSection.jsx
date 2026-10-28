import React from "react";
import { Link } from "react-router-dom";
import { Star, ChevronRight } from "lucide-react";
import SafeImage from "@/components/common/SafeImage";
import { generateSlug } from "@/utils/slugify";

const ChampionRosterSection = ({
	allChampions = [],
	currentChampion,
	tUI,
	tDynamic,
	language = "vi",
}) => {
	if (!allChampions || allChampions.length === 0) return null;

	const otherChampions = allChampions.filter(
		(c) => c.championID !== currentChampion?.championID
	);

	// Ưu tiên cùng khu vực trước, rồi lấy tối đa 8 tướng
	const sameRegion = otherChampions.filter((c) =>
		c.regions?.some((r) => currentChampion?.regions?.includes(r))
	);
	const remaining = otherChampions.filter((c) => !sameRegion.includes(c));
	const roster = [...sameRegion, ...remaining].slice(0, 8);

	if (roster.length === 0) return null;

	return (
		<section id="roster" className="py-12 sm:py-20 border-b tactical-section">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
					<h2 className="font-display text-3xl sm:text-4xl lg:text-5xl uppercase italic tactical-text-main">
						{tUI("championDetail.tactical.rosterTitle") || "Khám Phá Các Tướng Khác"}
					</h2>
					<Link
						to="/champions"
						className="inline-flex items-center space-x-1.5 text-xs font-mono-tech uppercase tactical-accent-cyan hover:text-[var(--tactical-accent-lime)] transition"
					>
						<span>{tUI("championDetail.tactical.viewAllRoster") || "XEM TOÀN BỘ DANH SÁCH"}</span>
						<ChevronRight className="w-4 h-4" />
					</Link>
				</div>

				<div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
					{roster.map((fighter) => {
						const isCurrent = fighter.championID === currentChampion?.championID;
						const slug = generateSlug(fighter.translations?.en?.name || fighter.name);
						const imgUrl = fighter.assets?.[0]?.avatar || fighter.gameAbsolutePath;

						return (
							<Link
								key={fighter.championID}
								to={`/champion/${slug}`}
								className={`group relative h-48 border text-left clip-chamfer-sm overflow-hidden transition-all duration-300 tactical-card ${
									isCurrent
										? "!border-[var(--tactical-accent-lime)] shadow-[0_0_20px_rgba(34,197,94,0.15)]"
										: "hover:!border-[var(--tactical-accent-cyan)] hover:scale-[1.02]"
								}`}
							>
								<SafeImage
									src={imgUrl}
									alt={tDynamic(fighter, "name")}
									className="w-full h-full object-cover object-center opacity-60 group-hover:opacity-90 group-hover:scale-110 transition duration-500"
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

								{/* Top Badge: Star rating */}
								<span className="absolute top-2 right-2 text-[10px] font-mono-tech font-bold uppercase px-1.5 py-0.5 bg-black/80 text-yellow-400 border border-yellow-400/40 flex items-center gap-0.5">
									<span>{fighter.maxStar || 3}</span>
									<Star className="w-2.5 h-2.5 fill-current" />
								</span>

								{/* Bottom Name & Region */}
								<div className="absolute bottom-2.5 left-2.5 right-2">
									<div className="font-display text-base sm:text-lg uppercase italic tracking-wide text-white group-hover:text-[var(--tactical-accent-lime)] transition truncate">
										{tDynamic(fighter, "name")}
									</div>
									<div className="text-[10px] text-gray-300 font-mono-tech truncate uppercase">
										{fighter.regions?.[0] || "Runeterra"}
									</div>
								</div>
							</Link>
						);
					})}
				</div>
			</div>
		</section>
	);
};

export default ChampionRosterSection;
