import React, {
	useMemo,
	useState,
	useEffect,
	useCallback,
	useRef,
} from "react";
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
import { useAuth } from "../../context/AuthContext";
import { api } from "../../context/services/apiHelper";
import {
	Box,
	Info,
	X,
	ChevronRight,
	Star,
	Users,
	MessageSquare,
	Loader2,
} from "lucide-react";
import RatingModal from "./RatingModal";
import CommunityRatingsList from "./CommunityRatingsList";

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

const ChampionPlaystyleChart = ({ 
	champion, 
	onRefresh, 
	isAdminPreview = false // Prop mới để vẽ biểu đồ theo điểm Admin (không gộp cộng đồng)
}) => {
	const { tUI, tDynamic } = useTranslation();
	const { user, token } = useAuth();
	const [showInfo, setShowInfo] = useState(false);
	const [showRatingModal, setShowRatingModal] = useState(false);
	const [showAllRatingsModal, setShowAllRatingsModal] = useState(false);
	const [allRatings, setAllRatings] = useState([]);
	const [myRating, setMyRating] = useState(null);
	const [isLoadingRatings, setIsLoadingRatings] = useState(false);
	const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
	const containerRef = useRef(null);

	useEffect(() => {
		if (!containerRef.current) return;

		const updateSize = () => {
			if (containerRef.current) {
				const { offsetWidth, offsetHeight } = containerRef.current;
				if (offsetWidth > 0 && offsetHeight > 0) {
					setDimensions({ width: offsetWidth, height: offsetHeight });
				}
			}
		};

		// Initial check
		updateSize();

		const observer = new ResizeObserver(() => {
			updateSize();
		});

		observer.observe(containerRef.current);

		return () => {
			observer.disconnect();
		};
	}, []);

	const fetchRatings = useCallback(async () => {
		if (!champion?.championID) return;
		setIsLoadingRatings(true);
		try {
			const ratingsData = await api.get(`/ratings/${champion.championID}`);
			setAllRatings(ratingsData);

			if (user) {
				const myData = await api.get(
					`/ratings/${champion.championID}/my`,
					token,
				);
				setMyRating(myData);
			}
		} catch (error) {
			console.error("Error fetching ratings:", error);
		} finally {
			setIsLoadingRatings(false);
		}
	}, [champion?.championID, user, token]);

	useEffect(() => {
		fetchRatings();
	}, [fetchRatings]);

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

	const activeRatings = useMemo(() => {
		const base = champion.ratings || {};
		const comm = champion.communityRatings || {};

		// Nếu là trang Admin (Preview), chỉ dùng điểm GỐC để hiển thị đúng những gì Admin đang kéo thanh trượt.
		// Nếu là trang Công khai, dùng điểm KẾT HỢP (Weighted Average) đã tính từ Backend.
		if (isAdminPreview) {
			return {
				damage: base.damage ?? 5,
				defense: base.defense ?? 5,
				speed: base.speed ?? 5,
				consistency: base.consistency ?? 5,
				synergy: base.synergy ?? 5,
				independence: base.independence ?? 5,
			};
		}

		return {
			damage: comm.damage ?? base.damage ?? 5,
			defense: comm.defense ?? base.defense ?? 5,
			speed: comm.speed ?? base.speed ?? 5,
			consistency: comm.consistency ?? base.consistency ?? 5,
			synergy: comm.synergy ?? base.synergy ?? 5,
			independence: comm.independence ?? base.independence ?? 5,
		};
	}, [champion, isAdminPreview]);

	const data = useMemo(
		() => [
			{
				subject: tUI("championDetail.ratings.damage"),
				A: activeRatings.damage,
				fullMark: 10,
				key: "damage",
			},
			{
				subject: tUI("championDetail.ratings.speed"),
				A: activeRatings.speed,
				fullMark: 10,
				key: "speed",
			},
			{
				subject: tUI("championDetail.ratings.synergy"),
				A: activeRatings.synergy,
				fullMark: 10,
				key: "synergy",
			},
			{
				subject: tUI("championDetail.ratings.independence"),
				A: activeRatings.independence,
				fullMark: 10,
				key: "independence",
			},
			{
				subject: tUI("championDetail.ratings.consistency"),
				A: activeRatings.consistency,
				fullMark: 10,
				key: "consistency",
			},
			{
				subject: tUI("championDetail.ratings.defense"),
				A: activeRatings.defense,
				fullMark: 10,
				key: "defense",
			},
		],
		[activeRatings, tUI],
	);

	const playstyleNote =
		tDynamic(champion, "ratings.playstyleNote") ||
		champion.ratings?.playstyleNote;
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
							{tUI("championDetail.ratings.chartTitle")}
						</span>
						<button
							onClick={() => setShowInfo(true)}
							className='text-xs text-primary-500 hover:text-primary-600 bg-primary-100/50 hover:bg-primary-100 px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors'
						>
							<Info size={14} /> {tUI("championDetail.ratings.infoBtnShort")}
						</button>
					</h3>

					<div
						ref={containerRef}
						className='w-full h-[350px] md:h-[400px] max-w-[400px] mx-auto relative z-10'
					>
						{dimensions.width > 0 && dimensions.height > 0 && (
							<RadarChart
								width={dimensions.width}
								height={dimensions.height}
								cx='50%'
								cy='50%'
								outerRadius='80%'
								data={data}
								margin={{ top: 10, right: 30, bottom: 10, left: 30 }}
							>
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
										fontSize: 12,
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
						)}
					</div>
				</div>

				{/* Cột phải: Đánh giá cộng đồng */}
				<div className='xl:w-7/12 p-3 md:p-6 flex flex-col bg-surface-bg border-l border-border/10'>
					<header className='flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-4 border-b border-border/50'>
						<div>
							<h3 className='text-xl md:text-2xl font-primary text-text-primary font-bold flex items-center gap-3 uppercase'>
								{tUI("championDetail.ratings.title")}
							</h3>
							{champion.communityRatings ? (
								<p className='text-xs text-text-secondary mt-1 flex items-center gap-1.5 font-medium'>
									<Users size={14} className='text-primary-400' />
									{tUI("championDetail.ratings.averageFrom", {
										count: champion.communityRatings.count,
									})}
								</p>
							) : (
								<p className='text-xs text-text-secondary mt-1 italic'>
									{tUI("championDetail.ratings.noRatingsYet")}
								</p>
							)}
						</div>

						<div className='flex items-center gap-2'>
							<button
								onClick={() => setShowAllRatingsModal(true)}
								className='flex-1 text-xs font-bold text-text-primary bg-surface-hover hover:bg-surface-active border border-border px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all'
							>
								<MessageSquare size={16} className='text-primary-500' />
								{tUI("championDetail.ratings.viewCommunityRatings")}
							</button>
							<button
								onClick={() => setShowRatingModal(true)}
								className='flex-1 text-xs font-bold text-white bg-primary-500 hover:bg-primary-600 px-4 py-2 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20 transition-all'
							>
								<Star size={16} />
								{tUI("championDetail.ratings.rateNow")}
							</button>
						</div>
					</header>

					<div className='flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4'>
						{data.map(stat => (
							<div key={stat.key} className='flex flex-col gap-1.5 group'>
								<div className='flex justify-between items-center text-sm'>
									<span className='text-text-secondary font-bold uppercase tracking-tight group-hover:text-primary-500 transition-colors'>
										{stat.subject}
									</span>
									<span className='font-black text-primary-500 bg-primary-100/30 px-2 py-0.5 rounded-md min-w-[32px] text-center'>
										{stat.A}
									</span>
								</div>
								<div className='h-2 w-full bg-surface-hover rounded-full overflow-hidden border border-border/30'>
									<div
										className='h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-1000 ease-out'
										style={{ width: `${(stat.A / 10) * 100}%` }}
									/>
								</div>
							</div>
						))}
					</div>

					{/* Note nhỏ ở dưới */}
					{champion.ratings?.playstyleNote && (
						<div className='mt-8 pt-4 border-t border-border/50 text-xs text-text-secondary leading-relaxed italic'>
							<span className='font-bold text-text-primary not-italic block mb-1 uppercase tracking-widest text-[10px] opacity-70'>
								{tUI("championDetail.ratings.playstyleNote")}
							</span>
							{champion.ratings.playstyleNote}
						</div>
					)}
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
											<strong className='text-text-primary'>
												{tUI("championDetail.ratings.meaningLabel")}
											</strong>{" "}
											{tUI(
												`championDetail.ratings.criteriaDesc.${key}.meaning`,
											)}
										</p>
										<div className='bg-primary-100/50 p-3 rounded border border-primary-500/20 text-primary-700'>
											<strong className='block mb-1 text-primary-600 flex items-center gap-1'>
												<ChevronRight size={14} />{" "}
												{tUI("championDetail.ratings.radarLabel")}
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

			{/* Modal Đánh giá */}
			<RatingModal
				isOpen={showRatingModal}
				onClose={() => setShowRatingModal(false)}
				championID={champion?.championID}
				initialData={myRating}
				onSubmit={async data => {
					if (!token) {
						alert(tUI("championDetail.ratings.guestWarning"));
						return;
					}
					await api.post(`/ratings/${champion.championID}`, data, token);
					await fetchRatings();
					if (onRefresh) onRefresh(); // Gọi hàm refresh từ cha để tải lại average mới nhất
				}}
			/>

			{/* Modal Danh sách đánh giá cộng đồng */}
			<CommunityRatingsList
				isOpen={showAllRatingsModal}
				onClose={() => setShowAllRatingsModal(false)}
				ratings={allRatings}
			/>
		</>
	);
};

export default React.memo(ChampionPlaystyleChart);
