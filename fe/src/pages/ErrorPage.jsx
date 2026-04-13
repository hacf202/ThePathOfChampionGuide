import React from "react";
import { useRouteError, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, AlertTriangle, RefreshCw } from "lucide-react";
import { useTranslation } from "../hooks/useTranslation";
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/footer";

const ErrorPage = () => {
    const error = useRouteError();
    const { t, tUI } = useTranslation();

    const is404 = error?.status === 404;
    const statusText = error?.status || "Unknown";
    const statusMessage = error?.statusText || error?.message || "An unexpected error occurred.";

    return (
        <div className="min-h-screen flex flex-col bg-[#0f172a] text-white">
            <Navbar />
            
            <main className="flex-grow flex items-center justify-center p-4 relative overflow-hidden">
                {/* Background Decorations */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-[120px] -z-10 animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] -z-10 animate-pulse transition-all duration-1000" />

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-lg w-full text-center"
                >
                    {/* Icon Section */}
                    <div className="mb-8 flex justify-center">
                        <motion.div 
                            animate={{ 
                                rotate: [0, 5, -5, 0],
                                y: [0, -10, 0]
                            }}
                            transition={{ 
                                repeat: Infinity, 
                                duration: 4, 
                                ease: "easeInOut" 
                            }}
                            className="relative"
                        >
                            {is404 ? (
                                <img 
                                    src="/favicon.ico" 
                                    alt="Logo" 
                                    className="w-32 h-32 object-contain drop-shadow-[0_0_25px_rgba(56,189,248,0.3)] rounded-2xl" 
                                />
                            ) : (
                                <AlertTriangle size={120} className="text-yellow-400 drop-shadow-[0_0_25px_rgba(250,204,21,0.3)]" />
                            )}
                        </motion.div>
                    </div>

                    {/* Content Section */}
                    <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                        {t("errorPage.title")}
                    </h1>
                    
                    <p className="text-xl text-text-secondary mb-8 leading-relaxed">
                        {is404 ? t("errorPage.desc404") : t("errorPage.descGeneric")}
                    </p>

                    {/* Error Details Chip */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full mb-10">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-xs font-mono text-text-tertiary">
                            {t("errorPage.errorCode", { code: statusText })}: {statusMessage}
                        </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link 
                            to="/"
                            className="bg-primary-600 hover:bg-primary-500 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary-600/20"
                        >
                            <Home size={20} />
                            {t("errorPage.backToHome")}
                        </Link>
                        
                        <button 
                            onClick={() => window.location.reload()}
                            className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                        >
                            <RefreshCw size={20} />
                            {tUI("common.retry")}
                        </button>
                    </div>
                </motion.div>
            </main>

            <Footer />
        </div>
    );
};

export default ErrorPage;
