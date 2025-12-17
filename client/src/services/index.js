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

export const friendService = {
  searchUsers: async (query) => {
    const response = await api.get(`/friends/search?query=${query}`);
    return response.data;
  },

  sendFriendRequest: async (userId) => {
    const response = await api.post(`/friends/request/${userId}`);
    return response.data;
  },

  acceptFriendRequest: async (userId) => {
    const response = await api.post(`/friends/accept/${userId}`);
    return response.data;
  },

  rejectFriendRequest: async (userId) => {
    const response = await api.post(`/friends/reject/${userId}`);
    return response.data;
  },

  getPendingRequests: async () => {
    const response = await api.get('/friends/requests');
    return response.data;
  },

  getFriends: async () => {
    const response = await api.get('/friends');
    return response.data;
  },
};

export const dmService = {
  getConversations: async () => {
    const response = await api.get('/dm/conversations');
    return response.data;
  },

  getMessages: async (conversationId) => {
    const response = await api.get(`/dm/${conversationId}/messages`);
    return response.data;
  },

  sendMessage: async (recipientId, content) => {
    const response = await api.post(`/dm/send/${recipientId}`, { content });
    return response.data;
  },

  markAsRead: async (conversationId) => {
    const response = await api.put(`/dm/${conversationId}/read`);
    return response.data;
  },
};
