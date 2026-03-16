// src/components/admin/adventureEditorHelpers.jsx
import React, { useState, useMemo } from "react";
import Button from "../common/button";
import InputField from "../common/inputField";
import {
	Plus,
	Trash2,
	Link2,
	XCircle,
	ChevronDown,
	ChevronUp,
	Skull,
	Swords,
	ShieldQuestion,
} from "lucide-react";

// Helper lấy ID chuẩn từ nhiều nguồn API khác nhau
export const getUniqueAdvId = item => {
	if (!item) return "";
	return (
		item.powerCode || item.bossID || item.championID || item.id || item._id
	);
};

// Helper lấy Tên chuẩn
export const getAdvName = item => {
	if (!item) return "";
	return item.name || item.bossName || item.adventureName || "Unknown";
};

// Helper lấy Ảnh chuẩn
export const getAdvImage = item => {
	if (!item) return null;
	return (
		item.assetAbsolutePath ||
		item.image ||
		item.avatar ||
		item.assets?.[0]?.avatar ||
		null
	);
};

// Component kéo thả cơ bản cho mảng chuỗi (VD: Champions, Powers, Nodes Bosses)
export const DragDropArrayInput = ({
	label,
	data = [],
	onChange,
	cachedList = [],
	placeholder = "Kéo thả ID vào đây",
}) => {
	const handleItemChange = (index, newValue) => {
		const newData = [...data];
		newData[index] = newValue;
		onChange(newData);
	};

	const handleDrop = (e, index) => {
		e.preventDefault();
		try {
			const dragged = JSON.parse(e.dataTransfer.getData("text/plain"));
			const identifier = dragged.id || dragged.name;
			if (identifier) handleItemChange(index, identifier.trim());
		} catch (err) {
			console.warn("Drag data không hợp lệ");
		}
	};

	return (
		<div className='flex flex-col gap-3'>
			<div className='flex justify-between items-center'>
				<label className='block font-semibold text-[10px] uppercase text-text-secondary tracking-widest'>
					{label}
				</label>
				<Button
					type='button'
					variant='outline'
					size='sm'
					onClick={() => onChange([...data, ""])}
					iconLeft={<Plus size={16} />}
				>
					Thêm
				</Button>
			</div>
			<div className='space-y-2'>
				{data.length === 0 ? (
					<p className='text-center text-xs text-text-secondary py-3 bg-surface-hover/50 rounded-lg border border-dashed border-border'>
						Chưa có dữ liệu
					</p>
				) : (
					data.map((value, index) => {
						const safeValue = (value || "").trim();
						// Tìm kiếm item trong cachedList dựa trên ID
						const item =
							cachedList.find(i => getUniqueAdvId(i) === safeValue) || {};
						const isResolved = !!getUniqueAdvId(item);
						const displayValue = isResolved ? getAdvName(item) : value || "";
						const imageUrl = getAdvImage(item);

						return (
							<div
								key={index}
								className='flex items-center gap-2 p-2 bg-surface-hover rounded-lg border border-border hover:border-primary-500 transition-all'
								onDrop={e => handleDrop(e, index)}
								onDragOver={e => e.preventDefault()}
							>
								<div className='w-8 h-8 rounded bg-white border flex items-center justify-center overflow-hidden shrink-0'>
									{imageUrl ? (
										<img
											src={imageUrl}
											alt='icon'
											className='w-full h-full object-contain'
										/>
									) : (
										<span className='text-[10px] text-gray-500'>D&D</span>
									)}
								</div>
								<InputField
									value={displayValue}
									onChange={e => handleItemChange(index, e.target.value)}
									placeholder={placeholder}
									className={`flex-1 text-sm ${isResolved ? "font-bold text-primary-500" : ""}`}
									readOnly={isResolved}
									title={isResolved ? `ID đang lưu: ${value}` : ""}
								/>
								<button
									type='button'
									onClick={() => onChange(data.filter((_, i) => i !== index))}
									className='text-red-500 hover:bg-red-500/10 p-1.5 rounded-md'
								>
									<XCircle size={18} />
								</button>
							</div>
						);
					})
				)}
			</div>
		</div>
	);
};

