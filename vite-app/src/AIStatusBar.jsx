import React from 'react';

// ============================================================================
// CONSTANTS AND CONFIGURATION
// ============================================================================

// Status bar styling configurations
const STATUS_STYLES = {
  error: 'bg-red-50 border-t-4 border-red-400 text-red-800',
  checking: 'bg-blue-50 border-t-4 border-blue-400 text-blue-800',
  downloading: 'bg-yellow-50 border-t-4 border-yellow-400 text-yellow-800',
  success: 'bg-green-50 border-t-4 border-green-400 text-green-800',
  default: 'bg-gray-50 border-t-4 border-gray-400 text-gray-800'
};

// API status indicator configurations
const API_STATUS_INDICATORS = {
  available: {
    icon: 'M5 13l4 4L19 7',
    color: 'text-green-600',
    label: 'Available'
  },
  downloadable: {
    icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4',
    color: 'text-yellow-600',
    label: 'Downloadable'
  },
  downloading: {
    icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
    color: 'text-blue-600',
    animation: 'animate-spin',
    label: 'Downloading'
  },
  unavailable: {
    icon: 'M6 18L18 6M6 6l12 12',
    color: 'text-red-600',
    label: 'Unavailable'
  },
  checking: {
    icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
    color: 'text-gray-600',
    animation: 'animate-pulse',
    label: 'Checking'
  },
  unknown: {
    icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    color: 'text-gray-600',
    label: 'Unknown'
  }
};

// Main status bar icons
const STATUS_ICONS = {
  error: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z',
  checking: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
  downloading: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4',
  success: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  default: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * AIStatusBar Component
 * 
 * Displays the current status of Chrome Browser AI APIs including:
 * - Browser support status
 * - Language detection service status
 * - Translation service status
 * - Bootstrap/download progress
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.browserSupported - Whether browser supports AI features
 * @param {string} props.bootstrapStatus - Current bootstrap status
 * @param {number} props.bootstrapProgress - Download progress percentage
 * @param {string} props.langDetectionStatus - Language detection API status
 * @param {string} props.translationStatus - Translation API status
 */
function AIStatusBar({
  browserSupported,
  bootstrapStatus,
  bootstrapProgress,
  langDetectionStatus,
  translationStatus
}) {
  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  /**
   * Determines the appropriate CSS classes for the status bar based on current state.
   * @returns {string} CSS classes for status bar styling
   */
  const getStatusBarClasses = () => {
    // Browser not supported - show error
    if (!browserSupported) {
      return STATUS_STYLES.error;
    }

    // Bootstrap status determines styling
    switch (bootstrapStatus) {
      case 'checking':
        return STATUS_STYLES.checking;
      case 'downloading':
        return STATUS_STYLES.downloading;
      case 'available':
        // Check if APIs are available when bootstrap is complete
        return areAPIsAvailable() ? STATUS_STYLES.success : STATUS_STYLES.error;
      default:
        return STATUS_STYLES.default;
    }
  };

  /**
   * Checks if both language detection and translation APIs are available.
   * @returns {boolean} True if both APIs are available
   */
  const areAPIsAvailable = () => {
    return langDetectionStatus === 'available' && translationStatus === 'available';
  };

  /**
   * Renders the main status icon based on current state.
   * @returns {JSX.Element} SVG icon element
   */
  const getStatusIcon = () => {
    let iconKey = 'default';
    let animationClass = '';

    if (!browserSupported) {
      iconKey = 'error';
    } else {
      switch (bootstrapStatus) {
        case 'checking':
          iconKey = 'checking';
          animationClass = 'animate-spin';
          break;
        case 'downloading':
          iconKey = 'downloading';
          animationClass = 'animate-pulse';
          break;
        case 'available':
          iconKey = areAPIsAvailable() ? 'success' : 'error';
          break;
        default:
          iconKey = 'default';
      }
    }

    return (
      <svg 
        className={`w-5 h-5 mr-2 flex-shrink-0 ${animationClass}`} 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24" 
        aria-hidden="true"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d={STATUS_ICONS[iconKey]} 
        />
      </svg>
    );
  };

  /**
   * Renders an API status indicator icon.
   * @param {string} status - API status (available, downloadable, etc.)
   * @returns {JSX.Element} SVG icon element for API status
   */
  const getAPIStatusIndicator = (status) => {
    const config = API_STATUS_INDICATORS[status] || API_STATUS_INDICATORS.unknown;
    
    return (
      <svg 
        className={`w-4 h-4 ${config.color} mr-1 ${config.animation || ''}`} 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24" 
        aria-label={config.label}
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d={config.icon} 
        />
      </svg>
    );
  };

  /**
   * Generates the appropriate status message based on current state.
   * @returns {string|JSX.Element} Status message or JSX element
   */
  const getStatusMessage = () => {
    // Browser not supported
    if (!browserSupported) {
      return "Your browser doesn't support AI features. Please use Chrome 138 or above for the best experience.";
    }

    // Bootstrap status messages
    switch (bootstrapStatus) {
      case 'checking':
        return 'Browser AI features detected. Initializing language services...';
      
      case 'downloading':
        return `Downloading language models... ${bootstrapProgress}% complete`;
      
      case 'available':
        // Check API availability when bootstrap is complete
        if (!areAPIsAvailable()) {
          return 'Please use Chrome 138 or above for AI features to work properly.';
        }

        // Show API status indicators
        return (
          <span className="flex items-center">
            Language services ready!
            <span className="ml-2 flex items-center">
              {getAPIStatusIndicator(langDetectionStatus)}
              <span className="mr-3">LanguageDetector</span>
              {getAPIStatusIndicator(translationStatus)}
              <span>Translator</span>
            </span>
          </span>
        );
      
      default:
        return 'Preparing language services...';
    }
  };

  // ============================================================================
  // RENDER COMPONENTS
  // ============================================================================

  /**
   * Renders the download progress bar when downloading.
   * @returns {JSX.Element|null} Progress bar component or null
   */
  const renderProgressBar = () => {
    if (bootstrapStatus !== 'downloading') {
      return null;
    }

    return (
      <div className="ml-6 flex items-center">
        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-yellow-500 to-yellow-600 transition-all duration-500 ease-out shadow-sm"
            style={{ width: `${bootstrapProgress}%` }}
            aria-label={`Download progress: ${bootstrapProgress}%`}
          />
        </div>
        <span className="ml-3 text-xs font-bold min-w-[3rem] text-right">
          {bootstrapProgress}%
        </span>
      </div>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 px-6 py-4 text-sm font-medium z-50 shadow-lg backdrop-blur-sm ${getStatusBarClasses()}`}
      role="status"
      aria-live="polite"
      aria-label={`System status: ${typeof getStatusMessage() === 'string' ? getStatusMessage() : 'Language services status'}`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-center">
        <div className="flex items-center">
          {getStatusIcon()}
          <span className="font-semibold">{getStatusMessage()}</span>
        </div>
        {renderProgressBar()}
      </div>
    </div>
  );
}

export default AIStatusBar;
