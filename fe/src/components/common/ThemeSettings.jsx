import React from "react";
import { useTheme } from "../../context/ThemeContext";
import { Moon, Sun, Palette, Image as ImageIcon, Check, MousePointer2 } from "lucide-react";
import Modal from "./modal";
import Button from "./button";

const BACKGROUND_PRESETS = [
    { name: "Ionia", url: "https://images.pocguide.top/backgrounds/BG1.webp" },
    { name: "Zaun", url: "https://images.pocguide.top/backgrounds/BG5.webp" },
    { name: "Demacia", url: "https://images.pocguide.top/backgrounds/BG4.webp" },
    { name: "Shadow Isles", url: "https://images.pocguide.top/backgrounds/BG2.webp" },
    { name: "Archive", url: "https://images.pocguide.top/backgrounds/BG3.webp" },
    { name: "Spirit", url: "https://images.pocguide.top/backgrounds/BG6.webp" },
];

const ThemeSettings = ({ isOpen, onClose }) => {
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

    // Mode detection
    const isArtwork = bgImage !== null;
    const currentMode = isArtwork ? "artwork" : theme;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Cá nhân hóa giao diện" maxWidth="max-w-xl">
            <div className="space-y-8 p-1">
                {/* 1. Main Theme Selection */}
                <section>
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-text-secondary mb-4 flex items-center gap-2 opacity-60">
                         Chủ đề chính
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { id: "light", icon: Sun, label: "Solid Light", action: () => selectSolidMode("light") },
                            { id: "dark", icon: Moon, label: "Solid Dark", action: () => selectSolidMode("dark") },
                            { id: "artwork", icon: ImageIcon, label: "Artwork Mode", action: selectArtworkMode },
                        ].map((mode) => (
                            <button
                                key={mode.id}
                                onClick={mode.action}
                                className={`flex flex-col items-center justify-center gap-3 p-5 rounded-3xl border-2 transition-all duration-300 relative group overflow-hidden ${
                                    currentMode === mode.id 
                                    ? "border-primary-500 bg-primary-100/10 text-primary-600 shadow-lg shadow-primary-500/10" 
                                    : "border-border hover:border-border-hover text-text-secondary bg-surface-bg/50"
                                }`}
                            >
                                <mode.icon className={`w-8 h-8 transition-transform group-hover:scale-110 ${currentMode === mode.id ? "animate-pulse" : ""}`} />
                                <span className="text-[11px] font-black uppercase tracking-wider">{mode.label}</span>
                                {currentMode === mode.id && (
                                    <div className="absolute top-2 right-2">
                                        <div className="w-2 h-2 rounded-full bg-primary-500" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </section>

                {/* 2. Primary Color Customization */}
                <section className="bg-input-bg/40 p-6 rounded-[32px] border border-border">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-text-secondary mb-6 flex items-center gap-2 opacity-60">
                        <Palette className="w-4 h-4" /> Màu chủ đạo (Primary)
                    </h3>
                    <div className="space-y-6">
                        <div className="relative group">
                             <input 
                                type="range" 
                                min="0" 
                                max="360" 
                                value={primaryHue} 
                                onChange={(e) => setPrimaryHue(parseInt(e.target.value))}
                                className="w-full h-3 bg-border rounded-full appearance-none cursor-pointer accent-primary-500 shadow-inner"
                                style={{
                                    background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)'
                                }}
                            />
                            <div className="absolute -top-1 w-full flex justify-between px-1 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                                {[0, 60, 120, 180, 240, 300, 360].map(h => (
                                    <div key={h} className="w-0.5 h-1 bg-white/50 rounded-full" />
                                ))}
                            </div>
                        </div>
                       
                        <div className="flex justify-between items-center bg-input-bg p-3 rounded-2xl border border-border shadow-sm">
                            <div className="flex items-center gap-3">
                                <div 
                                    className="w-10 h-10 rounded-xl border-2 border-white/50 shadow-inner rotate-3 transition-transform"
                                    style={{ backgroundColor: `hsl(${primaryHue}, 65%, 45%)` }}
                                />
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest leading-none mb-1">Current Hue</span>
                                    <span className="text-sm font-bold text-text-primary leading-none tracking-tight">{primaryHue}° HSL</span>
                                </div>
                            </div>
                            <MousePointer2 className="w-5 h-5 text-text-secondary opacity-30" />
                        </div>
                    </div>
                </section>

                {/* 3. Artwork Gallery (Visible when in artwork mode) */}
                <section className={`transition-all duration-500 ${isArtwork ? "opacity-100 translate-y-0" : "opacity-30 pointer-events-none -translate-y-2 grayscale"}`}>
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-text-secondary mb-4 flex items-center gap-2 opacity-60">
                        <ImageIcon className="w-4 h-4" /> Thư viện Artwork (Auto Dark)
                    </h3>
                    
                    {/* Artwork Brightness Slider */}
                    <div className="mb-6 bg-input-bg/60 p-4 rounded-2xl border border-border/50">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary flex items-center gap-2">
                                <Sun className="w-3 h-3" /> Độ sáng ảnh nền
                            </span>
                            <span className="text-[10px] font-bold text-primary-600 bg-primary-500/10 px-2 py-0.5 rounded-full">
                                {Math.round((1 - bgOpacity) * 100)}%
                            </span>
                        </div>
                        <input 
                            type="range" 
                            min="0.1" 
                            max="0.95" 
                            step="0.01"
                            value={bgOpacity} 
                            onChange={(e) => setBgOpacity(parseFloat(e.target.value))}
                            className="w-full h-2 bg-border rounded-full appearance-none cursor-pointer accent-primary-500"
                            disabled={!isArtwork}
                        />
                        <div className="flex justify-between mt-2 px-1">
                            <span className="text-[9px] font-bold text-text-secondary/50 uppercase tracking-tighter">Sáng nhất</span>
                            <span className="text-[9px] font-bold text-text-secondary/50 uppercase tracking-tighter">Tối nhất</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {BACKGROUND_PRESETS.map((preset) => (
                            <button
                                key={preset.name}
                                onClick={() => isArtwork && setBgImage(preset.url)}
                                className={`relative aspect-video rounded-2xl overflow-hidden border-2 transition-all duration-300 group ${
                                    bgImage === preset.url ? "border-primary-500 ring-4 ring-primary-500/10 scale-95" : "border-border hover:border-border-hover"
                                }`}
                            >
                                <img src={preset.url} alt={preset.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{preset.name}</span>
                                </div>
                                {bgImage === preset.url && (
                                    <div className="absolute inset-0 bg-primary-600/20 backdrop-blur-[2px] flex items-center justify-center">
                                        <div className="bg-white rounded-full p-1 shadow-xl">
                                            <Check className="w-4 h-4 text-primary-600 stroke-[4px]" />
                                        </div>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                    {!isArtwork && (
                        <p className="text-[10px] text-center mt-3 text-text-secondary font-bold uppercase tracking-widest animate-pulse">
                            Chọn "Artwork Mode" phía trên để kích hoạt thư viện
                        </p>
                    )}
                </section>

                <div className="pt-4 border-t border-border flex justify-end">
                    <Button variant="primary" onClick={onClose} rounded="2xl" className="px-8 py-3 font-black tracking-widest uppercase text-xs">
                        Hoàn tất
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default ThemeSettings;
