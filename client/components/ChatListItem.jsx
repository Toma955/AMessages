"use client";

import Image from 'next/image';

export default function ChatListItem({ chat, onDelete, onChat, onInfo }) {
    return (
        <div className="chat-list-item">
            <div className="chat-list-content">
                <div className="chat-list-avatar">
                    <Image
                        src={chat.avatar}
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
                        src="/icons/Message.png"
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