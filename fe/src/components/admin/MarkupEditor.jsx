import React, { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
	useFloating,
	autoUpdate,
	offset,
	shift,
	flip,
	inline,
} from "@floating-ui/react";
import { getAllEntities, preloadAllEntities } from "@/utils/entityLookup";
import MarkupRenderer from "@/components/common/MarkupRenderer";
import { stripMarkup } from "@/utils/markupUtils";
import {
	Bold,
	Italic,
	List,
	ListOrdered,
	Quote,
	CornerDownLeft,
	Eraser,
	Sparkles,
	Eye,
	Code,
	Split,
	Search,
	X,
	ChevronDown,
	Star,
	Maximize2,
	Minimize2,
	Check,
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

/**
 * Helper bỏ dấu tiếng Việt để tìm kiếm không dấu
 */
const removeAccents = (str) => {
	if (!str) return "";
	return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

/**
 * Danh sách cấu hình chỉ số
 */
const STAT_ITEMS = [
	{ id: "v:cong", label: "Công (ATK)" },
	{ id: "v:thu", label: "Thủ (HP)" },
	{ id: "v:tieuhao", label: "Tiêu hao (Cost)" },
	{ id: "v:nangluong", label: "Năng lượng (Mana)" },
	{ id: "v:damage", label: "Sát thương (Damage)" },
	{ id: "v:gold", label: "Vàng (Gold)" },
];

/**
 * Danh sách cấu hình độ hiếm
 */
const RARITY_ITEMS = [
	{ id: "ra:common", label: "Thường (Common)" },
	{ id: "ra:rare", label: "Hiếm (Rare)" },
	{ id: "ra:epic", label: "Sử thi (Epic)" },
	{ id: "ra:legendary", label: "Huyền thoại (Legendary)" },
	{ id: "ra:special", label: "Đặc biệt (Special)" },
];

/**
 * MarkupEditor - Trình soạn thảo đánh dấu nâng cao cho POC Guide
 * Hỗ trợ các công cụ định dạng Word-like, thanh chèn nhanh thực thể LoR, phím tắt,
 * autocomplete @mention, floating selection toolbar, live split-view, và chế độ Mở Rộng Toàn Màn Hình.
 */
const MarkupEditor = ({
	value,
	onChange,
	placeholder = "Nhập nội dung...",
	label = "",
	compact = false,
	minHeight,
	rows,
}) => {
	const { language, tUI } = useTranslation();
	const isEn = language === "en";

	// Safe text value handling
	const safeValue = typeof value === "string" ? value : (value?.markup != null ? String(value.markup) : "");

	const textareaRef = useRef(null);
	const modalTextareaRef = useRef(null);
	const pickerRef = useRef(null);

	// Chế độ mở rộng toàn màn hình (Expand / Fullscreen Workspace)
	const [isExpanded, setIsExpanded] = useState(false);
	const [expandedSplitView, setExpandedSplitView] = useState(true);

	// Floating toolbar on mouse selection
	const [showToolbar, setShowToolbar] = useState(false);
	const [selection, setSelection] = useState({ start: 0, end: 0, text: "" });
	const [activeMenu, setActiveMenu] = useState("main"); // main | search | submenu_id
	const [searchType, setSearchType] = useState("");
	const [searchQuery, setSearchQuery] = useState("");

	// Autocomplete on @
	const [autoSuggestions, setAutoSuggestions] = useState([]);
	const [autoQuery, setAutoQuery] = useState("");
	const [autoIndex, setAutoIndex] = useState(0);
	const [autoActive, setAutoActive] = useState(false);

	// Quick Insert Picker (Word-like Ribbon Popover)
	const [pickerOpen, setPickerOpen] = useState(false);
	const [pickerCategory, setPickerCategory] = useState("k"); // k, c, r, p, i, cd, v, cap, ra
	const [pickerQuery, setPickerQuery] = useState("");

	// Layout view modes (inline)
	const [showPreview, setShowPreview] = useState(false);
	const [showRaw, setShowRaw] = useState(false);
	const [splitView, setSplitView] = useState(false);

	useEffect(() => {
		preloadAllEntities();
	}, []);

	// Khóa cuộn trang khi mở modal phóng to
	useEffect(() => {
		if (isExpanded) {
			const originalOverflow = document.body.style.overflow;
			document.body.style.overflow = "hidden";
			// Focus vào textarea trong modal sau khi mở
			setTimeout(() => {
				if (modalTextareaRef.current) {
					modalTextareaRef.current.focus();
				}
			}, 50);
			return () => {
				document.body.style.overflow = originalOverflow;
			};
		}
	}, [isExpanded]);

	// Lấy textarea đang hoạt động (modal hoặc inline)
	const getActiveTextarea = () => (isExpanded ? modalTextareaRef.current : textareaRef.current);

	// Click outside to close Quick Insert Picker
	useEffect(() => {
		const handleClickOutside = (e) => {
			if (pickerRef.current && !pickerRef.current.contains(e.target)) {
				setPickerOpen(false);
			}
		};
		if (pickerOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [pickerOpen]);

	// Floating UI setup for text highlight toolbar
	const { refs, floatingStyles } = useFloating({
		open: showToolbar,
		onOpenChange: setShowToolbar,
		placement: "top",
		middleware: [inline(), offset(10), flip(), shift({ padding: 10 })],
		whileElementsMounted: autoUpdate,
	});

	// Handle text selection in active textarea
	const handleSelect = (e) => {
		const el = e?.target || getActiveTextarea();
		if (!el) return;
		refs.setReference(el);
		const start = el.selectionStart;
		const end = el.selectionEnd;
		const text = el.value.substring(start, end);

		if (text && text.trim().length > 0) {
			setSelection({ start, end, text });
			setShowToolbar(true);
			setActiveMenu("main");
		} else {
			setShowToolbar(false);
		}
	};

	// Cập nhật nội dung văn bản và định vị con trỏ
	const updateContent = (newValue, cursorPosition) => {
		if (onChange) {
			onChange({
				markup: newValue,
				raw: stripMarkup(newValue),
				target: { value: newValue },
			});
		}
		if (cursorPosition !== undefined) {
			setTimeout(() => {
				const activeEl = getActiveTextarea();
				if (activeEl) {
					activeEl.focus();
					activeEl.setSelectionRange(cursorPosition, cursorPosition);
				}
			}, 0);
		}
	};

	// 1. In đậm <b>...</b>
	const handleBold = () => {
		const el = getActiveTextarea();
		const start = el ? el.selectionStart : selection.start;
		const end = el ? el.selectionEnd : selection.end;
		const selText = safeValue.substring(start, end);

		if (selText) {
			const wrapped = `<b>${selText}</b>`;
			const nextVal = safeValue.substring(0, start) + wrapped + safeValue.substring(end);
			updateContent(nextVal, start + wrapped.length);
		} else {
			const placeholderText = "văn bản";
			const inserted = `<b>${placeholderText}</b>`;
			const nextVal = safeValue.substring(0, start) + inserted + safeValue.substring(end);
			if (onChange) {
				onChange({
					markup: nextVal,
					raw: stripMarkup(nextVal),
					target: { value: nextVal },
				});
			}
			setTimeout(() => {
				const activeEl = getActiveTextarea();
				if (activeEl) {
					activeEl.focus();
					activeEl.setSelectionRange(start + 3, start + 3 + placeholderText.length);
				}
			}, 0);
		}
		setShowToolbar(false);
	};

	// 2. In nghiêng <i>...</i>
	const handleItalic = () => {
		const el = getActiveTextarea();
		const start = el ? el.selectionStart : selection.start;
		const end = el ? el.selectionEnd : selection.end;
		const selText = safeValue.substring(start, end);

		if (selText) {
			const wrapped = `<i>${selText}</i>`;
			const nextVal = safeValue.substring(0, start) + wrapped + safeValue.substring(end);
			updateContent(nextVal, start + wrapped.length);
		} else {
			const placeholderText = "văn bản";
			const inserted = `<i>${placeholderText}</i>`;
			const nextVal = safeValue.substring(0, start) + inserted + safeValue.substring(end);
			if (onChange) {
				onChange({
					markup: nextVal,
					raw: stripMarkup(nextVal),
					target: { value: nextVal },
				});
			}
			setTimeout(() => {
				const activeEl = getActiveTextarea();
				if (activeEl) {
					activeEl.focus();
					activeEl.setSelectionRange(start + 3, start + 3 + placeholderText.length);
				}
			}, 0);
		}
		setShowToolbar(false);
	};

	// 3. Gạch đầu dòng (Bullet List)
	const handleBulletList = () => {
		const el = getActiveTextarea();
		const start = el ? el.selectionStart : 0;
		const end = el ? el.selectionEnd : 0;
		const text = safeValue;
		const lineStart = text.lastIndexOf("\n", start - 1) + 1;
		const lineEnd = text.indexOf("\n", end) === -1 ? text.length : text.indexOf("\n", end);
		const lines = text.substring(lineStart, lineEnd).split("\n");
		const formatted = lines.map((l) => (l.startsWith("• ") ? l.slice(2) : `• ${l}`)).join("\n");
		const nextVal = text.substring(0, lineStart) + formatted + text.substring(lineEnd);
		updateContent(nextVal, lineStart + formatted.length);
	};

	// 4. Đánh số thứ tự (Numbered List)
	const handleNumberedList = () => {
		const el = getActiveTextarea();
		const start = el ? el.selectionStart : 0;
		const end = el ? el.selectionEnd : 0;
		const text = safeValue;
		const lineStart = text.lastIndexOf("\n", start - 1) + 1;
		const lineEnd = text.indexOf("\n", end) === -1 ? text.length : text.indexOf("\n", end);
		const lines = text.substring(lineStart, lineEnd).split("\n");
		const formatted = lines
			.map((l, i) => {
				const cleaned = l.replace(/^\d+\.\s*/, "");
				return `${i + 1}. ${cleaned}`;
			})
			.join("\n");
		const nextVal = text.substring(0, lineStart) + formatted + text.substring(lineEnd);
		updateContent(nextVal, lineStart + formatted.length);
	};

	// 5. Khối trích dẫn / Ghi chú (Quote)
	const handleQuote = () => {
		const el = getActiveTextarea();
		const start = el ? el.selectionStart : 0;
		const end = el ? el.selectionEnd : 0;
		const text = safeValue;
		const lineStart = text.lastIndexOf("\n", start - 1) + 1;
		const lineEnd = text.indexOf("\n", end) === -1 ? text.length : text.indexOf("\n", end);
		const lines = text.substring(lineStart, lineEnd).split("\n");
		const formatted = lines.map((l) => (l.startsWith("> ") ? l.slice(2) : `> ${l}`)).join("\n");
		const nextVal = text.substring(0, lineStart) + formatted + text.substring(lineEnd);
		updateContent(nextVal, lineStart + formatted.length);
	};

	// 6. Chèn ngắt dòng <br/>
	const handleLineBreak = () => {
		const el = getActiveTextarea();
		const start = el ? el.selectionStart : selection.start;
		const end = el ? el.selectionEnd : selection.end;
		const nextVal = safeValue.substring(0, start) + "<br/>\n" + safeValue.substring(end);
		updateContent(nextVal, start + 6);
	};

	// 7. Xóa định dạng / Gỡ thẻ markup
	const handleRemoveMarkup = () => {
		const el = getActiveTextarea();
		const start = el ? el.selectionStart : selection.start;
		const end = el ? el.selectionEnd : selection.end;
		let textToStrip = safeValue.substring(start, end);
		let selStart = start;
		let selEnd = end;

		if (!textToStrip) {
			const before = safeValue.substring(0, start);
			const after = safeValue.substring(end);
			const lastOpen = before.lastIndexOf("[");
			const firstClose = after.indexOf("]");
			if (lastOpen !== -1 && firstClose !== -1 && lastOpen < start) {
				selStart = lastOpen;
				selEnd = end + firstClose + 1;
				textToStrip = safeValue.substring(selStart, selEnd);
			}
		}

		if (textToStrip) {
			const stripped = stripMarkup(textToStrip).replace(/<\/?(b|i|br)\/?>/gi, "");
			const nextVal = safeValue.substring(0, selStart) + stripped + safeValue.substring(selEnd);
			updateContent(nextVal, selStart + stripped.length);
			setShowToolbar(false);
		}
	};

	// 8. Chèn Thực thể LoR (Quick Insert Handler)
	const handleInsertEntity = (type, entityId, labelName, options = []) => {
		const el = getActiveTextarea();
		const start = el ? el.selectionStart : selection.start;
		const end = el ? el.selectionEnd : selection.end;
		const currentSelected = safeValue.substring(start, end).trim();

		const finalLabel = currentSelected || labelName || entityId || "";
		const optStr = options.length > 0 ? `|${options.join(",")}` : "";

		let tagContent = "";
		const [mainType, subValue] = type.split(":");

		if (entityId) {
			tagContent = `[${mainType}:${entityId}|${finalLabel}${optStr}]`;
		} else if (subValue) {
			tagContent = `[${mainType}:${subValue}|${finalLabel}${optStr}]`;
		} else {
			tagContent = `[${type}:${finalLabel}${optStr}]`;
		}

		const nextVal = safeValue.substring(0, start) + tagContent + safeValue.substring(end);
		updateContent(nextVal, start + tagContent.length);
		setPickerOpen(false);
		setShowToolbar(false);
	};

	// Hỗ trợ hàm bôi đen bọc thẻ (giữ nguyên tương thích cũ)
	const insertMarkup = (type, id = null, options = []) => {
		const rawText = selection.text;
		const leadingSpace = rawText.match(/^\s*/)?.[0] || "";
		const trailingSpace = rawText.match(/\s*$/)?.[0] || "";
		const labelText = rawText.trim();
		const optStr = options.length > 0 ? `|${options.join(",")}` : "";

		let tagContent = "";
		const [mainType, subValue] = type.split(":");

		if (id) {
			tagContent = `[${mainType}:${id}|${labelText || id}${optStr}]`;
		} else if (subValue) {
			tagContent = `[${mainType}:${subValue}|${labelText || subValue}${optStr}]`;
		} else {
			tagContent = options.length > 0 ? `[${type}:${labelText}|${labelText}${optStr}]` : `[${type}:${labelText}]`;
		}

		const fullInsertion = `${leadingSpace}${tagContent}${trailingSpace}`;
		const newValue = safeValue.substring(0, selection.start) + fullInsertion + safeValue.substring(selection.end);

		updateContent(newValue, selection.start + fullInsertion.length);
		setShowToolbar(false);
	};

	// Danh sách thực thể lọc cho Floating Menu (giữ nguyên tương thích)
	const filteredEntities = useMemo(() => {
		if (!searchType || activeMenu !== "search") return [];
		const all = getAllEntities(searchType, language);
		const q = removeAccents(searchQuery.trim());
		if (!q) return all.slice(0, 5);

		return all
			.filter((e) => {
				const nameNorm = removeAccents(e.name);
				const nameEnNorm = removeAccents(e.nameEn || "");
				const idNorm = e.id?.toLowerCase() || "";
				return nameNorm.includes(q) || nameEnNorm.includes(q) || idNorm.includes(q);
			})
			.slice(0, 5);
	}, [searchType, searchQuery, activeMenu, language]);

	// Danh sách thực thể tổng hợp cho autocomplete @mention
	const getCombinedEntities = () => {
		return [
			...getAllEntities("c", language).map((e) => ({ ...e, type: "c", typeName: isEn ? "Champion" : "Tướng" })),
			...getAllEntities("r", language).map((e) => ({ ...e, type: "r", typeName: isEn ? "Relic" : "Cổ vật" })),
			...getAllEntities("p", language).map((e) => ({ ...e, type: "p", typeName: isEn ? "Power" : "Sức mạnh" })),
			...getAllEntities("i", language).map((e) => ({ ...e, type: "i", typeName: isEn ? "Item" : "Vật phẩm" })),
			...getAllEntities("k", language).map((e) => ({ ...e, type: "k", typeName: isEn ? "Keyword" : "Từ khóa" })),
			...getAllEntities("cd", language).map((e) => ({ ...e, type: "cd", typeName: isEn ? "Card" : "Thẻ bài" })),
		];
	};

	// Áp dụng gợi ý autocomplete @mention
	const applyAutocomplete = (index = autoIndex, asMarkup = true) => {
		const selected = autoSuggestions[index];
		if (!selected) return;

		const activeEl = getActiveTextarea();
		const cursorPos = activeEl ? activeEl.selectionStart : 0;
		const replaceStart = cursorPos - (autoQuery.length + 1);

		const finalBefore = safeValue.substring(0, Math.max(0, replaceStart));
		const after = safeValue.substring(cursorPos);

		const tag = asMarkup ? `[${selected.type}:${selected.id}|${selected.name}]` : selected.name;
		const newValue = finalBefore + tag + after;

		updateContent(newValue, finalBefore.length + tag.length);
		setAutoActive(false);
	};

	// Bắt phím tắt Ctrl+B, Ctrl+I và điều hướng gợi ý @
	const handleKeyDown = (e) => {
		// Word keyboard shortcuts
		if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
			e.preventDefault();
			handleBold();
			return;
		}
		if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "i") {
			e.preventDefault();
			handleItalic();
			return;
		}

		if (e.key === "Escape") {
			if (pickerOpen) {
				setPickerOpen(false);
				return;
			}
			if (autoActive) {
				setAutoActive(false);
				return;
			}
			if (showToolbar) {
				setShowToolbar(false);
				return;
			}
			if (isExpanded) {
				setIsExpanded(false);
				return;
			}
		}

		if (autoActive && autoSuggestions.length > 0) {
			if (e.key === "ArrowDown") {
				e.preventDefault();
				setAutoIndex((prev) => (prev + 1) % autoSuggestions.length);
			} else if (e.key === "ArrowUp") {
				e.preventDefault();
				setAutoIndex((prev) => (prev - 1 + autoSuggestions.length) % autoSuggestions.length);
			} else if (e.key === "Tab") {
				e.preventDefault();
				applyAutocomplete(autoIndex, true);
			} else if (e.key === "Enter") {
				e.preventDefault();
				applyAutocomplete(autoIndex, false);
			}
		}
	};

	// Xử lý khi gõ văn bản
	const handleTextareaChange = (e) => {
		const newValue = e.target.value;
		updateContent(newValue);

		const cursorPos = e.target.selectionStart;
		const textBeforeCursor = newValue.substring(0, cursorPos);
		const triggerMatch = textBeforeCursor.match(/@([^@\[\]\|\n,\.]{0,40})$/);

		if (triggerMatch) {
			const query = triggerMatch[1].trimStart();
			if (!textBeforeCursor.endsWith("  ")) {
				const combined = getCombinedEntities();
				const q = removeAccents(query);
				const filtered = combined
					.filter((item) => {
						if (!q) return true;
						const nameNorm = removeAccents(item.name);
						const nameEnNorm = removeAccents(item.nameEn);
						return nameNorm.includes(q) || nameEnNorm.includes(q);
					})
					.slice(0, 8);

				if (filtered.length > 0) {
					setAutoSuggestions(filtered);
					setAutoQuery(triggerMatch[1]);
					setAutoActive(true);
					setAutoIndex(0);
					return;
				}
			}
		}
		setAutoActive(false);
	};

	// Danh mục Quick Insert Picker
	const CATEGORIES = [
		{ id: "k", label: isEn ? "Keyword" : "Từ khóa" },
		{ id: "c", label: isEn ? "Champion" : "Tướng" },
		{ id: "r", label: isEn ? "Relic" : "Cổ vật" },
		{ id: "p", label: isEn ? "Power" : "Sức mạnh" },
		{ id: "i", label: isEn ? "Item" : "Vật phẩm" },
		{ id: "cd", label: isEn ? "Card" : "Thẻ bài" },
		{ id: "v", label: isEn ? "Stats" : "Chỉ số" },
		{ id: "cap", label: isEn ? "Stars" : "Cấp sao" },
		{ id: "ra", label: isEn ? "Rarity" : "Độ hiếm" },
	];

	const isEntityCategory = (cat) => ["k", "c", "r", "p", "i", "cd"].includes(cat);

	// Lọc danh sách thực thể trong Quick Insert Picker
	const filteredEntitiesList = useMemo(() => {
		if (!isEntityCategory(pickerCategory)) return [];
		const all = getAllEntities(pickerCategory, language);
		const q = removeAccents(pickerQuery.trim());
		if (!q) return all.slice(0, 16);

		return all
			.filter((e) => {
				const nameNorm = removeAccents(e.name);
				const nameEnNorm = removeAccents(e.nameEn || "");
				const idNorm = e.id?.toLowerCase() || "";
				return nameNorm.includes(q) || nameEnNorm.includes(q) || idNorm.includes(q);
			})
			.slice(0, 24);
	}, [pickerCategory, pickerQuery, language]);

	const openPickerWithCategory = (cat) => {
		setPickerCategory(cat);
		setPickerQuery(selection.text.trim());
		setPickerOpen(true);
	};

	// Floating Toolbar Menu Items
	const menuItems = [
		{ id: "k", label: isEn ? "Keyword" : "Từ khóa", type: "search" },
		{
			id: "v",
			label: isEn ? "Stats" : "Chỉ số",
			type: "submenu",
			items: [
				{ id: "v:cong", label: isEn ? "Attack (ATK)" : "Công (ATK)" },
				{ id: "v:thu", label: isEn ? "Health (HP)" : "Thủ (HP)" },
				{ id: "v:tieuhao", label: isEn ? "Cost" : "Tiêu hao (Cost)" },
				{ id: "v:nangluong", label: isEn ? "Mana" : "Năng lượng" },
				{ id: "v:damage", label: isEn ? "Damage" : "Sát thương" },
				{ id: "v:gold", label: isEn ? "Gold" : "Vàng (Gold)" },
			],
		},
		{
			id: "cap",
			label: isEn ? "Star Level" : "Cấp sao",
			type: "submenu",
			items: [
				{ id: "cap:1", label: isEn ? "1 Star" : "1 Sao" },
				{ id: "cap:2", label: isEn ? "2 Star" : "2 Sao" },
				{ id: "cap:3", label: isEn ? "3 Star" : "3 Sao" },
				{ id: "cap:4", label: isEn ? "4 Star" : "4 Sao" },
				{ id: "cap:5", label: isEn ? "5 Star" : "5 Sao" },
				{ id: "cap:6", label: isEn ? "6 Star" : "6 Sao" },
			],
		},
		{
			id: "ra",
			label: isEn ? "Rarity" : "Độ hiếm",
			type: "submenu",
			items: [
				{ id: "ra:common", label: isEn ? "Common" : "Thường (Common)" },
				{ id: "ra:rare", label: isEn ? "Rare" : "Hiếm (Rare)" },
				{ id: "ra:epic", label: isEn ? "Epic" : "Sử thi (Epic)" },
				{ id: "ra:legendary", label: isEn ? "Legendary" : "Huyền thoại" },
				{ id: "ra:special", label: isEn ? "Special" : "Đặc biệt" },
			],
		},
		{ id: "c", label: isEn ? "Champion" : "Tướng", type: "search" },
		{ id: "r", label: isEn ? "Relic" : "Cổ vật", type: "search" },
		{ id: "p", label: isEn ? "Power" : "Sức mạnh", type: "search" },
		{ id: "i", label: isEn ? "Item" : "Vật phẩm", type: "search" },
		{ id: "cd", label: isEn ? "Card" : "Thẻ bài", type: "search" },
		{ id: "unmarkup", label: isEn ? "Remove Markup" : "Gỡ Markup", type: "action" },
	];

	const resolvedMinHeight = minHeight || (compact ? "76px" : "150px");

	/**
	 * Render thanh Ribbon Toolbar (tái sử dụng ở cả Inline và Expanded Modal)
	 */
	const renderRibbonToolbar = (inModal = false) => {
		const isCompactMode = compact && !inModal;

		return (
			<div
				className={`flex flex-wrap items-center justify-between gap-1 bg-surface-hover/80 border border-input-border border-b-0 rounded-t-xl backdrop-blur-sm transition-all select-none ${
					isCompactMode ? "p-1.5" : "p-2"
				}`}
			>
				{/* Nhóm định dạng văn bản & chèn thực thể */}
				<div className="flex flex-wrap items-center gap-0.5">
					<button
						type="button"
						onClick={handleBold}
						className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-surface-bg rounded transition-colors"
						title="In đậm (Ctrl+B)"
					>
						<Bold size={13} />
					</button>

					<button
						type="button"
						onClick={handleItalic}
						className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-surface-bg rounded transition-colors"
						title="In nghiêng (Ctrl+I)"
					>
						<Italic size={13} />
					</button>

					<button
						type="button"
						onClick={handleBulletList}
						className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-surface-bg rounded transition-colors"
						title="Danh sách gạch đầu dòng (•)"
					>
						<List size={13} />
					</button>

					<button
						type="button"
						onClick={handleNumberedList}
						className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-surface-bg rounded transition-colors"
						title="Danh sách số thứ tự (1, 2, 3...)"
					>
						<ListOrdered size={13} />
					</button>

					<button
						type="button"
						onClick={handleQuote}
						className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-surface-bg rounded transition-colors"
						title="Khối trích dẫn / Ghi chú (>)"
					>
						<Quote size={13} />
					</button>

					<button
						type="button"
						onClick={handleLineBreak}
						className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-surface-bg rounded transition-colors"
						title="Ngắt dòng (<br/>)"
					>
						<CornerDownLeft size={13} />
					</button>

					<button
						type="button"
						onClick={handleRemoveMarkup}
						className="p-1.5 text-text-secondary hover:text-danger-500 hover:bg-surface-bg rounded transition-colors"
						title="Xóa định dạng thẻ markup"
					>
						<Eraser size={13} />
					</button>

					<div className="h-4 w-[1px] bg-border mx-1" />

					{/* Nút Chèn Thẻ LoR (Word-like Insert dropdown) */}
					<div className="relative">
						<button
							type="button"
							onClick={() => {
								setPickerOpen((prev) => !prev);
								if (!pickerOpen) {
									setPickerQuery(selection.text.trim());
								}
							}}
							className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-bold transition-all ${
								pickerOpen
									? "bg-primary-500 text-white shadow-sm"
									: "bg-primary-500/10 text-primary-500 hover:bg-primary-500/20"
							}`}
							title="Chèn thẻ LoR (Tướng, Cổ vật, Từ khóa, Sức mạnh, Chỉ số...)"
						>
							<Sparkles size={13} />
							<span>Chèn thẻ LoR</span>
							<ChevronDown
								size={11}
								className={`transition-transform duration-200 ${pickerOpen ? "rotate-180" : ""}`}
							/>
						</button>
					</div>

					{/* Nút chèn nhanh trực tiếp trên thanh công cụ (khi ở chế độ đầy đủ hoặc modal) */}
					{!isCompactMode && (
						<div className="hidden sm:flex items-center gap-1 ml-1">
							<button
								type="button"
								onClick={() => openPickerWithCategory("k")}
								className="px-2 py-0.5 text-[11px] font-medium text-text-secondary hover:text-primary-400 hover:bg-surface-bg rounded border border-border/40 transition-colors"
								title="Chèn từ khóa"
							>
								+ Từ khóa
							</button>
							<button
								type="button"
								onClick={() => openPickerWithCategory("c")}
								className="px-2 py-0.5 text-[11px] font-medium text-text-secondary hover:text-primary-400 hover:bg-surface-bg rounded border border-border/40 transition-colors"
								title="Chèn tướng"
							>
								+ Tướng
							</button>
							<button
								type="button"
								onClick={() => openPickerWithCategory("r")}
								className="px-2 py-0.5 text-[11px] font-medium text-text-secondary hover:text-primary-400 hover:bg-surface-bg rounded border border-border/40 transition-colors"
								title="Chèn cổ vật"
							>
								+ Cổ vật
							</button>
							<button
								type="button"
								onClick={() => openPickerWithCategory("p")}
								className="px-2 py-0.5 text-[11px] font-medium text-text-secondary hover:text-primary-400 hover:bg-surface-bg rounded border border-border/40 transition-colors"
								title="Chèn sức mạnh"
							>
								+ Sức mạnh
							</button>
							<button
								type="button"
								onClick={() => openPickerWithCategory("v")}
								className="px-2 py-0.5 text-[11px] font-medium text-text-secondary hover:text-primary-400 hover:bg-surface-bg rounded border border-border/40 transition-colors"
								title="Chèn chỉ số (Công, Thủ, Mana...)"
							>
								+ Chỉ số
							</button>
						</div>
					)}
				</div>

				{/* Nhóm chế độ xem & layout */}
				<div className="flex items-center gap-1">
					{inModal ? (
						<button
							type="button"
							onClick={() => setExpandedSplitView((prev) => !prev)}
							className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tight transition-all ${
								expandedSplitView
									? "bg-purple-500/20 text-purple-400 border border-purple-500/40"
									: "text-text-secondary hover:bg-surface-bg border border-border/40"
							}`}
							title="Chia đôi màn hình: Vừa soạn thảo vừa xem Live Preview song song"
						>
							<Split size={12} />
							<span>{expandedSplitView ? "Đóng Split" : "Song song"}</span>
						</button>
					) : (
						!compact && (
							<button
								type="button"
								onClick={() => setSplitView((prev) => !prev)}
								className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tight transition-all ${
									splitView
										? "bg-purple-500/20 text-purple-400 border border-purple-500/40"
										: "text-text-secondary hover:bg-surface-bg border border-border/40"
								}`}
								title="Chia đôi màn hình: Vừa soạn thảo vừa xem Live Preview song song"
							>
								<Split size={12} />
								<span>{splitView ? "Đóng Split" : "Song song"}</span>
							</button>
						)
					)}

					{!inModal && (
						<>
							<button
								type="button"
								onClick={() => setShowPreview((prev) => !prev)}
								className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tight transition-all ${
									showPreview
										? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
										: "text-text-secondary hover:bg-surface-bg border border-border/40"
								}`}
								title="Xem trước định dạng sau khi render"
							>
								<Eye size={12} />
								<span>{showPreview ? "Ẩn Layout" : "Xem trước"}</span>
							</button>

							<button
								type="button"
								onClick={() => setShowRaw((prev) => !prev)}
								className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tight transition-all ${
									showRaw
										? "bg-primary-500/20 text-primary-400 border border-primary-500/40"
										: "text-text-secondary hover:bg-surface-bg border border-border/40"
								}`}
								title="Xem văn bản thô (loại bỏ mọi thẻ markup)"
							>
								<Code size={12} />
								<span>{showRaw ? "Ẩn Thô" : "Thô"}</span>
							</button>
						</>
					)}

					{/* NÚT MỞ RỘNG TOÀN MÀN HÌNH / THU NHỎ */}
					<button
						type="button"
						onClick={() => setIsExpanded((prev) => !prev)}
						className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tight transition-all ${
							inModal
								? "bg-primary-500 text-white shadow-sm hover:bg-primary-600"
								: "bg-surface-bg hover:bg-primary-500/10 text-primary-500 border border-primary-500/30"
						}`}
						title={inModal ? "Thu nhỏ về kích thước ban đầu (Esc)" : "Mở rộng không gian soạn thảo lớn hơn để dễ thao tác (Full Workspace)"}
					>
						{inModal ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
						<span>{inModal ? "Thu nhỏ" : "Mở rộng"}</span>
					</button>
				</div>
			</div>
		);
	};

	/**
	 * Render Quick Insert Picker Popover
	 */
	const renderQuickPicker = () => {
		if (!pickerOpen) return null;

		return (
			<div
				ref={pickerRef}
				className="absolute z-[100] left-0 top-[40px] mt-1 w-full max-w-lg bg-surface-bg border border-border shadow-2xl rounded-xl p-3 flex flex-col gap-2.5 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl"
			>
				<div className="flex items-center justify-between border-b border-border pb-2">
					<span className="text-xs font-bold text-text-primary flex items-center gap-1.5 uppercase tracking-wider">
						<Sparkles size={14} className="text-primary-500" />
						Chèn Thẻ Thực Thể LoR
					</span>
					<button
						type="button"
						onClick={() => setPickerOpen(false)}
						className="text-text-secondary hover:text-text-primary p-1 rounded"
					>
						<X size={14} />
					</button>
				</div>

				{/* Category Tabs */}
				<div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[11px]">
					{CATEGORIES.map((cat) => (
						<button
							key={cat.id}
							type="button"
							onClick={() => setPickerCategory(cat.id)}
							className={`px-2.5 py-1 rounded-lg font-semibold shrink-0 transition-all ${
								pickerCategory === cat.id
									? "bg-primary-500 text-white shadow-sm"
									: "bg-surface-hover/60 text-text-secondary hover:text-text-primary"
							}`}
						>
							{cat.label}
						</button>
					))}
				</div>

				{/* Nội dung danh mục */}
				{isEntityCategory(pickerCategory) ? (
					<div className="flex flex-col gap-2">
						<div className="relative">
							<Search size={14} className="absolute left-2.5 top-2.5 text-text-secondary" />
							<input
								autoFocus
								type="text"
								value={pickerQuery}
								onChange={(e) => setPickerQuery(e.target.value)}
								placeholder={`Tìm kiếm ${CATEGORIES.find((c) => c.id === pickerCategory)?.label}...`}
								className="w-full bg-input-bg border border-input-border pl-8 pr-3 py-1.5 rounded-lg text-xs text-input-text placeholder:text-text-secondary focus:border-primary-500 focus:outline-none"
							/>
							{pickerQuery && (
								<button
									type="button"
									onClick={() => setPickerQuery("")}
									className="absolute right-2.5 top-2 text-text-secondary hover:text-text-primary"
								>
									<X size={12} />
								</button>
							)}
						</div>

						<div className="max-h-52 overflow-y-auto flex flex-col gap-1 pr-1 scrollbar-thin">
							{filteredEntitiesList.length > 0 ? (
								filteredEntitiesList.map((item) => (
									<button
										key={item.id}
										type="button"
										onClick={() => handleInsertEntity(pickerCategory, item.id, item.name)}
										className="flex items-center justify-between p-2 rounded-lg bg-surface-hover/40 hover:bg-primary-500/15 border border-transparent hover:border-primary-500/30 text-left transition-all group"
									>
										<div className="flex flex-col min-w-0 pr-2">
											<span className="text-xs font-bold text-text-primary group-hover:text-primary-400 truncate">
												{item.name}
											</span>
											{item.nameEn && item.nameEn !== item.name && (
												<span className="text-[10px] text-text-secondary truncate">
													{item.nameEn}
												</span>
											)}
										</div>
										<span className="text-[10px] font-mono text-text-secondary bg-surface-bg px-1.5 py-0.5 rounded border border-border/40 shrink-0">
											{item.id}
										</span>
									</button>
								))
							) : (
								<div className="text-center py-4 text-xs text-text-secondary">
									Không tìm thấy kết quả phù hợp cho "{pickerQuery}"
								</div>
							)}
						</div>
					</div>
				) : pickerCategory === "v" ? (
					<div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
						{STAT_ITEMS.map((stat) => (
							<button
								key={stat.id}
								type="button"
								onClick={() => handleInsertEntity(stat.id, null, stat.label)}
								className="p-2 rounded-lg bg-surface-hover/50 hover:bg-primary-500/20 border border-border/50 text-left transition-all"
							>
								<div className="text-xs font-bold text-text-primary">{stat.label}</div>
								<div className="text-[9px] text-text-secondary font-mono">{stat.id}</div>
							</button>
						))}
					</div>
				) : pickerCategory === "cap" ? (
					<div className="grid grid-cols-3 gap-1.5">
						{[1, 2, 3, 4, 5, 6].map((num) => (
							<button
								key={num}
								type="button"
								onClick={() => handleInsertEntity(`cap:${num}`, null, `${num} Sao`)}
								className="p-2.5 rounded-lg bg-surface-hover/50 hover:bg-amber-500/20 border border-border/50 text-center transition-all"
							>
								<span className="text-xs font-bold text-amber-400 flex items-center justify-center gap-1">
									<Star size={13} className="fill-amber-400" /> {num} Sao
								</span>
							</button>
						))}
					</div>
				) : (
					<div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
						{RARITY_ITEMS.map((r) => (
							<button
								key={r.id}
								type="button"
								onClick={() => handleInsertEntity(r.id, null, r.label)}
								className="p-2 rounded-lg bg-surface-hover/50 hover:bg-primary-500/20 border border-border/50 text-left transition-all"
							>
								<div className="text-xs font-bold text-text-primary">{r.label}</div>
								<div className="text-[9px] text-text-secondary font-mono">{r.id}</div>
							</button>
						))}
					</div>
				)}

				<div className="flex items-center justify-between text-[10px] text-text-secondary pt-2 border-t border-border/60">
					<span>Mẹo: Bôi đen văn bản trước để giữ nguyên nhãn hiển thị.</span>
					<span>Esc để đóng</span>
				</div>
			</div>
		);
	};

	return (
		<div className="flex flex-col w-full relative animate-fadeIn focus-within:z-30">
			{/* THANH CÔNG CỤ NỘI BỘ (INLINE RIBBON TOOLBAR) */}
			{renderRibbonToolbar(false)}

			{/* POPUP CHÈN THỰC THỂ LOR INLINE */}
			{renderQuickPicker()}

			{/* KHU VỰC NHẬP LIỆU INLINE (SOẠN THẢO HOẶC CHẾ ĐỘ SPLIT-VIEW) */}
			{splitView && !compact ? (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-2 border border-input-border rounded-b-xl overflow-hidden bg-input-bg">
					<div className="relative h-full flex flex-col">
						<textarea
							ref={(node) => {
								textareaRef.current = node;
								if (!isExpanded) refs.setReference(node);
							}}
							data-gramm="false"
							data-gramm_editor="false"
							data-enable-grammarly="false"
							value={safeValue}
							rows={rows}
							onChange={handleTextareaChange}
							onKeyDown={handleKeyDown}
							onMouseUp={handleSelect}
							onKeyUp={(e) => {
								if (e.key !== "ArrowUp" && e.key !== "ArrowDown" && e.key !== "Tab" && e.key !== "Escape") {
									handleSelect(e);
								}
							}}
							placeholder={placeholder}
							className="w-full h-full min-h-[220px] p-3 bg-transparent text-input-text text-sm focus:outline-none resize-none font-sans leading-relaxed scrollbar-thin overflow-y-auto"
						/>
					</div>
					<div className="border-t md:border-t-0 md:border-l border-border p-3 bg-surface-bg/50 overflow-y-auto max-h-[380px] scrollbar-thin">
						<div className="text-[9px] uppercase font-black text-emerald-500 mb-2 tracking-widest flex items-center gap-1.5">
							<Eye size={12} /> Xem trước thời gian thực (Live Preview)
						</div>
						<div className="text-text-primary text-xs leading-relaxed font-sans min-h-[50px] whitespace-pre-wrap">
							{safeValue ? (
								<MarkupRenderer text={safeValue} />
							) : (
								<span className="text-text-secondary italic">Nội dung xem trước sẽ hiển thị ở đây...</span>
							)}
						</div>
					</div>
				</div>
			) : (
				<div className="relative w-full border border-input-border rounded-b-xl overflow-hidden bg-input-bg focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500 transition-colors">
					<textarea
						ref={(node) => {
							textareaRef.current = node;
							if (!isExpanded) refs.setReference(node);
						}}
						data-gramm="false"
						data-gramm_editor="false"
						data-enable-grammarly="false"
						value={safeValue}
						rows={rows}
						style={{ minHeight: resolvedMinHeight }}
						onChange={handleTextareaChange}
						onKeyDown={handleKeyDown}
						onMouseUp={handleSelect}
						onKeyUp={(e) => {
							if (e.key !== "ArrowUp" && e.key !== "ArrowDown" && e.key !== "Tab" && e.key !== "Escape") {
								handleSelect(e);
							}
						}}
						placeholder={placeholder}
						className="w-full p-3 bg-transparent text-input-text text-sm focus:outline-none transition-colors resize-y font-sans leading-relaxed shadow-inner scrollbar-thin overflow-y-auto block"
					/>
				</div>
			)}

			{/* GỢI Ý AUTOCOMPLETE KHI GÕ @ */}
			{autoActive && autoSuggestions.length > 0 && (
				<div className="absolute z-[999] bg-gray-900 border border-white/10 shadow-2xl rounded-lg overflow-hidden flex flex-col min-w-[300px] backdrop-blur-xl mt-1 left-0 top-full">
					<div className="p-1.5 flex flex-col gap-0.5 max-h-56 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20">
						<div className="text-[9px] text-gray-500 uppercase tracking-wider px-2 py-1 flex justify-between border-b border-white/10 mb-1">
							<span>Tab (Chèn thẻ) | Enter (Chèn chữ)</span>
							<span>Esc để đóng</span>
						</div>
						{autoSuggestions.map((item, idx) => (
							<button
								key={idx}
								type="button"
								onClick={() => applyAutocomplete(idx, true)}
								className={`px-2 py-1.5 text-xs rounded text-left transition-colors flex justify-between items-center ${
									idx === autoIndex ? "bg-primary-500/30 text-white" : "text-gray-300 hover:bg-white/5"
								}`}
							>
								<span className="font-bold truncate mr-2">{item.name}</span>
								<span className="text-[9px] opacity-70 whitespace-nowrap bg-black/20 px-1.5 py-0.5 rounded">
									[{item.typeName}]
								</span>
							</button>
						))}
					</div>
				</div>
			)}

			{/* MENU NỔI KHI BÔI ĐEN VĂN BẢN (FLOATING TOOLBAR) */}
			{showToolbar && !pickerOpen && (
				<div
					ref={refs.setFloating}
					style={floatingStyles}
					className="z-[999] bg-gray-900 border border-white/10 shadow-2xl rounded-lg overflow-hidden flex flex-col min-w-[200px] backdrop-blur-xl"
				>
					{activeMenu === "main" ? (
						<div className="grid grid-cols-2 p-1 gap-1">
							{menuItems.map((item) => (
								<button
									key={item.id}
									type="button"
									onClick={() => {
										if (item.type === "action") {
											if (item.id === "unmarkup") handleRemoveMarkup();
										} else if (item.type === "submenu") {
											setActiveMenu(item.id);
										} else {
											setSearchType(item.id);
											setActiveMenu("search");
											setSearchQuery(selection.text);
										}
									}}
									className="px-2 py-1.5 text-[10px] font-bold text-gray-300 hover:bg-primary-500/20 hover:text-white rounded transition-colors text-left flex items-center gap-1.5"
								>
									<div className="w-1 h-1 rounded-full bg-primary-500" />
									{item.label}
								</button>
							))}
						</div>
					) : activeMenu === "search" ? (
						<div className="p-1.5 flex flex-col gap-1.5 min-w-[220px]">
							<div className="flex items-center gap-1.5 border-b border-white/10 pb-1.5">
								<button
									type="button"
									onClick={() => setActiveMenu("main")}
									className="text-gray-400 hover:text-white text-xs"
								>
									←
								</button>
								<input
									autoFocus
									data-gramm="false"
									className="bg-transparent text-[10px] text-white outline-none w-full"
									placeholder={tUI("admin.markupEditor.search") || "Tìm kiếm..."}
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
								/>
							</div>
							<div className="flex flex-col gap-0.5 max-h-48 overflow-y-auto scrollbar-thin">
								{filteredEntities.map((e) => (
									<button
										key={e.id}
										type="button"
										onClick={() => insertMarkup(searchType, e.id, ["icon"])}
										className="text-[9px] p-2 text-left hover:bg-primary-500/20 rounded-md transition-all group flex flex-col"
									>
										<div className="font-bold text-gray-200 group-hover:text-white truncate">
											{e.name}
										</div>
										<div className="text-gray-500 text-[8px]">{e.id}</div>
									</button>
								))}
							</div>
						</div>
					) : (
						<div className="p-1.5 flex flex-col gap-1 min-w-[180px]">
							<div className="flex items-center gap-1.5 border-b border-white/10 pb-1.5 mb-1">
								<button
									type="button"
									onClick={() => setActiveMenu("main")}
									className="text-gray-400 hover:text-white text-xs"
								>
									←
								</button>
								<span className="text-[10px] font-black text-white/50 uppercase tracking-widest">
									{menuItems.find((m) => m.id === activeMenu)?.label}
								</span>
							</div>
							<div className="flex flex-col gap-0.5">
								{menuItems
									.find((m) => m.id === activeMenu)
									?.items.map((subItem) => (
										<button
											key={subItem.id}
											type="button"
											onClick={() => insertMarkup(subItem.id, null, subItem.options)}
											className="px-2 py-1.5 text-[10px] font-bold text-gray-300 hover:bg-primary-500/20 hover:text-white rounded transition-colors text-left flex items-center justify-between group"
										>
											<span>{subItem.label}</span>
											<span className="text-[8px] opacity-0 group-hover:opacity-100 transition-opacity text-primary-400">
												CHỌN
											</span>
										</button>
									))}
							</div>
						</div>
					)}
				</div>
			)}

			{/* KHỐI XEM TRƯỚC INLINE (PREVIEW VÀ RAW TEXT) */}
			{(showPreview || showRaw) && !splitView && (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 overflow-hidden">
					{showPreview && (
						<div className="p-3 bg-surface-bg border border-border rounded-xl shadow-sm">
							<div className="text-[9px] uppercase font-black text-emerald-500 mb-2 tracking-widest flex items-center gap-1.5">
								<Eye size={12} /> Xem trước kết quả render (Layout)
							</div>
							<div className="text-text-primary text-xs leading-relaxed min-h-[40px] whitespace-pre-wrap font-sans">
								{safeValue ? (
									<MarkupRenderer text={safeValue} />
								) : (
									<span className="text-text-secondary italic">Chưa có nội dung để hiển thị...</span>
								)}
							</div>
						</div>
					)}

					{showRaw && (
						<div className="p-3 bg-surface-hover/20 border border-border rounded-xl shadow-sm">
							<div className="text-[9px] uppercase font-black text-primary-500 mb-2 tracking-widest flex items-center gap-1.5">
								<Code size={12} /> Nội dung văn bản thô
							</div>
							<div className="text-text-secondary text-[10px] leading-relaxed min-h-[40px] font-mono break-all whitespace-pre-wrap opacity-75">
								{stripMarkup(safeValue) || "(Trống)"}
							</div>
						</div>
					)}
				</div>
			)}

			{/* MODAL MỞ RỘNG TOÀN MÀN HÌNH (EXPANDED FULLSCREEN WORKSPACE DIALOG) */}
			{isExpanded &&
				createPortal(
					<div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 md:p-6 animate-in fade-in duration-200">
						<div className="w-full max-w-6xl h-[92vh] bg-surface-bg border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
							{/* Header của Modal Mở Rộng */}
							<div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-surface-hover/40 select-none">
								<div className="flex items-center gap-3">
									<div className="p-2 rounded-xl bg-primary-500/10 text-primary-500 border border-primary-500/20">
										<Sparkles size={18} />
									</div>
									<div>
										<div className="flex items-center gap-2">
											<h3 className="text-sm sm:text-base font-bold text-text-primary">
												{label || "Soạn Thảo Nội Dung (Chế Độ Mở Rộng)"}
											</h3>
											<span className="text-[9px] uppercase font-black px-2 py-0.5 rounded-full bg-primary-500/15 text-primary-500 border border-primary-500/30 tracking-wider">
												Workspace Toàn Diện
											</span>
										</div>
										<p className="text-[11px] text-text-secondary">
											Không gian rộng rãi, đầy đủ công cụ Word-like, Live Preview song song và gợi ý thực thể LoR.
										</p>
									</div>
								</div>

								<div className="flex items-center gap-3">
									<span className="text-xs text-text-secondary font-mono hidden sm:inline-block bg-surface-bg px-2.5 py-1 rounded-lg border border-border/50">
										{safeValue.length} ký tự
									</span>

									<button
										type="button"
										onClick={() => setIsExpanded(false)}
										className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-500 text-white font-bold text-xs hover:bg-primary-600 shadow-sm transition-all"
										title="Hoàn tất và thu nhỏ về trang (Esc)"
									>
										<Check size={14} />
										<span>Hoàn tất & Thu nhỏ</span>
									</button>

									<button
										type="button"
										onClick={() => setIsExpanded(false)}
										className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors"
										title="Đóng (Esc)"
									>
										<X size={18} />
									</button>
								</div>
							</div>

							{/* Ribbon Toolbar trong Modal */}
							<div className="relative">
								{renderRibbonToolbar(true)}
								{renderQuickPicker()}
							</div>

							{/* Workspace soạn thảo trong Modal */}
							<div className="flex-1 min-h-0 p-3 sm:p-4 bg-input-bg flex flex-col overflow-hidden">
								{expandedSplitView ? (
									<div className="grid grid-cols-1 md:grid-cols-2 gap-3 h-full min-h-0">
										{/* Cột trái: Textarea soạn thảo */}
										<div className="h-full min-h-0 flex flex-col border border-input-border rounded-xl bg-surface-bg/40 focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500 overflow-hidden">
											<div className="text-[10px] uppercase font-black text-text-secondary px-3 py-1.5 bg-surface-hover/40 border-b border-border tracking-wider flex items-center justify-between">
												<span>Ô Nhập Liệu (Hỗ trợ @, Ctrl+B, Ctrl+I)</span>
												<span className="font-mono text-[9px] opacity-75">Markup Mode</span>
											</div>
											<textarea
												ref={(node) => {
													modalTextareaRef.current = node;
													if (isExpanded) refs.setReference(node);
												}}
												data-gramm="false"
												data-gramm_editor="false"
												data-enable-grammarly="false"
												value={safeValue}
												onChange={handleTextareaChange}
												onKeyDown={handleKeyDown}
												onMouseUp={handleSelect}
												onKeyUp={(e) => {
													if (e.key !== "ArrowUp" && e.key !== "ArrowDown" && e.key !== "Tab" && e.key !== "Escape") {
														handleSelect(e);
													}
												}}
												placeholder={placeholder}
												className="w-full flex-1 p-3.5 bg-transparent text-input-text text-sm focus:outline-none resize-none font-sans leading-relaxed scrollbar-thin overflow-y-auto"
											/>
										</div>

										{/* Cột phải: Live Render Preview */}
										<div className="h-full min-h-0 flex flex-col border border-border rounded-xl bg-surface-bg/80 overflow-hidden">
											<div className="text-[10px] uppercase font-black text-emerald-500 px-3 py-1.5 bg-surface-hover/40 border-b border-border tracking-wider flex items-center gap-1.5">
												<Eye size={12} />
												<span>Xem Trước Thời Gian Thực (Live Preview)</span>
											</div>
											<div className="flex-1 p-4 overflow-y-auto scrollbar-thin font-sans text-xs leading-relaxed text-text-primary whitespace-pre-wrap">
												{safeValue ? (
													<MarkupRenderer text={safeValue} />
												) : (
													<div className="h-full flex items-center justify-center text-text-secondary italic">
														Nội dung render sau khi gắn thẻ sẽ hiển thị trực tiếp ở đây...
													</div>
												)}
											</div>
										</div>
									</div>
								) : (
									<div className="h-full min-h-0 flex flex-col border border-input-border rounded-xl bg-surface-bg/40 focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500 overflow-hidden">
										<div className="text-[10px] uppercase font-black text-text-secondary px-3 py-1.5 bg-surface-hover/40 border-b border-border tracking-wider flex items-center justify-between">
											<span>Ô Nhập Liệu Toàn Màn Hình</span>
											<span className="font-mono text-[9px] opacity-75">Full Width</span>
										</div>
										<textarea
											ref={(node) => {
												modalTextareaRef.current = node;
												if (isExpanded) refs.setReference(node);
											}}
											data-gramm="false"
											data-gramm_editor="false"
											data-enable-grammarly="false"
											value={safeValue}
											onChange={handleTextareaChange}
											onKeyDown={handleKeyDown}
											onMouseUp={handleSelect}
											onKeyUp={(e) => {
												if (e.key !== "ArrowUp" && e.key !== "ArrowDown" && e.key !== "Tab" && e.key !== "Escape") {
													handleSelect(e);
												}
											}}
											placeholder={placeholder}
											className="w-full flex-1 p-4 bg-transparent text-input-text text-sm focus:outline-none resize-none font-sans leading-relaxed scrollbar-thin overflow-y-auto"
										/>
									</div>
								)}
							</div>

							{/* Footer của Modal Mở Rộng */}
							<div className="flex items-center justify-between px-5 py-2.5 border-t border-border bg-surface-hover/30 text-[11px] text-text-secondary select-none">
								<div className="flex items-center gap-4">
									<span><strong className="text-text-primary">Ctrl + B:</strong> In đậm</span>
									<span><strong className="text-text-primary">Ctrl + I:</strong> In nghiêng</span>
									<span><strong className="text-text-primary">@:</strong> Gợi ý thực thể</span>
									<span><strong className="text-text-primary">Esc:</strong> Thu nhỏ & Đóng</span>
								</div>
								<button
									type="button"
									onClick={() => setIsExpanded(false)}
									className="text-primary-500 hover:text-primary-600 font-bold flex items-center gap-1"
								>
									<Check size={13} />
									<span>Đã xong, quay lại form</span>
								</button>
							</div>
						</div>
					</div>,
					document.body
				)}
		</div>
	);
};

export default MarkupEditor;
