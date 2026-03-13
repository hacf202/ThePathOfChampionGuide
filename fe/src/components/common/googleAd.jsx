// src/components/common/GoogleAd.jsx
import React, { useEffect } from "react";

const GoogleAd = ({ slot, style, format = "auto", responsive = "true" }) => {
	useEffect(() => {
		try {
			// Mỗi khi component render, yêu cầu Google điền quảng cáo vào thẻ <ins>
			(window.adsbygoogle = window.adsbygoogle || []).push({});
		} catch (err) {
			console.error("Google AdSense error:", err);
		}
	}, []);

	return (
		<div className='w-full overflow-hidden flex justify-center my-4 ad-container'>
			<ins
				className='adsbygoogle'
				style={style || { display: "block", width: "100%" }}
				data-ad-client='ca-pub-8338542158873305' // Mã Pub của bạn
				data-ad-slot={slot} // Mã Slot (Tạo trong Dashboard AdSense)
				data-ad-format={format}
				data-full-width-responsive={responsive}
			></ins>
		</div>
	);
};

export default GoogleAd;
