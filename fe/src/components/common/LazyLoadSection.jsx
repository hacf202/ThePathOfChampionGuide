import React, { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

/**
 * LazyLoadSection - Trì hoãn render các thành phần nặng cho đến khi cuộn tới gần.
 * 
 * @param {string} id - Bắt buộc phải có để thanh Mục Lục (Table of Contents) trỏ đúng.
 * @param {string} minHeight - Giữ sẵn không gian để thanh cuộn (scrollbar) và TOC tính toán đúng vị trí trước khi render.
 * @param {string} rootMargin - Khoảng cách load trước khi cuộn tới. "500px" giúp render trước 1 màn hình để người dùng không thấy sự delay.
 * @param {function} onVisible - Callback được gọi khi section vào tầm nhìn (Dùng để gọi API).
 * @param {boolean} showSpinner - Hiển thị spinner thay vì giao diện trống khi chưa load xong dữ liệu.
 */
const LazyLoadSection = ({ 
    id, 
    children, 
    minHeight = "400px", 
    rootMargin = "500px", 
    threshold = 0, 
    onVisible,
    className = ""
}) => {
    const [hasIntersected, setHasIntersected] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        if (hasIntersected) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setHasIntersected(true);
                    observer.disconnect();
                    if (onVisible) onVisible();
                }
            },
            { threshold, rootMargin }
        );

        const currentRef = containerRef.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => observer.disconnect();
    }, [hasIntersected, threshold, rootMargin, onVisible]);

    return (
        <div 
            id={id} 
            ref={containerRef} 
            className={`w-full relative ${className}`}
            style={{ minHeight: hasIntersected ? "auto" : minHeight }}
        >
            {hasIntersected ? (
                <div className="animate-in fade-in duration-500 w-full h-full">
                    {children}
                </div>
            ) : (
                <div className="absolute inset-0 flex justify-center items-center opacity-30">
                    <Loader2 className="animate-spin text-primary-500" size={32} />
                </div>
            )}
        </div>
    );
};

export default LazyLoadSection;
