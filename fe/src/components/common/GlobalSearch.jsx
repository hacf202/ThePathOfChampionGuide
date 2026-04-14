// components/common/GlobalSearch.jsx
// Inline search bar nhúng thẳng vào Navbar — dropdown results bên dưới
// Dữ liệu từ API /api/search/index: nhẹ, chỉ gồm id + nameVi + nameEn
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
	Search, X, Swords, Sparkles, Zap, Package,
	Gem, BookOpen, BookMarked, ChevronRight
} from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";
import { removeAccents } from "../../utils/vietnameseUtils";
import axios from "axios";

// ─── Config ─────────────────────────────────────────────────────────────
const MAX_PER_CATEGORY = 4;
const API_URL = import.meta.env.VITE_API_URL;

// Search index cache toàn cục (module-level singleton)
let _searchIndex = null;
let _fetchPromise = null;

async function getSearchIndex() {
	if (_searchIndex) return _searchIndex;
	if (_fetchPromise) return _fetchPromise;

	_fetchPromise = axios
		.get(`${API_URL}/api/search/index`)
		.then(res => {
			_searchIndex = res.data;
			_fetchPromise = null;
			return _searchIndex;
		})
		.catch(err => {
			_fetchPromise = null;
			throw err;
		});

	return _fetchPromise;
}

// ─── Category config ─────────────────────────────────────────────────────
const GUIDE_CATEGORY = {
	key: "guides",
	labelKey: "globalSearch.categoryGuide",
	icon: BookMarked,
	route: (id) => `/guides/${id}`,
	color: "text-rose-400",
	bgColor: "bg-rose-400/10",
	borderColor: "border-rose-400/20",
};

const CATEGORIES = [
	{ key: "champions", labelKey: "globalSearch.categoryChampion", icon: Swords,   route: (id) => `/champion/${id}`, color: "text-yellow-400", bgColor: "bg-yellow-400/10", borderColor: "border-yellow-400/20" },
	{ key: "relics",    labelKey: "globalSearch.categoryRelic",    icon: Sparkles,  route: (id) => `/relic/${id}`,    color: "text-purple-400", bgColor: "bg-purple-400/10", borderColor: "border-purple-400/20" },
	{ key: "powers",    labelKey: "globalSearch.categoryPower",    icon: Zap,       route: (id) => `/power/${id}`,    color: "text-blue-400",   bgColor: "bg-blue-400/10",   borderColor: "border-blue-400/20" },
	{ key: "items",     labelKey: "globalSearch.categoryItem",     icon: Package,   route: (id) => `/item/${id}`,     color: "text-green-400",  bgColor: "bg-green-400/10",  borderColor: "border-green-400/20" },
	{ key: "runes",     labelKey: "globalSearch.categoryRune",     icon: Gem,       route: (id) => `/rune/${id}`,     color: "text-cyan-400",   bgColor: "bg-cyan-400/10",   borderColor: "border-cyan-400/20" },
	{ key: "cards",     labelKey: "globalSearch.categoryCard",     icon: BookOpen,  route: (id) => `/card/${id}`,     color: "text-orange-400", bgColor: "bg-orange-400/10", borderColor: "border-orange-400/20" },
];

const norm = (str) => removeAccents((str || "").toLowerCase().trim());

function searchInIndex(index, query, cat) {
	const q = norm(query);
	if (!q || !index?.[cat.key]) return [];
	return index[cat.key]
		.filter(item => norm(item.nameVi).includes(q) || norm(item.nameEn).includes(q))
		.slice(0, MAX_PER_CATEGORY)
		.map(item => ({ id: item.id, name: item.nameVi || item.nameEn, category: cat }));
}

