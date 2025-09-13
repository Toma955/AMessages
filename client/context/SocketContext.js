"use client";

import React, { createContext, useContext, useEffect, useRef, useCallback } from 'react';
import socketService from '../services/socketService';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const socketRef = useRef(null);
  const messageHandlersRef = useRef(new Map());
  const connectionHandlersRef = useRef(new Map());

  // Initialize socket connection when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      socketRef.current = socketService.connect(user.id);
      
      // Set up connection event handlers
      socketRef.current.on('connect', () => {
        connectionHandlersRef.current.forEach(handler => handler('connected'));
      });

      socketRef.current.on('disconnect', () => {
        connectionHandlersRef.current.forEach(handler => handler('disconnected'));
      });

      socketRef.current.on('error', (error) => {
        connectionHandlersRef.current.forEach(handler => handler('error', error));
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
        }
      };
    }
  }, [isAuthenticated, user]);

  const sendMessage = useCallback((conversationId, message) => {
    if (socketRef.current) {
      socketRef.current.emit('send_message', {
        conversationId,
        message,
        timestamp: new Date().toISOString()
      });
    }
  }, []);

  const joinConversation = useCallback((conversationId) => {
    if (socketRef.current) {
      socketRef.current.emit('join_conversation', { conversationId });
    }
  }, []);

  const leaveConversation = useCallback((conversationId) => {
    if (socketRef.current) {
      socketRef.current.emit('leave_conversation', { conversationId });
    }
  }, []);

  const joinGroup = useCallback((groupId) => {
    if (socketRef.current) {
      socketRef.current.emit('join_group', groupId);
    }
  }, []);

  const leaveGroup = useCallback((groupId) => {
    if (socketRef.current) {
      socketRef.current.emit('leave_group', groupId);
    }
  }, []);

  const sendGroupMessage = useCallback((groupId, message) => {
    if (socketRef.current) {
      socketRef.current.emit('group_message', {
        groupId,
        message,
        timestamp: new Date().toISOString()
      });
    }
  }, []);

  const onMessage = useCallback((handler) => {
    const handlerId = Date.now().toString();
    messageHandlersRef.current.set(handlerId, handler);

    if (socketRef.current) {
      socketRef.current.on('new_message', handler);
    }

    return () => {
      messageHandlersRef.current.delete(handlerId);
      if (socketRef.current) {
        socketRef.current.off('new_message', handler);
      }
    };
  }, []);

  const onConnectionChange = useCallback((handler) => {
    const handlerId = Date.now().toString();
    connectionHandlersRef.current.set(handlerId, handler);
    
    return () => {
      connectionHandlersRef.current.delete(handlerId);
    };
  }, []);

  const isConnected = useCallback(() => {
    return socketRef.current?.connected || false;
  }, []);

  const value = {
    sendMessage,
    joinConversation,
    leaveConversation,
    joinGroup,
    leaveGroup,
    sendGroupMessage,
    onMessage,
    onConnectionChange,
    isConnected
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}; 