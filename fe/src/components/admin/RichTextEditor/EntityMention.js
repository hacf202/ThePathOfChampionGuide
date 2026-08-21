import { Mention } from '@tiptap/extension-mention';
import { mergeAttributes } from '@tiptap/core';

export const EntityMention = Mention.extend({
    name: 'entityMention',

    addAttributes() {
        return {
            id: {
                default: null,
                parseHTML: element => element.getAttribute('data-entity-id'),
                renderHTML: attributes => {
                    if (!attributes.id) {
                        return {};
                    }

                    return {
                        'data-entity-id': attributes.id,
                    };
                },
            },
            label: {
                default: null,
                parseHTML: element => element.getAttribute('data-entity-label'),
                renderHTML: attributes => {
                    if (!attributes.label) {
                        return {};
                    }

                    return {
                        'data-entity-label': attributes.label,
                    };
                },
            },
            entityType: {
                default: null,
                parseHTML: element => element.getAttribute('data-entity-type'),
                renderHTML: attributes => {
                    if (!attributes.entityType) {
                        return {};
                    }

                    return {
                        'data-entity-type': attributes.entityType,
                    };
                },
            },
        };
    },

    renderHTML({ HTMLAttributes }) {
        return [
            'span',
            mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
                class: 'entity-mention cursor-pointer bg-primary-500/20 text-primary-400 font-bold px-1.5 rounded-md border border-primary-500/30 inline-flex items-center gap-1 mx-0.5 whitespace-nowrap align-baseline',
            }),
            `@${HTMLAttributes['data-entity-label'] || HTMLAttributes.id}`,
        ];
    },
});
