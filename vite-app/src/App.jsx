import { useState } from 'react';
import './App.css';
import useBrowserLanguageDetection from '../../hooks/lang-detection/useBrowserLanguageDetection';
import useBrowserTranslator from '../../hooks/lang-translate/useBrowserTranslator';

function App() {
  const [input, setInput] = useState('');
  const [translated, setTranslated] = useState('');
  const [showOutput, setShowOutput] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [detectedLang, setDetectedLang] = useState('');

  const detectLanguage = useBrowserLanguageDetection(); // No language array needed

  // Provide single source and target language as strings in config
  const { translate } = useBrowserTranslator({
    sourceLanguage: detectedLang || 'te', // use detected lang or 'auto'
    targetLanguage: 'en',                    // translate to English by default
  });

  const handleTranslate = async () => {
    // Detect source language first
    const lang = await detectLanguage(input);
    setDetectedLang(lang);

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
    <div style={{ maxWidth: 500, margin: '2rem auto' }}>
      {!accepted && (
        <>
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
            <strong>Detected Language:</strong> {detectedLang}
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
    </div>
  );
}

export default App;
