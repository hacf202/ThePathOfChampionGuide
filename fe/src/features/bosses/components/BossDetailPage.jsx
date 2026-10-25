// src/components/boss/BossDetailPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

import { ChevronLeft, Swords, Map as MapIcon, Info, ShieldAlert, Sparkles } from "lucide-react";

import { useTranslation } from "@/hooks/useTranslation";
import { api } from "@/context/services/apiHelper";
import PageTitle from "@/components/common/pageTitle";
import Button from "@/components/common/button";
import SafeImage from "@/components/common/SafeImage";
import MarkupRenderer from "@/components/common/MarkupRenderer";
import ResolvedPowerCard from "@/features/adventureMaps/components/resolvedPowerCard";

const BossDetailSkeleton = () => (
	<div className='max-w-[1200px] mx-auto p-2 sm:p-6 animate-pulse space-y-8 font-primary'>
		{/* Top bar */}
		<div className='h-9 w-28 bg-white/10 clip-chamfer-sm border border-white/10' />
		
		{/* Hero Skeleton */}
		<div className='relative h-[320px] md:h-[420px] bg-white/5 clip-chamfer border border-white/10' />
		
		<div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
			<div className='lg:col-span-8 space-y-6'>
				<div className='h-[280px] bg-white/5 clip-chamfer border border-white/10' />
				<div className='h-[200px] bg-white/5 clip-chamfer border border-white/10' />
			</div>
			<div className='lg:col-span-4'>
				<div className='h-64 bg-white/5 clip-chamfer border border-white/10' />
			</div>
		</div>
	</div>
);

