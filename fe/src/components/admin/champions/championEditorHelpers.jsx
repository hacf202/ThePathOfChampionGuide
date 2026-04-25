// src/pages/admin/components/championEditorHelpers.jsx
import React, { useState, useMemo } from "react";
import Swal from "sweetalert2";
import Button from "../../common/button";
import InputField from "../../common/inputField";
import {
	Plus,
	Link2,
	XCircle,
	ChevronDown,
	ChevronUp,
	Sparkles,
} from "lucide-react";
import { useTranslation } from "../../../hooks/useTranslation";

import MarkupEditor from "../MarkupEditor";
import SafeImage from "../../common/SafeImage";

export const getUniqueId = item => {
	return (
		item._id ||
		item.id ||
		item.bonusStarID ||
		item.powerCode ||
		item.relicCode ||
		item.itemCode ||
		item.runeCode ||
		item.cardCode
	);
};

export const NODE_DEFAULT_TEMPLATES = {
	n1: {
		nodeType: "starPower",
		requirements: [{ type: "Fragment", value: 10 }],
	},
	n2: {
		nodeType: "starPower",
		requirements: [{ type: "Fragment", value: 20 }],
	},
	n3: {
		nodeType: "starPower",
		requirements: [{ type: "Fragment", value: 40 }],
	},
	n4: {
		nodeType: "starPower",
		requirements: [
			{ type: "Fragment", value: 60 },
			{ type: "Crystal", value: 10 },
		],
	},
	n5: {
		nodeType: "starPower",
		requirements: [
			{ type: "Fragment", value: 80 },
			{ type: "Crystal", value: 40 },
		],
	},
	n6: {
		nodeType: "starPower",
		requirements: [
			{ type: "Fragment", value: 100 },
			{ type: "Nova Crystal", value: 1 },
		],
	},
	n7: {
		nodeType: "bonusStar",
		requirements: [{ type: "Fragment", value: 40 }],
	},
	n8: {
		nodeType: "bonusStar",
		requirements: [{ type: "Fragment", value: 40 }],
	},
	n9: {
		nodeType: "bonusStar",
		requirements: [{ type: "Fragment", value: 40 }],
	},
	n10: {
		nodeType: "bonusStar",
		requirements: [{ type: "Fragment", value: 40 }],
	},
	n11: {
		nodeType: "bonusStar",
		requirements: [{ type: "Fragment", value: 40 }],
	},
	n12: {
		nodeType: "bonusStarGem",
		requirements: [{ type: "Gemstone", value: 150 }],
	},
	n13: {
		nodeType: "bonusStarGem",
		requirements: [{ type: "Gemstone", value: 250 }],
	},
	n14: {
		nodeType: "bonusStarGem",
		requirements: [{ type: "Gemstone", value: 250 }],
	},
	n15: {
		nodeType: "bonusStarGem",
		requirements: [{ type: "Gemstone", value: 350 }],
	},
};

