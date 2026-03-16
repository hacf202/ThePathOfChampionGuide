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
	Sparkles,
	Youtube,
	PanelRightClose,
	PanelRightOpen,
	Info,
	Swords,
	Box,
	Eye,
	EyeOff,
} from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";

// Import các component hỗ trợ đã được tách
import {
	getUniqueId,
	NODE_DEFAULT_TEMPLATES,
	ConstellationLine,
	ArrayInputComponent,
	ConstellationConnections,
	NodeEditor,
} from "./championEditorHelpers";

const ChampionEditorForm = memo(
	({
		champion,
		constellation,
		cachedData,
		onSave,
		onCancel,
		onDelete,
		isSaving,
		isDragPanelOpen,
		onToggleDragPanel,
	}) => {
		const { tUI } = useTranslation();

		// 🟢 STATE CHUẨN ĐƯỢC MAP TRỰC TIẾP VỚI CSDL TƯỚNG (Bao gồm translations)
		const [formData, setFormData] = useState({
			championID: "",
			name: "",
			cost: 0,
			maxStar: 3,
			description: "",
			regions: [],
			tags: [],
			powerStarIds: [],
			adventurePowerIds: [],
			itemIds: [],
			runeIds: [],
			relicSets: champion?.relicSets?.length ? champion.relicSets : [[]],
			assets: [{ fullAbsolutePath: "", gameAbsolutePath: "", avatar: "" }],
			videoLink: "",
			translations: {
				en: {
					name: "",
					description: "",
					regions: [],
					tags: [],
				},
			},
		});

		const [constData, setConstData] = useState({ nodes: [] });
		const [initialData, setInitialData] = useState({});
		const [isDirty, setIsDirty] = useState(false);
		const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
		const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
		const [selectedNodeIndex, setSelectedNodeIndex] = useState(null);
		const [isMapVisible, setIsMapVisible] = useState(true);
		const mapRef = useRef(null);

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
				const processedData = {
					...champion,
					// Fallback tương thích ngược nếu data cũ đang dùng key khác
					tags: champion.tags || champion.tag || [],
					itemIds: champion.itemIds || champion.defaultItems || [],
					adventurePowerIds:
						champion.adventurePowerIds || champion.adventurePowers || [],
					runeIds: champion.runeIds || champion.rune || [],
					relicSets: champion.relicSets?.length ? champion.relicSets : [[]],
					assets: champion.assets?.length
						? champion.assets
						: [{ fullAbsolutePath: "", gameAbsolutePath: "", avatar: "" }],
					translations: champion.translations || {
						en: { name: "", description: "", regions: [], tags: [] },
					},
				};

				// Xử lý xuống dòng cho mô tả Tiếng Việt
				if (typeof processedData.description === "string") {
					processedData.description = processedData.description
						.replace(/\\\\n/g, "\n")
						.replace(/\\n/g, "\n");
				}

				// Xử lý xuống dòng cho mô tả Tiếng Anh
				if (typeof processedData.translations?.en?.description === "string") {
					processedData.translations.en.description =
						processedData.translations.en.description
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

		// 🟢 Hàm cập nhật state chuyên biệt cho Đa ngôn ngữ (Translations)
		const handleTranslationChange = useCallback((field, value) => {
			setFormData(prev => ({
				...prev,
				translations: {
					...prev.translations,
					en: {
						...(prev.translations?.en || {}),
						[field]: value,
					},
				},
			}));
		}, []);

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

			// Lọc tự động các Sức Mạnh từ Chòm sao lưu vào Tướng (Sử dụng đúng powerCode)
			cleanData.powerStarIds = constData.nodes
				.filter(n => n.nodeType === "starPower" && n.powerCode)
				.map(n => n.powerCode);

			// Xử lý escape xuống dòng cho Tiếng Việt
			if (typeof cleanData.description === "string")
				cleanData.description = cleanData.description.replace(/\n/g, "\\n");

			// Xử lý escape xuống dòng cho Tiếng Anh
			if (typeof cleanData.translations?.en?.description === "string")
				cleanData.translations.en.description =
					cleanData.translations.en.description.replace(/\n/g, "\\n");

			const finalConstData = {
				...constData,
				constellationID: cleanData.championID.trim(),
				championName: cleanData.name,
			};

			onSave(cleanData, finalConstData);
		};

		const buildLookup = arr => {
			const lookup = {};
			(arr || []).forEach(item => {
				const uid = getUniqueId(item);
				if (uid) lookup[uid] = item;
				if (item.name) lookup[item.name] = item;
			});
			return lookup;
		};

		const dataLookup = useMemo(
			() => ({
				powers: buildLookup(cachedData.powers),
				relics: buildLookup(cachedData.relics),
				items: buildLookup(cachedData.items),
				runes: buildLookup(cachedData.runes),
			}),
			[cachedData],
		);

		return (
			<>
				<form onSubmit={handleSubmit} className='flex flex-col gap-6 pb-24'>
					<div className='flex justify-between items-center border-border sticky top-0 bg-surface-bg z-40 py-3 border-b shadow-sm px-6 rounded-t-lg'>
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
								variant='outline'
								onClick={onToggleDragPanel}
								title={
									isDragPanelOpen ? "Ẩn thanh kéo thả" : "Hiện thanh kéo thả"
								}
								className='mr-2'
							>
								{isDragPanelOpen ? (
									<PanelRightClose size={18} />
								) : (
									<PanelRightOpen size={18} />
								)}
							</Button>
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

					<div className='px-6 space-y-8'>
						{/* BLOCK 1: THÔNG TIN CƠ BẢN */}
						<section className='bg-surface-bg border border-border rounded-xl p-6 shadow-sm space-y-6'>
							<h3 className='text-lg font-bold border-l-4 border-primary-500 pl-3 uppercase flex items-center gap-2'>
								<Info size={20} className='text-primary-500' /> Thông tin cơ bản
							</h3>
							<div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
								<div className='md:col-span-2 space-y-5'>
									<InputField
										label='Champion ID (Khóa chính)'
										name='championID'
										value={formData.championID || ""}
										onChange={handleInputChange}
										required
										disabled={!formData.isNew}
									/>
									<div className='grid grid-cols-2 gap-4'>
										<InputField
											label='Tên tướng (Tiếng Việt)'
											name='name'
											value={formData.name || ""}
											onChange={handleInputChange}
											required
										/>
										<InputField
											label='Tên tướng (English Name)'
											value={formData.translations?.en?.name || ""}
											onChange={e =>
												handleTranslationChange("name", e.target.value)
											}
										/>
									</div>
									<div className='grid grid-cols-2 gap-4'>
										<InputField
											label='Năng lượng (Mana)'
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
								<div className='flex flex-col items-center justify-center p-4 bg-surface-hover rounded-xl border border-dashed border-border h-full min-h-[200px]'>
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
									<p className='text-xs text-text-secondary mt-4 font-medium uppercase tracking-widest'>
										Ảnh Đại Diện
									</p>
								</div>
							</div>
						</section>

						{/* BLOCK 2: Mô tả & VIDEO */}
						<section className='bg-surface-bg border border-border rounded-xl p-6 shadow-sm space-y-6'>
							<h3 className='text-lg font-bold border-l-4 border-red-500 pl-3 uppercase flex items-center gap-2'>
								<Youtube size={20} className='text-red-500' /> Hướng dẫn & Video
							</h3>
							<div className='space-y-6'>
								<div className='space-y-2'>
									<label className='block font-semibold text-text-primary text-sm'>
										YouTube Video Link (Embed URL)
									</label>
									<InputField
										name='videoLink'
										value={formData.videoLink || ""}
										onChange={handleInputChange}
										placeholder='https://www.youtube.com/embed/...'
									/>
								</div>
								<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
									<div className='flex flex-col gap-2'>
										<label className='block font-semibold text-text-primary text-sm'>
											Mô tả hướng dẫn chơi chi tiết (Tiếng Việt)
										</label>
										<textarea
											name='description'
											value={formData.description || ""}
											onChange={handleInputChange}
											className='w-full p-4 rounded-lg border border-border bg-surface-hover/30 text-text-primary text-sm min-h-[200px] outline-none focus:border-primary-500'
											placeholder='Nhập mô tả, chiến thuật, cách combo...'
										/>
									</div>
									<div className='flex flex-col gap-2'>
										<label className='block font-semibold text-text-primary text-sm'>
											Mô tả hướng dẫn chơi chi tiết (English)
										</label>
										<textarea
											value={formData.translations?.en?.description || ""}
											onChange={e =>
												handleTranslationChange("description", e.target.value)
											}
											className='w-full p-4 rounded-lg border border-border bg-surface-hover/30 text-text-primary text-sm min-h-[200px] outline-none focus:border-primary-500'
											placeholder='Enter description, strategy, combos...'
										/>
									</div>
								</div>
							</div>
						</section>

						{/* BLOCK 3: SỨC MẠNH PHIÊU LƯU & TRANG BỊ */}
						<section className='bg-surface-bg border border-border rounded-xl p-6 shadow-sm space-y-6'>
							<h3 className='text-lg font-bold border-l-4 border-blue-500 pl-3 uppercase flex items-center gap-2'>
								<Swords size={20} className='text-blue-500' /> Khởi đầu & Sức
								mạnh
							</h3>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
								<ArrayInputComponent
									label='Sức mạnh Phiêu lưu'
									data={formData.adventurePowerIds || []}
									onChange={d =>
										setFormData({ ...formData, adventurePowerIds: d })
									}
									cachedData={dataLookup.powers}
								/>
								<ArrayInputComponent
									label='Vật phẩm mặc định (Deck)'
									data={formData.itemIds || []}
									onChange={d => setFormData({ ...formData, itemIds: d })}
									cachedData={dataLookup.items}
								/>
							</div>
						</section>

						{/* BLOCK 4: BẢN ĐỒ CHÒM SAO */}
						<section className='bg-surface-bg border border-border rounded-xl p-6 shadow-sm space-y-6'>
							<div className='flex justify-between items-center border-l-4 border-pink-500 pl-3'>
								<h3 className='text-lg font-bold uppercase flex items-center gap-2'>
									<MapIcon size={20} className='text-pink-500' /> Bản đồ Chòm
									sao
								</h3>
								<div className='flex items-center gap-3'>
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
										variant='outline'
										iconLeft={<Plus size={16} />}
										onClick={() => {
											const newIndex = constData.nodes.length + 1;
											const newID = `n${newIndex}`;
											const template = NODE_DEFAULT_TEMPLATES[newID] || {
												nodeType: "starPower",
												requirements: [],
											};

											setConstData({
												...constData,
												nodes: [
													...constData.nodes,
													{
														nodeID: newID,
														nodeName: "",
														nodeType: template.nodeType,
														position: { x: 50, y: 50 },
														nextNodes: [],
														requirements: JSON.parse(
															JSON.stringify(template.requirements),
														),
														description: "",
														isRecommended: false,
													},
												],
											});
										}}
									>
										Thêm Node
									</Button>
								</div>
							</div>

							<div
								className={`grid grid-cols-1 ${isMapVisible ? "xl:grid-cols-2" : ""} gap-8 items-start`}
							>
								{/* CỘT TRÁI: BẢN ĐỒ */}
								{isMapVisible && (
									<div className='space-y-4 sticky top-24'>
										<div
											className='relative aspect-video bg-slate-950 rounded-2xl overflow-hidden border-2 border-border shadow-lg cursor-crosshair'
											ref={mapRef}
											onClick={handleMapClick}
										>
											<img
												src={
													constData.backgroundImage ||
													"/images/placeholder-bg.jpg"
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
														<Star
															size={10}
															className='text-white fill-current'
														/>
													) : (
														<Gem
															size={10}
															className='text-white fill-current'
														/>
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
								)}

								{/* CỘT PHẢI: DANH SÁCH NODE & QUẢN LÝ LIÊN KẾT */}
								<div
									className={`max-h-[800px] overflow-y-auto pr-3 custom-scrollbar ${isMapVisible ? "space-y-2" : "grid grid-cols-1 lg:grid-cols-2 gap-x-6 content-start"}`}
								>
									<div className={!isMapVisible ? "lg:col-span-2" : ""}>
										<ConstellationConnections
											nodes={constData.nodes}
											onChangeNodes={newNodes =>
												setConstData(prev => ({ ...prev, nodes: newNodes }))
											}
										/>
									</div>

									{constData.nodes.length === 0 ? (
										<div
											className={`text-center py-10 text-text-secondary border border-dashed border-border rounded-xl bg-surface-hover/30 ${!isMapVisible ? "lg:col-span-2" : ""}`}
										>
											Chưa có Node nào. Bấm "Thêm Node" để bắt đầu.
										</div>
									) : (
										(constData.nodes || []).map((node, idx) => (
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
														nodes: constData.nodes.filter(
															(_, idx) => idx !== i,
														),
													});
													if (selectedNodeIndex === i)
														setSelectedNodeIndex(null);
												}}
												cachedData={cachedData}
											/>
										))
									)}
								</div>
							</div>
						</section>

						{/* BLOCK 5: TÀI SẢN (ASSETS) & RELICS KHUYÊN DÙNG */}
						<section className='bg-surface-bg border border-border rounded-xl p-6 shadow-sm space-y-8'>
							<h3 className='text-lg font-bold border-l-4 border-emerald-500 pl-3 uppercase flex items-center gap-2'>
								<Box size={20} className='text-emerald-500' /> Quản lý Assets &
								Gợi ý lên đồ
							</h3>

							<div className='grid grid-cols-1 gap-4 bg-surface-hover/30 p-4 rounded-xl border border-border'>
								<h4 className='text-sm font-bold flex items-center gap-2 mb-2'>
									<Link2 size={16} /> Liên kết hình ảnh (Assets)
								</h4>
								{(formData.assets || []).map((asset, index) => (
									<div
										key={index}
										className='flex flex-col md:flex-row items-center gap-6 p-4 bg-surface-bg rounded-xl border border-border relative group'
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
											className='text-red-500 shrink-0 hover:bg-red-500/10 p-2 rounded-full'
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
									className='w-max mt-2'
								>
									+ Thêm Asset
								</Button>
							</div>

							<div className='space-y-6'>
								<div className='grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-border pb-6'>
									<ArrayInputComponent
										label='Vùng (Region - Tiếng Việt)'
										data={formData.regions || []}
										onChange={d => setFormData({ ...formData, regions: d })}
									/>
									<ArrayInputComponent
										label='Vùng (Region - English)'
										data={formData.translations?.en?.regions || []}
										onChange={d => handleTranslationChange("regions", d)}
									/>
								</div>

								<div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
									<ArrayInputComponent
										label='Thẻ (Tags - Tiếng Việt)'
										data={formData.tags || []}
										onChange={d => setFormData({ ...formData, tags: d })}
									/>
									<ArrayInputComponent
										label='Thẻ (Tags - English)'
										data={formData.translations?.en?.tags || []}
										onChange={d => handleTranslationChange("tags", d)}
									/>
								</div>
							</div>

							<div className='flex flex-col gap-4 pt-4 border-t border-border'>
								{/* 🟢 Render linh hoạt số bộ cổ vật hiện có */}
								<div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
									{(formData.relicSets || []).map((set, idx) => (
										<ArrayInputComponent
											key={idx}
											label={`Cổ vật gợi ý Set ${idx + 1}`}
											data={set || []}
											onChange={d => {
												const newSets = [...(formData.relicSets || [])];
												newSets[idx] = d;
												setFormData({ ...formData, relicSets: newSets });
											}}
											onRemoveArray={() => {
												const newSets = (formData.relicSets || []).filter(
													(_, i) => i !== idx,
												);
												setFormData({ ...formData, relicSets: newSets });
											}}
											cachedData={dataLookup.relics}
										/>
									))}
								</div>
								{/* 🟢 Nút Thêm Bộ mới (nằm gọn gàng bên dưới) */}
								<Button
									type='button'
									variant='outline'
									size='sm'
									onClick={() =>
										setFormData(prev => ({
											...prev,
											relicSets: [...(prev.relicSets || []), []],
										}))
									}
									className='w-max mt-2 border-dashed border-primary-500 text-primary-500 hover:bg-primary-500/10'
									iconLeft={<Plus size={16} />}
								>
									+ Thêm bộ Cổ vật mới
								</Button>
							</div>

							<div className='w-full md:w-1/3'>
								<ArrayInputComponent
									label='Ngọc gợi ý (Runes)'
									data={formData.runeIds || []}
									onChange={d => setFormData({ ...formData, runeIds: d })}
									cachedData={dataLookup.runes}
								/>
							</div>
						</section>
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
