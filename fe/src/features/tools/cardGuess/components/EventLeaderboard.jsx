import React, { useState, useEffect } from "react";
import { Trophy, Medal, Loader2, Calendar, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

const EventLeaderboard = () => {
	const [leaders, setLeaders] = useState([]);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState("unlimited"); // "daily", "unlimited"
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const limit = 10;
	const backendUrl = import.meta.env.VITE_API_URL;
	const { tUI } = useTranslation();

	useEffect(() => {
		const fetchLeaderboard = async () => {
			setLoading(true);
			try {
				const res = await fetch(`${backendUrl}/api/guess-game/leaderboard?mode=${activeTab}&page=${page}&limit=${limit}`);
				if (res.ok) {
					const data = await res.json();
					setLeaders(data.data || []);
					setTotalPages(data.totalPages || 1);
				}
			} catch (e) {
				console.error(e);
			} finally {
				setLoading(false);
			}
		};
		fetchLeaderboard();
	}, [backendUrl, activeTab, page]);

	if (loading) {
		return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary-500 w-8 h-8" /></div>;
	}

	const getScore = (leader) => {
		if (activeTab === "all") return leader.score;
		if (activeTab === "daily") return leader.dailyScore;
		if (activeTab === "unlimited") return leader.unlimitedBestScore;
		if (activeTab === "event") return leader.bestScore;
		return 0;
	};

	const getSolved = (leader) => {
		if (activeTab === "all") return leader.solvedPuzzles;
		if (activeTab === "daily") return leader.dailySolved;
		if (activeTab === "unlimited") return leader.unlimitedBestSolved || 0;
		if (activeTab === "event") return leader.bestSolved || 0;
		return 0;
	};

	const getDuration = (leader) => {
		if (activeTab === "daily") return leader.dailyDuration;
		if (activeTab === "unlimited") return leader.unlimitedBestRunDuration;
		if (activeTab === "event") return leader.bestRunDuration;
		return null;
	};

	const formatTime = (totalSeconds) => {
		if (!totalSeconds) return "-";
		const d = Math.floor(totalSeconds / 86400);
		const h = Math.floor((totalSeconds % 86400) / 3600);
		const m = Math.floor((totalSeconds % 3600) / 60);
		const s = Math.floor(totalSeconds % 60);
		
		const parts = [];
		if (d > 0) parts.push(`${d}${tUI("common.time.daysShort", "d")}`);
		if (h > 0) parts.push(`${h}${tUI("common.time.hoursShort", "h")}`);
		if (m > 0) parts.push(`${m}${tUI("common.time.minsShort", "m")}`);
		if (s > 0 || parts.length === 0) parts.push(`${s}${tUI("common.time.secsShort", "s")}`);
		return parts.join(" ");
	};

	return (
		<div className="w-full">
			<div className="flex items-center gap-3 mb-6 justify-center">
				<Trophy className="w-8 h-8 text-yellow-500" />
				<h2 className="text-2xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
					{tUI("cardGuess.leaderboard.title")}
				</h2>
				<Trophy className="w-8 h-8 text-yellow-500" />
			</div>

			{/* Tabs */}
			<div className="flex flex-wrap justify-center gap-2 mb-6">
				{[
					{ id: "unlimited", label: tUI("cardGuess.mode.unlimited") },
					{ id: "daily", label: tUI("cardGuess.mode.daily") },
					{ id: "event", label: tUI("cardGuess.mode.event", "Sự kiện") }
				].map(tab => (
					<button
						key={tab.id}
						onClick={() => {
							setActiveTab(tab.id);
							setPage(1);
						}}
						className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${
							activeTab === tab.id 
								? "bg-primary-500 text-white shadow-[0_0_15px_rgba(var(--primary-500-rgb,99,102,241),0.5)]" 
								: "bg-surface-bg/50 text-text-secondary hover:bg-white/10 hover:text-white"
						}`}
					>
						{tab.label}
					</button>
				))}
			</div>

			<div className="bg-surface-bg/50 border border-border rounded-2xl overflow-hidden">
				<table className="w-full text-left border-collapse">
					<thead>
						<tr className="bg-black/20 border-b border-border">
							<th className="py-4 px-2 sm:px-4 font-bold text-text-secondary w-10 sm:w-16 text-center">#</th>
							<th className="py-4 px-2 sm:px-4 font-bold text-text-secondary">{tUI("cardGuess.leaderboard.player")}</th>
							{activeTab !== "all" && (
								<th className="py-4 px-2 sm:px-4 font-bold text-text-secondary text-right hidden md:table-cell">
									<div className="flex items-center justify-end gap-1">
										<Clock className="w-4 h-4" />
										{tUI("cardGuess.leaderboard.duration", "Thời gian")}
									</div>
								</th>
							)}
							<th className="py-4 px-2 sm:px-4 font-bold text-text-secondary text-right hidden sm:table-cell">
								{tUI("cardGuess.leaderboard.solved", "Đoán đúng")}
							</th>
							<th className="py-4 px-2 sm:px-4 font-bold text-text-secondary text-right">{tUI("cardGuess.leaderboard.score")}</th>
						</tr>
					</thead>
					<tbody>
						{leaders.length === 0 ? (
							<tr>
								<td colSpan={5} className="text-center py-8 text-text-secondary">
									{tUI("cardGuess.leaderboard.empty")}
								</td>
							</tr>
						) : (
							leaders.map((leader, index) => (
								<tr 
									key={leader._id || index} 
									className="border-b border-white/5 hover:bg-white/5 transition-colors"
								>
									<td className="py-3 px-2 sm:px-4 text-center font-black">
										{(() => {
											const rank = (page - 1) * limit + index;
											if (rank === 0) return <Medal className="w-6 h-6 mx-auto text-yellow-400 drop-shadow-md" />;
											if (rank === 1) return <Medal className="w-6 h-6 mx-auto text-gray-300 drop-shadow-md" />;
											if (rank === 2) return <Medal className="w-6 h-6 mx-auto text-amber-600 drop-shadow-md" />;
											return <span className="text-text-secondary">{rank + 1}</span>;
										})()}
									</td>
									<td className="py-3 px-2 sm:px-4 font-bold text-text-primary flex items-center gap-1 sm:gap-2 max-w-[120px] sm:max-w-[200px] md:max-w-none">
										<div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white text-[10px] sm:text-xs shadow-inner shrink-0">
											{leader.userName?.charAt(0).toUpperCase() || "G"}
										</div>
										<span className="truncate">{leader.userName || "Guest"}</span>
									</td>
									{activeTab !== "all" && (
										<td className="py-3 px-2 sm:px-4 text-right font-medium text-text-secondary hidden md:table-cell">
											{formatTime(getDuration(leader))}
										</td>
									)}
									<td className="py-3 px-2 sm:px-4 text-right font-medium text-text-secondary hidden sm:table-cell">
										{getSolved(leader)}
									</td>
									<td className="py-3 px-2 sm:px-4 text-right">
										<span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 text-lg">
											{getScore(leader)}
										</span>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			{/* Pagination Controls */}
			{totalPages > 1 && (
				<div className="flex justify-center items-center gap-4 mt-6">
					<button
						onClick={() => setPage(p => Math.max(1, p - 1))}
						disabled={page === 1}
						className="p-2 rounded-full bg-surface-bg/50 text-text-secondary hover:text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
					>
						<ChevronLeft className="w-5 h-5" />
					</button>
					<div className="flex gap-2">
						<span className="text-sm font-medium text-text-secondary">
							{tUI("cardGuess.leaderboard.page", "Trang")} {page} / {totalPages}
						</span>
					</div>
					<button
						onClick={() => setPage(p => Math.min(totalPages, p + 1))}
						disabled={page === totalPages}
						className="p-2 rounded-full bg-surface-bg/50 text-text-secondary hover:text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
					>
						<ChevronRight className="w-5 h-5" />
					</button>
				</div>
			)}
		</div>
	);
};

export default EventLeaderboard;
