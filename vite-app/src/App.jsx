import { useState, useEffect } from 'react';
import './App.css';
import useBrowserLanguageDetection from '../../hooks/lang-detection/useBrowserLanguageDetection';
import useBrowserTranslator from '../../hooks/lang-translate/useBrowserTranslator';
import AIStatusBar from './AIStatusBar';

function App() {
  const [input, setInput] = useState('');
  const [translated, setTranslated] = useState('');
  const [selectedLang, setSelectedLang] = useState('te'); // Default to Telugu
  const [detectedLang, setDetectedLang] = useState(null); // Track actually detected language
  const [langDetectionStatus, setLangDetectionStatus] = useState('checking');
  const [translationStatus, setTranslationStatus] = useState('checking');

  // Status bar states
  const [browserSupported, setBrowserSupported] = useState(false);
  const [bootstrapStatus, setBootstrapStatus] = useState('checking');
  const [bootstrapProgress, setBootstrapProgress] = useState(0);

  const { detectLanguage, availabilityStatus: langDetectionStatusFromHook } = useBrowserLanguageDetection();

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

  // Detect language when input changes
  const handleInputChange = async (e) => {
    const text = e.target.value;
    setInput(text);
    
    if (text.trim()) {
      try {
        const detected = await detectLanguage(text);
        setDetectedLang(detected);
      } catch (error) {
        console.error('Language detection failed:', error);
        setDetectedLang(null);
      }
    } else {
      setDetectedLang(null);
    }
  };

  const handleTranslate = async () => {
    // Translate input text to English by default, no second argument needed
    const translatedText = await translate(input); 
    setTranslated(translatedText ?? '');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto pb-20">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">AI Translation Hub</h1>
          <p className="text-lg text-gray-600">Powered by Chrome Browser AI APIs</p>
        </header>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Translation Form */}
          <div className="space-y-6">
            <section aria-labelledby="translation-form-heading" className="bg-white shadow-lg border border-gray-200 rounded-xl p-6 h-fit">
                <h2 id="translation-form-heading" className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Translation Form
                </h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="input-text" className="block text-sm font-medium text-gray-700 mb-2">
                      Enter text to translate
                    </label>
                    <textarea
                      id="input-text"
                      rows={6}
                      className={`w-full border rounded-lg p-4 resize-none focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 shadow-sm text-black ${
                        detectedLang && detectedLang !== 'te' && detectedLang !== 'ta' && input.trim()
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      placeholder="Type your text here..."
                      value={input}
                      onChange={handleInputChange}
                      aria-describedby="input-help"
                    />
                    {detectedLang && detectedLang !== 'te' && detectedLang !== 'ta' && input.trim() ? (
                      <p id="input-help" className="mt-1 text-sm text-red-600 font-medium">
                        Unsupported language
                      </p>
                    ) : (
                      <p id="input-help" className="mt-1 text-sm text-gray-500">
                        Enter text in Telugu or Tamil to translate to English
                      </p>
                    )}
                  </div>
                  <button 
                    onClick={handleTranslate} 
                    disabled={!input.trim() || (detectedLang && detectedLang !== 'te' && detectedLang !== 'ta')}
                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    aria-describedby="translate-help"
                  >
                    <span className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                      Translate Text
                    </span>
                  </button>
                  <p id="translate-help" className="text-sm text-gray-500 text-center">
                    Click to translate your text using AI-powered language services
                  </p>
                </div>
              </section>
          </div>

          {/* Right Column - Translation Results */}
          <div className="space-y-6">
            <section aria-labelledby="translation-results-heading" className="bg-white shadow-lg border border-gray-200 rounded-xl p-6 h-fit">
              <h2 id="translation-results-heading" className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Translation Results
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-sm font-medium text-blue-800 mb-1">Detected Language</div>
                  <div className="text-lg font-semibold text-blue-900">
                    {!input.trim() ? 'No text entered' : 
                     !detectedLang ? 'Detecting...' :
                     detectedLang === 'te' ? 'Telugu (తెలుగు)' :
                     detectedLang === 'ta' ? 'Tamil (தமிழ்)' :
                     'Language not supported'}
                  </div>
                </div>
                <div>
                  <label htmlFor="translated-text" className="block text-sm font-medium text-gray-700 mb-2">
                    Translated Text
                  </label>
                  <textarea 
                    id="translated-text"
                    rows={6} 
                    className="text-black w-full border border-gray-300 rounded-lg p-4 resize-none bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500" 
                    value={translated} 
                    readOnly 
                    aria-describedby="translation-help"
                    placeholder="Translation will appear here..."
                  />
                  <p id="translation-help" className="mt-1 text-sm text-gray-500">
                    {translated ? 'This is the AI-generated translation of your input text' : 'Enter text in the left column and click translate to see results here'}
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      
        {/* Status Bar */}
        <AIStatusBar 
          browserSupported={browserSupported}
          bootstrapStatus={bootstrapStatus}
          bootstrapProgress={bootstrapProgress}
          langDetectionStatus={langDetectionStatus}
          translationStatus={translationStatus}
        />
      </div>
    </div>
  );
}

export default App;

