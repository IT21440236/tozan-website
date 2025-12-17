import { 
  ImageMetadata, 
  LoadingState, 
  QualitySettings, 
  ViewportInfo, 
  NetworkState 
} from '../types';

/**
 * Image Manager interface
 * Handles loading strategies and image lifecycle management
 */
export interface ImageManager {
  // Loading control
  /** Load a single image */
  loadImage(metadata: ImageMetadata): Promise<HTMLImageElement>;
  /** Preload multiple images */
  preloadImages(metadataList: ImageMetadata[]): Promise<void>;
  /** Cancel loading of a specific image */
  cancelLoading(imageId: string): void;
  /** Cancel all pending loads */
  cancelAllLoading(): void;

  // Quality management
  /** Get optimal image URL based on viewport and device */
  getOptimalImageUrl(metadata: ImageMetadata, viewport: ViewportInfo): string;
  /** Adapt quality settings based on network conditions */
  adaptQuality(networkSpeed: NetworkState): QualitySettings;
  /** Check if image should be loaded at high quality */
  shouldLoadHighQuality(imageId: string): boolean;

  // State management
  /** Get current loading state */
  getLoadingState(): LoadingState;
  /** Get number of pending image loads */
  getPendingCount(): number;
  /** Get number of active concurrent requests */
  getActiveRequestCount(): number;
  /** Check if image is currently loading */
  isImageLoading(imageId: string): boolean;

  // Queue management
  /** Add image to loading queue with priority */
  queueImage(metadata: ImageMetadata, priority: number): void;
  /** Remove image from loading queue */
  dequeueImage(imageId: string): void;
  /** Reorder queue based on new priorities */
  reorderQueue(priorityMap: Map<string, number>): void;
}