import React from "react";
import { motion } from "framer-motion";
import { Info, X } from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";

const VaultProbabilityInfo = ({ isOpening, loot, vaultKey = null, onClose }) => {
	const { tUI } = useTranslation();

	const show = (keys) => !vaultKey || keys.includes(vaultKey);

	const renderAsTable = (text) => {
		if (!text) return null;
		const lines = text.split('\n');
		const intro = [];
		const tableRows = [];

		lines.forEach((line) => {
			const trimmed = line.trim();
			if (trimmed.startsWith('•')) {
				const content = trimmed.substring(1).trim();
				const parts = content.split(':');
				if (parts.length >= 2) {
					const title = parts[0].trim();
					const detail = parts.slice(1).join(':').trim();
					tableRows.push({ title, detail });
				} else {
					tableRows.push({ title: content, detail: '' });
				}
			} else {
				intro.push(trimmed);
			}
		});

		return (
			<div className='space-y-3 select-text'>
				{intro.length > 0 && (
					<p className='text-text-secondary leading-relaxed font-secondary text-sm sm:text-base'>
						{intro.join('\n')}
					</p>
				)}
				{tableRows.length > 0 && (
					<div className='rounded-lg border border-border shadow-sm'>
						<table className='w-full text-left border-collapse text-xs sm:text-sm table-fixed select-text'>
							<tbody className='divide-y divide-border'>
								{tableRows.map((row, i) => (
									<tr key={i} className='transition-colors hover:bg-primary-500/5 group/row'>
										{row.detail ? (
											<>
												<td className='py-2 px-3 font-bold text-text-primary bg-surface-bg/80 border-r border-border align-top w-2/5 sm:w-1/3 break-words'>
													{row.title}
												</td>
												<td className='py-2 px-3 text-text-secondary bg-input-bg/40 align-top group-hover/row:text-text-primary transition-colors break-words'>
													{row.detail}
												</td>
											</>
										) : (
											<td colSpan={2} className='py-2 px-3 text-primary-500 font-bold bg-surface-bg/30 italic break-words'>
												• {row.title}
											</td>
										)}
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		);
	};

	const renderSources = (text) => {
		if (!text) return null;
		const lines = text.split('\n').map(l => l.trim()).filter(l => l);
		return (
			<ul className='space-y-2 mt-2'>
				{lines.map((line, i) => (
					<li key={i} className='flex items-start gap-2 text-text-secondary text-sm'>
						<div className='w-1.5 h-1.5 rounded-full bg-primary-500 mt-1.5 shrink-0' />
						<span>{line.replace(/^•\s*/, '')}</span>
					</li>
				))}
			</ul>
		);
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			className='mt-0 sm:mt-2 sm:p-2 bg-surface-bg border border-border rounded-3xl shadow-sm relative overflow-hidden select-text pointer-events-auto'
		>
			<div className='absolute -top-24 -right-24 w-64 h-64 bg-primary-500/[0.03] blur-[100px] pointer-events-none' />

			<div className='flex items-center justify-between gap-2 sm:gap-4 mb-4 sm:mb-6'>
				<div className='flex items-center gap-2 sm:gap-4'>
					<div className='p-2 sm:p-3 bg-primary-500/10 text-primary-600 rounded-2xl border border-primary-500/10'>
						<Info className='w-5 h-5 sm:w-6 sm:h-6' />
					</div>
					<h2 className='text-xl sm:text-2xl md:text-3xl font-black uppercase italic tracking-tight text-text-primary'>
						{tUI("vaultSimulator.probInfo")}
					</h2>
				</div>
				{onClose && (
					<button 
						onClick={onClose}
						className='p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-input-bg transition-colors'
					>
						<X className='w-5 h-5 sm:w-6 sm:h-6' />
					</button>
				)}
			</div>

			<div className={(vaultKey ? 'w-full max-w-3xl mx-auto space-y-4' : 'grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm') + ' select-text'}>
				{show(["bronze"]) && (
					<div className='space-y-3 bg-input-bg/20 p-4 sm:p-5 rounded-2xl border border-border hover:border-primary-500/30 transition-all duration-300 shadow-sm relative overflow-hidden group'>
						<div className='absolute inset-0 bg-gradient-to-br from-[#cd7f32]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
						<h3 className='text-lg sm:text-xl font-bold text-[#cd7f32] uppercase italic underline underline-offset-[6px] decoration-2 decoration-[#cd7f32]/30 inline-block'>
							{tUI("vaultSimulator.probBronzeTitle")}
						</h3>
						
						{renderAsTable(tUI("vaultSimulator.probBronzeDesc"))}
						
						<div className='pt-3 border-t border-border/50'>
							<h4 className='text-xs font-bold text-primary-600 uppercase tracking-wider mb-2 flex items-center gap-1.5'>
								<span className='w-1.5 h-1.5 bg-primary-500 rounded-full' />
								{tUI("vaultSimulator.sourceTitle")}
							</h4>
							<div className='bg-surface-bg/80 p-3 rounded-xl border border-border/50 shadow-inner'>
								{renderSources(tUI("vaultSimulator.sources.bronze"))}
							</div>
						</div>
					</div>
				)}

				{show(["silver"]) && (
					<div className='space-y-3 bg-input-bg/20 p-4 sm:p-5 rounded-2xl border border-border hover:border-primary-500/30 transition-all duration-300 shadow-sm relative overflow-hidden group'>
						<div className='absolute inset-0 bg-gradient-to-br from-[#c0c0c0]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
						<h3 className='text-lg sm:text-xl font-bold text-[#c0c0c0] uppercase italic underline underline-offset-[6px] decoration-2 decoration-[#c0c0c0]/30 inline-block'>
							{tUI("vaultSimulator.probSilverTitle")}
						</h3>
						
						{renderAsTable(tUI("vaultSimulator.probSilverDesc"))}
						
						<div className='pt-3 border-t border-border/50'>
							<h4 className='text-xs font-bold text-primary-600 uppercase tracking-wider mb-2 flex items-center gap-1.5'>
								<span className='w-1.5 h-1.5 bg-primary-500 rounded-full' />
								{tUI("vaultSimulator.sourceTitle")}
							</h4>
							<div className='bg-surface-bg/80 p-3 rounded-xl border border-border/50 shadow-inner'>
								{renderSources(tUI("vaultSimulator.sources.silver"))}
							</div>
						</div>
					</div>
				)}

				{show(["gold"]) && (
					<div className='space-y-3 bg-input-bg/20 p-4 sm:p-5 rounded-2xl border border-border hover:border-primary-500/30 transition-all duration-300 shadow-sm relative overflow-hidden group'>
						<div className='absolute inset-0 bg-gradient-to-br from-[#ffd700]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
						<h3 className='text-lg sm:text-xl font-bold text-[#ffd700] uppercase italic underline underline-offset-[6px] decoration-2 decoration-[#ffd700]/30 inline-block'>
							{tUI("vaultSimulator.probGoldTitle")}
						</h3>
						
						{renderAsTable(tUI("vaultSimulator.probGoldDesc"))}
						
						<div className='pt-3 border-t border-border/50'>
							<h4 className='text-xs font-bold text-primary-600 uppercase tracking-wider mb-2 flex items-center gap-1.5'>
								<span className='w-1.5 h-1.5 bg-primary-500 rounded-full' />
								{tUI("vaultSimulator.sourceTitle")}
							</h4>
							<div className='bg-surface-bg/80 p-3 rounded-xl border border-border/50 shadow-inner'>
								{renderSources(tUI("vaultSimulator.sources.gold"))}
							</div>
						</div>
					</div>
				)}

				{show(["platinum"]) && (
					<div className='space-y-3 bg-input-bg/20 p-4 sm:p-5 rounded-2xl border border-border hover:border-primary-500/30 transition-all duration-300 shadow-sm relative overflow-hidden group'>
						<div className='absolute inset-0 bg-gradient-to-br from-emerald-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
						<h3 className='text-lg sm:text-xl font-bold text-emerald-400 uppercase italic underline underline-offset-[6px] decoration-2 decoration-emerald-400/30 inline-block'>
							{tUI("vaultSimulator.probPlatinumTitle")}
						</h3>
						
						{renderAsTable(tUI("vaultSimulator.probPlatinumDesc"))}
						
						<div className='pt-3 border-t border-border/50'>
							<h4 className='text-xs font-bold text-primary-600 uppercase tracking-wider mb-2 flex items-center gap-1.5'>
								<span className='w-1.5 h-1.5 bg-primary-500 rounded-full' />
								{tUI("vaultSimulator.sourceTitle")}
							</h4>
							<div className='bg-surface-bg/80 p-3 rounded-xl border border-border/50 shadow-inner'>
								{renderSources(tUI("vaultSimulator.sources.platinum"))}
							</div>
						</div>
					</div>
				)}

				{show(["diamond"]) && (
					<div className='space-y-3 bg-input-bg/20 p-4 sm:p-5 rounded-2xl border border-border hover:border-primary-500/30 transition-all duration-300 shadow-sm relative overflow-hidden group'>
						<div className='absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
						<h3 className='text-lg sm:text-xl font-bold text-indigo-500 uppercase italic underline underline-offset-[6px] decoration-2 decoration-indigo-500/30 inline-block'>
							{tUI("vaultSimulator.probDiamondTitle")}
						</h3>
						
						{renderAsTable(tUI("vaultSimulator.probDiamondDesc"))}
						
						<div className='pt-3 border-t border-border/50'>
							<h4 className='text-xs font-bold text-primary-600 uppercase tracking-wider mb-2 flex items-center gap-1.5'>
								<span className='w-1.5 h-1.5 bg-primary-500 rounded-full' />
								{tUI("vaultSimulator.sourceTitle")}
							</h4>
							<div className='bg-surface-bg/80 p-3 rounded-xl border border-border/50 shadow-inner'>
								{renderSources(tUI("vaultSimulator.sources.diamond"))}
							</div>
						</div>
					</div>
				)}
				{show(["runic_vessel"]) && (
					<div className='space-y-3 bg-input-bg/20 p-4 sm:p-5 rounded-2xl border border-border hover:border-primary-500/30 transition-all duration-300 shadow-sm relative overflow-hidden group'>
						<div className='absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
						<h3 className='text-lg sm:text-xl font-bold text-pink-500 uppercase italic underline underline-offset-[6px] decoration-2 decoration-pink-500/30 inline-block'>
							{tUI("vaultSimulator.tier.runic_vessel")}
						</h3>
						
						{renderAsTable(tUI("vaultSimulator.probRunicVesselDesc"))}
						
						<div className='pt-3 border-t border-border/50'>
							<h4 className='text-xs font-bold text-primary-600 uppercase tracking-wider mb-2 flex items-center gap-1.5'>
								<span className='w-1.5 h-1.5 bg-primary-500 rounded-full' />
								{tUI("vaultSimulator.sourceTitle")}
							</h4>
							<div className='bg-surface-bg/80 p-3 rounded-xl border border-border/50 shadow-inner'>
								{renderSources(tUI("vaultSimulator.sources.runic_vessel"))}
							</div>
						</div>
					</div>
				)}

				{show(["spirit_blossom_chest"]) && (
					<div className='space-y-3 bg-input-bg/20 p-4 sm:p-5 rounded-2xl border border-border hover:border-primary-500/30 transition-all duration-300 shadow-sm relative overflow-hidden group'>
						<div className='absolute inset-0 bg-gradient-to-br from-pink-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
						<h3 className='text-lg sm:text-xl font-bold text-pink-400 uppercase italic underline underline-offset-[6px] decoration-2 decoration-pink-400/30 inline-block'>
							{tUI("vaultSimulator.tier.spirit_blossom_chest")}
						</h3>
						
						{renderAsTable(tUI("vaultSimulator.probSpiritBlossomDesc"))}
						
						<div className='pt-3 border-t border-border/50'>
							<h4 className='text-xs font-bold text-primary-600 uppercase tracking-wider mb-2 flex items-center gap-1.5'>
								<span className='w-1.5 h-1.5 bg-primary-500 rounded-full' />
								{tUI("vaultSimulator.sourceTitle")}
							</h4>
							<div className='bg-surface-bg/80 p-3 rounded-xl border border-border/50 shadow-inner'>
								{renderSources(tUI("vaultSimulator.sources.spirit_blossom_chest"))}
							</div>
						</div>
					</div>
				)}

				{show(["superior_spirit_blossom_chest"]) && (
					<div className='space-y-3 bg-input-bg/20 p-4 sm:p-5 rounded-2xl border border-border hover:border-primary-500/30 transition-all duration-300 shadow-sm relative overflow-hidden group'>
						<div className='absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
						<h3 className='text-lg sm:text-xl font-bold text-purple-500 uppercase italic underline underline-offset-[6px] decoration-2 decoration-purple-500/30 inline-block'>
							{tUI("vaultSimulator.tier.superior_spirit_blossom_chest")}
						</h3>
						
						{renderAsTable(tUI("vaultSimulator.probSpiritBlossomSuperiorDesc"))}
						
						<div className='pt-3 border-t border-border/50'>
							<h4 className='text-xs font-bold text-primary-600 uppercase tracking-wider mb-2 flex items-center gap-1.5'>
								<span className='w-1.5 h-1.5 bg-primary-500 rounded-full' />
								{tUI("vaultSimulator.sourceTitle")}
							</h4>
							<div className='bg-surface-bg/80 p-3 rounded-xl border border-border/50 shadow-inner'>
								{renderSources(tUI("vaultSimulator.sources.superior_spirit_blossom_chest"))}
							</div>
						</div>
					</div>
				)}

				{/* Silver Star Vessel */}
				{show(["silver_star_vessel"]) && (
					<div className='space-y-3 bg-input-bg/20 p-4 sm:p-5 rounded-2xl border border-border hover:border-primary-500/30 transition-all duration-300 shadow-sm relative overflow-hidden group'>
						<div className='absolute inset-0 bg-gradient-to-br from-slate-300/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
						<h3 className='text-lg sm:text-xl font-bold text-slate-300 uppercase italic underline underline-offset-[6px] decoration-2 decoration-slate-300/30 inline-block'>
							{tUI("vaultSimulator.tier.silver_star_vessel")}
						</h3>
						
						{renderAsTable(tUI("vaultSimulator.probSilverStarVesselDesc"))}
						
						<div className='pt-3 border-t border-border/50'>
							<h4 className='text-xs font-bold text-primary-600 uppercase tracking-wider mb-2 flex items-center gap-1.5'>
								<span className='w-1.5 h-1.5 bg-primary-500 rounded-full' />
								{tUI("vaultSimulator.sourceTitle")}
							</h4>
							<div className='bg-surface-bg/80 p-3 rounded-xl border border-border/50 shadow-inner'>
								{renderSources(tUI("vaultSimulator.sources.silver_star_vessel"))}
							</div>
						</div>
					</div>
				)}

				{/* Gold Star Vessel */}
				{show(["gold_star_vessel"]) && (
					<div className='space-y-3 bg-input-bg/20 p-4 sm:p-5 rounded-2xl border border-border hover:border-primary-500/30 transition-all duration-300 shadow-sm relative overflow-hidden group'>
						<div className='absolute inset-0 bg-gradient-to-br from-amber-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
						<h3 className='text-lg sm:text-xl font-bold text-amber-400 uppercase italic underline underline-offset-[6px] decoration-2 decoration-amber-400/30 inline-block'>
							{tUI("vaultSimulator.tier.gold_star_vessel")}
						</h3>
						
						{renderAsTable(tUI("vaultSimulator.probGoldStarVesselDesc"))}
						
						<div className='pt-3 border-t border-border/50'>
							<h4 className='text-xs font-bold text-primary-600 uppercase tracking-wider mb-2 flex items-center gap-1.5'>
								<span className='w-1.5 h-1.5 bg-primary-500 rounded-full' />
								{tUI("vaultSimulator.sourceTitle")}
							</h4>
							<div className='bg-surface-bg/80 p-3 rounded-xl border border-border/50 shadow-inner'>
								{renderSources(tUI("vaultSimulator.sources.gold_star_vessel"))}
							</div>
						</div>
					</div>
				)}

				{/* Nova Crystal Vessel */}
				{show(["nova_crystal_vessel"]) && (
					<div className='space-y-3 bg-input-bg/20 p-4 sm:p-5 rounded-2xl border border-border hover:border-primary-500/30 transition-all duration-300 shadow-sm relative overflow-hidden group'>
						<div className='absolute inset-0 bg-gradient-to-br from-cyan-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
						<h3 className='text-lg sm:text-xl font-bold text-cyan-400 uppercase italic underline underline-offset-[6px] decoration-2 decoration-cyan-400/30 inline-block'>
							{tUI("vaultSimulator.tier.nova_crystal_vessel")}
						</h3>
						
						{renderAsTable(tUI("vaultSimulator.probNovaCrystalVesselDesc"))}
						
						<div className='pt-3 border-t border-border/50'>
							<h4 className='text-xs font-bold text-primary-600 uppercase tracking-wider mb-2 flex items-center gap-1.5'>
								<span className='w-1.5 h-1.5 bg-primary-500 rounded-full' />
								{tUI("vaultSimulator.sourceTitle")}
							</h4>
							<div className='bg-surface-bg/80 p-3 rounded-xl border border-border/50 shadow-inner'>
								{renderSources(tUI("vaultSimulator.sources.nova_crystal_vessel"))}
							</div>
						</div>
					</div>
				)}

				{/* Minor Gemstone Vessel */}
				{show(["minor_gemstone_vessel"]) && (
					<div className='space-y-3 bg-input-bg/20 p-4 sm:p-5 rounded-2xl border border-border hover:border-primary-500/30 transition-all duration-300 shadow-sm relative overflow-hidden group'>
						<div className='absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none' />
						<h3 className='text-lg sm:text-xl font-bold text-amber-500 uppercase italic underline underline-offset-[6px] decoration-2 decoration-amber-500/30 inline-block'>
							{tUI("vaultSimulator.tier.minor_gemstone_vessel")}
						</h3>
						
						{renderAsTable(tUI("vaultSimulator.probMinorGemstoneDesc"))}
						
						<div className='pt-3 border-t border-border/50'>
							<h4 className='text-xs font-bold text-primary-600 uppercase tracking-wider mb-2 flex items-center gap-1.5'>
								<span className='w-1.5 h-1.5 bg-primary-500 rounded-full' />
								{tUI("vaultSimulator.sourceTitle")}
							</h4>
							<div className='bg-surface-bg/80 p-3 rounded-xl border border-border/50 shadow-inner'>
								{renderSources(tUI("vaultSimulator.sources.minor_gemstone_vessel"))}
							</div>
						</div>
					</div>
				)}

				{/* Major Gemstone Vessel */}
				{show(["major_gemstone_vessel"]) && (
					<div className='space-y-3 bg-input-bg/20 p-4 sm:p-5 rounded-2xl border border-border hover:border-primary-500/30 transition-all duration-300 shadow-sm relative overflow-hidden group'>
						<div className='absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none' />
						<h3 className='text-lg sm:text-xl font-bold text-orange-500 uppercase italic underline underline-offset-[6px] decoration-2 decoration-orange-500/30 inline-block'>
							{tUI("vaultSimulator.tier.major_gemstone_vessel")}
						</h3>
						
						{renderAsTable(tUI("vaultSimulator.probMajorGemstoneDesc"))}
						
						<div className='pt-3 border-t border-border/50'>
							<h4 className='text-xs font-bold text-primary-600 uppercase tracking-wider mb-2 flex items-center gap-1.5'>
								<span className='w-1.5 h-1.5 bg-primary-500 rounded-full' />
								{tUI("vaultSimulator.sourceTitle")}
							</h4>
							<div className='bg-surface-bg/80 p-3 rounded-xl border border-border/50 shadow-inner'>
								{renderSources(tUI("vaultSimulator.sources.major_gemstone_vessel"))}
							</div>
						</div>
					</div>
				)}

				{/* Bronze Reliquary */}
				{show(["reliquary_bronze"]) && (
					<div className='space-y-3 bg-input-bg/20 p-4 sm:p-5 rounded-2xl border border-border hover:border-primary-500/30 transition-all duration-300 shadow-sm relative overflow-hidden group'>
						<div className='absolute inset-0 bg-gradient-to-br from-orange-300/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none' />
						<h3 className='text-lg sm:text-xl font-bold text-orange-300 uppercase italic underline underline-offset-[6px] decoration-2 decoration-orange-300/30 inline-block'>
							{tUI("vaultSimulator.tier.reliquary_bronze")}
						</h3>
						
						{renderAsTable(tUI("vaultSimulator.probBronzeReliquaryDesc"))}
						
						<div className='pt-3 border-t border-border/50'>
							<h4 className='text-xs font-bold text-primary-600 uppercase tracking-wider mb-2 flex items-center gap-1.5'>
								<span className='w-1.5 h-1.5 bg-primary-500 rounded-full' />
								{tUI("vaultSimulator.sourceTitle")}
							</h4>
							<div className='bg-surface-bg/80 p-3 rounded-xl border border-border/50 shadow-inner'>
								{renderSources(tUI("vaultSimulator.sources.reliquary_bronze"))}
							</div>
						</div>
					</div>
				)}

				{/* Silver Reliquary */}
				{show(["reliquary_silver"]) && (
					<div className='space-y-3 bg-input-bg/20 p-4 sm:p-5 rounded-2xl border border-border hover:border-primary-500/30 transition-all duration-300 shadow-sm relative overflow-hidden group'>
						<div className='absolute inset-0 bg-gradient-to-br from-blue-300/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none' />
						<h3 className='text-lg sm:text-xl font-bold text-blue-300 uppercase italic underline underline-offset-[6px] decoration-2 decoration-blue-300/30 inline-block'>
							{tUI("vaultSimulator.tier.reliquary_silver")}
						</h3>
						
						{renderAsTable(tUI("vaultSimulator.probSilverReliquaryDesc"))}
						
						<div className='pt-3 border-t border-border/50'>
							<h4 className='text-xs font-bold text-primary-600 uppercase tracking-wider mb-2 flex items-center gap-1.5'>
								<span className='w-1.5 h-1.5 bg-primary-500 rounded-full' />
								{tUI("vaultSimulator.sourceTitle")}
							</h4>
							<div className='bg-surface-bg/80 p-3 rounded-xl border border-border/50 shadow-inner'>
								{renderSources(tUI("vaultSimulator.sources.reliquary_silver"))}
							</div>
						</div>
					</div>
				)}

				{/* Gold Reliquary */}
				{show(["reliquary_gold"]) && (
					<div className='space-y-3 bg-input-bg/20 p-4 sm:p-5 rounded-2xl border border-border hover:border-primary-500/30 transition-all duration-300 shadow-sm relative overflow-hidden group'>
						<div className='absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none' />
						<h3 className='text-lg sm:text-xl font-bold text-yellow-400 uppercase italic underline underline-offset-[6px] decoration-2 decoration-yellow-400/30 inline-block'>
							{tUI("vaultSimulator.tier.reliquary_gold")}
						</h3>
						
						{renderAsTable(tUI("vaultSimulator.probGoldReliquaryDesc"))}
						
						<div className='pt-3 border-t border-border/50'>
							<h4 className='text-xs font-bold text-primary-600 uppercase tracking-wider mb-2 flex items-center gap-1.5'>
								<span className='w-1.5 h-1.5 bg-primary-500 rounded-full' />
								{tUI("vaultSimulator.sourceTitle")}
							</h4>
							<div className='bg-surface-bg/80 p-3 rounded-xl border border-border/50 shadow-inner'>
								{renderSources(tUI("vaultSimulator.sources.reliquary_gold"))}
							</div>
						</div>
					</div>
				)}
			</div>
		</motion.div>
	);
};

export default VaultProbabilityInfo;
