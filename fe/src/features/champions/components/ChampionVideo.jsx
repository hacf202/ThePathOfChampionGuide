const ChampionVideo = ({ champion, tUI }) => {
	if (!champion?.videoLink && !champion) return null;

	return (
		<div className="bg-surface-bg border border-border rounded-xl p-1 sm:p-6 shadow-sm mt-6">
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
					loading='lazy'
					className='rounded-lg'
				></iframe>
			</div>
		</div>
	);
};

export default ChampionVideo;
