import React, { useState, useRef, useEffect, useMemo } from "react";
import {
	useFloating,
	autoUpdate,
	offset,
	shift,
	flip,
	inline,
} from "@floating-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { getAllEntities, initEntities } from "../../utils/entityLookup";
import MarkupRenderer from "../common/MarkupRenderer";
import { stripMarkup } from "../../utils/markupStripper";

/**
 * AdminMarkupEditor - Trình soạn thảo chuyên dụng cho Admin
 * Hỗ trợ bôi đen -> Gán thẻ Markup nhanh chóng.
 */
const MarkupEditor = ({ value, onChange, placeholder = "Nhập nội dung..." }) => {
	const textareaRef = useRef(null);
	const [showToolbar, setShowToolbar] = useState(false);
	const [selection, setSelection] = useState({ start: 0, end: 0, text: "" });
	const [activeMenu, setActiveMenu] = useState("main"); // main | search
	const [searchType, setSearchType] = useState("");
	const [searchQuery, setSearchQuery] = useState("");

	useEffect(() => {
		initEntities();
	}, []);

	const { refs, floatingStyles, context } = useFloating({
		open: showToolbar,
		onOpenChange: setShowToolbar,
		placement: "top",
		middleware: [inline(), offset(10), flip(), shift({ padding: 10 })],
		whileElementsMounted: autoUpdate,
	});

	// Xử lý sự kiện bôi đen
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

	// Chèn thẻ Markup vào vị trí bôi đen
	const insertMarkup = (type, id = null, options = []) => {
		const label = selection.text;
		const optStr = options.length > 0 ? `|${options.join(",")}` : "";
		
		// Logic thông minh: Nếu có options mà không có id, phải dùng cú pháp đầy đủ [type:val|label|opt]
		// để parser không nhầm nhãn thành id.
		let tag = "";
		if (id) {
			tag = `[${type}:${id}|${label}${optStr}]`;
		} else {
			if (options.length > 0) {
				tag = `[${type}:${label}|${label}${optStr}]`;
			} else {
				tag = `[${type}:${label}]`;
			}
		}

		const newValue = 
			value.substring(0, selection.start) + 
			tag + 
			value.substring(selection.end);
		
		onChange({ markup: newValue, raw: stripMarkup(newValue) });
		setShowToolbar(false);
		
		// Focus lại và đặt con trỏ sau thẻ vừa chèn
		setTimeout(() => {
			if (textareaRef.current) {
				textareaRef.current.focus();
				const newPos = selection.start + tag.length;
				textareaRef.current.setSelectionRange(newPos, newPos);
			}
		}, 0);
	};

	const removeMarkup = () => {
		let start = selection.start;
		let end = selection.end;
		let textToStrip = selection.text;

		// Thông minh: Tìm tag bao quanh nếu chỉ bôi đen 1 phần
		const before = value.substring(0, start);
		const after = value.substring(end);
		const lastOpen = before.lastIndexOf('[');
		const firstClose = after.indexOf(']');

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
		
		setTimeout(() => {
			if (textareaRef.current) {
				textareaRef.current.focus();
				textareaRef.current.setSelectionRange(start, start + stripped.length);
			}
		}, 0);
	};

	const filteredEntities = useMemo(() => {
		if (!searchType || activeMenu !== "search") return [];
		const all = getAllEntities(searchType);
		return all.filter(e => 
			e.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
			e.id?.toLowerCase().includes(searchQuery.toLowerCase())
		).slice(0, 5); // Chỉ lấy 5 kết quả đầu tiên
	}, [searchType, searchQuery, activeMenu]);

	const menuItems = [
		{ id: "k", label: "Từ khóa", type: "submenu", items: [
			{ id: "k", label: "Chỉ chữ" },
			{ id: "k_icon", label: "Chữ + Icon" },
		]},
		{ id: "c", label: "Tướng", type: "search" },
		{ id: "r", label: "Cổ vật", type: "search" },
		{ id: "p", label: "Sức mạnh", type: "search" },
		{ id: "cd", label: "Lá bài", type: "search" },
		{ id: "cap", label: "Cấp sao", type: "direct" },
		{ id: "v", label: "Chỉ số", type: "submenu", items: [
			{ id: "attack", label: "Công (Attack)" },
			{ id: "health", label: "Thủ (Health)" },
			{ id: "mana", label: "Năng lượng" },
			{ id: "cost", label: "Tiêu hao" },
		]},
		{ id: "unmarkup", label: "Gỡ Markup", type: "action" },
	];

	return (
		<div className="flex flex-col gap-6 w-full">
			{/* Row 1: Markup Input */}
			<div className="flex flex-col gap-1.5">
				<label className="text-[11px] uppercase font-bold text-gray-400 ml-1 tracking-widest">
					Ô mô tả (Markup)
				</label>
				<div className="relative w-full">
					<textarea
						ref={(node) => {
							textareaRef.current = node;
							refs.setReference(node);
						}}
						value={value}
						onChange={(e) => {
							const newValue = e.target.value;
							onChange({ markup: newValue, raw: stripMarkup(newValue) });
						}}
						onMouseUp={handleSelect}
						onKeyUp={handleSelect}
						placeholder={placeholder}
						className="w-full min-h-[180px] p-4 bg-white border border-gray-300 rounded-xl text-gray-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all resize-y font-sans leading-relaxed shadow-sm"
					/>

					{/* Floating Toolbar */}
					<AnimatePresence>
						{showToolbar && (
							<motion.div
								ref={refs.setFloating}
								style={floatingStyles}
								initial={{ opacity: 0, y: 5, scale: 0.95 }}
								animate={{ opacity: 1, y: 0, scale: 1 }}
								exit={{ opacity: 0, scale: 0.95 }}
								className="z-[9999] bg-gray-800 border border-white/10 shadow-2xl rounded-lg overflow-hidden flex flex-col min-w-[200px] backdrop-blur-xl"
							>
								{activeMenu === "main" ? (
									<div className="grid grid-cols-2 p-1 gap-1">
										{menuItems.map(item => (
											<button
												key={item.id}
												type="button"
												onClick={() => {
													if (item.type === "direct") {
														insertMarkup(item.id);
													} else if (item.type === "action") {
														if (item.id === "unmarkup") removeMarkup();
													} else if (item.type === "submenu") {
														setActiveMenu(item.id);
													} else {
														setSearchType(item.id);
														setActiveMenu("search");
														setSearchQuery(selection.text);
													}
												}}
												className="px-3 py-2 text-xs font-medium text-gray-300 hover:bg-white/10 hover:text-white rounded transition-colors text-left flex items-center gap-2"
											>
												<span className="w-1 h-1 rounded-full bg-primary-500" />
												{item.label}
												{item.type === "submenu" && <span className="ml-auto opacity-40">›</span>}
											</button>
										))}
									</div>
								) : activeMenu === "v" ? (
									<div className="p-2 flex flex-col gap-1 min-w-[150px]">
										<div className="flex items-center gap-2 border-b border-white/10 pb-2 mb-1">
											<button type="button" onClick={() => setActiveMenu("main")} className="text-gray-400 hover:text-white px-1">←</button>
											<span className="text-[10px] text-gray-400 uppercase font-bold">Chọn Chỉ Số</span>
										</div>
										{menuItems.find(m => m.id === "v").items.map(sub => (
											<button
												key={sub.id}
												type="button"
												onClick={() => insertMarkup("v", sub.id)}
												className="px-3 py-2 text-xs text-gray-300 hover:bg-primary-500/20 hover:text-white rounded transition-colors text-left"
											>
												{sub.label}
											</button>
										))}
									</div>
								) : activeMenu === "k" ? (
									<div className="p-2 flex flex-col gap-1 min-w-[150px]">
										<div className="flex items-center gap-2 border-b border-white/10 pb-2 mb-1">
											<button type="button" onClick={() => setActiveMenu("main")} className="text-gray-400 hover:text-white px-1">←</button>
											<span className="text-[10px] text-gray-400 uppercase font-bold">Kiểu hiển thị</span>
										</div>
										<button
											type="button"
											onClick={() => insertMarkup("k")}
											className="px-3 py-2 text-xs text-gray-300 hover:bg-primary-500/20 hover:text-white rounded transition-colors text-left"
										>
											Chỉ chữ
										</button>
										<button
											type="button"
											onClick={() => insertMarkup("k", null, ["icon"])}
											className="px-3 py-2 text-xs text-gray-300 hover:bg-primary-500/20 hover:text-white rounded transition-colors text-left"
										>
											Chữ + Icon
										</button>
									</div>
								) : (
									<div className="p-2 flex flex-col gap-2">
										<div className="flex items-center gap-2 border-b border-white/10 pb-2 mb-1">
											<button type="button" onClick={() => setActiveMenu("main")} className="text-gray-400 hover:text-white px-1">←</button>
											<input 
												autoFocus
												className="bg-transparent text-xs text-white outline-none w-full"
												placeholder="Tìm ID hoặc Tên..."
												value={searchQuery}
												onChange={e => setSearchQuery(e.target.value)}
											/>
										</div>
										<div className="flex flex-col gap-1">
											{filteredEntities.map(e => (
												<button
													key={e.id}
													type="button"
													onClick={() => insertMarkup(searchType, e.id, ["icon", "img-full"])}
													className="text-[10px] p-2 text-left hover:bg-primary-500/20 rounded border border-transparent hover:border-primary-500/30 transition-all group"
												>
													<div className="font-bold text-gray-200 group-hover:text-white">{e.name}</div>
													<div className="text-gray-500 text-[9px]">{e.id}</div>
												</button>
											))}
										</div>
									</div>
								)}
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</div>

			{/* Row 2: Previews */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
					<div className="text-[10px] uppercase font-bold text-gray-400 mb-2 tracking-widest flex items-center gap-2">
						<span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
						Ô preview
					</div>
					<div className="text-gray-800 text-sm leading-relaxed min-h-[50px] whitespace-pre-wrap">
						<MarkupRenderer text={value} />
					</div>
				</div>

				<div className="p-4 bg-gray-50/50 border border-gray-200 rounded-xl shadow-sm">
					<div className="text-[10px] uppercase font-bold text-gray-400 mb-2 tracking-widest flex items-center gap-2">
						<span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
						Ô mô tả thô
					</div>
					<div className="text-gray-500 text-[11px] leading-relaxed min-h-[50px] font-mono break-all whitespace-pre-wrap">
						{stripMarkup(value)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default MarkupEditor;
