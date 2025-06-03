"use client";

import { useState, useRef, useEffect } from "react";
import CanvasBackground from "@/components/CanvasBackground";
import RecordPlayer from "@/components/RecordPlayer";
import "@/app/styles/main.css";
import LogoutModal from '@/components/LogoutModal';
import { useRouter } from "next/navigation";
import Image from 'next/image';
import SearchWidget from '@/components/SearchWidget';
import '../styles/searchWidget.css';
import ChatListItem from '@/components/ChatListItem';
import '@/app/styles/chatListItem.css';

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

export default function MainLayout({ children }) {
    const [currentIcons, setCurrentIcons] = useState(defaultIcons);
    const [isThemeView, setIsThemeView] = useState(false);
    const [isMixerView, setIsMixerView] = useState(false);
    const [mixerSettings, setMixerSettings] = useState(mixerControls);
    const [selectedTheme, setSelectedTheme] = useState("orange");
    const [currentTheme, setCurrentTheme] = useState('orange');
    const [highlightStyle, setHighlightStyle] = useState({});
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isRecordPlayerVisible, setIsRecordPlayerVisible] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const detailsPanelRef = useRef(null);
    const router = useRouter();

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

    const handleMixerControlChange = (name, newValue) => {
        if (name === "Sound" && !newValue) {
            // When sound is turned off, set all sliders to 0
            setMixerSettings(prev => prev.map(control => 
                control.type === "slider" ? { ...control, value: 0 } :
                control.name === "Sound" ? { ...control, value: false } :
                control
            ));
        } else if (name === "Sound" && newValue) {
            // When sound is turned on, restore default values
            setMixerSettings(prev => prev.map(control => 
                control.type === "slider" ? { ...control, value: 50 } :
                control.name === "Sound" ? { ...control, value: true } :
                control
            ));
        } else {
            // For all other controls (sliders and notifications)
            setMixerSettings(prev => {
                const isSlider = prev.find(c => c.name === name)?.type === "slider";
                const allSlidersZero = prev
                    .filter(c => c.type === "slider")
                    .every(c => (c.name === name ? newValue : c.value) === 0);

                return prev.map(control => 
                    control.name === name ? { ...control, value: newValue } :
                    // Update sound icon based on slider values
                    control.name === "Sound" ? { ...control, value: !allSlidersZero } :
                    control
                );
            });
        }
    };

    const handleIconTransition = (toThemeView, toMixerView = false) => {
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
            if (toThemeView || toMixerView) {
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
            setIsMixerView(toMixerView);
            
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

    const handleLogout = () => {
        // Clear authentication data
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        
        // Clear the cookie
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        
        // Redirect to login page
        router.push('/login');
    };

    const handleIconClick = (name, event) => {
        if (isTransitioning) return;
        
        if (name === "Shutdown") {
            setIsLogoutModalOpen(true);
            return;
        }

        if (name === "Arrow") {
            setHighlightStyle({ opacity: 0 });
            handleIconTransition(false);
        } else if (name === "Themes") {
            setHighlightStyle({ opacity: 0 });
            handleIconTransition(true, false);
        } else if (name === "Mixer") {
            setHighlightStyle({ opacity: 0 });
            handleIconTransition(false, true);
        } else if (name === "Record") {
            setIsRecordPlayerVisible(!isRecordPlayerVisible);
            event.currentTarget.classList.toggle('active-icon');
        } else if (name === "Magnifying_glass") {
            setShowSearch(true);
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

    const handleSearchClick = () => {
        setShowSearch(true);
    };

    const handleCloseSearch = () => {
        setShowSearch(false);
        const searchIcon = detailsPanelRef.current?.querySelector('[data-name="Magnifying_glass"]');
        if (searchIcon) {
            searchIcon.classList.remove('active-icon');
        }
    };

    const handleAddChat = (user) => {
        // Check if chat already exists
        if (!chats.some(chat => chat.id === user.id)) {
            setChats(prevChats => [...prevChats, {
                id: user.id,
                username: user.username,
                avatar: `/avatars/${user.gender || 'default'}.png`
            }]);
        }
    };

    const handleChatClick = (chat) => {
        setSelectedChat(chat);
        // TODO: Implement chat view/messaging functionality
        console.log('Open chat with:', chat);
    };

    const handleInfoClick = (chat) => {
        // TODO: Implement user info modal/view
        console.log('Show info for:', chat);
    };

    const handleDeleteChat = (chat) => {
        setChats(prevChats => prevChats.filter(c => c.id !== chat.id));
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
                <div className={`contacts-panel panel-border ${isRecordPlayerVisible ? 'panel-shrink' : ''}`}>
                    {chats.map(chat => (
                        <ChatListItem
                            key={chat.id}
                            chat={chat}
                            onDelete={handleDeleteChat}
                            onChat={handleChatClick}
                            onInfo={handleInfoClick}
                        />
                    ))}
                </div>
                <div className="chat-area panel-border">
                    {selectedChat && (
                        <div className="chat-container">
                            <div className="chat-header">
                                <div className="chat-user-info">
                                    <Image
                                        src={selectedChat.avatar}
                                        alt={selectedChat.username}
                                        width={32}
                                        height={32}
                                    />
                                    <span>{selectedChat.username}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="details-panel panel-border" ref={detailsPanelRef}>
                    <div className="icon-container">
                        <div 
                            className="theme-highlight"
                            style={highlightStyle}
                        />
                        {!isMixerView ? (
                            currentIcons.map((icon, index) => (
                                <div key={icon.name} className="icon-wrapper">
                                    <button 
                                        data-name={icon.name}
                                        className={`icon-button ${
                                            icon.name === "Arrow" ? 
                                            (isThemeView ? 'submenu-view' : 'menu-view') : ''
                                        }`}
                                        onClick={(e) => handleIconClick(icon.name, e)}
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
                            ))
                        ) : (
                            <div className="mixer-controls">
                                <button 
                                    data-name="Arrow"
                                    className="icon-button submenu-view"
                                    onClick={(e) => handleIconClick("Arrow", e)}
                                    disabled={isTransitioning}
                                >
                                    <img 
                                        src="/icons/Arrow.png"
                                        alt="Back"
                                        width={48}
                                        height={48}
                                    />
                                </button>

                                <div className="controls-container">
                                    {mixerSettings.filter(control => control.type === "toggle").map((control) => (
                                        <button
                                            key={control.name}
                                            className={`mixer-toggle ${control.value ? 'active' : ''}`}
                                            onClick={(e) => handleMixerControlChange(control.name, !control.value)}
                                        >
                                            <img 
                                                src={`/icons/${control.name}${control.value ? '_on' : '_off'}.png`}
                                                alt={control.alt}
                                                width={32}
                                                height={32}
                                            />
                                        </button>
                                    ))}

                                    {mixerSettings.filter(control => control.type === "slider").map((control) => (
                                        <div key={control.name} className="mixer-control-container">
                                            <div className="mixer-slider-container">
                                                <img 
                                                    src={`/icons/${control.name}.png`}
                                                    alt={control.alt}
                                                    width={32}
                                                    height={32}
                                                />
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="100"
                                                    value={control.value}
                                                    onChange={(e) => handleMixerControlChange(control.name, parseInt(e.target.value))}
                                                    className="mixer-slider"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <LogoutModal 
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={handleLogout}
                language="hr"
            />
            {showSearch && <SearchWidget onClose={handleCloseSearch} onAddChat={handleAddChat} />}
        </div>
    );
}
