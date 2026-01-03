import React from "react";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import { removeAccents } from "../../utils/vietnameseUtils.js";
/**
 * Hàm hỗ trợ tạo ID từ tiêu đề để làm Anchor Link
 */

const ContentBlock = ({ block, referenceData }) => {
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
							{block.title}
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
					className='leading-relaxed mb-4 text-lg'
					style={{
						color: "var(--color-text-primary)",
						fontFamily: "var(--font-secondary)",
					}}
				>
					{renderHtml(block.text)}
				</p>
			);

		case "image":
			return (
				<figure className='my-8 flex flex-col items-center'>
					<img
						src={block.src}
						alt={block.alt || "Guide Image"}
						className='rounded-lg shadow-md max-w-full h-auto object-cover'
						style={{ maxHeight: "500px" }}
					/>
					{block.alt && (
						<figcaption
							className='mt-2 text-sm italic text-center'
							style={{ color: "var(--color-text-secondary)" }}
						>
							{block.alt}
						</figcaption>
					)}
				</figure>
			);

		case "link":
			return (
				<div className='my-8'>
					<a
						href={block.url}
						target='_blank'
						rel='noopener noreferrer'
						className='flex items-center gap-4 p-4 rounded-2xl border shadow-sm transition-all hover:shadow-md group'
						style={{
							backgroundColor: "var(--color-white)",
							borderColor: "var(--color-border)",
						}}
					>
						{block.image && (
							<div
								className='flex-shrink-0 w-20 h-20 md:w-24 md:h-24 overflow-hidden rounded-xl border'
								style={{ borderColor: "var(--color-border)" }}
							>
								<img
									src={block.image}
									alt={block.label}
									className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
								/>
							</div>
						)}
						<div className='flex-1 min-w-0'>
							<h4
								className='font-bold text-lg md:text-xl truncate group-hover:text-blue-600 transition-colors'
								style={{
									color: "var(--color-text-primary)",
									fontFamily: "var(--font-primary)",
								}}
							>
								{block.label || "Xem liên kết"}
							</h4>
							<p
								className='text-sm truncate opacity-60 mt-1'
								style={{ color: "var(--color-text-secondary)" }}
							>
								{block.url}
							</p>
						</div>
						<div className='text-gray-400 group-hover:text-blue-500 transition-colors pr-2'>
							<ExternalLink size={24} />
						</div>
					</a>
				</div>
			);

		case "list":
			return (
				<ul
					className='list-disc list-outside ml-6 mb-6 space-y-2 text-lg'
					style={{ color: "var(--color-text-primary)" }}
				>
					{block.items.map((item, index) => (
						<li key={index}>{renderHtml(item)}</li>
					))}
				</ul>
			);

		case "table":
			return (
				<div
					className='my-6 overflow-x-auto border rounded-lg shadow-sm'
					style={{ borderColor: "var(--color-border)" }}
				>
					{block.title && (
						<div
							className='px-4 py-2 font-bold border-b'
							style={{ color: "var(--color-text-primary)" }}
						>
							{block.title}
						</div>
					)}
					<table
						className='min-w-full divide-y'
						style={{ borderColor: "var(--color-gray-300)" }}
					>
						<thead style={{ backgroundColor: "var(--color-gray-100)" }}>
							<tr>
								{block.headers?.map((header, index) => (
									<th
										key={index}
										className='px-4 py-2 text-left font-bold text-sm uppercase text-gray-600'
									>
										{header}
									</th>
								))}
							</tr>
						</thead>
						<tbody
							className='divide-y'
							style={{ borderColor: "var(--color-gray-300)" }}
						>
							{block.rows?.map((row, rowIndex) => {
								const championId = block.championIds?.[rowIndex];
								const relicId = block.relicIds?.[rowIndex];
								const powerId = block.powerIds?.[rowIndex];

								const reference =
									referenceData?.champions?.[championId] ||
									referenceData?.relics?.[relicId] ||
									referenceData?.powers?.[powerId];

								return (
									<tr
										key={rowIndex}
										className={rowIndex % 2 !== 0 ? "bg-gray-50" : "bg-white"}
									>
										{row.map((cell, cellIndex) => {
											let cellContent = renderHtml(cell);
											if (cellIndex === 0 && reference) {
												const imageSrc =
													reference.assets?.[0]?.avatar ||
													reference.assetAbsolutePath;
												const linkPath = reference.championID
													? `/champion/${championId}`
													: reference.relicCode
													? `/relic/${relicId}`
													: `/power/${powerId}`;
												cellContent = (
													<Link
														to={linkPath}
														className='flex items-center gap-3 hover:underline font-semibold text-blue-600 group'
													>
														{imageSrc && (
															<img
																src={imageSrc}
																className='w-10 h-10 rounded object-cover border shadow-sm'
																alt=''
															/>
														)}
														<span>{renderHtml(cell)}</span>
													</Link>
												);
											}
											return (
												<td
													key={cellIndex}
													className='px-4 py-3 text-sm text-gray-800'
												>
													{cellContent}
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
						<h3
							className='text-xl font-bold text-blue-800'
							style={{ fontFamily: "var(--font-primary)" }}
						>
							{block.title}
						</h3>
					)}
					{block.sublist.map((item, index) => (
						<div
							key={index}
							className='flex flex-col gap-5 p-4 rounded-xl border shadow-sm bg-white hover:shadow-md transition-shadow'
							style={{ borderColor: "var(--color-border)" }}
						>
							<div className='flex-1'>
								<h4
									className='text-lg font-bold mb-1'
									style={{ color: "var(--color-text-primary)" }}
								>
									{item.title}
								</h4>
								{item.desc && (
									<p className='text-sm text-gray-600 mb-2'>
										{renderHtml(item.desc)}
									</p>
								)}
								{item.list && (
									<ul className='list-disc pl-5 space-y-1 text-sm text-gray-700'>
										{item.list.map((listItem, i) => (
											<li key={i}>{renderHtml(listItem)}</li>
										))}
									</ul>
								)}
								{item.image && (
									<img
										src={item.image}
										className='w-full h-72 object-cover rounded-lg mt-3 shadow-sm'
										alt={item.title}
									/>
								)}
							</div>
						</div>
					))}
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
						{block.title}
					</h3>
					<p className='text-lg text-gray-800'>{renderHtml(block.text)}</p>
				</div>
			);

		default:
			return null;
	}
};

const GuideContent = ({ content, referenceData }) => {
	if (!content || !Array.isArray(content)) return null;
	return (
		<>
			{content.map((block, index) => (
				<ContentBlock key={index} block={block} referenceData={referenceData} />
			))}
		</>
	);
};

export default GuideContent;
