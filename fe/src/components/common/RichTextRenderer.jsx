import React, { useEffect } from 'react';
import parse, { attributesToProps, domToReact } from 'html-react-parser';
import MarkupTooltip from './MarkupTooltip';
import { getEntityData, preloadAllEntities } from '@/utils/entityLookup';
import { useTranslation } from '@/hooks/useTranslation';

const RichTextRenderer = ({ content, className = '' }) => {
    const { language } = useTranslation();

    useEffect(() => {
        preloadAllEntities();
    }, []);

    if (!content) return null;

    const options = {
        replace: (domNode) => {
            // Check if it's our custom entity mention
            if (domNode.type === 'tag' && domNode.name === 'span') {
                const isEntityMention = domNode.attribs && domNode.attribs.class && domNode.attribs.class.includes('entity-mention');
                
                if (isEntityMention) {
                    const id = domNode.attribs['data-entity-id'];
                    const type = domNode.attribs['data-entity-type'];
                    const label = domNode.attribs['data-entity-label'] || id;

                    const data = getEntityData(id, type, language);

                    if (data) {
                        const showIcon = true;
                        const colorClass = "text-primary-400"; // fallback

                        const innerContent = (
                            <span className={`inline-flex items-baseline font-bold transition-all duration-200 border-b border-white/0 hover:border-current ${colorClass} cursor-help`}>
                                {showIcon && data.icon && (
                                    <img 
                                        src={data.icon} 
                                        alt={label} 
                                        className={`w-4 h-4 object-contain mr-1 flex-shrink-0 translate-y-[2px]`} 
                                    />
                                )}
                                <span className="whitespace-pre-wrap leading-none">
                                    {data.name || label}
                                </span>
                            </span>
                        );

                        return (
                            <MarkupTooltip
                                title={data.name || label}
                                description={data.description}
                                icon={data.icon}
                                fullImage={data.fullImage}
                                type={data.type || type}
                                rarity={data.rarity}
                            >
                                {innerContent}
                            </MarkupTooltip>
                        );
                    }
                }
            }

            // Convert TipTap Youtube to a responsive iframe container
            if (domNode.type === 'tag' && domNode.name === 'div' && domNode.attribs && domNode.attribs['data-youtube-video']) {
                return (
                    <div className="my-6 bg-surface-bg p-4 rounded-2xl border border-border shadow-sm">
                        <div className="aspect-video rounded-xl overflow-hidden shadow-md bg-black">
                            <iframe
                                className="w-full h-full"
                                src={domNode.children[0].attribs.src}
                                title="YouTube Video"
                                frameBorder="0"
                                allowFullScreen
                            />
                        </div>
                    </div>
                );
            }
        }
    };

    return (
        <div className={`prose prose-invert max-w-none text-text-secondary ${className}`}>
            {parse(content, options)}
        </div>
    );
};

export default RichTextRenderer;
