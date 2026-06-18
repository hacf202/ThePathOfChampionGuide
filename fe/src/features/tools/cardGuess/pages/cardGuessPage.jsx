// src/features/tools/cardGuess/pages/cardGuessPage.jsx
import React, { useState, useEffect, useCallback, useMemo, useContext } from "react";
import { Loader2, RotateCcw, BarChart3, Shuffle, Calendar, Infinity, SkipForward, Swords, Info, Trophy } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import PageTitle from "@/components/common/pageTitle";
import { AuthContext } from "@/context/AuthContext.jsx";
import CardCropViewer from "@/features/tools/cardGuess/components/CardCropViewer";
import CardSearchInput from "@/features/tools/cardGuess/components/CardSearchInput";
import GuessHistory from "@/features/tools/cardGuess/components/GuessHistory";
import EventLeaderboard from "@/features/tools/cardGuess/components/EventLeaderboard";
import GameStats, { getStats, recordWin, recordLoss } from "@/features/tools/cardGuess/components/GameStats";

const LOCAL_STORAGE_KEY = "card_guess_active_session";
const DEVICE_ID_KEY = "card_guess_device_id";

const getDeviceId = () => {
	let id = localStorage.getItem(DEVICE_ID_KEY);
	if (!id) {
		id = Math.random().toString(36).substring(2, 15);
		localStorage.setItem(DEVICE_ID_KEY, id);
	}
	return id;
};

const toFullArtUrl = (url) => url ? url.replace(/(\.[a-zA-Z]+)$/, "-full$1") : "";

