"use client";
import { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';

const ThemeContext = createContext();

// Theme icons konfiguracija
const defaultIcons = [
    { name: "Arrow", alt: "Navigate" },
    { name: "Cogwheel", alt: "Settings" },
    { name: "Magnifying_glass", alt: "Search" },
    { name: "Mixer", alt: "Audio" },
    { name: "Piano", alt: "Music" },
    { name: "Radio", alt: "Radio" },
    { name: "Record", alt: "Record" },
    { name: "Themes", alt: "Themes" },
    { name: "Shutdown", alt: "Exit" }
];

const themeIcons = [
    { name: "Arrow", alt: "Back" },
    { name: "Green", alt: "Green Theme", isTheme: true, themeKey: 'green' },
    { name: "Orange", alt: "Orange Theme", isTheme: true, themeKey: 'orange' },
    { name: "Yellow", alt: "Yellow Theme", isTheme: true, themeKey: 'yellow' },
    { name: "White", alt: "White Theme", isTheme: true, themeKey: 'white' },
    { name: "Red", alt: "Red Theme", isTheme: true, themeKey: 'red' },
    { name: "Blue", alt: "Blue Theme", isTheme: true, themeKey: 'blue' },
    { name: "Black", alt: "Black Theme", isTheme: true, themeKey: 'black' }
];

const mixerControls = [
    { name: "Record_player_sound", alt: "Record Player Volume", type: "slider", value: 50 },
    { name: "Grup_message_sound", alt: "Group Message Volume", type: "slider", value: 50 },
    { name: "Piano_sound", alt: "Piano Volume", type: "slider", value: 50 },
    { name: "Radio_sound", alt: "Radio Volume", type: "slider", value: 50 },
    { name: "Notifications", alt: "Notifications", type: "toggle", value: true },
    { name: "Sound", alt: "Sound", type: "toggle", value: true }
];

export const ThemeProvider = ({ children }) => {
    // Theme state varijable
    const [selectedTheme, setSelectedTheme] = useState("orange");
    const [currentTheme, setCurrentTheme] = useState('orange');
    const [highlightStyle, setHighlightStyle] = useState({});
    const [isThemeView, setIsThemeView] = useState(false);
    const [isMixerView, setIsMixerView] = useState(false);
    const [mixerSettings, setMixerSettings] = useState(mixerControls);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [currentIcons, setCurrentIcons] = useState(defaultIcons);

    // Refs
    const detailsPanelRef = useRef(null);

    // Theme funkcije
    const updateHighlightPosition = useCallback((buttonElement) => {
        if (!buttonElement || !detailsPanelRef.current) return;
        
        const rect = buttonElement.getBoundingClientRect();
        const parentRect = detailsPanelRef.current.getBoundingClientRect();
        
        setHighlightStyle({
            top: rect.top - parentRect.top + 'px',
            left: rect.left - parentRect.left + 'px',
            width: rect.width + 'px',
            height: rect.height + 'px',
            opacity: 1
        });
    }, []);

    const handleIconTransition = useCallback((toThemeView, toMixerView = false) => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        
        const currentButtons = detailsPanelRef.current?.querySelectorAll('.icon-button:not([data-name="Arrow"])');
        currentButtons?.forEach(button => {
            button.classList.add('sliding-out');
        });

        const arrowButton = detailsPanelRef.current?.querySelector('.icon-button[data-name="Arrow"]');
        if (arrowButton) {
            if (toThemeView || toMixerView) {
                arrowButton.classList.remove('menu-view');
                arrowButton.classList.add('submenu-view');
            } else {
                arrowButton.classList.remove('submenu-view');
                arrowButton.classList.add('menu-view');
            }
        }

        setTimeout(() => {
            setCurrentIcons(toThemeView ? themeIcons : defaultIcons);
            setIsThemeView(toThemeView);
            
            requestAnimationFrame(() => {
                const newButtons = detailsPanelRef.current?.querySelectorAll('.icon-button:not([data-name="Arrow"])');
                newButtons?.forEach(button => {
                    button.classList.add('sliding-in');
                });
                
                setTimeout(() => {
                    newButtons?.forEach(button => {
                        button.classList.remove('sliding-in', 'sliding-out');
                    });
                    setIsTransitioning(false);
                }, 500);
            });
        }, 500);
    }, [isTransitioning]);

    const handleThemeClick = useCallback((name, event, additionalHandlers = {}) => {
        if (isTransitioning) return;
        
        if (name === "Arrow") {
            setHighlightStyle({ opacity: 0 });
            handleIconTransition(false);
        } else if (name === "Themes") {
            setHighlightStyle({ opacity: 0 });
            handleIconTransition(true, false);
        } else if (name === "Mixer") {
            setHighlightStyle({ opacity: 0 });
            handleIconTransition(false, true);
        } else if (isThemeView && name !== "Arrow") {
            setSelectedTheme(name);
            updateHighlightPosition(event.currentTarget);
            
            const themeIcon = themeIcons.find(icon => icon.name === name);
            if (themeIcon?.themeKey) {
                setCurrentTheme(themeIcon.themeKey);
            }
        }
        
        // Call additional handlers if provided
        if (additionalHandlers[name]) {
            additionalHandlers[name](event);
        }
    }, [isTransitioning, isThemeView, handleIconTransition, updateHighlightPosition]);

    const handleThemeDoubleClick = useCallback((name, event) => {
        if (isTransitioning) return;
        
        if (isThemeView && name !== "Arrow") {
            const button = event.currentTarget;
            const themeIcon = themeIcons.find(icon => icon.name === name);
            if (themeIcon?.themeKey) {
                setCurrentTheme(themeIcon.themeKey);
            }
            setHighlightStyle({ opacity: 0 });
            handleIconTransition(false);
        }
    }, [isTransitioning, isThemeView, handleIconTransition]);

    const resetHighlight = useCallback(() => {
        setHighlightStyle({ opacity: 0 });
    }, []);

    const setTheme = useCallback((themeKey) => {
        setCurrentTheme(themeKey);
        setSelectedTheme(themeKey);
    }, []);

    const handleMixerControlChange = useCallback((name, newValue) => {
        if (name === "Sound") {
            setMixerSettings(prevSettings =>
                prevSettings.map(control =>
                    control.type === "slider"
                        ? { ...control, value: newValue ? 50 : 0 }
                        : control.name === "Sound"
                        ? { ...control, value: newValue }
                        : control
                )
            );
            return;
        }
        
        setMixerSettings(prev => {
            const isSlider = prev.find(c => c.name === name)?.type === "slider";
            const allSlidersZero = prev
                .filter(c => c.type === "slider")
                .every(c => (c.name === name ? newValue : c.value) === 0);

            return prev.map(control => 
                control.name === name ? { ...control, value: newValue } :
                control.name === "Sound" ? { ...control, value: !allSlidersZero } :
                control
            );
        });
    }, []);

    // Effect za update highlight pozicije kada se promeni tema
    useEffect(() => {
        if (isThemeView) {
            const themeButton = detailsPanelRef.current?.querySelector(`[data-name="${selectedTheme}"]`);
            if (themeButton) {
                updateHighlightPosition(themeButton);
            }
        }
    }, [isThemeView, selectedTheme, updateHighlightPosition]);

    const value = {
        // State
        selectedTheme,
        currentTheme,
        highlightStyle,
        isThemeView,
        isMixerView,
        mixerSettings,
        isTransitioning,
        currentIcons,
        
        // Refs
        detailsPanelRef,
        
        // Setters
        setSelectedTheme,
        setCurrentTheme,
        setHighlightStyle,
        setIsThemeView,
        setIsMixerView,
        setMixerSettings,
        setIsTransitioning,
        setCurrentIcons,
        
        // Functions
        updateHighlightPosition,
        handleIconTransition,
        handleThemeClick,
        handleThemeDoubleClick,
        resetHighlight,
        setTheme,
        handleMixerControlChange,
        
        // Constants
        defaultIcons,
        themeIcons,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useThemeContext = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useThemeContext must be used within ThemeProvider');
    }
    return context;
}; 