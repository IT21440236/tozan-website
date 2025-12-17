import { 
  VirtualItem, 
  LayoutInfo, 
  Position, 
  IntersectionData, 
  VirtualScrollConfig 
} from '../types';

/**
 * Viewport Manager interface
 * Optimizes rendering and manages visible content
 */
export interface ViewportManager {
  // Viewport tracking
  /** Get IDs of currently visible images */
  getVisibleImages(): string[];
  /** Get IDs of images near the viewport within threshold */
  getNearbyImages(threshold: number): string[];
  /** Check if a specific image is visible */
  isImageVisible(imageId: string): boolean;
  /** Get distance of image from viewport (negative if visible) */
  getDistanceFromViewport(imageId: string): number;

  // Virtual scrolling
  /** Get virtualized items for current viewport */
  getVirtualizedItems(): VirtualItem[];
  /** Update viewport position and recalculate visible items */
  updateViewport(scrollTop: number): void;
  /** Get total virtual height */
  getTotalHeight(): number;
  /** Get visible range indices */
  getVisibleRange(): { start: number; end: number };

  // Layout management
  /** Calculate layout for current configuration */
  calculateLayout(): LayoutInfo;
  /** Get position of a specific image */
  getImagePosition(imageId: string): Position;
  /** Update layout when images are added/removed */
  updateLayout(imageIds: string[]): void;
  /** Get optimal number of columns for current viewport */
  getOptimalColumns(): number;

  // Intersection observation
  /** Start observing an element for intersection */
  observe(element: HTMLElement, imageId: string): void;
  /** Stop observing an element */
  unobserve(element: HTMLElement): void;
  /** Get intersection data for an image */
  getIntersectionData(imageId: string): IntersectionData | null;

  // Configuration
  /** Update virtual scroll configuration */
  updateConfig(config: Partial<VirtualScrollConfig>): void;
  /** Get current configuration */
  getConfig(): VirtualScrollConfig;
}