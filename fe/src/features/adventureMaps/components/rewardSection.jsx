import React, { useState } from "react";
// eslint-disable-next-line no-unused-vars

import { Gift, Eye, EyeOff } from "lucide-react";
import Button from "@/components/common/button";
import SafeImage from "@/components/common/SafeImage";
import { useTranslation } from "@/hooks/useTranslation";
import { removeAccents } from "@/utils/vietnameseUtils";
import iconData from "@/assets/data/icon.json";
import { getRegionKey } from "@/utils/i18nHelpers";


const RewardSection = ({ rewards }) => {
	const { tUI, language } = useTranslation();
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

		// --- LOGIC ĐA NGÔN NGỮ (I18N) ---
		let translatedRegion = "";
		if (detectedRegion) {
			const regionKey = getRegionKey(detectedRegion);
			translatedRegion = tUI(`shared.region.${regionKey}`) || detectedRegion;
		}

		const REWARD_MAP = {
			// Vietnamese Names
			"hòm thần tích đồng": "bronze_reliquary",
			"hòm thần tích bạc": "silver_reliquary",
			"hòm thần tích vàng": "gold_reliquary",
			"kho báu đồng": "bronze_vault",
			"kho báu bạc": "silver_vault",
			"kho báu vàng": "gold_vault",
			"kho báu bạch kim": "platinum_vault",
			"kho báu kim cương": "diamond_vault",
			"thùng tinh tú bạc": "silver_star_vessel",
			"thùng tinh tú vàng": "gold_star_vessel",
			"thùng tinh tú bạch kim": "platinum_star_vessel",
			"điểm huyền thoại": "legend_level",
			"bụi tinh tú": "stardust",
			"bụi sao": "stardust",
			"pha lê sao băng": "nova_crystal",
			"pha lê tinh tú": "star_crystal",
			"đá quý": "gemstone",
			"xu vinh danh": "honor_coin",
			"mảnh sao băng": "nova_shard",
			"thùng đá quý lớn": "greater_gemstone_vessel",
			"mảnh ghép bí ẩn": "wild_frags",
			"mảnh vạn năng": "wild_frags",
			"mảnh tướng": "champ_frags",
			"thùng ngọc hoa linh lục địa": "runic_vessel",

			// English Keys / Codes / Names
			"bronze_reliquary": "bronze_reliquary",
			"silver_reliquary": "silver_reliquary",
			"gold_reliquary": "gold_reliquary",
			"bronze_vault": "bronze_vault",
			"silver_vault": "silver_vault",
			"gold_vault": "gold_vault",
			"platinum_vault": "platinum_vault",
			"diamond_vault": "diamond_vault",
			"silver_star_vessel": "silver_star_vessel",
			"gold_star_vessel": "gold_star_vessel",
			"platinum_star_vessel": "platinum_star_vessel",
			"legend_level": "legend_level",
			"stardust": "stardust",
			"nova_crystal": "nova_crystal",
			"star_crystal": "star_crystal",
			"gemstone": "gemstone",
			"honor_coin": "honor_coin",
			"nova_shard": "nova_shard",
			"greater_gemstone_vessel": "greater_gemstone_vessel",
			"wild_frags": "wild_frags",
			"mysterious_fragment": "wild_frags",
			"champ_frags": "champ_frags",
			"runic_vessel": "runic_vessel",
		};

		const ICON_NAME_MAP = {
			bronze_reliquary: "Hòm Thần Tích Đồng",
			silver_reliquary: "Hòm Thần Tích Bạc",
			gold_reliquary: "Hòm Thần Tích Vàng",
			bronze_vault: "Kho Báu Đồng",
			silver_vault: "Kho Báu Bạc",
			gold_vault: "Kho Báu Vàng",
			platinum_vault: "Kho Báu Bạch Kim",
			diamond_vault: "Kho Báu Kim Cương",
			silver_star_vessel: "Thùng Tinh Tú Bạc",
			gold_star_vessel: "Thùng Tinh Tú Vàng",
			platinum_star_vessel: "Thùng Tinh Tú Bạch Kim",
			legend_level: "Điểm Huyền Thoại",
			stardust: "Bụi Tinh Tú",
			nova_crystal: "Pha Lê Sao Băng",
			star_crystal: "Pha Lê Tinh Tú",
			gemstone: "Đá Quý",
			honor_coin: "Xu Vinh Danh",
			nova_shard: "Mảnh Sao Băng",
			greater_gemstone_vessel: "Thùng Đá Quý Lớn",
			wild_frags: "Mảnh Ghép Bí Ẩn",
			champ_frags: "Mảnh Tướng",
			runic_vessel: "Thùng Ngọc Hoa Linh Lục Địa",
		};

		const lowerBase = baseName.toLowerCase().trim();
		const baseKey = REWARD_MAP[lowerBase];
		const translatedBase = baseKey ? tUI(`reward.${baseKey}`) : baseName;

		// Xử lý ghép tên (đảo vị trí tự nhiên tùy theo ngôn ngữ Tiếng Việt hay Tiếng Anh)
		const translatedName = translatedRegion
			? (language === "vi" ? `${translatedBase} ${translatedRegion}` : `${translatedRegion} ${translatedBase}`)
			: translatedBase;

		const iconQueryName = baseKey ? ICON_NAME_MAP[baseKey] : baseName;
		const mainIcon =
			getRawIcon(iconQueryName) !== "/fallback-image.svg"
				? getRawIcon(iconQueryName)
				: (getRawIcon(baseName) !== "/fallback-image.svg" ? getRawIcon(baseName) : getRawIcon(itemName));

		const overlayIcon = detectedRegion ? getRawIcon(detectedRegion) : null;

		return {
			mainIcon,
			overlayIcon,
			originalName: itemName,
			translatedName,
		};
	};

	return (
		<section className='tactical-panel clip-chamfer border border-[var(--tactical-card-border)] bg-[var(--tactical-panel-bg)] p-3 md:p-5 w-full'>
			<div className='flex justify-between items-center border-b border-[var(--tactical-card-border)] pb-3 mb-4'>
				<div className='flex items-center gap-3'>
					<div className='w-1 h-5 bg-[var(--tactical-accent-lime)] shadow-[0_0_8px_var(--tactical-accent-lime)]' />
					<h2 className='text-lg sm:text-xl font-bold font-display uppercase tracking-wider text-[var(--tactical-accent-lime)] flex items-center gap-2'>
						<Gift size={20} className='text-[var(--tactical-accent-lime)] drop-shadow-[0_0_6px_var(--tactical-accent-lime)]' />{" "}
						{tUI("adventureMap.rewardMilestone") || "Mốc Thưởng"}
					</h2>
				</div>
				<Button
					type='button'
					size='sm'
					variant='outline'
					onClick={() => setIsVisible(!isVisible)}
					className='font-mono-tech uppercase text-xs tracking-wider border-[var(--tactical-card-border)] hover:border-[var(--tactical-accent-lime)] clip-chamfer-sm'
					iconLeft={isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
				>
					{isVisible
						? tUI("common.hide") || "Ẩn"
						: tUI("common.show") || "Hiện"}
				</Button>
			</div>

			
				{isVisible && (
					<div className='overflow-hidden'>
						<div className='tactical-box clip-chamfer-sm border border-[var(--tactical-card-border)] overflow-hidden'>
							<div className='overflow-x-auto'>
								<table className='w-full text-left border-collapse min-w-[600px]'>
									<thead>
										<tr className='bg-[var(--tactical-inner-box)] text-[var(--tactical-accent-lime)] font-display text-xs border-b border-[var(--tactical-card-border)] tracking-wider uppercase'>
											<th className='py-3 px-3 sm:px-4 w-1/4 font-bold border-r border-[var(--tactical-card-border)]'>
												{tUI("adventureMap.reward") || "Phần thưởng"}
											</th>
											<th className='py-3 px-3 sm:px-4 font-bold'>
												{tUI("adventureMap.rewardList") ||
													"Danh sách Phần Thưởng"}
											</th>
										</tr>
									</thead>
									<tbody className='divide-y divide-[var(--tactical-card-border)]'>
										{rewards.map((rewardPacket, idx) => (
											<tr
												key={idx}
												className='hover:bg-[var(--tactical-inner-box)]/50 transition-colors'
											>
												<td className='py-3 px-3 sm:px-4 align-middle border-r border-[var(--tactical-card-border)] text-xs sm:text-sm font-mono-tech font-bold text-[var(--tactical-accent-lime)]'>
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
																	className='tactical-box clip-chamfer-sm flex items-center gap-2 bg-[var(--tactical-card-bg)] px-2.5 sm:px-3 py-1.5 sm:py-2 border border-[var(--tactical-card-border)] hover:border-[var(--tactical-accent-lime)] transition-colors'
																>
																	<div className='relative shrink-0'>
																		<SafeImage
																			src={parsedReward.mainIcon}
																			alt={item.name}
																			className='w-6 h-6 sm:w-8 sm:h-8 object-contain'
																		/>
																		{parsedReward.overlayIcon && (
																			<div className='absolute -bottom-1 -right-1 bg-[var(--tactical-panel-bg)] rounded-full p-0.5 border border-[var(--tactical-card-border)]'>
																				<img
																					src={parsedReward.overlayIcon}
																					alt='region-overlay'
																					className='w-3 h-3 sm:w-4 sm:h-4 object-contain rounded-full'
																				/>
																			</div>
																		)}
																	</div>

																	<span className='text-xs sm:text-sm font-semibold text-text-primary whitespace-nowrap'>
																		{parsedReward.translatedName}
																	</span>
																	<span className='font-mono-tech text-[10px] sm:text-xs font-bold text-[var(--tactical-accent-lime)] bg-[var(--tactical-inner-box)] px-1.5 sm:px-2 py-0.5 border border-[var(--tactical-accent-lime)]/30'>
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
					</div>
				)}
			
		</section>
	);
};

export default RewardSection;
