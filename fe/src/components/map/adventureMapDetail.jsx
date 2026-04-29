import React, { memo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
	ChevronLeft,
	Star,
	Swords,
	ShieldAlert,
	Map as MapIcon,
	Eye,
	EyeOff,
} from "lucide-react";

import { useTranslation } from "../../hooks/useTranslation";
import { useMapDetailData } from "../../hooks/useMapDetailData";
import PageTitle from "../common/pageTitle";
import Button from "../common/button";

// Import các sub-components đã được tách
import MapDetailSkeleton from "./mapDetailSkeleton";
import AdventureMapVisualizer from "./adventureMapVisualizer";
import ResolvedPowerCard from "./resolvedPowerCard";
import BossListSection from "./bossListSection";
import RequirementSection from "./requirementSection";
import RewardSection from "./rewardSection";

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
		<div className='animate-fadeIn font-secondary max-w-[1000px] mx-auto p-2 md:p-6 pb-20'>
			<PageTitle
				title={
					adventure
						? tDynamic(adventure, "adventureName")
						: tUI("adventureMap.detailTitle") || "Chi tiết bản đồ"
				}
				description={`${tUI("adventureMap.detailDesc") || "Hướng dẫn chi tiết bản đồ"} ${adventure?.adventureName || ""}`}
				keywords={adventure ? `${tDynamic(adventure, "adventureName")}, adventure, LoR adventure, PoC map, ${adventure.difficulty} stars` : ""}
			/>
			<Button variant='outline' onClick={() => navigate(-1)} className='mb-4'>
				<ChevronLeft size={18} /> {tUI("common.back") || "Quay lại"}
			</Button>

			<AnimatePresence mode='wait'>
				{loading ? (
					<motion.div
						key='skeleton'
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className='w-full'
					>
						<MapDetailSkeleton />
					</motion.div>
				) : (
					<motion.div
						key='content'
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						className='flex flex-col space-y-8 w-full'
					>
						{/* HERO SECTION */}
						<section className='relative rounded-2xl overflow-hidden border border-border shadow-md bg-surface-bg w-full'>
							<div className='absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent z-10'></div>
							<img
								src={
									adventure.assetAbsolutePath ||
									adventure.background ||
									"/images/placeholder-bg.jpg"
								}
								alt={tDynamic(adventure, "adventureName")}
								className='w-full h-[250px] md:h-[350px] object-cover opacity-80'
							/>
							<div className='absolute bottom-0 left-0 w-full p-2 md:p-8 z-20 flex flex-col md:flex-row justify-between items-end gap-4'>
								<div>
									<div className='flex items-center gap-2 mb-2'>
										<span className='bg-primary-500/20 text-yellow-400 border font-bold px-3 py-1 rounded-full text-sm flex items-center gap-1'>
											{adventure.difficulty}{" "}
											<Star size={14} className='fill-current' />
										</span>
										<span className='bg-primary-500/20 text-white border border-primary-500/50 px-3 py-1 rounded-full text-sm font-semibold'>
											{tDynamic(adventure, "typeAdventure")}
										</span>
									</div>
									<h1 className='text-3xl md:text-5xl font-primary font-bold text-white uppercase tracking-wide'>
										{tDynamic(adventure, "adventureName")}
									</h1>
								</div>
								<div className='bg-emerald-500/20 border border-emerald-500/50 text-white px-4 py-2 rounded-lg flex flex-col items-center'>
									<span className='text-xs uppercase font-bold tracking-wider'>
										{tUI("adventureMap.championXp") || "Champion XP"}
									</span>
									<span className='text-xl font-black'>
										{adventure.championXP?.toLocaleString() || 0}
									</span>
								</div>
							</div>
						</section>

						{/* MAP VISUALIZER SECTION */}
						{adventure.nodes && adventure.nodes.length > 0 && (
							<section className='bg-surface-bg border border-border rounded-xl p-2 md:p-4 shadow-sm w-full'>
								<div className='flex justify-between items-center border-b border-border pb-2'>
									<h2 className='text-xl font-bold text-pink-500 font-primary uppercase flex items-center gap-2'>
										<MapIcon size={20} />{" "}
										{tUI("adventureMap.adventureMapTitle") ||
											"Bản Đồ Phiêu Lưu"}
									</h2>
									<Button
										type='button'
										size='sm'
										variant='outline'
										onClick={() => setIsMapVisible(!isMapVisible)}
										iconLeft={
											isMapVisible ? <EyeOff size={16} /> : <Eye size={16} />
										}
									>
										{isMapVisible
											? tUI("common.hide") || "Ẩn"
											: tUI("common.show") || "Hiện"}
									</Button>
								</div>

								<AnimatePresence>
									{isMapVisible && (
										<motion.div
											initial={{ height: 0, opacity: 0 }}
											animate={{ height: "auto", opacity: 1 }}
											exit={{ height: 0, opacity: 0 }}
											className='overflow-hidden'
										>
											<div className='mt-4'>
												<AdventureMapVisualizer
													nodes={adventure.nodes}
													background={adventure.background}
													resolvedBosses={resolvedBosses}
												/>
											</div>
										</motion.div>
									)}
								</AnimatePresence>
							</section>
						)}

						{/* SPECIAL RULES SECTION */}
						{resolvedRules.length > 0 && (
							<section className='bg-surface-bg border border-border rounded-xl p-2 md:p-4 shadow-sm w-full'>
								<h2 className='text-xl font-bold text-primary-500 font-primary uppercase mb-4 flex items-center gap-2 border-b border-border pb-2'>
									<Swords size={20} />{" "}
									{tUI("adventureMap.specialRules") || "Luật Chơi Đặc Biệt"}
								</h2>
								<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
									{resolvedRules.map((power, idx) => (
										<ResolvedPowerCard key={idx} powerOrId={power} />
									))}
								</div>
							</section>
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


					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

export default memo(AdventureMapDetail);
