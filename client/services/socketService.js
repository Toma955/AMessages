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
            return this.socket;
        }

        if (!token) {
            throw new Error('Authentication token is required');
        }

        try {
            const tokenData = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Math.floor(Date.now() / 1000);
            
            if (tokenData.exp && tokenData.exp < currentTime) {
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
                localStorage.removeItem('username');
                localStorage.removeItem('isAdmin');
                throw new Error('Authentication token has expired. Please login again.');
            }
        } catch (error) {
            throw new Error('Invalid authentication token. Please login again.');
        }

        try {
            const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://amessages.onrender.com';
            this.socket = io(socketUrl, {
                auth: { token },
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionAttempts: this.maxReconnectAttempts,
                reconnectionDelay: this.reconnectDelay,
                timeout: 20000
            });

            this.socket.on('connect', () => {
                this.isConnected = true;
                this.reconnectAttempts = 0;
            });

            this.socket.on('disconnect', (reason) => {
                this.isConnected = false;
            });

            this.socket.on('connect_error', (error) => {
                this.isConnected = false;
                this.reconnectAttempts++;
                
                if (error.message === 'Authentication error') {
                    localStorage.removeItem('token');
                    localStorage.removeItem('userId');
                    localStorage.removeItem('username');
                    localStorage.removeItem('isAdmin');
                    
                    if (typeof window !== 'undefined') {
                        window.location.href = '/login?error=authentication_failed';
                    }
                }
                
                if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                }
            });

            this.socket.on('reconnect', (attemptNumber) => {
                this.isConnected = true;
                this.reconnectAttempts = 0;
            });

            this.socket.on('reconnect_error', (error) => {
            });

            this.socket.on('reconnect_failed', () => {
            });

            return this.socket;
        } catch (error) {
            throw error;
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
        }
    }

    emit(event, data) {
        if (this.socket && this.isConnected) {
            this.socket.emit(event, data);
        }
    }

    on(event, callback) {
        if (this.socket) {
            this.socket.on(event, callback);
        }
    }

    off(event, callback) {
        if (this.socket) {
            this.socket.off(event, callback);
        }
    }

    sendTyping(receiverId, isTyping) {
        this.emit('typing', { receiverId, isTyping });
    }

    sendMessageRead(messageId, senderId) {
        this.emit('message_read', { messageId, senderId });
    }

    getConnectionStatus() {
        return this.isConnected;
    }
}

const socketService = new SocketService();

export default socketService; 