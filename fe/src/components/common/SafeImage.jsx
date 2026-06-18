// src/components/common/SafeImage.jsx
import React, { useState, useEffect } from "react";

const SafeImage = React.forwardRef(({
	src,
	alt = "Image",
	className = "",
	crossOrigin = undefined,
	fallback = "/fallback-image.svg",
	loading = "lazy",
	width, // Thêm prop width
	height, // Thêm prop height
	...props
}, ref) => {
	const getOptimizedSrc = (originalSrc) => {
		if (!originalSrc || typeof originalSrc !== "string") return originalSrc;
		
		// Nếu là link proxy của mình, ta có thể thêm tham số resize
		if (originalSrc.includes("/proxy-image")) {
			try {
				const url = new URL(originalSrc, window.location.origin);
				if (width) url.searchParams.set("w", width);
				if (height) url.searchParams.set("h", height);
				return url.pathname + url.search;
			} catch (e) {
				return originalSrc;
			}
		}
		return originalSrc;
	};

	const optimizedSrc = getOptimizedSrc(src);
	const [imgSrc, setImgSrc] = useState(optimizedSrc || fallback);
	const [hasError, setHasError] = useState(false);

	useEffect(() => {
		const newSrc = getOptimizedSrc(src);
		setImgSrc(newSrc || fallback);
		setHasError(false);
	}, [src, width, height]);

	const handleError = () => {
		if (!hasError && imgSrc !== fallback) {
			setImgSrc(fallback);
			setHasError(true);
		}
	};

	return (
		<img
			ref={ref}
			src={imgSrc}
			alt={alt}
			className={className}
			crossOrigin={crossOrigin}
			onError={handleError}
			loading={loading}
			width={width}
			height={height}
			{...props}
		/>
	);
});

SafeImage.displayName = "SafeImage";

export default SafeImage;
