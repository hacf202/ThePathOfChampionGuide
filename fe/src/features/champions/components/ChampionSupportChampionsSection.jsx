import React, { useMemo } from "react";
import { NavLink } from "react-router-dom";
import { Users, ArrowUpRight, Layers } from "lucide-react";

const ChampionSupportChampionsSection = ({
	champion,
	resolvedSubChampions = [],
	tUI,
	onOpenCarousel,
}) => {
	// Map resolved sub-champions by cardCode for fast lookup
	const subMap = useMemo(() => {
		const map = new Map();
		(resolvedSubChampions || []).forEach((s) => {
			if (s.cardCode) {
				map.set(s.cardCode.toUpperCase(), s);
				map.set(s.cardCode.toLowerCase(), s);
			}
			if (s.name) {
				map.set(s.name.toLowerCase(), s);
			}
		});
		return map;
	}, [resolvedSubChampions]);

	// Extract support champion packs from champion object
	const packList = useMemo(() => {
		const raw = champion?.supportChampions || champion?.subChampionIds || champion?.recommendedSubChampions;
		if (!Array.isArray(raw) || raw.length === 0) return [];

		return raw.map((item) => {
			const cardCode = typeof item === "string" ? item : item.cardCode;
			const details = subMap.get(cardCode?.toUpperCase()) || subMap.get(cardCode?.toLowerCase());

			return {
				cardCode,
				name: typeof item === "object" ? item.name || details?.name || cardCode : details?.name || cardCode,
				details,
			};
		});
	}, [champion, subMap]);

	if (packList.length === 0) {
		return null;
	}

	return (
		<section
			id="support-champions"
			className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 border-b border-[var(--tactical-card-border)]"
		>
			{/* Section Header */}
			<div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
				<div>
					<div className="flex items-center gap-2 text-[var(--tactical-accent-lime)] text-xs font-mono-tech tracking-widest uppercase mb-1.5">
						<Users className="w-4 h-4" />
						<span>// 05 // {tUI("championDetail.tactical.supportChampionsHeader") || "SUPPORT PACKS"}</span>
					</div>
					<h2 className="font-display text-2xl sm:text-3xl uppercase italic tracking-wider text-white">
						{tUI("championDetail.tactical.supportChampionsTitle") || "TƯỚNG PHỤ KHUYÊN DÙNG"}
					</h2>
				</div>

				<div className="flex items-center gap-2 self-start sm:self-auto font-mono-tech text-xs text-text-tertiary">
					<span className="w-2 h-2 rounded-full bg-[var(--tactical-accent-lime)] animate-pulse" />
					<span>{packList.length} {tUI("championDetail.tactical.supportPackagesLoaded") || "GÓI VIỆN TRỢ"}</span>
				</div>
			</div>

			{/* Grid of Support Champion Packs */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
				{packList.map((item, idx) => {
					const { cardCode, name, details } = item;
					const champName = details?.name || name || cardCode;
					const pkgName = details?.packageName || "";
					const splashImg = details?.fullAbsolutePath || details?.cards?.[0]?.image || "/fallback-champion.png";
					const cards = details?.cards || [];

					return (
						<div
							key={cardCode || idx}
							className="tactical-card clip-chamfer group border border-[var(--tactical-card-border)] bg-[var(--tactical-card-bg)] hover:border-[var(--tactical-accent-lime)] transition-all flex flex-col overflow-hidden"
						>
							{/* Banner Tướng Phụ */}
							<div className="relative h-36 sm:h-40 overflow-hidden border-b border-[var(--tactical-card-border)] shrink-0 bg-black/50">
								<img
									src={splashImg}
									alt={champName}
									className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
									onError={(e) => {
										if (details?.cards?.[0]?.image) e.target.src = details.cards[0].image;
									}}
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-[var(--tactical-card-bg)] via-[var(--tactical-card-bg)]/30 to-transparent" />

								{/* Top Right: Single Navigation Arrow to view Champion Card */}
								<div className="absolute top-2.5 right-2.5">
									<NavLink
										to={`/card/${encodeURIComponent(cardCode)}`}
										className="p-1.5 text-gray-300 hover:text-[var(--tactical-accent-lime)] hover:border-[var(--tactical-accent-lime)] tactical-box border border-[var(--tactical-card-border)] rounded clip-chamfer-sm transition group/btn flex items-center justify-center bg-black/60"
										title={champName}
									>
										<ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
									</NavLink>
								</div>

								{/* Bottom: Name & Package Name */}
								<div className="absolute bottom-2.5 left-3 right-3 min-w-0">
									<div className="flex items-center gap-2">
										<div className="w-1 h-4 bg-[var(--tactical-accent-lime)] shadow-[0_0_6px_var(--tactical-accent-lime)] shrink-0" />
										<h3 className="text-lg font-bold font-display text-white uppercase tracking-wider drop-shadow-md truncate">
											{champName}
										</h3>
									</div>
									{pkgName && (
										<p className="text-[11px] font-mono-tech text-text-secondary truncate pl-3 mt-0.5">
											// {pkgName}
										</p>
									)}
								</div>
							</div>

							{/* Danh sách lá bài trong gói viện trợ (Pack Cards) */}
							<div className="p-3.5 flex-1 flex flex-col justify-center">
								{cards.length > 0 ? (
									<div className="space-y-2">
										<p className="text-[10px] font-mono-tech font-bold text-text-tertiary uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
											<Layers className="w-3 h-3 text-[var(--tactical-accent-lime)]" />
											<span>// {tUI("championDetail.tactical.packageCardsLabel") || "CÁC LÁ BÀI TRONG GÓI"}</span>
										</p>
										{cards.map((c, cIdx) => (
											<div
												key={c.cardCode || cIdx}
												className="tactical-box clip-chamfer-sm flex items-center justify-between gap-2.5 p-2 bg-[var(--tactical-inner-box)] border border-[var(--tactical-card-border)] hover:border-[var(--tactical-accent-cyan)] transition-all group/subcard"
											>
												<div
													className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
													onClick={() => onOpenCarousel && onOpenCarousel(c, c.cardCode)}
												>
													<div className="w-9 h-9 clip-chamfer-sm flex-shrink-0 border border-[var(--tactical-card-border)] overflow-hidden bg-black/40">
														<img
															src={c.image}
															alt={c.name}
															className="w-full h-full object-contain"
															onError={(e) => { e.target.src = '/fallback-card.png'; }}
														/>
													</div>
													<div className="min-w-0 flex-1">
														<p className="text-xs font-bold text-text-primary truncate group-hover/subcard:text-[var(--tactical-accent-cyan)] transition-colors">
															{c.name}
														</p>
														<p className="text-[10px] font-mono-tech text-[var(--tactical-accent-lime)]">
															x{c.count} {tUI("subChampionList.copies") || "bản sao"}
														</p>
													</div>
												</div>

												{/* Single Navigation Arrow to view card details */}
												<NavLink
													to={`/card/${encodeURIComponent(c.cardCode)}`}
													className="p-1 text-text-tertiary hover:text-[var(--tactical-accent-cyan)] hover:border-[var(--tactical-accent-cyan)] tactical-box border border-[var(--tactical-card-border)] rounded clip-chamfer-sm transition flex items-center justify-center shrink-0"
													title={c.name}
												>
													<ArrowUpRight className="w-3 h-3" />
												</NavLink>
											</div>
										))}
									</div>
								) : (
									<div className="py-4 text-center text-xs text-text-tertiary font-mono-tech">
										// {cardCode}
									</div>
								)}
							</div>
						</div>
					);
				})}
			</div>
		</section>
	);
};

export default ChampionSupportChampionsSection;
