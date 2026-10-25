import { memo, useEffect } from "react";
import { Link } from "react-router-dom";

import { ChevronLeft, XCircle } from "lucide-react";
import PageTitle from "./pageTitle";
import { generateSlug } from "@/utils/slugify";
import Button from "./button";
import SafeImage from "./SafeImage";
import MarkupRenderer from "./MarkupRenderer";

// --- SKELETON LOADING TACTICAL CHUNG ---
export const EntityDetailSkeleton = () => (
	<div className='max-w-[1200px] mx-auto p-2 sm:p-6 animate-pulse font-primary space-y-6'>
		<div className='h-9 w-28 bg-white/10 clip-chamfer-sm border border-white/10' />
		<div className='tactical-panel border-2 border-[var(--tactical-section-border)] clip-chamfer p-4 sm:p-8 space-y-8'>
			<div className='flex flex-col md:flex-row gap-6'>
				<div className='w-full md:w-[280px] aspect-square bg-white/5 clip-chamfer border border-white/10' />
				<div className='flex-1 space-y-4'>
					<div className='h-14 w-full bg-white/10 clip-chamfer-sm' />
					<div className='h-40 w-full bg-white/5 clip-chamfer-sm border border-white/5' />
				</div>
			</div>
			<div className='space-y-4'>
				<div className='h-8 w-60 bg-white/10 clip-chamfer-sm' />
				<div className='flex flex-wrap gap-3'>
					{[...Array(6)].map((_, i) => (
						<div key={i} className='h-36 w-28 bg-white/5 clip-chamfer-sm border border-white/10' />
					))}
				</div>
			</div>
		</div>
	</div>
);

