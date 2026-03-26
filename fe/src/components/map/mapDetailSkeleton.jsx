import React from "react";

const MapDetailSkeleton = () => (
	<div className='flex flex-col space-y-8 animate-pulse w-full'>
		<div className='relative rounded-2xl overflow-hidden border border-border shadow-md bg-surface-bg w-full h-[250px] md:h-[350px]'>
			<div className='absolute inset-0 bg-surface-hover/40'></div>
			<div className='absolute bottom-0 left-0 w-full p-4 md:p-8 flex flex-col md:flex-row justify-between items-end gap-4'>
				<div className='space-y-3 w-full md:w-1/2'>
					<div className='flex gap-2'>
						<div className='h-6 w-20 bg-slate-700/30 rounded-full'></div>
						<div className='h-6 w-24 bg-slate-700/30 rounded-full'></div>
					</div>
					<div className='h-10 w-3/4 bg-slate-700/40 rounded-lg'></div>
				</div>
				<div className='h-16 w-32 bg-slate-700/30 rounded-lg'></div>
			</div>
		</div>
		<div className='bg-surface-bg border border-border rounded-xl p-2 md:p-4 shadow-sm w-full'>
			<div className='h-6 w-48 bg-slate-700/30 rounded mb-4'></div>
			<div className='w-full aspect-video md:aspect-[21/9] bg-surface-hover/50 rounded-lg border border-border/50'></div>
		</div>
		<div className='bg-surface-bg border border-border rounded-xl p-2 md:p-4 shadow-sm w-full'>
			<div className='h-6 w-48 bg-slate-700/30 rounded mb-4'></div>
			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
				{[1, 2, 3].map(i => (
					<div
						key={i}
						className='flex items-start gap-3 bg-surface-hover/30 border border-border rounded-lg p-3 h-24'
					>
						<div className='w-14 h-14 rounded-md bg-slate-700/30 shrink-0'></div>
						<div className='space-y-2 flex-1'>
							<div className='h-4 w-3/4 bg-slate-700/40 rounded'></div>
							<div className='h-3 w-full bg-slate-700/30 rounded'></div>
							<div className='h-3 w-5/6 bg-slate-700/30 rounded'></div>
						</div>
					</div>
				))}
			</div>
		</div>
	</div>
);

export default MapDetailSkeleton;
