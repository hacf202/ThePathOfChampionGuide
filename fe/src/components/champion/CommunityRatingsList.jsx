// fe/src/components/champion/CommunityRatingsList.jsx
import React from "react";
import { X, Users, Star, MessageCircle, Calendar } from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";

const CommunityRatingsList = ({ isOpen, onClose, ratings }) => {
	const { tUI } = useTranslation();

	if (!isOpen) return null;

	const statsKeys = [
		"damage",
		"defense",
		"speed",
		"consistency",
		"synergy",
		"independence",
	];

	return (
		<div className='fixed inset-0 z-[110] flex items-center justify-center p-4 bg-gray-900/70 backdrop-blur-sm animate-fadeIn'>
			<div className='absolute inset-0' onClick={onClose}></div>
			<div className='bg-surface-bg border border-border rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col relative z-20 overflow-hidden animate-slideUp'>
				<div className='flex items-center justify-between p-5 border-b border-border bg-surface-hover'>
					<h3 className='text-xl font-bold font-primary text-primary-500 uppercase flex items-center gap-2'>
						<Users size={24} className='text-primary-500' />
						{tUI("championDetail.ratings.viewCommunityRatings")}
					</h3>
					<button onClick={onClose} className='text-text-secondary hover:text-danger-500 transition-colors'>
						<X size={24} />
					</button>
				</div>

				<div className='p-6 overflow-y-auto max-h-[75vh] custom-scrollbar space-y-6'>
					{ratings && ratings.length > 0 ? (
						ratings.map((rating, idx) => (
							<div key={idx} className='bg-surface-hover/50 border border-border rounded-xl p-5 space-y-4 hover:border-primary-400 transition-all'>
								<div className='flex items-center justify-between'>
									<div className='flex items-center gap-2'>
										<div className='w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-black'>
											{rating.username?.[0].toUpperCase() || "A"}
										</div>
										<div>
											<p className='font-bold text-text-primary text-base'>{rating.username || "Anonymous"}</p>
											<p className='text-[10px] text-text-secondary flex items-center gap-1 uppercase tracking-wider'>
												<Calendar size={10} /> {new Date(rating.createdAt).toLocaleDateString()}
											</p>
										</div>
									</div>
									<div className='bg-primary-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm'>
										Cộng Đồng
									</div>
								</div>

								<div className='grid grid-cols-2 md:grid-cols-3 gap-3 bg-surface-bg/50 p-3 rounded-lg border border-border/50'>
									{statsKeys.map(key => (
										<div key={key} className='flex items-center justify-between gap-1'>
											<span className='text-[11px] text-text-secondary uppercase font-bold truncate'>
												{tUI(`championDetail.ratings.${key}`)}
											</span>
											<span className='text-sm font-black text-primary-500'>{rating.ratings[key]}</span>
										</div>
									))}
								</div>

								{rating.comment && (
									<div className='relative pl-4 border-l-2 border-primary-500/30 italic text-text-primary text-[14px] leading-relaxed'>
										<MessageCircle size={14} className='absolute -left-[9px] top-0 text-primary-500 bg-surface-bg p-0.5 rounded-full' />
										{rating.comment}
									</div>
								)}
							</div>
						))
					) : (
						<div className='text-center py-20 text-text-secondary space-y-4 bg-surface-hover/30 rounded-2xl border-2 border-dashed border-border'>
							<Users size={48} className='mx-auto opacity-20' />
							<p className='italic'>{tUI("championDetail.ratings.noRatingsYet")}</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default CommunityRatingsList;
