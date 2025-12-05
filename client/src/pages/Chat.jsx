import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { useCallStore } from '../store/callStore';
import { socketService } from '../services/socket';
import { webrtcService } from '../services/webrtc';
import { channelService, dmService } from '../services';
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';
import CursorFollower from '../components/CursorFollower';
import VideoCall from '../components/VideoCall';
import CallModal from '../components/CallModal';
import ErrorModal from '../components/ErrorModal';

export default function Chat() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { channels, setChannels, currentChannel, setOnlineUsers, addMessage, setTyping } = useChatStore();
  const {
    callState,
    setCallState,
    currentCall,
    setCurrentCall,
    setLocalStream,
    setRemoteStream,
    endCall: endCallStore,
  } = useCallStore();
  const [loading, setLoading] = useState(true);
  const [incomingCall, setIncomingCall] = useState(null);
  const [callError, setCallError] = useState(null);
  const [currentDM, setCurrentDM] = useState(null);
  const [dmMessages, setDmMessages] = useState([]);

  // Handle initiating a call
  const handleCallUser = async (targetUser) => {
    console.log('handleCallUser called with:', targetUser);
    try {
      console.log('Setting call state to calling...');
      setCallState('calling');
      setCurrentCall({
        userId: targetUser._id,
        username: targetUser.username,
        type: 'outgoing',
      });

      console.log('Getting local media stream...');
      // Get local stream
      const stream = await webrtcService.getLocalStream();
      console.log('Local stream acquired:', stream);
      setLocalStream(stream);

      console.log('Creating WebRTC offer...');
      // Create offer and send
      await webrtcService.createOffer(targetUser._id, {
        userId: user._id,
        username: user.username,
        email: user.email,
      });
      console.log('Call offer sent successfully');
    } catch (error) {
      console.error('Error starting call:', error);
      
      // Provide specific error messages based on error type
      let errorMessage = 'Failed to start call.';
      
      if (error.name === 'NotReadableError') {
        errorMessage = '❌ Camera/microphone are already in use by another application.\n\n' +
                      'Please close other apps using your camera/microphone (Zoom, Teams, etc.) and try again.';
      } else if (error.name === 'NotAllowedError') {
        errorMessage = '❌ Camera/microphone access was denied.\n\n' +
                      'Please allow camera and microphone permissions in your browser settings and try again.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = '❌ No camera or microphone found.\n\n' +
                      'Please connect a camera and microphone to make video calls.';
      } else {
        errorMessage = `❌ Failed to start call: ${error.message}\n\n` +
                      'Please check your camera/microphone permissions and try again.';
      }
      
      // Show error modal instead of alert
      setCallError(error);
      endCallStore();
    }
  };

  // Handle accepting incoming call
  const handleAcceptCall = async () => {
    try {
      setCallState('active');
      setCurrentCall({
        userId: incomingCall.userId,
        username: incomingCall.username,
        type: 'incoming',
      });

      // Get local stream
      const stream = await webrtcService.getLocalStream();
      setLocalStream(stream);

      // Handle the offer and send answer
      await webrtcService.handleOffer(incomingCall.userId, incomingCall.offer);

      setIncomingCall(null);
    } catch (error) {
      console.error('Error accepting call:', error);
      
      // Provide specific error messages
      let errorMessage = 'Failed to accept call.';
      
      if (error.name === 'NotReadableError') {
        errorMessage = '❌ Camera/microphone are already in use.\n\n' +
                      'Close other apps using your camera/microphone and try again.';
      } else if (error.name === 'NotAllowedError') {
        errorMessage = '❌ Camera/microphone access denied.\n\n' +
                      'Allow permissions in your browser and try again.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = '❌ No camera or microphone found.';
      } else {
        errorMessage = `❌ Failed to accept call: ${error.message}`;
      }
      
      // Show error modal instead of alert
      setCallError(error);
      endCallStore();
      setIncomingCall(null);
    }
  };

  // Handle declining incoming call
  const handleDeclineCall = () => {
    if (incomingCall) {
      socketService.declineCall(incomingCall.userId);
      setIncomingCall(null);
      setCallState('idle');
    }
  };

  // Handle selecting a DM conversation
  const handleSelectDM = async (conversation) => {
    try {
      console.log('handleSelectDM called with:', conversation);
      setCurrentDM(conversation);
      setCurrentChannel(null); // Clear current channel

      // If it's a new conversation (no ID yet), just set empty messages
      if (conversation._id === 'new') {
        console.log('New conversation, setting empty messages');
        setDmMessages([]);
        return;
      }

      // Fetch messages for existing conversation
      console.log('Fetching messages for conversation:', conversation._id);
      const messages = await dmService.getMessages(conversation._id);
      console.log('Fetched messages:', messages);
      console.log('Messages count:', messages.length);
      setDmMessages(messages);

      // Mark as read
      await dmService.markAsRead(conversation._id);

      // Emit read event
      socketService.getSocket()?.emit('dm:read', {
        to: conversation.participant._id,
        conversationId: conversation._id,
      });
    } catch (error) {
      console.error('Error loading DM:', error);
    }
  };

  // Handle sending DM
  const handleSendDM = async (content) => {
    if (!currentDM || !content.trim()) return;

    try {
      const response = await dmService.sendMessage(currentDM.participant._id, content);
      
      // Add message to local state
      setDmMessages([...dmMessages, response.message]);

      // Emit to recipient
      socketService.getSocket()?.emit('dm:send', {
        to: currentDM.participant._id,
        message: response.message,
        conversationId: response.conversationId,
      });
    } catch (error) {
      console.error('Error sending DM:', error);
      alert(error.response?.data?.message || 'Failed to send message');
    }
  };

  // Fetch DM messages when currentDM changes
  useEffect(() => {
    const loadDMMessages = async () => {
      if (currentDM && currentDM._id && currentDM._id !== 'new') {
        try {
          console.log('useEffect: Loading DM messages for:', currentDM._id);
          const messages = await dmService.getMessages(currentDM._id);
          console.log('useEffect: Loaded messages:', messages);
          setDmMessages(messages);
        } catch (error) {
          console.error('useEffect: Error loading DM messages:', error);
        }
      }
    };
    
    loadDMMessages();
  }, [currentDM?._id]);

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

    // WebRTC Call Event Listeners
    // Handle incoming call
    socketService.onIncomingCall(async ({ from, offer, fromUserData }) => {
      console.log('Incoming call from:', fromUserData);
      setIncomingCall({ userId: from, offer, ...fromUserData });
      setCallState('ringing');
    });

    // Handle call answered
    socketService.onCallAnswered(async ({ answer }) => {
      console.log('Call answered');
      await webrtcService.handleAnswer(answer);
      setCallState('active');
    });

    // Handle call declined
    socketService.onCallDeclined(() => {
      console.log('Call declined');
      alert('Call was declined');
      webrtcService.closeConnection();
      endCallStore();
      setIncomingCall(null);
    });

    // Handle call ended
    socketService.onCallEnded(() => {
      console.log('Call ended by remote user');
      webrtcService.closeConnection();
      endCallStore();
      setIncomingCall(null);
    });

    // Handle ICE candidates
    socketService.onIceCandidate(async ({ candidate }) => {
      await webrtcService.handleIceCandidate(candidate);
    });

    // Setup remote stream callback
    webrtcService.onRemoteStream((stream) => {
      console.log('Remote stream received');
      setRemoteStream(stream);
    });

    webrtcService.onCallEnded(() => {
      endCallStore();
      setIncomingCall(null);
    });

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
      socketService.offCallEvents();
      // Remove DM listeners
      socket?.off('dm:receive');
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
      <CursorFollower variant="circle" />
      <Sidebar onCallUser={handleCallUser} onSelectDM={handleSelectDM} />
      <ChatArea 
        isDM={!!currentDM} 
        dmData={currentDM ? { conversation: currentDM, messages: dmMessages, onSendMessage: handleSendDM } : null}
      />
      
      {/* Video Call UI */}
      {callState === 'active' && <VideoCall />}
      
      {/* Incoming Call Modal */}
      {callState === 'ringing' && incomingCall && (
        <CallModal
          caller={incomingCall}
          onAccept={handleAcceptCall}
          onDecline={handleDeclineCall}
        />
      )}
      
      {/* Error Modal */}
      {callError && (
        <ErrorModal
          error={callError}
          onClose={() => setCallError(null)}
        />
      )}
    </div>
  );
}
