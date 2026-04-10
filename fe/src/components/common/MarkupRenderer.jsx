import { memo, useMemo, useEffect } from "react";
import { parseMarkup } from "../../utils/markupParser";
import { getRarityKey } from "../../utils/i18nHelpers";
import { getEntityData } from "../../utils/entityLookup";
import MarkupTooltip from "./MarkupTooltip"; 
import { useTranslation } from "../../hooks/useTranslation"; 
import { useMarkupResolution } from "../../hooks/useMarkupResolution"; 

/**
 * MarkupRenderer - Trình hiển thị văn bản đánh dấu nâng cao cho POC Guide
 * Hỗ trợ các thẻ: [type:value|label|options] và các thẻ định dạng HTML đơn giản
 */
const MarkupRenderer = memo(({ text, className = "" }) => {
	const { language } = useTranslation(); 
	const { resolveEntities } = useMarkupResolution();
	const segments = useMemo(() => parseMarkup(text), [text]);

	useEffect(() => {
		if (text) resolveEntities(text);
	}, [text, resolveEntities]);

	if (!segments || segments.length === 0) return null;

	const renderTag = (segment, index) => {
		const { tagType, tagValue, tagLabel, tagOptions = [] } = segment;
		const data = getEntityData(tagValue, tagType, language);
		
		// Tùy chọn hiển thị
		const showIcon = (tagOptions.includes("icon") || (tagType === "k" && data?.icon)) && !tagOptions.includes("no-icon");
		const onlyIcon = tagOptions.includes("only-icon");
		const noLink = tagOptions.includes("no-link");

		const renderWithTooltip = (content, customColorClass = "", href = null) => (
			<MarkupTooltip
				key={index}
				title={data?.name || tagLabel}
				description={data?.description}
				icon={data?.icon}
				fullImage={data?.fullImage}
				options={tagOptions}
				rarity={data?.rarity}
				type={data?.type || tagType}
				href={href}
			>
				<span className={`inline-flex items-baseline font-bold cursor-help transition-all duration-200 border-b border-white/0 hover:border-current ${customColorClass}`}>
					{showIcon && data?.icon && (
						<img 
							src={data.icon} 
							alt={tagLabel} 
							className={`w-4 h-4 object-contain ${onlyIcon ? "" : "mr-1"} flex-shrink-0 translate-y-[2px]`} 
						/>
					)}
					{!onlyIcon && (
						<span className="whitespace-pre-wrap leading-none">
							{tagLabel}
						</span>
					)}
				</span>
			</MarkupTooltip>
		);

		switch (tagType) {
			case "k": 
			case "keyword":
				return renderWithTooltip(tagLabel, "text-yellow-500 hover:text-yellow-400");

			case "c": 
			case "champion":
				return renderWithTooltip(tagLabel, "text-primary-500 hover:text-primary-400", noLink ? null : `/champion/${data?.id || tagValue}`);

			case "r": 
			case "relic":
				return renderWithTooltip(tagLabel, "text-purple-500 hover:text-purple-400", noLink ? null : `/relic/${data?.id || tagValue}`);

			case "p": 
			case "power":
				return renderWithTooltip(tagLabel, "text-blue-500 hover:text-blue-400", noLink ? null : `/power/${data?.id || tagValue}`);

			case "i": 
			case "item":
				return renderWithTooltip(tagLabel, "text-emerald-500 hover:text-emerald-400", noLink ? null : `/item/${data?.id || tagValue}`);

			case "cd": 
			case "card":
				return renderWithTooltip(tagLabel, "text-orange-500 hover:text-orange-400", noLink ? null : `/card/${data?.id || tagValue}`);

			case "v": 
			case "stat": { 
				const styles = {
					attack: "text-red-500", atk: "text-red-500", cong: "text-red-500",
					health: "text-red-400", hp: "text-red-400", thu: "text-red-400",
					mana: "text-blue-400", nangluong: "text-blue-400",
					cost: "text-blue-500", tieuhao: "text-blue-500",
					damage: "text-orange-500", 
					level: "text-primary-500", 
					gold: "text-yellow-500"
				};
				const colorClass = styles[tagValue.toLowerCase()] || "text-green-500";
				return (
					<span key={index} className={`font-mono font-black drop-shadow-sm ${colorClass}`}>
						{tagLabel}
					</span>
				);
			}

			case "cap": 
			case "star": {
				const count = parseInt(tagValue) || 1;
				const stars = Array(count).fill("★").join("");
				return (
					<span key={index} className="inline-flex items-center text-yellow-500 font-bold drop-shadow-sm">
						{stars}
						<span className="ml-1 text-[10px] text-text-secondary uppercase">({tagLabel})</span>
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
						<span key={index} className='font-black bg-gradient-to-r from-pink-400 to-blue-500 bg-clip-text text-transparent uppercase text-[11px]'>
							{tagLabel}
						</span>
					);
				}

				return (
					<span key={index} className={`font-black uppercase text-[10px] tracking-widest ${styles[key] || "text-text-primary"}`}>
						{tagLabel}
					</span>
				);
			}

			default:
				return <span key={index} className="underline decoration-dotted decoration-border">{tagLabel}</span>;
		}
	};

	return (
		<span className={`markup-container whitespace-pre-wrap mb-1 block leading-relaxed ${className}`}>
			{segments.map((segment, index) => {
				if (segment.type === "text") {
					return <span key={index}>{segment.value}</span>;
				}

				if (segment.type === "html_open") {
					switch (segment.tag) {
						case "b": return <strong key={index} className='font-bold text-text-primary' />;
						case "i": return <em key={index} className='italic' />;
						case "br": return <br key={index} />;
						default: return null;
					}
				}
                
                if (segment.type === "html_close") {
                    return null;
                }

				if (segment.type === "tag") {
					return renderTag(segment, index);
				}

				return null;
			})}
		</span>
	);
});

export default MarkupRenderer;
