// src/pages/admin/championEditorForm.jsx
import { useState, memo, useEffect, useCallback, useRef, useMemo } from "react";
import Button from "../common/button";
import InputField from "../common/inputField";
import Modal from "../common/modal";
import {
	XCircle,
	Plus,
	Link2,
	Map as MapIcon,
	Star,
	Gem,
	ChevronDown,
	ChevronUp,
	Crosshair,
	Sparkles,
	Youtube,
} from "lucide-react";

// --- THÀNH PHẦN HỖ TRỢ: ĐƯỜNG NỐI CHÒM SAO ---
const ConstellationLine = ({ x1, y1, x2, y2, isRecommended }) => {
	const angle = Math.atan2(y2 - y1, x2 - x1);
	const offset = window.innerWidth < 640 ? 1.5 : 3.0;
	const finalX2 = x2 - offset * Math.cos(angle);
	const finalY2 = y2 - offset * Math.sin(angle);

	return (
		<line
			x1={`${x1}%`}
			y1={`${y1}%`}
			x2={`${finalX2}%`}
			y2={`${finalY2}%`}
			stroke={
				isRecommended ? "rgba(234, 179, 8, 1)" : "rgba(234, 179, 8, 0.25)"
			}
			strokeWidth={isRecommended ? "3" : "1.5"}
			strokeDasharray={isRecommended ? "0" : "8,4"}
			markerEnd={`url(#${isRecommended ? "arrowhead-recommended" : "arrowhead"})`}
			className={
				isRecommended ? "drop-shadow-[0_0_8px_rgba(234, 179, 8, 1)]" : ""
			}
		/>
	);
};

// --- THÀNH PHẦN HỖ TRỢ: NHẬP MẢNG (Items, Relics, Powers...) ---
const ArrayInputComponent = ({
	label,
	data = [],
	onChange,
	cachedData = {},
	placeholder = "Nhập tên hoặc kéo thả vào đây",
}) => {
	const handleItemChange = (index, newValue) => {
		const newData = [...data];
		newData[index] = newValue;
		onChange(newData);
	};

	const handleAddItem = () => onChange([...data, ""]);
	const handleRemoveItem = index =>
		onChange(data.filter((_, i) => i !== index));
	const getItemData = name => cachedData[name] || {};

	const handleDrop = (e, index) => {
		e.preventDefault();
		try {
			const dragged = JSON.parse(e.dataTransfer.getData("text/plain"));
			if (dragged.name) handleItemChange(index, dragged.name.trim());
		} catch (err) {
			console.warn("Drag data không hợp lệ");
		}
	};

	return (
		<div className='flex flex-col gap-3'>
			<div className='flex justify-between items-center'>
				<label className='font-semibold text-text-primary uppercase text-xs tracking-wider'>
					{label}
				</label>
				<Button
					type='button'
					variant='outline'
					size='sm'
					onClick={handleAddItem}
					iconLeft={<Plus size={16} />}
				>
					Thêm
				</Button>
			</div>
			<div className='space-y-2'>
				{data.length === 0 ? (
					<p className='text-center text-sm text-text-secondary py-4 bg-surface-hover/50 rounded-lg border border-dashed border-border'>
						Chưa có dữ liệu
					</p>
				) : (
					data.map((value, index) => {
						const item = getItemData((value || "").trim());
						return (
							<div
								key={index}
								className='flex items-center gap-3 p-3 bg-surface-hover rounded-lg border border-border hover:border-primary-500 transition-all'
								onDrop={e => handleDrop(e, index)}
								onDragOver={e => e.preventDefault()}
							>
								<div className='w-10 h-10 rounded bg-white border flex items-center justify-center overflow-hidden'>
									{item.assetAbsolutePath ? (
										<img
											src={item.assetAbsolutePath}
											className='w-full h-full object-contain'
										/>
									) : (
										<span className='text-xs text-gray-500'>?</span>
									)}
								</div>
								<InputField
									value={value || ""}
									onChange={e => handleItemChange(index, e.target.value)}
									placeholder={placeholder}
									className='flex-1'
								/>
								<button
									type='button'
									onClick={() => handleRemoveItem(index)}
									className='text-red-500 hover:text-red-600'
								>
									<XCircle size={20} />
								</button>
							</div>
						);
					})
				)}
			</div>
		</div>
	);
};

