import React from "react";
import Modal from "../common/modal.jsx";
import { useTranslation } from "../../hooks/useTranslation";
import { ExternalLink, Hash, Type, Image as ImageIcon } from "lucide-react";

/**
 * Modal hiển thị chi tiết lá bài ( dành cho Card Browser )
 */
const CardDetailModal = ({ card, isOpen, onClose }) => {
	const { tUI, tDynamic, language } = useTranslation();

	if (!card) return null;

	// Lấy dữ liệu theo ngôn ngữ hiện tại
	const cardName = tDynamic(card, "cardName");
	const imageSrc = card.gameAbsolutePath; // Mặc định dùng gameAbsolutePath gốc

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={cardName}
			maxWidth='max-w-4xl'
		>
			<div className='flex flex-col md:flex-row gap-8'>
				{/* Bên trái: Ảnh lá bài */}
				<div className='md:w-1/2 flex justify-center items-start'>
					<div className='relative group'>
						<img
							src={imageSrc}
							alt={cardName}
							className='max-w-full h-auto rounded-xl shadow-2xl border border-white/10'
						/>
						<a
							href={imageSrc}
							target='_blank'
							rel='noopener noreferrer'
							className='absolute top-4 right-4 p-2 bg-black/60 backdrop-blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary-500'
							title={tUI("common.zoomIn")}
						>
							<ExternalLink className='w-5 h-5 text-white' />
						</a>
					</div>
				</div>

				{/* Bên phải: Thông tin chi tiết */}
				<div className='md:w-1/2 flex flex-col gap-6'>
					<div className='space-y-4'>
						<h2 className='text-3xl font-bold text-text-primary font-primary leading-tight'>
							{cardName}
						</h2>

						<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
							<div className='bg-white/5 p-3 rounded-lg border border-white/10'>
								<div className='flex items-center gap-2 text-text-tertiary text-xs uppercase tracking-wider mb-1'>
									<Hash className='w-3 h-3' />
									Card Code
								</div>
								<div className='font-mono text-primary-400 font-bold'>
									{card.cardCode}
								</div>
							</div>

							<div className='bg-white/5 p-3 rounded-lg border border-white/10'>
								<div className='flex items-center gap-2 text-text-tertiary text-xs uppercase tracking-wider mb-1'>
									<Type className='w-3 h-3' />
									Language
								</div>
								<div className='text-text-secondary font-medium'>
									{language === "vi" ? "Tiếng Việt" : "English"}
								</div>
							</div>
						</div>
					</div>

					<div className='bg-surface-bg p-5 rounded-xl border border-border space-y-4'>
						<h3 className='font-primary text-xl flex items-center gap-2'>
							<ImageIcon className='w-5 h-5 text-primary-500' />
							Translations
						</h3>

						<div className='space-y-3'>
							<div className='flex justify-between items-center py-2 border-b border-white/5'>
								<span className='text-text-tertiary text-sm'>Tiếng Việt:</span>
								<span className='text-text-primary font-medium'>
									{card.cardName}
								</span>
							</div>
							<div className='flex justify-between items-center py-2'>
								<span className='text-text-tertiary text-sm'>English:</span>
								<span className='text-text-primary font-medium'>
									{card.translations?.en?.cardName || "N/A"}
								</span>
							</div>
						</div>
					</div>

					<div className='flex justify-end pt-4'>
						<button
							onClick={onClose}
							className='px-6 py-2 bg-white/5 hover:bg-white/10 text-text-primary rounded-lg transition-colors border border-white/10'
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
