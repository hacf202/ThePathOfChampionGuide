import React, { useEffect } from "react";
import Modal from "../common/modal.jsx";
import { useTranslation } from "../../hooks/useTranslation";
import { ExternalLink, Hash, Type, Image as ImageIcon, Info } from "lucide-react";
import MarkupRenderer from "../common/MarkupRenderer";
import { useMarkupResolution } from "../../hooks/useMarkupResolution";
import RarityIcon from "../common/rarityIcon";

/**
 * Modal hiển thị chi tiết lá bài ( dành cho Card Browser )
 */
const CardDetailModal = ({ card, isOpen, onClose }) => {
	const { tUI, tDynamic, language } = useTranslation();
	const { resolveEntities } = useMarkupResolution();

	useEffect(() => {
		if (isOpen && card) {
			const desc = tDynamic(card, "description") || "";
			if (desc) resolveEntities(desc);
		}
	}, [isOpen, card, tDynamic, resolveEntities]);

	if (!card) return null;

	// Lấy dữ liệu theo ngôn ngữ hiện tại
	const cardName = tDynamic(card, "cardName");
	const description = tDynamic(card, "description") || "";
	const imageSrc = card.gameAbsolutePath; // Mặc định dùng gameAbsolutePath gốc
	const type = tDynamic(card, "type");

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={cardName}
			maxWidth='max-w-5xl'
		>
			<div className='flex flex-col md:flex-row gap-0 sm:gap-10 p-0 sm:p-2'>
				{/* Bên trái: Ảnh lá bài */}
				<div className='md:w-5/12 flex justify-center items-start'>
					<div className='relative group w-full max-w-[400px]'>
						<img
							src={imageSrc}
							alt={cardName}
							className='w-full h-auto rounded-2xl shadow-2xl border border-white/5 transition-transform duration-500 group-hover:scale-[1.02]'
						/>
						<div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
						<a
							href={imageSrc}
							target='_blank'
							rel='noopener noreferrer'
							className='absolute top-4 right-4 p-3 bg-black/40 backdrop-blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-primary-500 hover:scale-110'
							title={tUI("common.zoomIn")}
						>
							<ExternalLink className='w-5 h-5 text-white' />
						</a>
					</div>
				</div>

				{/* Bên phải: Thông tin chi tiết */}
				<div className='md:w-7/12 flex flex-col gap-6 mt-6 md:mt-0 font-secondary'>
					<div className='space-y-4'>
						<div className='flex flex-wrap items-center gap-3'>
							<span className='px-3 py-0.5 bg-primary-500/10 text-primary-400 text-[10px] font-bold rounded-full border border-primary-500/20 uppercase tracking-widest'>
								{type}
							</span>
							<div className="flex items-center gap-2 px-3 py-0.5 bg-white/5 rounded-full border border-white/10">
								<RarityIcon rarity={card.rarity} size={12} />
								<span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
									{tUI(`shared.rarity.${(card.rarity || "none").toLowerCase()}`)}
								</span>
							</div>
						</div>
						
						<h2 className='text-4xl font-bold text-text-primary font-primary leading-tight tracking-tight uppercase italic'>
							{cardName}
						</h2>
						<div className="h-1 w-16 bg-primary-500 rounded-full" />
					</div>

					{/* Stats and Description */}
					<div className="space-y-6">
						{/* Description Section */}
						<div className='bg-surface-hover/30 backdrop-blur-md p-6 rounded-2xl border border-border shadow-inner'>
							<div className="flex items-center gap-3 mb-4 border-b border-border/50 pb-3">
								<Info size={16} className="text-primary-400" />
								<h3 className='font-primary text-lg font-bold text-text-primary uppercase tracking-wider'>
									Description
								</h3>
							</div>

							<div className='text-base leading-relaxed text-text-secondary min-h-[60px]'>
								{description ? (
									<MarkupRenderer text={description} />
								) : (
									<span className="italic text-text-tertiary">No description available.</span>
								)}
							</div>
						</div>

						{/* Identity Grid */}
						<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
							<div className='bg-white/5 p-4 rounded-xl border border-white/10'>
								<div className='flex items-center gap-2 text-text-tertiary text-[10px] uppercase tracking-widest mb-2'>
									<Hash className='w-3 h-3' />
									Card Code
								</div>
								<div className='font-mono text-primary-400 font-bold'>
									{card.cardCode}
								</div>
							</div>

							<div className='bg-white/5 p-4 rounded-xl border border-white/10'>
								<div className='flex items-center gap-2 text-text-tertiary text-[10px] uppercase tracking-widest mb-2'>
									<Type className='w-3 h-3' />
									Regions
								</div>
								<div className='text-text-primary font-bold flex flex-wrap gap-1'>
									{(card.regions || []).join(", ")}
								</div>
							</div>
						</div>
					</div>

					{/* Modal Actions */}
					<div className='flex justify-end pt-4 mt-auto'>
						<button
							onClick={onClose}
							className='px-8 py-2.5 bg-white/5 hover:bg-white/10 text-text-primary font-bold rounded-xl transition-all border border-white/10 active:scale-95'
						>
							{tUI("common.close")}
						</button>
					</div>
				</div>
			</div>
		</Modal>
	);
};

export default CardDetailModal;
