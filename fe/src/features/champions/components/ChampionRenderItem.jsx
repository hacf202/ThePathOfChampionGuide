import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import SafeImage from "@/components/common/SafeImage";
import MarkupRenderer from "@/components/common/MarkupRenderer";

const ChampionRenderItem = ({ item }) => {
	const { tDynamic } = useTranslation();

	if (!item) return null;
	const linkPath = item.powerCode
		? `/power/${encodeURIComponent(item.powerCode)}`
		: item.relicCode
			? `/relic/${encodeURIComponent(item.relicCode)}`
			: item.itemCode
				? `/item/${encodeURIComponent(item.itemCode)}`
				: item.runeCode
					? `/rune/${encodeURIComponent(item.runeCode)}`
					: null;

	const itemName = tDynamic(item, "name");
	const itemDesc =
		tDynamic(item, "description") || tDynamic(item, "descriptionRaw");

	const navigate = useNavigate();
	const handleItemClick = (e) => {
		if (e.target.closest("a, button")) return;
		if (linkPath) navigate(linkPath);
	};

	return (
		<div 
			onClick={handleItemClick}
			className={`flex flex-row md:flex-col lg:flex-row items-start md:items-center lg:items-start gap-3 bg-surface-hover rounded-md h-full p-2 sm:p-3 transition-all ${linkPath ? 'cursor-pointer hover:border-primary-500 border border-transparent active:scale-[0.98]' : ''}`}
		>
			<SafeImage
				src={item.assetAbsolutePath || item.image || "/fallback-image.svg"}
				alt={itemName}
				className='w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-20 lg:h-20 rounded-md shrink-0 object-cover'
				width={96}
				height={96}
			/>
			<div className="min-w-0 w-full flex flex-col md:items-center lg:items-start md:text-center lg:text-left">
				<h3 className='font-semibold text-text-primary text-base sm:text-lg break-words line-clamp-2 md:line-clamp-none lg:truncate w-full'>{itemName}</h3>
				{itemDesc && (
					<MarkupRenderer text={itemDesc} className="text-sm sm:text-md text-text-secondary mt-1 w-full" />
				)}
			</div>
		</div>
	);
};

export default ChampionRenderItem;
