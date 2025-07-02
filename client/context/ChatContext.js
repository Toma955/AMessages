"use client";
import { createContext, useContext, useState, useRef, useCallback } from 'react';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [activeChats, setActiveChats] = useState([]);
    const [chatWidths, setChatWidths] = useState({});
    const [dragOverIndex, setDragOverIndex] = useState(null);
    const [isResizing, setIsResizing] = useState(false);
    const [isSwapping, setIsSwapping] = useState(false);
    const [isDraggingResize, setIsDraggingResize] = useState(false);
    const [hoveredChatId, setHoveredChatId] = useState(null);
    const [draggedChatId, setDraggedChatId] = useState(null);
    const [removingChatId, setRemovingChatId] = useState(null);
    const [controlsLeft, setControlsLeft] = useState('50%');

    
    const resizeStartX = useRef(null);
    const initialWidth = useRef(null);
    const dragStartX = useRef(null);
    const initialWidths = useRef(null);
    const lastChatWidths = useRef({});

    // Chat funkcije
    const handleAddChat = useCallback(async (user) => {
        const chat = {
            id: user.id,
            username: user.username,
            avatar: `/avatars/${user.gender || 'default'}.png`
        };

        // API call za dodavanje u userlist
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
    }, [chats, activeChats]);

    const handleCloseChat = useCallback((chatId) => {
        setActiveChats(prev => {
            const newChats = prev.filter(chat => chat.id !== chatId);
            if (newChats.length === 1) {
                setChatWidths({
                    [newChats[0].id]: '100%'
                });
            }
            return newChats;
        });
    }, []);

    const handleChatClick = useCallback((chat) => {
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
    }, [activeChats]);

    const handleChatResize = useCallback((chatId, newWidth) => {
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
    }, [activeChats]);

    const handleSwapChats = useCallback(() => {
        if (activeChats.length !== 2) return;
        
        const [first, second] = activeChats;
        const firstWidth = chatWidths[first.id];
        const secondWidth = chatWidths[second.id];
        
        setActiveChats([second, first]);
        
        setChatWidths({
            [second.id]: firstWidth,
            [first.id]: secondWidth
        });
    }, [activeChats, chatWidths]);

    const handleSlideLeft = useCallback(() => {
        if (activeChats.length !== 2) return;
        const [first] = activeChats;
        handleCloseChat(first.id);
    }, [activeChats, handleCloseChat]);

    const handleSlideRight = useCallback(() => {
        if (activeChats.length !== 2) return;
        const [, second] = activeChats;
        handleCloseChat(second.id);
    }, [activeChats, handleCloseChat]);

    const handleDragOver = useCallback((e) => {
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
                // Ovo će biti handleovano u parent komponenti
                // setDeleteAreaActive(true);
            } else {
                // setDeleteAreaActive(false);
            }
        }
    }, []);

    const handleDrop = useCallback((e) => {
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
    }, [chats]);

    const handleChatDrop = useCallback((e) => {
        e.preventDefault();
        const deleteArea = document.getElementById('delete-area');
        if (deleteArea) {
            const deleteRect = deleteArea.getBoundingClientRect();
            if (e.clientY > deleteRect.top) {
                // Delete chat
                try {
                    const data = e.dataTransfer.getData('text/plain');
                    let droppedChat = JSON.parse(data);
                    setChats(prevChats => prevChats.filter(c => c.id !== droppedChat.id));
                    setActiveChats(prev => prev.filter(c => c.id !== droppedChat.id));
                } catch {}
                // setShowDeleteArea(false);
                // setDeleteAreaActive(false);
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
        // setShowDeleteArea(false);
        // setDeleteAreaActive(false);
    }, [activeChats]);

    const handleResizeStart = useCallback((e) => {
        if (activeChats.length !== 2) return;
        
        dragStartX.current = e.clientX;
        setIsDraggingResize(true);
        
        const handleMouseMove = (e) => {
            if (!isDraggingResize) return;
            
            const deltaX = e.clientX - dragStartX.current;
            const containerWidth = e.target.closest('.active-chats-container').offsetWidth;
            const percentageChange = (deltaX / containerWidth) * 100;
            
            const [first, second] = activeChats;
            const firstWidth = parseInt(chatWidths[first.id]) || 50;
            const newFirstWidth = Math.max(30, Math.min(70, firstWidth + percentageChange));
            const newSecondWidth = 100 - newFirstWidth;
            
            setChatWidths({
                [first.id]: `${newFirstWidth}%`,
                [second.id]: `${newSecondWidth}%`
            });
            
            dragStartX.current = e.clientX;
        };
        
        const handleMouseUp = () => {
            setIsDraggingResize(false);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }, [activeChats, chatWidths, isDraggingResize]);

    const handleDragRemoveChat = useCallback((chat) => {
        setDraggedChatId(chat.id);
    }, []);

    const handleDragRestoreChat = useCallback(() => {
        setDraggedChatId(null);
    }, []);

    const handleRemoveChat = useCallback((chat) => {
        setRemovingChatId(chat.id);
    }, []);

    const handleRemoveAnimationEnd = useCallback((chatId) => {
        if (removingChatId === chatId) {
            setChats(prevChats => prevChats.filter(c => c.id !== chatId));
            setActiveChats(prev => prev.filter(c => c.id !== chatId));
            setRemovingChatId(null);
        }
    }, [removingChatId]);

    const updateControlsLeft = useCallback(() => {
        if (activeChats.length === 2) {
            const firstChat = document.querySelector(`[data-chat-id="${activeChats[0].id}"]`);
            if (firstChat) {
                const rect = firstChat.getBoundingClientRect();
                const containerRect = firstChat.closest('.active-chats-container').getBoundingClientRect();
                const relativeLeft = rect.right - containerRect.left;
                setControlsLeft(`${relativeLeft}px`);
            }
        }
    }, [activeChats]);

    const handleInfoClick = useCallback((chat) => {
        console.log('Show info for:', chat);
    }, []);

    const handleDeleteChat = useCallback((chat) => {
        setChats(prevChats => prevChats.filter(c => c.id !== chat.id));
    }, []);

    const handleDeleteAnimationEnd = useCallback(() => {
        // This function is called when delete animation ends
        // It can be used to reset delete area state
    }, []);

    const value = {
        // State
        chats,
        selectedChat,
        activeChats,
        chatWidths,
        dragOverIndex,
        isResizing,
        isSwapping,
        isDraggingResize,
        hoveredChatId,
        draggedChatId,
        removingChatId,
        controlsLeft,
        
        // Refs
        resizeStartX,
        initialWidth,
        dragStartX,
        initialWidths,
        lastChatWidths,
        
        // Setters
        setChats,
        setSelectedChat,
        setActiveChats,
        setChatWidths,
        setDragOverIndex,
        setIsResizing,
        setIsSwapping,
        setIsDraggingResize,
        setHoveredChatId,
        setDraggedChatId,
        setRemovingChatId,
        setControlsLeft,
        
        // Functions
        handleAddChat,
        handleCloseChat,
        handleChatClick,
        handleChatResize,
        handleSwapChats,
        handleSlideLeft,
        handleSlideRight,
        handleDragOver,
        handleDrop,
        handleChatDrop,
        handleResizeStart,
        handleDragRemoveChat,
        handleDragRestoreChat,
        handleRemoveChat,
        handleRemoveAnimationEnd,
        updateControlsLeft,
        handleInfoClick,
        handleDeleteChat,
        handleDeleteAnimationEnd,
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChatContext = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChatContext must be used within ChatProvider');
    }
    return context;
}; 