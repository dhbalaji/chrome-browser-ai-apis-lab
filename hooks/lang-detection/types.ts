export type LanguageDetectorResult = {
  detectedLanguage: string;
  confidence: number;
};

export type LanguageDetectorType = {
  detect(text: string): Promise<LanguageDetectorResult[]>;
  destroy?(): void;
};

export type AvailabilityStatus = "available" | "downloadable" | "downloading" | "unavailable" | "checking";

export type LanguageDetectorReturnType = {
  detectLanguage: (inputText: string) => Promise<string | null>;
  availabilityStatus: AvailabilityStatus;
  destroy: () => void;
};
