/**
 * Image quality and optimization settings
 * Used for adaptive image loading based on device and network conditions
 */

/**
 * Quality settings for image optimization
 */
export interface QualitySettings {
  /** Maximum width for the image */
  maxWidth: number;
  /** Image quality (0-100) */
  quality: number;
  /** Preferred image format */
  format: 'webp' | 'jpeg' | 'auto';
}

/**
 * Device capability information for quality adaptation
 */
export interface DeviceCapabilities {
  /** Screen width in pixels */
  screenWidth: number;
  /** Screen height in pixels */
  screenHeight: number;
  /** Device pixel ratio */
  devicePixelRatio: number;
  /** Available memory in GB (if supported) */
  memory?: number;
  /** Number of CPU cores (if supported) */
  cores?: number;
  /** Whether WebP is supported */
  supportsWebP: boolean;
  /** Whether AVIF is supported */
  supportsAVIF: boolean;
}

/**
 * Quality presets for different scenarios
 */
export const QualityPresets = {
  LOW: {
    maxWidth: 400,
    quality: 60,
    format: 'jpeg' as const,
  },
  MEDIUM: {
    maxWidth: 800,
    quality: 75,
    format: 'webp' as const,
  },
  HIGH: {
    maxWidth: 1200,
    quality: 85,
    format: 'webp' as const,
  },
  ULTRA: {
    maxWidth: 2000,
    quality: 95,
    format: 'webp' as const,
  },
} as const;

/**
 * Network-based quality mapping
 */
export const NetworkQualityMap = {
  slow: QualityPresets.LOW,
  medium: QualityPresets.MEDIUM,
  fast: QualityPresets.HIGH,
} as const;