// src/components/admin/PreviewBlock.jsx
import React from "react";

const renderHtml = text => <span dangerouslySetInnerHTML={{ __html: text }} />;

const PreviewBlock = ({ block, referenceData }) => {
	if (!block) return null;

	switch (block.type) {
		case "section":
			return (
				<section className='mb-8 mt-6 border-l-2 border-gray-200 pl-4'>
					{block.title && (
						<h2 className='text-2xl font-bold mb-4 text-gray-800'>
							{block.title}
						</h2>
					)}
					{block.content?.map((sub, i) => (
						<PreviewBlock key={i} block={sub} referenceData={referenceData} />
					))}
				</section>
			);

		case "paragraph":
			return (
				<p className='leading-relaxed mb-4 text-lg'>{renderHtml(block.text)}</p>
			);

		case "image":
			return (
				<figure className='my-8 flex flex-col items-center'>
					<img
						src={block.src}
						alt={block.alt || "Image"}
						className='rounded-lg shadow-md max-w-full h-auto object-cover'
						style={{ maxHeight: "500px" }}
					/>
					{block.alt && (
						<figcaption className='mt-2 text-sm italic text-center text-gray-500'>
							{block.alt}
						</figcaption>
					)}
				</figure>
			);

		case "list":
			return (
				<ul className='list-disc list-outside ml-6 mb-6 space-y-2 text-lg'>
					{block.items.map((item, index) => (
						<li key={index}>{renderHtml(item)}</li>
					))}
				</ul>
			);

		case "table":
			// Hàm hỗ trợ lấy ID và data (giả định đã được khai báo)
			const getTableData = (type, index, dataMap) => {
				const id = block[`${type}Ids`]?.[index];
				return { id, data: dataMap?.[id] };
			};

			return (
				<div className='my-6 overflow-x-auto border rounded-lg shadow-sm'>
					{block.title && (
						<div className='px-4 py-2 font-bold border-b bg-gray-50'>
							{block.title}
						</div>
					)}
					<table className='min-w-full divide-y divide-gray-200'>
						<thead className='bg-gray-100'>
							<tr>
								{/* Thêm cột ID nếu có loại ID được chọn */}
								{(block.idType === "relic" ||
									block.idType === "power" ||
									block.idType === "champion") && (
									<th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
										ID
									</th>
								)}
								{block.headers?.map((h, i) => (
									<th
										key={i}
										className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
									>
										{h}
									</th>
								))}
							</tr>
						</thead>
						<tbody className='bg-white divide-y divide-gray-200'>
							{block.rows?.map((row, rIdx) => {
								const { id: championId, data: championData } = getTableData(
									"champion",
									rIdx,
									referenceData?.champions
								);
								const { id: relicId, data: relicData } = getTableData(
									"relic",
									rIdx,
									referenceData?.relics
								);
								const { id: powerId, data: powerData } = getTableData(
									"power",
									rIdx,
									referenceData?.powers
								);

								return (
									<tr key={rIdx} className='hover:bg-gray-50 transition'>
										{(block.idType === "relic" ||
											block.idType === "power" ||
											block.idType === "champion") && (
											<td className='px-4 py-3 text-sm font-mono text-gray-600'>
												{block.idType === "relic"
													? relicId
													: block.idType === "power"
													? powerId
													: championId}
											</td>
										)}
										{row.map((cell, cIdx) => {
											let content = renderHtml(cell);

											// Xử lý hiển thị ảnh và link ở cột đầu tiên
											if (cIdx === 0) {
												let imgSrc = null;
												let linkUrl = null;
												let hasMatch = false;

												if (championData) {
													imgSrc = championData.assets?.[0]?.avatar;
													linkUrl = `/champion/${championId}`;
													hasMatch = true;
												} else if (relicData) {
													imgSrc = relicData.assetAbsolutePath;
													linkUrl = `/relic/${relicId}`;
													hasMatch = true;
												} else if (powerData) {
													imgSrc = powerData.assetAbsolutePath;
													linkUrl = `/power/${powerId}`;
													hasMatch = true;
												}

												if (hasMatch) {
													content = (
														<a
															href={linkUrl}
															className='flex items-center gap-3 hover:underline font-semibold text-blue-600 group'
															target='_blank'
															rel='noopener noreferrer'
														>
															{imgSrc && (
																<img
																	src={imgSrc}
																	alt=''
																	className='w-8 h-8 rounded object-cover border shadow-sm group-hover:scale-105 transition-transform'
																	onError={e => {
																		e.target.style.display = "none";
																	}}
																/>
															)}
															<span>{renderHtml(cell)}</span>
														</a>
													);
												}
											}

											return (
												<td
													key={cIdx}
													className='px-4 py-3 text-sm whitespace-normal'
												>
													{content}
												</td>
											);
										})}
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			);

		case "sublist":
			return (
				<div className='mb-8 space-y-6'>
					{block.title && (
						<h3 className='text-xl font-bold text-indigo-700'>{block.title}</h3>
					)}

					{block.sublist?.map((item, idx) => (
						<div
							key={idx}
							className='flex flex-col gap-5 p-4 rounded-xl border shadow-sm bg-gray-50'
						>
							{item.image && (
								<div className='flex-shrink-0'>
									<img
										src={item.image}
										alt={item.imageAlt}
										className='w-full object-cover rounded-lg'
									/>
								</div>
							)}
							<div className='flex-1'>
								<h4 className='text-lg font-bold mb-1'>{item.title}</h4>
								{item.desc && (
									<p className='mb-2 text-sm text-gray-600'>
										{renderHtml(item.desc)}
									</p>
								)}

								{item.list && (
									<ul className='list-disc pl-5 space-y-1 text-sm text-gray-700'>
										{item.list.map((li, i) => (
											<li key={i}>{renderHtml(li)}</li>
										))}
									</ul>
								)}
							</div>
						</div>
					))}
				</div>
			);

		case "conclusion":
			return (
				<div className='mt-12 p-6 rounded-xl border-l-4 border-yellow-500 bg-yellow-50 text-center'>
					<h3 className='text-xl font-bold mb-2 text-yellow-800'>
						{block.title}
					</h3>
					<p className='text-lg text-yellow-700'>{renderHtml(block.text)}</p>
				</div>
			);

		default:
			return null;
	}
};

export default PreviewBlock;
