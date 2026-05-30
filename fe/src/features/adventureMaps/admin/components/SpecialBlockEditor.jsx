import React, { useState } from 'react';
import Button from '@/components/common/button';
import InputField from '@/components/common/inputField';
import { getItemInfo } from '@/features/adventureMaps/admin/components/mapEditorConstants';

const SpecialBlockEditor = ({ block, bIdx, formData, setFormData, cachedData }) => {
	const [isDragOver, setIsDragOver] = useState(false);

	const handleDrop = e => {
		e.preventDefault();
		setIsDragOver(false);

		let droppedData = e.dataTransfer.getData("text/plain");
		if (!droppedData) return;

		try {
			const parsed = JSON.parse(droppedData);
			if (parsed && parsed.id && parsed.type) {
				const r = [...formData.specialBlocks];
				if (!r[bIdx].items) r[bIdx].items = [];
				r[bIdx].items.push({
					type: parsed.type,
					id: parsed.id,
					note: "",
					translations: { en: { note: "" } }
				});
				setFormData(p => ({ ...p, specialBlocks: r }));
			}
		} catch (err) {
			console.error(err);
		}
	};

	const handleRemoveItem = iIdx => {
		const r = [...formData.specialBlocks];
		r[bIdx].items.splice(iIdx, 1);
		setFormData(p => ({ ...p, specialBlocks: r }));
	};

	const handleItemNoteChange = (iIdx, field, val) => {
		const r = [...formData.specialBlocks];
		if (field === "note") {
			r[bIdx].items[iIdx].note = val;
		} else if (field === "en_note") {
			if (!r[bIdx].items[iIdx].translations) r[bIdx].items[iIdx].translations = { en: { note: "" } };
			if (!r[bIdx].items[iIdx].translations.en) r[bIdx].items[iIdx].translations.en = { note: "" };
			r[bIdx].items[iIdx].translations.en.note = val;
		}
		setFormData(p => ({ ...p, specialBlocks: r }));
	};

	const handleRemoveBlock = () => {
		const r = [...formData.specialBlocks];
		r.splice(bIdx, 1);
		setFormData(p => ({ ...p, specialBlocks: r }));
	};

	const handleMoveBlock = direction => {
		const r = [...formData.specialBlocks];
		if (direction === "up" && bIdx > 0) {
			const temp = r[bIdx];
			r[bIdx] = r[bIdx - 1];
			r[bIdx - 1] = temp;
		} else if (direction === "down" && bIdx < r.length - 1) {
			const temp = r[bIdx];
			r[bIdx] = r[bIdx + 1];
			r[bIdx + 1] = temp;
		}
		setFormData(p => ({ ...p, specialBlocks: r }));
	};

	return (
		<div className='bg-surface-bg p-5 border border-border rounded-xl shadow-sm flex flex-col gap-4 relative group'>
			<div className='flex justify-between items-center border-b border-border/50 pb-3'>
				<div className='flex items-center gap-2'>
					<span className='font-black text-yellow-500 text-sm tracking-wider uppercase'>
						BLOCK #{bIdx + 1}
					</span>
					<div className='flex gap-1'>
						<button
							type='button'
							className='p-2 text-text-secondary hover:text-text-primary disabled:opacity-30'
							disabled={bIdx === 0}
							onClick={() => handleMoveBlock("up")}
						>
							↑
						</button>
						<button
							type='button'
							className='p-2 text-text-secondary hover:text-text-primary disabled:opacity-30'
							disabled={bIdx === formData.specialBlocks.length - 1}
							onClick={() => handleMoveBlock("down")}
						>
							↓
						</button>
					</div>
				</div>
				<Button
					type='button'
					variant='danger'
					size='sm'
					onClick={handleRemoveBlock}
				>
					Xóa Block
				</Button>
			</div>

			{/* Title & Description inputs */}
			<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
				<div className='space-y-3'>
					<InputField
						label='Tên Block (VI)'
						value={block.title || ""}
						onChange={e => {
							const r = [...formData.specialBlocks];
							r[bIdx].title = e.target.value;
							setFormData(p => ({ ...p, specialBlocks: r }));
						}}
						placeholder='Ví dụ: Foe Powers'
					/>
					<InputField
						label='Dòng mô tả (VI - Không bắt buộc)'
						value={block.description || ""}
						onChange={e => {
							const r = [...formData.specialBlocks];
							r[bIdx].description = e.target.value;
							setFormData(p => ({ ...p, specialBlocks: r }));
						}}
						placeholder='Ví dụ: In this adventure, all Foes have 3 powers...'
					/>
				</div>
				<div className='space-y-3'>
					<InputField
						label='Tên Block (EN)'
						value={block.translations?.en?.title || ""}
						onChange={e => {
							const r = [...formData.specialBlocks];
							if (!r[bIdx].translations) r[bIdx].translations = { en: { title: "", description: "" } };
							if (!r[bIdx].translations.en) r[bIdx].translations.en = { title: "", description: "" };
							r[bIdx].translations.en.title = e.target.value;
							setFormData(p => ({ ...p, specialBlocks: r }));
						}}
						placeholder='Enter English block title...'
					/>
					<InputField
						label='Dòng mô tả (EN - Không bắt buộc)'
						value={block.translations?.en?.description || ""}
						onChange={e => {
							const r = [...formData.specialBlocks];
							if (!r[bIdx].translations) r[bIdx].translations = { en: { title: "", description: "" } };
							if (!r[bIdx].translations.en) r[bIdx].translations.en = { title: "", description: "" };
							r[bIdx].translations.en.description = e.target.value;
							setFormData(p => ({ ...p, specialBlocks: r }));
						}}
						placeholder='Enter English description...'
					/>
				</div>
			</div>

			{/* Drop Zone */}
			<div className='space-y-2 mt-2'>
				<label className='block font-semibold text-xs text-text-secondary uppercase tracking-wider'>
					Bảng vật phẩm / Tài nguyên trong Block (Kéo thả từ thanh bên vào đây)
				</label>
				<div
					onDragOver={e => {
						e.preventDefault();
						setIsDragOver(true);
					}}
					onDragLeave={() => setIsDragOver(false)}
					onDrop={handleDrop}
					className={`flex flex-col gap-3 p-4 rounded-xl border-2 border-dashed transition-all duration-200 min-h-[120px] 
					${isDragOver ? "border-primary-500 bg-primary-500/10" : "border-border bg-surface-hover/30"}`}
				>
					{(!block.items || block.items.length === 0) ? (
						<div className='flex flex-col items-center justify-center flex-1 text-text-tertiary italic text-xs py-6 opacity-60'>
							Kéo thả bất kỳ tài nguyên nào từ Sidebar bên phải vào đây...
						</div>
					) : (
						<div className='space-y-3'>
							{block.items.map((it, iIdx) => {
								const info = getItemInfo(it.type, it.id, cachedData);
								const name = info.name || info.cardName || info.bossName || info.adventureName || it.id;
								const avatar = info.avatar || info.assetAbsolutePath || info.assetFullAbsolutePath || "";
								
								// Local type badges
								const typeLabels = {
									champion: "Tướng",
									boss: "Boss",
									item: "Vật Phẩm",
									relic: "Cổ Vật",
									power: "Sức Mạnh",
									rune: "Ngọc Cổ Ngữ",
									bonusStar: "Sao Tinh Tú",
									card: "Lá Bài"
								};

								return (
									<div key={iIdx} className='flex flex-col gap-2 p-3 bg-surface-bg rounded-xl border border-border hover:border-primary-500/50 transition-all shadow-sm'>
										<div className='flex items-center gap-3'>
											<span className='font-bold text-text-secondary text-[10px] w-4 text-center'>
												{iIdx + 1}.
											</span>
											{avatar ? (
												<img
													src={avatar}
													alt={name}
													className='w-7 h-7 rounded object-contain bg-black/10 border border-border shrink-0'
												/>
											) : (
												<div className='w-7 h-7 rounded bg-black/10 border border-border shrink-0 flex items-center justify-center text-[10px] text-text-tertiary font-bold uppercase'>
													{it.type.slice(0, 2)}
												</div>
											)}
											<div className='min-w-0 flex-1'>
												<span className='font-bold text-xs text-text-primary block truncate'>
													{name}
												</span>
												<span className='inline-block px-1.5 py-0.5 bg-blue-500/10 text-blue-500 text-[9px] font-bold rounded mt-0.5'>
													{typeLabels[it.type] || it.type}
												</span>
											</div>
											<Button
												type='button'
												variant='ghost'
												className='text-red-500 hover:text-red-400 p-1 rounded transition-colors shrink-0'
												onClick={() => handleRemoveItem(iIdx)}
											>
												✕
											</Button>
										</div>

										{/* Custom Note input */}
										<div className='grid grid-cols-1 md:grid-cols-2 gap-2 mt-1 pt-2 border-t border-border/40'>
											<InputField
												placeholder='Mô tả thêm cho dòng này (VI)...'
												value={it.note || ""}
												onChange={e => handleItemNoteChange(iIdx, "note", e.target.value)}
												className='text-xs'
											/>
											<InputField
												placeholder='English note for this row (EN)...'
												value={it.translations?.en?.note || ""}
												onChange={e => handleItemNoteChange(iIdx, "en_note", e.target.value)}
												className='text-xs'
											/>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default SpecialBlockEditor;
