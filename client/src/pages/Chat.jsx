import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { socketService } from '../services/socket';
import { channelService } from '../services';
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';

export default function Chat() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { channels, setChannels, currentChannel, setOnlineUsers, addMessage, setTyping } = useChatStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Connect to socket
    socketService.connect(user._id);

    // Fetch channels
    const loadChannels = async () => {
      try {
        const data = await channelService.getChannels();
        setChannels(data);
      } catch (error) {
        console.error('Error loading channels:', error);
      } finally {
        setLoading(false);
      }
    };

    loadChannels();

    // Listen for online users
    socketService.onOnlineUsers((users) => {
      setOnlineUsers(users);
    });

    // Listen for new messages
    socketService.onNewMessage((message) => {
      addMessage(message.channel, message);
    });

    // Listen for typing
    const socket = socketService.getSocket();
    if (socket) {
      socket.on('typing:start', ({ username }) => {
        if (currentChannel) {
          setTyping(currentChannel._id, username, true);
        }
      });
      socket.on('typing:stop', ({ username }) => {
        if (currentChannel) {
          setTyping(currentChannel._id, username, false);
        }
      });
    }

    return () => {
      socketService.offNewMessage();
      socketService.offOnlineUsers();
      socketService.offTyping();
    };
  }, [isAuthenticated, navigate, user, setChannels, setOnlineUsers, addMessage, currentChannel, setTyping]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 animate-fade-in">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto animate-glow"></div>
          <p className="mt-4 text-gray-600 animate-pulse-custom">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <ChatArea />
    </div>
  );
}
