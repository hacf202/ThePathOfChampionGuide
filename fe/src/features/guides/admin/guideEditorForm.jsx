import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "@/hooks/useTranslation";
import RichTextEditor from "@/components/admin/RichTextEditor";
import Button from "@/components/common/button";
import InputField from "@/components/common/inputField";
import { List } from "lucide-react";
import Swal from "sweetalert2";

// IMPORT CÁC COMPONENT CHUNG
import EditorHeaderToolbar from "@/components/admin/common/editorHeaderToolbar";
import ImagePreviewBox from "@/components/admin/common/imagePreviewBox";


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
		content: "",
	});

	const [initialData, setInitialData] = useState({});
	const [isDirty, setIsDirty] = useState(false);
	const [loading, setLoading] = useState(false);


	// Dirty check
	useEffect(() => {
		const isChanged = JSON.stringify(formData) !== JSON.stringify(initialData);
		setIsDirty(isChanged);
	}, [formData, initialData]);



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
			
			Swal.fire({
				icon: "success",
				title: tUI("admin.common.saveSuccess"),
				text: "Bài viết đã được cập nhật thành công.",
				timer: 2000,
				showConfirmButton: false,
				toast: true,
				position: "top-end",
			});
		} catch (error) {
			console.error("Error saving guide:", error);
			Swal.fire({
				icon: "error",
				title: tUI("admin.common.errorOccurred"),
				text: tUI("common.error") || "Error saving guide.",
				confirmButtonColor: "#3b82f6",
			});
		} finally {
			setLoading(false);
		}
	};



	const handleInputChange = e => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
	};

	const handleEditorChange = (html) => {
		setFormData(prev => ({ ...prev, content: html }));
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

			{/* LAYOUT: Editor duy nhất */}
			<div className='px-3 pt-3 max-w-6xl mx-auto space-y-3 mb-8'>

				{/* ============ EDITOR ============ */}
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

					{/* TIER LIST BLOCK (Tách riêng theo plan) */}
					<div className='bg-surface-bg rounded-xl border border-border shadow-sm'>
						<div className='px-4 py-2 border-b border-border bg-surface-hover/30 font-bold uppercase text-[10px] tracking-widest text-text-primary flex justify-between'>
							<span>Tier List (Tuỳ chọn)</span>
						</div>
						<div className='p-2.5 text-xs text-text-tertiary italic text-center'>
							Phần Tier List đang được tách ra thành module riêng (Đang phát triển).
						</div>
					</div>

					{/* RICH TEXT EDITOR */}
					<div className='bg-surface-bg rounded-xl border border-border shadow-sm'>
						<div className='px-4 py-2 border-b border-border bg-surface-hover/30 font-bold uppercase text-[10px] tracking-widest text-text-primary'>
							Nội dung bài viết
						</div>
						<div className='p-2.5'>
							{Array.isArray(formData.content) ? (
								<div className="text-center p-4 text-text-secondary bg-surface-hover rounded-lg border border-border italic text-sm">
									Bài viết này sử dụng trình soạn thảo Block cũ. Việc chỉnh sửa sẽ được khóa. Xin hãy tạo mới hoặc cập nhật DB để dùng giao diện mới.
								</div>
							) : (
								<RichTextEditor
									value={formData.content || ""}
									onChange={handleEditorChange}
								/>
							)}
						</div>
					</div>
				</div>
			</div>
		</form>
	);
};

export default GuideForm;
