"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import api from '../../utils/api';
import './UserList.css';

export default function UserList() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null);

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const response = await api.get('/api/user/me');
                if (response.success) {
                    setCurrentUserId(response.user.id);
                }
            } catch (error) {
                console.error('Error fetching current user:', error);
            }
        };

        const fetchUsers = async () => {
            try {
                setLoading(true);
                
                const response = await api.get('/api/search/users/search?query=%');
                if (response.success) {
                    
                    const filteredUsers = response.results.filter(user => user.id !== currentUserId);
                    setUsers(filteredUsers);
                }
            } catch (error) {
                setError('Failed to load users');
                console.error('Error fetching users:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCurrentUser();
        fetchUsers();
    }, [currentUserId]);

    if (loading) {
        return (
            <div className="user-list-container loading">
                <div className="loading-spinner">Loading users...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="user-list-container error">
                <div className="error-message">{error}</div>
            </div>
        );
    }

    return (
        <div className="user-list-container">
            <h2 className="user-list-title">Available Users</h2>
            <div className="user-list">
                {users.map((user) => (
                    <div key={user.id} className="user-item">
                        <div className="user-avatar">
                            <Image
                                src={`/avatars/${user.gender || 'default'}.png`}
                                alt={user.username}
                                width={40}
                                height={40}
                            />
                        </div>
                        <div className="user-info">
                            <div className="user-name">{user.username}</div>
                        </div>
                    </div>
                ))}
                {users.length === 0 && (
                    <div className="no-users">No other users available</div>
                )}
            </div>
        </div>
    );
} 