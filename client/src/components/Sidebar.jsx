import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { channelService } from '../services';
import { socketService } from '../services/socket';
import { Hash, Plus, LogOut, Users } from 'lucide-react';
import Logo from './Logo';

export default function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { channels, currentChannel, setCurrentChannel, addChannel, onlineUsers } = useChatStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelDescription, setNewChannelDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    socketService.disconnect();
    logout();
    navigate('/login');
  };

  const handleChannelClick = async (channel) => {
    setCurrentChannel(channel);
    
    // Join channel via socket if not already a member
    if (!channel.members.some(m => m._id === user._id)) {
      try {
        await channelService.joinChannel(channel._id);
      } catch (error) {
        console.error('Error joining channel:', error);
      }
    }
    
    socketService.joinChannel(channel._id);
  };

  const handleCreateChannel = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const newChannel = await channelService.createChannel({
        name: newChannelName,
        description: newChannelDescription,
      });
      
      addChannel(newChannel);
      setShowCreateModal(false);
      setNewChannelName('');
      setNewChannelDescription('');
      setCurrentChannel(newChannel);
      socketService.joinChannel(newChannel._id);
    } catch (error) {
      console.error('Error creating channel:', error);
      alert(error.response?.data?.message || 'Failed to create channel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-80 bg-indigo-900 text-white flex flex-col animate-slide-in-left">
      {/* Header */}
      <div className="p-4 border-b border-indigo-800 animate-fade-in">
        <div className="flex items-center justify-between">
          <Logo size="small" variant="dark" />
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-indigo-800 rounded transition hover:scale-110 hover:rotate-12"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-indigo-300 mt-1">@{user?.username}</p>
      </div>

      {/* Channels */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-indigo-300 uppercase">
              Channels
            </h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="p-1 hover:bg-indigo-800 rounded transition hover:scale-125 hover:rotate-90"
              title="Create channel"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-1">
            {channels.map((channel, index) => (
              <button
                key={channel._id}
                onClick={() => handleChannelClick(channel)}
                className={`w-full flex items-center px-3 py-2 rounded transition hover:scale-105 hover:translate-x-1 animate-slide-in-bottom ${
                  currentChannel?._id === channel._id
                    ? 'bg-indigo-700 text-white shadow-lg'
                    : 'hover:bg-indigo-800 text-indigo-200'
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <span className="mr-2">💬</span>
                <span className="truncate">{channel.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Online Users */}
        <div className="p-4 border-t border-indigo-800">
          <div className="flex items-center mb-3">
            <Users className="w-4 h-4 mr-2 text-indigo-300" />
            <h2 className="text-sm font-semibold text-indigo-300 uppercase">
              Online ({onlineUsers.length})
            </h2>
          </div>
          <div className="space-y-2">
            {onlineUsers.slice(0, 10).map((userId, index) => {
              // Use the userId to get initials (first 2 chars of ID)
              const userInitials = userId.substring(0, 2).toUpperCase();
              const userEmojis = ['👤', '👨', '👩', '🧑', '👨‍💻', '👩‍💻', '🧑‍💻'];
              const userEmoji = userEmojis[index % userEmojis.length];
              
              return (
                <div 
                  key={userId} 
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-indigo-800 transition text-sm text-indigo-100 animate-slide-in-bottom"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="relative">
                    <span className="text-lg">{userEmoji}</span>
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-indigo-900 animate-pulse-custom"></div>
                  </div>
                  <span className="truncate font-medium">User {userInitials}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Create Channel Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 animate-scale-in">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Create Channel
            </h3>
            <form onSubmit={handleCreateChannel}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Channel Name
                </label>
                <input
                  type="text"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800"
                  placeholder="general"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={newChannelDescription}
                  onChange={(e) => setNewChannelDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800"
                  rows="3"
                  placeholder="Channel description..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition hover:scale-105"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 hover:scale-105 hover:shadow-lg"
                >
                  {loading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
