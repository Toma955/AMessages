import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import * as Sentry from "@sentry/nextjs";
import socketService from '@/services/socketService';
import './EndToEndMessenger.css';

export default function EndToEndMessenger({ chat, onClose, width = '100%', isSingle = false, style = {} }) {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [enterToSend, setEnterToSend] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [typingTimeout, setTypingTimeout] = useState(null);
    const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const windowRef = useRef(null);
    const headerRef = useRef(null);

    useEffect(() => {
        async function fetchMessages() {
            const token = localStorage.getItem('token');
            console.log('🔍 Frontend: Fetching messages for chat.id:', chat.id);
            console.log('🔍 Frontend: Token:', token ? 'Present' : 'Missing');
            console.log('🔍 Frontend: Chat object:', chat);
            
            if (!token) {
                console.error('❌ Frontend: No token found in localStorage');
                return;
            }
            
            try {
                const url = `http://localhost:5000/api/messages/${chat.id}`;
                console.log('🔍 Frontend: Fetching from URL:', url);
                console.log('🔍 Frontend: Authorization header:', `Bearer ${token.substring(0, 20)}...`);
                
                const res = await fetch(url, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                console.log('🔍 Frontend: Response status:', res.status);
                console.log('🔍 Frontend: Response headers:', Object.fromEntries(res.headers.entries()));
                
                const data = await res.json();
                console.log('🔍 Frontend: Response data:', data);
                
                if (data.success && Array.isArray(data.data)) {
                    const msgs = data.data.map(msg => ({
                        id: msg.id,
                        text: msg.message,
                        sender: msg.sender_id === chat.id ? 'them' : 'me',
                        timestamp: msg.sent_at,
                        status: msg.status || 'sent'
                    }));
                    setMessages(msgs);
                    console.log('✅ Frontend: Poruke za chat', chat.id, msgs);
                } else {
                    console.log('❌ Frontend: Invalid response format:', data);
                    if (data.message) {
                        console.log('❌ Frontend: Error message:', data.message);
                    }
                }
            } catch (err) {
                console.error('❌ Frontend: Greška pri dohvaćanju poruka:', err);
                console.error('❌ Frontend: Error details:', {
                    name: err.name,
                    message: err.message,
                    stack: err.stack
                });
            }
        }
        if (chat?.id) fetchMessages();
    }, [chat?.id]);

    // Real-time message handling
    useEffect(() => {
        const handleNewMessage = (event) => {
            const messageData = event.detail;
            if (messageData.sender_id === chat.id) {
                setMessages(prev => [...prev, {
                    id: messageData.id,
                    text: messageData.message,
                    sender: 'them',
                    timestamp: messageData.sent_at,
                    status: 'received'
                }]);
            }
        };

        const handleMessageSent = (event) => {
            const messageData = event.detail;
            if (messageData.receiver_id === chat.id) {
                setMessages(prev => prev.map(msg => 
                    msg.text === messageData.message && msg.sender === 'me' && !msg.id
                        ? { ...msg, id: messageData.id, status: 'sent' }
                        : msg
                ));
            }
        };

        const handleUserTyping = (event) => {
            const typingData = event.detail;
            if (typingData.userId === chat.id) {
                setIsOtherUserTyping(typingData.isTyping);
            }
        };

        const handleMessageRead = (event) => {
            const readData = event.detail;
            setMessages(prev => prev.map(msg => 
                msg.sender === 'me' ? { ...msg, status: 'read' } : msg
            ));
        };

        window.addEventListener('new_message_received', handleNewMessage);
        window.addEventListener('message_sent_confirmation', handleMessageSent);
        window.addEventListener('user_typing', handleUserTyping);
        window.addEventListener('message_read_receipt', handleMessageRead);

        return () => {
            window.removeEventListener('new_message_received', handleNewMessage);
            window.removeEventListener('message_sent_confirmation', handleMessageSent);
            window.removeEventListener('user_typing', handleUserTyping);
            window.removeEventListener('message_read_receipt', handleMessageRead);
        };
    }, [chat.id]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Typing indicator
    useEffect(() => {
        if (typingTimeout) {
            clearTimeout(typingTimeout);
        }

        if (isTyping) {
            socketService.sendTyping(chat.id, true);
            const timeout = setTimeout(() => {
                setIsTyping(false);
                socketService.sendTyping(chat.id, false);
            }, 3000);
            setTypingTimeout(timeout);
        } else {
            socketService.sendTyping(chat.id, false);
        }

        return () => {
            if (typingTimeout) {
                clearTimeout(typingTimeout);
            }
        };
    }, [isTyping, chat.id]);

    // Check connection status
    useEffect(() => {
        const checkConnection = () => {
            const connected = socketService.getConnectionStatus();
            setIsConnected(connected);
        };

        checkConnection();
        const interval = setInterval(checkConnection, 5000); // Check every 5 seconds

        return () => clearInterval(interval);
    }, []);

    // Cleanup drag event listeners
    useEffect(() => {
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    // Drag and drop functionality
    const handleMouseDown = (e) => {
        console.log('🎯 Mouse down on header!', e);
        e.preventDefault();
        e.stopPropagation();
        
        setIsDragging(true);
        
        const rect = windowRef.current.getBoundingClientRect();
        setDragOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
    };

    const handleMouseMove = (e) => {
        if (!isDragging || !windowRef.current) return;
        
        console.log('🔄 Mouse move while dragging!', e);
        
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        
        // Keep within viewport bounds
        const maxX = window.innerWidth - windowRef.current.offsetWidth;
        const maxY = window.innerHeight - windowRef.current.offsetHeight;
        
        const clampedX = Math.max(0, Math.min(newX, maxX));
        const clampedY = Math.max(0, Math.min(newY, maxY));
        
        windowRef.current.style.position = 'fixed';
        windowRef.current.style.left = `${clampedX}px`;
        windowRef.current.style.top = `${clampedY}px`;
        windowRef.current.style.transform = 'none';
    };

    const handleMouseUp = () => {
        console.log('✅ Mouse up - stopping drag!');
        setIsDragging(false);
    };

    // Add global mouse move and up listeners when dragging
    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, dragOffset]);

    const handleHeaderClick = (e) => {
        console.log('🖱️ Header clicked!', e);
    };

    const handleDragStart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
    };

    async function sendMessageToUser(receiverId, message) {
        const token = localStorage.getItem('token');
        const url = 'http://localhost:5000/api/messages/send';
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    receiverId,
                    message
                })
            });
            const data = await res.json();
            Sentry.addBreadcrumb({
                category: 'message',
                message: 'Message sent successfully',
                level: 'info',
                data: {
                    receiverId,
                    messageLength: message.length,
                    responseStatus: res.status
                }
            });
            return data;
        } catch (error) {
            Sentry.captureException(error, {
                tags: {
                    component: 'EndToEndMessenger',
                    action: 'sendMessage'
                },
                extra: {
                    receiverId,
                    messageLength: message.length,
                    url
                }
            });
            throw error;
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;
        
        const messageText = message.trim();
        setMessage('');
        setIsTyping(false);
        
        // Add message to local state immediately for instant feedback
        const tempMessage = {
            id: Date.now(),
            text: messageText,
            sender: 'me',
            timestamp: new Date().toISOString(),
            status: 'sending'
        };
        setMessages(prev => [...prev, tempMessage]);

        try {
            const response = await sendMessageToUser(chat.id, messageText);
            if (response.success) {
                // Update the temporary message with success status
                setMessages(prev => prev.map(msg => 
                    msg.id === tempMessage.id ? { ...msg, status: 'sent' } : msg
                ));
            } else {
                // Update the temporary message with error status
                setMessages(prev => prev.map(msg => 
                    msg.id === tempMessage.id ? { ...msg, status: 'error' } : msg
                ));
                Sentry.captureMessage('Failed to send message', {
                    level: 'error',
                    tags: {
                        component: 'EndToEndMessenger',
                        action: 'handleSubmit'
                    },
                    extra: {
                        response,
                        receiverId: chat.id,
                        messageLength: messageText.length
                    }
                });
                alert('Greška pri slanju poruke!');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            // Update the temporary message with error status
            setMessages(prev => prev.map(msg => 
                msg.id === tempMessage.id ? { ...msg, status: 'error' } : msg
            ));
            alert('Greška pri slanju poruke!');
        }
    };

    const handleClearMessage = () => {
        setMessage('');
    };

    const handleEnterToSendToggle = () => {
        setEnterToSend((prev) => !prev);
        setTimeout(() => {
            inputRef.current?.focus();
        }, 0);
    };

    const handleInputKeyDown = (e) => {
        if (enterToSend && e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const handleInputChange = (e) => {
        setMessage(e.target.value);
        if (!isTyping) {
            setIsTyping(true);
        }
    };

    const getMessageStatusIcon = (status) => {
        switch (status) {
            case 'sending':
                return <span className="message-status sending">⏳</span>;
            case 'sent':
                return <span className="message-status sent">✓</span>;
            case 'received':
                return <span className="message-status received">✓✓</span>;
            case 'read':
                return <span className="message-status read">✓✓</span>;
            case 'error':
                return <span className="message-status error">❌</span>;
            default:
                return null;
        }
    };

    return (
        <div 
            className={`end2end-window ${isDragging ? 'dragging' : ''}`} 
            style={{ ...style }}
            ref={windowRef}
        >
            <div 
                className={`end2end-window-header ${isDragging ? 'dragging' : ''}`}
                onMouseDown={handleMouseDown}
                onClick={handleHeaderClick}
                onDragStart={handleDragStart}
                ref={headerRef}
                draggable={false}
                style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            >
                <div className="end2end-header-center">
                    <Image
                        src={
                            chat.gender === 'male'
                                ? '/icons/Man.png'
                                : '/icons/Woman.png'
                        }
                        alt={chat.username}
                        width={32}
                        height={32}
                        className="end2end-avatar"
                    />
                    <span className="end2end-username">{chat.username}</span>
                    <div className={`connection-status ${!isConnected ? 'disconnected' : ''}`} 
                         title={isConnected ? 'Connected' : 'Disconnected'} />
                    <button className="end2end-close-chat" onClick={onClose}>
                        <Image
                            src="/icons/Close.png"
                            alt="Close chat"
                            width={24}
                            height={24}
                        />
                    </button>
                </div>
            </div>
            <div className="end2end-messages-container">
                {messages.map(msg => (
                    <div
                        key={msg.id}
                        className={`end2end-message ${msg.sender === 'me' ? 'sent' : 'received'}`}
                    >
                        <div className="end2end-message-content">
                            {msg.text}
                        </div>
                        <div className="end2end-message-footer">
                            <div className="end2end-message-timestamp">
                                {new Date(msg.timestamp).toLocaleTimeString()}
                            </div>
                            {msg.sender === 'me' && getMessageStatusIcon(msg.status)}
                        </div>
                    </div>
                ))}
                {isOtherUserTyping && (
                    <div className="end2end-message received">
                        <div className="end2end-message-content typing-indicator">
                            <span className="typing-dot"></span>
                            <span className="typing-dot"></span>
                            <span className="typing-dot"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSubmit} className="end2end-message-input-container">
                <input
                    ref={inputRef}
                    type="text"
                    value={message}
                    onChange={handleInputChange}
                    onKeyDown={handleInputKeyDown}
                    placeholder="Type a message..."
                    className="end2end-message-input"
                />
                <div className="end2end-message-actions">
                    <button
                        type="button"
                        className="end2end-action-button"
                        onClick={handleClearMessage}
                        title="Clear message"
                    >
                        <Image
                            src="/icons/Delete.png"
                            alt="Clear"
                            width={20}
                            height={20}
                        />
                    </button>
                    <button
                        type="submit"
                        className="end2end-send-button"
                        disabled={!message.trim()}
                        title="Send message"
                    >
                        <Image
                            src="/icons/Send.png"
                            alt="Send"
                            width={20}
                            height={20}
                        />
                    </button>
                </div>
            </form>
        </div>
    );
} 