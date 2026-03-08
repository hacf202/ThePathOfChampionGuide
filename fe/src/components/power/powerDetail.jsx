// src/pages/powerDetail.jsx
import { memo, useState, useEffect, useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ChevronLeft, XCircle } from "lucide-react";
import PageTitle from "../common/pageTitle";
import Button from "../common/button";
import SafeImage from "../common/SafeImage";
import { useTranslation } from "../../hooks/useTranslation";

// --- THÀNH PHẦN SKELETON LOADING ---
const PowerDetailSkeleton = () => (
	<div className='max-w-[1200px] mx-auto p-0 sm:p-6 animate-pulse font-secondary'>
		<div className='h-10 w-24 bg-gray-700/50 rounded mb-4 ml-4 sm:ml-0' />
		<div className='bg-surface-bg border border-border rounded-lg p-4 sm:p-6 space-y-8'>
			<div className='flex flex-col md:flex-row gap-6'>
				<div className='w-full md:w-[300px] aspect-square bg-gray-700/50 rounded-lg' />
				<div className='flex-1 space-y-4'>
					<div className='h-16 w-full bg-gray-700/50 rounded-lg' />
					<div className='h-48 w-full bg-gray-700/50 rounded-lg' />
				</div>
			</div>
			<div className='space-y-4'>
				<div className='h-8 w-60 bg-gray-700/50 rounded' />
				<div className='grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4'>
					{[...Array(5)].map((_, i) => (
						<div key={i} className='h-32 bg-gray-700/30 rounded-lg' />
					))}
				</div>
			</div>
		</div>
	</div>
);

