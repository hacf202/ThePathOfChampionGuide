import React, { useMemo, useState, useEffect } from "react";
import {
	Radar,
	RadarChart,
	PolarGrid,
	PolarAngleAxis,
	PolarRadiusAxis,
	ResponsiveContainer,
	Tooltip,
} from "recharts";
import { useTranslation } from "../../hooks/useTranslation";
import { Box, Info, X, ChevronRight } from "lucide-react";

const CustomTooltip = ({ active, payload }) => {
	if (active && payload && payload.length) {
		return (
			<div className='bg-surface-bg border border-border p-3 rounded-lg shadow-xl shrink-0'>
				<p className='text-primary-500 font-bold mb-1 uppercase text-xs tracking-wider'>
					{payload[0].payload.subject}
				</p>
				<p className='text-text-primary text-xl font-black'>
					{payload[0].value}{" "}
					<span className='text-text-secondary text-sm font-normal'>/ 10</span>
				</p>
			</div>
		);
	}
	return null;
};

const ChampionPlaystyleChart = ({ champion }) => {
	const { tUI, tDynamic } = useTranslation();
	const [showInfo, setShowInfo] = useState(false);

	useEffect(() => {
		if (showInfo) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "unset";
		}
		return () => {
			document.body.style.overflow = "unset";
		};
	}, [showInfo]);

	const ratings = champion?.ratings;
	if (!ratings) return null;

	const data = useMemo(
		() => [
			{
				subject: tUI("championDetail.ratings.damage"),
				A: ratings.damage || 5,
				fullMark: 10,
				key: "damage",
			},
			{
				subject: tUI("championDetail.ratings.speed"),
				A: ratings.speed || 5,
				fullMark: 10,
				key: "speed",
			},
			{
				subject: tUI("championDetail.ratings.synergy"),
				A: ratings.synergy || 5,
				fullMark: 10,
				key: "synergy",
			},
			{
				subject: tUI("championDetail.ratings.independence"),
				A: ratings.independence || 5,
				fullMark: 10,
				key: "independence",
			},
			{
				subject: tUI("championDetail.ratings.consistency"),
				A: ratings.consistency || 5,
				fullMark: 10,
				key: "consistency",
			},
			{
				subject: tUI("championDetail.ratings.defense"),
				A: ratings.defense || 5,
				fullMark: 10,
				key: "defense",
			},
		],
		[ratings, tUI],
	);

	const playstyleNote =
		tDynamic(champion, "ratings.playstyleNote") || ratings.playstyleNote;
	const criteriaKeys = [
		"damage",
		"defense",
		"speed",
		"consistency",
		"synergy",
		"independence",
	];

	return (
		<>
			{/* VÙNG CHỨA BIỂU ĐỒ - BỐ CỤC CHUẨN */}
			<div className='mt-6 md:mt-8 bg-surface-bg border border-border rounded-xl shadow-sm overflow-hidden flex flex-col xl:flex-row'>
				{/* Cột trái: Biểu đồ Radar */}
				<div className='xl:w-5/12 p-2 md:p-6 flex flex-col items-center justify-center bg-surface-hover/30 border-b xl:border-b-0 xl:border-r border-border relative'>
					{/* Tiêu đề góc trái (di động) hoặc trên cùng */}
					<h3 className='w-full text-base md:text-lg font-primary text-text-primary font-bold mb-4 flex justify-between items-center'>
						<span className='flex items-center gap-2'>
							<Box className='text-primary-500' size={20} /> Radar
						</span>
						<button
							onClick={() => setShowInfo(true)}
							className='text-xs text-primary-500 hover:text-primary-600 bg-primary-100/50 hover:bg-primary-100 px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors'
						>
							<Info size={14} /> Ý Nghĩa
						</button>
					</h3>

					<div className='w-full aspect-square max-w-[300px] mx-auto relative z-10'>
						<ResponsiveContainer width='100%' height='100%'>
							<RadarChart cx='50%' cy='50%' outerRadius='70%' data={data}>
								<defs>
									<linearGradient
										id='colorRadarDynamic'
										x1='0'
										y1='0'
										x2='0'
										y2='1'
									>
										<stop
											offset='0%'
											stopColor='var(--color-primary-300)'
											stopOpacity={0.8}
										/>
										<stop
											offset='100%'
											stopColor='var(--color-primary-600)'
											stopOpacity={0.3}
										/>
									</linearGradient>
								</defs>
								<PolarGrid
									stroke='var(--color-border-hover)'
									strokeDasharray='3 3'
								/>
								{/* Chỉnh lại font size, fill text tương phản tốt hơn */}
								<PolarAngleAxis
									dataKey='subject'
									tick={{
										fill: "var(--color-text-primary)",
										fontSize: 13,
										fontWeight: "bold",
									}}
								/>
								<PolarRadiusAxis
									angle={30}
									domain={[0, 10]}
									tick={{ fill: "var(--color-text-secondary)", fontSize: 11 }}
									tickCount={6}
									stroke='var(--color-border)'
								/>
								<Tooltip content={<CustomTooltip />} />
								<Radar
									name={tUI("championDetail.ratings.title")}
									dataKey='A'
									stroke='var(--color-primary-500)'
									strokeWidth={3}
									fill='url(#colorRadarDynamic)'
									fillOpacity={1}
									animationBegin={200}
									animationDuration={1500}
									animationEasing='ease-out'
								/>
							</RadarChart>
						</ResponsiveContainer>
					</div>
				</div>

				{/* Cột phải: Khối Ghi chú Lối Chơi */}
				<div className='xl:w-7/12 p-2 md:p-6 flex flex-col bg-surface-bg'>
					<h3 className='text-xl md:text-2xl font-primary text-text-primary font-bold flex items-center gap-2 mb-2 border-b border-border uppercase'>
						{tUI("championDetail.ratings.title")}
					</h3>

					<div className='flex-1 flex flex-col'>
						{playstyleNote ? (
							<div className='bg-surface-hover border border-border rounded-xl p-2 md:p-4 shadow-inner flex-1 text-text-primary text-[15px] md:text-base leading-relaxed whitespace-pre-line custom-scrollbar overflow-y-auto'>
								{playstyleNote}
							</div>
						) : (
							<div className='flex-1 flex items-center justify-center p-8 border-2 border-dashed border-border rounded-xl bg-surface-hover/50 text-text-secondary italic'>
								{tUI("dropSidePanel.noDescription")}
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Giao diện Popup Modal Chú Thích */}
			{showInfo && (
				<div className='fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fadeIn'>
					<div
						className='absolute inset-0'
						onClick={() => setShowInfo(false)}
					></div>

					<div className='bg-surface-bg border border-border rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col relative z-10 overflow-hidden animate-slideUp'>
						{/* Modal Header */}
						<div className='flex items-center justify-between p-5 md:px-6 md:py-4 border-b border-border bg-surface-hover'>
							<h3 className='text-lg md:text-xl font-bold font-primary text-primary-500 uppercase flex items-center gap-2'>
								<Info size={22} className='text-primary-500' />{" "}
								{tUI("championDetail.ratings.infoModalTitle")}
							</h3>
							<button
								onClick={() => setShowInfo(false)}
								className='text-text-secondary hover:text-danger-500 bg-surface-bg hover:bg-danger-100 p-2 rounded-full transition-all border border-border hover:border-danger-500'
							>
								<X size={20} />
							</button>
						</div>

						{/* Modal Body */}
						<div className='p-5 md:p-6 overflow-y-auto custom-scrollbar bg-surface-bg grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6'>
							{criteriaKeys.map(key => (
								<div
									key={key}
									className='bg-surface-hover rounded-lg border border-border p-4 hover:border-primary-400 transition-colors group'
								>
									<h4 className='text-base font-bold text-text-primary mb-2 flex items-center gap-2 border-b border-border pb-2'>
										<Box size={16} className='text-primary-500' />
										{tUI(`championDetail.ratings.criteriaDesc.${key}.title`)}
									</h4>
									<div className='space-y-3 mt-3 text-[14px] text-text-secondary'>
										<p className='leading-relaxed'>
											<strong className='text-text-primary'>Ý nghĩa:</strong>{" "}
											{tUI(
												`championDetail.ratings.criteriaDesc.${key}.meaning`,
											)}
										</p>
										<div className='bg-primary-100/50 p-3 rounded border border-primary-500/20 text-primary-700'>
											<strong className='block mb-1 text-primary-600 flex items-center gap-1'>
												<ChevronRight size={14} /> Biểu đồ Radar
											</strong>
											{tUI(`championDetail.ratings.criteriaDesc.${key}.radar`)}
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default React.memo(ChampionPlaystyleChart);
