import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Calendar, Eye, ArrowRight, BookOpen, Search, PenTool, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "../hooks/useTranslation";
import PageTitle from "../components/common/pageTitle";
import { removeAccents } from "../utils/vietnameseUtils";

// ── Guide Card ────────────────────────────────────────────────
const GuideCard = ({ guide }) => {
	const { t, tUI } = useTranslation();
	const title = t(guide, "title") || guide.title;
	const description = t(guide, "description") || guide.description;

	return (
		<Link
			to={`/guides/${guide.slug}`}
			className='group bg-surface-bg rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-lg hover:border-primary-500/40 transition-all duration-300 flex flex-col'
		>
			{/* Thumbnail */}
			<div className='h-48 bg-surface-hover/30 overflow-hidden relative'>
				{guide.thumbnail ? (
					<img
						src={guide.thumbnail}
						alt={title}
						className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
						loading='lazy'
					/>
				) : (
					<div className='w-full h-full flex items-center justify-center'>
						<BookOpen size={48} className='text-text-tertiary/30' />
					</div>
				)}
				{/* Author badge */}
				{guide.author && (
					<div className='absolute bottom-2 left-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs font-medium'>
						<PenTool size={11} />
						{guide.author}
					</div>
				)}
			</div>

			{/* Body */}
			<div className='p-5 flex-1 flex flex-col gap-3'>
				<h2 className='text-base font-bold text-text-primary line-clamp-2 group-hover:text-primary-500 transition-colors leading-snug'>
					{title}
				</h2>

				{description && (
					<p className='text-sm text-text-secondary line-clamp-2 leading-relaxed'>
						{description}
					</p>
				)}

				{/* Meta */}
				<div className='flex items-center gap-4 text-xs text-text-tertiary mt-auto pt-3 border-t border-border'>
					{guide.publishedDate && (
						<span className='flex items-center gap-1'>
							<Calendar size={12} />
							{guide.publishedDate}
						</span>
					)}
					<span className='flex items-center gap-1'>
						<Eye size={12} />
						{(guide.views || 0).toLocaleString()} {tUI("common.views")}
					</span>
					<span className='ml-auto flex items-center gap-1 text-primary-500 font-semibold group-hover:gap-2 transition-all'>
						{tUI("guideList.readMore")} <ArrowRight size={13} />
					</span>
				</div>
			</div>
		</Link>
	);
};


// ── Main Page ─────────────────────────────────────────────────
const GuideList = () => {
	const [guides, setGuides] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [search, setSearch] = useState("");
	const { tUI } = useTranslation();

	useEffect(() => {
		const fetchGuides = async () => {
			setLoading(true);
			setError(null);
			try {
				const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/guides`);
				if (res.data.success) setGuides(res.data.data);
			} catch (err) {
				console.error("Lỗi tải guides:", err);
				setError(err.message || tUI("common.error"));
			} finally {
				setLoading(false);
			}
		};
		fetchGuides();
	}, []);

	const filtered = useMemo(() => {
		if (!search.trim()) return guides;
		const q = removeAccents(search);
		return guides.filter(g =>
			removeAccents(g.title || "").includes(q) ||
			removeAccents(g.description || "").includes(q) ||
			removeAccents(g.author || "").includes(q),
		);
	}, [guides, search]);

	// ── Loading ──
	if (loading)
		return (
			<div className='flex flex-col items-center justify-center min-h-[50vh] gap-4'>
				<div className='w-10 h-10 rounded-full border-2 border-primary-500 border-t-transparent animate-spin' />
				<p className='text-text-secondary text-sm'>{tUI("common.loading")}</p>
			</div>
		);

	// ── Error ──
	if (error)
		return (
			<div className='text-center py-20'>
				<p className='text-red-500 font-medium'>{error}</p>
			</div>
		);

	return (
		<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10'>
			<PageTitle title={tUI("guideList.pageTitle")} />

			{/* ── Hero header ── */}
			<div className='mb-10 text-center'>
				<div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 text-primary-500 text-xs font-bold uppercase tracking-widest mb-4'>
					<BookOpen size={13} />
					{tUI("guideList.pageTitle")}
				</div>
				<h1 className='text-3xl md:text-4xl font-extrabold text-text-primary mb-3 leading-tight'>
					{tUI("guideList.heading")}
				</h1>
				<p className='text-text-secondary max-w-xl mx-auto'>
					{tUI("guideList.description")}
				</p>
			</div>

			{/* ── Search ── */}
			<div className='relative max-w-md mx-auto mb-8'>
				<Search size={16} className='absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary' />
				<input
					type='text'
					value={search}
					onChange={e => setSearch(e.target.value)}
					placeholder='Tìm kiếm bài viết...'
					className='w-full pl-9 pr-9 py-2.5 rounded-xl border border-border bg-surface-bg text-text-primary placeholder-text-tertiary text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition'
				/>
				{search && (
					<button
						onClick={() => setSearch("")}
						className='absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors'
					>
						<X size={14} />
					</button>
				)}
			</div>

			{/* ── Stats bar ── */}
			{search && (
				<p className='text-center text-sm text-text-tertiary mb-6'>
					Tìm thấy <strong className='text-text-primary'>{filtered.length}</strong> bài viết
					{search && <> cho "<span className='text-primary-500'>{search}</span>"</>}
				</p>
			)}

			{/* ── Grid ── */}
			{filtered.length === 0 ? (
				<div className='col-span-full text-center py-20'>
					<BookOpen size={48} className='mx-auto mb-4 text-text-tertiary/30' />
					<p className='text-text-secondary italic'>
						{search ? "Không tìm thấy bài viết phù hợp." : tUI("guideList.noGuides")}
					</p>
				</div>
			) : (
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
					{filtered.map(guide => (
						<GuideCard key={guide._id || guide.slug} guide={guide} />
					))}
				</div>
			)}
		</div>
	);
};

export default GuideList;
