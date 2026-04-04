import React, { memo, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
	Loader2,
	ChevronLeft,
	XCircle,
	ExternalLink,
	Hash,
	Info,
} from "lucide-react";
import PageTitle from "../../components/common/pageTitle.jsx";
import Button from "../../components/common/button.jsx";
import SafeImage from "../../components/common/SafeImage.jsx";
import MarkupRenderer from "../../components/common/MarkupRenderer.jsx";
import RarityIcon from "../../components/common/rarityIcon.jsx";
import { useTranslation } from "../../hooks/useTranslation.js";

/**
 * Skeleton Loading for Card Detail
 */
const CardDetailSkeleton = () => (
	<div className='max-w-[1200px] mx-auto p-0 sm:p-6 animate-pulse font-secondary'>
		<div className='h-10 w-24 bg-gray-700/50 rounded mb-2 ml-1 sm:ml-0' />
		<div className='bg-surface-bg border border-border rounded-lg p-4 sm:p-6 space-y-8'>
			<div className='flex flex-col md:flex-row gap-8'>
				<div className='w-full md:w-1/2 aspect-[3/4] bg-gray-700/50 rounded-xl' />
				<div className='flex-1 space-y-6'>
					<div className='h-16 w-full bg-gray-700/50 rounded-lg' />
					<div className='h-32 w-full bg-gray-700/30 rounded-lg' />
					<div className='grid grid-cols-2 gap-4'>
						<div className='h-20 bg-gray-700/20 rounded-lg' />
						<div className='h-20 bg-gray-700/20 rounded-lg' />
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
			} catch (err) {
				console.error("Error fetching card detail:", err);
				setError(err.message || tUI("common.errorLoadData"));
			} finally {
				// Artificial delay for smooth transition like other pages
				setTimeout(() => setLoading(false), 300);
			}
		};

		if (cardCode) fetchCard();
	}, [cardCode, apiUrl, tUI]);

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
				type='article'
			/>

			<AnimatePresence mode='wait'>
				{loading ? (
					<motion.div
						key='skeleton'
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
					>
						<CardDetailSkeleton />
					</motion.div>
				) : (
					<motion.div
						key='content'
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						transition={{ duration: 0.3 }}
						className='max-w-[1200px] mx-auto p-2 sm:p-6 text-text-primary font-secondary'
					>
                        <div className="flex justify-between items-center mb-6">
						    <Button
							    variant='outline'
							    onClick={() => navigate(-1)}
                                className="group"
						    >
							    <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> {tUI("common.back")}
						    </Button>
                        </div>

						<div className='bg-surface-bg border border-border rounded-3xl overflow-hidden shadow-2xl p-4 sm:p-10 relative'>
                            {/* Background decorative element */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 blur-[100px] pointer-events-none" />

							<div className='flex flex-col lg:flex-row gap-12 relative z-10'>
								{/* Left: Card Image */}
								<div className='lg:w-1/2 flex flex-col gap-6'>
									<div className='relative group rounded-2xl overflow-hidden border border-white/5 shadow-2xl bg-black/40'>
										<SafeImage
											src={imageSrc}
											alt={cardName}
											className='w-full h-auto object-contain transition-transform duration-700 group-hover:scale-[1.02]'
										/>
										<div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
										<a
											href={imageSrc}
											target='_blank'
											rel='noopener noreferrer'
											className='absolute top-4 right-4 p-3 bg-black/40 backdrop-blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-primary-500 hover:scale-110'
										>
											<ExternalLink className='w-5 h-5 text-white' />
										</a>
									</div>
								</div>

								{/* Right: Info Section */}
								<div className='lg:w-1/2 flex flex-col gap-10'>
									<div className='space-y-4'>
										<div className='flex flex-wrap items-center gap-3'>
											<span className='px-4 py-1 bg-primary-500/10 text-primary-400 text-[10px] font-bold rounded-full border border-primary-500/20 uppercase tracking-[0.2em]'>
												{type}
											</span>
                                            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                                                <RarityIcon rarity={card.rarity} size={14} />
                                                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                                                    {tUI(`rarity.${(card.rarity || "none").toLowerCase()}`)}
                                                </span>
                                            </div>
										</div>
										<h1 className='text-5xl sm:text-6xl font-bold font-primary text-text-primary uppercase italic tracking-tight'>
											{cardName}
										</h1>
                                        <div className="h-1 w-20 bg-primary-500 rounded-full" />
									</div>

									{/* Stats Grid */}
									<div className='grid grid-cols-2 sm:grid-cols-3 gap-4'>
                                        {/* Cost */}
										<div className='bg-white/5 p-5 rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center'>
											<div className='text-text-tertiary text-[10px] uppercase tracking-[0.15em] mb-3'>
												Cost
											</div>
											<div className='font-primary text-4xl text-blue-400 font-bold drop-shadow-[0_0_8px_rgba(96,165,250,0.3)]'>
												{card.cost}
											</div>
										</div>

                                        {/* Regions */}
										<div className='bg-white/5 p-5 rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center col-span-1'>
											<div className='text-text-tertiary text-[10px] uppercase tracking-[0.15em] mb-3'>
												Regions
											</div>
											<div className='flex flex-wrap justify-center gap-2'>
												{(card.regions || []).map((region, idx) => (
                                                    <span key={idx} className="px-3 py-1 bg-white/5 rounded-lg border border-white/10 text-xs font-bold text-text-primary">
                                                        {region}
                                                    </span>
                                                ))}
											</div>
										</div>

                                        {/* Code */}
										<div className='bg-white/5 p-5 rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center col-span-2 sm:col-span-1'>
											<div className='text-text-tertiary text-[10px] uppercase tracking-[0.15em] mb-3'>
												Card Code
											</div>
											<div className='font-mono text-primary-400 font-bold text-lg'>
												{card.cardCode}
											</div>
										</div>
									</div>

									{/* Description Section */}
									<div className='bg-surface-hover/50 backdrop-blur-md p-8 rounded-3xl border border-border shadow-inner'>
										<div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
                                            <Info size={18} className="text-primary-400" />
                                            <h3 className='font-primary text-xl font-bold text-text-primary uppercase tracking-wider'>
											    Description
										    </h3>
                                        </div>

										<div className='text-lg leading-relaxed text-text-secondary'>
                                            <MarkupRenderer text={description} />
										</div>
									</div>
								</div>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

export default memo(CardDetail);