export const ConstellationLine = ({ x1, y1, x2, y2, isRecommended }) => {
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

// 🟢 Cập nhật Component ArrayInputComponent để nhận thêm hành động `onRemoveArray`
export const ArrayInputComponent = ({
	label,
	data = [],
	onChange,
	onRemoveArray,
	cachedData = {},
	placeholder = "Nhập ID hoặc kéo thả vào đây",
}) => {
	const { tUI, tDynamic } = useTranslation();

	const handleItemChange = (index, newValue) => {
		const newData = [...data];
		newData[index] = newValue;
		onChange(newData);
	};

	const handleAddItem = () => onChange([...data, ""]);
	const handleRemoveItem = index =>
		onChange(data.filter((_, i) => i !== index));
	const getItemData = identifier => cachedData[identifier] || {};

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
				<label className='font-semibold text-text-primary uppercase text-xs tracking-wider'>
					{label}
				</label>
				{/* 🟢 Gom Nút Xóa danh sách (nếu có) và Nút Thêm vào cùng 1 block để giữ Layout mượt mà */}
				<div className='flex items-center gap-2'>
					{onRemoveArray && (
						<button
							type='button'
							onClick={onRemoveArray}
							className='text-red-500 hover:bg-red-500/10 p-1.5 rounded-md  '
							title='Xóa danh sách này'
						>
							<XCircle size={16} />
						</button>
					)}
					<Button
						type='button'
						variant='outline'
						size='sm'
						onClick={handleAddItem}
						iconLeft={<Plus size={16} />}
					>
						{tUI("common.addNew")}
					</Button>
				</div>
			</div>
			<div className='space-y-2'>
				{data.length === 0 ? (
					<p className='text-center text-sm text-text-secondary py-4 bg-surface-hover/50 rounded-lg border border-dashed border-border'>
						{tUI("admin.dropSidePanel.noData")}
					</p>
				) : (
					data.map((value, index) => {
						const item = getItemData((value || "").trim());
						const isResolved = !!item.name;

						// Hiển thị Tên thay vì ID trên UI (nếu tìm thấy), nhưng State vẫn giữ ID
						const displayValue = isResolved
							? tDynamic(item, "name")
							: value || "";

						return (
							<div
								key={index}
								className='flex items-center gap-3 p-3 bg-surface-hover rounded-lg border border-border hover:border-primary-500 transition-all'
								onDrop={e => handleDrop(e, index)}
								onDragOver={e => e.preventDefault()}
							>
								<div className='w-10 h-10 rounded bg-white border flex items-center justify-center overflow-hidden shrink-0'>
									{item.assetAbsolutePath || item.image ? (
										<SafeImage
											src={item.assetAbsolutePath || item.image}
											alt='icon'
											className='w-full h-full object-contain'
											width={40}
											height={40}
										/>
									) : (
										<span className='text-xs text-gray-500'>?</span>
									)}
								</div>
								<InputField
									value={displayValue}
									onChange={e => handleItemChange(index, e.target.value)}
									placeholder={placeholder}
									className={`flex-1 font-mono text-sm ${isResolved ? "font-bold text-primary-500" : ""}`}
									readOnly={isResolved} // Khóa input nếu đã map thành công, tránh gõ nhầm đè lên ID
									title={isResolved ? `ID thực tế được lưu trữ: ${value}` : ""}
								/>
								<button
									type='button'
									onClick={() => handleRemoveItem(index)}
									className='text-red-500 hover:text-red-600 shrink-0'
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

export const ConstellationConnections = ({ nodes, onChangeNodes }) => {
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

		if (!fromClean || !toClean) {
			Swal.fire({ icon: "warning", title: "Thiếu dữ liệu", text: "Vui lòng nhập đầy đủ Node bắt đầu và Node đích.", confirmButtonColor: "#3b82f6" });
			return;
		}
		if (fromClean === toClean) {
			Swal.fire({ icon: "warning", title: "Lỗi trùng lặp", text: "Node bắt đầu và đích không được trùng nhau.", confirmButtonColor: "#3b82f6" });
			return;
		}

		const startNodeIndex = nodes.findIndex(n => n.nodeID === fromClean);
		if (startNodeIndex === -1) {
			Swal.fire({ icon: "error", title: "Không tìm thấy", text: `Không tìm thấy Node bắt đầu có ID: ${fromClean}`, confirmButtonColor: "#3b82f6" });
			return;
		}

		const targetNodeIndex = nodes.findIndex(n => n.nodeID === toClean);
		if (targetNodeIndex === -1) {
			Swal.fire({ icon: "error", title: "Không tìm thấy", text: `Không tìm thấy Node đích có ID: ${toClean}`, confirmButtonColor: "#3b82f6" });
			return;
		}

		const startNode = nodes[startNodeIndex];
		const currentNextNodes = startNode.nextNodes || [];

		if (currentNextNodes.includes(toClean)) {
			Swal.fire({ icon: "info", title: "Đã tồn tại", text: "Đường nối này đã tồn tại.", confirmButtonColor: "#3b82f6" });
			return;
		}

		const newNodes = [...nodes];
		newNodes[startNodeIndex] = {
			...startNode,
			nextNodes: [...currentNextNodes, toClean],
		};
		onChangeNodes(newNodes);

		// Reset state
		setFromNode("");
		setToNode("");

		// Focus lại vào input "Từ Node" sau khi nối thành công
		setTimeout(() => {
			const fromInput = document.getElementById("fromNodeInput");
			if (fromInput) {
				fromInput.focus();
			}
		}, 10);
	};

	// Xử lý sự kiện nhấn phím Enter
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
				<Link2 size={16} className='text-pink-500' /> Quản lý Liên kết giữa các
				Nodes
			</h4>
			<div className='flex flex-col sm:flex-row gap-4 items-end bg-surface-bg p-4 rounded-lg border border-border shadow-sm'>
				<div className='flex-1 w-full'>
					<label className='text-[10px] font-bold uppercase text-text-secondary'>
						Từ Node (Bắt đầu)
					</label>
					<InputField
						id='fromNodeInput'
						value={fromNode}
						onChange={e => setFromNode(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder='Nhập ID Node (VD: n1)'
						className='mt-1'
					/>
				</div>
				<div className='flex-1 w-full'>
					<label className='text-[10px] font-bold uppercase text-text-secondary'>
						Đến Node (Đích)
					</label>
					<InputField
						value={toNode}
						onChange={e => setToNode(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder='Nhập ID Node (VD: n2)'
						className='mt-1'
					/>
				</div>
				<Button
					type='button'
					variant='outline'
					onClick={handleAdd}
					iconLeft={<Plus size={16} />}
					className='w-full sm:w-auto h-[42px] border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white'
				>
					Nối Node
				</Button>
			</div>
			{connections.length > 0 && (
				<div className='flex flex-wrap gap-3 mt-4'>
					{connections.map((conn, idx) => (
						<div
							key={idx}
							className='flex items-center gap-2 bg-surface-bg border border-border px-3 py-1.5 rounded-lg text-sm font-mono shadow-sm group hover:border-pink-500  '
						>
							<span className='text-primary-500 font-bold'>{conn.from}</span>
							<span className='text-text-secondary text-xs'>→</span>
							<span className='text-emerald-500 font-bold'>{conn.to}</span>
							<button
								type='button'
								onClick={() => handleRemove(conn.from, conn.to)}
								className='text-text-secondary hover:text-red-500 ml-2 p-1 rounded-md hover:bg-red-500/10   opacity-50 group-hover:opacity-100'
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

export const RequirementsInput = ({ requirements = [], onChange }) => {
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
						<option value='Nova Crystal'>Pha Lê Sao Băng</option>
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

export const NodeEditor = ({
	node,
	index,
	isSelected,
	onSelect,
	onChange,
	onMultiChange,
	onRemove,
	cachedData,
}) => {
	const { tDynamic } = useTranslation();
	const [isOpen, setIsOpen] = useState(false);

	// Phân tích dữ liệu thực tế từ cache
	const identifier =
		node.powerCode || node.bonusStarID || node.nodeName?.trim();
	const power = (cachedData.powers || []).find(
		p => getUniqueId(p) === identifier || p.name === identifier,
	);
	const bonus = (cachedData.bonusStars || []).find(
		b => getUniqueId(b) === identifier || b.name === identifier,
	);

	const item = power || bonus;
	const nodeAsset = item ? item.assetAbsolutePath || item.image : null;
	const isResolved = !!item;

	// Lấy mô tả: Ưu tiên mô tả đã chỉnh sửa của node, nếu không có thì lấy mô tả gốc từ cachedData
	const displayDescription =
		node.description ||
		(item ? item.descriptionRaw || item.description || "" : "");

	const handleDropIntoNode = e => {
		e.preventDefault();
		try {
			const dragged = JSON.parse(e.dataTransfer.getData("text/plain"));
			const uniqueId = dragged.id;

			if (dragged.type === "power" || dragged.type === "bonusStar") {
				const list =
					dragged.type === "power"
						? cachedData.powers || []
						: cachedData.bonusStars || [];
				let droppedItem = uniqueId
					? list.find(p => getUniqueId(p) === uniqueId)
					: null;
				if (!droppedItem && dragged.name)
					droppedItem = list.find(p => p.name === dragged.name);

				if (droppedItem) {
					const updates = {
						nodeName: droppedItem.name, // Giữ tương thích
						description:
							droppedItem.descriptionRaw || droppedItem.description || "",
					};
					// Lưu chuẩn ID vào CSDL
					if (dragged.type === "power") updates.powerCode = uniqueId;
					if (dragged.type === "bonusStar") updates.bonusStarID = uniqueId;

					onMultiChange(index, updates);
				}
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
				onDrop={handleDropIntoNode}
				onDragOver={e => e.preventDefault()}
				title={!isOpen && displayDescription ? displayDescription : ""}
			>
				<div className='flex items-center gap-3 pointer-events-none'>
					<div
						className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${isSelected ? "bg-primary-500 text-white" : "bg-border text-text-secondary"}`}
					>
						{node.nodeID || `n${index + 1}`}
					</div>
					<div className='flex flex-col'>
						<span className='font-bold text-sm truncate max-w-[120px] sm:max-w-[150px]'>
							{isResolved
								? tDynamic(item, "name")
								: node.nodeName ||
									node.powerCode ||
									node.bonusStarID ||
									"Node chưa đặt tên/ID"}
						</span>
						<span className='text-[10px] uppercase text-text-secondary font-medium'>
							{node.nodeType || "starPower"}
						</span>
					</div>
				</div>
				<div className='flex items-center gap-2'>
					<div
						className='text-[10px] font-mono text-text-secondary bg-surface-bg px-1.5 py-0.5 rounded border hidden sm:block'
						title='Tọa độ Node trên bản đồ'
					>
						X:{node.position?.x ?? 0} Y:{node.position?.y ?? 0}
					</div>
					<button
						type='button'
						onClick={e => {
							e.stopPropagation();
							onChange(index, "isRecommended", !node.isRecommended);
						}}
						className={`w-6 h-6 rounded border flex items-center justify-center   ${node.isRecommended ? "bg-yellow-500 border-yellow-500" : "bg-surface-bg border-border hover:border-yellow-500/50"}`}
					>
						{node.isRecommended && (
							<Sparkles size={12} className='text-white fill-current' />
						)}
					</button>
					<div className='w-px h-6 bg-border mx-1'></div>
					<button
						type='button'
						onClick={e => {
							e.stopPropagation();
							onRemove(index);
						}}
						className='p-1.5 text-red-500 hover:bg-red-500/10 rounded-md  '
					>
						<XCircle size={18} />
					</button>
					<button
						type='button'
						onClick={e => {
							e.stopPropagation();
							setIsOpen(!isOpen);
						}}
						className='p-1.5 text-text-secondary hover:bg-surface-bg rounded-md  '
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
						<div className='w-10 h-10 rounded bg-white border flex items-center justify-center overflow-hidden shrink-0'>
							{nodeAsset ? (
								<SafeImage 
									src={nodeAsset} 
									className='w-full h-full object-contain'
									width={40}
									height={40}
								/>
							) : (
								<span className='text-[10px] font-bold text-gray-400'>D&D</span>
							)}
						</div>
						<InputField
							label='Tài nguyên được gắn'
							value={
								isResolved
									? tDynamic(item, "name")
									: node.powerCode || node.bonusStarID || node.nodeName || ""
							}
							onChange={e =>
								onChange(
									index,
									node.nodeType === "starPower" ? "powerCode" : "bonusStarID",
									e.target.value,
								)
							}
							placeholder='Kéo thả tài nguyên vào đây...'
							className={`flex-1 ${isResolved ? "font-bold text-primary-500" : ""}`}
							readOnly={isResolved}
							title={
								isResolved
									? `ID thực tế được lưu trữ: ${getUniqueId(item)}`
									: ""
							}
						/>
					</div>

					<div className='flex flex-col gap-1'>
						<MarkupEditor
							value={displayDescription}
							onChange={({ markup, raw }) =>
								onMultiChange(index, {
									description: markup,
									descriptionRaw: raw,
								})
							}
							placeholder='Mô tả kỹ năng (Hệ thống sẽ lấy mặc định từ Sức mạnh nếu trống)...'
						/>
					</div>

					<RequirementsInput
						requirements={node.requirements || []}
						onChange={val => onChange(index, "requirements", val)}
					/>
				</div>
			)}
		</div>
	);
};
