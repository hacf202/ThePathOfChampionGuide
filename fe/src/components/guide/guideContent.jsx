// src/components/guide/guideContent.jsx
import React from "react";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import { removeAccents } from "../../utils/vietnameseUtils.js";
import { useTranslation } from "../../hooks/useTranslation"; // 🟢 Import Hook Đa ngôn ngữ

const ContentBlock = ({ block, referenceData }) => {
	const { language, tUI, tDynamic } = useTranslation(); // 🟢 Sử dụng tUI và tDynamic

	if (!block) return null;

	const renderHtml = text => (
		<span dangerouslySetInnerHTML={{ __html: text }} />
	);

	switch (block.type) {
		case "section":
			return (
				<section
					className='mb-8 mt-6 scroll-mt-20'
					id={removeAccents(block.title)}
				>
					{block.title && (
						<h2
							className='text-2xl font-bold mb-4 pb-2 border-b'
							style={{
								color: "var(--color-text-primary)",
								borderColor: "var(--color-border)",
							}}
						>
							{tDynamic(block, "title")}
						</h2>
					)}
					{block.content &&
						block.content.map((subBlock, index) => (
							<ContentBlock
								key={index}
								block={subBlock}
								referenceData={referenceData}
							/>
						))}
				</section>
			);

		case "paragraph":
			return (
				<p
					className='text-base sm:text-lg mb-4 leading-relaxed'
					style={{ color: "var(--color-text-secondary)" }}
					dangerouslySetInnerHTML={{
						__html: tDynamic(block, "content") || block.content,
					}}
				/>
			);

		case "table": {
			const resolvedData = (block.data || []).map(row => {
				const newRow = { ...row };
				block.columns.forEach(col => {
					if (col.type === "reference" && row[col.key]) {
						const refId = row[col.key];
						const refType = col.referenceType;

						if (referenceData[refType] && referenceData[refType][refId]) {
							const refItem = referenceData[refType][refId];
							let link = "#";
							if (refType === "champions") link = `/champion/${refId}`;
							else if (refType === "relics") link = `/relic/${refId}`;
							else if (refType === "powers") link = `/power/${refId}`;

							newRow[col.key] = { ...refItem, link };
						} else {
							newRow._error = true;
						}
					}
				});
				return newRow;
			});

			if (resolvedData.some(row => row._error)) {
				return (
					<div className='p-4 bg-red-50 text-red-600 rounded-md mb-4 border border-red-200 text-sm'>
						{tUI("guideDetail.errorReference")}
					</div>
				);
			}

			if (resolvedData.length === 0) {
				return (
					<p className='italic text-gray-500 text-sm mb-4'>
						{tUI("common.noData")}
					</p>
				);
			}

			return (
				<div className='overflow-x-auto mb-6 rounded-lg border border-gray-200 shadow-sm'>
					<table className='w-full text-left border-collapse'>
						<thead>
							<tr className='bg-gray-50 border-b border-gray-200'>
								{block.columns.map((col, index) => (
									<th
										key={index}
										className='p-3 font-semibold text-gray-700 text-sm whitespace-nowrap'
									>
										{tDynamic(col, "label") || col.label}
									</th>
								))}
							</tr>
						</thead>
						<tbody className='divide-y divide-gray-100'>
							{resolvedData.map((row, rowIndex) => (
								<tr key={rowIndex} className='hover:bg-gray-50  '>
									{block.columns.map((col, colIndex) => {
										const cellData = row[col.key];
										if (!cellData)
											return <td key={colIndex} className='p-3'></td>;

										if (col.type === "reference") {
											const itemName =
												tDynamic(cellData, "name") || cellData.name;
											const itemDesc =
												tDynamic(cellData, "description") ||
												tDynamic(cellData, "desc") ||
												cellData.desc;
											const itemImg =
												cellData.assetAbsolutePath ||
												cellData.image ||
												cellData.icon;

											return (
												<td key={colIndex} className='p-3 align-top'>
													<div className='flex items-start gap-3'>
														{itemImg && (
															<img
																src={itemImg}
																alt={itemName}
																className='w-12 h-12 rounded object-cover border border-gray-200 shadow-sm'
															/>
														)}
														<div>
															<div className='font-semibold text-gray-900 flex items-center gap-2'>
																{cellData.link ? (
																	<Link
																		to={cellData.link}
																		className='hover:text-blue-600 flex items-center gap-1'
																	>
																		{itemName} <ExternalLink size={14} />
																	</Link>
																) : (
																	itemName
																)}
															</div>
															{itemDesc && (
																<p className='text-sm text-gray-600 mt-1 line-clamp-2'>
																	{itemDesc}
																</p>
															)}
														</div>
													</div>
												</td>
											);
										}
										const cellText =
											language === "en" && row[`${col.key}_en`]
												? row[`${col.key}_en`]
												: cellData;
										return (
											<td
												key={colIndex}
												className='p-3 text-gray-700 text-sm align-middle'
											>
												{cellText}
											</td>
										);
									})}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			);
		}

		case "infobox":
			return (
				<div
					className='mb-6 p-4 rounded-lg border-l-4'
					style={{
						backgroundColor: "var(--color-surface-hover-bg)",
						borderColor: "var(--color-primary-500)",
					}}
				>
					{block.title && (
						<h4
							className='font-bold mb-1'
							style={{ color: "var(--color-text-primary)" }}
						>
							{tDynamic(block, "title")}
						</h4>
					)}
					<p
						className='text-sm sm:text-base'
						style={{ color: "var(--color-text-secondary)" }}
					>
						{renderHtml(tDynamic(block, "desc") || block.desc)}
					</p>
				</div>
			);

		case "gallery":
			return (
				<div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6'>
					{block.images?.map((img, index) => (
						<div key={index} className='flex flex-col'>
							<img
								src={img.url}
								alt={
									tDynamic(img, "caption") ||
									img.caption ||
									`Gallery image ${index}`
								}
								className='w-full h-auto rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow'
							/>
							{img.caption && (
								<p className='text-sm text-center text-gray-500 mt-2 italic'>
									{tDynamic(img, "caption")}
								</p>
							)}
						</div>
					))}
				</div>
			);

		case "youtube":
			return (
				<div className='mb-6'>
					<div className='relative w-full overflow-hidden pt-[56.25%] rounded-lg shadow-md border border-gray-200'>
						<iframe
							className='absolute top-0 left-0 w-full h-full'
							src={block.url}
							title='YouTube video player'
							frameBorder='0'
							allowFullScreen
						></iframe>
					</div>
					{block.caption && (
						<p className='text-sm text-center text-gray-500 mt-2 italic'>
							{tUI("guideDetail.sourceLabel")} {tDynamic(block, "caption")}
						</p>
					)}
				</div>
			);

		case "list": {
			const listItems =
				language === "en" && block.items_en ? block.items_en : block.items;
			return (
				<ul
					className={`mb-6 pl-5 space-y-2 text-base sm:text-lg ${block.style === "ordered" ? "list-decimal" : "list-disc"}`}
					style={{ color: "var(--color-text-secondary)" }}
				>
					{listItems?.map((item, index) => (
						<li key={index}>{renderHtml(item)}</li>
					))}
				</ul>
			);
		}

		case "accordion":
			return (
				<div className='mb-6 space-y-3'>
					{block.items?.map((item, index) => {
						const accItems =
							language === "en" && item.list_en ? item.list_en : item.list;
						return (
							<div
								key={index}
								className='border border-gray-200 rounded-lg p-4 bg-white shadow-sm'
							>
								<h4
									className='font-bold text-lg mb-2'
									style={{ color: "var(--color-text-primary)" }}
								>
									{tDynamic(item, "title")}
								</h4>
								{item.desc && (
									<p className='text-sm text-gray-600 mb-2'>
										{renderHtml(tDynamic(item, "desc") || item.desc)}
									</p>
								)}
								{accItems && (
									<ul className='list-disc pl-5 space-y-1 text-sm text-gray-700'>
										{accItems.map((listItem, i) => (
											<li key={i}>{renderHtml(listItem)}</li>
										))}
									</ul>
								)}
								{item.image && (
									<img
										src={item.image}
										className='w-full h-72 object-cover rounded-lg mt-3 shadow-sm'
										alt={tDynamic(item, "title")}
									/>
								)}
							</div>
						);
					})}
				</div>
			);

		case "conclusion":
			return (
				<div
					className='mt-12 p-6 rounded-xl border text-center'
					style={{
						backgroundColor: "var(--color-surface-hover-bg)",
						borderColor: "var(--color-primary-300)",
					}}
				>
					<h3 className='text-xl font-bold mb-2 text-blue-800'>
						{tDynamic(block, "title")}
					</h3>
					<p className='text-lg text-gray-700 font-medium italic'>
						{tDynamic(block, "content") || block.content}
					</p>
				</div>
			);

		default:
			return null;
	}
};

const GuideContent = ({ content, referenceData }) => {
	if (!content || !Array.isArray(content)) return null;
	return (
		<div className='guide-rich-content'>
			{content.map((block, index) => (
				<ContentBlock key={index} block={block} referenceData={referenceData} />
			))}
		</div>
	);
};

export default GuideContent;