const CardGuessPage = () => {
	const { tUI, language } = useTranslation();
	const backendUrl = import.meta.env.VITE_API_URL;
	const { token, user } = useContext(AuthContext);

	// Data
	const [allCards, setAllCards] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	// Game state
	const [mode, setMode] = useState("daily"); // "daily" | "unlimited" | "hard"
	const [sessionId, setSessionId] = useState(null);
	const [targetCard, setTargetCard] = useState(null);
	const [guesses, setGuesses] = useState([]);
	const [hintLevel, setHintLevel] = useState(0);
	const [gameStatus, setGameStatus] = useState("playing"); // "playing" | "won" | "lost"
	const [cropSeed, setCropSeed] = useState(0);
	const [maxGuesses, setMaxGuesses] = useState(5);
	const [stats, setStats] = useState(getStats());
	const [globalStats, setGlobalStats] = useState(null);
	const [showStats, setShowStats] = useState(false);
	const [gameKey, setGameKey] = useState(0);
	const [isRestored, setIsRestored] = useState(false);

	// Fetch all cards initially for local search input
	useEffect(() => {
		const fetchCards = async () => {
			setIsLoading(true);
			try {
				const res = await fetch(`${backendUrl}/api/cards?limit=-1&onlyBase=true`);
				const data = await res.json();
				const cards = data.items || data || [];
				const validCards = cards.filter((c) => {
					if (!c.gameAbsolutePath || !c.cardName || /T\d+$/.test(c.cardCode)) return false;
					const typeVi = (c.type || "").toLowerCase();
					const typeEn = (c.translations?.en?.type || "").toLowerCase();
					return typeVi.includes("quân") || typeEn === "unit" || typeVi === "champion" || typeEn === "champion";
				});
				setAllCards(validCards);
			} catch (error) {
				console.error("Error fetching cards:", error);
			} finally {
				setIsLoading(false);
			}
		};
		fetchCards();
	}, [backendUrl]);

	const fetchGlobalStats = useCallback(async (code) => {
		if (!code || code === "event_hidden") return;
		try {
			const res = await fetch(`${backendUrl}/api/cards/guess-stats/${code}`);
			if (res.ok) {
				const data = await res.json();
				setGlobalStats(data);
			}
		} catch (e) {
			console.error("Lỗi lấy global stats:", e);
		}
	}, [backendUrl]);

	// Load Game State from Backend
	const loadGameState = useCallback(async (selectedMode = mode) => {
		setIsLoading(true);
		try {
			const headers = { "Content-Type": "application/json" };
			if (token) headers.Authorization = `Bearer ${token}`;

			const res = await fetch(`${backendUrl}/api/guess-game/start`, {
				method: "POST",
				headers,
				body: JSON.stringify({ mode: selectedMode, deviceId: getDeviceId() })
			});

			if (!res.ok) throw new Error("Failed to load game state");
			const data = await res.json();
			
			setSessionId(data.sessionId);
			setMaxGuesses(data.maxGuesses);
			setCropSeed(data.cropSeed);
			setGuesses(data.guesses || []);
			setGameStatus(data.isCompleted ? (data.won ? "won" : "lost") : "playing");
			setHintLevel(data.isCompleted ? 5 : (data.guesses?.length || 0));
			
			if (data.isCompleted && data.targetCard) {
				setTargetCard(data.targetCard);
				fetchGlobalStats(data.targetCard.cardCode);
			} else {
				setTargetCard({
					cardCode: "event_hidden",
					isPartial: true,
					...data.targetAttributes
				});
			}
		} catch (e) {
			console.error("Error loading game state:", e);
		} finally {
			setIsLoading(false);
			setIsRestored(true);
		}
	}, [mode, token, backendUrl, fetchGlobalStats]);

	useEffect(() => {
		if (allCards.length > 0 && !isRestored) {
			try {
				const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
				if (saved) {
					const data = JSON.parse(saved);
					setMode(data.mode === "event" ? "daily" : data.mode);
				}
			} catch (e) {
				console.error("Lỗi parse session mode:", e);
			}
			// Automatically start backend session
			loadGameState(mode);
		}
	}, [allCards, isRestored, mode, loadGameState]);

	// Save mode to local storage
	useEffect(() => {
		const data = { mode };
		localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
	}, [mode]);

	const pickCard = useCallback(() => {
		setShowStats(false);
		setGlobalStats(null);
		setGameKey((k) => k + 1);
		loadGameState(mode);
	}, [mode, loadGameState]);

	const handleGuess = useCallback(
		async (guessedCard) => {
			if (gameStatus !== "playing" || !sessionId) return;

			try {
				const headers = { "Content-Type": "application/json" };
				if (token) headers.Authorization = `Bearer ${token}`;

				const res = await fetch(`${backendUrl}/api/guess-game/guess`, {
					method: "POST",
					headers,
					body: JSON.stringify({ sessionId, guessedCardCode: guessedCard.cardCode })
				});
				const data = await res.json();
				if (data.error) throw new Error(data.error);

				const newGuesses = [...guesses, guessedCard];
				setGuesses(newGuesses);

				if (data.isCompleted) {
					setGameStatus(data.won ? "won" : "lost");
					setHintLevel(5);
					setTargetCard(data.targetCard);
					fetchGlobalStats(data.targetCard.cardCode);
					setTimeout(() => setShowStats(true), 1500);

					// Local stats
					const updated = data.won ? recordWin(newGuesses.length) : recordLoss();
					setStats(updated);
				} else {
					setHintLevel(data.hintLevel);
				}
			} catch (e) {
				console.error("Guess error:", e);
			}
		},
		[gameStatus, sessionId, guesses, backendUrl, token, fetchGlobalStats]
	);

	const handleSkip = useCallback(() => {
		if (gameStatus !== "playing" || !targetCard || targetCard.isPartial) return;
		// Skipping is tricky with backend state because backend doesn't have a "skip" endpoint.
		// However, the backend will mark it lost if guesses max out.
		// For simplicity, we can't easily skip without knowing the answer. We could hide the button.
	}, [gameStatus, targetCard]);

	const handleModeChange = useCallback(
		(newMode) => {
			if (newMode !== mode) {
				setMode(newMode);
				setTargetCard(null);
				setGuesses([]);
				setGameStatus("playing");
				loadGameState(newMode);
			}
		},
		[mode, loadGameState]
	);

	const getCardName = useCallback(
		(card) => {
			if (!card) return "";
			if (card.isPartial) return "???";
			if (language === "en" && card.translations?.en?.cardName) {
				return card.translations.en.cardName;
			}
			return card.cardName;
		},
		[language]
	);

	const getCardImage = useCallback(
		(card) => {
			if (!card) return "";
			if (card.isPartial) return `${backendUrl}/api/guess-game/image/${sessionId}`;
			if (language === "en" && card.translations?.en?.gameAbsolutePath) {
				return card.translations.en.gameAbsolutePath;
			}
			return card.gameAbsolutePath;
		},
		[language, backendUrl, sessionId]
	);

	const getHintDescription = useCallback((card) => {
		if (!card || card.isPartial) return "";
		const rawDesc = language === "en" ? card.translations?.en?.descriptionRaw : card.descriptionRaw;
		const desc = language === "en" ? card.translations?.en?.description : card.description;
		let text = rawDesc || desc || "";
		if (!text) return tUI("cardGuess.hints.noEffect", "Không có hiệu ứng");
		text = text.replace(/<[^>]*>/g, "");
		const words = text.trim().split(/\s+/);
		if (words.length <= 5) return text;
		return words.slice(0, 5).join(" ") + "...";
	}, [language, tUI]);

	const guessedCodes = useMemo(() => guesses.map((g) => g.cardCode), [guesses]);

	if (isLoading) {
		return (
			<div className="bg-page-bg min-h-screen flex items-center justify-center">
				<Loader2 className="animate-spin text-primary-500" size={64} />
			</div>
		);
	}

	const remainingGuesses = maxGuesses - guesses.length;

	return (
		<div className="min-h-screen bg-page-bg text-text-primary selection:bg-primary-500 overflow-x-hidden font-primary relative">
			<PageTitle
				title={tUI("cardGuess.pageTitle")}
				description={tUI("cardGuess.pageDesc")}
			/>

			<div className="absolute inset-0 z-0 pointer-events-none">
				<div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03]" />
				<div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-primary-500/5 blur-[150px] rounded-full" />
				<div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-500/5 blur-[120px] rounded-full" />
			</div>

			<div className="max-w-4xl mx-auto py-6 px-4 lg:px-8 relative z-10">
				<header className="mb-8 text-center">
					<h1 className="text-4xl md:text-6xl font-black mb-3 leading-tight tracking-tighter uppercase">
						<span className="text-text-primary">{tUI("cardGuess.titleMain")} </span>
						<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">
							{tUI("cardGuess.titleSub")}
						</span>
					</h1>
					<p className="text-text-secondary text-base md:text-lg max-w-xl mx-auto font-secondary">
						{tUI("cardGuess.pageDesc")}
					</p>
				</header>

				<div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
					<button
						onClick={() => handleModeChange("daily")}
						className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-300 backdrop-blur-xl ${
						mode === "daily"
							? "bg-primary-500/20 text-primary-400 border-2 border-primary-500/40 shadow-lg shadow-primary-500/10"
							: "bg-surface-bg text-text-secondary border-2 border-border hover:border-primary-500/30"
					}`}
					>
						<Calendar className="w-4 h-4" />
						{tUI("cardGuess.mode.daily", "Hàng ngày")}
					</button>
					<button
						onClick={() => handleModeChange("unlimited")}
						className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-300 backdrop-blur-xl ${
						mode === "unlimited"
							? "bg-primary-500/20 text-primary-400 border-2 border-primary-500/40 shadow-lg shadow-primary-500/10"
							: "bg-surface-bg text-text-secondary border-2 border-border hover:border-primary-500/30"
					}`}
					>
						<Infinity className="w-4 h-4" />
						{tUI("cardGuess.mode.unlimited", "Tự do")}
					</button>
					<button
						onClick={() => handleModeChange("hard")}
						className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-300 backdrop-blur-xl ${
						mode === "hard"
							? "bg-red-500/20 text-red-400 border-2 border-red-500/40 shadow-lg shadow-red-500/10"
							: "bg-surface-bg text-text-secondary border-2 border-border hover:border-red-500/30"
					}`}
					>
						<Swords className="w-4 h-4" />
						{tUI("cardGuess.mode.hard", "Khó")}
					</button>

					<button
						onClick={() => setShowStats((s) => !s)}
						className="ml-2 p-2.5 rounded-xl bg-surface-bg backdrop-blur-xl text-text-secondary border-2 border-border hover:border-primary-500/30 transition-all"
					>
						<BarChart3 className="w-5 h-5" />
					</button>
				</div>

				{showStats && (
					<div className="mb-8 flex flex-col gap-6">
						<div className="p-6 rounded-3xl bg-surface-bg backdrop-blur-xl border border-border shadow-xl">
							<EventLeaderboard />
						</div>
						<div className="p-6 rounded-3xl bg-surface-bg backdrop-blur-xl border border-border shadow-xl">
							<GameStats stats={stats} globalStats={globalStats} />
						</div>
					</div>
				)}

				{targetCard && (
					<div className="flex flex-col items-center gap-6">
						<CardCropViewer
							key={gameKey}
							imageUrl={gameStatus === "playing" ? `${backendUrl}/api/guess-game/image/${sessionId}` : toFullArtUrl(getCardImage(targetCard))}
							hintLevel={hintLevel}
							cropSeed={cropSeed}
							revealed={gameStatus !== "playing"}
							mode={mode}
						/>

						{gameStatus === "playing" && guesses.length >= 2 && mode !== "hard" && !targetCard.isPartial && (
							<div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 backdrop-blur-xl animate-in fade-in zoom-in duration-500 max-w-xl mx-auto w-full justify-center">
								<Info className="w-5 h-5 shrink-0" />
								<span className="text-sm font-semibold text-center leading-relaxed">
									{tUI("cardGuess.hints.descHint", "Gợi ý: ")} {getHintDescription(targetCard)}
								</span>
							</div>
						)}

						{gameStatus === "won" && (
							<div className="text-center animate-in fade-in slide-in-from-bottom-3 duration-500">
								<div className="text-2xl font-black text-green-400 uppercase tracking-wider mb-1">
									🎉 {tUI("cardGuess.correct")}
								</div>
								<div className="text-lg font-bold text-text-primary">
									{getCardName(targetCard)}
								</div>
								<div className="text-sm text-text-secondary mt-1">
									{guesses.length}/{maxGuesses} {tUI("cardGuess.guessesUsed")}
								</div>
							</div>
						)}

						{gameStatus === "lost" && (
							<div className="text-center animate-in fade-in slide-in-from-bottom-3 duration-500">
								<div className="text-2xl font-black text-red-400 uppercase tracking-wider mb-1">
									💀 {tUI("cardGuess.gameOver")}
								</div>
								<div className="text-sm text-text-secondary">
									{tUI("cardGuess.theAnswerWas")}:
								</div>
								<div className="text-lg font-black text-primary-400 mt-1">
									{getCardName(targetCard)}
								</div>
							</div>
						)}

						{gameStatus === "playing" && (
							<div className="text-sm font-bold text-text-secondary uppercase tracking-wider">
								{tUI("cardGuess.guessesLeft").replace("{count}", remainingGuesses)}
							</div>
						)}

						{gameStatus === "playing" && (
							<CardSearchInput
								cards={allCards}
								onGuess={handleGuess}
								disabled={gameStatus !== "playing"}
								guessedCodes={guessedCodes}
							/>
						)}

						<div className="flex items-center gap-3">
							{gameStatus !== "playing" && (
								<>
									{(mode === "unlimited" || mode === "hard") && (
										<button
											onClick={pickCard}
											className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-black uppercase tracking-wider shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 hover:scale-105 transition-all text-sm"
										>
											<Shuffle className="w-4 h-4" />
											{tUI("cardGuess.nextButton")}
										</button>
									)}
									<button
										onClick={() => setShowStats((s) => !s)}
										className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-surface-bg backdrop-blur-xl text-text-secondary border border-border hover:border-primary-500/40 transition-all text-sm font-bold"
									>
										<BarChart3 className="w-4 h-4" />
										{tUI("cardGuess.stats.title")}
									</button>
								</>
							)}
						</div>

						{guesses.length > 0 && (
							<div className="mt-4 w-full">
								<GuessHistory guesses={guesses} targetCard={targetCard} />
							</div>
						)}
					</div>
				)}
			</div>
			<style>{`
				@keyframes scan { 0% { top: 0%; } 100% { top: 100%; } }
				.animate-scan { animation: scan 2s linear infinite; }
			`}</style>
		</div>
	);
};

export default CardGuessPage;
