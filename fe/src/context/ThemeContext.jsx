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

    // Apply Theme Class
    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");
        
        let targetTheme = effectiveTheme;
        if (targetTheme === "system") {
            targetTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        }
        
        root.classList.add(targetTheme);
        localStorage.setItem("theme-mode", theme);
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

        localStorage.setItem("theme-primary-hue", primaryHue);
    }, [primaryHue]);

    // Apply Background Image logic
    useEffect(() => {
        const root = window.document.documentElement;
        const body = window.document.body;
        if (bgImage) {
            root.style.setProperty("--page-bg-image", `url(${bgImage})`);
            root.classList.add("has-bg-image");
            localStorage.setItem("theme-last-image", bgImage);
            setLastImage(bgImage);
        } else {
            root.style.removeProperty("--page-bg-image");
            root.classList.remove("has-bg-image");
        }
        localStorage.setItem("theme-bg-image", bgImage || "");
    }, [bgImage]);

    // Apply Background Opacity logic
    useEffect(() => {
        const root = window.document.documentElement;
        root.style.setProperty("--bg-overlay-opacity", bgOpacity);
        localStorage.setItem("theme-bg-opacity", bgOpacity);
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
