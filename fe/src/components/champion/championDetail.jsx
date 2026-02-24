// src/pages/championDetail.jsx
import { memo, useMemo, useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Link, useParams, useNavigate } from "react-router-dom";
import iconRegions from "../../assets/data/iconRegions.json";
// Đã loại bỏ: import constellationData from "./constellation.json";
import { ChevronLeft, Loader2, Star, Sparkles } from "lucide-react";
import LatestComments from "../comment/latestComments";
import Button from "../common/button";
import PageTitle from "../common/pageTitle";
import SafeImage from "../common/SafeImage";

// --- THÀNH PHẦN CONSTELLATION NODE (GIỮ NGUYÊN CSS) ---
const ConstellationNode = ({ power, index, active, onShowTooltip }) => {
	const nodeRef = useRef(null);

	const leftPos =
		typeof power.pos.x === "number" ? `${power.pos.x}%` : power.pos.x;
	const topPos =
		typeof power.pos.y === "number" ? `${power.pos.y}%` : power.pos.y;

	const StarIcon = ({ color, glowColor }) => (
		<svg
			viewBox='0 0 100 100'
			className='w-6 h-6 sm:w-12 sm:h-12'
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
			onShowTooltip(power, { x: rect.left + rect.width / 2, y: rect.top - 10 });
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
				className='w-6 h-6 sm:w-14 sm:h-14 rounded-full object-contain'
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
				<div className='absolute -top-1 -right-0.5 sm:-top-2 sm:-right-1 z-20 text-yellow-400 animate-pulse'>
					<Sparkles fill='currentColor' className='w-2 h-2 sm:w-4 sm:h-4' />
				</div>
			)}

			<div className='relative flex items-center justify-center'>
				<div
					className={`absolute inset-0 rounded-full blur-2xl transition-opacity duration-500 ${
						power.isRecommended || active
							? "opacity-80 bg-yellow-400 animate-pulse"
							: "opacity-0"
					}`}
				/>

				<div className='relative flex items-center justify-center'>
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

