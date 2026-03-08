// src/components/admin/guide/previewBlock.jsx
import React from "react";
import { useTranslation } from "../../../hooks/useTranslation"; // 🟢

const renderHtml = text => <span dangerouslySetInnerHTML={{ __html: text }} />;

const PreviewBlock = ({ block, referenceData }) => {
	const { t } = useTranslation();
	if (!block) return null;

	switch (block.type) {
		case "section":
			return (
				<section className='mb-8 mt-6 border-l-4 border-primary-500 pl-6'>
					{block.title && (
						<h2 className='text-2xl font-bold mb-4 text-gray-800 uppercase'>
							{t(block, "title")}
						</h2>
					)}
					{block.content?.map((sub, i) => (
						<PreviewBlock key={i} block={sub} referenceData={referenceData} />
					))}
				</section>
			);

		case "paragraph":
			return (
				<p className='leading-relaxed mb-4 text-lg text-gray-700'>
					{renderHtml(t(block, "text"))}
				</p>
			);

		case "image":
			return (
				<figure className='my-8 flex flex-col items-center'>
					<img
						src={block.url}
						alt={t(block, "caption") || "Image"}
						className='rounded-xl shadow-lg max-w-full h-auto border border-gray-100'
					/>
					{block.caption && (
						<figcaption className='mt-3 text-sm italic text-gray-500'>
							{t(block, "caption")}
						</figcaption>
					)}
				</figure>
			);

		case "youtube":
			return (
				<div className='my-8'>
					<div className='aspect-video rounded-xl overflow-hidden shadow-lg'>
						<iframe
							className='w-full h-full'
							src={block.url}
							title='Video'
							frameBorder='0'
							allowFullScreen
						/>
					</div>
					<p className='text-center text-xs text-gray-400 mt-2 italic'>
						Source: {block.caption}
					</p>
				</div>
			);

		default:
			return null;
	}
};

export default PreviewBlock;
