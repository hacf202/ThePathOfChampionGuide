import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    // 1. Core State
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem("theme-mode");
        return saved || "light";
    });

    const [primaryHue, setPrimaryHue] = useState(() => {
        const saved = localStorage.getItem("theme-primary-hue");
        return saved ? parseInt(saved) : 202; 
    });

    const [bgImage, setBgImage] = useState(() => {
        return localStorage.getItem("theme-bg-image") || null;
    });

    // To remember the image when user switches to solid and back to artwork
    const [lastImage, setLastImage] = useState(() => {
        return localStorage.getItem("theme-last-image") || "https://images.pocguide.top/backgrounds/BG1.webp";
    });

    const [bgOpacity, setBgOpacity] = useState(() => {
        const saved = localStorage.getItem("theme-bg-opacity");
        return saved ? parseFloat(saved) : 0.7;
    });

    // 2. Computed Mode Logic
    // If artwork is selected, we ALWAYS use dark mode styles
    const effectiveTheme = bgImage ? "dark" : theme;

    // Helper for robust storage
    const safeSetItem = (key, value) => {
        try {
            localStorage.setItem(key, value);
        } catch (e) {
            console.error(`Storage limit exceeded for ${key}:`, e);
            // If it's a dataURL and it failed, we might want to clear it to avoid repeated errors
            if (value && value.startsWith("data:") && e.name === "QuotaExceededError") {
                 // Option: clear the large item or notify user
            }
        }
    };

    // Apply Theme Class
    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");
        
        let targetTheme = effectiveTheme;
        if (targetTheme === "system") {
            targetTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        }
        
        root.classList.add(targetTheme);
        safeSetItem("theme-mode", theme);
    }, [theme, effectiveTheme]);

    // Apply Dynamic Primary Color
    useEffect(() => {
        const root = window.document.documentElement;
        const colors = {
            "100": `hsl(${primaryHue}, 80%, 95%)`,
            "200": `hsl(${primaryHue}, 75%, 85%)`,
            "300": `hsl(${primaryHue}, 75%, 65%)`,
            "400": `hsl(${primaryHue}, 70%, 55%)`,
            "500": `hsl(${primaryHue}, 65%, 45%)`,
            "600": `hsl(${primaryHue}, 70%, 40%)`,
            "700": `hsl(${primaryHue}, 75%, 35%)`,
        };

        Object.entries(colors).forEach(([shade, value]) => {
            root.style.setProperty(`--color-primary-${shade}`, value);
        });

        safeSetItem("theme-primary-hue", primaryHue.toString());
    }, [primaryHue]);

    // Apply Background Image logic
    useEffect(() => {
        const root = window.document.documentElement;
        if (bgImage) {
            root.style.setProperty("--page-bg-image", `url(${bgImage})`);
            root.classList.add("has-bg-image");
            
            // Optimization: If it's a dataURL, we avoid double saving to reduce QuotaExceeded risk
            if (bgImage.startsWith("data:")) {
                // For dataURLs, theme-bg-image is primary. we only update theme-last-image
                // if it's NOT a dataURL or if we really have space. 
                // Actually, let's just use safeSetItem for both but handle them carefully.
                safeSetItem("theme-last-image", bgImage);
            } else {
                safeSetItem("theme-last-image", bgImage);
            }
            setLastImage(bgImage);
        } else {
            root.style.removeProperty("--page-bg-image");
            root.classList.remove("has-bg-image");
        }
        safeSetItem("theme-bg-image", bgImage || "");
    }, [bgImage]);

    // Apply Background Opacity logic
    useEffect(() => {
        const root = window.document.documentElement;
        root.style.setProperty("--bg-overlay-opacity", bgOpacity);
        safeSetItem("theme-bg-opacity", bgOpacity.toString());
    }, [bgOpacity]);

    const selectArtworkMode = () => {
        setBgImage(lastImage);
    };

    const selectSolidMode = (mode) => {
        setBgImage(null);
        setTheme(mode);
    };

    const value = {
        theme,
        effectiveTheme,
        setTheme,
        primaryHue,
        setPrimaryHue,
        bgImage,
        setBgImage,
        lastImage,
        bgOpacity,
        setBgOpacity,
        selectArtworkMode,
        selectSolidMode,
        toggleTheme: () => {
             // Basic toggle for navbar button if needed, defaults to switching solid modes
             if (bgImage) {
                setBgImage(null);
             } else {
                setTheme(prev => prev === "light" ? "dark" : "light");
             }
        }
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};
