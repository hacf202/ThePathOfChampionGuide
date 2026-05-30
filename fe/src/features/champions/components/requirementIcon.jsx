import React from "react";

export const RequirementIcon = ({ type }) => {
	let src = "";
	switch (type) {
		case "Fragment":
			src =
				"https://images.pocguide.top/icon/15px-PoC_Wild_Fragment_icon.webp";
			break;
		case "Crystal":
			src =
				"https://images.pocguide.top/icon/40px-PoC_Star_Crystal_icon.webp";
			break;
		case "Nova Crystal":
			src =
				"https://images.pocguide.top/icon/40px-PoC_Nova_Crystal_icon.webp";
			break;
		case "Gemstone":
			src =
				"https://images.pocguide.top/icon/40px-PoC_Gemstone_icon.webp";
			break;
		default:
			src =
				"https://images.pocguide.top/icon/15px-PoC_Wild_Fragment_icon.webp";
	}
	return (
		<img
			src={src}
			alt={type}
			className='w-[14px] h-[14px] sm:w-[18px] sm:h-[18px] object-contain inline-block'
		/>
	);
};

export const RenderRequirements = ({ requirements }) => {
	if (!requirements || requirements.length === 0)
		return <span className='text-text-secondary'>-</span>;

	return (
		<div className='flex flex-wrap items-center justify-center gap-1 text-[11px] sm:text-[13px] font-medium text-text-primary'>
			{requirements.map((req, idx) => (
				<div key={idx} className='flex items-center gap-1'>
					{idx > 0 && (
						<span className='text-text-secondary mx-0.5 text-[10px] sm:text-xs font-bold'>
							+
						</span>
					)}
					<RequirementIcon type={req.type} />
					<span>{req.value}</span>
				</div>
			))}
		</div>
	);
};
