import { memo } from "react";
import { Box, RefreshCcw, Users } from "lucide-react";

const RatingsSection = memo(({ formData, setFormData, champion, isDetailLoading, tUI }) => {
	return (
		<div className='flex flex-col gap-4 bg-surface-hover/30 p-4 rounded-xl border border-border py-6 mt-4'>
			<div className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2'>
				<h4 className='text-sm font-bold text-primary-500 uppercase flex items-center gap-2'>
					<Box size={18} /> {tUI("admin.championForm.ratingTitle")}
				</h4>
			</div>
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
				{[
					{ key: "damage", label: tUI("championDetail.ratings.damage") || "Sát thương" },
					{ key: "defense", label: tUI("championDetail.ratings.defense") || "Phòng thủ" },
					{ key: "synergy", label: tUI("championDetail.ratings.synergy") || "Khả năng phối hợp" },
					{ key: "difficulty", label: tUI("championDetail.ratings.difficulty") || "Độ khó" },
				].map(({ key, label }) => (
					<div key={key} className='flex flex-col gap-1'>
						<div className='flex justify-between items-center'>
							<label className='text-sm font-semibold text-text-secondary'>
								{label} ({formData.ratings?.[key] ?? 5}/10)
							</label>
						</div>
						<input
							type='range'
							min='1'
							max='10'
							step='0.5'
							value={formData.ratings?.[key] ?? 5}
							onChange={e =>
								setFormData(prev => ({
									...prev,
									ratings: {
										...prev.ratings,
										[key]: Number(e.target.value),
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
