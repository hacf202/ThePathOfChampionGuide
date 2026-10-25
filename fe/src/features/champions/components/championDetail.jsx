// src/features/champions/components/championDetail.jsx
import { memo, useMemo, useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowUp, XCircle, ChevronLeft } from "lucide-react";

import Button from "@/components/common/button";
import PageTitle from "@/components/common/pageTitle";
import CardCarouselModal from "@/features/cards/components/CardCarouselModal.jsx";

// Sub-components theo phong cách Tactical
import ChampionTableOfContents from "@/features/champions/components/ChampionTableOfContents";
import ChampionHeroSection from "@/features/champions/components/ChampionHeroSection";
import ChampionPowersConstellationSection from "@/features/champions/components/ChampionPowersConstellationSection";
import ChampionRelicGuideSection from "@/features/champions/components/ChampionRelicGuideSection";
import ChampionPriorityItemsSection from "@/features/champions/components/ChampionPriorityItemsSection";
import ChampionCommunitySection from "@/features/champions/components/ChampionCommunitySection";
import ChampionRosterSection from "@/features/champions/components/ChampionRosterSection";

// Import API và i18n
import { api } from "@/context/services/apiHelper";
import { useTranslation } from "@/hooks/useTranslation";
import { useMarkupResolution } from "@/hooks/useMarkupResolution";
import { initEntities } from "@/utils/entityLookup";
import { generateSlug } from "@/utils/slugify";

// --- THÀNH PHẦN SKELETON TACTICAL ---
const ChampionDetailSkeleton = () => (
	<div className="min-h-screen tactical-page p-4 sm:p-10 animate-pulse space-y-8">
		<div className="max-w-7xl mx-auto space-y-6">
			{/* Top bar */}
			<div className="h-10 w-48 bg-white/5 rounded-md clip-chamfer-sm" />
			{/* Hero banner split */}
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-8">
				<div className="lg:col-span-7 space-y-5">
					<div className="h-6 w-32 bg-white/5 rounded" />
					<div className="h-20 sm:h-28 w-3/4 bg-white/10 rounded-lg" />
					<div className="h-24 w-full bg-white/5 rounded-lg border border-white/5" />
					<div className="grid grid-cols-2 gap-4">
						<div className="h-20 bg-white/5 rounded" />
						<div className="h-20 bg-white/5 rounded" />
					</div>
				</div>
				<div className="lg:col-span-5 h-[460px] bg-white/5 rounded-xl border border-white/10 clip-chamfer" />
			</div>
		</div>
	</div>
);

