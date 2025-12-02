import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { messageService } from '../services';
import { socketService } from '../services/socket';
import { format } from 'date-fns';
import { Send, Hash, Smile } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';

export default function ChatArea() {
  const { user } = useAuthStore();
  const { currentChannel, messages, setMessages, typingUsers } = useChatStore();
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

  if (!currentChannel) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-center text-gray-400 animate-fade-in">
          <Hash className="w-16 h-16 mx-auto mb-4 animate-float" />
          <p className="text-xl">Select a channel to start messaging</p>
        </div>
      </div>
    );
  }

  const channelMessages = messages[currentChannel._id]?.messages || [];
  const channelTyping = typingUsers[currentChannel._id] || [];

  return (
    <div className="flex-1 flex flex-col bg-white animate-slide-in-right">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white shadow-sm animate-slide-in-top">
        <div className="flex items-center">
          <Hash className="w-6 h-6 text-gray-600 mr-2" />
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              {currentChannel.name}
            </h2>
            {currentChannel.description && (
              <p className="text-sm text-gray-500">{currentChannel.description}</p>
            )}
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-500">
          {currentChannel.members?.length || 0} members
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : channelMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            {channelMessages.map((message, index) => (
              <div 
                key={message._id} 
                className="flex gap-3 animate-message hover:bg-gray-50 p-2 rounded-lg transition"
                style={{ animationDelay: `${Math.min(index * 0.05, 1)}s` }}
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-semibold shadow-md hover:scale-110 transition">
                  {message.user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-gray-900">
                      {message.user?.username || 'Unknown'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {format(new Date(message.createdAt), 'PPp')}
                    </span>
                  </div>
                  <p className="text-gray-700 break-words">{message.content}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}

        {/* Typing Indicator */}
        {channelTyping.length > 0 && (
          <div className="text-sm text-gray-500 italic animate-fade-in flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce-custom"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce-custom" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce-custom" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span>{channelTyping.join(', ')} {channelTyping.length === 1 ? 'is' : 'are'} typing...</span>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 relative">
        {showEmojiPicker && (
          <div className="absolute bottom-20 left-4 z-10 animate-scale-in">
            <EmojiPicker onEmojiClick={onEmojiClick} />
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex gap-3">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-3 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-lg transition"
          >
            <Smile className="w-6 h-6" />
          </button>
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder={`Message #${currentChannel.name}`}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
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
