export type TranslationResult = {
  translatedText: string;
  detectedSourceLanguage?: string;
};

export type TranslatorType = {
  translate(
    text: string,
    options?: {
      sourceLanguage?: string;
      formality?: "formal" | "informal";
    },
    targetLanguage?: string
  ): Promise<TranslationResult>;

  destroy?(): void;
};

export type TranslatorReturnType = {
  translate: (
    text: string,
    options?: { formality?: "formal" | "informal" },
    targetLanguage?: string
  ) => Promise<string | null>;
}

export type AvailabilityStatus = "available" | "downloadable" | "downloading" | "unavailable";

