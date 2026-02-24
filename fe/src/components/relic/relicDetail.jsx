// src/pages/relicDetail.jsx
import { memo, useState, useEffect, useMemo } from "react"; // THÊM: useMemo
import { Link, useParams, useNavigate } from "react-router-dom";
import { Loader2, ChevronLeft } from "lucide-react";
import PageTitle from "../common/pageTitle";
import Button from "../common/button";
import SafeImage from "../common/SafeImage";

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

				/**
				 * TỐI ƯU: Gọi đồng thời API lấy lẻ 1 Cổ vật và toàn bộ Tướng.
				 * Tránh lỗi hụt dữ liệu do limit phân trang.
				 */
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
				setLoading(false);
			}
		};

		if (relicCode) fetchData();
	}, [relicCode, apiUrl]);

	/**
	 * Logic lọc danh sách tướng tương thích dựa trên các set relic của tướng.
	 * Sử dụng useMemo để tối ưu hiệu năng render.
	 */
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

	if (loading)
		return (
			<div className='flex flex-col items-center justify-center min-h-[500px] p-6'>
				<Loader2 className='animate-spin text-primary-500' size={48} />
				<p className='mt-4 text-lg font-secondary'>
					Đang tải thông tin cổ vật...
				</p>
			</div>
		);

	if (error || !relic)
		return (
			<div className='p-10 text-center font-secondary'>
				<div className='bg-surface-hover p-8 rounded-lg border border-border inline-block shadow-sm'>
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
				title={relic.name}
				description={`Chi tiết cổ vật ${relic.name} - Poc Guide.`}
				type='article'
			/>

			<div className='max-w-[1200px] mx-auto p-0 sm:p-6 text-text-primary font-secondary'>
				<Button variant='outline' onClick={() => navigate(-1)} className='mb-4'>
					<ChevronLeft size={18} /> Quay lại
				</Button>

				<div className='relative mx-auto max-w-[1200px] border border-border p-4 sm:p-6 rounded-lg bg-surface-bg shadow-sm'>
					<div className='flex flex-col md:flex-row gap-4 rounded-md p-2 bg-surface-hover'>
						<SafeImage
							className='h-auto max-h-[300px] object-contain rounded-lg self-center md:self-start'
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
							<p className='text-lg'>Không có tướng nào sử dụng cổ vật này.</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default memo(RelicDetail);
