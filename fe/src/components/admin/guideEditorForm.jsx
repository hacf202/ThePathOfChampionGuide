// src/pages/admin/GuideEditorForm.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import BlockEditor from "./guide/blockEditor";
import PreviewBlock from "./guide/previewBlock";
import Button from "../common/button";
import Modal from "../common/modal"; // Import Modal
import { ArrowLeft, Save, AlertTriangle } from "lucide-react";

const GuideForm = ({ slug }) => {
	const navigate = useNavigate();
	const { token } = useAuth();
	const isEditMode = slug && slug !== "new";

	// State dữ liệu
	const [formData, setFormData] = useState({
		title: "",
		slug: "",
		thumbnail: "",
		author: "",
		tags: "",
		content: [],
	});

	// State kiểm soát thay đổi
	const [initialData, setInitialData] = useState({});
	const [isDirty, setIsDirty] = useState(false);
	const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

	const [referenceData, setReferenceData] = useState({
		champions: {},
		relics: {},
		powers: {},
	});

	const [loading, setLoading] = useState(false);
	const [dataLoaded, setDataLoaded] = useState(false);

	// 1. Load Data
	useEffect(() => {
		const loadData = async () => {
			const baseUrl = import.meta.env.VITE_API_URL;

			// Load Reference Data
			const [champsRes, relicsRes, powersRes] = await Promise.all([
				axios.get(`${baseUrl}/api/champions`),
				axios.get(`${baseUrl}/api/relics`),
				axios.get(`${baseUrl}/api/powers`),
			]);

			const arrayToMap = (arr, key) =>
				arr.reduce((acc, item) => ({ ...acc, [item[key]]: item }), {});

			setReferenceData({
				champions: arrayToMap(champsRes.data, "championID"),
				relics: arrayToMap(relicsRes.data, "relicCode"),
				powers: arrayToMap(powersRes.data, "powerCode"),
			});

			// Load Guide Data
			let loadedData = {
				title: "",
				slug: "",
				thumbnail: "",
				author: "",
				tags: "",
				content: [],
			};

			if (isEditMode) {
				const res = await axios.get(`${baseUrl}/api/guides/${slug}`);
				if (res.data.success) {
					const d = res.data.data;
					const ensureIds = items =>
						items.map(item => ({
							...item,
							id:
								item.id ||
								`block-${Date.now()}-${Math.random()
									.toString(36)
									.substr(2, 9)}`,
							content: item.content ? ensureIds(item.content) : undefined,
						}));

					loadedData = {
						title: d.title || "",
						slug: d.slug || "",
						thumbnail: d.thumbnail || "",
						author: d.author || "",
						tags: d.tags?.join(", ") || "",
						content: ensureIds(d.content || []),
					};
				}
			}

			// Set Data & Initial Data (Deep Clone)
			setFormData(loadedData);
			setInitialData(JSON.parse(JSON.stringify(loadedData)));
			setIsDirty(false);
			setDataLoaded(true);
		};

		loadData();
	}, [slug, isEditMode]);

	// 2. Check Dirty
	useEffect(() => {
		if (dataLoaded) {
			const isChanged =
				JSON.stringify(formData) !== JSON.stringify(initialData);
			setIsDirty(isChanged);
		}
	}, [formData, initialData, dataLoaded]);

	// 3. Before Unload (Browser Tab Close)
	useEffect(() => {
		const handleBeforeUnload = e => {
			if (isDirty) {
				e.preventDefault();
				e.returnValue = "";
			}
		};
		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => window.removeEventListener("beforeunload", handleBeforeUnload);
	}, [isDirty]);

	// --- Handlers ---
	const handleSubmit = async () => {
		setLoading(true);
		try {
			const payload = {
				title: formData.title,
				slug: formData.slug,
				thumbnail: formData.thumbnail,
				author: formData.author,
				tags: formData.tags
					.split(",")
					.map(t => t.trim())
					.filter(Boolean),
				content: formData.content,
				views: isEditMode ? undefined : 0,
				publishedDate: isEditMode
					? undefined
					: new Date().toISOString().split("T")[0],
				updateDate: new Date().toISOString().split("T")[0],
			};

			const baseUrl = import.meta.env.VITE_API_URL;
			const config = { headers: { Authorization: `Bearer ${token}` } };

			if (isEditMode) {
				await axios.put(`${baseUrl}/api/guides/${slug}`, payload, config);
				// Update Initial Data sau khi save thành công
				setInitialData(JSON.parse(JSON.stringify(formData)));
				setIsDirty(false);
				alert("Cập nhật thành công!");
			} else {
				await axios.post(`${baseUrl}/api/guides`, payload, config);
				alert("Tạo mới thành công!");
				navigate("/admin/guides");
			}
		} catch (err) {
			alert("Lỗi khi lưu: " + (err.response?.data?.message || err.message));
		} finally {
			setLoading(false);
		}
	};

	const handleAttemptBack = () => {
		if (isDirty) {
			setIsCancelModalOpen(true);
		} else {
			navigate("/admin/guides");
		}
	};

	const confirmExit = () => {
		setIsCancelModalOpen(false);
		navigate("/admin/guides");
	};

	return (
		<div className='p-4 h-screen flex flex-col font-secondary'>
			{/* HEADER */}
			<div className='flex justify-between items-center mb-4 pb-4 border-b'>
				<div className='flex items-center gap-4'>
					<Button
						variant='secondary'
						onClick={handleAttemptBack}
						iconLeft={<ArrowLeft size={16} />}
					>
						Quay lại danh sách
					</Button>
					<div>
						<h1 className='text-xl font-bold font-primary'>
							{isEditMode ? `Chỉnh sửa: ${slug}` : "Tạo bài viết mới"}
						</h1>
						{isDirty && (
							<div className='flex items-center gap-1 text-yellow-600 text-xs mt-1 font-medium'>
								<AlertTriangle size={12} />
								<span>Có thay đổi chưa lưu</span>
							</div>
						)}
					</div>
				</div>
				<Button
					onClick={handleSubmit}
					disabled={loading}
					className={
						loading
							? "bg-gray-400"
							: "bg-green-600 hover:bg-green-700 text-white border-transparent"
					}
					iconLeft={!loading && <Save size={18} />}
				>
					{loading ? "Đang lưu..." : "Lưu bài viết"}
				</Button>
			</div>

			{/* CONTENT */}
			<div className='flex-1 flex gap-4 overflow-hidden'>
				{/* EDITOR COLUMN */}
				<div className='w-1/2 flex flex-col gap-4 overflow-y-auto pr-2 pb-10'>
					<div className='grid grid-cols-2 gap-4'>
						<div>
							<label className='block text-sm font-medium text-gray-700'>
								Tiêu đề
							</label>
							<input
								value={formData.title}
								onChange={e =>
									setFormData({ ...formData, title: e.target.value })
								}
								className='mt-1 w-full rounded-md border-gray-300 shadow-sm p-2 border'
							/>
						</div>
						<div>
							<label className='block text-sm font-medium text-gray-700'>
								Slug (URL)
							</label>
							<input
								value={formData.slug}
								onChange={e =>
									setFormData({ ...formData, slug: e.target.value })
								}
								disabled={isEditMode}
								className='mt-1 w-full rounded-md border-gray-300 shadow-sm p-2 border bg-gray-50'
							/>
						</div>
					</div>

					<div>
						<label className='block text-sm font-medium text-gray-700'>
							Thumbnail URL
						</label>
						<input
							value={formData.thumbnail}
							onChange={e =>
								setFormData({ ...formData, thumbnail: e.target.value })
							}
							className='mt-1 w-full rounded-md border-gray-300 shadow-sm p-2 border'
						/>
					</div>

					<div>
						<label className='block text-sm font-medium text-gray-700'>
							Tác giả
						</label>
						<input
							value={formData.author}
							onChange={e =>
								setFormData({ ...formData, author: e.target.value })
							}
							className='mt-1 w-full rounded-md border-gray-300 shadow-sm p-2 border'
						/>
					</div>

					<div>
						<label className='block text-sm font-medium text-gray-700'>
							Tags (cách nhau dấu phẩy)
						</label>
						<input
							value={formData.tags}
							onChange={e => setFormData({ ...formData, tags: e.target.value })}
							className='mt-1 w-full rounded-md border-gray-300 shadow-sm p-2 border'
						/>
					</div>

					<div className='flex-1'>
						<label className='block text-sm font-medium text-gray-700 mb-2'>
							Nội dung bài viết (Kéo thả blocks)
						</label>
						<BlockEditor
							blocks={formData.content}
							setBlocks={newBlocks =>
								setFormData({ ...formData, content: newBlocks })
							}
							referenceData={referenceData}
						/>
					</div>
				</div>

				{/* PREVIEW COLUMN */}
				<div className='w-1/2 bg-white rounded-lg shadow-lg border flex flex-col overflow-hidden'>
					<div className='bg-gray-50 px-4 py-2 border-b font-bold text-gray-500 text-sm flex justify-between items-center'>
						<span>Live Preview</span>
						<span className='text-xs text-gray-400'>
							(Đồng bộ ảnh & dữ liệu)
						</span>
					</div>
					<div className='p-8 overflow-y-auto flex-1'>
						<h1 className='text-3xl font-extrabold mb-4 font-primary'>
							{formData.title || "Tiêu đề..."}
						</h1>
						{formData.thumbnail && (
							<img
								src={formData.thumbnail}
								className='w-full max-h-[300px] object-cover rounded-lg mb-8 shadow-sm'
								alt='Thumbnail'
								onError={e => (e.target.style.display = "none")}
							/>
						)}
						{formData.content.length === 0 ? (
							<div className='text-gray-400 text-center mt-10 border-2 border-dashed border-gray-200 rounded-lg p-10'>
								Chưa có nội dung. Hãy thêm các block bên trái.
							</div>
						) : (
							formData.content.map((block, i) => (
								<PreviewBlock
									key={i}
									block={block}
									referenceData={referenceData}
								/>
							))
						)}
					</div>
				</div>
			</div>

			{/* MODAL CONFIRM EXIT */}
			<Modal
				isOpen={isCancelModalOpen}
				onClose={() => setIsCancelModalOpen(false)}
				title='Xác nhận thoát'
			>
				<div className='text-text-secondary'>
					<p className='mb-6 font-medium'>
						Bạn có thay đổi chưa lưu. Nếu rời đi bây giờ, mọi thay đổi sẽ bị
						mất.
					</p>
					<div className='flex justify-end gap-3'>
						<Button onClick={() => setIsCancelModalOpen(false)} variant='ghost'>
							Ở lại chỉnh sửa
						</Button>
						<Button onClick={confirmExit} variant='danger'>
							Rời đi (Mất dữ liệu)
						</Button>
					</div>
				</div>
			</Modal>
		</div>
	);
};

export default GuideForm;
