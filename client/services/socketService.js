import { io } from 'socket.io-client';

class SocketService {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
    }

    connect(token) {
        if (this.socket && this.isConnected) {
            console.log('🔌 Socket already connected');
            return this.socket;
        }

        // Validate token before connecting
        if (!token) {
            console.error('❌ No token provided for Socket.IO connection');
            throw new Error('Authentication token is required');
        }

        // Check if token is expired
        try {
            const tokenData = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Math.floor(Date.now() / 1000);
            
            if (tokenData.exp && tokenData.exp < currentTime) {
                console.error('❌ Token has expired');
                // Clear expired token from localStorage
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
                localStorage.removeItem('username');
                localStorage.removeItem('isAdmin');
                throw new Error('Authentication token has expired. Please login again.');
            }
        } catch (error) {
            console.error('❌ Invalid token format:', error);
            throw new Error('Invalid authentication token. Please login again.');
        }

        try {
            console.log('🔌 Connecting to Socket.IO server...');
            this.socket = io('http://localhost:5000', {
                auth: { token },
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionAttempts: this.maxReconnectAttempts,
                reconnectionDelay: this.reconnectDelay,
                timeout: 20000
            });

            this.socket.on('connect', () => {
                console.log('✅ Socket.IO connected successfully');
                this.isConnected = true;
                this.reconnectAttempts = 0;
            });

            this.socket.on('disconnect', (reason) => {
                console.log('❌ Socket.IO disconnected:', reason);
                this.isConnected = false;
            });

            this.socket.on('connect_error', (error) => {
                console.error('❌ Socket.IO connection error:', error);
                this.isConnected = false;
                this.reconnectAttempts++;
                
                // Handle authentication errors specifically
                if (error.message === 'Authentication error') {
                    console.error('❌ Socket.IO authentication failed - token may be invalid or expired');
                    // Clear potentially invalid token
                    localStorage.removeItem('token');
                    localStorage.removeItem('userId');
                    localStorage.removeItem('username');
                    localStorage.removeItem('isAdmin');
                    
                    // Redirect to login page
                    if (typeof window !== 'undefined') {
                        window.location.href = '/login?error=authentication_failed';
                    }
                }
                
                if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                    console.error('❌ Max reconnection attempts reached');
                }
            });

            this.socket.on('reconnect', (attemptNumber) => {
                console.log(`✅ Socket.IO reconnected after ${attemptNumber} attempts`);
                this.isConnected = true;
                this.reconnectAttempts = 0;
            });

            this.socket.on('reconnect_error', (error) => {
                console.error('❌ Socket.IO reconnection error:', error);
            });

            this.socket.on('reconnect_failed', () => {
                console.error('❌ Socket.IO reconnection failed');
            });

            return this.socket;
        } catch (error) {
            console.error('❌ Error creating Socket.IO connection:', error);
            throw error;
        }
    }

    disconnect() {
        if (this.socket) {
            console.log('🔌 Disconnecting Socket.IO...');
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
        }
    }

    emit(event, data) {
        if (this.socket && this.isConnected) {
            this.socket.emit(event, data);
        } else {
            console.warn('⚠️ Socket not connected, cannot emit event:', event);
        }
    }

    on(event, callback) {
        if (this.socket) {
            this.socket.on(event, callback);
        } else {
            console.warn('⚠️ Socket not connected, cannot listen to event:', event);
        }
    }

    off(event, callback) {
        if (this.socket) {
            this.socket.off(event, callback);
        }
    }

    // Typing indicators
    sendTyping(receiverId, isTyping) {
        this.emit('typing', { receiverId, isTyping });
    }

    // Message read receipts
    sendMessageRead(messageId, senderId) {
        this.emit('message_read', { messageId, senderId });
    }

    // Get connection status
    getConnectionStatus() {
        return this.isConnected;
    }
}

// Create a singleton instance
const socketService = new SocketService();

export default socketService; 