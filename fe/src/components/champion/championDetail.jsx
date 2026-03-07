// src/pages/championDetail.jsx
import { memo, useMemo, useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import iconRegions from "../../assets/data/iconRegions.json";
import { ChevronLeft, Star, XCircle } from "lucide-react";
import LatestComments from "../comment/latestComments";
import Button from "../common/button";
import PageTitle from "../common/pageTitle";
import SafeImage from "../common/SafeImage";

// Import các component chòm sao đã được tách
import ConstellationMap from "./constellationMap";
import ConstellationTable from "./constellationTable";

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
	const [fetchedBonusStars, setFetchedBonusStars] = useState([]);
	const [resolvedItems, setResolvedItems] = useState([]);
	const [resolvedRelics, setResolvedRelics] = useState([]);
	const [resolvedRunes, setResolvedRunes] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

	useEffect(() => {
		let isMounted = true;
		const controller = new AbortController();
		const signal = controller.signal;

		const initData = async () => {
			try {
				setLoading(true);

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
				setFetchedBonusStars(bonusData.items || []);

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
					setResolvedRunes(ruDetails); // Dữ liệu Ngọc đã được load ở đây
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

				if (node.nodeType === "starPower" || !node.nodeType) {
					const p = resolvedPowers.find(x => x.name === node.nodeName);
					if (p) {
						resolvedImage = p.assetAbsolutePath || p.image || resolvedImage;
						if (!node.description)
							resolvedDescription = p.description || p.descriptionRaw || "";
					}
				} else {
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

	// TÍNH TOÁN DỮ LIỆU RUNE MỚI ĐƯỢC THÊM VÀO Ở ĐÂY
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

	const starPowersList = useMemo(() => {
		return constellationInfo.nodes.filter(n => n.nodeType === "starPower");
	}, [constellationInfo.nodes]);

	const bonusStarsList = useMemo(() => {
		return constellationInfo.nodes.filter(n => n.nodeType !== "starPower");
	}, [constellationInfo.nodes]);

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

										<ConstellationMap constellationInfo={constellationInfo} />

										<ConstellationTable
											starPowersList={starPowersList}
											bonusStarsList={bonusStarsList}
										/>
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

								{/* GIAO DIỆN HIỂN THỊ RUNE MỚI ĐƯỢC THÊM VÀO Ở ĐÂY */}
								{runesFull.length > 0 && (
									<>
										<h2 className='text-lg sm:text-3xl font-semibold my-1 font-primary mt-6'>
											Ngọc bổ trợ khuyên dùng
										</h2>
										<div className='grid grid-cols-1 md:grid-cols-2 gap-4 bg-surface-hover p-1 rounded-md border border-border'>
											{runesFull.map((runeItem, index) => (
												<RenderItem key={index} item={runeItem} />
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
