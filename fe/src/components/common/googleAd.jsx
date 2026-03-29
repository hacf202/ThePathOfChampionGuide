// src/components/common/GoogleAd.jsx
import React, { useEffect } from "react";

const GoogleAd = ({
	slot,
	style,
	format = "auto",
	responsive = "true",
	minHeight = "90px",
	width = "100%",
	height = "100%",
	layout = "",
}) => {
	useEffect(() => {
		try {
			// Mỗi khi component render, yêu cầu Google điền quảng cáo vào thẻ <ins>
			(window.adsbygoogle = window.adsbygoogle || []).push({});
		} catch (err) {
			console.error("Google AdSense error:", err);
		}
	}, []);

	return (
		<div
			className='w-full overflow-hidden flex justify-center my-6 sm:my-10 ad-container'
			style={{
				minHeight: format === "horizontal" ? "90px" : minHeight,
				width: width !== "100%" ? width : "100%",
			}}
		>
			<ins
				className='adsbygoogle'
				style={
					style || {
						display: "block",
						width: width,
						height: height,
					}
				}
				data-ad-client='ca-pub-8338542158873305' // Mã Pub của bạn
				data-ad-slot={slot} // Mã Slot (Tọa trong Dashboard AdSense)
				data-ad-format={format}
				data-full-width-responsive={responsive}
				{...(layout ? { "data-ad-layout": layout } : {})}
			></ins>
		</div>
	);
};

export default GoogleAd;
