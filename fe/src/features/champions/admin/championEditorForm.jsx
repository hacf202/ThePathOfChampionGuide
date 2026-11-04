// src/components/admin/championEditorForm.jsx
import { useState, memo, useEffect, useCallback, useRef, useMemo } from "react";
import Swal from "sweetalert2";
import Button from "@/components/common/button";
import { FileUp, FileDown, Copy, Check } from "lucide-react";
import Modal from "@/components/common/modal";
import { useTranslation } from "@/hooks/useTranslation";

import EditorHeaderToolbar from "@/components/admin/common/editorHeaderToolbar";

// Import Sections
import BasicInfoSection from "./sections/BasicInfoSection";
import GuideSection from "./sections/GuideSection";
import PowersItemsSection from "./sections/PowersItemsSection";
import StartingDeckSection from "./sections/StartingDeckSection";
import ConstellationSection from "./sections/ConstellationSection";
import AssetsRelicsSection from "./sections/AssetsRelicsSection";
import RatingsSection from "./sections/RatingsSection";
import SupportChampionsSection from "./sections/SupportChampionsSection";

// Import helpers
import { getUniqueId } from "@/features/champions/admin/championEditorHelpers";
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

// Helper chuẩn hóa các bộ cổ vật (hỗ trợ cả mảng các mã [R001, ...] hoặc mảng các object)
const normalizeRelicSetsData = (rawSets) => {
	if (!Array.isArray(rawSets) || rawSets.length === 0) {
		return [{ items: [], title: "", recommendedStars: 6, comboSteps: [], proTips: [], description: "", descriptionRaw: "", videoLink: "", translations: { en: { title: "", description: "" } } }];
	}
	return rawSets.map(set => {
		if (Array.isArray(set)) {
			return {
				items: set,
				title: "",
				recommendedStars: 6,
				comboSteps: [],
				proTips: [],
				description: "",
				descriptionRaw: "",
				videoLink: "",
				translations: { en: { title: "", description: "" } },
			};
		}
		return {
			...set,
			items: Array.isArray(set.items) ? set.items : [],
			title: typeof set.title === "object" ? (set.title.vi || "") : (set.title || ""),
			recommendedStars: set.recommendedStars ?? 6,
			comboSteps: normalizeComboStepsData(set.comboSteps),
			proTips: normalizeProTipsData(set.proTips),
			description: typeof set.description === "string" ? set.description.replace(/\\n/g, "\n") : "",
			descriptionRaw: typeof set.descriptionRaw === "string" ? set.descriptionRaw.replace(/\\n/g, "\n") : "",
			videoLink: set.videoLink || "",
			translations: {
				en: {
					title: typeof set.title === "object" ? (set.title.en || "") : (set.translations?.en?.title || ""),
					description: typeof set.description === "object" ? (set.description.en || "") : (set.translations?.en?.description || ""),
					descriptionRaw: typeof set.descriptionRaw === "object" ? (set.descriptionRaw.en || "") : (set.translations?.en?.descriptionRaw || ""),
					...(set.translations?.en || {}),
				},
			},
		};
	});
};

// Helper chuẩn hóa các bước combo
const normalizeComboStepsData = (rawSteps) => {
	if (!Array.isArray(rawSteps)) return [];
	return rawSteps.map((s, idx) => {
		let viPhase = "";
		let enPhase = "";
		if (typeof s.phase === "object" && s.phase !== null) {
			viPhase = s.phase.vi || "";
			enPhase = s.phase.en || "";
		} else if (typeof s.phase === "string") {
			viPhase = s.phase;
			enPhase = s.translations?.en?.phase || "";
		} else if (s.title || s.description) {
			const titleVi = typeof s.title === "object" ? (s.title.vi || "") : (s.title || "");
			const titleEn = typeof s.title === "object" ? (s.title.en || "") : (s.title || "");
			const descVi = typeof s.description === "object" ? (s.description.vi || "") : (s.description || "");
			const descEn = typeof s.description === "object" ? (s.description.en || "") : (s.description || "");
			viPhase = titleVi && descVi ? `${titleVi} // ${descVi}` : (descVi || titleVi);
			enPhase = titleEn && descEn ? `${titleEn} // ${descEn}` : (descEn || titleEn);
		}
		return {
			step: s.step || idx + 1,
			phase: viPhase,
			translations: {
				en: {
					phase: enPhase,
				},
			},
		};
	});
};

