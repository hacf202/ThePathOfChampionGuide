// src/pages/relicDetail.jsx
import { memo, useState, useEffect, useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion"; // THÊM: Framer Motion cho hiệu ứng mượt
import { Loader2, ChevronLeft, XCircle } from "lucide-react";
import PageTitle from "../common/pageTitle";
import Button from "../common/button";
import SafeImage from "../common/SafeImage";

// --- THÀNH PHẦN SKELETON LOADING (Đồng bộ với hệ thống) ---
const RelicDetailSkeleton = () => (
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

function RelicDetail() {
	const { relicCode } = useParams();
	const navigate = useNavigate();

	const [relic, setRelic] = useState(null);
	const [champions, setChampions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const apiUrl = import.meta.env.VITE_API_URL;

	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);
				setError(null);
				const decodedCode = decodeURIComponent(relicCode);

				const [relicRes, championsRes] = await Promise.all([
					fetch(`${apiUrl}/api/relics/${encodeURIComponent(decodedCode)}`),
					fetch(`${apiUrl}/api/champions?limit=-1`),
				]);

				if (!relicRes.ok) {
					throw new Error(
						relicRes.status === 404
							? `Không tìm thấy cổ vật mã: ${decodedCode}`
							: "Lỗi kết nối server.",
					);
				}

				const foundRelic = await relicRes.json();
				const championsData = championsRes.ok
					? await championsRes.json()
					: { items: [] };

				setRelic(foundRelic);
				setChampions(championsData.items || []);
			} catch (err) {
				console.error("Lỗi tải RelicDetail:", err);
				setError(err.message);
			} finally {
				// Áp dụng độ trễ 800ms để hiệu ứng loading mượt mà đồng bộ với ChampionDetail
				setTimeout(() => setLoading(false), 800);
			}
		};

		if (relicCode) fetchData();
	}, [relicCode, apiUrl]);

	const compatibleChampions = useMemo(() => {
		if (!relic || !champions.length) return [];
		return champions
			.filter(champion =>
				[1, 2, 3, 4, 5, 6].some(set =>
					champion[`defaultRelicsSet${set}`]?.some(
						r => r?.trim().toLowerCase() === relic.name?.trim().toLowerCase(),
					),
				),
			)
			.map(champion => ({
				championID: champion.championID,
				name: champion.name,
				image: champion.assets?.[0]?.avatar || "/fallback-image.svg",
			}));
	}, [relic, champions]);

	if (error)
		return (
			<div className='p-10 text-center font-secondary'>
				<div className='bg-surface-hover p-8 rounded-lg border border-border inline-block shadow-sm'>
					<XCircle size={48} className='mx-auto mb-4 text-red-500 opacity-50' />
					<p className='text-xl font-bold text-red-500'>Lỗi: {error}</p>
					<Button onClick={() => navigate(-1)} className='mt-6 mx-auto'>
						<ChevronLeft size={18} /> Quay lại
					</Button>
				</div>
			</div>
		);

	return (
		<div className='animate-fadeIn'>
			<PageTitle
				title={relic?.name || "Chi tiết cổ vật"}
				description={`Chi tiết cổ vật ${relic?.name} - Poc Guide.`}
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
						<RelicDetailSkeleton />
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
							<ChevronLeft size={18} /> Quay lại
						</Button>

						<div className='relative mx-auto max-w-[1200px] border border-border p-4 sm:p-6 rounded-lg bg-surface-bg shadow-sm'>
							<div className='flex flex-col md:flex-row gap-4 rounded-md p-2 bg-surface-hover'>
								<SafeImage
									className='h-auto max-h-[300px] object-contain rounded-lg self-center md:self-start bg-surface-bg/50 p-2'
									src={relic.assetAbsolutePath || "/fallback-image.svg"}
									alt={relic.name}
								/>
								<div className='flex-1 flex flex-col'>
									<div className='flex flex-col border border-border sm:flex-row sm:justify-between rounded-lg p-2 text-2xl sm:text-4xl font-bold m-1 bg-surface-bg shadow-sm'>
										<h1 className='font-primary'>{relic.name}</h1>
										<h2 className='text-primary-500 uppercase'>
											ĐỘ HIẾM: {relic.rarity}
										</h2>
									</div>

									{relic.descriptionRaw && (
										<div className='flex-1 mt-4'>
											<div className='text-base sm:text-xl rounded-lg p-4 min-h-[120px] max-h-[300px] overflow-y-auto bg-surface-bg border border-border text-text-secondary'>
												{relic.descriptionRaw}
											</div>
										</div>
									)}
								</div>
							</div>

							<h2 className='text-xl sm:text-3xl font-semibold mt-8 mb-4 font-primary'>
								Các tướng có thể dùng cổ vật
							</h2>

							{compatibleChampions.length > 0 ? (
								<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 rounded-md bg-surface-hover p-4 border border-border'>
									{compatibleChampions.map(champ => (
										<Link
											key={champ.championID}
											to={`/champion/${champ.championID}`}
											className='group rounded-lg p-2 transition-all hover:shadow-lg hover:scale-105 bg-surface-bg border border-border text-center'
										>
											<SafeImage
												className='w-full max-w-[120px] h-auto mx-auto rounded-full object-cover border-2 border-border group-hover:border-primary-500'
												src={champ.image}
												alt={champ.name}
											/>
											<h3 className='text-base sm:text-lg font-semibold mt-3 text-text-primary group-hover:text-primary-500'>
												{champ.name}
											</h3>
										</Link>
									))}
								</div>
							) : (
								<div className='text-center p-8 rounded-md bg-surface-hover text-text-secondary border border-dashed border-border'>
									<p className='text-lg'>
										Không có tướng nào sử dụng cổ vật này.
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

export default memo(RelicDetail);
