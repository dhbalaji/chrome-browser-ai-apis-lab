import { useState, useCallback } from 'react';
import useBrowserLanguageDetection from '../../../hooks/lang-detection/useBrowserLanguageDetection';

function useLanguageDetectionLogic(config = {}) {
  const [input, setInput] = useState('');
  const [detectedLang, setDetectedLang] = useState(null);
  
  // Extract supported languages from config, default to ['te', 'ta'] for backward compatibility
  const supportedLanguages = config.expectedLanguages || ['te', 'ta'];
  
  const { detectLanguage } = useBrowserLanguageDetection(config);

  const handleInputChange = useCallback(async (e) => {
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
  }, [detectLanguage]);

  const isTranslateDisabled = useCallback(() => {
    return !input.trim() || detectedLang === null || (detectedLang && !supportedLanguages.includes(detectedLang));
  }, [input, detectedLang, supportedLanguages]);

  return {
    input,
    detectedLang,
    handleInputChange,
    isTranslateDisabled: isTranslateDisabled()
  };
}

export default useLanguageDetectionLogic;