function PowerDetail() {
	const { powerCode } = useParams();
	const navigate = useNavigate();
	const { language, t } = useTranslation();

	const [power, setPower] = useState(null);
	const [champions, setChampions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const apiUrl = import.meta.env.VITE_API_URL;

	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);
				setError(null);
				const decodedCode = decodeURIComponent(powerCode);

				const [powerRes, championsRes] = await Promise.all([
					fetch(`${apiUrl}/api/powers/${encodeURIComponent(decodedCode)}`),
					fetch(`${apiUrl}/api/champions?limit=-1`),
				]);

				if (!powerRes.ok) {
					throw new Error(
						powerRes.status === 404
							? language === "vi"
								? `Không tìm thấy sức mạnh mã: ${decodedCode}`
								: `Power code not found: ${decodedCode}`
							: language === "vi"
								? "Lỗi tải thông tin sức mạnh."
								: "Error loading power information.",
					);
				}

				const foundPower = await powerRes.json();
				const championsData = championsRes.ok
					? await championsRes.json()
					: { items: [] };

				setPower(foundPower);
				setChampions(championsData.items || []);
			} catch (err) {
				setError(
					err.message ||
						(language === "vi"
							? "Đã xảy ra lỗi khi tải dữ liệu."
							: "An error occurred while loading data."),
				);
			} finally {
				setTimeout(() => setLoading(false), 800);
			}
		};

		if (powerCode) fetchData();
	}, [powerCode, apiUrl, language]);

	const powerName = power ? t(power, "name") : "";
	const powerDesc = power
		? t(power, "descriptionRaw") || t(power, "description")
		: "";

	// 🟢 FIX TÌM TƯỚNG TƯƠNG THÍCH (Bao phủ cả ID mới và Tên cũ, chống crash mảng)
	const compatibleChampions = useMemo(() => {
		if (!power || !champions.length) return [];
		return champions
			.filter(champion => {
				const powerCodeStr = String(power.powerCode);
				const pName = power.name;

				const advPowers =
					champion.adventurePowerIds || champion.adventurePowers || [];
				const starPowers = champion.powerStarIds || champion.powerStars || [];

				const hasAdv =
					Array.isArray(advPowers) &&
					advPowers.some(p => String(p) === powerCodeStr || p === pName);
				const hasStar =
					Array.isArray(starPowers) &&
					starPowers.some(p => String(p) === powerCodeStr || p === pName);

				return hasAdv || hasStar;
			})
			.map(champ => ({
				id: champ.championID || champ.name, // Fallback an toàn
				name: t(champ, "name"),
				image: champ.assets?.[0]?.avatar || "/fallback-image.svg",
			}));
	}, [power, champions, t]);

	if (error)
		return (
			<div className='p-10 text-center font-secondary'>
				<div className='bg-surface-hover p-8 rounded-lg border border-border inline-block'>
					<XCircle size={48} className='mx-auto mb-4 text-red-500 opacity-50' />
					<p className='text-xl font-bold text-red-500'>
						{language === "vi" ? "Lỗi:" : "Error:"} {error}
					</p>
					<Button onClick={() => navigate(-1)} className='mt-6 mx-auto'>
						<ChevronLeft size={18} /> {language === "vi" ? "Quay lại" : "Back"}
					</Button>
				</div>
			</div>
		);

	return (
		<div className='animate-fadeIn'>
			<PageTitle
				title={
					powerName ||
					(language === "vi" ? "Chi tiết sức mạnh" : "Power Details")
				}
				description={
					language === "vi"
						? `Chi tiết sức mạnh ${powerName}`
						: `Power details for ${powerName}`
				}
				type='article'
			/>

			<AnimatePresence mode='wait'>
				{loading ? (
					<motion.div
						key='skeleton'
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
					>
						<PowerDetailSkeleton />
					</motion.div>
				) : (
					<motion.div
						key='content'
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						transition={{ duration: 0.3 }}
						className='max-w-[1200px] mx-auto p-0 sm:p-6 text-text-primary font-secondary'
					>
						<Button
							variant='outline'
							onClick={() => navigate(-1)}
							className='mb-4 ml-4 sm:ml-0'
						>
							<ChevronLeft size={18} />{" "}
							{language === "vi" ? "Quay lại" : "Back"}
						</Button>

						<div className='relative mx-auto max-w-[1200px] border border-border p-4 sm:p-6 rounded-lg bg-surface-bg shadow-sm'>
							<div className='flex flex-col md:flex-row gap-4 rounded-md p-2 bg-surface-hover'>
								<SafeImage
									className='h-auto max-h-[300px] object-contain rounded-lg bg-surface-bg/50 p-2'
									src={power.assetAbsolutePath || "/fallback-image.svg"}
									alt={powerName}
								/>
								<div className='flex-1 flex flex-col'>
									<div className='flex flex-col border border-border sm:flex-row sm:justify-between rounded-lg p-2 text-2xl sm:text-4xl font-bold m-1 bg-surface-bg shadow-sm'>
										<h1 className='font-primary'>{powerName}</h1>
										<h1 className='font-primary text-primary-500 uppercase'>
											{power.rarity}
										</h1>
									</div>
									{powerDesc && (
										<div className='flex-1 mt-4'>
											<div
												className='text-base sm:text-xl rounded-lg p-4 h-full min-h-[120px] leading-relaxed bg-surface-bg border text-text-secondary overflow-y-auto'
												dangerouslySetInnerHTML={{ __html: powerDesc }}
											/>
										</div>
									)}
								</div>
							</div>

							<h2 className='text-xl sm:text-3xl font-semibold mt-8 mb-4 font-primary'>
								{language === "vi"
									? "Các tướng sử dụng sức mạnh này"
									: "Champions using this power"}
							</h2>

							{compatibleChampions.length > 0 ? (
								<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 rounded-md bg-surface-hover p-4 border border-border'>
									{compatibleChampions.map(champ => (
										<Link
											key={champ.id}
											to={`/champion/${encodeURIComponent(champ.id)}`}
											className='group rounded-lg p-2 transition-all hover:shadow-lg hover:scale-105 bg-surface-bg border border-border text-center'
										>
											<SafeImage
												className='w-full max-w-[100px] h-auto mx-auto rounded-full object-cover border-2 border-border group-hover:border-primary-500'
												src={champ.image}
												alt={champ.name}
											/>
											<h3 className='text-base font-semibold mt-3 text-text-primary group-hover:text-primary-500'>
												{champ.name}
											</h3>
										</Link>
									))}
								</div>
							) : (
								<div className='text-center p-8 rounded-md bg-surface-hover text-text-secondary border border-dashed border-border'>
									<p className='text-lg'>
										{language === "vi"
											? "Hiện không có tướng nào trang bị sức mạnh này mặc định."
											: "No champions currently equip this power by default."}
									</p>
								</div>
							)}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

export default memo(PowerDetail);
