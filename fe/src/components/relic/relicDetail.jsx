// src/pages/relicDetail.jsx
import { memo, useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "../../hooks/useTranslation";
import { getRarityKey } from "../../utils/i18nHelpers";
import { useMarkupResolution } from "../../hooks/useMarkupResolution";
import EntityDetailLayout from "../common/EntityDetailLayout";

function RelicDetail() {
	const { relicCode } = useParams();
	const navigate = useNavigate();
	const { tUI, tDynamic } = useTranslation();

	const [relic, setRelic] = useState(null);
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
				const decodedCode = decodeURIComponent(relicCode);

				const [relicRes, championsRes] = await Promise.all([
					fetch(`${apiUrl}/api/relics/${encodeURIComponent(decodedCode)}`),
					fetch(`${apiUrl}/api/champions?limit=-1`),
				]);

				if (!relicRes.ok) {
					throw new Error(
						relicRes.status === 404
							? `${tUI("relicDetail.notFoundPrefix")} ${decodedCode}`
							: tUI("relicDetail.errorLoad"),
					);
				}

				const foundRelic = await relicRes.json();
				const championsData = championsRes.ok
					? await championsRes.json()
					: { items: [] };

				setRelic(foundRelic);
				setChampions(championsData.items || []);
			} catch (err) {
				setError(err.message || tUI("common.error"));
			} finally {
				setTimeout(() => setLoading(false), 800);
			}
		};

		if (relicCode) fetchData();
	}, [relicCode, apiUrl, tUI]);

	const relicName = relic ? tDynamic(relic, "name") : "";
	const relicDesc = relic
		? tDynamic(relic, "description") || tDynamic(relic, "descriptionRaw")
		: "";
	const relicRarity = relic?.rarity
		? tDynamic(relic, "rarity") || tUI(`shared.rarity.${getRarityKey(relic.rarity)}`) || relic.rarity
		: "";

	useEffect(() => {
		if (relicDesc) {
			resolveEntities(relicDesc);
		}
	}, [relicDesc, resolveEntities]);

	const compatibleChampions = useMemo(() => {
		if (!relic || !champions.length) return [];
		return champions
			.filter(champ =>
				champ.relicSets?.some(set => set.includes(relic.relicCode)),
			)
			.map(champ => ({
				championID: champ.championID,
				name: tDynamic(champ, "name"),
				image: champ.assets?.[0]?.avatar || "/fallback-image.svg",
			}));
	}, [relic, champions, tDynamic]);

	return (
		<EntityDetailLayout
			loading={loading}
			error={error}
			onBack={() => navigate(-1)}
			pageTitle={relicName || tUI("relicDetail.title")}
			pageDescription={`${tUI("relicDetail.metaDesc")} ${relicName}`}
			pageKeywords={`${relicName}, relic, ${relicRarity}, LoR relic, PoC relic`}
			imageSrc={relic?.assetAbsolutePath}
			name={relicName}
			rarity={relicRarity}
			description={relicDesc}
			compatibleChampions={compatibleChampions}
			labels={{
				back: tUI("common.back"),
				compatibleTitle: tUI("relicDetail.compatibleChampions"),
				noCompatible: tUI("relicDetail.noCompatibleChampions"),
				errorTitle: tUI("common.error")
			}}
		/>
	);
}

export default memo(RelicDetail);
