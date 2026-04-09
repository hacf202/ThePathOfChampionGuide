// fe/src/components/champion/RatingModal.jsx
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Star, Save, Loader2, MessageSquare } from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";
import Button from "../common/button";

const RatingModal = ({ isOpen, onClose, championID, initialData, onSubmit }) => {
	const { tUI } = useTranslation();
	const [ratings, setRatings] = useState({
		damage: 5,
		defense: 5,
		speed: 5,
		consistency: 5,
		synergy: 5,
		independence: 5,
	});
	const [comment, setComment] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		if (initialData) {
			setRatings(initialData.ratings || {
				damage: 5,
				defense: 5,
				speed: 5,
				consistency: 5,
				synergy: 5,
				independence: 5,
			});
			setComment(initialData.comment || "");
		}
	}, [initialData]);

	if (!isOpen) return null;

	const stats = [
		{ key: "damage", label: tUI("championDetail.ratings.damage") },
		{ key: "defense", label: tUI("championDetail.ratings.defense") },
		{ key: "speed", label: tUI("championDetail.ratings.speed") },
		{ key: "consistency", label: tUI("championDetail.ratings.consistency") },
		{ key: "synergy", label: tUI("championDetail.ratings.synergy") },
		{ key: "independence", label: tUI("championDetail.ratings.independence") },
	];

	const handleRatingChange = (key, value) => {
		setRatings(prev => ({ ...prev, [key]: parseInt(value) }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);
		try {
			await onSubmit({ ratings, comment });
			onClose();
		} catch (error) {
			console.error("Submit rating error:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return createPortal(
		<div className='fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn'>
			<div className='absolute inset-0' onClick={onClose}></div>
			<div className='bg-surface-bg border border-border rounded-2xl shadow-2xl w-full max-w-lg flex flex-col relative z-20 overflow-hidden animate-slideUp'>
				<div className='flex items-center justify-between p-5 border-b border-border bg-surface-hover'>
					<h3 className='text-xl font-bold font-primary text-primary-500 uppercase flex items-center gap-2'>
						<Star size={24} className='fill-primary-500' />
						{tUI("championDetail.ratings.ratingModalTitle")}
					</h3>
					<button onClick={onClose} className='text-text-secondary hover:text-danger-500 transition-colors'>
						<X size={24} />
					</button>
				</div>

				<form onSubmit={handleSubmit} className='p-6 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar'>
					<p className='text-text-secondary text-sm italic'>
						{tUI("championDetail.ratings.ratingModalDesc")}
					</p>

					<div className='grid grid-cols-1 gap-5'>
						{stats.map(stat => (
							<div key={stat.key} className='space-y-2'>
								<div className='flex justify-between items-center'>
									<label className='font-bold text-text-primary flex items-center gap-2'>
										<span className='w-2 h-2 rounded-full bg-primary-500'></span>
										{stat.label}
									</label>
									<span className='text-lg font-black text-primary-500 bg-primary-500/10 px-3 py-0.5 rounded-full min-w-[45px] text-center'>
										{ratings[stat.key]}
									</span>
								</div>
								<input
									type='range'
									min='1'
									max='10'
									step='1'
									value={ratings[stat.key]}
									onChange={(e) => handleRatingChange(stat.key, e.target.value)}
									className='w-full h-2 bg-surface-hover rounded-lg appearance-none cursor-pointer accent-primary-500'
								/>
								<div className='flex justify-between text-[10px] text-text-secondary px-1 uppercase tracking-tighter'>
									<span>Yếu</span>
									<span>Trung Bình</span>
									<span>Bá Đạo</span>
								</div>
							</div>
						))}
					</div>

					<div className='pt-2'>
						<label className='font-bold text-text-primary block mb-2 flex items-center gap-2'>
							<MessageSquare size={18} className='text-primary-500' />
							{tUI("championDetail.ratings.commentLabel")}
						</label>
						<textarea
							value={comment}
							onChange={(e) => setComment(e.target.value)}
							placeholder={tUI("championDetail.ratings.commentPlaceholder")}
							className='w-full bg-surface-hover border border-border rounded-xl p-4 text-text-primary focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all min-h-[100px] resize-none'
						/>
					</div>

					<Button
						type='submit'
						variant='primary'
						disabled={isSubmitting}
						className='w-full py-4 h-14 rounded-xl shadow-lg'
						iconLeft={isSubmitting ? <Loader2 className='animate-spin' /> : <Save size={20} />}
					>
						{tUI("championDetail.ratings.submitBtn")}
					</Button>
				</form>
			</div>
		</div>,
		document.body
	);
};

export default RatingModal;
