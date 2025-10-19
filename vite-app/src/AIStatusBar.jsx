import React from 'react';
import { colors } from './colors';

// StatusBar Component
function AIStatusBar({ 
  browserSupported, 
  bootstrapStatus, 
  bootstrapProgress 
}) {
  const getStatusBarStyle = () => {
    if (!browserSupported) {
      return {
        backgroundColor: colors.error.background,
        borderTop: `2px solid ${colors.error.border}`,
        color: colors.error.text
      };
    }
    
    if (bootstrapStatus === 'checking') {
      return {
        backgroundColor: colors.info.background,
        borderTop: `2px solid ${colors.info.border}`,
        color: colors.info.text
      };
    }
    
    if (bootstrapStatus === 'downloading') {
      return {
        backgroundColor: colors.warning.background,
        borderTop: `2px solid ${colors.warning.border}`,
        color: colors.warning.text
      };
    }
    
    if (bootstrapStatus === 'available') {
      return {
        backgroundColor: colors.success.background,
        borderTop: `2px solid ${colors.success.border}`,
        color: colors.success.text
      };
    }
    
    return {
      backgroundColor: colors.default.background,
      borderTop: `2px solid ${colors.default.border}`,
      color: colors.default.text
    };
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
      return 'Language services ready! You can now translate text seamlessly.';
    }
    
    return 'Preparing language services...';
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      padding: '12px 20px',
      fontSize: '14px',
      fontWeight: '500',
      zIndex: 1000,
      ...getStatusBarStyle()
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span>{getStatusMessage()}</span>
        {bootstrapStatus === 'downloading' && (
          <div style={{
            marginLeft: '12px',
            width: '100px',
            height: '4px',
            backgroundColor: colors.progress.background,
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${bootstrapProgress}%`,
              height: '100%',
              backgroundColor: colors.progress.bar,
              transition: 'width 0.3s ease'
            }}></div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AIStatusBar;