// --- THÀNH PHẦN HỖ TRỢ: NHẬP LIÊN KẾT NODE ---
const NextNodesInput = ({ nextNodes = [], onChange }) => {
	const addItem = () => onChange([...nextNodes, ""]);
	const removeItem = idx => onChange(nextNodes.filter((_, i) => i !== idx));
	const updateItem = (idx, val) => {
		const next = [...nextNodes];
		next[idx] = val;
		onChange(next);
	};

	return (
		<div className='space-y-2 mt-3 p-3 bg-surface-hover/30 rounded-lg border border-border/50'>
			<div className='flex justify-between items-center'>
				<label className='text-[10px] font-bold uppercase text-text-secondary tracking-widest'>
					Liên kết đến Nodes
				</label>
				<button
					type='button'
					onClick={addItem}
					className='text-primary-500 text-[10px] font-bold hover:underline'
				>
					+ Thêm liên kết
				</button>
			</div>
			{nextNodes.map((nodeID, idx) => (
				<div key={idx} className='flex gap-2 items-center'>
					<InputField
						value={nodeID || ""}
						onChange={e => updateItem(idx, e.target.value)}
						placeholder='Nhập Node ID (VD: n2)'
						className='flex-1'
					/>
					<button
						type='button'
						onClick={() => removeItem(idx)}
						className='text-red-500'
					>
						<XCircle size={16} />
					</button>
				</div>
			))}
		</div>
	);
};

// --- THÀNH PHẦN HỖ TRỢ: NHẬP YÊU CẦU MỞ KHÓA ---
const RequirementsInput = ({ requirements = [], onChange }) => {
	const addItem = () =>
		onChange([...requirements, { type: "Fragment", value: 10 }]);
	const removeItem = idx => onChange(requirements.filter((_, i) => i !== idx));
	const updateItem = (idx, field, val) => {
		const next = [...requirements];
		next[idx] = { ...next[idx], [field]: val };
		onChange(next);
	};

	return (
		<div className='space-y-2 mt-3 p-3 bg-surface-hover/30 rounded-lg border border-border/50'>
			<div className='flex justify-between items-center'>
				<label className='text-[10px] font-bold uppercase text-text-secondary tracking-widest'>
					Yêu cầu mở khóa
				</label>
				<button
					type='button'
					onClick={addItem}
					className='text-primary-500 text-[10px] font-bold hover:underline'
				>
					+ Thêm yêu cầu
				</button>
			</div>
			{requirements.map((req, idx) => (
				<div key={idx} className='flex gap-2 items-center'>
					<select
						value={req.type || "Fragment"}
						onChange={e => updateItem(idx, "type", e.target.value)}
						className='text-xs p-1.5 border rounded bg-surface-bg flex-1 outline-none'
					>
						<option value='Fragment'>Mảnh tướng</option>
						<option value='Crystal'>Tinh thể</option>
						<option value='Nova Crystal'>Tinh thể Nova</option>
						<option value='Gemstone'>Đá quý</option>
					</select>
					<input
						type='number'
						value={req.value ?? 0}
						onChange={e =>
							updateItem(idx, "value", parseInt(e.target.value) || 0)
						}
						className='text-xs p-1.5 border rounded bg-surface-bg w-20 outline-none'
					/>
					<button
						type='button'
						onClick={() => removeItem(idx)}
						className='text-red-500'
					>
						<XCircle size={16} />
					</button>
				</div>
			))}
		</div>
	);
};

