import { api } from './api';

class MediaService {
  async getSongs() {
    try {
      const response = await api.get('/media/songs');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getRadioStations() {
    try {
      const response = await api.get('/media/radio');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getMidiFiles() {
    try {
      const response = await api.get('/media/midi');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async uploadSong(file) {
    try {
      const formData = new FormData();
      formData.append('song', file);
      
      const response = await api.post('/media/songs/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteSong(songId) {
    try {
      const response = await api.delete(`/media/songs/${songId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getSongUrl(songName) {
    try {
      const response = await api.get(`/media/songs/${encodeURIComponent(songName)}`);
      return response.data.url;
    } catch (error) {
      throw error;
    }
  }

  async getMidiUrl(fileName) {
    try {
      const response = await api.get(`/media/midi/${encodeURIComponent(fileName)}`);
      return response.data.url;
    } catch (error) {
      throw error;
    }
  }
}

export const mediaService = new MediaService(); 