import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import { useTranslation } from "../../../hooks/useTranslation";
import BlockEditor from "./blockEditor";
import PreviewBlock from "./previewBlock";
import Button from "../../common/button";
import InputField from "../../common/inputField";
import { BookOpen, List } from "lucide-react";
import { removeAccents } from "../../../utils/vietnameseUtils";

// IMPORT CÁC COMPONENT CHUNG
import EditorHeaderToolbar from "../common/editorHeaderToolbar";
import ImagePreviewBox from "../common/imagePreviewBox";


const GuideForm = ({ slug }) => {
	const { tUI } = useTranslation();
	const navigate = useNavigate();
	const { token } = useAuth();
	const isEditMode = slug && slug !== "new";

	const [formData, setFormData] = useState({
		title: "",
		slug: "",
		thumbnail: "",
		author: "",
		description: "",
		content: [],
	});

	const [initialData, setInitialData] = useState({});
	const [isDirty, setIsDirty] = useState(false);
	const [loading, setLoading] = useState(false);

	const [referenceData, setReferenceData] = useState({
		champions: {},
		relics: {},
		powers: {},
	});

	// Lấy danh sách section để hiển thị mục lục
	const sections = useMemo(
		() => formData.content.filter(b => b.type === "section"),
		[formData.content],
	);

	// Dirty check
	useEffect(() => {
		const isChanged = JSON.stringify(formData) !== JSON.stringify(initialData);
		setIsDirty(isChanged);
	}, [formData, initialData]);

	// Fetch Reference Data (giữ lại để PreviewBlock backward-compat)
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
							const loadedData = {
								title: g.title || "",
								slug: g.slug || "",
								thumbnail: g.thumbnail || "",
								author: g.author || "",
								description: g.description || "",
								content: (Array.isArray(g.content) ? g.content : []).map(
									(block, i) => ({
										...block,
										id: block.id
											? String(block.id)
											: `block-recovered-${Date.now()}-${i}`,
									}),
								),
							};
							setFormData(loadedData);
							setInitialData(JSON.parse(JSON.stringify(loadedData)));
							setIsDirty(false);
						}
					}
				} catch (err) {
					console.error("Error fetching guide:", err);
				}
			};
			fetchGuide();
		} else {
			setInitialData(JSON.parse(JSON.stringify(formData)));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [slug, isEditMode]);

	const handleSave = async () => {
		setLoading(true);
		try {
			const payload = { ...formData };
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
			alert(tUI("common.error"));
		} finally {
			setLoading(false);
		}
	};

	const updateBlocks = newBlocks => {
		setFormData(prev => ({ ...prev, content: newBlocks }));
	};

	const handleInputChange = e => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
	};

	return (
		<form
			className='h-full pb-20'
			onSubmit={e => {
				e.preventDefault();
				handleSave();
			}}
		>
			<EditorHeaderToolbar
				title={
					isEditMode
						? `${tUI("randomWheel.tabCustomize")} ${formData.title}`
						: tUI("common.addNew")
				}
				isNew={!isEditMode}
				isDirty={isDirty}
				isSaving={loading}
				onCancel={() => navigate("/admin/guides")}
				itemName={formData.title}
				disableSave={!formData.title}
			/>

			{/* LAYOUT: Editor (trái) + Preview (phải) */}
			<div className='px-3 pt-3 grid grid-cols-1 xl:grid-cols-[1fr,400px] 2xl:grid-cols-[1fr,460px] gap-3 items-start'>

				{/* ============ CỘT TRÁI: EDITOR ============ */}
				<div className='space-y-3 min-w-0'>
					{/* THÔNG TIN CƠ BẢN */}
					<div className='bg-surface-bg p-3 rounded-xl border border-border shadow-sm'>
						<div className='flex flex-col md:flex-row gap-3'>
							<div className='flex-1 space-y-2.5'>
								<div className='grid grid-cols-2 gap-2.5'>
									<InputField
										label='Tiêu đề bài viết'
										name='title'
										value={formData.title}
										onChange={handleInputChange}
										required
									/>
									<InputField
										label='Slug (URL)'
										name='slug'
										value={formData.slug}
										onChange={handleInputChange}
										disabled={isEditMode}
									/>
								</div>
								<div className='grid grid-cols-2 gap-2.5'>
									<InputField
										label='Tác giả'
										name='author'
										value={formData.author}
										onChange={handleInputChange}
									/>
									<InputField
										label='URL Hình thu nhỏ'
										name='thumbnail'
										value={formData.thumbnail}
										onChange={handleInputChange}
									/>
								</div>
								<InputField
									label='Mô tả ngắn'
									name='description'
									value={formData.description}
									onChange={handleInputChange}
								/>
							</div>
							{/* THUMBNAIL */}
							<div className='w-full md:w-40 shrink-0'>
								<ImagePreviewBox
									imageUrl={formData.thumbnail}
									label='Ảnh Thu Nhỏ'
									wrapperClassName='flex flex-col items-center justify-center p-2 bg-surface-hover/30 rounded-xl border border-dashed border-border h-full min-h-[120px]'
									imageClassName='w-full h-auto max-h-[130px] object-cover rounded-lg shadow-md border-2 border-white dark:border-gray-800'
								/>
							</div>
						</div>
					</div>

					{/* BLOCK EDITOR */}
					<div className='bg-surface-bg rounded-xl border border-border shadow-sm'>
						<div className='px-4 py-2 border-b border-border bg-surface-hover/30 font-bold uppercase text-[10px] tracking-widest text-text-primary'>
							Nội dung bài viết
						</div>
						<div className='p-2.5'>
							<BlockEditor
								blocks={formData.content}
								setBlocks={updateBlocks}
								referenceData={referenceData}
							/>
						</div>
					</div>
				</div>

				{/* ============ CỘT PHẢI: PREVIEW TRỰC TIẾP ============ */}
				<div className='xl:sticky xl:top-4 space-y-3 min-w-0'>

					{/* PREVIEW BÀI VIẾT */}
					<div className='bg-page-bg rounded-xl border border-border shadow-sm overflow-hidden'>
						{/* Header preview */}
						<div className='px-3 py-2 border-b border-border bg-surface-hover/40 flex items-center gap-2'>
							<BookOpen size={13} className='text-emerald-500' />
							<span className='text-[10px] font-black uppercase tracking-widest text-text-secondary'>
								Xem trước
							</span>
							<span className='ml-auto text-[9px] text-text-tertiary italic'>
								Cập nhật theo thời gian thực
							</span>
						</div>

						{/* Nội dung preview */}
						<div className='p-4 max-h-[calc(100dvh-240px)] overflow-y-auto custom-scrollbar'>
							{/* Tiêu đề + mô tả */}
							<div className='mb-5 pb-4 border-b border-border'>
								<h1 className='text-xl font-black leading-tight text-text-primary mb-1.5'>
									{formData.title || (
										<span className='text-text-tertiary italic font-normal text-base'>
											Tiêu đề bài viết...
										</span>
									)}
								</h1>
								{formData.description && (
									<p className='text-xs text-text-secondary italic'>
										{formData.description}
									</p>
								)}
								{formData.author && (
									<p className='text-[10px] text-text-tertiary mt-1'>
										✍️ {formData.author}
									</p>
								)}
							</div>

							{/* Ảnh thumbnail */}
							{formData.thumbnail && (
								<img
									src={formData.thumbnail}
									className='w-full h-36 object-cover rounded-xl mb-4 shadow border border-border'
									alt='Thumbnail'
								/>
							)}

							{/* Mục lục - nằm sau tiêu đề, trước nội dung */}
							{sections.length > 0 && (
								<div className='mb-5 p-3 bg-surface-hover/30 rounded-xl border border-border'>
									<div className='flex items-center gap-2 mb-2'>
										<List size={12} className='text-primary-500' />
										<span className='text-[10px] font-black uppercase tracking-widest text-text-secondary'>Mục lục</span>
									</div>
									<nav className='space-y-0.5'>
										{sections.map((sec, i) => (
											<a
												key={i}
												href={`#${removeAccents(sec.title || "")}`}
												className='flex items-center gap-2 px-2 py-1 rounded text-[11px] text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors group'
											>
												<span className='w-4 h-4 rounded text-[9px] font-black bg-primary-500/10 text-primary-500 flex items-center justify-center shrink-0'>{i + 1}</span>
												<span className='truncate'>{sec.title || "(Chưa có tiêu đề)"}</span>
											</a>
										))}
									</nav>
								</div>
							)}

							{/* Blocks */}
							{formData.content.length === 0 ? (
								<div className='text-center py-8 text-text-tertiary text-sm italic'>
									Chưa có nội dung. Thêm block ở cột bên trái.
								</div>
							) : (
								<div className='text-sm'>
									{formData.content.map((block, i) => (
										<PreviewBlock
											key={i}
											block={block}
											referenceData={referenceData}
										/>
									))}
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</form>
	);
};

export default GuideForm;
