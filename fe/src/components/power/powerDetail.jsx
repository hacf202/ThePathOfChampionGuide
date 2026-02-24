// src/pages/powerDetail.jsx
import { memo, useState, useEffect, useMemo } from "react"; // THÊM: useMemo
import { Link, useParams, useNavigate } from "react-router-dom";
import { Loader2, ChevronLeft } from "lucide-react";
import PageTitle from "../common/pageTitle";
import Button from "../common/button";
import SafeImage from "../common/SafeImage";

function PowerDetail() {
	const { powerCode } = useParams();
	const navigate = useNavigate();
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

				/**
				 * TỐI ƯU: Gọi đồng thời API lấy lẻ 1 Sức mạnh và toàn bộ Tướng.
				 */
				const [powerRes, championsRes] = await Promise.all([
					fetch(`${apiUrl}/api/powers/${encodeURIComponent(decodedCode)}`),
					fetch(`${apiUrl}/api/champions?limit=-1`),
				]);

				if (!powerRes.ok) {
					throw new Error(
						powerRes.status === 404
							? `Không tìm thấy sức mạnh mã: ${decodedCode}`
							: "Lỗi kết nối server.",
					);
				}

				const foundPower = await powerRes.json();
				const championsData = championsRes.ok
					? await championsRes.json()
					: { items: [] };

				setPower(foundPower);
				setChampions(championsData.items || []);
			} catch (err) {
				console.error("Lỗi tải PowerDetail:", err);
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};

		if (powerCode) fetchData();
	}, [powerCode, apiUrl]);

	/**
	 * Logic lọc tướng tương thích (Star Powers và Adventure Powers).
	 */
	const compatibleChampions = useMemo(() => {
		if (!power || !champions.length) return [];
		return champions
			.filter(champion => {
				const pName = power.name?.trim().toLowerCase();
				const powerStarsMatch = champion.powerStars?.some(
					p => p?.trim().toLowerCase() === pName,
				);
				const adventurePowersMatch = champion.adventurePowers?.some(
					p => p?.trim().toLowerCase() === pName,
				);
				return powerStarsMatch || adventurePowersMatch;
			})
			.map(champion => ({
				championID: champion.championID,
				name: champion.name,
				image: champion.assets?.[0]?.avatar || "/fallback-image.svg",
			}));
	}, [power, champions]);

	if (loading)
		return (
			<div className='flex flex-col items-center justify-center min-h-[500px] p-6'>
				<Loader2 className='animate-spin text-primary-500' size={48} />
				<p className='mt-4 text-lg font-secondary'>
					Đang tải thông tin sức mạnh...
				</p>
			</div>
		);

	if (error || !power)
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
				title={power.name}
				description={`Chi tiết sức mạnh ${power.name} - Poc Guide.`}
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
							src={power.assetAbsolutePath || "/fallback-image.svg"}
							alt={power.name}
						/>
						<div className='flex-1 flex flex-col'>
							<div className='flex flex-col border border-border sm:flex-row sm:justify-between rounded-lg p-2 text-2xl sm:text-4xl font-bold m-1 bg-surface-bg shadow-sm'>
								<h1 className='font-primary'>{power.name}</h1>
								<h2 className='text-primary-500 uppercase'>
									ĐỘ HIẾM: {power.rarity}
								</h2>
							</div>

							{power.descriptionRaw && (
								<div className='flex-1 mt-4'>
									<div className='text-base sm:text-xl rounded-lg p-4 min-h-[120px] max-h-[300px] overflow-y-auto bg-surface-bg border border-border text-text-secondary'>
										{power.descriptionRaw}
									</div>
								</div>
							)}
						</div>
					</div>

					<h2 className='text-xl sm:text-3xl font-semibold mt-8 mb-4 font-primary'>
						Các tướng sử dụng sức mạnh này
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
								Hiện không có tướng nào trang bị sức mạnh này mặc định.
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default memo(PowerDetail);