// --- MAIN CONTROLLER COMPONENT ---
function ChampionDetail() {
	const { championID } = useParams();
	const navigate = useNavigate();
	const lastChampionIDRef = useRef(null);

	const { language, tDynamic, tUI } = useTranslation();
	const { resolveEntities } = useMarkupResolution();
	const apiUrl = import.meta.env.VITE_API_URL;

	const [champion, setChampion] = useState(null);
	const [constellationData, setConstellationData] = useState(null);
	const [resolvedPowers, setResolvedPowers] = useState([]);
	const [fetchedBonusStars, setFetchedBonusStars] = useState([]);
	const [resolvedItems, setResolvedItems] = useState([]);
	const [resolvedRelics, setResolvedRelics] = useState([]);
	const [resolvedRunes, setResolvedRunes] = useState([]);
	const [resolvedStartingCards, setResolvedStartingCards] = useState([]);
	const [allChampions, setAllChampions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// Scroll to top button state
	const [showScrollTop, setShowScrollTop] = useState(false);
	useEffect(() => {
		const handleScroll = () => {
			setShowScrollTop(window.scrollY > 500);
		};
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	const scrollToTop = () => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	// Schema SEO
	const championSchema = useMemo(() => {
		if (!champion) return null;
		return {
			"@context": "https://schema.org",
			"@type": ["Article", "TechArticle"],
			headline: `${tDynamic(champion, "name")} | ${tUI("championDetail.title") || "Guide"} | Path of Champions`,
			image: champion.assets?.[0]?.avatar || "",
			genre: "Video Game Guide",
			about: {
				"@type": "VideoGameCharacter",
				name: tDynamic(champion, "name"),
				inLanguage: language === "vi" ? "vi-VN" : "en-US",
			},
		};
	}, [champion, language, tDynamic, tUI]);

	// --- Card Carousel Modal state ---
	const [carouselOpen, setCarouselOpen] = useState(false);
	const [carouselCards, setCarouselCards] = useState([]);
	const [carouselInitialIndex, setCarouselInitialIndex] = useState(0);

	const handleOpenCarousel = useCallback(
		async (card, cardCode) => {
			if (card?.associatedCards?.length > 0) {
				setCarouselCards([card, ...card.associatedCards]);
				setCarouselInitialIndex(0);
				setCarouselOpen(true);
				return;
			}

			try {
				const res = await fetch(`${apiUrl}/api/cards/${cardCode}`);
				if (res.ok) {
					const fullCard = await res.json();
					setCarouselCards([fullCard, ...(fullCard.associatedCards || [])]);
				} else {
					setCarouselCards(card ? [card] : []);
				}
			} catch (err) {
				console.error("Error fetching card for carousel:", err);
				setCarouselCards(card ? [card] : []);
			}
			setCarouselInitialIndex(0);
			setCarouselOpen(true);
		},
		[apiUrl]
	);

	// Fetch Data
	const initData = useCallback(async () => {
		try {
			if (lastChampionIDRef.current !== championID) {
				setLoading(true);
			}

			// 1. Tải nhanh thông tin cơ bản
			const basicData = await api.get(`/champions/${championID}`);
			setChampion(basicData);
			setLoading(false);
			lastChampionIDRef.current = championID;

			// 2. Tải ngầm các dữ liệu nặng (Chòm sao, Đánh giá, Thẻ bài...)
			api.get(`/champions/${championID}/full`)
				.then((response) => {
					const {
						champion: champData,
						constellation: constData,
						resolvedData,
						suggestedChampions,
					} = response;

					setChampion(champData);
					setAllChampions(suggestedChampions || []);
					setConstellationData(constData);
					setFetchedBonusStars(resolvedData.bonusStars || []);
					setResolvedPowers(resolvedData.powers || []);
					setResolvedItems(resolvedData.items || []);
					setResolvedRelics(resolvedData.relics || []);
					setResolvedRunes(resolvedData.runes || []);
					setResolvedStartingCards(resolvedData.cards || []);

					if (resolvedData.cards) {
						initEntities(resolvedData.cards);
					}

					const allTexts = [
						tDynamic(champData, "description"),
						...(resolvedData.powers || []).map((p) => tDynamic(p, "description") || tDynamic(p, "descriptionRaw")),
						...(resolvedData.relics || []).map((r) => tDynamic(r, "description") || tDynamic(r, "descriptionRaw")),
						...(resolvedData.items || []).map((i) => tDynamic(i, "description") || tDynamic(i, "descriptionRaw")),
						...(resolvedData.runes || []).map((r) => tDynamic(r, "description") || tDynamic(r, "descriptionRaw")),
					]
						.filter(Boolean)
						.join(" ");

					if (allTexts) resolveEntities(allTexts);
				})
				.catch((err) => {
					console.error("Lỗi khi tải dữ liệu chi tiết ngầm:", err);
				});
		} catch (err) {
			setError(err.message || tUI("championDetail.errorLoad"));
			setLoading(false);
		}
	}, [championID, tUI, tDynamic, resolveEntities]);

	useEffect(() => {
		setChampion(null);
		setConstellationData(null);
		setLoading(true);
	}, [championID]);

	useEffect(() => {
		initData();
	}, [initData]);

	// Slugify URL for SEO
	useEffect(() => {
		if (champion) {
			const slug = generateSlug(champion.translations?.en?.name || champion.name);
			if (championID !== slug) {
				window.history.replaceState(null, "", `/champion/${slug}`);
			}
		}
	}, [champion, championID]);

	// Xử lý dữ liệu hiển thị Chòm sao
	const constellationInfo = useMemo(() => {
		if (!champion) return { nodes: [], backgroundImage: "" };

		if (constellationData) {
			const nodes = constellationData.nodes.map((node) => {
				let resolvedImage = "/images/placeholder.png";
				let resolvedDescription = node.description || "";
				let resolvedName = node.nodeName || "";

				if (node.nodeType === "starPower" || !node.nodeType) {
					const p = resolvedPowers.find((x) => x.powerCode === node.powerCode);
					if (p) {
						resolvedImage = p.assetAbsolutePath || p.image || resolvedImage;
						resolvedDescription = tDynamic(p, "description") || tDynamic(p, "descriptionRaw") || "";
						resolvedName = tDynamic(p, "name");
					}
				} else {
					const b = fetchedBonusStars.find((x) => x.bonusStarID === node.bonusStarID);
					if (b) {
						resolvedImage = b.image || resolvedImage;
						resolvedName = tDynamic(b, "name");
						resolvedDescription = tDynamic(b, "description");
					}
				}

				return {
					...node,
					name: resolvedName,
					image: resolvedImage,
					description: resolvedDescription,
					pos: node.position || node.pos,
					isRecommended: node.isRecommended || false,
					nodeType: node.nodeType || "starPower",
					requirements: node.requirements || [],
				};
			});
			return { nodes, backgroundImage: constellationData.backgroundImage };
		}

		// Fallback
		const fallbackNodes = (champion.powerStarIds || []).map((id, i) => {
			const p = resolvedPowers.find((x) => x.powerCode === id);
			return {
				nodeID: `fallback-${i}`,
				name: p ? tDynamic(p, "name") : id,
				image: p?.assetAbsolutePath || "/images/placeholder.png",
				description: p ? tDynamic(p, "description") || tDynamic(p, "descriptionRaw") : "",
				pos: { x: 15 + i * 15, y: 50 },
				nextNodes: i < (champion.powerStarIds?.length || 0) - 1 ? [`fallback-${i + 1}`] : [],
				nodeType: "starPower",
				starLevel: i + 1,
				isRecommended: false,
				requirements: [],
			};
		});
		return {
			nodes: fallbackNodes,
			backgroundImage: champion?.assets?.[0]?.avatar,
		};
	}, [champion, constellationData, resolvedPowers, fetchedBonusStars, tDynamic]);

	// Danh sách nâng cấp lá bài qua cấp độ
	const deckUpgrades = useMemo(() => {
		if (!champion?.startingDeck) return [];
		const upgrades = [];
		const LEGACY_LEVELS = [2, 3, 6, 9, 12, 15, 18, 21, 24, 27];
		let counter = 0;

		const allCards = [
			...(champion.startingDeck.baseCards || []),
			...(champion.startingDeck.referenceCards || []),
		];

		allCards.forEach((cd) => {
			const cardEntry = typeof cd === "string" ? { cardCode: cd, itemCodes: [] } : cd;

			if (cardEntry.itemCodes && cardEntry.itemCodes.length > 0) {
				cardEntry.itemCodes.forEach((item) => {
					const itemCode = typeof item === "string" ? item : item.itemCode;
					const unlockLevel =
						typeof item === "string"
							? LEGACY_LEVELS[counter] || 2
							: item.unlockLevel !== undefined
							? item.unlockLevel
							: LEGACY_LEVELS[counter] || 2;

					counter++;

					const resolvedCard = resolvedStartingCards.find((c) => c.cardCode === cardEntry.cardCode);
					const resolvedItem = resolvedItems.find((i) => i.itemCode === itemCode);

					if (resolvedCard && resolvedItem) {
						upgrades.push({
							card: resolvedCard,
							item: resolvedItem,
							cardCode: cardEntry.cardCode,
							unlockLevel: Number(unlockLevel),
						});
					}
				});
			}
		});
		return upgrades;
	}, [champion, resolvedStartingCards, resolvedItems]);

	// Xử lý Render Mảng đa chiều cho Bộ Cổ Vật (Relic Sets)
	const relicSetsToRender = useMemo(() => {
		if (!champion || !champion.relicSets) return [];
		return champion.relicSets
			.map((setObjOrArr, i) => {
				const isArray = Array.isArray(setObjOrArr);
				const relicsList = isArray ? setObjOrArr : setObjOrArr.items || [];
				const description = isArray
					? ""
					: language === "en" && setObjOrArr.translations?.en?.description
					? setObjOrArr.translations.en.description
					: setObjOrArr.description || "";
				const video = isArray ? "" : setObjOrArr.videoLink || "";

				return {
					setNumber: i + 1,
					title: isArray ? "" : setObjOrArr.title || "",
					recommendedStars: isArray ? null : setObjOrArr.recommendedStars,
					comboSteps: isArray ? [] : setObjOrArr.comboSteps || [],
					proTips: isArray ? [] : setObjOrArr.proTips || [],
					translations: isArray ? undefined : setObjOrArr.translations,
					description,
					video,
					relics: relicsList
						.map((id) => resolvedRelics.find((x) => x.relicCode === id))
						.filter(Boolean),
				};
			})
			.filter((s) => s.relics.length > 0);
	}, [champion, resolvedRelics, language]);

	const adventurePowersFull = useMemo(
		() =>
			(champion?.adventurePowerIds || [])
				.map((id) => resolvedPowers.find((x) => x.powerCode === id))
				.filter(Boolean),
		[champion, resolvedPowers]
	);

	const defaultItemsFull = useMemo(
		() =>
			(champion?.itemIds || [])
				.map((id) => resolvedItems.find((x) => x.itemCode === id))
				.filter(Boolean),
		[champion, resolvedItems]
	);

	const runesFull = useMemo(
		() =>
			(champion?.runeIds || [])
				.map((id) => resolvedRunes.find((x) => x.runeCode === id))
				.filter(Boolean),
		[champion, resolvedRunes]
	);

	const starPowersList = useMemo(() => {
		return constellationInfo.nodes.filter((n) => n.nodeType === "starPower");
	}, [constellationInfo.nodes]);

	const bonusStarsList = useMemo(() => {
		return constellationInfo.nodes.filter((n) => n.nodeType !== "starPower");
	}, [constellationInfo.nodes]);

	if (error)
		return (
			<div className="p-10 text-center text-red-500 tactical-page min-h-[80vh] flex flex-col items-center justify-center">
				<XCircle size={48} className="mx-auto mb-4 opacity-50" />
				<p>{error}</p>
				<Button onClick={() => navigate(-1)} className="mt-4">
					{tUI("championDetail.back")}
				</Button>
			</div>
		);

	return (
		<div className="min-h-screen tactical-page font-sans selection:bg-[var(--tactical-accent-lime)] selection:text-white dark:selection:text-black overflow-x-hidden">
			<PageTitle
				title={
					champion
						? `${tDynamic(champion, "name")} PoC Guide - Build & Relics Tốt Nhất | Path of Champions`
						: tUI("championDetail.title")
				}
				description={
					champion
						? `Hướng dẫn cách chơi ${tDynamic(champion, "name")} chi tiết trong The Path of Champions (PoC) Legends of Runeterra. Khám phá cổ vật, bộ bài và combo tối ưu.`
						: tUI("championDetail.metaDesc")
				}
				keywords={
					champion
						? `${tDynamic(champion, "name")}, ${tDynamic(champion, "name")} poc, ${tDynamic(champion, "name")} guide, poc build`
						: ""
				}
				type="article"
				schema={championSchema}
			/>

			{loading ? (
				<ChampionDetailSkeleton />
			) : (
				<>
					{/* List mục lục chiến thuật bên phải dành cho màn hình desktop */}
					<ChampionTableOfContents tUI={tUI} />

					{/* 1. Top Section: Hero Section Tactical Bio & Visualizer */}
					<ChampionHeroSection
						champion={champion}
						resolvedStartingCards={resolvedStartingCards}
						tUI={tUI}
						tDynamic={tDynamic}
						language={language}
						onOpenCarousel={handleOpenCarousel}
					/>

					{/* 3. Section 2: Bảng Sức Mạnh & Chòm Sao (4 Tabs: Cấp độ, Ngôi sao SM, Ngôi sao TT, Bộ bài khởi đầu) */}
					<ChampionPowersConstellationSection
						champion={champion}
						constellationInfo={constellationInfo}
						starPowersList={starPowersList}
						bonusStarsList={bonusStarsList}
						deckUpgrades={deckUpgrades}
						resolvedStartingCards={resolvedStartingCards}
						resolvedItems={resolvedItems}
						tUI={tUI}
						tDynamic={tDynamic}
						language={language}
						onOpenCarousel={handleOpenCarousel}
					/>

					{/* 4. Section 3: Bộ Cổ Vật, Hướng Dẫn Vận Hành & Video Showcase Đồng Bộ */}
					<ChampionRelicGuideSection
						champion={champion}
						relicSetsToRender={relicSetsToRender}
						tUI={tUI}
						tDynamic={tDynamic}
						language={language}
					/>

					{/* 5. Section 4: Vật Phẩm & Sức Mạnh Ưu Tiên Chọn Cho Tướng */}
					<ChampionPriorityItemsSection
						champion={champion}
						defaultItemsFull={defaultItemsFull}
						adventurePowersFull={adventurePowersFull}
						runesFull={runesFull}
						tUI={tUI}
						tDynamic={tDynamic}
						language={language}
					/>

					{/* 6. Section 5: Lưới Roster Các Tướng Đề Xuất Khác (Đưa lên trên phần bình luận) */}
					<ChampionRosterSection
						allChampions={allChampions}
						currentChampion={champion}
						tUI={tUI}
						tDynamic={tDynamic}
					/>

					{/* 7. Section 6: Kênh Bình Luận & Thảo Luận Chiến Thuật */}
					<ChampionCommunitySection
						champion={champion}
						tUI={tUI}
						tDynamic={tDynamic}
						language={language}
					/>
				</>
			)}

			{/* Card Carousel Modal — Render via Portal */}
			{carouselOpen && carouselCards.length > 0 && (
				<CardCarouselModal
					cards={carouselCards}
					initialIndex={carouselInitialIndex}
					onClose={() => setCarouselOpen(false)}
				/>
			)}

			{/* Scroll to top button */}
			{showScrollTop && (
				<button
					type="button"
					onClick={scrollToTop}
					className="fixed bottom-6 right-6 p-3 tactical-btn-primary rounded-full shadow-[var(--tactical-btn-primary-shadow)] hover:scale-105 transition-all z-50 animate-fadeIn"
					aria-label="Scroll to top"
				>
					<ArrowUp size={22} className="stroke-[2.5]" />
				</button>
			)}
		</div>
	);
}

export default memo(ChampionDetail);
