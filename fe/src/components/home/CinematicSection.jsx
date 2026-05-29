import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const CinematicSection = ({ title1, title2, bgImage, children, reverse = false }) => {
	const ref = useRef(null);
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start end", "end start"]
	});
	
	// Hiệu ứng cuộn cho ảnh nền (Parallax không delay)
	const backgroundY = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);
	const textY = useTransform(scrollYProgress, [0, 1], ["-40px", "40px"]);

	return (
		<section ref={ref} className='relative w-full min-h-[90vh] lg:min-h-screen bg-[#05050A] overflow-hidden flex items-center justify-center isolate py-16 lg:py-24'>
			<div className='absolute inset-0 z-0 select-none overflow-hidden bg-black'>
				{/* 100% Opacity, No Grayscale, Parallax Y */}
				<motion.div 
					className='absolute inset-0 -top-[20%] -bottom-[20%] transform-gpu'
					style={{ y: backgroundY }}
				>
					<img
						src={bgImage}
						alt='Background'
						loading='lazy'
						className='w-full h-full object-cover scale-[1.1] transition-transform duration-[30s] ease-linear hover:scale-[1.15] will-change-transform opacity-100'
					/>
				</motion.div>
				
				{/* Gradients to keep text readable but let colors pop (Dark gradient instead of page-bg) */}
				<div className='absolute inset-0 bg-gradient-to-t from-[#05050A] via-[#05050A]/60 to-transparent opacity-95' />
				<div className='absolute inset-0 bg-gradient-to-b from-[#05050A]/90 via-transparent to-transparent opacity-80' />
				
				{/* GRAIN TEXTURE */}
				<div className='absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay'
					style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }} />
			</div>

			<div className='relative w-full h-full max-w-[1920px] mx-auto z-20 p-4 md:px-12 flex flex-col justify-center overflow-visible'>
				{/* Tiêu đề bay theo parallax nhẹ */}
				<motion.div 
					style={{ y: textY }}
					className={`pointer-events-none z-30 w-full px-4 select-none mb-8 lg:mb-16 overflow-visible ${reverse ? 'lg:text-right text-center' : 'lg:text-left text-center'}`}
				>
					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						whileInView={{ opacity: 1, scale: 1 }}
						viewport={{ once: true, margin: "-100px" }}
						transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
						className="overflow-visible"
					>
						{/* Fix chữ tiêu đề: Đẩy title1 lên 100% opacity */}
						<h2 className='text-4xl sm:text-6xl md:text-[8rem] lg:text-[11rem] font-black uppercase leading-[0.85] tracking-tighter italic text-white filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)] overflow-visible w-full max-w-[100vw]'>
							<span className="inline-block pr-12 lg:pr-24 overflow-visible">{title1}</span> <br />
							<span className='text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.9)] relative inline-block pr-12 lg:pr-24 overflow-visible'>
								{title2}
							</span>
						</h2>
					</motion.div>
				</motion.div>
				<div className="z-40 w-full px-2 lg:px-4">
					{children}
				</div>
			</div>
		</section>
	);
};

export default CinematicSection;
