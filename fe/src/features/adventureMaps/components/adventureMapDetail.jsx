import React, { memo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
	ChevronLeft,
	Star,
	Swords,
	ShieldAlert,
	Map as MapIcon,
	Eye,
	EyeOff,
	Info,
} from "lucide-react";

import { useTranslation } from "@/hooks/useTranslation";
import { useMapDetailData } from "@/hooks/useMapDetailData";
import PageTitle from "@/components/common/pageTitle";
import Button from "@/components/common/button";
import MarkupRenderer from "@/components/common/MarkupRenderer";

// Import các sub-components đã được tách
import MapDetailSkeleton from "@/features/adventureMaps/components/mapDetailSkeleton";
import AdventureMapVisualizer from "@/features/adventureMaps/components/adventureMapVisualizer";
import ResolvedPowerCard from "@/features/adventureMaps/components/resolvedPowerCard";
import BossListSection from "@/features/adventureMaps/components/bossListSection";
import RequirementSection from "@/features/adventureMaps/components/requirementSection";
import RewardSection from "@/features/adventureMaps/components/rewardSection";

function AdventureMapDetail() {
	const { adventureID } = useParams();
	const navigate = useNavigate();
	const { tUI, tDynamic } = useTranslation();

	const [isMapVisible, setIsMapVisible] = useState(true);

	const {
		adventure,
		resolvedRules,
		resolvedBosses,
		resolvedChampions,
		resourceCache,
		loading,
		error,
	} = useMapDetailData(adventureID);

	if (error) {
		return (
			<div className='flex flex-col items-center justify-center py-20 text-center'>
				<ShieldAlert size={48} className='text-red-500 mb-4 opacity-50' />
				<p className='text-xl text-text-primary mb-6'>
					{tUI("adventureMap.errorLoad") || error}
				</p>
				<Button onClick={() => navigate("/maps")} variant='primary'>
					{tUI("common.backToList") || "Quay lại danh sách"}
				</Button>
			</div>
		);
	}

	return (
		<div className='animate-fadeIn font-primary selection:bg-[var(--tactical-accent-lime)] selection:text-black max-w-[1100px] mx-auto p-2 md:p-6 pb-20'>
			<PageTitle
				title={
					adventure
						? tDynamic(adventure, "adventureName")
						: tUI("adventureMap.detailTitle") || "Chi tiết bản đồ"
				}
				description={`${tUI("adventureMap.detailDesc") || "Hướng dẫn chi tiết bản đồ"} ${adventure?.adventureName || ""}`}
				keywords={adventure ? `${tDynamic(adventure, "adventureName")}, adventure, LoR adventure, PoC map, ${adventure.difficulty} stars` : ""}
			/>
			<button
				type="button"
				onClick={() => navigate(-1)}
				className='inline-flex items-center gap-2 px-4 py-2 tactical-card border border-[var(--tactical-card-border)] hover:border-[var(--tactical-accent-lime)] text-xs font-mono-tech font-bold uppercase text-[var(--tactical-text-main)] hover:text-[var(--tactical-accent-lime-fg)] transition-all clip-chamfer-sm shadow-sm group mb-4'
			>
				<ChevronLeft size={16} className='group-hover:-translate-x-0.5 transition-transform' />
				<span>{tUI("common.back") || "Quay lại"}</span>
			</button>

			{loading ? (
				<div key='skeleton' className='w-full'>
					<MapDetailSkeleton />
				</div>
			) : (
				<div key='content' className='flex flex-col space-y-8 w-full'>
					{/* HERO SECTION */}
					<section className='relative clip-chamfer overflow-hidden border-2 border-[var(--tactical-section-border)] tactical-panel shadow-2xl w-full'>
						<div className='absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent z-10'></div>
						<img
							src={
								adventure.assetAbsolutePath ||
								adventure.background ||
								"/images/placeholder-bg.jpg"
							}
							alt={tDynamic(adventure, "adventureName")}
							className='w-full h-[250px] md:h-[350px] object-cover opacity-80'
						/>
						{/* Corner Cyber Notches */}
						<div className="absolute top-0 right-0 w-8 h-8 pointer-events-none border-t-2 border-r-2 border-[var(--tactical-accent-cyan)]/40 z-20" />
						<div className="absolute bottom-0 left-0 w-8 h-8 pointer-events-none border-b-2 border-l-2 border-[var(--tactical-accent-lime)]/40 z-20" />

						<div className='absolute bottom-0 left-0 w-full p-4 md:p-8 z-20 flex flex-col md:flex-row justify-between items-end gap-4'>
							<div>
								<div className='flex items-center gap-2.5 mb-2.5'>
									<span className='bg-black/85 text-amber-400 border border-amber-400/50 font-mono-tech font-bold px-3 py-1 clip-chamfer-sm text-xs flex items-center gap-1 shadow-md'>
										{adventure.difficulty}{" "}
										<Star size={13} className='fill-current' />
									</span>
									<span className='bg-black/85 text-[var(--tactical-accent-cyan)] border border-[var(--tactical-accent-cyan)]/50 px-3 py-1 clip-chamfer-sm text-xs font-mono-tech uppercase font-bold tracking-wider shadow-md'>
										{tDynamic(adventure, "typeAdventure")}
									</span>
								</div>
								<h1 className='text-3xl md:text-5xl font-display font-black text-white uppercase italic tracking-wide drop-shadow-lg leading-none'>
									{tDynamic(adventure, "adventureName")}
								</h1>
							</div>
							<div className='tactical-box border border-[var(--tactical-accent-lime)]/50 text-white px-5 py-2.5 clip-chamfer-sm flex flex-col items-center bg-black/85 shadow-[0_0_15px_rgba(210,255,40,0.2)]'>
								<span className='text-[10px] font-mono-tech uppercase font-bold tracking-widest text-[var(--tactical-text-dim)]'>
									{tUI("adventureMap.championXp") || "Champion XP"}
								</span>
								<span className='text-xl sm:text-2xl font-mono-tech font-black text-[var(--tactical-accent-lime)]'>
									{adventure.championXP?.toLocaleString() || 0}
								</span>
							</div>
						</div>
					</section>

					{/* MAP VISUALIZER SECTION */}
					{adventure.nodes && adventure.nodes.length > 0 && (
						<section className='tactical-card clip-chamfer border border-[var(--tactical-card-border)] p-4 md:p-6 shadow-xl w-full'>
							<div className='flex justify-between items-center border-b border-[var(--tactical-stroke-color)] pb-3'>
								<h2 className='text-xl font-display font-black text-[var(--tactical-accent-cyan)] uppercase italic tracking-wide flex items-center gap-2'>
									<MapIcon size={20} />{" "}
									{tUI("adventureMap.adventureMapTitle") || "Bản Đồ Phiêu Lưu"}
								</h2>
								<button
									type='button'
									onClick={() => setIsMapVisible(!isMapVisible)}
									className='inline-flex items-center gap-1.5 px-3 py-1.5 tactical-card border border-[var(--tactical-card-border)] hover:border-[var(--tactical-accent-cyan)] text-xs font-mono-tech font-bold uppercase text-[var(--tactical-text-main)] hover:text-[var(--tactical-accent-cyan-fg)] transition-all clip-chamfer-sm'
								>
									{isMapVisible ? <EyeOff size={15} /> : <Eye size={15} />}
									<span>
										{isMapVisible
											? tUI("common.hide") || "Ẩn"
											: tUI("common.show") || "Hiện"}
									</span>
								</button>
							</div>

							{isMapVisible && (
								<div className='overflow-hidden mt-4'>
									<AdventureMapVisualizer
										nodes={adventure.nodes}
										background={adventure.background}
										resolvedBosses={resolvedBosses}
									/>
								</div>
							)}
						</section>
					)}

					{/* SPECIAL RULES SECTION */}
					{resolvedRules.length > 0 && (
						<section className='tactical-card clip-chamfer border border-[var(--tactical-card-border)] p-4 md:p-6 shadow-xl w-full'>
							<h2 className='text-xl font-display font-black text-[var(--tactical-accent-lime)] uppercase italic tracking-wide mb-4 flex items-center gap-2 border-b border-[var(--tactical-stroke-color)] pb-3'>
								<Swords size={20} />{" "}
								{tUI("adventureMap.specialRules") || "Luật Chơi Đặc Biệt"}
							</h2>
							<div className={`grid grid-cols-1 ${resolvedRules.length > 1 ? "sm:grid-cols-2" : ""} gap-4`}>
								{resolvedRules.map((power, idx) => (
									<ResolvedPowerCard key={idx} powerOrId={power} />
								))}
							</div>
						</section>
					)}

					{/* SPECIAL BLOCKS SECTION */}
					{adventure.specialBlocks && adventure.specialBlocks.length > 0 && (
						adventure.specialBlocks.map((block, blockIdx) => {
							const blockTitle = tDynamic(block, "title") || block.title;
							const blockDesc = tDynamic(block, "description") || block.description;
							const hasItems = block.items && block.items.length > 0;

							if (!blockTitle && !blockDesc && !hasItems) return null;

							return (
								<section key={blockIdx} className='tactical-card clip-chamfer border border-[var(--tactical-card-border)] p-4 md:p-6 shadow-xl w-full relative group overflow-hidden'>
									<div className='absolute top-0 left-0 w-1.5 h-full bg-[var(--tactical-accent-lime)]' />
									
									{blockTitle && (
										<h2 className='text-lg sm:text-xl font-display font-black text-[var(--tactical-accent-lime)] uppercase italic tracking-wide mb-2 flex items-center gap-2 border-b border-[var(--tactical-stroke-color)] pb-2'>
											<Info size={18} className='text-[var(--tactical-accent-lime)]' />{" "}
											{blockTitle}
										</h2>
									)}

										{blockDesc && (
											<p className='text-xs sm:text-sm text-text-secondary mb-4 leading-relaxed italic'>
												{blockDesc}
											</p>
										)}

										{hasItems && (
											<div className='overflow-x-auto rounded-xl border border-border bg-surface-hover/20'>
												<table className='w-full border-collapse text-left text-xs sm:text-sm'>
													<thead>
														<tr className='bg-surface-hover border-b border-border text-text-secondary uppercase text-[10px] font-black tracking-wider'>
															<th className='p-3 w-12 text-center'>STT</th>
															<th className='p-3 min-w-[150px]'>Tài nguyên</th>
															<th className='p-3 w-28'>Phân loại</th>
															<th className='p-3 min-w-[200px]'>Mô tả / Chi tiết</th>
														</tr>
													</thead>
													<tbody className='divide-y divide-border/60'>
														{block.items.map((it, itemIdx) => {
															const resInfo = resourceCache[`${it.type}_${it.id}`] || {};
															const name = tDynamic(resInfo, "name") || resInfo.cardName || resInfo.bossName || resInfo.adventureName || it.id;
															const avatar = resInfo.avatar || resInfo.assetAbsolutePath || resInfo.assetFullAbsolutePath || "";
															
															constNote = tDynamic(it, "note") || it.note;
															const defaultDesc = tDynamic(resInfo, "descriptionRaw") || tDynamic(resInfo, "description") || resInfo.description || "";
															const displayDesc =Note || defaultDesc;

															const typeLabels = {
																champion: "Tướng",
																boss: "Boss",
																item: "Vật Phẩm",
																relic: "Cổ Vật",
																power: "Sức Mạnh",
																rune: "Ngọc Cổ Ngữ",
																bonusStar: "Sao Tinh Tú",
																card: "Lá Bài"
															};

															const typeBadgeColors = {
																champion: "bg-orange-500/10 text-orange-500 border-orange-500/20",
																boss: "bg-red-500/10 text-red-500 border-red-500/20",
																item: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
																relic: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
																power: "bg-purple-500/10 text-purple-500 border-purple-500/20",
																rune: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
																bonusStar: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
																card: "bg-blue-500/10 text-blue-500 border-blue-500/20"
															};

															return (
																<tr key={itemIdx} className='hover:bg-surface-hover/30 transition-colors'>
																	<td className='p-3 text-center font-bold text-text-tertiary'>{itemIdx + 1}</td>
																	<td className='p-3 font-semibold text-text-primary'>
																		<div className='flex items-center gap-2.5'>
																			{avatar ? (
																				<img
																					src={avatar}
																					alt={name}
																					className='w-12 h-12 rounded-lg object-contain bg-black/10 border border-border shrink-0'
																				/>
																			) : (
																				<div className='w-12 h-12 rounded-lg bg-black/10 border border-border shrink-0 flex items-center justify-center text-[10px] text-text-tertiary font-bold uppercase'>
																					{it.type.slice(0, 2)}
																				</div>
																			)}
																			<span className='truncate max-w-[200px]' title={name}>{name}</span>
																		</div>
																	</td>
																	<td className='p-3'>
																		<span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded-lg border ${typeBadgeColors[it.type] || "bg-slate-500/10 text-slate-500 border-slate-500/20"}`}>
																			{typeLabels[it.type] || it.type}
																		</span>
																	</td>
																	<td className='p-3 text-text-secondary leading-relaxed text-xs sm:text-sm whitespace-pre-line'>
																		{displayDesc ? (
																			<MarkupRenderer text={displayDesc} className='text-xs sm:text-sm' />
																		) : (
																			<span className='italic text-text-tertiary/60'>Không có thông tin</span>
																		)}
																	</td>
																</tr>
															);
														})}
													</tbody>
												</table>
											</div>
										)}
									</section>
								);
							})
						)}

						{/* SUB-COMPONENTS SECTIONS */}
						<BossListSection
							resolvedBosses={resolvedBosses}
							adventure={adventure}
						/>

						<RequirementSection
							resolvedChampions={resolvedChampions}
							adventure={adventure}
						/>

						<RewardSection rewards={adventure.rewards} />


					</div>
				)}
			
		</div>
	);
}

export default memo(AdventureMapDetail);
