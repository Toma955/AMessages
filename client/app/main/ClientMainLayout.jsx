"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback, memo, lazy, Suspense } from "react";
import Image from 'next/image';
import { useRouter } from "next/navigation";
import CanvasBackground from "@/components/CanvasBackground/CanvasBackground";
import RecordPlayer from "@/components/RecordPlayer/RecordPlayer.jsx";
import RadioPlayer from "@/components/RadioPlayer/RadioPlayer.jsx";
import PianoWidget from "@/components/PianoWidget/PianoWidget.jsx";
import RadioStationsList from "@/components/RadioPlayer/RadioStationsList.jsx";
import LogoutModal from '@/components/LogoutModal/LogoutModal.jsx';
import ChatListItem from '@/components/ChatList/ChatListItem';
import ChatWindow from '@/components/ChatWindow/ChatWindow';
import SettingsWidget from "@/components/SettingsWidget/SettingsWidget";
import RadioListWidget from '@/components/RadioPlayer/RadioListWidget';
import socketService from "@/services/socketService";
import "@/app/styles/main.css";
import EndToEndMessenger from '@/components/EndToEndMessenger/EndToEndMessenger';
import { createPortal } from 'react-dom';
import DocumentReader from "@/components/DocumentReader/DocumentReader";
import Preloader from '@/components/Preloader/Preloader';

// Lazy loaded components - only for heavy components
const SearchWidget = lazy(() => import('@/components/SearchWidget/SearchWidget.jsx'));
const SettingsDashboard = lazy(() => import("@/components/SettingsWidget/SettingsDashboard"));

// Custom hooks
import { useChat } from "@/hooks/useChat";
import { useTheme } from "@/hooks/useTheme";
import { useMedia } from "@/hooks/useMedia";



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

