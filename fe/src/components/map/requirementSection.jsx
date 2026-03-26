import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, Eye, EyeOff } from "lucide-react";
import Button from "../common/button";
import SafeImage from "../common/SafeImage";
import { useTranslation } from "../../hooks/useTranslation";
import { removeAccents } from "../../utils/vietnameseUtils";
import iconData from "../../assets/data/icon.json";

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
		const regionKey = removeAccents(regionName)
			.toLowerCase()
			.replace(/[^a-z0-9]/g, "");
		return tUI(`region.${regionKey}`) || regionName;
	};

	return (
		<section className='bg-surface-bg border border-border rounded-xl p-2 md:p-4 shadow-sm w-full'>
			<div className='flex justify-between items-center border-b border-border pb-2 mb-4'>
				<h2 className='text-xl font-bold text-primary-500 font-primary uppercase flex items-center gap-2'>
					<Compass size={20} />{" "}
					{tUI("adventureMap.requirementTitle") || "Tướng / Khu Vực Yêu Cầu"}
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
										to={`/champion/${champ.championID || champ.id || champ.name}`}
										title={tDynamic(champ, "name")}
										className='group flex flex-col items-center gap-1 w-[70px]'
									>
										<div className='w-14 h-14 rounded-full border-2 border-border overflow-hidden group-hover:border-primary-500 transition-colors shadow-sm bg-surface-hover'>
											<SafeImage
												src={avatarUrl}
												alt={tDynamic(champ, "name")}
												className='w-full h-full object-cover'
											/>
										</div>
										<span className='text-xs text-text-primary font-medium group-hover:text-primary-500 text-center truncate w-full'>
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
									className='group flex flex-col items-center gap-1 w-[70px]'
								>
									<div className='w-14 h-14 rounded-full border-2 border-border overflow-hidden bg-surface-hover group-hover:border-blue-500 transition-colors shadow-sm flex items-center justify-center p-2'>
										<img
											src={getRegionIcon(reg)}
											alt={reg}
											className='w-full h-full object-contain'
										/>
									</div>
									<span className='text-xs text-text-primary font-medium group-hover:text-blue-500 text-center truncate w-full'>
										{getTranslatedRegion(reg)}
									</span>
								</Link>
							))}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</section>
	);
};

export default RequirementSection;
