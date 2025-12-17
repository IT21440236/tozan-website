/**
 * Viewport and view state management interfaces
 * Handles viewport tracking and virtual scrolling
 */

/**
 * Current viewport state information
 */
export interface ViewportState {
  /** Current scroll position */
  scrollTop: number;
  /** Current horizontal scroll position */
  scrollLeft: number;
  /** Visible area height */
  clientHeight: number;
  /** Visible area width */
  clientWidth: number;
  /** Total scrollable height */
  scrollHeight: number;
  /** Total scrollable width */
  scrollWidth: number;
  /** Device pixel ratio for high-DPI displays */
  devicePixelRatio: number;
}

/**
 * Viewport information for image optimization
 */
export interface ViewportInfo {
  /** Viewport width in pixels */
  width: number;
  /** Viewport height in pixels */
  height: number;
  /** Device pixel ratio */
  devicePixelRatio: number;
  /** Whether the device is in portrait orientation */
  isPortrait: boolean;
  /** Whether this is a mobile device */
  isMobile: boolean;
}

/**
 * Intersection observer entry data
 */
export interface IntersectionData {
  /** Element ID being observed */
  elementId: string;
  /** Whether the element is currently intersecting */
  isIntersecting: boolean;
  /** Intersection ratio (0-1) */
  intersectionRatio: number;
  /** Distance from viewport in pixels */
  distanceFromViewport: number;
  /** Bounding rectangle of the element */
  boundingRect: DOMRectReadOnly;
}

/**
 * Virtual scrolling configuration
 */
export interface VirtualScrollConfig {
  /** Height of each item in pixels */
  itemHeight: number;
  /** Number of items to render outside visible area */
  overscan: number;
  /** Whether to use dynamic item heights */
  dynamicHeight: boolean;
  /** Minimum number of items to render */
  minItems: number;
  /** Maximum number of items to render */
  maxItems: number;
}