// ─── Component ───────────────────────────────────────────────────────────
function GlobalSearch({ compact = false, showClose = false, onClose = null }) {
	const { tUI, language } = useTranslation();
	const navigate = useNavigate();

	const containerRef  = useRef(null);
	const inputRef      = useRef(null);
	const listRef       = useRef(null);
	const guideTimer    = useRef(null);

	const [query,           setQuery]           = useState("");
	const [results,         setResults]         = useState([]);
	const [isOpen,          setIsOpen]          = useState(false);
	const [selectedIndex,   setSelectedIndex]   = useState(0);
	const [isDataReady,     setIsDataReady]     = useState(!!_searchIndex);
	const [isLoadingGuides, setIsLoadingGuides] = useState(false);

	// ── Fetch search index nhẹ khi browser rảnh ──
	useEffect(() => {
		if (_searchIndex) { setIsDataReady(true); return; }

		const doFetch = () => {
			getSearchIndex()
				.then(() => setIsDataReady(true))
				.catch(() => {
					// Thử lại sau 3s nếu lỗi
					setTimeout(() => getSearchIndex().then(() => setIsDataReady(true)).catch(() => {}), 3000);
				});
		};

		if (typeof requestIdleCallback !== "undefined") {
			const id = requestIdleCallback(doFetch, { timeout: 3000 });
			return () => cancelIdleCallback(id);
		} else {
			const id = setTimeout(doFetch, 2000);
			return () => clearTimeout(id);
		}
	}, []);

	// ── Ctrl+K focus input ──
	useEffect(() => {
		const handler = (e) => {
			if ((e.ctrlKey || e.metaKey) && e.key === "k") {
				e.preventDefault();
				inputRef.current?.focus();
				inputRef.current?.select();
			}
		};
		document.addEventListener("keydown", handler);
		return () => document.removeEventListener("keydown", handler);
	}, []);

	// ── Đóng khi click ngoài ──
	useEffect(() => {
		const handler = (e) => {
			if (containerRef.current && !containerRef.current.contains(e.target)) {
				setIsOpen(false);
				if (onClose) onClose();
			}
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, []);

	// ── Logic tìm kiếm ──
	useEffect(() => {
		if (query.length < 2) {
			setResults([]);
			setIsOpen(false);
			clearTimeout(guideTimer.current);
			return;
		}

		// Client-side search từ search index (chỉ id + tên)
		const clientResults = [];
		for (const cat of CATEGORIES) {
			clientResults.push(...searchInIndex(_searchIndex, query, cat));
		}
		setResults(clientResults);
		setIsOpen(true);
		setSelectedIndex(0);

		// Guides — API riêng debounce 300ms
		clearTimeout(guideTimer.current);
		setIsLoadingGuides(true);
		guideTimer.current = setTimeout(async () => {
			try {
				const res = await axios.get(`${API_URL}/api/guides`, {
					params: { search: query, limit: MAX_PER_CATEGORY },
				});
				const guides = (res.data?.items || res.data || []).slice(0, MAX_PER_CATEGORY);
				const guideResults = guides.map(g => ({
					id: g.slug || g.id,
					name: g.title || "",
					category: GUIDE_CATEGORY,
				}));
				setResults(prev => [
					...prev.filter(r => r.category.key !== "guides"),
					...guideResults,
				]);
			} catch { /* silent */ } finally {
				setIsLoadingGuides(false);
			}
		}, 300);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [query, isDataReady]);

	// ── Scroll item vào view ──
	useEffect(() => {
		listRef.current
			?.querySelector(`[data-index="${selectedIndex}"]`)
			?.scrollIntoView({ block: "nearest" });
	}, [selectedIndex]);

	// ── Keyboard nav ──
	const handleKeyDown = (e) => {
		if (!isOpen) return;
		if (e.key === "ArrowDown") {
			e.preventDefault();
			setSelectedIndex(i => Math.min(i + 1, results.length - 1));
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setSelectedIndex(i => Math.max(i - 1, 0));
		} else if (e.key === "Enter" && results[selectedIndex]) {
			e.preventDefault();
			handleSelect(results[selectedIndex]);
		} else if (e.key === "Escape") {
			setIsOpen(false);
			setQuery("");
			inputRef.current?.blur();
		}
	};

	const handleSelect = useCallback((item) => {
		navigate(item.category.route(item.id));
		setIsOpen(false);
		setQuery("");
		inputRef.current?.blur();
	}, [navigate]);

	// ── Nhóm kết quả ──
	const grouped = results.reduce((acc, item) => {
		const k = item.category.key;
		if (!acc[k]) acc[k] = { meta: item.category, items: [] };
		acc[k].items.push(item);
		return acc;
	}, {});

	const hasResults = results.length > 0;
	const showEmpty  = query.length >= 2 && !hasResults && !isLoadingGuides;

	return (
		<div ref={containerRef} className="relative">
			{/* ── Input ── */}
			<div
				className={`flex items-center gap-2 rounded-lg border transition-all duration-200
					bg-[var(--color-input-bg,rgba(0,0,0,0.2))]
					border-[var(--color-border,rgba(255,255,255,0.1))]
					hover:border-[var(--color-primary-400,#a78bfa)]
					focus-within:border-[var(--color-primary-400,#a78bfa)]
					focus-within:shadow-[0_0_0_2px_rgba(167,139,250,0.15)]
					${compact ? "w-full max-w-[400px] px-2 py-1" : "w-52 xl:w-64 px-3 py-1.5"}
				`}
			>
				<Search className={`flex-shrink-0 text-[var(--color-text-secondary)] ${compact ? "w-3.5 h-3.5" : "w-4 h-4"}`} />
				<input
					ref={inputRef}
					type="text"
					value={query}
					onChange={e => setQuery(e.target.value)}
					onKeyDown={handleKeyDown}
					onFocus={() => query.length >= 2 && setIsOpen(true)}
					placeholder={compact ? "Tìm kiếm..." : tUI("globalSearch.placeholder")}
					className={`flex-1 bg-transparent text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] outline-none min-w-0 ${compact ? "text-xs" : "text-sm"}`}
					autoComplete="off"
					spellCheck="false"
					aria-label={tUI("globalSearch.ariaLabel")}
				/>
				{query ? (
					<button
						onClick={() => { setQuery(""); setIsOpen(false); }}
						className="flex-shrink-0 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
					>
						<X className="w-3.5 h-3.5" />
					</button>
				) : (
					<div className="flex items-center gap-1.5">
						{!compact && (
							<kbd className="hidden xl:inline-flex text-[10px] px-1 py-0.5 rounded font-mono opacity-40 bg-black/20 border border-white/10 flex-shrink-0 text-[var(--color-text-secondary)]">
								Ctrl+K
							</kbd>
						)}
						{showClose && (
							<button
								onClick={(e) => {
									e.stopPropagation();
									if (onClose) onClose();
								}}
								className="flex-shrink-0 text-[var(--color-text-secondary)] hover:text-red-400 transition-colors p-0.5 rounded-md hover:bg-white/5"
							>
								<X className="w-4 h-4" />
							</button>
						)}
					</div>
				)}
			</div>

			{/* ── Dropdown ── */}
			{isOpen && (
				<div
					className="absolute top-full mt-2 right-0 w-80 sm:w-96 max-w-[90vw]
						bg-[var(--color-modal-bg)] border border-[var(--color-border)]
						rounded-xl shadow-2xl z-[9999] overflow-hidden"
				>
					<div ref={listRef} className="max-h-[70vh] overflow-y-auto custom-scrollbar">

						{/* Empty */}
						{showEmpty && (
							<div className="py-8 text-center text-[var(--color-text-secondary)]">
								<Search className="w-8 h-8 mx-auto mb-2 opacity-20" />
								<p className="text-sm">{tUI("globalSearch.noResults", { query })}</p>
							</div>
						)}

						{/* Chưa tải xong index */}
						{!isDataReady && query.length >= 2 && !hasResults && (
							<div className="py-6 text-center text-[var(--color-text-secondary)]">
								<div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto mb-2" />
								<p className="text-xs">Đang tải dữ liệu tìm kiếm...</p>
							</div>
						)}

						{/* Kết quả */}
						{hasResults && Object.values(grouped).map(({ meta, items }) => {
							const Icon = meta.icon;
							return (
								<div key={meta.key}>
									<div className="flex items-center gap-1.5 px-3 pt-3 pb-1">
										<Icon className={`w-3 h-3 ${meta.color}`} />
										<span className={`text-[10px] font-bold uppercase tracking-widest ${meta.color}`}>
											{tUI(meta.labelKey)}
										</span>
									</div>
									{items.map((item) => {
										const globalIdx = results.indexOf(item);
										const isSel = globalIdx === selectedIndex;
										return (
											<button
												key={`${meta.key}-${item.id}`}
												data-index={globalIdx}
												onClick={() => handleSelect(item)}
												onMouseEnter={() => setSelectedIndex(globalIdx)}
												className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors duration-100
													${isSel
														? `${meta.bgColor} text-[var(--color-text-primary)]`
														: "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]"
													}`}
											>
												<span className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${meta.bgColor} border ${meta.borderColor}`}>
													<Icon className={`w-3 h-3 ${meta.color}`} />
												</span>
												<span className="text-sm font-medium truncate flex-1">{item.name}</span>
												{isSel && <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 ${meta.color}`} />}
											</button>
										);
									})}
								</div>
							);
						})}

						{isLoadingGuides && query.length >= 2 && (
							<div className="px-3 py-2 flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
								<div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
								{tUI("globalSearch.searching")}
							</div>
						)}
					</div>

					{/* Footer hints */}
					{hasResults && (
						<div className="flex items-center gap-3 px-3 py-1.5 border-t border-[var(--color-border)] text-[10px] text-[var(--color-text-secondary)]">
							<span>
								<kbd className="px-1 py-0.5 rounded bg-[var(--color-surface-bg)] border border-[var(--color-border)] font-mono text-[9px] mr-0.5">↑↓</kbd>
								điều hướng
							</span>
							<span>
								<kbd className="px-1 py-0.5 rounded bg-[var(--color-surface-bg)] border border-[var(--color-border)] font-mono text-[9px] mr-0.5">↵</kbd>
								{tUI("globalSearch.pressEnterHint")}
							</span>
							<span>
								<kbd className="px-1 py-0.5 rounded bg-[var(--color-surface-bg)] border border-[var(--color-border)] font-mono text-[9px] mr-0.5">Esc</kbd>
								{tUI("globalSearch.pressEscHint")}
							</span>
						</div>
					)}
				</div>
			)}
		</div>
	);
}

export default GlobalSearch;
