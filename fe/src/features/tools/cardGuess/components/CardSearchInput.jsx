// src/features/tools/cardGuess/components/CardSearchInput.jsx
import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Search, X, ChevronDown, Filter } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import SafeImage from "@/components/common/SafeImage";

const removeAccents = (str) => {
	if (!str) return "";
	return str
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/đ/g, "d")
		.replace(/Đ/g, "D")
		.toLowerCase();
};

const FilterDropdown = ({ label, value, options, onChange, allLabel }) => {
	const [open, setOpen] = useState(false);
	const ref = useRef();

	useEffect(() => {
		const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
		document.addEventListener("mousedown", close);
		return () => document.removeEventListener("mousedown", close);
	}, []);

	return (
		<div className="relative" ref={ref}>
			<button
				onClick={() => setOpen(!open)}
				className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border backdrop-blur-xl ${
					value && value !== "__all__"
						? "bg-primary-500/15 text-primary-400 border-primary-500/30"
						: "bg-surface-bg text-text-secondary border-border hover:border-primary-500/30"
				}`}
			>
				<span className="truncate max-w-[80px]">
					{value && value !== "__all__" ? value : label}
				</span>
				<ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
			</button>

			{open && (
				<div className="absolute top-full left-0 mt-1.5 bg-surface-bg backdrop-blur-xl border border-border rounded-xl shadow-2xl overflow-hidden z-50 min-w-[140px] max-h-[240px] overflow-y-auto">
					<button
						onClick={() => { onChange("__all__"); setOpen(false); }}
						className={`w-full text-left px-3 py-2 text-xs font-bold transition-colors ${
							!value || value === "__all__" ? "bg-primary-500/15 text-primary-400" : "hover:bg-surface-hover text-text-primary"
						}`}
					>
						{allLabel}
					</button>
					{options.map((opt) => (
						<button
							key={opt}
							onClick={() => { onChange(opt); setOpen(false); }}
							className={`w-full text-left px-3 py-2 text-xs transition-colors border-t border-border/30 ${
								value === opt ? "bg-primary-500/15 text-primary-400 font-bold" : "hover:bg-surface-hover text-text-primary"
							}`}
						>
							{opt}
						</button>
					))}
				</div>
			)}
		</div>
	);
};

const CardSearchInput = ({ cards = [], onGuess, disabled = false, guessedCodes = [] }) => {
	const { tUI, language } = useTranslation();
	const [query, setQuery] = useState("");
	const [suggestions, setSuggestions] = useState([]);
	const [showDropdown, setShowDropdown] = useState(false);
	const [selectedIndex, setSelectedIndex] = useState(-1);
	const [showFilters, setShowFilters] = useState(false);
	const inputRef = useRef();
	const dropdownRef = useRef();

	// Filter states
	const [filterRegion, setFilterRegion] = useState("__all__");
	const [filterRarity, setFilterRarity] = useState("__all__");
	const [filterCost, setFilterCost] = useState("__all__");

	// Extract filter options from cards
	const filterOptions = useMemo(() => {
		const regions = new Set();
		const rarities = new Set();
		const costs = new Set();

		cards.forEach((c) => {
			(c.regions || []).forEach((r) => regions.add(r));
			if (c.rarity) rarities.add(c.rarity);
			if (c.cost !== undefined && c.cost !== null) costs.add(Number(c.cost));
		});

		return {
			regions: [...regions].sort(),
			rarities: [...rarities].sort(),
			costs: [...costs].sort((a, b) => a - b).map(String),
		};
	}, [cards]);

	const getCardName = useCallback((card) => {
		if (language === "en" && card.translations?.en?.cardName) {
			return card.translations.en.cardName;
		}
		return card.cardName;
	}, [language]);

	const getCardImage = useCallback((card) => {
		if (language === "en" && card.translations?.en?.gameAbsolutePath) {
			return card.translations.en.gameAbsolutePath;
		}
		return card.gameAbsolutePath;
	}, [language]);

	// Filtered cards based on dropdown filters
	const filteredCards = useMemo(() => {
		return cards.filter((card) => {
			if (filterRegion !== "__all__") {
				const cardRegions = card.regions || [];
				if (!cardRegions.some((r) => r === filterRegion)) return false;
			}
			if (filterRarity !== "__all__") {
				if ((card.rarity || "") !== filterRarity) return false;
			}
			if (filterCost !== "__all__") {
				if (String(card.cost ?? "") !== filterCost) return false;
			}
			return true;
		});
	}, [cards, filterRegion, filterRarity, filterCost]);

	const activeFilterCount = [filterRegion, filterRarity, filterCost].filter(f => f !== "__all__").length;

	// Debounced search on filteredCards
	useEffect(() => {
		if (disabled) {
			setSuggestions([]);
			setShowDropdown(false);
			return;
		}

		const timer = setTimeout(() => {
			let pool = filteredCards.filter((card) => !guessedCodes.includes(card.cardCode));

			if (query.trim()) {
				const searchTerms = removeAccents(query).split(/\s+/).filter(Boolean);
				pool = pool.filter((card) => {
					const nameVi = removeAccents(card.cardName || "");
					const nameEn = removeAccents(card.translations?.en?.cardName || "");
					const code = removeAccents(card.cardCode || "");
					return searchTerms.every(
						(term) => nameVi.includes(term) || nameEn.includes(term) || code.includes(term)
					);
				});
			}

			const results = pool.slice(0, 30);
			setSuggestions(results);
			setShowDropdown(results.length > 0 && (query.trim() || activeFilterCount > 0));
			setSelectedIndex(-1);
		}, 150);

		return () => clearTimeout(timer);
	}, [query, filteredCards, disabled, guessedCodes, language, activeFilterCount]);

	// Keyboard navigation
	const handleKeyDown = (e) => {
		if (!showDropdown) return;
		if (e.key === "ArrowDown") {
			e.preventDefault();
			setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setSelectedIndex((prev) => Math.max(prev - 1, 0));
		} else if (e.key === "Enter") {
			e.preventDefault();
			if (selectedIndex >= 0 && suggestions[selectedIndex]) {
				handleSelect(suggestions[selectedIndex]);
			}
		} else if (e.key === "Escape") {
			setShowDropdown(false);
		}
	};

	const handleSelect = (card) => {
		onGuess(card);
		setQuery("");
		setSuggestions([]);
		setShowDropdown(false);
		setSelectedIndex(-1);
		inputRef.current?.focus();
	};

	// Reset filters
	const resetFilters = () => {
		setFilterRegion("__all__");
		setFilterRarity("__all__");
		setFilterCost("__all__");
	};

	// Click outside to close
	useEffect(() => {
		const handleClickOutside = (e) => {
			if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
				setShowDropdown(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<div className="w-full max-w-xl mx-auto space-y-3">
			{/* Filter bar */}
			<div className="flex items-center justify-center gap-2 flex-wrap">
				<button
					onClick={() => setShowFilters((s) => !s)}
					className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border backdrop-blur-xl ${
						activeFilterCount > 0
							? "bg-primary-500/15 text-primary-400 border-primary-500/30"
							: "bg-surface-bg text-text-secondary border-border hover:border-primary-500/30"
					}`}
				>
					<Filter className="w-3.5 h-3.5" />
					{tUI("cardGuess.filter.title")}
					{activeFilterCount > 0 && (
						<span className="ml-1 px-1.5 py-0.5 rounded-md bg-primary-500/30 text-[10px]">
							{activeFilterCount}
						</span>
					)}
				</button>

				{showFilters && (
					<>
						<FilterDropdown
							label={tUI("cardGuess.hints.region")}
							value={filterRegion}
							options={filterOptions.regions}
							onChange={setFilterRegion}
							allLabel={tUI("common.all")}
						/>
						<FilterDropdown
							label={tUI("cardGuess.hints.rarity")}
							value={filterRarity}
							options={filterOptions.rarities}
							onChange={setFilterRarity}
							allLabel={tUI("common.all")}
						/>
						<FilterDropdown
							label={tUI("cardGuess.hints.cost")}
							value={filterCost}
							options={filterOptions.costs}
							onChange={setFilterCost}
							allLabel={tUI("common.all")}
						/>
						{activeFilterCount > 0 && (
							<button
								onClick={resetFilters}
								className="px-2.5 py-2 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-500/20"
							>
								<X className="w-3.5 h-3.5" />
							</button>
						)}
					</>
				)}

				{/* Matching count */}
				{activeFilterCount > 0 && (
					<span className="text-[11px] text-text-secondary font-medium">
						{filteredCards.length} {tUI("cardGuess.filter.matching")}
					</span>
				)}
			</div>

			{/* Search input */}
			<div className="relative" ref={dropdownRef}>
				<div className={`relative flex items-center rounded-2xl border-2 transition-all duration-300 backdrop-blur-xl ${
					disabled
						? "border-border/50 bg-surface-bg opacity-60"
						: showDropdown
							? "border-primary-500/60 bg-surface-bg shadow-lg shadow-primary-500/10"
							: "border-border bg-surface-bg hover:border-primary-500/30"
				}`}>
					<Search className="ml-4 w-5 h-5 text-text-secondary shrink-0" />
					<input
						ref={inputRef}
						type="text"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						onKeyDown={handleKeyDown}
						onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
						disabled={disabled}
						placeholder={tUI("cardGuess.searchPlaceholder")}
						className="flex-1 bg-transparent px-3 py-3.5 text-text-primary placeholder-text-secondary/50 outline-none text-base"
						autoComplete="off"
					/>
					{query && (
						<button
							onClick={() => { setQuery(""); setSuggestions([]); setShowDropdown(false); }}
							className="mr-3 p-1 rounded-lg hover:bg-surface-hover text-text-secondary transition-colors"
						>
							<X className="w-4 h-4" />
						</button>
					)}
				</div>

				{/* Suggestions Dropdown */}
				{showDropdown && (
					<div className="absolute top-full left-0 right-0 mt-2 bg-surface-bg backdrop-blur-xl border border-border rounded-2xl shadow-2xl overflow-hidden z-50 max-h-[360px] overflow-y-auto">
						{suggestions.map((card, idx) => (
							<button
								key={card.cardCode}
								onClick={() => handleSelect(card)}
								className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-150 ${
									idx === selectedIndex
										? "bg-primary-500/15 text-primary-400"
										: "hover:bg-surface-hover text-text-primary"
								} ${idx !== suggestions.length - 1 ? "border-b border-border/50" : ""}`}
							>
								{/* Card thumbnail */}
								<div className="w-10 h-14 rounded-lg overflow-hidden bg-gray-800/40 shrink-0 border border-white/10">
									<SafeImage
										src={getCardImage(card)}
										alt={getCardName(card)}
										className="w-full h-full object-cover"
										loading="lazy"
									/>
								</div>
								{/* Card info */}
								<div className="flex-1 min-w-0">
									<div className="font-semibold text-sm truncate">
										{getCardName(card)}
									</div>
									<div className="text-xs text-text-secondary flex items-center gap-2 mt-0.5">
										<span className="opacity-60">{card.cardCode}</span>
										<span>•</span>
										<span>{(card.regions || [])[0] || "?"}</span>
										<span>•</span>
										<span>{card.rarity || "?"}</span>
										<span>•</span>
										<span>{card.cost ?? "?"} 💎</span>
									</div>
								</div>
							</button>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default CardSearchInput;
