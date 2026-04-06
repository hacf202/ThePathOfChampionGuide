import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import SafeImage from "../common/SafeImage";
import { useTranslation } from "../../hooks/useTranslation";

/**
 * CardCarouselModal — Viewport-centered lightbox carousel.
 * Rendered via createPortal into document.body to avoid stacking context issues.
 * Center logic: Fixed overlay with inset:0 and flex center.
 */
const CardCarouselModal = ({ cards, initialIndex = 0, onClose }) => {
	const { language, tUI } = useTranslation();
	const [index, setIndex] = useState(initialIndex);
	const [direction, setDirection] = useState(0);
	const stripRef = useRef(null);
	const touchStartX = useRef(null);

	const total = cards.length;
	const current = cards[index];

	const getName = (card) =>
		language === "en"
			? card?.translations?.en?.cardName || card?.cardName
			: card?.cardName;

	const getImg = (card) =>
		language === "en"
			? card?.translations?.en?.gameAbsolutePath || card?.gameAbsolutePath
			: card?.gameAbsolutePath;

	const goTo = useCallback((newIdx, dir) => {
		setDirection(dir);
		setIndex(((newIdx % total) + total) % total);
	}, [total]);

	const prev = useCallback(() => goTo(index - 1, -1), [index, goTo]);
	const next = useCallback(() => goTo(index + 1, 1), [index, goTo]);

	// Auto-scroll thumbnail strip to keep active visible
	useEffect(() => {
		if (!stripRef.current) return;
		const thumb = stripRef.current.children[index];
		if (thumb) thumb.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
	}, [index]);

	// Keyboard navigation
	useEffect(() => {
		const onKey = (e) => {
			if (e.key === "Escape") onClose();
			if (e.key === "ArrowLeft") prev();
			if (e.key === "ArrowRight") next();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [onClose, prev, next]);

	// Prevent body scroll while modal open
	useEffect(() => {
		const originalStyle = window.getComputedStyle(document.body).overflow;
		document.body.style.overflow = "hidden";
		return () => { document.body.style.overflow = originalStyle; };
	}, []);

	// Touch swipe
	const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
	const onTouchEnd = (e) => {
		if (touchStartX.current === null) return;
		const diff = touchStartX.current - e.changedTouches[0].clientX;
		if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
		touchStartX.current = null;
	};

	// Slide variants
	const variants = {
		enter: (dir) => ({ x: dir > 0 ? 160 : -160, opacity: 0, scale: 0.92 }),
		center: { x: 0, opacity: 1, scale: 1 },
		exit: (dir) => ({ x: dir > 0 ? -160 : 160, opacity: 0, scale: 0.92 }),
	};

	if (!current) return null;

	const modal = (
		<AnimatePresence>
			<motion.div
				key="carousel-backdrop"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				onClick={onClose}
				style={{
					position: "fixed",
					top: 0, left: 0, width: "100%", height: "100%",
					zIndex: 99999,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					background: "rgba(0,0,0,0.85)",
					backdropFilter: "blur(12px)",
					WebkitBackdropFilter: "blur(12px)",
				}}
			>
				{/* ── Panel: Căn giữa tuyệt đối ── */}
				<motion.div
					key="carousel-panel"
					initial={{ opacity: 0, scale: 0.88, y: 20 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={{ opacity: 0, scale: 0.88, y: 20 }}
					transition={{ type: "spring", stiffness: 380, damping: 32 }}
					onClick={(e) => e.stopPropagation()}
					onTouchStart={onTouchStart}
					onTouchEnd={onTouchEnd}
					style={{
						position: "relative",
						width: "min(92vw, 450px)",
						maxHeight: "95vh",
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "space-between",
						gap: window.innerWidth < 640 ? 20 : 12,
						userSelect: "none",
						padding: "30px 0",
					}}
				>
					{/* Close button */}
					<button
						onClick={onClose}
						style={{
							position: "absolute",
							top: 0,
							right: 0,
							width: 36, height: 36,
							borderRadius: "50%",
							background: "rgba(255,255,255,0.15)",
							border: "1px solid rgba(255,255,255,0.2)",
							color: "#fff",
							cursor: "pointer",
							display: "flex", alignItems: "center", justifyContent: "center",
							zIndex: 10,
						}}
					>
						<X size={18} />
					</button>

					{/* Counter */}
					<div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "monospace", marginBottom: 4 }}>
						{index + 1} / {total}
					</div>

					{/* ── Main card + arrows ── */}
					<div style={{ position: "relative", width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
						{total > 1 && (
							<button
								onClick={prev}
								style={{
									position: "absolute", left: -16, zIndex: 5,
									width: 60, height: 60, borderRadius: "50%",
									background: "rgba(0,0,0,0.7)",
									border: "2px solid rgba(255,255,255,0.15)",
									color: "#fff",
									cursor: "pointer",
									display: "flex", alignItems: "center", justifyContent: "center",
									boxShadow: "0 4px 10px rgba(0,0,0,0.3)"
								}}
							>
								<ChevronLeft size={36} />
							</button>
						)}

						{/* Animated card container */}
						<div style={{ 
							width: window.innerWidth < 640 ? "50%" : "75%", 
							maxHeight: window.innerWidth < 640 ? "45vh" : "65vh", 
							display: "flex", 
							flexDirection: "column",
							flexShrink: 0 
						}}>
							<AnimatePresence mode="wait" custom={direction}>
								<motion.div
									key={current.cardCode}
									custom={direction}
									variants={variants}
									initial="enter"
									animate="center"
									exit="exit"
									transition={{ type: "spring", stiffness: 340, damping: 30 }}
									style={{ width: "100%", display: "flex", flexDirection: "column", cursor: "grab" }}
									whileTap={{ cursor: "grabbing" }}
									drag="x"
									dragConstraints={{ left: 0, right: 0 }}
									dragElastic={0.2}
									onDragEnd={(e, { offset, velocity }) => {
										const swipeThreshold = 40;
										const flickThreshold = 500;
										const swipe = offset.x;
										const speed = velocity.x;

										if (swipe < -swipeThreshold || speed < -flickThreshold) {
											if (total > 1) next();
										} else if (swipe > swipeThreshold || speed > flickThreshold) {
											if (total > 1) prev();
										}
									}}
								>
									<div
										style={{
											borderRadius: 12,
											overflow: "hidden",
											border: "2px solid rgba(139,92,246,0.5)",
											boxShadow: "0 0 30px rgba(139,92,246,0.2), 0 10px 30px rgba(0,0,0,0.5)",
											position: "relative",
										}}
									>
										<SafeImage
											src={getImg(current)}
											alt={getName(current)}
											style={{ 
												width: "100%", 
												height: "auto", 
												maxHeight: "100%", 
												objectFit: "contain", 
												display: "block" 
											}}
										/>
									</div>

								</motion.div>
							</AnimatePresence>
						</div>

						{total > 1 && (
							<button
								onClick={next}
								style={{
									position: "absolute", right: -16, zIndex: 5,
									width: 60, height: 60, borderRadius: "50%",
									background: "rgba(0,0,0,0.7)",
									border: "2px solid rgba(255,255,255,0.15)",
									color: "#fff",
									cursor: "pointer",
									display: "flex", alignItems: "center", justifyContent: "center",
									boxShadow: "0 4px 10px rgba(0,0,0,0.3)"
								}}
							>
								<ChevronRight size={36} />
							</button>
						)}
					</div>

					{/* ── Thumbnail strip — all cards ── */}
					{total > 1 && (
						<div
							ref={stripRef}
							style={{
								display: "flex",
								gap: 6,
								overflowX: "auto",
								width: "100%",
								padding: "4px 0",
								marginTop: window.innerWidth < 640 ? 10 : 8,
								scrollbarWidth: "none",
								msOverflowStyle: "none",
								justifyContent: total <= 5 ? "center" : "flex-start",
							}}
						>
							{cards.map((card, i) => (
								<button
									key={card.cardCode}
									onClick={() => goTo(i, i > index ? 1 : -1)}
									style={{
										flexShrink: 0,
										width: 48,
										borderRadius: 6,
										overflow: "hidden",
										background: "transparent",
										border: `2px solid ${i === index ? "rgba(139,92,246,0.9)" : "rgba(255,255,255,0.1)"}`,
										opacity: i === index ? 1 : 0.4,
										transition: "all 0.2s",
										cursor: "pointer",
										padding: 0,
									}}
								>
									<SafeImage src={getImg(card)} alt="" style={{ width: "100%", height: "auto", display: "block" }} />
								</button>
							))}
						</div>
					)}
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);

	return createPortal(modal, document.body);
};

export default CardCarouselModal;
