import { useState, useEffect } from 'react';
import './App.css';
import useBrowserLanguageDetection from '../../hooks/lang-detection/useBrowserLanguageDetection';
import useBrowserTranslator from '../../hooks/lang-translate/useBrowserTranslator';
import AIStatusBar from './AIStatusBar';
import { colors } from './colors';

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
          setBootstrapProgress(parseFloat(Math.min(progress, 100)).toFixed(2));
        }, 200);
      }, 5000);
    }
  }, []); // Empty dependency array - only run once on mount

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
        backgroundColor: colors.default.background,
        border: `1px solid ${colors.default.border}`,
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '20px',
        fontSize: '14px'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px', color: colors.default.text }}>
          API Status
        </div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: colors[langDetectionStatus]?.background || colors.default.background
            }}></div>
            <span style={{ color: colors.default.text }}>Language Detection:</span>
            <span style={{ fontWeight: '500', color: colors[langDetectionStatus]?.text || colors.default.text }}>
              {langDetectionStatus}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: colors[translationStatus]?.background || colors.default.background
            }}></div>
            <span style={{ color: colors.default.text }}>Translation:</span>
            <span style={{ fontWeight: '500', color: colors[translationStatus]?.text || colors.default.text }}>
              {translationStatus}
            </span>
          </div>
        </div>
      </div>

      {!accepted && (
        <>
          
          <textarea
            rows={4}
            style={{ width: '100%', border: "1px solid white" }}
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

