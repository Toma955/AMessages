"use client";

import Image from 'next/image';
import { useState } from 'react';

export default function ChatListItem({ chat, onDelete, onChat, onInfo }) {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragStart = (e) => {
        setIsDragging(true);
        e.dataTransfer.setData('text/plain', JSON.stringify(chat));
        e.dataTransfer.effectAllowed = 'move';
        
        // Create a custom drag preview using a regular img element
        try {
            const img = new Image();
            img.src = chat.avatar;
            img.width = 64;
            img.height = 64;
            img.style.borderRadius = '50%';
            img.style.objectFit = 'cover';
            
            // Wait for the image to load before setting it as drag preview
            img.onload = () => {
                if (e.dataTransfer.setDragImage) {
                    e.dataTransfer.setDragImage(img, 32, 32);
                }
            };
        } catch (err) {
            console.log('Drag preview not supported');
        }
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    return (
        <div 
            className={`chat-list-item ${isDragging ? 'dragging' : ''}`}
            draggable="true"
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="chat-list-content">
                <div className="chat-list-avatar">
                    <Image
                        src={
                            chat.gender === 'male'
                                ? '/icons/Man.png'
                                : '/icons/Woman.png'
                        }
                        alt={chat.username}
                        width={64}
                        height={64}
                    />
                </div>
                <div className="chat-list-info">
                    <div className="chat-list-username">{chat.username}</div>
                    <div className="chat-list-actions">
                        <button 
                            className="action-button delete-button"
                            onClick={() => onDelete(chat)}
                            title="Delete"
                        >
                            <Image
                                src="/icons/Delete.png"
                                alt="Delete"
                                width={24}
                                height={24}
                            />
                        </button>
                        <button 
                            className="action-button chat-button"
                            onClick={() => onChat(chat)}
                            title="Chat"
                        >
                            <Image
                                src="/icons/Chat.png"
                                alt="Chat"
                                width={24}
                                height={24}
                            />
                        </button>
                        <button 
                            className="action-button info-button"
                            onClick={() => onInfo(chat)}
                            title="Info"
                        >
                            <Image
                                src="/icons/Info.png"
                                alt="Info"
                                width={24}
                                height={24}
                            />
                        </button>
                    </div>
                </div>
                <div className="chat-list-messages">
                    <Image
                        src="/icons/Messages.png"
                        alt="Messages"
                        width={20}
                        height={20}
                    />
                    <span className="message-count">0</span>
                </div>
            </div>
        </div>
    );
} 