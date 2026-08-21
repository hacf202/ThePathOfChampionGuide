import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Image } from '@tiptap/extension-image';
import { Youtube } from '@tiptap/extension-youtube';
import { TextAlign } from '@tiptap/extension-text-align';
import { Link } from '@tiptap/extension-link';
import { Placeholder } from '@tiptap/extension-placeholder';
import { EntityMention } from './EntityMention';
import suggestion from './suggestion';
import Toolbar from './Toolbar';
import { preloadAllEntities } from '@/utils/entityLookup';

import './tiptap.css'; // We'll need to create some basic styles for the editor

const RichTextEditor = ({ value, onChange, placeholder = 'Bắt đầu viết...' }) => {
    useEffect(() => {
        preloadAllEntities();
    }, []);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
            Image,
            Youtube,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Link.configure({
                openOnClick: false,
            }),
            Placeholder.configure({
                placeholder,
            }),
            EntityMention.configure({
                HTMLAttributes: {
                    class: 'entity-mention',
                },
                suggestion,
            }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            // We pass the HTML back to the parent component.
            // If the parent needs plain text, they can get it from editor.getText() 
            // but for now we'll just pass html.
            if (onChange) {
                onChange(html); // Or an object { markup: html, raw: editor.getText() } to maintain compatibility
            }
        },
    });

    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value);
        }
    }, [value, editor]);

    return (
        <div className="rich-text-editor border border-border rounded-xl bg-surface-bg flex flex-col shadow-sm focus-within:ring-2 focus-within:ring-primary-500/50 focus-within:border-primary-500 transition-all h-full min-h-[300px]">
            <Toolbar editor={editor} />
            <div className="flex-1 overflow-y-auto cursor-text p-4">
                <EditorContent editor={editor} className="min-h-full h-full tiptap-editor-content" />
            </div>
        </div>
    );
};

export default RichTextEditor;
