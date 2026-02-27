// src/pages/itemDetail.jsx
import { memo, useState, useEffect, useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion"; // Thêm Framer Motion
import { Loader2, ChevronLeft, XCircle } from "lucide-react";
import PageTitle from "../common/pageTitle";
import Button from "../common/button";
import SafeImage from "../common/SafeImage";

// --- THÀNH PHẦN SKELETON LOADING (Đồng bộ với ChampionDetail) ---
const ItemDetailSkeleton = () => (
	<div className='max-w-[1200px] mx-auto p-0 sm:p-6 animate-pulse font-secondary'>
		<div className='h-10 w-24 bg-gray-700/50 rounded mb-4 ml-4 sm:ml-0' />
		<div className='bg-surface-bg border border-border rounded-lg p-4 sm:p-6 space-y-8'>
			<div className='flex flex-col md:flex-row gap-6'>
				{/* Ảnh Skeleton */}
				<div className='w-full md:w-[300px] aspect-square bg-gray-700/50 rounded-lg' />
				<div className='flex-1 space-y-4'>
					{/* Tiêu đề & Rarity Skeleton */}
					<div className='h-16 w-full bg-gray-700/50 rounded-lg' />
					{/* Mô tả Skeleton */}
					<div className='h-48 w-full bg-gray-700/50 rounded-lg' />
				</div>
			</div>
			{/* Danh sách tướng Skeleton */}
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

function ItemDetail() {
	const { itemCode } = useParams();
	const navigate = useNavigate();
	const [item, setItem] = useState(null);
	const [champions, setChampions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const apiUrl = import.meta.env.VITE_API_URL;

	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);
				setError(null);
				const decodedCode = decodeURIComponent(itemCode);

				const [itemRes, championsRes] = await Promise.all([
					fetch(`${apiUrl}/api/items/${encodeURIComponent(decodedCode)}`),
					fetch(`${apiUrl}/api/champions?limit=-1`),
				]);

				if (!itemRes.ok) {
					throw new Error(
						itemRes.status === 404
							? `Không tìm thấy vật phẩm mã: ${decodedCode}`
							: "Lỗi tải thông tin vật phẩm.",
					);
				}

				const foundItem = await itemRes.json();
				const championsData = championsRes.ok
					? await championsRes.json()
					: { items: [] };

				setItem(foundItem);
				setChampions(championsData.items || []);
			} catch (err) {
				setError(err.message || "Đã xảy ra lỗi khi tải dữ liệu.");
			} finally {
				// Áp dụng độ trễ 800ms để hiệu ứng loading mượt mà đồng bộ với hệ thống
				setTimeout(() => setLoading(false), 800);
			}
		};

		if (itemCode) fetchData();
	}, [itemCode, apiUrl]);

	const compatibleChampions = useMemo(() => {
		if (!item || !champions.length) return [];
		return champions
			.filter(champion =>
				champion.defaultItems?.some(itemName => itemName === item.name),
			)
			.map(champion => ({
				championID: champion.championID,
				name: champion.name,
				image: champion.assets?.[0]?.avatar || "/fallback-image.svg",
			}));
	}, [item, champions]);

	if (error)
		return (
			<div className='p-10 text-center font-secondary'>
				<div className='bg-surface-hover p-8 rounded-lg border border-border inline-block'>
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
				title={item?.name || "Chi tiết vật phẩm"}
				description={`Chi tiết vật phẩm ${item?.name}`}
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
						<ItemDetailSkeleton />
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
									className='h-auto max-h-[300px] object-contain rounded-lg bg-surface-bg/50 p-2'
									src={item.assetAbsolutePath || "/fallback-image.svg"}
									alt={item.name}
								/>
								<div className='flex-1 flex flex-col'>
									<div className='flex flex-col border border-border sm:flex-row sm:justify-between rounded-lg p-2 text-2xl sm:text-4xl font-bold m-1 bg-surface-bg shadow-sm'>
										<h1 className='font-primary'>{item.name}</h1>
										<h1 className='font-primary text-primary-500 uppercase'>
											{item.rarity}
										</h1>
									</div>
									{(item.descriptionRaw || item.description) && (
										<div className='flex-1 mt-4'>
											<div
												className='text-base sm:text-xl rounded-lg p-4 h-full min-h-[120px] leading-relaxed bg-surface-bg border text-text-secondary overflow-y-auto'
												dangerouslySetInnerHTML={{
													__html: item.descriptionRaw || item.description,
												}}
											/>
										</div>
									)}
								</div>
							</div>

							<h2 className='text-xl sm:text-3xl font-semibold mt-8 mb-4 font-primary'>
								Các tướng sử dụng vật phẩm
							</h2>

							{compatibleChampions.length > 0 ? (
								<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 rounded-md bg-surface-hover p-4 border border-border'>
									{compatibleChampions.map(champion => (
										<Link
											key={champion.championID}
											to={`/champion/${champion.championID}`}
											className='group rounded-lg p-2 transition-all hover:shadow-lg hover:scale-105 bg-surface-bg border border-border'
										>
											<SafeImage
												className='w-full max-w-[100px] h-auto mx-auto rounded-full object-cover border-2 border-border group-hover:border-primary-500 transition-colors'
												src={champion.image}
												alt={champion.name}
											/>
											<h3 className='text-base font-semibold text-center mt-3 text-text-primary group-hover:text-primary-500'>
												{champion.name}
											</h3>
										</Link>
									))}
								</div>
							) : (
								<div className='text-center p-8 rounded-md bg-surface-hover text-text-secondary border border-dashed border-border'>
									<p>
										Vật phẩm này hiện chưa được trang bị mặc định cho tướng nào.
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

export default memo(ItemDetail);
