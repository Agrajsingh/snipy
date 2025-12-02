import api from './api';

export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  getUsers: async () => {
    const response = await api.get('/auth/users');
    return response.data;
  },
};

export const channelService = {
  getChannels: async () => {
    const response = await api.get('/channels');
    return response.data;
  },

  getChannel: async (channelId) => {
    const response = await api.get(`/channels/${channelId}`);
    return response.data;
  },

  createChannel: async (channelData) => {
    const response = await api.post('/channels', channelData);
    return response.data;
  },

  joinChannel: async (channelId) => {
    const response = await api.post(`/channels/${channelId}/join`);
    return response.data;
  },

  leaveChannel: async (channelId) => {
    const response = await api.post(`/channels/${channelId}/leave`);
    return response.data;
  },
};

export const messageService = {
  getMessages: async (channelId, page = 1, limit = 50) => {
    const response = await api.get(`/messages/${channelId}`, {
      params: { page, limit },
    });
    return response.data;
  },

  createMessage: async (messageData) => {
    const response = await api.post('/messages', messageData);
    return response.data;
  },
};
