// src/pages/runeDetail.jsx
import { memo, useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "../../hooks/useTranslation";
import { getRarityKey } from "../../utils/i18nHelpers";
import { useMarkupResolution } from "../../hooks/useMarkupResolution";
import EntityDetailLayout from "../common/EntityDetailLayout";

function RuneDetail() {
	const { runeCode } = useParams();
	const navigate = useNavigate();
	const { tUI, tDynamic } = useTranslation();

	const [rune, setRune] = useState(null);
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
				const decodedCode = decodeURIComponent(runeCode);

				const [runeRes, championsRes] = await Promise.all([
					fetch(`${apiUrl}/api/runes/${encodeURIComponent(decodedCode)}`),
					fetch(`${apiUrl}/api/champions?limit=-1`),
				]);

				if (!runeRes.ok) {
					throw new Error(
						runeRes.status === 404
							? `${tUI("runeDetail.notFoundPrefix")} ${decodedCode}`
							: tUI("runeDetail.errorLoad"),
					);
				}

				const foundRune = await runeRes.json();
				const championsData = championsRes.ok
					? await championsRes.json()
					: { items: [] };

				setRune(foundRune);
				setChampions(championsData.items || []);
			} catch (err) {
				setError(err.message || tUI("common.error"));
			} finally {
				setTimeout(() => setLoading(false), 800);
			}
		};

		if (runeCode) fetchData();
	}, [runeCode, apiUrl, tUI]);

	const runeName = rune ? tDynamic(rune, "name") : "";
	const runeDesc = rune
		? tDynamic(rune, "description") || tDynamic(rune, "descriptionRaw")
		: "";
	const runeRarity = rune?.rarity
		? tDynamic(rune, "rarity") || tUI(`shared.rarity.${getRarityKey(rune.rarity)}`) || rune.rarity
		: "";

	useEffect(() => {
		if (runeDesc) {
			resolveEntities(runeDesc);
		}
	}, [runeDesc, resolveEntities]);

	const compatibleChampions = useMemo(() => {
		if (!rune || !champions.length) return [];
		return champions
			.filter(champ =>
				champ.runeIds?.some(id => id === rune.runeCode),
			)
			.map(champ => ({
				id: champ.championID,
				name: tDynamic(champ, "name"),
				image: champ.assets?.[0]?.avatar || "/fallback-image.svg",
			}));
	}, [rune, champions, tDynamic]);

	return (
		<EntityDetailLayout
			loading={loading}
			error={error}
			onBack={() => navigate(-1)}
			pageTitle={runeName || tUI("runeDetail.title")}
			pageDescription={`${tUI("runeDetail.metaDesc")} ${runeName}`}
			pageKeywords={`${runeName}, rune, ${runeRarity}, LoR rune, PoC rune`}
			imageSrc={rune?.assetAbsolutePath}
			name={runeName}
			rarity={runeRarity}
			description={runeDesc}
			compatibleChampions={compatibleChampions}
			labels={{
				back: tUI("common.back"),
				compatibleTitle: tUI("runeDetail.compatibleChampions"),
				noCompatible: tUI("runeDetail.noCompatibleChampions"),
				errorTitle: tUI("common.error")
			}}
		/>
	);
}

export default memo(RuneDetail);
