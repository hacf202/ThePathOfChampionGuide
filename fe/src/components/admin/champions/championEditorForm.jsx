// src/components/admin/championEditorForm.jsx
import { useState, memo, useEffect, useCallback, useRef, useMemo } from "react";
import Button from "../../common/button";
import InputField from "../../common/inputField";
import {
	Plus,
	Link2,
	Map as MapIcon,
	Star,
	Gem,
	Youtube,
	Info,
	Swords,
	Box,
	Eye,
	EyeOff,
	XCircle,
	Users,
	RefreshCcw,
} from "lucide-react";
import { useTranslation } from "../../../hooks/useTranslation";

// IMPORT CÁC COMPONENT CHUNG MỚI TẠO
import EditorHeaderToolbar from "../common/editorHeaderToolbar";
import ImagePreviewBox from "../common/imagePreviewBox";
import DragDropArrayInput from "../common/dragDropArrayInput";
import DragDropDeckInput from "../common/DragDropDeckInput";
import MarkupEditor from "../MarkupEditor"; // 🟢 Import MarkupEditor
import SafeImage from "../../common/SafeImage";

// Import các component hỗ trợ (Giữ nguyên component gốc cho Nodes/Map)
import {
	getUniqueId,
	NODE_DEFAULT_TEMPLATES,
	ConstellationLine,
	ArrayInputComponent, // Vẫn dùng ArrayInputComponent cho chuỗi String thuần (Tags, Regions)
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
		isDetailLoading,
		isDragPanelOpen,
		onToggleDragPanel,
	}) => {
		const { tUI } = useTranslation();

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
				en: { name: "", description: "", regions: [], tags: [] },
			},
			ratings: {
				damage: 5,
				defense: 5,
				speed: 5,
				consistency: 5,
				synergy: 5,
				independence: 5,
				playstyleNote: "",
			},
			startingDeck: { baseCards: [], referenceCards: [] },
		});

		const [constData, setConstData] = useState({ nodes: [] });
		const [initialData, setInitialData] = useState({});
		const [isDirty, setIsDirty] = useState(false);

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
					ratings: champion.ratings || {
						damage: 5,
						defense: 5,
						speed: 5,
						consistency: 5,
						synergy: 5,
						independence: 5,
						playstyleNote: "",
					},
				};

				// Chuẩn hóa bộ bài khởi đầu (Đảm bảo luôn là object có cardCode và itemCodes)
				if (processedData.startingDeck) {
					const LEGACY_LEVELS = [2, 3, 4, 6, 9, 12, 15, 18, 21, 24, 27];
					let itemCounter = 0;

					const normalizeCards = (cards, isBase) =>
						(cards || []).map(c => {
							if (typeof c === "string") return { cardCode: c, itemCodes: [] };
							
							const normalizedItemCodes = (c.itemCodes || []).map(item => {
								if (typeof item === "string") {
									if (isBase) {
										const assignedLevel = LEGACY_LEVELS[itemCounter] || 2;
										itemCounter++;
										return { itemCode: item, unlockLevel: assignedLevel };
									}
									return { itemCode: item, unlockLevel: 0 };
								}
								// If it's already an object, just increase counter to maintain offset if mixed
								if (isBase) itemCounter++;
								return item;
							});

							return { ...c, itemCodes: normalizedItemCodes };
						});

					processedData.startingDeck = {
						baseCards: normalizeCards(processedData.startingDeck.baseCards, true),
						referenceCards: normalizeCards(processedData.startingDeck.referenceCards, false),
					};
				}

				if (typeof processedData.description === "string") {
					processedData.description = processedData.description
						.replace(/\\\\n/g, "\n")
						.replace(/\\n/g, "\n");
				}
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

		const buildLookup = useCallback(arr => {
			const lookup = {};
			(arr || []).forEach(item => {
				const uid = getUniqueId(item);
				if (uid) lookup[uid] = item;
				if (item.name) lookup[item.name] = item;
				if (item.cardName) lookup[item.cardName] = item;
			});
			return lookup;
		}, []);

		const dataLookup = useMemo(
			() => ({
				powers: buildLookup(cachedData.powers),
				relics: buildLookup(cachedData.relics),
				items: buildLookup(cachedData.items),
				runes: buildLookup(cachedData.runes),
				cards: buildLookup(cachedData.cards),
			}),
			[cachedData, buildLookup],
		);


		const handleInputChange = e =>
			setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

		const handleTranslationChange = useCallback((field, value) => {
			updateTranslationFields("en", { [field]: value });
		}, []);

		const updateTranslationFields = useCallback((lang, fields) => {
			setFormData(prev => ({
				...prev,
				translations: {
					...prev.translations,
					[lang]: {
						...(prev.translations?.[lang] || {}),
						...fields,
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
				return alert(tUI("admin.championForm.errorIdReq") || "Vui lòng nhập Champion ID!");

			const cleanData = { ...formData };
			cleanData.powerStarIds = constData.nodes
				.filter(n => n.nodeType === "starPower" && n.powerCode)
				.map(n => n.powerCode);

			if (typeof cleanData.description === "string")
				cleanData.description = cleanData.description.replace(/\n/g, "\\n");
			if (typeof cleanData.translations?.en?.description === "string")
				cleanData.translations.en.description =
					cleanData.translations.en.description.replace(/\n/g, "\\n");

			// Thống nhất 1 loại Tag: Xóa tags trong translations nếu có
			if (cleanData.translations?.en?.tags) {
				delete cleanData.translations.en.tags;
			}

			const finalConstData = {
				...constData,
				constellationID: cleanData.championID.trim(),
				championName: cleanData.name,
			};

			onSave(cleanData, finalConstData);
		};

		return (
			<form onSubmit={handleSubmit} className='flex flex-col gap-6 pb-24'>
				{/* ĐÃ ÁP DỤNG COMPONENT Toolbar Gộp Logic Modal */}
				<EditorHeaderToolbar
					title={
						formData.isNew
							? tUI("admin.championForm.createTitle")
							: `${tUI("admin.championForm.editTitle")} ${formData.name || ""}`
					}
					isNew={formData.isNew}
					isDirty={isDirty}
					isSaving={isSaving}
					onCancel={onCancel}
					onDelete={() => onDelete(formData.championID)}
					itemName={formData.name}
					isSidebarOpen={isDragPanelOpen}
					onToggleSidebar={onToggleDragPanel}
				/>

				<div className='px-6 space-y-8'>
					{/* BLOCK 1: THÔNG TIN CƠ BẢN */}
					<section className='bg-surface-bg border border-border rounded-xl p-6 shadow-sm space-y-6'>
						<h3 className='text-lg font-bold border-l-4 border-primary-500 pl-3 uppercase flex items-center gap-2'>
							<Info size={20} className='text-primary-500' /> {tUI("admin.championForm.basicInfo")}
						</h3>
						<div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
							<div className='md:col-span-2 space-y-5'>
								<InputField
									label={tUI("admin.championForm.idLabel")}
									name='championID'
									value={formData.championID || ""}
									onChange={handleInputChange}
									required
									disabled={!formData.isNew}
								/>
								<div className='grid grid-cols-2 gap-4'>
									<InputField
										label={tUI("admin.championForm.nameLabel")}
										name='name'
										value={formData.name || ""}
										onChange={handleInputChange}
										required
									/>
									<InputField
										label='English Name'
										value={formData.translations?.en?.name || ""}
										onChange={e =>
											handleTranslationChange("name", e.target.value)
										}
									/>
								</div>
								<div className='grid grid-cols-2 gap-4'>
									<InputField
										label={tUI("admin.championForm.manaLabel")}
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
										label={tUI("admin.championForm.maxStarLabel")}
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

							{/* ĐÃ ÁP DỤNG COMPONENT ImagePreviewBox */}
							<ImagePreviewBox
								imageUrl={formData.assets?.[0]?.avatar}
								label={tUI("admin.championForm.avatarLabel")}
								imageClassName='w-32 h-32 object-contain rounded-xl border-4 border-primary-500/20 shadow-xl'
							/>
						</div>
					</section>

					{/* BLOCK 2: Mô tả & VIDEO */}
					<section className='bg-surface-bg border border-border rounded-xl p-6 shadow-sm space-y-6'>
						<h3 className='text-lg font-bold border-l-4 border-red-500 pl-3 uppercase flex items-center gap-2'>
							<Youtube size={20} className='text-red-500' /> {tUI("admin.championForm.guideSection")}
						</h3>
						<div className='space-y-6'>
							<div className='space-y-2'>
								<label className='block font-semibold text-text-primary text-sm'>
									{tUI("admin.championForm.videoLabel")}
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
										{tUI("admin.championForm.descLabel")} (VI)
									</label>
									<MarkupEditor
										value={formData.description || ""}
										onChange={({ markup, raw }) =>
											setFormData(prev => ({
												...prev,
												description: markup,
												descriptionRaw: raw,
											}))
										}
										placeholder={tUI("admin.championForm.descPlaceholder")}
									/>
								</div>
								<div className='flex flex-col gap-2'>
									<label className='block font-semibold text-text-primary text-sm'>
										{tUI("admin.championForm.descLabel")} (EN)
									</label>
									<MarkupEditor
										value={formData.translations?.en?.description || ""}
										onChange={({ markup, raw }) =>
											updateTranslationFields("en", {
												description: markup,
												descriptionRaw: raw,
											})
										}
										placeholder='Enter description, strategy, combos...'
									/>
								</div>
							</div>
						</div>
					</section>

					{/* BLOCK 3: SỨC MẠNH PHIÊU LƯU & TRANG BỊ */}
					<section className='bg-surface-bg border border-border rounded-xl p-6 shadow-sm space-y-6'>
						<h3 className='text-lg font-bold border-l-4 border-blue-500 pl-3 uppercase flex items-center gap-2'>
							<Swords size={20} className='text-blue-500' /> {tUI("admin.championForm.startPowerLabel")}
						</h3>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
							{/* ĐÃ ÁP DỤNG COMPONENT DragDropArrayInput */}
							<DragDropArrayInput
								label={tUI("admin.championForm.adventurePowerLabel")}
								data={formData.adventurePowerIds || []}
								onChange={d =>
									setFormData({ ...formData, adventurePowerIds: d })
								}
								cachedData={dataLookup.powers}
							/>
							<DragDropArrayInput
								label={tUI("admin.championForm.deckItemLabel")}
								data={formData.itemIds || []}
								onChange={d => setFormData({ ...formData, itemIds: d })}
								cachedData={dataLookup.items}
							/>
						</div>
					</section>

					{/* BLOCK 3B: BỘ BÀI KHỞI ĐẦU (STARTING DECK) */}
					<section className='bg-surface-bg border border-border rounded-xl p-6 shadow-sm space-y-8'>
						<div className='flex items-center gap-3 border-l-4 border-blue-400 pl-4 py-1'>
							<Swords size={28} className='text-blue-400' />
							<div>
								<h3 className='text-xl font-bold uppercase text-text-primary tracking-tight'>
									{tUI("admin.championForm.deckTitle")}
								</h3>
								<p className='text-xs text-text-secondary font-medium'>
									{tUI("admin.championForm.deckSub")}
								</p>
							</div>
						</div>

						{/* Base Cards */}
						<DragDropDeckInput
							label={tUI("admin.championForm.baseCardsLabel")}
							data={formData.startingDeck?.baseCards || []}
							onChange={d =>
								setFormData({
									...formData,
									startingDeck: {
										...(formData.startingDeck || { baseCards: [], referenceCards: [] }),
										baseCards: d,
									},
								})
							}
							cachedData={dataLookup}
							placeholder={tUI("admin.championForm.deckPlaceholder")}
							isReference={false}
						/>

						{/* Reference Cards */}
						<div className='pt-6 border-t border-border/50'>
							<DragDropDeckInput
								label={tUI("admin.championForm.referenceCardsLabel")}
								data={formData.startingDeck?.referenceCards || []}
								onChange={d =>
									setFormData({
										...formData,
										startingDeck: {
											...(formData.startingDeck || { baseCards: [], referenceCards: [] }),
											referenceCards: d,
										},
									})
								}
								cachedData={dataLookup}
								placeholder={tUI("admin.championForm.deckPlaceholder")}
								isReference={true}
							/>
						</div>
					</section>

					{/* BLOCK 4: BẢN ĐỒ CHÒM SAO */}
					<section className='bg-surface-bg border border-border rounded-xl p-6 shadow-sm space-y-6'>
						<div className='flex justify-between items-center border-l-4 border-pink-500 pl-3'>
							<h3 className='text-lg font-bold uppercase flex items-center gap-2'>
								<MapIcon size={20} className='text-pink-500' /> {tUI("admin.championForm.constellationTitle")}
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
									{isMapVisible ? tUI("admin.championForm.hideMap") : tUI("admin.championForm.showMap")}
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
									{tUI("admin.championForm.addNode")}
								</Button>
							</div>
						</div>

						<div
							className={`grid grid-cols-1 ${isMapVisible ? "xl:grid-cols-2" : ""} gap-8`}
						>
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
										label={tUI("admin.championForm.mapBgLabel")}
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
										{tUI("admin.championForm.emptyNodes")}
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
													nodes: constData.nodes.filter((_, idx) => idx !== i),
												});
												if (selectedNodeIndex === i) setSelectedNodeIndex(null);
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
							<Box size={20} className='text-emerald-500' /> {tUI("admin.championForm.assetSection")}
						</h3>

						<div className='grid grid-cols-1 gap-4 bg-surface-hover/30 p-4 rounded-xl border border-border'>
							<h4 className='text-sm font-bold flex items-center gap-2 mb-2'>
								<Link2 size={16} /> {tUI("admin.championForm.assetLabel")}
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
														<SafeImage
															src={asset[field]}
															className='h-20 w-auto rounded-lg object-contain bg-black/40 border shadow-inner'
															alt={field}
															width={200}
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
								+ {tUI("admin.championForm.addAsset")}
							</Button>
						</div>

						{/* String Arrays (Tags, Regions) - Vẫn giữ ArrayInputComponent vì đây là nhập chữ, không phải Drag Drop */}
						<div className='space-y-6'>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-border pb-6'>
								<ArrayInputComponent
									label={tUI("admin.championForm.regionLabel") + " (VI)"}
									data={formData.regions || []}
									onChange={d => setFormData({ ...formData, regions: d })}
								/>
								<ArrayInputComponent
									label={tUI("admin.championForm.regionLabel") + " (EN)"}
									data={formData.translations?.en?.regions || []}
									onChange={d => handleTranslationChange("regions", d)}
								/>
							</div>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-border pb-6'>
								<ArrayInputComponent
									label={tUI("admin.championForm.tagLabel") + " (VI)"}
									data={formData.tags || []}
									onChange={d => setFormData({ ...formData, tags: d })}
								/>
								<div className='hidden md:block opacity-30 pointer-events-none'>
									{/* English tags removed - using common tags */}
								</div>
							</div>
						</div>

						<div className='flex flex-col gap-4 pt-4 border-t border-border'>
							<div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
								{(formData.relicSets || []).map((set, idx) => (
									<div
										key={idx}
										className='relative bg-surface-hover/20 p-4 rounded-xl border border-border'
									>
										{/* Nút xóa Set */}
										<button
											type='button'
											onClick={() => {
												const newSets = (formData.relicSets || []).filter(
													(_, i) => i !== idx,
												);
												setFormData({ ...formData, relicSets: newSets });
											}}
											className='absolute top-2 right-2 text-xs text-red-500 hover:bg-red-500/10 p-1 rounded font-bold'
										>
											{tUI("admin.championForm.deleteSet")}
										</button>

										{/* ĐÃ ÁP DỤNG COMPONENT DragDropArrayInput */}
										<DragDropArrayInput
											label={tUI("admin.championForm.relicSuggest", { idx: idx + 1 })}
											data={set || []}
											onChange={d => {
												const newSets = [...(formData.relicSets || [])];
												newSets[idx] = d;
												setFormData({ ...formData, relicSets: newSets });
											}}
											cachedData={dataLookup.relics}
											allowDuplicates={true}
										/>
									</div>
								))}
							</div>
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
								{tUI("admin.championForm.addRelicSet")}
							</Button>
						</div>

						<div className='w-full md:w-1/3'>
							<DragDropArrayInput
								label={tUI("admin.championForm.runeSuggest")}
								data={formData.runeIds || []}
								onChange={d => setFormData({ ...formData, runeIds: d })}
								cachedData={dataLookup.runes}
							/>
						</div>

						{/* BLOCK 6: ĐÁNH GIÁ CHỈ SỐ & LỐI CHƠI (HEXAGON RATINGS) */}
						<div className='flex flex-col gap-4 bg-surface-hover/30 p-4 rounded-xl border border-border py-6 mt-4'>
							<div className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2'>
								<h4 className='text-sm font-bold text-primary-500 uppercase flex items-center gap-2'>
									<Box size={18} /> {tUI("admin.championForm.ratingTitle")}
								</h4>
								<div className='flex items-center gap-3'>
									{isDetailLoading && (
										<span className='text-xs italic text-text-secondary animate-pulse'>
											{tUI("admin.championForm.loadingCommunity")}
										</span>
									)}
									{champion.communityRatings ? (
										<button
											type='button'
											onClick={() => {
												if (window.confirm(tUI("admin.championForm.syncConfirm") || "Do you want to sync?")) {
													setFormData(prev => ({
														...prev,
														ratings: {
															...prev.ratings,
															damage: champion.communityRatings.damage,
															defense: champion.communityRatings.defense,
															speed: champion.communityRatings.speed,
															consistency: champion.communityRatings.consistency,
															synergy: champion.communityRatings.synergy,
															independence: champion.communityRatings.independence,
														}
													}));
												}
											}}
											className='text-xs font-bold text-white bg-primary-500 hover:bg-primary-600 px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-sm transition-all'
										>
											<RefreshCcw size={14} /> {tUI("admin.championForm.syncCommunity")}
										</button>
									) : (
										!isDetailLoading && (
											<span className='text-[10px] text-text-secondary bg-surface-bg border px-2 py-1 rounded italic'>
												{tUI("admin.championForm.noCommunityRating")}
											</span>
										)
									)}
								</div>
							</div>

							<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
								{[
									"damage",
									"defense",
									"speed",
									"consistency",
									"synergy",
									"independence",
								].map(criteria => (
									<div key={criteria} className='flex flex-col gap-1'>
										<div className='flex justify-between items-center'>
											<label className='text-sm font-semibold text-text-secondary capitalize'>
												{tUI(`championDetail.ratings.${criteria}`)} (
												{formData.ratings?.[criteria] || 5}/10)
											</label>
											{champion.communityRatings?.[criteria] !== undefined && (
												<span className='text-[10px] font-bold text-primary-400 bg-primary-500/10 px-1.5 py-0.5 rounded flex items-center gap-1'>
													<Users size={10} /> {champion.communityRatings[criteria]}
												</span>
											)}
										</div>
										<input
											type='range'
											min='1'
											max='10'
											step='0.1'
											value={formData.ratings?.[criteria] || 5}
											onChange={e =>
												setFormData(prev => ({
													...prev,
													ratings: {
														...prev.ratings,
														[criteria]: Number(e.target.value),
													},
												}))
											}
											className='w-full accent-primary-500'
										/>
									</div>
								))}
							</div>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-4'>
								<div className='flex flex-col gap-2'>
									<label className='text-sm font-semibold'>
										{tUI("admin.championForm.playstyleNote")} (VI)
									</label>
									<textarea
										rows={3}
										value={formData.ratings?.playstyleNote || ""}
										onChange={e =>
											setFormData(prev => ({
												...prev,
												ratings: {
													...prev.ratings,
													playstyleNote: e.target.value,
												},
											}))
										}
										className='w-full bg-surface-bg border border-border p-3 rounded-lg text-text-primary focus:border-primary-500 outline-none resize-y'
										placeholder={tUI("admin.championForm.playstylePlaceholder")}
									/>
								</div>
								<div className='flex flex-col gap-2'>
									<label className='text-sm font-semibold'>
										{tUI("admin.championForm.playstyleNote")} (EN)
									</label>
									<textarea
										rows={3}
										value={
											formData.translations?.en?.ratings?.playstyleNote || ""
										}
										onChange={e =>
											setFormData(prev => ({
												...prev,
												translations: {
													...prev.translations,
													en: {
														...prev.translations?.en,
														ratings: {
															...(prev.translations?.en?.ratings || {}),
															playstyleNote: e.target.value,
														},
													},
												},
											}))
										}
										className='w-full bg-surface-bg border border-border p-3 rounded-lg text-text-primary focus:border-primary-500 outline-none resize-y'
										placeholder='English translation for notes...'
									/>
								</div>
							</div>
						</div>
					</section>
				</div>
			</form>
		);
	},
);

export default ChampionEditorForm;
