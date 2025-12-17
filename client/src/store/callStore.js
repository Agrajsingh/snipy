import { create } from 'zustand';

export const useCallStore = create((set, get) => ({
  // Call state: 'idle' | 'calling' | 'ringing' | 'active'
  callState: 'idle',
  
  // Current call information
  currentCall: null, // { userId, username, type: 'outgoing' | 'incoming' }
  
  // Media streams
  localStream: null,
  remoteStream: null,
  
  // Media controls
  isAudioMuted: false,
  isVideoOff: false,
  
  // Actions
  setCallState: (state) => set({ callState: state }),
  
  setCurrentCall: (call) => set({ currentCall: call }),
  
  setLocalStream: (stream) => set({ localStream: stream }),
  
  setRemoteStream: (stream) => set({ remoteStream: stream }),
  
  toggleAudio: () => {
    const { localStream, isAudioMuted } = get();
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = isAudioMuted;
      });
      set({ isAudioMuted: !isAudioMuted });
    }
  },
  
  toggleVideo: () => {
    const { localStream, isVideoOff } = get();
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = isVideoOff;
      });
      set({ isVideoOff: !isVideoOff });
    }
  },
  
  endCall: () => {
    const { localStream, remoteStream } = get();
    
    // Stop all tracks
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop());
    }
    
    // Reset state
    set({
      callState: 'idle',
      currentCall: null,
      localStream: null,
      remoteStream: null,
      isAudioMuted: false,
      isVideoOff: false,
    });
  },
  
  resetCall: () => {
    set({
      callState: 'idle',
      currentCall: null,
      localStream: null,
      remoteStream: null,
      isAudioMuted: false,
      isVideoOff: false,
    });
  },
}));
