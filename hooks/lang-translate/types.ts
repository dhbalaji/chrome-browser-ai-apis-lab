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

export type LanguagePair = {
  sourceLanguage: string;
  targetLanguage: string;
};

export type LanguagePairStatus = {
  pair: LanguagePair;
  status: AvailabilityStatus;
  translator?: TranslatorType;
};

export type TranslatorReturnType = {
  translate: (
    text: string,
    options?: { formality?: "formal" | "informal" },
    targetLanguage?: string
  ) => Promise<string | null>;
  languagePairs: LanguagePairStatus[];
  getAvailabilityStatus: (sourceLanguage: string, targetLanguage: string) => AvailabilityStatus;
  bootstrapLanguagePairs: (pairs: LanguagePair[]) => Promise<void>;
}

export type AvailabilityStatus = "available" | "downloadable" | "downloading" | "unavailable" | "checking";

