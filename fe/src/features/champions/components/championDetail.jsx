// src/pages/championDetail.jsx
import { memo, useMemo, useState, useEffect, useCallback, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";

import iconRegions from "@/assets/data/icon.json";
import { ChevronLeft, Star, XCircle } from "lucide-react";
import LatestComments from "@/features/comment/components/latestComments";
import Button from "@/components/common/button";
import PageTitle from "@/components/common/pageTitle";
import SafeImage from "@/components/common/SafeImage";

import MarkupRenderer from "@/components/common/MarkupRenderer";

// Import API và i18n
import { api } from "@/context/services/apiHelper";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/context/AuthContext";
import { useBatchFavoriteData } from "@/hooks/useBatchFavoriteData";
import { useMarkupResolution } from "@/hooks/useMarkupResolution";
import { initEntities } from "@/utils/entityLookup";

// Import các component chòm sao đã được tách
import ConstellationMap from "@/features/champions/components/constellationMap";
import ConstellationTable from "@/features/champions/components/constellationTable";
import ChampionPlaystyleChart from "@/features/champions/components/championPlaystyleChart";
import CardHoverTooltip from "@/features/champions/components/CardHoverTooltip";
import CardCarouselModal from "@/features/cards/components/CardCarouselModal.jsx";
import CardNameCell from "@/features/champions/components/CardNameCell";
import ChampionLevelSection from "@/features/champions/components/ChampionLevel.jsx";
import BuildSummary from "@/features/builds/components/buildSummary";
import { useLazyMetadata } from "@/hooks/useLazyMetadata";

import ChampionHeader from "@/features/champions/components/ChampionHeader";
import ChampionVideo from "@/features/champions/components/ChampionVideo";
import ChampionStartingDeck from "@/features/champions/components/ChampionStartingDeck";
import ChampionRelicSets from "@/features/champions/components/ChampionRelicSets";
import ChampionRecommendations from "@/features/champions/components/ChampionRecommendations";
import ChampionSuggested from "@/features/champions/components/ChampionSuggested";

// --- THÀNH PHẦN SKELETON ---
const ChampionDetailSkeleton = () => (
	<div className='max-w-[1200px] mx-auto p-0 sm:p-6 animate-pulse'>
		<div className='h-10 w-24 bg-gray-700/50 rounded mb-2 ml-1 sm:ml-0' />
		<div className='bg-surface-bg border rounded-lg p-4 sm:p-6 space-y-8'>
			<div className='flex flex-col md:flex-row gap-4'>
				<div className='w-full md:w-[300px] aspect-[3/4] bg-gray-700/50 rounded-lg' />
				<div className='flex-1 space-y-4'>
					<div className='h-10 w-1/3 bg-gray-700/50 rounded' />
					<div className='h-48 w-full bg-gray-700/50 rounded' />
				</div>
			</div>
			<div className='h-8 w-40 bg-gray-700/50 rounded' />
			<div className='w-full aspect-video bg-gray-700/30 rounded-lg' />
		</div>
	</div>
);

// --- MAIN COMPONENT ---
function ChampionDetail() {
	const { championID } = useParams();
	const navigate = useNavigate();
	const lastChampionIDRef = useRef(null);

	// 🟢 Sửa lại: Dùng tDynamic và tUI
	const { language, tDynamic, tUI } = useTranslation();
	const { token } = useAuth();
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
	const [allRatings, setAllRatings] = useState([]);
	const [myRating, setMyRating] = useState(null);
	const [allChampions, setAllChampions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [isFullDataLoading, setIsFullDataLoading] = useState(true);
	const [error, setError] = useState(null);

	const [activeDeckTab, setActiveDeckTab] = useState("base");
	const [topBuilds, setTopBuilds] = useState([]);
	const { favoriteStatus, favoriteCounts, toggleFavorite } = useBatchFavoriteData(topBuilds, token);
	const [loadingBuilds, setLoadingBuilds] = useState(false);
	const { metadata, fetchAllMetadata } = useLazyMetadata(tUI);

	// --- Card Carousel Modal state ---
	const [carouselOpen, setCarouselOpen] = useState(false);
	const [carouselCards, setCarouselCards] = useState([]);
	const [carouselInitialIndex, setCarouselInitialIndex] = useState(0);

	const handleOpenCarousel = useCallback(async (card, cardCode) => {
		// Neu card da co associatedCards thi dung luon
		if (card?.associatedCards?.length > 0) {
			setCarouselCards([card, ...card.associatedCards]);
			setCarouselInitialIndex(0);
			setCarouselOpen(true);
			return;
		}

		// Neu chua co, hoac muon fast-fetch thi tai chi tiet
		try {
			const res = await fetch(`${apiUrl}/api/cards/${cardCode}`);
			if (res.ok) {
				const fullCard = await res.json();
				setCarouselCards([fullCard, ...(fullCard.associatedCards || [])]);
			} else {
				setCarouselCards(card ? [card] : []);
			}
		} catch (err) {
			console.error("Error pre-fetching card for carousel:", err);
			setCarouselCards(card ? [card] : []);
		}
		setCarouselInitialIndex(0);
		setCarouselOpen(true);
	}, [apiUrl]);

	const fetchTopBuilds = useCallback(async () => {
		try {
			setLoadingBuilds(true);
			const res = await fetch(`${apiUrl}/api/builds/top-by-champion/${championID}?limit=8`);
			if (res.ok) {
				const data = await res.json();
				setTopBuilds(data);
				if (data.length > 0) {
					// Nếu có build, tải thêm metadata để render BuildSummary cho chuẩn
					fetchAllMetadata();
				}
			}
		} catch (err) {
			console.error("Error fetching top builds:", err);
		} finally {
			setLoadingBuilds(false);
		}
	}, [championID, apiUrl, fetchAllMetadata]);

	const handleFavoriteToggle = useCallback(async (buildId, newStatus, newCount) => {
		await toggleFavorite(buildId, newStatus, newCount);
	}, [toggleFavorite]);


	const initData = useCallback(async () => {
		try {
			if (lastChampionIDRef.current !== championID) {
				setLoading(true);
				setIsFullDataLoading(true);
			}

			// 1. Tải nhanh thông tin cơ bản
			const basicData = await api.get(`/champions/${championID}`);
			setChampion(basicData);
			setLoading(false); // Hiển thị giao diện cơ bản ngay lập tức
			lastChampionIDRef.current = championID;

			// 2. Tải ngầm các dữ liệu nặng (Chòm sao, Đánh giá, Thẻ bài...)
			api.get(`/champions/${championID}/full`).then(response => {
				const { 
					champion: champData, 
					constellation: constData, 
					resolvedData, 
					suggestedChampions,
					allRatings: ar, 
					personalRating: pr 
				} = response;

				setChampion(champData); // Ghi đè bằng dữ liệu có communityRatings
				setAllChampions(suggestedChampions || []);
				setConstellationData(constData);
				setFetchedBonusStars(resolvedData.bonusStars || []);
				setResolvedPowers(resolvedData.powers || []);
				setResolvedItems(resolvedData.items || []);
				setResolvedRelics(resolvedData.relics || []);
				setResolvedRunes(resolvedData.runes || []);
				setResolvedStartingCards(resolvedData.cards || []);
				setAllRatings(ar || []);
				setMyRating(pr || null);

				if (resolvedData.cards) {
					initEntities(resolvedData.cards);
				}

				const allTexts = [
					tDynamic(champData, "description"),
					...(resolvedData.powers || []).map(p => tDynamic(p, "description") || tDynamic(p, "descriptionRaw")),
					...(resolvedData.relics || []).map(r => tDynamic(r, "description") || tDynamic(r, "descriptionRaw")),
					...(resolvedData.items || []).map(i => tDynamic(i, "description") || tDynamic(i, "descriptionRaw")),
					...(resolvedData.runes || []).map(r => tDynamic(r, "description") || tDynamic(r, "descriptionRaw"))
				].filter(Boolean).join(" ");

				if (allTexts) resolveEntities(allTexts);
				setIsFullDataLoading(false);
			}).catch(err => {
				console.error("Lỗi khi tải dữ liệu chi tiết ngầm:", err);
				setIsFullDataLoading(false);
			});

		} catch (err) {
			setError(err.message || tUI("championDetail.errorLoad"));
			setLoading(false);
		}
	}, [championID, tUI, tDynamic, resolveEntities]);

	useEffect(() => {
		// Reset states when switching champions
		setChampion(null);
		setConstellationData(null);
		setTopBuilds([]);
		setLoading(true);
		setIsFullDataLoading(true);
	}, [championID]);

	useEffect(() => {
		initData();
	}, [initData]);

	useEffect(() => {
		fetchTopBuilds();
	}, [fetchTopBuilds]);

	// Xử lý dữ liệu hiển thị Đa ngôn ngữ cho Chòm sao
	const constellationInfo = useMemo(() => {
		if (!champion) return { nodes: [], backgroundImage: "" };

		if (constellationData) {
			const nodes = constellationData.nodes.map(node => {
				let resolvedImage = "/images/placeholder.png";
				let resolvedDescription = node.description || "";
				let resolvedName = node.nodeName || "";

				if (node.nodeType === "starPower" || !node.nodeType) {
					const p = resolvedPowers.find(x => x.powerCode === node.powerCode);
					if (p) {
						resolvedImage = p.assetAbsolutePath || p.image || resolvedImage;
						resolvedDescription =
							tDynamic(p, "description") || tDynamic(p, "descriptionRaw") || "";
						resolvedName = tDynamic(p, "name");
					}
				} else {
					const b = fetchedBonusStars.find(
						x => x.bonusStarID === node.bonusStarID,
					);
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

		// Fallback nếu không có cấu hình Chòm sao mới
		const fallbackNodes = (champion.powerStarIds || []).map((id, i) => {
			const p = resolvedPowers.find(x => x.powerCode === id);
			return {
				nodeID: `fallback-${i}`,
				name: p ? tDynamic(p, "name") : id,
				image: p?.assetAbsolutePath || "/images/placeholder.png",
				description: p
					? tDynamic(p, "description") || tDynamic(p, "descriptionRaw")
					: "",
				pos: { x: 15 + i * 15, y: 50 },
				nextNodes:
					i < (champion.powerStarIds?.length || 0) - 1
						? [`fallback-${i + 1}`]
						: [],
				nodeType: "starPower",
				isRecommended: false,
				requirements: [],
			};
		});
		return {
			nodes: fallbackNodes,
			backgroundImage: champion?.assets?.[0]?.avatar,
		};
	}, [
		champion,
		constellationData,
		resolvedPowers,
		fetchedBonusStars,
		tDynamic,
	]);

	// Map mảng ID thành Object hoàn chỉnh để Render
	const adventurePowersFull = useMemo(
		() =>
			(champion?.adventurePowerIds || [])
				.map(id => resolvedPowers.find(x => x.powerCode === id))
				.filter(Boolean),
		[champion, resolvedPowers],
	);

	const defaultItemsFull = useMemo(
		() =>
			(champion?.itemIds || [])
				.map(id => resolvedItems.find(x => x.itemCode === id))
				.filter(Boolean),
		[champion, resolvedItems],
	);

	const runesFull = useMemo(
		() =>
			(champion?.runeIds || [])
				.map(id => resolvedRunes.find(x => x.runeCode === id))
				.filter(Boolean),
		[champion, resolvedRunes],
	);

	const deckUpgrades = useMemo(() => {
		if (!champion?.startingDeck) return [];
		const upgrades = [];
		const LEGACY_LEVELS = [2, 3, 6, 9, 12, 15, 18, 21, 24, 27];
		let counter = 0;

		// Gom cả baseCards và referenceCards để quét nâng cấp
		const allCards = [
			...(champion.startingDeck.baseCards || []),
			...(champion.startingDeck.referenceCards || [])
		];

		allCards.forEach(cd => {
			const cardEntry = typeof cd === "string" ? { cardCode: cd, itemCodes: [] } : cd;
			
			if (cardEntry.itemCodes && cardEntry.itemCodes.length > 0) {
				cardEntry.itemCodes.forEach(item => {
					const itemCode = typeof item === "string" ? item : item.itemCode;
					// Fix logic: Chỉ fallback về LEGACY_LEVELS nếu unlockLevel hoàn toàn không tồn tại (undefined)
					const unlockLevel = typeof item === "string" 
						? (LEGACY_LEVELS[counter] || 2) 
						: (item.unlockLevel !== undefined ? item.unlockLevel : (LEGACY_LEVELS[counter] || 2));
					
					counter++;

					const resolvedCard = resolvedStartingCards.find(c => c.cardCode === cardEntry.cardCode);
					const resolvedItem = resolvedItems.find(i => i.itemCode === itemCode);
					
					if (resolvedCard && resolvedItem) {
						upgrades.push({
							card: resolvedCard,
							item: resolvedItem,
							cardCode: cardEntry.cardCode,
							unlockLevel: Number(unlockLevel)
						});
					}
				});
			}
		});
		return upgrades;
	}, [champion, resolvedStartingCards, resolvedItems]);

	// Gợi ý tướng cùng khu vực hoặc ngẫu nhiên
	const suggestedChampions = useMemo(() => {
		if (!champion || allChampions.length === 0) return [];

		const otherChampions = allChampions.filter(
			c => c.championID !== champion.championID,
		);

		// Ưu tiên cùng khu vực
		const sameRegion = otherChampions.filter(c =>
			c.regions?.some(r => champion.regions?.includes(r)),
		);

		// Loại đã lấy từ list chính
		const remaining = otherChampions.filter(c => !sameRegion.includes(c));

		// Trộn và lấy 4 tướng
		const combined = [...sameRegion, ...remaining];
		return combined.slice(0, 4);
	}, [champion, allChampions]);

	// Xử lý Render Mảng đa chiều cho Bộ Cổ Vật (Relic Sets)
	const relicSetsToRender = useMemo(() => {
		if (!champion || !champion.relicSets) return [];
		return champion.relicSets
			.map((setObjOrArr, i) => {
				const isArray = Array.isArray(setObjOrArr);
				const relicsList = isArray ? setObjOrArr : (setObjOrArr.items || []);
				const description = isArray ? "" : (setObjOrArr.description || "");
				const video = isArray ? "" : (setObjOrArr.videoLink || "");
				
				return {
					setNumber: i + 1,
					description,
					video,
					relics: relicsList
						.map(id => resolvedRelics.find(x => x.relicCode === id))
						.filter(Boolean),
				};
			})
			.filter(s => s.relics.length > 0);
	}, [champion, resolvedRelics]);

	const starPowersList = useMemo(() => {
		return constellationInfo.nodes.filter(n => n.nodeType === "starPower");
	}, [constellationInfo.nodes]);

	const bonusStarsList = useMemo(() => {
		return constellationInfo.nodes.filter(n => n.nodeType !== "starPower");
	}, [constellationInfo.nodes]);

	if (error)
		return (
			<div className='p-10 text-center text-danger-500'>
				<XCircle size={48} className='mx-auto mb-4 opacity-50' />
				<p>{error}</p>
				<Button onClick={() => navigate(-1)} className='mt-4'>
					{tUI("championDetail.back")}
				</Button>
			</div>
		);

	return (
		<div className='animate-fadeIn'>
			<PageTitle
				title={
					champion ? tDynamic(champion, "name") : tUI("championDetail.title")
				}
				description={`${tUI("championDetail.metaDesc")} ${tDynamic(champion, "name")}`}
				keywords={champion ? `${tDynamic(champion, "name")}, build ${tDynamic(champion, "name")}, PoC ${tDynamic(champion, "name")}, ${champion.regions?.join(", ")}` : ""}
				type='article'
			/>
			<div className='max-w-[1200px] mx-auto p-0 sm:p-6 text-text-primary font-secondary'>
				
					{loading ? (
						<div
							key='skeleton'
							>
							<ChampionDetailSkeleton />
						</div>
					) : (
						<div
							key='content'
							transition={{ duration: 0.3 }}
						>
							<Button
								variant='outline'
								onClick={() => navigate(-1)}
								className='mb-2 ml-1 sm:ml-0'
							>
								<ChevronLeft size={18} /> {tUI("championDetail.back")}
							</Button>

							<ChampionHeader champion={champion} tDynamic={tDynamic} tUI={tUI} />

							{isFullDataLoading ? (
								<div className="flex flex-col items-center justify-center py-20 space-y-4">
									<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
									<p className="text-text-secondary animate-pulse">{tUI("common.loading") || "Đang tải dữ liệu chi tiết..."}</p>
								</div>
							) : (
								<>
							{/* CONSTELLATION SECTION */}
							{constellationInfo.nodes.length > 0 && (
								<div className="bg-surface-bg border border-border rounded-xl p-1 sm:p-6 shadow-sm mt-6 overflow-hidden">
									<h2 className='p-1 text-lg sm:text-3xl font-semibold font-primary text-primary-500 flex items-center gap-3 border-b border-border mb-6'>
										{tUI("championDetail.constellation")}
									</h2>

									<ConstellationMap constellationInfo={constellationInfo} />

									<div className="mt-8">
										<ConstellationTable
											starPowersList={starPowersList}
											bonusStarsList={bonusStarsList}
										/>
									</div>
								</div>
							)}

							{/* COMMUNITY EVALUATION SECTION (Radar Chart) */}
							<ChampionPlaystyleChart
								champion={champion}
								onRefresh={initData}
								initialAllRatings={allRatings}
								initialMyRating={myRating}
							/>

							{/* VIDEO SECTION */}
							<ChampionVideo champion={champion} tUI={tUI} />

							{/* STARTING DECK SECTION */}
							<ChampionStartingDeck
								champion={champion}
								resolvedStartingCards={resolvedStartingCards}
								resolvedItems={resolvedItems}
								tDynamic={tDynamic}
								tUI={tUI}
								handleOpenCarousel={handleOpenCarousel}
								activeDeckTab={activeDeckTab}
								setActiveDeckTab={setActiveDeckTab}
							/>

							{/* LEVEL SECTION NHÚNG TRỰC TIẾP DƯỚI BOOLEAN STARTING DECK */}
							{(champion.startingDeck?.baseCards?.length > 0 || champion.startingDeck?.referenceCards?.length > 0) && deckUpgrades.length > 0 && (
								<ChampionLevelSection
									deckUpgrades={deckUpgrades}
									resolvedPowers={resolvedPowers}
									onOpenCarousel={handleOpenCarousel}
								/>
							)}

							{/* TOP COMMUNITY BUILDS */}
							{topBuilds.length > 0 && (
								<div className="bg-surface-bg border border-border rounded-xl p-1 sm:p-6 shadow-sm mt-6">
									<div className="flex items-center justify-between border-b border-border mb-6 pb-2">
										<h2 className='text-lg sm:text-3xl font-semibold font-primary text-primary-500'>
											{tUI("championDetail.communityBuilds") || "Top Community Builds"}
										</h2>
										<Link 
											to={`/builds/community?championIDs=${championID}`}
											className="text-sm font-bold text-primary-500 hover:underline"
										>
											{tUI("common.viewAll") || "Xem tất cả"} →
										</Link>
									</div>
									
									<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
										{topBuilds.map(build => (
											<BuildSummary
												key={build.id}
												build={build}
												championsList={metadata.champions}
												relicsList={metadata.relics}
												powersList={metadata.powers}
												runesList={metadata.runes}
												onBuildUpdate={fetchTopBuilds}
												onFavoriteToggle={handleFavoriteToggle}
												initialIsFavorited={!!favoriteStatus[build.id]}
												initialLikeCount={favoriteCounts[build.id] || build.like || 0}
											/>
										))}
									</div>
								</div>
							)}

							{/* RELIC SETS SECTION */}
							<ChampionRelicSets relicSetsToRender={relicSetsToRender} tUI={tUI} />

							{/* RECOMMENDATIONS (Powers, Items, Runes) */}
							<ChampionRecommendations
								adventurePowersFull={adventurePowersFull}
								defaultItemsFull={defaultItemsFull}
								runesFull={runesFull}
								tUI={tUI}
							/>

							{/* SUGGESTED CHAMPIONS */}
							<ChampionSuggested
								suggestedChampions={suggestedChampions}
								tUI={tUI}
								tDynamic={tDynamic}
							/>

								</>
							)}

							{/* COMMENTS SECTION */}
							<div className='mt-8 bg-surface-bg border border-border rounded-xl p-1 sm:p-6 shadow-sm'>
								<LatestComments championID={championID} />
							</div>


						</div>
					)}
				
			</div>

			{/* Card Carousel Modal — Render via Portal */}
			{carouselOpen && carouselCards.length > 0 && (
				<CardCarouselModal
					cards={carouselCards}
					initialIndex={carouselInitialIndex}
					onClose={() => setCarouselOpen(false)}
				/>
			)}
		</div>
	);
}

export default memo(ChampionDetail);
