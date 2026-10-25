import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Eye, Calendar, PenTool, ArrowLeft, Home, List } from "lucide-react";
import axios from "axios";
import PageTitle from "@/components/common/pageTitle.jsx";
import Button from "@/components/common/button.jsx";
import GuideContent from "@/features/guides/components/guideContent.jsx";
import { removeAccents } from "@/utils/vietnameseUtils.js";

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
			<div className='text-center py-20 min-h-screen bg-page-bg'>
				<h2 className='text-2xl font-bold mb-4 text-danger-500'>Lỗi dữ liệu</h2>
				<p className='mb-6 text-text-secondary'>{error}</p>
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
		<div className='min-h-screen bg-[var(--tactical-page-bg)] pb-12'>
			<PageTitle
				title={`${guide.title} | Hướng dẫn PoC`}
				description={guide.title}
				keywords={`${guide.title}, hướng dẫn con đường anh hùng, lor pve guide, cẩm nang Path of Champions, the path of champions guide`}
				type='article'
			/>

			<header className='tactical-panel border-b border-[var(--tactical-card-border)] bg-[var(--tactical-panel-bg)]'>
				<div className='container mx-auto px-4 py-8 max-w-[1200px]'>
					<Button
						variant='outline'
						onClick={() => navigate("/guides")}
						iconLeft={<ArrowLeft size={16} />}
						className='mb-6 font-mono-tech uppercase text-xs tracking-wider border-[var(--tactical-card-border)] hover:border-[var(--tactical-accent-lime)] text-[var(--tactical-accent-lime)] clip-chamfer-sm'
					>
						Quay lại danh sách
					</Button>

					<div className='flex items-center gap-3 mb-3'>
						<div className='w-1 h-6 bg-[var(--tactical-accent-lime)] shadow-[0_0_8px_var(--tactical-accent-lime)]' />
						<span className='font-mono-tech text-xs uppercase tracking-widest text-[var(--tactical-accent-lime)] font-bold'>
							TACTICAL DOSSIER // GUIDE
						</span>
					</div>

					<h1 className='text-3xl md:text-5xl font-extrabold font-display uppercase tracking-tight leading-tight mb-4 text-text-primary'>
						{guide.title}
					</h1>

					<div className='flex flex-wrap items-center gap-4 text-sm font-mono-tech text-text-secondary border-t border-[var(--tactical-card-border)] pt-4'>
						<span className='flex items-center gap-1.5'>
							<Calendar size={16} className='text-[var(--tactical-accent-lime)]' /> Xuất bản: {guide.publishedDate}
						</span>
						<span className='flex items-center gap-1.5'>
							<Eye size={16} className='text-[var(--tactical-accent-lime)]' /> {guide.views || 0} lượt xem
						</span>
						{guide.author && (
							<span className='px-2.5 py-0.5 clip-chamfer-sm bg-[var(--tactical-inner-box)] text-[var(--tactical-accent-lime)] text-xs font-bold flex items-center gap-1.5 border border-[var(--tactical-card-border)]'>
								<PenTool size={14} /> {guide.author}
							</span>
						)}
					</div>
				</div>
			</header>

			<main className='container mx-auto px-4 py-8 max-w-[1200px]'>
				<article className='p-4 md:p-8 tactical-panel clip-chamfer border border-[var(--tactical-card-border)] bg-[var(--tactical-panel-bg)] shadow-2xl'>
					<div className='mb-8 clip-chamfer overflow-hidden border border-[var(--tactical-card-border)] shadow-xl'>
						<img
							src={guide.thumbnail}
							alt={guide.title}
							className='w-full h-auto object-cover max-h-[450px]'
						/>
					</div>

					{/* PHẦN TÓM LƯỢC NỘI DUNG (TABLE OF CONTENTS) */}
					{sections.length > 0 && (
						<div className='mb-10 p-5 md:p-7 tactical-box clip-chamfer-sm border border-[var(--tactical-card-border)] bg-[var(--tactical-inner-box)]'>
							<div className='flex items-center gap-3 mb-4 text-text-primary border-b pb-3 border-[var(--tactical-card-border)]'>
								<div className='w-1 h-5 bg-[var(--tactical-accent-lime)] shadow-[0_0_8px_var(--tactical-accent-lime)]' />
								<List className='text-[var(--tactical-accent-lime)]' size={22} />
								<h3 className='text-lg font-bold font-display uppercase tracking-wider text-[var(--tactical-accent-lime)]'>Tóm tắt nội dung</h3>
							</div>
							<nav>
								<ul className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 font-mono-tech'>
									{sections.map((section, index) => (
										<li key={index} className='flex items-start gap-2 group'>
											<span className='text-[var(--tactical-accent-lime)] font-bold mt-0.5 text-sm'>
												{index + 1}.
											</span>
											<a
												href={`#${removeAccents(section.title)}`}
												onClick={e => handleScrollToSection(e, section.title)}
												className='text-text-secondary hover:text-[var(--tactical-accent-lime)] hover:underline transition-colors font-medium decoration-[var(--tactical-accent-lime)]/40 text-sm'
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
					<section className='mt-16 border-t border-[var(--tactical-card-border)] pt-10'>
						<div className='flex items-center gap-3 mb-8'>
							<div className='w-1 h-6 bg-[var(--tactical-accent-cyan)] shadow-[0_0_8px_var(--tactical-accent-cyan)]' />
							<h3 className='text-2xl font-bold font-display uppercase tracking-wider text-[var(--tactical-accent-cyan)]'>
								Có thể bạn quan tâm
							</h3>
						</div>

						<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
							{relatedGuides.map(item => (
								<Link
									to={`/guides/${item.slug}`}
									key={item.slug}
									className='tactical-card clip-chamfer group bg-[var(--tactical-card-bg)] hover:border-[var(--tactical-accent-cyan)] hover:shadow-[0_0_15px_rgba(0,245,212,0.15)] transition-all border border-[var(--tactical-card-border)] overflow-hidden flex flex-col'
								>
									<div className='h-44 overflow-hidden border-b border-[var(--tactical-card-border)]'>
										<img
											src={item.thumbnail}
											alt={item.title}
											className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
										/>
									</div>
									<div className='p-4 flex-1 flex flex-col justify-between'>
										<h4 className='font-bold font-display uppercase tracking-wide text-text-primary line-clamp-2 group-hover:text-[var(--tactical-accent-cyan)] transition-colors'>
											{item.title}
										</h4>
										<div className='mt-3 flex items-center font-mono-tech text-xs text-text-secondary gap-3 pt-2 border-t border-[var(--tactical-card-border)]'>
											<span className='flex items-center gap-1'>
												<Calendar size={14} className='text-[var(--tactical-accent-cyan)]' /> {item.publishedDate}
											</span>
											<span className='flex items-center gap-1'>
												<Eye size={14} className='text-[var(--tactical-accent-cyan)]' /> {item.views || 0}
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