function ClientMainLayout({ children }) {
    // Custom hooks
    const {
        chats, setChats, selectedChat, setSelectedChat, activeChats, setActiveChats,
        chatWidths, setChatWidths, isResizing, setIsResizing, isSwapping, setIsSwapping,
        dragOverIndex, setDragOverIndex, hoveredChatId, setHoveredChatId,
        draggedChatId, setDraggedChatId, removingChatId, setRemovingChatId,
        handleAddChat, handleCloseChat, handleChatResize, handleChatClick,
        handleInfoClick, handleDeleteChat, handleSwapChats, handleSlideLeft,
        handleSlideRight, handleResizeStart, handleDragOver, handleDrop,
        handleChatDrop, handleDragRemoveChat, handleDragRestoreChat,
        handleRemoveChat, handleRemoveAnimationEnd, handleDeleteAnimationEnd,
        lastChatWidths, resizeStartX, initialWidth,
        isDraggingResize, setIsDraggingResize, dragStartX, initialWidths,
        isHoveringResize, setIsHoveringResize, controlsLeft, setControlsLeft
    } = useChat();

    const {
        currentIcons, setCurrentIcons, isThemeView, setIsThemeView, isMixerView, setIsMixerView,
        mixerSettings, setMixerSettings, selectedTheme, setSelectedTheme, currentTheme, setCurrentTheme,
        highlightStyle, setHighlightStyle, isTransitioning, setIsTransitioning,
        updateHighlightPosition, handleIconTransition, handleThemeClick, handleThemeDoubleClick,
        handleMixerControlChange, themeIcons, detailsPanelRef
    } = useTheme();

    const {
        isRecordPlayerVisible, isRadioPlayerVisible, isPianoVisible, isPianoActive,
        radioStations, currentStation, songs, currentSong, setCurrentSong, isSongListLoading, isSongListActive,
        playerVolume, songListError, activePanel, panelAnimation, radioPlayerRef,
        setIsRecordPlayerVisible, setIsRadioPlayerVisible, setIsPianoVisible,
        handleRecordPlayerMenuClick, handleSongSelect, handleStationSelect, handlePianoActivate,
        switchPanel, toggleRecordPlayer, toggleRadioPlayer, togglePiano, setVolume
    } = useMedia();

    // Local state (not moved to contexts yet)
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [isSettingsVisible, setIsSettingsVisible] = useState(false);
    const [isDashboardInPanelVisible, setIsDashboardInPanelVisible] = useState(false);
    const [prevMixerValues, setPrevMixerValues] = useState({});
    const [currentUser, setCurrentUser] = useState({ username: '', gender: 'default' });
    const [isRadioListVisible, setIsRadioListVisible] = useState(false);
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
    const [isDocumentOpen, setIsDocumentOpen] = useState(false);
    const [isAiChatOpen, setIsAiChatOpen] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    // Refs
    const router = useRouter();

    // Memoized computed values - must be called before useEffect hooks
    const contactsPanelClass = useMemo(() => {
        return `contacts-panel panel-border ${
            isRecordPlayerVisible || isRadioPlayerVisible || isPianoVisible || isDashboardInPanelVisible || isSettingsVisible ? 'panel-shrink' : ''
        } ${isRadioListVisible ? 'radio-list-active' : ''} ${isPianoActive ? 'piano-active' : ''}`;
    }, [isRecordPlayerVisible, isRadioPlayerVisible, isPianoVisible, isDashboardInPanelVisible, isSettingsVisible, isRadioListVisible, isPianoActive]);

    const contentContainerClass = useMemo(() => {
        return `content-container${activeChats.length === 1 ? ' single-chat' : ''}`;
    }, [activeChats.length]);

    const activeChatsContainerStyle = useMemo(() => ({
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        gap: activeChats.length > 1 ? '2%' : 0,
        paddingLeft: activeChats.length > 1 ? '0.5%' : 0,
        paddingRight: activeChats.length > 1 ? '0.5%' : 0,
        position: 'relative',
    }), [activeChats.length]);

    const userAvatar = useMemo(() => {
        return currentUser.id ? `/api/users/${currentUser.id}/profile-picture` : (currentUser.gender === 'woman' ? '/icons/Woman.png' : '/icons/Man.png');
    }, [currentUser.id, currentUser.gender]);

    // Prefetch routes
    useEffect(() => {
        async function preload() {
            // Prefetch rute
            router.prefetch('/login');
            router.prefetch('/admin');
            router.prefetch('/preloader');
            // Dinamički importi glavnih komponenti
            await Promise.all([
                import('@/components/SearchWidget/SearchWidget.jsx'),
                import('@/components/SettingsWidget/SettingsDashboard.jsx'),
                import('@/components/ChatWindow/ChatWindow.jsx'),
                import('@/components/ChatList/ChatListItem.jsx'),
                import('@/components/EndToEndMessenger/EndToEndMessenger.jsx'),
                import('@/components/RadioPlayer/RadioPlayer.jsx'),
                import('@/components/RecordPlayer/RecordPlayer.jsx'),
                import('@/components/PianoWidget/PianoWidget.jsx'),
                import('@/components/SettingsWidget/SettingsWidget.jsx'),
                import('@/components/LogoutModal/LogoutModal.jsx'),
                import('@/components/DocumentReader/DocumentReader.jsx'),
                import('@/components/RadioPlayer/RadioListWidget.jsx'),
            ]);
            setIsLoaded(true);
        }
        preload();
    }, [router]);

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

    const handleLogout = useCallback(async () => {
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
    }, [router]);

    const handleIconClick = (name, event) => {
        const additionalHandlers = {
            "Shutdown": () => setIsLogoutModalOpen(true),
            "Record": () => {
                setIsRecordPlayerVisible(!isRecordPlayerVisible);
                setIsRadioPlayerVisible(false);
                setIsPianoVisible(false);
                switchPanel('record');
                if (radioPlayerRef.current && radioPlayerRef.current.pause) {
                    radioPlayerRef.current.pause();
                }
            },
            "Radio": () => {
                setIsRadioPlayerVisible(!isRadioPlayerVisible);
                setIsRecordPlayerVisible(false);
                setIsPianoVisible(false);
                switchPanel('radio');
                const audio = document.querySelector('audio');
                if (audio) audio.pause();
            },
            "Piano": () => setIsPianoVisible(!isPianoVisible),
            "Magnifying_glass": () => {
                setShowSearch(true);
                event.currentTarget.classList.toggle('active-icon');
            },
            "Cogwheel": () => {
                const isClosing = isSettingsVisible;
                setIsSettingsVisible(!isSettingsVisible);
                if (isClosing) {
                    setIsDashboardInPanelVisible(false);
                }
            }
        };
        
        handleThemeClick(name, event, additionalHandlers);
    };

    const handleDoubleClick = useCallback((name, event) => {
        handleThemeDoubleClick(name, event);
    }, [handleThemeDoubleClick]);

    const handleSearchClick = useCallback(() => {
        setShowSearch(true);
    }, [setShowSearch]);

    const handleCloseSearch = useCallback(() => {
        setShowSearch(false);
        const searchIcon = detailsPanelRef.current?.querySelector('[data-name="Magnifying_glass"]');
        if (searchIcon) {
            searchIcon.classList.remove('active-icon');
        }
    }, [setShowSearch, detailsPanelRef]);

    // handleAddChat moved to useChat hook

    // handleDragOver, handleDrop, handleChatDrop, handleCloseChat, handleChatResize, handleChatClick moved to useChat hook

    // handleInfoClick, handleDeleteChat, handleSwapChats, handleSlideLeft, handleSlideRight, handleResizeStart moved to useChat hook

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

    const handleMenuClick = useCallback(() => {
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
    }, [panelState, setContactsAnim, setRadioAnim, setPanelState]);



    // handleRecordPlayerMenuClick, handleSongSelect, switchPanel, updateControlsLeft moved to useMedia/useChat hook

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

    const renderMixerControls = useCallback(() => {
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
    }, [mixerSettings, handleMixerControlChange]);

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
    }, [isHoveringResize, activeChats, setIsHoveringResize, setChatWidths, lastChatWidths]);

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

    if (!isLoaded) {
        return <Preloader isLoaded={isLoaded} />;
    }

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
                    avatar={userAvatar}
                    gender={currentUser.gender}
                    onAvatarClick={() => {
                        setIsDashboardInPanelVisible(!isDashboardInPanelVisible);
                    }}
                    onOpenAiChat={() => setIsAiChatOpen(true)}
                />
                <div className={contentContainerClass}>
                    <div 
                        className={contactsPanelClass}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    >
                        <div className="panel-content">
                            {isDashboardInPanelVisible ? (
                                <Suspense fallback={<div className="loading-spinner">Loading Dashboard...</div>}>
                                    <SettingsDashboard 
                                        avatar={userAvatar}
                                        gender={currentUser.gender}
                                        onOpenDocument={() => setIsDocumentOpen(true)}
                                        onOpenAiChat={() => setIsAiChatOpen(true)}
                                    />
                                </Suspense>
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
                                            <div className={`song-list${activePanel === 'radio' ? ' radio-bg-panel' : ''}`}> 
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
                                                                className={song === currentSong ? 'frosted-song-list-item' : ''}
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
                            style={activeChatsContainerStyle}
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
                    <Suspense fallback={<div className="loading-spinner">Loading Search...</div>}>
                        <SearchWidget onClose={handleCloseSearch} onAddChat={handleAddChat} />
                    </Suspense>
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

export default ClientMainLayout;