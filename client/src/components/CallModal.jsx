import { Phone, PhoneOff } from 'lucide-react';

export default function CallModal({ caller, onAccept, onDecline }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl animate-scale-in">
        {/* Caller Avatar */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-4">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse-custom">
              <span className="text-5xl">📹</span>
            </div>
            <div className="absolute inset-0 bg-indigo-500 rounded-full opacity-50 animate-ping"></div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {caller?.username || 'Unknown User'}
          </h2>
          <p className="text-gray-600 text-sm mb-1">Incoming video call</p>
          <p className="text-gray-500 text-xs">{caller?.email}</p>
        </div>

        {/* Ringing Animation */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2">
            <div
              className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce"
              style={{ animationDelay: '0s' }}
            ></div>
            <div
              className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce"
              style={{ animationDelay: '0.1s' }}
            ></div>
            <div
              className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce"
              style={{ animationDelay: '0.2s' }}
            ></div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onDecline}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl transition transform hover:scale-105 active:scale-95 shadow-lg"
          >
            <PhoneOff className="w-5 h-5" />
            <span className="font-semibold">Decline</span>
          </button>
          
          <button
            onClick={onAccept}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl transition transform hover:scale-105 active:scale-95 shadow-lg"
          >
            <Phone className="w-5 h-5" />
            <span className="font-semibold">Accept</span>
          </button>
        </div>

        {/* Hint */}
        <p className="text-center text-xs text-gray-500 mt-6">
          Make sure your camera and microphone are ready
        </p>
      </div>
    </div>
  );
}
