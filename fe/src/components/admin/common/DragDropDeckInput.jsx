import { useState, memo } from "react";
import { XCircle, Trash2, Plus, GripVertical } from "lucide-react";
import { useTranslation } from "../../../hooks/useTranslation";

const DragDropDeckInput = memo(
	({
		label,
		data = [], // Mảng chứa các object: [{ cardCode: '01RU001', itemCodes: [] }]
		onChange, // (newData) => void
		cachedData = {}, // { powers: {}, relics: {}, items: {}, cards: {} }
		placeholder = "Kéo lá bài từ danh sách vào đây...",
	}) => {
		const { tDynamic } = useTranslation();
		const [isDragOverMain, setIsDragOverMain] = useState(false);
		const [dragOverIdx, setDragOverIdx] = useState(null);

		const handleDragOverMain = e => {
			e.preventDefault();
			setIsDragOverMain(true);
		};

		const handleDragLeaveMain = () => {
			setIsDragOverMain(false);
		};

		const handleDropMain = e => {
			e.preventDefault();
			setIsDragOverMain(false);

			const rawData = e.dataTransfer.getData("text/plain");
			if (!rawData) return;

			try {
				const parsed = JSON.parse(rawData);
				// Chỉ nhận type là 'card' ở vùng chính
				if (parsed.type === "card" && parsed.id) {
					onChange([...data, { cardCode: parsed.id, itemCodes: [] }]);
				}
			} catch (err) {
				console.error("Drop Error:", err);
			}
		};

		const handleDropOnCard = (e, index) => {
			e.preventDefault();
			setDragOverIdx(null);

			const rawData = e.dataTransfer.getData("text/plain");
			if (!rawData) return;

			try {
				const parsed = JSON.parse(rawData);
				// Chỉ nhận type là 'item' khi thả vào card
				if (parsed.type === "item" && parsed.id) {
					const newData = [...data];
					const currentItemCodes = newData[index].itemCodes || [];
					if (!currentItemCodes.includes(parsed.id)) {
						newData[index].itemCodes = [...currentItemCodes, parsed.id];
						onChange(newData);
					}
				}
			} catch (err) {
				console.error("Drop Item Error:", err);
			}
		};

		const handleRemoveCard = index => {
			onChange(data.filter((_, i) => i !== index));
		};

		const handleRemoveItemFromCard = (cardIdx, itemIdx) => {
			const newData = [...data];
			newData[cardIdx].itemCodes = newData[cardIdx].itemCodes.filter(
				(_, i) => i !== itemIdx,
			);
			onChange(newData);
		};

		return (
			<div className='flex flex-col gap-3'>
				<label className='font-bold text-text-primary text-sm uppercase tracking-wider'>
					{label}
				</label>

				<div
					onDragOver={handleDragOverMain}
					onDragLeave={handleDragLeaveMain}
					onDrop={handleDropMain}
					className={`flex flex-col gap-3 p-4 rounded-xl border-2 border-dashed transition-all duration-200 min-h-[150px]
					${
						isDragOverMain
							? "border-primary-500 bg-primary-500/10"
							: "border-border bg-surface-hover/30"
					}`}
				>
					{data.length > 0 ? (
						<div className='space-y-3'>
							{data.map((cardEntry, idx) => {
								const cardInfo = cachedData.cards?.[cardEntry.cardCode] || {};
								const cardName =
									tDynamic(cardInfo, "cardName") || cardEntry.cardCode;
								const cardImg = cardInfo.gameAbsolutePath || "";

								return (
									<div
										key={`${cardEntry.cardCode}-${idx}`}
										onDragOver={e => {
											e.preventDefault();
											e.stopPropagation();
											setDragOverIdx(idx);
										}}
										onDragLeave={() => setDragOverIdx(null)}
										onDrop={e => handleDropOnCard(e, idx)}
										className={`flex flex-col md:flex-row items-center gap-4 p-3 bg-surface-bg border rounded-xl shadow-sm transition-all
										${dragOverIdx === idx ? "border-primary-500 ring-4 ring-primary-500/10" : "border-border"}`}
									>
										{/* Card Info */}
										<div className='flex items-center gap-3 flex-1 min-w-0 w-full'>
											<GripVertical className='text-text-tertiary shrink-0 cursor-grab active:cursor-grabbing' size={18} />
											<div className='w-12 h-16 rounded-lg bg-black/20 border border-border overflow-hidden shrink-0'>
												{cardImg ? (
													<img
														src={cardImg}
														alt={cardName}
														className='w-full h-full object-cover'
													/>
												) : (
													<div className='w-full h-full flex items-center justify-center text-xs text-text-secondary'>?</div>
												)}
											</div>
											<div className='min-w-0'>
												<p className='font-bold text-text-primary text-sm truncate uppercase'>
													{cardEntry.cardCode}
												</p>
												<p className='text-xs text-text-secondary truncate mt-0.5'>
													{cardName}
												</p>
											</div>
										</div>

										{/* Items Container */}
										<div className='flex flex-wrap gap-2 items-center justify-start md:justify-end flex-grow w-full'>
											{(cardEntry.itemCodes || []).map((itemCode, itemIdx) => {
												const itemInfo = cachedData.items?.[itemCode] || {};
												const itemName = tDynamic(itemInfo, "name") || itemCode;
												const itemImg = itemInfo.assetAbsolutePath || itemInfo.image || "";

												return (
													<div
														key={`${itemCode}-${itemIdx}`}
														className='group relative flex items-center gap-1.5 px-2 py-1 bg-surface-hover border border-border rounded-lg hover:border-red-500/30 transition-colors'
														title={itemName}
													>
														<div className='w-6 h-6 rounded bg-white/10 overflow-hidden shrink-0 border border-border/50'>
															{itemImg ? (
																<img src={itemImg} className='w-full h-full object-contain' />
															) : (
																<div className='w-full h-full flex items-center justify-center text-[10px]'>?</div>
															)}
														</div>
														<span className='text-[10px] font-bold text-text-secondary max-w-[100px] truncate'>
															{itemName}
														</span>
														<button
															type='button'
															onClick={() => handleRemoveItemFromCard(idx, itemIdx)}
															className='absolute -top-1.5 -right-1.5 p-0.5 bg-red-500 text-white rounded-full opacity-80 hover:opacity-100 transition-opacity shadow-sm z-10'
														>
															<XCircle size={10} />
														</button>
													</div>
												);
											})}
											
											{/* Droppable Hint for items */}
											<div className='flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dashed border-border bg-surface-hover/50 text-[10px] text-text-tertiary italic'>
												<Plus size={12} /> Thả Vật phẩm vào đây
											</div>
										</div>

										{/* Delete Card Button */}
										<button
											type='button'
											onClick={() => handleRemoveCard(idx)}
											className='p-2 text-red-500 hover:bg-red-500/10 rounded-lg shrink-0 transition-colors'
											title='Xóa khỏi bộ bài'
										>
											<Trash2 size={18} />
										</button>
									</div>
								);
							})}
						</div>
					) : (
						<div className='flex flex-col items-center justify-center flex-1 text-text-tertiary italic text-sm py-8'>
							{placeholder}
						</div>
					)}
				</div>
			</div>
		);
	},
);

export default DragDropDeckInput;
