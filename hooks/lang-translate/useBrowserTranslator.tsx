import { useEffect, useCallback, useRef } from "react";
import { AvailabilityStatus, TranslatorReturnType, TranslatorType } from "./types";

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
  }
): TranslatorReturnType {
  const { sourceLanguage, targetLanguage: defaultTargetLanguage = "en" } = config || {};
  const translatorInstanceRef = useRef<TranslatorType | null>(null);

  function canUseTranslator(): boolean {
    return (
      typeof window !== "undefined" &&
      "Translator" in window &&
      window.isSecureContext
    );
  }

  async function getTranslatorAvailability(): Promise<AvailabilityStatus> {
    if (!canUseTranslator()) return "unavailable";
    try {
      return await window.Translator.availability({
        sourceLanguage,
        targetLanguage: defaultTargetLanguage,
      });
    } catch {
      return "unavailable";
    }
  }

  async function createTranslator(): Promise<TranslatorType> {
    return await window.Translator.create({
      sourceLanguage,
      targetLanguage: defaultTargetLanguage,
    });
  }

  useEffect(() => {
    let mounted = true;

    async function initializeTranslator() {
      if (!canUseTranslator()) return;

      const availability = await getTranslatorAvailability();

      if (availability === "available") {
        const translator = await createTranslator();
        if (mounted) translatorInstanceRef.current = translator;
      } else if (availability === "downloadable" || availability === "downloading") {
        const translator = await createTranslator();
        if (mounted) translatorInstanceRef.current = translator;
      }
    }

    initializeTranslator();

    return () => {
      mounted = false;
      if (translatorInstanceRef.current?.destroy) translatorInstanceRef.current.destroy();
      translatorInstanceRef.current = null;
    };
  }, [sourceLanguage, defaultTargetLanguage]);

  const translate = useCallback(
    async (
      text: string,
      options?: { formality?: "formal" | "informal" },
      targetLanguage = defaultTargetLanguage
    ): Promise<string | null> => {

      if (!translatorInstanceRef.current) {
        console.warn("Translator instance is not initialized.");
        return null;
      }
      try {
        const result = await translatorInstanceRef.current.translate(text, options, targetLanguage);
        return result.toString() ?? null;
      } catch {
        return null;
      }
    },
    [defaultTargetLanguage]
  );

  return {
    translate
  };
}

export default useBrowserTranslator;