function EntityDetailLayout({
	loading,
	error,
	onBack,
	pageTitle,
	pageDescription,
	pageKeywords,
	imageSrc,
	name,
	rarity,
	description,
	compatibleChampions = [],
	labels = {
		back: "Back",
		compatibleTitle: "Compatible Champions",
		noCompatible: "No compatible champions found",
		errorTitle: "Error"
	},
	children
}) {
	if (error) {
		return (
			<div className='min-h-[60vh] flex items-center justify-center p-6 font-primary'>
				<div className='tactical-card clip-chamfer border border-red-500/40 p-8 text-center max-w-md w-full shadow-2xl'>
					<XCircle size={48} className='mx-auto mb-4 text-red-500 opacity-60' />
					<p className='text-lg font-bold text-red-400 font-mono-tech uppercase tracking-wide'>
						{labels.errorTitle}: {error}
					</p>
					<button
						type="button"
						onClick={onBack}
						className='mt-6 px-5 py-2.5 tactical-card clip-chamfer-sm border hover:border-[var(--tactical-accent-lime)] hover:text-[var(--tactical-accent-lime)] text-xs font-mono-tech uppercase font-bold tracking-wider inline-flex items-center gap-2 transition-all'
					>
						<ChevronLeft size={16} /> {labels.back}
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className='animate-fadeIn font-primary selection:bg-[var(--tactical-accent-lime)] selection:text-black'>
			<PageTitle title={pageTitle} description={pageDescription} keywords={pageKeywords} type='article' />

			{loading ? (
				<div key='skeleton'>
					<EntityDetailSkeleton />
				</div>
			) : (
				<div
					key='content'
					className='max-w-[1200px] mx-auto p-2 sm:p-6 text-[var(--tactical-text-main)] font-primary'
				>
					{/* Top Back Button */}
					<div className='mb-4'>
						<button
							type="button"
							onClick={onBack}
							className='inline-flex items-center gap-2 px-4 py-2 tactical-card border border-[var(--tactical-card-border)] hover:border-[var(--tactical-accent-lime)] text-xs font-mono-tech font-bold uppercase text-[var(--tactical-text-main)] hover:text-[var(--tactical-accent-lime-fg)] transition-all clip-chamfer-sm shadow-sm group'
						>
							<ChevronLeft size={16} className='group-hover:-translate-x-0.5 transition-transform' />
							<span>{labels.back}</span>
						</button>
					</div>

					{/* Main Detail Terminal Panel */}
					<div className='relative tactical-panel border-2 border-[var(--tactical-section-border)] clip-chamfer p-4 sm:p-8 shadow-2xl overflow-hidden'>
						{/* Corner Cyber Notches */}
						<div className="absolute top-0 right-0 w-8 h-8 pointer-events-none border-t-2 border-r-2 border-[var(--tactical-accent-cyan)]/40 z-10" />
						<div className="absolute bottom-0 left-0 w-8 h-8 pointer-events-none border-b-2 border-l-2 border-[var(--tactical-accent-lime)]/40 z-10" />

						{/* Hero Header Split */}
						<div className='flex flex-col md:flex-row gap-6 items-stretch'>
							{/* Left Image Holder */}
							<div className='w-full md:w-[280px] shrink-0 tactical-box border border-[var(--tactical-card-border)] clip-chamfer p-4 bg-black/40 flex items-center justify-center relative group min-h-[240px]'>
								<SafeImage
									className='h-[220px] w-full object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-500'
									src={imageSrc || "/fallback-image.svg"}
									alt={name}
								/>
							</div>

							{/* Right Specs & Description */}
							<div className='flex-1 flex flex-col justify-between gap-4'>
								<div>
									{/* Title Bar */}
									<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[var(--tactical-stroke-color)] pb-4'>
										<h1 className='text-3xl sm:text-5xl font-display font-black uppercase italic tracking-wide text-white drop-shadow-md leading-none'>
											{name}
										</h1>
										{rarity && (
											<span className='self-start sm:self-auto px-3 py-1 bg-black/80 border border-[var(--tactical-accent-cyan)] text-[var(--tactical-accent-cyan)] font-mono-tech text-xs font-bold uppercase tracking-widest clip-chamfer-sm shadow-[0_0_12px_rgba(0,245,212,0.3)]'>
												{rarity}
											</span>
										)}
									</div>

									{/* Description Content Box */}
									{description && (
										<div className='mt-4 tactical-card border-l-4 border-[var(--tactical-accent-lime)] p-4 sm:p-5 clip-chamfer-sm leading-relaxed text-sm sm:text-base text-[var(--tactical-text-main)] bg-[var(--tactical-card-bg)] shadow-inner'>
											<MarkupRenderer text={description} />
										</div>
									)}
								</div>
							</div>
						</div>

						{/* Compatible Champions Section */}
						{compatibleChampions.length > 0 && (
							<div className='mt-10 pt-8 border-t border-[var(--tactical-stroke-color)]'>
								<div className='flex items-center gap-3 mb-5'>
									<div className='w-2 h-5 bg-[var(--tactical-accent-lime)] clip-chamfer-sm' />
									<h2 className='text-xl sm:text-2xl font-display font-black uppercase italic tracking-wide text-[var(--tactical-text-main)]'>
										{labels.compatibleTitle}
									</h2>
								</div>

								<div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4'>
									{compatibleChampions.map(champ => (
										<Link
											key={champ.championID || champ.id}
											to={`/champion/${generateSlug(champ.name || champ.championID || champ.id)}`}
											className='group flex flex-col items-center focus:outline-none'
										>
											<div className='relative w-full aspect-square overflow-hidden clip-chamfer-sm border-2 border-[var(--tactical-card-border)] group-hover:border-[var(--tactical-accent-lime)] transition-all duration-300 shadow-md group-hover:shadow-[0_0_18px_rgba(210,255,40,0.3)]'>
												<SafeImage
													className='w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500'
													src={champ.image}
													alt={champ.name}
												/>
												<div className='absolute inset-x-0 bottom-0 h-1 bg-[var(--tactical-accent-lime)] opacity-0 group-hover:opacity-100 transition-opacity' />
											</div>
											<span className='mt-2 font-display text-xs sm:text-sm uppercase italic tracking-wider truncate max-w-full text-[var(--tactical-text-sub)] group-hover:text-[var(--tactical-accent-lime)] transition-colors'>
												{champ.name}
											</span>
										</Link>
									))}
								</div>
							</div>
						)}

						{/* Custom Children */}
						{children && (
							<div className='mt-10 pt-8 border-t border-[var(--tactical-stroke-color)]'>
								{children}
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
}

export default memo(EntityDetailLayout);
