import React from "react";
import { NavLink } from "react-router-dom";


const fadeInUp = {
	hidden: { opacity: 0, y: 60, filter: "blur(10px)" },
	visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const CinematicCard = ({ to, icon: Icon, title, desc, img, small = false }) => {
	return (
		<div variants={fadeInUp} className="h-full group cursor-pointer" transition={{ duration: 0.4, ease: "easeOut" }}>
			<NavLink
				to={to}
				className={`relative flex flex-col h-full ${small ? 'min-h-[150px] md:min-h-[180px] p-4 md:p-5' : 'min-h-[180px] md:min-h-[250px] lg:min-h-[350px] p-5 md:p-6 lg:p-8'} rounded-2xl lg:rounded-none border-[1px] border-white/10 bg-[#05050A] overflow-hidden transition-all duration-500 hover:border-primary-400 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.9)] hover:shadow-[0_0_40px_-5px_rgba(var(--color-primary-rgb),0.5)]`}
			>
				<img src={img} alt={title} loading='lazy' className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-[1s] ease-out group-hover:scale-110 pointer-events-none" />
				{/* Đảm bảo gradient đen đủ đậm để đọc chữ dễ dàng */}
				<div className="absolute inset-0 bg-gradient-to-t from-[#05050A] via-[#05050A]/70 to-transparent pointer-events-none opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
				
				<div className="relative z-10 flex flex-col h-full justify-end">
					<div className="mb-auto">
						<Icon className={`${small ? 'w-8 h-8' : 'w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12'} text-white group-hover:text-primary-300 transition-all duration-500 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] group-hover:scale-110`} />
					</div>
					<h3 className={`${small ? 'text-lg md:text-2xl' : 'text-xl md:text-3xl lg:text-4xl'} font-black uppercase tracking-tighter text-white mb-1 md:mb-2 group-hover:text-primary-300 transition-colors drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]`}>
						{title}
					</h3>
					<div className="grid grid-rows-[0fr] lg:group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-in-out">
						<div className="overflow-hidden">
							<p className="text-white/90 font-secondary text-xs sm:text-sm md:text-base leading-relaxed pt-2 pb-1 opacity-0 lg:group-hover:opacity-100 transition-opacity duration-500 delay-100 drop-shadow-[0_2px_5px_rgba(0,0,0,0.8)]">
								{desc}
							</p>
						</div>
					</div>
					<p className="lg:hidden text-white/90 font-secondary text-xs mt-2 leading-relaxed drop-shadow-[0_2px_5px_rgba(0,0,0,0.8)]">
						{desc}
					</p>
				</div>
				
				{/* Neon Glow Corner Upgrade */}
				<div className="absolute -top-16 -right-16 w-40 h-40 bg-primary-500/0 md:blur-[50px] blur-[30px] rounded-full group-hover:bg-primary-500/60 transition-all duration-700 pointer-events-none mix-blend-screen" />
			</NavLink>
		</div>
	);
};

export default CinematicCard;
