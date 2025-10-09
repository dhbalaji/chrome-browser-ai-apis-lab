import { use, useState } from 'react';
import './App.css';

function App() {
  const [input, setInput] = useState('');
  const [translated, setTranslated] = useState('');
  const [showOutput, setShowOutput] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const isLanguageDetectorAvailable = false;
  const isTranslationAvailable = false;

  useEffect(() => {
    // download for the first time
    const await LanguageDetector.create({
      monitor(m) {
        m.addEventListener('downloadprogress', (e) => {
          console.log(`Downloaded ${e.loaded * 100}%`);
        }
        );
      },
    });
  }, [])

  const handleTranslate = () => {
    // Simulate translation (replace with API call if needed)
    setTranslated(input.split('').reverse().join(''));
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
            onChange={e => setInput(e.target.value)}
          />
          <br />
          <button onClick={handleTranslate} style={{ marginTop: '1rem' }}>
            Translate
          </button>
        </>
      )}

      {showOutput && (
        <div style={{ marginTop: '2rem' }}>
          <textarea
            rows={4}
            style={{ width: '100%' }}
            value={translated}
            readOnly
          />
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