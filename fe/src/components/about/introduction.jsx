// src/pages/Introduction.jsx
import { memo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PageTitle from "../common/pageTitle";
import SafeImage from "../common/SafeImage";
import { useTranslation } from "../../hooks/useTranslation"; // 🟢 Import Hook

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
			<main className='min-h-screen bg-[var(--color-page-bg)] py-12'>
				<div className='max-w-[1200px] mx-auto px-4 sm:px-6'>
					{/* ==================== HERO ==================== */}
					<section className='text-center mb-16'>
						<h1 className='text-5xl sm:text-6xl font-bold text-[var(--color-text-primary)] mb-6'>
							{tUI("intro.welcome")}{" "}
							<span className='text-[var(--color-primary-500)]'>POC GUIDE</span>
						</h1>
						<p
							className='text-xl text-[var(--color-text-secondary)] mx-auto leading-relaxed'
							dangerouslySetInnerHTML={{ __html: tUI("intro.subtitle") }}
						/>
					</section>

					<section className='grid md:grid-cols-3 gap-8 mb-16'>
						<div className='bg-[var(--color-surface-bg)] p-6 rounded-xl border border-[var(--color-border)] text-center shadow-sm hover:shadow-md transition-shadow'>
							<div className='w-16 h-16 mx-auto mb-4 bg-red-500 rounded-full flex items-center justify-center text-white text-2xl font-bold'>
								1
							</div>
							<h3 className='text-xl font-bold text-[var(--color-text-primary)] mb-2'>
								{tUI("intro.card1Title")}
							</h3>
							<p className='text-[var(--color-text-secondary)]'>
								{tUI("intro.card1Desc")}
							</p>
						</div>

						<div className='bg-[var(--color-surface-bg)] p-6 rounded-xl border border-[var(--color-border)] text-center shadow-sm hover:shadow-md transition-shadow'>
							<div className='w-16 h-16 mx-auto mb-4 bg-amber-500 rounded-full flex items-center justify-center text-white text-2xl font-bold'>
								2
							</div>
							<h3 className='text-xl font-bold text-[var(--color-text-primary)] mb-2'>
								{tUI("intro.card2Title")}
							</h3>
							<p className='text-[var(--color-text-secondary)]'>
								{tUI("intro.card2Desc")}
							</p>
						</div>

						<div className='bg-[var(--color-surface-bg)] p-6 rounded-xl border border-[var(--color-border)] text-center shadow-sm hover:shadow-md transition-shadow'>
							<div className='w-16 h-16 mx-auto mb-4 bg-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold'>
								3
							</div>
							<h3 className='text-xl font-bold text-[var(--color-text-primary)] mb-2'>
								{tUI("intro.card3Title")}
							</h3>
							<p className='text-[var(--color-text-secondary)]'>
								{tUI("intro.card3Desc")}
							</p>
						</div>
					</section>

					{/* 10 TƯỚNG NGẪU NHIÊN */}
					<section className='mb-16'>
						<h2 className='text-3xl font-bold text-[var(--color-text-primary)] text-center mb-8'>
							{tUI("intro.featuredChampions")}
						</h2>

						{loading && (
							<div className='text-center py-12'>
								<div className='inline-block animate-spin w-10 h-10 border-4 border-[var(--color-primary-500)] border-t-transparent rounded-full'></div>
								<p className='mt-3 text-[var(--color-text-secondary)]'>
									{tUI("common.loading")}
								</p>
							</div>
						)}

						{error && (
							<div className='text-center py-12 text-[var(--color-danger-500)]'>
								<p>{error}</p>
								<button
									onClick={() => window.location.reload()}
									className='mt-3 px-5 py-2 bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-text)] rounded-md text-sm'
								>
									{tUI("common.retry")}
								</button>
							</div>
						)}

						{!loading && !error && champions.length === 0 && (
							<div className='text-center py-12 text-[var(--color-text-secondary)]'>
								<p>{tUI("intro.noData")}</p>
							</div>
						)}

						{!loading && !error && champions.length > 0 && (
							<div className='grid sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6'>
								{champions.map(champ => {
									const region =
										champ.region || champ.regions?.[0] || "Unknown";

									// 🟢 Dùng tDynamic để lấy đúng ngôn ngữ
									const champName = tDynamic(champ, "name") || champ.name;

									return (
										<Link
											key={champ.championID || champ.name}
											to={`/champion/${encodeURIComponent(champ.name)}`}
											className='group block bg-[var(--color-surface-bg)] p-5 rounded-xl border border-[var(--color-border)] text-center hover:border-[var(--color-primary-500)] hover:shadow-lg transition-all'
										>
											<div className='w-20 h-20 mx-auto mb-3 rounded-full overflow-hidden shadow-md group-hover:scale-110 transition-transform duration-300'>
												<SafeImage
													src={champ.avatarUrl || "/fallback-image.svg"}
													alt={champName}
													className='w-full h-full object-cover'
													loading='lazy'
												/>
											</div>
											<h4 className='font-bold text-[var(--color-text-primary)] text-lg truncate group-hover:text-[var(--color-primary-500)]  '>
												{champName}
											</h4>
											<p className='text-sm text-[var(--color-text-secondary)] mt-1'>
												{region}
											</p>
										</Link>
									);
								})}
							</div>
						)}
					</section>

					{/* CTA */}
					<section className='text-center'>
						<h2 className='text-3xl font-bold text-[var(--color-text-primary)] mb-6'>
							{tUI("intro.getStarted")}
						</h2>
						<div className='flex flex-col sm:flex-row gap-4 justify-center'>
							<Link
								to='/champions'
								className='px-8 py-3 bg-[var(--color-btn-secondary-bg)] text-[var(--color-btn-secondary-text)] border border-[var(--color-btn-secondary-border)] font-medium rounded-md hover:bg-[var(--color-btn-secondary-hover-bg)]  '
							>
								{tUI("intro.viewAll")}
							</Link>
							<Link
								to='/guides'
								className='px-8 py-3 bg-[var(--color-btn-secondary-bg)] text-[var(--color-btn-secondary-text)] border border-[var(--color-btn-secondary-border)] font-medium rounded-md hover:bg-[var(--color-btn-secondary-hover-bg)]  '
							>
								{tUI("intro.guides")}
							</Link>
						</div>
						<p className='mt-8 text-[var(--color-text-secondary)]'>
							<Link
								to='/'
								className='px-8 py-3 bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-text)] font-medium rounded-md hover:bg-[var(--color-btn-primary-hover-bg)]  '
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
