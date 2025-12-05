import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket = null;

export const socketService = {
  connect: (userId) => {
    if (!socket) {
      socket = io(SOCKET_URL);
      
      socket.on('connect', () => {
        console.log('Socket connected');
        socket.emit('user:join', userId);
      });
    }
    return socket;
  },

  disconnect: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  getSocket: () => socket,

  joinChannel: (channelId) => {
    if (socket) {
      socket.emit('channel:join', channelId);
    }
  },

  leaveChannel: (channelId) => {
    if (socket) {
      socket.emit('channel:leave', channelId);
    }
  },

  sendMessage: (messageData) => {
    if (socket) {
      socket.emit('message:send', messageData);
    }
  },

  startTyping: (channelId, username) => {
    if (socket) {
      socket.emit('typing:start', { channelId, username });
    }
  },

  stopTyping: (channelId, username) => {
    if (socket) {
      socket.emit('typing:stop', { channelId, username });
    }
  },

  onNewMessage: (callback) => {
    if (socket) {
      socket.on('message:new', callback);
    }
  },

  onTyping: (callback) => {
    if (socket) {
      socket.on('typing:start', callback);
      socket.on('typing:stop', callback);
    }
  },

  onOnlineUsers: (callback) => {
    if (socket) {
      socket.on('users:online', callback);
    }
  },

  offNewMessage: () => {
    if (socket) {
      socket.off('message:new');
    }
  },

  offTyping: () => {
    if (socket) {
      socket.off('typing:start');
      socket.off('typing:stop');
    }
  },

  offOnlineUsers: () => {
    if (socket) {
      socket.off('users:online');
    }
  },

  // WebRTC Signaling Methods
  sendCallOffer: (to, offer, fromUserData) => {
    if (socket) {
      socket.emit('call:offer', { to, from: fromUserData.userId, offer, fromUserData });
    }
  },

  sendCallAnswer: (to, answer) => {
    if (socket) {
      const userId = localStorage.getItem('userId');
      socket.emit('call:answer', { to, from: userId, answer });
    }
  },

  sendIceCandidate: (to, candidate) => {
    if (socket) {
      socket.emit('call:ice-candidate', { to, candidate });
    }
  },

  declineCall: (to) => {
    if (socket) {
      const userId = localStorage.getItem('userId');
      socket.emit('call:decline', { to, from: userId });
    }
  },

  endCall: (to) => {
    if (socket) {
      socket.emit('call:end', { to });
    }
  },

  onIncomingCall: (callback) => {
    if (socket) {
      socket.on('call:incoming', callback);
    }
  },

  onCallAnswered: (callback) => {
    if (socket) {
      socket.on('call:answered', callback);
    }
  },

  onCallDeclined: (callback) => {
    if (socket) {
      socket.on('call:declined', callback);
    }
  },

  onCallEnded: (callback) => {
    if (socket) {
      socket.on('call:ended', callback);
    }
  },

  onIceCandidate: (callback) => {
    if (socket) {
      socket.on('call:ice-candidate', callback);
    }
  },

  offCallEvents: () => {
    if (socket) {
      socket.off('call:incoming');
      socket.off('call:answered');
      socket.off('call:declined');
      socket.off('call:ended');
      socket.off('call:ice-candidate');
    }
  },
};
