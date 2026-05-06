import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import GoogleAd from "./googleAd";

const AdModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        // Kiểm tra thời gian hiển thị quảng cáo cuối cùng
        const lastShown = localStorage.getItem("lastAdShownTime");
        const now = Date.now();
        const oneHour = 60 * 60 * 1000; // 1 giờ tính bằng milliseconds

        // Nếu chưa từng hiển thị hoặc đã qua 1 giờ
        if (!lastShown || now - parseInt(lastShown) > oneHour) {
            // Hiển thị sau 1.5 giây khi chuyển trang để tránh cảm giác bị gián đoạn đột ngột
            const timer = setTimeout(() => {
                setIsOpen(true);
                localStorage.setItem("lastAdShownTime", now.toString());
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [location.pathname]); // Chạy logic kiểm tra mỗi khi chuyển route


    return (
        <>


            {/* Modal */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                        {/* Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        />

                        {/* Modal Content */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-surface-bg border border-border rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col z-10"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-3 border-b border-border bg-surface-hover/30">
                                <h3 className="text-sm font-bold font-primary text-primary-500">
                                    Ủng hộ dự án POC GUIDE
                                </h3>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1 rounded-md hover:bg-white/10 text-text-secondary hover:text-white transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Body (Quảng cáo) */}
                            <div className="p-3 flex flex-col items-center justify-center bg-surface-bg/50">
                                <div className="w-full flex justify-center items-center bg-black/20 rounded-lg overflow-hidden min-h-[250px] relative border border-border/50">
                                    <GoogleAd slot='2943049680' format='auto' />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AdModal;