// --- THÀNH PHẦN ĐƯỜNG NỐI (GIỮ NGUYÊN CSS) ---
const ConstellationLine = ({ x1, y1, x2, y2, isRecommended }) => {
	const angle = Math.atan2(y2 - y1, x2 - x1);
	const offset = window.innerWidth < 640 ? 1.5 : 3.0;
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

// --- THÀNH PHẦN HIỂN THỊ ITEM (GIỮ NGUYÊN CSS) ---
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
	const [constellationData, setConstellationData] = useState(null); // Lưu dữ liệu từ API constellations
	const [resolvedPowers, setResolvedPowers] = useState([]);
	const [resolvedItems, setResolvedItems] = useState([]);
	const [resolvedRelics, setResolvedRelics] = useState([]);
	const [resolvedRunes, setResolvedRunes] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const [hoveredNode, setHoveredNode] = useState(null);
	const [tooltipCoords, setTooltipCoords] = useState(null);
	const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

	useEffect(() => {
		let isMounted = true;
		const controller = new AbortController();
		const signal = controller.signal;

		const initData = async () => {
			try {
				setLoading(true);

				// 1. Lấy thông tin tướng và thông tin chòm sao từ API song song
				const [champRes, constRes] = await Promise.all([
					fetch(`${apiUrl}/api/champions/${championID}`, { signal }),
					fetch(`${apiUrl}/api/constellations/${championID}`, { signal }),
				]);

				if (!champRes.ok) throw new Error("Không thể tải thông tin tướng.");
				const champData = await champRes.json();

				// Chòm sao có thể không tồn tại cho mọi tướng, nên không throw error ngay
				const constData = constRes.ok ? await constRes.json() : null;

				if (!isMounted) return;
				setChampion(champData);
				setConstellationData(constData);

				// 2. Xác định danh sách tên cần resolve
				const constellationNames = constData
					? constData.nodes.map(n => n.nodeName)
					: champData.powerStars || [];

				const allPowerNames = [
					...new Set([
						...(champData.adventurePowers || []),
						...constellationNames,
					]),
				];

				const relicNames = Array.from(
					{ length: 6 },
					(_, i) => champData[`defaultRelicsSet${i + 1}`] || [],
				).flat();

				const resolveBatchWithSignal = async (endpoint, names) => {
					if (!names || names.length === 0) return [];
					try {
						const res = await fetch(`${apiUrl}/api/${endpoint}/resolve`, {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({ names }),
							signal,
						});
						return res.ok ? await res.json() : [];
					} catch (err) {
						if (err.name === "AbortError") return [];
						return [];
					}
				};

				// 3. Resolve dữ liệu chi tiết
				const [pDetails, iDetails, rDetails, ruDetails] = await Promise.all([
					resolveBatchWithSignal("powers", allPowerNames),
					resolveBatchWithSignal("items", champData.defaultItems || []),
					resolveBatchWithSignal("relics", relicNames),
					resolveBatchWithSignal("runes", champData.rune || []),
				]);

				if (isMounted) {
					setResolvedPowers(pDetails);
					setResolvedItems(iDetails);
					setResolvedRelics(rDetails);
					setResolvedRunes(ruDetails);
				}
			} catch (err) {
				if (isMounted && err.name !== "AbortError") {
					setError(err.message);
				}
			} finally {
				if (isMounted) setLoading(false);
			}
		};

		initData();

		return () => {
			isMounted = false;
			controller.abort();
		};
	}, [championID, apiUrl]);

	const constellationInfo = useMemo(() => {
		if (!champion) return { nodes: [], backgroundImage: "" };

		// Sử dụng constellationData từ API thay vì file JSON
		if (constellationData) {
			const nodes = constellationData.nodes.map(node => {
				const p = resolvedPowers.find(x => x.name === node.nodeName);
				return {
					...node,
					name: node.nodeName,
					image: p?.assetAbsolutePath || "/images/placeholder.png",
					description:
						node.description || p?.description || p?.descriptionRaw || "",
					pos: node.position,
					isRecommended: node.isRecommended || false,
				};
			});
			return { nodes, backgroundImage: constellationData.backgroundImage };
		}

		// Fallback nếu không có dữ liệu chòm sao từ API
		const fallbackNodes = (champion.powerStars || []).map((name, i) => {
			const p = resolvedPowers.find(x => x.name === name);
			return {
				nodeID: `fallback-${i}`,
				name: name,
				image: p?.assetAbsolutePath || "/images/placeholder.png",
				description: p?.description || p?.descriptionRaw || "",
				pos: { x: 15 + i * 15, y: 50 },
				nextNodes:
					i < champion.powerStars.length - 1 ? [`fallback-${i + 1}`] : [],
				nodeType: "starPower",
				isRecommended: false,
			};
		});
		return {
			nodes: fallbackNodes,
			backgroundImage: champion?.assets?.[0]?.avatar,
		};
	}, [champion, constellationData, resolvedPowers]);

	const adventurePowersFull = useMemo(
		() =>
			(champion?.adventurePowers || []).map(name => {
				const p = resolvedPowers.find(x => x.name === name);
				return {
					name,
					image: p?.assetAbsolutePath || "/images/placeholder.png",
					description: p?.description || "",
					powerCode: p?.powerCode,
				};
			}),
		[champion, resolvedPowers],
	);

	const defaultItemsFull = useMemo(
		() =>
			(champion?.defaultItems || []).map(name => {
				const i = resolvedItems.find(x => x.name === name);
				return {
					name,
					image: i?.assetAbsolutePath || "/images/placeholder.png",
					description: i?.description || "",
					itemCode: i?.itemCode,
				};
			}),
		[champion, resolvedItems],
	);

	const runesFull = useMemo(
		() =>
			(champion?.rune || []).map(name => {
				const r = resolvedRunes.find(x => x.name === name);
				return {
					name,
					image: r?.assetAbsolutePath || "/images/placeholder.png",
					description: r?.description || "",
					runeCode: r?.runeCode,
				};
			}),
		[champion, resolvedRunes],
	);

	const relicSets = useMemo(() => {
		if (!champion) return [];
		return Array.from({ length: 6 }, (_, i) => {
			const names = champion[`defaultRelicsSet${i + 1}`] || [];
			return {
				setNumber: i + 1,
				relics: names
					.map(name => {
						const r = resolvedRelics.find(x => x.name === name);
						return {
							name,
							image: r?.assetAbsolutePath || "/images/placeholder.png",
							description: r?.description || "",
							relicCode: r?.relicCode,
						};
					})
					.filter(r => r.name),
			};
		}).filter(s => s.relics.length > 0);
	}, [champion, resolvedRelics]);

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
				<div className='relative mx-auto max-w-[1200px] sm:p-6 rounded-lg bg-surface-bg border'>
					<div className='flex flex-col md:flex-row border gap-4 rounded-md bg-surface-hover sm:p-4'>
						<SafeImage
							className='h-auto max-h-[300px] object-contain rounded-lg'
							src={champion.assets?.[0]?.gameAbsolutePath}
							alt={champion.name}
						/>
						<div className='flex-1'>
							<div className='flex flex-col sm:flex-row sm:justify-between p-2 m-1 gap-2'>
								<h1 className='text-2xl sm:text-4xl font-bold font-primary'>
									{champion.name}
								</h1>
								<div className='flex flex-wrap gap-2 items-center'>
									<div className='flex items-center gap-1 px-2.5 py-1.5 bg-yellow-500/20 border border-yellow-500 rounded-full'>
										<span className='text-sm font-bold text-yellow-900'>
											{champion.maxStar}
										</span>
										<Star size={16} className='text-yellow-600 fill-current' />
									</div>
									{champion.regions?.map((r, i) => (
										<img
											key={i}
											src={
												iconRegions.find(item => item.name === r)
													?.iconAbsolutePath || "/fallback-image.svg"
											}
											alt={r}
											className='w-10 h-10'
										/>
									))}
								</div>
							</div>
							<div
								className={`mt-1 mx-1 p-4 border rounded-lg bg-surface-bg ${!isDescriptionExpanded ? "overflow-y-auto h-48 sm:h-60" : "h-auto"}`}
							>
								{champion.description
									?.replace(/\\n/g, "\n")
									.split(/\n/)
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

					{constellationInfo.nodes.length > 0 && (
						<>
							<h2 className='p-1 text-lg sm:text-3xl font-semibold my-1 uppercase font-primary'>
								Chòm sao
							</h2>
							<div className='p-1 relative w-full aspect-video bg-slate-950 border rounded-lg overflow-hidden shadow-2xl'>
								<img
									src={constellationInfo.backgroundImage}
									className='absolute inset-0 w-full h-full object-cover opacity-10 blur-sm pointer-events-none'
									alt='bg'
								/>
								<svg className='absolute inset-0 w-full h-full pointer-events-none'>
									<defs>
										<marker
											id='arrowhead'
											markerWidth={window.innerWidth < 640 ? "3" : "5"}
											markerHeight={window.innerWidth < 640 ? "3" : "5"}
											refX={window.innerWidth < 640 ? "2.5" : "4.8"}
											refY={window.innerWidth < 640 ? "1.5" : "2.5"}
											orient='auto'
										>
											<path
												d={
													window.innerWidth < 640
														? "M0,0 L3,1.5 L0,3 Z"
														: "M0,0 L5,2.5 L0,5 Z"
												}
												fill='rgba(234, 179, 8, 0.6)'
											/>
										</marker>
										<marker
											id='arrowhead-recommended'
											markerWidth={window.innerWidth < 640 ? "3" : "5"}
											markerHeight={window.innerWidth < 640 ? "3" : "5"}
											refX={window.innerWidth < 640 ? "2.5" : "4.8"}
											refY={window.innerWidth < 640 ? "1.5" : "2.5"}
											orient='auto'
										>
											<path
												d={
													window.innerWidth < 640
														? "M0,0 L3,1.5 L0,3 Z"
														: "M0,0 L5,2.5 L0,5 Z"
												}
												fill='rgba(234, 179, 8, 1)'
											/>
										</marker>
									</defs>
									{constellationInfo.nodes.map(node =>
										node.nextNodes.map(tID => {
											const target = constellationInfo.nodes.find(
												n => n.nodeID === tID,
											);
											return (
												target && (
													<ConstellationLine
														key={`${node.nodeID}-${tID}`}
														x1={node.pos.x}
														y1={node.pos.y}
														x2={target.pos.x}
														y2={target.pos.y}
														isRecommended={
															node.isRecommended && target.isRecommended
														}
													/>
												)
											);
										}),
									)}
								</svg>
								{constellationInfo.nodes.map((node, index) => (
									<ConstellationNode
										key={index}
										index={index}
										power={node}
										active={hoveredNode?.name === node.name}
										onShowTooltip={(n, c) => {
											setHoveredNode(n);
											setTooltipCoords(c);
										}}
									/>
								))}
								{hoveredNode &&
									tooltipCoords &&
									createPortal(
										<div
											className='fixed bg-surface-bg border border-primary-500 rounded-lg shadow-2xl p-3 z-[9999] pointer-events-none'
											style={{
												left: `${tooltipCoords.x}px`,
												top: `${tooltipCoords.y}px`,
												transform: "translate(-50%, -100%)",
												maxWidth: "280px",
											}}
										>
											<h3 className='text-primary-500 font-bold text-sm uppercase mb-1'>
												{hoveredNode.name}
											</h3>
											<div
												className='text-text-secondary text-xs leading-relaxed'
												dangerouslySetInnerHTML={{
													__html: hoveredNode.description,
												}}
											/>
											<div className='absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-primary-500' />
										</div>,
										document.body,
									)}
							</div>
						</>
					)}

					<h2 className='p-1 text-lg sm:text-3xl font-semibold mt-2 font-primary'>
						Video giới thiệu
					</h2>
					<div className='aspect-video bg-surface-hover rounded-lg mb-1'>
						<iframe
							width='100%'
							height='100%'
							src={
								champion?.videoLink ||
								"https://www.youtube.com/embed/mZgnjMeTI5E"
							}
							frameBorder='0'
							allowFullScreen
						></iframe>
					</div>

					{relicSets.length > 0 && (
						<>
							<h2 className='p-1 text-lg sm:text-3xl font-semibold mt-2 font-primary'>
								Bộ cổ vật
							</h2>
							<div className='grid gap-4 bg-surface-hover p-4 rounded-md'>
								{relicSets.map((set, idx) => (
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
					<div className='mt-6'>
						<LatestComments championID={championID} />
					</div>
				</div>
			</div>
		</div>
	);
}

export default memo(ChampionDetail);
