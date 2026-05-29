import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import SafeImage from "../common/SafeImage";
import CardNameCell from "./CardNameCell";

const ChampionStartingDeck = ({
	champion,
	resolvedStartingCards,
	resolvedItems,
	tDynamic,
	tUI,
	handleOpenCarousel,
	activeDeckTab,
	setActiveDeckTab
}) => {
	if (!champion?.startingDeck?.baseCards?.length && !champion?.startingDeck?.referenceCards?.length) {
		return null;
	}

	return (
		<div className="bg-surface-bg border border-border rounded-xl p-1 sm:p-6 shadow-sm mt-6 overflow-hidden">
			<div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-border mb-6 gap-4">
				<div className="flex items-center gap-4">
					<h2 className='p-1 text-lg sm:text-3xl font-semibold font-primary text-primary-500 flex items-center gap-3'>
						{tUI("championDetail.startingDeck")}
					</h2>
				</div>

				{champion.startingDeck?.baseCards?.length > 0 &&
					champion.startingDeck?.referenceCards?.length > 0 && (
					<div className="flex bg-surface-hover/50 p-1 rounded-lg self-start sm:self-auto">
						{[
							{ id: "base", label: tUI("championDetail.baseCards"), count: champion.startingDeck.baseCards.length, color: "text-primary-500", bg: "bg-primary-500/10" },
							{ id: "ref", label: tUI("championDetail.referenceCards"), count: champion.startingDeck.referenceCards.length, color: "text-purple-500", bg: "bg-purple-500/10" }
						].map((tab) => (
							<button
								key={tab.id}
								onClick={() => setActiveDeckTab(tab.id)}
								className={`relative whitespace-nowrap px-3 py-1.5 rounded-md text-xs font-black tracking-wider uppercase transition-all flex items-center gap-2 ${
									activeDeckTab === tab.id 
										? `${tab.color} z-10` 
										: "text-text-tertiary hover:text-text-secondary"
								}`}
							>
								{activeDeckTab === tab.id && (
									<motion.div
										layoutId="activeDeckTab"
										className={`absolute inset-0 ${tab.bg} border border-border rounded-md -z-10`}
										transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
									/>
								)}
								{tab.label}
								<span className={`text-[10px] px-1.5 rounded-full ${activeDeckTab === tab.id ? `${tab.bg} border border-border` : "bg-black/20"}`}>
									{tab.count}
								</span>
							</button>
						))}
					</div>
				)}
			</div>

			<div className='mt-2'>
				<AnimatePresence mode='wait'>
					{(activeDeckTab === "base" || !champion.startingDeck?.referenceCards?.length) && (
						<motion.div 
							key="base-deck"
							initial={{ opacity: 0, x: -10 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: 10 }}
							transition={{ duration: 0.2 }}
							className='bg-surface-bg border border-border rounded-xl overflow-hidden shadow-sm'
						>
							{!champion.startingDeck?.referenceCards?.length && (
								<div className='p-2 bg-primary-500/5 border-b border-border flex items-center justify-between'>
									<h3 className='text-sm sm:text-lg font-bold text-text-primary flex items-center gap-2 uppercase'>
										{tUI("championDetail.baseCards")}
									</h3>
									<span className='text-[10px] font-bold text-text-secondary bg-surface-hover px-2 py-1 rounded-md border border-border uppercase'>
										{champion.startingDeck.baseCards.length}{" "}
										{tUI("common.cards")}
									</span>
								</div>
							)}
							<div className='overflow-x-auto'>
								<table className='w-full text-left border-collapse'>
									<thead>
										<tr className='bg-surface-hover/50 text-[10px] sm:text-xs font-black uppercase text-text-tertiary tracking-widest border-b border-border'>
											<th className='px-2 py-2 sm:px-4 w-8 text-center'>#</th>
											<th className='px-2 py-2 sm:px-4'>{tUI("admin.cardForm.cardNameLabel")}</th>
											<th className='px-2 py-2 sm:px-4'>{tUI("admin.dropSidePanel.tabs.item")}</th>
										</tr>
									</thead>
									<tbody className='divide-y divide-border/50'>
										{champion.startingDeck.baseCards.map((cardData, idx) => {
											const cardInfo = resolvedStartingCards.find(c => c.cardCode === cardData.cardCode);
											const cardItems = (cardData.itemCodes || [])
												.map(codeObj => {
													const codeStr = typeof codeObj === "string" ? codeObj : codeObj.itemCode;
													const itemMatch = resolvedItems.find(i => i.itemCode === codeStr);
													if(itemMatch && typeof codeObj === "object" && codeObj.unlockLevel > 0) {
														return { ...itemMatch, unlockLevel: codeObj.unlockLevel };
													}
													return itemMatch;
												})
												.filter(Boolean);

											return (
												<tr key={idx} className='group hover:bg-surface-hover/30 transition-colors'>
													<td className='px-2 py-2 sm:px-4 sm:py-2 text-center text-xs font-bold text-text-tertiary'>{idx + 1}</td>
													<td className='px-2 py-2 sm:px-4 sm:py-2'>
														<CardNameCell 
															card={cardInfo} 
															items={cardItems} 
															cardCode={cardData.cardCode} 
															onOpenCarousel={handleOpenCarousel}
														/>
													</td>
													<td className='px-2 py-2 sm:px-4 sm:py-2'>
														<div className='flex flex-wrap gap-2'>
															{cardItems.length > 0 ? (
																cardItems.map((item, i) => (
																	<Link key={i} to={`/item/${item.itemCode}`} className='relative flex items-center gap-1.5 px-2 py-1 rounded-lg bg-surface-hover/50 hover:bg-surface-hover hover:scale-105 transition-all' title={tDynamic(item, "name")}>
																		<SafeImage src={item.assetAbsolutePath || item.image || "/fallback-image.svg"} className='w-10 h-10 sm:w-12 sm:h-12 object-contain' width={48} height={48} />
																		{item.unlockLevel > 0 && (
																			<span className="absolute -top-1 -right-1 bg-yellow-500 text-black rounded-full w-4 h-4 flex items-center justify-center text-[8px] font-bold shadow-md">
																				{item.unlockLevel}
																			</span>
																		)}
																		<span className='text-[10px] sm:text-xs font-bold text-text-secondary hidden lg:inline'>
																			{tDynamic(item, "name")}
																		</span>
																	</Link>
																))
															) : (
																<span className='text-[10px] text-text-tertiary italic'>{tUI("championDetail.noItems")}</span>
															)}
														</div>
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
							</div>
						</motion.div>
					)}

					{(activeDeckTab === "ref" && champion.startingDeck?.referenceCards?.length > 0) && (
						<motion.div 
							key="ref-deck"
							initial={{ opacity: 0, x: 10 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -10 }}
							transition={{ duration: 0.2 }}
							className='bg-surface-bg border border-border rounded-xl overflow-hidden shadow-sm'
						>
							<div className='overflow-x-auto'>
								<table className='w-full text-left border-collapse'>
									<thead>
										<tr className='bg-surface-hover/50 text-[10px] sm:text-xs font-black uppercase text-text-tertiary tracking-widest border-b border-border'>
											<th className='px-2 py-2 sm:px-4 w-8 text-center'>#</th>
											<th className='px-2 py-2 sm:px-4'>{tUI("admin.cardForm.cardNameLabel")}</th>
											<th className='px-2 py-2 sm:px-4'>{tUI("admin.dropSidePanel.tabs.item")}</th>
										</tr>
									</thead>
									<tbody className='divide-y divide-border/50'>
										{champion.startingDeck.referenceCards.map((cardData, idx) => {
											const cardInfo = resolvedStartingCards.find(c => c.cardCode === cardData.cardCode);
											const cardItems = (cardData.itemCodes || [])
												.map(codeObj => {
													const codeStr = typeof codeObj === "string" ? codeObj : codeObj.itemCode;
													const itemMatch = resolvedItems.find(i => i.itemCode === codeStr);
													if(itemMatch && typeof codeObj === "object" && codeObj.unlockLevel > 0) {
														return { ...itemMatch, unlockLevel: codeObj.unlockLevel };
													}
													return itemMatch;
												})
												.filter(Boolean);

											return (
												<tr key={idx} className='group hover:bg-surface-hover/30 transition-colors'>
													<td className='px-2 py-2 sm:px-4 sm:py-2 text-center text-xs font-bold text-text-tertiary'>{idx + 1}</td>
													<td className='px-2 py-2 sm:px-4 sm:py-2'>
														<CardNameCell 
															card={cardInfo} 
															items={cardItems} 
															cardCode={cardData.cardCode} 
															isReference={true} 
															onOpenCarousel={handleOpenCarousel}
														/>
													</td>
													<td className='px-2 py-2 sm:px-4 sm:py-2'>
														<div className='flex flex-wrap gap-2'>
															{cardItems.length > 0 ? (
																cardItems.map((item, i) => (
																	<Link key={i} to={`/item/${item.itemCode}`} className='relative flex items-center gap-1.5 px-2 py-1 rounded-lg bg-surface-hover/50 hover:bg-surface-hover hover:scale-105 transition-all' title={tDynamic(item, "name")}>
																		<SafeImage src={item.assetAbsolutePath || item.image || "/fallback-image.svg"} className='w-10 h-10 sm:w-12 sm:h-12 object-contain' width={48} height={48} />
																		{item.unlockLevel > 0 && (
																			<span className="absolute -top-1 -right-1 bg-yellow-500 text-black rounded-full w-4 h-4 flex items-center justify-center text-[8px] font-bold shadow-md">
																				{item.unlockLevel}
																			</span>
																		)}
																		<span className='text-[10px] sm:text-xs font-bold text-text-secondary hidden lg:inline'>
																			{tDynamic(item, "name")}
																		</span>
																	</Link>
																))
															) : (
																<span className='text-[10px] text-text-tertiary italic'>{tUI("championDetail.noItems")}</span>
															)}
														</div>
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
};

export default ChampionStartingDeck;
