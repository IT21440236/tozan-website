import { 
  ImageMetadata, 
  LoadingState, 
  ViewportState, 
  ScrollEvent, 
  ResizeEvent 
} from '../types';

/**
 * Main Gallery Component interface
 * Orchestrates all gallery operations and manages UI state
 */
export interface GalleryComponent {
  // Core properties
  /** Array of all images in the gallery */
  images: ImageMetadata[];
  /** Currently active filter */
  currentFilter: string;
  /** Current viewport state */
  viewportState: ViewportState;
  /** Current loading state */
  loadingState: LoadingState;

  // Core methods
  /** Initialize the gallery component */
  initialize(): Promise<void>;
  /** Apply a filter to the gallery */
  applyFilter(filter: string): void;
  /** Handle scroll events */
  handleScroll(event: ScrollEvent): void;
  /** Handle resize events */
  handleResize(event: ResizeEvent): void;
  /** Clean up resources and event listeners */
  destroy(): void;

  // State management
  /** Get current loading progress (0-1) */
  getLoadingProgress(): number;
  /** Check if gallery is ready for interaction */
  isReady(): boolean;
  /** Get visible image IDs */
  getVisibleImages(): string[];
  /** Get images near the viewport */
  getNearbyImages(threshold: number): string[];
}