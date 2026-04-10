// src/pages/championDetail.jsx
import { memo, useMemo, useState, useEffect, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import iconRegions from "../../assets/data/icon.json";
import { ChevronLeft, Star, XCircle } from "lucide-react";
import LatestComments from "../comment/latestComments";
import Button from "../common/button";
import PageTitle from "../common/pageTitle";
import SafeImage from "../common/SafeImage";
import GoogleAd from "../common/googleAd";
import MarkupRenderer from "../common/MarkupRenderer";

// Import API và i18n
import { api } from "../../context/services/apiHelper";
import { useTranslation } from "../../hooks/useTranslation";
import { useMarkupResolution } from "../../hooks/useMarkupResolution";
import { initEntities } from "../../utils/entityLookup";

// Import các component chòm sao đã được tách
import ConstellationMap from "../champion/constellationMap";
import ConstellationTable from "../champion/constellationTable";
import ChampionPlaystyleChart from "../champion/championPlaystyleChart";
import CardHoverTooltip from "../champion/CardHoverTooltip";
import CardCarouselModal from "../card/CardCarouselModal.jsx";

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

// --- RENDER ITEM ĐA NGÔN NGỮ ---
const RenderItem = ({ item }) => {
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
		// Nếu click vào thẻ <a> hoặc nút bấm bên trong (markup link), không làm gì cả
		if (e.target.closest("a, button")) return;
		if (linkPath) navigate(linkPath);
	};

	const content = (
		<div 
			onClick={handleItemClick}
			className={`flex items-start gap-1 bg-surface-hover rounded-md h-full p-2 transition-all ${linkPath ? 'cursor-pointer hover:border-primary-500 border border-transparent active:scale-[0.98]' : ''}`}
		>
			<SafeImage
				src={item.assetAbsolutePath || item.image || "/fallback-image.svg"}
				alt={itemName}
				className='w-20 h-20 sm:w-24 sm:h-24 rounded-md shrink-0 object-cover'
			/>
			<div className="min-w-0">
				<h3 className='font-semibold text-text-primary text-lg truncate'>{itemName}</h3>
				{itemDesc && (
					<MarkupRenderer text={itemDesc} className="text-md text-text-secondary mt-1" />
				)}
			</div>
		</div>
	);

	return content;
};

// --- RENDER CARD NAME CELL (WITH TOOLTIP PORTAL) ---
const CardNameCell = memo(({ card, items, cardCode, isReference = false, onOpenCarousel }) => {
	const { tDynamic } = useTranslation();
	const [hoverPos, setHoverPos] = useState(null);

	const cardName = card ? tDynamic(card, "cardName") : cardCode;
	const cardImg = card?.gameAbsolutePath || "/fallback-card.png";

	return (
		<div
			className='flex items-center gap-3 cursor-zoom-in w-max'
			onMouseEnter={e => {
				if (window.innerWidth < 640) return; // Skip hover on mobile
				const rect = e.currentTarget.getBoundingClientRect();
				setHoverPos({
					x: rect.right,
					y: rect.top,
				});
			}}
			onMouseLeave={() => setHoverPos(null)}
			onClick={e => {
				if (window.innerWidth < 640) {
					// On mobile: Open Carousel!
					if (onOpenCarousel) onOpenCarousel(card, cardCode);
					return;
				}
				// Desktop: Toggle tooltip or nothing
				if (hoverPos) {
					setHoverPos(null);
				} else {
					const rect = e.currentTarget.getBoundingClientRect();
					setHoverPos({
						x: rect.right,
						y: rect.top,
					});
				}
			}}
			onContextMenu={e => {
				e.preventDefault();
				if (onOpenCarousel) onOpenCarousel(card, cardCode);
			}}
		>
			{/* Small Thumbnail */}
			<div className='w-11 h-16 rounded border border-white/10 overflow-hidden bg-black/20 shrink-0 shadow-sm'>
				<SafeImage src={cardImg} className='w-full h-full object-cover' />
			</div>

			<Link 
				to={`/card/${cardCode}`}
				className={`text-sm sm:text-base font-bold pb-0.5 transition-all border-b border-dashed hover:underline ${
					isReference
						? "text-purple-500 border-purple-500/30 hover:text-purple-400"
						: "text-primary-500 border-primary-500/30 hover:text-primary-400"
				}`}
			>
				{cardName}
			</Link>

			{/* Tooltip via Portal */}
			{hoverPos && (
				<CardHoverTooltip
					card={card}
					items={items}
					cardCode={cardCode}
					position={hoverPos}
					onClose={() => setHoverPos(null)}
				/>
			)}
		</div>
	);
});

