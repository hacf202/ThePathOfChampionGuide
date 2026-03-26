import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Eye, EyeOff } from "lucide-react";
import Button from "../common/button";
import SafeImage from "../common/SafeImage";
import { useTranslation } from "../../hooks/useTranslation";
import iconData from "../../assets/data/icon.json";

const RewardSection = ({ rewards }) => {
	const { tUI } = useTranslation();
	const [isVisible, setIsVisible] = useState(true);

	if (!rewards || rewards.length === 0) return null;

	const getRawIcon = itemName => {
		if (Array.isArray(iconData)) {
			const sortedIcons = [...iconData].sort(
				(a, b) => b.name.length - a.name.length,
			);
			const exactMatch = sortedIcons.find(
				item => item.name.toLowerCase() === itemName.toLowerCase(),
			);
			if (exactMatch) return exactMatch.image;
			const partialMatch = sortedIcons.find(item =>
				itemName.toLowerCase().includes(item.name.toLowerCase()),
			);
			if (partialMatch) return partialMatch.image;
		}
		return "/fallback-image.svg";
	};

	const parseRewardItem = itemName => {
		const KNOWN_REGIONS = [
			"Demacia",
			"Noxus",
			"Freljord",
			"Piltover & Zaun",
			"Ionia",
			"Shurima",
			"Targon",
			"Quần Đảo Bóng Đêm",
			"Thành Phố Bandle",
			"Bilgewater",
			"Runeterra",
			"Hoa Linh Lục Địa",
		];

		let baseName = itemName;
		let detectedRegion = null;

		for (const region of KNOWN_REGIONS) {
			if (itemName.toLowerCase().includes(region.toLowerCase())) {
				detectedRegion = region;
				baseName = itemName.replace(new RegExp(region, "i"), "").trim();
				break;
			}
		}

		const mainIcon =
			getRawIcon(baseName) !== "/fallback-image.svg"
				? getRawIcon(baseName)
				: getRawIcon(itemName);

		const overlayIcon = detectedRegion ? getRawIcon(detectedRegion) : null;

		return {
			mainIcon,
			overlayIcon,
			originalName: itemName,
		};
	};

	return (
		<section className='bg-surface-bg border border-border rounded-xl p-2 md:p-4 shadow-sm w-full'>
			<div className='flex justify-between items-center border-b border-border pb-2 mb-4'>
				<h2 className='text-xl font-bold text-yellow-500 font-primary uppercase flex items-center gap-2'>
					<Gift size={20} />{" "}
					{tUI("adventureMap.rewardMilestone") || "Mốc Thưởng"}
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
						<div className='rounded-lg overflow-hidden border border-border shadow-sm'>
							<div className='overflow-x-auto'>
								<table className='w-full text-left border-collapse min-w-[600px]'>
									<thead>
										<tr className='bg-surface-hover/50 text-text-secondary text-xs sm:text-sm border-b border-border'>
											<th className='py-3 px-3 sm:px-4 w-1/4 font-bold border-r border-border/50 uppercase tracking-wide'>
												{tUI("adventureMap.reward") || "Phần thưởng"}
											</th>
											<th className='py-3 px-3 sm:px-4 font-bold uppercase tracking-wide'>
												{tUI("adventureMap.rewardList") ||
													"Danh sách Phần Thưởng"}
											</th>
										</tr>
									</thead>
									<tbody className='divide-y divide-border'>
										{rewards.map((rewardPacket, idx) => (
											<tr
												key={idx}
												className='hover:bg-surface-hover/40 transition-colors'
											>
												<td className='py-3 px-3 sm:px-4 align-middle border-r border-border/50 text-xs sm:text-sm font-semibold text-text-primary'>
													{tUI("adventureMap.milestone") || "Mốc thưởng"}{" "}
													{idx + 1}
												</td>
												<td className='py-3 px-3 sm:px-4 align-middle'>
													<div className='flex flex-wrap gap-2 sm:gap-3'>
														{rewardPacket.items?.map((item, i) => {
															const parsedReward = parseRewardItem(item.name);

															return (
																<div
																	key={i}
																	className='flex items-center gap-2 bg-surface-bg px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-border/80 shadow-sm'
																>
																	<div className='relative shrink-0'>
																		<SafeImage
																			src={parsedReward.mainIcon}
																			alt={item.name}
																			className='w-6 h-6 sm:w-8 sm:h-8 object-contain'
																		/>
																		{parsedReward.overlayIcon && (
																			<div className='absolute -bottom-1.5 -right-1.5 bg-surface-bg rounded-full p-0.5 border border-border shadow-sm'>
																				<img
																					src={parsedReward.overlayIcon}
																					alt='region-overlay'
																					className='w-3 h-3 sm:w-4 sm:h-4 object-contain rounded-full'
																				/>
																			</div>
																		)}
																	</div>

																	<span className='text-xs sm:text-sm font-semibold text-text-primary whitespace-nowrap'>
																		{item.name}
																	</span>
																	<span className='text-[10px] sm:text-xs font-bold text-text-primary px-1.5 sm:px-2 py-0.5 rounded-full'>
																		x{item.count?.toLocaleString() || 1}
																	</span>
																</div>
															);
														})}
													</div>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</section>
	);
};

export default RewardSection;