// Helper chuẩn hóa các mẹo chiến thuật (proTips)

// Helper chuẩn hóa dữ liệu tướng phụ khuyên dùng
const normalizeSupportChampionsData = (rawSubs) => {
	if (!Array.isArray(rawSubs)) return [];
	return rawSubs
		.map(sub => {
			if (typeof sub === "string") {
				return { cardCode: sub, name: "" };
			}
			return {
				cardCode: sub?.cardCode || sub?.code || "",
				name: sub?.name || "",
			};
		})
		.filter(s => s.cardCode);
};
const normalizeProTipsData = (rawTips) => {
	if (!Array.isArray(rawTips)) return [];
	return rawTips.map(p => {
		if (typeof p === "string") {
			return { tip: p, translations: { en: { tip: "" } } };
		}
		let viTip = "";
		let enTip = "";
		if (typeof p?.tip === "object" && p.tip !== null) {
			viTip = p.tip.vi || "";
			enTip = p.tip.en || "";
		} else {
			viTip = p?.tip || "";
			enTip = p?.translations?.en?.tip || "";
		}
		return {
			tip: viTip,
			translations: {
				en: {
					tip: enTip,
				},
			},
		};
	});
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
		isDragPanelOpen,
		onToggleDragPanel,
	}) => {
		const { tUI } = useTranslation();

		const initialRelicRaw = champion?.relicSets?.length
			? champion.relicSets
			: champion?.relics?.length
			? champion.relics
			: null;

		const [formData, setFormData] = useState({
			championID: "",
			cardCode: "",
			name: "",
			cost: 0,
			maxStar: 3,
			description: "",
			descriptionRaw: "",
			regions: [],
			tags: [],
			powerStarIds: [],
			adventurePowerIds: [],
			itemIds: [],
			runeIds: [],
			playStyle: "",
			tier: "",
			optimalStars: champion?.optimalStars || "",
			powerSpike: champion?.powerSpike || "",
			counter: champion?.counter || "",
			relicSets: normalizeRelicSetsData(initialRelicRaw),
			comboSteps: normalizeComboStepsData(champion?.comboSteps),
			proTips: normalizeProTipsData(champion?.proTips),
			assets: [{ fullAbsolutePath: "", gameAbsolutePath: "", avatar: "" }],
			videoLink: "",
			translations: {
				en: {
					name: "",
					description: "",
					descriptionRaw: "",
					regions: [],
					tags: [],
					playStyle: "",
					tier: "",
					optimalStars: "",
					powerSpike: "",
					counter: "",
					ratings: { playstyleNote: "" },
				},
			},
			supportChampions: normalizeSupportChampionsData(champion?.supportChampions || champion?.subChampionIds || champion?.recommendedSubChampions),
			ratings: {
				damage: 5,
				defense: 5,
				synergy: 5,
				difficulty: 5,
				playstyleNote: "",
			},
			startingDeck: { baseCards: [], referenceCards: [] },
		});

		const [constData, setConstData] = useState({ nodes: [] });
		const [initialData, setInitialData] = useState({});
		const [isDirty, setIsDirty] = useState(false);
		const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);
		const [draftJsonText, setDraftJsonText] = useState("");
		const [draftError, setDraftError] = useState("");
		const [copiedDraft, setCopiedDraft] = useState(false);

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
				const activeRelicRaw = champion.relicSets?.length
					? champion.relicSets
					: champion.relics?.length
					? champion.relics
					: null;

				const viPlaystyleNote =
					typeof champion.ratings?.playstyleNote === "object" && champion.ratings.playstyleNote !== null
						? champion.ratings.playstyleNote.vi || ""
						: champion.ratings?.playstyleNote || "";

				const enPlaystyleNote =
					typeof champion.ratings?.playstyleNote === "object" && champion.ratings.playstyleNote !== null
						? champion.ratings.playstyleNote.en || ""
						: champion.translations?.en?.ratings?.playstyleNote || "";

				const processedData = {
					...champion,
					cardCode: champion.cardCode || "",
					playStyle: champion.playStyle || "",
					tier: champion.tier || "",
					optimalStars: champion.optimalStars || "",
					powerSpike: champion.powerSpike || "",
					counter: champion.counter || "",
					tags: champion.tags || champion.tag || [],
					itemIds: champion.itemIds || champion.defaultItems || [],
					adventurePowerIds:
						champion.adventurePowerIds || champion.adventurePowers || [],
					runeIds: champion.runeIds || champion.rune || [],
					relicSets: normalizeRelicSetsData(activeRelicRaw),
					comboSteps: normalizeComboStepsData(champion.comboSteps),
					proTips: normalizeProTipsData(champion.proTips),
					assets: champion.assets?.length
						? champion.assets
						: [{ fullAbsolutePath: "", gameAbsolutePath: "", avatar: "" }],
					translations: {
						en: {
							name: "",
							description: "",
							descriptionRaw: "",
							regions: [],
							playStyle: "",
							tier: "",
							optimalStars: "",
							powerSpike: "",
							counter: "",
							...(champion.translations?.en || {}),
							ratings: {
								playstyleNote: enPlaystyleNote,
								...(champion.translations?.en?.ratings || {}),
							},
							tags: champion.translations?.en?.tags || [],
						},
						...(champion.translations || {}),
					},
					ratings: {
						damage: champion.ratings?.damage ?? 5,
						defense: champion.ratings?.defense ?? 5,
						synergy: champion.ratings?.synergy ?? 5,
						difficulty: champion.ratings?.difficulty ?? 5,
						playstyleNote: viPlaystyleNote,
					},
				};

				// Chuẩn hóa bộ bài khởi đầu
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
				if (typeof processedData.descriptionRaw === "string") {
					processedData.descriptionRaw =
						processedData.descriptionRaw
							.replace(/\\\\n/g, "\n")
							.replace(/\\n/g, "\n");
				}
				if (typeof processedData.translations?.en?.description === "string") {
					processedData.translations.en.description =
						processedData.translations.en.description
							.replace(/\\\\n/g, "\n")
							.replace(/\\n/g, "\n");
				}
				if (typeof processedData.translations?.en?.descriptionRaw === "string") {
					processedData.translations.en.descriptionRaw =
						processedData.translations.en.descriptionRaw
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
				subChampions: buildLookup(cachedData.subChampions),
				regions: iconRegions.reduce((acc, r) => {
					acc[r.name] = r;
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

		const handleTranslationChange = useCallback((field, value) => {
			updateTranslationFields("en", { [field]: value });
		}, [updateTranslationFields]);

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

		const handleApplyDraft = useCallback(() => {
			try {
				setDraftError("");
				if (!draftJsonText.trim()) {
					setDraftError("Vui lòng dán nội dung JSON nháp.");
					return;
				}
				let parsed = JSON.parse(draftJsonText);

				const currentChampId = (champion?.championID || formData.championID || "").toLowerCase();
				const currentChampName = (champion?.name || formData.name || "").toLowerCase();

				if (Array.isArray(parsed)) {
					const matched = parsed.find(
						c => (c.championID && c.championID.toLowerCase() === currentChampId) ||
							 (c.name && c.name.toLowerCase() === currentChampName)
					);
					if (matched) parsed = matched;
					else if (parsed.length === 1) parsed = parsed[0];
				} else if (parsed && typeof parsed === "object") {
					if (currentChampId && parsed[champion?.championID]) {
						parsed = parsed[champion.championID];
					} else if (currentChampName && parsed[champion?.name]) {
						parsed = parsed[champion.name];
					} else {
						const key = Object.keys(parsed).find(
							k => k.toLowerCase() === currentChampId || k.toLowerCase() === currentChampName
						);
						if (key && typeof parsed[key] === "object" && !parsed.tier && !parsed.relicSets) {
							parsed = parsed[key];
						}
					}
				}

				const normalizeNewlines = str =>
					typeof str === "string" ? str.replace(/\\n/g, "\n") : str;

				setFormData(prev => {
					const next = { ...prev };
					if (parsed.playStyle !== undefined) {
						next.playStyle = typeof parsed.playStyle === "object" ? (parsed.playStyle.vi || "") : parsed.playStyle;
					}
					if (parsed.tier !== undefined) {
						next.tier = typeof parsed.tier === "object" ? (parsed.tier.vi || "") : parsed.tier;
					}
					if (parsed.optimalStars !== undefined) {
						next.optimalStars = typeof parsed.optimalStars === "object" ? (parsed.optimalStars.vi || "") : parsed.optimalStars;
					}
					if (parsed.powerSpike !== undefined) {
						next.powerSpike = typeof parsed.powerSpike === "object" ? (parsed.powerSpike.vi || "") : parsed.powerSpike;
					}
					if (parsed.counter !== undefined) {
						next.counter = typeof parsed.counter === "object" ? (parsed.counter.vi || "") : parsed.counter;
					}
					if (parsed.videoLink !== undefined) next.videoLink = parsed.videoLink;
					if (parsed.description !== undefined) next.description = normalizeNewlines(parsed.description);
					if (parsed.descriptionRaw !== undefined) next.descriptionRaw = normalizeNewlines(parsed.descriptionRaw);

					const rawRelicSets =
						Array.isArray(parsed.relicSets) && parsed.relicSets.length > 0
							? parsed.relicSets
							: Array.isArray(parsed.relics) && parsed.relics.length > 0
							? parsed.relics
							: null;
					if (rawRelicSets) {
						next.relicSets = normalizeRelicSetsData(rawRelicSets);
					}

					if (Array.isArray(parsed.comboSteps)) {
						next.comboSteps = normalizeComboStepsData(parsed.comboSteps);
					}

					if (Array.isArray(parsed.proTips)) {
						next.proTips = normalizeProTipsData(parsed.proTips);
					}

					if (Array.isArray(parsed.tags)) {
						next.tags = parsed.tags;
					}

					if (Array.isArray(parsed.adventurePowerIds)) {
						next.adventurePowerIds = parsed.adventurePowerIds;
					}

					let viNote = prev.ratings?.playstyleNote || "";
					let enNote = prev.translations?.en?.ratings?.playstyleNote || "";

					if (parsed.ratings) {
						if (typeof parsed.ratings.playstyleNote === "object" && parsed.ratings.playstyleNote !== null) {
							viNote = parsed.ratings.playstyleNote.vi || "";
							enNote = parsed.ratings.playstyleNote.en || enNote;
						} else if (typeof parsed.ratings.playstyleNote === "string") {
							viNote = parsed.ratings.playstyleNote;
						}

						next.ratings = {
							...prev.ratings,
							...parsed.ratings,
							playstyleNote: viNote,
						};
					}

					const parsedEn = parsed.translations?.en || {};
					if (typeof parsed.playStyle === "object" && parsed.playStyle?.en) parsedEn.playStyle = parsed.playStyle.en;
					if (typeof parsed.tier === "object" && parsed.tier?.en) parsedEn.tier = parsed.tier.en;
					if (typeof parsed.optimalStars === "object" && parsed.optimalStars?.en) parsedEn.optimalStars = parsed.optimalStars.en;
					if (typeof parsed.powerSpike === "object" && parsed.powerSpike?.en) parsedEn.powerSpike = parsed.powerSpike.en;
					if (typeof parsed.counter === "object" && parsed.counter?.en) parsedEn.counter = parsed.counter.en;

					next.translations = {
						...prev.translations,
						en: {
							...(prev.translations?.en || {}),
							...parsedEn,
							tags: Array.isArray(parsedEn.tags)
								? parsedEn.tags
								: (prev.translations?.en?.tags || []),
							description: normalizeNewlines(
								parsedEn.description || prev.translations?.en?.description || ""
							),
							descriptionRaw: normalizeNewlines(
								parsedEn.descriptionRaw || prev.translations?.en?.descriptionRaw || ""
							),
							ratings: {
								...(prev.translations?.en?.ratings || {}),
								playstyleNote: enNote,
								...(parsedEn.ratings || {}),
							},
						},
					};

					return next;
				});

				setIsDraftModalOpen(false);
				setDraftJsonText("");
				Swal.fire({
					icon: "success",
					title: "Đã nạp dữ liệu nháp!",
					text: "Dữ liệu đã được điền tạm thời vào các mục trên form để bạn kiểm tra. Dữ liệu CHƯA được lưu vào CSDL cho đến khi bạn bấm 'Lưu thay đổi'.",
					confirmButtonColor: "#3b82f6",
				});
			} catch (e) {
				setDraftError("Lỗi cú pháp JSON: " + e.message);
			}
		}, [draftJsonText, champion?.championID, champion?.name, formData.championID, formData.name]);

		const handleExportCurrentDraft = useCallback(() => {
			const exportData = {
				championID: formData.championID,
				name: formData.name,
				playStyle: formData.playStyle,
				tier: formData.tier,
				optimalStars: formData.optimalStars,
				powerSpike: formData.powerSpike,
				counter: formData.counter,
				tags: formData.tags,
				description: formData.description,
				descriptionRaw: formData.descriptionRaw,
				videoLink: formData.videoLink,
				relicSets: formData.relicSets,
				comboSteps: formData.comboSteps,
				proTips: formData.proTips,
				supportChampions: formData.supportChampions,
				ratings: formData.ratings,
				translations: formData.translations,
			};
			navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
			setCopiedDraft(true);
			setTimeout(() => setCopiedDraft(false), 2000);
		}, [formData]);

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
			if (typeof cleanData.descriptionRaw === "string")
				cleanData.descriptionRaw = cleanData.descriptionRaw.replace(/\n/g, "\\n");
			if (typeof cleanData.translations?.en?.description === "string")
				cleanData.translations.en.description =
					cleanData.translations.en.description.replace(/\n/g, "\\n");
			if (typeof cleanData.translations?.en?.descriptionRaw === "string")
				cleanData.translations.en.descriptionRaw =
					cleanData.translations.en.descriptionRaw.replace(/\n/g, "\\n");

			if (cleanData.translations?.en?.tags) {
				cleanData.translations.en.tags = cleanData.translations.en.tags.filter(Boolean);
			}
			if (cleanData.tags) {
				cleanData.tags = cleanData.tags.filter(Boolean);
			}
			cleanData.supportChampions = normalizeSupportChampionsData(formData.supportChampions);
			cleanData.comboSteps = formData.comboSteps || [];
			cleanData.proTips = formData.proTips || [];
			cleanData.relicSets = (formData.relicSets || []).map(set => ({
				...set,
				items: Array.isArray(set.items) ? set.items : [],
				recommendedStars: Number(set.recommendedStars) || 6,
				comboSteps: set.comboSteps || [],
				proTips: set.proTips || [],
			}));

			const finalConstData = {
				...constData,
				constellationID: cleanData.championID.trim(),
				championName: cleanData.name,
			};

			onSave(cleanData, finalConstData);
		};

		return (
			<form onSubmit={handleSubmit} className='flex flex-col gap-6 pb-24'>
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
					extraActions={
						<Button
							type="button"
							variant="outline"
							onClick={() => setIsDraftModalOpen(true)}
							title="Nạp hoặc xuất dữ liệu nháp tạm thời (JSON)"
							className="flex items-center gap-1.5 text-xs font-medium border-primary-500/40 text-primary-400 hover:bg-primary-500/10"
						>
							<FileUp size={15} />
							<span>Dữ Liệu Nháp (Draft)</span>
						</Button>
					}
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

					
					<SupportChampionsSection 
						formData={formData} 
						setFormData={setFormData} 
						cachedData={cachedData} 
						tUI={tUI} 
					/>
					<RatingsSection 
						formData={formData} 
						setFormData={setFormData} 
						tUI={tUI} 
					/>
				</div>

				{/* MODAL QUẢN LÝ DỮ LIỆU NHÁP (DRAFT) */}
				<Modal
					isOpen={isDraftModalOpen}
					onClose={() => setIsDraftModalOpen(false)}
					title="Quản Lý Dữ Liệu Nháp Tướng (Draft Data)"
					maxWidth="max-w-2xl"
				>
					<div className="space-y-4 text-text-primary text-sm">
						<div className="p-3 bg-primary-500/10 border border-primary-500/20 rounded-lg text-xs leading-relaxed text-text-secondary">
							💡 <strong>Lưu ý quan trọng:</strong> Dữ liệu nháp chỉ được nạp tạm vào các ô nhập liệu trên form để bạn xem trước và kiểm tra trực quan. Hệ thống sẽ <strong>KHÔNG</strong> ghi đè hay đẩy lên CSDL cho đến khi bạn tự tay bấm nút <em>"Lưu thay đổi"</em> trên thanh công cụ.
						</div>

						<div>
							<div className="flex justify-between items-center mb-1.5">
								<label className="font-semibold text-text-primary text-xs">
									Nội dung JSON bản nháp:
								</label>
								<button
									type="button"
									onClick={handleExportCurrentDraft}
									className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1 font-medium transition-colors"
								>
									{copiedDraft ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
									<span>{copiedDraft ? "Đã chép vào Clipboard!" : "Sao chép dữ liệu hiện tại"}</span>
								</button>
							</div>
							<textarea
								rows={12}
								value={draftJsonText}
								onChange={e => {
									setDraftJsonText(e.target.value);
									if (draftError) setDraftError("");
								}}
								placeholder={`Dán payload JSON của tướng vào đây...\nVí dụ:\n{\n  "playStyle": "Cân Bằng / Chỉ Số",\n  "tier": "B Tier // Sát thương ổn",\n  "relicSets": [...],\n  "comboSteps": [...],\n  "proTips": [...],\n  "ratings": { "damage": 8, "defense": 7, "synergy": 6, "difficulty": 4 },\n  "translations": { "en": { "playStyle": "Midrange / Body Builder", ... } }\n}`}
								className="w-full font-mono text-xs p-3 bg-surface-card border border-border rounded-lg text-text-primary focus:ring-1 focus:ring-primary-500 focus:outline-none placeholder:text-text-secondary/50 resize-y"
							/>
							{draftError && (
								<p className="mt-1.5 text-xs text-red-400 font-medium">{draftError}</p>
							)}
						</div>

						<div className="flex justify-end items-center gap-3 pt-2 border-t border-border">
							<Button
								type="button"
								variant="ghost"
								onClick={() => setIsDraftModalOpen(false)}
							>
								{tUI("admin.common.cancel") || "Đóng"}
							</Button>
							<Button
								type="button"
								variant="primary"
								onClick={handleApplyDraft}
								disabled={!draftJsonText.trim()}
								className="flex items-center gap-1.5"
							>
								<FileDown size={16} />
								<span>Nạp Tạm Vào Form</span>
							</Button>
						</div>
					</div>
				</Modal>
			</form>
		);
	},
);

ChampionEditorForm.displayName = "ChampionEditorForm";
export default ChampionEditorForm;
