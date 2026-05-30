import React, { useRef } from "react";

import { useTheme } from "@/context/ThemeContext";
import { Moon, Sun, Palette, Image as ImageIcon, Check, MousePointer2, Upload, AlertCircle, Loader2, Sparkles, SlidersHorizontal } from "lucide-react";
import { compressImage } from "@/utils/imageUtils";
import Modal from "./modal";
import Button from "./button";
import { useTranslation } from "@/hooks/useTranslation";

const BACKGROUND_PRESETS = [
    { name: "JoeJiJi", url: "https://images.pocguide.top/backgrounds/BG1.webp" },
    { name: "OngToNgheRen", url: "https://images.pocguide.top/backgrounds/BG5.webp" },
    { name: "RongLon", url: "https://images.pocguide.top/backgrounds/BG4.webp" },
    { name: "SimpLord", url: "https://images.pocguide.top/backgrounds/BG2.webp" },
    { name: "OngKeNe", url: "https://images.pocguide.top/backgrounds/BG3.webp" },
    { name: "SupperGauGau", url: "https://images.pocguide.top/backgrounds/BG6.webp" },
];

const ThemeSettings = ({ isOpen, onClose }) => {
    const [isCompresing, setIsCompressing] = React.useState(false);
    const { 
        theme, 
        bgImage, 
        primaryHue, 
        bgOpacity,
        setBgOpacity,
        setPrimaryHue, 
        setBgImage, 
        selectSolidMode, 
        selectArtworkMode 
    } = useTheme();

    const { tUI } = useTranslation();
    const fileInputRef = useRef(null);

    const isArtwork = bgImage !== null;
    const currentMode = isArtwork ? "artwork" : theme;

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
             alert(tUI("themeSettings.errorTooLarge"));
             return;
        }

        setIsCompressing(true);
        try {
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const dataUrl = event.target.result;
                    const compressedUrl = await compressImage(dataUrl, 1920, 1080, 0.7);
                    
                    if (!isArtwork) {
                        selectArtworkMode();
                    }
                    setBgImage(compressedUrl);
                } catch (err) {
                    console.error("Error compressing image:", err);
                    alert(tUI("themeSettings.errorProcess"));
                } finally {
                    setIsCompressing(false);
                }
            };
            reader.readAsDataURL(file);
        } catch (err) {
            console.error("Error reading file:", err);
            setIsCompressing(false);
        }
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary-500" />
                    <span>{tUI("themeSettings.title")}</span>
                </div>
            } 
            maxWidth="max-w-2xl"
        >
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept="image/*" 
                className="hidden" 
            />
            <div className="space-y-8 p-2 max-h-[80vh] overflow-y-auto pr-3-scrollbar">
                
                {/* 1. Main Theme Selection */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary opacity-50">
                             {tUI("themeSettings.mainTheme")}
                        </h3>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { id: "light", icon: Sun, label: tUI("themeSettings.solidLight"), action: () => selectSolidMode("light") },
                            { id: "dark", icon: Moon, label: tUI("themeSettings.solidDark"), action: () => selectSolidMode("dark") },
                            { id: "artwork", icon: ImageIcon, label: tUI("themeSettings.artworkMode"), action: selectArtworkMode },
                        ].map((mode) => (
                            <button
                                key={mode.id}
                                onClick={mode.action}
                                className={`group relative flex flex-col items-center justify-center gap-3 p-4 rounded-[2rem] border transition-all duration-500 ${
                                    currentMode === mode.id 
                                    ? "border-primary-500 bg-primary-500/5 text-primary-600 shadow-[0_0_30px_rgba(var(--color-primary-rgb),0.1)]" 
                                    : "border-white/10 hover:border-white/20 bg-white/5 text-text-secondary"
                                }`}
                            >
                                <div className={`p-3 rounded-2xl transition-all duration-500 ${currentMode === mode.id ? "bg-primary-500 text-white shadow-lg" : "bg-white/5 group-hover:bg-white/10"}`}>
                                    <mode.icon className={`w-6 h-6 ${currentMode === mode.id ? "animate-pulse" : ""}`} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest">{mode.label}</span>
                                
                                {currentMode === mode.id && (
                                    <div
                                        className="absolute inset-0 border-2 border-primary-500 rounded-[2rem] pointer-events-none"
                                        initial={false}
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </section>

                {/* 2. Primary Color Customization */}
                <section className="relative group bg-white/5 rounded-[2.5rem] border border-white/10 p-6 overflow-hidden isolate">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-transparent -z-10" />
                    
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex flex-col">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary opacity-50 mb-1">
                                {tUI("themeSettings.primaryColor")}
                            </h3>
                            <span className="text-xl font-black text-text-primary uppercase italic tracking-tighter">
                                Palette Focus
                            </span>
                        </div>
                        <div className="flex items-center gap-3 bg-white/5 p-2 pr-4 rounded-2xl border border-white/10">
                            <div 
                                className="w-10 h-10 rounded-xl shadow-2xl transition-transform duration-500 group-hover:rotate-6"
                                style={{ backgroundColor: `hsl(${primaryHue}, 65%, 45%)`, boxShadow: `0 0 20px hsl(${primaryHue}, 65%, 45%, 0.3)` }}
                            />
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-text-secondary uppercase tracking-widest leading-none mb-1">Current Hue</span>
                                <span className="text-sm font-black text-text-primary leading-none tracking-tight">{primaryHue}°</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="relative h-4 group/slider">
                            <input 
                                type="range" 
                                min="0" 
                                max="360" 
                                value={primaryHue} 
                                onChange={(e) => setPrimaryHue(parseInt(e.target.value))}
                                className="absolute inset-0 w-full h-full bg-transparent appearance-none cursor-pointer z-20 accent-white"
                                style={{
                                    backgroundImage: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
                                    borderRadius: '1rem',
                                    padding: '2px'
                                }}
                            />
                            <div className="absolute inset-0 bg-white/10 rounded-full blur-sm -z-10 opacity-0 group-hover/slider:opacity-100 transition-opacity" />
                        </div>
                        <div className="flex justify-between px-2">
                             {[0, 60, 120, 180, 240, 300, 360].map(h => (
                                <div key={h} className="text-[9px] font-bold text-text-secondary/30 uppercase">{h}°</div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 3. Artwork Customization */}
                
                    {isArtwork && (
                        <section
                            className="space-y-6"
                        >
                            <div className="flex flex-col">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary opacity-50 mb-1">
                                    {tUI("themeSettings.artworkGallery")}
                                </h3>
                                <div className="flex items-center gap-2">
                                    <SlidersHorizontal className="w-4 h-4 text-primary-500" />
                                    <span className="text-xl font-black text-text-primary uppercase italic tracking-tighter">
                                        Atmosphere
                                    </span>
                                </div>
                            </div>

                            {/* Brightness & Visibility */}
                            <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/10 space-y-6">
                                <div className="flex justify-between items-center">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">
                                            {tUI("themeSettings.bgBrightness")}
                                        </span>
                                        <span className="text-xs font-bold text-text-secondary/50">Adjust focus intensity</span>
                                    </div>
                                    <span className="text-lg font-black text-primary-500 tabular-nums">
                                        {Math.round((1 - bgOpacity) * 100)}%
                                    </span>
                                </div>
                                <div className="relative py-2">
                                    <input 
                                        type="range" 
                                        min="0.1" 
                                        max="0.95" 
                                        step="0.01"
                                        value={bgOpacity} 
                                        onChange={(e) => setBgOpacity(parseFloat(e.target.value))}
                                        className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-primary-500"
                                    />
                                    <div className="flex justify-between mt-3 px-1 text-[9px] font-black uppercase tracking-widest text-text-secondary/30">
                                        <span>Max Clarity</span>
                                        <span>Focus Mode</span>
                                    </div>
                                </div>
                            </div>

                            {/* Preset Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {/* Custom Upload */}
                                <button
                                    onClick={() => !isCompresing && fileInputRef.current.click()}
                                    disabled={isCompresing}
                                    className={`relative aspect-video rounded-3xl overflow-hidden border-2 border-dashed border-primary-500/20 hover:border-primary-500/50 bg-primary-500/5 transition-all group ${isCompresing ? "opacity-50" : ""}`}
                                >
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                                        {isCompresing ? (
                                            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                                        ) : (
                                            <>
                                                <div className="p-3 bg-primary-500/10 rounded-2xl group-hover:bg-primary-500 group-hover:text-white transition-all duration-300">
                                                    <Upload className="w-5 h-5" />
                                                </div>
                                                <span className="text-[10px] font-black text-text-primary uppercase tracking-widest">
                                                    {tUI("themeSettings.uploadImage")}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </button>

                                {BACKGROUND_PRESETS.map((preset) => (
                                    <button
                                        key={preset.name}
                                        onClick={() => setBgImage(preset.url)}
                                        className={`relative aspect-video rounded-3xl overflow-hidden border-2 transition-all duration-500 group ${
                                            bgImage === preset.url 
                                            ? "border-primary-500 shadow-[0_10px_30px_rgba(var(--color-primary-rgb),0.3)]" 
                                            : "border-white/5 hover:border-white/20"
                                        }`}
                                    >
                                        <img src={preset.url} alt={preset.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-4">
                                            <span className="text-[10px] font-black text-white uppercase tracking-widest">{preset.name}</span>
                                        </div>
                                        
                                        {bgImage === preset.url && (
                                            <div className="absolute top-3 right-3">
                                                <div className="bg-primary-500 text-white p-1.5 rounded-xl shadow-lg ring-4 ring-primary-500/20">
                                                    <Check className="w-3 h-3 stroke-[4px]" />
                                                </div>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </section>
                    )}
                

                {!isArtwork && (
                    <div 
                        className="flex items-center justify-center gap-3 p-6 rounded-[2rem] bg-amber-500/5 border border-amber-500/20"
                    >
                        <AlertCircle className="w-5 h-5 text-amber-500" />
                        <p className="text-[10px] font-black text-amber-500/80 uppercase tracking-widest text-center">
                            {tUI("themeSettings.activateArtwork")}
                        </p>
                    </div>
                )}

                <div className="pt-6 border-t border-white/10 flex justify-end gap-3">
                    <Button 
                        variant="primary" 
                        onClick={onClose} 
                        rounded="2xl" 
                        className="px-10 py-4 font-black tracking-[0.2em] uppercase text-[10px] shadow-2xl hover:scale-105 active:scale-95 transition-all"
                    >
                        {tUI("common.done")}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default ThemeSettings;
