// src/features/tools/cardGuess/components/GameStats.jsx
import React from "react";
import { Trophy, Flame, Target, BarChart3, Users } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

const STORAGE_KEY = "card_guess_stats";

// Utility: Đọc/ghi stats từ localStorage
export const getStats = () => {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return createDefaultStats();
		return JSON.parse(raw);
	} catch {
		return createDefaultStats();
	}
};

export const saveStats = (stats) => {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
};

const createDefaultStats = () => ({
	gamesPlayed: 0,
	gamesWon: 0,
	currentStreak: 0,
	maxStreak: 0,
	distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
});

export const recordWin = (guessCount) => {
	const stats = getStats();
	stats.gamesPlayed += 1;
	stats.gamesWon += 1;
	stats.currentStreak += 1;
	stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
	const key = Math.min(guessCount, 5);
	stats.distribution[key] = (stats.distribution[key] || 0) + 1;
	saveStats(stats);
	return stats;
};

export const recordLoss = () => {
	const stats = getStats();
	stats.gamesPlayed += 1;
	stats.currentStreak = 0;
	saveStats(stats);
	return stats;
};

const StatCard = ({ icon: Icon, label, value, accent = false }) => (
	<div className={`flex flex-col items-center gap-1 px-4 py-3 rounded-2xl border backdrop-blur-xl ${
		accent
			? "bg-primary-500/10 border-primary-500/30"
			: "bg-surface-bg border-border"
	}`}>
		<Icon className={`w-5 h-5 ${accent ? "text-primary-400" : "text-text-secondary"}`} />
		<span className={`text-2xl font-black ${accent ? "text-primary-400" : "text-text-primary"}`}>
			{value}
		</span>
		<span className="text-[10px] uppercase tracking-widest text-text-secondary font-bold">
			{label}
		</span>
	</div>
);

const GameStats = ({ stats: propStats, globalStats, lastGuessCount }) => {
	const { tUI } = useTranslation();
	const stats = propStats || getStats();

	const winRate = stats.gamesPlayed > 0
		? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
		: 0;

	const maxDistValue = Math.max(...Object.values(stats.distribution || {}), 1);

	return (
		<div className="w-full max-w-md mx-auto">
			<h3 className="text-lg font-black uppercase tracking-wider text-text-primary mb-4 flex items-center gap-2">
				<BarChart3 className="w-5 h-5 text-primary-500" />
				{tUI("cardGuess.stats.title")}
			</h3>

			{/* Stats Grid */}
			<div className="grid grid-cols-4 gap-2 mb-6">
				<StatCard icon={Target} label={tUI("cardGuess.gamesPlayed")} value={stats.gamesPlayed} />
				<StatCard icon={Trophy} label={tUI("cardGuess.winRate")} value={`${winRate}%`} />
				<StatCard icon={Flame} label={tUI("cardGuess.streak")} value={stats.currentStreak} accent />
				<StatCard icon={Flame} label={tUI("cardGuess.maxStreak")} value={stats.maxStreak} />
			</div>

			{/* Distribution chart */}
			<div className="space-y-2">
				<h4 className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-3">
					{tUI("cardGuess.stats.distribution")}
				</h4>
				{[1, 2, 3, 4, 5].map((guessNum) => {
					const count = stats.distribution?.[guessNum] || 0;
					const width = maxDistValue > 0 ? (count / maxDistValue) * 100 : 0;
					return (
						<div key={guessNum} className="flex items-center gap-3">
							<span className="text-sm font-bold text-text-secondary w-4 text-right">
								{guessNum}
							</span>
							<div className="flex-1 h-7 bg-surface-bg rounded-lg overflow-hidden border border-border">
								<div
									className="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-lg flex items-center justify-end pr-2 transition-all duration-500"
									style={{ width: `${Math.max(width, count > 0 ? 12 : 0)}%` }}
								>
									{count > 0 && (
										<span className="text-xs font-black text-white">{count}</span>
									)}
								</div>
							</div>
						</div>
					);
				})}
			</div>

			{/* Global Stats */}
			{globalStats && (
				<div className="mt-8 pt-6 border-t border-border/50 space-y-4">
					<h3 className="text-lg font-black uppercase tracking-wider text-text-primary flex items-center gap-2">
						<Target className="w-5 h-5 text-primary-500" />
						{tUI("cardGuess.stats.globalTitle", "Thống kê cộng đồng")}
					</h3>
					<div className="grid grid-cols-2 gap-2">
						<StatCard 
							icon={Target} 
							label={tUI("cardGuess.stats.globalPlayed", "Tổng số người chơi")} 
							value={globalStats.totalPlayed || 0} 
						/>
						<StatCard 
							icon={Trophy} 
							label={tUI("cardGuess.stats.globalWon", "Tổng số đoán đúng")} 
							value={globalStats.totalWon || 0} 
							accent
						/>
					</div>
					<div className="text-center text-xs text-text-secondary mt-2">
						{(globalStats.totalPlayed > 0 ? Math.round((globalStats.totalWon / globalStats.totalPlayed) * 100) : 0)}% {tUI("cardGuess.stats.winRate", "Tỉ lệ thắng")}
					</div>
					
					{lastGuessCount != null && globalStats.distribution && (
						<div className="mt-4 p-4 rounded-xl bg-primary-500/10 border border-primary-500/20 text-center">
							<div className="flex items-center justify-center gap-2 text-primary-400 font-bold mb-1">
								<Users className="w-5 h-5" />
								<span>{globalStats.distribution[lastGuessCount] || 0}</span>
							</div>
							<div className="text-xs text-text-secondary uppercase tracking-wider">
								{tUI("cardGuess.stats.sameTries", "Người có cùng số lần đoán với bạn")}
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default GameStats;
