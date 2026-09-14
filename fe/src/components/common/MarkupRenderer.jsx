import { memo, useMemo, useEffect } from "react";
import { parseMarkup } from "@/utils/markupParser";
import { getRarityKey } from "@/utils/i18nHelpers";
import { getEntityData } from "@/utils/entityLookup";
import { generateSlug } from "@/utils/slugify";
import MarkupTooltip from "./MarkupTooltip"; 
import { useTranslation } from "@/hooks/useTranslation"; 
import { useMarkupResolution } from "@/hooks/useMarkupResolution"; 
import RichTextRenderer from "./RichTextRenderer";

import MarkupTag from "./MarkupTag";

/**
 * MarkupRenderer - Trình hiển thị văn bản đánh dấu nâng cao cho POC Guide
 * Hỗ trợ các thẻ: [type:value|label|options] và các thẻ định dạng HTML đơn giản
 * Đã nâng cấp để tự động fallback sang RichTextRenderer nếu phát hiện nội dung HTML từ TipTap.
 */
const MarkupRenderer = memo(({ text, className = "", noTooltip = false }) => {
	const { language } = useTranslation(); 
	const { resolveEntities } = useMarkupResolution();

	const isRichText = useMemo(() => {
		if (!text || typeof text !== 'string') return false;
		// Detect TipTap generated HTML
		return text.includes('<p>') || text.includes('tiptap') || text.includes('entity-mention');
	}, [text]);

	const segments = useMemo(() => !isRichText ? parseMarkup(text) : [], [text, isRichText]);

	useEffect(() => {
		if (text && !noTooltip && !isRichText) resolveEntities(text);
	}, [text, resolveEntities, noTooltip, isRichText]);

	if (!text) return null;

	if (isRichText) {
		return <RichTextRenderer content={text} className={className} />;
	}

	if (!segments || segments.length === 0) return null;

	return (
		<span className={`markup-container whitespace-pre-wrap mb-1 block leading-relaxed ${className}`}>
			{segments.map((segment, index) => {
				if (segment.type === "text") {
					return <span key={index}>{segment.value}</span>;
				}

				if (segment.type === "html_open") {
					switch (segment.tag) {
						case "b": return <strong key={index} className='font-bold text-text-primary' />;
						case "i": return <em key={index} className='italic' />;
						case "br": return <br key={index} />;
						default: return null;
					}
				}
                
                if (segment.type === "html_close") {
                    return null;
                }

				if (segment.type === "tag") {
					return <MarkupTag key={index} segment={segment} noTooltip={noTooltip} />;
				}

				return null;
			})}
		</span>
	);
});

export default MarkupRenderer;
