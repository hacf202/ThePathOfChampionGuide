import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import PageTitle from "../common/PageTitle";
import { Eye, Calendar, PenTool } from "lucide-react";
import axios from "axios";

// ==========================================
// 1. Component hiển thị nội dung đệ quy
// ==========================================
const ContentBlock = ({ block }) => {
	if (!block) return null;

	const renderHtml = text => (
		<span dangerouslySetInnerHTML={{ __html: text }} />
	);

	switch (block.type) {
		case "section":
			return (
				<section className='mb-8 mt-6'>
					{block.title && (
						<h2
							className='text-2xl font-bold mb-4 pb-2 border-b'
							style={{
								color: "var(--color-text-primary)",
								borderColor: "var(--color-border)",
							}}
						>
							{block.title}
						</h2>
					)}
					{block.content &&
						block.content.map((subBlock, index) => (
							<ContentBlock key={index} block={subBlock} />
						))}
				</section>
			);

		case "paragraph":
			return (
				<p
					className='leading-relaxed mb-4 text-lg'
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
				<figure className='my-8 flex flex-col items-center'>
					<img
						src={block.src}
						alt={block.alt || "Guide Image"}
						className='rounded-lg shadow-md max-w-full h-auto object-cover'
						style={{ maxHeight: "500px" }}
					/>
					{block.alt && (
						<figcaption
							className='mt-2 text-sm italic text-center'
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
					className='list-disc list-outside ml-6 mb-6 space-y-2 text-lg'
					style={{
						color: "var(--color-text-primary)",
						fontFamily: "var(--font-secondary)",
					}}
				>
					{block.items.map((item, index) => (
						<li key={index}>{renderHtml(item)}</li>
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
							className='px-4 py-2 font-bold  border-b'
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
							className='p-2 text-center text-xs italic border-t'
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
				<div
					className='mt-12 p-6 rounded-xl border text-center'
					style={{
						backgroundColor: "var(--color-surface-hover-bg)", // Màu xanh nhạt từ theme
						borderColor: "var(--color-primary-300)",
					}}
				>
					<h3
						className='text-xl font-bold mb-2'
						style={{
							color: "var(--color-primary-700)",
							fontFamily: "var(--font-primary)",
						}}
					>
						{block.title}
					</h3>
					<p
						className='text-lg'
						style={{
							color: "var(--color-text-primary)", // Hoặc primary-700 nếu muốn đậm hơn
							fontFamily: "var(--font-secondary)",
						}}
					>
						{renderHtml(block.text)}
					</p>
				</div>
			);

		default:
			return null;
	}
};

// ==========================================
// 2. Component Chính
// ==========================================
const GuideDetail = () => {
	const { slug } = useParams();
	const [guide, setGuide] = useState(null);
	const [relatedGuides, setRelatedGuides] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		window.scrollTo(0, 0);

		const fetchData = async () => {
			setLoading(true);
			setError(null);
			try {
				const backendUrl = import.meta.env.VITE_API_URL;
				const [detailRes, listRes] = await Promise.all([
					axios.get(`${backendUrl}/api/guides/${slug}`),
					axios.get(`${backendUrl}/api/guides`),
				]);

				if (detailRes.data.success) {
					setGuide(detailRes.data.data);
				} else {
					setError("Không tìm thấy nội dung bài viết.");
				}

				if (listRes.data.success) {
					const allGuides = listRes.data.data;
					const otherGuides = allGuides
						.filter(g => g.slug !== slug)
						.slice(0, 3);
					setRelatedGuides(otherGuides);
				}
			} catch (err) {
				console.error("Lỗi:", err);
				if (err.response && err.response.status === 404) {
					setError("Bài viết không tồn tại.");
				} else {
					setError("Lỗi kết nối server.");
				}
			} finally {
				setLoading(false);
			}
		};

		if (slug) fetchData();
	}, [slug]);

	if (loading)
		return (
			<div className='flex justify-center items-center min-h-[50vh]'>
				<div
					className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2'
					style={{
						borderColor: "var(--color-primary-500)",
						borderTopColor: "transparent",
					}}
				></div>
			</div>
		);

	if (error)
		return (
			<div
				className='text-center py-20 min-h-screen'
				style={{ backgroundColor: "var(--color-page-bg)" }}
			>
				<h2
					className='text-2xl font-bold mb-4'
					style={{ color: "var(--color-danger-500)" }}
				>
					Đã xảy ra lỗi
				</h2>
				<p className='mb-6' style={{ color: "var(--color-text-secondary)" }}>
					{error}
				</p>
				<Link
					to='/'
					className='hover:underline'
					style={{ color: "var(--color-primary-500)" }}
				>
					Quay về trang chủ
				</Link>
			</div>
		);

	if (!guide) return null;

	return (
		<div
			className='min-h-screen'
			style={{
				fontFamily: "var(--font-secondary)",
				color: "var(--color-text-primary)",
			}}
		>
			<PageTitle
				title={`${guide.title} | POC GUIDE`}
				description={`${guide.title} | các bài hướng dẫn về Con Đường Anh Hùng POC`}
				type='article'
			/>
			{/* --- HEADER --- */}
			<div
				className='shadow-sm'
				style={{ backgroundColor: "var(--color-white)" }}
			>
				<div className='container mx-auto px-4 py-8 max-w-[1200px]'>
					<Link
						to='/guides'
						className='inline-flex items-center mb-6 font-medium transition hover:opacity-80'
						style={{ color: "var(--color-primary-500)" }}
					>
						<svg
							className='w-4 h-4 mr-2'
							fill='none'
							stroke='currentColor'
							viewBox='0 0 24 24'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth='2'
								d='M10 19l-7-7m0 0l7-7m-7 7h18'
							></path>
						</svg>
						Quay lại danh sách
					</Link>

					<h1
						className='text-3xl md:text-5xl font-extrabold leading-tight mb-4'
						style={{
							fontFamily: "var(--font-primary)",
							color: "var(--color-text-primary)",
						}}
					>
						{guide.title}
					</h1>

					<div
						className='flex flex-wrap items-center gap-4 text-sm border-t pt-4 mt-4'
						style={{
							color: "var(--color-text-secondary)",
							borderColor: "var(--color-border)",
						}}
					>
						<span className='flex items-center gap-1'>
							<Calendar size={18} /> {guide.publishedDate || "Mới cập nhật"}
						</span>
						<span className='flex items-center gap-1'>
							<Eye size={18} />
							{guide.views || 0} lượt xem
						</span>
						{guide.author && (
							<span
								className='px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1'
								style={{
									backgroundColor: "var(--color-surface-hover-bg)",
									color: "var(--color-primary-700)",
								}}
							>
								<PenTool size={18} /> {guide.author}
							</span>
						)}
					</div>
				</div>
			</div>

			{/* --- BODY CONTENT --- */}
			<article className='container mx-auto px-4 py-8 max-w-[1200px]'>
				<div
					className='p-6 md:p-12 rounded-2xl shadow-sm ring-1 ring-opacity-5'
					style={{
						backgroundColor: "var(--color-white)",
						borderColor: "var(--color-border)",
					}}
				>
					{/* Ảnh bìa */}
					<div className='mb-8 rounded-lg overflow-hidden shadow-sm'>
						<img
							src={guide.thumbnail}
							alt={guide.title}
							className='w-full h-auto object-cover max-h-[400px]'
						/>
					</div>

					{/* Nội dung bài viết */}
					{guide.content &&
						guide.content.map((block, index) => (
							<ContentBlock key={index} block={block} />
						))}
				</div>
			</article>

			{/* --- SECTION: BÀI VIẾT LIÊN QUAN --- */}
			{relatedGuides.length > 0 && (
				<section
					className='container mx-auto px-4 py-8 max-w-[1200px] mb-16 border-t'
					style={{ borderColor: "var(--color-border)" }}
				>
					<h3
						className='text-2xl font-bold mb-8 flex items-center'
						style={{
							color: "var(--color-text-primary)",
							fontFamily: "var(--font-primary)",
						}}
					>
						<span
							className='w-1 h-8 mr-3 rounded-full'
							style={{ backgroundColor: "var(--color-primary-500)" }}
						></span>
						Có thể bạn quan tâm
					</h3>

					<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
						{relatedGuides.map(item => (
							<Link
								to={`/guides/${item.slug}`}
								key={item.slug}
								className='group rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border'
								style={{
									backgroundColor: "var(--color-white)",
									borderColor: "var(--color-gray-300)",
								}}
							>
								{/* Thumbnail nhỏ */}
								<div className='h-40 overflow-hidden relative'>
									<img
										src={
											item.thumbnail || "https://via.placeholder.com/400x200"
										}
										alt={item.title}
										className='w-full h-full object-cover transform group-hover:scale-105 transition duration-500'
									/>
									<div className='absolute inset-0 bg-black/10 group-hover:bg-transparent transition'></div>
								</div>

								{/* Title */}
								<div className='p-4'>
									<h4
										className='font-bold line-clamp-2 transition leading-snug group-hover:text-opacity-80'
										style={{
											color: "var(--color-text-primary)",
											fontFamily: "var(--font-primary)",
										}}
									>
										{/* Hover effect thủ công hơi khó với inline style thuần túy mà không có state, 
                        nhưng CSS class 'group-hover:text-blue-600' cũ có thể thay bằng CSS module hoặc styled-component. 
                        Ở đây ta giữ màu text-primary và dựa vào opacity hover của thẻ Link cha */}
										{item.title}
									</h4>
									<div
										className='mt-3 flex items-center text-xs'
										style={{ color: "var(--color-text-secondary)" }}
									>
										<span>📅 {item.publishedDate || "Mới nhất"}</span>
									</div>
								</div>
							</Link>
						))}
					</div>
				</section>
			)}
		</div>
	);
};

export default GuideDetail;
