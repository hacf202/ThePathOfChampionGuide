// src/components/boss/BossCard.jsx
import React from "react";
import { motion } from "framer-motion";
import SafeImage from "../common/SafeImage";
import { useTranslation } from "../../hooks/useTranslation";
import { Swords } from "lucide-react";

/**
 * BossCard - Thẻ hiển thị thông tin rút gọn của Boss
 */
const BossCard = ({ boss }) => {
	const { tDynamic } = useTranslation();

	const bossName = tDynamic(boss, "bossName") || boss.bossName;
	const bossImage = boss.image || boss.background || "/fallback-image.svg";

	return (
		<motion.div
			whileHover={{ y: -5 }}
			className='group relative bg-surface-bg border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-primary-500/50 transition-all duration-300 h-full flex flex-col'
		>
			{/* Image Section */}
			<div className='relative aspect-[3/4] overflow-hidden bg-surface-hover'>
				<SafeImage
					src={bossImage}
					alt={bossName}
					className='w-full h-full object-cover transition-transform duration-700 group-hover:scale-110'
				/>
				
				{/* Overlay Gradient */}
				<div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity' />
				
				{/* Bottom Info Overlay */}
				<div className='absolute bottom-0 left-0 w-full p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300'>
					<div className='flex items-center gap-2 mb-1'>
						<div className='w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse' />
						<span className='text-[10px] font-black uppercase tracking-[0.2em] text-red-500'>
							Hostile Entity
						</span>
					</div>
					<h3 className='text-xl font-bold text-white font-primary uppercase tracking-wide line-clamp-2 drop-shadow-md'>
						{bossName}
					</h3>
				</div>

				{/* Floating Badge */}
				<div className='absolute top-3 right-3 bg-black/40 backdrop-blur-md border border-white/10 p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100'>
					<Swords size={16} className='text-primary-500' />
				</div>
			</div>

			{/* Hover Glow Effect */}
			<div className='absolute inset-0 border-2 border-primary-500/0 group-hover:border-primary-500/30 rounded-2xl pointer-events-none transition-colors duration-300' />
		</motion.div>
	);
};

export default BossCard;
