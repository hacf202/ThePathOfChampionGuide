// src/components/build/BuildDetail.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Star, ThumbsUp, Heart, Trash2, Edit, ChevronLeft } from "lucide-react";

import { useAuth } from "../../context/AuthContext.jsx";
import Modal from "../common/modal";
import Button from "../common/button";
import BuildEditModal from "./buildEditModal";
import BuildDelete from "./buildDelete";
import CommentsSection from "../comment/commentsSection";
import PageTitle from "../common/pageTitle.jsx";
import SafeImage from "../common/SafeImage.jsx";

// 1. IMPORT HOOK MỚI
import { useFavoriteStatus } from "../../hooks/useFavoriteStatus"; // Kiểm tra lại đường dẫn file này của bạn

// ... imports regionsData ...
import regionsData from "../../assets/data/iconRegions.json";

const BuildDetail = () => {
	const { buildId } = useParams();
	const navigate = useNavigate();
	const { user, token } = useAuth();
	const apiUrl = import.meta.env.VITE_API_URL;

	const [build, setBuild] = useState(null);
	const [loadingBuild, setLoadingBuild] = useState(true);
	const [error, setError] = useState(null);
	const [creatorDisplayName, setCreatorDisplayName] = useState("");

	const [likeCount, setLikeCount] = useState(0);
	const [isLiked, setIsLiked] = useState(false);

	// 2. SỬA STATE: Chỉ cần quản lý isFavorite (boolean), bỏ favoriteList phức tạp
	const [isFavorite, setIsFavorite] = useState(false);

	// 3. GỌI HOOK: Lấy trạng thái chính xác từ server
	const { status: favoriteStatus } = useFavoriteStatus(
		buildId ? [buildId] : []
	);

	const [showLoginModal, setShowLoginModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [buildToDelete, setBuildToDelete] = useState(null);

	// Dữ liệu động
	const [champions, setChampions] = useState([]);
	const [relics, setRelics] = useState([]);
	const [runes, setRunes] = useState([]);
	const [powers, setPowers] = useState([]);
	const [loadingData, setLoadingData] = useState(true);

	// ... (Giữ nguyên phần fetchStaticData) ...
	useEffect(() => {
		const fetchStaticData = async () => {
			setLoadingData(true);
			try {
				const [champRes, relicRes, runeRes, powerRes] = await Promise.all([
					fetch(`${apiUrl}/api/champions`),
					fetch(`${apiUrl}/api/relics`),
					fetch(`${apiUrl}/api/runes`),
					fetch(`${apiUrl}/api/generalPowers`),
				]);

				const [champData, relicData, runeData, powerData] = await Promise.all([
					champRes.json(),
					relicRes.json(),
					runeRes.json(),
					powerRes.json(),
				]);

				setChampions(champData);
				setRelics(relicData);
				setRunes(runeData);
				setPowers(powerData);
			} catch (err) {
				console.error("Lỗi tải dữ liệu từ API:", err);
			} finally {
				setLoadingData(false);
			}
		};

		fetchStaticData();
	}, [apiUrl]);

	// 4. CẬP NHẬT fetchBuild: Bỏ logic setFavoriteList cũ
	const fetchBuild = useCallback(async () => {
		setLoadingBuild(true);
		try {
			const headers = {};
			if (token) headers.Authorization = `Bearer ${token}`;

			const res = await fetch(`${apiUrl}/api/builds/${buildId}`, { headers });
			if (!res.ok) {
				const errData = await res.json().catch(() => ({}));
				throw new Error(errData.error || "Không tìm thấy build.");
			}
			const data = await res.json();
			setBuild(data);
			setLikeCount(data.like || 0);
			// Không cần setFavoriteList ở đây nữa
			setCreatorDisplayName(data.creator || "Vô danh");
		} catch (err) {
			setError(err.message);
		} finally {
			setLoadingBuild(false);
		}
	}, [buildId, apiUrl, token]);

	useEffect(() => {
		fetchBuild();
	}, [fetchBuild]);

	// ... (Giữ nguyên phần fetchCreatorName) ...
	const isOwner = useMemo(
		() => user && build && build.sub === user.sub,
		[user, build]
	);
	useEffect(() => {
		const fetchCreatorName = async () => {
			if (!build || !build.creator) return;
			if (isOwner) {
				setCreatorDisplayName(user.name || build.creator);
				return;
			}
			try {
				const response = await fetch(`${apiUrl}/api/users/${build.creator}`);
				if (response.ok) {
					const data = await response.json();
					setCreatorDisplayName(data.name || build.creator);
				}
			} catch (error) {
				console.error("Failed to fetch creator name:", error);
			}
		};
		fetchCreatorName();
	}, [build, isOwner, user, apiUrl]);

	// ... (Giữ nguyên logic Like local storage) ...
	useEffect(() => {
		const liked = sessionStorage.getItem(`liked_${buildId}`);
		if (liked) setIsLiked(true);
	}, [buildId]);

	// 5. ĐỒNG BỘ TRẠNG THÁI TIM TỪ HOOK useFavoriteStatus
	useEffect(() => {
		// Khi hook tải xong và có dữ liệu của buildId này -> cập nhật state
		if (favoriteStatus && typeof favoriteStatus[buildId] !== "undefined") {
			setIsFavorite(favoriteStatus[buildId]);
		}
	}, [favoriteStatus, buildId]);

	// ... (Giữ nguyên handleLike) ...
	const handleLike = async e => {
		e.stopPropagation();
		if (isLiked || !build) return;
		try {
			const res = await fetch(`${apiUrl}/api/builds/${build.id}/like`, {
				method: "PATCH",
			});
			if (res.ok) {
				const updated = await res.json();
				setLikeCount(updated.like);
				setIsLiked(true);
				sessionStorage.setItem(`liked_${build.id}`, "true");
			}
		} catch (error) {
			console.error("Error liking build:", error);
		}
	};

	// 6. SỬA handleToggleFavorite: Đơn giản hóa (chỉ bật/tắt boolean)
	const handleToggleFavorite = async e => {
		e.stopPropagation();
		if (!user) {
			setShowLoginModal(true);
			return;
		}
		if (!build) return;

		// Optimistic Update: Đổi màu ngay lập tức
		const previousState = isFavorite;
		setIsFavorite(!previousState);

		try {
			const res = await fetch(`${apiUrl}/api/builds/${build.id}/favorite`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
			});

			if (!res.ok) throw new Error("Failed");

			// Nếu thành công, có thể đọc response để chắc chắn (tuỳ chọn)
			// const updated = await res.json();
			// setIsFavorite(updated.isFavorited);
		} catch (error) {
			console.error("Error toggling favorite:", error);
			// Revert nếu lỗi
			setIsFavorite(previousState);
		}
	};

	// ... (Phần còn lại giữ nguyên: handleBuildUpdate, handleBuildDelete, renders...) ...
	const handleBuildUpdate = updatedData => {
		setBuild(prev => ({ ...prev, ...updatedData }));
		setShowEditModal(false);
	};

	const handleBuildDelete = () => {
		setBuildToDelete(null);
		navigate("/builds");
	};

	const normalizeName = val =>
		val && typeof val === "object" ? val.S || "" : String(val || "");

	const championInfo = useMemo(() => {
		if (!build?.championName) return null;
		const name = normalizeName(build.championName);
		return champions.find(c => c.name === name) || null;
	}, [build?.championName, champions]);

	const championImage = useMemo(
		() => championInfo?.assets?.[0]?.avatar || "/images/placeholder.png",
		[championInfo]
	);

	const championRegions = useMemo(() => {
		if (!championInfo?.regions) return [];
		return championInfo.regions
			.map(regionName => {
				const region = regionsData.find(r => r.name === regionName);
				return region
					? { name: regionName, icon: region.iconAbsolutePath }
					: null;
			})
			.filter(Boolean);
	}, [championInfo]);

	const findFullItem = (list, name) => {
		const n = normalizeName(name);
		return list.find(item => item.name === n);
	};

	const fullrelicSet = useMemo(
		() =>
			(build?.relicSet || []).map(a => findFullItem(relics, a)).filter(Boolean),
		[build?.relicSet, relics]
	);

	const fullPowers = useMemo(
		() =>
			(build?.powers || []).map(p => findFullItem(powers, p)).filter(Boolean),
		[build?.powers, powers]
	);

	const fullRunes = useMemo(
		() => (build?.rune || []).map(r => findFullItem(runes, r)).filter(Boolean),
		[build?.rune, runes]
	);

	const RenderItem = ({ item }) => {
		if (!item) return null;

		const getLinkPath = item => {
			if (item.powerCode) return `/power/${encodeURIComponent(item.powerCode)}`;
			if (item.relicCode) return `/relic/${encodeURIComponent(item.relicCode)}`;
			if (item.runeCode) return `/rune/${encodeURIComponent(item.runeCode)}`;
			return "#";
		};

		const linkPath = getLinkPath(item);
		const imgSrc = item.assetAbsolutePath || "/images/placeholder.png";

		const content = (
			<div className='flex items-start gap-4 p-3 bg-surface-hover rounded-md border border-border h-full hover:border-primary-500 transition-colors'>
				<SafeImage
					src={imgSrc}
					alt={item.name}
					className='w-12 h-12 rounded-md object-cover'
					onError={e => (e.target.src = "/images/placeholder.png")}
				/>
				<div className='flex-1'>
					<h3 className='font-semibold text-text-primary'>{item.name}</h3>
					{item.description && (
						<p
							className='text-sm text-text-secondary mt-1'
							dangerouslySetInnerHTML={{ __html: item.description }}
						/>
					)}
				</div>
			</div>
		);

		return linkPath !== "#" ? <Link to={linkPath}>{content}</Link> : content;
	};

	if (loadingBuild || loadingData) {
		return (
			<div className='flex justify-center items-center h-64'>
				<p className='text-text-secondary'>Đang tải...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className='text-center text-danger-text-dark mt-10'>
				<p>{error}</p>
				<Button
					variant='primary'
					onClick={() => navigate("/builds")}
					className='mt-4'
				>
					<ChevronLeft size={18} />
					Về danh sách build
				</Button>
			</div>
		);
	}

	if (!build) return null;

	return (
		<div>
			<PageTitle
				title={`Bộ cổ vật ${build.championName}`}
				description={`POC GUIDE: Build bộ cổ vật (Relic) tối ưu tier S/A cho ${build.championName}...`}
				type='article'
			/>
			<div className='max-w-[1200px] mx-auto p-0 sm:p-6 text-text-primary font-secondary'>
				<Button variant='outline' onClick={() => navigate(-1)} className='mb-4'>
					<ChevronLeft size={18} />
					Quay lại
				</Button>

				<div className='bg-surface-bg rounded-lg shadow-primary-md overflow-hidden p-4 sm:p-6 border border-border'>
					<div className='flex flex-col sm:flex-row justify-between items-start gap-4 mb-6'>
						<div className='flex items-center gap-4'>
							{/* ... (Phần Avatar/Info giữ nguyên) ... */}
							<SafeImage
								src={championImage}
								alt={normalizeName(build.championName)}
								className='w-20 h-20 rounded-full border-4 border-icon-star object-cover'
							/>
							<div>
								<div className='flex items-center gap-2'>
									<h1 className='font-bold text-3xl text-text-primary font-primary'>
										{normalizeName(build.championName)}
									</h1>
									{/* ...Regions... */}
									{championRegions.map(region => (
										<SafeImage
											key={region.name}
											src={region.icon}
											alt={region.name}
											title={region.name}
											className='w-6 h-6'
										/>
									))}
								</div>
								<p className='text-sm text-text-secondary'>
									Tạo bởi: {creatorDisplayName}
								</p>
								{/* ...Stars... */}
								<div className='flex mt-2'>
									{[...Array(build.star || 0)].map((_, i) => (
										<Star
											key={i}
											size={20}
											className='text-icon-star'
											fill='currentColor'
										/>
									))}
									{[...Array(7 - (build.star || 0))].map((_, i) => (
										<Star key={i} size={20} className='text-border' />
									))}
								</div>
							</div>
						</div>

						<div className='flex items-center gap-2 sm:gap-4'>
							<button
								onClick={handleLike}
								disabled={isLiked}
								className={`flex items-center gap-2 p-2 rounded-lg transition-colors focus:outline-none ${
									isLiked
										? "text-primary-500 cursor-not-allowed"
										: "text-text-secondary hover:bg-surface-hover"
								}`}
							>
								<ThumbsUp size={22} />
								<span className='font-semibold text-lg'>{likeCount}</span>
							</button>

							{/* Nút TIM sử dụng state isFavorite mới */}
							<button
								onClick={handleToggleFavorite}
								className={`p-2 rounded-full transition-colors focus:outline-none hover:bg-surface-hover ${
									isFavorite ? "text-danger-500" : "text-text-secondary"
								}`}
							>
								<Heart size={22} fill={isFavorite ? "currentColor" : "none"} />
							</button>

							{isOwner && (
								<>
									<button
										onClick={() => setShowEditModal(true)}
										className='p-2 rounded-full transition-colors text-text-secondary hover:bg-surface-hover hover:text-warning'
									>
										<Edit size={22} />
									</button>
									<button
										onClick={() => setBuildToDelete(build)}
										className='p-2 rounded-full transition-colors text-text-secondary hover:bg-surface-hover hover:text-danger-500'
									>
										<Trash2 size={22} />
									</button>
								</>
							)}
						</div>
					</div>

					{/* ... (Phần hiển thị Items/Comments/Modals giữ nguyên không đổi) ... */}
					{fullrelicSet.length > 0 && (
						<div className='mb-6'>
							<h2 className='text-xl sm:text-2xl font-semibold mb-3 font-primary'>
								Cổ Vật
							</h2>
							<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
								{fullrelicSet.map((item, index) => (
									<RenderItem key={`relic-${index}`} item={item} />
								))}
							</div>
						</div>
					)}
					{/* ... (Runes/Powers/Description/Comments...) */}
					{fullRunes.length > 0 && (
						<div className='mb-6'>
							<h2 className='text-xl sm:text-2xl font-semibold mb-3 font-primary'>
								Ngọc
							</h2>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								{fullRunes.map((item, index) => (
									<RenderItem key={`rune-${index}`} item={item} />
								))}
							</div>
						</div>
					)}
					{fullPowers.length > 0 && (
						<div className='mb-6'>
							<h2 className='text-xl sm:text-2xl font-semibold mb-3 font-primary'>
								Sức mạnh
							</h2>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								{fullPowers.map((item, index) => (
									<RenderItem key={`power-${index}`} item={item} />
								))}
							</div>
						</div>
					)}
					{build.description && (
						<div className='mb-6'>
							<h2 className='text-xl sm:text-2xl font-semibold mb-3 font-primary'>
								Ghi chú
							</h2>
							<p className='text-text-secondary italic bg-surface-hover p-3 rounded-md border-l-4 border-primary-500'>
								"{build.description}"
							</p>
						</div>
					)}
				</div>

				<CommentsSection buildId={build.id} />

				<Modal
					isOpen={showLoginModal}
					onClose={() => setShowLoginModal(false)}
					title='Yêu cầu đăng nhập'
				>
					<p className='text-text-secondary mb-6'>
						Bạn cần đăng nhập để thực hiện hành động này.
					</p>
					<div className='flex justify-end gap-4'>
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
							Đến trang đăng nhập
						</Button>
					</div>
				</Modal>

				{isOwner && (
					<BuildEditModal
						isOpen={showEditModal}
						onClose={() => setShowEditModal(false)}
						build={build}
						relicsList={relics}
						powersList={powers}
						runesList={runes}
						onBuildUpdate={handleBuildUpdate}
						onConfirm={handleBuildUpdate}
					/>
				)}

				{isOwner && (
					<BuildDelete
						isOpen={!!buildToDelete}
						onClose={() => setBuildToDelete(null)}
						build={buildToDelete}
						onBuildDelete={handleBuildDelete}
					/>
				)}
			</div>
		</div>
	);
};

export default BuildDetail;
