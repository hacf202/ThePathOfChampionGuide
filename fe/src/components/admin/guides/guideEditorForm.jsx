import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import { useTranslation } from "../../../hooks/useTranslation";
import BlockEditor from "./blockEditor";
import PreviewBlock from "./previewBlock";
import Button from "../../common/button";
import InputField from "../../common/inputField";
import { Eye, Edit3 } from "lucide-react";

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
		title_en: "",
		slug: "",
		thumbnail: "",
		author: "",
		description: "",
		description_en: "",
		content: [],
	});

	const [initialData, setInitialData] = useState({});
	const [isDirty, setIsDirty] = useState(false);
	const [isPreview, setIsPreview] = useState(false);
	const [loading, setLoading] = useState(false);

	const [referenceData, setReferenceData] = useState({
		champions: {},
		relics: {},
		powers: {},
	});

	// Dirty check
	useEffect(() => {
		const isChanged = JSON.stringify(formData) !== JSON.stringify(initialData);
		setIsDirty(isChanged);
	}, [formData, initialData]);

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
								title_en: g.translations?.en?.title || "",
								slug: g.slug || "",
								thumbnail: g.thumbnail || "",
								author: g.author || "",
								description: g.description || "",
								description_en: g.translations?.en?.description || "",
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
	};

	const handleInputChange = e => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
	};

	return (
		<div className='min-h-screen pb-24'>
			{/* ÁP DỤNG EDITOR TOOLBAR CHUNG */}
			<EditorHeaderToolbar
				title={
					isEditMode
						? `${tUI("randomWheel.tabCustomize") || "Sửa:"} ${formData.title}`
						: tUI("common.addNew") || "Thêm mới Bài viết"
				}
				isNew={!isEditMode}
				isDirty={isDirty}
				isSaving={loading}
				onCancel={() => navigate("/admin/guides")}
				itemName={formData.title}
				disableSave={!formData.title}
				extraButtons={
					<Button
						variant='outline'
						onClick={() => setIsPreview(!isPreview)}
						iconLeft={isPreview ? <Edit3 size={18} /> : <Eye size={18} />}
						className='mr-2'
					>
						{isPreview
							? tUI("randomWheel.tabCustomize") || "Chỉnh sửa"
							: "Xem trước"}
					</Button>
				}
			/>

			{/* NỘI DUNG EDITOR */}
			<div className='max-w-[1600px] mx-auto px-6'>
				<div className='grid grid-cols-1 xl:grid-cols-2 gap-8'>
					{/* EDITOR SIDE */}
					{!isPreview && (
						<div className='space-y-6'>
							{/* THÔNG TIN CƠ BẢN */}
							<div className='bg-surface-bg p-6 rounded-xl border border-border shadow-sm'>
								<div className='flex flex-col md:flex-row gap-6'>
									<div className='flex-1 space-y-4'>
										<div className='grid grid-cols-2 gap-4'>
											<InputField
												label='Tiêu đề (VN)'
												name='title'
												value={formData.title}
												onChange={handleInputChange}
												required
											/>
											<InputField
												label='Title (EN)'
												name='title_en'
												value={formData.title_en}
												onChange={handleInputChange}
											/>
										</div>
										<InputField
											label='Slug'
											name='slug'
											value={formData.slug}
											onChange={handleInputChange}
											disabled={isEditMode}
										/>
										<div className='grid grid-cols-2 gap-4'>
											<InputField
												label='Tác giả (Author)'
												name='author'
												value={formData.author}
												onChange={handleInputChange}
											/>
											<InputField
												label='URL Hình thu nhỏ (Thumbnail)'
												name='thumbnail'
												value={formData.thumbnail}
												onChange={handleInputChange}
											/>
										</div>
										<div className='grid grid-cols-2 gap-4'>
											<InputField
												label='Mô tả ngắn (VN)'
												name='description'
												value={formData.description}
												onChange={handleInputChange}
											/>
											<InputField
												label='Description (EN)'
												name='description_en'
												value={formData.description_en}
												onChange={handleInputChange}
											/>
										</div>
									</div>

									{/* SỬ DỤNG KHUNG ẢNH CHUNG CHO THUMBNAIL */}
									<div className='w-full md:w-1/3 shrink-0'>
										<ImagePreviewBox
											imageUrl={formData.thumbnail}
											label='Ảnh Thu Nhỏ'
											wrapperClassName='flex flex-col items-center justify-center p-4 bg-surface-hover/30 rounded-xl border border-dashed border-border h-full min-h-[150px]'
											imageClassName='w-full h-auto max-h-[180px] object-cover rounded-xl shadow-md border-2 border-white dark:border-gray-800'
										/>
									</div>
								</div>
							</div>

							{/* BLOCK EDITOR (KÉO THẢ NỘI DUNG) */}
							<div className='bg-surface-bg rounded-xl border border-border shadow-sm'>
								<div className='p-4 border-b border-border bg-surface-hover/30 font-bold uppercase text-sm tracking-widest text-text-primary'>
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
						className={`${isPreview ? "col-span-2" : "hidden xl:block"} bg-page-bg rounded-2xl border border-border shadow-xl p-8 min-h-[800px] text-text-primary`}
					>
						<div className='max-w-4xl mx-auto'>
							<header className='mb-10 text-center'>
								<h1 className='text-4xl font-black mb-4 leading-tight'>
									{formData.title || "Tiêu đề bài viết..."}
								</h1>
								<p className='text-text-secondary italic'>
									{formData.description || "Mô tả ngắn..."}
								</p>
							</header>
							{formData.thumbnail && (
								<img
									src={formData.thumbnail}
									className='w-full h-80 object-cover rounded-2xl mb-10 shadow-lg border border-border'
									alt='Thumb'
								/>
							)}
							<div className='prose prose-lg dark:prose-invert max-w-none'>
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

			{/* Đã xóa Modal xác nhận Hủy vì EditorHeaderToolbar tự động đảm nhiệm */}
		</div>
	);
};

export default GuideForm;
