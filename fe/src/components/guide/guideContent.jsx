import React from "react";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import { removeAccents } from "../../utils/vietnameseUtils.js";
import MarkupRenderer from "../common/MarkupRenderer.jsx";
import { useTranslation } from "../../hooks/useTranslation.js";

const ContentBlock = ({ block, referenceData }) => {
	const { tDynamic } = useTranslation();
	if (!block) return null;

	switch (block.type) {
		case "section":
			return (
				<section
					className='mb-8 mt-6 scroll-mt-20'
					id={removeAccents(block.title || "")}
				>
					{block.title && (
						<h2 className='text-2xl font-bold mb-4 pb-2 border-b border-border text-text-primary'>
							{block.title}
						</h2>
					)}
					{block.content?.map((subBlock, index) => (
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
				<p className='leading-relaxed mb-4 text-lg text-text-secondary font-secondary'>
					<MarkupRenderer text={block.text} />
				</p>
			);

		case "image":
			return (
				<figure className='my-8 flex flex-col items-center bg-surface-bg p-4 rounded-2xl border border-border shadow-sm'>
					<img
						src={block.url || block.src}
						alt={block.caption || block.alt || "Hình ảnh"}
						className='rounded-xl shadow-md max-w-full h-auto object-contain'
						style={{ maxHeight: "500px" }}
						loading='lazy'
					/>
					{(block.caption || block.alt) && (
						<figcaption className='mt-3 text-sm font-medium italic text-text-tertiary border-l-2 border-primary-500 pl-3'>
							{block.caption || block.alt}
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
				<ul className='list-disc list-outside ml-6 mb-6 space-y-2 text-lg text-text-secondary'>
					{(block.items || []).map((item, index) => (
						<li key={index}>
							<MarkupRenderer text={item} />
						</li>
					))}
				</ul>
			);

		case "quote":
			return (
				<blockquote className='border-l-4 border-border bg-surface-hover/30 p-4 my-5 rounded-r-lg italic text-lg text-text-secondary'>
					<MarkupRenderer text={block.text} />
					{block.author && (
						<footer className='mt-2 font-bold text-text-tertiary not-italic'>
							— {block.author}
						</footer>
					)}
				</blockquote>
			);

		case "table":
			return (
				<div className='my-6 overflow-x-auto border border-border rounded-lg shadow-sm'>
					<table className='min-w-full divide-y divide-border bg-surface-bg text-left'>
						<thead className='bg-surface-hover/50'>
							<tr>
								{(block.headers || []).map((header, idx) => (
									<th key={idx} className='px-4 py-3 font-bold text-text-primary text-sm uppercase tracking-wide'>
										{header}
									</th>
								))}
							</tr>
						</thead>
						<tbody className='divide-y divide-border'>
							{(block.rows || []).map((row, rIdx) => (
								<tr key={rIdx} className='hover:bg-surface-hover/20 transition-colors'>
									{row.map((cell, cIdx) => (
										<td key={cIdx} className='px-4 py-3 text-text-secondary text-sm'>
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
					{(block.items || []).map((item, index) => (
						<div
							key={index}
							className='bg-surface-bg border border-border rounded-xl shadow-sm overflow-hidden flex flex-col'
						>
							<div className='p-4 border-b border-border bg-surface-hover/30 flex justify-between items-center'>
								<h4 className='text-lg font-bold text-text-primary'>{item.title}</h4>
							</div>
							<div className='p-4 flex-1'>
								{item.image && (
									<img
										src={item.image}
										className='w-full h-40 object-cover rounded-lg mb-4 shadow-sm border border-border'
										alt={item.title}
									/>
								)}
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
							</div>
						</div>
					))}
				</div>
			);

		case "conclusion":
			return (
				<div className='mt-12 p-6 rounded-xl border text-center bg-surface-hover/30 border-primary-300'>
					<h3 className='text-xl font-bold mb-3 text-primary-600 dark:text-primary-400 uppercase tracking-wide'>
						{block.title}
					</h3>
					<p className='text-lg text-text-primary leading-relaxed font-secondary'>
						<MarkupRenderer text={block.text} />
					</p>
				</div>
			);

		// ── Backward compat: block champion/relic/power cũ ──
		case "champion": {
			const champ = referenceData?.champions?.[block.id];
			if (!champ) return (
				<div className='text-red-500 italic text-sm my-2'>
					[Không tìm thấy Tướng: {block.id}]
				</div>
			);
			return (
				<div className='my-5 p-4 rounded-xl border border-border bg-surface-bg shadow-sm flex gap-4'>
					<img
						src={champ.assets?.[0]?.avatar || champ.avatar || "/fallback.png"}
						alt={champ.name}
						className='w-20 h-20 object-cover rounded-xl shadow-md border-2 border-primary-500/20'
					/>
					<div className='flex-1'>
						<h3 className='text-xl font-bold text-primary-600 dark:text-primary-400 mb-1'>
							<Link to={`/champions/${champ.championID}`} className='hover:underline'>
								{tDynamic(champ, "name")}
							</Link>
						</h3>
						<p className='text-sm text-text-secondary italic line-clamp-3'>
							<MarkupRenderer text={tDynamic(champ, "description")} />
						</p>
					</div>
				</div>
			);
		}

		case "relic": {
			const relic = referenceData?.relics?.[block.id];
			if (!relic) return (
				<div className='text-red-500 italic text-sm my-2'>
					[Không tìm thấy Cổ vật: {block.id}]
				</div>
			);
			return (
				<div className='my-4 p-4 rounded-xl border border-border bg-surface-hover/30 flex items-center gap-4'>
					<img
						src={relic.assetAbsolutePath || relic.assetFullAbsolutePath || "/fallback.png"}
						alt={relic.name}
						className='w-14 h-14 object-contain bg-black/20 rounded shadow-inner'
					/>
					<div>
						<h4 className='font-bold text-lg text-text-primary'>
							<Link to={`/relics/${relic.relicCode}`} className='hover:text-primary-500'>
								{tDynamic(relic, "name")}
							</Link>
						</h4>
						<p className='text-sm text-text-secondary mt-1'>
							<MarkupRenderer text={tDynamic(relic, "description")} />
						</p>
					</div>
				</div>
			);
		}

		case "power": {
			const power = referenceData?.powers?.[block.id];
			if (!power) return (
				<div className='text-red-500 italic text-sm my-2'>
					[Không tìm thấy Sức mạnh: {block.id}]
				</div>
			);
			return (
				<div className='my-4 p-3 rounded-lg border border-yellow-200/50 bg-yellow-50/10 dark:bg-yellow-900/10 flex items-center gap-3'>
					<div className='w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center border border-yellow-300/50 shrink-0'>
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
		}

		// ── Backward compat: sublist cũ (map sang tier_list style) ──
		case "sublist":
			return (
				<div className='mb-8 space-y-4'>
					{block.title && (
						<h3 className='text-xl font-bold text-text-primary'>{block.title}</h3>
					)}
					{(block.sublist || []).map((item, index) => (
						<div
							key={index}
							className='flex flex-col gap-3 p-4 rounded-xl border border-border shadow-sm bg-surface-bg'
						>
							<h4 className='text-lg font-bold text-text-primary'>{item.title}</h4>
							{item.desc && (
								<p className='text-sm text-text-secondary'>
									<MarkupRenderer text={item.desc} />
								</p>
							)}
							{item.list && (
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
									className='w-full h-72 object-cover rounded-lg shadow-sm'
									alt={item.title}
								/>
							)}
						</div>
					))}
				</div>
			);

		// ── Backward compat: link block cũ ──
		case "link":
			return (
				<div className='my-6'>
					<a
						href={block.url}
						target='_blank'
						rel='noopener noreferrer'
						className='flex items-center gap-4 p-4 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all group bg-surface-bg'
					>
						{block.image && (
							<div className='flex-shrink-0 w-20 h-20 overflow-hidden rounded-xl border border-border'>
								<img
									src={block.image}
									alt={block.label}
									className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
								/>
							</div>
						)}
						<div className='flex-1 min-w-0'>
							<h4 className='font-bold text-lg text-text-primary truncate group-hover:text-primary-500 transition-colors'>
								{block.label || "Xem liên kết"}
							</h4>
							<p className='text-sm truncate text-text-tertiary mt-1'>{block.url}</p>
						</div>
						<ExternalLink size={24} className='text-text-tertiary group-hover:text-primary-500 transition-colors pr-2' />
					</a>
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
