import { Check, X, UserPlus } from 'lucide-react';
import { friendService } from '../services';
import { socketService } from '../services/socket';
import { useAuthStore } from '../store/authStore';

export default function FriendRequests({ requests, onClose, onUpdate }) {
  const { user } = useAuthStore();

  const handleAccept = async (requestUser) => {
    try {
      await friendService.acceptFriendRequest(requestUser.from._id);
      
      // Emit socket event
      socketService.getSocket()?.emit('friend:requestAccepted', {
        to: requestUser.from._id,
        acceptedUserData: {
          _id: user._id,
          username: user.username,
          email: user.email,
        },
      });
      
      onUpdate();
    } catch (error) {
      console.error('Error accepting friend request:', error);
      alert('Failed to accept friend request');
    }
  };

  const handleReject = async (requestUser) => {
    try {
      await friendService.rejectFriendRequest(requestUser.from._id);
      
      // Emit socket event (optional)
      socketService.getSocket()?.emit('friend:requestRejected', {
        to: requestUser.from._id,
      });
      
      onUpdate();
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      alert('Failed to reject friend request');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-2xl mx-4 shadow-2xl animate-scale-in max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Friend Requests</h2>
            <p className="text-sm text-gray-600 mt-1">
              {requests.length} pending {requests.length === 1 ? 'request' : 'requests'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Requests List */}
        <div className="flex-1 overflow-y-auto p-6">
          {requests.length > 0 ? (
            <div className="space-y-3">
              {requests.map((request) => (
                <div
                  key={request.from._id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {request.from.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{request.from.username}</p>
                      <p className="text-sm text-gray-600">{request.from.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(request.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReject(request)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition transform hover:scale-105"
                    >
                      <X className="w-4 h-4" />
                      <span className="font-medium">Reject</span>
                    </button>
                    <button
                      onClick={() => handleAccept(request)}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg transition transform hover:scale-105"
                    >
                      <Check className="w-4 h-4" />
                      <span className="font-medium">Accept</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <UserPlus className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 text-center font-medium">No pending requests</p>
              <p className="text-sm text-gray-500 text-center mt-2">
                You're all caught up!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
