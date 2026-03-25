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

const AdventureMapEditorForm = memo(
	({ item, cachedData, onSave, onCancel, onDelete, isSaving }) => {
		const [formData, setFormData] = useState({});

		const [isMapVisible, setIsMapVisible] = useState(true);
		const [nodeDisplayMode, setNodeDisplayMode] = useState("icon");
		const [mapAspectRatio, setMapAspectRatio] = useState("21/9");
		const [mapSize, setMapSize] = useState({ width: 1000, height: 400 });
		const [selectedNodeIndex, setSelectedNodeIndex] = useState(null);
		const mapRef = useRef(null);

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

		const handleChange = e => {
			const { name, value } = e.target;
			setFormData(prev => ({ ...prev, [name]: value }));
		};

		const handleSubmit = e => {
			e.preventDefault();
			onSave(formData);
		};

		const handleMapClick = useCallback(
			e => {
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
			[selectedNodeIndex],
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
									<StringArrayInput
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
													console.warn("Drag data không hợp lệ");
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
													nodeType: "Encounter",
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

						<div className='flex flex-col gap-8'>
							{isMapVisible && (
								<div className='space-y-4'>
									<div
										className='relative w-full bg-slate-950 rounded-2xl overflow-hidden border-2 border-border shadow-lg cursor-crosshair flex items-center justify-center'
										style={{ aspectRatio: mapAspectRatio }}
										ref={mapRef}
										onClick={handleMapClick}
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

											if (nodeDisplayMode === "dot") {
												return (
													<div
														key={i}
														title={`${n.nodeID} - ${n.nodeType}\n${nodeInfo.description || ""}`}
														className={`absolute w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white transition-all cursor-pointer ${
															selectedNodeIndex === i
																? "bg-red-500 scale-150 z-30 shadow-[0_0_10px_rgba(239,68,68,1)]"
																: "bg-blue-500 z-20 hover:scale-125 hover:bg-red-400"
														}`}
														style={{
															left: `${n.position?.x ?? 0}%`,
															top: `${n.position?.y ?? 0}%`,
														}}
														onClick={e => {
															e.stopPropagation();
															setSelectedNodeIndex(i);
														}}
													/>
												);
											}

											return (
												<div
													key={i}
													title={`${n.nodeID} - ${n.nodeType}\n${nodeInfo.description || ""}`}
													className={`absolute w-7 h-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
														selectedNodeIndex === i
															? "bg-red-500 border-white scale-125 z-30 shadow-[0_0_15px_rgba(239,68,68,0.8)]"
															: "bg-black/80 border-white/60 z-20 hover:scale-110 hover:border-white"
													}`}
													style={{
														left: `${n.position?.x ?? 0}%`,
														top: `${n.position?.y ?? 0}%`,
													}}
													onClick={e => {
														e.stopPropagation();
														setSelectedNodeIndex(i);
													}}
												>
													{getNodeIcon(n.nodeType)}
													<span className='absolute -bottom-6 text-[10px] font-bold text-white bg-black/70 px-1.5 py-0.5 rounded shadow'>
														{n.nodeID || ""}
													</span>
												</div>
											);
										})}
									</div>
									<p className='text-xs text-text-secondary text-center italic'>
										Click chọn Node ở danh sách bên dưới, sau đó bấm lên bản đồ
										để di chuyển vị trí. Hover lên chấm tròn trên Map để xem
										thông tin Node.
									</p>
								</div>
							)}

							<div className='grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-4 items-start max-h-[600px] overflow-y-auto pr-3 custom-scrollbar'>
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
											key={idx}
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
												if (selectedNodeIndex === i) setSelectedNodeIndex(null);
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
							<h3 className='font-bold text-lg border-l-4 border-yellow-500 pl-3'>
								Phần thưởng (Rewards)
							</h3>
							<Button
								type='button'
								variant='outline'
								size='sm'
								onClick={() =>
									setFormData(p => ({
										...p,
										rewards: [...(p.rewards || []), { items: [] }],
									}))
								}
							>
								<Plus size={16} className='mr-1' /> Thêm Gói Thưởng
							</Button>
						</div>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
							{(formData.rewards || []).map((rewardPacket, pIdx) => (
								<div
									key={pIdx}
									className='bg-surface-bg p-4 border border-border rounded-lg shadow-sm'
								>
									<div className='flex justify-between items-center mb-4 border-b border-border/50 pb-2'>
										<span className='font-black text-yellow-500'>
											GÓI {pIdx + 1}
										</span>
										<div className='flex gap-2'>
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
											<Button
												type='button'
												variant='ghost'
												className='text-red-500 hover:bg-red-500/10'
												onClick={() =>
													setFormData(p => ({
														...p,
														rewards: p.rewards.filter((_, i) => i !== pIdx),
													}))
												}
											>
												<Trash2 size={16} />
											</Button>
										</div>
									</div>
									<div className='space-y-3'>
										{rewardPacket.items.map((it, iIdx) => (
											<div
												key={iIdx}
												className='flex gap-2 items-center bg-surface-hover p-2 rounded-md'
											>
												<InputField
													placeholder='Tên vật phẩm (VD: Kho báu Vàng)'
													value={it.name}
													onChange={e => {
														const r = [...formData.rewards];
														r[pIdx].items[iIdx].name = e.target.value;
														setFormData(p => ({ ...p, rewards: r }));
													}}
													className='flex-1'
												/>
												<InputField
													type='number'
													placeholder='SL'
													value={it.count}
													onChange={e => {
														const r = [...formData.rewards];
														r[pIdx].items[iIdx].count = Number(e.target.value);
														setFormData(p => ({ ...p, rewards: r }));
													}}
													className='w-20'
												/>
												<Button
													type='button'
													variant='ghost'
													className='text-red-500 p-2'
													onClick={() => {
														const r = [...formData.rewards];
														r[pIdx].items.splice(iIdx, 1);
														setFormData(p => ({ ...p, rewards: r }));
													}}
												>
													<Trash2 size={16} />
												</Button>
											</div>
										))}
									</div>
								</div>
							))}
						</div>
					</section>
				</div>
			</form>
		);
	},
);

export default AdventureMapEditorForm;
