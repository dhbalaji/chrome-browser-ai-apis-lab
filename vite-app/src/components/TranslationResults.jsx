function TranslationResults({ input, detectedLang, translated, supportedLanguages = ['te', 'ta'] }) {
 console.log("je", input, detectedLang, translated, supportedLanguages);
 
  const getDetectedLanguageText = () => {
    if (!input.trim()) return 'No text entered';
    if (detectedLang === null) return 'Unsupported language';
    
    // Check if detected language is supported
    if (supportedLanguages.includes(detectedLang)) {
      const languageNames = {
        'te': 'Telugu (తెలుగు)',
        'ta': 'Tamil (தமிழ்)',
        'en': 'English',
        'hi': 'Hindi (हिन्दी)',
        'es': 'Spanish (Español)',
        'fr': 'French (Français)',
        'de': 'German (Deutsch)',
        'it': 'Italian (Italiano)',
        'pt': 'Portuguese (Português)',
        'ru': 'Russian (Русский)',
        'ja': 'Japanese (日本語)',
        'ko': 'Korean (한국어)',
        'zh': 'Chinese (中文)',
        'ar': 'Arabic (العربية)'
      };
      
      return languageNames[detectedLang] || `${detectedLang.toUpperCase()}`;
    }
    
    return 'Unsupported language';
  };

  const getHelpText = () => {
    return translated 
      ? 'This is the AI-generated translation of your input text'
      : 'Enter text in the left column and click translate to see results here';
  };

  return (
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
            {getDetectedLanguageText()}
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
            {getHelpText()}
          </p>
        </div>
      </div>
    </section>
  );
}

export default TranslationResults;
