import api from './api';

class GroupService {
  
  async createGroup(name, participants = []) {
    try {
      const response = await api.post('/api/group/create', {
        name,
        participants
      });
      return response;
    } catch (error) {
      console.error('GroupService createGroup error:', error);
      throw error;
    }
  }

  
  async getGroups() {
    try {
      const response = await api.get('/api/group/list');
      return response;
    } catch (error) {
      console.error('GroupService getGroups error:', error);
      throw error;
    }
  }

  
  async getGroupMessages(groupId) {
    try {
      const response = await api.get(`/api/group/${groupId}/messages`);
      return response;
    } catch (error) {
      console.error('GroupService getGroupMessages error:', error);
      throw error;
    }
  }

 
  async sendGroupMessage(groupId, message) {
    try {
      const response = await api.post(`/api/group/${groupId}/messages`, {
        message
      });
      return response;
    } catch (error) {
      console.error('GroupService sendGroupMessage error:', error);
      throw error;
    }
  }

 
  async addGroupParticipant(groupId, participantId) {
    try {
      const response = await api.post(`/api/group/${groupId}/participants`, {
        participantId
      });
      return response;
    } catch (error) {
      console.error('GroupService addGroupParticipant error:', error);
      throw error;
    }
  }


  async removeGroupParticipant(groupId, participantId) {
    try {
      const response = await api.delete(`/api/group/${groupId}/participants/${participantId}`);
      return response;
    } catch (error) {
      console.error('GroupService removeGroupParticipant error:', error);
      throw error;
    }
  }

  
  async updateGroupName(groupId, name) {
    try {
      const response = await api.put(`/api/group/${groupId}/name`, {
        name
      });
      return response;
    } catch (error) {
      console.error('GroupService updateGroupName error:', error);
      throw error;
    }
  }

 
  async deleteGroup(groupId) {
    try {
      const response = await api.delete(`/api/group/${groupId}`);
      return response;
    } catch (error) {
      console.error('GroupService deleteGroup error:', error);
      throw error;
    }
  }
}

export default new GroupService(); 