import React from 'react';

// StatusBar Component
function AIStatusBar({ 
  browserSupported, 
  bootstrapStatus, 
  bootstrapProgress 
}) {
  const getStatusBarStyle = () => {
    if (!browserSupported) {
      return {
        backgroundColor: '#fef2f2',
        borderTop: '2px solid #fca5a5',
        color: '#dc2626'
      };
    }
    
    if (bootstrapStatus === 'checking') {
      return {
        backgroundColor: '#f0f9ff',
        borderTop: '2px solid #7dd3fc',
        color: '#0369a1'
      };
    }
    
    if (bootstrapStatus === 'downloading') {
      return {
        backgroundColor: '#fefce8',
        borderTop: '2px solid #fde047',
        color: '#a16207'
      };
    }
    
    if (bootstrapStatus === 'available') {
      return {
        backgroundColor: '#f0fdf4',
        borderTop: '2px solid #86efac',
        color: '#166534'
      };
    }
    
    return {
      backgroundColor: '#f8fafc',
      borderTop: '2px solid #e2e8f0',
      color: '#475569'
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
            backgroundColor: 'rgba(0,0,0,0.1)',
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${bootstrapProgress}%`,
              height: '100%',
              backgroundColor: '#a16207',
              transition: 'width 0.3s ease'
            }}></div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AIStatusBar;
