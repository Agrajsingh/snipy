import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { channelService, friendService, dmService } from '../services';
import { socketService } from '../services/socket';
import { Hash, Plus, LogOut, Users, Video, Search, Bell, MessageCircle } from 'lucide-react';
import Logo from './Logo';
import SearchUsers from './SearchUsers';
import FriendRequests from './FriendRequests';

export default function Sidebar({ onCallUser, onSelectDM }) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { channels, currentChannel, setCurrentChannel, addChannel, onlineUsers } = useChatStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelDescription, setNewChannelDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [dmSearchQuery, setDmSearchQuery] = useState('');


  const handleLogout = () => {
    socketService.disconnect();
    logout();
    navigate('/login');
  };

  // Fetch friends and friend requests
  const fetchFriends = async () => {
    try {
      const friendsData = await friendService.getFriends();
      setFriends(friendsData);
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };

  const fetchFriendRequests = async () => {
    try {
      const requests = await friendService.getPendingRequests();
      setFriendRequests(requests);
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    }
  };

  const fetchConversations = async () => {
    try {
      const convos = await dmService.getConversations();
      setConversations(convos);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  // Fetch data on mount
  useEffect(() => {
    fetchFriends();
    fetchFriendRequests();
    fetchConversations();
  }, []);

  // Handle friend request updates
  const handleRequestUpdate = () => {
    fetchFriends();
    fetchFriendRequests();
    fetchConversations();
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

        {/* Friend Actions */}
        <div className="p-4 border-t border-indigo-800">
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setShowSearchModal(true)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-700 hover:bg-indigo-600 rounded-lg transition transform hover:scale-105"
            >
              <Search className="w-4 h-4" />
              <span className="text-sm font-medium">Find Friends</span>
            </button>
            <button
              onClick={() => setShowRequestsModal(true)}
              className="relative flex items-center justify-center px-4 py-2 bg-indigo-700 hover:bg-indigo-600 rounded-lg transition transform hover:scale-105"
            >
              <Bell className="w-4 h-4" />
              {friendRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                  {friendRequests.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Direct Messages */}
        <div className="p-4 border-t border-indigo-800">
          <div className="flex items-center mb-3">
            <MessageCircle className="w-4 h-4 mr-2 text-indigo-300" />
            <h2 className="text-sm font-semibold text-indigo-300 uppercase">
              Direct Messages
            </h2>
          </div>
          
          {/* Search Friends to DM */}
          <div className="mb-3">
            <input
              type="text"
              value={dmSearchQuery}
              onChange={(e) => setDmSearchQuery(e.target.value)}
              placeholder="Search friends..."
              className="w-full px-3 py-2 bg-indigo-800 border border-indigo-700 rounded-lg text-white placeholder-indigo-400 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Show filtered friends if searching, otherwise show conversations */}
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {dmSearchQuery.trim() ? (
              // Show friends matching search
              friends
                .filter((friend) =>
                  friend.username.toLowerCase().includes(dmSearchQuery.toLowerCase())
                )
                .map((friend, index) => (
                  <div
                    key={friend._id}
                    onClick={() => {
                      setDmSearchQuery(''); // Clear search
                      onSelectDM && onSelectDM({
                        _id: 'new',
                        participant: friend,
                        lastMessage: '',
                        unreadCount: 0,
                      });
                    }}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-indigo-800 cursor-pointer transition text-sm text-indigo-100 animate-slide-in-bottom"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                        {friend.username.charAt(0).toUpperCase()}
                      </div>
                      {friend.isOnline && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-indigo-900"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{friend.username}</p>
                      <p className="text-xs text-indigo-300 truncate">
                        {friend.isOnline ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>
                ))
            ) : conversations.length > 0 ? (
              // Show existing conversations
              conversations.map((conv, index) => (
                <div
                  key={conv._id}
                  onClick={() => onSelectDM && onSelectDM(conv)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-indigo-800 cursor-pointer transition text-sm text-indigo-100 animate-slide-in-bottom group"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                      {conv.participant?.username?.charAt(0).toUpperCase()}
                    </div>
                    {conv.participant?.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-indigo-900"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{conv.participant?.username}</p>
                    <p className="text-xs text-indigo-300 truncate">
                      {conv.lastMessage || 'No messages yet'}
                    </p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="flex-shrink-0 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-indigo-400 text-center py-4">
                No conversations yet
              </p>
            )}
          </div>
        </div>

        {/* Online Friends */}
        <div className="p-4 border-t border-indigo-800">
          <div className="flex items-center mb-3">
            <Users className="w-4 h-4 mr-2 text-indigo-300" />
            <h2 className="text-sm font-semibold text-indigo-300 uppercase">
              Friends Online
            </h2>
          </div>
          <div className="space-y-2">
            {friends
              .filter((friend) => onlineUsers.includes(friend._id))
              .slice(0, 10)
              .map((onlineFriend, index) => {
                const userEmojis = ['👤', '👨', '👩', '🧑', '👨‍💻', '👩‍💻', '🧑‍💻'];
                const userEmoji = userEmojis[index % userEmojis.length];

                return (
                  <div
                    key={onlineFriend._id}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-indigo-800 transition text-sm text-indigo-100 animate-slide-in-bottom"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="relative flex-shrink-0">
                      <span className="text-lg">{userEmoji}</span>
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-indigo-900 animate-pulse-custom"></div>
                    </div>
                    <span className="truncate font-medium flex-1">
                      {onlineFriend.username}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          // Start DM conversation
                          if (onSelectDM) {
                            onSelectDM({
                              _id: 'new',
                              participant: onlineFriend,
                              lastMessage: '',
                              unreadCount: 0,
                            });
                          }
                        }}
                        className="p-1.5 bg-purple-700 hover:bg-purple-600 rounded-lg transition transform hover:scale-110 flex-shrink-0"
                        title={`Message ${onlineFriend.username}`}
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onCallUser && onCallUser(onlineFriend)}
                        className="p-1.5 bg-indigo-700 hover:bg-indigo-600 rounded-lg transition transform hover:scale-110 flex-shrink-0"
                        title={`Call ${onlineFriend.username}`}
                      >
                        <Video className="w-4 h-4" />
                      </button>
                    </div>
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

      {/* Search Users Modal */}
      {showSearchModal && (
        <SearchUsers onClose={() => setShowSearchModal(false)} />
      )}

      {/* Friend Requests Modal */}
      {showRequestsModal && (
        <FriendRequests
          requests={friendRequests}
          onClose={() => setShowRequestsModal(false)}
          onUpdate={handleRequestUpdate}
        />
      )}
    </div>
  );
}
