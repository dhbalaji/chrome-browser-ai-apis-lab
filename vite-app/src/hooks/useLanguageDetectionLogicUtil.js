import { useState, useCallback } from 'react';
import useBrowserLanguageDetection from '../../../hooks/lang-detection/useBrowserLanguageDetection';

function useLanguageDetectionLogic() {
  const [input, setInput] = useState('');
  const [detectedLang, setDetectedLang] = useState(null);
  
  const { detectLanguage } = useBrowserLanguageDetection();

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
    return !input.trim() || detectedLang === null || (detectedLang && detectedLang !== 'te' && detectedLang !== 'ta');
  }, [input, detectedLang]);

  return {
    input,
    detectedLang,
    handleInputChange,
    isTranslateDisabled: isTranslateDisabled()
  };
}

export default useLanguageDetectionLogic;
