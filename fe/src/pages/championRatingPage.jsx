import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { 
	Star, 
	User, 
	Calendar, 
	MessageSquare, 
	ChevronDown, 
	RotateCcw,
	Filter,
	Search,
	Trophy,
	Medal,
	SortAsc,
	Plus,
	Info,
	X,
	HelpCircle
} from "lucide-react";
import { useTranslation } from "../hooks/useTranslation";
import { Helmet } from "react-helmet-async";
import { api } from "../context/services/apiHelper";
import DropdownFilter from "../components/common/dropdownFilter";
import RatingModal from "../components/champion/RatingModal";
import MarkupTooltip from "../components/common/MarkupTooltip";
import Modal from "../components/common/modal";

const ChampionRatingPage = () => {
	const { tUI, language } = useTranslation();
	const [reviews, setReviews] = useState([]);
	const [topChampions, setTopChampions] = useState([]);
	const [allChampions, setAllChampions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [loadingRankings, setLoadingRankings] = useState(true);
	const [loadingMore, setLoadingMore] = useState(false);
	const [lastKey, setLastKey] = useState(null);
	const [hasMore, setHasMore] = useState(false);
	
	// Filter & Sort States
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedChamp, setSelectedChamp] = useState("all");
	const [minScore, setMinScore] = useState(0);
	const [sortBy, setSortBy] = useState("newest");

	// Rating State
	const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
	const [isSelectChampOpen, setIsSelectChampOpen] = useState(false);
	const [isExplainModalOpen, setIsExplainModalOpen] = useState(false);
	const [targetChampID, setTargetChampID] = useState(null);
	const [modalSearchTerm, setModalSearchTerm] = useState("");

	const statKeys = ['damage', 'defense', 'speed', 'consistency', 'synergy', 'independence'];

	const fetchRatings = useCallback(async (isLoadMore = false) => {
		if (isLoadMore) setLoadingMore(true);
		else setLoading(true);

		try {
			let endpoint = `/ratings?limit=12`;
			if (isLoadMore && lastKey) {
				endpoint += `&lastKey=${encodeURIComponent(lastKey)}`;
			}

			const data = await api.get(endpoint);
			
			if (isLoadMore) {
				setReviews(prev => [...prev, ...data.items]);
			} else {
				setReviews(data.items);
			}

			setLastKey(data.lastKey);
			setHasMore(!!data.lastKey);
		} catch (error) {
			console.error("Error loading ratings:", error);
		} finally {
			setLoading(false);
			setLoadingMore(false);
		}
	}, [lastKey]);

	const fetchRankings = async () => {
		setLoadingRankings(true);
		try {
			const data = await api.get("/ratings/ranking/top");
			setTopChampions(data || []);
		} catch (error) {
			console.error("Error loading rankings:", error);
		} finally {
			setLoadingRankings(false);
		}
	};

	const fetchChampionsList = async () => {
		try {
			const data = await api.get("/champions?limit=-1");
			setAllChampions(data.items || []);
		} catch (error) {
			console.error("Error loading champs:", error);
		}
	};

	useEffect(() => {
		fetchRatings();
		fetchRankings();
		fetchChampionsList();
	}, []); // Chỉ chạy lần đầu

	// Logic lọc và sắp xếp Client-side (cho các dữ liệu đã tải)
	const processedReviews = useMemo(() => {
		let result = [...reviews];

		// Lọc theo từ khóa
		if (searchTerm) {
			const s = searchTerm.toLowerCase();
			result = result.filter(r => 
				r.championName?.toLowerCase().includes(s) ||
				r.username?.toLowerCase().includes(s) ||
				r.comment?.toLowerCase().includes(s)
			);
		}

		// Lọc theo Tướng
		if (selectedChamp !== "all") {
			result = result.filter(r => r.championID === selectedChamp);
		}

		// Lọc theo điểm tối thiểu
		if (minScore > 0) {
			result = result.filter(r => {
				const avg = Object.values(r.ratings).reduce((a, b) => a + b, 0) / 6;
				return avg >= minScore;
			});
		}

		// Sắp xếp
		result.sort((a, b) => {
			if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
			
			const avgA = Object.values(a.ratings).reduce((x, y) => x + y, 0) / 6;
			const avgB = Object.values(b.ratings).reduce((x, y) => x + y, 0) / 6;
			
			if (sortBy === "highest") return avgB - avgA;
			if (sortBy === "lowest") return avgA - avgB;
			return 0;
		});

		return result;
	}, [reviews, searchTerm, selectedChamp, minScore, sortBy]);

	const handleRatingSubmit = async (data) => {
		try {
			await api.post(`/ratings/${targetChampID}`, data);
			fetchRatings();
			fetchRankings();
			setIsRatingModalOpen(false);
		} catch (error) {
			console.error("Submit error:", error);
		}
	};

	const StatBar = ({ label, statKey, value, colorClass, maxScale = 10 }) => {
		const displayValue = maxScale === 4 ? ((value / 10) * 4).toFixed(1) : value;
		const percentage = (value / 10) * 100;

		return (
			<div className="flex flex-col gap-1">
				<div className="flex justify-between items-center text-[10px] uppercase tracking-wider font-semibold opacity-70">
					<MarkupTooltip 
						text={tUI(`championDetail.ratings.criteriaDesc.${statKey}.meaning`)}
						title={tUI(`championDetail.ratings.criteriaDesc.${statKey}.title`)}
					>
						<span className="cursor-help flex items-center gap-1 border-b border-dotted border-black/20">{label}</span>
					</MarkupTooltip>
					<span>{displayValue}/{maxScale}</span>
				</div>
				<div className="h-1 w-full bg-black/10 rounded-full overflow-hidden">
					<div 
						className={`h-full ${colorClass} transition-all duration-1000`}
						style={{ width: `${percentage}%` }}
					/>
				</div>
			</div>
		);
	};

	const RatingCard = ({ review }) => {
		const isFourPointScale = review.championID === "C041";
		const maxScale = isFourPointScale ? 4 : 10;

		const date = new Date(review.createdAt).toLocaleDateString(
			language === "vi" ? "vi-VN" : "en-US",
			{ year: 'numeric', month: 'short', day: 'numeric' }
		);

		const rawAvg = Object.values(review.ratings).reduce((a, b) => a + b, 0) / 6;
		const displayAvg = isFourPointScale ? ((rawAvg / 10) * 4).toFixed(1) : rawAvg.toFixed(1);

		return (
			<div className="group relative bg-[#F9FBFF] border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300">
				<div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r opacity-30 ${
					rawAvg >= 8 ? 'from-primary-500 to-orange-500' :
					rawAvg >= 5 ? 'from-celestial-500 to-indigo-500' :
					'from-gray-300 to-gray-200'
				}`} />
				
				<div className="p-5">
					<div className="flex items-start justify-between mb-4">
						<div className="flex items-center gap-3">
							<Link to={`/champion/${review.championID}`} className="relative shrink-0">
								<img 
									src={review.championImage || "/ahriicon.png"} 
									alt={review.championName}
									className="w-14 h-14 rounded-xl object-cover border border-gray-100 shadow-sm group-hover:scale-105 transition-transform"
								/>
							</Link>
							<div>
								<Link to={`/champion/${review.championID}`} className="block font-primary text-xl text-gray-900 hover:text-primary-500 transition-colors leading-tight">
									{review.championName}
								</Link>
								<div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
									<User className="w-3 h-3" />
									<span className="font-medium text-primary-600">{review.username}</span>
								</div>
							</div>
						</div>
						<div className="text-right">
							<span className="text-[10px] text-gray-400 uppercase tracking-widest block mb-1">{date}</span>
							<div className="bg-white border border-primary-500/10 px-3 py-1 rounded-full text-sm font-black text-primary-500 shadow-sm inline-block">
								{displayAvg}/{maxScale}
							</div>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-4 mt-6">
						<StatBar label={tUI("rating.damage")} statKey="damage" value={review.ratings.damage} colorClass="bg-danger-500" maxScale={maxScale} />
						<StatBar label={tUI("rating.defense")} statKey="defense" value={review.ratings.defense} colorClass="bg-celestial-500" maxScale={maxScale} />
						<StatBar label={tUI("rating.speed")} statKey="speed" value={review.ratings.speed} colorClass="bg-emerald-500" maxScale={maxScale} />
						<StatBar label={tUI("rating.consistency")} statKey="consistency" value={review.ratings.consistency} colorClass="bg-primary-400" maxScale={maxScale} />
						<StatBar label={tUI("rating.synergy")} statKey="synergy" value={review.ratings.synergy} colorClass="bg-inferno-500" maxScale={maxScale} />
						<StatBar label={tUI("rating.independence")} statKey="independence" value={review.ratings.independence} colorClass="bg-shadow-500" maxScale={maxScale} />
					</div>

					{review.comment && (
						<div className="mt-4 pt-4 border-t border-gray-100">
							<div className="flex gap-2">
								<MessageSquare className="w-3 h-3 text-gray-300 mt-1 shrink-0" />
								<p className="text-sm text-gray-600 leading-relaxed italic line-clamp-2">
									{review.comment}
								</p>
							</div>
						</div>
					)}
				</div>
			</div>
		);
	};

	const RankingList = () => {
		if (!loadingRankings && topChampions.length === 0) return null;

		return (
			<div className="bg-[#FDFEFF] border border-gray-100 rounded-2xl p-6 h-fit sticky top-24 shadow-sm">
				<div className="flex items-center gap-3 mb-6 border-b border-gray-50 pb-4">
					<div className="bg-primary-500/10 p-2 rounded-lg">
						<Trophy className="w-6 h-6 text-primary-500" />
					</div>
					<h2 className="text-lg font-primary text-gray-900 tracking-tight">{tUI("ratings.ranking.title")}</h2>
				</div>
				<div className="space-y-4">
					{loadingRankings ? (
						[...Array(5)].map((_, i) => (
							<div key={i} className="h-12 bg-gray-50 animate-pulse rounded-xl" />
						))
					) : (
						topChampions.map((champ, index) => {
							const isFourScale = champ.championID === "C041";
							const displayScore = isFourScale ? ((champ.avgScore / 10) * 4).toFixed(1) : champ.avgScore.toFixed(1);
							const maxScale = isFourScale ? 4 : 10;

							return (
								<Link 
									key={champ.championID} 
									to={`/champion/${champ.championID}`}
									className="flex items-center justify-between group p-2 rounded-xl hover:bg-gray-50 transition-all"
								>
									<div className="flex items-center gap-3">
										<div className="relative">
											<img src={champ.championImage} className="w-11 h-11 rounded-lg object-cover border border-gray-100 shadow-sm" alt={champ.championName} />
											<div className={`absolute -top-1.5 -left-1.5 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shadow-md ${
												index === 0 ? 'bg-primary-500 text-white border-2 border-white' :
												index === 1 ? 'bg-gray-400 text-white border-2 border-white' :
												index === 2 ? 'bg-orange-600 text-white border-2 border-white' :
												'bg-white text-gray-500 border border-gray-200'
											}`}>
												{index + 1}
											</div>
										</div>
										<div>
											<div className="text-sm font-semibold text-gray-900 group-hover:text-primary-500 transition-colors tracking-tight">{champ.championName}</div>
											<div className="text-[10px] text-gray-400 uppercase font-bold">{champ.count} {tUI("ratings.ranking.reviewCount")}</div>
										</div>
									</div>
									<div className="text-right">
										<div className="text-sm font-bold text-primary-500">{displayScore}/{maxScale}</div>
										<div className="text-[8px] text-gray-300 uppercase tracking-tighter">{tUI("ratings.ranking.avgScore")}</div>
									</div>
								</Link>
							);
						})
					)}
				</div>
			</div>
		);
	};

	const showSidebar = !loadingRankings && topChampions.length > 0;

	// Modal Search Logic
	const filteredModalChamps = useMemo(() => {
		if (!modalSearchTerm) return allChampions;
		return allChampions.filter(c => 
			c.name?.toLowerCase().includes(modalSearchTerm.toLowerCase())
		);
	}, [allChampions, modalSearchTerm]);

	return (
		<div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8 font-secondary">
			<Helmet>
				<title>{tUI("nav.championRatings")} | POC Guide</title>
				<meta name="description" content="Khám phá toàn bộ đánh giá và nhận xét từ cộng đồng về các vị tướng." />
			</Helmet>

			<div className="max-w-7xl mx-auto">
				{/* Top Section */}
				<div className="relative z-10 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
					<div>
						<h1 className="text-4xl md:text-6xl font-primary text-gray-900 mb-4 tracking-tight">
							{tUI("nav.championRatings")}
						</h1>
						<p className="max-w-2xl text-lg text-gray-500">
							{tUI("ratings.subtitle")}
						</p>
					</div>
					<div className="flex items-center gap-3">
						<button 
							onClick={() => setIsExplainModalOpen(true)}
							className="flex items-center justify-center w-14 h-14 bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-2xl transition-all active:scale-95 border border-gray-100"
							title={tUI("rating.explanation")}
						>
							<HelpCircle className="w-6 h-6" />
						</button>
						<button 
							onClick={() => setIsSelectChampOpen(true)}
							className="flex items-center gap-2 px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-2xl shadow-lg shadow-primary-500/20 transition-all active:scale-95 whitespace-nowrap"
						>
							<Plus className="w-5 h-5" />
							{tUI("ratings.addReview")}
						</button>
					</div>
				</div>

				<div className={`flex flex-col lg:flex-row gap-8 ${!showSidebar ? 'justify-center' : ''}`}>
					{/* Sidebar (Mobile: Top) */}
					{showSidebar && (
						<div className="lg:w-1/4">
							<RankingList />
						</div>
					)}

					{/* Main Content */}
					<div className={showSidebar ? "lg:w-3/4" : "w-full max-w-5xl"}>
						{/* Filters */}
						<div className="bg-[#F9FBFF] border border-gray-100 rounded-2xl p-6 mb-8 shadow-sm">
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
								{/* Search */}
								<div className="relative group">
									<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
									<input 
										type="text" 
										placeholder={tUI("ratings.searchPlaceholder")}
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-900 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all placeholder:text-gray-400"
									/>
								</div>

								{/* Champion Filter */}
								<DropdownFilter 
									options={[
										{ value: "all", label: tUI("ratings.allChampions") },
										...allChampions.map(c => ({ value: c.championID, label: c.name }))
									]}
									selectedValue={selectedChamp}
									onChange={setSelectedChamp}
								/>

								{/* Min Score Filter */}
								<DropdownFilter 
									options={[
										{ value: 0, label: `${tUI("ratings.minScore")}: 0+` },
										...[3, 5, 7, 8, 9].map(num => ({ value: num, label: `${tUI("ratings.minScore")}: ${num}+` }))
									]}
									selectedValue={minScore}
									onChange={setMinScore}
								/>

								{/* Sort Filter */}
								<DropdownFilter 
									options={[
										{ value: "newest", label: tUI("ratings.sort.newest") },
										{ value: "highest", label: tUI("ratings.sort.highest") },
										{ value: "lowest", label: tUI("ratings.sort.lowest") }
									]}
									selectedValue={sortBy}
									onChange={setSortBy}
								/>
							</div>
						</div>

						{/* Content Grid */}
						{loading ? (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{[...Array(6)].map((_, i) => (
									<div key={i} className="h-64 bg-gray-50 animate-pulse rounded-2xl border border-gray-100" />
								))}
							</div>
						) : processedReviews.length > 0 ? (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{processedReviews.map((review, index) => (
									<RatingCard key={`${review.championID}-${review.userSub}-${index}`} review={review} />
								))}
							</div>
						) : (
							<div className="py-20 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 shadow-sm">
								<div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
									<RotateCcw className="w-8 h-8 text-gray-200" />
								</div>
								<h3 className="text-xl text-gray-900 font-semibold mb-2">
									{tUI("ratings.noResults")}
								</h3>
								<p className="text-gray-400">{tUI("ratings.noResultsSubtitle")}</p>
							</div>
						)}

						{/* Load More */}
						{hasMore && (
							<div className="mt-12 text-center">
								<button 
									onClick={() => fetchRatings(true)}
									disabled={loadingMore}
									className="group inline-flex items-center gap-3 px-10 py-4 bg-white border border-gray-200 text-gray-900 font-bold rounded-2xl hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-50 shadow-sm"
								>
									{loadingMore ? (
										<RotateCcw className="w-6 h-6 animate-spin" />
									) : (
										<>
											<span>{tUI("ratings.loadMore")}</span>
											<ChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
										</>
									)}
								</button>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Explanations Modal */}
			<Modal 
				isOpen={isExplainModalOpen} 
				onClose={() => setIsExplainModalOpen(false)}
				title={tUI("championDetail.ratings.infoModalTitle")}
				maxWidth="max-w-3xl"
			>
				<div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
					<p className="text-gray-500 leading-relaxed italic border-l-4 border-primary-500 pl-4 py-1">
						{tUI("ratings.starLegend")}
					</p>
					<div className="grid grid-cols-1 gap-6">
						{statKeys.map(key => (
							<div key={key} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:bg-white hover:shadow-md transition-all">
								<div className="flex items-center gap-3 mb-3">
									<div className={`w-3 h-3 rounded-full ${
										key === 'damage' ? 'bg-danger-500' :
										key === 'defense' ? 'bg-celestial-500' :
										key === 'speed' ? 'bg-emerald-500' :
										key === 'consistency' ? 'bg-primary-400' :
										key === 'synergy' ? 'bg-inferno-500' :
										'bg-shadow-500'
									}`} />
									<h4 className="font-primary text-xl text-gray-900">{tUI(`championDetail.ratings.criteriaDesc.${key}.title`)}</h4>
								</div>
								
								<div className="space-y-4">
									<div>
										<h5 className="text-[10px] uppercase tracking-widest font-black text-gray-400 mb-1">{tUI("championDetail.ratings.meaningLabel")}</h5>
										<p className="text-gray-600 leading-relaxed text-sm">
											{tUI(`championDetail.ratings.criteriaDesc.${key}.meaning`)}
										</p>
									</div>
									
									<div className="bg-white/50 rounded-xl p-4 border border-gray-50">
										<h5 className="text-[10px] uppercase tracking-widest font-black text-primary-400 mb-1">{tUI("championDetail.ratings.radarLabel")}</h5>
										<p className="text-gray-500 text-sm italic leading-relaxed">
											{tUI(`championDetail.ratings.criteriaDesc.${key}.radar`)}
										</p>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
				<div className="pt-6 border-t border-gray-50 text-center">
					<button 
						onClick={() => setIsExplainModalOpen(false)}
						className="px-10 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all active:scale-95"
					>
						{tUI("common.ok")}
					</button>
				</div>
			</Modal>

			{/* Select Champion Modal */}
			<div className={`fixed inset-0 z-[120] flex items-center justify-center p-0 sm:p-4 bg-gray-900/40 backdrop-blur-sm transition-opacity duration-300 ${isSelectChampOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
				<div className={`bg-white w-full h-full sm:h-auto sm:max-h-[85vh] sm:max-w-3xl sm:rounded-3xl shadow-2xl flex flex-col relative transform transition-transform duration-300 ${isSelectChampOpen ? 'scale-100' : 'scale-95'}`}>
					{/* Modal Header */}
					<div className="p-4 sm:p-6 border-b border-gray-50 flex items-center justify-between">
						<div>
							<h3 className="text-xl sm:text-2xl font-primary text-gray-900 tracking-tight">{tUI("ratings.selectChampion")}</h3>
							<p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-bold opacity-60">{allChampions.length} Champions</p>
						</div>
						<button 
							onClick={() => setIsSelectChampOpen(false)}
							className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all"
						>
							<X className="w-6 h-6" />
						</button>
					</div>

					{/* Modal Content */}
					<div className="flex-1 overflow-hidden flex flex-col">
						{/* Inline Search */}
						<div className="p-4 sm:p-6 border-b border-gray-50">
							<div className="relative group">
								<Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-primary-500 transition-colors" />
								<input 
									type="text" 
									placeholder={tUI("ratings.searchPlaceholder")}
									value={modalSearchTerm}
									onChange={(e) => setModalSearchTerm(e.target.value)}
									className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 pl-12 pr-6 text-sm text-gray-900 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all"
								/>
							</div>
						</div>

						{/* Champion Grid */}
						<div className="flex-1 overflow-y-auto p-2 sm:p-6 custom-scrollbar">
							<div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-4">
								{filteredModalChamps.map(champ => (
									<button
										key={champ.championID}
										onClick={() => {
											setTargetChampID(champ.championID);
											setIsSelectChampOpen(false);
											setIsRatingModalOpen(true);
										}}
										className="group relative flex flex-col items-center p-2 sm:p-4 rounded-2xl hover:bg-primary-50 transition-all"
									>
										<div className="relative mb-2">
											<img 
												src={champ.assets?.[0]?.avatar || "/ahriicon.png"} 
												className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-transparent group-hover:border-primary-500 shadow-sm transition-all"
												alt={champ.name}
											/>
											<div className="absolute inset-0 bg-primary-500 opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity" />
										</div>
										<span className="text-[10px] sm:text-xs font-black text-gray-600 group-hover:text-primary-600 text-center line-clamp-1 uppercase tracking-tight">
											{champ.name}
										</span>
									</button>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Rating Modal */}
			{isRatingModalOpen && (
				<RatingModal 
					isOpen={isRatingModalOpen}
					onClose={() => setIsRatingModalOpen(false)}
					championID={targetChampID}
					onSubmit={handleRatingSubmit}
				/>
			)}
		</div>
	);
};

export default ChampionRatingPage;
