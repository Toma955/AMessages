"use client";

import { useState, useRef, useEffect } from "react";
import Image from 'next/image';
import { useRouter } from "next/navigation";
import CanvasBackground from "@/components/CanvasBackground/CanvasBackground";
import RecordPlayer from "@/components/RecordPlayer/RecordPlayer.jsx";
import RadioPlayer from "@/components/RadioPlayer/RadioPlayer.jsx";
import PianoWidget from "@/components/PianoWidget/PianoWidget.jsx";
import RadioStationsList from "@/components/RadioPlayer/RadioStationsList.jsx";
import LogoutModal from '@/components/LogoutModal/LogoutModal.jsx';
import SearchWidget from '@/components/SearchWidget/SearchWidget.jsx';
import ChatListItem from '@/components/ChatList/ChatListItem';
import ChatWindow from '@/components/ChatWindow/ChatWindow';
import SettingsWidget from "@/components/SettingsWidget/SettingsWidget";
import SettingsDashboard from "@/components/SettingsWidget/SettingsDashboard";
import socketService from "@/services/socketService";
import "@/app/styles/main.css";
import '@/app/styles/main.css';
import RadioListWidget from '@/components/RadioPlayer/RadioListWidget';
import EndToEndMessenger from '@/components/EndToEndMessenger/EndToEndMessenger';
import { createPortal } from 'react-dom';
import DocumentReader from "@/components/DocumentReader/DocumentReader";

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
    const [currentStation, setCurrentStation] = useState({
        name: 'NPO Radio 1',
        url: 'https://icecast.omroep.nl/radio1-bb-mp3',
        stationuuid: 'npo-radio-1',
    });
    const radioPlayerRef = useRef(null);
    const [isSettingsVisible, setIsSettingsVisible] = useState(false);
    const [isDashboardInPanelVisible, setIsDashboardInPanelVisible] = useState(false);
    const [prevMixerValues, setPrevMixerValues] = useState({});
    const [currentUser, setCurrentUser] = useState({ username: '', gender: 'default' });

    // Record Player 
    const [songs, setSongs] = useState([]);
    const [currentSong, setCurrentSong] = useState(null);
    const [isSongListLoading, setIsSongListLoading] = useState(false);
    const [isSongListActive, setIsSongListActive] = useState(false);
    const [playerVolume, setPlayerVolume] = useState(0.5); 

    const [activePanel, setActivePanel] = useState('record'); 
    const [panelAnimation, setPanelAnimation] = useState('slideIn');

    const [panelState, setPanelState] = useState('contacts'); 
    const [contactsAnim, setContactsAnim] = useState('');
    const [radioAnim, setRadioAnim] = useState('');

    const [showRadioList, setShowRadioList] = useState(false);
    const [radioWidgetAnim, setRadioWidgetAnim] = useState('');
    const [radioListAnim, setRadioListAnim] = useState('');

    const [showDeleteArea, setShowDeleteArea] = useState(false);
    const [deleteAreaActive, setDeleteAreaActive] = useState(false);
    const [deleteAnimationCount, setDeleteAnimationCount] = useState(0);
    const [deleteAnimationKey, setDeleteAnimationKey] = useState(0);

    const [isHoveringResize, setIsHoveringResize] = useState(false);
    const lastChatWidths = useRef({});
    const [controlsLeft, setControlsLeft] = useState('50%');

    const [hoveredChatId, setHoveredChatId] = useState(null);
    const [draggedChatId, setDraggedChatId] = useState(null);

    const [removingChatId, setRemovingChatId] = useState(null);

    const [isDocumentOpen, setIsDocumentOpen] = useState(false);
    const [isAiChatOpen, setIsAiChatOpen] = useState(false);

    const [songListError, setSongListError] = useState(null);

    // Autentification
    useEffect(() => {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        
        
        if (!token || !userId) {
            router.push('/login');
            return;
        }
        
        
        try {
            const tokenData = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Math.floor(Date.now() / 1000);
            
            if (tokenData.exp && tokenData.exp < currentTime) {
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
                localStorage.removeItem('username');
                localStorage.removeItem('isAdmin');
                router.push('/login?error=token_expired');
                return;
            }
        } catch (error) {
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            localStorage.removeItem('username');
            localStorage.removeItem('isAdmin');
            router.push('/login?error=invalid_token');
            return;
        }
    }, [router]);

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
               
                const response = await fetch('/api/me', {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                if (data.success && data.user) {
                    setCurrentUser({
                        username: data.user.username,
                        gender: data.user.gender || 'default'
                    });
                }
            } catch (error) {
                console.error("Failed to fetch user data:", error);
            }
        };

        fetchUserData();
    }, []);

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
        if (name === "Sound") {
            if (!newValue) {
                
                const prev = {};
                mixerSettings.forEach(control => {
                    if (control.type === "slider") prev[control.name] = control.value;
                });
                setPrevMixerValues(prev);

              
                setMixerSettings(prevSettings =>
                    prevSettings.map(control =>
                        control.type === "slider"
                            ? { ...control, value: 0 }
                            : control.name === "Sound"
                            ? { ...control, value: false }
                            : control
                    )
                );
                setPlayerVolume(0);
            } else {
               
                setMixerSettings(prevSettings =>
                    prevSettings.map(control =>
                        control.type === "slider"
                            ? { ...control, value: prevMixerValues[control.name] ?? 50 }
                            : control.name === "Sound"
                            ? { ...control, value: true }
                            : control
                    )
                );
                setPlayerVolume((prevMixerValues["Record_player_sound"] ?? 50) / 100);
            }
            return;
        }
        if (name === "Record_player_sound") {
            setPlayerVolume(newValue / 100);
        }
        if (name === "Grup_message_sound") {
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
        } else if (name === "Piano_sound") {
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
        } else if (name === "Radio_sound") {
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
        } else if (name === "Notifications") {
            setMixerSettings(prev => {
                const isSlider = prev.find(c => c.name === name)?.type === "toggle";
                const allTogglesZero = prev
                    .filter(c => c.type === "toggle")
                    .every(c => (c.name === name ? newValue : c.value) === false);

                return prev.map(control => 
                    control.name === name ? { ...control, value: newValue } :
                    control.name === "Sound" ? { ...control, value: !allTogglesZero } :
                    control
                );
            });
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
        try {
            const token = localStorage.getItem('token');
            if (token) {
                await fetch('/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
        // Briši token i preusmjeri tek nakon što je fetch završen
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('isAdmin');
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
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
            setIsRadioPlayerVisible(false);
            setIsPianoVisible(false);
            switchPanel('record');
          
            if (radioPlayerRef.current && radioPlayerRef.current.pause) {
                radioPlayerRef.current.pause();
            }
        } else if (name === "Radio") {
            setIsRadioPlayerVisible(!isRadioPlayerVisible);
            setIsRecordPlayerVisible(false);
            setIsPianoVisible(false);
            switchPanel('radio');
          
            const audio = document.querySelector('audio');
            if (audio) audio.pause();
        } else if (name === "Piano") {
            setIsPianoVisible(!isPianoVisible);
        } else if (name === "Magnifying_glass") {
            setShowSearch(true);
            event.currentTarget.classList.toggle('active-icon');
        } else if (name === "Cogwheel") {
          
            const isClosing = isSettingsVisible;
            setIsSettingsVisible(!isSettingsVisible);
            if (isClosing) {
                setIsDashboardInPanelVisible(false);
            }
            return;
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

    const handleAddChat = async (user) => {
        const chat = {
            id: user.id,
            username: user.username,
            avatar: `/avatars/${user.gender || 'default'}.png`
        };

               try {
            const token = localStorage.getItem('token');
            await fetch('/api/users/userlist/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ id: user.id, username: user.username })
            });
        } catch (e) {
            console.error('Greška pri upisu u Userlist.db:', e);
        }

        if (!chats.some(c => c.id === user.id)) {
            setChats(prevChats => [...prevChats, chat]);
        }
        
        if (!activeChats.some(ac => ac.id === user.id)) {
            if (activeChats.length < 3) {
                const newActiveChats = [...activeChats, chat];
                setActiveChats(newActiveChats);

                const newWidth = 100 / newActiveChats.length;
                const newWidths = {};
                newActiveChats.forEach(c => {
                    newWidths[c.id] = `${newWidth}%`;
                });
                setChatWidths(newWidths);
            }
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        const draggingElement = document.querySelector('.dragging');
        if (draggingElement) {
            draggingElement.classList.add('drag-over');
        }
        
        const chatArea = document.querySelector('.chat-area.panel-border');
        const deleteArea = document.getElementById('delete-area');
        if (deleteArea && chatArea) {
            const deleteRect = deleteArea.getBoundingClientRect();
            const mouseY = e.clientY;
            if (mouseY > deleteRect.top) {
                setDeleteAreaActive(true);
            } else {
                setDeleteAreaActive(false);
            }
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

    const handleChatDrop = (e) => {
        e.preventDefault();
        const deleteArea = document.getElementById('delete-area');
        if (deleteArea) {
            const deleteRect = deleteArea.getBoundingClientRect();
            if (e.clientY > deleteRect.top) {
               
                try {
                    const data = e.dataTransfer.getData('text/plain');
                    let droppedChat = JSON.parse(data);
                    setChats(prevChats => prevChats.filter(c => c.id !== droppedChat.id));
                    setActiveChats(prev => prev.filter(c => c.id !== droppedChat.id));
                } catch {}
                setShowDeleteArea(false);
                setDeleteAreaActive(false);
                return;
            }
        }
        
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
        setShowDeleteArea(false);
        setDeleteAreaActive(false);
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
        handleCloseChat(first.id);
    };

    const handleSlideRight = () => {
        if (activeChats.length !== 2) return;
        const [, second] = activeChats;
        handleCloseChat(second.id);
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
            
            setChatWidths({
                [first.id]: `${newFirstWidth}%`,
                [second.id]: `${newSecondWidth}%`
            });
        };

        const handleMouseUp = () => {
            if (!isDraggingResize) return;
            
            setIsDraggingResize(false);
            dragStartX.current = null;

            const container = document.querySelector('.active-chats-container');
            if (container) {
                container.classList.remove('resizing');
                container.style.userSelect = '';
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
        if (panelState === 'contacts') {
            setContactsAnim('slideOutLeft');
            setRadioAnim('slideInRight');
            setPanelState('animating-to-radio');
            setTimeout(() => {
                setPanelState('radio');
                setContactsAnim('');
            }, 300);
        } else if (panelState === 'radio') {
            setContactsAnim('slideInRight');
            setRadioAnim('slideOutRight');
            setPanelState('animating-to-contacts');
            setTimeout(() => {
                setPanelState('contacts');
                setRadioAnim('');
            }, 300);
        }
    };

    const handleStationSelect = (station, index) => {
        setCurrentStation(station);
        if (radioPlayerRef.current?.selectStation) {
            radioPlayerRef.current.selectStation(station, index);
        }
        setIsRadioListVisible(false);
    };

    const contactsPanelClass = `contacts-panel panel-border ${
        isRecordPlayerVisible || isRadioPlayerVisible || isPianoVisible || isDashboardInPanelVisible || isSettingsVisible ? 'panel-shrink' : ''
    } ${isRadioListVisible ? 'radio-list-active' : ''} ${isPianoActive ? 'piano-active' : ''}`;

    const handlePianoActivate = () => {
        setIsPianoActive(!isPianoActive);
    };

    const handleRecordPlayerMenuClick = async () => {
        if (isSongListActive) {
            setIsSongListActive(false);
            return;
        }
        setIsSongListActive(true);
        if (songs.length === 0 && !isSongListLoading) {
            setIsSongListLoading(true);
            try {
                const response = await fetch('/api/media/songs');
                if (!response.ok) {
                    const errorData = await response.json();
                    setSongs([]);
                    setSongListError(errorData.errorMessage || errorData.error || 'Greška pri dohvaćanju pjesama.');
                    return;
                }
                const data = await response.json();
                if (data.songs) {
                    setSongs(data.songs);
                    setSongListError(null);
                }
            } catch (error) {
                setSongListError('Greška pri dohvaćanju pjesama: ' + error.message);
            } finally {
                setIsSongListLoading(false);
            }
        }
    };

    const handleSongSelect = (song) => {
        setCurrentSong(song);
    };

    const switchPanel = (panel) => {
        if (!isSongListActive) {
            setActivePanel(panel);
            setPanelAnimation(styles.slideIn || 'slideIn');
            return;
        }
        setPanelAnimation(styles.slideOut || 'slideOut');
        setTimeout(() => {
            setActivePanel(panel);
            setPanelAnimation(styles.slideIn || 'slideIn');
        }, 300);
    };

    // Fallback 
    useEffect(() => {
        if (!currentStation || !currentStation.url) return;
        if (window && window.Audio) {
            const testAudio = new window.Audio(currentStation.url);
            testAudio.crossOrigin = 'anonymous';
            testAudio.addEventListener('error', () => {
             
                if (radioStations && radioStations.length > 0) {
                    setCurrentStation(radioStations[0]);
                }
            });
            
            testAudio.load();
        }
    }, [currentStation, radioStations]);

    useEffect(() => {
       
        const fetchUserlist = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            try {
                const res = await fetch('/api/users/userlist', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await res.json();
                if (data.success && Array.isArray(data.userlist)) {
                    
                    const chatList = data.userlist.map(u => {
                        let unread = u.unread_messages;
                        if (typeof unread !== 'number' || unread < 1) unread = 0;
                        else if (unread > 9) unread = '+9';
                        return {
                            id: u.id,
                            username: u.username,
                            avatar: `/avatars/default.png`, 
                            unread_messages: unread,
                            last_message_at: u.last_message_at
                        };
                    });
                    setChats(chatList);
                }
            } catch (e) {
                console.error('Greška pri dohvaćanju userlist:', e);
            }
        };
        fetchUserlist();
    }, []);

   
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        try {
           
            const socket = socketService.connect(token);

           
            socketService.on('new_message', (messageData) => {
              
                setChats(prevChats => {
                    const updatedChats = prevChats.map(chat => {
                        if (chat.id === messageData.sender_id) {
                            return {
                                ...chat,
                                unread_messages: (chat.unread_messages || 0) + 1,
                                last_message_at: messageData.sent_at
                            };
                        }
                        return chat;
                    });
                    return updatedChats;
                });

               
                if (activeChats.some(chat => chat.id === messageData.sender_id)) {
                    
                    window.dispatchEvent(new CustomEvent('new_message_received', {
                        detail: messageData
                    }));
                }
            });

          
            socketService.on('message_sent', (messageData) => {
                
                if (activeChats.some(chat => chat.id === messageData.receiver_id)) {
                    
                    window.dispatchEvent(new CustomEvent('message_sent_confirmation', {
                        detail: messageData
                    }));
                }
            });

          
            socketService.on('user_typing', (typingData) => {
                
                if (activeChats.some(chat => chat.id === typingData.userId)) {
                    window.dispatchEvent(new CustomEvent('user_typing', {
                        detail: typingData
                    }));
                }
            });

            
            socketService.on('message_read_receipt', (readData) => {

                if (activeChats.some(chat => chat.id === readData.readBy)) {
                    window.dispatchEvent(new CustomEvent('message_read_receipt', {
                        detail: readData
                    }));
                }
            });

        } catch (error) {
            // Handle authentication 
            if (error.message.includes('Authentication') || error.message.includes('token')) {
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
                localStorage.removeItem('username');
                localStorage.removeItem('isAdmin');
                router.push('/login?error=authentication_failed');
                return;
            }
            
            
            console.error('Socket connection failed:', error.message);
        }

       
        return () => {
            socketService.disconnect();
        };
    }, [activeChats, router]);

    const renderMixerControls = () => {
        return (
            <div className="mixer-controls">
                {mixerSettings.map((control, index) => (
                    <div key={control.name} className="mixer-control-container">
                        {control.type === "slider" ? (
                            <div className="mixer-slider-container">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={control.value}
                                    onChange={(e) => handleMixerControlChange(control.name, parseInt(e.target.value))}
                                    className="mixer-slider"
                                    orient="vertical"
                                />
                                <img
                                    src={`/icons/${control.name}.png`}
                                    alt={control.alt}
                                    width={36}
                                    height={36}
                                />
                            </div>
                        ) : (
                            <button
                                className={`mixer-toggle ${control.value ? 'active' : ''}`}
                                onClick={() => handleMixerControlChange(control.name, !control.value)}
                            >
                                <img
                                    src={`/icons/${control.name}.png`}
                                    alt={control.alt}
                                    width={36}
                                    height={36}
                                />
                            </button>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    // Show delete area on drag start, hide on drag end
    useEffect(() => {
        const handleDragStart = () => {
            setShowDeleteArea(true);
            setDeleteAnimationCount(3);
            setDeleteAnimationKey(Math.random());
        };
        const handleDragEnd = () => {
            setShowDeleteArea(false);
            setDeleteAreaActive(false);
        };
        window.addEventListener('dragstart', handleDragStart);
        window.addEventListener('dragend', handleDragEnd);
        return () => {
            window.removeEventListener('dragstart', handleDragStart);
            window.removeEventListener('dragend', handleDragEnd);
        };
    }, []);

    // Handler for animation end
    const handleDeleteAnimationEnd = () => {
        if (deleteAnimationCount > 1) {
            setDeleteAnimationCount(c => c - 1);
            setDeleteAnimationKey(Math.random());
        }
    };

    // Hover resize mousemove handler
    useEffect(() => {
        if (!isHoveringResize) return;
        const handleHoverResize = (e) => {
            const container = document.querySelector('.active-chats-container');
            if (!container || activeChats.length !== 2) return;
            const rect = container.getBoundingClientRect();
            // Ako miš izađe izvan containera, ugasi hover-resize i resetiraj širine
            if (
                e.clientX < rect.left ||
                e.clientX > rect.right ||
                e.clientY < rect.top ||
                e.clientY > rect.bottom
            ) {
                setIsHoveringResize(false);
                setChatWidths(lastChatWidths.current);
                return;
            }
            const mouseX = e.clientX - rect.left;
            const containerWidth = rect.width;
            const percent = Math.max(30, Math.min(70, (mouseX / containerWidth) * 100));
            const [first, second] = activeChats;
            setChatWidths({
                [first.id]: `${percent}%`,
                [second.id]: `${100 - percent}%`
            });
        };
        window.addEventListener('mousemove', handleHoverResize);
        return () => {
            window.removeEventListener('mousemove', handleHoverResize);
        };
    }, [isHoveringResize, activeChats]);

    useEffect(() => {
        if (!isHoveringResize) return;
        const container = document.querySelector('.active-chats-container');
        const handleContainerLeave = () => {
            setIsHoveringResize(false);
        };
        container?.addEventListener('mouseleave', handleContainerLeave);
        return () => {
            container?.removeEventListener('mouseleave', handleContainerLeave);
        };
    }, [isHoveringResize, activeChats]);

    // Funkcija za izračun pozicije granice
    const updateControlsLeft = () => {
        if (activeChats.length !== 2) return setControlsLeft('50%');
        const container = document.querySelector('.active-chats-container');
        if (!container) return setControlsLeft('50%');
        const containerWidth = container.offsetWidth;
        const leftPercent = parseFloat(chatWidths[activeChats[0].id] || '50');
        const leftPx = (containerWidth * leftPercent) / 100;
        setControlsLeft(`${leftPx}px`);
    };

    // Pozivaj updateControlsLeft kad god se chatWidths ili activeChats promijene
    useEffect(() => {
        updateControlsLeft();
    }, [chatWidths, activeChats]);

    const handleDragRemoveChat = (chat) => {
        setDraggedChatId(chat.id);
    };
    const handleDragRestoreChat = () => setDraggedChatId(null);

    const handleRemoveChat = (chat) => {
        setRemovingChatId(chat.id);
    };

    const handleRemoveAnimationEnd = (chatId) => {
        setChats(prev => prev.filter(c => c.id !== chatId));
        setRemovingChatId(null);
    };

    return (
        <>
            <div className="main-container" data-theme={currentTheme}>
                <CanvasBackground currentTheme={currentTheme} />
                <RecordPlayer 
                    isVisible={isRecordPlayerVisible}
                    onMenuClick={handleRecordPlayerMenuClick}
                    currentSong={currentSong}
                    setCurrentSong={setCurrentSong}
                    songs={songs}
                    playerVolume={playerVolume}
                />
                {isRadioPlayerVisible && (
                    <RadioPlayer
                        ref={radioPlayerRef}
                        isVisible={isRadioPlayerVisible}
                        currentTheme={currentTheme}
                        onMenuClick={() => setIsRadioListVisible(!isRadioListVisible)}
                        isMenuActive={isRadioListVisible}
                        currentStation={currentStation}
                    />
                )}
                <PianoWidget 
                    isVisible={isPianoVisible}
                    onActivate={handlePianoActivate}
                    isActive={isPianoActive}
                />
                <SettingsWidget
                    isVisible={isSettingsVisible}
                    username={currentUser.username}
                    avatar={currentUser.id ? `/api/users/${currentUser.id}/profile-picture` : (currentUser.gender === 'woman' ? '/icons/Woman.png' : '/icons/Man.png')}
                    gender={currentUser.gender}
                    onAvatarClick={() => {
                        setIsDashboardInPanelVisible(!isDashboardInPanelVisible);
                    }}
                    onOpenAiChat={() => setIsAiChatOpen(true)}
                />
                <div className={`content-container${activeChats.length === 1 ? ' single-chat' : ''}`}>
                    <div 
                        className={contactsPanelClass}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    >
                        <div className="panel-content">
                            {isDashboardInPanelVisible ? (
                                <SettingsDashboard 
                                    avatar={currentUser.id ? `/api/users/${currentUser.id}/profile-picture` : (currentUser.gender === 'woman' ? '/icons/Woman.png' : '/icons/Man.png')}
                                    gender={currentUser.gender}
                                    onOpenDocument={() => setIsDocumentOpen(true)}
                                    onOpenAiChat={() => setIsAiChatOpen(true)}
                                />
                            ) : isRadioListVisible ? (
                                <RadioListWidget
                                    isVisible={isRadioListVisible}
                                    onClose={() => setIsRadioListVisible(false)}
                                    onStationSelect={handleStationSelect}
                                    currentStation={currentStation}
                                />
                            ) : (
                                (panelState === 'contacts' || panelState === 'animating-to-radio' || panelState === 'animating-to-contacts') && (
                                    <div className={`contacts-list${contactsAnim ? ' ' + contactsAnim : ''}`}> 
                                        {isSongListActive ? (
                                            <div className={`song-list${activePanel === 'radio' ? ' ' + styles.radioBgPanel : ''}`}> 
                                                {isSongListLoading ? (
                                                    <p>Loading songs...</p>
                                                ) : songListError ? (
                                                    <p style={{ color: 'red' }}>{songListError}</p>
                                                ) : songs.length > 0 ? (
                                                    <ul>
                                                        {songs.map((song, index) => (
                                                            <li
                                                                key={index}
                                                                onClick={() => handleSongSelect(song)}
                                                                className={song === currentSong ? styles.frostedSongListItem : ''}
                                                            >
                                                                {song.replace(/\.mp3$|\.wav$|\.waw$/,'')}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <p>No songs found.</p>
                                                )}
                                            </div>
                                        ) : (
                                            chats.map((chat, index) => (
                                                <ChatListItem
                                                    key={chat.id}
                                                    chat={chat}
                                                    onDelete={handleDeleteChat}
                                                    onChat={handleChatClick}
                                                    onInfo={handleInfoClick}
                                                    onMessages={handleChatClick}
                                                    onDragRemove={() => handleDragRemoveChat(chat)}
                                                    onDragRestore={handleDragRestoreChat}
                                                    removing={removingChatId === chat.id}
                                                    onRemoveAnimationEnd={() => handleRemoveAnimationEnd(chat.id)}
                                                    onRemove={() => handleRemoveChat(chat)}
                                                />
                                            ))
                                        )}
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                    
                    <div className="chat-area panel-border" onDragOver={handleDragOver} onDrop={handleChatDrop}>
                        {isDocumentOpen ? (
                            <DocumentReader src="/documents/Upute.md" onClose={() => setIsDocumentOpen(false)} />
                        ) : isAiChatOpen ? (
                            <EndToEndMessenger
                                chat={{ id: 'ai', username: 'AI', avatar: '/avatars/AI.png' }}
                                isSingle={true}
                                onClose={() => setIsAiChatOpen(false)}
                                style={{ width: '100%', height: '100%' }}
                            />
                        ) : (
                        <div
                            className="active-chats-container"
                            style={{
                                display: 'flex',
                                alignItems: 'stretch',
                                justifyContent: 'center',
                                width: '100%',
                                height: '100%',
                                gap: activeChats.length > 1 ? '2%' : 0,
                                paddingLeft: activeChats.length > 1 ? '0.5%' : 0,
                                paddingRight: activeChats.length > 1 ? '0.5%' : 0,
                                position: 'relative',
                            }}
                        >
                            {activeChats.map((chat, idx) => (
                                <EndToEndMessenger
                                    key={chat.id}
                                    chat={chat}
                                    style={activeChats.length > 1 ? { width: chatWidths[chat.id] || '49%' } : { width: '100%' }}
                                    onClose={() => handleCloseChat(chat.id)}
                                    data-chat-id={chat.id}
                                    isSingle={activeChats.length === 1}
                                />
                            ))}
                            {activeChats.length === 2 && (
                                <div className="controls-between-chats" style={{ left: controlsLeft, transform: 'translateX(-50%)' }}>
                                    <div className="vertical-line"></div>
                                    <div className="controls-square">
                                        <button onClick={handleSwapChats} title="Swap chat positions">
                                            <Image src="/icons/Swap.png" alt="Swap" width={24} height={24} />
                                        </button>
                                        <button
                                            onMouseDown={handleResizeStart}
                                            onMouseEnter={() => {
                                                lastChatWidths.current = { ...chatWidths };
                                                setIsHoveringResize(true);
                                            }}
                                            title="Resize chats"
                                        >
                                            <Image src="/icons/Resize.png" alt="Resize" width={24} height={24} />
                                        </button>
                                        <button onClick={handleSlideLeft} title="Slide left chat out" className="slide-left-btn">
                                            <Image src="/icons/Slide.png" alt="Slide left" width={24} height={24} />
                                        </button>
                                        <button onClick={handleSlideRight} title="Slide right chat out" className="slide-right-btn">
                                            <Image src="/icons/Slide.png" alt="Slide right rotated" width={24} height={24} style={{ transform: 'rotate(180deg)' }} />
                                        </button>
                                    </div>
                                </div>
                            )}
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
                                renderMixerControls()
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Search Widget */}
                {showSearch && (
                    <SearchWidget onClose={handleCloseSearch} onAddChat={handleAddChat} />
                )}
                {/* Logout Modal */}
                <LogoutModal
                    isOpen={isLogoutModalOpen}
                    onClose={() => setIsLogoutModalOpen(false)}
                    onConfirm={handleLogout}
                    language="hr"
                />
            </div>
            {/* PORTAL za overlay i delete ikonu */}
            {typeof window !== 'undefined' && createPortal(
                <>
                    {showDeleteArea && deleteAreaActive && (
                        <div 
                            style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                width: '100vw',
                                height: '100vh',
                                background: 'rgba(0,0,0,0.45)',
                                backdropFilter: 'blur(4px)',
                                zIndex: 9998,
                                pointerEvents: 'none',
                                transition: 'opacity 0.18s',
                            }}
                        />
                    )}
                    {showDeleteArea && (
                        <div 
                            id="delete-area" 
                            key={deleteAnimationKey}
                            style={{
                                position: 'fixed',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                bottom: 40,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'flex-end',
                                zIndex: 9999,
                                pointerEvents: 'none',
                                animation: deleteAnimationCount > 0 ? 'fadeInDelete 0.18s' : 'none',
                                opacity: 1,
                            }}
                            onAnimationEnd={handleDeleteAnimationEnd}
                        >
                            <div style={{
                                pointerEvents: 'auto',
                                transition: 'transform 0.18s',
                                transform: deleteAreaActive ? 'scale(1.6)' : 'scale(1)',
                                display: 'flex',
                                alignItems: 'flex-end',
                                justifyContent: 'center',
                            }}>
                                <Image 
                                    src="/icons/Delete.png" 
                                    alt="Delete" 
                                    width={128} 
                                    height={128} 
                                    style={{ 
                                        filter: deleteAreaActive 
                                            ? 'drop-shadow(0 0 64px red) drop-shadow(0 0 32px red)' 
                                            : 'none',
                                        transition: 'filter 0.18s',
                                        objectFit: 'contain',
                                    }} 
                                />
                            </div>
                        </div>
                    )}
                </>,
                document.body
            )}
        </>
    );
}