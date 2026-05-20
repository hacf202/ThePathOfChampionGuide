// src/components/admin/adventureMapEditorForm.jsx
import { useState, memo, useEffect, useRef, useCallback } from "react";
import Button from "../../common/button";
import InputField from "../../common/inputField";
import {
	Plus,
	Trash2,
	Map as MapIcon,
	Eye,
	EyeOff,
	Skull,
	ShieldQuestion,
	Zap,
	CircleDot,
	Image as ImageIcon,
	Flag,
	HandMetal,
	AlertCircle,
	ShoppingBag,
	Package,
	HelpCircle,
	Diamond,
	Info,
} from "lucide-react";

import {
	AdventureLine,
	AdventureConnections,
	AdventureNodeEditor,
	DragDropArrayInput,
	getUniqueAdvId,
	getAdvName,
	getAdvImage,
	NODE_TYPES_DATA,
} from "./adventureEditorHelpers";

const StringArrayInput = ({ label, items, onChange, placeholder }) => (
	<div className='space-y-2'>
		<label className='block font-semibold text-sm text-text-secondary'>
			{label}
		</label>
		{items.map((val, idx) => (
			<div key={idx} className='flex gap-2'>
				<InputField
					value={val}
					onChange={e => {
						const newArr = [...items];
						newArr[idx] = e.target.value;
						onChange(newArr);
					}}
					placeholder={placeholder}
				/>
				<Button
					type='button'
					variant='danger'
					onClick={() => onChange(items.filter((_, i) => i !== idx))}
				>
					<Trash2 size={16} />
				</Button>
			</div>
		))}
		<Button
			type='button'
			variant='outline'
			size='sm'
			onClick={() => onChange([...items, ""])}
		>
			<Plus size={14} /> Thêm
		</Button>
	</div>
);

const REGION_OPTIONS = [
	{ value: "Demacia", label: "Demacia" },
	{ value: "Noxus", label: "Noxus" },
	{ value: "Freljord", label: "Freljord" },
	{ value: "Piltover & Zaun", label: "Piltover & Zaun" },
	{ value: "Ionia", label: "Ionia" },
	{ value: "Shurima", label: "Shurima" },
	{ value: "Targon", label: "Targon" },
	{ value: "Quần Đảo Bóng Đêm", label: "Quần Đảo Bóng Đêm" },
	{ value: "Thành Phố Bandle", label: "Thành Phố Bandle" },
	{ value: "Bilgewater", label: "Bilgewater" },
	{ value: "Runeterra", label: "Runeterra" },
	{ value: "Hoa Linh Lục Địa", label: "Hoa Linh Lục Địa" },
	{ value: "ALL", label: "ALL" }
];

const RegionArrayInput = ({ label, items, onChange }) => {
	const currentItems = items || [];
	const availableRegions = REGION_OPTIONS;
	return (
		<div className='space-y-2'>
			<label className='block font-semibold text-sm text-text-secondary'>
				{label}
			</label>
			<div className='flex flex-wrap gap-2 mb-2'>
				{currentItems.map((val, idx) => (
					<div key={idx} className='flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/30 px-2.5 py-1 rounded-lg text-xs font-semibold text-blue-700 dark:text-blue-400'>
						<span>{val}</span>
						<button
							type='button'
							className='text-red-500 hover:text-red-700 transition-colors shrink-0 ml-1 font-bold'
							onClick={() => onChange(currentItems.filter((_, i) => i !== idx))}
						>
							✕
						</button>
					</div>
				))}
			</div>
			{availableRegions.length > 0 && (
				<select
					className='bg-surface-bg border border-border rounded-xl px-2.5 py-1.5 text-xs text-text-primary outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all font-semibold cursor-pointer max-w-[200px]'
					value=''
					onChange={e => {
						const newVal = e.target.value;
						if (newVal) {
							onChange([...currentItems, newVal]);
						}
					}}
				>
					<option value=''>-- Chọn vùng --</option>
					{availableRegions.map(opt => (
						<option key={opt.value} value={opt.value}>
							{opt.label}
						</option>
					))}
				</select>
			)}
		</div>
	);
};

const REGIONAL_REWARD_BASES = [
	"Thùng Tinh Tú Bạc",
	"Thùng Tinh Tú Vàng",
	"Thùng Tinh Tú Bạch Kim",
	"Thùng Đá Quý Lớn",
	"Pha Lê Sao Băng",
	"Mảnh Sao Băng",
	"Đá Quý",
	"Pha Lê Tinh Tú"
];

const getRegionalRewardInfo = (fullName) => {
	if (!fullName) return { base: "", region: "" };
	for (const base of REGIONAL_REWARD_BASES) {
		if (fullName.startsWith(base)) {
			const region = fullName.slice(base.length).trim();
			return { base, region };
		}
	}
	return { base: "", region: "" };
};

const COMMON_REWARDS = [
	{ value: "Điểm Huyền Thoại", label: "✨ Điểm Huyền Thoại" },
	{ value: "Bụi Tinh Tú", label: "🌟 Bụi Tinh Tú" },
	{ value: "Mảnh Ghép Bí Ẩn", label: "🃏 Mảnh Ghép Bí Ẩn" },
	{ value: "Mảnh Tướng", label: "🧩 Mảnh Tướng" },
	{ value: "Đá Quý", label: "💎 Đá Quý" },
	{ value: "Xu Vinh Danh", label: "🏅 Xu Vinh Danh" },
	
	// Kho Báu
	{ value: "Kho Báu Đồng", label: "📦 Kho Báu Đồng" },
	{ value: "Kho Báu Bạc", label: "📦 Kho Báu Bạc" },
	{ value: "Kho Báu Vàng", label: "📦 Kho Báu Vàng" },
	{ value: "Kho Báu Bạch Kim", label: "📦 Kho Báu Bạch Kim" },
	{ value: "Kho Báu Kim Cương", label: "📦 Kho Báu Kim Cương" },
	
	// Hòm Thần Tích
	{ value: "Hòm Thần Tích Đồng", label: "👑 Hòm Thần Tích Đồng" },
	{ value: "Hòm Thần Tích Bạc", label: "👑 Hòm Thần Tích Bạc" },
	{ value: "Hòm Thần Tích Vàng", label: "👑 Hòm Thần Tích Vàng" },

	// Thùng Tinh Tú & Thùng Đá Quý
	{ value: "Thùng Tinh Tú Bạc", label: "🌌 Thùng Tinh Tú Bạc" },
	{ value: "Thùng Tinh Tú Vàng", label: "🌌 Thùng Tinh Tú Vàng" },
	{ value: "Thùng Tinh Tú Bạch Kim", label: "🌌 Thùng Tinh Tú Bạch Kim" },
	{ value: "Thùng Đá Quý Lớn", label: "🌌 Thùng Đá Quý Lớn" },

	// Pha Lê Sao Băng & Pha Lê Tinh Tú & Mảnh Sao Băng
	{ value: "Pha Lê Sao Băng", label: "🔮 Pha Lê Sao Băng" },
	{ value: "Pha Lê Tinh Tú", label: "🔮 Pha Lê Tinh Tú" },
	{ value: "Mảnh Sao Băng", label: "☄️ Mảnh Sao Băng" },
];

