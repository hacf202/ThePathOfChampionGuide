// src/features/tools/cardGuess/components/GuessHistory.jsx
import React from "react";
import { Check, X, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import SafeImage from "@/components/common/SafeImage";
import { StaggerContainer, StaggerItem } from "@/components/common/animations";

const AttributeCell = ({ label, value, status }) => {
	const statusConfig = {
		correct: {
			bg: "bg-green-900/80 border-green-500/40",
			icon: <Check className="w-3.5 h-3.5 text-green-400" />,
			text: "text-green-300",
		},
		wrong: {
			bg: "bg-red-950/80 border-red-500/30",
			icon: <X className="w-3.5 h-3.5 text-red-400" />,
			text: "text-red-300",
		},
		higher: {
			bg: "bg-amber-950/80 border-amber-500/30",
			icon: <ArrowUp className="w-3.5 h-3.5 text-amber-400" />,
			text: "text-amber-300",
		},
		lower: {
			bg: "bg-amber-950/80 border-amber-500/30",
			icon: <ArrowDown className="w-3.5 h-3.5 text-amber-400" />,
			text: "text-amber-300",
		},
		partial: {
			bg: "bg-yellow-950/80 border-yellow-500/30",
			icon: <Minus className="w-3.5 h-3.5 text-yellow-400" />,
			text: "text-yellow-300",
		},
	};

	const config = statusConfig[status] || statusConfig.wrong;

	return (
		<div className={`flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl border ${config.bg} min-w-[60px]`}>
			<span className="text-[10px] uppercase tracking-wider text-text-secondary font-bold">
				{label}
			</span>
			<div className="flex items-center gap-1">
				{config.icon}
				<span className={`text-xs font-bold ${config.text} text-center`}>
					{value}
				</span>
			</div>
		</div>
	);
};

const GuessHistory = ({ guesses = [], targetCard }) => {
	const { tUI, language } = useTranslation();

	if (guesses.length === 0) return null;

	const getCardName = (card) => {
		if (language === "en" && card.translations?.en?.cardName) {
			return card.translations.en.cardName;
		}
		return card.cardName;
	};

	const getCardImage = (card) => {
		if (language === "en" && card.translations?.en?.gameAbsolutePath) {
			return card.translations.en.gameAbsolutePath;
		}
		return card.gameAbsolutePath;
	};

	const getCardType = (card) => {
		if (language === "en" && card.translations?.en?.type) {
			return card.translations.en.type;
		}
		return card.type || "?";
	};

	const getRegions = (card) => {
		if (language === "en" && card.translations?.en?.regions?.length > 0) {
			return card.translations.en.regions;
		}
		return card.regions || [];
	};

	return (
		<div className="w-full max-w-2xl mx-auto">
			<h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest mb-4 flex items-center gap-2">
				<span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
				{tUI("cardGuess.guessHistory")} ({guesses.length})
			</h3>

			<StaggerContainer className="space-y-3">
				{[...guesses].reverse().map((guess, idx) => {
					const isCorrect = guess.cardCode === targetCard?.cardCode;
					const targetRegions = getRegions(targetCard);
					const guessRegions = getRegions(guess);

					return (
						<StaggerItem
							key={`${guess.cardCode}-${idx}`}
							className={`flex items-center gap-3 p-3 rounded-2xl border backdrop-blur-xl transition-all ${
							isCorrect
								? "bg-green-900/60 border-green-500/30 shadow-lg shadow-green-500/10"
								: "bg-surface-bg border-border"
						}`}
						>
							{/* Card thumbnail */}
							<div className={`w-12 h-[68px] rounded-xl overflow-hidden shrink-0 border-2 ${
								isCorrect ? "border-green-500/50" : "border-white/10"
							}`}>
								<SafeImage
									src={getCardImage(guess)}
									alt={getCardName(guess)}
									className="w-full h-full object-cover"
									loading="lazy"
								/>
							</div>

							{/* Card name + attributes */}
							<div className="flex-1 min-w-0">
								<div className={`font-bold text-sm mb-2 flex items-center gap-2 ${
									isCorrect ? "text-green-400" : "text-text-primary"
								}`}>
									{isCorrect ? (
										<Check className="w-4 h-4 shrink-0" />
									) : (
										<X className="w-4 h-4 shrink-0 text-red-400" />
									)}
									<span className="truncate">{getCardName(guess)}</span>
								</div>

								{/* Attribute comparison row */}
								<div className="flex flex-wrap gap-2">
									<AttributeCell
										label={tUI("cardGuess.hints.region")}
										value={guessRegions[0] || "?"}
										status={guess.diffs?.region || "wrong"}
									/>
									<AttributeCell
										label={tUI("cardGuess.hints.rarity")}
										value={guess.rarity || "?"}
										status={guess.diffs?.rarity || "wrong"}
									/>
									<AttributeCell
										label={tUI("cardGuess.hints.cost")}
										value={String(guess.cost ?? "?")}
										status={guess.diffs?.cost || "wrong"}
									/>
								</div>
							</div>
						</StaggerItem>
					);
				})}
			</StaggerContainer>
		</div>
	);
};

export default GuessHistory;
