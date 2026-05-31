import React, { useState, useRef, useEffect, useMemo } from "react";
import axios from "axios";
import { preloadAllEntities } from "@/utils/entityLookup";
import {
	useFloating,
	autoUpdate,
	offset,
	shift,
	flip,
	inline,
} from "@floating-ui/react";

import { getAllEntities, initEntities } from "@/utils/entityLookup";
import MarkupRenderer from "@/components/common/MarkupRenderer";
import { stripMarkup } from "@/utils/markupUtils";
import { Eye, Code, Type, Bold, Highlighter, Search, XCircle, ChevronDown, ChevronUp, Swords, Shield, Zap } from "lucide-react";

/**
 * AdminMarkupEditor - Trình soạn thảo chuyên dụng cho Admin
 * Hỗ trợ bôi đen -> Gán thẻ Markup nhanh chóng.
 */
const MarkupEditor = ({ value, onChange, placeholder = "Nhập nội dung..." }) => {
	const textareaRef = useRef(null);
	const [showToolbar, setShowToolbar] = useState(false);
	const [selection, setSelection] = useState({ start: 0, end: 0, text: "" });
	const [activeMenu, setActiveMenu] = useState("main"); // main | search | submenu_id
	const [searchType, setSearchType] = useState("");
	const [searchQuery, setSearchQuery] = useState("");

    // Autocomplete states
	const [autoSuggestions, setAutoSuggestions] = useState([]);
	const [autoQuery, setAutoQuery] = useState("");
	const [autoIndex, setAutoIndex] = useState(0);
	const [autoActive, setAutoActive] = useState(false);
	const [cursorWordStart, setCursorWordStart] = useState(0);
    
    // Visibility Toggles
    const [showPreview, setShowPreview] = useState(false);
    const [showRaw, setShowRaw] = useState(false);

	useEffect(() => {
        preloadAllEntities();
	}, []);

	const { refs, floatingStyles, context } = useFloating({
		open: showToolbar,
		onOpenChange: setShowToolbar,
		placement: "top",
		middleware: [inline(), offset(10), flip(), shift({ padding: 10 })],
		whileElementsMounted: autoUpdate,
	});

	const handleSelect = () => {
		const el = textareaRef.current;
		if (!el) return;
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

	const insertMarkup = (type, id = null, options = []) => {
		const rawText = selection.text;
		const leadingSpace = rawText.match(/^\s*/)[0];
		const trailingSpace = rawText.match(/\s*$/)[0];
		const label = rawText.trim();

		const optStr = options.length > 0 ? `|${options.join(",")}` : "";
		
		let tagContent = "";
        const [mainType, subValue] = type.split(":");

		if (id) {
			tagContent = `[${mainType}:${id}|${label}${optStr}]`;
		} else if (subValue) {
            tagContent = `[${mainType}:${subValue}|${label}${optStr}]`;
        } else {
			tagContent = options.length > 0 ? `[${type}:${label}|${label}${optStr}]` : `[${type}:${label}]`;
		}

		const fullInsertion = `${leadingSpace}${tagContent}${trailingSpace}`;
		const newValue = value.substring(0, selection.start) + fullInsertion + value.substring(selection.end);
		
		onChange({ markup: newValue, raw: stripMarkup(newValue) });
		setShowToolbar(false);
		
		setTimeout(() => {
			if (textareaRef.current) {
				textareaRef.current.focus();
				const newPos = selection.start + fullInsertion.length;
				textareaRef.current.setSelectionRange(newPos, newPos);
			}
		}, 0);
	};

    const wrapWithTag = (open, close) => {
        const rawText = selection.text;
        const leadingSpace = rawText.match(/^\s*/)[0];
        const trailingSpace = rawText.match(/\s*$/)[0];
        const text = rawText.trim();

        const tag = `${leadingSpace}${open}${text}${close}${trailingSpace}`;
        const newValue = value.substring(0, selection.start) + tag + value.substring(selection.end);
        onChange({ markup: newValue, raw: stripMarkup(newValue) });
        setShowToolbar(false);
    };

	const removeMarkup = () => {
		let start = selection.start;
		let end = selection.end;
		let textToStrip = selection.text;
		const before = value.substring(0, start);
		const after = value.substring(end);
		const lastOpen = before.lastIndexOf("[");
		const firstClose = after.indexOf("]");

		if (lastOpen !== -1 && firstClose !== -1) {
			const potentialTag = before.substring(lastOpen) + textToStrip + after.substring(0, firstClose + 1);
			if (/^\[[a-z]+:[^\]]+\]$/i.test(potentialTag)) {
				start = lastOpen;
				end = end + firstClose + 1;
				textToStrip = potentialTag;
			}
		}

		const stripped = stripMarkup(textToStrip);
		const newValue = value.substring(0, start) + stripped + value.substring(end);
		onChange({ markup: newValue, raw: stripMarkup(newValue) });
		setShowToolbar(false);
	};

	const filteredEntities = useMemo(() => {
		if (!searchType || activeMenu !== "search") return [];
		const all = getAllEntities(searchType);
		const q = searchQuery.trim().toLowerCase();
		if (!q) return all.slice(0, 5);

		return all.filter(e => 
			e.name.toLowerCase().includes(q) || 
			(e.nameEn && e.nameEn.toLowerCase().includes(q)) ||
			e.id?.toLowerCase().includes(q)
		).slice(0, 5);
	}, [searchType, searchQuery, activeMenu]);

	const removeAccents = (str) => {
		if (!str) return "";
		return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
	};

	const getCombinedEntities = () => {
		return [
			...getAllEntities("c").map(e => ({...e, type: "c", typeName: "Tướng"})),
			...getAllEntities("r").map(e => ({...e, type: "r", typeName: "Cổ vật"})),
			...getAllEntities("p").map(e => ({...e, type: "p", typeName: "Sức mạnh"})),
			...getAllEntities("i").map(e => ({...e, type: "i", typeName: "Vật phẩm"})),
			...getAllEntities("k").map(e => ({...e, type: "k", typeName: "Từ khóa"})),
			...getAllEntities("cd").map(e => ({...e, type: "cd", typeName: "Thẻ bài"})),
		];
	};

	const applyAutocomplete = (index = autoIndex, asMarkup = true) => {
		const selected = autoSuggestions[index];
		if (!selected) return;

		const cursorPos = textareaRef.current.selectionStart;
		// The string to replace starts exactly before the '@' trigger
		const replaceStart = cursorPos - (autoQuery.length + 1); 
		
		const finalBefore = value.substring(0, Math.max(0, replaceStart));
		const after = value.substring(cursorPos);

		const tag = asMarkup ? `[${selected.type}:${selected.id}|${selected.name}]` : selected.name;
		const newValue = finalBefore + tag + after;

		onChange({ markup: newValue, raw: stripMarkup(newValue) });
		setAutoActive(false);

		setTimeout(() => {
			if (textareaRef.current) {
				textareaRef.current.focus();
				const newPos = finalBefore.length + tag.length;
				textareaRef.current.setSelectionRange(newPos, newPos);
			}
		}, 0);
	};

	const handleKeyDown = (e) => {
		if (autoActive && autoSuggestions.length > 0) {
			if (e.key === "ArrowDown") {
				e.preventDefault();
				setAutoIndex(prev => (prev + 1) % autoSuggestions.length);
			} else if (e.key === "ArrowUp") {
				e.preventDefault();
				setAutoIndex(prev => (prev - 1 + autoSuggestions.length) % autoSuggestions.length);
			} else if (e.key === "Tab") {
				e.preventDefault();
				applyAutocomplete(autoIndex, true); // Complete as Markup
			} else if (e.key === "Enter") {
				e.preventDefault();
				applyAutocomplete(autoIndex, false); // Complete as plain text
			} else if (e.key === "Escape") {
				setAutoActive(false);
			}
		}
	};

	const menuItems = [
		{ id: "k", label: "Từ khóa", type: "search" },
		{ id: "v", label: "Chỉ số", type: "submenu", items: [
            { id: "v:cong", label: "Công (ATK)" },
            { id: "v:thu", label: "Thủ (HP)" },
            { id: "v:tieuhao", label: "Tiêu hao (Cost)" },
            { id: "v:nangluong", label: "Năng lượng" },
            { id: "v:damage", label: "Sát thương" },
            { id: "v:gold", label: "Vàng (Gold)" },
        ]},
        { id: "cap", label: "Cấp sao", type: "submenu", items: [
            { id: "cap:1", label: "1 Sao" },
            { id: "cap:2", label: "2 Sao" },
            { id: "cap:3", label: "3 Sao" },
            { id: "cap:4", label: "4 Sao" },
            { id: "cap:5", label: "5 Sao" },
            { id: "cap:6", label: "6 Sao" },
        ]},
        { id: "ra", label: "Độ hiếm", type: "submenu", items: [
            { id: "ra:common", label: "Thường (Common)" },
            { id: "ra:rare", label: "Hiếm (Rare)" },
            { id: "ra:epic", label: "Sử thi (Epic)" },
            { id: "ra:legendary", label: "Huyền thoại" },
            { id: "ra:special", label: "Đặc biệt" },
        ]},
		{ id: "c", label: "Tướng", type: "search" },
		{ id: "r", label: "Cổ vật", type: "search" },
		{ id: "p", label: "Sức mạnh", type: "search" },
		{ id: "i", label: "Vật phẩm", type: "search" },
		{ id: "cd", label: "Thẻ bài", type: "search" },
		{ id: "unmarkup", label: "Gỡ Markup", type: "action" },
	];

    const handleQuickTag = (prefix) => {
        const label = selection.text;
        if (!label) return;
        const tag = `[${prefix}:${label}]`;
        const newValue = value.substring(0, selection.start) + tag + value.substring(selection.end);
        onChange({ markup: newValue, raw: stripMarkup(newValue) });
        setShowToolbar(false);
    };

	return (
		<div className="flex flex-col gap-3 w-full animate-fadeIn focus-within:z-50 relative">
			{/* Toolbar phía trên input */}
			<div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1">
                    {/* Đã loại bỏ các nút Quick Markup theo yêu cầu */}
                </div>
                
                <div className="flex items-center gap-2">
                    <button 
                        type="button"
                        onClick={() => setShowPreview(!showPreview)}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-tight transition-all ${showPreview ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-surface-hover/50 text-text-tertiary border border-border/50"}`}
                        title="Ẩn/Hiện ô xem trước nội dung sau khi render"
                    >
                        <Eye size={12} /> {showPreview ? "Ẩn" : "Hiện"} Layout
                    </button>
                    <button 
                        type="button"
                        onClick={() => setShowRaw(!showRaw)}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-tight transition-all ${showRaw ? "bg-primary-500/10 text-primary-600 border border-border/50" : "bg-surface-hover/50 text-text-tertiary border border-border/50"}`}
                        title="Ẩn/Hiện nội dung thô (không có markup)"
                    >
                        <Code size={12} /> {showRaw ? "Hiện" : "Ẩn"} Thô
                    </button>
                </div>
            </div>

			<div className="relative w-full">
				<textarea
					ref={(node) => {
						textareaRef.current = node;
						refs.setReference(node);
					}}
					data-gramm="false"
					data-gramm_editor="false"
					data-enable-grammarly="false"
					value={value}
					onChange={(e) => {
						const newValue = e.target.value;
						onChange({ markup: newValue, raw: stripMarkup(newValue) });

						const cursorPos = e.target.selectionStart;
						const textBeforeCursor = newValue.substring(0, cursorPos);
						
						// Chỉ bắt đầu gợi ý khi gõ ký tự @
						const triggerMatch = textBeforeCursor.match(/@([^@\[\]\|\n,\.]{0,40})$/);
						
						if (triggerMatch) {
							const query = triggerMatch[1].trimStart(); // Cho phép gõ "@ yasuo" hoặc "@yasuo"
							
							if (!textBeforeCursor.endsWith("  ")) {
								const combined = getCombinedEntities();
								const q = removeAccents(query);
								
								const filtered = combined.filter(e => {
									if (!q) return true; // Nếu chỉ gõ @ thì hiện tất cả (cắt 8 cái đầu)
									const nameNorm = removeAccents(e.name);
									const nameEnNorm = removeAccents(e.nameEn);
									return nameNorm.includes(q) || nameEnNorm.includes(q);
								}).sort((a, b) => {
									if (!q) return 0;
									const aNameNorm = removeAccents(a.name);
									const bNameNorm = removeAccents(b.name);
									const aStarts = aNameNorm.startsWith(q) || removeAccents(a.nameEn).startsWith(q);
									const bStarts = bNameNorm.startsWith(q) || removeAccents(b.nameEn).startsWith(q);
									if (aStarts && !bStarts) return -1;
									if (!aStarts && bStarts) return 1;
									return 0;
								}).slice(0, 8);
								
								if (filtered.length > 0) {
									setAutoSuggestions(filtered);
									setAutoQuery(triggerMatch[1]); // Giữ lại nguyên gốc để tính độ dài thay thế
									setAutoActive(true);
									setAutoIndex(0);
									return;
								}
							}
						}
						setAutoActive(false);
					}}
					onKeyDown={handleKeyDown}
					onMouseUp={handleSelect}
					onKeyUp={(e) => {
						if (e.key !== "ArrowUp" && e.key !== "ArrowDown" && e.key !== "Tab" && e.key !== "Escape") {
							handleSelect(e);
						}
					}}
					placeholder={placeholder}
					className="w-full min-h-[140px] p-3 bg-input-bg border border-input-border rounded-xl text-input-text text-sm focus:border-input-focus-border focus:ring-1 focus:ring-primary-500 outline-none transition-all resize-y font-sans leading-relaxed shadow-inner scrollbar-thin overflow-y-auto"
				/>

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
									className={`px-2 py-1.5 text-xs rounded text-left transition-colors flex justify-between items-center ${idx === autoIndex ? "bg-primary-500/30 text-white" : "text-gray-300 hover:bg-white/5"}`}
								>
									<span className="font-bold truncate mr-2">{item.name}</span>
									<span className="text-[9px] opacity-70 whitespace-nowrap bg-black/20 px-1.5 py-0.5 rounded">[{item.typeName}]</span>
								</button>
							))}
						</div>
					</div>
				)}

				
					{showToolbar && (
						<div
							ref={refs.setFloating}
							style={floatingStyles}
							className="z-[999] bg-gray-900 border border-white/10 shadow-2xl rounded-lg overflow-hidden flex flex-col min-w-[200px] backdrop-blur-xl"
						>
							{activeMenu === "main" ? (
								<div className="grid grid-cols-2 p-1 gap-1">
									{menuItems.map(item => (
										<button
											key={item.id}
											type="button"
											onClick={() => {
												if (item.type === "action") {
													if (item.id === "unmarkup") removeMarkup();
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
										<button type="button" onClick={() => setActiveMenu("main")} className="text-gray-400 hover:text-white text-xs">←</button>
										<input 
											autoFocus
											data-gramm="false"
											className="bg-transparent text-[10px] text-white outline-none w-full"
											placeholder="Tìm..."
											value={searchQuery}
											onChange={e => setSearchQuery(e.target.value)}
										/>
									</div>
									<div className="flex flex-col gap-0.5 max-h-48 overflow-y-auto-scrollbar">
										{filteredEntities.map(e => (
											<button
                                                key={e.id}
                                                type="button"
                                                onClick={() => insertMarkup(searchType, e.id, ["icon"])}
                                                className="text-[9px] p-2 text-left hover:bg-primary-500/20 rounded-md transition-all group flex flex-col"
                                            >
                                                <div className="font-bold text-gray-200 group-hover:text-white truncate">{e.name}</div>
                                                <div className="text-gray-500 text-[8px]">{e.id}</div>
                                            </button>
										))}
									</div>
								</div>
							) : (
                                // Render SUBMENU items
                                <div className="p-1.5 flex flex-col gap-1 min-w-[180px]">
                                    <div className="flex items-center gap-1.5 border-b border-white/10 pb-1.5 mb-1">
                                        <button type="button" onClick={() => setActiveMenu("main")} className="text-gray-400 hover:text-white text-xs">←</button>
                                        <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">
                                            {menuItems.find(m => m.id === activeMenu)?.label}
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        {menuItems.find(m => m.id === activeMenu)?.items.map(subItem => (
                                            <button
                                                key={subItem.id}
                                                type="button"
                                                onClick={() => insertMarkup(subItem.id, null, subItem.options)}
                                                className="px-2 py-1.5 text-[10px] font-bold text-gray-300 hover:bg-primary-500/20 hover:text-white rounded transition-colors text-left flex items-center justify-between group"
                                            >
                                                <span>{subItem.label}</span>
                                                <span className="text-[8px] opacity-0 group-hover:opacity-100 transition-opacity text-primary-400">SELECT</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
						</div>
					)}
				
			</div>

			{/* Row Previews - Toggleable */}
            
                {(showPreview || showRaw) && (
                    <div 
                        className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-hidden"
                    >
                        {showPreview && (
                            <div className="p-3 bg-surface-bg border border-border rounded-xl shadow-sm">
                                <div className="text-[9px] uppercase font-black text-emerald-600 mb-2 tracking-widest flex items-center gap-2">
                                    <Eye size={12} /> Ô preview
                                </div>
                                <div className="text-text-primary text-xs leading-relaxed min-h-[40px] whitespace-pre-wrap font-sans">
                                    <MarkupRenderer text={value} />
                                </div>
                            </div>
                        )}

                        {showRaw && (
                            <div className="p-3 bg-surface-hover/20 border border-border rounded-xl shadow-sm">
                                <div className="text-[9px] uppercase font-black text-primary-600 mb-2 tracking-widest flex items-center gap-2">
                                    <Code size={12} /> Ô mô tả thô
                                </div>
                                <div className="text-text-secondary text-[10px] leading-relaxed min-h-[40px] font-mono break-all whitespace-pre-wrap opacity-60">
                                    {stripMarkup(value)}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            
		</div>
	);
};

export default MarkupEditor;
