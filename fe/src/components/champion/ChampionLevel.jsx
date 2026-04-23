import React, { useMemo } from "react";
import { Star } from "lucide-react";
import SafeImage from "../common/SafeImage";
import { useTranslation } from "../../hooks/useTranslation";
import { Link } from "react-router-dom";
import CardNameCell from "./CardNameCell";

const ICONS = {
	firstRelic: "https://images.pocguide.top/icon/25px-PoC_Common_Relic_icon.webp",
	rareRelic: "https://images.pocguide.top/icon/25px-PoC_Rare_Relic_icon.webp",
	legendary: "https://images.pocguide.top/icon/Champion_rarity.webp",
	epic: "https://images.pocguide.top/icon/Epic_rarity.webp",
	rare: "https://images.pocguide.top/icon/Rare_rarity.webp",
	common: "https://images.pocguide.top/icon/Common_rarity.webp",
	health: "https://images.pocguide.top/icon/20px-PoC_Health_icon.webp",
	regen: "https://images.pocguide.top/icon/20px-PoC_Regen_icon.webp",
	gold: "https://images.pocguide.top/icon/20px-PoC_Gold_Coin_icon.webp",
	revive: "https://images.pocguide.top/icon/20px-PoC_Revive_icon.webp",
	reroll: "https://images.pocguide.top/icon/20px-PoC_Reroll_icon.webp"
};

// Component đã được chuyển từ dạng Modal sang dạng Inline Component cố định
function getLevelData(tUI, upgrades = []) {
	const levelProps = [
		{ level: 1, exp: 0, total: 0, health: 20, regen: 0, gold: 0, others: [{ text: tUI("championLevelRewards.rewards.firstRelicUnlocked"), icon: ICONS.firstRelic }] },
		{ level: 2, exp: 50, total: 50, health: 25 },
		{ level: 3, exp: 100, total: 150 },
		{ level: 4, exp: 150, total: 300, health: 30 },
		{ level: 5, exp: 200, total: 500, others: [{ text: tUI("championLevelRewards.rewards.supportCommonItem"), icon: ICONS.common }] },
		{ level: 6, exp: 300, total: 800, others: [{ text: tUI("championLevelRewards.rewards.findRare5"), icon: ICONS.rare }] },
		{ level: 7, exp: 450, total: 1250, others: [{ text: tUI("championLevelRewards.rewards.reviveToken"), icon: ICONS.revive }] },
		{ level: 8, exp: 500, total: 1750, others: [{ text: tUI("championLevelRewards.rewards.firstRelicRare"), icon: ICONS.rareRelic }, { text: tUI("championLevelRewards.rewards.findEpic2_5"), icon: ICONS.epic }] },
		{ level: 9, exp: 560, total: 2310 },
		{ level: 10, exp: 670, total: 2980, regen: 2, others: [{ text: tUI("championLevelRewards.rewards.findLegendary1"), icon: ICONS.legendary }] },
		{ level: 11, exp: 800, total: 3780, others: [{ text: tUI("championLevelRewards.rewards.supportRareItem"), icon: ICONS.rare }] },
		{ level: 12, exp: 930, total: 4710 },
		{ level: 13, exp: 1070, total: 5780, others: [{ text: tUI("championLevelRewards.rewards.secondRelicUnlocked"), icon: ICONS.firstRelic }] },
		{ level: 14, exp: 1210, total: 6990, others: [{ text: tUI("championLevelRewards.rewards.firstCombatCommon"), icon: ICONS.common }, { text: tUI("championLevelRewards.rewards.findRare10"), icon: ICONS.rare }] },
		{ level: 15, exp: 1360, total: 8350 },
		{ level: 16, exp: 1520, total: 9870, health: 35, others: [{ text: tUI("championLevelRewards.rewards.findEpic5"), icon: ICONS.epic }] },
		{ level: 17, exp: 1690, total: 11560, others: [{ text: tUI("championLevelRewards.rewards.supportCardsCommon"), icon: ICONS.common }] },
		{ level: 18, exp: 1860, total: 13420, others: [{ text: tUI("championLevelRewards.rewards.findLegendary2"), icon: ICONS.legendary }] },
		{ level: 19, exp: 2040, total: 15460, others: [{ text: tUI("championLevelRewards.rewards.secondRelicRare"), icon: ICONS.rareRelic }] },
		{ level: 20, exp: 2220, total: 17680, powerId: "P01114" },
		{ level: 21, exp: 2410, total: 20090 },
		{ level: 22, exp: 2610, total: 22700, regen: 4, others: [{ text: tUI("championLevelRewards.rewards.findRare15"), icon: ICONS.rare }] },
		{ level: 23, exp: 2810, total: 25510, others: [{ text: tUI("championLevelRewards.rewards.supportCardsRare"), icon: ICONS.rare }] },
		{ level: 24, exp: 3020, total: 28530, others: [{ text: tUI("championLevelRewards.rewards.findEpic7_5"), icon: ICONS.epic }] },
		{ level: 25, exp: 3230, total: 31760, others: [{ text: tUI("championLevelRewards.rewards.thirdRelicUnlocked"), icon: ICONS.firstRelic }] },
		{ level: 26, exp: 3450, total: 35210, others: [{ text: tUI("championLevelRewards.rewards.firstCombatRare"), icon: ICONS.rare }, { text: tUI("championLevelRewards.rewards.findLegendary3"), icon: ICONS.legendary }] },
		{ level: 27, exp: 3670, total: 38880 },
		{ level: 28, exp: 3900, total: 42780, health: 40 },
		{ level: 29, exp: 4140, total: 46920, others: [{ text: tUI("championLevelRewards.rewards.supportEpicItem"), icon: ICONS.epic }] },
		{ level: 30, exp: 4370, total: 51290, others: [{ text: tUI("championLevelRewards.rewards.thirdRelicRare"), icon: ICONS.rareRelic }] },
		{ level: 31, exp: 5850, total: 57140, health: 42 },
		{ level: 32, exp: 6930, total: 64070, gold: 30 },
		{ level: 33, exp: 8140, total: 72210, others: [{ text: tUI("championLevelRewards.rewards.findRare20"), icon: ICONS.rare }] },
		{ level: 34, exp: 9680, total: 81890, regen: 6 },
		{ level: 35, exp: 11240, total: 93130, health: 44 },
		{ level: 36, exp: 12860, total: 105990, others: [{ text: tUI("championLevelRewards.rewards.findEpic10"), icon: ICONS.epic }] },
		{ level: 37, exp: 14620, total: 120610, gold: 60 },
		{ level: 38, exp: 16050, total: 136660, others: [{ text: tUI("championLevelRewards.rewards.findRare25"), icon: ICONS.rare }] },
		{ level: 39, exp: 18770, total: 155430, health: 46 },
		{ level: 40, exp: 21100, total: 176530, others: [{ text: tUI("championLevelRewards.rewards.reroll"), icon: ICONS.reroll }] },
		{ level: 41, exp: 23510, total: 200040, gold: 90 },
		{ level: 42, exp: 26150, total: 226190, others: [{ text: tUI("championLevelRewards.rewards.findLegendary4"), icon: ICONS.legendary }] },
		{ level: 43, exp: 29190, total: 255380, health: 48 },
		{ level: 44, exp: 32530, total: 287910, regen: 8 },
		{ level: 45, exp: 35420, total: 323330, gold: 120 },
		{ level: 46, exp: 38070, total: 361400, others: [{ text: tUI("championLevelRewards.rewards.findRare30"), icon: ICONS.rare }] },
		{ level: 47, exp: 41230, total: 402630, health: 50 },
		{ level: 48, exp: 45550, total: 448180, others: [{ text: tUI("championLevelRewards.rewards.findEpic12_5"), icon: ICONS.epic }] },
		{ level: 49, exp: 49690, total: 497870, gold: 150 },
		{ level: 50, exp: 54800, total: 552670, others: [{ text: tUI("championLevelRewards.rewards.findLegendary5"), icon: ICONS.legendary }] }
	];

	return levelProps.map(item => {
		const deckUpdates = upgrades.filter(u => u.unlockLevel === item.level);
		
		return { ...item, deckUpdates };
	});
}

