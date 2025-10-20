import { useEffect, useCallback, useRef, useState } from "react";
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
  const currentSourceLangRef = useRef<string | null>(null);
  // simplified: no languagePairs state

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

  const bootstrapLanguagePairs = useCallback(async (_pairs: any[]) => { return; }, []);

  const getAvailabilityStatus = useCallback((_sourceLang: string, _targetLang: string): AvailabilityStatus => {
    return canUseTranslator() ? "available" : "unavailable";
  }, []);

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

  // Multi-pair bootstrapping removed

  const translate = useCallback(
    async (
      text: string,
      targetLanguage = defaultTargetLanguage,
      options?: { formality?: "formal" | "informal"; sourceLanguage?: string }
    ): Promise<string | null> => {
      const effectiveSourceLanguage = options?.sourceLanguage || sourceLanguage;
      if (!effectiveSourceLanguage) return null;

      // Ensure translator is initialized for the effective source language
      if (!translatorInstanceRef.current || currentSourceLangRef.current !== effectiveSourceLanguage) {
        const availability = await getTranslatorAvailability(effectiveSourceLanguage, targetLanguage);
        if (availability === "unavailable") return null;
        try {
          translatorInstanceRef.current = await createTranslator(effectiveSourceLanguage, targetLanguage);
          currentSourceLangRef.current = effectiveSourceLanguage;
        } catch {
          return null;
        }
      }

      try {
        const anyTranslator: any = translatorInstanceRef.current;
        const result = await anyTranslator.translate(text);
        if (typeof result === 'string') return result;
        return result?.translatedText ?? null;
      } catch {
        return null;
      }
    },
    [sourceLanguage, defaultTargetLanguage]
  );

  const destroy = useCallback(() => {
    // Destroy the main translator instance
    if (translatorInstanceRef.current?.destroy) {
      translatorInstanceRef.current.destroy();
      translatorInstanceRef.current = null;
    }
  }, []);

  return {
    translate,
    getAvailabilityStatus,
    destroy
  };
}

export default useBrowserTranslator;
