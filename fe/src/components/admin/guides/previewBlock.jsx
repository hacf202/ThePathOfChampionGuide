import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "../../../hooks/useTranslation";
import { removeAccents } from "../../../utils/vietnameseUtils";
import MarkupRenderer from "../../common/MarkupRenderer";

const PreviewBlock = ({ block, referenceData }) => {
	const { tDynamic } = useTranslation();
	if (!block) return null;

	switch (block.type) {
		case "section":
			return (
				<section
					className='mb-6 mt-5 border-l-4 border-primary-500 pl-5 bg-surface-hover/10 py-3 rounded-r-xl'
					id={removeAccents(block.title || "")}
				>
					{block.title && (
						<h2 className='text-2xl font-bold mb-3 pb-2 border-b border-border text-text-primary tracking-tight'>
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
				<p className='leading-relaxed mb-4 text-lg text-text-secondary font-secondary'>
					<MarkupRenderer text={block.text} />
				</p>
			);

		case "image":
			return (
				<figure className='my-6 flex flex-col items-center bg-surface-bg p-4 rounded-2xl border border-border shadow-sm'>
					<img
						src={block.url}
						alt={block.caption || "Hình ảnh"}
						className='rounded-xl shadow-md max-w-full h-auto object-contain max-h-[500px]'
						loading='lazy'
					/>
					{block.caption && (
						<figcaption className='mt-3 text-sm font-medium italic text-text-tertiary border-l-2 border-primary-500 pl-3'>
							{block.caption}
						</figcaption>
					)}
				</figure>
			);

		case "youtube":
			return (
				<div className='my-6 bg-surface-bg p-4 rounded-2xl border border-border shadow-sm'>
					<div className='aspect-video rounded-xl overflow-hidden shadow-md bg-black'>
						<iframe
							className='w-full h-full'
							src={block.url}
							title='YouTube Video'
							frameBorder='0'
							allowFullScreen
						/>
					</div>
					{block.caption && (
						<p className='text-center text-sm text-text-tertiary mt-3 italic font-medium'>
							Nguồn: {block.caption}
						</p>
					)}
				</div>
			);

		case "list":
			return (
				<ul className='list-disc pl-6 mb-4 space-y-2 text-lg text-text-secondary'>
					{block.items &&
						block.items.map((item, index) => (
							<li key={index}>
								<MarkupRenderer text={item} />
							</li>
						))}
				</ul>
			);

		case "quote":
			return (
				<blockquote className='border-l-4 border-gray-400 bg-gray-50 dark:bg-gray-800/30 p-4 my-5 rounded-r-lg italic text-lg text-text-secondary'>
					<MarkupRenderer text={block.text} />
					{block.author && (
						<footer className='mt-2 font-bold text-gray-600 dark:text-gray-400 not-italic'>
							— {block.author}
						</footer>
					)}
				</blockquote>
			);

		case "champion":
			const champ = referenceData?.champions?.[block.id];
			if (!champ)
				return (
					<div className='text-red-500 italic text-sm'>
						[Không tìm thấy Tướng với ID: {block.id}]
					</div>
				);
			return (
				<div className='my-5 p-4 rounded-xl border border-border bg-surface-bg shadow-sm flex gap-4'>
					<img
						src={champ.assets?.[0]?.avatar || champ.avatar || "/fallback.png"}
						alt={champ.name}
						className='w-20 h-20 md:w-24 md:h-24 object-cover rounded-xl shadow-md border-2 border-primary-500/20'
					/>
					<div className='flex-1'>
						<div className='flex items-center gap-3'>
							<h3 className='text-xl font-bold text-primary-600 dark:text-primary-400'>
								<Link
									to={`/champions/${champ.championID}`}
									className='hover:underline'
								>
									{tDynamic(champ, "name")}
								</Link>
							</h3>
							<span className='px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-bold rounded'>
								Chi phí: {champ.cost}
							</span>
						</div>
						<div className='flex flex-wrap gap-2 my-2'>
							{champ.regions?.map((reg, rIdx) => (
								<span
									key={rIdx}
									className='px-2 py-1 bg-gray-100 dark:bg-gray-800 text-xs rounded-md text-text-secondary border border-border'
								>
									{reg}
								</span>
							))}
						</div>
						<p className='text-sm text-text-secondary italic line-clamp-2'>
							{tDynamic(champ, "description")}
						</p>
					</div>
				</div>
			);

		case "relic":
			const relic = referenceData?.relics?.[block.id];
			if (!relic)
				return (
					<div className='text-red-500 italic text-sm'>
						[Không tìm thấy Cổ vật với ID: {block.id}]
					</div>
				);
			return (
				<div className='my-4 p-4 rounded-xl border border-border bg-surface-hover/30 flex items-center gap-4'>
					<img
						src={
							relic.assetAbsolutePath ||
							relic.assetFullAbsolutePath ||
							"/fallback.png"
						}
						alt={relic.name}
						className='w-14 h-14 object-contain bg-black/20 rounded shadow-inner'
					/>
					<div>
						<h4 className='font-bold text-lg text-text-primary'>
							<Link
								to={`/relics/${relic.relicCode}`}
								className='hover:text-primary-500'
							>
								{tDynamic(relic, "name")}
							</Link>
						</h4>
						<p
							className={`text-xs font-bold uppercase tracking-wider ${
								relic.rarity === "Epic" || relic.rarity === "Sử Thi"
									? "text-purple-500"
									: relic.rarity === "Rare" || relic.rarity === "Hiếm"
									? "text-blue-500"
									: "text-gray-500"
							}`}
						>
							{tDynamic(relic, "rarity")}
						</p>
						<p className='text-sm text-text-secondary mt-1'>
							<MarkupRenderer text={tDynamic(relic, "description")} />
						</p>
					</div>
				</div>
			);

		case "power":
			const power = referenceData?.powers?.[block.id];
			if (!power)
				return (
					<div className='text-red-500 italic text-sm'>
						[Không tìm thấy Sức mạnh với ID: {block.id}]
					</div>
				);
			return (
				<div className='my-4 p-3 rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10 flex items-center gap-3'>
					<div className='w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center border border-yellow-300 shrink-0'>
						<span className='text-yellow-600 font-bold text-xs'>SỨC</span>
					</div>
					<div>
						<h4 className='font-bold text-yellow-800 dark:text-yellow-400'>
							{tDynamic(power, "name")}
						</h4>
						<p className='text-sm text-yellow-700/80 dark:text-yellow-500/80'>
							<MarkupRenderer text={tDynamic(power, "description")} />
						</p>
					</div>
				</div>
			);

		case "table":
			return (
				<div className='overflow-x-auto my-5 shadow-sm rounded-lg border border-border'>
					<table className='min-w-full text-left border-collapse bg-surface-bg'>
						<thead className='bg-surface-hover/50 text-text-primary border-b border-border'>
							<tr>
								{block.headers?.map((header, idx) => (
									<th key={idx} className='px-4 py-3 font-bold'>
										{header}
									</th>
								))}
							</tr>
						</thead>
						<tbody className='divide-y divide-border'>
							{block.rows?.map((row, rIdx) => (
								<tr key={rIdx} className='hover:bg-surface-hover/20'>
									{row.map((cell, cIdx) => (
										<td key={cIdx} className='px-4 py-3 text-text-secondary'>
											<MarkupRenderer text={cell} />
										</td>
									))}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			);

		case "tier_list":
			return (
				<div className='grid grid-cols-1 md:grid-cols-2 gap-5 my-6'>
					{block.items?.map((item, index) => (
						<div
							key={index}
							className='bg-surface-bg border border-border rounded-xl shadow-sm overflow-hidden flex flex-col'
						>
							<div className='p-4 border-b border-border bg-surface-hover/30 flex justify-between items-center'>
								<h4 className='text-lg font-bold text-text-primary'>
									{item.title}
								</h4>
							</div>
							<div className='p-4 flex-1'>
								{item.desc && (
									<p className='text-sm text-text-secondary mb-3'>
										<MarkupRenderer text={item.desc} />
									</p>
								)}
								{item.list && item.list.length > 0 && (
									<ul className='list-disc pl-5 space-y-1 text-sm text-text-secondary'>
										{item.list.map((listItem, i) => (
											<li key={i}>
												<MarkupRenderer text={listItem} />
											</li>
										))}
									</ul>
								)}
								{item.image && (
									<img
										src={item.image}
										className='w-full h-48 object-cover rounded-lg mt-4 shadow-sm border border-border'
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
				<div className='mt-10 p-6 rounded-xl border text-center bg-surface-hover/30 border-primary-300'>
					<h3 className='text-xl font-bold mb-3 text-primary-600 dark:text-primary-400 uppercase tracking-wide'>
						{block.title}
					</h3>
					<p className='text-lg text-text-primary leading-relaxed font-secondary'>
						<MarkupRenderer text={block.text} />
					</p>
				</div>
			);

		default:
			return null;
	}
};

export default PreviewBlock;
