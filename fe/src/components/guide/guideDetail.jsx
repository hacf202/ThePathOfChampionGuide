// src/pages/guideDetail.jsx
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
	const { tUI, tDynamic } = useTranslation(); // 🟢 Khởi tạo Hook

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
				const [guideRes, champsRes, relicsRes, powersRes] = await Promise.all([
					axios.get(`${backendUrl}/api/guides/${slug}`),
					axios.get(`${backendUrl}/api/champions?page=1&limit=1000`),
					axios.get(`${backendUrl}/api/relics?page=1&limit=1000`),
					axios.get(`${backendUrl}/api/powers?page=1&limit=1000`),
				]);

				if (guideRes.data.success) {
					setGuide(guideRes.data.data.guide);
					setRelatedGuides(guideRes.data.data.relatedGuides || []);

					const buildMap = items => {
						const map = {};
						items.forEach(item => {
							map[item.name] = item;
						});
						return map;
					};

					setReferenceData({
						champions: buildMap(champsRes.data.items || []),
						relics: buildMap(relicsRes.data.items || []),
						powers: buildMap(powersRes.data.items || []),
					});
				}
			} catch (err) {
				setError(err.message || tUI("common.errorLoadData"));
			} finally {
				setLoading(false);
			}
		};

		fetchAllData();
	}, [slug, tUI]);

	const toc =
		guide?.content
			?.filter(block => block.type === "section" && block.title)
			.map(block => ({
				id: removeAccents(block.title),
				title: tDynamic(block, "title"),
			})) || [];

	if (loading)
		return (
			<div className='min-h-screen flex items-center justify-center text-gray-500'>
				{tUI("common.loading")}
			</div>
		);

	if (error || !guide)
		return (
			<div className='min-h-screen flex flex-col items-center justify-center text-red-500'>
				<p className='text-xl mb-4'>{error || tUI("guideDetail.notFound")}</p>
				<Link to='/guides'>
					<Button variant='primary'>{tUI("common.backToHome")}</Button>
				</Link>
			</div>
		);

	return (
		<div className='bg-gray-50 min-h-screen pb-20'>
			<PageTitle
				title={tDynamic(guide, "title")}
				description={tDynamic(guide, "description") || guide.description}
				image={guide.thumbnail}
			/>

			<div className='bg-white border-b border-gray-200 pt-16 pb-12 px-4'>
				<div className='max-w-5xl mx-auto'>
					<div className='flex items-center gap-2 text-sm text-gray-500 mb-6 font-medium'>
						<button
							onClick={() => navigate(-1)}
							className='hover:text-blue-600 flex items-center gap-1 mr-4 border border-gray-200 px-3 py-1 rounded-full'
						>
							<ArrowLeft size={14} /> {tUI("common.back")}
						</button>
						<Link
							to='/'
							className='hover:text-blue-600 flex items-center gap-1'
						>
							<Home size={14} /> {tUI("common.home")}
						</Link>
						<span>/</span>
						<Link to='/guides' className='hover:text-blue-600'>
							{tUI("intro.guides")}
						</Link>
						<span>/</span>
						<span className='text-gray-900 font-medium truncate max-w-[200px] sm:max-w-md'>
							{tDynamic(guide, "title")}
						</span>
					</div>

					<h1 className='text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight'>
						{tDynamic(guide, "title")}
					</h1>

					<div className='flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-8 pb-8 border-b border-gray-200'>
						<span className='flex items-center gap-2'>
							<Calendar size={18} /> {guide.publishedDate}
						</span>
						<span className='flex items-center gap-2'>
							<Eye size={18} /> {guide.views} {tUI("common.views")}
						</span>
						<span className='flex items-center gap-2'>
							<PenTool size={18} /> {tUI("guideDetail.authorLabel")}{" "}
							{guide.author || "Admin"}
						</span>
					</div>
				</div>
			</div>

			<div className='max-w-6xl mx-auto px-4 mt-10'>
				<div className='grid grid-cols-1 lg:grid-cols-4 gap-12'>
					<div className='lg:col-span-3'>
						<div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-10'>
							{guide.thumbnail && (
								<img
									src={guide.thumbnail}
									alt={tDynamic(guide, "title")}
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

						{relatedGuides.length > 0 && (
							<div className='mt-16 border-t pt-10'>
								<h3 className='text-2xl font-bold mb-8 flex items-center text-gray-900'>
									<span className='w-1.5 h-8 bg-blue-500 mr-3 rounded-full'></span>
									{tUI("guideDetail.relatedTitle")}
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
													alt={tDynamic(item, "title")}
													className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
												/>
											</div>
											<div className='p-4'>
												<h4 className='font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors'>
													{tDynamic(item, "title")}
												</h4>
												<div className='mt-3 flex items-center text-xs text-gray-500 gap-3'>
													<span className='flex items-center gap-1'>
														<Calendar size={14} /> {item.publishedDate}
													</span>
													<span className='flex items-center gap-1'>
														<Eye size={14} /> {item.views} {tUI("common.views")}
													</span>
												</div>
											</div>
										</Link>
									))}
								</div>
							</div>
						)}
					</div>

					{toc.length > 0 && (
						<div className='lg:col-span-1 hidden lg:block'>
							<div className='sticky top-24 bg-gray-50 rounded-xl p-6 border border-gray-100'>
								<h3 className='text-lg font-bold text-gray-900 mb-4 flex items-center gap-2'>
									<List size={20} className='text-blue-500' />{" "}
									{tUI("guideDetail.tocTitle")}
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
