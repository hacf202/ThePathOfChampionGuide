// src/components/admin/championEditorForm.jsx
import { useState, memo, useEffect, useCallback, useRef, useMemo } from "react";
import Swal from "sweetalert2";
import Button from "@/components/common/button";
import InputField from "@/components/common/inputField";
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
import { useTranslation } from "@/hooks/useTranslation";

// IMPORT CÁC COMPONENT CHUNG MỚI TẠO

import EditorHeaderToolbar from "@/components/admin/common/editorHeaderToolbar";

// Import Sections
import BasicInfoSection from "./sections/BasicInfoSection";
import GuideSection from "./sections/GuideSection";
import PowersItemsSection from "./sections/PowersItemsSection";
import StartingDeckSection from "./sections/StartingDeckSection";
import ConstellationSection from "./sections/ConstellationSection";
import AssetsRelicsSection from "./sections/AssetsRelicsSection";
import RatingsSection from "./sections/RatingsSection";

import ImagePreviewBox from "@/components/admin/common/imagePreviewBox";
import DragDropArrayInput from "@/components/admin/common/dragDropArrayInput";
import DragDropDeckInput from "@/components/admin/common/DragDropDeckInput";
import MarkupEditor from "@/components/admin/MarkupEditor"; // 🟢 Import MarkupEditor
import SafeImage from "@/components/common/SafeImage";

// Import các component hỗ trợ (Giữ nguyên component gốc cho Nodes/Map)
import {
	getUniqueId,
	NODE_DEFAULT_TEMPLATES,
	ConstellationLine,
	ArrayInputComponent, // Vẫn dùng ArrayInputComponent cho chuỗi String thuần (Tags, Regions)
	ConstellationConnections,
	NodeEditor,
} from "@/features/champions/admin/championEditorHelpers";
import iconRegions from "@/assets/data/icon.json";

const convertToEmbedUrl = (url) => {
	if (!url) return "";
	const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
	const match = url.match(regExp);

	if (match && match[2].length === 11) {
		return `https://www.youtube.com/embed/${match[2]}`;
	}
	return url;
};

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
			cardCode: "",
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
			relicSets: champion?.relicSets?.length 
				? champion.relicSets.map(set => Array.isArray(set) ? { items: set, description: "", videoLink: "" } : set)
				: [{ items: [], description: "", videoLink: "" }],
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
					cardCode: champion.cardCode || "",
					tags: champion.tags || champion.tag || [],
					itemIds: champion.itemIds || champion.defaultItems || [],
					adventurePowerIds:
						champion.adventurePowerIds || champion.adventurePowers || [],
					runeIds: champion.runeIds || champion.rune || [],
					relicSets: champion.relicSets?.length 
						? champion.relicSets.map(set => Array.isArray(set) ? { items: set, description: "", videoLink: "" } : set)
						: [{ items: [], description: "", videoLink: "" }],
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
				regions: iconRegions.reduce((acc, r) => {
					acc[r.name] = r;
					// Thêm mapping cho tên tiếng Anh nếu tên hiện tại là tiếng Việt
					const enMapping = {
						"Thành Phố Bandle": "Bandle City",
						"Quần Đảo Bóng Đêm": "Shadow Isles",
						"Hoa Linh Lục Địa": "Spirit Blossom",
						"Trung Lập": "Neutral",
					};
					if (enMapping[r.name]) {
						acc[enMapping[r.name]] = r;
					}
					return acc;
				}, {}),
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
			if (!formData.championID?.trim()) {
				Swal.fire({
					icon: "warning",
					title: "Thiếu dữ liệu",
					text: tUI("admin.championForm.errorIdReq") || "Vui lòng nhập Champion ID!",
					confirmButtonColor: "#3b82f6",
				});
				return;
			}

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
					<BasicInfoSection 
						formData={formData} 
						setFormData={setFormData} 
						handleInputChange={handleInputChange} 
						handleTranslationChange={handleTranslationChange} 
						tUI={tUI} 
					/>

					<GuideSection 
						formData={formData} 
						setFormData={setFormData} 
						updateTranslationFields={updateTranslationFields} 
						convertToEmbedUrl={convertToEmbedUrl} 
						tUI={tUI} 
					/>

					<PowersItemsSection 
						formData={formData} 
						setFormData={setFormData} 
						dataLookup={dataLookup} 
						tUI={tUI} 
					/>

					<StartingDeckSection 
						formData={formData} 
						setFormData={setFormData} 
						dataLookup={dataLookup} 
						tUI={tUI} 
					/>

					<ConstellationSection 
						constData={constData} 
						setConstData={setConstData} 
						cachedData={cachedData} 
						selectedNodeIndex={selectedNodeIndex} 
						setSelectedNodeIndex={setSelectedNodeIndex} 
						isMapVisible={isMapVisible} 
						setIsMapVisible={setIsMapVisible} 
						handleMapClick={handleMapClick} 
						handleNodeChange={handleNodeChange} 
						handleNodeMultiChange={handleNodeMultiChange} 
						tUI={tUI} 
					/>

					<AssetsRelicsSection 
						formData={formData} 
						setFormData={setFormData} 
						dataLookup={dataLookup} 
						handleTranslationChange={handleTranslationChange} 
						convertToEmbedUrl={convertToEmbedUrl} 
						tUI={tUI} 
					/>

					<RatingsSection 
						formData={formData} 
						setFormData={setFormData} 
						champion={champion} 
						isDetailLoading={isDetailLoading} 
						tUI={tUI} 
					/>
				</div>
			</form>
		);
	},
);

export default ChampionEditorForm;