function BossDetailPage() {
	const { bossID } = useParams();
	const navigate = useNavigate();
	const { tUI, tDynamic } = useTranslation();

	const [boss, setBoss] = useState(null);
	const [adventures, setAdventures] = useState([]);
	const [mapSpecificData, setMapSpecificData] = useState([]); 
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const fetchData = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);

			// 1. Fetch Boss Detail
			const bossItems = await api.get(`/bosses?limit=-1`);
			const foundBoss = (bossItems.items || []).find(b => b.bossID === bossID);
			
			// Nếu không tìm thấy trong list, thử fetch trực tiếp
			if (!foundBoss) {
				const directBoss = await api.get(`/bosses/${bossID}`);
				setBoss(directBoss);
			} else {
				setBoss(foundBoss);
			}

			// 2. Fetch all adventures to search for map-specific data
			const advResponse = await api.get("/adventures?limit=-1");
			const allAdventures = advResponse.items || [];
			
			const mapData = [];
			const relatedAdventures = allAdventures.filter(adv => {
				const bossConfig = adv.Bosses?.find(b => b.bossID === bossID);
				if (bossConfig) {
					mapData.push({
						adventureID: adv.adventureID,
						adventureName: tDynamic(adv, "adventureName"),
						note: bossConfig.note,
						bonusPowers: bossConfig.mapBonusPower || []
					});
					return true;
				}
				return false;
			});

			setAdventures(relatedAdventures);
			setMapSpecificData(mapData);

		} catch (err) {
			console.error("Error fetching boss detail:", err);
			setError(err.message || "Không thể tải thông tin Boss.");
		} finally {
			setLoading(false);
		}
	}, [bossID, tDynamic]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	if (loading) return <BossDetailSkeleton />;

	if (error || !boss) {
		return (
			<div className='flex flex-col items-center justify-center py-20 text-center animate-fadeIn'>
				<ShieldAlert size={64} className='text-red-500/30 mb-6' />
				<p className='text-xl text-text-primary mb-8 font-bold'>{error || "Không tìm thấy dữ liệu Boss."}</p>
				<Button onClick={() => navigate("/bosses")} variant='primary' className='px-8 shadow-xl shadow-primary-500/20'>
					<ChevronLeft size={18} /> Quay lại danh sách
				</Button>
			</div>
		);
	}

	const bossName = tDynamic(boss, "bossName") || boss.bossName;
	const bossImage = boss.image || boss.background || "/fallback-image.svg";
	const powers = boss.resolvedPowers || (boss.resolvedPower ? [boss.resolvedPower] : []);

	return (
		<div className='animate-fadeIn font-primary selection:bg-rose-500 selection:text-white max-w-[1200px] mx-auto p-2 sm:p-6 pb-20'>
			<PageTitle 
				title={bossName ? `${bossName} | ${tUI("bossDetail.pageTitle") || "Boss Detail"}` : (tUI("bossDetail.pageTitle") || "Boss Detail")} 
				description={bossName ? `Hướng dẫn chi tiết cách đánh boss ${bossName} trong Con Đường Anh Hùng (PoC). Các bài (cards) và sức mạnh (powers) của ${bossName} là gì?` : (tUI("bossDetail.pageDescriptionPrefix") || "Chi tiết sức mạnh và mẹo đối đầu với Boss")}
				keywords={bossName ? `${bossName}, cách đánh boss ${bossName}, đánh bại ${bossName} poc, ${bossName} poc guide, boss guide lor pve` : ""}
			/>

			<div className='mb-4'>
				<button
					type="button"
					onClick={() => navigate(-1)}
					className='inline-flex items-center gap-2 px-4 py-2 tactical-card border border-[var(--tactical-card-border)] hover:border-rose-500 text-xs font-mono-tech font-bold uppercase text-[var(--tactical-text-main)] hover:text-rose-400 transition-all clip-chamfer-sm shadow-sm group'
				>
					<ChevronLeft size={16} className='group-hover:-translate-x-0.5 transition-transform' />
					<span>{tUI("common.back") || "Quay lại"}</span>
				</button>
			</div>

			<div className='flex flex-col space-y-6 sm:space-y-8'>
				{/* HERO SECTION - TACTICAL ENCOUNTER BANNER */}
				<section className='relative clip-chamfer overflow-hidden border-2 border-[var(--tactical-section-border)] tactical-panel shadow-2xl group min-h-[260px] md:min-h-[380px] flex items-end'>
					{/* Gradient Overlays */}
					<div className='absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent z-10' />
					<div className='absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent z-10' />
					
					{/* Background Image */}
					<div className='absolute inset-0 w-full h-full overflow-hidden'>
						<SafeImage 
							src={boss.background || bossImage} 
							className='w-full h-full object-cover transition-transform duration-[3000ms] group-hover:scale-105 opacity-80 group-hover:opacity-100'
						/>
					</div>

					{/* Corner Cyber Notches */}
					<div className="absolute top-0 right-0 w-8 h-8 pointer-events-none border-t-2 border-r-2 border-rose-500/60 z-20" />
					<div className="absolute bottom-0 left-0 w-8 h-8 pointer-events-none border-b-2 border-l-2 border-rose-500/40 z-20" />
					
					{/* Text Content */}
					<div className='relative w-full p-4 md:p-10 z-20'>
						<div className='flex flex-col gap-2'>
							<div className='flex items-center gap-2 mb-1'>
								<div className='flex items-center gap-1.5 px-3 py-1 bg-black/85 border border-rose-500/50 clip-chamfer-sm text-[11px] font-mono-tech uppercase font-bold text-rose-400 shadow-md'>
									<Swords size={12} className='text-rose-500' />
									<span>Boss Encounter</span>
								</div>
								<div className='px-2.5 py-1 bg-black/70 border border-white/15 clip-chamfer-sm text-[11px] font-mono-tech uppercase font-bold text-white/70'>
									Path of Champions
								</div>
							</div>

							<h1 className='text-3xl md:text-6xl font-display font-black text-white uppercase italic tracking-wide drop-shadow-lg leading-none'>
								{bossName}
							</h1>
						</div>
					</div>
				</section>

				<div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
					{/* MAIN CONTENT AREA */}
					<div className='lg:col-span-8 space-y-6'>
						{/* POWERS SECTION */}
						<section className='tactical-card clip-chamfer border border-[var(--tactical-card-border)] p-4 sm:p-6 shadow-xl relative overflow-hidden'>
							<div className='absolute top-0 left-0 w-1.5 h-full bg-rose-500' />
							
							<div className='flex items-center justify-between mb-4 pb-3 border-b border-[var(--tactical-stroke-color)]'>
								<h2 className='text-xl sm:text-2xl font-display font-black text-[var(--tactical-text-main)] uppercase italic tracking-wide flex items-center gap-2'>
									<Sparkles size={18} className='text-rose-500' />
									{tUI("bossDetail.powers") || "Sức mạnh"}
								</h2>
							</div>
							
							{powers.length > 0 ? (
								<div className='flex flex-col gap-4'>
									{powers.map((power, idx) => (
										<div key={idx}>
											<ResolvedPowerCard powerOrId={power} />
										</div>
									))}
								</div>
							) : (
								<div className='flex flex-col items-center justify-center py-8 text-center tactical-box clip-chamfer-sm border border-dashed border-[var(--tactical-card-border)]'>
									<p className='text-[var(--tactical-text-dim)] italic text-xs font-mono-tech'>
										{tUI("bossDetail.noSpecialPower") || "Không có sức mạnh đặc biệt."}
									</p>
								</div>
							)}
						</section>

						{/* ENCOUNTER TIPS / NOTES (From Boss Object + Adventures) */}
						{(boss.note || mapSpecificData.some(m => m.note)) && (
							<section className='tactical-card clip-chamfer border border-[var(--tactical-card-border)] p-4 sm:p-6 shadow-xl relative overflow-hidden'>
								<div className='absolute top-0 left-0 w-1.5 h-full bg-emerald-400' />
								
								<h2 className='text-xl sm:text-2xl font-display font-black text-[var(--tactical-text-main)] uppercase italic tracking-wide mb-4 pb-3 border-b border-[var(--tactical-stroke-color)]'>
									{tUI("bossDetail.note") || "Mẹo đối đầu"}
								</h2>
								
								<div className='space-y-4'>
									{boss.note && (
										<div className='tactical-card border-l-4 border-emerald-400 clip-chamfer-sm p-4 bg-[var(--tactical-card-bg)] shadow-inner'>
											<MarkupRenderer 
												text={boss.note} 
												className='text-[var(--tactical-text-main)] leading-relaxed text-sm sm:text-base font-primary' 
											/>
										</div>
									)}

									{mapSpecificData.map((map, idx) => map.note && (
										<div key={idx} className='relative pl-3 sm:pl-4 border-l-2 border-[var(--tactical-card-border)]'>
											<h4 className='text-xs font-mono-tech font-bold uppercase tracking-wider text-emerald-400 mb-2'>
												{tUI("bossDetail.onMap") || "Trên bản đồ"}: {map.adventureName}
											</h4>
											<div className='tactical-box p-3.5 clip-chamfer-sm border border-[var(--tactical-card-border)]'>
												<MarkupRenderer 
													text={map.note} 
													className='text-xs sm:text-sm text-[var(--tactical-text-sub)] italic font-primary' 
												/>
												{map.bonusPowers.length > 0 && (
													<div className='mt-3 flex flex-wrap gap-2 items-center border-t border-[var(--tactical-stroke-color)] pt-3'>
														<span className='text-[10px] font-mono-tech uppercase font-bold text-[var(--tactical-text-dim)]'>{tUI("bossDetail.bonusPowers") || "Sức mạnh bổ trợ"}:</span>
														<div className='flex flex-col w-full gap-2 mt-1'>
															{map.bonusPowers.map((pId) => (
																<ResolvedPowerCard key={pId} powerOrId={pId} />
															))}
														</div>
													</div>
												)}
											</div>
										</div>
									))}
								</div>
							</section>
						)}
					</div>

					{/* SIDEBAR AREA */}
					<aside className='lg:col-span-4 space-y-6'>
						<div className='sticky top-20 space-y-6'>
							{/* APPEARS AT SECTION */}
							<section className='tactical-card clip-chamfer border border-[var(--tactical-card-border)] p-4 sm:p-6 shadow-xl'>
								<h2 className='text-lg font-display font-black text-[var(--tactical-text-main)] uppercase italic tracking-wide mb-4 pb-3 border-b border-[var(--tactical-stroke-color)]'>
									{tUI("bossDetail.appearsAt") || "Xuất hiện tại"}
								</h2>
								
								{adventures.length > 0 ? (
									<div className='space-y-3'>
										{adventures.map((adv) => (
											<Link 
												key={adv.adventureID}
												to={`/map/${adv.adventureID}`}
												className='group flex flex-col gap-2 p-3 clip-chamfer-sm tactical-box border border-[var(--tactical-card-border)] hover:border-rose-500 transition-all duration-300'
											>
												<div className='flex items-center gap-3'>
													<div className='w-12 h-12 clip-chamfer-sm overflow-hidden shrink-0 border border-[var(--tactical-card-border)] bg-black/40 shadow-md group-hover:border-rose-500 transition-colors'>
														<SafeImage src={adv.assetAbsolutePath || adv.background} className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500' />
													</div>
													<div className='flex-1 min-w-0'>
														<h4 className='font-display font-bold text-xs sm:text-sm truncate uppercase italic tracking-wide text-[var(--tactical-text-main)] group-hover:text-rose-400 transition-colors'>
															{tDynamic(adv, "adventureName")}
														</h4>
														<div className='mt-1 flex items-center gap-2'>
															<div className='flex items-center px-2 py-0.5 bg-black/85 text-amber-400 clip-chamfer-sm text-[10px] font-mono-tech font-bold uppercase tracking-wider border border-amber-400/40'>
																{tUI("bossDetail.difficulty", { count: adv.difficulty }) || `${adv.difficulty} Stars`}
															</div>
														</div>
													</div>
												</div>
											</Link>
										))}
									</div>
								) : (
									<div className='text-center py-6 text-[var(--tactical-text-dim)] italic text-xs font-mono-tech tactical-box clip-chamfer-sm border border-dashed border-[var(--tactical-card-border)]'>
										{tUI("bossDetail.noMapsFound") || "Không tìm thấy bản đồ."}
									</div>
								)}
							</section>
						</div>
					</aside>
				</div>
			</div>
		</div>
	);
}

export default BossDetailPage;
