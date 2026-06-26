// src/features/tools/cardGuess/pages/cardGuessPage.jsx
import React, { useState, useEffect, useCallback, useMemo, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, RotateCcw, BarChart3, Shuffle, Calendar, Infinity, SkipForward, Info, Trophy, Heart, Clock } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import PageTitle from "@/components/common/pageTitle";
import { AuthContext } from "@/context/AuthContext.jsx";
import CardCropViewer from "@/features/tools/cardGuess/components/CardCropViewer";
import CardSearchInput from "@/features/tools/cardGuess/components/CardSearchInput";
import GuessHistory from "@/features/tools/cardGuess/components/GuessHistory";
import EventLeaderboard from "@/features/tools/cardGuess/components/EventLeaderboard";
import GameStats, { getStats, recordWin, recordLoss } from "@/features/tools/cardGuess/components/GameStats";
import Modal from "@/components/common/modal";

const LOCAL_STORAGE_KEY = "card_guess_active_session";
const DEVICE_ID_KEY = "card_guess_device_id";
const PLAYER_NAME_KEY = "card_guess_player_name";

const getDeviceId = () => {
	let id = localStorage.getItem(DEVICE_ID_KEY);
	if (!id) {
		id = Math.random().toString(36).substring(2, 15);
		localStorage.setItem(DEVICE_ID_KEY, id);
	}
	return id;
};

const getStoredPlayerName = () => localStorage.getItem(PLAYER_NAME_KEY) || "";

const toFullArtUrl = (url) => url ? url.replace(/(\.[a-zA-Z]+)$/, "-full$1") : "";

const EventCountdown = ({ startTime, endTime, gameStatus }) => {
	const { tUI } = useTranslation();
	const [now, setNow] = useState(new Date().getTime());

	useEffect(() => {
		const interval = setInterval(() => setNow(new Date().getTime()), 1000);
		return () => clearInterval(interval);
	}, []);

	if (!startTime || !endTime) return null;

	const startMs = new Date(startTime).getTime();
	const endMs = new Date(endTime).getTime();

	if (now < startMs) {
		const diff = startMs - now;
		const d = Math.floor(diff / 86400000);
		const h = Math.floor((diff / 3600000) % 24);
		const m = Math.floor((diff / 60000) % 60);
		const s = Math.floor((diff / 1000) % 60);
		return (
			<div className="text-center py-20 px-4">
				<div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-500/10 text-blue-500 mb-6">
					<Clock className="w-10 h-10" />
				</div>
				<h2 className="text-3xl font-black mb-3">{tUI("cardGuess.event.notStarted", "SỰ KIỆN CHƯA BẮT ĐẦU")}</h2>
				<div className="text-4xl font-black text-blue-400 font-mono">
					{d}d {h}h {m}m {s}s
				</div>
			</div>
		);
	} else if (now > endMs) {
		return (
			<div className="text-center py-20 px-4">
				<div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 text-red-500 mb-6">
					<Clock className="w-10 h-10" />
				</div>
				<h2 className="text-3xl font-black mb-3">{tUI("cardGuess.event.ended", "SỰ KIỆN ĐÃ KẾT THÚC")}</h2>
				<p className="text-text-secondary max-w-md mx-auto">
					{tUI("cardGuess.event.endedDesc", "Cảm ơn bạn đã tham gia. Hẹn gặp lại trong các sự kiện tiếp theo!")}
				</p>
			</div>
		);
	} else if (gameStatus !== "locked") {
		const diff = endMs - now;
		const d = Math.floor(diff / 86400000);
		const h = Math.floor((diff / 3600000) % 24);
		const m = Math.floor((diff / 60000) % 60);
		const s = Math.floor((diff / 1000) % 60);
		return (
			<div className="text-center mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500">
				<div className="font-bold mb-1 uppercase tracking-wider text-sm">{tUI("cardGuess.event.endsIn", "Sự kiện kết thúc sau:")}</div>
				<div className="text-2xl font-black font-mono">
					{d}d {h}h {m}m {s}s
				</div>
			</div>
		);
	}
	return null;
};

