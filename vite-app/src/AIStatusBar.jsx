import React from 'react';

// StatusBar Component
function AIStatusBar({ 
  browserSupported, 
  bootstrapStatus, 
  bootstrapProgress,
  langDetectionStatus,
  translationStatus
}) {
  const getStatusBarClasses = () => {
    if (!browserSupported) {
      return 'bg-red-50 border-t-4 border-red-400 text-red-800';
    }
    
    if (bootstrapStatus === 'checking') {
      return 'bg-blue-50 border-t-4 border-blue-400 text-blue-800';
    }
    
    if (bootstrapStatus === 'downloading') {
      return 'bg-yellow-50 border-t-4 border-yellow-400 text-yellow-800';
    }
    
    if (bootstrapStatus === 'available') {
      // Check if any API is not available
      if (langDetectionStatus !== 'available' || translationStatus !== 'available') {
        return 'bg-red-50 border-t-4 border-red-400 text-red-800';
      }
      return 'bg-green-50 border-t-4 border-green-400 text-green-800';
    }
    
    return 'bg-gray-50 border-t-4 border-gray-400 text-gray-800';
  };

  const getStatusIcon = () => {
    if (!browserSupported) {
      return (
        <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      );
    }
    
    if (bootstrapStatus === 'checking') {
      return (
        <svg className="w-5 h-5 mr-2 flex-shrink-0 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      );
    }
    
    if (bootstrapStatus === 'downloading') {
      return (
        <svg className="w-5 h-5 mr-2 flex-shrink-0 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      );
    }
    
    if (bootstrapStatus === 'available') {
      return (
        <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
    
    return (
      <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  };

  const getStatusMessage = () => {
    if (!browserSupported) {
      return `Your browser doesn't support AI features. Please use Chrome 138 or above for the best experience.`;
    }
    
    if (bootstrapStatus === 'checking') {
      return 'Browser AI features detected. Initializing language services...';
    }
    
    if (bootstrapStatus === 'downloading') {
      return `Downloading language models... ${bootstrapProgress}% complete`;
    }
    
    if (bootstrapStatus === 'available') {
      // Check if any API is not available
      if (langDetectionStatus !== 'available' || translationStatus !== 'available') {
        return 'Please use Chrome 138 or above for AI features to work properly.';
      }

      const getStatusIndicator = (status) => {
        switch (status) {
          case 'available':
            return (
              <svg className="w-4 h-4 text-green-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="Available">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            );
          case 'downloadable':
            return (
              <svg className="w-4 h-4 text-yellow-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="Downloadable">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            );
          case 'downloading':
            return (
              <svg className="w-4 h-4 text-blue-600 mr-1 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="Downloading">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            );
          case 'unavailable':
            return (
              <svg className="w-4 h-4 text-red-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="Unavailable">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            );
          case 'checking':
            return (
              <svg className="w-4 h-4 text-gray-600 mr-1 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="Checking">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            );
          default:
            return (
              <svg className="w-4 h-4 text-gray-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="Unknown">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            );
        }
      };

      return (
        <span className="flex items-center">
          Language services ready! 
          <span className="ml-2 flex items-center">
            {getStatusIndicator(langDetectionStatus)}
            <span className="mr-3">LanguageDetector</span>
            {getStatusIndicator(translationStatus)}
            <span>Translator</span>
          </span>
        </span>
      );
    }
    
    return 'Preparing language services...';
  };

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 px-6 py-4 text-sm font-medium z-50 shadow-lg backdrop-blur-sm ${getStatusBarClasses()}`}
      role="status"
      aria-live="polite"
      aria-label={`System status: ${getStatusMessage()}`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-center">
        <div className="flex items-center">
          {getStatusIcon()}
          <span className="font-semibold">{getStatusMessage()}</span>
        </div>
        {bootstrapStatus === 'downloading' && (
          <div className="ml-6 flex items-center">
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-yellow-500 to-yellow-600 transition-all duration-500 ease-out shadow-sm"
                style={{ width: `${bootstrapProgress}%` }}
                aria-label={`Download progress: ${bootstrapProgress}%`}
              ></div>
            </div>
            <span className="ml-3 text-xs font-bold min-w-[3rem] text-right">
              {bootstrapProgress}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default AIStatusBar;
