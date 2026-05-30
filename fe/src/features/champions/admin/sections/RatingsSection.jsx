import { memo } from "react";
import { Box, RefreshCcw, Users } from "lucide-react";

const RatingsSection = memo(({ formData, setFormData, champion, isDetailLoading, tUI }) => {
	return (
		<div className='flex flex-col gap-4 bg-surface-hover/30 p-4 rounded-xl border border-border py-6 mt-4'>
			<div className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2'>
				<h4 className='text-sm font-bold text-primary-500 uppercase flex items-center gap-2'>
					<Box size={18} /> {tUI("admin.championForm.ratingTitle")}
				</h4>
				<div className='flex items-center gap-3'>
					{isDetailLoading && (
						<span className='text-xs italic text-text-secondary -pulse'>
							{tUI("admin.championForm.loadingCommunity")}
						</span>
					)}
					{champion.communityRatings ? (
						<button
							type='button'
							onClick={() => {
								if (window.confirm(tUI("admin.championForm.syncConfirm") || "Do you want to sync?")) {
									setFormData(prev => ({
										...prev,
										ratings: {
											...prev.ratings,
											damage: champion.communityRatings.damage,
											defense: champion.communityRatings.defense,
											speed: champion.communityRatings.speed,
											consistency: champion.communityRatings.consistency,
											synergy: champion.communityRatings.synergy,
											independence: champion.communityRatings.independence,
										}
									}));
								}
							}}
							className='text-xs font-bold text-white bg-primary-500 hover:bg-primary-600 px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-sm -all'
						>
							<RefreshCcw size={14} /> {tUI("admin.championForm.syncCommunity")}
						</button>
					) : (
						!isDetailLoading && (
							<span className='text-[10px] text-text-secondary bg-surface-bg border px-2 py-1 rounded italic'>
								{tUI("admin.championForm.noCommunityRating")}
							</span>
						)
					)}
				</div>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
				{[
					"damage",
					"defense",
					"speed",
					"consistency",
					"synergy",
					"independence",
				].map(criteria => (
					<div key={criteria} className='flex flex-col gap-1'>
						<div className='flex justify-between items-center'>
							<label className='text-sm font-semibold text-text-secondary capitalize'>
								{tUI(`championDetail.ratings.${criteria}`)} (
								{formData.ratings?.[criteria] || 5}/10)
							</label>
							{champion.communityRatings?.[criteria] !== undefined && (
								<span className='text-[10px] font-bold text-primary-400 bg-primary-500/10 px-1.5 py-0.5 rounded flex items-center gap-1'>
									<Users size={10} /> {champion.communityRatings[criteria]}
								</span>
							)}
						</div>
						<input
							type='range'
							min='1'
							max='10'
							step='0.1'
							value={formData.ratings?.[criteria] || 5}
							onChange={e =>
								setFormData(prev => ({
									...prev,
									ratings: {
										...prev.ratings,
										[criteria]: Number(e.target.value),
									},
								}))
							}
							className='w-full accent-primary-500'
						/>
					</div>
				))}
			</div>
			<div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-4'>
				<div className='flex flex-col gap-2'>
					<label className='text-sm font-semibold'>
						{tUI("admin.championForm.playstyleNote")} (VI)
					</label>
					<textarea
						rows={3}
						value={formData.ratings?.playstyleNote || ""}
						onChange={e =>
							setFormData(prev => ({
								...prev,
								ratings: {
									...prev.ratings,
									playstyleNote: e.target.value,
								},
							}))
						}
						className='w-full bg-surface-bg border border-border p-3 rounded-lg text-text-primary focus:border-primary-500 outline-none resize-y'
						placeholder={tUI("admin.championForm.playstylePlaceholder")}
					/>
				</div>
				<div className='flex flex-col gap-2'>
					<label className='text-sm font-semibold'>
						{tUI("admin.championForm.playstyleNote")} (EN)
					</label>
					<textarea
						rows={3}
						value={
							formData.translations?.en?.ratings?.playstyleNote || ""
						}
						onChange={e =>
							setFormData(prev => ({
								...prev,
								translations: {
									...prev.translations,
									en: {
										...prev.translations?.en,
										ratings: {
											...(prev.translations?.en?.ratings || {}),
											playstyleNote: e.target.value,
										},
									},
								},
							}))
						}
						className='w-full bg-surface-bg border border-border p-3 rounded-lg text-text-primary focus:border-primary-500 outline-none resize-y'
						placeholder='English translation for notes...'
					/>
				</div>
			</div>
		</div>
	);
});

RatingsSection.displayName = "RatingsSection";
export default RatingsSection;
