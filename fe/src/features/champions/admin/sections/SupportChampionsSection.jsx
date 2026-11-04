import { memo, useState, useMemo, useCallback, useRef } from "react";
import { Users, Trash2, ArrowUp, ArrowDown, CreditCard, Layers, Plus } from "lucide-react";
import Swal from "sweetalert2";

const SupportChampionsSection = memo(({ formData, setFormData, cachedData, tUI }) => {
	const [isDragOver, setIsDragOver] = useState(false);
	const lastDropRef = useRef({ code: "", time: 0 });

	const availableSubChampions = useMemo(() => cachedData?.subChampions || [], [cachedData?.subChampions]);
	const availableCards = useMemo(() => cachedData?.cards || [], [cachedData?.cards]);
	const availableChampions = useMemo(() => cachedData?.champions || [], [cachedData?.champions]);

	// Fast lookup maps
	const subMap = useMemo(() => {
		const map = new Map();
		availableSubChampions.forEach(s => {
			if (s.cardCode) map.set(s.cardCode.toUpperCase(), s);
			if (s.name) map.set(s.name.toLowerCase(), s);
		});
		return map;
	}, [availableSubChampions]);

	const cardMap = useMemo(() => {
		const map = new Map();
		availableCards.forEach(c => {
			if (c.cardCode) map.set(c.cardCode.toUpperCase(), c);
			const name = c.name || c.cardName;
			if (name) map.set(name.toLowerCase(), c);
		});
		return map;
	}, [availableCards]);

	const champMap = useMemo(() => {
		const map = new Map();
		availableChampions.forEach(c => {
			if (c.championID) map.set(c.championID.toUpperCase(), c);
			if (c.cardCode) map.set(c.cardCode.toUpperCase(), c);
			if (c.name) map.set(c.name.toLowerCase(), c);
		});
		return map;
	}, [availableChampions]);

	const currentList = useMemo(() => formData.supportChampions || [], [formData.supportChampions]);

	// Helper to resolve entity display (subChampion package, card, or champion)
	const getEntityInfo = useCallback((codeRaw) => {
		const cardCode = typeof codeRaw === "string" ? codeRaw : codeRaw?.cardCode;
		if (!cardCode) return { name: "", imageUrl: "", packageName: "", cards: [] };

		const upper = cardCode.toUpperCase();
		const lower = cardCode.toLowerCase();

		// 1. Check in subChampions
		const sub = subMap.get(upper) || subMap.get(lower);
		if (sub) {
			return {
				name: sub.name,
				packageName: sub.packageName,
				imageUrl: sub.fullAbsolutePath || sub.cards?.[0]?.image || "",
				cards: sub.cards || [],
			};
		}

		// 2. Check in cards
		const card = cardMap.get(upper) || cardMap.get(lower);
		if (card) {
			return {
				name: card.name || card.cardName || cardCode,
				packageName: card.rarity || card.type || "",
				imageUrl: card.gameAbsolutePath || card.assetAbsolutePath || card.image || "",
				cards: [],
			};
		}

		// 3. Check in champions
		const champ = champMap.get(upper) || champMap.get(lower);
		if (champ) {
			return {
				name: champ.name || cardCode,
				packageName: (champ.regions || []).join(", "),
				imageUrl: champ.assets?.[0]?.avatar || champ.assets?.[0]?.fullAbsolutePath || "",
				cards: [],
			};
		}

		return {
			name: typeof codeRaw === "object" ? codeRaw?.name || cardCode : cardCode,
			packageName: "",
			imageUrl: "",
			cards: [],
		};
	}, [subMap, cardMap, champMap]);

	// Add item by card code
	const addCard = useCallback((rawInput) => {
		if (!rawInput) return;

		let targetId = String(rawInput).trim();
		let targetName = "";

		try {
			const parsed = JSON.parse(rawInput);
			if (parsed && typeof parsed === "object") {
				targetId = parsed.id || parsed.cardCode || parsed.code || targetId;
				targetName = parsed.name || parsed.cardName || "";
			}
		} catch (e) {}

		const upper = targetId.toUpperCase();
		const lower = targetId.toLowerCase();

		const subMatch = subMap.get(upper) || subMap.get(lower) || (targetName && subMap.get(targetName.toLowerCase()));
		const cardMatch = cardMap.get(upper) || cardMap.get(lower) || (targetName && cardMap.get(targetName.toLowerCase()));
		const champMatch = champMap.get(upper) || champMap.get(lower) || (targetName && champMap.get(targetName.toLowerCase()));

		const finalCode = subMatch?.cardCode || cardMatch?.cardCode || champMatch?.cardCode || champMatch?.championID || targetId;
		const finalName = subMatch?.name || cardMatch?.name || cardMatch?.cardName || champMatch?.name || targetName || finalCode;

		// Chống trùng lặp drop liên tiếp trong 600ms
		const now = Date.now();
		if (lastDropRef.current.code.toUpperCase() === finalCode.toUpperCase() && (now - lastDropRef.current.time) < 600) {
			return;
		}
		lastDropRef.current = { code: finalCode, time: now };

		let isDuplicate = false;
		setFormData(prev => {
			const list = prev.supportChampions || [];
			const alreadyExists = list.some(item => {
				const code = typeof item === "string" ? item : item.cardCode;
				return code?.toUpperCase() === finalCode.toUpperCase();
			});

			if (alreadyExists) {
				isDuplicate = true;
				return prev;
			}

			return {
				...prev,
				supportChampions: [...list, { cardCode: finalCode, name: finalName }],
			};
		});

		if (isDuplicate) {
			Swal.fire({
				toast: true,
				position: "top-end",
				icon: "info",
				title: `Lá bài "${finalName}" đã có trong danh sách!`,
				timer: 2000,
				showConfirmButton: false,
			});
			return;
		}

		Swal.fire({
			toast: true,
			position: "top-end",
			icon: "success",
			title: `Đã thêm gói: ${finalName}`,
			timer: 1600,
			showConfirmButton: false,
		});
	}, [subMap, cardMap, champMap, setFormData]);

	// DRAG & DROP
	const handleDragOver = useCallback((e) => {
		e.preventDefault();
		e.stopPropagation();
		e.dataTransfer.dropEffect = "copy";
		if (!isDragOver) setIsDragOver(true);
	}, [isDragOver]);

	const handleDragLeave = useCallback((e) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.currentTarget.contains(e.relatedTarget)) return;
		setIsDragOver(false);
	}, []);

	const handleDrop = useCallback((e) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragOver(false);
		const droppedData = e.dataTransfer.getData("text/plain");
		if (droppedData) {
			addCard(droppedData);
		}
	}, [addCard]);

	const handleRemove = (index) => {
		setFormData(prev => {
			const updated = [...(prev.supportChampions || [])];
			updated.splice(index, 1);
			return {
				...prev,
				supportChampions: updated,
			};
		});
	};

	const handleMove = (index, direction) => {
		setFormData(prev => {
			const updated = [...(prev.supportChampions || [])];
			const targetIndex = index + direction;
			if (targetIndex < 0 || targetIndex >= updated.length) return prev;
			const temp = updated[index];
			updated[index] = updated[targetIndex];
			updated[targetIndex] = temp;
			return {
				...prev,
				supportChampions: updated,
			};
		});
	};

	return (
		<section className="bg-surface-bg border border-border rounded-xl p-6 shadow-sm space-y-5">
			{/* Section Header */}
			<div className='flex items-center justify-between gap-3 border-l-4 border-amber-500 pl-3'>
				<div>
					<h3 className='text-lg font-bold uppercase flex items-center gap-2 text-text-primary'>
						<Users size={20} className='text-amber-500' />
						{tUI("admin.championForm.supportChampionsTitle") || "TƯỚNG PHỤ KHUYÊN DÙNG"}
					</h3>
					<p className='text-xs text-text-secondary mt-0.5'>
						Kéo thả lá bài từ thanh danh sách bên phải vào để thêm gói tướng phụ.
					</p>
				</div>
				<div className='text-xs font-mono px-2.5 py-1 bg-surface-hover rounded-md border border-border text-text-secondary'>
					{currentList.length} gói
				</div>
			</div>

			{/* VÙNG KÉO THẢ GỌN GÀNG (DROP ZONE) */}
			<div
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
				className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed transition-all duration-200 cursor-copy ${
					isDragOver
						? "border-amber-400 bg-amber-500/20 shadow-md scale-[1.01]"
						: "border-border hover:border-amber-500/60 bg-surface-hover/30 hover:bg-surface-hover/50"
				}`}
			>
				<div className='flex items-center gap-3 pointer-events-none'>
					<div
						className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
							isDragOver
								? "bg-amber-500 text-black scale-110"
								: "bg-amber-500/15 text-amber-400 border border-amber-500/30"
						}`}
					>
						<Plus size={22} className={isDragOver ? "animate-spin" : ""} />
					</div>
					<div>
						<h4 className='text-sm font-bold text-text-primary uppercase tracking-wide'>
							{isDragOver
								? "THẢ LÁ BÀI VÀO ĐÂY ĐỂ THÊM PACK TƯỚNG PHỤ!"
								: "KÉO THẢ LÁ BÀI TỪ DANH SÁCH BÊN PHẢI VÀO ĐÂY"}
						</h4>
						<p className='text-xs text-text-secondary mt-0.5'>
							Kéo lá bài từ tab <strong className='text-amber-400'>Lá Bài</strong>, <strong className='text-amber-400'>Tướng Phụ</strong> hoặc <strong className='text-amber-400'>Tướng</strong>.
						</p>
					</div>
				</div>
			</div>

			{/* DANH SÁCH GÓI TƯỚNG PHỤ ĐÃ THÊM */}
			<div className='space-y-3'>
				{currentList.length === 0 ? (
					<div className='py-6 text-center border border-dashed border-border/80 rounded-xl text-text-tertiary text-xs'>
						Chưa có gói tướng phụ nào. Hãy kéo thả lá bài vào ô phía trên.
					</div>
				) : (
					currentList.map((item, index) => {
						const cardCode = typeof item === "string" ? item : item.cardCode;
						const info = getEntityInfo(item);

						return (
							<div
								key={cardCode || index}
								className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-surface-bg border border-border hover:border-amber-500/40 rounded-xl transition-all shadow-sm'
							>
								{/* Avatar & Tên tướng */}
								<div className='flex items-center gap-3 min-w-0 flex-1'>
									{info.imageUrl ? (
										<img
											src={info.imageUrl}
											alt={info.name || cardCode}
											className='w-12 h-12 rounded-lg object-cover border border-border bg-black/40 shrink-0'
											onError={(e) => {
												if (info.cards?.[0]?.image) e.target.src = info.cards[0].image;
											}}
										/>
									) : (
										<div className='w-12 h-12 rounded-lg bg-surface-hover border border-border flex items-center justify-center shrink-0'>
											<CreditCard size={20} className='text-text-tertiary' />
										</div>
									)}

									<div className='min-w-0'>
										<div className='flex items-center gap-2'>
											<h4 className='text-sm font-bold text-text-primary truncate'>
												{info.name || item?.name || cardCode}
											</h4>
											<span className='text-[10px] font-mono px-2 py-0.5 rounded bg-surface-hover text-text-secondary border border-border'>
												{cardCode}
											</span>
										</div>
										{info.packageName && (
											<p className='text-xs text-text-secondary truncate mt-0.5'>
												{info.packageName}
											</p>
										)}
									</div>
								</div>

								{/* Các lá trong gói viện trợ (nếu có) */}
								{info.cards && info.cards.length > 0 && (
									<div className='flex items-center gap-1.5 overflow-x-auto py-0.5 shrink-0'>
										{info.cards.map((c, cIdx) => (
											<div
												key={c.cardCode || cIdx}
												className='flex items-center gap-1 px-1.5 py-1 bg-surface-hover/60 border border-border/80 rounded-md shrink-0 text-xs'
												title={`${c.name} x${c.count}`}
											>
												{c.image && (
													<img src={c.image} alt={c.name} className='w-5 h-5 object-contain rounded' />
												)}
												<span className='text-text-primary font-medium truncate max-w-[90px]'>{c.name}</span>
												<span className='text-amber-400 font-mono text-[10px]'>x{c.count}</span>
											</div>
										))}
									</div>
								)}

								{/* Nút hành động */}
								<div className='flex items-center gap-1 shrink-0 self-end sm:self-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-border/40'>
									<button
										type='button'
										disabled={index === 0}
										onClick={() => handleMove(index, -1)}
										title='Di chuyển lên'
										className='p-1.5 text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed rounded hover:bg-surface-hover'
									>
										<ArrowUp size={15} />
									</button>
									<button
										type='button'
										disabled={index === currentList.length - 1}
										onClick={() => handleMove(index, 1)}
										title='Di chuyển xuống'
										className='p-1.5 text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed rounded hover:bg-surface-hover'
									>
										<ArrowDown size={15} />
									</button>
									<button
										type='button'
										onClick={() => handleRemove(index)}
										title='Xóa khỏi danh sách'
										className='p-1.5 text-red-400 hover:text-red-300 rounded hover:bg-red-500/10 transition-colors ml-1'
									>
										<Trash2 size={15} />
									</button>
								</div>
							</div>
						);
					})
				)}
			</div>
		</section>
	);
});

SupportChampionsSection.displayName = "SupportChampionsSection";
export default SupportChampionsSection;
