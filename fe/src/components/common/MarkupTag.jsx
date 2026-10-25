import { memo, useState, useEffect } from "react";
import { getEntityData, subscribeEntities } from "@/utils/entityLookup";
import { generateSlug } from "@/utils/slugify";
import { getRarityKey } from "@/utils/i18nHelpers";
import MarkupTooltip from "./MarkupTooltip"; 
import { useTranslation } from "@/hooks/useTranslation"; 

const MarkupTag = memo(({ segment, noTooltip = false }) => {
	const { language } = useTranslation();
	const [, setRevision] = useState(0);

	useEffect(() => {
		return subscribeEntities(() => setRevision(r => r + 1));
	}, []);

	const { tagType, tagValue, tagLabel, tagOptions = [] } = segment;
	const data = getEntityData(tagValue, tagType, language);
	
	const getAutoLabel = () => {
		// Ưu tiên tham chiếu mã thực thể ở phía trước (tagValue) để lấy tên đúng theo ngôn ngữ
		if (data?.name) {
			return data.name;
		}
		// Fallback khi chưa có data trong cache hoặc không tìm thấy thực thể
		return tagLabel || tagValue;
	};

	const displayLabelToUse = getAutoLabel();
	
	// Tùy chọn hiển thị
	const showIcon = (tagOptions.includes("icon") || (tagType === "k" && data?.icon)) && !tagOptions.includes("no-icon");
	const onlyIcon = tagOptions.includes("only-icon");
	const noLink = tagOptions.includes("no-link");

	const renderWithTooltip = (content, ColorClass = "", href = null, Desc = undefined) => {
		const innerContent = (
			<span className={`inline-flex items-baseline font-bold transition-all duration-200 border-b border-white/0 hover:border-current ${ColorClass} ${noTooltip ? '' : 'cursor-help'}`}>
				{showIcon && data?.icon && (
					<img 
						src={data.icon} 
						alt={displayLabelToUse || tagLabel} 
						className={`w-4 h-4 object-contain ${onlyIcon ? "" : "mr-1"} flex-shrink-0 translate-y-[2px]`} 
					/>
				)}
				{!onlyIcon && (
					<span className="whitespace-pre-wrap leading-none">
						{content}
					</span>
				)}
			</span>
		);

		if (noTooltip) return innerContent;

		return (
			<MarkupTooltip
				title={data?.name || displayLabelToUse}
				description={Desc != null ? Desc : data?.description}
				icon={data?.icon}
				fullImage={data?.fullImage}
				options={tagOptions}
				rarity={data?.rarity}
				type={data?.type || tagType}
				href={href}
				noTooltip={noTooltip}
				items={tagOptions.reduce((acc, opt) => {
					const reserved = ["icon", "no-icon", "no-link", "only-icon", "img-full", "img-icon"];
					if (reserved.includes(opt.toLowerCase())) return acc;
					
					const resolvedItem = getEntityData(opt, "i", language) || getEntityData(opt, "r", language);
					if (resolvedItem) acc.push({ ...resolvedItem, itemCode: resolvedItem.id });
					return acc;
				}, [])}
			>
				{innerContent}
			</MarkupTooltip>
		);
	};

	switch (tagType) {
		case "k": 
		case "keyword": {
			const hasIcon = !!data?.icon;
			const displayLabel = displayLabelToUse;
			
			// Phân loại màu sắc cho từ khóa (Premium)
			const keywordColors = {
				"Lifesteal": "text-emerald-400",
				"Overwhelm": "text-orange-400",
				"Quick Attack": "text-yellow-400",
				"Regeneration": "text-green-400",
				"Barrier": "text-blue-300",
				"Tough": "text-slate-300",
				"Elusive": "text-purple-400",
				"Fury": "text-red-500",
				"Fearsome": "text-indigo-400",
			};
			
			const colorClass = keywordColors[data?.nameRef] || keywordColors[tagValue] || "text-yellow-400";

			const innerKeyword = (
				<span className={`inline-flex items-baseline font-bold transition-all duration-200 border-b border-white/0 hover:border-current ${colorClass} ${noTooltip ? '' : 'cursor-help'}`}>
					{hasIcon && data?.icon && (
						<img 
							src={data.icon} 
							alt={displayLabel || tagLabel} 
							className="w-4 h-4 object-contain mr-1 flex-shrink-0 translate-y-[2px]" 
						/>
					)}
					<span className="whitespace-pre-wrap leading-none">
						{displayLabel}
					</span>
				</span>
			);

			if (noTooltip) return <span>{innerKeyword}</span>;

			return (
				<MarkupTooltip
					title={data?.name || displayLabel}
					description={data?.description}
					icon={data?.icon}
					fullImage={data?.fullImage}
					options={tagOptions}
					rarity={data?.rarity}
					type={data?.type || tagType}
					noTooltip={noTooltip}
				>
					{innerKeyword}
				</MarkupTooltip>
			);
		}

		case "c": 
		case "champion":
			return renderWithTooltip(displayLabelToUse, "text-sky-400 hover:text-sky-300", noLink ? null : `/champion/${generateSlug(data?.name || data?.id || tagValue)}`, null);

		case "r": 
		case "relic":
			return renderWithTooltip(displayLabelToUse, "text-purple-400 hover:text-purple-300", noLink ? null : `/relic/${data?.id || tagValue}`);

		case "p": 
		case "power":
			return renderWithTooltip(displayLabelToUse, "text-blue-400 hover:text-blue-300", noLink ? null : `/power/${data?.id || tagValue}`);

		case "i": 
		case "item":
			return renderWithTooltip(displayLabelToUse, "text-emerald-400 hover:text-emerald-300", noLink ? null : `/item/${data?.id || tagValue}`);

		case "cd": 
		case "card":
			return renderWithTooltip(displayLabelToUse, "text-orange-400 hover:text-orange-300", noLink ? null : `/card/${data?.id || tagValue}`);

		case "res":
		case "resource":
			return renderWithTooltip(displayLabelToUse, "text-amber-400 hover:text-amber-300 shadow-sm", noLink ? null : `/resource/${data?.id || tagValue}`);

		case "v": 
		case "stat": { 
			const styles = {
				attack: "text-red-500", atk: "text-red-500", cong: "text-red-500",
				health: "text-rose-400", hp: "text-rose-400", thu: "text-rose-400",
				mana: "text-sky-400", nangluong: "text-sky-400",
				cost: "text-sky-500", tieuhao: "text-sky-500",
				damage: "text-orange-500", 
				level: "text-primary-500", 
				gold: "text-yellow-500"
			};
			const colorClass = styles[tagValue.toLowerCase()] || "text-green-500";
			return (
				<span className={`font-mono font-black drop-shadow-sm ${colorClass}`}>
					{tagLabel || tagValue}
				</span>
			);
		}

		case "cap": 
		case "star": {
			const count = parseInt(tagValue) || 1;
			const stars = Array(count).fill("★").join("");
			return (
				<span className="inline-flex items-center text-yellow-500 font-bold drop-shadow-sm">
					{stars}
					<span className="ml-1 text-[10px] text-text-secondary uppercase">({tagLabel || tagValue})</span>
				</span>
			);
		}

		case "ra": 
		case "rarity": {
			const key = getRarityKey(tagValue);
			const styles = {
				common: "text-slate-400",
				rare: "text-blue-500",
				epic: "text-purple-500",
				legendary: "text-yellow-500",
				special: "text-pink-500",
			};

			if (key === "special") {
				return (
					<span className='font-black bg-gradient-to-r from-pink-400 to-blue-500 bg-clip-text text-transparent uppercase text-[11px]'>
						{tagLabel || tagValue}
					</span>
				);
			}

			return (
				<span className={`font-black uppercase text-[10px] tracking-widest ${styles[key] || "text-text-primary"}`}>
					{tagLabel || tagValue}
				</span>
			);
		}

		default:
			return <span className="underline decoration-dotted decoration-border">{tagLabel || tagValue}</span>;
	}
});

export default MarkupTag;
