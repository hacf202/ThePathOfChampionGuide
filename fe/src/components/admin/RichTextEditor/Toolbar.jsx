import React from 'react';
import { 
    Bold, Italic, Strikethrough, Heading1, Heading2, Heading3, 
    List, ListOrdered, Quote, Code, Image as ImageIcon, 
    Youtube, AlignLeft, AlignCenter, AlignRight, AlignJustify, Table, 
    Undo, Redo, Link as LinkIcon
} from 'lucide-react';

const Toolbar = ({ editor }) => {
    if (!editor) {
        return null;
    }

    const addImage = () => {
        const url = window.prompt('URL hình ảnh:');
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    const addYoutubeVideo = () => {
        const url = window.prompt('URL YouTube (Ví dụ: https://www.youtube.com/watch?v=...):');
        if (url) {
            editor.commands.setYoutubeVideo({
                src: url,
                width: 640,
                height: 480,
            });
        }
    };

    const addLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL liên kết:', previousUrl);

        if (url === null) {
            return;
        }

        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    const insertTable = () => {
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    };

    const Button = ({ onClick, isActive, disabled, children, title }) => (
        <button
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={`p-1.5 rounded-md text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isActive ? 'bg-primary-500/20 text-primary-400 font-bold' : ''
            }`}
            type="button"
        >
            {children}
        </button>
    );

    return (
        <div className="flex flex-wrap items-center gap-1 p-2 bg-surface-bg border-b border-border sticky top-0 z-10 rounded-t-xl">
            {/* Lịch sử */}
            <div className="flex items-center gap-0.5 border-r border-border pr-2 mr-1">
                <Button onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Hoàn tác (Ctrl+Z)"><Undo size={16} /></Button>
                <Button onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Làm lại (Ctrl+Y)"><Redo size={16} /></Button>
            </div>

            {/* Định dạng chữ */}
            <div className="flex items-center gap-0.5 border-r border-border pr-2 mr-1">
                <Button onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="In đậm (Ctrl+B)"><Bold size={16} /></Button>
                <Button onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="In nghiêng (Ctrl+I)"><Italic size={16} /></Button>
                <Button onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="Gạch ngang"><Strikethrough size={16} /></Button>
                <Button onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive('code')} title="Mã nội tuyến"><Code size={16} /></Button>
            </div>

            {/* Heading */}
            <div className="flex items-center gap-0.5 border-r border-border pr-2 mr-1">
                <Button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} title="Tiêu đề 1">
                    <Heading1 size={16} />
                </Button>
                <Button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} title="Tiêu đề 2">
                    <Heading2 size={16} />
                </Button>
                <Button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} title="Tiêu đề 3">
                    <Heading3 size={16} />
                </Button>
            </div>

            {/* Căn lề */}
            <div className="flex items-center gap-0.5 border-r border-border pr-2 mr-1">
                <Button onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} title="Căn trái"><AlignLeft size={16} /></Button>
                <Button onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} title="Căn giữa"><AlignCenter size={16} /></Button>
                <Button onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} title="Căn phải"><AlignRight size={16} /></Button>
                <Button onClick={() => editor.chain().focus().setTextAlign('justify').run()} isActive={editor.isActive({ textAlign: 'justify' })} title="Căn đều 2 bên"><AlignJustify size={16} /></Button>
            </div>

            {/* Danh sách & Khác */}
            <div className="flex items-center gap-0.5 border-r border-border pr-2 mr-1">
                <Button onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Danh sách dấu chấm"><List size={16} /></Button>
                <Button onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Danh sách số"><ListOrdered size={16} /></Button>
                <Button onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Trích dẫn"><Quote size={16} /></Button>
            </div>

            {/* Chèn */}
            <div className="flex items-center gap-0.5 border-r border-border pr-2 mr-1">
                <Button onClick={addLink} isActive={editor.isActive('link')} title="Chèn liên kết"><LinkIcon size={16} /></Button>
                <Button onClick={addImage} title="Chèn hình ảnh (URL)"><ImageIcon size={16} /></Button>
                <Button onClick={addYoutubeVideo} title="Chèn video YouTube"><Youtube size={16} /></Button>
                <Button onClick={insertTable} title="Chèn bảng"><Table size={16} /></Button>
            </div>
            
            {/* Gợi ý */}
            <div className="flex items-center ml-auto">
                <span className="text-[10px] text-text-tertiary italic">Gõ <strong className="text-primary-400">@</strong> để gắn thẻ Tướng/Cổ vật...</span>
            </div>
        </div>
    );
};

export default Toolbar;
