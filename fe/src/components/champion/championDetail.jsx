// src/pages/championDetail.jsx
import { memo, useMemo, useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import iconRegions from "../../assets/data/iconRegions.json";
import { ChevronLeft, Loader2, Star, Sparkles, XCircle } from "lucide-react";
import LatestComments from "../comment/latestComments";
import Button from "../common/button";
import PageTitle from "../common/pageTitle";
import SafeImage from "../common/SafeImage";

// --- THÀNH PHẦN SKELETON ---
const ChampionDetailSkeleton = () => (
	<div className='max-w-[1200px] mx-auto p-0 sm:p-6 animate-pulse'>
		<div className='h-10 w-24 bg-gray-700/50 rounded mb-4 ml-4 sm:ml-0' />
		<div className='bg-surface-bg border rounded-lg p-4 sm:p-6 space-y-8'>
			<div className='flex flex-col md:flex-row gap-4'>
				<div className='w-full md:w-[300px] aspect-[3/4] bg-gray-700/50 rounded-lg' />
				<div className='flex-1 space-y-4'>
					<div className='h-10 w-1/3 bg-gray-700/50 rounded' />
					<div className='h-48 w-full bg-gray-700/50 rounded' />
				</div>
			</div>
			<div className='h-8 w-40 bg-gray-700/50 rounded' />
			<div className='w-full aspect-video bg-gray-700/30 rounded-lg' />
		</div>
	</div>
);

// --- COMPONENT HỖ TRỢ HIỂN THỊ YÊU CẦU (COST) TỪ FILE JSON ---
const RequirementIcon = ({ type }) => {
	let src = "";
	switch (type) {
		case "Fragment":
			src =
				"https://wpocimg.s3.ap-southeast-2.amazonaws.com/icons/Wild_Fragment_icon.png";
			break;
		case "Crystal":
			src =
				"https://wiki.leagueoflegends.com/en-us/images/thumb/PoC_Star_Crystal_icon.png/20px-PoC_Star_Crystal_icon.png?59fc0";
			break;
		case "Nova Crystal":
			src =
				"https://wiki.leagueoflegends.com/en-us/images/thumb/PoC_Nova_Crystal_icon.png/20px-PoC_Nova_Crystal_icon.png?c3074";
			break;
		case "Gemstone":
			src =
				"https://wiki.leagueoflegends.com/en-us/images/thumb/PoC_Gemstone_icon.png/20px-PoC_Gemstone_icon.png?e6e65";
			break;
		default:
			src =
				"https://wpocimg.s3.ap-southeast-2.amazonaws.com/icons/Wild_Fragment_icon.png";
	}
	return (
		<img
			src={src}
			alt={type}
			className='w-[14px] h-[14px] sm:w-[18px] sm:h-[18px] object-contain inline-block'
		/>
	);
};

const RenderRequirements = ({ requirements }) => {
	if (!requirements || requirements.length === 0)
		return <span className='text-text-secondary'>-</span>;

	return (
		<div className='flex flex-wrap items-center justify-center gap-1 text-[11px] sm:text-[13px] font-medium text-text-primary'>
			{requirements.map((req, idx) => (
				<div key={idx} className='flex items-center gap-1'>
					{idx > 0 && (
						<span className='text-text-secondary mx-0.5 text-[10px] sm:text-xs font-bold'>
							+
						</span>
					)}
					<RequirementIcon type={req.type} />
					<span>{req.value}</span>
				</div>
			))}
		</div>
	);
};

// --- COMPONENT HỖ TRỢ HIỂN THỊ SỐ SAO ---
const StarRating = ({ count }) => {
	return (
		<div className='flex flex-wrap justify-center gap-[1px] w-12 mx-auto'>
			{[...Array(count)].map((_, i) => (
				<Star
					key={i}
					size={14}
					className='text-yellow-500 fill-current drop-shadow-sm'
				/>
			))}
		</div>
	);
};

// --- CÁC THÀNH PHẦN CONSTELLATION ---
const ConstellationNode = ({ power, index, active, onShowTooltip }) => {
	const nodeRef = useRef(null);
	const leftPos =
		typeof power.pos.x === "number" ? `${power.pos.x}%` : power.pos.x;
	const topPos =
		typeof power.pos.y === "number" ? `${power.pos.y}%` : power.pos.y;

	const handleMouseEnter = () => {
		if (nodeRef.current) {
			const rect = nodeRef.current.getBoundingClientRect();
			onShowTooltip(power, { x: rect.left + rect.width / 2, y: rect.top - 10 });
		}
	};

	// Đã cập nhật để render thẳng Hình ảnh (image) cho TẤT CẢ các loại Node (Star Power & Bonus Star)
	const renderNodeContent = () => {
		// Kiểm tra xem đây có phải là Bonus Star không (khác starPower)
		const isBonusNode =
			power.nodeType === "bonusStar" || power.nodeType === "bonusStarGem";

		// Nếu là Bonus Node thì tăng kích thước +70% (31px trên mobile, 71px trên màn hình lớn)
		// Ngược lại giữ nguyên kích thước cũ (18px và 42px)
		const sizeClasses = isBonusNode
			? "w-[31px] h-[31px] sm:w-[71px] sm:h-[71px]"
			: "w-[18px] h-[18px] sm:w-[42px] sm:h-[42px]";

		return (
			<img
				src={power.image || "/images/placeholder.png"}
				alt={power.name}
				className={`${sizeClasses} rounded-full object-contain p-0.5 shadow-md transition-all`}
			/>
		);
	};

	return (
		<div
			ref={nodeRef}
			className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 z-10 ${active ? "z-50 scale-125" : "hover:scale-110"}`}
			style={{ left: leftPos, top: topPos }}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={() => onShowTooltip(null, null)}
		>
			{power.isRecommended && (
				<div className='absolute -top-1 -right-0.5 sm:-top-1 sm:-right-0.5 z-20 text-yellow-400 animate-pulse'>
					<Sparkles fill='currentColor' className='w-1.5 h-1.5 sm:w-3 sm:h-3' />
				</div>
			)}
			<div className='relative flex items-center justify-center'>
				<div
					className={`absolute inset-0 rounded-full blur-2xl transition-opacity duration-500 ${power.isRecommended || active ? "opacity-80 bg-yellow-400 animate-pulse" : "opacity-0"}`}
				/>
				<div className='relative flex items-center justify-center'>
					{renderNodeContent()}
					{power.nodeType === "starPower" && (
						<div
							className={`absolute -bottom-1 -right-1 text-black text-[6px] sm:text-[8px] font-black px-1 rounded-sm border border-black shadow-sm ${power.isRecommended ? "bg-yellow-400" : "bg-yellow-500"}`}
						>
							{index + 1}★
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

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

// --- MAIN COMPONENT ---
function ChampionDetail() {
	const { championID } = useParams();
	const navigate = useNavigate();
	const apiUrl = import.meta.env.VITE_API_URL;

	const [champion, setChampion] = useState(null);
	const [constellationData, setConstellationData] = useState(null);
	const [resolvedPowers, setResolvedPowers] = useState([]);
	const [fetchedBonusStars, setFetchedBonusStars] = useState([]); // State mới lưu dữ liệu Bonus Stars
	const [resolvedItems, setResolvedItems] = useState([]);
	const [resolvedRelics, setResolvedRelics] = useState([]);
	const [resolvedRunes, setResolvedRunes] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const [hoveredNode, setHoveredNode] = useState(null);
	const [tooltipCoords, setTooltipCoords] = useState(null);
	const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

	const [activeConstellationTab, setActiveConstellationTab] =
		useState("starPowers");

	useEffect(() => {
		let isMounted = true;
		const controller = new AbortController();
		const signal = controller.signal;

		const initData = async () => {
			try {
				setLoading(true);

				// Đã thêm fetch api bonusStars vào Promise.all
				const [champRes, constRes, bonusRes] = await Promise.all([
					fetch(`${apiUrl}/api/champions/${championID}`, { signal }),
					fetch(`${apiUrl}/api/constellations/${championID}`, { signal }),
					fetch(`${apiUrl}/api/bonusStars`, { signal }),
				]);

				if (!champRes.ok) throw new Error("Không thể tải thông tin tướng.");
				const champData = await champRes.json();
				const constData = constRes.ok ? await constRes.json() : null;
				const bonusData = bonusRes.ok ? await bonusRes.json() : { items: [] };

				if (!isMounted) return;
				setChampion(champData);
				setConstellationData(constData);
				setFetchedBonusStars(bonusData.items || []); // Lưu danh sách Bonus Stars vào state

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

				const resolveBatch = async (endpoint, names) => {
					if (!names || names.length === 0) return [];
					const res = await fetch(`${apiUrl}/api/${endpoint}/resolve`, {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ names }),
						signal,
					});
					return res.ok ? await res.json() : [];
				};

				const [pDetails, iDetails, rDetails, ruDetails] = await Promise.all([
					resolveBatch("powers", allPowerNames),
					resolveBatch("items", champData.defaultItems || []),
					resolveBatch("relics", relicNames),
					resolveBatch("runes", champData.rune || []),
				]);

				if (isMounted) {
					setResolvedPowers(pDetails);
					setResolvedItems(iDetails);
					setResolvedRelics(rDetails);
					setResolvedRunes(ruDetails);
				}
			} catch (err) {
				if (isMounted && err.name !== "AbortError") setError(err.message);
			} finally {
				if (isMounted) setTimeout(() => setLoading(false), 800);
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
		if (constellationData) {
			const nodes = constellationData.nodes.map(node => {
				let resolvedImage = "/images/placeholder.png";
				let resolvedDescription = node.description || "";
				let resolvedName = node.nodeName;

				// Logic phân tách: Lấy ảnh từ resolvedPowers (cho starPower) HOẶC từ fetchedBonusStars (cho bonusStar)
				if (node.nodeType === "starPower" || !node.nodeType) {
					const p = resolvedPowers.find(x => x.name === node.nodeName);
					if (p) {
						resolvedImage = p.assetAbsolutePath || p.image || resolvedImage;
						if (!node.description)
							resolvedDescription = p.description || p.descriptionRaw || "";
					}
				} else {
					// Lấy dữ liệu cho Bonus Stars
					const b = fetchedBonusStars.find(
						x => x.name === node.nodeName || x.bonusStarID === node.nodeName,
					);
					if (b) {
						resolvedImage = b.image || resolvedImage;
						resolvedName = b.name || resolvedName;
						if (!node.description) resolvedDescription = b.description || "";
					}
				}

				return {
					...node,
					name: resolvedName,
					image: resolvedImage,
					description: resolvedDescription,
					pos: node.position,
					isRecommended: node.isRecommended || false,
					nodeType: node.nodeType || "starPower",
					requirements: node.requirements || [],
				};
			});
			return { nodes, backgroundImage: constellationData.backgroundImage };
		}
		const fallbackNodes = (champion.powerStars || []).map((name, i) => {
			const p = resolvedPowers.find(x => x.name === name);
			return {
				nodeID: `fallback-${i}`,
				name,
				image: p?.assetAbsolutePath || "/images/placeholder.png",
				description: p?.description || p?.descriptionRaw || "",
				pos: { x: 15 + i * 15, y: 50 },
				nextNodes:
					i < champion.powerStars.length - 1 ? [`fallback-${i + 1}`] : [],
				nodeType: "starPower",
				isRecommended: false,
				requirements: [],
			};
		});
		return {
			nodes: fallbackNodes,
			backgroundImage: champion?.assets?.[0]?.avatar,
		};
	}, [champion, constellationData, resolvedPowers, fetchedBonusStars]);

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

	const starPowersList = useMemo(() => {
		return constellationInfo.nodes.filter(n => n.nodeType === "starPower");
	}, [constellationInfo.nodes]);

	const bonusStarsList = useMemo(() => {
		return constellationInfo.nodes.filter(n => n.nodeType !== "starPower");
	}, [constellationInfo.nodes]);

	// Hàm chuyển đổi nodeType sang text Tiếng Việt cho cột Loại
	const getBonusStarTypeName = nodeType => {
		if (nodeType === "bonusStar") return "Thường";
		if (nodeType === "bonusStarGem") return "Đá Quý";
		return nodeType;
	};

	if (error)
		return (
			<div className='p-10 text-center text-red-500'>
				<XCircle size={48} className='mx-auto mb-4 opacity-50' />
				<p>{error}</p>
				<Button onClick={() => navigate(-1)} className='mt-4'>
					Quay lại
				</Button>
			</div>
		);

	return (
		<div className='animate-fadeIn'>
			<PageTitle
				title={champion?.name || "Chi tiết tướng"}
				description={`POC GUIDE cho ${champion?.name}`}
				type='article'
			/>
			<div className='max-w-[1200px] mx-auto p-0 sm:p-6 text-text-primary font-secondary'>
				<AnimatePresence mode='wait'>
					{loading ? (
						<motion.div
							key='skeleton'
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
						>
							<ChampionDetailSkeleton />
						</motion.div>
					) : (
						<motion.div
							key='content'
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							transition={{ duration: 0.3 }}
						>
							<Button
								variant='outline'
								onClick={() => navigate(-1)}
								className='mb-4 ml-4 sm:ml-0'
							>
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
													<Star
														size={16}
														className='text-yellow-600 fill-current'
													/>
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
											className='text-primary-500 text-sm font-bold mt-2 ml-2'
										>
											{isDescriptionExpanded ? "Thu gọn" : "Hiển thị toàn bộ"}
										</button>
									</div>
								</div>

								{constellationInfo.nodes.length > 0 && (
									<>
										<h2 className='p-1 text-lg sm:text-3xl font-semibold my-1 uppercase font-primary mt-6'>
											Chòm sao
										</h2>

										{/* BẢN ĐỒ CHÒM SAO */}
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
													key={node.nodeID || index}
													index={index}
													power={node}
													active={hoveredNode?.nodeID === node.nodeID}
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

										{/* BẢNG CHI TIẾT CHÒM SAO CẬP NHẬT CHIA 5 CỘT RÕ RÀNG */}
										<div className='mt-8 bg-surface-bg rounded-lg overflow-hidden border border-border shadow-sm'>
											{/* TABS */}
											<div className='flex gap-1 border-b border-border px-2 sm:px-4 pt-2 sm:pt-4 bg-surface-hover/30'>
												<button
													onClick={() =>
														setActiveConstellationTab("starPowers")
													}
													className={`px-3 sm:px-4 py-2 font-semibold text-[13px] sm:text-sm transition-colors border-b-2 ${
														activeConstellationTab === "starPowers"
															? "border-primary-500 text-primary-500 bg-surface-bg"
															: "border-transparent text-text-secondary hover:text-text-primary"
													}`}
												>
													Ngôi sao sức mạnh
												</button>
												<button
													onClick={() =>
														setActiveConstellationTab("bonusStars")
													}
													className={`px-3 sm:px-4 py-2 font-semibold text-[13px] sm:text-sm transition-colors border-b-2 ${
														activeConstellationTab === "bonusStars"
															? "border-primary-500 text-primary-500 bg-surface-bg"
															: "border-transparent text-text-secondary hover:text-text-primary"
													}`}
												>
													Ngôi sao tăng thưởng
												</button>
											</div>

											{/* TABLE */}
											<div className='overflow-x-auto'>
												<table className='w-full text-left border-collapse min-w-[700px]'>
													<thead>
														<tr className='bg-surface-hover/50 text-text-secondary text-xs sm:text-sm border-b border-border'>
															<th className='py-2 px-2 sm:px-4 w-16 sm:w-20 text-center font-bold'>
																{activeConstellationTab === "starPowers"
																	? "Cấp sao"
																	: "Loại"}
															</th>
															<th className='py-2 px-2 sm:px-4 w-24 sm:w-32 text-center font-bold whitespace-nowrap'>
																Yêu cầu
															</th>
															<th className='py-2 px-2 sm:px-4 w-16 sm:w-24 text-center font-bold'>
																Hình ảnh
															</th>
															<th className='py-2 px-2 sm:px-4 w-32 sm:w-48 font-bold'>
																Tên
															</th>
															<th className='py-2 px-2 sm:px-4 font-bold'>
																Sức mạnh
															</th>
														</tr>
													</thead>
													<tbody className='divide-y divide-border'>
														{(activeConstellationTab === "starPowers"
															? starPowersList
															: bonusStarsList
														).map((node, index) => (
															<tr
																key={node.nodeID || index}
																className='hover:bg-surface-hover/40 transition-colors'
															>
																{/* Cột 1: Cấp sao / Loại */}
																<td className='py-1 px-1 sm:px-2 align-middle border-r border-border/50 text-center'>
																	{activeConstellationTab === "starPowers" ? (
																		<StarRating count={index + 1} />
																	) : (
																		<span className='text-xs sm:text-[13px] font-semibold text-text-secondary'>
																			{getBonusStarTypeName(node.nodeType)}
																		</span>
																	)}
																</td>

																{/* Cột 2: Yêu cầu */}
																<td className='py-1 px-1 sm:px-2 align-middle border-r border-border/50'>
																	<div className='flex justify-center'>
																		<RenderRequirements
																			requirements={node.requirements}
																		/>
																	</div>
																</td>

																{/* Cột 3: Hình ảnh */}
																<td className='py-1 px-1 sm:px-2 align-middle border-r border-border/50'>
																	<div className='flex justify-center'>
																		<div className='w-12 h-12 sm:w-14 sm:h-14 rounded bg-surface-bg '>
																			<img
																				src={node.image}
																				alt={node.name}
																				className='w-full h-full object-contain drop-shadow-sm'
																			/>
																		</div>
																	</div>
																</td>

																{/* Cột 4: Tên */}
																<td className='py-1 px-1 sm:px-2 align-middle border-r border-border/50 text-xs sm:text-sm font-semibold text-text-primary'>
																	{node.name}
																</td>

																{/* Cột 5: Sức mạnh (Mô tả) */}
																<td className='py-1 px-2 sm:px-4 align-middle text-xs sm:text-[13px] text-text-primary leading-relaxed'>
																	<div
																		dangerouslySetInnerHTML={{
																			__html: node.description,
																		}}
																	/>
																</td>
															</tr>
														))}
														{(activeConstellationTab === "starPowers"
															? starPowersList
															: bonusStarsList
														).length === 0 && (
															<tr>
																<td
																	colSpan='5'
																	className='p-6 text-center text-text-secondary'
																>
																	Chưa có dữ liệu cho mục này.
																</td>
															</tr>
														)}
													</tbody>
												</table>
											</div>
										</div>
									</>
								)}

								<h2 className='p-1 text-lg sm:text-3xl font-semibold mt-8 font-primary'>
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
										<div className='grid gap-4 bg-surface-hover p-0 rounded-md'>
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
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}

export default memo(ChampionDetail);
