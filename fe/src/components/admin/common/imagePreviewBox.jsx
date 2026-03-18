import { memo } from "react";

const ImagePreviewBox = memo(
	({
		imageUrl,
		label = "Ảnh Preview",
		imageClassName = "w-32 h-32 md:w-44 md:h-44 object-contain rounded-xl border-4 border-white dark:border-gray-800 shadow-xl bg-black/40",
		wrapperClassName = "flex flex-col items-center justify-center p-6 bg-surface-hover/30 rounded-xl border border-dashed border-border h-full min-h-[200px]",
	}) => {
		return (
			<div className={wrapperClassName}>
				{imageUrl ? (
					<img
						src={imageUrl}
						className={imageClassName}
						alt='Preview'
						onError={e => {
							e.target.src = "https://via.placeholder.com/150?text=No+Image";
						}}
					/>
				) : (
					<div className='w-32 h-32 md:w-44 md:h-44 bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center text-4xl md:text-5xl text-gray-400'>
						?
					</div>
				)}
				<p className='text-xs text-text-secondary mt-4 font-bold uppercase tracking-widest'>
					{label}
				</p>
			</div>
		);
	},
);

export default ImagePreviewBox;
