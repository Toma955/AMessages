"use client";

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import * as Sentry from "@sentry/nextjs";
import './ChatWindow.css';

export default function ChatWindow({ chat, onClose, width = '100%' }) {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Funkcija za slanje poruke na backend
    async function sendMessageToUser(receiverId, message) {
        const token = localStorage.getItem('token');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://amessages.onrender.com';
        const url = `${apiUrl}/api/messages/send`;
        
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
            
            // Track successful message sending
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
            // Capture error in Sentry
            Sentry.captureException(error, {
                tags: {
                    component: 'ChatWindow',
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
            // Pošalji poruku na backend
            const response = await sendMessageToUser(chat.id, message);
            if (response.success) {
                // Dodaj novu poruku u lokalni state
                setMessages(prev => [...prev, {
                    id: Date.now(),
                    text: message,
                    sender: 'me',
                    timestamp: new Date().toISOString()
                }]);
                setMessage('');
            } else {
                // Track failed message sending
                Sentry.captureMessage('Failed to send message', {
                    level: 'error',
                    tags: {
                        component: 'ChatWindow',
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

    return (
        <div className="chat-window" style={{ width }}>
            <div className="chat-window-header">
                <div className="chat-user-info">
                    <Image
                        src={chat.avatar}
                        alt={chat.username}
                        width={32}
                        height={32}
                        className="chat-avatar"
                    />
                    <span className="chat-username">{chat.username}</span>
                </div>
                <div className="chat-header-actions">
                    <button className="action-button" title="Press Enter to send">
                        <Image
                            src="/icons/Enter.png"
                            alt="Enter to send"
                            width={20}
                            height={20}
                        />
                    </button>
                    <button className="close-chat" onClick={onClose}>
                        <Image
                            src="/icons/Close.png"
                            alt="Close chat"
                            width={24}
                            height={24}
                        />
                    </button>
                </div>
            </div>
            
            <div className="messages-container">
                {messages.map(msg => (
                    <div 
                        key={msg.id} 
                        className={`message ${msg.sender === 'me' ? 'sent' : 'received'}`}
                    >
                        <div className="message-content">
                            {msg.text}
                        </div>
                        <div className="message-timestamp">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="message-input-container">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="message-input"
                />
                <div className="message-actions">
                    <button 
                        type="button" 
                        className="action-button"
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
                        className="send-button"
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