"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import './GrupChat.css';
import groupService from '../../services/groupService';
import { useSocket } from '../../hooks/useSocket';

const GrupChat = ({ onClose, groupName = "Group Chat", isAdmin = false, currentUser = {}, style = {}, isSingle = true, groupId = null }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [participants, setParticipants] = useState([
        { id: 1, username: currentUser.username || 'You', avatar: '/icons/Man.png', isAdmin: true }
    ]);
    const [showParticipants, setShowParticipants] = useState(false);
    const [editingGroupName, setEditingGroupName] = useState(false);
    const [groupNameInput, setGroupNameInput] = useState(groupName);
    const [showAddUser, setShowAddUser] = useState(false);
    const [newUserInput, setNewUserInput] = useState('');
    const [isDragOver, setIsDragOver] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    const containerRef = useRef(null);
    const socket = useSocket();

    const handleSendMessage = async () => {
        if (newMessage.trim() && groupId) {
            setIsLoading(true);
            try {
                const response = await groupService.sendGroupMessage(groupId, newMessage.trim());
                if (response.success) {
                    const message = {
                        id: Date.now(),
                        text: newMessage.trim(),
                        sender: currentUser.username || 'You',
                        timestamp: new Date().toLocaleTimeString(),
                        avatar: currentUser.gender === 'female' ? '/icons/Woman.png' : '/icons/Man.png'
                    };
                    setMessages(prev => [...prev, message]);
                    setNewMessage('');
                }
            } catch (error) {
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleRemoveUser = (userId) => {
        if (isAdmin) {
            const removedUser = participants.find(p => p.id === userId);
            setParticipants(participants.filter(p => p.id !== userId));
            
            // Show system message
            const message = {
                id: Date.now(),
                text: `${removedUser.username} has been removed from the group`,
                sender: 'System',
                timestamp: new Date().toLocaleTimeString(),
                avatar: '/icons/grup.png',
                isSystemMessage: true
            };
            setMessages([...messages, message]);
        }
    };

    const handleAddUser = () => {
        if (newUserInput.trim() && isAdmin) {
            const newUser = {
                id: Date.now(),
                username: newUserInput,
                avatar: '/icons/Man.png',
                isAdmin: false
            };
            setParticipants([...participants, newUser]);
            setNewUserInput('');
            setShowAddUser(false);
            
            // Show system message
            const message = {
                id: Date.now(),
                text: `${newUserInput} has been added to the group`,
                sender: 'System',
                timestamp: new Date().toLocaleTimeString(),
                avatar: '/icons/grup.png',
                isSystemMessage: true
            };
            setMessages([...messages, message]);
        }
    };

    const handleSaveGroupName = () => {
        if (groupNameInput.trim() && isAdmin) {
            setEditingGroupName(false);
        }
    };

    // Drag and drop functionality for adding users
    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        if (!containerRef.current.contains(e.relatedTarget)) {
            setIsDragOver(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        
        
        try {
            const droppedData = e.dataTransfer.getData('text/plain');
            const userData = JSON.parse(droppedData);
            
            // Check if user is already in the group
            const isAlreadyInGroup = participants.some(p => p.id === userData.id);
            
            if (!isAlreadyInGroup && isAdmin) {
                const newUser = {
                    id: userData.id,
                    username: userData.username,
                    avatar: userData.gender === 'female' ? '/icons/Woman.png' : '/icons/Man.png',
                    isAdmin: false
                };
                setParticipants(prev => [...prev, newUser]);
                
                // Show success message
                const message = {
                    id: Date.now(),
                    text: `${userData.username} has been added to the group`,
                    sender: 'System',
                    timestamp: new Date().toLocaleTimeString(),
                    avatar: '/icons/grup.png',
                    isSystemMessage: true
                };
                setMessages(prev => [...prev, message]);
            } else if (isAlreadyInGroup) {
                // Show already in group message
                const message = {
                    id: Date.now(),
                    text: `${userData.username} is already in the group`,
                    sender: 'System',
                    timestamp: new Date().toLocaleTimeString(),
                    avatar: '/icons/grup.png',
                    isSystemMessage: true
                };
                setMessages(prev => [...prev, message]);
            }
        } catch (error) {
        }
    };

    // Load group messages on mount
    useEffect(() => {
        if (groupId) {
            const loadMessages = async () => {
                try {
                    const response = await groupService.getGroupMessages(groupId);
                    if (response.success && response.messages) {
                        const formattedMessages = response.messages.map(msg => {
                            // Dohvati username pošiljatelja
                            const senderName = msg.sender_id === currentUser.id ? 'You' : `User ${msg.sender_id}`;
                            return {
                                id: msg.id,
                                text: msg.message,
                                sender: senderName,
                                timestamp: new Date(msg.sent_at).toLocaleTimeString(),
                                avatar: '/icons/Man.png' // Default avatar
                            };
                        });
                        setMessages(formattedMessages);
                    }
                } catch (error) {
                    // For now, just set empty messages to avoid errors
                    setMessages([]);
                }
            };
            loadMessages();
        }
    }, [groupId]);

    // Socket.IO real-time group messages
    useEffect(() => {
        if (groupId) {
            // Join group room
            socket?.joinGroup?.(groupId);

            // Listen for new group messages
            const handleGroupMessage = (data) => {
                if (data.groupId === groupId) {
                    const message = {
                        id: Date.now(),
                        text: data.message,
                        sender: data.senderName,
                        timestamp: new Date(data.timestamp).toLocaleTimeString(),
                        avatar: '/icons/Man.png'
                    };
                    setMessages(prev => [...prev, message]);
                }
            };

            const cleanup = socket?.onMessage?.(handleGroupMessage);

            return () => {
                cleanup?.();
                socket?.leaveGroup?.(groupId);
            };
        }
    }, [socket, groupId]);

    
    return (
        <div 
            ref={containerRef}
            className={`grup-chat-container ${isSingle ? 'single-chat' : ''} ${isDragOver ? 'drag-over' : ''}`}
            style={{
                ...style,
                position: 'relative',
                width: '100%',
                height: '100%'
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div className="grup-chat-header">
                <div className="grup-chat-title">
                    <Image
                        src="/icons/grup.png"
                        alt="Group"
                        width={24}
                        height={24}
                    />
                    {editingGroupName ? (
                        <div className="group-name-edit">
                            <input
                                type="text"
                                value={groupNameInput}
                                onChange={(e) => setGroupNameInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSaveGroupName()}
                                onBlur={handleSaveGroupName}
                                autoFocus
                            />
                        </div>
                    ) : (
                        <span 
                            onClick={() => isAdmin && setEditingGroupName(true)}
                            className={isAdmin ? 'editable-group-name' : ''}
                        >
                            {groupNameInput}
                        </span>
                    )}
                    {isAdmin && (
                        <button 
                            className="grup-chat-admin-btn"
                            onClick={() => setShowParticipants(!showParticipants)}
                            title="Manage participants"
                        >
                            👥
                        </button>
                    )}
                </div>
                <button className="grup-chat-close" onClick={onClose}>
                    ✕
                </button>
            </div>
            
            {showParticipants && isAdmin && (
                <div className="grup-chat-participants">
                    <div className="participants-header">
                        <h3>Participants ({participants.length})</h3>
                        <button 
                            className="add-user-btn"
                            onClick={() => setShowAddUser(true)}
                        >
                            + Add User
                        </button>
                    </div>
                    
                    {showAddUser && (
                        <div className="add-user-form">
                            <input
                                type="text"
                                placeholder="Enter username"
                                value={newUserInput}
                                onChange={(e) => setNewUserInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddUser()}
                            />
                            <button onClick={handleAddUser}>Add</button>
                            <button onClick={() => setShowAddUser(false)}>Cancel</button>
                        </div>
                    )}
                    
                    <div className="participants-list">
                        {participants.map((participant) => (
                            <div key={participant.id} className="participant-item">
                                <div className="participant-avatar">
                                    <Image
                                        src={participant.avatar}
                                        alt={participant.username}
                                        width={32}
                                        height={32}
                                    />
                                </div>
                                <div className="participant-info">
                                    <span className="participant-name">
                                        {participant.username}
                                        {participant.isAdmin && <span className="admin-badge">👑</span>}
                                    </span>
                                </div>
                                {isAdmin && !participant.isAdmin && (
                                    <button 
                                        className="remove-user-btn"
                                        onClick={() => handleRemoveUser(participant.id)}
                                        title="Remove user"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            <div className="grup-chat-messages">
                {messages.length === 0 ? (
                    <div className="grup-chat-empty">
                        <Image
                            src="/icons/grup.png"
                            alt="Group"
                            width={64}
                            height={64}
                        />
                        <p>No messages yet. Start the conversation!</p>
                        {isAdmin && (
                            <p className="drag-hint">💡 Drag users from the list to add them to the group</p>
                        )}
                    </div>
                ) : (
                    messages.map((message) => (
                        <div key={message.id} className={`grup-message ${message.isSystemMessage ? 'system-message' : ''}`}>
                            <div className="grup-message-avatar">
                                <Image
                                    src={message.avatar}
                                    alt={message.sender}
                                    width={32}
                                    height={32}
                                />
                            </div>
                            <div className="grup-message-content">
                                <div className="grup-message-sender">{message.sender}</div>
                                <div className="grup-message-text">{message.text}</div>
                                <div className="grup-message-time">{message.timestamp}</div>
                            </div>
                        </div>
                    ))
                )}
            </div>
            
            <div className="grup-chat-input">
                <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    rows={1}
                />
                <button onClick={handleSendMessage} disabled={!newMessage.trim() || isLoading}>
                    {isLoading ? (
                        <div className="loading-spinner"></div>
                    ) : (
                        <Image
                            src="/icons/Send.png"
                            alt="Send"
                            width={20}
                            height={20}
                        />
                    )}
                </button>
            </div>
        </div>
    );
};

export default GrupChat; 