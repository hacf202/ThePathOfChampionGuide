// src/components/build/buildDetail.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
	Star,
	ThumbsUp,
	Heart,
	Trash2,
	Edit,
	ChevronLeft,
	Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useAuth } from "../../context/AuthContext.jsx";
import { useTranslation } from "../../hooks/useTranslation.js"; // 🟢 Import Hook Đa ngôn ngữ
import Modal from "../common/modal";
import Button from "../common/button";
import BuildEditModal from "./buildEditModal";
import BuildDelete from "./buildDelete";
import CommentsSection from "../comment/commentsSection";
import PageTitle from "../common/pageTitle.jsx";
import SafeImage from "../common/SafeImage.jsx";

import { useFavoriteStatus } from "../../hooks/useFavoriteStatus";
import regionsData from "../../assets/data/iconRegions.json";

// --- THÀNH PHẦN SKELETON ---
const BuildDetailSkeleton = () => (
	<div className='max-w-[1200px] mx-auto p-2 sm:p-6 animate-pulse'>
		<div className='h-10 w-24 bg-gray-700/50 rounded mb-4' />
		<div className='bg-surface-bg border rounded-lg p-4 sm:p-6 space-y-8'>
			<div className='flex flex-col sm:flex-row justify-between items-start gap-4'>
				<div className='flex items-center gap-4'>
					<div className='w-20 h-20 rounded-full bg-gray-700/50' />
					<div className='space-y-2'>
						<div className='h-8 w-48 bg-gray-700/50 rounded' />
						<div className='h-4 w-32 bg-gray-700/50 rounded' />
						<div className='h-5 w-24 bg-gray-700/50 rounded' />
					</div>
				</div>
				<div className='flex gap-2'>
					<div className='h-10 w-16 bg-gray-700/50 rounded-lg' />
					<div className='h-10 w-10 bg-gray-700/50 rounded-full' />
				</div>
			</div>
			<div className='space-y-4'>
				<div className='h-8 w-40 bg-gray-700/50 rounded' />
				<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
					{[1, 2, 3].map(i => (
						<div key={i} className='h-24 bg-gray-700/30 rounded-lg' />
					))}
				</div>
			</div>
		</div>
	</div>
);

