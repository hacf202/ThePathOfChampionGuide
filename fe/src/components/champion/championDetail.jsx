// src/pages/championDetail.jsx
import { memo, useMemo, useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Link, useParams, useNavigate } from "react-router-dom";
import iconRegions from "../../assets/data/iconRegions.json";
import constellationData from "./constellation.json";
import { ChevronLeft, Loader2, Star, X } from "lucide-react";
import LatestComments from "../comment/latestComments";
import Button from "../common/button";
import PageTitle from "../common/pageTitle";
import SafeImage from "../common/SafeImage";

// THÀNH PHẦN NODE VỚI KÍCH THƯỚC TỐI ƯU
const ConstellationNode = ({
	power,
	index,
	active,
	onHover,
	onShowTooltip,
}) => {
	const nodeRef = useRef(null);

	const leftPos =
		typeof power.pos.x === "number" ? `${power.pos.x}%` : power.pos.x;
	const topPos =
		typeof power.pos.y === "number" ? `${power.pos.y}%` : power.pos.y;

	const StarIcon = ({ color, glowColor }) => (
		<svg
			viewBox='0 0 100 100'
			className={`w-6 h-6 sm:w-12 sm:h-12`}
			style={{
				filter: `drop-shadow(0 0 6px ${glowColor})`,
				transform: "rotate(25deg)",
			}}
		>
			<path
				d='M50 0 L58 42 L100 50 L58 58 L50 100 L42 58 L0 50 L42 42 Z'
				fill={color}
			/>
		</svg>
	);

	const handleMouseEnter = () => {
		if (nodeRef.current) {
			const rect = nodeRef.current.getBoundingClientRect();
			const coords = {
				x: rect.left + rect.width / 2,
				y: rect.top - 10,
			};
			onShowTooltip(power, coords);
		}
	};

	const renderNodeContent = () => {
		if (power.nodeType === "bonusStar")
			return <StarIcon color='white' glowColor='rgba(255,255,255,0.8)' />;
		if (power.nodeType === "bonusStarGem")
			return <StarIcon color='#ff4dfc' glowColor='rgba(255,77,252,0.8)' />;
		return (
			<img
				src={power.image}
				alt={power.name}
				className='w-5 h-5 sm:w-12 sm:h-12 rounded-full object-contain'
			/>
		);
	};

	return (
		<div
			ref={nodeRef}
			className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 z-10 ${
				active ? "z-50 scale-125" : "hover:scale-110"
			}`}
			style={{ left: leftPos, top: topPos }}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={() => onShowTooltip(null, null)}
		>
			{power.isRecommended && (
				<div className='absolute -top-4 sm:-top-6 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-[6px] sm:text-[8px] font-black px-1 rounded-sm shadow-lg whitespace-nowrap animate-bounce'>
					ĐỀ XUẤT
				</div>
			)}

			<div className='relative flex items-center justify-center'>
				<div
					className={`absolute inset-0 rounded-full blur-xl transition-opacity duration-500 ${
						power.isRecommended || active
							? "opacity-100 bg-yellow-400 animate-pulse"
							: "opacity-0"
					}`}
				/>
				<div
					className={`relative transition-colors flex items-center justify-center ${
						power.nodeType === "starPower"
							? "bg-surface-bg border-2 rounded-full p-0.5 sm:p-1"
							: ""
					} ${
						(power.isRecommended || active) && power.nodeType === "starPower"
							? "border-yellow-400 ring-2 ring-yellow-500 ring-offset-0"
							: power.nodeType === "starPower"
								? "border-border"
								: ""
					}`}
				>
					{renderNodeContent()}
					{power.nodeType === "starPower" && (
						<div
							className={`absolute -bottom-1 -right-1 text-black text-[7px] sm:text-[10px] font-black px-1 sm:px-1.5 rounded-sm border border-black shadow-sm ${power.isRecommended ? "bg-yellow-400" : "bg-yellow-500"}`}
						>
							{index + 1}★
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

// COMPONENT HIỂN THỊ ĐƯỜNG NỐI VỚI MŨI TÊN CHỈ SÁT NODE
const ConstellationLine = ({ x1, y1, x2, y2, isRecommended }) => {
	const angle = Math.atan2(y2 - y1, x2 - x1);
	// Giảm offset tối đa để mũi tên chạm sát vào viền node (Mobile: 1.8%, Desktop: 3.5%)
	const offset = window.innerWidth < 640 ? 1.8 : 3.5;

	const finalX2 = x2 - offset * Math.cos(angle);
	const finalY2 = y2 - offset * Math.sin(angle);

	return (
		<line
			x1={`${x1}%`}
			y1={`${y1}%`}
			x2={`${finalX2}%`}
			y2={`${finalY2}%`}
			stroke={
				isRecommended ? "rgba(234, 179, 8, 1)" : "rgba(234, 179, 8, 0.25)"
			}
			strokeWidth={isRecommended ? "3" : "1.5"}
			strokeDasharray={isRecommended ? "0" : "8,4"}
			markerEnd={`url(#${isRecommended ? "arrowhead-recommended" : "arrowhead"})`}
			className={isRecommended ? "drop-shadow-[0_0_8px_rgba(234,179,8,1)]" : ""}
		/>
	);
};

const RenderItem = ({ item }) => {
	if (!item) return null;
	const linkPath = item.powerCode
		? `/power/${encodeURIComponent(item.powerCode)}`
		: item.relicCode
			? `/relic/${encodeURIComponent(item.relicCode)}`
			: item.itemCode
				? `/item/${encodeURIComponent(item.itemCode)}`
				: item.runeCode
					? `/rune/${encodeURIComponent(item.runeCode)}`
					: null;
	const content = (
		<div className='flex items-start gap-1 bg-surface-hover rounded-md h-full hover:border-primary-500 transition-colors p-2'>
			<SafeImage
				src={item.image || "/fallback-image.svg"}
				alt={item.name}
				className='w-16 h-16 rounded-md shrink-0'
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
	const apiUrl = import.meta.env.VITE_API_URL;

	const [champion, setChampion] = useState(null);
	const [powers, setPowers] = useState([]);
	const [items, setItems] = useState([]);
	const [relics, setRelics] = useState([]);
	const [runes, setRunes] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const [hoveredNode, setHoveredNode] = useState(null);
	const [tooltipCoords, setTooltipCoords] = useState(null);
	const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

	const nodePositionsDefault = useMemo(
		() => [
			{ x: 15, y: 65 },
			{ x: 30, y: 40 },
			{ x: 50, y: 60 },
			{ x: 65, y: 35 },
			{ x: 80, y: 70 },
			{ x: 90, y: 45 },
		],
		[],
	);

	useEffect(() => {
		let isMounted = true;
		const fetchData = async () => {
			try {
				setLoading(true);
				const responses = await Promise.all([
					fetch(`${apiUrl}/api/champions?limit=-1`),
					fetch(`${apiUrl}/api/powers?limit=-1`),
					fetch(`${apiUrl}/api/items?limit=-1`),
					fetch(`${apiUrl}/api/relics?limit=-1`),
					fetch(`${apiUrl}/api/runes?limit=-1`),
				]);
				if (!responses.every(r => r.ok))
					throw new Error("Không thể tải dữ liệu.");
				const results = await Promise.all(responses.map(r => r.json()));
				if (!isMounted) return;
				const [championsJson, powersJson, itemsJson, relicsJson, runesJson] =
					results;
				const found = (championsJson.items || []).find(
					c => c.championID === championID,
				);
				if (!found) setError(`Không tìm thấy tướng: ${championID}`);
				else setChampion(found);
				setPowers(powersJson.items || []);
				setItems(itemsJson.items || []);
				setRelics(relicsJson.items || []);
				setRunes(runesJson.items || []);
			} catch (err) {
				if (isMounted) setError(err.message);
			} finally {
				if (isMounted) setLoading(false);
			}
		};
		fetchData();
		return () => {
			isMounted = false;
		};
	}, [championID, apiUrl]);

	const powerStarsFull = useMemo(() => {
		if (!champion) return [];
		const isMatch =
			constellationData && constellationData.championID === championID;
		if (isMatch) {
			return constellationData.nodes.map(node => {
				const p = powers.find(x => x.name === node.nodeName);
				return {
					nodeID: node.nodeID,
					name: node.nodeName,
					image: p?.assetAbsolutePath || "/images/placeholder.png",
					description: node.description,
					pos: node.position,
					nextNodes: node.nextNodes || [],
					isRecommended: node.isRecommended,
					nodeType: node.nodeType,
				};
			});
		}
		return (champion.powerStars || [])
			.map((name, index) => {
				const p = powers.find(x => x.name === name);
				return {
					name,
					image: p?.assetAbsolutePath || "/images/placeholder.png",
					description: p?.description || p?.descriptionRaw || "",
					pos: nodePositionsDefault[index] || { x: 50, y: 50 },
					nextNodes: [],
					isRecommended: false,
					nodeType: "starPower",
				};
			})
			.filter(i => i.name);
	}, [champion, championID, powers, nodePositionsDefault]);

	const videoLink =
		champion?.videoLink || "https://www.youtube.com/embed/mZgnjMeTI5E";
	const findRegionIconLink = n =>
		iconRegions.find(i => i.name === n)?.iconAbsolutePath ||
		"/fallback-image.svg";
	const bgMap =
		constellationData?.championID === championID
			? constellationData.backgroundImage
			: champion?.assets?.[0]?.avatar || "/fallback-image.svg";
	const isSpiritBlossom = champion?.regions?.includes("Hoa Linh Lục Địa");

	const adventurePowersFull = useMemo(
		() =>
			(champion?.adventurePowers || [])
				.map(name => {
					const p = powers.find(x => x.name === name);
					return {
						name,
						image: p?.assetAbsolutePath || "/images/placeholder.png",
						description: p?.description || p?.descriptionRaw || "",
						powerCode: p?.powerCode || null,
					};
				})
				.filter(i => i.name),
		[champion, powers],
	);

	const defaultItemsFull = useMemo(
		() =>
			(champion?.defaultItems || [])
				.map(name => {
					const i = items.find(x => x.name === name);
					return {
						name,
						image: i?.assetAbsolutePath || "/images/placeholder.png",
						description: i?.description || "",
						itemCode: i?.itemCode || null,
					};
				})
				.filter(i => i.name),
		[champion, items],
	);

	const runesFull = useMemo(
		() =>
			(champion?.rune || [])
				.map(name => {
					const r = runes.find(x => x.name === name);
					return {
						name,
						image: r?.assetAbsolutePath || "/images/placeholder.png",
						description: r?.description || "",
						runeCode: r?.runeCode || null,
					};
				})
				.filter(i => i.name),
		[champion, runes],
	);

	const defaultRelicsSetsFull = useMemo(() => {
		if (!champion) return [];
		const sets = [];
		for (let i = 1; i <= 6; i++) {
			const arr = champion[`defaultRelicsSet${i}`];
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
					.filter(r => r.name);
				if (relicsInSet.length > 0)
					sets.push({ setNumber: i, relics: relicsInSet });
			}
		}
		return sets;
	}, [champion, relics]);

	if (loading)
		return (
			<div className='flex justify-center p-20'>
				<Loader2 className='animate-spin text-primary-500' size={48} />
			</div>
		);
	if (error || !champion)
		return (
			<div className='p-10 text-center text-red-500'>
				<p>{error}</p>
				<Button onClick={() => navigate(-1)} className='mt-4'>
					Quay lại
				</Button>
			</div>
		);

	return (
		<div>
			<PageTitle
				title={champion.name}
				description={`POC GUIDE cho ${champion.name}`}
				type='article'
			/>
			<div className='max-w-[1200px] mx-auto p-0 sm:p-6 text-text-primary font-secondary'>
				<Button variant='outline' onClick={() => navigate(-1)} className='mb-4'>
					<ChevronLeft size={18} /> Quay lại
				</Button>
				<div className='relative mx-auto max-w-[1200px] sm:p-6 rounded-lg bg-surface-bg border '>
					<div className='flex flex-col md:flex-row border  gap-4 rounded-md bg-surface-hover sm:p-4'>
						<SafeImage
							className='h-auto max-h-[300px] object-contain rounded-lg'
							src={
								champion.assets?.[0]?.gameAbsolutePath ||
								"/images/placeholder.png"
							}
							alt={champion.name}
						/>
						<div className='flex-1'>
							<div className='flex flex-col sm:flex-row sm:justify-between rounded-lg p-2 m-1 gap-2'>
								<h1 className='text-2xl sm:text-4xl font-bold font-primary'>
									{champion.name}
								</h1>
								<div className='flex flex-wrap gap-2 mb-2 items-center'>
									<div className='flex items-center gap-1 px-2.5 py-1.5 bg-yellow-500/20 border border-yellow-500 rounded-full shadow-sm'>
										<span className='text-sm sm:text-base font-bold text-yellow-900'>
											{champion.maxStar}
										</span>
										<Star size={16} className='text-yellow-600 fill-current' />
									</div>
									{champion.regions?.map((r, i) => (
										<img
											key={i}
											src={findRegionIconLink(r)}
											alt={r}
											className='w-10 h-10'
										/>
									))}
								</div>
							</div>
							<div
								className={`mt-1 mx-1 p-4 border border-border rounded-lg bg-surface-bg text-text-secondary ${!isDescriptionExpanded ? "overflow-y-auto h-48 sm:h-60" : "h-auto"}`}
							>
								{champion.description
									?.replace(/\\n/g, "\n")
									.split(/\r?\n/)
									.map((line, i) => (
										<p key={i} className={i > 0 ? "mt-3" : ""}>
											{line || <span className='text-transparent'>empty</span>}
										</p>
									))}
							</div>
							<button
								onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
								className='text-primary-500 text-sm font-bold mt-2 ml-2'
							>
								{isDescriptionExpanded ? "Thu gọn" : "Hiển thị toàn bộ"}
							</button>
						</div>
					</div>

					{/* PHẦN CONSTELLATION MAP VỚI MŨI TÊN CHỈ SÁT NODE */}
					{powerStarsFull.length > 0 && (
						<>
							<h2 className='p-1 text-lg sm:text-3xl font-semibold my-1 uppercase font-primary'>
								Chòm sao
							</h2>
							<div className='p-1 relative w-full aspect-video bg-slate-950 border rounded-lg overflow-hidden shadow-2xl'>
								<img
									src={bgMap}
									className='absolute inset-0 w-full h-full object-cover opacity-10 blur-sm scale-110 pointer-events-none'
									alt='bg'
								/>
								<svg className='absolute inset-0 w-full h-full pointer-events-none'>
									<defs>
										{/* Mũi tên nhỏ hơn cho mobile */}
										<marker
											id='arrowhead'
											markerWidth={window.innerWidth < 640 ? "3.5" : "5"}
											markerHeight={window.innerWidth < 640 ? "3.5" : "5"}
											refX='4.8'
											refY={window.innerWidth < 640 ? "1.75" : "2.5"}
											orient='auto'
										>
											<path
												d={
													window.innerWidth < 640
														? "M0,0 L3.5,1.75 L0,3.5 Z"
														: "M0,0 L5,2.5 L0,5 Z"
												}
												fill='rgba(234, 179, 8, 0.6)'
											/>
										</marker>
										<marker
											id='arrowhead-recommended'
											markerWidth={window.innerWidth < 640 ? "3.5" : "5"}
											markerHeight={window.innerWidth < 640 ? "3.5" : "5"}
											refX='4.8'
											refY={window.innerWidth < 640 ? "1.75" : "2.5"}
											orient='auto'
										>
											<path
												d={
													window.innerWidth < 640
														? "M0,0 L3.5,1.75 L0,3.5 Z"
														: "M0,0 L5,2.5 L0,5 Z"
												}
												fill='rgba(234, 179, 8, 1)'
											/>
										</marker>
									</defs>
									{powerStarsFull.map((power, idx) => {
										const isMatch =
											constellationData?.championID === championID;
										if (isMatch) {
											return power.nextNodes.map(tID => {
												const target = powerStarsFull.find(
													n => n.nodeID === tID,
												);
												if (!target) return null;
												return (
													<ConstellationLine
														key={`${power.nodeID}-${tID}`}
														x1={power.pos.x}
														y1={power.pos.y}
														x2={target.pos.x}
														y2={target.pos.y}
														isRecommended={
															power.isRecommended && target.isRecommended
														}
													/>
												);
											});
										} else if (idx < powerStarsFull.length - 1) {
											const next = powerStarsFull[idx + 1];
											return (
												<ConstellationLine
													key={idx}
													x1={power.pos.x}
													y1={power.pos.y}
													x2={next.pos.x}
													y2={next.pos.y}
													isRecommended={false}
												/>
											);
										}
										return null;
									})}
								</svg>
								{powerStarsFull.map((power, index) => (
									<ConstellationNode
										key={index}
										index={index}
										power={power}
										active={hoveredNode?.name === power.name}
										onHover={setHoveredNode}
										onShowTooltip={(node, coords) => {
											setHoveredNode(node);
											setTooltipCoords(coords);
										}}
									/>
								))}

								{hoveredNode &&
									tooltipCoords &&
									createPortal(
										<div
											className='fixed bg-surface-bg border border-primary-500 rounded-lg shadow-2xl p-2 sm:p-3 z-[9999] pointer-events-none animate-in fade-in zoom-in-95 duration-200'
											style={{
												left: `${tooltipCoords.x}px`,
												top: `${tooltipCoords.y}px`,
												transform: "translate(-50%, -100%)",
												width: "max-content",
												maxWidth: window.innerWidth < 640 ? "180px" : "280px",
											}}
										>
											<h3 className='text-primary-500 font-bold text-[10px] sm:text-sm uppercase mb-1'>
												{hoveredNode.name}
											</h3>
											<div
												className='text-text-secondary text-[9px] sm:text-xs leading-relaxed line-clamp-5 sm:line-clamp-none'
												dangerouslySetInnerHTML={{
													__html: hoveredNode.description,
												}}
											/>
											<div className='absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-primary-500' />
										</div>,
										document.body,
									)}
							</div>
							<div className='mb-2'></div>
						</>
					)}

					<h2 className='p-1 text-lg sm:text-3xl font-semibold mt-2 font-primary'>
						Video giới thiệu
					</h2>
					<div className='aspect-video bg-surface-hover rounded-lg mb-1'>
						<iframe
							width='100%'
							height='100%'
							src={videoLink}
							frameBorder='0'
							allowFullScreen
						></iframe>
					</div>
					{defaultRelicsSetsFull.length > 0 && (
						<>
							<h2 className='p-1 text-lg sm:text-3xl font-semibold mt-2 font-primary'>
								Bộ cổ vật
							</h2>
							<div className='grid gap-4 bg-surface-hover p-1 md:p-4 rounded-md'>
								{defaultRelicsSetsFull.map((set, idx) => (
									<div
										key={idx}
										className='bg-surface-bg border border-border rounded-lg grid grid-cols-1 md:grid-cols-3'
									>
										{set.relics.map((r, i) => (
											<RenderItem key={i} item={r} />
										))}
									</div>
								))}
							</div>
						</>
					)}
					{isSpiritBlossom && runesFull.length > 0 && (
						<>
							<h2 className='text-lg sm:text-3xl font-semibold my-1 font-primary'>
								Ngọc
							</h2>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4 bg-surface-hover p-1 rounded-md border border-border'>
								{runesFull.map((rune, index) => (
									<RenderItem key={index} item={rune} />
								))}
							</div>
						</>
					)}
					{adventurePowersFull.length > 0 && (
						<>
							<h2 className='text-lg sm:text-3xl font-semibold my-1 font-primary'>
								Sức mạnh khuyên dùng
							</h2>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4 bg-surface-hover p-1 rounded-md border border-border'>
								{adventurePowersFull.map((power, index) => (
									<RenderItem key={index} item={power} />
								))}
							</div>
						</>
					)}
					{defaultItemsFull.length > 0 && (
						<>
							<h2 className='text-lg sm:text-3xl font-semibold my-1 font-primary'>
								Vật phẩm khuyên dùng
							</h2>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4 bg-surface-hover p-1 rounded-md border border-border'>
								{defaultItemsFull.map((item, index) => (
									<RenderItem key={index} item={item} />
								))}
							</div>
						</>
					)}
					<div className=' sm:px-0'>
						<LatestComments championID={championID} />
					</div>
				</div>
			</div>
		</div>
	);
}

export default memo(ChampionDetail);
