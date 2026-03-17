// src/pages/admin/guideEditorForm.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import { useTranslation } from "../../../hooks/useTranslation"; // 🟢
import BlockEditor from "./blockEditor";
import PreviewBlock from "./previewBlock";
import Button from "../../common/button";
import Modal from "../../common/modal";
import InputField from "../../common/inputField";
import { ArrowLeft, Save, AlertTriangle, Eye, Edit3 } from "lucide-react";

const GuideForm = ({ slug }) => {
	const { tUI, t, language } = useTranslation();
	const navigate = useNavigate();
	const { token } = useAuth();
	const isEditMode = slug && slug !== "new";

	const [formData, setFormData] = useState({
		title: "",
		title_en: "",
		slug: "",
		thumbnail: "",
		author: "",
		description: "",
		description_en: "",
		content: [],
	});

	const [isDirty, setIsDirty] = useState(false);
	const [isPreview, setIsPreview] = useState(false);
	const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
	const [loading, setLoading] = useState(false);

	const [referenceData, setReferenceData] = useState({
		champions: {},
		relics: {},
		powers: {},
	});

	// Fetch Reference Data
	useEffect(() => {
		const fetchRefs = async () => {
			const baseUrl = import.meta.env.VITE_API_URL;
			const [c, r, p] = await Promise.all([
				axios.get(`${baseUrl}/api/champions?limit=-1`),
				axios.get(`${baseUrl}/api/relics?limit=-1`),
				axios.get(`${baseUrl}/api/powers?limit=-1`),
			]);
			const buildMap = (arr, key) =>
				arr.reduce((acc, item) => ({ ...acc, [item[key]]: item }), {});
			setReferenceData({
				champions: buildMap(c.data.items || [], "championID"),
				relics: buildMap(r.data.items || [], "relicCode"),
				powers: buildMap(p.data.items || [], "powerCode"),
			});
		};
		fetchRefs();
	}, []);
	// Load Guide Data
	// Load Guide Data
	useEffect(() => {
		if (isEditMode) {
			const fetchGuide = async () => {
				try {
					const res = await axios.get(
						`${import.meta.env.VITE_API_URL}/api/guides/${slug}`,
					);
					if (res.data.success) {
						const g = res.data.data?.guide || res.data.data;

						if (g) {
							setFormData({
								title: g.title || "",
								title_en: g.translations?.en?.title || "",
								slug: g.slug || "",
								thumbnail: g.thumbnail || "",
								author: g.author || "",
								description: g.description || "",
								description_en: g.translations?.en?.description || "",
								// FIX TẠI ĐÂY: Quét qua mảng content, nếu block nào mất ID thì tự sinh ID mới
								content: (Array.isArray(g.content) ? g.content : []).map(
									(block, i) => ({
										...block,
										id: block.id
											? String(block.id)
											: `block-recovered-${Date.now()}-${i}`,
									}),
								),
							});
						}
					}
				} catch (err) {
					console.error("Error fetching guide:", err);
				}
			};
			fetchGuide();
		}
	}, [slug, isEditMode]);

	const handleSave = async () => {
		setLoading(true);
		try {
			const payload = {
				...formData,
				translations: {
					en: {
						title: formData.title_en,
						description: formData.description_en,
					},
				},
			};

			const config = { headers: { Authorization: `Bearer ${token}` } };
			const baseUrl = `${import.meta.env.VITE_API_URL}/api/guides`;

			if (isEditMode) {
				await axios.put(`${baseUrl}/${slug}`, payload, config);
			} else {
				await axios.post(baseUrl, payload, config);
			}
			setIsDirty(false);
			navigate("/admin/guides");
		} catch (err) {
			alert(tUI("common.errorLoadData"));
		} finally {
			setLoading(false);
		}
	};

	const updateBlocks = newBlocks => {
		setFormData(prev => ({ ...prev, content: newBlocks }));
		setIsDirty(true);
	};

	return (
		<div className='min-h-screen bg-page-bg'>
			{/* Sticky Header */}
			<div className='sticky top-0 z-50 bg-surface-bg border-b border-border px-6 py-4 flex items-center justify-between shadow-sm'>
				<div className='flex items-center gap-4'>
					<Button
						variant='ghost'
						onClick={() =>
							isDirty ? setIsCancelModalOpen(true) : navigate("/admin/guides")
						}
					>
						<ArrowLeft size={20} />
					</Button>
					<h2 className='text-xl font-bold uppercase tracking-tight'>
						{isEditMode
							? tUI("randomWheel.tabCustomize")
							: tUI("common.addNew")}{" "}
						{tUI("intro.guides")}
					</h2>
					{isDirty && (
						<span className='text-amber-500 flex items-center gap-1 text-sm font-medium'>
							<AlertTriangle size={14} /> {tUI("common.saving")}
						</span>
					)}
				</div>

				<div className='flex gap-3'>
					<Button
						variant='outline'
						onClick={() => setIsPreview(!isPreview)}
						iconLeft={isPreview ? <Edit3 size={18} /> : <Eye size={18} />}
					>
						{isPreview ? tUI("randomWheel.tabCustomize") : "Preview"}
					</Button>
					<Button
						variant='primary'
						onClick={handleSave}
						disabled={loading}
						iconLeft={<Save size={18} />}
					>
						{loading ? tUI("common.saving") : tUI("common.save")}
					</Button>
				</div>
			</div>

			<div className='max-w-[1600px] mx-auto p-6'>
				<div className='grid grid-cols-1 xl:grid-cols-2 gap-8'>
					{/* EDITOR SIDE */}
					{!isPreview && (
						<div className='space-y-6'>
							<div className='bg-surface-bg p-6 rounded-xl border border-border space-y-4 shadow-sm'>
								<div className='grid grid-cols-2 gap-4'>
									<InputField
										label='Tiêu đề (VN)'
										value={formData.title}
										onChange={e => {
											setFormData({ ...formData, title: e.target.value });
											setIsDirty(true);
										}}
									/>
									<InputField
										label='Title (EN)'
										value={formData.title_en}
										onChange={e => {
											setFormData({ ...formData, title_en: e.target.value });
											setIsDirty(true);
										}}
									/>
								</div>
								<InputField
									label='Slug'
									value={formData.slug}
									onChange={e =>
										setFormData({ ...formData, slug: e.target.value })
									}
									disabled={isEditMode}
								/>
								<InputField
									label='Thumbnail URL'
									value={formData.thumbnail}
									onChange={e => {
										setFormData({ ...formData, thumbnail: e.target.value });
										setIsDirty(true);
									}}
								/>
								<div className='grid grid-cols-2 gap-4'>
									<InputField
										label='Author'
										value={formData.author}
										onChange={e =>
											setFormData({ ...formData, author: e.target.value })
										}
									/>
									<InputField
										label='Description (Short)'
										value={formData.description}
										onChange={e =>
											setFormData({ ...formData, description: e.target.value })
										}
									/>
								</div>
							</div>

							<div className='bg-surface-bg rounded-xl border border-border shadow-sm'>
								<div className='p-4 border-b border-border bg-surface-hover/30 font-bold uppercase text-sm tracking-widest'>
									Nội dung bài viết (Blocks)
								</div>
								<div className='p-4'>
									<BlockEditor
										blocks={formData.content}
										setBlocks={updateBlocks}
										referenceData={referenceData}
									/>
								</div>
							</div>
						</div>
					)}

					{/* PREVIEW SIDE */}
					<div
						className={`${isPreview ? "col-span-2" : "hidden xl:block"} bg-white rounded-2xl border border-border shadow-2xl p-8 min-h-[800px] text-gray-900`}
					>
						<div className='max-w-4xl mx-auto'>
							<header className='mb-10 text-center'>
								<h1 className='text-4xl font-black mb-4 leading-tight'>
									{formData.title || "Tiêu đề bài viết"}
								</h1>
								<p className='text-gray-500 italic'>{formData.description}</p>
							</header>
							{formData.thumbnail && (
								<img
									src={formData.thumbnail}
									className='w-full h-80 object-cover rounded-2xl mb-10 shadow-lg'
									alt='Thumb'
								/>
							)}
							<div className='prose prose-lg max-w-none'>
								{formData.content.map((block, i) => (
									<PreviewBlock
										key={i}
										block={block}
										referenceData={referenceData}
									/>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>

			<Modal
				isOpen={isCancelModalOpen}
				onClose={() => setIsCancelModalOpen(false)}
				title={tUI("common.deleteDataTitle")}
			>
				<div className='p-2 text-text-secondary'>
					<p className='mb-6'>{tUI("tierList.confirmResetToSample")}</p>
					<div className='flex justify-end gap-3'>
						<Button variant='ghost' onClick={() => setIsCancelModalOpen(false)}>
							{tUI("common.cancel")}
						</Button>
						<Button variant='danger' onClick={() => navigate("/admin/guides")}>
							{tUI("common.back")}
						</Button>
					</div>
				</div>
			</Modal>
		</div>
	);
};

export default GuideForm;
