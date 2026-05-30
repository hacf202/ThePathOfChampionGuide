import { memo, useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { getRarityKey } from "@/utils/i18nHelpers";
import { useMarkupResolution } from "@/hooks/useMarkupResolution";
import EntityDetailLayout from "@/components/common/EntityDetailLayout";
import MarkupRenderer from "@/components/common/MarkupRenderer";


function ItemDetail() {
	const { itemCode } = useParams();
	const navigate = useNavigate();
	const { tUI, tDynamic } = useTranslation();

	const [item, setItem] = useState(null);
	const [champions, setChampions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const { resolveEntities } = useMarkupResolution();

	const apiUrl = import.meta.env.VITE_API_URL;

	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);
				setError(null);
				const decodedCode = decodeURIComponent(itemCode);

				const [itemRes, championsRes] = await Promise.all([
					fetch(`${apiUrl}/api/items/${encodeURIComponent(decodedCode)}`),
					fetch(`${apiUrl}/api/champions?limit=-1`),
				]);

				if (!itemRes.ok) {
					throw new Error(
						itemRes.status === 404
							? `${tUI("itemDetail.notFoundPrefix")} ${decodedCode}`
							: tUI("itemDetail.errorLoad"),
					);
				}

				const foundItem = await itemRes.json();
				const championsData = championsRes.ok
					? await championsRes.json()
					: { items: [] };

				setItem(foundItem);
				setChampions(championsData.items || []);
			} catch (err) {
				setError(err.message || tUI("common.error"));
			} finally {
				setTimeout(() => setLoading(false), 800);
			}
		};

		if (itemCode) fetchData();
	}, [itemCode, apiUrl, tUI]);

	const itemName = item ? tDynamic(item, "name") : "";
	const itemDesc = item
		? tDynamic(item, "description") || tDynamic(item, "descriptionRaw")
		: "";
	const itemRarity = item?.rarity
		? tDynamic(item, "rarity") || tUI(`shared.rarity.${getRarityKey(item.rarity)}`) || item.rarity
		: "";

	const itemReqs = item?.requirements
		? tDynamic(item, "requirements") || item.requirements
		: "";

	const itemType = item
		? tDynamic(item, "type") || item.type
		: null;
	const itemTypeArr = Array.isArray(itemType) ? itemType : itemType ? [itemType] : [];

	useEffect(() => {
		if (itemDesc) {
			resolveEntities(itemDesc);
		}
	}, [itemDesc, resolveEntities]);

	const compatibleChampions = useMemo(() => {
		if (!item || !champions.length) return [];
		return champions
			.filter(champion =>
				champion.defaultItems?.some(
					defaultItemName => defaultItemName === item.name,
				),
			)
			.map(champion => ({
				championID: champion.championID,
				name: tDynamic(champion, "name"),
				image: champion.assets?.[0]?.avatar || "/fallback-image.svg",
			}));
	}, [item, champions, tDynamic]);

	return (
		<EntityDetailLayout
			loading={loading}
			error={error}
			onBack={() => navigate(-1)}
			pageTitle={itemName || tUI("itemDetail.title")}
			pageDescription={`${tUI("itemDetail.metaDesc")} ${itemName}`}
			pageKeywords={`${itemName}, item, ${itemRarity}, LoR item, PoC item`}
			imageSrc={item?.assetAbsolutePath}
			name={itemName}
			rarity={itemRarity}
			description={itemDesc}
			compatibleChampions={compatibleChampions}
			labels={{
				back: tUI("common.back"),
				compatibleTitle: tUI("itemDetail.compatibleChampions"),
				noCompatible: tUI("itemDetail.noCompatibleChampions"),
				errorTitle: tUI("common.error")
			}}
		>
			{/* Loại vật phẩm */}
			{itemTypeArr.length > 0 && (
				<div className='bg-surface-hover border border-border p-4 rounded-lg mt-4'>
					<h3 className='text-lg sm:text-2xl font-semibold mb-3 font-primary text-primary-500'>
						{tUI("itemDetail.type")}
					</h3>
					<div className='flex flex-wrap gap-2'>
						{itemTypeArr.map((t, i) => (
							<span key={i} className='px-3 py-1 rounded-full text-sm font-semibold bg-primary-500/15 text-primary-400 border border-primary-500/30'>
								{t}
							</span>
						))}
					</div>
				</div>
			)}

			{/* Điều kiện trang bị */}
			{itemReqs && (
				<div className='bg-surface-hover border border-border p-4 rounded-lg mt-4'>
					<h3 className='text-lg sm:text-2xl font-semibold mb-3 font-primary text-primary-500'>
						{tUI("itemDetail.requirements")}
					</h3>
					<p className='text-text-secondary text-base sm:text-lg'>
						<MarkupRenderer text={itemReqs} />
					</p>
				</div>
			)}
		</EntityDetailLayout>
	);
}

export default memo(ItemDetail);
