import { memo, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, XCircle } from "lucide-react";
import PageTitle from "./pageTitle";
import Button from "./button";
import SafeImage from "./SafeImage";
import MarkupRenderer from "./MarkupRenderer";

// --- SKELETON LOADING CHUNG ---
export const EntityDetailSkeleton = () => (
	<div className='max-w-[1200px] mx-auto p-0 sm:p-6 animate-pulse font-secondary'>
		<div className='h-10 w-24 bg-gray-700/50 rounded mb-2 ml-1 sm:ml-0' />
		<div className='bg-surface-bg border border-border rounded-lg p-4 sm:p-6 space-y-8'>
			<div className='flex flex-col md:flex-row gap-6'>
				<div className='w-full md:w-[300px] aspect-square bg-gray-700/50 rounded-lg' />
				<div className='flex-1 space-y-4'>
					<div className='h-16 w-full bg-gray-700/50 rounded-lg' />
					<div className='h-48 w-full bg-gray-700/50 rounded-lg' />
				</div>
			</div>
			<div className='space-y-4'>
				<div className='h-8 w-60 bg-gray-700/50 rounded' />
				<div className='flex flex-wrap gap-3'>
					{[...Array(6)].map((_, i) => (
						<div key={i} className='h-32 w-28 bg-gray-700/30 rounded-lg' />
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
	}
}) {
	if (error) {
		return (
			<div className='p-10 text-center font-secondary'>
				<div className='bg-surface-hover p-8 rounded-lg border border-border inline-block'>
					<XCircle size={48} className='mx-auto mb-4 text-red-500 opacity-50' />
					<p className='text-xl font-bold text-red-500'>
						{labels.errorTitle}: {error}
					</p>
					<Button onClick={onBack} className='mt-6 mx-auto'>
						<ChevronLeft size={18} /> {labels.back}
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className='animate-fadeIn'>
			<PageTitle title={pageTitle} description={pageDescription} type='article' />

			<AnimatePresence mode='wait'>
				{loading ? (
					<motion.div
						key='skeleton'
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
					>
						<EntityDetailSkeleton />
					</motion.div>
				) : (
					<motion.div
						key='content'
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						transition={{ duration: 0.3 }}
						className='max-w-[1200px] mx-auto p-0 sm:p-6 text-text-primary font-secondary'
					>
						<Button variant='outline' onClick={onBack} className='mb-2 ml-1 sm:ml-0'>
							<ChevronLeft size={18} /> {labels.back}
						</Button>

						<div className='relative mx-auto max-w-[1200px] border border-border p-4 sm:p-6 rounded-lg bg-surface-bg shadow-sm'>
							{/* Phần Thông Tin Chính */}
							<div className='flex flex-col md:flex-row gap-4 rounded-md p-2 bg-surface-hover'>
								<SafeImage
									className='h-auto max-h-[300px] object-contain rounded-lg bg-surface-bg/50 p-2'
									src={imageSrc || "/fallback-image.svg"}
									alt={name}
								/>
								<div className='flex-1 flex flex-col'>
									<div className='flex flex-col border border-border sm:flex-row sm:justify-between rounded-lg p-2 text-2xl sm:text-4xl font-bold m-1 bg-surface-bg shadow-sm'>
										<h1 className='font-primary'>{name}</h1>
										{rarity && (
											<h1 className='font-primary text-primary-500 uppercase'>
												{rarity}
											</h1>
										)}
									</div>
									{description && (
										<div className='flex-1 mt-4'>
											<div className='text-base sm:text-xl rounded-lg p-4 h-full min-h-[120px] leading-relaxed bg-surface-bg border text-text-secondary overflow-y-auto'>
												<MarkupRenderer text={description} />
											</div>
										</div>
									)}
								</div>
							</div>

							{/* Danh sách Tướng tương thích */}
							<h2 className='text-xl sm:text-3xl font-semibold mt-8 mb-4 font-primary'>
								{labels.compatibleTitle}
							</h2>

							{compatibleChampions.length > 0 ? (
								<div className='flex flex-wrap justify-center gap-2 sm:gap-3 rounded-md bg-surface-hover p-4 border border-border'>
									{compatibleChampions.map(champ => (
										<Link
											key={champ.championID || champ.id}
											to={`/champion/${encodeURIComponent(champ.championID || champ.id)}`}
											className='group rounded-2xl p-2 transition-all hover:shadow-lg hover:scale-[1.03] bg-surface-bg border border-border text-center flex flex-col h-full w-full max-w-[136px]'
										>
											<SafeImage
												className='w-full max-w-[120px] aspect-square mx-auto rounded-2xl object-cover border-2 border-border group-hover:border-primary-500'
												src={champ.image}
												alt={champ.name}
											/>
											<h3 className='text-xs sm:text-sm font-semibold mt-1.5 text-text-primary group-hover:text-primary-500 leading-tight'>
												{champ.name}
											</h3>
										</Link>
									))}
								</div>
							) : (
								<div className='text-center p-8 rounded-md bg-surface-hover text-text-secondary border border-dashed border-border text-lg'>
									<p>{labels.noCompatible}</p>
								</div>
							)}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

export default memo(EntityDetailLayout);
