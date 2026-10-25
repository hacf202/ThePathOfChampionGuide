import React, { useState } from "react";

import { ShieldAlert, Eye, EyeOff } from "lucide-react";
import Button from "@/components/common/button";
import SafeImage from "@/components/common/SafeImage";
import MarkupRenderer from "@/components/common/MarkupRenderer";
import ResolvedPowerCard from "@/features/adventureMaps/components/resolvedPowerCard";
import { useTranslation } from "@/hooks/useTranslation";

const BossListSection = ({ resolvedBosses, adventure }) => {
	const { tUI, tDynamic } = useTranslation();
	const [isVisible, setIsVisible] = useState(true);

	if (!resolvedBosses || resolvedBosses.length === 0) return null;

	return (
		<section className='tactical-card clip-chamfer border border-[var(--tactical-card-border)] p-4 md:p-6 shadow-xl w-full'>
			<div className='flex justify-between items-center border-b border-[var(--tactical-stroke-color)] pb-3 mb-5'>
				<h2 className='text-xl font-display font-black text-rose-500 uppercase italic tracking-wide flex items-center gap-2'>
					<ShieldAlert size={20} />{" "}
					{tUI("adventureMap.bossList") || "Danh sách Boss"}
				</h2>
				<button
					type='button'
					onClick={() => setIsVisible(!isVisible)}
					className='inline-flex items-center gap-1.5 px-3 py-1.5 tactical-card border border-[var(--tactical-card-border)] hover:border-rose-500 text-xs font-mono-tech font-bold uppercase text-[var(--tactical-text-main)] hover:text-rose-400 transition-all clip-chamfer-sm'
				>
					{isVisible ? <EyeOff size={15} /> : <Eye size={15} />}
					<span>
						{isVisible
							? tUI("common.hide") || "Ẩn"
							: tUI("common.show") || "Hiện"}
					</span>
				</button>
			</div>

			{isVisible && (
				<div className='overflow-hidden'>
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
									className='flex flex-col sm:flex-row gap-4 tactical-box clip-chamfer-sm p-4 border border-[var(--tactical-card-border)] items-start shadow-sm'
								>
									<SafeImage
										src={boss.background || "/fallback-image.svg"}
										alt={tDynamic(boss, "bossName")}
										className='w-16 h-16 md:w-20 md:h-20 object-cover clip-chamfer-sm shadow-md border border-[var(--tactical-card-border)] bg-black/40 shrink-0'
									/>
									<div className='flex-1 space-y-3 w-full'>
										<h3 className='text-lg sm:text-xl font-display font-bold uppercase italic tracking-wide text-[var(--tactical-text-main)]'>
											{tDynamic(boss, "bossName")}
										</h3>

										{combinedPowers.length > 0 ? (
											<div className={`grid grid-cols-1 ${combinedPowers.length > 1 ? "sm:grid-cols-2" : ""} gap-3 mt-2`}>
												{combinedPowers.map((p, pIdx) => (
													<div key={pIdx} className='h-full'>
														<ResolvedPowerCard powerOrId={p} />
													</div>
												))}
											</div>
										) : (
											<p className='text-xs font-mono-tech text-[var(--tactical-text-dim)] italic'>
												{tUI("adventureMap.noSpecialPower") ||
													"Không có sức mạnh đặc biệt."}
											</p>
										)}

										{note && (
											<div className='mt-3 p-3.5 tactical-card border-l-4 border-[var(--tactical-accent-lime)] clip-chamfer-sm'>
												<div className='text-xs sm:text-sm text-[var(--tactical-text-main)] leading-relaxed whitespace-pre-line'>
													<span className='font-bold text-[var(--tactical-accent-lime-fg)] uppercase font-mono-tech text-xs tracking-wider mr-1.5'>
														{tUI("adventureMap.note") || "Lưu ý:"}
													</span>
													<MarkupRenderer 
														text={note}
														className="text-xs sm:text-sm text-[var(--tactical-text-main)] leading-relaxed inline"
													/>
												</div>
											</div>
										)}
									</div>
								</div>
							);
						})}
					</div>
				</div>
			)}
		</section>
	);
};

export default BossListSection;
