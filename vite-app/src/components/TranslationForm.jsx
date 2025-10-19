function TranslationForm({ 
  input, 
  onInputChange, 
  onTranslate, 
  detectedLang, 
  isDisabled,
  supportedLanguages = ['te', 'ta'] // Default for backward compatibility
}) {
  const hasError = (detectedLang === null || (detectedLang && !supportedLanguages.includes(detectedLang))) && input.trim();

  // Generate dynamic help text based on supported languages
  const getHelpText = () => {
    const languageNames = {
      'te': 'Telugu',
      'ta': 'Tamil',
      'en': 'English',
      'hi': 'Hindi',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'it': 'Italian',
      'pt': 'Portuguese',
      'ru': 'Russian',
      'ja': 'Japanese',
      'ko': 'Korean',
      'zh': 'Chinese',
      'ar': 'Arabic'
    };

    const supportedLanguageNames = supportedLanguages
      .map(lang => languageNames[lang] || lang)
      .join(' or ');
    
    return `Enter text in ${supportedLanguageNames} to translate to English`;
  };

  return (
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
              hasError
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            placeholder="Type your text here..."
            value={input}
            onChange={onInputChange}
            aria-describedby="input-help"
          />
          {hasError ? (
            <p id="input-help" className="mt-1 text-sm text-red-600 font-medium">
              Unsupported language
            </p>
          ) : (
            <p id="input-help" className="mt-1 text-sm text-gray-500">
              {getHelpText()}
            </p>
          )}
        </div>
        <button 
          onClick={onTranslate} 
          disabled={isDisabled}
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
  );
}

export default TranslationForm;
