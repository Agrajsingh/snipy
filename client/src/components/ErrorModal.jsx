export default function ErrorModal({ error, onClose }) {
  if (!error) return null;

  const getErrorIcon = () => {
    return '⚠️';
  };

  const getErrorTitle = (errorName) => {
    switch(errorName) {
      case 'NotReadableError':
        return 'Device Already in Use';
      case 'NotAllowedError':
        return 'Permission Denied';
      case 'NotFoundError':
        return 'Device Not Found';
      default:
        return 'Call Failed';
    }
  };

  const getErrorMessage = (errorName) => {
    switch(errorName) {
      case 'NotReadableError':
        return 'Your camera or microphone is being used by another application. Please close any other video call apps (Zoom, Teams, Discord, etc.) or browser tabs using your camera.';
      case 'NotAllowedError':
        return 'Camera and microphone access was denied. Please allow permissions in your browser settings and try again.';
      case 'NotFoundError':
       return 'No camera or microphone was detected. Please connect a webcam and microphone to make video calls.';
      default:
        return error.message || 'An unexpected error occurred while starting the call.';
    }
  };

  const getSolution = (errorName) => {
    switch(errorName) {
      case 'NotReadableError':
        return [
          'Close Zoom, Teams, Skype, or Discord',
          'Close other browser tabs with video calls',
          'Check Task Manager for apps using your camera',
          'Restart your browser if issue persists'
        ];
      case 'NotAllowedError':
        return [
          'Click the camera icon in your address bar',
          'Change permissions to "Allow"',
          'Refresh the page',
          'Try clicking the call button again'
        ];
      case 'NotFoundError':
        return [
          'Connect a webcam if using a desktop',
          'Check USB connections',
          'Update camera drivers',
          'Try a different USB port'
        ];
      default:
        return ['Refresh the page and try again', 'Check your internet connection'];
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl p-8 w-full max-w-lg mx-4 shadow-2xl animate-scale-in">
        {/* Error Icon */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-5xl">{getErrorIcon()}</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 text-center">
            {getErrorTitle(error.name)}
          </h2>
        </div>

        {/* Error Message */}
        <p className="text-gray-700 text-center mb-6 leading-relaxed">
          {getErrorMessage(error.name)}
        </p>

        {/* Solutions */}
        <div className="bg-blue-50 rounded-lg p-5 mb-6">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
            <span className="mr-2">💡</span>
            What to try:
          </h3>
          <ul className="space-y-2">
            {getSolution(error.name).map((solution, index) => (
              <li key={index} className="text-sm text-gray-700 flex items-start">
                <span className="mr-2 text-blue-600 font-bold">{index + 1}.</span>
                <span>{solution}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition transform hover:scale-105 active:scale-95 shadow-lg font-semibold"
        >
          Got it
        </button>

        {/* Tech Details (collapsed by default) */}
        {error.message && (
          <details className="mt-4">
            <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
              Technical details
            </summary>
            <p className="text-xs text-gray-600 mt-2 p-3 bg-gray-100 rounded font-mono">
              {error.name}: {error.message}
            </p>
          </details>
        )}
      </div>
    </div>
  );
}
