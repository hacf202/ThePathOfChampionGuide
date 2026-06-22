// src/features/tools/cardGuess/components/CardCropViewer.jsx
import React, { useRef, useMemo, useState, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import SafeImage from "@/components/common/SafeImage";

/**
 * HINT_LEVELS: mỗi level hiển thị một phần lớn hơn của ảnh.
 * cropSize là % viewport so với ảnh gốc (nhỏ hơn = zoom vào sâu hơn).
 */
const HINT_LEVELS = [
	{ cropSize: 7, label: "🔍 x14" },
	{ cropSize: 10, label: "🔍 x10" },
	{ cropSize: 13, label: "🔍 x7.6" },
	{ cropSize: 18, label: "🔍 x5.5" },
	{ cropSize: 21, label: "🔍 x4.7" },
	{ cropSize: 25, label: "👁️" },
];

const CardCropViewer = ({ imageUrl, fallbackUrl, hintLevel = 0, cropSeed = 0, revealed = false, mode = "unlimited" }) => {
	const containerRef = useRef();
	const imageRef = useRef();

	const [blobUrl, setBlobUrl] = useState(null);
	const [activeHintLevel, setActiveHintLevel] = useState(hintLevel);

	// Fetch image as Blob to prevent direct URL inspection
	useEffect(() => {
		let urlToRevoke = null;
		
		const fetchBlob = async () => {
			if (!imageUrl) return;
			// If already revealed, we don't strictly need a blob, but for consistency we can use the imageUrl directly
			if (revealed) {
				setBlobUrl(imageUrl);
				setActiveHintLevel(hintLevel);
				return;
			}
			try {
				const response = await fetch(imageUrl);
				if (response.ok) {
					const blob = await response.blob();
					const url = URL.createObjectURL(blob);
					
					// Pre-decode image to prevent flickering when swapping src
					const img = new Image();
					img.onload = () => {
						setBlobUrl(url);
						setActiveHintLevel(hintLevel);
					};
					img.src = url;
					
					urlToRevoke = url;
				} else {
					setBlobUrl(imageUrl); // Fallback
					setActiveHintLevel(hintLevel);
				}
			} catch (e) {
				console.error("Failed to fetch blob", e);
				setBlobUrl(imageUrl); // Fallback
				setActiveHintLevel(hintLevel);
			}
		};

		fetchBlob();

		return () => {
			if (urlToRevoke) URL.revokeObjectURL(urlToRevoke);
		};
	}, [imageUrl, revealed, hintLevel]);

	const activeHintLevels = HINT_LEVELS;
	const currentHint = activeHintLevels[Math.min(activeHintLevel, activeHintLevels.length - 1)];
	const cropPercent = currentHint.cropSize;

	const previousCropPercent = useRef(cropPercent);

	useEffect(() => {
		previousCropPercent.current = cropPercent;
	}, [cropPercent]);

	useGSAP(() => {
		if (!imageRef.current) return;

		if (revealed) {
			// Reveal animation: lật ảnh full và phát sáng
			gsap.to(imageRef.current, {
				scale: 1,
				duration: 0.8,
				ease: "back.out(1.7)",
			});
			gsap.to(containerRef.current, {
				borderColor: "rgba(var(--primary-500-rgb, 99, 102, 241), 0.6)",
				boxShadow: "0 0 60px rgba(var(--primary-500-rgb, 99, 102, 241), 0.3)",
				duration: 1,
				ease: "power2.out",
			});
		} else {
			const ratio = cropPercent / previousCropPercent.current;
			
			gsap.fromTo(
				imageRef.current,
				{ scale: ratio },
				{
					scale: 1,
					duration: 0.6,
					ease: "power2.out",
				}
			);
		}
	}, [activeHintLevel, revealed, cropPercent]);

	return (
		<div 
			className="relative flex flex-col items-center gap-4"
			onContextMenu={(e) => {
				if (!revealed) e.preventDefault(); // Chặn chuột phải khi chưa lật bài
			}}
		>
			{/* Main Crop Container */}
			<div
				ref={containerRef}
				className={`relative overflow-hidden border-2 transition-all duration-700 ${
					revealed
						? "w-[90vw] max-w-3xl aspect-video rounded-3xl border-primary-500/60 bg-black/60 backdrop-blur-xl"
						: "w-40 h-40 sm:w-52 sm:h-52 rounded-2xl border-primary-500/30 bg-gray-900/60"
				} shadow-2xl`}
			>
				{/* Ambient glow behind */}
				<div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-blue-500/10 pointer-events-none z-0" />

				{/* Invisible Shield Overlay to block drag/hold/click */}
				{!revealed && (
					<div 
						className="absolute inset-0 z-20" 
						onDragStart={(e) => e.preventDefault()}
					/>
				)}

				<SafeImage
					ref={imageRef}
					src={blobUrl || imageUrl}
					fallback={fallbackUrl || "/fallback-image.svg"}
					alt="Mystery card"
					draggable={false}
					className={`absolute inset-0 w-full h-full z-10 select-none pointer-events-none ${revealed ? "object-contain" : "object-cover"}`}
					style={{
						transformOrigin: "50% 50%",
					}}
					loading="eager"
				/>

				{/* Vignette overlay */}
				{!revealed && (
					<div className="absolute inset-0 z-20 pointer-events-none"
						style={{
							background: "radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.6) 100%)",
						}}
					/>
				)}

				{/* Scanning line animation */}
				{!revealed && (
					<div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
						<div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-primary-400/40 to-transparent animate-scan" />
					</div>
				)}
			</div>

			{/* Zoom level indicator */}
			{!revealed && (
				<div className="flex items-center gap-2">
					{activeHintLevels.map((level, idx) => {
						if (idx === activeHintLevels.length - 1) return null; // Hide the 100% dot
						return (
							<div
								key={idx}
								className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
									idx <= hintLevel
										? "bg-primary-500 shadow-lg shadow-primary-500/50 scale-110"
										: "bg-white/15"
								}`}
							/>
						);
					})}
				</div>
			)}
		</div>
	);
};

export default CardCropViewer;
