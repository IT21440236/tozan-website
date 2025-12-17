import { 
  ViewportManager as IViewportManager,
  ImageManager
} from './interfaces';
import { 
  VirtualItem, 
  LayoutInfo, 
  Position, 
  IntersectionData, 
  VirtualScrollConfig,
  ViewportState,
  ImageMetadata
} from './types';

/**
 * Viewport Manager implementation
 * Handles intersection observation, virtual scrolling, and viewport-based loading
 */
export class ViewportManager implements IViewportManager {
  private intersectionObserver: IntersectionObserver;
  private intersectionData = new Map<string, IntersectionData>();
  private imageElements = new Map<string, HTMLElement>();
  private imageMetadata = new Map<string, ImageMetadata>();
  private viewportState: ViewportState;
  private config: VirtualScrollConfig;
  private layoutInfo: LayoutInfo;
  private imageManager: ImageManager;
  private loadingQueue = new Set<string>();
  private activeRequests = new Set<string>();
  
  // Constants for progressive loading
  private readonly PRELOAD_THRESHOLD = 200; // pixels
  private readonly MAX_CONCURRENT_REQUESTS = 6;

  constructor(imageManager: ImageManager, container: HTMLElement) {
    this.imageManager = imageManager;
    
    // Initialize viewport state
    this.viewportState = this.getInitialViewportState(container);
    
    // Default virtual scroll configuration
    this.config = {
      itemHeight: 300,
      overscan: 5,
      dynamicHeight: true,
      minItems: 10,
      maxItems: 100
    };

    // Default layout info
    this.layoutInfo = {
      totalHeight: 0,
      itemHeight: this.config.itemHeight,
      columns: this.getOptimalColumns(),
      gap: 16
    };

    // Initialize intersection observer with preload threshold
    this.intersectionObserver = new IntersectionObserver(
      this.handleIntersection.bind(this),
      {
        root: container,
        rootMargin: `${this.PRELOAD_THRESHOLD}px`,
        threshold: [0, 0.1, 0.5, 1.0]
      }
    );

    // Set up viewport tracking
    this.setupViewportTracking(container);
  }

  private getInitialViewportState(container: HTMLElement): ViewportState {
    const rect = container.getBoundingClientRect();
    return {
      scrollTop: container.scrollTop,
      scrollLeft: container.scrollLeft,
      clientHeight: rect.height,
      clientWidth: rect.width,
      scrollHeight: container.scrollHeight,
      scrollWidth: container.scrollWidth,
      devicePixelRatio: window.devicePixelRatio || 1
    };
  }

