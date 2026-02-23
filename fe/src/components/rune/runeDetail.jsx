import { memo, useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Loader2, ChevronLeft } from "lucide-react";
import PageTitle from "../common/pageTitle";
import Button from "../common/button";
import SafeImage from "../common/SafeImage";

function RuneDetail() {
	const { runeCode } = useParams();
	const navigate = useNavigate();

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

				const [runesRes, championsRes] = await Promise.all([
					fetch(`${apiUrl}/api/runes?limit=1000`),
					fetch(`${apiUrl}/api/champions?limit=1000`),
				]);

				if (!runesRes.ok || !championsRes.ok) {
					throw new Error("Không thể tải dữ liệu từ server.");
				}

				const runesData = await runesRes.json();
				const championsData = await championsRes.json();

				// FIX: Truy cập .items
				const allRunes = runesData.items || [];
				const allChampions = championsData.items || [];

				const foundRune = allRunes.find(r => r.runeCode === decodedCode);
				if (!foundRune) {
					setError(`Không tìm thấy ngọc với mã: ${decodedCode}`);
					setRune(null);
				} else {
					setRune(foundRune);
				}

				setChampions(allChampions);
			} catch (err) {
				console.error("Lỗi tải dữ liệu ngọc:", err);
				setError(err.message || "Đã xảy ra lỗi khi tải dữ liệu.");
			} finally {
				setLoading(false);
			}
		};

		if (runeCode) fetchData();
	}, [runeCode, apiUrl]);

	const compatibleChampions = rune
		? champions
				.filter(
					champion =>
						Array.isArray(champion.rune) && champion.rune.includes(rune.name),
				)
				.map(champion => ({
					championID: champion.championID,
					name: champion.name,
					image:
						champion.assets?.[0]?.avatar ||
						champion.assets?.[0]?.fullAbsolutePath ||
						"/images/placeholder.png",
				}))
		: [];

	const formatDescription = text => {
		if (!text) return null;
		return text
			.replace(/\\n/g, "\n")
			.split(/\r?\n/)
			.map((line, i) => (
				<p key={i} className={i > 0 ? "mt-3" : ""}>
					{line || "\u00A0"}
				</p>
			));
	};

	if (loading) {
		return (
			<div className='flex flex-col items-center justify-center min-h-[500px] p-6 text-text-secondary'>
				<Loader2 className='animate-spin text-primary-500' size={48} />
				<p className='mt-4 text-lg'>Đang tải thông tin ngọc...</p>
			</div>
		);
	}

	if (error || !rune) {
		return (
			<div className='p-6 sm:p-8 text-center text-danger-text-dark'>
				<p className='text-xl font-semibold'>Không tìm thấy Ngọc</p>
				<p className='mt-2 text-sm opacity-80'>
					{runeCode && `Mã: ${decodeURIComponent(runeCode)}`}
				</p>
				{error && <p className='mt-4 text-sm'>{error}</p>}
			</div>
		);
	}

	return (
		<div>
			<PageTitle
				title={rune.name}
				description={`POC GUIDE: Hiệu ứng chi tiết Ngọc ${rune.name} Path of Champions (Độ hiếm: ${rune.rarity}). Combo mạnh nhất với Ahri, Yasuo, Yone, Lillia... Hướng dẫn farm rune Epic + mẹo dùng đánh boss!`}
				type='article'
			/>

			<div className='max-w-[1200px] mx-auto p-0 sm:p-6 text-text-primary font-secondary'>
				<Button variant='outline' onClick={() => navigate(-1)} className='mb-4'>
					<ChevronLeft size={18} />
					Quay lại
				</Button>

				<div className='relative mx-auto max-w-[1200px] border border-border p-4 sm:p-6 rounded-lg bg-surface-bg text-text-primary font-secondary'>
					<div className='flex flex-col md:flex-row gap-4 rounded-md p-2 bg-surface-hover'>
						<SafeImage
							className='h-auto max-h-[200px] sm:max-h-[300px] object-contain rounded-lg self-center md:self-start'
							src={rune.assetAbsolutePath || "/images/placeholder.png"}
							alt={rune.name}
							loading='lazy'
						/>
						<div className='flex-1 flex flex-col'>
							<div className='flex flex-col border border-border sm:flex-row sm:justify-between rounded-lg p-2 text-2xl sm:text-4xl font-bold m-1'>
								<h1 className='font-primary'>{rune.name}</h1>
								<h1 className='font-primary'>ĐỘ HIẾM: {rune.rarity}</h1>
							</div>

							{rune.description && (
								<div className='flex-1 mt-4'>
									<div className='text-base sm:text-xl rounded-lg p-4 min-h-[150px] max-h-[300px] overflow-y-auto bg-surface-bg border text-text-secondary'>
										{formatDescription(rune.description)}
									</div>
								</div>
							)}
						</div>
					</div>

					<h2 className='text-xl sm:text-3xl font-semibold mt-8 mb-4 font-primary'>
						Các tướng có thể dùng ngọc này
					</h2>

					{compatibleChampions.length > 0 ? (
						<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 rounded-md bg-surface-hover'>
							{compatibleChampions.map(champ => (
								<Link
									key={champ.championID}
									to={`/champion/${champ.championID}`}
									className='group rounded-lg p-2 transition-all hover:shadow-lg hover:scale-105 bg-surface-bg border border-border text-center'
								>
									<SafeImage
										className='w-full max-w-[120px] h-auto mx-auto rounded-full object-cover border-2 border-border group-hover:border-primary-500 transition-colors'
										src={champ.image}
										alt={champ.name}
										loading='lazy'
									/>
									<h3 className='text-base sm:text-lg font-semibold mt-3 text-text-primary group-hover:text-primary-500 transition-colors'>
										{champ.name}
									</h3>
								</Link>
							))}
						</div>
					) : (
						<div className='text-center p-8 rounded-md bg-surface-hover text-text-secondary'>
							<p className='text-lg'>
								Hiện chưa có tướng nào được gợi ý dùng ngọc này.
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default memo(RuneDetail);
