// src/pages/runeDetail.jsx
import { memo, useState, useEffect, useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ChevronLeft, XCircle } from "lucide-react";
import PageTitle from "../common/pageTitle";
import Button from "../common/button";
import SafeImage from "../common/SafeImage";
import { useTranslation } from "../../hooks/useTranslation";

// --- THÀNH PHẦN SKELETON LOADING ---
const RuneDetailSkeleton = () => (
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

function RuneDetail() {
	const { runeCode } = useParams();
	const navigate = useNavigate();
	const { language, t } = useTranslation();

	const [rune, setRune] = useState(null);
	const [champions, setChampions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const apiUrl = import.meta.env.VITE_API_URL;

	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);
				setError(null);
				const decodedCode = decodeURIComponent(runeCode);

				const [runeRes, championsRes] = await Promise.all([
					fetch(`${apiUrl}/api/runes/${encodeURIComponent(decodedCode)}`),
					fetch(`${apiUrl}/api/champions?limit=-1`),
				]);

				if (!runeRes.ok) {
					throw new Error(
						runeRes.status === 404
							? language === "vi"
								? `Không tìm thấy ngọc bổ trợ mã: ${decodedCode}`
								: `Rune code not found: ${decodedCode}`
							: language === "vi"
								? "Lỗi tải thông tin ngọc bổ trợ."
								: "Error loading rune information.",
					);
				}

				const foundRune = await runeRes.json();
				const championsData = championsRes.ok
					? await championsRes.json()
					: { items: [] };

				setRune(foundRune);
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

		if (runeCode) fetchData();
	}, [runeCode, apiUrl, language]);

	const runeName = rune ? t(rune, "name") : "";
	const runeDesc = rune
		? t(rune, "descriptionRaw") || t(rune, "description")
		: "";

	// 🟢 FIX TÌM TƯỚNG TƯƠNG THÍCH (Bao phủ cả ID mới và Tên cũ, chống crash mảng)
	const compatibleChampions = useMemo(() => {
		if (!rune || !champions.length) return [];
		return champions
			.filter(champion => {
				const runeCodeStr = String(rune.runeCode);
				const rName = rune.name;

				const runesList = champion.runeIds || champion.runes || [];

				return (
					Array.isArray(runesList) &&
					runesList.some(r => String(r) === runeCodeStr || r === rName)
				);
			})
			.map(champ => ({
				id: champ.championID || champ.name, // Fallback an toàn
				name: t(champ, "name"),
				image: champ.assets?.[0]?.avatar || "/fallback-image.svg",
			}));
	}, [rune, champions, t]);

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
					runeName ||
					(language === "vi" ? "Chi tiết ngọc bổ trợ" : "Rune Details")
				}
				description={
					language === "vi"
						? `Chi tiết ngọc bổ trợ ${runeName}`
						: `Rune details for ${runeName}`
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
						<RuneDetailSkeleton />
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
									src={rune.assetAbsolutePath || "/fallback-image.svg"}
									alt={runeName}
								/>
								<div className='flex-1 flex flex-col'>
									<div className='flex flex-col border border-border sm:flex-row sm:justify-between rounded-lg p-2 text-2xl sm:text-4xl font-bold m-1 bg-surface-bg shadow-sm'>
										<h1 className='font-primary'>{runeName}</h1>
										<h1 className='font-primary text-primary-500 uppercase'>
											{rune.rarity}
										</h1>
									</div>
									{runeDesc && (
										<div className='flex-1 mt-4'>
											<div
												className='text-base sm:text-xl rounded-lg p-4 h-full min-h-[120px] leading-relaxed bg-surface-bg border text-text-secondary overflow-y-auto'
												dangerouslySetInnerHTML={{ __html: runeDesc }}
											/>
										</div>
									)}
								</div>
							</div>

							<h2 className='text-xl sm:text-3xl font-semibold mt-8 mb-4 font-primary'>
								{language === "vi"
									? "Các tướng có thể dùng ngọc này"
									: "Champions using this rune"}
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
												className='w-full max-w-[120px] h-auto mx-auto rounded-full object-cover border-2 border-border group-hover:border-primary-500'
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
											? "Hiện chưa có tướng nào được gợi ý dùng ngọc này."
											: "No champions are currently suggested to use this rune."}
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

export default memo(RuneDetail);
