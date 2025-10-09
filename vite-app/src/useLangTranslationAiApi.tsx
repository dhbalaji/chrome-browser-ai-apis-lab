function useLangTranslationAiApi() {
    var translatorCapabilities;
    async function translationSetup() {
        translatorCapabilities = await Translator.availability({
            sourceLanguage: 'ta',
            targetLanguage: 'en',
        });
    }

var translator = await Translator.create({
    sourceLanguage: 'ta',
    targetLanguage: 'en',
    monitor(m) {
        m.addEventListener('downloadprogress', (e) => {
            console.log(`Downloaded ${e.loaded * 100}%`);
        }
        );
    },
});

const outputText;

function translateText(someUserText) {
    var stream = translator.translateStreaming(someUserText);
for await (var chunk of stream) {
  outputText = chunk;
}
}

    return "Hello World";
}