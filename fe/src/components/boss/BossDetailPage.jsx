// src/components/boss/BossDetailPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Swords, Map as MapIcon, Info, ShieldAlert, Sparkles } from "lucide-react";

import { useTranslation } from "../../hooks/useTranslation";
import { api } from "../../context/services/apiHelper";
import PageTitle from "../common/pageTitle";
import Button from "../common/button";
import SafeImage from "../common/SafeImage";
import MarkupRenderer from "../common/MarkupRenderer";
import ResolvedPowerCard from "../map/resolvedPowerCard";

const BossDetailSkeleton = () => (
	<div className='max-w-[1100px] mx-auto p-4 md:p-6 animate-pulse space-y-10'>
		{/* Breadcrumb Skeleton */}
		<div className='flex justify-between items-center mb-6'>
			<div className='h-8 w-32 bg-gray-700/30 rounded-lg' />
			<div className='h-6 w-20 bg-gray-700/30 rounded-full' />
		</div>
		
		{/* Hero Skeleton */}
		<div className='relative h-[350px] md:h-[480px] bg-gray-700/20 rounded-[40px] border border-border/40' />
		
		<div className='grid grid-cols-1 lg:grid-cols-12 gap-10'>
			<div className='lg:col-span-8 space-y-10'>
				{/* Section 1 */}
				<div className='h-[300px] bg-gray-700/20 rounded-[32px] border border-border/40' />
				{/* Section 2 */}
				<div className='h-[200px] bg-gray-700/20 rounded-[32px] border border-border/40' />
			</div>
			<div className='lg:col-span-4'>
				{/* Sidebar */}
				<div className='h-64 bg-gray-700/20 rounded-[32px] border border-border/40' />
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
		<div className='animate-fadeIn font-secondary max-w-[1100px] mx-auto p-0 sm:p-6 pb-20'>
			<PageTitle 
				title={`${bossName} - ${tUI("bossDetail.pageTitle") || "Boss Detail"}`} 
				description={`${tUI("bossDetail.pageDescriptionPrefix") || "Chi tiết sức mạnh và mẹo đối đầu với Boss"} ${bossName}`}
			/>

			<div className='mb-4 flex items-center justify-between px-2 sm:px-0'>
				<Button variant='ghost' onClick={() => navigate(-1)} className='group flex items-center gap-2 text-text-tertiary hover:text-primary-500 transition-colors'>
					<ChevronLeft size={20} className='group-hover:-translate-x-1 transition-transform' /> 
					<span className='font-bold uppercase tracking-widest text-xs'>{tUI("common.back") || "Quay lại"}</span>
				</Button>
			</div>

			<div className='flex flex-col space-y-3 sm:space-y-10'>
				{/* HERO SECTION - COMPACT DESIGN */}
				<section className='relative sm:rounded-[40px] overflow-hidden border-b sm:border border-border/60 bg-surface-bg shadow-2xl group min-h-[250px] md:min-h-[380px] flex items-end'>
					{/* Gradient Overlays */}
					<div className='absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent z-10' />
					<div className='absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent z-10' />
					
					{/* Background Image */}
					<div className='absolute inset-0 w-full h-full overflow-hidden'>
						<SafeImage 
							src={boss.background || bossImage} 
							className='w-full h-full object-cover transition-transform duration-[3000ms] group-hover:scale-110 opacity-80 group-hover:opacity-100'
						/>
					</div>
					
					{/* Text Content */}
					<div className='relative w-full p-4 md:p-14 z-20'>
						<motion.div 
							initial={{ opacity: 0, x: -30 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.8, ease: "easeOut" }}
							className='flex flex-col gap-3'
						>
							<div className='space-y-1'>
								<motion.h1 
									initial={{ opacity: 0, filter: "blur(10px)" }}
									animate={{ opacity: 1, filter: "blur(0px)" }}
									transition={{ delay: 0.2, duration: 1 }}
									className='text-3xl md:text-7xl font-primary font-black text-white uppercase italic tracking-tighter drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]'
								>
									{bossName}
								</motion.h1>
								
								<div className='flex items-center gap-4 text-white/50 text-[10px] sm:text-xs font-bold uppercase tracking-widest'>
									<div className='flex items-center gap-1.5'>
										<Swords size={12} className='text-red-500' />
										<span>Boss Encounter</span>
									</div>
									<div className='w-1 h-1 bg-white/20 rounded-full' />
									<span>Path of Champions</span>
								</div>
							</div>
						</motion.div>
					</div>
				</section>

				<div className='grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-10'>
					{/* MAIN CONTENT AREA */}
					<div className='lg:col-span-8 space-y-3 sm:space-y-10'>
						{/* POWERS SECTION */}
						<section className='bg-surface-bg sm:border border-border/40 sm:rounded-[32px] p-2 sm:p-8 shadow-sm relative group overflow-hidden'>
							<div className='absolute top-0 left-0 w-1 h-full bg-primary-500/20 group-hover:bg-primary-500 transition-colors' />
							
							<div className='flex items-center justify-between mb-3 sm:mb-8'>
								<h2 className='text-xl sm:text-2xl font-black text-text-primary font-primary uppercase'>
									{tUI("bossDetail.powers") || "Sức mạnh"}
								</h2>
								<div className='h-[1px] flex-1 bg-border/40 ml-6 hidden md:block' />
							</div>
							
							{powers.length > 0 ? (
								<motion.div 
									initial={{ opacity: 0 }}
									whileInView={{ opacity: 1 }}
									className='flex flex-col gap-2 sm:gap-6'
								>
									{powers.map((power, idx) => (
										<div key={idx}>
											<ResolvedPowerCard powerOrId={power} />
										</div>
									))}
								</motion.div>
							) : (
								<div className='flex flex-col items-center justify-center py-10 text-center bg-surface-bg-alt/20 rounded-3xl border border-dashed border-border/60'>
									<p className='text-text-tertiary italic text-sm font-medium'>
										{tUI("bossDetail.noSpecialPower") || "Không có sức mạnh đặc biệt."}
									</p>
								</div>
							)}
						</section>

						{/* ENCOUNTER TIPS / NOTES (From Boss Object + Adventures) */}
						{(boss.note || mapSpecificData.some(m => m.note)) && (
							<section className='bg-surface-bg sm:border border-border/40 sm:rounded-[32px] p-2 sm:p-8 shadow-sm relative group overflow-hidden'>
								<div className='absolute top-0 left-0 w-1 h-full bg-emerald-500/20 group-hover:bg-emerald-500 transition-colors' />
								
								<h2 className='text-xl sm:text-2xl font-black text-text-primary font-primary uppercase mb-3 sm:mb-8'>
									{tUI("bossDetail.note") || "Mẹo đối đầu"}
								</h2>
								
								<div className='space-y-3 sm:space-y-6'>
									{boss.note && (
										<div className='bg-emerald-500/5 border border-emerald-500/10 p-3 sm:p-6 rounded-[16px] sm:rounded-[24px] shadow-inner'>
											<MarkupRenderer 
												text={boss.note} 
												className='text-text-primary leading-relaxed text-sm sm:text-base' 
											/>
										</div>
									)}

									{mapSpecificData.map((map, idx) => map.note && (
										<div key={idx} className='relative pl-3 sm:pl-6 border-l-2 border-border/40'>
											<h4 className='text-[10px] sm:text-xs font-black uppercase tracking-widest text-emerald-600 mb-1 sm:mb-2'>
												{tUI("bossDetail.onMap") || "Trên bản đồ"}: {map.adventureName}
											</h4>
											<div className='bg-surface-bg-alt/30 p-2 sm:p-4 rounded-xl sm:rounded-2xl border border-border/30'>
												<MarkupRenderer 
													text={map.note} 
													className='text-[13px] sm:text-sm text-text-secondary italic' 
												/>
												{map.bonusPowers.length > 0 && (
													<div className='mt-2 sm:mt-3 flex flex-wrap gap-2 items-center'>
														<span className='text-[9px] font-bold text-text-tertiary uppercase'>{tUI("bossDetail.bonusPowers") || "Sức mạnh bổ trợ"}:</span>
														<div className='flex flex-col w-full gap-2'>
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
					<aside className='lg:col-span-4 space-y-3 sm:space-y-8'>
						<div className='sticky top-24 space-y-3 sm:space-y-8'>
							{/* APPEARS AT SECTION */}
							<section className='bg-surface-bg sm:border border-border/40 sm:rounded-[32px] p-2 sm:p-8 shadow-lg'>
								<h2 className='text-lg sm:text-xl font-black text-text-primary font-primary uppercase mb-3 sm:mb-8'>
									{tUI("bossDetail.appearsAt") || "Xuất hiện tại"}
								</h2>
								
								{adventures.length > 0 ? (
									<div className='space-y-2 sm:space-y-4'>
										{adventures.map((adv) => (
											<Link 
												key={adv.adventureID}
												to={`/map/${adv.adventureID}`}
												className='group flex flex-col gap-2 p-2 sm:p-5 rounded-xl sm:rounded-2xl bg-surface-bg-alt/40 border border-border/60 hover:border-pink-500/50 hover:bg-pink-500/5 transition-all duration-300'
											>
												<div className='flex items-center gap-2 sm:gap-4'>
													<div className='w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl overflow-hidden shrink-0 border border-border shadow-md group-hover:shadow-pink-500/10'>
														<SafeImage src={adv.assetAbsolutePath || adv.background} className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500' />
													</div>
													<div className='flex-1 min-w-0'>
														<h4 className='font-black text-text-primary text-[11px] sm:text-sm truncate uppercase tracking-tight group-hover:text-pink-500 transition-colors'>
															{tDynamic(adv, "adventureName")}
														</h4>
														<div className='mt-0.5 flex items-center gap-2'>
															<div className='flex items-center px-1.5 py-0.5 bg-pink-500/10 text-pink-500 rounded text-[8px] sm:text-[9px] font-black uppercase tracking-widest border border-pink-500/20'>
																{tUI("bossDetail.difficulty", { count: adv.difficulty }) || `${adv.difficulty} Stars`}
															</div>
														</div>
													</div>
												</div>
											</Link>
										))}
									</div>
								) : (
									<div className='text-center py-6 text-text-tertiary italic text-xs bg-surface-bg-alt/20 rounded-2xl border border-dashed border-border/60'>
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
