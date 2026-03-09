// src/components/build/buildSummary.jsx
import React, { memo, useMemo, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
	Star,
	Eye,
	EyeOff,
	Heart,
	ThumbsUp,
	MoreVertical,
	Edit,
	Trash2,
	ChevronRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useTranslation } from "../../hooks/useTranslation.js"; // 🟢 Import Hook Đa ngôn ngữ
import Modal from "../common/modal";
import Button from "../common/button";
import BuildDelete from "./buildDelete";
import BuildEditModal from "./buildEditModal";
import SafeImage from "../common/SafeImage.jsx";

const DESCRIPTION_MAX_HEIGHT = 80;

const BuildSummary = ({
	build,
	championsList = [],
	relicsList = [],
	powersList = [],
	runesList = [],
	style,
	onBuildUpdate,
	onBuildDelete,
	initialIsFavorited = false,
	initialLikeCount = 0,
	isFavoritePage = false,
}) => {
	const { user, token } = useAuth();
	const { language, tUI, tDynamic } = useTranslation(); // 🟢 Khởi tạo tUI và tDynamic
	const navigate = useNavigate();
	const apiUrl = import.meta.env.VITE_API_URL;
	const menuRef = useRef(null);
	const descriptionRef = useRef(null);

	const [isDescriptionOverflowing, setIsDescriptionOverflowing] =
		useState(false);
	const [likeCount, setLikeCount] = useState(
		initialLikeCount || build.like || 0,
	);
	const [isLiked, setIsLiked] = useState(false);
	const [isFavorite, setIsFavorite] = useState(initialIsFavorited);
	const [favoriteCount, setFavoriteCount] = useState(initialLikeCount || 0);

	const [showLoginModal, setShowLoginModal] = useState(false);
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [buildToDelete, setBuildToDelete] = useState(null);
	const [buildToEdit, setBuildToEdit] = useState(null);

	const displayCreator = useMemo(() => {
		if (build.creatorName && build.creatorName !== build.creator) {
			return build.creatorName;
		}
		if (user && build.sub === user.sub) {
			return tUI("buildSummary.me"); // 🟢 Dịch chữ "Tôi"
		}
		return build.creator;
	}, [build.creatorName, build.creator, build.sub, user, tUI]);

	useEffect(() => {
		setIsFavorite(initialIsFavorited);
	}, [initialIsFavorited]);

	useEffect(() => {
		if (initialLikeCount > 0) setFavoriteCount(initialLikeCount);
	}, [initialLikeCount]);

	useEffect(() => {
		const element = descriptionRef.current;
		if (!element || !build.description) {
			setIsDescriptionOverflowing(false);
			return;
		}
		const checkOverflow = () => {
			setIsDescriptionOverflowing(
				element.scrollHeight > DESCRIPTION_MAX_HEIGHT,
			);
		};
		const resizeObserver = new ResizeObserver(checkOverflow);
		resizeObserver.observe(element);
		checkOverflow();
		return () => resizeObserver.disconnect();
	}, [build.description]);

	useEffect(() => {
		const liked = sessionStorage.getItem(`liked_${build.id}`);
		if (liked) setIsLiked(true);
	}, [build.id]);

	useEffect(() => {
		const handleClickOutside = e => {
			if (menuRef.current && !menuRef.current.contains(e.target)) {
				setIsMenuOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const isOwner = useMemo(
		() => user && build.sub === user.sub,
		[user, build.sub],
	);

	const handleViewDetail = e => {
		e.stopPropagation();
		navigate(`/builds/detail/${build.id}`);
	};

	const handleLike = async e => {
		e.stopPropagation();
		if (isLiked) return;
		setLikeCount(prev => prev + 1);
		setIsLiked(true);
		sessionStorage.setItem(`liked_${build.id}`, "true");
		try {
			await fetch(`${apiUrl}/api/builds/${build.id}/like`, { method: "PATCH" });
		} catch (err) {
			setLikeCount(prev => prev - 1);
			setIsLiked(false);
		}
	};

	const handleToggleFavorite = async e => {
		e.stopPropagation();
		if (!user) {
			setShowLoginModal(true);
			return;
		}
		const previousFavorite = isFavorite;
		const previousCount = favoriteCount;
		setIsFavorite(!previousFavorite);
		setFavoriteCount(previousFavorite ? previousCount - 1 : previousCount + 1);
		try {
			const res = await fetch(`${apiUrl}/api/builds/${build.id}/favorite`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
			});
			if (!res.ok) throw new Error("Toggle failed");
			const result = await res.json();
			if (isFavoritePage) {
				onBuildUpdate?.({ ...build, isFavorited: result.isFavorited });
			}
		} catch (err) {
			setIsFavorite(previousFavorite);
			setFavoriteCount(previousCount);
		}
	};

	const handleEdit = e => {
		e.stopPropagation();
		setBuildToEdit(build);
		setIsMenuOpen(false);
	};

	const handleDeleteClick = e => {
		e.stopPropagation();
		setBuildToDelete(build);
		setIsMenuOpen(false);
	};

	const handleConfirmEdit = updated => {
		onBuildUpdate?.(updated);
		setBuildToEdit(null);
	};

	const handleConfirmDelete = id => {
		onBuildDelete?.(id);
		setBuildToDelete(null);
	};

	// 🟢 HÀM GIẢI MÃ ID -> OBJECT & LẤY ĐA NGÔN NGỮ
	const normalizeName = val =>
		val && typeof val === "object" ? val.S || "" : String(val || "");

	const championData = useMemo(() => {
		const name = normalizeName(build?.championName);
		return championsList.find(c => c?.name === name);
	}, [championsList, build?.championName]);

	const championImage =
		championData?.assets?.[0]?.avatar || "/fallback-image.svg";
	const championDisplayName = championData
		? tDynamic(championData, "name") // 🟢 Đã sửa thành tDynamic
		: normalizeName(build?.championName);

	// 🟢 Ánh xạ ID sang Object thay vì Tên
	const artifactItems = useMemo(
		() =>
			(build.relicSetIds || []).map(id =>
				relicsList.find(r => r.relicCode === id),
			),
		[relicsList, build.relicSetIds],
	);

	const powerItems = useMemo(
		() =>
			(build.powerIds || []).map(id =>
				powersList.find(p => p.powerCode === id),
			),
		[powersList, build.powerIds],
	);

	const runeItems = useMemo(
		() =>
			(build.runeIds || []).map(id => runesList.find(r => r.runeCode === id)),
		[runesList, build.runeIds],
	);

	// 🟢 Render Image nhận cả 1 Object (item) để có thể dịch tooltips tự động
	const renderImageWithTooltip = (item, type, index) => {
		if (!item) return null; // Bỏ qua an toàn nếu ID không tìm thấy

		const idKey = item.relicCode || item.powerCode || item.runeCode || index;
		const key = `${build.id}-${type}-${idKey}-${index}`;
		const itemName = tDynamic(item, "name"); // 🟢 Đã sửa thành tDynamic

		return (
			<div key={key} className='group relative'>
				<SafeImage
					src={item.assetAbsolutePath || "/fallback-image.svg"}
					alt={itemName}
					className='w-16 h-16 rounded-md border-2 border-border object-cover'
				/>
				<div className='absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10'>
					{itemName}
				</div>
			</div>
		);
	};

	return (
		<>
			<div
				style={style}
				className='bg-surface-bg border-2 border-border rounded-lg shadow-md hover:shadow-primary-md hover:-translate-y-1 hover:border-primary-500 transition-all duration-300 flex flex-col cursor-pointer overflow-hidden p-3 sm:p-5'
				onClick={() => navigate(`/builds/detail/${build.id}`)}
			>
				<div className='flex flex-col gap-4 h-full'>
					{/* Header */}
					<div className='flex items-start justify-between'>
						<div className='flex items-center gap-3'>
							<SafeImage
								src={championImage}
								alt={championDisplayName}
								className='w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-border'
							/>
							<div>
								<h3 className='font-bold text-base sm:text-lg text-text-primary'>
									{championDisplayName}
								</h3>
								<p className='text-xs sm:text-sm text-text-secondary'>
									{tUI("buildSummary.createdBy")}{" "}
									<span className='font-medium'>{displayCreator}</span>
								</p>
							</div>
						</div>

						{/* Actions */}
						<div className='flex flex-col items-end gap-2'>
							<div onClick={e => e.stopPropagation()}>
								<div className='relative' ref={menuRef}>
									<button
										onClick={() => setIsMenuOpen(!isMenuOpen)}
										className='p-1.5 rounded-full hover:bg-surface-hover  '
									>
										<MoreVertical size={20} className='text-text-secondary' />
									</button>

									{isMenuOpen && (
										<div className='absolute top-full right-0 mt-2 w-48 bg-surface-bg border border-border rounded-md shadow-lg z-20'>
											<button
												onClick={handleToggleFavorite}
												className='w-full flex items-center gap-3 px-4 py-2 text-left text-sm text-text-secondary hover:bg-surface-hover  '
											>
												<Heart
													size={18}
													className={`transition-all ${
														isFavorite ? "text-danger-500 fill-danger-500" : ""
													}`}
												/>
												<span>
													{isFavorite
														? tUI("buildSummary.unfavorite")
														: tUI("buildSummary.favorite")}{" "}
													{favoriteCount > 0 && `(${favoriteCount})`}
												</span>
											</button>

											{build.hasOwnProperty("display") && (
												<div className='flex items-center gap-3 px-4 py-2 text-sm text-text-secondary'>
													{build.display ? (
														<Eye size={18} className='text-success' />
													) : (
														<EyeOff size={18} className='text-danger-500' />
													)}
													<span>
														{build.display
															? tUI("buildSummary.public")
															: tUI("buildSummary.private")}
													</span>
												</div>
											)}

											{isOwner && (
												<>
													<div className='border-t border-border my-1'></div>
													<button
														onClick={handleEdit}
														className='w-full flex items-center gap-3 px-4 py-2 text-left text-sm text-text-secondary hover:bg-surface-hover'
													>
														<Edit size={18} /> <span>{tUI("common.edit")}</span>
													</button>
													<button
														onClick={handleDeleteClick}
														className='w-full flex items-center gap-3 px-4 py-2 text-left text-sm text-danger-500 hover:bg-surface-hover'
													>
														<Trash2 size={18} />{" "}
														<span>{tUI("common.delete")}</span>
													</button>
												</>
											)}
										</div>
									)}
								</div>
							</div>
						</div>
					</div>

					{/* Nội dung build */}
					<div className='flex flex-col gap-3 text-sm'>
						{artifactItems.length > 0 && (
							<div>
								<p className='text-text-primary font-semibold mb-1 text-xs sm:text-sm'>
									{tUI("buildSummary.relics")}
								</p>
								<div className='flex flex-wrap gap-1.5 sm:gap-2'>
									{artifactItems.map((a, i) =>
										renderImageWithTooltip(a, "artifact", i),
									)}
								</div>
							</div>
						)}
						{runeItems.length > 0 && (
							<div>
								<p className='text-text-primary font-semibold mb-1 text-xs sm:text-sm'>
									{tUI("buildSummary.runes")}
								</p>
								<div className='flex flex-wrap gap-1.5 sm:gap-2'>
									{runeItems.map((r, i) =>
										renderImageWithTooltip(r, "rune", i),
									)}
								</div>
							</div>
						)}
						{powerItems.length > 0 && (
							<div>
								<p className='text-text-primary font-semibold mb-1 text-xs sm:text-sm'>
									{tUI("buildSummary.powers")}
								</p>
								<div className='flex flex-wrap gap-1.5 sm:gap-2'>
									{powerItems.map((p, i) =>
										renderImageWithTooltip(p, "power", i),
									)}
								</div>
							</div>
						)}
					</div>

					{/* Mô tả */}
					{build.description && (
						<div className='relative'>
							<p
								ref={descriptionRef}
								className='text-text-secondary text-xs sm:text-sm italic mt-2 line-clamp-none'
								style={{
									maxHeight: DESCRIPTION_MAX_HEIGHT,
									overflow: "hidden",
								}}
							>
								"{build.description}"
							</p>
							{isDescriptionOverflowing && (
								<div className='absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-surface-bg to-transparent' />
							)}
							{isDescriptionOverflowing && (
								<button
									onClick={handleViewDetail}
									className='inline-flex items-center gap-1 text-primary-500 hover:underline text-xs sm:text-sm font-medium mt-1'
								>
									{tUI("buildSummary.seeMore")}
									<ChevronRight size={12} />
								</button>
							)}
						</div>
					)}

					<div
						className='mt-auto pt-2 flex items-center gap-4'
						onClick={e => e.stopPropagation()}
					>
						{/* Like Section */}
						<div className='group relative flex items-center gap-1 cursor-pointer'>
							<button
								onClick={handleLike}
								disabled={isLiked}
								className={`p-1.5 rounded-full transition-all ${
									isLiked
										? "text-primary-500 bg-primary-500/10"
										: "hover:bg-surface-hover text-text-secondary"
								}`}
							>
								<ThumbsUp
									size={18}
									className={isLiked ? "fill-blue-200" : ""}
									strokeWidth={2}
								/>
							</button>
							<span
								className={`font-semibold text-sm sm:text-lg ${
									isLiked ? "text-primary-500" : "text-text-secondary"
								}`}
							>
								{likeCount}
							</span>

							<div className='absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50'>
								{tUI("buildSummary.like")}
								<div className='absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900'></div>
							</div>
						</div>

						{/* Favorite Section */}
						<div className='group relative flex items-center gap-1 cursor-pointer'>
							<button
								onClick={handleToggleFavorite}
								className={`p-1.5 rounded-full transition-all ${
									isFavorite
										? "text-danger-500 bg-danger-500/10"
										: "hover:bg-surface-hover text-text-secondary"
								}`}
							>
								<Heart size={18} className={isFavorite ? "fill-current" : ""} />
							</button>
							{favoriteCount > 0 && (
								<span
									className={`font-bold text-sm sm:text-lg ${
										isFavorite ? "text-danger-500" : "text-text-secondary"
									}`}
								>
									{favoriteCount}
								</span>
							)}

							<div className='absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50'>
								{isFavorite
									? tUI("buildSummary.unfavorite")
									: tUI("buildSummary.addToFavorites")}
								<div className='absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900'></div>
							</div>
						</div>

						{/* Stars Section */}
						<div className='group relative flex items-center gap-1 cursor-default'>
							<div className='p-1.5'>
								<Star size={16} className='text-icon-star fill-icon-star' />
							</div>
							<span className='text-text-secondary font-bold text-sm sm:text-lg'>
								{build.star}
							</span>

							<div className='absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50'>
								{tUI("buildSummary.championStarLevel")}
								<div className='absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900'></div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Modal đăng nhập */}
			<Modal
				isOpen={showLoginModal}
				onClose={() => setShowLoginModal(false)}
				title={tUI("buildSummary.loginRequired")}
			>
				<p className='text-text-secondary mb-6'>
					{tUI("buildSummary.loginPrompt")}
				</p>
				<div className='flex justify-end gap-4'>
					<Button variant='ghost' onClick={() => setShowLoginModal(false)}>
						{tUI("common.cancel")}
					</Button>
					<Button
						variant='primary'
						onClick={() => {
							setShowLoginModal(false);
							navigate("/auth");
						}}
					>
						{tUI("common.login")}
					</Button>
				</div>
			</Modal>

			<BuildDelete
				isOpen={!!buildToDelete}
				onClose={() => setBuildToDelete(null)}
				build={buildToDelete}
				onConfirm={handleConfirmDelete}
			/>

			<BuildEditModal
				isOpen={!!buildToEdit}
				onClose={() => setBuildToEdit(null)}
				build={buildToEdit}
				onConfirm={handleConfirmEdit}
			/>
		</>
	);
};

export default memo(BuildSummary);
