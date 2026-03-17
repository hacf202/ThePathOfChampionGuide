// src/components/build/buildCard.jsx
import { memo, useState, useEffect } from "react";
import {
	Star,
	Eye,
	ThumbsUp,
	Calendar,
	User,
	ToggleLeft,
	ToggleRight,
} from "lucide-react";
import { getChampionAvatar } from "../../utils/championAvatarCache.js";
import { useTranslation } from "../../hooks/useTranslation"; // IMPORT HOOK

const BuildCard = ({ build, onClick }) => {
	const { tUI } = useTranslation();

	const {
		championName,
		star = 0,
		views = 0,
		like = 0,
		creatorName,
		creator,
		createdAt,
		display,
		relicSet = [],
		powers = [],
		rune = [],
	} = build;

	const [avatarUrl, setAvatarUrl] = useState(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const loadAvatar = async () => {
			if (!championName) {
				setIsLoading(false);
				return;
			}

			setIsLoading(true);
			const url = await getChampionAvatar(championName);
			setAvatarUrl(url);
			setIsLoading(false);
		};

		loadAvatar();
	}, [championName]);

	return (
		<div
			onClick={onClick}
			className='bg-[var(--color-background)] p-5 rounded-xl border border-[var(--color-border)] 
                     hover:shadow-lg hover:border-[var(--color-primary)] 
                     transition-all duration-200 cursor-pointer group relative'
		>
			{/* AVATAR */}
			<div className='absolute -top-6 -right-4 flex space-x-[-15px] opacity-80 group-hover:opacity-100 transition-opacity z-10'>
				<div className='w-16 h-16 rounded-full border-2 border-[var(--color-background)] overflow-hidden bg-[var(--color-surface)] shadow-md'>
					{isLoading ? (
						<div className='w-full h-full animate-pulse bg-gray-600' />
					) : (
						<img
							src={avatarUrl || "https://via.placeholder.com/64"}
							alt={championName}
							className='w-full h-full object-cover'
						/>
					)}
				</div>
			</div>

			<div className='flex items-center gap-3 mb-4 pr-12'>
				<h3 className='text-xl font-bold text-[var(--color-text-primary)] font-primary truncate'>
					{championName}
				</h3>
				{star > 0 && (
					<div className='flex items-center bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded-full text-xs font-bold'>
						<Star size={12} className='mr-1 fill-amber-500' /> {star}
					</div>
				)}
			</div>

			{/* NỘI DUNG */}
			<div className='space-y-2 text-sm text-[var(--color-text-secondary)]'>
				{relicSet.length > 0 && (
					<div className='flex items-center gap-1'>
						<span className='font-medium'>{tUI("admin.build.relics")}:</span>
						<span className='truncate max-w-[180px]'>
							{relicSet.slice(0, 2).join(", ")}
							{relicSet.length > 2 && ` +${relicSet.length - 2}`}
						</span>
					</div>
				)}
				{powers.length > 0 && (
					<div className='flex items-center gap-1'>
						<span className='font-medium'>{tUI("admin.build.powers")}:</span>
						<span className='truncate max-w-[180px]'>
							{powers.slice(0, 2).join(", ")}
							{powers.length > 2 && ` +${powers.length - 2}`}
						</span>
					</div>
				)}
				{rune.length > 0 && (
					<div className='flex items-center gap-1'>
						<span className='font-medium'>{tUI("admin.build.runes")}:</span>
						<span>
							{rune.length} {tUI("admin.build.itemsCount")}
						</span>
					</div>
				)}
			</div>

			<div className='flex justify-between items-center mt-4 pt-3 border-t border-[var(--color-border)] text-xs text-[var(--color-text-secondary)]'>
				<div className='flex items-center gap-1'>
					<User size={14} />
					<span className='truncate max-w-[100px]'>
						{creatorName || creator || tUI("admin.build.anonymous")}
					</span>
				</div>
				<div className='flex items-center gap-3'>
					<div
						className='flex items-center gap-1'
						title={tUI("admin.build.views")}
					>
						<Eye size={14} /> {views}
					</div>
					<div
						className='flex items-center gap-1'
						title={tUI("admin.build.likes")}
					>
						<ThumbsUp size={14} /> {like}
					</div>
					<div className='flex items-center gap-1'>
						{display === true || display === "true" ? (
							<ToggleRight size={16} className='text-emerald-500' />
						) : (
							<ToggleLeft size={16} className='text-gray-400' />
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default memo(BuildCard);
