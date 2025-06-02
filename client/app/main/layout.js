"use client";

import { useState, useRef, useEffect } from "react";
import CanvasBackground from "@/components/CanvasBackground";
import RecordPlayer from "@/components/RecordPlayer";
import "@/app/styles/main.css";

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

export default function MainLayout({ children }) {
    const [currentIcons, setCurrentIcons] = useState(defaultIcons);
    const [isThemeView, setIsThemeView] = useState(false);
    const [selectedTheme, setSelectedTheme] = useState("orange");
    const [currentTheme, setCurrentTheme] = useState('orange');
    const [highlightStyle, setHighlightStyle] = useState({});
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isRecordPlayerVisible, setIsRecordPlayerVisible] = useState(false);
    const detailsPanelRef = useRef(null);

    const updateHighlightPosition = (buttonElement) => {
        if (!buttonElement) return;
        
        const rect = buttonElement.getBoundingClientRect();
        const parentRect = detailsPanelRef.current.getBoundingClientRect();
        
        setHighlightStyle({
            top: rect.top - parentRect.top + 'px',
            left: rect.left - parentRect.left + 'px',
            width: rect.width + 'px',
            height: rect.height + 'px',
            opacity: 1
        });
    };

    const handleIconTransition = (toThemeView) => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        
        // Add sliding-out class to current icons except Arrow
        const currentButtons = detailsPanelRef.current.querySelectorAll('.icon-button:not([data-name="Arrow"])');
        currentButtons.forEach(button => {
            button.classList.add('sliding-out');
        });

        // Handle Arrow rotation
        const arrowButton = detailsPanelRef.current.querySelector('.icon-button[data-name="Arrow"]');
        if (arrowButton) {
            if (toThemeView) {
                // Going to submenu - point left
                arrowButton.classList.remove('menu-view');
                arrowButton.classList.add('submenu-view');
            } else {
                // Going back to main menu - point down
                arrowButton.classList.remove('submenu-view');
                arrowButton.classList.add('menu-view');
            }
        }

        // After current icons slide out, update icons and slide in new ones
        setTimeout(() => {
            setCurrentIcons(toThemeView ? themeIcons : defaultIcons);
            setIsThemeView(toThemeView);
            
            // Add sliding-in class to new icons after a brief delay
            requestAnimationFrame(() => {
                const newButtons = detailsPanelRef.current.querySelectorAll('.icon-button:not([data-name="Arrow"])');
                newButtons.forEach(button => {
                    button.classList.add('sliding-in');
                });
                
                // Remove animation classes after animation completes
                setTimeout(() => {
                    newButtons.forEach(button => {
                        button.classList.remove('sliding-in', 'sliding-out');
                    });
                    setIsTransitioning(false);
                }, 500);
            });
        }, 500);
    };

    const handleClick = (name, event) => {
        if (isTransitioning) return;
        
        console.log('Clicked:', name);
        
        if (name === "Arrow") {
            setHighlightStyle({ opacity: 0 });
            handleIconTransition(false);
        } else if (name === "Themes") {
            setHighlightStyle({ opacity: 0 });
            handleIconTransition(true);
        } else if (name === "Record") {
            setIsRecordPlayerVisible(!isRecordPlayerVisible);
            // Dodajemo aktivnu klasu na Record ikonu
            event.currentTarget.classList.toggle('active-icon');
        } else if (isThemeView && name !== "Arrow") {
            setSelectedTheme(name);
            updateHighlightPosition(event.currentTarget);
            
            const themeIcon = themeIcons.find(icon => icon.name === name);
            if (themeIcon?.themeKey) {
                setCurrentTheme(themeIcon.themeKey);
            }
        }
    };

    const handleDoubleClick = (name, event) => {
        if (isTransitioning) return;
        
        if (isThemeView && name !== "Arrow") {
            // Dodajemo tranzicijski efekt na kliknutu ikonu
            const button = event.currentTarget;
            button.classList.add('double-click-transition');
            
            // Na double click prvo postavimo temu
            const themeIcon = themeIcons.find(icon => icon.name === name);
            if (themeIcon?.themeKey) {
                setCurrentTheme(themeIcon.themeKey);
            }
            
            // Čekamo da se animacija završi prije povratka
            setTimeout(() => {
                // Uklanjamo klasu nakon animacije
                button.classList.remove('double-click-transition');
                // Zatim se vratimo na glavni izbornik
                setHighlightStyle({ opacity: 0 });
                handleIconTransition(false);
            }, 500); // Vrijeme čekanja odgovara trajanju animacije
        }
    };

    // Set initial states
    useEffect(() => {
        // Set initial arrow state
        const arrowButton = detailsPanelRef.current?.querySelector('.icon-button[data-name="Arrow"]');
        if (arrowButton) {
            arrowButton.classList.add('menu-view');
        }

        // Set initial theme highlight
        if (isThemeView) {
            const themeButton = detailsPanelRef.current?.querySelector(`[data-name="${selectedTheme}"]`);
            if (themeButton) {
                updateHighlightPosition(themeButton);
            }
        }
    }, [isThemeView, selectedTheme]);

    return (
        <div className="main-container" data-theme={currentTheme}>
            <CanvasBackground currentTheme={currentTheme} />
            <RecordPlayer isVisible={isRecordPlayerVisible} currentTheme={currentTheme} />
            <div className="content-container">
                <div className={`contacts-panel panel-border ${isRecordPlayerVisible ? 'panel-shrink' : ''}`} />
                <div className="chat-area panel-border" />
                <div className="details-panel panel-border" ref={detailsPanelRef}>
                    <div className="icon-container">
                        <div 
                            className="theme-highlight"
                            style={highlightStyle}
                        />
                        {currentIcons.map((icon, index) => (
                            <div key={icon.name} className="icon-wrapper">
                                <button 
                                    data-name={icon.name}
                                    className={`icon-button ${
                                        icon.name === "Arrow" ? 
                                        (isThemeView ? 'submenu-view' : 'menu-view') : ''
                                    }`}
                                    onClick={(e) => handleClick(icon.name, e)}
                                    onDoubleClick={(e) => handleDoubleClick(icon.name, e)}
                                    disabled={isTransitioning}
                                >
                                    <img 
                                        src={`/icons/${icon.name}.png`}
                                        alt={icon.alt}
                                        width={48}
                                        height={48}
                                    />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
