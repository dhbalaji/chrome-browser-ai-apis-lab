import { useState, useEffect } from 'react';
import './App.css';
import useBrowserLanguageDetection from '../../hooks/lang-detection/useBrowserLanguageDetection';
import useBrowserTranslator from '../../hooks/lang-translate/useBrowserTranslator';
import AIStatusBar from './AIStatusBar';
import Header from './components/Header';
import TranslationForm from './components/TranslationForm';
import TranslationResults from './components/TranslationResults';
import useLanguageDetectionLogic from './hooks/useLanguageDetectionLogicUtil';

function App() {
  const [translated, setTranslated] = useState('');
  const [selectedLang] = useState('te'); // Default to Telugu
  const [langDetectionStatus, setLangDetectionStatus] = useState('checking');
  const [translationStatus, setTranslationStatus] = useState('checking');

  // Status bar states
  const [browserSupported, setBrowserSupported] = useState(false);
  const [bootstrapStatus, setBootstrapStatus] = useState('checking');
  const [bootstrapProgress, setBootstrapProgress] = useState(0);

  // Use custom hook for language detection logic
  const { input, detectedLang, handleInputChange, isTranslateDisabled } = useLanguageDetectionLogic();

  const { availabilityStatus: langDetectionStatusFromHook, destroy: destroyLanguageDetector } = useBrowserLanguageDetection();

  // Provide single source and target language as strings in config
  const { translate, getAvailabilityStatus, destroy: destroyTranslator } = useBrowserTranslator({
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
    return () => destroyAllInstances();
  }, []); // Empty dependency array - only run once on mount

  const handleTranslate = async () => {
    // Translate input text to English by default, no second argument needed
    const translatedText = await translate(input);
    setTranslated(translatedText ?? '');
  };

  // Cleanup function to destroy all API instances
  const destroyAllInstances = () => {
    destroyLanguageDetector();
    destroyTranslator();
    console.log('All API instances destroyed');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto pb-20">
        <Header />

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Translation Form */}
          <div className="space-y-6">
            <TranslationForm
              input={input}
              onInputChange={handleInputChange}
              onTranslate={handleTranslate}
              detectedLang={detectedLang}
              isDisabled={isTranslateDisabled}
            />
          </div>

          {/* Right Column - Translation Results */}
          <div className="space-y-6">
            <TranslationResults
              input={input}
              detectedLang={detectedLang}
              translated={translated}
            />
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

