import { memo, useMemo } from "react";
import { parseMarkup } from "../../utils/markupParser";
import { getRarityKey } from "../../utils/i18nHelpers";
import { getEntityData } from "../../utils/entityLookup"; // 🟢 Import bộ tra cứu mới
import MarkupTooltip from "./MarkupTooltip"; 
import { useTranslation } from "../../hooks/useTranslation"; 

/**
 * MarkupRenderer - Component hiển thị văn bản đánh dấu nâng cao
 */
const MarkupRenderer = memo(({ text, className = "" }) => {
	const { language } = useTranslation(); 
	const segments = useMemo(() => parseMarkup(text), [text]);

	if (!segments || segments.length === 0) return null;

	const renderTag = (segment, index) => {
		const { tagType, tagValue, tagLabel, tagOptions = [] } = segment;
		const data = getEntityData(tagValue, tagType, language);
		
		// Automatically show icon for keywords if available, or if explicitly requested via options
		const showIcon = tagOptions.includes("icon") || (tagType === "k" && data?.icon);
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
				<span className={`inline-flex items-baseline font-bold cursor-help transition-all ${customColorClass}`}>
					{showIcon && data?.icon && (
						<img 
							src={data.icon} 
							alt={tagLabel} 
							className="w-5 h-5 object-contain mr-1 flex-shrink-0 translate-y-[3px]" 
						/>
					)}
					<span className="whitespace-pre-wrap leading-none">
						{tagLabel}
					</span>
				</span>
			</MarkupTooltip>
		);

		switch (tagType) {
			case "k": // Keyword
				return renderWithTooltip(tagLabel, "text-yellow-500 hover:text-yellow-400");

			case "c": // Champion
			case "r": // Relic
			case "p": // Power
			case "i": // Item
			case "cd": // Card
				const colorClasses = {
					c: "text-primary-500 hover:text-primary-400",
					r: "text-purple-500 hover:text-purple-400",
					p: "text-blue-500 hover:text-blue-400",
					i: "text-emerald-500 hover:text-emerald-400",
					cd: "text-orange-500 hover:text-orange-400"
				};
				
				const linkPath = {
					c: `/champion/${data?.id || tagValue}`,
					r: `/relic/${data?.id || tagValue}`,
					p: `/power/${data?.id || tagValue}`,
					i: `/item/${data?.id || tagValue}`
				}[tagType];

				return renderWithTooltip(tagLabel, colorClasses[tagType] || "", noLink ? null : linkPath);

			case "v": { // Value / Stats
				const styles = {
					attack: "text-red-500",
					power: "text-red-500",
					health: "text-red-400",
					mana: "text-blue-400",
					spellmana: "text-blue-300",
					cost: "text-blue-500",
					damage: "text-orange-500",
				};
				const colorClass = styles[tagValue.toLowerCase()] || "text-green-500";
				return (
					<span key={index} className={`font-mono font-bold ${colorClass}`}>
						{tagLabel}
					</span>
				);
			}

			case "cap": // Star Level (Cấp sao)
			case "star": {
				const count = parseInt(tagValue) || 1;
				const stars = Array(count).fill("★").join("");
				return (
					<span key={index} className="inline-flex items-center text-yellow-400 font-bold drop-shadow-[0_0_2px_rgba(0,0,0,0.5)]">
						{stars}
						<span className="ml-1 text-sm text-text-primary">({tagLabel})</span>
					</span>
				);
			}

			case "ra": // Rarity
			case "rarity": {
				const key = getRarityKey(tagValue);
				const styles = {
					common: "text-gray-400",
					rare: "text-blue-500",
					epic: "text-purple-500",
					legendary: "text-yellow-500",
					special: "text-red-500",
				};

				if (key === "special") {
					return (
						<span key={index} className='font-extrabold bg-gradient-to-t from-[#e8b4e6] to-[#3b82f6] bg-clip-text text-transparent'>
							{tagLabel}
						</span>
					);
				}

				return (
					<span key={index} className={`font-bold ${styles[key] || "text-text-primary"}`}>
						{tagLabel}
					</span>
				);
			}

			default:
				return <span key={index}>{tagLabel}</span>;
		}
	};

	return (
		<span className={`markup-container whitespace-pre-wrap mb-1 block ${className}`}>
			{segments.map((segment, index) => {
				if (segment.type === "text") {
					return <span key={index} className="whitespace-pre-wrap">{segment.value}</span>;
				}

				if (segment.type === "html_open") {
					switch (segment.tag) {
						case "b": return <strong key={index} className='font-bold text-text-primary' />;
						case "i": return <em key={index} className='italic text-text-secondary' />;
						case "br": return <br key={index} />;
						default: return null;
					}
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
