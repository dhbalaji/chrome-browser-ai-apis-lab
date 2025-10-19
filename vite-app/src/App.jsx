import { useState, useEffect } from 'react';
import './App.css';
import useBrowserLanguageDetection from '../../hooks/lang-detection/useBrowserLanguageDetection';
import useBrowserTranslator from '../../hooks/lang-translate/useBrowserTranslator';
import AIStatusBar from './AIStatusBar';

function App() {
  const [input, setInput] = useState('');
  const [translated, setTranslated] = useState('');
  const [showOutput, setShowOutput] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [selectedLang, setSelectedLang] = useState('te'); // Default to Telugu
  const [langDetectionStatus, setLangDetectionStatus] = useState('checking');
  const [translationStatus, setTranslationStatus] = useState('checking');

  // Status bar states
  const [browserSupported, setBrowserSupported] = useState(false);
  const [bootstrapStatus, setBootstrapStatus] = useState('checking');
  const [bootstrapProgress, setBootstrapProgress] = useState(0);

  const { availabilityStatus: langDetectionStatusFromHook } = useBrowserLanguageDetection(); // No language array needed

  // Provide single source and target language as strings in config
  const { translate, getAvailabilityStatus } = useBrowserTranslator({
    sourceLanguage: selectedLang, // use selected language
    targetLanguage: 'en',                    // translate to English by default
    bootstrapLanguages: [
      { sourceLanguage: 'te', targetLanguage: 'en' },
      { sourceLanguage: 'ta', targetLanguage: 'en' }
    ]
  });

  // Update language detection status from hook
  useEffect(() => {
    setLangDetectionStatus(langDetectionStatusFromHook);
  }, [langDetectionStatusFromHook]);

  // Update translation status from hook
  useEffect(() => {
    const status = getAvailabilityStatus(selectedLang, 'en');
    setTranslationStatus(status);
  }, [selectedLang, getAvailabilityStatus]);

  // Browser feature detection and bootstrap logic
  useEffect(() => {
    // Check browser support
    const userAgent = navigator.userAgent;
    const chromeMatch = userAgent.match(/Chrome\/(\d+)/);
    const chromeVersion = chromeMatch ? parseInt(chromeMatch[1]) : 0;
    
    const hasAIFeatures = (
      typeof window !== 'undefined' &&
      'LanguageDetector' in window &&
      'Translator' in window &&
      window.isSecureContext &&
      chromeVersion >= 138
    );
    
    setBrowserSupported(hasAIFeatures);
    
    if (hasAIFeatures) {
      // Start bootstrap process after 5 seconds
      setTimeout(() => {
        setBootstrapStatus('downloading');
        
        // Simulate bootstrap progress
        let progress = 0;
        const progressInterval = setInterval(() => {
          progress += Math.random() * 15;
          if (progress >= 100) {
            progress = 100;
            clearInterval(progressInterval);
            setBootstrapStatus('available');
          }
          setBootstrapProgress(Math.min(progress, 100));
        }, 200);
      }, 5000);
    }
  }, []); // Empty dependency array - only run once on mount

  // Helper function to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return '#10b981'; // green
      case 'downloadable': return '#f59e0b'; // amber
      case 'downloading': return '#3b82f6'; // blue
      case 'unavailable': return '#ef4444'; // red
      default: return '#6b7280'; // gray
    }
  };

  // Helper function to get status text
  const getStatusText = (status) => {
    switch (status) {
      case 'available': return 'Available';
      case 'downloadable': return 'Downloadable';
      case 'downloading': return 'Downloading...';
      case 'unavailable': return 'Unavailable';
      default: return 'Checking...';
    }
  };

  const handleTranslate = async () => {
    // Translate input text to English by default, no second argument needed
    const translatedText = await translate(input); 
    setTranslated(translatedText ?? '');

    setShowOutput(true);
    setAccepted(false);
  };

  const handleAccept = () => {
    setAccepted(true);
    setShowOutput(false);
  };

  const handleEdit = () => {
    setAccepted(false);
    setShowOutput(false);
  };

  return (
    <div style={{ maxWidth: 500, margin: '2rem auto', paddingBottom: '80px' }}>
      {/* API Status Banner */}
      <div style={{
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '20px',
        fontSize: '14px'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#374151' }}>
          API Status
        </div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: getStatusColor(langDetectionStatus)
            }}></div>
            <span style={{ color: '#6b7280' }}>Language Detection:</span>
            <span style={{ fontWeight: '500', color: getStatusColor(langDetectionStatus) }}>
              {getStatusText(langDetectionStatus)}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: getStatusColor(translationStatus)
            }}></div>
            <span style={{ color: '#6b7280' }}>Translation:</span>
            <span style={{ fontWeight: '500', color: getStatusColor(translationStatus) }}>
              {getStatusText(translationStatus)}
            </span>
          </div>
        </div>
      </div>

      {!accepted && (
        <>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151' }}>
              Your input language is:
            </label>
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: 'white'
              }}
            >
              <option value="te">Telugu</option>
              <option value="ta">Tamil</option>
            </select>
          </div>
          <textarea
            rows={4}
            style={{ width: '100%' }}
            placeholder="Enter text to translate..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <br />
          <button onClick={handleTranslate} style={{ marginTop: '1rem' }}>
            Translate
          </button>
        </>
      )}

      {showOutput && (
        <div style={{ marginTop: '2rem' }}>
          <div>
            <strong>Selected Language:</strong> {selectedLang === 'te' ? 'Telugu' : 'Tamil'}
          </div>
          <textarea rows={4} style={{ width: '100%' }} value={translated} readOnly />
          <br />
          <button onClick={handleAccept} style={{ marginRight: '1rem', marginTop: '1rem' }}>
            Accept
          </button>
          <button onClick={() => setShowOutput(false)} style={{ marginTop: '1rem' }}>
            Reject
          </button>
        </div>
      )}

      {accepted && (
        <div style={{ marginTop: '2rem' }}>
          <p>{translated}</p>
          <button onClick={handleEdit}>Edit</button>
        </div>
      )}
      
      {/* Status Bar */}
      <AIStatusBar 
        browserSupported={browserSupported}
        bootstrapStatus={bootstrapStatus}
        bootstrapProgress={bootstrapProgress}
      />
    </div>
  );
}

export default App;
