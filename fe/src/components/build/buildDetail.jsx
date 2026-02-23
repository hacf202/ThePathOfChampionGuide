// src/components/build/BuildDetail.jsx
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

import { useAuth } from "../../context/AuthContext.jsx";
import Modal from "../common/modal";
import Button from "../common/button";
import BuildEditModal from "./buildEditModal";
import BuildDelete from "./buildDelete";
import CommentsSection from "../comment/commentsSection";
import PageTitle from "../common/pageTitle.jsx";
import SafeImage from "../common/SafeImage.jsx";

// Import hook trạng thái yêu thích
import { useFavoriteStatus } from "../../hooks/useFavoriteStatus";
import regionsData from "../../assets/data/iconRegions.json";

const BuildDetail = () => {
	const { buildId } = useParams();
	const navigate = useNavigate();
	const { user, token } = useAuth();
	const apiUrl = import.meta.env.VITE_API_URL;

	const [build, setBuild] = useState(null);
	const [loadingBuild, setLoadingBuild] = useState(true);
	const [error, setError] = useState(null);

	// Tối ưu: Lấy trực tiếp creator từ object build
	const creatorDisplayName = useMemo(() => {
		if (!build) return "Đang tải...";

		// Ưu tiên hiển thị "Tôi" nếu người đang xem là chủ sở hữu
		if (user && (build.sub === user.sub || build.user_sub === user.sub)) {
			return user.name || "Tôi";
		}

		// Sử dụng thuộc tính creator hoặc creatorName có sẵn trong build
		return build.creator || build.creatorName || "Người chơi";
	}, [build, user]);

	const [likeCount, setLikeCount] = useState(0);
	const [isLiked, setIsLiked] = useState(false);
	const [isFavorite, setIsFavorite] = useState(false);

	// Fix lỗi truyền buildId cho hook
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

	/**
	 * 1. FETCH METADATA (Cổ vật, Ngọc, Sức mạnh)
	 */
	useEffect(() => {
		const fetchStaticData = async () => {
			setLoadingData(true);
			try {
				const query = "?limit=-1";
				const [champRes, relicRes, runeRes, powerRes] = await Promise.all([
					fetch(`${apiUrl}/api/champions${query}`),
					fetch(`${apiUrl}/api/relics${query}`),
					fetch(`${apiUrl}/api/runes${query}`),
					fetch(`${apiUrl}/api/powers${query}`),
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
			} finally {
				setLoadingData(false);
			}
		};
		fetchStaticData();
	}, [apiUrl]);

	/**
	 * 2. FETCH BUILD DETAIL
	 */
	const fetchBuild = useCallback(async () => {
		setLoadingBuild(true);
		try {
			const headers = {};
			if (token) headers.Authorization = `Bearer ${token}`;

			const res = await fetch(`${apiUrl}/api/builds/${buildId}`, { headers });
			if (!res.ok) throw new Error("Không tìm thấy bộ cổ vật này.");

			const data = await res.json();
			const buildData = data.item || data;
			setBuild(buildData);
			setLikeCount(buildData.like || 0);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoadingBuild(false);
		}
	}, [buildId, apiUrl, token]);

	useEffect(() => {
		fetchBuild();
	}, [fetchBuild]);

	/**
	 * 3. ĐỒNG BỘ TRẠNG THÁI TIM & LIKE
	 */
	useEffect(() => {
		if (favoriteStatus && typeof favoriteStatus[buildId] !== "undefined") {
			setIsFavorite(favoriteStatus[buildId]);
		}
	}, [favoriteStatus, buildId]);

	useEffect(() => {
		const liked = sessionStorage.getItem(`liked_${buildId}`);
		if (liked) setIsLiked(true);
	}, [buildId]);

	/**
	 * 4. MAPPING DỮ LIỆU HIỂN THỊ
	 */
	const findFullItem = (list, name) => {
		if (!Array.isArray(list) || !name) return null;
		const target = name.trim().toLowerCase();
		return list.find(item => (item.name || "").trim().toLowerCase() === target);
	};

	const championInfo = useMemo(
		() => findFullItem(champions, build?.championName),
		[build, champions],
	);
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

	const relicSet = useMemo(
		() =>
			(build?.relicSet || []).map(n => findFullItem(relics, n)).filter(Boolean),
		[build, relics],
	);
	const runeSet = useMemo(
		() => (build?.rune || []).map(n => findFullItem(runes, n)).filter(Boolean),
		[build, runes],
	);
	const powerSet = useMemo(
		() =>
			(build?.powers || []).map(n => findFullItem(powers, n)).filter(Boolean),
		[build, powers],
	);

	/**
	 * 5. TÁC VỤ NGƯỜI DÙNG
	 */
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

	const RenderItem = ({ item }) => {
		if (!item) return null;
		const imgSrc =
			item.assetAbsolutePath || item.iconAbsolutePath || "/fallback-image.svg";
		return (
			<div className='flex items-start gap-4 p-3 bg-surface-hover rounded-md border border-border h-full hover:border-primary-500 transition-colors'>
				<SafeImage
					src={imgSrc}
					alt={item.name}
					className='w-12 h-12 rounded-md object-cover'
				/>
				<div className='flex-1'>
					<h3 className='font-semibold text-text-primary text-sm sm:text-base'>
						{item.name}
					</h3>
					{item.description && (
						<p
							className='text-xs sm:text-sm text-text-secondary mt-1'
							dangerouslySetInnerHTML={{ __html: item.description }}
						/>
					)}
				</div>
			</div>
		);
	};

	if (loadingBuild || loadingData)
		return (
			<div className='flex flex-col items-center justify-center py-20 gap-4'>
				<Loader2 className='animate-spin text-primary-500' size={48} />
				<p className='text-text-secondary'>Đang tải thông tin bộ cổ vật...</p>
			</div>
		);

	if (error)
		return (
			<div className='text-center py-20'>
				<p className='text-danger-500 font-bold mb-4'>{error}</p>
				<Button
					variant='primary'
					onClick={() => navigate("/builds")}
					className='mx-auto'
				>
					Quay lại
				</Button>
			</div>
		);

	if (!build) return null;

	return (
		<div>
			<PageTitle title={`Bộ cổ vật ${build.championName} - ${build.name}`} />
			<div className='max-w-[1200px] mx-auto p-2 sm:p-6 text-text-primary font-secondary'>
				<Button variant='outline' onClick={() => navigate(-1)} className='mb-4'>
					<ChevronLeft size={18} /> Quay lại
				</Button>

				<div className='bg-surface-bg rounded-lg shadow-md p-4 sm:p-6 border border-border'>
					<div className='flex flex-col sm:flex-row justify-between items-start gap-4 mb-6'>
						<div className='flex items-center gap-4'>
							<SafeImage
								src={championImage}
								alt={build.championName}
								className='w-20 h-20 rounded-full border-4 border-icon-star object-cover'
							/>
							<div>
								<div className='flex items-center gap-2'>
									<h1 className='font-bold text-2xl sm:text-3xl font-primary'>
										{build.championName}
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
									Tạo bởi:{" "}
									<span className='font-medium'>{creatorDisplayName}</span>
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
										<Star key={i} size={18} className='text-border' />
									))}
								</div>
							</div>
						</div>

						<div className='flex items-center gap-2'>
							<button
								onClick={handleLike}
								disabled={isLiked}
								className={`flex items-center gap-1.5 p-2 rounded-lg transition-colors ${isLiked ? "text-primary-500" : "text-text-secondary hover:bg-surface-hover"}`}
							>
								<ThumbsUp size={22} fill={isLiked ? "currentColor" : "none"} />
								<span className='font-bold text-lg'>{likeCount}</span>
							</button>
							<button
								onClick={handleToggleFavorite}
								className={`p-2 rounded-full transition-colors ${isFavorite ? "text-danger-500" : "text-text-secondary hover:bg-surface-hover"}`}
							>
								<Heart size={22} fill={isFavorite ? "currentColor" : "none"} />
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

					{/* Nội dung chính các Items */}
					{relicSet.length > 0 && (
						<div className='mb-8'>
							<h2 className='text-xl font-bold mb-4 font-primary border-b border-border pb-2 text-primary-500'>
								Cổ Vật
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
								Ngọc
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
								Sức mạnh
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
								Ghi chú chiến thuật
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

				<Modal
					isOpen={showLoginModal}
					onClose={() => setShowLoginModal(false)}
					title='Yêu cầu đăng nhập'
				>
					<p className='text-text-secondary mb-6'>
						Bạn cần đăng nhập để thực hiện hành động này.
					</p>
					<div className='flex justify-end gap-3'>
						<Button variant='ghost' onClick={() => setShowLoginModal(false)}>
							Hủy
						</Button>
						<Button
							variant='primary'
							onClick={() => {
								setShowLoginModal(false);
								navigate("/auth");
							}}
						>
							Đăng nhập
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
						/>
						<BuildDelete
							isOpen={!!buildToDelete}
							onClose={() => setBuildToDelete(null)}
							build={buildToDelete}
							onSuccess={() => navigate("/builds")}
						/>
					</>
				)}
			</div>
		</div>
	);
};

export default BuildDetail;
