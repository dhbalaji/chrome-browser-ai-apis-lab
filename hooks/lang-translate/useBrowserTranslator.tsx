import { useEffect, useCallback, useRef, useState } from "react";
import { AvailabilityStatus, TranslatorReturnType, TranslatorType, LanguagePair, LanguagePairStatus } from "./types";

declare global {
  interface Window {
    Translator: {
      availability(config?: { sourceLanguage?: string; targetLanguage?: string }): Promise<AvailabilityStatus>;
      create(config?: any): Promise<TranslatorType>;
    };
    isSecureContext: boolean;
  }
}

export function useBrowserTranslator(
  config?: {
    sourceLanguage?: string;
    targetLanguage?: string;
    bootstrapLanguages?: LanguagePair[];
  }
): TranslatorReturnType {
  const { sourceLanguage, targetLanguage: defaultTargetLanguage = "en", bootstrapLanguages = [] } = config || {};
  const translatorInstanceRef = useRef<TranslatorType | null>(null);
  const [languagePairs, setLanguagePairs] = useState<LanguagePairStatus[]>([]);

  function canUseTranslator(): boolean {
    return (
      typeof window !== "undefined" &&
      "Translator" in window &&
      window.isSecureContext
    );
  }

  async function getTranslatorAvailability(sourceLang: string, targetLang: string): Promise<AvailabilityStatus> {
    if (!canUseTranslator()) return "unavailable";
    try {
      return await window.Translator.availability({
        sourceLanguage: sourceLang,
        targetLanguage: targetLang,
      });
    } catch {
      return "unavailable";
    }
  }

  async function createTranslator(sourceLang: string, targetLang: string): Promise<TranslatorType> {
    return await window.Translator.create({
      sourceLanguage: sourceLang,
      targetLanguage: targetLang,
    });
  }

  const bootstrapLanguagePairs = useCallback(async (pairs: LanguagePair[]) => {
    if (!canUseTranslator()) return;

    const pairStatuses: LanguagePairStatus[] = [];

    for (const pair of pairs) {
      const status = await getTranslatorAvailability(pair.sourceLanguage, pair.targetLanguage);

      let translator: TranslatorType | undefined;
      if (status === "available" || status === "downloadable" || status === "downloading") {
        try {
          translator = await createTranslator(pair.sourceLanguage, pair.targetLanguage);
        } catch (error) {
          console.warn(`Failed to create translator for ${pair.sourceLanguage} -> ${pair.targetLanguage}:`, error);
        }
      }

      pairStatuses.push({
        pair,
        status,
        translator
      });
    }

    setLanguagePairs(pairStatuses);
  }, []);

  const getAvailabilityStatus = useCallback((sourceLang: string, targetLang: string): AvailabilityStatus => {
    const pair = languagePairs.find(p =>
      p.pair.sourceLanguage === sourceLang && p.pair.targetLanguage === targetLang
    );
    return pair?.status || "checking";
  }, [languagePairs]);

  // Initialize default translator if sourceLanguage and targetLanguage are provided
  useEffect(() => {
    let mounted = true;

    async function initializeDefaultTranslator() {
      if (!canUseTranslator() || !sourceLanguage) return;

      const availability = await getTranslatorAvailability(sourceLanguage, defaultTargetLanguage);

      if (availability === "available") {
        const translator = await createTranslator(sourceLanguage, defaultTargetLanguage);
        if (mounted) translatorInstanceRef.current = translator;
      } else if (availability === "downloadable" || availability === "downloading") {
        const translator = await createTranslator(sourceLanguage, defaultTargetLanguage);
        if (mounted) translatorInstanceRef.current = translator;
      }
    }

    initializeDefaultTranslator();

    return () => {
      mounted = false;
      if (translatorInstanceRef.current?.destroy) translatorInstanceRef.current.destroy();
      translatorInstanceRef.current = null;
    };
  }, [sourceLanguage, defaultTargetLanguage]);

  // Bootstrap language pairs on mount if provided
  useEffect(() => {
    if (bootstrapLanguages.length > 0) {
      bootstrapLanguagePairs(bootstrapLanguages);
    }
  }, [bootstrapLanguages, bootstrapLanguagePairs]);

  const translate = useCallback(
    async (
      text: string,
      options?: { formality?: "formal" | "informal" },
      targetLanguage = defaultTargetLanguage
    ): Promise<string | null> => {
      // Try to find a translator for the specific language pair
      const pair = languagePairs.find(p =>
        p.pair.sourceLanguage === sourceLanguage && p.pair.targetLanguage === targetLanguage
      );

      const translatorToUse = pair?.translator || translatorInstanceRef.current;

      if (!translatorToUse) {
        console.warn("Translator instance is not initialized.");
        return null;
      }

      try {
        const result = await translatorToUse.translate(text, options, targetLanguage);
        return result.toString() ?? null;
      } catch {
        return null;
      }
    },
    [sourceLanguage, defaultTargetLanguage, languagePairs]
  );

  const destroy = useCallback(() => {
    // Destroy the main translator instance
    if (translatorInstanceRef.current?.destroy) {
      translatorInstanceRef.current.destroy();
      translatorInstanceRef.current = null;
    }

    // Destroy all language pair translators
    languagePairs.forEach(pair => {
      if (pair.translator?.destroy) {
        pair.translator.destroy();
      }
    });

    // Clear the language pairs state
    setLanguagePairs([]);
  }, [languagePairs]);

  return {
    translate,
    languagePairs,
    getAvailabilityStatus,
    bootstrapLanguagePairs,
    destroy
  };
}

export default useBrowserTranslator;
