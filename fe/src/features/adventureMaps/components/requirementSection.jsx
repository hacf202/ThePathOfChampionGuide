import React, { useState } from "react";
import { Link } from "react-router-dom";

import { Compass, Eye, EyeOff } from "lucide-react";
import Button from "@/components/common/button";
import SafeImage from "@/components/common/SafeImage";
import { useTranslation } from "@/hooks/useTranslation";
import { removeAccents } from "@/utils/vietnameseUtils";
import iconData from "@/assets/data/icon.json";
import { getRegionKey } from "@/utils/i18nHelpers";
import { generateSlug } from "@/utils/slugify";

const RequirementSection = ({ resolvedChampions, adventure }) => {
	const { tUI, tDynamic } = useTranslation();
	const [isVisible, setIsVisible] = useState(true);

	const hasRequirements =
		resolvedChampions?.length > 0 ||
		adventure?.requirement?.regions?.length > 0;

	if (!hasRequirements) return null;

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

	const getRegionIcon = regionName => getRawIcon(regionName);

	const getTranslatedRegion = regionName => {
		const regionKey = getRegionKey(regionName);
		return tUI(`shared.region.${regionKey}`) || regionName;
	};

	return (
		<section className='tactical-card clip-chamfer border border-[var(--tactical-card-border)] p-4 md:p-6 shadow-xl w-full'>
			<div className='flex justify-between items-center border-b border-[var(--tactical-stroke-color)] pb-3 mb-5'>
				<h2 className='text-xl font-display font-black text-[var(--tactical-accent-cyan)] uppercase italic tracking-wide flex items-center gap-2'>
					<Compass size={20} />{" "}
					{tUI("adventureMap.requirementTitle") || "Tướng / Khu Vực Yêu Cầu"}
				</h2>
				<button
					type='button'
					onClick={() => setIsVisible(!isVisible)}
					className='inline-flex items-center gap-1.5 px-3 py-1.5 tactical-card border border-[var(--tactical-card-border)] hover:border-[var(--tactical-accent-cyan)] text-xs font-mono-tech font-bold uppercase text-[var(--tactical-text-main)] hover:text-[var(--tactical-accent-cyan-fg)] transition-all clip-chamfer-sm'
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
					<div className='flex flex-wrap gap-4 pb-2'>
						{resolvedChampions?.map((champ, i) => {
							const avatarUrl =
								champ.assets?.[0]?.avatar ||
								champ.assets?.[0]?.fullAbsolutePath ||
								champ.image ||
								"/fallback-image.svg";
							return (
								<Link
									key={`champ-${i}`}
									to={`/champion/${generateSlug(champ.translations?.en?.name || champ.name || champ.championID || champ.id)}`}
									title={tDynamic(champ, "name")}
									className='group flex flex-col items-center gap-1.5 w-[76px]'
								>
									<div className='w-14 h-14 clip-chamfer-sm border-2 border-[var(--tactical-card-border)] overflow-hidden group-hover:border-[var(--tactical-accent-lime)] transition-colors shadow-sm bg-black/40'>
										<SafeImage
											src={avatarUrl}
											alt={tDynamic(champ, "name")}
											className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-300'
										/>
									</div>
									<span className='text-xs font-display uppercase italic tracking-wider text-[var(--tactical-text-sub)] group-hover:text-[var(--tactical-accent-lime)] text-center truncate w-full transition-colors'>
										{tDynamic(champ, "name")}
									</span>
								</Link>
							);
						})}

						{adventure?.requirement?.regions?.map((reg, i) => (
							<Link
								key={`reg-${i}`}
								to={`/champions?regions=${encodeURIComponent(reg)}`}
								title={getTranslatedRegion(reg)}
								className='group flex flex-col items-center gap-1.5 w-[76px]'
							>
								<div className='w-14 h-14 clip-chamfer-sm border-2 border-[var(--tactical-card-border)] overflow-hidden bg-black/40 group-hover:border-[var(--tactical-accent-cyan)] transition-colors shadow-sm flex items-center justify-center p-2.5'>
									<img
										src={getRegionIcon(reg)}
										alt={reg}
										className='w-full h-full object-contain filter group-hover:scale-110 transition-transform duration-300'
									/>
								</div>
								<span className='text-xs font-mono-tech text-[var(--tactical-text-dim)] group-hover:text-[var(--tactical-accent-cyan)] text-center truncate w-full uppercase transition-colors'>
									{getTranslatedRegion(reg)}
								</span>
							</Link>
						))}
					</div>
				</div>
			)}
		</section>
	);
};

export default RequirementSection;
