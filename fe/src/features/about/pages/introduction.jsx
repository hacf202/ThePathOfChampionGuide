// src/pages/Introduction.jsx
import { memo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PageTitle from "@/components/common/pageTitle";
import SafeImage from "@/components/common/SafeImage";
import { useTranslation } from "@/hooks/useTranslation"; // 🟢 Import Hook
import { generateSlug } from "@/utils/slugify";

function Introduction() {
	const { tUI, tDynamic } = useTranslation(); // 🟢 Sử dụng tUI và tDynamic
	const [champions, setChampions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// === GỌI API & LẤY 10 TƯỚNG NGẪU NHIÊN ===
	useEffect(() => {
		const fetchRandomChampions = async () => {
			try {
				setLoading(true);
				setError(null);

				const backendUrl = import.meta.env.VITE_API_URL;
				const response = await fetch(
					`${backendUrl}/api/champions?page=1&limit=-1`,
				);
				if (!response.ok) throw new Error(tUI("common.error"));

				const allData = await response.json();
				const allChampions = allData.items || allData || [];

				if (!Array.isArray(allChampions) || allChampions.length === 0) {
					setChampions([]);
					return;
				}

				// Format + thêm avatarUrl nếu chưa có
				const formatted = allChampions.map(champ => ({
					...champ,
					avatarUrl: champ.assets?.[0]?.avatar || null,
				}));

				const shuffled = [...formatted].sort(() => 0.5 - Math.random());
				setChampions(shuffled.slice(0, 10));
			} catch (err) {
				console.error("Lỗi:", err);
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};

		fetchRandomChampions();
	}, [tUI]);

	// === MÀU THEO KHU VỰC ===
	const getRegionColor = region => {
		const map = {
			Piltover: "bg-pink-500",
			Demacia: "bg-yellow-400",
			Ionia: "bg-indigo-500",
			Noxus: "bg-red-600",
			Shurima: "bg-amber-600",
			Freljord: "bg-cyan-500",
			Bilgewater: "bg-teal-500",
			Targon: "bg-purple-600",
			"Shadow Isles": "bg-gray-700",
			ShadowIsles: "bg-gray-700",
			"Bandle City": "bg-lime-500",
			BandleCity: "bg-lime-500",
		};
		return map[region] || "bg-gray-500";
	};

	return (
		<div>
			<PageTitle
				title={tUI("intro.pageTitle")}
				description='POC GUIDE - Wiki Path of Champions: Tier list, builds, relics...'
				type='website'
			/>
			<main className='min-h-screen bg-[var(--tactical-page-bg)] py-12 text-text-primary'>
				<div className='max-w-[1200px] mx-auto px-4 sm:px-6'>
					{/* ==================== HERO ==================== */}
					<section className='text-center mb-16'>
						<div className="inline-flex items-center gap-2 px-3 py-1 clip-chamfer-sm bg-[var(--tactical-accent-lime)]/10 text-[var(--tactical-accent-lime)] text-xs font-mono-tech font-bold uppercase tracking-widest mb-4 border border-[var(--tactical-accent-lime)]/30">
							TACTICAL SYSTEM // ARCHIVE
						</div>
						<h1 className='text-4xl sm:text-6xl font-black font-display uppercase tracking-tight text-text-primary mb-4'>
							{tUI("intro.welcome")}{" "}
							<span className='text-[var(--tactical-accent-lime)] drop-shadow-[0_0_15px_rgba(210,255,40,0.3)]'>POC GUIDE</span>
						</h1>
						<p
							className='text-base sm:text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed'
							dangerouslySetInnerHTML={{ __html: tUI("intro.subtitle") }}
						/>
					</section>

					<section className='grid md:grid-cols-3 gap-6 mb-16'>
						<div className='tactical-card clip-chamfer bg-[var(--tactical-card-bg)] p-6 border border-[var(--tactical-card-border)] text-center shadow-lg hover:border-[var(--tactical-accent-lime)] hover:shadow-[0_0_15px_rgba(210,255,40,0.15)] transition-all'>
							<div className='w-12 h-12 mx-auto mb-4 clip-chamfer-sm bg-[var(--tactical-accent-lime)] text-[var(--tactical-accent-lime-fg)] font-mono-tech flex items-center justify-center text-xl font-bold shadow-[0_0_10px_rgba(210,255,40,0.3)]'>
								01
							</div>
							<h3 className='text-lg font-bold font-display uppercase tracking-wider text-text-primary mb-2'>
								{tUI("intro.card1Title")}
							</h3>
							<p className='text-sm text-text-secondary leading-relaxed'>
								{tUI("intro.card1Desc")}
							</p>
						</div>

						<div className='tactical-card clip-chamfer bg-[var(--tactical-card-bg)] p-6 border border-[var(--tactical-card-border)] text-center shadow-lg hover:border-[var(--tactical-accent-cyan)] hover:shadow-[0_0_15px_rgba(0,245,212,0.15)] transition-all'>
							<div className='w-12 h-12 mx-auto mb-4 clip-chamfer-sm bg-[var(--tactical-accent-cyan)] text-[var(--tactical-accent-cyan-fg)] font-mono-tech flex items-center justify-center text-xl font-bold shadow-[0_0_10px_rgba(0,245,212,0.3)]'>
								02
							</div>
							<h3 className='text-lg font-bold font-display uppercase tracking-wider text-text-primary mb-2'>
								{tUI("intro.card2Title")}
							</h3>
							<p className='text-sm text-text-secondary leading-relaxed'>
								{tUI("intro.card2Desc")}
							</p>
						</div>

						<div className='tactical-card clip-chamfer bg-[var(--tactical-card-bg)] p-6 border border-[var(--tactical-card-border)] text-center shadow-lg hover:border-[var(--tactical-accent-lime)] hover:shadow-[0_0_15px_rgba(210,255,40,0.15)] transition-all'>
							<div className='w-12 h-12 mx-auto mb-4 clip-chamfer-sm bg-[var(--tactical-accent-lime)] text-[var(--tactical-accent-lime-fg)] font-mono-tech flex items-center justify-center text-xl font-bold shadow-[0_0_10px_rgba(210,255,40,0.3)]'>
								03
							</div>
							<h3 className='text-lg font-bold font-display uppercase tracking-wider text-text-primary mb-2'>
								{tUI("intro.card3Title")}
							</h3>
							<p className='text-sm text-text-secondary leading-relaxed'>
								{tUI("intro.card3Desc")}
							</p>
						</div>
					</section>

					{/* 10 TƯỚNG NGẪU NHIÊN */}
					<section className='mb-16'>
						<div className='flex items-center justify-center gap-3 mb-8'>
							<div className='w-1.5 h-6 bg-[var(--tactical-accent-lime)] shadow-[0_0_8px_var(--tactical-accent-lime)]' />
							<h2 className='text-2xl sm:text-3xl font-bold font-display uppercase tracking-wider text-text-primary text-center'>
								{tUI("intro.featuredChampions")}
							</h2>
						</div>

						{loading && (
							<div className='text-center py-12'>
								<div className='inline-block animate-spin w-10 h-10 border-2 border-[var(--tactical-accent-lime)] border-t-transparent rounded-full'></div>
								<p className='mt-3 font-mono-tech text-xs text-text-secondary'>
									{tUI("common.loading")}
								</p>
							</div>
						)}

						{error && (
							<div className='text-center py-12 text-red-400 font-mono-tech text-sm'>
								<p>{error}</p>
								<button
									onClick={() => window.location.reload()}
									className='mt-3 px-5 py-2 clip-chamfer-sm border border-[var(--tactical-card-border)] bg-[var(--tactical-inner-box)] text-[var(--tactical-accent-lime)] hover:border-[var(--tactical-accent-lime)] text-xs font-mono-tech uppercase font-bold'
								>
									{tUI("common.retry")}
								</button>
							</div>
						)}

						{!loading && !error && champions.length === 0 && (
							<div className='text-center py-12 text-text-secondary font-mono-tech text-sm'>
								<p>{tUI("intro.noData")}</p>
							</div>
						)}

						{!loading && !error && champions.length > 0 && (
							<div className='grid sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6'>
								{champions.map(champ => {
									const region =
										champ.region || champ.regions?.[0] || "Unknown";

									// 🟢 Dùng tDynamic để lấy đúng ngôn ngữ
									const champName = tDynamic(champ, "name") || champ.name;

									return (
										<Link
											key={champ.championID || champ.name}
											to={`/champion/${generateSlug(champ.translations?.en?.name || champ.name)}`}
											className='tactical-card clip-chamfer group block bg-[var(--tactical-card-bg)] p-5 border border-[var(--tactical-card-border)] text-center hover:border-[var(--tactical-accent-lime)] hover:shadow-[0_0_15px_rgba(210,255,40,0.15)] transition-all'
										>
											<div className='w-20 h-20 mx-auto mb-3 clip-chamfer-sm overflow-hidden border border-[var(--tactical-card-border)] bg-black/30 group-hover:scale-105 transition-transform duration-300'>
												<SafeImage
													src={champ.avatarUrl || "/fallback-image.svg"}
													alt={champName}
													className='w-full h-full object-cover'
													loading='lazy'
												/>
											</div>
											<h4 className='font-display font-bold uppercase tracking-wide text-text-primary text-base truncate group-hover:text-[var(--tactical-accent-lime)] transition-colors'>
												{champName}
											</h4>
											<p className='font-mono-tech text-xs text-[var(--tactical-accent-lime)] mt-1 uppercase'>
												{region}
											</p>
										</Link>
									);
								})}
							</div>
						)}
					</section>

					{/* CTA */}
					<section className='text-center pt-4'>
						<h2 className='text-2xl sm:text-3xl font-bold font-display uppercase tracking-wider text-text-primary mb-6'>
							{tUI("intro.getStarted")}
						</h2>
						<div className='flex flex-col sm:flex-row gap-4 justify-center'>
							<Link
								to='/champions'
								className='px-8 py-3 clip-chamfer-sm font-mono-tech uppercase font-bold text-xs tracking-wider border border-[var(--tactical-card-border)] bg-[var(--tactical-inner-box)] text-text-primary hover:border-[var(--tactical-accent-lime)] hover:text-[var(--tactical-accent-lime)] transition-all'
							>
								{tUI("intro.viewAll")}
							</Link>
							<Link
								to='/guides'
								className='px-8 py-3 clip-chamfer-sm font-mono-tech uppercase font-bold text-xs tracking-wider border border-[var(--tactical-card-border)] bg-[var(--tactical-inner-box)] text-text-primary hover:border-[var(--tactical-accent-cyan)] hover:text-[var(--tactical-accent-cyan)] transition-all'
							>
								{tUI("intro.guides")}
							</Link>
						</div>
						<p className='mt-8'>
							<Link
								to='/'
								className='inline-block px-8 py-3 clip-chamfer-sm font-mono-tech uppercase font-bold text-xs tracking-wider bg-[var(--tactical-accent-lime)] text-[var(--tactical-accent-lime-fg)] shadow-[0_0_12px_rgba(210,255,40,0.3)] hover:brightness-110 transition-all'
							>
								{tUI("common.backToHome")}
							</Link>
						</p>
					</section>
				</div>
			</main>
		</div>
	);
}

export default memo(Introduction);