const CardGuessPage = () => {
	const { tUI, language } = useTranslation();
	const backendUrl = import.meta.env.VITE_API_URL;
	const { token, user } = useContext(AuthContext);
	const { gameMode } = useParams();
	const navigate = useNavigate();

	// Auto-merge account when logged in
	useEffect(() => {
		const deviceId = getDeviceId();
		if (token && deviceId) {
			const hasMergedKey = `card_guess_merged_${deviceId}`;
			if (!localStorage.getItem(hasMergedKey)) {
				fetch(`${backendUrl}/api/guess-game/merge-account`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`
					},
					body: JSON.stringify({ deviceId })
				})
				.then(res => res.json())
				.then(data => {
					if (data.success || data.message === "No merge needed") {
						localStorage.setItem(hasMergedKey, "true");
					}
				})
				.catch(err => console.error("Merge account failed:", err));
			}
		}
	}, [token, backendUrl]);

	// Data
	const [allCards, setAllCards] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	// Tự động fallback URL
	const validModes = ["daily", "unlimited", "event"];
	const initialMode = validModes.includes(gameMode) ? gameMode : "daily";

	// Game state
	const [mode, setMode] = useState(initialMode); // "daily" | "unlimited"
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
	
	// Unlimited Run state
	const [runState, setRunState] = useState(null);
	const [showNameModal, setShowNameModal] = useState(false);
	const [showGiveUpModal, setShowGiveUpModal] = useState(false);
	const [showRulesModal, setShowRulesModal] = useState(false);
	const [tempPlayerName, setTempPlayerName] = useState(getStoredPlayerName());
	const [dailySolvers, setDailySolvers] = useState(0);
	const [eventStatus, setEventStatus] = useState(null);

	useEffect(() => {
		if (mode === "event") {
			fetch(`${backendUrl}/api/guess-game/event-status`)
				.then(res => res.json())
				.then(data => setEventStatus(data))
				.catch(e => console.error("Error fetching event status:", e));
		}
	}, [mode, backendUrl]);

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
			
			if (data.error === "Event closed") {
				setGameStatus("locked");
				setIsRestored(true);
				setIsLoading(false);
				return;
			}
			
			if ((selectedMode === "unlimited" || selectedMode === "event") && data.requireNewRun) {
				// Cần tạo Run mới, hiện popup
				setShowNameModal(true);
				setGameStatus("waiting");
				setTargetCard(null);
			} else {
				setSessionId(data.sessionId);
				setMaxGuesses(data.maxGuesses || 5);
				setCropSeed(data.cropSeed);
				setGuesses(data.guesses || []);
				setGameStatus(data.isCompleted ? (data.won ? "won" : "lost") : "playing");
				setHintLevel(data.isCompleted ? 5 : (data.guesses?.length || 0));
				
				if (data.run) setRunState(data.run);
				if (data.dailySolversCount !== undefined) setDailySolvers(data.dailySolversCount);
				
				if (data.isCompleted && data.targetCard) {
					setTargetCard(data.targetCard);
					fetchGlobalStats(data.targetCard.cardCode);
				} else if (data.targetAttributes) {
					setTargetCard({
						cardCode: "event_hidden",
						isPartial: true,
						...data.targetAttributes
					});
				}
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
			let finalMode = mode;
			try {
				if (!gameMode) {
					// Nếu không có mode ở URL, lấy từ local storage rồi redirect
					const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
					if (saved) {
						const data = JSON.parse(saved);
						let savedMode = data.mode === "event" || data.mode === "hard" ? "daily" : data.mode;
						if (validModes.includes(savedMode)) {
							finalMode = savedMode;
						}
					}
					navigate(`/tools/card-guess/${finalMode}`, { replace: true });
				} else if (gameMode !== mode) {
					// Đồng bộ state nếu URL thay đổi
					setMode(gameMode);
					finalMode = gameMode;
				}
			} catch (e) {
				console.error("Lỗi parse session mode:", e);
			}
			loadGameState(finalMode);
		}
	}, [allCards, isRestored, mode, gameMode, navigate, loadGameState]);

	useEffect(() => {
		if (isRestored && gameMode && gameMode !== mode) {
			setTargetCard(null);
			setGuesses([]);
			setGameStatus("playing");
			setRunState(null);
			setMode(gameMode);
			loadGameState(gameMode);
		}
	}, [gameMode]);

	useEffect(() => {
		if (isRestored) {
			localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ mode }));
		}
	}, [mode, isRestored]);

	const startNewContinuousRun = async (playerName) => {
		if (playerName) localStorage.setItem(PLAYER_NAME_KEY, playerName);
		setIsLoading(true);
		try {
			const headers = { "Content-Type": "application/json" };
			if (token) headers.Authorization = `Bearer ${token}`;

			const endpoint = mode === "event" ? "/api/guess-game/event/new-run" : "/api/guess-game/unlimited/new-run";
			const res = await fetch(`${backendUrl}${endpoint}`, {
				method: "POST",
				headers,
				body: JSON.stringify({ deviceId: getDeviceId(), playerName: playerName || "Guest" })
			});
			const data = await res.json();
			if (data.error) {
				alert(data.error);
				return;
			}
			
			setSessionId(data.sessionId);
			setMaxGuesses(data.maxGuesses || 5);
			setCropSeed(data.cropSeed);
			setGuesses([]);
			setGameStatus("playing");
			setHintLevel(0);
			setRunState(data.run);
			setTargetCard({ cardCode: "event_hidden", isPartial: true, ...data.targetAttributes });
			setShowNameModal(false);
			setShowStats(false);
		} catch (e) {
			console.error("Lỗi tạo Run:", e);
		} finally {
			setIsLoading(false);
		}
	};

	const handleCloseNameModal = () => {
		setShowNameModal(false);
		if (!runState && !targetCard) {
			handleModeChange("daily");
		}
	};

	const pickNextCardContinuous = async () => {
		setIsLoading(true);
		try {
			const headers = { "Content-Type": "application/json" };
			if (token) headers.Authorization = `Bearer ${token}`;

			const endpoint = mode === "event" ? "/api/guess-game/event/next" : "/api/guess-game/unlimited/next";
			const res = await fetch(`${backendUrl}${endpoint}`, {
				method: "POST",
				headers,
				body: JSON.stringify({ deviceId: getDeviceId() })
			});
			const data = await res.json();
			if (data.error) throw new Error(data.error);

			setSessionId(data.sessionId);
			setMaxGuesses(data.maxGuesses || 5);
			setCropSeed(data.cropSeed);
			setGuesses([]);
			setGameStatus("playing");
			setHintLevel(0);
			setRunState(data.run);
			setTargetCard({ cardCode: "event_hidden", isPartial: true, ...data.targetAttributes });
			setGameKey((k) => k + 1);
		} catch (e) {
			console.error("Lỗi lấy card tiếp:", e);
			alert(e.message);
		} finally {
			setIsLoading(false);
		}
	};

	const confirmGiveUp = useCallback(
		async () => {
			if (gameStatus !== "playing" || !sessionId) return;
			setShowGiveUpModal(false);

			try {
				const headers = { "Content-Type": "application/json" };
				if (token) headers.Authorization = `Bearer ${token}`;

				const res = await fetch(`${backendUrl}/api/guess-game/give-up`, {
					method: "POST",
					headers,
					body: JSON.stringify({ sessionId })
				});
				const data = await res.json();
				if (data.error) throw new Error(data.error);

				setGameStatus("lost");
				setHintLevel(5);
				setTargetCard(data.targetCard);
				fetchGlobalStats(data.targetCard.cardCode);
				
				if (mode === "daily") {
					setTimeout(() => setShowStats(true), 1500);
				} else if (mode === "unlimited" || mode === "event") {
					setRunState(data.run);
				}
				setStats(recordLoss());
			} catch (e) {
				console.error("Give up error:", e);
			}
		},
		[gameStatus, sessionId, backendUrl, token, fetchGlobalStats, mode, tUI]
	);

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

				const newGuesses = [...guesses, data.guessedCard];
				setGuesses(newGuesses);

				if (data.isCompleted) {
					setGameStatus(data.won ? "won" : "lost");
					setHintLevel(5);
					setTargetCard(data.targetCard);
					fetchGlobalStats(data.targetCard.cardCode);
					
					if (mode === "daily") {
						setTimeout(() => setShowStats(true), 1500);
					} else if (mode === "unlimited" || mode === "event") {
						setRunState(data.run);
					}
					setStats(data.won ? recordWin(newGuesses.length) : recordLoss());
				} else {
					setHintLevel(data.hintLevel);
				}
			} catch (e) {
				console.error("Guess error:", e);
			}
		},
		[gameStatus, sessionId, guesses, backendUrl, token, fetchGlobalStats, mode]
	);

	const handleModeChange = useCallback(
		(newMode) => {
			if (newMode !== mode) {
				navigate(`/tools/card-guess/${newMode}`);
			}
		},
		[mode, navigate]
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
		if (!text) return tUI("cardGuess.hints.noEffect");
		text = text.replace(/<[^>]*>/g, "");
		const words = text.trim().split(/\s+/);
		if (words.length <= 3) return text;
		return words.slice(0, 3).join(" ") + ".....";
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

			{/* Modal Nhập Tên cho Unlimited Run */}
			<Modal isOpen={showNameModal} onClose={handleCloseNameModal} title={mode === "event" ? tUI("cardGuess.run.riotIdPromptEvent", "Nhập chính xác Riot ID") : tUI("cardGuess.run.riotIdPrompt", "Nhập Tên / Riot ID")} size="md">
				<div className="p-4 space-y-6">
					<div>
						<input 
							type="text" 
							placeholder={mode === "event" ? tUI("cardGuess.run.enterRiotIdEvent", "Ví dụ: LuKhachQuaDuong#VN1") : tUI("cardGuess.run.enterRiotId", "Ví dụ: LuKhachQuaDuong#666")}
							className="w-full px-4 py-3 rounded-xl bg-surface-bg border border-border focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
							value={tempPlayerName}
							onChange={(e) => setTempPlayerName(e.target.value)}
							autoFocus
							onKeyDown={(e) => {
								if (e.key === "Enter" && tempPlayerName.trim()) startNewContinuousRun(tempPlayerName);
							}}
						/>
						{mode === "event" && (
							<p className="text-sm text-amber-500 font-medium mt-3">
								{tUI("cardGuess.run.eventRiotIdWarning", "Lưu ý: Bắt buộc nhập chính xác Riot ID (kèm #tag) để nhận thưởng. Tên sai sẽ không được chấp nhận.")}
							</p>
						)}
					</div>
					<div className="flex gap-3 justify-end">
						{mode !== "event" && (
							<button 
								onClick={() => startNewContinuousRun("Guest")}
								className="px-5 py-2.5 rounded-xl font-bold text-sm bg-surface-bg border-2 border-border hover:bg-surface-hover transition-colors"
							>
								{tUI("cardGuess.run.playAsGuest", "Chơi Khách")}
							</button>
						)}
						<button 
							onClick={() => startNewContinuousRun(tempPlayerName)}
							disabled={!tempPlayerName.trim() || (mode === "event" && (tempPlayerName.trim().toLowerCase() === "guest" || tempPlayerName.trim().toLowerCase() === "khách"))}
							className="px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg hover:shadow-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{tUI("cardGuess.run.startRun", "Bắt đầu chơi")}
						</button>
					</div>
				</div>
			</Modal>

			{/* Modal Xác nhận Bỏ cuộc */}
			<Modal isOpen={showGiveUpModal} onClose={() => setShowGiveUpModal(false)} title={tUI("cardGuess.giveUp", "Đầu hàng 🏳️")} size="sm">
				<div className="p-6 space-y-6 text-center">
					<p className="text-text-secondary font-medium">
						{tUI("cardGuess.giveUpConfirm", "Bạn có chắc chắn muốn bỏ cuộc và lật mở lá bài này?")}
					</p>
					{mode === "unlimited" && (
						<p className="text-red-400 font-bold text-sm mt-2">
							{tUI("cardGuess.run.endRunWarning", "Cảnh báo: Hành động này sẽ kết thúc Run hiện tại của bạn!")}
						</p>
					)}
					<div className="flex gap-3 justify-center mt-6">
						<button 
							onClick={() => setShowGiveUpModal(false)}
							className="px-6 py-2.5 rounded-xl font-bold text-sm bg-surface-bg border-2 border-border hover:bg-surface-hover transition-colors"
						>
							{tUI("common.cancel", "Hủy")}
						</button>
						<button 
							onClick={confirmGiveUp}
							className="px-6 py-2.5 rounded-xl font-bold text-sm bg-red-500/20 text-red-500 border-2 border-red-500/30 hover:bg-red-500 hover:text-white transition-all shadow-lg hover:shadow-red-500/20"
						>
							{tUI("cardGuess.giveUp", "Đầu hàng 🏳️")}
						</button>
					</div>
				</div>
			</Modal>

			{/* Modal Hướng Dẫn Chơi */}
			<Modal isOpen={showRulesModal} onClose={() => setShowRulesModal(false)} title={tUI("cardGuess.rules.title", "Hướng dẫn chơi")} size="md">
				<div className="p-6 space-y-4 text-text-secondary leading-relaxed">
					<p>{tUI("cardGuess.rules.p1")}</p>
					<p>{tUI("cardGuess.rules.p2")}</p>
					<p>{tUI("cardGuess.rules.p3")}</p>
					<p>{tUI("cardGuess.rules.p4")}</p>
					<div className="flex justify-center mt-6 pt-4 border-t border-border">
						<button 
							onClick={() => setShowRulesModal(false)}
							className="px-8 py-2.5 rounded-xl font-bold text-sm bg-primary-500/10 text-primary-500 hover:bg-primary-500 hover:text-white transition-all"
						>
							{tUI("cardGuess.rules.close", "Đã hiểu")}
						</button>
					</div>
				</div>
			</Modal>

			<div className="absolute inset-0 z-0 pointer-events-none">
				<div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03]" />
				<div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-primary-500/5 blur-[150px] rounded-full" />
				<div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-500/5 blur-[120px] rounded-full" />
			</div>

			<div className="max-w-4xl mx-auto pt-6 pb-32 px-4 lg:px-8 relative z-10">
				<header className="mb-8 text-center">
					<h1 className="text-4xl md:text-6xl font-black mb-3 leading-tight tracking-tighter uppercase">
						<span className="text-text-primary">{tUI("cardGuess.titleMain")} </span>
						<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">
							{tUI("cardGuess.titleSub")}
						</span>
					</h1>
					<p className="text-lg text-text-secondary max-w-2xl mx-auto flex items-center justify-center gap-2">
						{tUI("cardGuess.pageDesc")}
						<button
							onClick={() => setShowRulesModal(true)}
							className="p-1.5 rounded-full hover:bg-surface-hover text-primary-400 transition-colors"
							title={tUI("cardGuess.rules.title", "Hướng dẫn")}
						>
							<Info size={18} />
						</button>
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
						{tUI("cardGuess.mode.unlimited", "Vô Hạn")}
					</button>
					<button
						onClick={() => handleModeChange("event")}
						className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-300 backdrop-blur-xl ${
						mode === "event"
							? "bg-primary-500/20 text-primary-400 border-2 border-primary-500/40 shadow-lg shadow-primary-500/10"
							: "bg-surface-bg text-text-secondary border-2 border-border hover:border-primary-500/30"
					}`}
					>
						<Trophy className="w-4 h-4" />
						{tUI("cardGuess.mode.event", "Sự kiện")}
					</button>
					
					<button
						onClick={() => setShowStats((s) => !s)}
						className="ml-2 p-2.5 rounded-xl bg-surface-bg backdrop-blur-xl text-text-secondary border-2 border-border hover:border-primary-500/30 transition-all"
					>
						<BarChart3 className="w-5 h-5" />
					</button>
				</div>
				
				{/* Hiển thị số người đã giải Daily */}
				{mode === "daily" && dailySolvers > 0 && !showStats && (
					<div className="text-center mb-6 text-sm font-semibold text-text-secondary">
						<Trophy className="inline-block w-4 h-4 mr-1 text-yellow-500 mb-0.5" />
						{tUI("cardGuess.run.dailySolvers", "Số người đã giải hôm nay: {count}").replace("{count}", dailySolvers)}
					</div>
				)}

				{/* HUD hiển thị Mạng và Điểm cho Unlimited Run / Event */}
				{(mode === "unlimited" || mode === "event") && runState && !showNameModal && (
					<div className="flex justify-between items-center mb-6 px-6 py-3 bg-surface-bg border border-border rounded-2xl shadow-sm">
						<div className="flex items-center gap-2">
							<span className="text-sm font-bold text-text-secondary uppercase">{tUI("cardGuess.run.lives", "Mạng")}:</span>
							<div className="flex gap-1">
								{Array.from({ length: 3 }).map((_, i) => (
									<Heart key={i} className={`w-5 h-5 ${i < runState.lives ? "fill-red-500 text-red-500" : "text-gray-600/30"}`} />
								))}
							</div>
						</div>
						<div className="flex items-center gap-2">
							<span className="text-sm font-bold text-text-secondary uppercase">{tUI("cardGuess.run.currentScore", "Điểm hiện tại")}:</span>
							<span className="text-xl font-black text-primary-500">{runState.score}</span>
						</div>
					</div>
				)}

				{mode === "event" && eventStatus && (
					<EventCountdown startTime={eventStatus.startTime} endTime={eventStatus.endTime} gameStatus={gameStatus} />
				)}

				{mode === "event" && gameStatus === "locked" && !eventStatus && (
					<div className="text-center py-20 px-4">
						<Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto" />
					</div>
				)}

				{mode !== "event" && gameStatus === "locked" && (
					<div className="text-center py-20 px-4">
						<div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 text-red-500 mb-6">
							<Clock className="w-10 h-10" />
						</div>
						<h2 className="text-3xl font-black mb-3">SỰ KIỆN CHƯA MỞ HOẶC ĐÃ KẾT THÚC</h2>
						<p className="text-text-secondary max-w-md mx-auto">
							Chế độ này chỉ mở trong một khoảng thời gian nhất định. Vui lòng quay lại sau!
						</p>
					</div>
				)}

				{showStats && (
					<div className="mb-8 flex flex-col gap-6">
						<div className="p-6 rounded-3xl bg-surface-bg backdrop-blur-xl border border-border shadow-xl">
							<EventLeaderboard />
						</div>
						{mode === "daily" && (
							<div className="p-6 rounded-3xl bg-surface-bg backdrop-blur-xl border border-border shadow-xl">
								<GameStats stats={stats} globalStats={globalStats} lastGuessCount={gameStatus === "won" ? guesses.length : null} />
							</div>
						)}
					</div>
				)}

				{targetCard && (
					<div className="flex flex-col items-center gap-6">
						<CardCropViewer
							key={gameKey}
							imageUrl={gameStatus === "playing" ? `${backendUrl}/api/guess-game/image/${sessionId}?v=${guesses.length}&t=${Date.now()}` : toFullArtUrl(getCardImage(targetCard))}
							fallbackUrl={getCardImage(targetCard)}
							hintLevel={hintLevel}
							cropSeed={cropSeed}
							revealed={gameStatus !== "playing"}
						/>

						{gameStatus === "playing" && guesses.length >= 3 && !targetCard.isPartial && (
							<div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 backdrop-blur-xl animate-in fade-in zoom-in duration-500 max-w-xl mx-auto w-full justify-center">
								<Info className="w-5 h-5 shrink-0" />
								<span className="text-sm font-semibold text-center leading-relaxed">
									{tUI("cardGuess.hints.descHint")} {getHintDescription(targetCard)}
								</span>
							</div>
						)}

						{/* Màn hình kết quả nếu Run chưa kết thúc, hoặc Daily đã xong */}
						{gameStatus === "won" && (!runState || runState.status === "playing") && (
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

						{gameStatus === "lost" && (!runState || runState.status === "playing") && (
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
						
						{/* Màn hình Run Over (Chỉ dành cho Unlimited khi hết mạng) */}
						{runState && runState.status === "completed" && (
							<div className="text-center animate-in fade-in zoom-in duration-500 bg-red-500/10 border border-red-500/30 rounded-3xl p-8 max-w-md mx-auto mt-4">
								<div className="text-4xl font-black text-red-500 uppercase tracking-wider mb-2">
									{tUI("cardGuess.run.runOver", "Kết Thúc Run!")}
								</div>
								<div className="text-sm text-text-secondary uppercase tracking-widest mb-1">
									{tUI("cardGuess.run.finalScore", "Tổng Điểm")}
								</div>
								<div className="text-6xl font-black text-primary-500 mb-6 drop-shadow-[0_0_15px_rgba(var(--primary-500),0.5)]">
									{runState.score}
								</div>
								<div className="text-sm text-text-secondary mb-4">
									{tUI("cardGuess.theAnswerWas")}: <strong>{getCardName(targetCard)}</strong>
								</div>
								<button
									onClick={() => setShowNameModal(true)}
									className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-black uppercase tracking-wider shadow-lg hover:scale-105 transition-all text-sm"
								>
									<RotateCcw className="w-5 h-5" />
									{tUI("cardGuess.run.newRun", "Chơi Lại (New Run)")}
								</button>
							</div>
						)}

						{gameStatus === "playing" && (
							<div className="text-sm font-bold text-text-secondary uppercase tracking-wider">
								{tUI("cardGuess.guessesLeft").replace("{count}", remainingGuesses)}
							</div>
						)}

						{gameStatus === "playing" && (
							<div className="flex flex-col items-center gap-4 w-full">
								<CardSearchInput
									cards={allCards}
									onGuess={handleGuess}
									disabled={gameStatus !== "playing"}
									guessedCodes={guessedCodes}
								/>
								<button 
									onClick={() => setShowGiveUpModal(true)}
									className="text-sm text-red-400 hover:text-red-300 font-bold transition-colors flex items-center gap-1 opacity-80 hover:opacity-100"
								>
									{tUI("cardGuess.giveUp", "Đầu hàng 🏳️")}
								</button>
							</div>
						)}

						<div className="flex items-center gap-3">
							{gameStatus !== "playing" && (!runState || runState.status === "playing") && (
								<>
									{(mode === "unlimited" || mode === "event") && (
										<button
											onClick={pickNextCardContinuous}
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
