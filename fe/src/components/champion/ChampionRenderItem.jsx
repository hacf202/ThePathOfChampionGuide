import { useNavigate } from "react-router-dom";
import { useTranslation } from "../../hooks/useTranslation";
import SafeImage from "../common/SafeImage";
import MarkupRenderer from "../common/MarkupRenderer";

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
			className={`flex items-start gap-1 bg-surface-hover rounded-md h-full p-2 transition-all ${linkPath ? 'cursor-pointer hover:border-primary-500 border border-transparent active:scale-[0.98]' : ''}`}
		>
			<SafeImage
				src={item.assetAbsolutePath || item.image || "/fallback-image.svg"}
				alt={itemName}
				className='w-20 h-20 sm:w-24 sm:h-24 rounded-md shrink-0 object-cover'
				width={96}
				height={96}
			/>
			<div className="min-w-0">
				<h3 className='font-semibold text-text-primary text-lg truncate'>{itemName}</h3>
				{itemDesc && (
					<MarkupRenderer text={itemDesc} className="text-md text-text-secondary mt-1" />
				)}
			</div>
		</div>
	);
};

export default ChampionRenderItem;
