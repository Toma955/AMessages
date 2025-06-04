"use client";

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

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

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        // Add new message to the list
        setMessages(prev => [...prev, {
            id: Date.now(),
            text: message,
            sender: 'me',
            timestamp: new Date().toISOString()
        }]);

        // Clear input
        setMessage('');

        // TODO: Send message to backend
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

            {messages.length > 0 && (
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
            )}
        </div>
    );
} 