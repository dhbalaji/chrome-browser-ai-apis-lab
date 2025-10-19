import { useEffect, useCallback, useRef, useState } from "react";
import { AvailabilityStatus, LanguageDetectorType } from "./types";

// Add global type augmentation for LanguageDetector
declare global {
  interface Window {
    LanguageDetector: {
      availability(): Promise<AvailabilityStatus>;
      create(config: any): Promise<LanguageDetectorType>;
    };
    isSecureContext: boolean;
  }
}

/**
 * Custom React hook for detecting the language of a text input using
 * the Chrome Language Detector API. Works safely in SSR environments like Next.js.
 *
 * This hook handles API availability, model download state, and cleanup
 * internally, exposing a detection function and availability status.
 *
 * @param expectedLanguages Optional array of BCP-47 language codes
 *   to optimize language detection. For example: ["en", "hi", "te"].
 *   If omitted, detection works without hints.
 *
 * @returns An object containing:
 *   - detectLanguage: An async function which accepts input text and returns the top detected
 *     language code string, or null if detection fails or API is unavailable.
 *   - availabilityStatus: The current availability status of the Language Detector API.
 */
export function useBrowserLanguageDetection(
  expectedLanguages?: string[]
): {
  detectLanguage: (inputText: string) => Promise<string | null>;
  availabilityStatus: AvailabilityStatus;
} {
  const languageDetectorInstanceRef = useRef<LanguageDetectorType | null>(null);
  const [availabilityStatus, setAvailabilityStatus] = useState<AvailabilityStatus>("checking");

  /**
   * Checks if the code runs client side and if the Language Detector API is supported.
   */
  function canUseLanguageDetector(): boolean {
    return (
      typeof window !== "undefined" &&
      "LanguageDetector" in window &&
      window.isSecureContext
    );
  }

  /**
   * Safely retrieves the availability status of the language detector model.
   * Possible return values: "available", "downloadable", "downloading", "unavailable".
   */
  async function getDetectorAvailability(): Promise<AvailabilityStatus> {
    if (!canUseLanguageDetector()) {
      return "unavailable";
    }
    try {
      return (await window.LanguageDetector.availability()) as AvailabilityStatus;
    } catch {
      return "unavailable";
    }
  }

  /**
   * Creates a new LanguageDetector instance.
   * Attaches an optional download progress event listener.
   *
   * @param onDownloadProgress Optional callback for download progress.
   * @param expectedInputLanguages Optional expected languages for optimization.
   */
  async function createLanguageDetector(
    onDownloadProgress: ((e: ProgressEvent) => void) | null,
    expectedInputLanguages?: string[]
  ): Promise<LanguageDetectorType> {
    const config = onDownloadProgress
      ? {
          monitor(monitor: EventTarget) {
            monitor.addEventListener("downloadprogress", (e) => onDownloadProgress(e as ProgressEvent));
          },
          expectedInputLanguages,
        }
      : {
          expectedInputLanguages,
        };
    return await window.LanguageDetector.create(config);
  }

  useEffect(() => {
    let componentIsMounted = true;

    async function initializeLanguageDetector() {
      if (!canUseLanguageDetector()) {
        // Avoid running on server or unsupported browsers
        if (componentIsMounted) {
          setAvailabilityStatus("unavailable");
        }
        return;
      }

      const availability = await getDetectorAvailability();
      
      if (componentIsMounted) {
        setAvailabilityStatus(availability);
      }

      if (availability === "available") {
        const detector = await createLanguageDetector(null, expectedLanguages);
        if (componentIsMounted) {
          languageDetectorInstanceRef.current = detector;
        }
      } else if (availability === "downloadable" || availability === "downloading") {
        const detector = await createLanguageDetector(() => {}, expectedLanguages);
        if (componentIsMounted) {
          languageDetectorInstanceRef.current = detector;
        }
      } else {
        // unavailable or unsupported
        return;
      }
    }

    initializeLanguageDetector();

    return () => {
      componentIsMounted = false;
      if (languageDetectorInstanceRef.current?.destroy) {
        languageDetectorInstanceRef.current.destroy();
      }
      languageDetectorInstanceRef.current = null;
    };
  }, [expectedLanguages]);

  /**
   * Detects the language of the provided input text using the initialized LanguageDetector.
   * Returns the most likely language's BCP-47 code or null if unavailable or detection fails.
   */
  const detectLanguage = useCallback(async (inputText: string): Promise<string | null> => {
    try {
      if (!languageDetectorInstanceRef.current) return null;
      const detectionResults = await languageDetectorInstanceRef.current.detect(inputText);
      return detectionResults?.[0]?.detectedLanguage || null;
    } catch {
      return null;
    }
  }, []);

  return { detectLanguage, availabilityStatus };
}

export default useBrowserLanguageDetection;
