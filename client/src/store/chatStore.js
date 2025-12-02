import { create } from 'zustand';

export const useChatStore = create((set, get) => ({
  channels: [],
  currentChannel: null,
  messages: {},
  onlineUsers: [],
  typingUsers: {},
  
  setChannels: (channels) => set({ channels }),
  
  setCurrentChannel: (channel) => set({ currentChannel: channel }),
  
  addChannel: (channel) => {
    set((state) => ({
      channels: [...state.channels, channel],
    }));
  },
  
  updateChannel: (channelId, updates) => {
    set((state) => ({
      channels: state.channels.map((ch) =>
        ch._id === channelId ? { ...ch, ...updates } : ch
      ),
    }));
  },
  
  setMessages: (channelId, messagesData) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [channelId]: messagesData,
      },
    }));
  },
  
  addMessage: (channelId, message) => {
    set((state) => {
      const channelMessages = state.messages[channelId] || { messages: [] };
      return {
        messages: {
          ...state.messages,
          [channelId]: {
            ...channelMessages,
            messages: [...channelMessages.messages, message],
          },
        },
      };
    });
  },
  
  setOnlineUsers: (users) => set({ onlineUsers: users }),
  
  setTyping: (channelId, username, isTyping) => {
    set((state) => {
      const channelTyping = state.typingUsers[channelId] || [];
      if (isTyping) {
        if (!channelTyping.includes(username)) {
          return {
            typingUsers: {
              ...state.typingUsers,
              [channelId]: [...channelTyping, username],
            },
          };
        }
      } else {
        return {
          typingUsers: {
            ...state.typingUsers,
            [channelId]: channelTyping.filter((u) => u !== username),
          },
        };
      }
      return state;
    });
  },
}));
