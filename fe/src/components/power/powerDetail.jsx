// src/pages/powerDetail.jsx
import { memo, useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "../../hooks/useTranslation";
import { getRarityKey } from "../../utils/i18nHelpers";
import { useMarkupResolution } from "../../hooks/useMarkupResolution";
import EntityDetailLayout from "../common/EntityDetailLayout";

function PowerDetail() {
	const { powerCode } = useParams();
	const navigate = useNavigate();
	const { tUI, tDynamic } = useTranslation();

	const [power, setPower] = useState(null);
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
				const decodedCode = decodeURIComponent(powerCode);

				const [powerRes, championsRes] = await Promise.all([
					fetch(`${apiUrl}/api/powers/${encodeURIComponent(decodedCode)}`),
					fetch(`${apiUrl}/api/champions?limit=-1`),
				]);

				if (!powerRes.ok) {
					throw new Error(
						powerRes.status === 404
							? `${tUI("powerDetail.notFoundPrefix")} ${decodedCode}`
							: tUI("powerDetail.errorLoad"),
					);
				}

				const foundPower = await powerRes.json();
				const championsData = championsRes.ok
					? await championsRes.json()
					: { items: [] };

				setPower(foundPower);
				setChampions(championsData.items || []);
			} catch (err) {
				setError(err.message || tUI("common.error"));
			} finally {
				setTimeout(() => setLoading(false), 800);
			}
		};

		if (powerCode) fetchData();
	}, [powerCode, apiUrl, tUI]);

	const powerName = power ? tDynamic(power, "name") : "";
	const powerDesc = power
		? tDynamic(power, "description") || tDynamic(power, "descriptionRaw")
		: "";
	const powerRarity = power?.rarity
		? tDynamic(power, "rarity") || tUI(`shared.rarity.${getRarityKey(power.rarity)}`) || power.rarity
		: "";

	useEffect(() => {
		if (powerDesc) {
			resolveEntities(powerDesc);
		}
	}, [powerDesc, resolveEntities]);

	const compatibleChampions = useMemo(() => {
		if (!power || !champions.length) return [];
		return champions
			.filter(champ =>
				champ.adventurePowerIds?.some(id => id === power.powerCode),
			)
			.map(champ => ({
				id: champ.championID,
				name: tDynamic(champ, "name"),
				image: champ.assets?.[0]?.avatar || "/fallback-image.svg",
			}));
	}, [power, champions, tDynamic]);

	return (
		<EntityDetailLayout
			loading={loading}
			error={error}
			onBack={() => navigate(-1)}
			pageTitle={powerName || tUI("powerDetail.title")}
			pageDescription={`${tUI("powerDetail.metaDesc")} ${powerName}`}
			pageKeywords={`${powerName}, power, ${powerRarity}, LoR power, PoC power`}
			imageSrc={power?.assetAbsolutePath}
			name={powerName}
			rarity={powerRarity}
			description={powerDesc}
			compatibleChampions={compatibleChampions}
			labels={{
				back: tUI("common.back"),
				compatibleTitle: tUI("powerDetail.compatibleChampions"),
				noCompatible: tUI("powerDetail.noCompatibleChampions"),
				errorTitle: tUI("common.error")
			}}
		/>
	);
}

export default memo(PowerDetail);