const BuildDetail = () => {
	const { buildId } = useParams();
	const navigate = useNavigate();
	const { user, token } = useAuth();
	const { tUI, tDynamic } = useTranslation(); // 🟢 Khởi tạo tUI và tDynamic
	const apiUrl = import.meta.env.VITE_API_URL;

	const [build, setBuild] = useState(null);
	const [loadingBuild, setLoadingBuild] = useState(true);
	const [error, setError] = useState(null);

	const creatorDisplayName = useMemo(() => {
		if (!build) return tUI("common.loading");
		if (user && (build.sub === user.sub || build.user_sub === user.sub)) {
			return user.name || tUI("buildSummary.me");
		}
		return (
			build.creator || build.creatorName || tUI("buildDetail.defaultPlayer")
		);
	}, [build, user, tUI]);

	const [likeCount, setLikeCount] = useState(0);
	const [isLiked, setIsLiked] = useState(false);
	const [isFavorite, setIsFavorite] = useState(false);

	const { status: favoriteStatus } = useFavoriteStatus(
		buildId ? [buildId] : [],
		token,
	);

	const [showLoginModal, setShowLoginModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [buildToDelete, setBuildToDelete] = useState(null);

	const [champions, setChampions] = useState([]);
	const [relics, setRelics] = useState([]);
	const [runes, setRunes] = useState([]);
	const [powers, setPowers] = useState([]);
	const [loadingData, setLoadingData] = useState(true);

	// Fetch Master Data để hiển thị và truyền cho Edit Modal
	useEffect(() => {
		const fetchStaticData = async () => {
			setLoadingData(true);
			try {
				const query = "?page=1&limit=-1";
				const [champRes, relicRes, runeRes, powerRes] = await Promise.all([
					fetch(`${apiUrl}/api/champions${query}`),
					fetch(`${apiUrl}/api/relics${query}`),
					fetch(`${apiUrl}/api/runes${query}`),
					fetch(`${apiUrl}/api/powers${query}`), // Lấy tất cả power để phòng hờ build cũ
				]);

				const [champData, relicData, runeData, powerData] = await Promise.all([
					champRes.json(),
					relicRes.json(),
					runeRes.json(),
					powerRes.json(),
				]);

				setChampions(champData.items || []);
				setRelics(relicData.items || []);
				setRunes(runeData.items || []);
				setPowers(powerData.items || []);
			} catch (err) {
				console.error("Lỗi tải metadata:", err);
			}
		};
		fetchStaticData();
	}, [apiUrl]);

	// Fetch thông tin Build
	const fetchBuild = useCallback(async () => {
		setLoadingBuild(true);
		try {
			const headers = {};
			if (token) headers.Authorization = `Bearer ${token}`;

			const res = await fetch(`${apiUrl}/api/builds/${buildId}`, { headers });
			if (!res.ok) throw new Error(tUI("buildDetail.notFound"));

			const data = await res.json();
			const buildData = data.item || data;
			setBuild(buildData);
			setLikeCount(buildData.like || 0);
		} catch (err) {
			setError(err.message);
		} finally {
			setTimeout(() => {
				setLoadingBuild(false);
				setLoadingData(false);
			}, 800);
		}
	}, [buildId, apiUrl, token, tUI]);

	useEffect(() => {
		fetchBuild();
	}, [fetchBuild]);

	useEffect(() => {
		if (favoriteStatus && typeof favoriteStatus[buildId] !== "undefined") {
			setIsFavorite(favoriteStatus[buildId]);
		}
	}, [favoriteStatus, buildId]);

	useEffect(() => {
		const liked = sessionStorage.getItem(`liked_${buildId}`);
		if (liked) setIsLiked(true);
	}, [buildId]);

	// 🟢 Map theo ID thay vì Name
	const championInfo = useMemo(
		() => champions.find(c => c.name === build?.championName),
		[build, champions],
	);

	const championDisplayName = championInfo
		? tDynamic(championInfo, "name") // 🟢 Dùng tDynamic
		: build?.championName || "";

	const championImage = useMemo(
		() => championInfo?.assets?.[0]?.avatar || "/fallback-image.svg",
		[championInfo],
	);

	const championRegions = useMemo(() => {
		if (!championInfo?.regions) return [];
		return championInfo.regions
			.map(rName => {
				const region = regionsData.find(r => r.name === rName);
				return region ? { name: rName, icon: region.iconAbsolutePath } : null;
			})
			.filter(Boolean);
	}, [championInfo]);

	// 🟢 Ánh xạ ID -> Object chi tiết
	const relicSet = useMemo(
		() =>
			(build?.relicSetIds || [])
				.map(id => relics.find(r => r.relicCode === id))
				.filter(Boolean),
		[build, relics],
	);
	const runeSet = useMemo(
		() =>
			(build?.runeIds || [])
				.map(id => runes.find(r => r.runeCode === id))
				.filter(Boolean),
		[build, runes],
	);
	const powerSet = useMemo(
		() =>
			(build?.powerIds || [])
				.map(id => powers.find(p => p.powerCode === id))
				.filter(Boolean),
		[build, powers],
	);

	const handleLike = async () => {
		if (!user) {
			setShowLoginModal(true);
			return;
		}
		if (isLiked) return;
		try {
			setIsLiked(true);
			setLikeCount(prev => prev + 1);
			const res = await fetch(`${apiUrl}/api/builds/${buildId}/like`, {
				method: "PATCH",
			});
			const data = await res.json();
			if (data.like !== undefined) setLikeCount(data.like);
			sessionStorage.setItem(`liked_${buildId}`, "true");
		} catch (err) {
			setIsLiked(false);
			setLikeCount(prev => prev - 1);
		}
	};

	const handleToggleFavorite = async () => {
		if (!user) {
			setShowLoginModal(true);
			return;
		}
		const prevState = isFavorite;
		setIsFavorite(!prevState);
		try {
			const res = await fetch(`${apiUrl}/api/builds/${buildId}/favorite`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
			});
			if (!res.ok) throw new Error();
		} catch (err) {
			setIsFavorite(prevState);
		}
	};

	const isOwner = useMemo(
		() =>
			user &&
			build &&
			(build.sub === user.sub || build.user_sub === user.sub || user.isAdmin),
		[user, build],
	);

	// 🟢 RenderItem sử dụng hook dịch thuật động (tDynamic)
	const RenderItem = ({ item }) => {
		if (!item) return null;
		const imgSrc =
			item.assetAbsolutePath || item.iconAbsolutePath || "/fallback-image.svg";
		const itemName = tDynamic(item, "name");
		const itemDesc = tDynamic(item, "description");

		return (
			<div className='flex items-start gap-4 p-3 bg-surface-hover rounded-md border border-border h-full hover:border-primary-500  '>
				<SafeImage
					src={imgSrc}
					alt={itemName}
					className='w-12 h-12 rounded-md object-cover'
				/>
				<div className='flex-1'>
					<h3 className='font-semibold text-text-primary text-sm sm:text-base'>
						{itemName}
					</h3>
					{itemDesc && (
						<p
							className='text-xs sm:text-sm text-text-secondary mt-1'
							dangerouslySetInnerHTML={{ __html: itemDesc }}
						/>
					)}
				</div>
			</div>
		);
	};

	if (error)
		return (
			<div className='text-center py-20'>
				<p className='text-danger-500 font-bold mb-4'>{error}</p>
				<Button
					variant='primary'
					onClick={() => navigate("/builds")}
					className='mx-auto'
				>
					{tUI("common.back")}
				</Button>
			</div>
		);

	return (
		<div className='animate-fadeIn'>
			<PageTitle
				title={
					build
						? `${tUI("buildDetail.buildFor")} ${championDisplayName}`
						: tUI("buildDetail.title")
				}
			/>
			<div className='max-w-[1200px] mx-auto p-2 sm:p-6 text-text-primary font-secondary'>
				<AnimatePresence mode='wait'>
					{loadingBuild || loadingData ? (
						<motion.div
							key='skeleton'
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
						>
							<BuildDetailSkeleton />
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
								className='mb-4'
							>
								<ChevronLeft size={18} /> {tUI("common.back")}
							</Button>

							<div className='bg-surface-bg rounded-lg shadow-md p-4 sm:p-6 border border-border'>
								<div className='flex flex-col sm:flex-row justify-between items-start gap-4 mb-6'>
									<div className='flex items-center gap-4'>
										<SafeImage
											src={championImage}
											alt={championDisplayName}
											className='w-20 h-20 rounded-full border-4 border-icon-star object-cover'
										/>
										<div>
											<div className='flex items-center gap-2'>
												<h1 className='font-bold text-2xl sm:text-3xl font-primary'>
													{championDisplayName}
												</h1>
												{championRegions.map(r => (
													<SafeImage
														key={r.name}
														src={r.icon}
														alt={r.name}
														className='w-6 h-6'
													/>
												))}
											</div>
											<p className='text-xs sm:text-sm text-text-secondary'>
												{tUI("buildSummary.createdBy")}{" "}
												<span className='font-medium'>
													{creatorDisplayName}
												</span>
											</p>
											<div className='flex mt-2'>
												{[...Array(build.star || 0)].map((_, i) => (
													<Star
														key={i}
														size={18}
														className='text-icon-star'
														fill='currentColor'
													/>
												))}
												{[...Array(7 - (build.star || 0))].map((_, i) => (
													<Star
														key={`empty-${i}`}
														size={18}
														className='text-border'
													/>
												))}
											</div>
										</div>
									</div>

									<div className='flex items-center gap-2'>
										<button
											onClick={handleLike}
											disabled={isLiked}
											className={`flex items-center gap-1.5 p-2 rounded-lg   ${isLiked ? "text-primary-500" : "text-text-secondary hover:bg-surface-hover"}`}
										>
											<ThumbsUp
												size={22}
												fill={isLiked ? "currentColor" : "none"}
											/>
											<span className='font-bold text-lg'>{likeCount}</span>
										</button>
										<button
											onClick={handleToggleFavorite}
											className={`p-2 rounded-full   ${isFavorite ? "text-danger-500" : "text-text-secondary hover:bg-surface-hover"}`}
										>
											<Heart
												size={22}
												fill={isFavorite ? "currentColor" : "none"}
											/>
										</button>
										{isOwner && (
											<>
												<button
													onClick={() => setShowEditModal(true)}
													className='p-2 rounded-full text-text-secondary hover:bg-surface-hover'
												>
													<Edit size={22} />
												</button>
												<button
													onClick={() => setBuildToDelete(build)}
													className='p-2 rounded-full text-text-secondary hover:bg-surface-hover hover:text-danger-500'
												>
													<Trash2 size={22} />
												</button>
											</>
										)}
									</div>
								</div>

								{relicSet.length > 0 && (
									<div className='mb-8'>
										<h2 className='text-xl font-bold mb-4 font-primary border-b border-border pb-2 text-primary-500'>
											{tUI("buildDetail.relicsHeader")}
										</h2>
										<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
											{relicSet.map((item, i) => (
												<RenderItem key={i} item={item} />
											))}
										</div>
									</div>
								)}

								{runeSet.length > 0 && (
									<div className='mb-8'>
										<h2 className='text-xl font-bold mb-4 font-primary border-b border-border pb-2 text-primary-500'>
											{tUI("buildDetail.runesHeader")}
										</h2>
										<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
											{runeSet.map((item, i) => (
												<RenderItem key={i} item={item} />
											))}
										</div>
									</div>
								)}

								{powerSet.length > 0 && (
									<div className='mb-8'>
										<h2 className='text-xl font-bold mb-4 font-primary border-b border-border pb-2 text-primary-500'>
											{tUI("buildDetail.powersHeader")}
										</h2>
										<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
											{powerSet.map((item, i) => (
												<RenderItem key={i} item={item} />
											))}
										</div>
									</div>
								)}

								{build.description && (
									<div className='mb-6'>
										<h2 className='text-xl font-bold mb-3 font-primary text-primary-500'>
											{tUI("buildDetail.tacticalNotes")}
										</h2>
										<div className='bg-surface-hover p-4 rounded-md border-l-4 border-primary-500'>
											<p className='text-text-primary whitespace-pre-wrap italic'>
												"{build.description}"
											</p>
										</div>
									</div>
								)}
							</div>

							<CommentsSection buildId={build.id || buildId} />
						</motion.div>
					)}
				</AnimatePresence>

				<Modal
					isOpen={showLoginModal}
					onClose={() => setShowLoginModal(false)}
					title={tUI("buildSummary.loginRequired")}
				>
					<p className='text-text-secondary mb-6'>
						{tUI("buildSummary.loginPrompt")}
					</p>
					<div className='flex justify-end gap-3'>
						<Button variant='ghost' onClick={() => setShowLoginModal(false)}>
							{tUI("common.cancel")}
						</Button>
						<Button
							variant='primary'
							onClick={() => {
								setShowLoginModal(false);
								navigate("/auth?mode=login");
							}}
						>
							{tUI("common.login")}
						</Button>
					</div>
				</Modal>

				{isOwner && (
					<>
						<BuildEditModal
							isOpen={showEditModal}
							onClose={() => setShowEditModal(false)}
							build={build}
							onConfirm={u => setBuild(u)}
							championsList={champions}
							relicsList={relics}
							powersList={powers}
							runesList={runes}
						/>
						<BuildDelete
							isOpen={!!buildToDelete}
							onClose={() => setBuildToDelete(null)}
							build={buildToDelete}
							onConfirm={() => navigate("/builds")}
						/>
					</>
				)}
			</div>
		</div>
	);
};

export default BuildDetail;