// --- MAIN COMPONENT ---
function ChampionDetail() {
	const { championID } = useParams();
	const navigate = useNavigate();

	// 🟢 Sửa lại: Dùng tDynamic và tUI
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
	const [allRatings, setAllRatings] = useState([]);
	const [myRating, setMyRating] = useState(null);
	const [allChampions, setAllChampions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
	const [activeDeckTab, setActiveDeckTab] = useState("base");

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

	const initData = useCallback(async () => {
		try {
			setLoading(true);

			// 1. Fetch Dữ liệu Tướng "Full" (Bao gồm Constellation, Resolved Data, Suggestions, Ratings)
			const response = await api.get(`/champions/${championID}/full`);
			
			const { 
				champion: champData, 
				constellation: constData, 
				resolvedData, 
				suggestedChampions,
				allRatings: ar, 
				personalRating: pr 
			} = response;

			setChampion(champData);
			setAllChampions(suggestedChampions || []); // Dùng danh sách gợi ý từ backend
			setConstellationData(constData);
			setFetchedBonusStars(resolvedData.bonusStars || []);
			setResolvedPowers(resolvedData.powers || []);
			setResolvedItems(resolvedData.items || []);
			setResolvedRelics(resolvedData.relics || []);
			setResolvedRunes(resolvedData.runes || []);
			setResolvedStartingCards(resolvedData.cards || []);
			setAllRatings(ar || []);
			setMyRating(pr || null);

			// 2. Nạp cards vào hệ thống Lookup để Tooltip trong Markup hoạt động
			if (resolvedData.cards) {
				initEntities(resolvedData.cards);
			}

			// 3. Gom tất cả mô tả để resolve markup cùng lúc
			const allTexts = [
				tDynamic(champData, "description"),
				...(resolvedData.powers || []).map(p => tDynamic(p, "description") || tDynamic(p, "descriptionRaw")),
				...(resolvedData.relics || []).map(r => tDynamic(r, "description") || tDynamic(r, "descriptionRaw")),
				...(resolvedData.items || []).map(i => tDynamic(i, "description") || tDynamic(i, "descriptionRaw")),
				...(resolvedData.runes || []).map(r => tDynamic(r, "description") || tDynamic(r, "descriptionRaw"))
			].filter(Boolean).join(" ");

			if (allTexts) resolveEntities(allTexts);

		} catch (err) {
			setError(err.message || tUI("championDetail.errorLoad"));
		} finally {
			setTimeout(() => setLoading(false), 500);
		}
	}, [championID, tUI, tDynamic, resolveEntities]);

	useEffect(() => {
		initData();
	}, [initData]);

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
			.map((ids, i) => ({
				setNumber: i + 1,
				relics: ids
					.map(id => resolvedRelics.find(x => x.relicCode === id))
					.filter(Boolean),
			}))
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
				type='article'
			/>
			<div className='max-w-[1200px] mx-auto p-0 sm:p-6 text-text-primary font-secondary'>
				<AnimatePresence mode='wait'>
					{loading ? (
						<motion.div
							key='skeleton'
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
						>
							<ChampionDetailSkeleton />
						</motion.div>
					) : (
						<motion.div
							key='content'
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							transition={{ duration: 0.3 }}
						>
							<Button
								variant='outline'
								onClick={() => navigate(-1)}
								className='mb-2 ml-1 sm:ml-0'
							>
								<ChevronLeft size={18} /> {tUI("championDetail.back")}
							</Button>

							{/* HEADER SECTION (Avatar + Name + Description) */}
							<div className='flex flex-col md:flex-row border border-border gap-4 rounded-xl bg-surface-bg sm:p-6 shadow-sm overflow-hidden'>
								<SafeImage
									className='h-auto max-h-[300px] object-contain rounded-lg'
									src={champion.assets?.[0]?.avatar}
									alt={tDynamic(champion, "name")}
								/>
								<div className='flex-1'>
									<div className='flex flex-col sm:flex-row sm:justify-between p-1 gap-2'>
										<h1 className='text-2xl sm:text-4xl font-bold font-primary'>
											{tDynamic(champion, "name")}
										</h1>
										<div className='flex flex-wrap gap-2 items-center'>
											<div className='flex items-center gap-1 px-2.5 py-1.5 bg-yellow-500/20 border border-yellow-500 rounded-full'>
												<span className='text-sm font-bold text-yellow-900'>
													{champion.maxStar}
												</span>
												<Star
													size={16}
													className='text-yellow-600 fill-current'
												/>
											</div>
											{champion.regions?.map((r, i) => (
												<img
													key={i}
													src={
														iconRegions.find(item => item.name === r)
															?.image || "/fallback-image.svg"
													}
													alt={r}
													className='w-10 h-10'
												/>
											))}
										</div>
									</div>
									<div
										className={`mt-1 mx-1 p-2 border border-border rounded-lg bg-surface-bg-alt/30 ${!isDescriptionExpanded ? "overflow-y-auto h-48 sm:h-60" : "h-auto"}`}
									>
										<MarkupRenderer text={tDynamic(champion, "description")} />
									</div>
									<button
										onClick={() =>
											setIsDescriptionExpanded(!isDescriptionExpanded)
										}
										className='text-primary-500 text-sm font-bold mt-2 ml-2 hover:underline'
									>
										{isDescriptionExpanded
											? tUI("championDetail.showLess")
											: tUI("championDetail.showMore")}
									</button>
								</div>
							</div>

							{/* COMMUNITY EVALUATION SECTION (Radar Chart) */}
							<ChampionPlaystyleChart
								champion={champion}
								onRefresh={initData}
								initialAllRatings={allRatings}
								initialMyRating={myRating}
							/>

							{/* CONSTELLATION SECTION */}
							{constellationInfo.nodes.length > 0 && (
								<div className="bg-surface-bg border border-border rounded-xl p-4 sm:p-6 shadow-sm mt-6 overflow-hidden">
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

							{/* VIDEO SECTION */}
							<div className="bg-surface-bg border border-border rounded-xl p-4 sm:p-6 shadow-sm mt-6">
								<h2 className='p-1 text-lg sm:text-3xl font-semibold mb-3 font-primary text-primary-500 border-b border-border'>
									{tUI("championDetail.video")}
								</h2>
								<div className='aspect-video bg-surface-hover rounded-lg border border-border overflow-hidden'>
									<iframe
										width='100%'
										height='100%'
										src={
											champion?.videoLink ||
											"https://www.youtube.com/embed/mZgnjMeTI5E"
										}
										frameBorder='0'
										allowFullScreen
										className='rounded-lg'
									></iframe>
								</div>
							</div>

							{/* STARTING DECK SECTION */}
							{(champion.startingDeck?.baseCards?.length > 0 ||
								champion.startingDeck?.referenceCards?.length > 0) && (
								<div className="bg-surface-bg border border-border rounded-xl p-4 sm:p-6 shadow-sm mt-6 overflow-hidden">
									<div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-border mb-6 gap-4">
										<h2 className='p-1 text-lg sm:text-3xl font-semibold font-primary text-primary-500 flex items-center gap-3'>
											{tUI("championDetail.startingDeck")}
										</h2>

										{/* TABS SELECTOR - Only show if both exist */}
										{champion.startingDeck?.baseCards?.length > 0 &&
											champion.startingDeck?.referenceCards?.length > 0 && (
											<div className="flex bg-surface-hover/50 p-1 rounded-lg self-start sm:self-auto">
												{[
													{ id: "base", label: tUI("championDetail.baseCards"), count: champion.startingDeck.baseCards.length, color: "text-primary-500", bg: "bg-primary-500/10" },
													{ id: "ref", label: tUI("championDetail.referenceCards"), count: champion.startingDeck.referenceCards.length, color: "text-purple-500", bg: "bg-purple-500/10" }
												].map((tab) => (
													<button
														key={tab.id}
														onClick={() => setActiveDeckTab(tab.id)}
														className={`relative px-3 py-1.5 rounded-md text-xs font-black tracking-wider uppercase transition-all flex items-center gap-2 ${
															activeDeckTab === tab.id 
																? `${tab.color} z-10` 
																: "text-text-tertiary hover:text-text-secondary"
														}`}
													>
														{activeDeckTab === tab.id && (
															<motion.div
																layoutId="activeDeckTab"
																className={`absolute inset-0 ${tab.bg} border border-border rounded-md -z-10`}
																transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
															/>
														)}
														{tab.label}
														<span className={`text-[10px] px-1.5 rounded-full ${activeDeckTab === tab.id ? `${tab.bg} border border-border` : "bg-black/20"}`}>
															{tab.count}
														</span>
													</button>
												))}
											</div>
										)}
									</div>

									<div className='mt-2'>
										<AnimatePresence mode='wait'>
											{/* --- BASE CARDS TABLE --- */}
											{(activeDeckTab === "base" || !champion.startingDeck?.referenceCards?.length) && (
												<motion.div 
													key="base-deck"
													initial={{ opacity: 0, x: -10 }}
													animate={{ opacity: 1, x: 0 }}
													exit={{ opacity: 0, x: 10 }}
													transition={{ duration: 0.2 }}
													className='bg-surface-bg border border-border rounded-xl overflow-hidden shadow-sm'
												>
													{!champion.startingDeck?.referenceCards?.length && (
														<div className='p-2 bg-primary-500/5 border-b border-border flex items-center justify-between'>
															<h3 className='text-sm sm:text-lg font-bold text-text-primary flex items-center gap-2 uppercase'>
																{tUI("championDetail.baseCards")}
															</h3>
															<span className='text-[10px] font-bold text-text-secondary bg-surface-hover px-2 py-1 rounded-md border border-border uppercase'>
																{champion.startingDeck.baseCards.length}{" "}
																{tUI("common.cards")}
															</span>
														</div>
													)}
													<div className='overflow-x-auto'>
														<table className='w-full text-left border-collapse'>
															<thead>
																<tr className='bg-surface-hover/50 text-[10px] sm:text-xs font-black uppercase text-text-tertiary tracking-widest border-b border-border'>
																	<th className='px-2 py-2 sm:px-4 w-8 text-center'>#</th>
																	<th className='px-2 py-2 sm:px-4'>{tUI("admin.cardForm.cardNameLabel")}</th>
																	<th className='px-2 py-2 sm:px-4'>{tUI("admin.dropSidePanel.tabs.item")}</th>
																</tr>
															</thead>
															<tbody className='divide-y divide-border/50'>
																{champion.startingDeck.baseCards.map((cardData, idx) => {
																	const cardInfo = resolvedStartingCards.find(c => c.cardCode === cardData.cardCode);
																	const cardItems = (cardData.itemCodes || [])
																		.map(code => resolvedItems.find(i => i.itemCode === code))
																		.filter(Boolean);

																	return (
																		<tr key={idx} className='group hover:bg-surface-hover/30 transition-colors'>
																			<td className='px-2 py-2 sm:px-4 sm:py-2 text-center text-xs font-bold text-text-tertiary'>{idx + 1}</td>
																			<td className='px-2 py-2 sm:px-4 sm:py-2'>
																				<CardNameCell 
																					card={cardInfo} 
																					items={cardItems} 
																					cardCode={cardData.cardCode} 
																					onOpenCarousel={handleOpenCarousel}
																				/>
																			</td>
																			<td className='px-2 py-2 sm:px-4 sm:py-2'>
																				<div className='flex flex-wrap gap-2'>
																					{cardItems.length > 0 ? (
																						cardItems.map((item, i) => (
																							<Link key={i} to={`/item/${item.itemCode}`} className='flex items-center gap-1.5 px-2 py-1 rounded-lg bg-surface-hover/50 hover:bg-surface-hover hover:scale-105 transition-all' title={tDynamic(item, "name")}>
																								<SafeImage src={item.assetAbsolutePath || item.image || "/fallback-image.svg"} className='w-10 h-10 sm:w-12 sm:h-12 object-contain' />
																								<span className='text-[10px] sm:text-xs font-bold text-text-secondary hidden lg:inline'>
																									{tDynamic(item, "name")}
																								</span>
																							</Link>
																						))
																					) : (
																						<span className='text-[10px] text-text-tertiary italic'>{tUI("championDetail.noItems")}</span>
																					)}
																				</div>
																			</td>
																		</tr>
																	);
																})}
															</tbody>
														</table>
													</div>
												</motion.div>
											)}

											{/* --- REFERENCE CARDS TABLE --- */}
											{(activeDeckTab === "ref" && champion.startingDeck?.referenceCards?.length > 0) && (
												<motion.div 
													key="ref-deck"
													initial={{ opacity: 0, x: 10 }}
													animate={{ opacity: 1, x: 0 }}
													exit={{ opacity: 0, x: -10 }}
													transition={{ duration: 0.2 }}
													className='bg-surface-bg border border-border rounded-xl overflow-hidden shadow-sm'
												>
													<div className='overflow-x-auto'>
														<table className='w-full text-left border-collapse'>
															<thead>
																<tr className='bg-surface-hover/50 text-[10px] sm:text-xs font-black uppercase text-text-tertiary tracking-widest border-b border-border'>
																	<th className='px-2 py-2 sm:px-4 w-8 text-center'>#</th>
																	<th className='px-2 py-2 sm:px-4'>{tUI("admin.cardForm.cardNameLabel")}</th>
																	<th className='px-2 py-2 sm:px-4'>{tUI("admin.dropSidePanel.tabs.item")}</th>
																</tr>
															</thead>
															<tbody className='divide-y divide-border/50'>
																{champion.startingDeck.referenceCards.map((cardData, idx) => {
																	const cardInfo = resolvedStartingCards.find(c => c.cardCode === cardData.cardCode);
																	const cardItems = (cardData.itemCodes || [])
																		.map(code => resolvedItems.find(i => i.itemCode === code))
																		.filter(Boolean);

																	return (
																		<tr key={idx} className='group hover:bg-surface-hover/30 transition-colors'>
																			<td className='px-2 py-2 sm:px-4 sm:py-2 text-center text-xs font-bold text-text-tertiary'>{idx + 1}</td>
																			<td className='px-2 py-2 sm:px-4 sm:py-2'>
																				<CardNameCell 
																					card={cardInfo} 
																					items={cardItems} 
																					cardCode={cardData.cardCode} 
																					isReference={true} 
																					onOpenCarousel={handleOpenCarousel}
																				/>
																			</td>
																			<td className='px-2 py-2 sm:px-4 sm:py-2'>
																				<div className='flex flex-wrap gap-2'>
																					{cardItems.length > 0 ? (
																						cardItems.map((item, i) => (
																							<Link key={i} to={`/item/${item.itemCode}`} className='flex items-center gap-1.5 px-2 py-1 rounded-lg bg-surface-hover/50 hover:bg-surface-hover hover:scale-105 transition-all' title={tDynamic(item, "name")}>
																								<SafeImage src={item.assetAbsolutePath || item.image || "/fallback-image.svg"} className='w-10 h-10 sm:w-12 sm:h-12 object-contain' />
																								<span className='text-[10px] sm:text-xs font-bold text-text-secondary hidden lg:inline'>
																									{tDynamic(item, "name")}
																								</span>
																							</Link>
																						))
																					) : (
																						<span className='text-[10px] text-text-tertiary italic'>{tUI("championDetail.noItems")}</span>
																					)}
																				</div>
																			</td>
																		</tr>
																	);
																})}
															</tbody>
														</table>
													</div>
												</motion.div>
											)}
										</AnimatePresence>
									</div>
								</div>
							)}

							{/* RELIC SETS SECTION */}
							{relicSetsToRender.length > 0 && (
								<div className="bg-surface-bg border border-border rounded-xl p-4 sm:p-6 shadow-sm mt-6">
									<h2 className='p-1 text-lg sm:text-3xl font-semibold mb-3 font-primary text-primary-500 border-b border-border'>
										{tUI("championDetail.relicSets")}
									</h2>
									<div className='grid gap-4 bg-surface-hover/50 p-2 rounded-lg'>
										{relicSetsToRender.map((set, idx) => (
											<div
												key={idx}
												className='bg-surface-bg border border-border rounded-lg grid grid-cols-1 md:grid-cols-3'
											>
												{set.relics.map((r, i) => (
													<RenderItem key={i} item={r} />
												))}
											</div>
										))}
									</div>
								</div>
							)}

							{/* RECOMMENDATIONS (Powers, Items, Runes) */}
							<div className="space-y-6 mt-6">
								{adventurePowersFull.length > 0 && (
									<div className="bg-surface-bg border border-border rounded-xl p-4 sm:p-6 shadow-sm">
										<h2 className='p-1 text-lg sm:text-3xl font-semibold mb-3 font-primary text-primary-500 border-b border-border'>
											{tUI("championDetail.recPowers")}
										</h2>
										<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
											{adventurePowersFull.map((power, index) => (
												<RenderItem key={index} item={power} />
											))}
										</div>
									</div>
								)}

								{defaultItemsFull.length > 0 && (
									<div className="bg-surface-bg border border-border rounded-xl p-4 sm:p-6 shadow-sm">
										<h2 className='p-1 text-lg sm:text-3xl font-semibold mb-3 font-primary text-primary-500 border-b border-border'>
											{tUI("championDetail.recItems")}
										</h2>
										<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
											{defaultItemsFull.map((item, index) => (
												<RenderItem key={index} item={item} />
											))}
										</div>
									</div>
								)}

								{runesFull.length > 0 && (
									<div className="bg-surface-bg border border-border rounded-xl p-4 sm:p-6 shadow-sm">
										<h2 className='p-1 text-lg sm:text-3xl font-semibold mb-3 font-primary text-primary-500 border-b border-border'>
											{tUI("championDetail.recRunes")}
										</h2>
										<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
											{runesFull.map((runeItem, index) => (
												<RenderItem key={index} item={runeItem} />
											))}
										</div>
									</div>
								)}
							</div>

							{/* AD SECTION 1 */}
							<div className='my-8 border-y border-border py-6 bg-surface-bg/50 rounded-xl'>
								<p className='text-xs text-text-secondary text-center mb-3 uppercase tracking-widest'>
									{tUI("common.ad")}
								</p>
								<GoogleAd slot='2943049680' format='horizontal' />
							</div>

							{/* SUGGESTED CHAMPIONS */}
							{suggestedChampions.length > 0 && (
								<div className='mt-12 mb-8 bg-surface-bg border border-border rounded-xl p-4 sm:p-6 shadow-sm'>
									<h2 className='p-1 text-lg sm:text-2xl font-semibold mb-6 font-primary text-primary-500 border-b border-border uppercase flex items-center gap-2'>
										{tUI("championDetail.suggestedTitle")}
									</h2>
									<div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
										{suggestedChampions.map(suggested => (
											<Link
												key={suggested.championID}
												to={`/champion/${suggested.championID}`}
												className='group relative bg-surface-bg border border-border rounded-xl overflow-hidden hover:border-primary-500 transition-all hover:shadow-lg hover:shadow-primary-500/10'
											>
												<div className='aspect-[3/4] relative overflow-hidden'>
													<SafeImage
														src={
															suggested.assets?.[0]?.avatar ||
															suggested.gameAbsolutePath
														}
														className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500'
													/>
													<div className='absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60' />
												</div>
												<div className='absolute bottom-0 left-0 right-0 p-3'>
													<div className='flex justify-between items-end'>
														<h3 className='font-bold text-white text-xs sm:text-sm drop-shadow-md truncate pr-2'>
															{tDynamic(suggested, "name")}
														</h3>
														<div className='flex items-center gap-0.5 text-yellow-500 shrink-0'>
															<span className='text-[10px] font-bold'>
																{suggested.maxStar}
															</span>
															<Star size={10} className='fill-current' />
														</div>
													</div>
												</div>
											</Link>
										))}
									</div>
								</div>
							)}

							{/* COMMENTS SECTION */}
							<div className='mt-8 bg-surface-bg border border-border rounded-xl p-4 sm:p-6 shadow-sm'>
								<LatestComments championID={championID} />
							</div>

							{/* AD SECTION 2 */}
							<div className='my-8 border-t border-border pt-8'>
								<p className='text-xs text-text-secondary text-center mb-3 uppercase tracking-widest'>
									{tUI("common.ad")}
								</p>
								<GoogleAd slot='2943049680' format='horizontal' />
							</div>
						</motion.div>
					)}
				</AnimatePresence>
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
