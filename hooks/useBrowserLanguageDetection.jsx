import { useEffect, useCallback, useRef } from "react";

/**
 * Custom React hook for detecting the language of a text input using
 * the Chrome Language Detector API.
 *
 * This hook handles API availability, model download state, and cleanup
 * internally, exposing a single async detection function.
 *
 * @param {string[]} [expectedLanguages] - Optional array of BCP-47 language codes
 *   to optimize language detection. For example: ["en", "hi", "te"].
 *   If omitted, detection works without hints.
 *
 * @returns {(inputText: string) => Promise<string|null>} detectLanguage 
 *   An async function which accepts input text and returns the top detected
 *   language code string, or null if detection fails or API is unavailable.
 */
export function useBrowserLanguageDetection(expectedLanguages) {
  const languageDetectorInstanceRef = useRef(null);

  /**
   * Checks if the Language Detector API is supported and running in a secure context.
   * @returns {boolean}
   */
  function isLanguageDetectorApiSupported() {
    return (
      typeof window !== "undefined" &&
      "LanguageDetector" in window &&
      window.isSecureContext
    );
  }

  /**
   * Safely retrieves the availability status of the language detector model.
   * Possible return values: "available", "downloadable", "downloading", "unavailable".
   * @returns {Promise<string>}
   */
  async function getDetectorAvailability() {
    try {
      return await window.LanguageDetector.availability();
    } catch {
      return "unavailable";
    }
  }

  /**
   * Creates a new LanguageDetector instance.
   * Attaches an optional download progress event listener.
   *
   * @param {Function|null} onDownloadProgress Optional callback for download progress.
   * @param {string[]|undefined} expectedInputLanguages Optional expected languages for optimization.
   * @returns {Promise<LanguageDetector>}
   */
  async function createLanguageDetector(onDownloadProgress, expectedInputLanguages) {
    const config = onDownloadProgress
      ? {
          monitor(monitor) {
            monitor.addEventListener("downloadprogress", onDownloadProgress);
          },
          expectedInputLanguages,
        }
      : {
          expectedInputLanguages,
        };

    return await window.LanguageDetector.create(config);
  }

  // Asynchronously setup the LanguageDetector instance on mount
  useEffect(() => {
    let componentIsMounted = true;

    async function initializeLanguageDetector() {
      if (!isLanguageDetectorApiSupported()) {
        console.error(
          "LanguageDetector API is not supported or not available in this secure context."
        );
        return;
      }

      const availability = await getDetectorAvailability();

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
        console.error(
          `LanguageDetector API is not usable. Availability status: ${availability}`
        );
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
   *
   * @param {string} inputText The text to detect language for.
   * @returns {Promise<string|null>} Detected language or null.
   */
  const detectLanguage = useCallback(async (inputText) => {
    try {
      if (!languageDetectorInstanceRef.current) return null;
      const detectionResults = await languageDetectorInstanceRef.current.detect(
        inputText
      );
      return detectionResults?.[0]?.detectedLanguage || null;
    } catch {
      return null;
    }
  }, []);

  return detectLanguage;
}
