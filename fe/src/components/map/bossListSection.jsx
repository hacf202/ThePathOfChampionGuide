import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Eye, EyeOff } from "lucide-react";
import Button from "../common/button";
import SafeImage from "../common/SafeImage";
import MarkupRenderer from "../common/MarkupRenderer";
import ResolvedPowerCard from "./resolvedPowerCard";
import { useTranslation } from "../../hooks/useTranslation";

const BossListSection = ({ resolvedBosses, adventure }) => {
	const { tUI, tDynamic } = useTranslation();
	const [isVisible, setIsVisible] = useState(true);

	if (!resolvedBosses || resolvedBosses.length === 0) return null;

	return (
		<section className='bg-surface-bg border border-border rounded-xl p-2 md:p-4 shadow-sm w-full'>
			<div className='flex justify-between items-center border-b border-border pb-2 mb-4'>
				<h2 className='text-xl font-bold text-red-500 font-primary uppercase flex items-center gap-2'>
					<ShieldAlert size={20} />{" "}
					{tUI("adventureMap.bossList") || "Danh sách Boss"}
				</h2>
				<Button
					type='button'
					size='sm'
					variant='outline'
					onClick={() => setIsVisible(!isVisible)}
					iconLeft={isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
				>
					{isVisible
						? tUI("common.hide") || "Ẩn"
						: tUI("common.show") || "Hiện"}
				</Button>
			</div>

			<AnimatePresence>
				{isVisible && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						className='overflow-hidden'
					>
						<div className='grid grid-cols-1 gap-6 pb-2'>
							{resolvedBosses.map((boss, idx) => {
								const originalBossData =
									adventure.Bosses?.find(b => b.bossID === boss.bossID) || {};
								const mapBonusPower = originalBossData.mapBonusPower || [];
								const note = originalBossData.note || boss.note;

								const bossPowers = boss.resolvedPowers
									? boss.resolvedPowers
									: boss.resolvedPower
										? [boss.resolvedPower]
										: [];

								const combinedPowers = [...bossPowers, ...mapBonusPower];

								return (
									<div
										key={idx}
										className='flex flex-col sm:flex-row gap-4 bg-surface-hover/30 rounded-lg p-3 md:p-4 border border-border items-start shadow-sm'
									>
										<SafeImage
											src={boss.background || "/fallback-image.svg"}
											alt={tDynamic(boss, "bossName")}
											className='w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg shadow-sm border border-border bg-surface-bg shrink-0'
										/>
										<div className='flex-1 space-y-3 w-full'>
											<h3 className='text-lg font-bold text-text-primary'>
												{tDynamic(boss, "bossName")}
											</h3>

											{combinedPowers.length > 0 ? (
												<div className='grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2'>
													{combinedPowers.map((p, pIdx) => (
														<div key={pIdx} className='h-full'>
															<ResolvedPowerCard powerOrId={p} />
														</div>
													))}
												</div>
											) : (
												<p className='text-sm text-text-secondary italic'>
													{tUI("adventureMap.noSpecialPower") ||
														"Không có sức mạnh đặc biệt."}
												</p>
											)}

											{note && (
												<div className='mt-3 p-3 bg-surface-bg rounded-md flex items-start gap-2.5 border border-border/50'>
													<div className='text-sm text-text-secondary leading-relaxed whitespace-pre-line'>
														<span className='font-bold text-primary-500 mt-1 uppercase text-xs tracking-wider'>
															{tUI("adventureMap.note") || "Lưu ý:"}{" "}
													</span>
													<MarkupRenderer 
														text={note}
														className="text-sm text-text-secondary leading-relaxed inline"
													/>
												</div>
												</div>
											)}
										</div>
									</div>
								);
							})}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</section>
	);
};

export default BossListSection;
