import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

// =================================================================================
// PHẦN 1: COMPONENT HIỂN THỊ DANH SÁCH (DASHBOARD)
// =================================================================================
const GuideList = () => {
	const [guides, setGuides] = useState([]);
	const [loading, setLoading] = useState(true);
	const { token } = useAuth();
	const navigate = useNavigate();

	// Fetch danh sách guide
	const fetchGuides = async () => {
		try {
			const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/guides`);
			if (res.data.success) {
				// Sắp xếp theo ngày mới nhất
				const sorted = res.data.data.sort(
					(a, b) =>
						new Date(b.updateDate || b.publishedDate) -
						new Date(a.updateDate || a.publishedDate)
				);
				setGuides(sorted);
			}
		} catch (err) {
			console.error("Lỗi tải danh sách:", err);
			alert("Không thể tải danh sách bài viết.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchGuides();
	}, []);

	// Xử lý xóa
	const handleDelete = async (slug, title) => {
		if (!window.confirm(`Bạn có chắc muốn xóa bài viết: "${title}"?`)) return;

		try {
			await axios.delete(`${import.meta.env.VITE_API_URL}/api/guides/${slug}`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			// Xóa thành công thì load lại list
			setGuides(prev => prev.filter(g => g.slug !== slug));
		} catch (err) {
			alert("Lỗi khi xóa bài viết.");
		}
	};

	if (loading)
		return <div className='p-8 text-center'>Đang tải danh sách...</div>;

	return (
		<div
			className='container mx-auto p-4 sm:p-6 min-h-screen'
			style={{ backgroundColor: "var(--color-page-bg)" }}
		>
			<div className='flex justify-between items-center mb-8'>
				<div>
					<h1
						className='text-3xl font-bold'
						style={{
							color: "var(--color-text-primary)",
							fontFamily: "var(--font-primary)",
						}}
					>
						Quản lý Bài viết (Guides)
					</h1>
					<p
						className='text-sm mt-1'
						style={{ color: "var(--color-text-secondary)" }}
					>
						Danh sách tất cả các bài hướng dẫn hiện có trên hệ thống.
					</p>
				</div>
				<button
					onClick={() => navigate("/admin/guideEditor/new")}
					className='px-6 py-2 rounded-lg font-bold text-white shadow-md transition transform hover:-translate-y-1'
					style={{ backgroundColor: "var(--color-primary-500)" }}
				>
					+ Viết bài mới
				</button>
			</div>

			<div className='bg-white rounded-xl shadow-sm border overflow-hidden'>
				<table className='min-w-full divide-y divide-gray-200'>
					<thead className='bg-gray-50'>
						<tr>
							<th className='px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider'>
								Tiêu đề / Slug
							</th>
							<th className='px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider'>
								Tác giả
							</th>
							<th className='px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider'>
								Ngày cập nhật
							</th>
							<th className='px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider'>
								Hành động
							</th>
						</tr>
					</thead>
					<tbody className='bg-white divide-y divide-gray-200'>
						{guides.length === 0 ? (
							<tr>
								<td
									colSpan='4'
									className='px-6 py-8 text-center text-gray-500 italic'
								>
									Chưa có bài viết nào. Hãy tạo bài đầu tiên!
								</td>
							</tr>
						) : (
							guides.map(guide => (
								<tr key={guide.slug} className='hover:bg-gray-50 transition'>
									<td className='px-6 py-4'>
										<div className='flex items-center'>
											{guide.thumbnail && (
												<img
													className='h-10 w-10 rounded object-cover mr-3'
													src={guide.thumbnail}
													alt=''
												/>
											)}
											<div>
												<div className='text-sm font-bold text-gray-900 line-clamp-1'>
													{guide.title}
												</div>
												<div className='text-xs text-gray-500 font-mono'>
													{guide.slug}
												</div>
											</div>
										</div>
									</td>
									<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
										{guide.author || "Admin"}
									</td>
									<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
										{guide.updateDate || guide.publishedDate}
									</td>
									<td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
										<button
											onClick={() =>
												navigate(`/admin/guideEditor/${guide.slug}`)
											}
											className='text-blue-600 hover:text-blue-900 mr-4 font-semibold'
										>
											Sửa
										</button>
										<button
											onClick={() => handleDelete(guide.slug, guide.title)}
											className='text-red-600 hover:text-red-900 font-semibold'
										>
											Xóa
										</button>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
};

// =================================================================================
// PHẦN 2: COMPONENT SOẠN THẢO (EDITOR) - (Logic cũ đã được tối ưu)
// =================================================================================

// --- Sub-component: Preview Block (Giữ nguyên logic hiển thị) ---
const PreviewBlock = ({ block }) => {
	if (!block) return null;
	const renderHtml = text => (
		<span dangerouslySetInnerHTML={{ __html: text }} />
	);

	switch (block.type) {
		case "section":
			return (
				<section
					className='mb-6 mt-6 border-l-4 pl-4'
					style={{ borderColor: "var(--color-primary-300)" }}
				>
					{block.title && (
						<h2
							className='text-2xl font-bold mb-4'
							style={{
								fontFamily: "var(--font-primary)",
								color: "var(--color-text-primary)",
							}}
						>
							{block.title}
						</h2>
					)}
					{block.content &&
						block.content.map((sub, i) => <PreviewBlock key={i} block={sub} />)}
				</section>
			);
		case "paragraph":
			return (
				<p
					className='mb-4 text-lg leading-relaxed'
					style={{
						color: "var(--color-text-primary)",
						fontFamily: "var(--font-secondary)",
					}}
				>
					{renderHtml(block.text)}
				</p>
			);
		case "image":
			return (
				<figure className='my-6 text-center'>
					<img
						src={block.src}
						alt={block.alt}
						className='max-w-full h-auto rounded-lg shadow-md mx-auto'
						style={{ maxHeight: "400px" }}
					/>
					{block.alt && (
						<figcaption
							className='text-sm italic mt-2'
							style={{ color: "var(--color-text-secondary)" }}
						>
							{block.alt}
						</figcaption>
					)}
				</figure>
			);
		case "list":
			return (
				<ul
					className='list-disc ml-6 mb-6 space-y-2 text-lg'
					style={{ color: "var(--color-text-primary)" }}
				>
					{block.items?.map((item, i) => (
						<li key={i}>{renderHtml(item)}</li>
					))}
				</ul>
			);
		case "table":
			return (
				<div
					className='my-6 overflow-x-auto border rounded-lg shadow-sm'
					style={{ borderColor: "var(--color-border)" }}
				>
					{block.title && (
						<div
							className='px-4 py-2 font-bold bg-gray-100 border-b'
							style={{ color: "var(--color-text-primary)" }}
						>
							{block.title}
						</div>
					)}
					<table
						className='min-w-full divide-y'
						style={{ borderColor: "var(--color-gray-300)" }}
					>
						<thead style={{ backgroundColor: "var(--color-gray-100)" }}>
							<tr>
								{block.headers?.map((h, i) => (
									<th
										key={i}
										className='px-4 py-2 text-left font-bold text-sm uppercase'
										style={{ color: "var(--color-text-secondary)" }}
									>
										{h}
									</th>
								))}
							</tr>
						</thead>
						<tbody
							className='divide-y'
							style={{ borderColor: "var(--color-gray-300)" }}
						>
							{block.rows?.map((row, rIdx) => {
								// Lấy ID tương ứng với hàng hiện tại (nếu có)
								const relicId = block.relicIds?.[rIdx];
								const championId = block.championIds?.[rIdx];

								return (
									<tr
										key={rIdx}
										className={rIdx % 2 !== 0 ? "bg-gray-50" : "bg-white"}
									>
										{row.map((cell, cIdx) => {
											// Render nội dung gốc
											let content = renderHtml(cell);

											// Logic: Chỉ xử lý cột đầu tiên (cIdx === 0)
											// Nếu có relicId -> Link đến trang Relic
											// Nếu có championId -> Link đến trang Champion
											if (cIdx === 0) {
												if (relicId) {
													content = (
														<Link
															to={`/relic/${relicId}`}
															className='hover:underline font-semibold'
															style={{ color: "var(--color-primary-500)" }}
															target='_blank' // Mở tab mới để không mất editor (tuỳ chọn)
														>
															{renderHtml(cell)}
														</Link>
													);
												} else if (championId) {
													content = (
														<Link
															to={`/champion/${championId}`}
															className='hover:underline font-semibold'
															style={{ color: "var(--color-primary-500)" }}
															target='_blank'
														>
															{renderHtml(cell)}
														</Link>
													);
												}
											}

											return (
												<td
													key={cIdx}
													className='px-4 py-3 text-sm whitespace-normal'
													style={{ color: "var(--color-text-primary)" }}
												>
													{content}
												</td>
											);
										})}
									</tr>
								);
							})}
						</tbody>
					</table>
					{block.caption && (
						<p
							className='p-2 text-center text-xs italic bg-gray-50 border-t'
							style={{ color: "var(--color-text-secondary)" }}
						>
							{block.caption}
						</p>
					)}
				</div>
			);
		case "sublist":
			return (
				<div className='mb-8 space-y-6'>
					{block.title && (
						<h3
							className='text-xl font-bold'
							style={{
								color: "var(--color-primary-700)",
								fontFamily: "var(--font-primary)",
							}}
						>
							{block.title}
						</h3>
					)}

					{block.sublist.map((item, idx) => (
						<div
							key={idx}
							className='flex flex-col gap-5 p-4 rounded-xl border shadow-sm transition hover:shadow-md'
							style={{
								backgroundColor: "var(--color-white)",
								borderColor: "var(--color-border)",
							}}
						>
							{item.image && (
								<div className='flex-shrink-0'>
									<img
										src={item.image}
										alt={item.imageAlt}
										className='w-full object-cover rounded-lg'
									/>
								</div>
							)}
							<div className='flex-1'>
								<h4
									className='text-lg font-bold mb-1'
									style={{
										color: "var(--color-text-primary)",
										fontFamily: "var(--font-primary)",
									}}
								>
									{item.title}
								</h4>
								{item.desc && (
									<p
										className='mb-2 text-sm'
										style={{ color: "var(--color-text-secondary)" }}
									>
										{renderHtml(item.desc)}
									</p>
								)}

								{item.list && (
									<ul
										className='list-circle pl-5 space-y-1 text-sm'
										style={{ color: "var(--color-text-primary)" }}
									>
										{item.list.map((li, i) => (
											<li key={i} className='list-disc'>
												{renderHtml(li)}
											</li>
										))}
									</ul>
								)}
							</div>
						</div>
					))}
				</div>
			);
		case "conclusion":
			return (
				<div className='mt-8 p-6 rounded-xl border text-center bg-blue-50 border-blue-200'>
					<h3 className='text-xl font-bold mb-2 text-blue-800'>
						{block.title}
					</h3>
					<p className='text-lg text-blue-900'>{renderHtml(block.text)}</p>
				</div>
			);
		default:
			return null;
	}
};

// --- Form Soạn Thảo Chính ---
const GuideForm = ({ slugMode }) => {
	const navigate = useNavigate();
	const { token } = useAuth();
	// Nếu slugMode là "new" => Chế độ tạo mới, ngược lại là chỉnh sửa
	const isCreating = slugMode === "new";

	const [formData, setFormData] = useState({
		title: "",
		slug: "",
		thumbnail: "",
		author: "Admin POC Guide",
		publishedDate: new Date().toISOString().split("T")[0],
	});
	const [contentJson, setContentJson] = useState("[]");
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState({ type: "", text: "" });

	// Snippets (Mẫu chèn nhanh)
	const snippets = {
		paragraph: `{"type": "paragraph", "text": "Nội dung..."}`,
		image: `{"type": "image", "src": "url_anh", "alt": "mo_ta"}`,
		section: `{"type": "section", "title": "Mục lớn", "content": []}`,
		list: `{"type": "list", "items": ["Mục 1", "Mục 2"]}`,
		sublist: `{"type": "sublist", "title": "Nhóm", "sublist": [{"title": "Con 1", "desc": "Mô tả", "list": []}]}`,
		table: `{"type": "table","title": "Bảng so sánh","headers": ["Tên", "Độ hiếm", "Hiệu ứng"],"relicIds": ["R001", null], "championIds": [null, "Aatrox"],"rows": [["Tên Cổ Vật (Link)", "Hiếm", "Mô tả..."],["Tên Tướng (Link)", "3 Sao", "Mô tả..."]]}`,
		conclusion: `{"type": "conclusion", "title": "Lời kết", "text": "Nội dung..."}`,
	};

	// Load data khi edit
	useEffect(() => {
		if (!isCreating) {
			setLoading(true);
			axios
				.get(`${import.meta.env.VITE_API_URL}/api/guides/${slugMode}`)
				.then(res => {
					if (res.data.success) {
						const { title, slug, thumbnail, author, content, publishedDate } =
							res.data.data;
						setFormData({
							title,
							slug,
							thumbnail,
							author: author || "Admin",
							publishedDate: publishedDate || "",
						});
						setContentJson(JSON.stringify(content || [], null, 2));
					}
				})
				.catch(err =>
					setMessage({ type: "error", text: "Lỗi không tìm thấy bài viết." })
				)
				.finally(() => setLoading(false));
		} else {
			// Reset form khi chuyển sang trang new
			setFormData({
				title: "",
				slug: "",
				thumbnail: "",
				author: "Admin POC Guide",
				publishedDate: new Date().toISOString().split("T")[0],
			});
			setContentJson("[]");
		}
	}, [slugMode, isCreating]);

	// Xử lý thay đổi input
	const handleChange = e => {
		const { name, value } = e.target;
		setFormData(prev => {
			const newData = { ...prev, [name]: value };
			// Auto slug khi tạo mới
			if (name === "title" && isCreating) {
				newData.slug = value
					.toLowerCase()
					.normalize("NFD")
					.replace(/[\u0300-\u036f]/g, "")
					.replace(/[^\w\s-]/g, "")
					.replace(/\s+/g, "-");
			}
			return newData;
		});
	};

	// Chèn snippet
	const insertSnippet = snippetStr => {
		try {
			const current = JSON.parse(contentJson);
			const block = JSON.parse(snippetStr);
			const newContent = Array.isArray(current) ? [...current, block] : [block];
			setContentJson(JSON.stringify(newContent, null, 2));
		} catch (e) {
			setContentJson(contentJson + ",\n" + snippetStr);
		}
	};

	// Lưu bài viết
	const handleSave = async () => {
		let parsedContent;
		try {
			parsedContent = JSON.parse(contentJson);
			if (!Array.isArray(parsedContent))
				throw new Error("Root phải là mảng []");
		} catch (e) {
			setMessage({ type: "error", text: "Lỗi cú pháp JSON!" });
			return;
		}

		setLoading(true);
		const payload = {
			...formData,
			content: parsedContent,
			updateDate: new Date().toISOString(),
		};
		const config = { headers: { Authorization: `Bearer ${token}` } };
		const apiUrl = import.meta.env.VITE_API_URL;

		try {
			if (isCreating) {
				await axios.post(`${apiUrl}/api/guides`, payload, config);
				setMessage({ type: "success", text: "Tạo mới thành công!" });
				setTimeout(() => navigate(`/admin/guideEditor/${payload.slug}`), 1000);
			} else {
				await axios.put(`${apiUrl}/api/guides/${slugMode}`, payload, config);
				setMessage({ type: "success", text: "Cập nhật thành công!" });
			}
		} catch (err) {
			setMessage({
				type: "error",
				text: err.response?.data?.message || "Lỗi lưu dữ liệu.",
			});
		} finally {
			setLoading(false);
		}
	};

	// Preview realtime
	let previewData = null;
	try {
		previewData = JSON.parse(contentJson);
	} catch (e) {}

	return (
		<div
			className='container mx-auto p-4 min-h-screen pb-20'
			style={{ backgroundColor: "var(--color-page-bg)" }}
		>
			<div className='flex justify-between items-center mb-6'>
				<h1
					className='text-3xl font-bold'
					style={{
						color: "var(--color-text-primary)",
						fontFamily: "var(--font-primary)",
					}}
				>
					{isCreating ? "Tạo Guide Mới" : `Sửa: ${formData.title}`}
				</h1>
				<button
					onClick={() => navigate("/admin/guideEditor")}
					className='text-blue-600 font-semibold hover:underline'
				>
					&larr; Quay lại danh sách
				</button>
			</div>

			{message.text && (
				<div
					className={`p-4 mb-4 rounded border ${
						message.type === "error"
							? "bg-red-50 text-red-700"
							: "bg-green-50 text-green-700"
					}`}
				>
					{message.text}
				</div>
			)}

			<div className='grid grid-cols-1 xl:grid-cols-2 gap-6'>
				{/* Cột trái: Form nhập liệu */}
				<div className='flex flex-col gap-6'>
					<div className='p-6 bg-white rounded-xl shadow-sm border space-y-4'>
						<h2 className='font-bold border-b pb-2'>Thông tin chung</h2>
						<div>
							<label className='text-xs font-bold text-gray-500 uppercase'>
								Tiêu đề
							</label>
							<input
								type='text'
								name='title'
								value={formData.title}
								onChange={handleChange}
								className='w-full mt-1 p-2 border rounded'
							/>
						</div>
						<div className='grid grid-cols-2 gap-4'>
							<div>
								<label className='text-xs font-bold text-gray-500 uppercase'>
									Slug
								</label>
								<input
									type='text'
									name='slug'
									value={formData.slug}
									onChange={handleChange}
									disabled={!isCreating}
									className={`w-full mt-1 p-2 border rounded ${
										!isCreating ? "bg-gray-100" : ""
									}`}
								/>
							</div>
							<div>
								<label className='text-xs font-bold text-gray-500 uppercase'>
									Tác giả
								</label>
								<input
									type='text'
									name='author'
									value={formData.author}
									onChange={handleChange}
									className='w-full mt-1 p-2 border rounded'
								/>
							</div>
						</div>
						<div>
							<label className='text-xs font-bold text-gray-500 uppercase'>
								Ảnh bìa (URL)
							</label>
							<input
								type='text'
								name='thumbnail'
								value={formData.thumbnail}
								onChange={handleChange}
								className='w-full mt-1 p-2 border rounded text-blue-600 font-mono text-sm'
							/>
						</div>
					</div>

					<div className='p-4 bg-white rounded-xl shadow-sm border flex-1 flex flex-col min-h-[500px]'>
						<div className='flex justify-between mb-2'>
							<h2 className='font-bold text-gray-700'>Nội dung (JSON)</h2>
							<div className='flex gap-2'>
								{Object.keys(snippets).map(k => (
									<button
										key={k}
										onClick={() => insertSnippet(snippets[k])}
										className='text-xs px-2 py-1 bg-gray-100 border rounded hover:bg-blue-100'
									>
										+{k}
									</button>
								))}
							</div>
						</div>
						<textarea
							value={contentJson}
							onChange={e => setContentJson(e.target.value)}
							className='flex-1 w-full p-4 font-mono text-sm border rounded bg-slate-50 focus:bg-white outline-none'
							spellCheck='false'
						/>
					</div>

					<button
						onClick={handleSave}
						disabled={loading}
						className='py-3 bg-blue-600 text-white rounded-lg font-bold shadow-lg hover:bg-blue-700 transition'
					>
						{loading ? "Đang lưu..." : "Lưu Bài Viết"}
					</button>
				</div>

				{/* Cột phải: Live Preview */}
				<div className='sticky top-4 h-[calc(100vh-2rem)] bg-white rounded-xl shadow-lg border flex flex-col overflow-hidden'>
					<div className='bg-gray-50 px-4 py-2 border-b font-bold text-gray-500 text-sm'>
						📱 Live Preview
					</div>
					<div className='p-8 overflow-y-auto flex-1'>
						<h1
							className='text-3xl font-extrabold mb-4'
							style={{ fontFamily: "var(--font-primary)" }}
						>
							{formData.title || "Tiêu đề..."}
						</h1>
						{formData.thumbnail && (
							<img
								src={formData.thumbnail}
								className='w-full max-h-[300px] object-cover rounded-lg mb-8'
							/>
						)}
						{previewData ? (
							Array.isArray(previewData) ? (
								previewData.map((b, i) => <PreviewBlock key={i} block={b} />)
							) : (
								<div className='text-red-500'>Root phải là mảng []</div>
							)
						) : (
							<div className='text-gray-400 text-center mt-10'>
								Đang chờ nội dung hợp lệ...
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

// =================================================================================
// PHẦN 3: MAIN COMPONENT - ĐIỀU HƯỚNG GIỮA LIST VÀ FORM
// =================================================================================
const GuideEditor = () => {
	const { slug } = useParams();

	// Nếu không có slug trên URL => Hiển thị Danh sách
	if (!slug) {
		return <GuideList />;
	}

	// Nếu có slug (bao gồm cả 'new') => Hiển thị Form Editor
	return <GuideForm slugMode={slug} />;
};

export default GuideEditor;
