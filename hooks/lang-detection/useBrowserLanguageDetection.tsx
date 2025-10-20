import { useEffect, useCallback, useRef, useState } from "react";
import { AvailabilityStatus, LanguageDetectorType, LanguageDetectorReturnType } from "./types";

// Global type augmentation for Chrome LanguageDetector API
declare global {
  interface Window {
    LanguageDetector: {
      availability(): Promise<AvailabilityStatus>;
      create(config: LanguageDetectorConfig): Promise<LanguageDetectorType>;
    };
    isSecureContext: boolean;
  }
}

// Configuration type for LanguageDetector creation
interface LanguageDetectorConfig {
  monitor?: (monitor: EventTarget) => void;
  expectedInputLanguages?: string[];
}

/**
 * Custom React hook for detecting the language of text input using Chrome's Language Detector API.
 * 
 * Features:
 * - Safe SSR compatibility (Next.js, etc.)
 * - Automatic API availability checking
 * - Model download progress handling
 * - Resource cleanup on unmount
 * - Confidence-based language detection with ambiguity handling
 *
 * @param expectedLanguages - Optional BCP-47 language codes to optimize detection
 * @returns Object with detection function, availability status, and cleanup function
 */
export function useBrowserLanguageDetection(
  expectedLanguages?: string[]
): LanguageDetectorReturnType {
  // Instance reference for the LanguageDetector
  const detectorRef = useRef<LanguageDetectorType | null>(null);

  // Current availability status of the API
  const [availabilityStatus, setAvailabilityStatus] = useState<AvailabilityStatus>("checking");

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  /**
   * Checks if the Language Detector API is available in the current environment.
   * Requires: client-side execution, API presence, and secure context (HTTPS).
   */
  const isAPIAvailable = useCallback((): boolean => {
    return (
      typeof window !== "undefined" &&
      "LanguageDetector" in window &&
      window.isSecureContext
    );
  }, []);

  /**
   * Safely checks the availability status of the Language Detector API.
   * Returns "unavailable" if API is not supported or if an error occurs.
   */
  const checkAPIAvailability = useCallback(async (): Promise<AvailabilityStatus> => {
    if (!isAPIAvailable()) {
      return "unavailable";
    }

    try {
      return await window.LanguageDetector.availability();
    } catch (error) {
      console.warn("Failed to check Language Detector availability:", error);
      return "unavailable";
    }
  }, [isAPIAvailable]);

  /**
   * Creates a new LanguageDetector instance with optional configuration.
   * 
   * @param onDownloadProgress - Optional callback for download progress events
   * @param expectedLanguages - Optional language hints for better detection
   * @returns Promise resolving to LanguageDetector instance
   */
  const createDetectorInstance = useCallback(async (
    onDownloadProgress?: (event: ProgressEvent) => void,
    expectedLanguages?: string[]
  ): Promise<LanguageDetectorType> => {
    // Ensure expectedLanguages is a valid array
    let validExpectedLanguages: string[] | undefined = undefined;
    
    if (Array.isArray(expectedLanguages) && expectedLanguages.length > 0) {
      // Create a new array to ensure it's properly formatted
      validExpectedLanguages = [...expectedLanguages];
    }
    
    
    const config: LanguageDetectorConfig = {};
    
    // Only add expectedInputLanguages if we have valid languages
    if (validExpectedLanguages) {
      config.expectedInputLanguages = validExpectedLanguages;
    }

    // Add download progress monitoring if callback provided
    if (onDownloadProgress) {
      config.monitor = (monitor: EventTarget) => {
        monitor.addEventListener("downloadprogress", (e) =>
          onDownloadProgress(e as ProgressEvent)
        );
      };
    }

    try {
      return await window.LanguageDetector.create(config);
    } catch (error) {
      console.error('Failed to create LanguageDetector:', error);
      throw error;
    }
  }, []);

  // ============================================================================
  // INITIALIZATION LOGIC
  // ============================================================================

  useEffect(() => {
    let isMounted = true;

    const initializeDetector = async () => {
      // Check API availability first
      if (!isAPIAvailable()) {
        if (isMounted) {
          setAvailabilityStatus("unavailable");
        }
        return;
      }

      try {
        // Get current availability status
        const status = await checkAPIAvailability();

        if (isMounted) {
          setAvailabilityStatus(status);
        }

        // Create detector instance based on availability
        if (status === "available") {
          const detector = await createDetectorInstance(undefined, expectedLanguages);
          if (isMounted) {
            detectorRef.current = detector;
          }
        } else if (status === "downloadable" || status === "downloading") {
          // Create detector with download progress monitoring
          const detector = await createDetectorInstance(() => { }, expectedLanguages);
          if (isMounted) {
            detectorRef.current = detector;
          }
        }
      } catch (error) {
        console.error("Failed to initialize Language Detector:", error);
        if (isMounted) {
          setAvailabilityStatus("unavailable");
        }
      }
    };

    initializeDetector();

    // Cleanup function
    return () => {
      isMounted = false;
      if (detectorRef.current?.destroy) {
        detectorRef.current.destroy();
      }
      detectorRef.current = null;
    };
  }, [expectedLanguages, isAPIAvailable, checkAPIAvailability, createDetectorInstance]);

  // ============================================================================
  // LANGUAGE DETECTION LOGIC
  // ============================================================================

  /**
   * Detects the language of input text using confidence-based analysis.
   * 
   * Algorithm:
   * 1. Find the result with highest confidence
   * 2. Check for ambiguous results (similar confidence levels)
   * 3. Return null if multiple languages have similar confidence
   * 4. Return the detected language code if confidence is clear
   * 
   * @param inputText - Text to analyze for language detection
   * @returns BCP-47 language code or null if ambiguous/unavailable
   */
  const detectLanguage = useCallback(async (inputText: string): Promise<string | null> => {
    try {
      // Check if detector is available
      if (!detectorRef.current) {
        return null;
      }

      // Get detection results from the API
      const results = await detectorRef.current.detect(inputText);

      // Handle empty or invalid results
      if (!results || results.length === 0) {
        return null;
      }

      // Find the result with the highest confidence
      const bestResult = results.reduce((highest, current) =>
        current.confidence > highest.confidence ? current : highest
      );

      // Check for ambiguous results (similar confidence levels)
      const CONFIDENCE_THRESHOLD = 0.1;
      const ambiguousResults = results.filter(result =>
        Math.abs(result.confidence - bestResult.confidence) <= CONFIDENCE_THRESHOLD
      );

      // Return null if multiple languages have similar confidence
      if (ambiguousResults.length > 1) {
        return null;
      }

      return bestResult.detectedLanguage;
    } catch (error) {
      console.error("Language detection failed:", error);
      return null;
    }
  }, []);

  // ============================================================================
  // CLEANUP AND RETURN
  // ============================================================================

  /**
   * Destroys the LanguageDetector instance and resets the availability status.
   * This should be called when the detector is no longer needed to free up resources.
   */
  const destroy = useCallback(() => {
    if (detectorRef.current?.destroy) {
      detectorRef.current.destroy();
      detectorRef.current = null;
    }
    setAvailabilityStatus("checking");
  }, []);

  return {
    detectLanguage,
    availabilityStatus,
    destroy
  };
}

export default useBrowserLanguageDetection;
