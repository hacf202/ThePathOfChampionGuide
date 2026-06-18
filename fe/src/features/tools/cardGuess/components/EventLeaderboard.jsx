import React, { useState, useEffect } from "react";
import { Trophy, Medal, Loader2, Calendar } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

const EventLeaderboard = () => {
	const [leaders, setLeaders] = useState([]);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState("all"); // "all", "daily", "hard", "unlimited"
	const backendUrl = import.meta.env.VITE_API_URL;
	const { tUI } = useTranslation();

	useEffect(() => {
		const fetchLeaderboard = async () => {
			setLoading(true);
			try {
				const res = await fetch(`${backendUrl}/api/guess-game/leaderboard?mode=${activeTab}`);
				if (res.ok) {
					const data = await res.json();
					setLeaders(data);
				}
			} catch (e) {
				console.error(e);
			} finally {
				setLoading(false);
			}
		};
		fetchLeaderboard();
	}, [backendUrl, activeTab]);

	if (loading) {
		return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-purple-500 w-8 h-8" /></div>;
	}

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
					{ id: "all", label: tUI("cardGuess.leaderboard.all") },
					{ id: "daily", label: tUI("cardGuess.mode.daily") },
					{ id: "hard", label: tUI("cardGuess.mode.hard") },
					{ id: "unlimited", label: tUI("cardGuess.mode.unlimited") }
				].map(tab => (
					<button
						key={tab.id}
						onClick={() => setActiveTab(tab.id)}
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
							<th className="py-4 px-4 font-bold text-text-secondary w-16 text-center">#</th>
							<th className="py-4 px-4 font-bold text-text-secondary">{tUI("cardGuess.leaderboard.player")}</th>
							<th className="py-4 px-4 font-bold text-text-secondary text-right">{tUI("cardGuess.leaderboard.score")}</th>
							<th className="py-4 px-4 font-bold text-text-secondary text-right hidden sm:table-cell">{tUI("cardGuess.leaderboard.solved")}</th>
						</tr>
					</thead>
					<tbody>
						{leaders.length === 0 ? (
							<tr>
								<td colSpan={4} className="text-center py-8 text-text-secondary">
									{tUI("cardGuess.leaderboard.empty")}
								</td>
							</tr>
						) : (
							leaders.map((leader, index) => (
								<tr 
									key={leader.userId} 
									className="border-b border-white/5 hover:bg-white/5 transition-colors"
								>
									<td className="py-3 px-4 text-center font-black">
										{index === 0 ? <Medal className="w-6 h-6 mx-auto text-yellow-400 drop-shadow-md" /> :
										 index === 1 ? <Medal className="w-6 h-6 mx-auto text-gray-300 drop-shadow-md" /> :
										 index === 2 ? <Medal className="w-6 h-6 mx-auto text-amber-600 drop-shadow-md" /> :
										 <span className="text-text-secondary">{index + 1}</span>}
									</td>
									<td className="py-3 px-4 font-bold text-text-primary flex items-center gap-2">
										<div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs shadow-inner">
											{leader.userName?.charAt(0).toUpperCase()}
										</div>
										{leader.userName}
									</td>
									<td className="py-3 px-4 text-right">
										<span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 text-lg">
											{activeTab === "all" ? leader.score : leader[`${activeTab}Score`]}
										</span>
									</td>
									<td className="py-3 px-4 text-right font-medium text-text-secondary hidden sm:table-cell">
										{activeTab === "all" ? leader.solvedPuzzles : leader[`${activeTab}Solved`]} <span className="text-xs">{tUI("cardGuess.leaderboard.cards")}</span>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default EventLeaderboard;
