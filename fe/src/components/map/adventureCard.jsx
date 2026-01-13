// src/components/map/adventureCard.jsx
import React, { useState, useMemo } from "react";
import { Star, StarHalf, Skull, Map, ChevronDown } from "lucide-react";
import Button from "../common/button";
import iconsData from "../../assets/data/icon.json";

const StarRating = ({ count }) => {
	return (
		<div
			className='flex items-center text-yellow-500'
			title={`Độ khó: ${count} sao`}
		>
			{[...Array(7)].map((_, i) => {
				const starValue = i + 1;
				if (count >= starValue)
					return (
						<Star key={i} size={16} className='fill-current' strokeWidth={0} />
					);
				if (count >= starValue - 0.5)
					return (
						<StarHalf
							key={i}
							size={16}
							className='fill-current'
							strokeWidth={0}
						/>
					);
				return (
					<Star key={i} size={16} className='text-white' strokeWidth={1.5} />
				);
			})}
			<span className='ml-1.5 text-base font-bold text-white'>({count})</span>
		</div>
	);
};

const AdventureCard = ({ adventure, onFilterClick }) => {
	const [isExpanded, setIsExpanded] = useState(false);

	// Sắp xếp icon từ dài nhất đến ngắn nhất để tránh khớp sai từ khóa con
	const sortedIcons = useMemo(() => {
		return [...iconsData].sort((a, b) => b.name.length - a.name.length);
	}, []);

	const handleLinkClick = (e, value) => {
		e.stopPropagation();
		if (onFilterClick) onFilterClick(value);
	};

	const RenderLinkItem = ({ name, displayName, customClass = "" }) => {
		if (!name) return null;
		const normalizedName = name.toLowerCase().trim();
		const finalDisplay = displayName || name;

		let matches = [];
		let tempName = normalizedName;

		// Duyệt để tìm các khớp dựa trên độ dài trước
		sortedIcons.forEach(icon => {
			const iconName = icon.name.toLowerCase().trim();
			if (tempName.includes(iconName)) {
				matches.push(icon);
				tempName = tempName.replace(iconName, "___");
			}
		});

		if (matches.length > 0) {
			// Sắp xếp lại các icon tìm thấy theo thứ tự xuất hiện trong chuỗi gốc
			const sortedByAppearance = matches.sort(
				(a, b) =>
					normalizedName.indexOf(a.name.toLowerCase()) -
					normalizedName.indexOf(b.name.toLowerCase())
			);

			// LOGIC MỚI: Đảo ngược lại
			// Icon chính (Lớn) = Từ khóa xuất hiện ĐẦU TIÊN (Vật phẩm)
			// Icon phụ (Góc) = Từ khóa xuất hiện SAU CÙNG (Vùng)
			const primaryIcon = sortedByAppearance[0];
			const secondaryIcon =
				sortedByAppearance.length > 1
					? sortedByAppearance[sortedByAppearance.length - 1]
					: null;

			return (
				<button
					onClick={e => handleLinkClick(e, name)}
					className={`flex items-center gap-3 group/link hover:text-primary-400 transition-all text-left ${customClass}`}
				>
					<div className='relative flex-shrink-0'>
						{/* Icon chính lớn (Vật phẩm) */}
						<img
							src={primaryIcon.image}
							alt={primaryIcon.name}
							className='w-8 h-8 object-contain transition-transform group-hover/link:scale-110'
						/>

						{/* Icon phụ nhỏ (Vùng) nằm ở góc dưới bên phải */}
						{secondaryIcon && (
							<div className='absolute -bottom-1 -right-1 p-0.5 shadow-lg'>
								<img
									src={secondaryIcon.image}
									alt={secondaryIcon.name}
									className='w-5 h-5 object-contain'
								/>
							</div>
						)}
					</div>

					<span className='font-bold underline-offset-4 group-hover/link:underline'>
						{finalDisplay}
					</span>
				</button>
			);
		}
		return <span className={customClass}>{finalDisplay}</span>;
	};

	return (
		<div
			className={`group relative flex flex-col rounded-xl border transition-all duration-500 overflow-hidden isolate ${
				isExpanded
					? "border-primary-500 shadow-[0_0_20px_rgba(var(--primary-500),0.3)] bg-surface-bg"
					: "border-border/60 hover:border-primary-500/80 bg-surface-bg"
			}`}
		>
			{/* Phần Background Image */}
			{adventure.image && (
				<div className='absolute inset-0 -z-10 pointer-events-none select-none overflow-hidden rounded-xl'>
					<img
						src={adventure.image}
						alt=''
						className={`w-full h-full object-cover object-top transition-all duration-700 ease-out ${
							isExpanded ? "scale-100 opacity-70 " : "scale-100 opacity-100"
						}`}
					/>
					<div className='absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent' />
				</div>
			)}

			<div className='relative z-10 flex flex-col h-full'>
				<div
					className='p-4 cursor-pointer'
					onClick={() => setIsExpanded(!isExpanded)}
				>
					<div className='flex justify-between items-start gap-3 mb-2'>
						<div className='min-w-0'>
							<h3 className='font-bold text-xl md:text-4xl text-white font-primary truncate drop-shadow-md'>
								{adventure.adventureName}
							</h3>
							<p className='text-base text-white italic truncate'>
								{adventure.adventureNameRef}
							</p>
						</div>
						<div className='shrink-0 bg-surface-bg/40 backdrop-blur-md px-2.5 py-1 rounded border border-white/10 text-xl text-white font-bold shadow-sm flex items-center gap-1.5'>
							<RenderLinkItem name='Điểm Huyền Thoại' displayName='' />
							{adventure.championXP} XP
						</div>
					</div>

					<div className='flex flex-wrap items-center gap-2 mb-3'>
						<div className='bg-black/20 px-2 py-0.5 rounded-full border border-white/5'>
							<StarRating count={adventure.difficulty} />
						</div>
						<span className='text-white/50'>|</span>
						<div className='flex items-center gap-1.5 text-base text-white bg-black/20 px-2 py-0.5 rounded-full border border-white/5'>
							<Map size={14} className='text-primary-400' />
							<span>{adventure.typeAdventure}</span>
						</div>
					</div>

					<div className='flex items-center justify-between mt-2 pt-2 border-t border-white/10 text-white'>
						<div className='flex items-center gap-2'>
							<Skull size={14} className='text-danger-text-dark' />
							<RenderLinkItem name={adventure.bosses[0]?.name} />
							{!isExpanded && adventure.bosses.length > 1 && (
								<span className='text-base ml-1.5 px-1.5 py-0.5 bg-surface-hover/50 rounded'>
									+{adventure.bosses.length - 1}
								</span>
							)}
						</div>
						<ChevronDown
							size={20}
							className={`transition-transform ${
								isExpanded ? "rotate-180" : ""
							}`}
						/>
					</div>
				</div>

				<div
					className={`grid transition-[grid-template-rows] duration-300 ease-out ${
						isExpanded
							? "grid-rows-[1fr] opacity-100"
							: "grid-rows-[0fr] opacity-0"
					}`}
				>
					<div className='overflow-hidden'>
						<div className='md:px-4 pb-4 pt-1 bg-surface-bg/40 backdrop-blur-xl md:mx-2 mb-2 rounded-lg border border-white/5 shadow-inner'>
							<div className='mb-4 mt-3'>
								<h4 className='text-base font-bold text-white uppercase mb-2 ml-1'>
									Trùm
								</h4>
								<div className='grid grid-cols-1 gap-2'>
									{adventure.bosses.map((boss, idx) => (
										<div
											key={idx}
											className='flex justify-between items-center p-2 rounded bg-black/20 border border-white/5 text-white'
										>
											<div className='flex items-center gap-2'>
												<span className='w-1.5 h-1.5 rounded-full bg-danger-text-dark'></span>
												<RenderLinkItem name={boss.name} />
											</div>
											<span className='text-base opacity-70'>{boss.power}</span>
										</div>
									))}
								</div>
							</div>

							<div className='mb-4 rounded-lg overflow-hidden border border-border/60'>
								<table className='w-full text-base text-left'>
									<thead className='text-white uppercase bg-surface-hover/80'>
										<tr>
											<th className='px-3 py-2 w-1/3 border-r border-border/50 text-center'>
												Yêu cầu
											</th>
											<th className='px-3 py-2 text-center'>Phần thưởng</th>
										</tr>
									</thead>
									<tbody className='divide-y divide-border/50 bg-surface-bg/60 text-white'>
										{adventure.requirement.map((req, idx) => (
											<tr
												key={idx}
												className='hover:bg-white/5 transition-colors'
											>
												<td className='px-3 py-2 border-r border-border/50'>
													<RenderLinkItem
														name={req}
														displayName={req === "ALL" ? "Tướng Bất Kỳ" : null}
													/>
												</td>
												<td className='px-3 py-2'>
													{adventure.rewards[idx]?.items.map((item, i) => (
														<div key={i} className='py-1'>
															<RenderLinkItem
																name={item.name}
																displayName={`${item.count} ${item.name}`}
															/>
														</div>
													))}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>

							<div className='text-center pt-1'>
								<Button
									variant='outline'
									size='sm'
									onClick={e => {
										e.stopPropagation();
										setIsExpanded(false);
									}}
									className='w-full border-white text-white hover:text-primary-400'
								>
									Thu gọn
								</Button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AdventureCard;
