/**
 * Core image metadata interface for the gallery system
 * Represents all necessary information about an image in the gallery
 */
export interface ImageMetadata {
  /** Unique identifier for the image */
  id: string;
  /** Full resolution image URL */
  url: string;
  /** Thumbnail/preview image URL */
  thumbnailUrl: string;
  /** Category/filter group this image belongs to */
  category: string;
  /** Alt text for accessibility */
  alt: string;
  /** Image dimensions for layout calculation */
  dimensions: {
    width: number;
    height: number;
  };
  /** Loading priority (higher numbers = higher priority) */
  priority: number;
  /** Whether this image is currently cached */
  cached: boolean;
}

/**
 * Position information for layout calculations
 */
export interface Position {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Virtual item for virtual scrolling implementation
 */
export interface VirtualItem {
  id: string;
  top: number;
  height: number;
  visible: boolean;
}

/**
 * Layout information for the gallery
 */
export interface LayoutInfo {
  totalHeight: number;
  itemHeight: number;
  columns: number;
  gap: number;
}