// --- THÀNH PHẦN HỖ TRỢ: CHỈNH SỬA NODE ---
const NodeEditor = ({
	node,
	index,
	isSelected,
	onSelect,
	onChange,
	onMultiChange,
	onRemove,
	cachedData,
}) => {
	const [isOpen, setIsOpen] = useState(true);

	const nodeAsset = useMemo(() => {
		const name = node.nodeName?.trim();
		if (!name) return null;
		const power = (cachedData.powers || []).find(p => p.name === name);
		if (power) return power.assetAbsolutePath;
		const bonus = (cachedData.bonusStars || []).find(b => b.name === name);
		if (bonus) return bonus.image;
		return null;
	}, [node.nodeName, cachedData]);

	const handleDropIntoNode = e => {
		e.preventDefault();
		try {
			const dragged = JSON.parse(e.dataTransfer.getData("text/plain"));
			if (
				dragged.name &&
				(dragged.type === "power" || dragged.type === "bonusStar")
			) {
				const updates = { nodeName: dragged.name };
				const item =
					dragged.type === "power"
						? (cachedData.powers || []).find(p => p.name === dragged.name)
						: (cachedData.bonusStars || []).find(b => b.name === dragged.name);
				updates.description = item?.descriptionRaw || item?.description || "";
				onMultiChange(index, updates);
			}
		} catch (err) {
			console.warn("Lỗi kéo thả vào Node");
		}
	};

	return (
		<div
			className={`border rounded-xl overflow-hidden mb-4 transition-all ${isSelected ? "border-primary-500 ring-2 ring-primary-500/20 shadow-md" : "border-border shadow-sm"}`}
		>
			<div
				className={`flex justify-between items-center p-3 cursor-pointer ${isSelected ? "bg-primary-500/10" : "bg-surface-hover"}`}
				onClick={() => onSelect(index)}
			>
				<div className='flex items-center gap-3'>
					<div
						className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${isSelected ? "bg-primary-500 text-white" : "bg-border text-text-secondary"}`}
					>
						{node.nodeID || `n${index + 1}`}
					</div>
					<div className='flex flex-col'>
						<span className='font-bold text-sm truncate max-w-[150px]'>
							{node.nodeName || "Node chưa đặt tên"}
						</span>
						<span className='text-[10px] uppercase text-text-secondary font-medium'>
							{node.nodeType || "starPower"}
						</span>
					</div>
				</div>
				<div className='flex items-center gap-1'>
					<button
						type='button'
						onClick={e => {
							e.stopPropagation();
							onRemove(index);
						}}
						className='p-2 text-red-500 hover:bg-red-500/10 rounded-full'
					>
						<XCircle size={18} />
					</button>
					<button
						type='button'
						onClick={e => {
							e.stopPropagation();
							setIsOpen(!isOpen);
						}}
						className='p-2 text-text-secondary'
					>
						{isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
					</button>
				</div>
			</div>

			{isOpen && (
				<div className='p-4 space-y-4 bg-surface-bg border-t border-border/50'>
					<div className='grid grid-cols-2 gap-3'>
						<InputField
							label='Mã Node (ID)'
							value={node.nodeID || ""}
							onChange={e => onChange(index, "nodeID", e.target.value)}
							placeholder='VD: n1'
						/>
						<div className='flex flex-col gap-1'>
							<label className='text-[10px] font-bold uppercase text-text-secondary'>
								Loại sức mạnh
							</label>
							<select
								value={node.nodeType || "starPower"}
								onChange={e => onChange(index, "nodeType", e.target.value)}
								className='w-full p-2.5 rounded-lg border border-border bg-surface-bg text-sm outline-none'
							>
								<option value='starPower'>Star Power</option>
								<option value='bonusStar'>Bonus Star</option>
								<option value='bonusStarGem'>Bonus Gem</option>
							</select>
						</div>
					</div>

					<div
						className='flex items-center gap-3 p-3 bg-surface-hover/50 rounded-lg border border-border'
						onDrop={handleDropIntoNode}
						onDragOver={e => e.preventDefault()}
					>
						<div className='w-10 h-10 rounded bg-white border flex items-center justify-center overflow-hidden'>
							{nodeAsset ? (
								<img src={nodeAsset} className='w-full h-full object-contain' />
							) : (
								<span className='text-[10px] font-bold text-gray-400'>D&D</span>
							)}
						</div>
						<InputField
							label='Tên hiển thị'
							value={node.nodeName || ""}
							onChange={e => onChange(index, "nodeName", e.target.value)}
							placeholder='Kéo thả tài nguyên vào đây...'
							className='flex-1'
						/>
					</div>

					<div className='flex flex-col gap-1'>
						<label className='text-[10px] font-bold uppercase text-text-secondary'>
							Mô tả kỹ năng node
						</label>
						<textarea
							value={node.description || ""}
							onChange={e => onChange(index, "description", e.target.value)}
							rows={3}
							className='w-full p-3 border border-border rounded-lg bg-surface-bg text-xs outline-none resize-none'
							placeholder='Mô tả tự điền...'
						/>
					</div>

					<div className='flex items-center justify-between p-3 bg-surface-hover/30 rounded-lg border border-dashed border-border'>
						<label className='flex items-center gap-3 cursor-pointer group'>
							<div
								className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${node.isRecommended ? "bg-yellow-500 border-yellow-500" : "bg-surface-bg border-border"}`}
							>
								{node.isRecommended && (
									<Sparkles size={12} className='text-white fill-current' />
								)}
							</div>
							<input
								type='checkbox'
								className='hidden'
								checked={node.isRecommended || false}
								onChange={e =>
									onChange(index, "isRecommended", e.target.checked)
								}
							/>
							<span
								className={`text-xs font-bold uppercase ${node.isRecommended ? "text-yellow-600" : "text-text-secondary"}`}
							>
								Khuyên dùng
							</span>
						</label>
						<div className='text-[10px] font-mono text-text-secondary bg-surface-bg px-2 py-1 rounded border'>
							X:{node.position?.x ?? 0}% Y:{node.position?.y ?? 0}%
						</div>
					</div>

					<NextNodesInput
						nextNodes={node.nextNodes || []}
						onChange={val => onChange(index, "nextNodes", val)}
					/>
					<RequirementsInput
						requirements={node.requirements || []}
						onChange={val => onChange(index, "requirements", val)}
					/>
				</div>
			)}
		</div>
	);
};

