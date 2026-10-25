import React, { memo, useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

import {
	ChevronLeft,
	XCircle,
	ExternalLink,
	Hash,
	Info,
	MousePointerClick,
} from "lucide-react";
import PageTitle from "@/components/common/pageTitle.jsx";
import Button from "@/components/common/button.jsx";
import SafeImage from "@/components/common/SafeImage.jsx";
import MarkupRenderer from "@/components/common/MarkupRenderer.jsx";
import RarityIcon from "@/components/common/rarityIcon.jsx";
import CardCarouselModal from "./CardCarouselModal.jsx";
import { useTranslation } from "@/hooks/useTranslation.js";
import { useMarkupResolution } from "@/hooks/useMarkupResolution.js";

/**
 * Skeleton Loading for Card Detail
 */
const CardDetailSkeleton = () => (
	<div className='max-w-[1200px] mx-auto p-0 sm:p-6 animate-pulse'>
		<div className='h-10 w-24 bg-[var(--tactical-card-bg)] clip-chamfer-sm border border-[var(--tactical-card-border)] mb-4 ml-1 sm:ml-0' />
		<div className='tactical-panel clip-chamfer bg-[var(--tactical-panel-bg)] border border-[var(--tactical-card-border)] p-4 sm:p-8 space-y-8'>
			<div className='flex flex-col md:flex-row gap-8'>
				<div className='w-full md:w-1/2 aspect-[680/1024] bg-[var(--tactical-card-bg)] clip-chamfer border border-[var(--tactical-card-border)]' />
				<div className='flex-1 space-y-6'>
					<div className='h-16 w-full bg-[var(--tactical-inner-box)] clip-chamfer-sm' />
					<div className='h-32 w-full bg-[var(--tactical-inner-box)] clip-chamfer-sm' />
					<div className='grid grid-cols-2 gap-4'>
						<div className='h-20 bg-[var(--tactical-inner-box)] clip-chamfer-sm' />
						<div className='h-20 bg-[var(--tactical-inner-box)] clip-chamfer-sm' />
					</div>
				</div>
			</div>
		</div>
	</div>
);

const CardDetail = () => {
	const { cardCode } = useParams();
	const navigate = useNavigate();
	const { tUI, tDynamic, language } = useTranslation();

	const [card, setCard] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// Carousel modal state
	const [carouselOpen, setCarouselOpen] = useState(false);
	const [carouselInitialIndex, setCarouselInitialIndex] = useState(0);


	const { resolveEntities } = useMarkupResolution();
	const apiUrl = import.meta.env.VITE_API_URL;

	useEffect(() => {
		const fetchCard = async () => {
			try {
				setLoading(true);
				setError(null);
				const response = await fetch(`${apiUrl}/api/cards/${cardCode}`);
				if (!response.ok) {
					throw new Error(
						response.status === 404
							? `${tUI("cardDetail.notFoundPrefix")} ${cardCode}`
							: tUI("cardDetail.errorLoad"),
					);
				}
				const data = await response.json();
				setCard(data);
				const desc = tDynamic(data, "description") || "";
				if (desc) resolveEntities(desc);
			} catch (err) {
				console.error("Error fetching card detail:", err);
				setError(err.message || tUI("common.error"));
			} finally {
				setTimeout(() => setLoading(false), 300);
			}
		};
		if (cardCode) fetchCard();
	}, [cardCode, apiUrl, tUI]);

	// Build carousel cards: base card + associated cards
	const carouselCards = card
		? [card, ...(card.associatedCards || [])]
		: [];
	const hasAssociated = carouselCards.length > 1;

	const openCarousel = useCallback((startIndex = 0) => {
		setCarouselInitialIndex(startIndex);
		setCarouselOpen(true);
	}, []);

	const handleContextMenu = useCallback((e) => {
		e.preventDefault();
		if (carouselCards.length > 0) openCarousel(0);
	}, [carouselCards, openCarousel]);

	// Localization helpers
	const cardName = card ? tDynamic(card, "cardName") : "";
	const description = card ? tDynamic(card, "description") : "";
	const type = card ? tDynamic(card, "type") : "";
	const imageSrc = card ? tDynamic(card, "gameAbsolutePath") : "";

	if (error) {
		return (
			<div className='p-10 text-center font-secondary'>
				<div className='bg-surface-hover p-8 rounded-lg border border-border inline-block'>
					<XCircle size={48} className='mx-auto mb-4 text-red-500 opacity-50' />
					<p className='text-xl font-bold text-red-500'>
						{tUI("common.errorTitle")}: {error}
					</p>
					<Button onClick={() => navigate(-1)} className='mt-6 mx-auto'>
						<ChevronLeft size={18} /> {tUI("common.back")}
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className='animate-fadeIn'>
			<PageTitle
				title={cardName || tUI("cardDetail.title")}
				description={`${tUI("cardDetail.metaDesc")} ${cardName}`}
				keywords={`${cardName}, card, ${type}, LoR card, PoC card`}
				type='article'
			/>

			
				{loading ? (
					<div key='skeleton' >
						<CardDetailSkeleton />
					</div>
				) : (
					<div
						key='content'
						className='max-w-[1200px] mx-auto p-2 sm:p-6'
					>
						<div className="flex justify-between items-center mb-6">
							<Button
								variant='outline'
								onClick={() => navigate(-1)}
								className="group font-mono-tech uppercase text-xs tracking-wider border-[var(--tactical-card-border)] hover:border-[var(--tactical-accent-lime)] clip-chamfer-sm"
							>
								<ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
								{tUI("common.back")}
							</Button>
						</div>

						<div className='tactical-panel clip-chamfer border border-[var(--tactical-card-border)] bg-[var(--tactical-panel-bg)] p-4 sm:p-10 relative shadow-2xl'>
							<div className="absolute top-0 right-0 w-64 h-64 bg-[var(--tactical-accent-cyan)]/5 blur-[100px] pointer-events-none" />

							<div className='flex flex-col lg:flex-row gap-12 relative z-10'>
								{/* Left: Card Image — right-click / long-press to open carousel */}
								<div className='lg:w-1/2 flex flex-col gap-6'>
									<div
										className='relative group clip-chamfer overflow-hidden border border-[var(--tactical-card-border)] shadow-2xl bg-[var(--tactical-inner-box)] cursor-zoom-in hover:border-[var(--tactical-accent-cyan)] transition-colors'
										onClick={() => openCarousel(0)}
										onContextMenu={handleContextMenu}
									>
										<SafeImage
											src={imageSrc}
											alt={cardName}
											className='w-full h-auto object-contain transition-transform duration-700 group-hover:scale-[1.02]'
										/>
										<div className="absolute inset-0 bg-gradient-to-t from-[var(--tactical-card-bg)]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

										{/* Hint badge */}
										{hasAssociated && (
											<div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 clip-chamfer-sm bg-[var(--tactical-panel-bg)]/90 backdrop-blur border border-[var(--tactical-accent-cyan)]/40 text-[var(--tactical-accent-cyan)] opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap font-mono-tech">
												<MousePointerClick size={12} className="text-[var(--tactical-accent-cyan)]" />
												<span className="text-[10px] font-bold">
													{tUI("cardDetail.viewCountCards", { count: carouselCards.length })}
												</span>
											</div>
										)}
									</div>

									{/* Associated card thumbnails — click to open carousel at that card */}
									{hasAssociated && (
										<div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
											{carouselCards.map((c, i) => {
												const cImg = language === "en"
													? (c.translations?.en?.gameAbsolutePath || c.gameAbsolutePath)
													: c.gameAbsolutePath;
												return (
													<button
														key={c.cardCode}
														onClick={() => openCarousel(i)}
														className={`flex-shrink-0 w-14 clip-chamfer-sm overflow-hidden border transition-all hover:scale-105 ${
															i === 0
																? "border-[var(--tactical-accent-cyan)] shadow-[0_0_10px_rgba(0,245,212,0.3)]"
																: "border-[var(--tactical-card-border)] hover:border-[var(--tactical-accent-cyan)]"
														}`}
														title={language === "en"
															? (c.translations?.en?.cardName || c.cardName)
															: c.cardName}
													>
														<SafeImage src={cImg} alt="" className="w-full h-auto object-cover" />
													</button>
												);
											})}
										</div>
									)}
								</div>

								{/* Right: Info Section */}
								<div className='lg:w-1/2 flex flex-col gap-8'>
									<div className='space-y-3'>
										<div className='flex flex-wrap items-center gap-3'>
											<span className='px-3.5 py-1 bg-[var(--tactical-accent-cyan)]/10 text-[var(--tactical-accent-cyan)] text-[10px] font-mono-tech font-bold clip-chamfer-sm border border-[var(--tactical-accent-cyan)]/30 uppercase tracking-widest'>
												{type}
											</span>
											<div className="flex items-center gap-2 px-3 py-1 bg-[var(--tactical-inner-box)] clip-chamfer-sm border border-[var(--tactical-card-border)]">
												<RarityIcon rarity={card.rarity} size={14} />
												<span className="font-mono-tech text-xs font-bold text-text-secondary uppercase tracking-wider">
													{tUI(`shared.rarity.${(card.rarity || "none").toLowerCase()}`)}
												</span>
											</div>
										</div>
										<h1 className='text-3xl sm:text-5xl font-bold font-display text-text-primary uppercase tracking-tight'>
											{cardName}
										</h1>
										<div className="h-1 w-20 bg-[var(--tactical-accent-lime)] shadow-[0_0_8px_var(--tactical-accent-lime)]" />
									</div>

									{/* Stats Grid */}
									<div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
										{/* Cost */}
										<div className='tactical-box clip-chamfer-sm bg-[var(--tactical-inner-box)] p-4 border border-[var(--tactical-card-border)] flex flex-col items-center justify-center text-center'>
											<div className='font-mono-tech text-text-tertiary text-[10px] uppercase tracking-widest mb-1'>
												{tUI("cardDetail.cost")}
											</div>
											<div className='font-mono-tech text-3xl text-[var(--tactical-accent-cyan)] font-bold drop-shadow-[0_0_8px_rgba(0,245,212,0.4)]'>
												{card.cost}
											</div>
										</div>

										{/* Regions */}
										<div className='tactical-box clip-chamfer-sm bg-[var(--tactical-inner-box)] p-4 border border-[var(--tactical-card-border)] flex flex-col items-center justify-center text-center col-span-1'>
											<div className='font-mono-tech text-text-tertiary text-[10px] uppercase tracking-widest mb-1'>
												{tUI("cardDetail.regions")}
											</div>
											<div className='flex flex-wrap justify-center gap-1.5 mt-1'>
												{(card.regions || []).map((region, idx) => (
													<span key={idx} className="px-2 py-0.5 bg-[var(--tactical-card-bg)] clip-chamfer-sm border border-[var(--tactical-card-border)] text-xs font-mono-tech font-bold text-text-primary">
														{region}
													</span>
												))}
											</div>
										</div>

										{/* Code */}
										<div className='tactical-box clip-chamfer-sm bg-[var(--tactical-inner-box)] p-4 border border-[var(--tactical-card-border)] flex flex-col items-center justify-center text-center col-span-2 sm:col-span-1'>
											<div className='font-mono-tech text-text-tertiary text-[10px] uppercase tracking-widest mb-1'>
												{tUI("cardDetail.cardCode")}
											</div>
											<div className='font-mono-tech text-[var(--tactical-accent-lime)] font-bold text-sm sm:text-base'>
												{card.cardCode}
											</div>
										</div>
									</div>

									{/* Description Section */}
									<div className='tactical-box clip-chamfer-sm bg-[var(--tactical-inner-box)] p-6 border border-[var(--tactical-card-border)]'>
										<div className="flex items-center gap-3 mb-4 border-b border-[var(--tactical-card-border)] pb-3">
											<div className='w-1 h-4 bg-[var(--tactical-accent-lime)] shadow-[0_0_6px_var(--tactical-accent-lime)]' />
											<h3 className='font-display text-base sm:text-lg font-bold text-[var(--tactical-accent-lime)] uppercase tracking-wider flex items-center gap-2'>
												<Info size={16} />
												{tUI("cardDetail.description")}
											</h3>
										</div>
										<div className='text-sm sm:text-base leading-relaxed text-text-secondary'>
											<MarkupRenderer text={description} />
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Associated Cards Section */}
						{card.associatedCards?.length > 0 && (
							<div className='mt-8 tactical-panel clip-chamfer p-6 sm:p-8 border border-[var(--tactical-card-border)] bg-[var(--tactical-panel-bg)] shadow-xl'>
								<div className="flex items-center gap-3 mb-6 border-b border-[var(--tactical-card-border)] pb-3">
									<div className='w-1 h-5 bg-[var(--tactical-accent-cyan)] shadow-[0_0_8px_var(--tactical-accent-cyan)]' />
									<h3 className='font-display text-lg sm:text-xl font-bold text-[var(--tactical-accent-cyan)] uppercase tracking-wider flex items-center gap-2'>
										<Hash size={18} />
										{tUI("cardDetail.associatedCards")}
									</h3>
									<span className='font-mono-tech text-xs text-[var(--tactical-accent-cyan)] bg-[var(--tactical-inner-box)] px-2 py-0.5 clip-chamfer-sm border border-[var(--tactical-accent-cyan)]/30'>
										{card.associatedCards.length}
									</span>
								</div>
								<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
									{card.associatedCards.map((assoc) => {
										const assocName = language === "en"
											? (assoc.translations?.en?.cardName || assoc.cardName)
											: assoc.cardName;
										const assocImg = language === "en"
											? (assoc.translations?.en?.gameAbsolutePath || assoc.gameAbsolutePath)
											: assoc.gameAbsolutePath;
										return (
											<Link
												key={assoc.cardCode}
												to={`/card/${assoc.cardCode}`}
												className="tactical-box clip-chamfer-sm group flex flex-col gap-2 border border-[var(--tactical-card-border)] bg-[var(--tactical-inner-box)] p-2 hover:border-[var(--tactical-accent-cyan)] transition-all duration-300 text-left"
											>
												<div className="clip-chamfer-sm overflow-hidden aspect-[680/1024] bg-black/20">
													<SafeImage
														src={assocImg}
														alt={assocName}
														className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
													/>
												</div>
												<div className="text-center px-1 pb-1">
													<p className="text-xs font-bold text-text-primary leading-tight line-clamp-2 group-hover:text-[var(--tactical-accent-cyan)] transition-colors">
														{assocName}
													</p>
													<p className="text-[10px] text-text-tertiary font-mono-tech mt-1">
														{assoc.cardCode}
													</p>
												</div>
											</Link>
										);
									})}
								</div>
							</div>
						)}
					</div>
				)}
			

			{/* Carousel Modal */}
			{carouselOpen && carouselCards.length > 0 && (
				<CardCarouselModal
					cards={carouselCards}
					initialIndex={carouselInitialIndex}
					onClose={() => setCarouselOpen(false)}
				/>
			)}
		</div>
	);
};

export default memo(CardDetail);
