import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';

const MentionList = forwardRef((props, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectItem = index => {
        const item = props.items[index];

        if (item) {
            props.command({ id: item.id, label: item.name, entityType: item.type });
        }
    };

    const upHandler = () => {
        setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
    };

    const downHandler = () => {
        setSelectedIndex((selectedIndex + 1) % props.items.length);
    };

    const enterHandler = () => {
        selectItem(selectedIndex);
    };

    useEffect(() => setSelectedIndex(0), [props.items]);

    useImperativeHandle(ref, () => ({
        onKeyDown: ({ event }) => {
            if (event.key === 'ArrowUp') {
                upHandler();
                return true;
            }

            if (event.key === 'ArrowDown') {
                downHandler();
                return true;
            }

            if (event.key === 'Enter') {
                enterHandler();
                return true;
            }

            return false;
        },
    }));

    return (
        <div className="bg-surface-bg border border-border shadow-2xl rounded-lg overflow-hidden flex flex-col min-w-[250px] backdrop-blur-xl mt-1 max-h-64 overflow-y-auto z-50">
            {props.items.length ? (
                <div className="p-1.5 flex flex-col gap-0.5">
                    {props.items.map((item, index) => (
                        <button
                            className={`px-2 py-1.5 text-xs rounded text-left transition-colors flex justify-between items-center ${
                                index === selectedIndex ? 'bg-primary-500/30 text-white' : 'text-text-secondary hover:bg-surface-hover/50'
                            }`}
                            key={index}
                            onClick={() => selectItem(index)}
                        >
                            <span className="font-bold truncate mr-2">{item.name}</span>
                            <span className="text-[9px] opacity-70 whitespace-nowrap bg-black/20 px-1.5 py-0.5 rounded">
                                [{item.typeName}]
                            </span>
                        </button>
                    ))}
                </div>
            ) : (
                <div className="p-3 text-xs text-text-tertiary italic text-center">Không tìm thấy kết quả</div>
            )}
        </div>
    );
});

MentionList.displayName = 'MentionList';

export default MentionList;
