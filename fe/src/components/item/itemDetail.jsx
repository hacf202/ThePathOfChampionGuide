// src/pages/itemDetail.jsx
import { memo, useState, useEffect, useMemo } from "react"; // Đã thêm useMemo
import { Link, useParams, useNavigate } from "react-router-dom";
import { Loader2, ChevronLeft } from "lucide-react";
import PageTitle from "../common/pageTitle";
import Button from "../common/button";
import SafeImage from "../common/SafeImage";

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

				/**
				 * TỐI ƯU: Gọi trực tiếp API chi tiết vật phẩm.
				 * API này trả về đúng đối tượng I0070 từ RAM Backend.
				 */
				const [itemRes, championsRes] = await Promise.all([
					fetch(`${apiUrl}/api/items/${encodeURIComponent(decodedCode)}`),
					fetch(`${apiUrl}/api/champions?limit=-1`), // Lấy toàn bộ tướng để lọc local
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
				setLoading(false);
			}
		};

		if (itemCode) fetchData();
	}, [itemCode, apiUrl]);

	/**
	 * Logic lọc tướng tương thích sử dụng useMemo để tối ưu hiệu năng.
	 */
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

	if (loading)
		return (
			<div className='flex flex-col items-center justify-center min-h-[500px] p-6'>
				<Loader2 className='animate-spin text-primary-500' size={48} />
				<p className='mt-4 text-lg font-secondary'>Đang tải thông tin...</p>
			</div>
		);

	if (error || !item)
		return (
			<div className='p-10 text-center font-secondary'>
				<div className='bg-surface-hover p-8 rounded-lg border border-border inline-block'>
					<p className='text-xl font-bold text-red-500'>Lỗi: {error}</p>
					<Button onClick={() => navigate(-1)} className='mt-6 mx-auto'>
						<ChevronLeft size={18} /> Quay lại
					</Button>
				</div>
			</div>
		);

	return (
		<div>
			<PageTitle
				title={item.name}
				description={`Chi tiết vật phẩm ${item.name}`}
				type='article'
			/>
			<div className='max-w-[1200px] mx-auto p-0 sm:p-6 text-text-primary font-secondary'>
				<Button variant='outline' onClick={() => navigate(-1)} className='mb-4'>
					<ChevronLeft size={18} /> Quay lại
				</Button>
				<div className='relative mx-auto max-w-[1200px] border border-border p-4 sm:p-6 rounded-lg bg-surface-bg shadow-sm'>
					<div className='flex flex-col md:flex-row gap-4 rounded-md p-2 bg-surface-hover'>
						<SafeImage
							className='h-auto max-h-[300px] object-contain rounded-lg'
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
			</div>
		</div>
	);
}

export default memo(ItemDetail);