function ChampionLevel({ deckUpgrades, resolvedPowers, onOpenCarousel }) {
	const { tUI, tDynamic, language } = useTranslation();

	const levels = useMemo(
		() => getLevelData(tUI, deckUpgrades),
		[tUI, deckUpgrades]
	);

	return (
		<div className="bg-surface-bg border border-border rounded-xl p-4 sm:p-6 shadow-sm mt-6 overflow-hidden w-full flex flex-col">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-border mb-6 gap-4">
				<div className="flex items-center gap-4">
					<h2 className="p-1 text-lg sm:text-3xl font-semibold font-primary text-primary-500 flex items-center gap-3">
						{tUI("championLevelRewards.title")}
					</h2>
				</div>
			</div>

			{/* Body (Table) */}
			<div className="bg-surface-bg border border-border rounded-xl overflow-hidden shadow-sm flex-1 custom-scrollbar">
				<div className="overflow-x-auto w-full">
					<table className="w-full text-left border-collapse min-w-[800px]">
							<thead>
								<tr className="bg-surface-hover/50 text-[10px] sm:text-xs font-black uppercase text-text-tertiary tracking-widest border-b border-border">
									<th className="px-2 py-2 sm:px-4 text-center w-16 whitespace-nowrap">{tUI("championLevelRewards.level")}</th>
									<th className="px-2 py-2 sm:px-4">{tUI("championLevelRewards.reward")}</th>
									<th className="px-2 py-2 sm:px-4 whitespace-nowrap">{tUI("championLevelRewards.expNeeded")}</th>
									<th className="px-2 py-2 sm:px-4 whitespace-nowrap">{tUI("championLevelRewards.totalExp")}</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-border/50">
								{levels.map((lvl) => (
									<tr
										key={lvl.level}
										className="group hover:bg-surface-hover/30 transition-colors"
									>
										<td className="px-2 py-2 sm:px-4 sm:py-2 text-center text-xs font-bold text-text-tertiary">
											<div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-surface-hover border border-border text-primary-500 font-bold text-sm">
												{lvl.level}
											</div>
										</td>
										<td className="px-2 py-2 sm:px-4 sm:py-2">
											<div className="flex flex-col gap-2 my-1">
												{/* Deck Upgrade Rendering */}
												{lvl.deckUpdates && lvl.deckUpdates.length > 0 && lvl.deckUpdates.map((update, idx) => (
													<div key={idx} className="flex items-center flex-wrap gap-2 p-2 rounded-lg bg-surface-hover/40">
														<CardNameCell
															card={update.card}
															cardCode={update.cardCode}
															onOpenCarousel={onOpenCarousel}
														/>
														<span className="text-text-secondary text-sm font-medium italic">
															{tUI("championLevelRewards.rewards.deckUpgrade")}
														</span>
														<Link to={`/item/${update.item.itemCode}`} className="flex items-center gap-1.5 hover:bg-surface-hover p-1 rounded transition-colors group/item">
															<SafeImage 
																src={update.item.assetAbsolutePath || update.item.image} 
																className="h-8 w-8 rounded object-contain group-hover/item:scale-110 transition-transform" 
															/>
															<span className="font-bold text-sm text-yellow-500 group-hover/item:text-yellow-400">
																{tDynamic(update.item, "name")}
															</span>
														</Link>
													</div>
												))}

												{/* Power Reward */}
												{lvl.powerId && resolvedPowers?.find(p => p.powerCode === lvl.powerId) && (
													<Link to={`/power/${lvl.powerId}`} className="flex items-center gap-2 p-2 rounded-lg bg-surface-hover/50 transition-colors w-fit">
														<SafeImage 
															src={resolvedPowers.find(p => p.powerCode === lvl.powerId).assetAbsolutePath || resolvedPowers.find(p => p.powerCode === lvl.powerId).image} 
															className="w-8 h-8 rounded" 
														/>
														<span className="font-bold text-sm text-yellow-500">
															{tDynamic(resolvedPowers.find(p => p.powerCode === lvl.powerId), "name")}
														</span>
													</Link>
												)}

												{/* Base Stat Rewards */}
												{((lvl.health && lvl.health > 0) || (lvl.regen && lvl.regen > 0) || (lvl.gold && lvl.gold > 0)) && (
													<div className="flex items-center gap-3">
														{lvl.health > 0 && (
															<div className="flex items-center gap-1.5 bg-green-500/10 text-green-500 px-2 py-1 rounded border border-green-500/20 font-bold text-sm" title={tUI("championLevelRewards.health")}>
																<SafeImage src={ICONS.health} className="w-5 h-5 shrink-0 object-contain drop-shadow" />
																<span>{lvl.health}</span>
															</div>
														)}
														{lvl.regen > 0 && (
															<div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded border border-emerald-500/20 font-bold text-sm" title={tUI("championLevelRewards.regen")}>
																<SafeImage src={ICONS.regen} className="w-5 h-5 shrink-0 object-contain drop-shadow" />
																<span>{lvl.regen}</span>
															</div>
														)}
														{lvl.gold > 0 && (
															<div className="flex items-center gap-1.5 bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded border border-yellow-500/20 font-bold text-sm" title={tUI("championLevelRewards.gold")}>
																<SafeImage src={ICONS.gold} className="w-5 h-5 shrink-0 object-contain drop-shadow" />
																<span>{lvl.gold}</span>
															</div>
														)}
													</div>
												)}

												{/* Other Rewards Array */}
												{lvl.others && lvl.others.length > 0 && (
													<div className="flex flex-col gap-1.5">
														{lvl.others.map((other, idx) => (
															<div key={idx} className="flex items-center gap-2 text-sm font-medium text-text-secondary">
																{other.icon && (
																	<SafeImage src={other.icon} className="w-5 h-5 object-contain shrink-0 drop-shadow-sm" />
																)}
																<span>{other.text}</span>
															</div>
														))}
													</div>
												)}

												{/* Default fallback if completely empty */}
												{(!lvl.deckUpdates || lvl.deckUpdates.length === 0) && !lvl.powerId && !lvl.health && !lvl.regen && !lvl.gold && !lvl.others && (
													<span className="text-text-tertiary italic text-sm">-</span>
												)}
											</div>
										</td>
										<td className="px-2 py-2 sm:px-4 sm:py-2 text-sm font-semibold text-text-secondary text-right">
											{lvl.exp.toLocaleString()}
										</td>
										<td className="px-2 py-2 sm:px-4 sm:py-2 text-sm text-text-tertiary group-hover:text-text-secondary transition-colors text-right">
											{lvl.total.toLocaleString()}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>
	);
}

export default React.memo(ChampionLevel);