// ==========================================
// COMPONENT CHÍNH: CHAMPION EDITOR FORM
// ==========================================
const ChampionEditorForm = memo(
	({
		champion,
		constellation,
		cachedData,
		onSave,
		onCancel,
		onDelete,
		isSaving,
	}) => {
		const [formData, setFormData] = useState({});
		const [constData, setConstData] = useState({ nodes: [] });
		const [initialData, setInitialData] = useState({});
		const [isDirty, setIsDirty] = useState(false);
		const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
		const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
		const [selectedNodeIndex, setSelectedNodeIndex] = useState(null);
		const mapRef = useRef(null);

		// Tự động đồng bộ hóa ConstellationID khi thay đổi ChampionID (Quan trọng để fix lỗi 500)
		useEffect(() => {
			if (
				formData.championID &&
				constData.constellationID !== formData.championID
			) {
				setConstData(prev => ({
					...prev,
					constellationID: formData.championID,
				}));
			}
		}, [formData.championID, constData.constellationID]);

		useEffect(() => {
			if (champion) {
				const processedData = { ...champion };
				if (typeof processedData.description === "string") {
					processedData.description = processedData.description
						.replace(/\\\\n/g, "\n")
						.replace(/\\n/g, "\n");
				}
				setFormData(processedData);
				setInitialData(JSON.parse(JSON.stringify(processedData)));
				setIsDirty(false);

				if (constellation) {
					setConstData(JSON.parse(JSON.stringify(constellation)));
				} else {
					setConstData({
						constellationID: champion.championID || "",
						championName: champion.name || "",
						backgroundImage: champion.assets?.[0]?.fullAbsolutePath || "",
						nodes: [],
					});
				}
			}
		}, [champion, constellation]);

		useEffect(() => {
			setIsDirty(JSON.stringify(formData) !== JSON.stringify(initialData));
		}, [formData, initialData]);

		const handleInputChange = e => {
			const { name, value } = e.target;
			setFormData(prev => ({ ...prev, [name]: value }));
		};

		const handleMapClick = e => {
			if (selectedNodeIndex === null || !mapRef.current) return;
			const rect = mapRef.current.getBoundingClientRect();
			const x = parseFloat(
				(((e.clientX - rect.left) / rect.width) * 100).toFixed(1),
			);
			const y = parseFloat(
				(((e.clientY - rect.top) / rect.height) * 100).toFixed(1),
			);

			setConstData(prev => {
				const nextNodes = [...prev.nodes];
				nextNodes[selectedNodeIndex] = {
					...nextNodes[selectedNodeIndex],
					position: { x, y },
				};
				return { ...prev, nodes: nextNodes };
			});
		};

		const handleNodeChange = useCallback((idx, field, val) => {
			setConstData(prev => {
				const nextNodes = [...prev.nodes];
				nextNodes[idx] = { ...nextNodes[idx], [field]: val };
				return { ...prev, nodes: nextNodes };
			});
		}, []);

		const handleNodeMultiChange = useCallback((idx, updates) => {
			setConstData(prev => {
				const nextNodes = [...prev.nodes];
				nextNodes[idx] = { ...nextNodes[idx], ...updates };
				return { ...prev, nodes: nextNodes };
			});
		}, []);

		const handleSubmit = e => {
			e.preventDefault();
			if (!formData.championID?.trim())
				return alert("Vui lòng nhập Champion ID!");

			const cleanData = { ...formData };
			cleanData.powerStars = constData.nodes
				.filter(n => n.nodeType === "starPower")
				.map(n => n.nodeName);
			cleanData.bonusStars = constData.nodes
				.filter(n => n.nodeType !== "starPower")
				.map(n => n.nodeName);

			if (typeof cleanData.description === "string")
				cleanData.description = cleanData.description.replace(/\n/g, "\\n");

			// Chuẩn hóa mảng và đồng bộ ID cuối cùng
			const finalConstData = {
				...constData,
				constellationID: cleanData.championID.trim(),
				championName: cleanData.name,
			};

			onSave(cleanData, finalConstData);
		};

		const dataLookup = {
			powers: Object.fromEntries(
				(cachedData.powers || []).map(p => [p.name, p]),
			),
			relics: Object.fromEntries(
				(cachedData.relics || []).map(r => [r.name, r]),
			),
			items: Object.fromEntries((cachedData.items || []).map(i => [i.name, i])),
			runes: Object.fromEntries((cachedData.runes || []).map(r => [r.name, r])),
		};

		return (
			<>
				<form onSubmit={handleSubmit} className='space-y-8 pb-24'>
					<div className='flex justify-between border-border sticky top-0 bg-surface-bg z-40 py-2 border-b mb-4 shadow-sm px-4'>
						<div>
							<label className='block font-semibold text-text-primary text-xl'>
								{formData.isNew
									? "Tạo Tướng Mới"
									: `Biên tập: ${formData.name || ""}`}
							</label>
							{isDirty && (
								<span className='text-xs text-yellow-500 font-medium'>
									{" "}
									● Có thay đổi chưa lưu{" "}
								</span>
							)}
						</div>
						<div className='flex items-center gap-3'>
							<Button
								type='button'
								variant='ghost'
								onClick={() =>
									isDirty ? setIsCancelModalOpen(true) : onCancel()
								}
							>
								Hủy
							</Button>
							{champion && !champion.isNew && (
								<Button
									type='button'
									variant='danger'
									onClick={() => setIsDeleteModalOpen(true)}
								>
									Xóa tướng
								</Button>
							)}
							<Button type='submit' variant='primary' disabled={isSaving}>
								{isSaving ? "Đang lưu..." : "Lưu & Đồng bộ"}
							</Button>
						</div>
					</div>

					<div className='px-6 grid grid-cols-1 xl:grid-cols-2 gap-10'>
						<div className='space-y-8'>
							<h3 className='text-lg font-bold border-l-4 border-primary-500 pl-3 uppercase'>
								Thông tin Guide
							</h3>
							<div className='grid grid-cols-1 gap-6 p-6 bg-surface-bg border border-border rounded-xl shadow-sm'>
								<div className='space-y-5'>
									<InputField
										label='Champion ID (VD: C056)'
										name='championID'
										value={formData.championID || ""}
										onChange={handleInputChange}
										required
										disabled={!formData.isNew}
									/>
									<InputField
										label='Tên tướng'
										name='name'
										value={formData.name || ""}
										onChange={handleInputChange}
										required
									/>
									<div className='grid grid-cols-2 gap-4'>
										<InputField
											label='Năng lượng'
											name='cost'
											type='number'
											value={formData.cost ?? 0}
											onChange={e =>
												setFormData({
													...formData,
													cost: parseInt(e.target.value) || 0,
												})
											}
										/>
										<InputField
											label='Sao tối đa'
											name='maxStar'
											type='number'
											value={formData.maxStar ?? 3}
											onChange={e =>
												setFormData({
													...formData,
													maxStar: parseInt(e.target.value) || 0,
												})
											}
										/>
									</div>
								</div>
								<div className='flex flex-col items-center justify-center p-4 bg-surface-hover rounded-xl border border-dashed border-border'>
									{formData.assets?.[0]?.avatar ? (
										<img
											src={formData.assets[0].avatar}
											className='w-32 h-32 object-contain rounded-xl border-4 border-primary-500/20 shadow-xl'
										/>
									) : (
										<div className='w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center text-4xl text-gray-400'>
											?
										</div>
									)}
								</div>
							</div>

							<div className='space-y-6'>
								<div className='space-y-2'>
									<label className='block font-semibold text-text-primary flex items-center gap-2'>
										<Youtube size={18} className='text-red-500' /> YouTube Video
										Link
									</label>
									<InputField
										name='videoLink'
										value={formData.videoLink || ""}
										onChange={handleInputChange}
										placeholder='https://www.youtube.com/embed/...'
									/>
								</div>
								<div className='flex flex-col gap-2'>
									<label className='block font-semibold text-text-primary'>
										Mô tả hướng dẫn chơi
									</label>
									<textarea
										name='description'
										value={formData.description || ""}
										onChange={handleInputChange}
										className='w-full p-4 rounded-lg border border-border bg-surface-bg text-text-primary text-sm min-h-[300px]'
									/>
								</div>
							</div>

							<div className='space-y-6'>
								<ArrayInputComponent
									label='Sức mạnh Phiêu lưu'
									data={formData.adventurePowers || []}
									onChange={d =>
										setFormData({ ...formData, adventurePowers: d })
									}
									cachedData={dataLookup.powers}
								/>
								<ArrayInputComponent
									label='Vật phẩm mặc định'
									data={formData.defaultItems || []}
									onChange={d => setFormData({ ...formData, defaultItems: d })}
									cachedData={dataLookup.items}
								/>
							</div>
						</div>

						<div className='space-y-8'>
							<div className='flex justify-between items-center border-l-4 border-pink-500 pl-3'>
								<h3 className='text-lg font-bold uppercase flex items-center gap-2'>
									<MapIcon size={20} className='text-pink-500' /> Bản đồ Chòm
									sao
								</h3>
								<Button
									type='button'
									size='sm'
									variant='outline'
									onClick={() => {
										const newID = `n${constData.nodes.length + 1}`;
										setConstData({
											...constData,
											nodes: [
												...constData.nodes,
												{
													nodeID: newID,
													nodeName: "",
													nodeType: "starPower",
													position: { x: 50, y: 50 },
													nextNodes: [],
													requirements: [],
													description: "",
													isRecommended: false,
												},
											],
										});
									}}
									iconLeft={<Plus size={16} />}
								>
									Thêm Node
								</Button>
							</div>

							<div className='space-y-4'>
								<div
									className='relative aspect-video bg-slate-950 rounded-2xl overflow-hidden border-2 border-border shadow-2xl cursor-crosshair'
									ref={mapRef}
									onClick={handleMapClick}
								>
									<img
										src={
											constData.backgroundImage || "/images/placeholder-bg.jpg"
										}
										className='w-full h-full object-cover opacity-50'
									/>
									<svg className='absolute inset-0 w-full h-full pointer-events-none'>
										<defs>
											<marker
												id='arrowhead'
												markerWidth='5'
												markerHeight='5'
												refX='4.8'
												refY='2.5'
												orient='auto'
											>
												<path
													d='M0,0 L5,2.5 L0,5 Z'
													fill='rgba(234, 179, 8, 0.6)'
												/>
											</marker>
											<marker
												id='arrowhead-recommended'
												markerWidth='5'
												markerHeight='5'
												refX='4.8'
												refY='2.5'
												orient='auto'
											>
												<path
													d='M0,0 L5,2.5 L0,5 Z'
													fill='rgba(234, 179, 8, 1)'
												/>
											</marker>
										</defs>
										{constData.nodes.map(node =>
											node.nextNodes?.map(tID => {
												const target = constData.nodes.find(
													n => n.nodeID === tID,
												);
												return (
													target && (
														<ConstellationLine
															key={`${node.nodeID}-${tID}`}
															x1={node.position?.x ?? 0}
															y1={node.position?.y ?? 0}
															x2={target.position?.x ?? 0}
															y2={target.position?.y ?? 0}
															isRecommended={
																node.isRecommended && target.isRecommended
															}
														/>
													)
												);
											}),
										)}
									</svg>
									{constData.nodes.map((n, i) => (
										<div
											key={i}
											className={`absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 flex items-center justify-center transition-all ${selectedNodeIndex === i ? "bg-primary-500 border-white scale-125 z-30 shadow-[0_0_10px_white]" : "bg-white/10 border-white/40 z-20"}`}
											style={{
												left: `${n.position?.x ?? 0}%`,
												top: `${n.position?.y ?? 0}%`,
											}}
										>
											{n.nodeType === "starPower" ? (
												<Star size={10} className='text-white fill-current' />
											) : (
												<Gem size={10} className='text-white fill-current' />
											)}
											<span className='absolute -bottom-5 text-[8px] font-bold text-white bg-black/40 px-1 rounded'>
												{n.nodeID || ""}
											</span>
										</div>
									))}
								</div>
								<InputField
									label='URL Ảnh nền bản đồ'
									value={constData.backgroundImage || ""}
									onChange={e =>
										setConstData({
											...constData,
											backgroundImage: e.target.value,
										})
									}
									placeholder='Nhập link ảnh...'
								/>
							</div>

							<div className='space-y-2 max-h-[800px] overflow-y-auto pr-3 custom-scrollbar'>
								{(constData.nodes || []).map((node, idx) => (
									<NodeEditor
										key={idx}
										index={idx}
										node={node}
										isSelected={selectedNodeIndex === idx}
										onSelect={setSelectedNodeIndex}
										onChange={handleNodeChange}
										onMultiChange={handleNodeMultiChange}
										onRemove={i => {
											setConstData({
												...constData,
												nodes: constData.nodes.filter((_, idx) => idx !== i),
											});
											if (selectedNodeIndex === i) setSelectedNodeIndex(null);
										}}
										cachedData={cachedData}
									/>
								))}
							</div>
						</div>
					</div>

					{/* Asset Management Section */}
					<div className='pt-10 border-t px-6 space-y-10'>
						<h4 className='text-lg font-bold flex items-center gap-2'>
							<Link2 size={20} /> Quản lý Assets
						</h4>
						<div className='grid grid-cols-1 gap-4'>
							{(formData.assets || []).map((asset, index) => (
								<div
									key={index}
									className='flex flex-col md:flex-row items-center gap-6 p-6 bg-surface-hover/30 rounded-xl border border-border relative group'
								>
									<div className='grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 w-full'>
										{["avatar", "fullAbsolutePath", "gameAbsolutePath"].map(
											field => (
												<div key={field} className='space-y-2'>
													<InputField
														label={field}
														value={asset[field] || ""}
														onChange={e => {
															const newAssets = [...formData.assets];
															newAssets[index][field] = e.target.value;
															setFormData({ ...formData, assets: newAssets });
														}}
													/>
													{asset[field] && (
														<img
															src={asset[field]}
															className='h-20 w-auto rounded-lg object-contain bg-black/40 border shadow-inner'
														/>
													)}
												</div>
											),
										)}
									</div>
									<button
										type='button'
										onClick={() =>
											setFormData({
												...formData,
												assets: formData.assets.filter((_, i) => i !== index),
											})
										}
										className='text-red-500'
									>
										<XCircle size={22} />
									</button>
								</div>
							))}
							<Button
								type='button'
								variant='outline'
								size='sm'
								onClick={() =>
									setFormData({
										...formData,
										assets: [
											...(formData.assets || []),
											{
												fullAbsolutePath: "",
												gameAbsolutePath: "",
												avatar: "",
											},
										],
									})
								}
								className='w-max'
							>
								Thêm Asset
							</Button>
						</div>

						<div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
							<ArrayInputComponent
								label='Vùng'
								data={formData.regions || []}
								onChange={d => setFormData({ ...formData, regions: d })}
							/>
							<ArrayInputComponent
								label='Thẻ'
								data={formData.tag || []}
								onChange={d => setFormData({ ...formData, tag: d })}
							/>
						</div>

						<div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
							{[1, 2, 3, 4, 5, 6].map(n => (
								<ArrayInputComponent
									key={n}
									label={`Bộ Cổ vật khuyên dùng ${n}`}
									data={formData[`defaultRelicsSet${n}`] || []}
									onChange={d =>
										setFormData({ ...formData, [`defaultRelicsSet${n}`]: d })
									}
									cachedData={dataLookup.relics}
								/>
							))}
						</div>
						<ArrayInputComponent
							label='Ngọc gợi ý'
							data={formData.rune || []}
							onChange={d => setFormData({ ...formData, rune: d })}
							cachedData={dataLookup.runes}
						/>
					</div>
				</form>

				<Modal
					isOpen={isCancelModalOpen}
					onClose={() => setIsCancelModalOpen(false)}
					title='Xác nhận Hủy'
				>
					<div className='text-text-secondary'>
						<p className='mb-6'>Bạn có thay đổi chưa lưu.</p>
						<div className='flex justify-end gap-3'>
							<Button
								onClick={() => setIsCancelModalOpen(false)}
								variant='ghost'
							>
								Ở lại
							</Button>
							<Button
								onClick={() => {
									setIsCancelModalOpen(false);
									onCancel();
								}}
								variant='danger'
							>
								Rời đi
							</Button>
						</div>
					</div>
				</Modal>
				<Modal
					isOpen={isDeleteModalOpen}
					onClose={() => setIsDeleteModalOpen(false)}
					title='Xác nhận Xóa'
				>
					<div className='text-text-secondary'>
						<p className='mb-6'>
							Xóa {formData.name || ""}? Hành động này không thể hoàn tác.
						</p>
						<div className='flex justify-end gap-3'>
							<Button
								onClick={() => setIsDeleteModalOpen(false)}
								variant='ghost'
							>
								Hủy
							</Button>
							<Button
								onClick={() => {
									setIsDeleteModalOpen(false);
									onDelete(formData.championID);
								}}
								variant='danger'
							>
								Xác nhận Xóa
							</Button>
						</div>
					</div>
				</Modal>
			</>
		);
	},
);

export default ChampionEditorForm;
