import { api } from './api';

class ChatService {
  async getConversations() {
    try {
      const response = await api.get('/conversations');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getMessages(conversationId) {
    try {
      const response = await api.get(`/conversations/${conversationId}/messages`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async sendMessage(conversationId, message) {
    try {
      const response = await api.post(`/conversations/${conversationId}/messages`, {
        content: message,
        timestamp: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async createConversation(userId) {
    try {
      const response = await api.post('/conversations', { userId });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteConversation(conversationId) {
    try {
      const response = await api.delete(`/conversations/${conversationId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async markMessagesAsRead(conversationId) {
    try {
      const response = await api.put(`/conversations/${conversationId}/read`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async searchUsers(query) {
    try {
      const response = await api.get(`/search/users?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getUsers() {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export const chatService = new ChatService(); 