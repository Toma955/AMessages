"use client";

import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function ChatListItem({ chat, onDelete, onChat, onInfo, onDragRemove, onDragRestore, removing, onRemoveAnimationEnd, onRemove }) {
    const [isDragging, setIsDragging] = useState(false);

    // Debug: ispiši chat JSON samo pri prvom mountanju komponente
    useEffect(() => {
        console.log('ChatListItem chat JSON:', JSON.stringify(chat));
    }, []);

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
            className={`chat-list-item${isDragging ? ' dragging' : ''}${removing ? ' removing' : ''}`}
            draggable="true"
            onDragStart={e => { handleDragStart(e); onDragRemove && onDragRemove(); }}
            onDragEnd={e => { handleDragEnd(e); onDragRestore && onDragRestore(); }}
            onTransitionEnd={removing ? onRemoveAnimationEnd : undefined}
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
                            className="unread-bubble"
                            onClick={() => onChat(chat)}
                            title="Otvori chat"
                        >
                            {chat.unread_messages ?? 0}
                        </button>
                        {/*
                        <button onClick={() => onRemove && onRemove()} title="Remove chat" style={{marginLeft: 8}}>
                            🗑️
                        </button>
                        */}
                    </div>
                </div>
            </div>
        </div>
    );
} 