/**
 * Loading state management for the gallery system
 * Tracks the current state of image loading operations
 */
export interface LoadingState {
  /** Total number of images in the gallery */
  totalImages: number;
  /** Number of successfully loaded images */
  loadedImages: number;
  /** Number of images that failed to load */
  failedImages: number;
  /** Array of image IDs currently being loaded */
  currentBatch: string[];
  /** Queue of image ID batches waiting to be loaded */
  pendingBatches: string[][];
  /** Whether any loading operation is currently active */
  isLoading: boolean;
  /** Current error message, if any */
  error: string | null;
}

/**
 * Scroll event information
 */
export interface ScrollEvent {
  scrollTop: number;
  scrollLeft: number;
  clientHeight: number;
  clientWidth: number;
  scrollHeight: number;
  scrollWidth: number;
}

/**
 * Resize event information
 */
export interface ResizeEvent {
  width: number;
  height: number;
  devicePixelRatio: number;
}