import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import api from '../../services/api';
import './SearchWidget.css';

export default function SearchWidget({ onClose, onAddChat }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const searchRef = useRef(null);

    // Handle click outside to close the widget
    useEffect(() => {
        function handleClickOutside(event) {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                onClose();
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    // Handle search with debounce
    useEffect(() => {
        const debounceTimeout = setTimeout(async () => {
            if (searchQuery.length >= 2) {
                setIsLoading(true);
                try {
                    // Check if user is authenticated
                    const token = localStorage.getItem('token');
                    if (!token) {
                        setError('Please log in to search users');
                        setSearchResults([]);
                        return;
                    }
                    
                    setError(null);
                    const response = await api.get(`/api/search/users/search?query=${encodeURIComponent(searchQuery)}`);
                    if (response.success) {
                        setSearchResults(response.results);
                    }
                } catch (error) {
                    console.error('Search error:', error);
                    setError('Failed to search users. Please try again.');
                    setSearchResults([]);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setSearchResults([]);
            }
        }, 300); // 300ms debounce

        return () => clearTimeout(debounceTimeout);
    }, [searchQuery]);

    const handleUserClick = (user) => {
        if (onAddChat) {
            onAddChat(user);
            onClose();
        }
    };

    const handleChatClick = (e, user) => {
        e.stopPropagation(); // Prevent triggering handleUserClick
        if (onAddChat) {
            onAddChat(user);
            onClose();
        }
    };

    const handleInfoClick = (e, user) => {
        e.stopPropagation(); // Prevent triggering handleUserClick
        // TODO: Implement user info view
    };

    return (
        <div className="search-widget-overlay">
            <div className="search-widget" ref={searchRef}>
                <div className="search-header">
                    <div className="search-input-container">
                        <Image
                            src="/icons/Magnifying_glass.png"
                            alt="Search"
                            width={20}
                            height={20}
                        />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                            className="search-input"
                        />
                    </div>
                    <button className="close-button" onClick={onClose}>
                        <Image
                            src="/icons/Arrow.png"
                            alt="Close"
                            width={24}
                            height={24}
                        />
                    </button>
                </div>

                <div className="search-results">
                    {error ? (
                        <div className="search-error">{error}</div>
                    ) : isLoading ? (
                        <div className="search-loading">Searching...</div>
                    ) : searchResults.length > 0 ? (
                        searchResults.map((user) => (
                            <div 
                                key={user.id} 
                                className="search-result-item"
                                onClick={() => handleUserClick(user)}
                            >
                                <div className="user-info-container">
                                    <div className="user-avatar">
                                        <Image
                                            src={`/avatars/${user.gender === 'male' ? 'male' : user.gender === 'female' ? 'female' : 'default'}.png`}
                                            alt={user.username}
                                            width={32}
                                            height={32}
                                        />
                                    </div>
                                    <div className="user-info">
                                        <div className="username">{user.username}</div>
                                    </div>
                                </div>
                                <div className="action-buttons">
                                    <button 
                                        className="icon-button"
                                        onClick={(e) => handleChatClick(e, user)}
                                    >
                                        <Image
                                            src="/icons/Chat.png"
                                            alt="Chat"
                                            width={24}
                                            height={24}
                                        />
                                    </button>
                                    <button 
                                        className="icon-button"
                                        onClick={(e) => handleInfoClick(e, user)}
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
                        ))
                    ) : searchQuery.length >= 2 ? (
                        <div className="no-results">No users found</div>
                    ) : (
                        <div className="search-hint">Type at least 2 characters to search</div>
                    )}
                </div>
            </div>
        </div>
    );
} 