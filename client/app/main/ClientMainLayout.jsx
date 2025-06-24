"use client";

import { useState, useRef, useEffect } from "react";
import Image from 'next/image';
import { useRouter } from "next/navigation";
import CanvasBackground from "@/components/CanvasBackground";
import RecordPlayer from "@/components/RecordPlayer.jsx";
import RadioPlayer from "@/components/RadioPlayer.jsx";
import PianoWidget from "@/components/PianoWidget.jsx";
import RadioStationsList from "@/components/RadioStationsList.jsx";
import LogoutModal from '@/components/LogoutModal.jsx';
import SearchWidget from '@/components/SearchWidget';
import ChatListItem from '@/components/ChatListItem';
import ChatWindow from '@/components/ChatWindow';
import SettingsWidget from "@/components/SettingsWidget.jsx";
import "@/app/styles/main.css";
import '@/app/styles/searchWidget.css';
import '@/app/styles/chatListItem.css';
import '@/app/styles/chatWindow.css';

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

export default function ClientMainLayout({ children }) {
    const [currentIcons, setCurrentIcons] = useState(defaultIcons);
    const [isThemeView, setIsThemeView] = useState(false);
    const [isMixerView, setIsMixerView] = useState(false);
    const [mixerSettings, setMixerSettings] = useState(mixerControls);
    const [selectedTheme, setSelectedTheme] = useState("orange");
    const [currentTheme, setCurrentTheme] = useState('orange');
    const [highlightStyle, setHighlightStyle] = useState({});
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isRecordPlayerVisible, setIsRecordPlayerVisible] = useState(false);
    const [isRadioPlayerVisible, setIsRadioPlayerVisible] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const detailsPanelRef = useRef(null);
    const router = useRouter();
    const [dragOverIndex, setDragOverIndex] = useState(null);
    const [activeChats, setActiveChats] = useState([]);
    const [chatWidths, setChatWidths] = useState({});
    const [isResizing, setIsResizing] = useState(false);
    const [isSwapping, setIsSwapping] = useState(false);
    const resizeStartX = useRef(null);
    const initialWidth = useRef(null);
    const [isDraggingResize, setIsDraggingResize] = useState(false);
    const dragStartX = useRef(null);
    const initialWidths = useRef(null);
    const [isRadioListVisible, setIsRadioListVisible] = useState(false);
    const [isPianoVisible, setIsPianoVisible] = useState(false);
    const [isPianoActive, setIsPianoActive] = useState(false);
    const [radioStations, setRadioStations] = useState([]);
    const [currentStation, setCurrentStation] = useState(null);
    const radioPlayerRef = useRef(null);
    const [isSettingsVisible, setIsSettingsVisible] = useState(false);
    const [isSettingsActive, setIsSettingsActive] = useState(false);

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
            setMixerSettings(prev => prev.map(control => 
                control.type === "slider" ? { ...control, value: 0 } :
                control.name === "Sound" ? { ...control, value: false } :
                control
            ));
        } else if (name === "Sound" && newValue) {
            setMixerSettings(prev => prev.map(control => 
                control.type === "slider" ? { ...control, value: 50 } :
                control.name === "Sound" ? { ...control, value: true } :
                control
            ));
        } else {
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
        }
    };

    const handleIconTransition = (toThemeView, toMixerView = false) => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        
        const currentButtons = detailsPanelRef.current.querySelectorAll('.icon-button:not([data-name="Arrow"])');
        currentButtons.forEach(button => {
            button.classList.add('sliding-out');
        });

        const arrowButton = detailsPanelRef.current.querySelector('.icon-button[data-name="Arrow"]');
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
            setIsMixerView(toMixerView);
            
            requestAnimationFrame(() => {
                const newButtons = detailsPanelRef.current.querySelectorAll('.icon-button:not([data-name="Arrow"])');
                newButtons.forEach(button => {
                    button.classList.add('sliding-in');
                });
                
                setTimeout(() => {
                    newButtons.forEach(button => {
                        button.classList.remove('sliding-in', 'sliding-out');
                    });
                    setIsTransitioning(false);
                }, 500);
            });
        }, 500);
    };

    const handleLogout = async () => {
        // Call backend logout to close session
        try {
            const userId = localStorage.getItem('userId');
            if (userId) {
                await fetch('http://localhost:5000/api/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({ userId })
                });
            }
        } catch (e) {
            // Ignore errors, continue with logout
        }
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('isAdmin');
        // Remove token cookie for all paths
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
        // Hard reload to ensure cookie is gone before middleware runs
        window.location.href = '/login';
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
            if (isPianoVisible) {
                setIsPianoVisible(false);
                const pianoIcon = detailsPanelRef.current?.querySelector('[data-name="Piano"]');
                if (pianoIcon) {
                    pianoIcon.classList.remove('active-icon');
                }
            }
            if (isRadioPlayerVisible) {
                setIsRadioPlayerVisible(false);
                const radioIcon = detailsPanelRef.current?.querySelector('[data-name="Radio"]');
                if (radioIcon) {
                    radioIcon.classList.remove('active-icon');
                }
            }
            if (isSettingsVisible) {
                setIsSettingsVisible(false);
                const settingsIcon = detailsPanelRef.current?.querySelector('[data-name="Cogwheel"]');
                if (settingsIcon) {
                    settingsIcon.classList.remove('active-icon');
                }
            }
            setIsRecordPlayerVisible(!isRecordPlayerVisible);
            if (!isRecordPlayerVisible) {
                event.currentTarget.classList.add('active-icon');
            } else {
                event.currentTarget.classList.remove('active-icon');
            }
        } else if (name === "Piano") {
            if (isRadioPlayerVisible) {
                setIsRadioPlayerVisible(false);
                const radioIcon = detailsPanelRef.current?.querySelector('[data-name="Radio"]');
                if (radioIcon) {
                    radioIcon.classList.remove('active-icon');
                }
            }
            if (isRecordPlayerVisible) {
                setIsRecordPlayerVisible(false);
                const recordIcon = detailsPanelRef.current?.querySelector('[data-name="Record"]');
                if (recordIcon) {
                    recordIcon.classList.remove('active-icon');
                }
            }
            if (isSettingsVisible) {
                setIsSettingsVisible(false);
                const settingsIcon = detailsPanelRef.current?.querySelector('[data-name="Cogwheel"]');
                if (settingsIcon) {
                    settingsIcon.classList.remove('active-icon');
                }
            }
            setIsPianoVisible(!isPianoVisible);
            if (!isPianoVisible) {
                event.currentTarget.classList.add('active-icon');
            } else {
                event.currentTarget.classList.remove('active-icon');
            }
        } else if (name === "Radio") {
            if (isPianoVisible) {
                setIsPianoVisible(false);
                const pianoIcon = detailsPanelRef.current?.querySelector('[data-name="Piano"]');
                if (pianoIcon) {
                    pianoIcon.classList.remove('active-icon');
                }
            }
            if (isRecordPlayerVisible) {
                setIsRecordPlayerVisible(false);
                const recordIcon = detailsPanelRef.current?.querySelector('[data-name="Record"]');
                if (recordIcon) {
                    recordIcon.classList.remove('active-icon');
                }
            }
            if (isSettingsVisible) {
                setIsSettingsVisible(false);
                const settingsIcon = detailsPanelRef.current?.querySelector('[data-name="Cogwheel"]');
                if (settingsIcon) {
                    settingsIcon.classList.remove('active-icon');
                }
            }
            setIsRadioPlayerVisible(!isRadioPlayerVisible);
            if (!isRadioPlayerVisible) {
                event.currentTarget.classList.add('active-icon');
            } else {
                event.currentTarget.classList.remove('active-icon');
            }
        } else if (name === "Magnifying_glass") {
            setShowSearch(true);
            event.currentTarget.classList.toggle('active-icon');
        } else if (name === "Cogwheel") {
            if (isRadioPlayerVisible) {
                setIsRadioPlayerVisible(false);
                const radioIcon = detailsPanelRef.current?.querySelector('[data-name="Radio"]');
                if (radioIcon) {
                    radioIcon.classList.remove('active-icon');
                }
            }
            if (isRecordPlayerVisible) {
                setIsRecordPlayerVisible(false);
                const recordIcon = detailsPanelRef.current?.querySelector('[data-name="Record"]');
                if (recordIcon) {
                    recordIcon.classList.remove('active-icon');
                }
            }
            if (isPianoVisible) {
                setIsPianoVisible(false);
                const pianoIcon = detailsPanelRef.current?.querySelector('[data-name="Piano"]');
                if (pianoIcon) {
                    pianoIcon.classList.remove('active-icon');
                }
            }
            setIsSettingsVisible(!isSettingsVisible);
            if (!isSettingsVisible) {
                event.currentTarget.classList.add('active-icon');
            } else {
                event.currentTarget.classList.remove('active-icon');
            }
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
            const button = event.currentTarget;
            button.classList.add('double-click-transition');
            
            const themeIcon = themeIcons.find(icon => icon.name === name);
            if (themeIcon?.themeKey) {
                setCurrentTheme(themeIcon.themeKey);
            }
            
            setTimeout(() => {
                button.classList.remove('double-click-transition');
                setHighlightStyle({ opacity: 0 });
                handleIconTransition(false);
            }, 500);
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
        if (!chats.some(chat => chat.id === user.id)) {
            setChats(prevChats => [...prevChats, {
                id: user.id,
                username: user.username,
                avatar: `/avatars/${user.gender || 'default'}.png`
            }]);
        }
    };

    const handleChatDrop = (e) => {
        e.preventDefault();
        try {
            const data = e.dataTransfer.getData('text/plain');
            let droppedChat;
            try {
                droppedChat = JSON.parse(data);
            } catch {
                console.error('Invalid drop data:', data);
                return;
            }
            
            if (activeChats.some(chat => chat.id === droppedChat.id)) {
                return;
            }

            if (activeChats.length >= 3) {
                return;
            }

            const newChat = { ...droppedChat };
            setActiveChats(prev => {
                const newChats = [...prev, newChat];
                if (newChats.length === 1) {
                    setChatWidths({
                        [newChat.id]: '100%'
                    });
                } else if (newChats.length === 2) {
                    setChatWidths({
                        [newChats[0].id]: '50%',
                        [newChats[1].id]: '50%'
                    });
                } else if (newChats.length === 3) {
                    setChatWidths({
                        [newChats[0].id]: '33.33%',
                        [newChats[1].id]: '33.33%',
                        [newChats[2].id]: '33.33%'
                    });
                }
                return newChats;
            });
        } catch (error) {
            console.error('Error handling chat drop:', error);
        }
    };

    const handleCloseChat = (chatId) => {
        setActiveChats(prev => {
            const newChats = prev.filter(chat => chat.id !== chatId);
            if (newChats.length === 1) {
                setChatWidths({
                    [newChats[0].id]: '100%'
                });
            }
            return newChats;
        });
    };

    const handleChatResize = (chatId, newWidth) => {
        const width = Math.max(30, Math.min(70, parseInt(newWidth)));
        
        setChatWidths(prev => {
            const otherChat = activeChats.find(chat => chat.id !== chatId);
            if (otherChat) {
                return {
                    [chatId]: `${width}%`,
                    [otherChat.id]: `${100 - width}%`
                };
            }
            return prev;
        });
    };

    const handleChatClick = (chat) => {
        if (activeChats.some(activeChat => activeChat.id === chat.id)) {
            return;
        }

        if (activeChats.length >= 3) {
            return;
        }

        const newChat = { ...chat };
        setActiveChats(prev => {
            const newChats = [...prev, newChat];
            if (newChats.length === 1) {
                setChatWidths({
                    [newChat.id]: '100%'
                });
            } else if (newChats.length === 2) {
                setChatWidths({
                    [newChats[0].id]: '50%',
                    [newChats[1].id]: '50%'
                });
            } else if (newChats.length === 3) {
                setChatWidths({
                    [newChats[0].id]: '33.33%',
                    [newChats[1].id]: '33.33%',
                    [newChats[2].id]: '33.33%'
                });
            }
            return newChats;
        });
    };

    const handleInfoClick = (chat) => {
        console.log('Show info for:', chat);
    };

    const handleDeleteChat = (chat) => {
        setChats(prevChats => prevChats.filter(c => c.id !== chat.id));
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        const draggingElement = document.querySelector('.dragging');
        if (draggingElement) {
            draggingElement.classList.add('drag-over');
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        try {
            const droppedChat = JSON.parse(e.dataTransfer.getData('text/plain'));
            const draggingElement = document.querySelector('.dragging');
            if (draggingElement) {
                draggingElement.classList.remove('drag-over');
            }

            const dropTarget = e.target.closest('.chat-list-item');
            if (!dropTarget) return;

            const draggedIndex = chats.findIndex(chat => chat.id === droppedChat.id);
            const dropIndex = Array.from(dropTarget.parentNode.children).indexOf(dropTarget);

            if (draggedIndex === dropIndex) return;

            setChats(prevChats => {
                const newChats = [...prevChats];
                const [removed] = newChats.splice(draggedIndex, 1);
                newChats.splice(dropIndex, 0, removed);
                return newChats;
            });
        } catch (error) {
            console.error('Error handling drop:', error);
        }
    };

    const handleSwapChats = () => {
        if (activeChats.length !== 2) return;
        
        const [first, second] = activeChats;
        const firstWidth = chatWidths[first.id];
        const secondWidth = chatWidths[second.id];
        
        setActiveChats([second, first]);
        
        setChatWidths({
            [second.id]: firstWidth,
            [first.id]: secondWidth
        });
    };

    const handleSlideLeft = () => {
        if (activeChats.length !== 2) return;
        const [first] = activeChats;
        const firstEl = document.querySelector(`[data-chat-id="${first.id}"]`);
        
        if (firstEl) {
            firstEl.classList.add('sliding-left');
            setTimeout(() => {
                handleCloseChat(first.id);
                firstEl.classList.remove('sliding-left');
            }, 300);
        }
    };

    const handleSlideRight = () => {
        if (activeChats.length !== 2) return;
        const [, second] = activeChats;
        const secondEl = document.querySelector(`[data-chat-id="${second.id}"]`);
        
        if (secondEl) {
            secondEl.classList.add('sliding-right');
            setTimeout(() => {
                handleCloseChat(second.id);
                secondEl.classList.remove('sliding-right');
            }, 300);
        }
    };

    const handleResizeStart = (e) => {
        if (activeChats.length !== 2) return;
        
        dragStartX.current = e.clientX;
        setIsDraggingResize(true);
        
        const container = document.querySelector('.active-chats-container');
        if (container) {
            container.classList.add('resizing');
            container.style.userSelect = 'none';
        }
        
        e.preventDefault();
        e.stopPropagation();
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDraggingResize || !dragStartX.current) return;
            
            const deltaX = e.clientX - dragStartX.current;
            const containerWidth = document.querySelector('.active-chats-container').offsetWidth;
            const deltaPercentage = (deltaX / containerWidth) * 100;
            
            const [first, second] = activeChats;
            
            const baseWidth = 50;
            const maxDelta = 20;
            const adjustedDelta = Math.max(-maxDelta, Math.min(maxDelta, deltaPercentage / 2));
            
            const newFirstWidth = baseWidth + adjustedDelta;
            const newSecondWidth = baseWidth - adjustedDelta;
            
            const firstChat = document.querySelector(`[data-chat-id="${first.id}"]`);
            const secondChat = document.querySelector(`[data-chat-id="${second.id}"]`);
            
            if (firstChat && secondChat) {
                firstChat.style.width = `${newFirstWidth}%`;
                secondChat.style.width = `${newSecondWidth}%`;
                
                setChatWidths({
                    [first.id]: `${newFirstWidth}%`,
                    [second.id]: `${newSecondWidth}%`
                });
            }

            const controlsSquare = document.querySelector('.controls-square');
            if (controlsSquare) {
                controlsSquare.style.transform = `translate(calc(-50% + ${deltaX}px), -50%)`;
            }
        };

        const handleMouseUp = () => {
            if (!isDraggingResize) return;
            
            setIsDraggingResize(false);
            dragStartX.current = null;

            const container = document.querySelector('.active-chats-container');
            const controlsSquare = document.querySelector('.controls-square');
            if (container) {
                container.classList.remove('resizing');
                container.style.userSelect = '';
            }
            if (controlsSquare) {
                controlsSquare.style.transform = 'translate(-50%, -50%)';
            }
        };

        if (isDraggingResize) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDraggingResize, activeChats]);

    useEffect(() => {
        const arrowButton = detailsPanelRef.current?.querySelector('.icon-button[data-name="Arrow"]');
        if (arrowButton) {
            arrowButton.classList.add('menu-view');
        }

        if (isThemeView) {
            const themeButton = detailsPanelRef.current?.querySelector(`[data-name="${selectedTheme}"]`);
            if (themeButton) {
                updateHighlightPosition(themeButton);
            }
        }
    }, [isThemeView, selectedTheme]);

    const handleMenuClick = () => {
        setIsRadioListVisible(!isRadioListVisible);
    };

    const handleStationSelect = (station, index) => {
        setCurrentStation(station);
        if (radioPlayerRef.current?.selectStation) {
            radioPlayerRef.current.selectStation(station, index);
        }
    };

    const contactsPanelClass = `contacts-panel panel-border ${
        isRecordPlayerVisible || isRadioPlayerVisible || isPianoVisible || isSettingsVisible ? 'panel-shrink' : ''
    } ${isRadioListVisible ? 'radio-list-active' : ''} ${isPianoActive ? 'piano-active' : ''} ${isSettingsActive ? 'settings-active' : ''}`;

    const handlePianoActivate = () => {
        setIsPianoActive(!isPianoActive);
    };

    const handleSettingsActivate = () => {
        setIsSettingsActive(!isSettingsActive);
    };

    return (
        <div className="main-container" data-theme={currentTheme}>
            <CanvasBackground currentTheme={currentTheme} />
            <RecordPlayer isVisible={isRecordPlayerVisible} currentTheme={currentTheme} />
            <RadioPlayer 
                ref={radioPlayerRef}
                isVisible={isRadioPlayerVisible} 
                currentTheme={currentTheme}
                onMenuClick={() => setIsRadioListVisible(!isRadioListVisible)}
                isMenuActive={isRadioListVisible}
            />
            <PianoWidget 
                isVisible={isPianoVisible}
                onActivate={handlePianoActivate}
                isActive={isPianoActive}
            />
            <SettingsWidget
                isVisible={isSettingsVisible}
                onActivate={handleSettingsActivate}
                isActive={isSettingsActive}
            />
            <div className="content-container">
                <div 
                    className={contactsPanelClass}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                >
                    <div className="panel-content">
                        <div className={`contacts-list ${isRadioListVisible ? 'hidden' : ''}`}>
                            {chats.map((chat, index) => (
                                <ChatListItem
                                    key={chat.id}
                                    chat={chat}
                                    onDelete={handleDeleteChat}
                                    onChat={handleChatClick}
                                    onInfo={handleInfoClick}
                                />
                            ))}
                        </div>
                        <RadioStationsList 
                            stations={radioStations}
                            onStationSelect={handleStationSelect}
                            currentStation={currentStation}
                            isVisible={isRadioListVisible}
                        />
                    </div>
                </div>
                
                <div 
                    className="chat-area panel-border"
                    onDragOver={handleDragOver}
                    onDrop={handleChatDrop}
                >
                    {activeChats.length === 0 && (
                        <div className="drop-chat-hint">
                            Drag a chat here or click the chat button to start a conversation
                        </div>
                    )}
                    <div className="active-chats-container">
                        {activeChats.map((chat, index) => (
                            <ChatWindow
                                key={chat.id}
                                chat={chat}
                                width={chatWidths[chat.id]}
                                onClose={() => handleCloseChat(chat.id)}
                                data-chat-id={chat.id}
                            />
                        ))}
                        {activeChats.length >= 2 && (
                            <div className="chat-vertical-controls">
                                <div className="vertical-line"></div>
                                <div className="controls-square">
                                    <button
                                        onClick={handleSwapChats}
                                        title="Swap chat positions"
                                    >
                                        <Image
                                            src="/icons/Swap.png"
                                            alt="Swap"
                                            width={24}
                                            height={24}
                                        />
                                    </button>
                                    <button
                                        onClick={handleSlideLeft}
                                        title="Slide left chat out"
                                        className="slide-left-btn"
                                    >
                                        <Image
                                            src="/icons/Slide.png"
                                            alt="Slide left"
                                            width={24}
                                            height={24}
                                        />
                                    </button>
                                    <button
                                        onClick={handleSlideRight}
                                        title="Slide right chat out"
                                        className="slide-right-btn"
                                    >
                                        <Image
                                            src="/icons/Slide.png"
                                            alt="Slide right"
                                            width={24}
                                            height={24}
                                            style={{ transform: 'rotate(180deg)' }}
                                        />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
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
                                                {control.name === "Piano_sound" ? (
                                                    <div className="piano-icon-bg">
                                                        <img 
                                                            src={`/icons/${control.name}.png`}
                                                            alt={control.alt}
                                                            width={32}
                                                            height={32}
                                                        />
                                                    </div>
                                                ) : (
                                                    <img 
                                                        src={`/icons/${control.name}.png`}
                                                        alt={control.alt}
                                                        width={32}
                                                        height={32}
                                                    />
                                                )}
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