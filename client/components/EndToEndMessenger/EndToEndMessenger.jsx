import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import * as Sentry from "@sentry/nextjs";
import './EndToEndMessenger.css';

export default function EndToEndMessenger({ chat, onClose, width = '100%', isSingle = false, style = {} }) {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [enterToSend, setEnterToSend] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

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
        try {
            const response = await sendMessageToUser(chat.id, message);
            if (response.success) {
                setMessages(prev => [...prev, {
                    id: Date.now(),
                    text: message,
                    sender: 'me',
                    timestamp: new Date().toISOString()
                }]);
                setMessage('');
            } else {
                Sentry.captureMessage('Failed to send message', {
                    level: 'error',
                    tags: {
                        component: 'EndToEndMessenger',
                        action: 'handleSubmit'
                    },
                    extra: {
                        response,
                        receiverId: chat.id,
                        messageLength: message.length
                    }
                });
                alert('Greška pri slanju poruke!');
            }
        } catch (error) {
            console.error('Error sending message:', error);
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

    return (
        <div className="end2end-window" style={isSingle ? { height: 'auto', ...style } : { width, ...style }}>
            <div className="end2end-window-header">
                <div className="end2end-user-info">
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
                </div>
                <div className="chat-header-actions">
                    <button
                        className={`end2end-action-button${enterToSend ? ' enter-to-send-active' : ''}`}
                        title="Press Enter to send"
                        onClick={handleEnterToSendToggle}
                        type="button"
                    >
                        <Image
                            src="/icons/Enter.png"
                            alt="Enter to send"
                            width={20}
                            height={20}
                        />
                    </button>
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
                        <div className="end2end-message-timestamp">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSubmit} className="end2end-message-input-container">
                <input
                    ref={inputRef}
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
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