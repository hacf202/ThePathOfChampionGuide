import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Eye, Calendar, PenTool, ArrowLeft, Home, List } from "lucide-react";
import axios from "axios";
import PageTitle from "../common/pageTitle.jsx";
import Button from "../common/button.jsx";
import GuideContent from "./guideContent.jsx";
import { removeAccents } from "../../utils/vietnameseUtils.js";

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

		const fetchAllData = async () => {
			if (!slug) return;
			setLoading(true);
			setError(null);

			try {
				const backendUrl = import.meta.env.VITE_API_URL;

				const [
					guideDetailResponse,
					allGuidesResponse,
					championsResponse,
					relicsResponse,
					powersResponse,
				] = await Promise.all([
					axios.get(`${backendUrl}/api/guides/${slug}`),
					axios.get(`${backendUrl}/api/guides`),
					axios.get(`${backendUrl}/api/champions`),
					axios.get(`${backendUrl}/api/relics`),
					axios.get(`${backendUrl}/api/powers`),
				]);

				if (guideDetailResponse.data.success) {
					setGuide(guideDetailResponse.data.data);
				} else {
					setError("Không tìm thấy nội dung bài viết.");
				}

				if (allGuidesResponse.data.success) {
					const otherGuides = allGuidesResponse.data.data
						.filter(item => item.slug !== slug)
						.slice(0, 3);
					setRelatedGuides(otherGuides);
				}

				const convertArrayToMap = (array, keyField) => {
					if (!Array.isArray(array)) return {};
					return array.reduce((accumulator, item) => {
						if (item && item[keyField]) {
							accumulator[item[keyField]] = item;
						}
						return accumulator;
					}, {});
				};

				setReferenceData({
					champions: convertArrayToMap(championsResponse.data, "championID"),
					relics: convertArrayToMap(relicsResponse.data, "relicCode"),
					powers: convertArrayToMap(powersResponse.data, "powerCode"),
				});
			} catch (err) {
				console.error("Lỗi khi tải dữ liệu:", err);
				setError("Đã xảy ra lỗi khi kết nối với máy chủ.");
			} finally {
				setLoading(false);
			}
		};

		fetchAllData();
	}, [slug]);

	// Lọc các block là section có tiêu đề để làm mục lục
	const sections =
		guide?.content?.filter(block => block.type === "section" && block.title) ||
		[];

	const handleScrollToSection = (e, title) => {
		e.preventDefault();
		const id = removeAccents(title);
		const element = document.getElementById(id);
		if (element) {
			element.scrollIntoView({ behavior: "smooth", block: "start" });
		}
	};

	if (loading) {
		return (
			<div className='flex justify-center items-center min-h-[50vh]'>
				<div className='animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500 border-solid'></div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='text-center py-20 min-h-screen bg-gray-50'>
				<h2 className='text-2xl font-bold mb-4 text-red-600'>Lỗi dữ liệu</h2>
				<p className='mb-6 text-gray-600'>{error}</p>
				<Button
					variant='primary'
					onClick={() => navigate("/")}
					iconLeft={<Home size={18} />}
				>
					Quay về trang chủ
				</Button>
			</div>
		);
	}

	if (!guide) return null;

	return (
		<div className='min-h-screen'>
			<PageTitle
				title={`${guide.title} | POC GUIDE`}
				description={guide.title}
				type='article'
			/>

			<header className='bg-white'>
				<div className='container mx-auto md:px-4 py-8 max-w-[1200px]'>
					<Button
						variant='ghost'
						onClick={() => navigate("/guides")}
						iconLeft={<ArrowLeft size={16} />}
						className='mb-6 pl-0 text-blue-600 hover:bg-transparent'
					>
						Quay lại danh sách
					</Button>

					<h1 className='text-3xl md:text-5xl font-extrabold leading-tight mb-4 text-gray-900'>
						{guide.title}
					</h1>

					<div className='flex flex-wrap items-center gap-4 text-sm text-gray-500 border-t pt-4'>
						<span className='flex items-center gap-1'>
							<Calendar size={18} /> Xuất bản: {guide.publishedDate}
						</span>
						<span className='flex items-center gap-1'>
							<Eye size={18} /> {guide.views || 0} lượt xem
						</span>
						{guide.author && (
							<span className='px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold flex items-center gap-1'>
								<PenTool size={16} /> {guide.author}
							</span>
						)}
					</div>
				</div>
			</header>

			<main className='container mx-auto md:px-4 py-8 max-w-[1200px]'>
				<article className='p-4 md:p-8 rounded-2xl bg-white shadow-sm ring-1 ring-black/5'>
					<div className='mb-8 rounded-xl overflow-hidden shadow-sm'>
						<img
							src={guide.thumbnail}
							alt={guide.title}
							className='w-full h-auto object-cover max-h-[450px]'
						/>
					</div>

					{/* PHẦN TÓM LƯỢC NỘI DUNG (TABLE OF CONTENTS) */}
					{sections.length > 0 && (
						<div className='mb-10 p-5 md:p-7 bg-slate-50 rounded-2xl border border-slate-200'>
							<div className='flex items-center gap-3 mb-4 text-slate-800 border-b pb-3 border-slate-200'>
								<List className='text-blue-600' size={24} />
								<h3 className='text-xl font-bold'>Tóm tắt nội dung</h3>
							</div>
							<nav>
								<ul className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3'>
									{sections.map((section, index) => (
										<li key={index} className='flex items-start gap-2 group'>
											<span className='text-blue-500 font-bold mt-1 text-sm'>
												{index + 1}.
											</span>
											<a
												href={`#${removeAccents(section.title)}`}
												onClick={e => handleScrollToSection(e, section.title)}
												className='text-slate-700 hover:text-blue-600 hover:underline transition-colors font-medium decoration-blue-400'
											>
												{section.title}
											</a>
										</li>
									))}
								</ul>
							</nav>
						</div>
					)}

					<GuideContent content={guide.content} referenceData={referenceData} />
				</article>

				{relatedGuides.length > 0 && (
					<section className='mt-16 border-t pt-10'>
						<h3 className='text-2xl font-bold mb-8 flex items-center text-gray-900'>
							<span className='w-1.5 h-8 bg-blue-500 mr-3 rounded-full'></span>
							Có thể bạn quan tâm
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
											alt={item.title}
											className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
										/>
									</div>
									<div className='p-4'>
										<h4 className='font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors'>
											{item.title}
										</h4>
										<div className='mt-3 flex items-center text-xs text-gray-500 gap-3'>
											<span className='flex items-center gap-1'>
												<Calendar size={14} /> {item.publishedDate}
											</span>
											<span className='flex items-center gap-1'>
												<Eye size={14} /> {item.views || 0}
											</span>
										</div>
									</div>
								</Link>
							))}
						</div>
					</section>
				)}
			</main>
		</div>
	);
};

export default GuideDetail;
