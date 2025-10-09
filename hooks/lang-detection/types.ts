export type LanguageDetectorResult = {
  detectedLanguage: string;
  confidence: number;
};

export type LanguageDetectorType = {
  detect(text: string): Promise<LanguageDetectorResult[]>;
  destroy?(): void;
};

export type AvailabilityStatus = "available" | "downloadable" | "downloading" | "unavailable";
