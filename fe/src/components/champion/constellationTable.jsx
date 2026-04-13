// src/components/champion/constellationTable.jsx
import React, { useState } from "react";
import { Star } from "lucide-react";
import { Link } from "react-router-dom"; // 🟢 Import Link để chuyển hướng
import { RenderRequirements } from "./requirementIcon";
import { useTranslation } from "../../hooks/useTranslation";
import MarkupRenderer from "../common/MarkupRenderer";
import { motion } from "framer-motion";

const StarRating = ({ count }) => {
	return (
		<div className='flex flex-wrap justify-center gap-[1px] w-12 mx-auto'>
			{[...Array(count)].map((_, i) => (
				<Star
					key={i}
					size={14}
					className='text-yellow-500 fill-current drop-shadow-sm'
				/>
			))}
		</div>
	);
};

export default function ConstellationTable({ starPowersList, bonusStarsList }) {
	const { tUI, tDynamic } = useTranslation();
	const [activeConstellationTab, setActiveConstellationTab] =
		useState("starPowers");

	const getBonusStarTypeName = nodeType => {
		if (nodeType === "bonusStar") return tUI("constellation.typeNormal");
		if (nodeType === "bonusStarGem") return tUI("constellation.typeGemstone");
		return nodeType;
	};

	const currentList =
		activeConstellationTab === "starPowers" ? starPowersList : bonusStarsList;

	return (
		<div className='bg-surface-bg rounded-xl overflow-hidden border border-border shadow-sm'>
			{/* TABS SELECTOR */}
			<div className='flex bg-surface-hover/30 p-2 sm:p-4 border-b border-border overflow-x-auto'>
				<div className="flex bg-surface-hover/50 p-1 rounded-lg shrink-0 w-max max-w-full">
					{[
						{ id: "starPowers", label: tUI("constellation.tabStarPowers"), count: starPowersList.length, color: "text-primary-500", bg: "bg-primary-500/10" },
						{ id: "bonusStars", label: tUI("constellation.tabBonusStars"), count: bonusStarsList.length, color: "text-purple-500", bg: "bg-purple-500/10" }
					].map((tab) => (
						<button
							key={tab.id}
							onClick={() => setActiveConstellationTab(tab.id)}
							className={`relative whitespace-nowrap px-4 py-2 rounded-md text-xs font-black tracking-wider uppercase transition-all flex items-center gap-2 ${
								activeConstellationTab === tab.id 
									? `${tab.color} z-10` 
									: "text-text-tertiary hover:text-text-secondary"
							}`}
						>
							{activeConstellationTab === tab.id && (
								<motion.div
									layoutId="activeConstellationSubTab"
									className={`absolute inset-0 ${tab.bg} border border-border rounded-md -z-10`}
									transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
								/>
							)}
							{tab.label}
							<span className={`text-[10px] px-1.5 rounded-full ${activeConstellationTab === tab.id ? `${tab.bg} border border-border` : "bg-black/20 text-text-tertiary"}`}>
								{tab.count}
							</span>
						</button>
					))}
				</div>
			</div>

			{/* TABLE */}
			<div className='overflow-x-auto'>
				<table className='w-full text-left border-collapse min-w-[700px]'>
					<thead>
						<tr className='bg-surface-hover/50 text-text-secondary text-xs sm:text-sm border-b border-border'>
							<th className='py-2 px-2 sm:px-4 w-16 sm:w-20 text-center font-bold'>
								{activeConstellationTab === "starPowers"
									? tUI("constellation.colStar")
									: tUI("constellation.colType")}
							</th>
							<th className='py-2 px-2 sm:px-4 w-24 sm:w-32 text-center font-bold whitespace-nowrap'>
								{tUI("constellation.colReq")}
							</th>
							<th className='py-2 px-2 sm:px-4 w-16 sm:w-24 text-center font-bold'>
								{tUI("constellation.colImg")}
							</th>
							<th className='py-2 px-2 sm:px-4 w-32 sm:w-48 font-bold'>
								{tUI("constellation.colName")}
							</th>
							<th className='py-2 px-2 sm:px-4 font-bold'>
								{tUI("constellation.colPower")}
							</th>
						</tr>
					</thead>
					<tbody className='divide-y divide-border'>
						{currentList.map((node, index) => {
							// 🟢 Xác định đường dẫn dựa trên powerCode hoặc bonusStarID
							const linkPath = node.powerCode
								? `/power/${encodeURIComponent(node.powerCode)}`
								: node.bonusStarID
									? `/power/${encodeURIComponent(node.bonusStarID)}`
									: null;

							const nameDisplay = tDynamic(node, "name") || node.name;

							return (
								<tr
									key={node.nodeID || index}
									className='hover:bg-surface-hover/40 transition-colors'
								>
									{/* Cột 1: Cấp sao / Loại */}
									<td className='py-1 px-1 sm:px-2 align-middle border-r border-border/50 text-center'>
										{activeConstellationTab === "starPowers" ? (
											<StarRating count={index + 1} />
										) : (
											<span className='text-xs sm:text-[13px] font-semibold text-text-secondary'>
												{getBonusStarTypeName(node.nodeType)}
											</span>
										)}
									</td>

									{/* Cột 2: Yêu cầu */}
									<td className='py-1 px-1 sm:px-2 align-middle border-r border-border/50'>
										<div className='flex justify-center'>
											<RenderRequirements requirements={node.requirements} />
										</div>
									</td>

									{/* Cột 3: Hình ảnh (Có Link) */}
									<td className='py-1 px-1 sm:px-2 align-middle border-r border-border/50'>
										<div className='flex justify-center'>
											<div className='w-12 h-12 sm:w-14 sm:h-14 rounded bg-surface-bg overflow-hidden transition-transform hover:scale-105 active:scale-95 shadow-sm'>
												{linkPath ? (
													<Link to={linkPath} className='block w-full h-full'>
														<img
															src={node.image}
															alt={nameDisplay}
															className='w-full h-full object-contain'
														/>
													</Link>
												) : (
													<img
														src={node.image}
														alt={nameDisplay}
														className='w-full h-full object-contain'
													/>
												)}
											</div>
										</div>
									</td>

									{/* Cột 4: Tên (Có Link) */}
									<td className='py-1 px-1 sm:px-2 align-middle border-r border-border/50 text-xs sm:text-sm font-semibold text-text-primary'>
										{linkPath ? (
											<Link
												to={linkPath}
												className='hover:text-primary-500 hover:underline transition-all'
											>
												{nameDisplay}
											</Link>
										) : (
											nameDisplay
										)}
									</td>

									{/* Cột 5: Sức mạnh (Mô tả) */}
									<td className='py-1 px-2 sm:px-4 align-middle text-xs sm:text-[13px] text-text-primary leading-relaxed'>
										<MarkupRenderer text={tDynamic(node, "description") || node.description} />
									</td>
								</tr>
							);
						})}
						{currentList.length === 0 && (
							<tr>
								<td colSpan='5' className='p-6 text-center text-text-secondary'>
									{tUI("constellation.noData")}
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}
