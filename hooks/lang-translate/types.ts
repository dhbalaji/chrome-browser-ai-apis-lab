export type TranslationResult = {
  translatedText: string;
  detectedSourceLanguage?: string;
};

export type TranslatorType = {
  translate(
    text: string,
    targetLanguage?: string,
    options?: {
      formality?: "formal" | "informal";
      sourceLanguage?: string;
    },
  ): Promise<TranslationResult>;

  destroy?(): void;
};

export type TranslatorReturnType = {
  translate: (
    text: string,
    targetLanguage?: string,
    options?: { formality?: "formal" | "informal"; sourceLanguage?: string },
  ) => Promise<string | null>;
  getAvailabilityStatus: (sourceLanguage: string, targetLanguage: string) => AvailabilityStatus;
  destroy: () => void;
}

export type AvailabilityStatus = "available" | "downloadable" | "downloading" | "unavailable" | "checking";

