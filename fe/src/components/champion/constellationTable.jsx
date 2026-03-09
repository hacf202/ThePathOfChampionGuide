// src/components/champion/constellationTable.jsx
import React, { useState } from "react";
import { Star } from "lucide-react";
import { RenderRequirements } from "./requirementIcon";
import { useTranslation } from "../../hooks/useTranslation"; // 🟢 Import Hook Đa ngôn ngữ

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
	const { tUI, tDynamic } = useTranslation(); // 🟢 Khởi tạo Hook
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
		<div className='mt-8 bg-surface-bg rounded-lg overflow-hidden border border-border shadow-sm'>
			{/* TABS */}
			<div className='flex gap-1 border-b border-border px-2 sm:px-4 pt-2 sm:pt-4 bg-surface-hover/30'>
				<button
					onClick={() => setActiveConstellationTab("starPowers")}
					className={`px-3 sm:px-4 py-2 font-semibold text-[13px] sm:text-sm   border-b-2 ${
						activeConstellationTab === "starPowers"
							? "border-primary-500 text-primary-500 bg-surface-bg"
							: "border-transparent text-text-secondary hover:text-text-primary"
					}`}
				>
					{tUI("constellation.tabStarPowers")}
				</button>
				<button
					onClick={() => setActiveConstellationTab("bonusStars")}
					className={`px-3 sm:px-4 py-2 font-semibold text-[13px] sm:text-sm   border-b-2 ${
						activeConstellationTab === "bonusStars"
							? "border-primary-500 text-primary-500 bg-surface-bg"
							: "border-transparent text-text-secondary hover:text-text-primary"
					}`}
				>
					{tUI("constellation.tabBonusStars")}
				</button>
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
						{currentList.map((node, index) => (
							<tr
								key={node.nodeID || index}
								className='hover:bg-surface-hover/40  '
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

								{/* Cột 3: Hình ảnh */}
								<td className='py-1 px-1 sm:px-2 align-middle border-r border-border/50'>
									<div className='flex justify-center'>
										<div className='w-12 h-12 sm:w-14 sm:h-14 rounded bg-surface-bg '>
											<img
												src={node.image}
												alt={tDynamic(node, "name") || node.name}
												className='w-full h-full object-contain drop-shadow-sm'
											/>
										</div>
									</div>
								</td>

								{/* Cột 4: Tên */}
								<td className='py-1 px-1 sm:px-2 align-middle border-r border-border/50 text-xs sm:text-sm font-semibold text-text-primary'>
									{tDynamic(node, "name") || node.name}
								</td>

								{/* Cột 5: Sức mạnh (Mô tả) */}
								<td className='py-1 px-2 sm:px-4 align-middle text-xs sm:text-[13px] text-text-primary leading-relaxed'>
									<div
										dangerouslySetInnerHTML={{
											__html: tDynamic(node, "description") || node.description,
										}}
									/>
								</td>
							</tr>
						))}
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
