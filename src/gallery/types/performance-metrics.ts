/**
 * Performance metrics and monitoring interfaces
 * Used for tracking and optimizing gallery performance
 */
export interface PerformanceMetrics {
  /** Map of image ID to load time in milliseconds */
  imageLoadTimes: Map<string, number>;
  /** Percentage of cache hits vs total requests */
  cacheHitRate: number;
  /** Current memory usage in bytes */
  memoryUsage: number;
  /** Total number of network requests made */
  networkRequests: number;
  /** Frame performance metrics for scroll smoothness */
  scrollPerformance: FrameMetrics[];
  /** User interaction tracking */
  userInteractions: InteractionMetrics[];
}

/**
 * Frame performance metrics for monitoring scroll smoothness
 */
export interface FrameMetrics {
  /** Timestamp of the frame */
  timestamp: number;
  /** Frame duration in milliseconds */
  duration: number;
  /** Whether this frame was dropped/janky */
  dropped: boolean;
  /** Frames per second at this point */
  fps: number;
}

/**
 * User interaction metrics
 */
export interface InteractionMetrics {
  /** Type of interaction */
  type: 'scroll' | 'filter' | 'category-change' | 'image-click';
  /** When the interaction occurred */
  timestamp: number;
  /** How long the interaction took to complete */
  duration: number;
  /** Additional context data */
  context: Record<string, any>;
}

/**
 * Performance benchmark targets
 */
export const PerformanceBenchmarks = {
  /** Initial load should complete within 2 seconds */
  INITIAL_LOAD_TARGET: 2000,
  /** Cache retrieval should complete within 100ms */
  CACHE_RETRIEVAL_TARGET: 100,
  /** Scroll should maintain 60fps (16.67ms per frame) */
  SCROLL_FRAME_TARGET: 16.67,
  /** Memory usage should stay under 100MB for 100 images */
  MEMORY_TARGET_PER_100_IMAGES: 100 * 1024 * 1024,
} as const;