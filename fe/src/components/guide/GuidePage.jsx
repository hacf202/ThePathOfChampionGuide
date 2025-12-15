// src/pages/GuidePage.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import PageTitle from "../common/pageTitle";
import { Eye, Calendar, PenTool, ArrowLeft, Home } from "lucide-react";
import axios from "axios";
import Button from "../common/button"; // Đảm bảo đường dẫn đúng

// ==========================================
// 1. Component hiển thị nội dung đệ quy
// ==========================================
const ContentBlock = ({ block, referenceData }) => {
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
							<ContentBlock
								key={index}
								block={subBlock}
								referenceData={referenceData}
							/>
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
							className='px-4 py-2 font-bold border-b'
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
								const championId = block.championIds?.[rIdx];
								const relicId = block.relicIds?.[rIdx];
								const powerId = block.powerIds?.[rIdx];

								const championData = referenceData?.champions?.[championId];
								const relicData = referenceData?.relics?.[relicId];
								const powerData = referenceData?.powers?.[powerId];

								const directChampion = block.champions?.[rIdx];
								const directRelic = block.relics?.[rIdx];
								const directPower = block.powers?.[rIdx];

								return (
									<tr
										key={rIdx}
										className={rIdx % 2 !== 0 ? "bg-gray-50" : "bg-white"}
									>
										{row.map((cell, cIdx) => {
											let content = renderHtml(cell);

											if (cIdx === 0) {
												let imgSrc = null;
												let linkUrl = null;
												let hasMatch = false;

												if (championData || directChampion) {
													const data = championData || directChampion;
													imgSrc = data.assets?.[0]?.avatar;
													linkUrl = `/champion/${
														championId || data.championID
													}`;
													hasMatch = true;
												} else if (relicData || directRelic) {
													const data = relicData || directRelic;
													imgSrc = data.assetAbsolutePath;
													linkUrl = `/relic/${relicId || data.relicCode}`;
													hasMatch = true;
												} else if (powerData || directPower) {
													const data = powerData || directPower;
													imgSrc = data.assetAbsolutePath;
													linkUrl = `/power/${powerId || data.powerCode}`;
													hasMatch = true;
												}

												if (hasMatch) {
													content = (
														<Link
															to={linkUrl}
															className='flex items-center gap-3 hover:underline font-semibold group'
															style={{ color: "var(--color-primary-500)" }}
														>
															{imgSrc && (
																<img
																	src={imgSrc}
																	alt=''
																	className='w-10 h-10 rounded object-cover border shadow-sm group-hover:scale-105 transition-transform'
																	style={{
																		borderColor: "var(--color-border)",
																		backgroundColor: "#f3f4f6",
																	}}
																	onError={e => {
																		e.target.style.display = "none";
																	}}
																/>
															)}
															<span>{renderHtml(cell)}</span>
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
								{item.image && (
									<div className='flex-shrink-0'>
										<img
											src={item.image}
											alt={item.imageAlt}
											className='w-full h-72 object-cover rounded-lg'
										/>
									</div>
								)}
							</div>
						</div>
					))}
				</div>
			);

		case "conclusion":
			return (
				<div
					className='mt-12 p-6  rounded-xl border text-center'
					style={{
						backgroundColor: "var(--color-surface-hover-bg)",
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
							color: "var(--color-text-primary)",
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
	const navigate = useNavigate();
	const [guide, setGuide] = useState(null);
	const [relatedGuides, setRelatedGuides] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const [referenceData, setReferenceData] = useState({
		champions: {},
		relics: {},
		powers: {},
	});

	useEffect(() => {
		window.scrollTo(0, 0);

		const fetchData = async () => {
			if (!slug) return;
			setLoading(true);
			setError(null);

			try {
				const backendUrl = import.meta.env.VITE_API_URL;

				const [detailRes, listRes, champsRes, relicsRes, powersRes] =
					await Promise.all([
						axios.get(`${backendUrl}/api/guides/${slug}`),
						axios.get(`${backendUrl}/api/guides`),
						axios.get(`${backendUrl}/api/champions`),
						axios.get(`${backendUrl}/api/relics`),
						axios.get(`${backendUrl}/api/powers`),
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

				const arrayToMap = (arr, keyField) => {
					if (!Array.isArray(arr)) return {};
					return arr.reduce((acc, item) => {
						if (item && item[keyField]) {
							acc[item[keyField]] = item;
						}
						return acc;
					}, {});
				};

				setReferenceData({
					champions: arrayToMap(champsRes.data, "championID"),
					relics: arrayToMap(relicsRes.data, "relicCode"),
					powers: arrayToMap(powersRes.data, "powerCode"),
				});
			} catch (err) {
				console.error("Lỗi khi tải dữ liệu:", err);
				if (err.response && err.response.status === 404) {
					setError("Bài viết không tồn tại.");
				} else {
					setError("Lỗi kết nối server hoặc tải dữ liệu.");
				}
			} finally {
				setLoading(false);
			}
		};

		fetchData();
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
				{/* Nút quay về trang chủ */}
				<Button
					variant='primary'
					onClick={() => navigate("/")}
					iconLeft={<Home size={18} />}
				>
					Quay về trang chủ
				</Button>
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
				<div className='container mx-auto md:px-4 py-8 max-w-[1200px]'>
					{/* Nút quay lại danh sách sử dụng Button variant Ghost */}
					<div className='mb-6'>
						<Button
							variant='ghost'
							onClick={() => navigate("/guides")}
							iconLeft={<ArrowLeft size={16} />}
							className='hover:opacity-80 pl-0'
							style={{ color: "var(--color-primary-500)" }}
						>
							Quay lại danh sách
						</Button>
					</div>

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
							<Calendar size={18} />
							Ngày xuất bản: {guide.publishedDate}
						</span>
						<span className='flex items-center gap-1'>
							<Calendar size={18} />
							Ngày cập nhật: {guide.updateDate}
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
			<article className='container mx-auto md:px-4 py-8 max-w-[1200px]'>
				<div
					className='p-2 md:p-6 rounded-2xl shadow-sm ring-1 ring-opacity-5'
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
							<ContentBlock
								key={index}
								block={block}
								referenceData={referenceData}
							/>
						))}
				</div>
			</article>

			{/* --- SECTION: BÀI VIẾT LIÊN QUAN --- */}
			{relatedGuides.length > 0 && (
				<section
					className='container mx-auto md:px-4 py-8 max-w-[1200px] mb-16 border-t'
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

								<div className='p-4'>
									<h4
										className='font-bold line-clamp-2 transition leading-snug group-hover:text-opacity-80'
										style={{
											color: "var(--color-text-primary)",
											fontFamily: "var(--font-primary)",
										}}
									>
										{item.title}
									</h4>
									<div
										className='mt-3 flex items-center text-xs'
										style={{ color: "var(--color-text-secondary)" }}
									>
										<span className='flex items-center gap-1'>
											<Calendar size={18} /> {item.publishedDate || "Mới nhất"}
											<Eye size={18} /> {item.views || 0} lượt xem
										</span>
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