  private setupViewportTracking(container: HTMLElement): void {
    let ticking = false;
    
    const updateViewport = () => {
      this.viewportState = this.getInitialViewportState(container);
      this.updateViewport(this.viewportState.scrollTop);
      ticking = false;
    };

    container.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateViewport);
        ticking = true;
      }
    });

    window.addEventListener('resize', () => {
      if (!ticking) {
        requestAnimationFrame(updateViewport);
        ticking = true;
      }
    });
  }

  private handleIntersection(entries: IntersectionObserverEntry[]): void {
    const imagesToLoad: string[] = [];
    const imagesToPrioritize: string[] = [];

    for (const entry of entries) {
      const element = entry.target as HTMLElement;
      const imageId = element.dataset.imageId;
      
      if (!imageId) continue;

      const intersectionData: IntersectionData = {
        elementId: imageId,
        isIntersecting: entry.isIntersecting,
        intersectionRatio: entry.intersectionRatio,
        distanceFromViewport: this.calculateDistanceFromViewport(entry),
        boundingRect: entry.boundingClientRect
      };

      this.intersectionData.set(imageId, intersectionData);

      // Determine loading priority based on intersection
      if (entry.isIntersecting) {
        // Image is visible - highest priority
        imagesToPrioritize.push(imageId);
      } else if (intersectionData.distanceFromViewport <= this.PRELOAD_THRESHOLD) {
        // Image is near viewport - queue for loading
        imagesToLoad.push(imageId);
      }
    }

    // Process loading queue with priority
    this.processLoadingQueue(imagesToPrioritize, imagesToLoad);
  }

  private calculateDistanceFromViewport(entry: IntersectionObserverEntry): number {
    const rect = entry.boundingClientRect;
    const viewportHeight = this.viewportState.clientHeight;
    
    if (entry.isIntersecting) {
      return -1; // Negative indicates visible
    }
    
    if (rect.top > viewportHeight) {
      return rect.top - viewportHeight; // Distance below viewport
    } else {
      return -(rect.bottom); // Distance above viewport (negative)
    }
  }

  private async processLoadingQueue(priorityImages: string[], nearbyImages: string[]): Promise<void> {
    // First, handle priority images (currently visible)
    for (const imageId of priorityImages) {
      if (this.activeRequests.size >= this.MAX_CONCURRENT_REQUESTS) {
        break;
      }
      await this.loadImageIfNeeded(imageId, 10); // High priority
    }

    // Then handle nearby images
    for (const imageId of nearbyImages) {
      if (this.activeRequests.size >= this.MAX_CONCURRENT_REQUESTS) {
        break;
      }
      await this.loadImageIfNeeded(imageId, 5); // Medium priority
    }
  }

  private async loadImageIfNeeded(imageId: string, priority: number): Promise<void> {
    if (this.activeRequests.has(imageId) || this.loadingQueue.has(imageId)) {
      return; // Already loading or queued
    }

    const metadata = this.imageMetadata.get(imageId);
    if (!metadata || metadata.cached) {
      return; // No metadata or already cached
    }

    this.activeRequests.add(imageId);
    this.loadingQueue.add(imageId);

    try {
      // Queue the image with the image manager
      this.imageManager.queueImage(metadata, priority);
      
      // Load the image
      await this.imageManager.loadImage(metadata);
      
    } catch (error) {
      console.warn(`Failed to load image ${imageId}:`, error);
    } finally {
      this.activeRequests.delete(imageId);
      this.loadingQueue.delete(imageId);
    }
  }

  // Public interface implementation
  getVisibleImages(): string[] {
    const visible: string[] = [];
    for (const [imageId, data] of this.intersectionData) {
      if (data.isIntersecting) {
        visible.push(imageId);
      }
    }
    return visible;
  }

  getNearbyImages(threshold: number): string[] {
    const nearby: string[] = [];
    for (const [imageId, data] of this.intersectionData) {
      if (!data.isIntersecting && Math.abs(data.distanceFromViewport) <= threshold) {
        nearby.push(imageId);
      }
    }
    return nearby;
  }

  isImageVisible(imageId: string): boolean {
    const data = this.intersectionData.get(imageId);
    return data?.isIntersecting ?? false;
  }

  getDistanceFromViewport(imageId: string): number {
    const data = this.intersectionData.get(imageId);
    return data?.distanceFromViewport ?? Infinity;
  }

  getVirtualizedItems(): VirtualItem[] {
    const { start, end } = this.getVisibleRange();
    const items: VirtualItem[] = [];
    
    let currentTop = 0;
    let index = 0;
    
    for (const [imageId, metadata] of this.imageMetadata) {
      if (index >= start && index <= end) {
        const height = this.config.dynamicHeight 
          ? this.calculateItemHeight(metadata)
          : this.config.itemHeight;
          
        items.push({
          id: imageId,
          top: currentTop,
          height,
          visible: index >= start && index <= end
        });
      }
      
      currentTop += this.config.itemHeight + this.layoutInfo.gap;
      index++;
    }
    
    return items;
  }

  updateViewport(scrollTop: number): void {
    this.viewportState.scrollTop = scrollTop;
    
    // Trigger intersection observer updates
    const visibleImages = this.getVisibleImages();
    const nearbyImages = this.getNearbyImages(this.PRELOAD_THRESHOLD);
    
    // Process loading queue based on new viewport
    this.processLoadingQueue(visibleImages, nearbyImages);
  }

  getTotalHeight(): number {
    return this.layoutInfo.totalHeight;
  }

  getVisibleRange(): { start: number; end: number } {
    const scrollTop = this.viewportState.scrollTop;
    const clientHeight = this.viewportState.clientHeight;
    const itemHeight = this.layoutInfo.itemHeight + this.layoutInfo.gap;
    
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - this.config.overscan);
    const visibleCount = Math.ceil(clientHeight / itemHeight);
    const end = Math.min(
      this.imageMetadata.size - 1,
      start + visibleCount + this.config.overscan * 2
    );
    
    return { start, end };
  }

  calculateLayout(): LayoutInfo {
    const columns = this.getOptimalColumns();
    const itemCount = this.imageMetadata.size;
    const rows = Math.ceil(itemCount / columns);
    const totalHeight = rows * (this.config.itemHeight + this.layoutInfo.gap);
    
    this.layoutInfo = {
      totalHeight,
      itemHeight: this.config.itemHeight,
      columns,
      gap: this.layoutInfo.gap
    };
    
    return this.layoutInfo;
  }

  getImagePosition(imageId: string): Position {
    const images = Array.from(this.imageMetadata.keys());
    const index = images.indexOf(imageId);
    
    if (index === -1) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }
    
    const columns = this.layoutInfo.columns;
    const row = Math.floor(index / columns);
    const col = index % columns;
    
    const itemWidth = (this.viewportState.clientWidth - (columns - 1) * this.layoutInfo.gap) / columns;
    
    return {
      x: col * (itemWidth + this.layoutInfo.gap),
      y: row * (this.config.itemHeight + this.layoutInfo.gap),
      width: itemWidth,
      height: this.config.itemHeight
    };
  }

  updateLayout(imageIds: string[]): void {
    // Update metadata map
    for (const imageId of imageIds) {
      if (!this.imageMetadata.has(imageId)) {
        // This would be set externally when images are added
        continue;
      }
    }
    
    // Recalculate layout
    this.calculateLayout();
  }

  getOptimalColumns(): number {
    const containerWidth = this.viewportState.clientWidth;
    const minItemWidth = 250; // Minimum image width
    const gap = this.layoutInfo.gap;
    
    // Calculate optimal number of columns
    const maxColumns = Math.floor((containerWidth + gap) / (minItemWidth + gap));
    return Math.max(1, Math.min(maxColumns, 6)); // Between 1 and 6 columns
  }

  observe(element: HTMLElement, imageId: string): void {
    element.dataset.imageId = imageId;
    this.imageElements.set(imageId, element);
    this.intersectionObserver.observe(element);
  }

  unobserve(element: HTMLElement): void {
    const imageId = element.dataset.imageId;
    if (imageId) {
      this.imageElements.delete(imageId);
      this.intersectionData.delete(imageId);
    }
    this.intersectionObserver.unobserve(element);
  }

  getIntersectionData(imageId: string): IntersectionData | null {
    return this.intersectionData.get(imageId) || null;
  }

  updateConfig(config: Partial<VirtualScrollConfig>): void {
    this.config = { ...this.config, ...config };
    this.calculateLayout();
  }

  getConfig(): VirtualScrollConfig {
    return { ...this.config };
  }

  // Helper methods
  private calculateItemHeight(metadata: ImageMetadata): number {
    // Calculate height based on aspect ratio
    const aspectRatio = metadata.dimensions.height / metadata.dimensions.width;
    const containerWidth = this.viewportState.clientWidth / this.layoutInfo.columns;
    return Math.min(containerWidth * aspectRatio, this.config.itemHeight * 1.5);
  }

  // Public method to add image metadata
  addImageMetadata(metadata: ImageMetadata): void {
    this.imageMetadata.set(metadata.id, metadata);
    this.calculateLayout();
  }

  // Public method to remove image metadata
  removeImageMetadata(imageId: string): void {
    this.imageMetadata.delete(imageId);
    this.intersectionData.delete(imageId);
    const element = this.imageElements.get(imageId);
    if (element) {
      this.unobserve(element);
    }
    this.calculateLayout();
  }

  // Cleanup method
  destroy(): void {
    this.intersectionObserver.disconnect();
    this.intersectionData.clear();
    this.imageElements.clear();
    this.imageMetadata.clear();
    this.loadingQueue.clear();
    this.activeRequests.clear();
  }
}