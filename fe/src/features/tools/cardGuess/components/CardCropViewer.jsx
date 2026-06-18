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
	{ cropSize: 15, label: "🔍 x5" },
	{ cropSize: 25, label: "🔍 x4" },
	{ cropSize: 40, label: "🔍 x3" },
	{ cropSize: 60, label: "🔍 x2" },
	{ cropSize: 80, label: "🔍 x1" },
	{ cropSize: 100, label: "👁️" },
];

const HINT_LEVELS_HARD = [
	{ cropSize: 10, label: "🔍 x10" },
	{ cropSize: 15, label: "🔍 x6" },
	{ cropSize: 20, label: "🔍 x5" },
	{ cropSize: 100, label: "👁️" },
];

const CardCropViewer = ({ imageUrl, hintLevel = 0, cropSeed = 0, revealed = false, mode = "unlimited" }) => {
	const containerRef = useRef();
	const imageRef = useRef();

	const [blobUrl, setBlobUrl] = useState(null);

	// Fetch image as Blob to prevent direct URL inspection
	useEffect(() => {
		let urlToRevoke = null;
		
		const fetchBlob = async () => {
			if (!imageUrl) return;
			// If already revealed, we don't strictly need a blob, but for consistency we can use the imageUrl directly
			if (revealed) {
				setBlobUrl(imageUrl);
				return;
			}
			try {
				const response = await fetch(imageUrl);
				if (response.ok) {
					const blob = await response.blob();
					const url = URL.createObjectURL(blob);
					setBlobUrl(url);
					urlToRevoke = url;
				} else {
					setBlobUrl(imageUrl); // Fallback
				}
			} catch (e) {
				console.error("Failed to fetch blob", e);
				setBlobUrl(imageUrl); // Fallback
			}
		};

		fetchBlob();

		return () => {
			if (urlToRevoke) URL.revokeObjectURL(urlToRevoke);
		};
	}, [imageUrl, revealed]);

	// Vị trí crop ngẫu nhiên, được cố định bởi cropSeed
	const cropPosition = useMemo(() => {
		const seededRandom = (seed) => {
			const x = Math.sin(seed * 9301 + 49297) * 233280;
			return x - Math.floor(x);
		};
		return {
			x: 20 + seededRandom(cropSeed) * 60,
			y: 20 + seededRandom(cropSeed + 1) * 60,
		};
	}, [cropSeed]);

	const activeHintLevels = mode === "hard" ? HINT_LEVELS_HARD : HINT_LEVELS;
	const currentHint = activeHintLevels[Math.min(hintLevel, activeHintLevels.length - 1)];
	const cropPercent = currentHint.cropSize;

	// Scale = 100 / cropSize, cho phép zoom vào vùng nhỏ
	const scale = 100 / cropPercent;

	// GSAP animation khi zoom out
	useGSAP(() => {
		if (!imageRef.current) return;

		if (revealed) {
			// Reveal animation: flip + glow
			gsap.to(imageRef.current, {
				scale: 1,
				objectPosition: "50% 50%",
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
			// Smooth zoom out transition
			gsap.to(imageRef.current, {
				scale: scale,
				objectPosition: `${cropPosition.x}% ${cropPosition.y}%`,
				duration: 0.6,
				ease: "power2.out",
			});
		}
	}, [hintLevel, revealed, scale, cropPosition]);

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
						: "w-52 h-52 sm:w-72 sm:h-72 rounded-2xl border-primary-500/30 bg-gray-900/60"
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
					alt="Mystery card"
					draggable={false}
					className={`absolute inset-0 w-full h-full z-10 select-none pointer-events-none ${revealed ? "object-contain" : "object-cover"}`}
					style={{
						objectPosition: revealed ? "50% 50%" : `${cropPosition.x}% ${cropPosition.y}%`,
						transform: revealed ? "scale(1)" : `scale(${scale})`,
						transformOrigin: `${cropPosition.x}% ${cropPosition.y}%`,
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
