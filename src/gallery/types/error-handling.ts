/**
 * Error handling interfaces and types
 * Defines how errors are managed throughout the gallery system
 */

/**
 * Base error interface for gallery-specific errors
 */
export interface GalleryError extends Error {
  /** Error type for categorization */
  type: ErrorType;
  /** Error code for programmatic handling */
  code: string;
  /** Additional context about the error */
  context?: Record<string, any>;
  /** Whether this error is recoverable */
  recoverable: boolean;
  /** Suggested retry delay in milliseconds */
  retryDelay?: number;
}

/**
 * Types of errors that can occur in the gallery system
 */
export type ErrorType = 
  | 'network'
  | 'cache'
  | 'memory'
  | 'validation'
  | 'permission'
  | 'timeout'
  | 'unknown';

/**
 * Cache-specific error interface
 */
export interface CacheError extends GalleryError {
  type: 'cache';
  /** Which cache operation failed */
  operation: 'get' | 'set' | 'delete' | 'clear' | 'evict';
  /** The cache key that caused the error */
  key?: string;
}

/**
 * Error handler interface
 */
export interface ErrorHandler {
  /** Handle image loading errors */
  handleImageLoadError(imageId: string, error: Error): void;
  /** Handle network-related errors */
  handleNetworkError(error: NetworkError): void;
  /** Handle cache-related errors */
  handleCacheError(error: CacheError): void;
  /** Retry a failed image with exponential backoff */
  retryFailedImage(imageId: string, maxRetries: number): Promise<void>;
}

/**
 * Error recovery strategies
 */
export interface ErrorRecoveryStrategy {
  /** Maximum number of retry attempts */
  maxRetries: number;
  /** Base delay between retries in milliseconds */
  baseDelay: number;
  /** Multiplier for exponential backoff */
  backoffMultiplier: number;
  /** Maximum delay between retries */
  maxDelay: number;
  /** Whether to use jitter in retry delays */
  useJitter: boolean;
}

/**
 * Default error recovery configuration
 */
export const DefaultErrorRecovery: ErrorRecoveryStrategy = {
  maxRetries: 3,
  baseDelay: 1000,
  backoffMultiplier: 2,
  maxDelay: 10000,
  useJitter: true,
};