// Component kéo thả dành riêng cho Array Object của Boss (Bởi vì Boss có bossID và note)
export const DragDropBossObjectInput = ({
	label,
	bosses = [],
	onChange,
	cachedBosses = [],
}) => {
	const handleDrop = (e, index) => {
		e.preventDefault();
		try {
			const dragged = JSON.parse(e.dataTransfer.getData("text/plain"));
			const identifier = dragged.id || dragged.name;
			if (identifier) {
				const newBosses = [...bosses];
				newBosses[index].bossID = identifier.trim();
				onChange(newBosses);
			}
		} catch (err) {
			console.warn("Drag data không hợp lệ");
		}
	};

	return (
		<div className='flex flex-col gap-3'>
			<div className='flex justify-between items-center'>
				<label className='block font-semibold text-[10px] uppercase text-text-secondary tracking-widest'>
					{label}
				</label>
				<Button
					type='button'
					variant='outline'
					size='sm'
					onClick={() => onChange([...bosses, { bossID: "", note: "" }])}
					iconLeft={<Plus size={16} />}
				>
					Thêm Boss
				</Button>
			</div>
			<div className='space-y-3'>
				{bosses.length === 0 ? (
					<p className='text-center text-xs text-text-secondary py-4 border border-dashed border-border rounded-lg'>
						Chưa có Boss chính
					</p>
				) : (
					bosses.map((b, i) => {
						const safeValue = (b.bossID || "").trim();
						const item = cachedBosses.find(cb => cb.bossID === safeValue) || {};
						const isResolved = !!item.bossID;
						const displayValue = isResolved ? getAdvName(item) : b.bossID || "";
						const imageUrl = getAdvImage(item);

						return (
							<div
								key={i}
								className='flex gap-2 items-center bg-surface-hover/50 p-2 rounded-lg border border-border'
								onDrop={e => handleDrop(e, i)}
								onDragOver={e => e.preventDefault()}
							>
								<div className='w-10 h-10 rounded bg-white border flex items-center justify-center overflow-hidden shrink-0'>
									{imageUrl ? (
										<img
											src={imageUrl}
											alt='icon'
											className='w-full h-full object-contain'
										/>
									) : (
										<span className='text-[10px] text-gray-500 font-bold'>
											D&D
										</span>
									)}
								</div>
								<div className='flex-1 flex flex-col gap-2 sm:flex-row'>
									<InputField
										placeholder='Boss ID (Kéo thả vào)'
										value={displayValue}
										onChange={e => {
											const arr = [...bosses];
											arr[i].bossID = e.target.value;
											onChange(arr);
										}}
										className={`sm:w-1/3 ${isResolved ? "font-bold text-red-500" : ""}`}
										readOnly={isResolved}
										title={isResolved ? `ID thực tế: ${b.bossID}` : ""}
									/>
									<InputField
										placeholder='Ghi chú / Máu'
										value={b.note}
										onChange={e => {
											const arr = [...bosses];
											arr[i].note = e.target.value;
											onChange(arr);
										}}
										className='w-full'
									/>
								</div>
								<button
									type='button'
									onClick={() => onChange(bosses.filter((_, idx) => idx !== i))}
									className='text-red-500 hover:bg-red-500/10 p-2 rounded-md shrink-0'
								>
									<Trash2 size={18} />
								</button>
							</div>
						);
					})
				)}
			</div>
		</div>
	);
};

export const AdventureLine = ({ x1, y1, x2, y2 }) => {
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
			stroke='rgba(239, 68, 68, 0.8)'
			strokeWidth='2.5'
			markerEnd='url(#arrowhead-adv)'
			className='drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]'
		/>
	);
};

