import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Eye, Calendar, PenTool, ArrowLeft, Home, List } from "lucide-react";
import axios from "axios";
import PageTitle from "../common/pageTitle.jsx";
import Button from "../common/button.jsx";
import GuideContent from "./guideContent.jsx";
import { removeAccents } from "../../utils/vietnameseUtils.js";
import { useTranslation } from "../../hooks/useTranslation"; // 🟢 Import Hook Đa ngôn ngữ

const GuideDetail = () => {
	const { slug } = useParams();
	const navigate = useNavigate();
	const { language, t } = useTranslation(); // 🟢 Khởi tạo Hook

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

		const fetchAllData = async () => {
			if (!slug) return;
			setLoading(true);
			setError(null);

			try {
				const backendUrl = import.meta.env.VITE_API_URL;

				// Lấy dữ liệu bài viết + metadata song song để tiết kiệm thời gian
				const [
					guideDetailResponse,
					allChampionsRes,
					allRelicsRes,
					allPowersRes,
				] = await Promise.all([
					axios.get(`${backendUrl}/api/guides/${slug}`),
					axios.get(`${backendUrl}/api/champions?page=1&limit=1000`),
					axios.get(`${backendUrl}/api/relics?page=1&limit=1000`),
					axios.get(`${backendUrl}/api/powers?page=1&limit=1000`),
				]);

				if (guideDetailResponse.data.success) {
					setGuide(guideDetailResponse.data.data.guide);
					setRelatedGuides(guideDetailResponse.data.data.relatedGuides || []);

					// Chuyển mảng metadata thành Object map dạng { "tên": {chi_tiết} } để tra cứu O(1)
					const buildMap = items => {
						const map = {};
						items.forEach(item => {
							map[item.name] = item;
						});
						return map;
					};

					setReferenceData({
						champions: buildMap(allChampionsRes.data.items || []),
						relics: buildMap(allRelicsRes.data.items || []),
						powers: buildMap(allPowersRes.data.items || []),
					});
				}
			} catch (err) {
				console.error("Lỗi tải chi tiết:", err);
				setError(
					err.message ||
						(language === "vi"
							? "Lỗi kết nối server"
							: "Server connection error"),
				);
			} finally {
				setLoading(false);
			}
		};

		fetchAllData();
	}, [slug, language]); // Cập nhật nhẹ nếu ngôn ngữ lỗi thì có thể retry

	if (loading)
		return (
			<div className='min-h-screen flex items-center justify-center text-gray-500'>
				{language === "vi" ? "Đang tải..." : "Loading..."}
			</div>
		);

	if (error || !guide)
		return (
			<div className='min-h-screen flex flex-col items-center justify-center text-red-500'>
				<p className='text-xl mb-4'>
					{error ||
						(language === "vi" ? "Không tìm thấy bài viết" : "Guide not found")}
				</p>
				<Link to='/guides'>
					<Button variant='primary'>
						{language === "vi" ? "Quay lại Trang chủ" : "Back to Home"}
					</Button>
				</Link>
			</div>
		);

	// Tạo Table of Contents từ các thẻ heading (section block)
	// Chú ý: Vẫn giữ id bằng tiêu đề gốc removeAccents để khớp với neo (anchor link)
	const toc = guide.content
		.filter(block => block.type === "section" && block.title)
		.map(block => ({
			id: removeAccents(block.title),
			title: t(block, "title"), // 🟢 Hiển thị ngôn ngữ theo tùy chọn
		}));

	return (
		<div className='bg-gray-50 min-h-screen pb-20'>
			{/* Đổi thẻ meta PageTitle */}
			<PageTitle
				title={t(guide, "title")}
				description={t(guide, "description") || guide.description}
				image={guide.thumbnail}
			/>

			{/* ===================== HERO SECTION ===================== */}
			<div className='bg-white border-b border-gray-200 pt-16 pb-12 px-4'>
				<div className='max-w-5xl mx-auto'>
					{/* Breadcrumb */}
					<div className='flex items-center gap-2 text-sm text-gray-500 mb-6 font-medium'>
						<button
							onClick={() => navigate(-1)}
							className='hover:text-blue-600 flex items-center gap-1 mr-4 border border-gray-200 px-3 py-1 rounded-full'
						>
							<ArrowLeft size={14} /> {language === "vi" ? "Quay lại" : "Back"}
						</button>
						<Link
							to='/'
							className='hover:text-blue-600 flex items-center gap-1'
						>
							<Home size={14} /> {language === "vi" ? "Trang chủ" : "Home"}
						</Link>
						<span>/</span>
						<Link to='/guides' className='hover:text-blue-600'>
							{language === "vi" ? "Hướng dẫn" : "Guides"}
						</Link>
						<span>/</span>
						<span className='text-gray-900 font-medium truncate max-w-[200px] sm:max-w-md'>
							{t(guide, "title")}
						</span>
					</div>

					<h1 className='text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight'>
						{t(guide, "title")}
					</h1>

					<div className='flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-8 pb-8 border-b border-gray-200'>
						<span className='flex items-center gap-2'>
							<Calendar size={18} /> {guide.publishedDate}
						</span>
						<span className='flex items-center gap-2'>
							<Eye size={18} /> {guide.views}{" "}
							{language === "vi" ? "lượt xem" : "views"}
						</span>
						<span className='flex items-center gap-2'>
							<PenTool size={18} /> {language === "vi" ? "Tác giả:" : "Author:"}{" "}
							{guide.author || "Admin"}
						</span>
					</div>
				</div>
			</div>

			{/* ===================== MAIN CONTENT & TOC ===================== */}
			<div className='max-w-6xl mx-auto px-4 mt-10'>
				<div className='grid grid-cols-1 lg:grid-cols-4 gap-12'>
					{/* Nội dung bài viết (Trái - 3 cột) */}
					<div className='lg:col-span-3'>
						<div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-10'>
							{guide.thumbnail && (
								<img
									src={guide.thumbnail}
									alt={t(guide, "title")}
									className='w-full h-auto max-h-[450px] object-cover rounded-xl mb-10 shadow-sm'
								/>
							)}

							<div className='prose prose-lg max-w-none'>
								{guide.content.map((block, index) => (
									<GuideContent
										key={index}
										block={block}
										referenceData={referenceData}
									/>
								))}
							</div>
						</div>

						{/* Phần bài viết liên quan */}
						{relatedGuides.length > 0 && (
							<div className='mt-16 border-t pt-10'>
								<h3 className='text-2xl font-bold mb-8 flex items-center text-gray-900'>
									<span className='w-1.5 h-8 bg-blue-500 mr-3 rounded-full'></span>
									{language === "vi"
										? "Có thể bạn quan tâm"
										: "You might also like"}
								</h3>

								<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
									{relatedGuides.map(item => (
										<Link
											to={`/guides/${item.slug}`}
											key={item.slug}
											className='group bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 overflow-hidden'
										>
											<div className='h-44 overflow-hidden'>
												<img
													src={item.thumbnail}
													alt={t(item, "title")}
													className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
												/>
											</div>
											<div className='p-4'>
												<h4 className='font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors'>
													{t(item, "title")}
												</h4>
												<div className='mt-3 flex items-center text-xs text-gray-500 gap-3'>
													<span className='flex items-center gap-1'>
														<Calendar size={14} /> {item.publishedDate}
													</span>
													<span className='flex items-center gap-1'>
														<Eye size={14} /> {item.views}{" "}
														{language === "vi" ? "lượt xem" : "views"}
													</span>
												</div>
											</div>
										</Link>
									))}
								</div>
							</div>
						)}
					</div>

					{/* Sidebar - Mục lục (TOC) (Phải - 1 cột) */}
					{toc.length > 0 && (
						<div className='lg:col-span-1 hidden lg:block'>
							<div className='sticky top-24 bg-gray-50 rounded-xl p-6 border border-gray-100'>
								<h3 className='text-lg font-bold text-gray-900 mb-4 flex items-center gap-2'>
									<List size={20} className='text-blue-500' />
									{language === "vi" ? "Nội dung chính" : "Table of Contents"}
								</h3>
								<ul className='space-y-3 text-sm'>
									{toc.map(item => (
										<li key={item.id}>
											<a
												href={`#${item.id}`}
												className='text-gray-600 hover:text-blue-600 transition-colors block'
											>
												{item.title}
											</a>
										</li>
									))}
								</ul>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default GuideDetail;
