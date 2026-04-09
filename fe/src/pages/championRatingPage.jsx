import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { FloatingPortal } from "@floating-ui/react";
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
import Button from "../components/common/button";

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
			<div className="flex flex-col gap-1.5">
				<div className="flex justify-between items-center text-[11px] uppercase tracking-wider font-bold text-text-primary">
					<MarkupTooltip 
						description={tUI(`championDetail.ratings.criteriaDesc.${statKey}.meaning`)}
						title={tUI(`championDetail.ratings.criteriaDesc.${statKey}.title`)}
						compact={true}
					>
						<span className="cursor-help flex items-center gap-1 border-b border-dotted border-border opacity-70 hover:opacity-100 transition-opacity">{label}</span>
					</MarkupTooltip>
					<span className="opacity-90">{displayValue}/{maxScale}</span>
				</div>
				<div className="h-2 w-full bg-surface-bg border border-border/30 rounded-full overflow-hidden shadow-inner">
					<div 
						className={`h-full ${colorClass} transition-all duration-1000 shadow-[0_0_8px_rgba(0,0,0,0.1)]`}
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
			<div className="group relative bg-surface-bg border border-border rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300">
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
									className="w-14 h-14 rounded-xl object-cover border border-border shadow-sm group-hover:scale-105 transition-transform"
								/>
							</Link>
							<div>
								<Link to={`/champion/${review.championID}`} className="block font-primary text-xl text-text-primary hover:text-primary-500 transition-colors leading-tight">
									{review.championName}
								</Link>
								<div className="flex items-center gap-1.5 text-xs text-text-secondary mt-1">
									<User className="w-3 h-3" />
									<span className="font-medium text-primary-500">{review.username}</span>
								</div>
							</div>
						</div>
						<div className="text-right">
							<span className="text-[10px] text-text-secondary uppercase tracking-widest block mb-1">{date}</span>
							<div className="bg-modal-bg border border-primary-500/20 px-3 py-1 rounded-full text-sm font-black text-primary-500 shadow-sm inline-block">
								{displayAvg}/{maxScale}
							</div>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-4 mt-6">
						<StatBar label={tUI("rating.damage")} statKey="damage" value={review.ratings.damage} colorClass="bg-primary-500" maxScale={maxScale} />
						<StatBar label={tUI("rating.defense")} statKey="defense" value={review.ratings.defense} colorClass="bg-primary-500" maxScale={maxScale} />
						<StatBar label={tUI("rating.speed")} statKey="speed" value={review.ratings.speed} colorClass="bg-primary-500" maxScale={maxScale} />
						<StatBar label={tUI("rating.consistency")} statKey="consistency" value={review.ratings.consistency} colorClass="bg-primary-500" maxScale={maxScale} />
						<StatBar label={tUI("rating.synergy")} statKey="synergy" value={review.ratings.synergy} colorClass="bg-primary-500" maxScale={maxScale} />
						<StatBar label={tUI("rating.independence")} statKey="independence" value={review.ratings.independence} colorClass="bg-primary-500" maxScale={maxScale} />
					</div>

					{review.comment && (
						<div className="mt-4 pt-4 border-t border-border">
							<div className="flex gap-2">
								<MessageSquare className="w-3 h-3 text-text-secondary opacity-50 mt-1 shrink-0" />
								<p className="text-sm text-text-primary leading-relaxed italic line-clamp-2 opacity-80">
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
			<div className="bg-surface-bg border border-border rounded-2xl p-6 h-fit lg:sticky lg:top-24 shadow-sm">
				<div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
					<div className="bg-primary-500/10 p-2 rounded-lg">
						<Trophy className="w-6 h-6 text-primary-500" />
					</div>
					<h2 className="text-lg font-primary text-text-primary tracking-tight">{tUI("ratings.ranking.title")}</h2>
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
									className="flex items-center justify-between group p-2 rounded-xl hover:bg-surface-hover transition-all"
								>
									<div className="flex items-center gap-3">
										<div className="relative">
											<img src={champ.championImage} className="w-11 h-11 rounded-lg object-cover border border-border shadow-sm" alt={champ.championName} />
											<div className={`absolute -top-1.5 -left-1.5 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shadow-md ${
												index === 0 ? 'bg-primary-500 text-white border-2 border-surface-bg' :
												index === 1 ? 'bg-gray-400 text-white border-2 border-surface-bg' :
												index === 2 ? 'bg-orange-600 text-white border-2 border-surface-bg' :
												'bg-modal-bg text-text-secondary border border-border'
											}`}>
												{index + 1}
											</div>
										</div>
										<div>
											<div className="text-sm font-semibold text-text-primary group-hover:text-primary-500 transition-colors tracking-tight">{champ.championName}</div>
											<div className="text-[10px] text-text-secondary uppercase font-bold">{champ.count} {tUI("ratings.ranking.reviewCount")}</div>
										</div>
									</div>
									<div className="text-right">
										<div className="text-sm font-bold text-primary-500">{displayScore}/{maxScale}</div>
										<div className="text-[8px] text-text-secondary uppercase tracking-tighter opacity-50">{tUI("ratings.ranking.avgScore")}</div>
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
		<div className="min-h-screen bg-page-bg py-12 px-4 sm:px-6 lg:px-8 font-secondary transition-colors duration-300">
			<Helmet>
				<title>{tUI("nav.championRatings")} | POC Guide</title>
				<meta name="description" content="Khám phá toàn bộ đánh giá và nhận xét từ cộng đồng về các vị tướng." />
			</Helmet>

			<div className="max-w-7xl mx-auto">
				{/* Top Section */}
				<div className="relative z-10 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
					<div>
						<h1 className="text-4xl md:text-6xl font-primary text-text-primary mb-4 tracking-tight">
							{tUI("nav.championRatings")}
						</h1>
						<p className="max-w-2xl text-lg text-text-secondary">
							{tUI("ratings.subtitle")}
						</p>
					</div>
					<div className="flex items-center gap-3">
						<Button
							variant="secondary"
							className="w-14 h-14 !p-0 rounded-2xl"
							onClick={() => setIsExplainModalOpen(true)}
							title={tUI("rating.explanation")}
						>
							<HelpCircle className="w-6 h-6" />
						</Button>
						<Button
							variant="primary"
							className="px-8 py-4 h-14 rounded-2xl"
							onClick={() => setIsSelectChampOpen(true)}
						>
							<Plus className="w-5 h-5" />
							{tUI("ratings.addReview")}
						</Button>
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
						<div className="bg-surface-bg border border-border rounded-2xl p-6 mb-8 shadow-sm">
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
								{/* Search */}
								<div className="relative group">
									<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-primary-500 transition-colors" />
									<input 
										type="text" 
										placeholder={tUI("ratings.searchPlaceholder")}
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										className="w-full bg-input-bg border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm text-text-primary focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all placeholder:text-text-secondary/50"
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
							<div className="py-20 text-center bg-surface-hover rounded-2xl border border-dashed border-border shadow-sm">
								<div className="bg-surface-bg w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
									<RotateCcw className="w-8 h-8 text-border" />
								</div>
								<h3 className="text-xl text-text-primary font-semibold mb-2">
									{tUI("ratings.noResults")}
								</h3>
								<p className="text-text-secondary">{tUI("ratings.noResultsSubtitle")}</p>
							</div>
						)}

						{/* Load More */}
						{hasMore && (
							<div className="mt-12 text-center">
								<Button 
									onClick={() => fetchRatings(true)}
									disabled={loadingMore}
									variant="secondary"
									className="group inline-flex items-center gap-3 px-10 py-4 h-14 rounded-2xl"
								>
									{loadingMore ? (
										<RotateCcw className="w-6 h-6 animate-spin" />
									) : (
										<>
											<span>{tUI("ratings.loadMore")}</span>
											<ChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
										</>
									)}
								</Button>
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
					<p className="text-text-secondary leading-relaxed italic border-l-4 border-primary-500 pl-4 py-1">
						{tUI("ratings.starLegend")}
					</p>
					<div className="grid grid-cols-1 gap-6">
						{statKeys.map(key => (
							<div key={key} className="bg-surface-hover rounded-2xl p-6 border border-border hover:bg-surface-bg hover:shadow-md transition-all">
								<div className="flex items-center gap-3 mb-3">
									<div className="w-3 h-3 rounded-full bg-primary-500" />
									<h4 className="font-primary text-xl text-text-primary">{tUI(`championDetail.ratings.criteriaDesc.${key}.title`)}</h4>
								</div>
								
								<div className="space-y-4">
									<div>
										<h5 className="text-[10px] uppercase tracking-widest font-black text-text-secondary opacity-50 mb-1">{tUI("championDetail.ratings.meaningLabel")}</h5>
										<p className="text-text-primary leading-relaxed text-sm opacity-80">
											{tUI(`championDetail.ratings.criteriaDesc.${key}.meaning`)}
										</p>
									</div>
									
									<div className="bg-surface-bg/50 rounded-xl p-4 border border-border">
										<h5 className="text-[10px] uppercase tracking-widest font-black text-primary-400 mb-1">{tUI("championDetail.ratings.radarLabel")}</h5>
										<p className="text-text-secondary text-sm italic leading-relaxed">
											{tUI(`championDetail.ratings.criteriaDesc.${key}.radar`)}
										</p>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
				<div className="pt-6 border-t border-border text-center">
					<Button 
						onClick={() => setIsExplainModalOpen(false)}
						variant="primary"
						className="px-10 py-3 rounded-xl"
					>
						{tUI("common.ok")}
					</Button>
				</div>
			</Modal>

			{/* Select Champion Modal */}
			{isSelectChampOpen && (
				<FloatingPortal>
					<div className="fixed inset-0 z-[120] flex items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm transition-opacity duration-300">
						<div className={`bg-modal-bg w-full h-full sm:h-auto sm:max-h-[85vh] sm:max-w-3xl sm:rounded-3xl shadow-2xl flex flex-col relative transform transition-transform duration-300 ${isSelectChampOpen ? 'scale-100' : 'scale-95'}`}>
							{/* Modal Header */}
							<div className="p-4 sm:p-6 border-b border-border flex items-center justify-between">
								<div>
									<h3 className="text-xl sm:text-2xl font-primary text-text-primary tracking-tight">{tUI("ratings.selectChampion")}</h3>
									<p className="text-xs text-text-secondary mt-1 uppercase tracking-widest font-bold opacity-60">{allChampions.length} Champions</p>
								</div>
								<button 
									onClick={() => setIsSelectChampOpen(false)}
									className="w-10 h-10 rounded-full bg-surface-hover flex items-center justify-center text-text-secondary hover:text-text-primary transition-all"
								>
									<X className="w-6 h-6" />
								</button>
							</div>

							{/* Modal Content */}
							<div className="flex-1 overflow-hidden flex flex-col">
								{/* Inline Search */}
								<div className="p-4 sm:p-6 border-b border-border">
									<div className="relative group">
										<Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary group-focus-within:text-primary-500 transition-colors opacity-50" />
										<input 
											type="text" 
											placeholder={tUI("ratings.searchPlaceholder")}
											value={modalSearchTerm}
											onChange={(e) => setModalSearchTerm(e.target.value)}
											className="w-full bg-input-bg border border-transparent rounded-2xl py-4 pl-12 pr-6 text-sm text-text-primary focus:outline-none focus:bg-surface-bg focus:border-border focus:ring-4 focus:ring-primary-500/10 transition-all"
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
												className="group relative flex flex-col items-center p-2 sm:p-4 rounded-2xl hover:bg-dropdown-item-hover-bg transition-all"
											>
												<div className="relative mb-2">
													<img 
														src={champ.assets?.[0]?.avatar || "/ahriicon.png"} 
														className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-transparent group-hover:border-primary-500 shadow-sm transition-all"
														alt={champ.name}
													/>
													<div className="absolute inset-0 bg-primary-500 opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity" />
												</div>
												<span className="text-[10px] sm:text-xs font-black text-text-primary group-hover:text-primary-600 text-center line-clamp-1 uppercase tracking-tight opacity-70 group-hover:opacity-100">
													{champ.name}
												</span>
											</button>
										))}
									</div>
								</div>
							</div>
						</div>
					</div>
				</FloatingPortal>
			)}

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