const getItemInfo = (type, id, cachedData) => {
	let list = [];
	if (type === "champion") list = cachedData.champions || [];
	if (type === "boss") list = cachedData.bosses || [];
	if (type === "item") list = cachedData.items || [];
	if (type === "relic") list = cachedData.relics || [];
	if (type === "power") list = cachedData.powers || [];
	if (type === "rune") list = cachedData.runes || [];
	if (type === "bonusStar") list = cachedData.bonusStars || [];
	if (type === "card") list = cachedData.cards || [];

	return list.find(item => {
		const uniqueId =
			item.championID ||
			item.bossID ||
			item.powerCode ||
			item.relicCode ||
			item.itemCode ||
			item.runeCode ||
			item.cardCode ||
			item.bonusStarID ||
			item.id ||
			item._id;
		return uniqueId === id;
	}) || {};
};

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

const AdventureMapEditorForm = memo(
	({ item, cachedData, onSave, onCancel, onDelete, isSaving }) => {
		const [formData, setFormData] = useState({});

		const [isMapVisible, setIsMapVisible] = useState(true);
		const [nodeDisplayMode, setNodeDisplayMode] = useState("icon");
		const [mapAspectRatio, setMapAspectRatio] = useState("21/9");
		const [mapSize, setMapSize] = useState({ width: 1000, height: 400 });
		const [selectedNodeIndex, setSelectedNodeIndex] = useState(null);
		const [selectedNodeType, setSelectedNodeType] = useState("Encounter");
		const [contextMenu, setContextMenu] = useState(null);
		const [activeDragOverNodeIdx, setActiveDragOverNodeIdx] = useState(null);
		const mapRef = useRef(null);

		useEffect(() => {
			if (!contextMenu) return;
			const handleClose = () => setContextMenu(null);
			document.addEventListener("click", handleClose);
			return () => document.removeEventListener("click", handleClose);
		}, [contextMenu]);

		useEffect(() => {
			if (!isMapVisible || !mapRef.current) return;
			const observer = new ResizeObserver(entries => {
				for (let entry of entries) {
					setMapSize({
						width: entry.contentRect.width,
						height: entry.contentRect.height,
					});
				}
			});
			observer.observe(mapRef.current);
			return () => observer.disconnect();
		}, [isMapVisible]);

		useEffect(() => {
			if (item) {
				const cloned = JSON.parse(JSON.stringify(item));
				if (!cloned.translations)
					cloned.translations = {
						en: { adventureName: "", typeAdventure: "" },
					};
				if (!cloned.Bosses) cloned.Bosses = [];
				if (!cloned.nodes) cloned.nodes = [];
				if (!cloned.rewards) cloned.rewards = [];
				if (!cloned.specialBlocks) cloned.specialBlocks = [];
				if (!cloned.requirement)
					cloned.requirement = { champions: [], regions: [] };

				// Đảm bảo các Boss cũ nếu chưa có mapBonusPower sẽ được khởi tạo
				cloned.Bosses = cloned.Bosses.map(b => ({
					...b,
					mapBonusPower: b.mapBonusPower || [],
				}));

				setFormData(cloned);
			}
		}, [item]);

		const requirementChampsLength = formData.requirement?.champions?.length || 0;
		const requirementRegionsLength = formData.requirement?.regions?.length || 0;

		useEffect(() => {
			if (!formData.requirement) return;
			const reqCount = requirementChampsLength + requirementRegionsLength;
			const targetCount = reqCount === 0 ? 1 : reqCount;
			const currentRewards = formData.rewards || [];

			if (currentRewards.length !== targetCount) {
				setFormData(prev => {
					let newRewards = [...(prev.rewards || [])];
					if (newRewards.length < targetCount) {
						while (newRewards.length < targetCount) {
							newRewards.push({ items: [] });
						}
					} else if (newRewards.length > targetCount) {
						newRewards = newRewards.slice(0, targetCount);
					}
					return { ...prev, rewards: newRewards };
				});
			}
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [requirementChampsLength, requirementRegionsLength]);

		const handleChange = e => {
			const { name, value } = e.target;
			setFormData(prev => ({ ...prev, [name]: value }));
		};

		const handleSubmit = e => {
			e.preventDefault();
			onSave(formData);
		};

		const getBossNamesString = useCallback(
			bosses => {
				if (!bosses || bosses.length === 0) return "";
				const names = bosses.map(bId => {
					const found = (cachedData?.bosses || []).find(
						cb => getUniqueAdvId(cb) === bId.trim(),
					);
					return found ? getAdvName(found) : bId;
				});
				return ` (${names.join(", ")})`;
			},
			[cachedData],
		);

		const handleMapClick = useCallback(
			e => {
				if (contextMenu) return;
				if (selectedNodeIndex === null || !mapRef.current) return;
				const rect = mapRef.current.getBoundingClientRect();
				const x = parseFloat(
					(((e.clientX - rect.left) / rect.width) * 100).toFixed(1),
				);
				const y = parseFloat(
					(((e.clientY - rect.top) / rect.height) * 100).toFixed(1),
				);

				setFormData(prev => {
					const nextNodes = [...(prev.nodes || [])];
					if (nextNodes[selectedNodeIndex]) {
						nextNodes[selectedNodeIndex] = {
							...nextNodes[selectedNodeIndex],
							position: { x, y },
						};
					}
					return { ...prev, nodes: nextNodes };
				});
			},
			[selectedNodeIndex, contextMenu],
		);

		const handleMapContextMenu = useCallback(
			e => {
				e.preventDefault();
				if (!mapRef.current) return;
				const rect = mapRef.current.getBoundingClientRect();
				const xPx = e.clientX - rect.left;
				const yPx = e.clientY - rect.top;
				const percentX = parseFloat(((xPx / rect.width) * 100).toFixed(1));
				const percentY = parseFloat(((yPx / rect.height) * 100).toFixed(1));

				// Tránh bị tràn hoặc cắt mất context menu ở các góc cạnh của bản đồ
				const menuWidth = 208; // w-52 tương đương 208px
				const maxMenuHeight = 260; // Chiều cao tối đa thực tế (~7 items hiển thị cùng lúc, cuộn cho các items còn lại)
				const menuHeight = Math.min(maxMenuHeight, rect.height - 20);

				let renderX = xPx;
				let renderY = yPx;

				if (xPx + menuWidth > rect.width) {
					renderX = rect.width - menuWidth - 10;
				}
				if (yPx + menuHeight > rect.height) {
					renderY = rect.height - menuHeight - 10;
				}
				if (renderX < 10) renderX = 10;
				if (renderY < 10) renderY = 10;

				setContextMenu({
					x: renderX,
					y: renderY,
					percentX,
					percentY,
					maxListHeight: menuHeight - 50, // Trừ đi phần tiêu đề và padding
				});
			},
			[],
		);

		const handleCreateNodeAtPos = useCallback(
			(type, percentX, percentY) => {
				setFormData(prev => {
					const nextNodes = [...(prev.nodes || [])];
					const newIndex = nextNodes.length + 1;

					// Đảm bảo nodeID là duy nhất
					let uniqueID = `n${newIndex}`;
					let attempts = 0;
					while (nextNodes.some(n => n.nodeID === uniqueID) && attempts < 100) {
						attempts++;
						uniqueID = `n${newIndex + attempts}`;
					}

					const newNode = {
						nodeID: uniqueID,
						nodeType: type,
						bosses: [],
						nextNodes: [],
						position: { x: percentX, y: percentY },
					};

					const updatedNodes = [...nextNodes, newNode];

					// Tự động focus/select node mới tạo sau khi DOM được render
					setTimeout(() => {
						setSelectedNodeIndex(updatedNodes.length - 1);
					}, 50);

					return { ...prev, nodes: updatedNodes };
				});
				setContextMenu(null);
			},
			[],
		);

		const handleNodeChange = useCallback((idx, field, val) => {
			setFormData(prev => {
				const nextNodes = [...(prev.nodes || [])];
				if (nextNodes[idx]) {
					nextNodes[idx] = { ...nextNodes[idx], [field]: val };
				}
				return { ...prev, nodes: nextNodes };
			});
		}, []);

		// MAP ICON DÀNH RIÊNG CHO BẢN ĐỒ (CÓ THỂ SỬ DỤNG MÀU SẮC ĐỂ DỄ NHÌN HƠN THAY VÌ TEXT-WHITE)
		const getNodeIcon = type => {
			const t = (type || "").toLowerCase();
			if (t.includes("start"))
				return <Flag size={14} className='text-emerald-400' />;
			if (t.includes("mini"))
				return <Skull size={10} className='text-orange-400' />;
			if (t.includes("boss"))
				return <Skull size={16} className='text-red-500' />;
			if (t.includes("power"))
				return <HandMetal size={14} className='text-yellow-400' />;
			if (t.includes("heal"))
				return <Plus size={14} className='text-green-400' />;
			if (t.includes("encounter"))
				return <AlertCircle size={14} className='text-red-400' />;
			if (t.includes("shop"))
				return <ShoppingBag size={14} className='text-yellow-500' />;
			if (
				t.includes("gold") ||
				t.includes("chest") ||
				t.includes("item") ||
				t.includes("spell")
			)
				return <Package size={14} className='text-blue-400' />;
			if (t.includes("event"))
				return <HelpCircle size={14} className='text-purple-400' />;
			if (t.includes("champion"))
				return <Diamond size={14} className='text-cyan-400' />;

			return <ShieldQuestion size={14} className='text-white' />;
		};

		const handleDropBossOnMapNode = useCallback((e, nodeIdx) => {
			e.preventDefault();
			e.stopPropagation();
			try {
				const dragged = JSON.parse(e.dataTransfer.getData("text/plain"));
				if (dragged.type === "boss") {
					const identifier = dragged.id || dragged.bossID || getUniqueAdvId(dragged) || dragged.name;
					if (identifier) {
						const trimmedId = identifier.trim();
						setFormData(prev => {
							const nextNodes = [...(prev.nodes || [])];
							const nodeToUpdate = nextNodes[nodeIdx];
							if (nodeToUpdate) {
								const currentBosses = nodeToUpdate.bosses || [];
								if (!currentBosses.includes(trimmedId)) {
									nextNodes[nodeIdx] = {
										...nodeToUpdate,
										bosses: [...currentBosses, trimmedId]
									};
								}
							}
							return { ...prev, nodes: nextNodes };
						});
					}
				}
			} catch (err) {
				console.warn("Drag data không hợp lệ hoặc không phải boss", err);
			}
		}, []);

		return (
			<form onSubmit={handleSubmit} className='space-y-6 pb-20'>
				<div className='flex justify-between items-center border-b border-border p-4 sticky top-0 bg-surface-bg z-30 shadow-sm'>
					<h2 className='text-xl font-bold text-primary-500'>
						{formData.isNew
							? "Tạo Bản Đồ Mới"
							: `Biên tập: ${formData.adventureName || ""}`}
					</h2>
					<div className='flex gap-2'>
						<Button
							type='button'
							variant='ghost'
							onClick={onCancel}
							disabled={isSaving}
						>
							Hủy
						</Button>
						{!formData.isNew && (
							<Button
								type='button'
								variant='danger'
								onClick={() => onDelete(formData.adventureID)}
								disabled={isSaving}
							>
								Xóa
							</Button>
						)}
						<Button
							type='submit'
							variant='primary'
							disabled={isSaving || !formData.adventureID}
						>
							{isSaving ? "Đang lưu..." : "Lưu Bản Đồ"}
						</Button>
					</div>
				</div>

				<div className='p-6 space-y-8 max-w-[1400px] mx-auto'>
					<section className='bg-surface-hover/30 p-5 rounded-xl border border-border space-y-4 shadow-sm'>
						<h3 className='font-bold text-lg border-l-4 border-primary-500 pl-3'>
							Thông tin cơ bản
						</h3>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
							<InputField
								label='Mã Map (ID)'
								name='adventureID'
								value={formData.adventureID || ""}
								onChange={handleChange}
								required
								disabled={!formData.isNew}
							/>
							<InputField
								label='Độ khó (Difficulty)'
								name='difficulty'
								type='number'
								step='0.5'
								value={formData.difficulty || 0}
								onChange={e =>
									setFormData(p => ({
										...p,
										difficulty: parseFloat(e.target.value) || 0,
									}))
								}
							/>
							<InputField
								label='Tên Map (VI)'
								name='adventureName'
								value={formData.adventureName || ""}
								onChange={handleChange}
								required
							/>
							<InputField
								label='Tên Map (EN)'
								value={formData.translations?.en?.adventureName || ""}
								onChange={e =>
									setFormData(p => ({
										...p,
										translations: {
											...p.translations,
											en: {
												...p.translations.en,
												adventureName: e.target.value,
											},
										},
									}))
								}
							/>
							<InputField
								label='Loại Map (VI)'
								name='typeAdventure'
								value={formData.typeAdventure || ""}
								onChange={handleChange}
							/>
							<InputField
								label='Loại Map (EN)'
								value={formData.translations?.en?.typeAdventure || ""}
								onChange={e =>
									setFormData(p => ({
										...p,
										translations: {
											...p.translations,
											en: {
												...p.translations.en,
												typeAdventure: e.target.value,
											},
										},
									}))
								}
							/>
							<InputField
								label='Link Background'
								name='background'
								value={formData.background || ""}
								onChange={handleChange}
								placeholder='Nhập URL ảnh nền map...'
							/>
							<div className='flex gap-4 items-end'>
								<div className='flex-1'>
									<InputField
										label='Link Ảnh Đại Diện (Avatar Map)'
										name='assetAbsolutePath'
										value={formData.assetAbsolutePath || ""}
										onChange={handleChange}
										placeholder='Nhập URL ảnh đại diện cho map...'
									/>
								</div>
								{formData.assetAbsolutePath && (
									<div className='shrink-0 mb-1'>
										<img
											src={formData.assetAbsolutePath}
											alt='Avatar Preview'
											className='h-[42px] w-[42px] rounded-lg object-cover border border-border shadow-sm bg-black/40'
											onError={e => (e.target.style.display = "none")}
										/>
									</div>
								)}
							</div>
							<InputField
								label='Kinh nghiệm (XP)'
								name='championXP'
								type='number'
								value={formData.championXP || 0}
								onChange={e =>
									setFormData(p => ({
										...p,
										championXP: parseInt(e.target.value, 10) || 0,
									}))
								}
							/>
						</div>
					</section>

					<section className='grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch'>
						<div className='bg-surface-hover/30 p-5 rounded-xl border border-border shadow-sm flex flex-col h-full'>
							<h3 className='font-bold mb-4 text-lg border-l-4 border-blue-500 pl-3'>
								Yêu cầu tham gia (Requirement)
							</h3>
							<div className='space-y-4 flex-1'>
								<DragDropArrayInput
									label='Tướng bắt buộc (Champions)'
									data={formData.requirement?.champions || []}
									onChange={arr =>
										setFormData(p => ({
											...p,
											requirement: { ...p.requirement, champions: arr },
										}))
									}
									cachedList={cachedData.champions || []}
									placeholder='Kéo thả ID Tướng vào đây...'
								/>
								<div className='border-t border-border/50 pt-4 mt-4'>
									<RegionArrayInput
										label='Vùng bắt buộc (Regions)'
										items={formData.requirement?.regions || []}
										onChange={arr =>
											setFormData(p => ({
												...p,
												requirement: { ...p.requirement, regions: arr },
											}))
										}
									/>
								</div>
							</div>
						</div>
						<div className='bg-surface-hover/30 p-5 rounded-xl border border-border shadow-sm flex flex-col h-full'>
							<h3 className='font-bold mb-4 text-lg border-l-4 border-purple-500 pl-3'>
								Luật Đặc Biệt (Mutators/Powers)
							</h3>
							<div className='flex-1'>
								<DragDropArrayInput
									label='Danh sách Power IDs (VD: P0612)'
									data={formData.specialRules || []}
									onChange={arr =>
										setFormData(p => ({ ...p, specialRules: arr }))
									}
									cachedList={cachedData.powers || []}
									placeholder='Kéo thả ID Power vào đây...'
								/>
							</div>
						</div>
					</section>

					{/* --- YÊU CẦU / MÔ TẢ ĐẶC BIỆT (SPECIAL BLOCKS) --- */}
					<section className='bg-surface-hover/30 p-5 rounded-xl border border-border space-y-6 shadow-sm'>
						<div className='flex justify-between items-center border-b border-border pb-3'>
							<div>
								<h3 className='font-bold text-lg border-l-4 border-yellow-500 pl-3 flex items-center gap-2'>
									<Info size={18} className='text-yellow-500' />
									Yêu cầu / Mô tả đặc biệt (Special Blocks)
								</h3>
								<p className='text-xs text-text-secondary pl-3 mt-1'>
									Thiết lập các khối ghi chú đặc biệt cho bản đồ. Kéo thả tài nguyên từ Sidebar bên phải vào mỗi block.
								</p>
							</div>
							<Button
								type='button'
								variant='primary'
								size='sm'
								onClick={() => {
									const blocks = [...(formData.specialBlocks || [])];
									blocks.push({
										title: "",
										description: "",
										translations: { en: { title: "", description: "" } },
										items: []
									});
									setFormData(p => ({ ...p, specialBlocks: blocks }));
								}}
							>
								<Plus size={14} className='mr-1' /> Thêm Block
							</Button>
						</div>

						{(!formData.specialBlocks || formData.specialBlocks.length === 0) ? (
							<div className='py-8 text-center text-text-secondary italic text-sm bg-surface-bg/30 rounded-xl border border-dashed border-border/50'>
								Chưa có block đặc biệt nào. Bấm "Thêm Block" để tạo mới.
							</div>
						) : (
							<div className='space-y-6'>
								{formData.specialBlocks.map((block, bIdx) => (
									<SpecialBlockEditor
										key={bIdx}
										block={block}
										bIdx={bIdx}
										formData={formData}
										setFormData={setFormData}
										cachedData={cachedData}
									/>
								))}
							</div>
						)}
					</section>

					{/* --- KHU VỰC DANH SÁCH BOSS CÓ KÈM BONUS POWER --- */}
					<section className='bg-surface-hover/30 p-5 rounded-xl border border-border shadow-sm'>
						<div className='flex justify-between items-center mb-6 border-b border-border pb-3'>
							<h3 className='font-bold text-lg border-l-4 border-red-500 pl-3'>
								Danh sách Boss chính & Ghi chú
							</h3>
							<Button
								type='button'
								variant='primary'
								size='sm'
								onClick={() =>
									setFormData(p => ({
										...p,
										Bosses: [
											...(p.Bosses || []),
											{ bossID: "", note: "", mapBonusPower: [] },
										],
									}))
								}
							>
								<Plus size={16} className='mr-1' /> Thêm Boss
							</Button>
						</div>

						<div className='flex flex-col gap-5'>
							{(formData.Bosses || []).map((b, i) => {
								const safeBossID = (b.bossID || "").trim();
								const resolvedBoss =
									(cachedData.bosses || []).find(
										cb => getUniqueAdvId(cb) === safeBossID,
									) || {};
								const isResolvedBoss = !!getUniqueAdvId(resolvedBoss);
								const displayBossID = isResolvedBoss
									? getAdvName(resolvedBoss)
									: b.bossID || "";
								const bossAvatar = getAdvImage(resolvedBoss);
								const bossPowers = Array.isArray(resolvedBoss.power)
									? resolvedBoss.power
									: resolvedBoss.power
										? [resolvedBoss.power]
										: [];

								return (
									<div
										key={i}
										className='bg-surface-bg p-5 rounded-lg border border-border shadow-md flex flex-col lg:flex-row gap-6 relative'
									>
										<div
											className='w-full lg:w-1/4 flex flex-col gap-4 lg:border-r lg:border-border lg:pr-6 p-2 -m-2 rounded-lg border-2 border-transparent hover:border-dashed hover:border-red-500/30 transition-all'
											onDrop={e => {
												e.preventDefault();
												e.stopPropagation();
												try {
													const dragged = JSON.parse(
														e.dataTransfer.getData("text/plain"),
													);
													const identifier =
														getUniqueAdvId(dragged) || dragged.name;
													if (identifier) {
														const arr = [...formData.Bosses];
														arr[i].bossID = identifier.trim();
														setFormData(p => ({ ...p, Bosses: arr }));
													}
												} catch (err) {
													console.warn("Drag data không hợp lệ", err);
												}
											}}
											onDragOver={e => e.preventDefault()}
										>
											<div className='flex justify-between items-center'>
												<span className='font-black text-red-500 text-lg'>
													BOSS #{i + 1}
												</span>
												<Button
													type='button'
													variant='ghost'
													className='text-red-500 hover:bg-red-500/10'
													onClick={() =>
														setFormData(p => ({
															...p,
															Bosses: p.Bosses.filter((_, idx) => idx !== i),
														}))
													}
												>
													<Trash2 size={18} />
												</Button>
											</div>

											<div className='flex flex-col gap-2'>
												<label className='block font-semibold text-[10px] uppercase text-text-secondary tracking-widest'>
													Mã Boss (Kéo thả vào khu vực này)
												</label>
												<div className='flex items-center gap-3 bg-surface-hover p-2 rounded-lg border border-border pointer-events-none'>
													<div className='w-10 h-10 rounded bg-white border flex items-center justify-center overflow-hidden shrink-0'>
														{bossAvatar ? (
															<img
																src={bossAvatar}
																className='w-full h-full object-contain'
															/>
														) : (
															<span className='text-[10px] text-gray-500 font-bold'>
																D&D
															</span>
														)}
													</div>
													<InputField
														placeholder='ID Boss...'
														value={displayBossID}
														onChange={e => {
															const arr = [...formData.Bosses];
															arr[i].bossID = e.target.value;
															setFormData(p => ({ ...p, Bosses: arr }));
														}}
														readOnly={isResolvedBoss}
														className={`flex-1 pointer-events-auto ${isResolvedBoss ? "font-bold text-red-500" : ""}`}
														title={
															isResolvedBoss
																? `ID thực tế được lưu trữ: ${b.bossID}`
																: ""
														}
													/>
												</div>
											</div>

											{isResolvedBoss && (
												<div className='flex flex-col gap-2 mt-1'>
													<label className='block font-semibold text-[10px] uppercase text-text-secondary tracking-widest flex items-center gap-1.5'>
														<Zap size={12} className='text-yellow-500' /> Sức
														mạnh gốc của Boss
													</label>
													{bossPowers.length > 0 ? (
														<div className='flex flex-wrap gap-2'>
															{bossPowers.map((powerId, pIdx) => {
																const powerObj = (cachedData.powers || []).find(
																	p =>
																		(p.powerCode || p.id || p._id) === powerId,
																);
																const pName = powerObj
																	? powerObj.name ||
																		powerObj.powerName ||
																		powerId
																	: powerId;
																const pIcon = powerObj
																	? powerObj.assetAbsolutePath ||
																		powerObj.assetFullAbsolutePath
																	: null;
																return (
																	<div
																		key={pIdx}
																		className='flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/30 px-2 py-1.5 rounded-md shadow-sm'
																		title={powerId}
																	>
																		{pIcon ? (
																			<img
																				src={pIcon}
																				className='w-5 h-5 object-contain'
																				alt='power'
																			/>
																		) : (
																			<div className='w-5 h-5 bg-yellow-500/20 rounded flex items-center justify-center shrink-0'>
																				<Zap
																					size={12}
																					className='text-yellow-600 dark:text-yellow-500'
																				/>
																			</div>
																		)}
																		<span className='text-xs font-semibold text-yellow-700 dark:text-yellow-500 truncate max-w-[120px]'>
																			{pName}
																		</span>
																	</div>
																);
															})}
														</div>
													) : (
														<span className='text-xs text-text-secondary italic px-1'>
															Không có sức mạnh
														</span>
													)}
												</div>
											)}
										</div>

										<div className='w-full lg:w-3/4 flex flex-col gap-4'>
											<div className='flex flex-col flex-1'>
												<label className='block font-semibold text-sm text-text-secondary mb-2'>
													Chi tiết chiến thuật / Ghi chú (Hỗ trợ xuống dòng)
												</label>
												<textarea
													className='w-full flex-1 min-h-[120px] bg-surface-hover border border-border rounded-lg p-4 text-sm text-text-primary focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none resize-y transition-colors placeholder:text-text-secondary/50'
													placeholder='Nhập chi tiết hướng dẫn, cách đánh, lưu ý quan trọng khi gặp boss này...'
													value={b.note || ""}
													onChange={e => {
														const arr = [...formData.Bosses];
														arr[i].note = e.target.value;
														setFormData(p => ({ ...p, Bosses: arr }));
													}}
												/>
											</div>

											<div className='bg-yellow-500/5 p-4 rounded-xl border border-yellow-500/30 border-dashed mt-2'>
												<DragDropArrayInput
													label={`Bonus Power (Sức mạnh bổ sung riêng cho Boss này)`}
													data={b.mapBonusPower || []}
													onChange={arr => {
														const newBosses = [...formData.Bosses];
														newBosses[i].mapBonusPower = arr;
														setFormData(p => ({ ...p, Bosses: newBosses }));
													}}
													cachedList={cachedData.powers || []}
													placeholder='Kéo thả ID Power vào đây...'
												/>
											</div>
										</div>
									</div>
								);
							})}
							{(!formData.Bosses || formData.Bosses.length === 0) && (
								<div className='text-center py-10 text-text-secondary bg-surface-bg rounded-lg border border-dashed border-border'>
									Chưa có Boss nào. Hãy bấm "Thêm Boss" để bắt đầu.
								</div>
							)}
						</div>
					</section>

					<section className='bg-surface-bg border border-border rounded-xl p-6 shadow-sm space-y-6'>
						<div className='flex justify-between items-center border-l-4 border-red-500 pl-3'>
							<h3 className='text-lg font-bold uppercase flex items-center gap-2'>
								<MapIcon size={20} className='text-red-500' /> Thiết kế Cấu trúc
								Đường đi (Nodes)
							</h3>
							<div className='flex items-center gap-3'>
								<Button
									type='button'
									size='sm'
									variant='outline'
									onClick={() =>
										setNodeDisplayMode(prev =>
											prev === "icon" ? "dot" : "icon",
										)
									}
									iconLeft={
										nodeDisplayMode === "icon" ? (
											<CircleDot size={16} />
										) : (
											<ImageIcon size={16} />
										)
									}
								>
									{nodeDisplayMode === "icon" ? "Chế độ Chấm" : "Chế độ Icon"}
								</Button>

								<Button
									type='button'
									size='sm'
									variant='outline'
									onClick={() => setIsMapVisible(!isMapVisible)}
									iconLeft={
										isMapVisible ? <EyeOff size={16} /> : <Eye size={16} />
									}
								>
									{isMapVisible ? "Ẩn Bản đồ" : "Hiện Bản đồ"}
								</Button>
								<div className='flex items-center gap-2 bg-surface-hover/80 p-1.5 rounded-xl border border-border shrink-0 shadow-sm'>
									<span className='text-xs font-bold text-text-secondary pl-1.5 select-none'>Loại Node:</span>
									<select
										value={selectedNodeType}
										onChange={e => setSelectedNodeType(e.target.value)}
										className='bg-surface-bg border border-border rounded-lg px-2.5 py-1 text-xs text-text-primary outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 font-bold cursor-pointer transition-all'
									>
										<option value='Encounter'>⚔️ Encounter</option>
										<option value='Miniboss'>💀 Miniboss</option>
										<option value='Boss'>🔥 Boss</option>
										<option value='Power'>⚡ Power</option>
										<option value='Healer'>➕ Healer</option>
										<option value='Start'>🚩 Start</option>
										<option value='Shop'>🛒 Shop</option>
										<option value='Champion Node'>💎 Champion Node</option>
									</select>
									<Button
										type='button'
										size='sm'
										variant='primary'
										iconLeft={<Plus size={16} />}
										onClick={() => {
											const newIndex = (formData.nodes || []).length + 1;
											setFormData(p => ({
												...p,
												nodes: [
													...(p.nodes || []),
													{
														nodeID: `n${newIndex}`,
														nodeType: selectedNodeType,
														bosses: [],
														nextNodes: [],
														position: { x: 50, y: 50 },
													},
												],
											}));
										}}
									>
										Thêm Điểm (Node)
									</Button>
								</div>
							</div>
						</div>

						<div className='flex flex-col gap-8'>
							{isMapVisible && (
								<div className='space-y-4'>
									<div
										className='relative w-full bg-slate-950 rounded-2xl overflow-hidden border-2 border-border shadow-lg cursor-crosshair flex items-center justify-center'
										style={{ aspectRatio: mapAspectRatio }}
										ref={mapRef}
										onClick={handleMapClick}
										onContextMenu={handleMapContextMenu}
									>
										<img
											src={formData.background || "/images/placeholder-bg.jpg"}
											className='absolute inset-0 w-full h-full object-fill opacity-60'
											alt='Map Background'
											onLoad={e => {
												const { naturalWidth, naturalHeight } = e.target;
												if (naturalWidth && naturalHeight) {
													setMapAspectRatio(`${naturalWidth}/${naturalHeight}`);
												}
											}}
										/>
										<svg className='absolute inset-0 w-full h-full pointer-events-none'>
											<defs>
												<marker
													id='arrowhead-adv'
													markerWidth='6'
													markerHeight='6'
													refX='5.5'
													refY='3'
													orient='auto-start-reverse'
												>
													<path
														d='M0,0 L6,3 L0,6 L1.5,3 Z'
														fill='rgba(239, 68, 68, 0.9)'
													/>
												</marker>
											</defs>
											{(formData.nodes || []).map(node =>
												(node.nextNodes || []).map(tID => {
													const target = formData.nodes.find(
														n => n.nodeID === tID,
													);
													return (
														target && (
															<AdventureLine
																key={`${node.nodeID}-${tID}`}
																x1={node.position?.x ?? 0}
																y1={node.position?.y ?? 0}
																x2={target.position?.x ?? 0}
																y2={target.position?.y ?? 0}
																mapSize={mapSize}
															/>
														)
													);
												}),
											)}
										</svg>
										{(formData.nodes || []).map((n, i) => {
											const nodeInfo =
												NODE_TYPES_DATA.find(
													t => t.nodeType === (n.nodeType || "Encounter"),
												) || {};
											const isNodeBossOrMiniboss = (n.nodeType || "").toLowerCase().includes("boss");

											let bossImage = null;
											let singleBossName = "";
											if (n.bosses && n.bosses.length === 1) {
												const singleBossId = n.bosses[0];
												const bossData = (cachedData?.bosses || []).find(
													b => getUniqueAdvId(b) === singleBossId,
												);
												if (bossData) {
													bossImage = getAdvImage(bossData);
													singleBossName = getAdvName(bossData);
												}
											}

											if (nodeDisplayMode === "dot") {
												return (
													<div
														key={i}
														title={`${n.nodeID} - ${n.nodeType}${getBossNamesString(n.bosses)}\n${nodeInfo.description || ""}`}
														className={`absolute w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white transition-all cursor-pointer ${
															selectedNodeIndex === i
																? "bg-red-500 scale-150 z-30 shadow-[0_0_10px_rgba(239,68,68,1)]"
																: activeDragOverNodeIdx === i
																	? "bg-emerald-500 scale-150 z-35 shadow-[0_0_12px_rgba(16,185,129,1)]"
																	: "bg-blue-500 z-20 hover:scale-125 hover:bg-red-400"
														}`}
														style={{
															left: `${n.position?.x ?? 0}%`,
															top: `${n.position?.y ?? 0}%`,
														}}
														onClick={e => {
															e.stopPropagation();
															if ((e.ctrlKey || e.metaKey) && selectedNodeIndex !== null && selectedNodeIndex !== i) {
																const startIdx = selectedNodeIndex;
																setFormData(prev => {
																	const nextNodes = [...(prev.nodes || [])];
																	const startNode = nextNodes[startIdx];
																	const targetNode = nextNodes[i];
																	if (startNode && targetNode) {
																		const currentNext = startNode.nextNodes || [];
																		if (!currentNext.includes(targetNode.nodeID)) {
																			nextNodes[startIdx] = {
																				...startNode,
																				nextNodes: [...currentNext, targetNode.nodeID],
																			};
																		}
																	}
																	return { ...prev, nodes: nextNodes };
																});
															}
															setSelectedNodeIndex(i);
														}}
														onContextMenu={e => {
															e.stopPropagation();
															e.preventDefault();
															setSelectedNodeIndex(i);
														}}
														onDragEnter={e => {
															if (isNodeBossOrMiniboss) {
																e.preventDefault();
																setActiveDragOverNodeIdx(i);
															}
														}}
														onDragLeave={e => {
															if (activeDragOverNodeIdx === i) {
																setActiveDragOverNodeIdx(null);
															}
														}}
														onDragOver={e => {
															if (isNodeBossOrMiniboss) {
																e.preventDefault();
															}
														}}
														onDrop={e => {
															if (isNodeBossOrMiniboss) {
																handleDropBossOnMapNode(e, i);
																setActiveDragOverNodeIdx(null);
															}
														}}
													/>
												);
											}

											return (
												<div
													key={i}
													title={`${n.nodeID} - ${n.nodeType}${getBossNamesString(n.bosses)}\n${nodeInfo.description || ""}`}
													className={`absolute w-7 h-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
														selectedNodeIndex === i
															? "bg-red-500 border-white scale-125 z-30 shadow-[0_0_15px_rgba(239,68,68,0.8)]"
															: activeDragOverNodeIdx === i
																? "bg-emerald-600 border-emerald-400 scale-125 z-35 shadow-[0_0_15px_rgba(16,185,129,0.8)]"
																: "bg-black/80 border-white/60 z-20 hover:scale-110 hover:border-white"
													}`}
													style={{
														left: `${n.position?.x ?? 0}%`,
														top: `${n.position?.y ?? 0}%`,
													}}
													onClick={e => {
														e.stopPropagation();
														if ((e.ctrlKey || e.metaKey) && selectedNodeIndex !== null && selectedNodeIndex !== i) {
															const startIdx = selectedNodeIndex;
															setFormData(prev => {
																const nextNodes = [...(prev.nodes || [])];
																const startNode = nextNodes[startIdx];
																const targetNode = nextNodes[i];
																if (startNode && targetNode) {
																	const currentNext = startNode.nextNodes || [];
																	if (!currentNext.includes(targetNode.nodeID)) {
																		nextNodes[startIdx] = {
																			...startNode,
																			nextNodes: [...currentNext, targetNode.nodeID],
																		};
																	}
																}
																return { ...prev, nodes: nextNodes };
															});
														}
														setSelectedNodeIndex(i);
													}}
													onContextMenu={e => {
														e.stopPropagation();
														e.preventDefault();
														setSelectedNodeIndex(i);
													}}
													onDragEnter={e => {
														if (isNodeBossOrMiniboss) {
															e.preventDefault();
															setActiveDragOverNodeIdx(i);
														}
													}}
													onDragLeave={e => {
														if (activeDragOverNodeIdx === i) {
															setActiveDragOverNodeIdx(null);
														}
													}}
													onDragOver={e => {
														if (isNodeBossOrMiniboss) {
															e.preventDefault();
														}
													}}
													onDrop={e => {
														if (isNodeBossOrMiniboss) {
															handleDropBossOnMapNode(e, i);
															setActiveDragOverNodeIdx(null);
														}
													}}
												>
													{bossImage ? (
														<img
															src={bossImage}
															alt={singleBossName || "Boss"}
															className='w-full h-full object-cover rounded-full pointer-events-none'
														/>
													) : (
														getNodeIcon(n.nodeType)
													)}
													<span className='absolute -bottom-6 text-[10px] font-bold text-white bg-black/70 px-1.5 py-0.5 rounded shadow'>
														{n.nodeID || ""}
													</span>
												</div>
											);
										})}

										{/* Temporary indicator (pulsing red dot) at the exact right-click position */}
										{contextMenu && (
											<>
												<div
													className='absolute w-4.5 h-4.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500 border border-white pointer-events-none z-40 animate-ping shadow-[0_0_10px_rgba(239,68,68,1)]'
													style={{
														left: `${contextMenu.percentX}%`,
														top: `${contextMenu.percentY}%`,
													}}
												/>
												<div
													className='absolute w-3.5 h-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-600 border border-white pointer-events-none z-40 shadow-[0_0_8px_rgba(220,38,38,0.9)]'
													style={{
														left: `${contextMenu.percentX}%`,
														top: `${contextMenu.percentY}%`,
													}}
												/>
											</>
										)}

										{/* Custom Context Menu / Tooltip for Right-Click Node Creation */}
										{contextMenu && (
											<div
												className='absolute bg-slate-900/95 backdrop-blur-md border border-slate-700/60 rounded-xl shadow-2xl p-2 w-52 z-50 animate-in fade-in zoom-in-95 duration-150 flex flex-col gap-1'
												style={{
													left: `${contextMenu.x}px`,
													top: `${contextMenu.y}px`,
												}}
												onClick={e => e.stopPropagation()}
											>
												<div className='px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800/80 mb-1 flex justify-between items-center select-none'>
													<span>Tạo Node tại đây</span>
													<span className='font-mono text-slate-500'>
														{contextMenu.percentX}% {contextMenu.percentY}%
													</span>
												</div>
												<div
													className='overflow-y-auto custom-scrollbar flex flex-col gap-0.5'
													style={{ maxHeight: `${contextMenu.maxListHeight || 300}px` }}
												>
													{NODE_TYPES_DATA.map(type => (
														<button
															key={type.nodeType}
															type='button'
															className='flex items-center gap-2.5 w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors'
															onClick={() =>
																handleCreateNodeAtPos(
																	type.nodeType,
																	contextMenu.percentX,
																	contextMenu.percentY,
																)
															}
															title={type.description}
														>
															<span className='shrink-0 w-4 h-4 flex items-center justify-center'>
																{getNodeIcon(type.nodeType)}
															</span>
															<span className='truncate'>{type.nodeType}</span>
														</button>
													))}
												</div>
											</div>
										)}
									</div>
									<p className='text-xs text-text-secondary text-center italic'>
										Click chọn Node ở danh sách bên dưới, sau đó bấm lên bản đồ
										để di chuyển vị trí. Hover lên chấm tròn trên Map để xem
										thông tin Node.
									</p>
								</div>
							)}

							<div className='grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-4 max-h-[600px] overflow-y-auto pr-3 custom-scrollbar'>
								<div className='lg:col-span-2'>
									<AdventureConnections
										nodes={formData.nodes || []}
										onChangeNodes={newNodes =>
											setFormData(prev => ({ ...prev, nodes: newNodes }))
										}
									/>
								</div>
								{(formData.nodes || []).length === 0 ? (
									<div className='lg:col-span-2 text-center py-10 text-text-secondary border border-dashed border-border rounded-xl bg-surface-hover/30'>
										Chưa có Node nào trên bản đồ.
									</div>
								) : (
									(formData.nodes || []).map((node, idx) => (
										<AdventureNodeEditor
											key={node.nodeID || idx}
											index={idx}
											node={node}
											isSelected={selectedNodeIndex === idx}
											onSelect={setSelectedNodeIndex}
											onChange={handleNodeChange}
											onRemove={i => {
												setFormData(prev => ({
													...prev,
													nodes: prev.nodes.filter((_, idx2) => idx2 !== i),
												}));
												setSelectedNodeIndex(current => {
													if (current === i) return null;
													if (current > i) return current - 1;
													return current;
												});
											}}
											cachedData={cachedData}
										/>
									))
								)}
							</div>
						</div>
					</section>


					<section className='bg-surface-hover/30 p-5 rounded-xl border border-border shadow-sm'>
						<div className='flex justify-between items-center mb-6 border-b border-border pb-3'>
							<div className='space-y-1'>
								<h3 className='font-bold text-lg border-l-4 border-yellow-500 pl-3'>
									Phần thưởng (Rewards)
								</h3>
								<p className='text-xs text-text-secondary pl-3'>
									Số lượng gói phần thưởng được tự động đồng bộ theo Yêu cầu tham gia (Champions + Regions).
								</p>
							</div>
						</div>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
							{(() => {
								const flattenedRequirements = [
									...(formData.requirement?.champions || []).map(cID => {
										const champ = (cachedData.champions || []).find(
											c => c.championCode === cID,
										);
										return {
											type: "champion",
											label: champ ? champ.name || champ.championName : cID,
											icon: champ?.assetAbsolutePath || champ?.assetFullAbsolutePath,
										};
									}),
									...(formData.requirement?.regions || []).map(rName => ({
										type: "region",
										label: `Tướng vùng ${rName}`,
										icon: null,
									})),
								];

								return (formData.rewards || []).map((rewardPacket, pIdx) => {
									const linkedReq = flattenedRequirements[pIdx];
									return (
										<div
											key={pIdx}
											className='bg-surface-bg p-5 border border-border rounded-xl shadow-sm flex flex-col gap-4'
										>
											<div className='flex justify-between items-center mb-2 border-b border-border/50 pb-3'>
												<div className='flex items-center gap-2.5 max-w-[75%]'>
													<span className='font-black text-yellow-500 text-sm tracking-wider uppercase shrink-0'>
														GÓI THƯỞNG #{pIdx + 1}
													</span>
													{linkedReq ? (
														<span className='inline-flex items-center gap-1.5 px-2 py-0.5 bg-primary-500/10 text-primary-500 text-[10px] font-bold rounded-lg border border-primary-500/20 truncate' title={`Mở khóa bằng: ${linkedReq.label}`}>
															{linkedReq.icon && (
																<img
																	src={linkedReq.icon}
																	className='w-3.5 h-3.5 object-contain rounded-md shrink-0'
																	alt=''
																/>
															)}
															<span className='truncate'>Mở khóa: {linkedReq.label}</span>
														</span>
													) : (
														<span className='inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 text-[10px] font-bold rounded-lg border border-yellow-500/20 shrink-0'>
															Hoàn thành mặc định
														</span>
													)}
												</div>
												<Button
													type='button'
													variant='outline'
													size='sm'
													onClick={() => {
														const r = [...formData.rewards];
														r[pIdx].items.push({ name: "", count: 1 });
														setFormData(p => ({ ...p, rewards: r }));
													}}
												>
													<Plus size={14} className='mr-1' /> Vật phẩm
												</Button>
											</div>

											<div className='space-y-3'>
												{rewardPacket.items.map((it, iIdx) => {
													const rewardInfo = getRegionalRewardInfo(it.name);
													const hasRegionOption = !!rewardInfo.base;
													const selectValue = rewardInfo.base || (COMMON_REWARDS.some(opt => opt.value === it.name) ? it.name : "");

													return (
														<div
															key={iIdx}
															className='flex flex-col gap-2 bg-surface-hover/30 p-3 rounded-xl border border-border/50 hover:bg-surface-hover transition-colors'
														>
															<div className='flex gap-2 w-full'>
																{/* Cột chọn mẫu */}
																<div className='flex-1 min-w-0'>
																	<select
																		className='w-full bg-surface-bg border border-border rounded-xl px-2.5 py-1.5 text-xs text-text-primary outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all font-semibold cursor-pointer'
																		value={selectValue}
																		onChange={e => {
																			const selectedVal = e.target.value;
																			if (selectedVal) {
																				const r = [...formData.rewards];
																				const isRegionalBase = REGIONAL_REWARD_BASES.includes(selectedVal);
																				if (isRegionalBase) {
																					const currentRegion = rewardInfo.region || "";
																					r[pIdx].items[iIdx].name = selectedVal + (currentRegion ? " " + currentRegion : "");
																				} else {
																					r[pIdx].items[iIdx].name = selectedVal;
																				}
																				
																				if (selectedVal === "Điểm Huyền Thoại") {
																					r[pIdx].items[iIdx].count = 1000;
																				} else if (selectedVal === "Bụi Tinh Tú") {
																					r[pIdx].items[iIdx].count = 100;
																				} else if (selectedVal === "Mảnh Ghép Bí Ẩn") {
																					r[pIdx].items[iIdx].count = 5;
																				} else {
																					r[pIdx].items[iIdx].count = 1;
																				}
																				setFormData(p => ({ ...p, rewards: r }));
																			}
																		}}
																	>
																		<option value=''>-- Chọn mẫu --</option>
																		{COMMON_REWARDS.map(opt => (
																			<option key={opt.value} value={opt.value}>
																				{opt.label}
																			</option>
																		))}
																	</select>
																</div>

																{/* Cột chọn vùng (nếu có) */}
																{hasRegionOption && (
																	<div className='flex-1 min-w-0'>
																		<select
																			className='w-full bg-surface-bg border border-border rounded-xl px-2.5 py-1.5 text-xs text-text-primary outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all font-semibold cursor-pointer'
																			value={rewardInfo.region}
																			onChange={e => {
																				const newRegion = e.target.value;
																				const r = [...formData.rewards];
																				r[pIdx].items[iIdx].name = rewardInfo.base + (newRegion ? " " + newRegion : "");
																				setFormData(p => ({ ...p, rewards: r }));
																			}}
																		>
																			<option value=''>-- Không vùng --</option>
																			{REGION_OPTIONS.map(opt => (
																				<option key={opt.value} value={opt.value}>
																					{opt.label}
																				</option>
																			))}
																		</select>
																	</div>
																)}
															</div>

															<div className='flex gap-2 w-full items-center'>
																{/* Cột tên vật phẩm hiển thị/nhập tay */}
																<div className='flex-1 min-w-0'>
																	<InputField
																		placeholder='Tên vật phẩm...'
																		value={it.name}
																		onChange={e => {
																			const r = [...formData.rewards];
																			r[pIdx].items[iIdx].name = e.target.value;
																			setFormData(p => ({ ...p, rewards: r }));
																		}}
																		className='w-full text-xs'
																	/>
																</div>

																{/* Số lượng */}
																<div className='w-20 shrink-0'>
																	<InputField
																		type='number'
																		placeholder='SL'
																		value={it.count}
																		onChange={e => {
																			const r = [...formData.rewards];
																			r[pIdx].items[iIdx].count = Number(e.target.value);
																			setFormData(p => ({ ...p, rewards: r }));
																		}}
																		className='w-full text-xs'
																	/>
																</div>

																{/* Nút xóa */}
																<Button
																	type='button'
																	variant='ghost'
																	className='text-red-500 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-lg shrink-0 transition-colors'
																	onClick={() => {
																		const r = [...formData.rewards];
																		r[pIdx].items.splice(iIdx, 1);
																		setFormData(p => ({ ...p, rewards: r }));
																	}}
																>
																	<Trash2 size={16} />
																</Button>
															</div>
														</div>
													);
												})}
												{(!rewardPacket.items || rewardPacket.items.length === 0) && (
													<p className='text-xs text-text-secondary italic text-center py-4 bg-surface-hover/20 rounded-xl border border-dashed border-border/50'>
														Gói này chưa có vật phẩm nào. Bấm "Vật phẩm" để bổ sung.
													</p>
												)}
											</div>
										</div>
									);
								});
							})()}
						</div>
					</section>
				</div>
			</form>
		);
	},
);

export default AdventureMapEditorForm;
