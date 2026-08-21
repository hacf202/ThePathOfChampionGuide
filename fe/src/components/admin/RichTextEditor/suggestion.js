import { ReactRenderer } from '@tiptap/react';
import tippy from 'tippy.js';
import MentionList from './MentionList';
import { getAllEntities } from '@/utils/entityLookup';

const removeAccents = (str) => {
    if (!str) return "";
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
};

export default {
    items: ({ query }) => {
        // We will default to Vietnamese for suggestion filtering for now, 
        // ideally we can pass language from context if needed.
        const language = localStorage.getItem('language') || 'vi'; 
        
        const combined = [
            ...getAllEntities("c", language).map(e => ({...e, type: "c", typeName: language === "en" ? "Champion" : "Tướng"})),
            ...getAllEntities("r", language).map(e => ({...e, type: "r", typeName: language === "en" ? "Relic" : "Cổ vật"})),
            ...getAllEntities("p", language).map(e => ({...e, type: "p", typeName: language === "en" ? "Power" : "Sức mạnh"})),
            ...getAllEntities("i", language).map(e => ({...e, type: "i", typeName: language === "en" ? "Item" : "Vật phẩm"})),
            ...getAllEntities("k", language).map(e => ({...e, type: "k", typeName: language === "en" ? "Keyword" : "Từ khóa"})),
            ...getAllEntities("cd", language).map(e => ({...e, type: "cd", typeName: language === "en" ? "Card" : "Thẻ bài"})),
        ];

        const q = removeAccents(query);
        
        return combined.filter(e => {
            if (!q) return true;
            const nameNorm = removeAccents(e.name);
            const nameEnNorm = removeAccents(e.nameEn || "");
            return nameNorm.includes(q) || nameEnNorm.includes(q);
        }).sort((a, b) => {
            if (!q) return 0;
            const aNameNorm = removeAccents(a.name);
            const bNameNorm = removeAccents(b.name);
            const aStarts = aNameNorm.startsWith(q) || removeAccents(a.nameEn || "").startsWith(q);
            const bStarts = bNameNorm.startsWith(q) || removeAccents(b.nameEn || "").startsWith(q);
            if (aStarts && !bStarts) return -1;
            if (!aStarts && bStarts) return 1;
            return 0;
        }).slice(0, 8);
    },

    render: () => {
        let component;
        let popup;

        return {
            onStart: props => {
                component = new ReactRenderer(MentionList, {
                    props,
                    editor: props.editor,
                });

                if (!props.clientRect) {
                    return;
                }

                popup = tippy('body', {
                    getReferenceClientRect: props.clientRect,
                    appendTo: () => document.body,
                    content: component.element,
                    showOnCreate: true,
                    interactive: true,
                    trigger: 'manual',
                    placement: 'bottom-start',
                });
            },

            onUpdate(props) {
                component.updateProps(props);

                if (!props.clientRect) {
                    return;
                }

                popup[0].setProps({
                    getReferenceClientRect: props.clientRect,
                });
            },

            onKeyDown(props) {
                if (props.event.key === 'Escape') {
                    popup[0].hide();
                    return true;
                }

                return component.ref?.onKeyDown(props);
            },

            onExit() {
                if (popup && popup[0]) {
                    popup[0].destroy();
                }
                if (component) {
                    component.destroy();
                }
            },
        };
    },
};
