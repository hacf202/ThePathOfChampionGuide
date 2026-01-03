// src/pages/championDetail.jsx
import { memo, useMemo, useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import iconRegions from "../../assets/data/iconRegions.json";
import { ChevronLeft, Loader2, Star, X, Info } from "lucide-react";
import Button from "../common/button";
import PageTitle from "../common/pageTitle";
import SafeImage from "../common/SafeImage";

// Thành phần Node trên bản đồ (Giữ nguyên style cũ)
const ConstellationNode = ({ power, index, onHover, active }) => {
	return (
		<div
			className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 z-10 ${
				active ? "scale-125" : "hover:scale-110"
			}`}
			style={{ left: power.pos.x, top: power.pos.y }}
			onMouseEnter={() => onHover(power)}
		>
			<div className='relative'>
				<div
					className={`absolute inset-0 rounded-full blur-md bg-yellow-400 transition-opacity duration-500 ${
						active ? "opacity-60 animate-pulse" : "opacity-0"
					}`}
				/>
				<div
					className={`relative bg-surface-bg border-2 rounded-full p-1 shadow-2xl ${
						active ? "border-primary-500" : "border-border"
					}`}
				>
					<img
						src={power.image}
						alt={power.name}
						className='w-8 h-8 sm:w-16 sm:h-16 rounded-full object-contain'
					/>
					<div className='absolute -bottom-1 -right-1 bg-yellow-500 text-black text-[10px] font-black px-1.5 rounded-sm border border-black shadow-sm'>
						{index + 1}★
					</div>
				</div>
			</div>
		</div>
	);
};

// Component RenderItem (Giữ nguyên style cũ)
const RenderItem = ({ item }) => {
	if (!item) return null;

	const getLinkPath = item => {
		if (item.powerCode) return `/power/${encodeURIComponent(item.powerCode)}`;
		if (item.relicCode) return `/relic/${encodeURIComponent(item.relicCode)}`;
		if (item.itemCode) return `/item/${encodeURIComponent(item.itemCode)}`;
		if (item.runeCode) return `/rune/${encodeURIComponent(item.runeCode)}`;
		return null;
	};

	const linkPath = getLinkPath(item);
	const imgSrc = item.image || "/fallback-image.svg";

	const content = (
		<div className='flex items-start gap-4 bg-surface-hover rounded-md  h-full hover:border-primary-500 transition-colors'>
			<SafeImage
				src={imgSrc}
				alt={item.name}
				className='w-16 h-16 rounded-md'
				onError={e => {
					e.target.src = "/fallback-image.svg";
				}}
				loading='lazy'
			/>
			<div>
				<h3 className='font-semibold text-text-primary text-lg'>{item.name}</h3>
				{item.description && (
					<p
						className='text-md text-text-secondary mt-1'
						dangerouslySetInnerHTML={{ __html: item.description }}
					/>
				)}
			</div>
		</div>
	);

	return linkPath ? <Link to={linkPath}>{content}</Link> : content;
};

function ChampionDetail() {
	const { championID } = useParams();
	const navigate = useNavigate();

	const [champion, setChampion] = useState(null);
	const [powers, setPowers] = useState([]);
	const [items, setItems] = useState([]);
	const [relics, setRelics] = useState([]);
	const [runes, setRunes] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const [hoveredNode, setHoveredNode] = useState(null);
	const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

	const apiUrl = import.meta.env.VITE_API_URL;

	const nodePositions = useMemo(
		() => [
			{ x: "15%", y: "65%" },
			{ x: "30%", y: "40%" },
			{ x: "50%", y: "60%" },
			{ x: "65%", y: "35%" },
			{ x: "80%", y: "70%" },
			{ x: "90%", y: "45%" },
		],
		[]
	);

	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);
				setError(null);

				const [champRes, powerRes, itemRes, relicRes, runeRes] =
					await Promise.all([
						fetch(`${apiUrl}/api/champions`),
						fetch(`${apiUrl}/api/powers`),
						fetch(`${apiUrl}/api/items`),
						fetch(`${apiUrl}/api/relics`),
						fetch(`${apiUrl}/api/runes`),
					]);

				if (
					![champRes, powerRes, itemRes, relicRes, runeRes].every(r => r.ok)
				) {
					throw new Error("Không thể tải dữ liệu từ server.");
				}

				const [championsJson, powersJson, itemsJson, relicsJson, runesJson] =
					await Promise.all([
						champRes.json(),
						powerRes.json(),
						itemRes.json(),
						relicRes.json(),
						runeRes.json(),
					]);

				const found = championsJson.find(c => c.championID === championID);
				if (!found) {
					setError(`Không tìm thấy tướng với ID: ${championID}`);
				} else {
					setChampion(found);
				}

				setPowers(powersJson);
				setItems(itemsJson);
				setRelics(relicsJson);
				setRunes(runesJson);
			} catch (err) {
				console.error("Lỗi tải dữ liệu:", err);
				setError(err.message || "Lỗi kết nối.");
			} finally {
				setLoading(false);
			}
		};

		if (championID) fetchData();
	}, [championID, apiUrl]);

	const findRegionIconLink = regionName => {
		const region = iconRegions.find(item => item.name === regionName);
		return region?.iconAbsolutePath || "/fallback-image.svg";
	};

	const powerStarsFull = useMemo(() => {
		if (!champion?.powerStars || !Array.isArray(champion.powerStars)) return [];
		return champion.powerStars
			.map((name, index) => {
				const p = powers.find(x => x.name === name);
				return {
					name,
					image: p?.assetAbsolutePath || "/images/placeholder.png",
					description: p?.description || "",
					powerCode: p?.powerCode || null,
					pos: nodePositions[index] || { x: "50%", y: "50%" },
				};
			})
			.filter(item => item.name && item.name.trim() !== "");
	}, [champion, powers, nodePositions]);

	// Các hàm useMemo khác (adventurePowersFull, defaultItemsFull, runesFull, defaultRelicsSetsFull)
	// giữ nguyên 100% logic cũ...
	const adventurePowersFull = useMemo(() => {
		if (!champion?.adventurePowers || !Array.isArray(champion.adventurePowers))
			return [];
		return champion.adventurePowers
			.map(name => {
				const p = powers.find(x => x.name === name);
				return {
					name,
					image: p?.assetAbsolutePath || "/images/placeholder.png",
					description: p?.description || "",
					powerCode: p?.powerCode || null,
				};
			})
			.filter(item => item.name && item.name.trim() !== "");
	}, [champion, powers]);

	const defaultItemsFull = useMemo(() => {
		if (!champion?.defaultItems || !Array.isArray(champion.defaultItems))
			return [];
		return champion.defaultItems
			.map(name => {
				const i = items.find(x => x.name === name);
				return {
					name,
					image: i?.assetAbsolutePath || "/images/placeholder.png",
					description: i?.description || "",
					itemCode: i?.itemCode || null,
				};
			})
			.filter(item => item.name && item.name.trim() !== "");
	}, [champion, items]);

	const runesFull = useMemo(() => {
		if (!champion?.rune || !Array.isArray(champion.rune)) return [];
		return champion.rune
			.map(name => {
				const r = runes.find(x => x.name === name);
				return {
					name,
					image: r?.assetAbsolutePath || "/images/placeholder.png",
					description: r?.description || "",
					runeCode: r?.runeCode || null,
				};
			})
			.filter(item => item.name && item.name.trim() !== "");
	}, [champion, runes]);

	const defaultRelicsSetsFull = useMemo(() => {
		if (!champion) return [];
		const sets = [];
		for (let i = 1; i <= 6; i++) {
			const key = `defaultRelicsSet${i}`;
			const arr = champion[key];
			if (Array.isArray(arr) && arr.length > 0) {
				const relicsInSet = arr
					.map(name => {
						const r = relics.find(x => x.name === name);
						return {
							name,
							image: r?.assetAbsolutePath || "/images/placeholder.png",
							description: r?.description || "",
							relicCode: r?.relicCode || null,
						};
					})
					.filter(r => r.name && r.name.trim() !== "");
				if (relicsInSet.length > 0)
					sets.push({ setNumber: i, relics: relicsInSet });
			}
		}
		return sets;
	}, [champion, relics]);

	if (loading) {
		return (
			<div className='flex flex-col items-center justify-center min-h-[600px] p-6 text-text-secondary'>
				<Loader2 className='animate-spin text-primary-500' size={48} />
				<p className='mt-4 text-lg'>Đang tải thông tin tướng...</p>
			</div>
		);
	}

	if (error || !champion) {
		return (
			<div className='p-6 text-center text-danger-text-dark'>
				<p className='text-xl font-semibold'>Không tìm thấy tướng</p>
				<p className='mt-2'>{error || `ID: ${championID}`}</p>
			</div>
		);
	}

	const videoLink =
		champion.videoLink || "https://www.youtube.com/embed/mZgnjMeTI5E";
	const isSpiritBlossom = champion.regions?.includes("Hoa Linh Lục Địa");

	return (
		<div>
			<PageTitle
				title={champion.name}
				description={`POC GUIDE cho ${champion.name}`}
				type='article'
			/>
			<div className='max-w-[1200px] mx-auto p-0 sm:p-6 text-text-primary font-secondary'>
				<Button
					variant='outline'
					onClick={() => navigate(-1)}
					className='mb-3 sm:mb-4'
				>
					<ChevronLeft size={18} /> Quay lại
				</Button>

				<div className='relative mx-auto max-w-[1200px] sm:p-6 rounded-lg bg-surface-bg text-text-primary font-secondary'>
					{/* Header giữ nguyên 100% CSS cũ */}
					<div className='flex flex-col md:flex-row border border-border gap-2 sm:gap-4 rounded-md bg-surface-hover sm:p-4'>
						<SafeImage
							className='h-auto max-h-[200px] sm:max-h-[300px] object-contain rounded-lg'
							src={
								champion.assets?.[0]?.gameAbsolutePath ||
								"/images/placeholder.png"
							}
							alt={champion.name}
						/>
						<div className='flex-1 '>
							<div className='flex flex-col sm:flex-row sm:justify-between rounded-lg p-2 m-1 gap-2'>
								<h1 className='text-2xl sm:text-4xl font-bold m-1 font-primary'>
									{champion.name}
								</h1>
								<div className='flex flex-wrap gap-2 mb-2 items-center'>
									<div className='flex items-center gap-1 px-2.5 py-1.5 bg-yellow-500/20 border border-yellow-500 rounded-full shadow-sm'>
										<span className='text-sm sm:text-base font-bold text-yellow-900'>
											{champion.maxStar}
										</span>
										<Star size={16} className='text-yellow-600 fill-current' />
									</div>
									<div className='flex items-center justify-center w-10 h-10 bg-blue-600 border-2 border-white rounded-full'>
										<span className='text-white text-xs font-bold'>
											{champion.cost}
										</span>
									</div>
									{champion.regions?.map((region, index) => (
										<img
											key={index}
											src={findRegionIconLink(region)}
											alt={region}
											className='w-10 h-10'
										/>
									))}
								</div>
							</div>
							{champion.description && (
								<div className='mt-3 sm:mt-4 mx-1'>
									<div
										className={`text-sm sm:text-xl rounded-lg p-3 sm:p-4 transition-all border bg-surface-bg text-text-secondary ${
											!isDescriptionExpanded
												? "overflow-y-auto h-48 sm:h-60"
												: "h-auto"
										}`}
									>
										{champion.description
											.replace(/\\n/g, "\n")
											.split(/\r?\n/)
											.map((line, i) => (
												<p key={i} className={i > 0 ? "mt-3" : ""}>
													{line || (
														<span className='text-transparent'>empty</span>
													)}
												</p>
											))}
									</div>
									<button
										onClick={() =>
											setIsDescriptionExpanded(!isDescriptionExpanded)
										}
										className='text-xs sm:text-sm font-semibold mt-2 px-3 py-1 rounded text-primary-500 hover:bg-surface-hover'
									>
										{isDescriptionExpanded ? "Thu gọn" : "Hiển thị toàn bộ"}
									</button>
								</div>
							)}
						</div>
					</div>

					{/* PHẦN CONSTELLATION MAP */}
					{powerStarsFull.length > 0 && (
						<>
							<h2 className='text-lg sm:text-3xl font-semibold my-3 sm:m-5 text-text-primary font-primary flex items-center gap-2 uppercase'>
								Chòm sao
							</h2>

							{/* Bản đồ: Giữ nguyên tỷ lệ và background */}
							<div className='relative w-full aspect-video bg-slate-950 border border-border rounded-t-lg overflow-hidden shadow-2xl'>
								<img
									src={champion.assets?.[0]?.avatar || "/fallback-image.svg"}
									className='absolute inset-0 w-full h-full object-cover opacity-10 blur-sm scale-110 pointer-events-none'
									alt='bg'
								/>

								{/* SVG vẽ đường nối */}
								<svg className='absolute inset-0 w-full h-full pointer-events-none'>
									{powerStarsFull.map((power, idx) => {
										if (idx === powerStarsFull.length - 1) return null;
										const nextPower = powerStarsFull[idx + 1];
										return (
											<line
												key={`line-${idx}`}
												x1={power.pos.x}
												y1={power.pos.y}
												x2={nextPower.pos.x}
												y2={nextPower.pos.y}
												stroke='rgba(234, 179, 8, 0.25)'
												strokeWidth='2'
												strokeDasharray='10,5'
											/>
										);
									})}
								</svg>

								{/* Các Node sao */}
								{powerStarsFull.map((power, idx) => (
									<ConstellationNode
										key={idx}
										index={idx}
										power={power}
										active={hoveredNode?.name === power.name}
										onHover={setHoveredNode}
									/>
								))}
							</div>

							{/* Khối thông tin: Bây giờ nằm bên dưới bản đồ thay vì đè lên (absolute) */}
							<div
								className={`relative w-full bg-surface-hover border-x border-b border-border sm:p-4 rounded-b-lg transition-all duration-300 ${
									hoveredNode
										? "opacity-100 min-h-[80px]"
										: "opacity-0 min-h-0 h-0 overflow-hidden p-0 border-none"
								}`}
							>
								{hoveredNode && (
									<div className='animate-in fade-in slide-in-from-top-2'>
										<button
											onClick={() => setHoveredNode(null)}
											className='absolute top-2 right-2 text-text-secondary p-1 hover:text-primary-500'
										>
											<X size={16} />
										</button>
										<div className='flex flex-row gap-3 items-center'>
											<div className='bg-surface-bg p-1 shrink-0'>
												<img
													src={hoveredNode.image}
													className='w-8 h-8 sm:w-12 sm:h-12 object-contain'
													alt='icon'
												/>
											</div>
											<div className='flex-1 min-w-0'>
												<h3 className='text-[13px] sm:text-base font-bold text-primary-500 uppercase truncate'>
													{hoveredNode.name}
												</h3>
												<div
													className='text-[11px] sm:text-sm text-text-secondary leading-[1.2] sm:leading-normal line-clamp-4 sm:line-clamp-none max-h-[60px]'
													dangerouslySetInnerHTML={{
														__html: hoveredNode.description,
													}}
												/>
											</div>
											{hoveredNode.powerCode && (
												<Link
													to={`/power/${encodeURIComponent(
														hoveredNode.powerCode
													)}`}
													className='shrink-0 bg-primary-500/10 text-primary-500 px-3 py-1.5 rounded text-[10px] font-bold hover:bg-primary-500 hover:text-white transition-colors'
												>
													CHI TIẾT
												</Link>
											)}
										</div>
									</div>
								)}
							</div>

							{/* Thêm khoảng cách sau khối chòm sao */}
							<div className='mb-8'></div>
						</>
					)}

					{/* Các phần còn lại (Video, Relics, Runes, Items) giữ nguyên 100% CSS cũ */}
					<h2 className='text-lg sm:text-3xl font-semibold mt-4 sm:mt-6 text-text-primary font-primary'>
						Video giới thiệu
					</h2>
					<div className='flex justify-center mb-4 sm:mb-6 sm:p-4 aspect-video bg-surface-hover rounded-lg'>
						<iframe
							width='100%'
							height='100%'
							src={videoLink}
							title='Champion Video'
							frameBorder='0'
							allowFullScreen
						></iframe>
					</div>

					{defaultRelicsSetsFull.some(set => set.relics?.length > 0) && (
						<>
							<h2 className='text-lg sm:text-3xl font-semibold m-3 sm:m-5 text-text-primary font-primary'>
								Bộ cổ vật
							</h2>
							<div className='grid grid-cols-1 gap-2 sm:gap-4 rounded-md sm:p-4 bg-surface-hover'>
								{defaultRelicsSetsFull.map((set, idx) => (
									<div
										key={idx}
										className='rounded-lg m-1 w-full bg-surface-bg border border-border'
									>
										<div className='grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-4 sm:p-3 pt-0'>
											{set.relics.map((relic, index) => (
												<RenderItem key={index} item={relic} />
											))}
										</div>
									</div>
								))}
							</div>
						</>
					)}

					{isSpiritBlossom && runesFull.length > 0 && (
						<>
							<h2 className='text-lg sm:text-3xl font-semibold my-3 sm:m-5 text-text-primary font-primary'>
								Ngọc
							</h2>
							<div className='grid grid-cols-1 md:grid-cols-2 border border-border gap-2 sm:gap-4 rounded-md p-2 sm:p-4 bg-surface-hover'>
								{runesFull.map((rune, index) => (
									<RenderItem key={index} item={rune} />
								))}
							</div>
						</>
					)}

					{adventurePowersFull.length > 0 && (
						<>
							<h2 className='text-lg sm:text-3xl font-semibold my-3 sm:m-5 text-text-primary font-primary'>
								Sức mạnh khuyên dùng
							</h2>
							<div className='grid grid-cols-1 md:grid-cols-2 border border-border gap-2 sm:gap-4 rounded-md p-2 sm:p-4 bg-surface-hover'>
								{adventurePowersFull.map((power, index) => (
									<RenderItem key={index} item={power} />
								))}
							</div>
						</>
					)}

					{defaultItemsFull.length > 0 && (
						<>
							<h2 className='text-lg sm:text-3xl font-semibold my-3 sm:m-5 text-text-primary font-primary'>
								Vật phẩm khuyên dùng
							</h2>
							<div className='grid grid-cols-1 md:grid-cols-2 border border-border gap-2 sm:gap-4 rounded-md p-2 sm:p-4 bg-surface-hover'>
								{defaultItemsFull.map((item, index) => (
									<RenderItem key={index} item={item} />
								))}
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
}

export default memo(ChampionDetail);
