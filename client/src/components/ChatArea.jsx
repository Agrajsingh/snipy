import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { useThemeStore } from '../store/themeStore';
import { messageService } from '../services';
import { socketService } from '../services/socket';
import { format } from 'date-fns';
import { Send, Hash, Smile, Moon, Sun } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';

export default function ChatArea({ isDM = false, dmData = null }) {
  const { user } = useAuthStore();
  const { currentChannel, messages, setMessages, typingUsers } = useChatStore();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (currentChannel) {
      loadMessages();
    }
  }, [currentChannel]);

  useEffect(() => {
    scrollToBottom();
  }, [messages[currentChannel?._id]?.messages]);

  const loadMessages = async () => {
    if (!currentChannel) return;

    setLoading(true);
    try {
      const data = await messageService.getMessages(currentChannel._id);
      setMessages(currentChannel._id, data);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);

    // Typing indicator
    if (currentChannel && user) {
      socketService.startTyping(currentChannel._id, user.username);
      
      // Clear previous timeout
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      
      // Stop typing after 2 seconds of inactivity
      const timeout = setTimeout(() => {
        socketService.stopTyping(currentChannel._id, user.username);
      }, 2000);
      
      setTypingTimeout(timeout);
    }
  };

  const onEmojiClick = (emojiObject) => {
    setInputValue((prev) => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!inputValue.trim() || !currentChannel) return;

    const messageContent = inputValue.trim();
    setInputValue('');
    setShowEmojiPicker(false);

    // Stop typing indicator
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    socketService.stopTyping(currentChannel._id, user.username);

    // Send via socket for real-time delivery
    socketService.sendMessage({
      user: user._id,
      channel: currentChannel._id,
      content: messageContent,
    });
  };

  if (!currentChannel && !isDM) {
    return (
      <div className={`flex-1 flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-400'} animate-fade-in`}>
          <div className="text-6xl mb-4 animate-float">💬</div>
          <p className="text-xl">Select a channel or conversation to start messaging</p>
        </div>
      </div>
    );
  }

  // For DMs
  if (isDM && dmData) {
    const { conversation, messages: dmMessages, onSendMessage } = dmData;
    
    console.log('DM Mode - Conversation:', conversation);
    console.log('DM Mode - Messages:', dmMessages);
    console.log('DM Mode - Messages length:', dmMessages?.length);
    
    const handleDMSubmit = async (e) => {
      e.preventDefault();
      if (!inputValue.trim()) return;
      
      const content = inputValue.trim();
      setInputValue('');
      setShowEmojiPicker(false);
      
      await onSendMessage(content);
    };

    return (
      <div className={`flex-1 flex flex-col ${isDarkMode ? 'bg-gray-900' : 'bg-white'} animate-slide-in-right`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} shadow-sm animate-slide-in-top`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {conversation.participant?.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {conversation.participant?.username}
                </h2>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {conversation.participant?.isOnline ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className={`p-3 rounded-lg transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600 hover:scale-110' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-110'
              }`}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {!dmMessages || dmMessages.length === 0 ? (
            <div className={`flex items-center justify-center h-full ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <>
              {dmMessages.map((message, index) => (
                <div 
                  key={message._id} 
                  className={`flex gap-3 animate-message ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'} p-2 rounded-lg transition`}
                  style={{ animationDelay: `${Math.min(index * 0.05, 1)}s` }}
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-semibold shadow-md">
                    {message.sender?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {message.sender?.username || 'Unknown'}
                      </span>
                      <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        {format(new Date(message.createdAt), 'PPp')}
                      </span>
                    </div>
                    <p className={`break-words ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{message.content}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'} relative`}>
          {showEmojiPicker && (
            <div className="absolute bottom-20 left-4 z-10 animate-scale-in">
              <EmojiPicker onEmojiClick={onEmojiClick} theme={isDarkMode ? 'dark' : 'light'} />
            </div>
          )}
          <form onSubmit={handleDMSubmit} className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={`p-3 ${isDarkMode ? 'text-gray-400 hover:text-indigo-400 hover:bg-gray-700' : 'text-gray-500 hover:text-indigo-600 hover:bg-gray-100'} rounded-lg transition`}
            >
              <Smile className="w-6 h-6" />
            </button>
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder={`Message ${conversation.participant?.username}`}
              className={`flex-1 px-4 py-3 border ${
                isDarkMode 
                  ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:ring-indigo-500' 
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:ring-indigo-500'
              } rounded-lg focus:ring-2 focus:border-transparent`}
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:scale-105 hover:shadow-lg"
            >
              <Send className="w-5 h-5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!currentChannel) {
    return (
      <div className={`flex-1 flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-400'} animate-fade-in`}>
          <div className="text-6xl mb-4 animate-float">💬</div>
          <p className="text-xl">Select a channel to start messaging</p>
        </div>
      </div>
    );
  }

  const channelMessages = messages[currentChannel._id]?.messages || [];
  const channelTyping = typingUsers[currentChannel._id] || [];

  return (
    <div className={`flex-1 flex flex-col ${isDarkMode ? 'bg-gray-900' : 'bg-white'} animate-slide-in-right`}>
      {/* Header */}
      <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} shadow-sm animate-slide-in-top`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`text-2xl mr-2 ${isDarkMode ? 'opacity-80' : ''}`}>💬</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`text-2xl font-bold bg-gradient-to-r ${
                  isDarkMode 
                    ? 'from-indigo-400 via-purple-400 to-pink-400' 
                    : 'from-indigo-600 via-purple-600 to-pink-600'
                } bg-clip-text text-transparent animate-gradient-x`}>
                  {currentChannel.name}
                </h2>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  isDarkMode 
                    ? 'bg-indigo-900/50 text-indigo-300 border border-indigo-700' 
                    : 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                }`}>
                  Channel
                </span>
              </div>
              {currentChannel.description && (
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{currentChannel.description}</p>
              )}
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className={`p-3 rounded-lg transition-all duration-300 ${
              isDarkMode 
                ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600 hover:scale-110' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-110'
            }`}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
        <div className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {currentChannel.members?.length || 0} members
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${isDarkMode ? 'border-indigo-400' : 'border-indigo-600'}`}></div>
          </div>
        ) : channelMessages.length === 0 ? (
          <div className={`flex items-center justify-center h-full ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            {channelMessages.map((message, index) => (
              <div 
                key={message._id} 
                className={`flex gap-3 animate-message ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'} p-2 rounded-lg transition`}
                style={{ animationDelay: `${Math.min(index * 0.05, 1)}s` }}
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-semibold shadow-md hover:scale-110 transition">
                  {message.user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {message.user?.username || 'Unknown'}
                    </span>
                    <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      {format(new Date(message.createdAt), 'PPp')}
                    </span>
                  </div>
                  <p className={`break-words ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{message.content}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}

        {/* Typing Indicator */}
        {channelTyping.length > 0 && (
          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} italic animate-fade-in flex items-center gap-2`}>
            <div className="flex gap-1">
              <div className={`w-2 h-2 ${isDarkMode ? 'bg-gray-500' : 'bg-gray-400'} rounded-full animate-bounce-custom`}></div>
              <div className={`w-2 h-2 ${isDarkMode ? 'bg-gray-500' : 'bg-gray-400'} rounded-full animate-bounce-custom`} style={{ animationDelay: '0.1s' }}></div>
              <div className={`w-2 h-2 ${isDarkMode ? 'bg-gray-500' : 'bg-gray-400'} rounded-full animate-bounce-custom`} style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span>{channelTyping.join(', ')} {channelTyping.length === 1 ? 'is' : 'are'} typing...</span>
          </div>
        )}
      </div>

      {/* Input */}
      <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'} relative`}>
        {showEmojiPicker && (
          <div className="absolute bottom-20 left-4 z-10 animate-scale-in">
            <EmojiPicker onEmojiClick={onEmojiClick} theme={isDarkMode ? 'dark' : 'light'} />
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex gap-3">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`p-3 ${isDarkMode ? 'text-gray-400 hover:text-indigo-400 hover:bg-gray-700' : 'text-gray-500 hover:text-indigo-600 hover:bg-gray-100'} rounded-lg transition`}
          >
            <Smile className="w-6 h-6" />
          </button>
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder={`Message #${currentChannel.name}`}
            className={`flex-1 px-4 py-3 border ${
              isDarkMode 
                ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:ring-indigo-500' 
                : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:ring-indigo-500'
            } rounded-lg focus:ring-2 focus:border-transparent`}
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:scale-105 hover:shadow-lg"
          >
            <Send className="w-5 h-5" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