export const AdventureConnections = ({ nodes, onChangeNodes }) => {
	const [fromNode, setFromNode] = useState("");
	const [toNode, setToNode] = useState("");

	const connections = useMemo(() => {
		const list = [];
		(nodes || []).forEach(node => {
			(node.nextNodes || []).forEach(target => {
				list.push({ from: node.nodeID, to: target });
			});
		});
		return list;
	}, [nodes]);

	const handleAdd = () => {
		const fromClean = fromNode.trim();
		const toClean = toNode.trim();

		if (!fromClean || !toClean)
			return alert("Vui lòng nhập đầy đủ Node bắt đầu và đích.");
		if (fromClean === toClean)
			return alert("Node bắt đầu và đích không được trùng nhau.");

		const startNodeIndex = nodes.findIndex(n => n.nodeID === fromClean);
		if (startNodeIndex === -1)
			return alert(`Không tìm thấy Node bắt đầu: ${fromClean}`);

		const targetNodeIndex = nodes.findIndex(n => n.nodeID === toClean);
		if (targetNodeIndex === -1)
			return alert(`Không tìm thấy Node đích: ${toClean}`);

		const startNode = nodes[startNodeIndex];
		const currentNextNodes = startNode.nextNodes || [];

		if (currentNextNodes.includes(toClean))
			return alert("Đường nối này đã tồn tại.");

		const newNodes = [...nodes];
		newNodes[startNodeIndex] = {
			...startNode,
			nextNodes: [...currentNextNodes, toClean],
		};
		onChangeNodes(newNodes);

		setFromNode("");
		setToNode("");
		setTimeout(() => document.getElementById("advFromNodeInput")?.focus(), 10);
	};

	const handleKeyDown = e => {
		if (e.key === "Enter") {
			e.preventDefault();
			handleAdd();
		}
	};

	const handleRemove = (from, to) => {
		const startNodeIndex = nodes.findIndex(n => n.nodeID === from);
		if (startNodeIndex === -1) return;
		const startNode = nodes[startNodeIndex];
		const newNodes = [...nodes];
		newNodes[startNodeIndex] = {
			...startNode,
			nextNodes: (startNode.nextNodes || []).filter(n => n !== to),
		};
		onChangeNodes(newNodes);
	};

	return (
		<div className='bg-surface-hover/30 p-5 rounded-xl border border-border/80 shadow-inner mb-6 space-y-4 relative'>
			<h4 className='text-sm font-bold flex items-center gap-2 text-text-primary uppercase tracking-widest border-b border-border/50 pb-2'>
				<Link2 size={16} className='text-red-500' /> Quản lý Đường đi (Paths)
			</h4>
			<div className='flex flex-col sm:flex-row gap-4 items-end bg-surface-bg p-4 rounded-lg border border-border shadow-sm'>
				<div className='flex-1 w-full'>
					<label className='text-[10px] font-bold uppercase text-text-secondary'>
						Từ Node
					</label>
					<InputField
						id='advFromNodeInput'
						value={fromNode}
						onChange={e => setFromNode(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder='VD: n1'
						className='mt-1'
					/>
				</div>
				<div className='flex-1 w-full'>
					<label className='text-[10px] font-bold uppercase text-text-secondary'>
						Đến Node
					</label>
					<InputField
						value={toNode}
						onChange={e => setToNode(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder='VD: n2'
						className='mt-1'
					/>
				</div>
				<Button
					type='button'
					variant='outline'
					onClick={handleAdd}
					iconLeft={<Plus size={16} />}
					className='w-full sm:w-auto h-[42px] border-red-500 text-red-500 hover:bg-red-500 hover:text-white'
				>
					Nối Đường
				</Button>
			</div>
			{connections.length > 0 && (
				<div className='flex flex-wrap gap-3 mt-4'>
					{connections.map((conn, idx) => (
						<div
							key={idx}
							className='flex items-center gap-2 bg-surface-bg border border-border px-3 py-1.5 rounded-lg text-sm font-mono shadow-sm group hover:border-red-500'
						>
							<span className='text-primary-500 font-bold'>{conn.from}</span>
							<span className='text-text-secondary text-xs'>→</span>
							<span className='text-emerald-500 font-bold'>{conn.to}</span>
							<button
								type='button'
								onClick={() => handleRemove(conn.from, conn.to)}
								className='text-text-secondary hover:text-red-500 ml-2 p-1 rounded-md hover:bg-red-500/10 opacity-50 group-hover:opacity-100'
							>
								<XCircle size={16} />
							</button>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export const AdventureNodeEditor = ({
	node,
	index,
	isSelected,
	onSelect,
	onChange,
	onRemove,
	cachedData,
}) => {
	const [isOpen, setIsOpen] = useState(false);

	const getIcon = type => {
		if (type === "Boss") return <Skull size={16} className='text-red-500' />;
		if (type === "Encounter")
			return <Swords size={16} className='text-yellow-500' />;
		return <ShieldQuestion size={16} className='text-blue-500' />;
	};

	return (
		<div
			className={`border rounded-xl overflow-hidden mb-4 transition-all ${isSelected ? "border-red-500 ring-2 ring-red-500/20 shadow-md" : "border-border shadow-sm"}`}
		>
			<div
				className={`flex justify-between items-center p-3 cursor-pointer ${isSelected ? "bg-red-500/10" : "bg-surface-hover"}`}
				onClick={() => onSelect(index)}
			>
				<div className='flex items-center gap-3 pointer-events-none'>
					<div
						className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${isSelected ? "bg-red-500 text-white" : "bg-border text-text-secondary"}`}
					>
						{node.nodeID || `n${index + 1}`}
					</div>
					<div className='flex flex-col'>
						<span className='font-bold text-sm flex items-center gap-2'>
							{getIcon(node.nodeType)} {node.nodeType || "Unknown Node"}
						</span>
						<span className='text-[10px] text-text-secondary font-medium mt-0.5 truncate max-w-[150px]'>
							Bosses: {node.bosses?.length ? node.bosses.join(", ") : "None"}
						</span>
					</div>
				</div>
				<div className='flex items-center gap-2'>
					<div className='text-[10px] font-mono text-text-secondary bg-surface-bg px-1.5 py-0.5 rounded border hidden sm:block'>
						X:{node.position?.x ?? 0} Y:{node.position?.y ?? 0}
					</div>
					<div className='w-px h-6 bg-border mx-1'></div>
					<button
						type='button'
						onClick={e => {
							e.stopPropagation();
							onRemove(index);
						}}
						className='p-1.5 text-red-500 hover:bg-red-500/10 rounded-md'
					>
						<Trash2 size={18} />
					</button>
					<button
						type='button'
						onClick={e => {
							e.stopPropagation();
							setIsOpen(!isOpen);
						}}
						className='p-1.5 text-text-secondary hover:bg-surface-bg rounded-md'
					>
						{isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
					</button>
				</div>
			</div>

			{isOpen && (
				<div className='p-4 space-y-4 bg-surface-bg border-t border-border/50'>
					<div className='grid grid-cols-2 gap-4'>
						<InputField
							label='Node ID'
							value={node.nodeID || ""}
							onChange={e => onChange(index, "nodeID", e.target.value)}
							placeholder='VD: n1'
						/>
						<div className='flex flex-col gap-1'>
							<label className='text-[10px] font-bold uppercase text-text-secondary tracking-widest'>
								Loại Node
							</label>
							<select
								value={node.nodeType || "Encounter"}
								onChange={e => onChange(index, "nodeType", e.target.value)}
								className='w-full p-2.5 rounded-lg border border-border bg-surface-bg text-sm outline-none'
							>
								<option value='Boss'>Boss</option>
								<option value='Encounter'>Encounter</option>
								<option value='Miniboss'>Miniboss</option>
								<option value='Shop'>Shop</option>
								<option value='Healer'>Healer</option>
							</select>
						</div>
					</div>

					<div className='bg-surface-hover/50 p-3 rounded-lg border border-border border-dashed'>
						<DragDropArrayInput
							label='Danh sách Kẻ địch / Boss (Kéo thả vào)'
							data={node.bosses || []}
							onChange={val => onChange(index, "bosses", val)}
							cachedList={cachedData.bosses || []}
							placeholder='Nhập ID hoặc Kéo thả'
						/>
					</div>
				</div>
			)}
		</div>
	);
};
