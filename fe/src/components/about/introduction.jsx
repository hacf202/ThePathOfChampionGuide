// src/pages/Introduction.jsx
import { memo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PageTitle from "../common/PageTitle";
import SafeImage from "../common/SafeImage";
import { useTranslation } from "../../hooks/useTranslation"; // 🟢 Import Hook

function Introduction() {
	const { language, t } = useTranslation(); // 🟢 Khởi tạo Hook
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
					`${backendUrl}/api/champions?page=1&limit=1000`,
				);
				if (!response.ok)
					throw new Error(
						language === "vi" ? "Không thể tải dữ liệu" : "Failed to load data",
					);

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
	}, [language]);

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
				title={
					language === "vi"
						? "Giới thiệu về Guide POC"
						: "Introduction to Guide POC"
				}
				description='POC GUIDE - Wiki Path of Champions: Tier list, builds, relics...'
				type='website'
			/>
			<main className='min-h-screen bg-[var(--color-page-bg)] py-12'>
				<div className='max-w-[1200px] mx-auto px-4 sm:px-6'>
					{/* ==================== HERO ==================== */}
					<section className='text-center mb-16'>
						<h1 className='text-5xl sm:text-6xl font-bold text-[var(--color-text-primary)] mb-6'>
							{language === "vi" ? "Chào mừng đến " : "Welcome to "}
							<span className='text-[var(--color-primary-500)]'>POC GUIDE</span>
						</h1>
						<p className='text-xl text-[var(--color-text-secondary)] mx-auto leading-relaxed'>
							{language === "vi" ? (
								<>
									<strong>
										Con Đường Anh Hùng (Path of Champions) là một chế độ chơi
										roguelike
									</strong>{" "}
									độc đáo trong <i>Legends of Runeterra</i> – nơi mỗi lượt chơi
									là một hành trình mới, mỗi quyết định có thể thay đổi toàn bộ
									cuộc chiến.
								</>
							) : (
								<>
									<strong>Path of Champions is a unique roguelike mode</strong>{" "}
									in <i>Legends of Runeterra</i> – where every run is a new
									journey, and every decision can alter the entire battle.
								</>
							)}
						</p>
					</section>

					<section className='grid md:grid-cols-3 gap-8 mb-16'>
						<div className='bg-[var(--color-surface-bg)] p-6 rounded-xl border border-[var(--color-border)] text-center shadow-sm hover:shadow-md transition-shadow'>
							<div className='w-16 h-16 mx-auto mb-4 bg-red-500 rounded-full flex items-center justify-center text-white text-2xl font-bold'>
								1
							</div>
							<h3 className='text-xl font-bold text-[var(--color-text-primary)] mb-2'>
								{language === "vi" ? "Đường đi ngẫu nhiên" : "Random Paths"}
							</h3>
							<p className='text-[var(--color-text-secondary)]'>
								{language === "vi"
									? "Mỗi bản đồ được tạo ngẫu nhiên – không có 2 lượt chơi giống nhau."
									: "Every map is procedurally generated – no two runs are identical."}
							</p>
						</div>

						<div className='bg-[var(--color-surface-bg)] p-6 rounded-xl border border-[var(--color-border)] text-center shadow-sm hover:shadow-md transition-shadow'>
							<div className='w-16 h-16 mx-auto mb-4 bg-amber-500 rounded-full flex items-center justify-center text-white text-2xl font-bold'>
								2
							</div>
							<h3 className='text-xl font-bold text-[var(--color-text-primary)] mb-2'>
								{language === "vi" ? "Cổ vật & Sức mạnh" : "Relics & Powers"}
							</h3>
							<p className='text-[var(--color-text-secondary)]'>
								{language === "vi"
									? "Thu thập Relic và Power để biến tướng thường thành quái vật."
									: "Collect Relics and Powers to turn ordinary champions into monsters."}
							</p>
						</div>

						<div className='bg-[var(--color-surface-bg)] p-6 rounded-xl border border-[var(--color-border)] text-center shadow-sm hover:shadow-md transition-shadow'>
							<div className='w-16 h-16 mx-auto mb-4 bg-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold'>
								3
							</div>
							<h3 className='text-xl font-bold text-[var(--color-text-primary)] mb-2'>
								{language === "vi"
									? "7 Sao – Thử thách tối thượng"
									: "7 Stars – Ultimate Challenge"}
							</h3>
							<p className='text-[var(--color-text-secondary)]'>
								{language === "vi"
									? "Hoàn thành mọi boss, mọi ngã rẽ để đạt 7 sao cho mỗi tướng."
									: "Defeat all bosses and crossroads to reach 7 stars for each champion."}
							</p>
						</div>
					</section>

					{/* 10 TƯỚNG NGẪU NHIÊN */}
					<section className='mb-16'>
						<h2 className='text-3xl font-bold text-[var(--color-text-primary)] text-center mb-8'>
							{language === "vi" ? "Nhân vật nổi bật" : "Featured Champions"}
						</h2>

						{loading && (
							<div className='text-center py-12'>
								<div className='inline-block animate-spin w-10 h-10 border-4 border-[var(--color-primary-500)] border-t-transparent rounded-full'></div>
								<p className='mt-3 text-[var(--color-text-secondary)]'>
									{language === "vi" ? "Đang tải..." : "Loading..."}
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
									{language === "vi" ? "Tải lại" : "Retry"}
								</button>
							</div>
						)}

						{!loading && !error && champions.length === 0 && (
							<div className='text-center py-12 text-[var(--color-text-secondary)]'>
								<p>
									{language === "vi"
										? "Chưa có dữ liệu tướng."
										: "No champion data available."}
								</p>
							</div>
						)}

						{!loading && !error && champions.length > 0 && (
							<div className='grid sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6'>
								{champions.map(champ => {
									const region =
										champ.region || champ.regions?.[0] || "Unknown";

									// 🟢 Tự động dịch tên Tướng
									const champName = t(champ, "name") || champ.name;

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
											<h4 className='font-bold text-[var(--color-text-primary)] text-lg truncate group-hover:text-[var(--color-primary-500)] transition-colors'>
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
							{language === "vi" ? "Bắt đầu ngay!" : "Get Started!"}
						</h2>
						<div className='flex flex-col sm:flex-row gap-4 justify-center'>
							<Link
								to='/champions'
								className='px-8 py-3 bg-[var(--color-btn-secondary-bg)] text-[var(--color-btn-secondary-text)] border border-[var(--color-btn-secondary-border)] font-medium rounded-md hover:bg-[var(--color-btn-secondary-hover-bg)] transition-colors'
							>
								{language === "vi" ? "Xem Tất Cả Tướng" : "View All Champions"}
							</Link>
							<Link
								to='/guides'
								className='px-8 py-3 bg-[var(--color-btn-secondary-bg)] text-[var(--color-btn-secondary-text)] border border-[var(--color-btn-secondary-border)] font-medium rounded-md hover:bg-[var(--color-btn-secondary-hover-bg)] transition-colors'
							>
								{language === "vi" ? "Hướng Dẫn" : "Guides"}
							</Link>
						</div>
						<p className='mt-8 text-[var(--color-text-secondary)]'>
							<Link
								to='/'
								className='px-8 py-3 bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-text)] font-medium rounded-md hover:bg-[var(--color-btn-primary-hover-bg)] transition-colors'
							>
								{language === "vi" ? "Quay về Trang chủ" : "Back to Home"}
							</Link>
						</p>
					</section>
				</div>
			</main>
		</div>
	);
}

export default memo(Introduction);
