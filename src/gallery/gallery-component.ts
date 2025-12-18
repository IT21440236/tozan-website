/**
 * Main Gallery Component Implementation
 * Orchestrates all gallery operations and manages UI state
 */

import { 
  GalleryComponent as IGalleryComponent 
} from './interfaces/gallery-component';
import { ImageManager } from './image-manager';
import { CacheManager } from './cache-manager';
import { ViewportManager } from './viewport-manager';
import { UIFeedbackManager } from './ui-feedback';
import { 
  ImageMetadata, 
  LoadingState, 
  ViewportState, 
  ScrollEvent, 
  ResizeEvent,
  ErrorHandler,
  DefaultErrorRecovery,
  ErrorRecoveryStrategy,
  GalleryError
} from './types';

/**
 * Filter configuration for gallery categories
 */
interface FilterConfig {
  id: string;
  name: string;
  predicate: (image: ImageMetadata) => boolean;
}

/**
 * UI state for loading indicators and feedback
 */
interface UIState {
  showSkeletons: boolean;
  showProgressIndicator: boolean;
  showErrorStates: boolean;
  estimatedLoadTime: number | null;
  retryableErrors: Map<string, number>; // imageId -> retry count
}

/**
 * Scroll position restoration data
 */
interface ScrollPosition {
  top: number;
  left: number;
  filter: string;
  timestamp: number;
}

/**
 * Main Gallery Component implementation
 */
export class GalleryComponent implements IGalleryComponent, ErrorHandler {
  // Core properties
  public images: ImageMetadata[] = [];
  public currentFilter: string = 'all';
  public viewportState: ViewportState;
  public loadingState: LoadingState;

  // Component managers
  private imageManager: ImageManager;
  private cacheManager: CacheManager;
  private viewportManager: ViewportManager;
  private uiFeedback: UIFeedbackManager;

  // UI and state management
  private container: HTMLElement;
  private uiState: UIState;
  private filters: Map<string, FilterConfig> = new Map();
  private scrollPositions: Map<string, ScrollPosition> = new Map();
  private errorRecovery: ErrorRecoveryStrategy = DefaultErrorRecovery;
  
  // Event handling
  private resizeObserver: ResizeObserver;
  private scrollTimeout: number | null = null;
  private loadingTimeout: number | null = null;
  
  // Performance tracking
  private performanceStartTime: number = 0;
  private loadingStartTime: number = 0;

  constructor(container: HTMLElement, initialImages: ImageMetadata[] = []) {
    this.container = container;
    this.images = initialImages;
    
    // Initialize viewport state
    this.viewportState = this.getInitialViewportState();
    
    // Initialize loading state
    this.loadingState = {
      totalImages: this.images.length,
      loadedImages: 0,
      failedImages: 0,
      currentBatch: [],
      pendingBatches: [],
      isLoading: false,
      error: null
    };

    // Initialize UI state
    this.uiState = {
      showSkeletons: true,
      showProgressIndicator: false,
      showErrorStates: true,
      estimatedLoadTime: null,
      retryableErrors: new Map()
    };

    // Initialize managers
    this.cacheManager = new CacheManager();
    this.imageManager = new ImageManager();
    this.viewportManager = new ViewportManager(this.imageManager, container);
    this.uiFeedback = new UIFeedbackManager(container);

    // Set up default filters
    this.setupDefaultFilters();
    
    // Set up resize observer
    this.resizeObserver = new ResizeObserver((entries) => {
      // Convert ResizeObserverEntry to ResizeEvent
      if (entries.length > 0) {
        const entry = entries[0];
        const resizeEvent: ResizeEvent = {
          width: entry.contentRect.width,
          height: entry.contentRect.height,
          devicePixelRatio: window.devicePixelRatio || 1
        };
        this.handleResize(resizeEvent);
      }
    });
    this.resizeObserver.observe(container);
  }

  /**
   * Initialize the gallery component
   */
  async initialize(): Promise<void> {
    this.performanceStartTime = performance.now();
    
    try {
      // Set up container classes and attributes
      this.setupContainer();
      
      // Add image metadata to viewport manager
      for (const image of this.images) {
        this.viewportManager.addImageMetadata(image);
      }
      
      // Apply initial filter
      this.applyFilter(this.currentFilter);
      
      // Restore scroll position if available
      this.restoreScrollPosition();
      
      // Start initial loading
      await this.startInitialLoading();
      
      // Set up event listeners
      this.setupEventListeners();
      
      console.log(`Gallery initialized in ${performance.now() - this.performanceStartTime}ms`);
      
    } catch (error) {
      this.handleInitializationError(error as Error);
      throw error;
    }
  }

  /**
   * Apply a filter to the gallery
   */
  applyFilter(filter: string): void {
    // Save current scroll position before changing filter
    this.saveScrollPosition();
    
    const previousFilter = this.currentFilter;
    this.currentFilter = filter;
    
    // Get filtered images
    const filteredImages = this.getFilteredImages(filter);
    
    // Update loading state
    this.loadingState.totalImages = filteredImages.length;
    this.loadingState.loadedImages = 0;
    this.loadingState.failedImages = 0;
    this.loadingState.currentBatch = [];
    this.loadingState.pendingBatches = [];
    
    // Update UI
    this.updateFilterUI(filter, previousFilter);
    
    // Start loading filtered images
    this.startFilteredLoading(filteredImages);
    
    // Restore scroll position for this filter
    this.restoreScrollPosition();
  }

  /**
   * Handle scroll events
   */
  handleScroll(event: ScrollEvent): void {
    // Update viewport state
    this.viewportState = {
      ...this.viewportState,
      scrollTop: event.scrollTop,
      scrollLeft: event.scrollLeft,
      clientHeight: event.clientHeight,
      clientWidth: event.clientWidth,
      scrollHeight: event.scrollHeight,
      scrollWidth: event.scrollWidth
    };

    // Update viewport manager
    this.viewportManager.updateViewport(event.scrollTop);
    
    // Debounce scroll position saving
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
    
    this.scrollTimeout = window.setTimeout(() => {
      this.saveScrollPosition();
    }, 250);
  }

  /**
   * Handle resize events
   */
  handleResize(event: ResizeEvent): void {
    // Update viewport state
    this.viewportState = {
      ...this.viewportState,
      clientWidth: event.width,
      clientHeight: event.height,
      devicePixelRatio: event.devicePixelRatio
    };

    // Recalculate layout
    this.viewportManager.calculateLayout();
    
    // Update UI layout
    this.updateLayoutUI();
  }

  /**
   * Clean up resources and event listeners
   */
  destroy(): void {
    // Clear timeouts
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
    }
    
    // Disconnect observers
    this.resizeObserver.disconnect();
    
    // Destroy managers
    this.viewportManager.destroy();
    this.imageManager.destroy();
    this.uiFeedback.destroy();
    
    // Clear event listeners
    this.container.removeEventListener('scroll', this.handleScrollEvent);
    
    // Clear UI
    this.container.innerHTML = '';
  }

  // State management methods

  /**
   * Get current loading progress (0-1)
   */
  getLoadingProgress(): number {
    if (this.loadingState.totalImages === 0) {
      return 1;
    }
    return this.loadingState.loadedImages / this.loadingState.totalImages;
  }

  /**
   * Check if gallery is ready for interaction
   */
  isReady(): boolean {
    return !this.loadingState.isLoading && this.loadingState.error === null;
  }

  /**
   * Get visible image IDs
   */
  getVisibleImages(): string[] {
    return this.viewportManager.getVisibleImages();
  }

  /**
   * Get images near the viewport
   */
  getNearbyImages(threshold: number): string[] {
    return this.viewportManager.getNearbyImages(threshold);
  }

  // Error handling implementation

  /**
   * Handle image loading errors
   */
  handleImageLoadError(imageId: string, error: Error): void {
    const retryCount = this.uiState.retryableErrors.get(imageId) || 0;
    
    if (retryCount < this.errorRecovery.maxRetries) {
      // Schedule retry with exponential backoff
      const delay = this.calculateRetryDelay(retryCount);
      
      setTimeout(() => {
        this.retryFailedImage(imageId, this.errorRecovery.maxRetries);
      }, delay);
      
      this.uiState.retryableErrors.set(imageId, retryCount + 1);
    } else {
      // Max retries reached, show error state
      this.showImageError(imageId, error);
      this.loadingState.failedImages++;
    }
    
    this.updateLoadingState();
  }

  /**
   * Handle network-related errors
   */
  handleNetworkError(error: any): void {
    console.error('Network error in gallery:', error);
    
    // Show network error indicator
    this.showNetworkError(error);
    
    // Pause loading temporarily
    this.pauseLoading();
    
    // Schedule retry
    setTimeout(() => {
      this.resumeLoading();
    }, this.errorRecovery.baseDelay);
  }

  /**
   * Handle cache-related errors
   */
  handleCacheError(error: any): void {
    console.error('Cache error in gallery:', error);
    
    // Continue without cache if possible
    this.showCacheWarning(error);
  }

  /**
   * Retry a failed image with exponential backoff
   */
  async retryFailedImage(imageId: string, maxRetries: number): Promise<void> {
    const image = this.images.find(img => img.id === imageId);
    if (!image) {
      return;
    }

    try {
      await this.imageManager.loadImage(image);
      
      // Success - remove from retry map and update UI
      this.uiState.retryableErrors.delete(imageId);
      this.hideImageError(imageId);
      this.loadingState.loadedImages++;
      this.updateLoadingState();
      
    } catch (error) {
      this.handleImageLoadError(imageId, error as Error);
    }
  }

  // Private helper methods

  private getInitialViewportState(): ViewportState {
    const rect = this.container.getBoundingClientRect();
    return {
      scrollTop: this.container.scrollTop,
      scrollLeft: this.container.scrollLeft,
      clientHeight: rect.height,
      clientWidth: rect.width,
      scrollHeight: this.container.scrollHeight,
      scrollWidth: this.container.scrollWidth,
      devicePixelRatio: window.devicePixelRatio || 1
    };
  }

  private setupContainer(): void {
    this.container.classList.add('gallery-container');
    this.container.setAttribute('role', 'region');
    this.container.setAttribute('aria-label', 'Photo Gallery');
    
    // Add loading indicator container
    const loadingContainer = document.createElement('div');
    loadingContainer.className = 'gallery-loading-container';
    loadingContainer.innerHTML = `
      <div class="gallery-progress-indicator" style="display: none;">
        <div class="progress-bar">
          <div class="progress-fill"></div>
        </div>
        <div class="progress-text">Loading images...</div>
        <div class="progress-estimate" style="display: none;"></div>
      </div>
    `;
    this.container.appendChild(loadingContainer);
    
    // Add error container
    const errorContainer = document.createElement('div');
    errorContainer.className = 'gallery-error-container';
    errorContainer.style.display = 'none';
    this.container.appendChild(errorContainer);
    
    // Add main gallery grid
    const galleryGrid = document.createElement('div');
    galleryGrid.className = 'gallery-grid';
    this.container.appendChild(galleryGrid);
  }

  private setupDefaultFilters(): void {
    // All images filter
    this.filters.set('all', {
      id: 'all',
      name: 'All Photos',
      predicate: () => true
    });
    
    // Extract unique categories from images
    const categories = new Set(this.images.map(img => img.category));
    
    for (const category of categories) {
      this.filters.set(category, {
        id: category,
        name: this.formatCategoryName(category),
        predicate: (img) => img.category === category
      });
    }
  }

  private formatCategoryName(category: string): string {
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private getFilteredImages(filter: string): ImageMetadata[] {
    const filterConfig = this.filters.get(filter);
    if (!filterConfig) {
      return this.images;
    }
    
    return this.images.filter(filterConfig.predicate);
  }

  private async startInitialLoading(): Promise<void> {
    this.loadingStartTime = performance.now();
    this.loadingState.isLoading = true;
    
    // Show loading indicators
    this.showLoadingIndicators();
    
    // Get first batch of images (first 20 for initial load)
    const filteredImages = this.getFilteredImages(this.currentFilter);
    const initialBatch = filteredImages.slice(0, 20);
    
    // Estimate loading time
    this.estimateLoadingTime(initialBatch.length);
    
    try {
      // Load initial batch
      await this.loadImageBatch(initialBatch);
      
      // Queue remaining images for progressive loading
      const remainingImages = filteredImages.slice(20);
      if (remainingImages.length > 0) {
        this.queueProgressiveLoading(remainingImages);
      }
      
    } catch (error) {
      this.handleNetworkError(error);
    }
  }

  private async startFilteredLoading(filteredImages: ImageMetadata[]): Promise<void> {
    this.loadingState.isLoading = true;
    
    // Show loading indicators
    this.showLoadingIndicators();
    
    // Check cache for immediate display
    const cachedImages = await this.getCachedImages(filteredImages);
    
    if (cachedImages.length > 0) {
      // Display cached images immediately
      this.displayCachedImages(cachedImages);
    }
    
    // Load uncached images
    const uncachedImages = filteredImages.filter(img => !cachedImages.includes(img));
    
    if (uncachedImages.length > 0) {
      // Preload first 10 images of new category
      const preloadBatch = uncachedImages.slice(0, 10);
      await this.loadImageBatch(preloadBatch);
      
      // Queue remaining for progressive loading
      const remainingImages = uncachedImages.slice(10);
      if (remainingImages.length > 0) {
        this.queueProgressiveLoading(remainingImages);
      }
    }
  }

  private async getCachedImages(images: ImageMetadata[]): Promise<ImageMetadata[]> {
    const cached: ImageMetadata[] = [];
    
    for (const image of images) {
      const cachedImage = await this.cacheManager.get(image.id);
      if (cachedImage) {
        cached.push(image);
      }
    }
    
    return cached;
  }

  private displayCachedImages(images: ImageMetadata[]): void {
    // Update loading state
    this.loadingState.loadedImages += images.length;
    
    // Update UI to show cached images
    this.updateImageGrid(images);
    this.updateLoadingState();
  }

  private async loadImageBatch(images: ImageMetadata[]): Promise<void> {
    this.loadingState.currentBatch = images.map(img => img.id);
    
    // Load images with the image manager
    const loadPromises = images.map(async (image) => {
      try {
        await this.imageManager.loadImage(image);
        this.loadingState.loadedImages++;
        this.updateImageInGrid(image);
      } catch (error) {
        this.handleImageLoadError(image.id, error as Error);
      }
    });
    
    // Wait for all promises to complete (both resolved and rejected)
    await Promise.all(loadPromises.map(p => p.catch(e => e)));
    
    this.loadingState.currentBatch = [];
    this.updateLoadingState();
  }

  private queueProgressiveLoading(images: ImageMetadata[]): void {
    // Split into batches for progressive loading
    const batchSize = 10;
    const batches: string[][] = [];
    
    for (let i = 0; i < images.length; i += batchSize) {
      const batch = images.slice(i, i + batchSize);
      batches.push(batch.map(img => img.id));
    }
    
    this.loadingState.pendingBatches = batches;
    
    // Start progressive loading
    this.processProgressiveBatches(images);
  }

  private async processProgressiveBatches(images: ImageMetadata[]): Promise<void> {
    const batchSize = 10;
    
    for (let i = 0; i < images.length; i += batchSize) {
      const batch = images.slice(i, i + batchSize);
      
      // Wait for viewport to be ready for more images
      await this.waitForViewportReady();
      
      // Load batch
      await this.loadImageBatch(batch);
      
      // Remove from pending batches
      if (this.loadingState.pendingBatches.length > 0) {
        this.loadingState.pendingBatches.shift();
      }
    }
    
    // All loading complete
    this.loadingState.isLoading = false;
    this.hideLoadingIndicators();
  }

  private async waitForViewportReady(): Promise<void> {
    // Simple implementation - wait for scroll to stop
    return new Promise((resolve) => {
      let scrollTimer: number;
      
      const checkScroll = () => {
        clearTimeout(scrollTimer);
        scrollTimer = window.setTimeout(() => {
          resolve();
        }, 100);
      };
      
      this.container.addEventListener('scroll', checkScroll);
      
      // Also resolve after maximum wait time
      setTimeout(() => {
        this.container.removeEventListener('scroll', checkScroll);
        resolve();
      }, 2000);
    });
  }

  private saveScrollPosition(): void {
    const position: ScrollPosition = {
      top: this.viewportState.scrollTop,
      left: this.viewportState.scrollLeft,
      filter: this.currentFilter,
      timestamp: Date.now()
    };
    
    this.scrollPositions.set(this.currentFilter, position);
    
    // Also save to localStorage for persistence
    try {
      const positions = JSON.stringify(Array.from(this.scrollPositions.entries()));
      localStorage.setItem('gallery-scroll-positions', positions);
    } catch (error) {
      console.warn('Failed to save scroll positions to localStorage:', error);
    }
  }

  private restoreScrollPosition(): void {
    // Try to get from memory first
    let position = this.scrollPositions.get(this.currentFilter);
    
    // If not in memory, try localStorage
    if (!position) {
      try {
        const stored = localStorage.getItem('gallery-scroll-positions');
        if (stored) {
          const positions = new Map(JSON.parse(stored) as Array<[string, ScrollPosition]>);
          position = positions.get(this.currentFilter);
        }
      } catch (error) {
        console.warn('Failed to restore scroll positions from localStorage:', error);
      }
    }
    
    if (position && Date.now() - position.timestamp < 24 * 60 * 60 * 1000) { // 24 hours
      // Restore position with smooth scrolling
      this.container.scrollTo({
        top: position.top,
        left: position.left,
        behavior: 'smooth'
      });
    }
  }

  private setupEventListeners(): void {
    // Scroll event listener
    this.handleScrollEvent = this.handleScrollEvent.bind(this);
    this.container.addEventListener('scroll', this.handleScrollEvent, { passive: true });
    
    // UI feedback event listeners
    this.container.addEventListener('gallery-retry', () => {
      this.handleGalleryRetry();
    });
    
    this.container.addEventListener('gallery-image-retry', (event: Event) => {
      const customEvent = event as CustomEvent;
      this.handleImageRetry(customEvent.detail.imageId);
    });
  }

  private handleScrollEvent = (event: Event): void => {
    const target = event.target as HTMLElement;
    const scrollEvent: ScrollEvent = {
      scrollTop: target.scrollTop,
      scrollLeft: target.scrollLeft,
      clientHeight: target.clientHeight,
      clientWidth: target.clientWidth,
      scrollHeight: target.scrollHeight,
      scrollWidth: target.scrollWidth
    };
    
    this.handleScroll(scrollEvent);
  };

  private handleInitializationError(error: Error): void {
    console.error('Gallery initialization failed:', error);
    
    this.loadingState.error = error.message;
    this.loadingState.isLoading = false;
    
    // Show error UI
    this.showInitializationError(error);
  }

  private calculateRetryDelay(retryCount: number): number {
    const baseDelay = this.errorRecovery.baseDelay;
    const multiplier = this.errorRecovery.backoffMultiplier;
    const maxDelay = this.errorRecovery.maxDelay;
    
    let delay = baseDelay * Math.pow(multiplier, retryCount);
    
    if (this.errorRecovery.useJitter) {
      delay *= (0.5 + Math.random() * 0.5); // Add jitter
    }
    
    return Math.min(delay, maxDelay);
  }

  private pauseLoading(): void {
    this.imageManager.cancelAllLoading();
    this.loadingState.isLoading = false;
  }

  private resumeLoading(): void {
    if (this.loadingState.pendingBatches.length > 0) {
      this.loadingState.isLoading = true;
      // Resume progressive loading
      const remainingImages = this.getFilteredImages(this.currentFilter)
        .filter(img => !this.imageManager.isImageLoading(img.id));
      this.processProgressiveBatches(remainingImages);
    }
  }

  // UI update methods
  private showLoadingIndicators(): void {
    this.uiState.showProgressIndicator = true;
    this.uiState.showSkeletons = true;
    
    const filteredImages = this.getFilteredImages(this.currentFilter);
    this.uiFeedback.showLoadingIndicators(filteredImages.length);
  }

  private hideLoadingIndicators(): void {
    this.uiState.showProgressIndicator = false;
    this.uiState.showSkeletons = false;
    
    this.uiFeedback.hideLoadingIndicators();
  }

  private updateLoadingState(): void {
    // Update UI feedback with current loading state
    this.uiFeedback.updateLoadingProgress(this.loadingState);
    
    // Update progress in UI state
    const progress = this.getLoadingProgress();
    
    // Hide loading indicators if complete
    if (progress >= 1 && !this.loadingState.isLoading) {
      this.hideLoadingIndicators();
    }
  }

  private estimateLoadingTime(imageCount: number): void {
    // The UI feedback manager handles estimation internally
    // We just need to ensure it has the correct image count
    this.uiState.estimatedLoadTime = null; // Will be calculated by UI feedback manager
  }

  private updateFilterUI(newFilter: string, previousFilter: string): void {
    // Update filter indicators in the UI
    const filterElements = this.container.querySelectorAll('[data-filter]');
    
    filterElements.forEach(element => {
      const filterValue = element.getAttribute('data-filter');
      if (filterValue === newFilter) {
        element.classList.add('active');
        element.setAttribute('aria-selected', 'true');
      } else {
        element.classList.remove('active');
        element.setAttribute('aria-selected', 'false');
      }
    });
    
    // Update gallery grid class for filter-specific styling
    const galleryGrid = this.container.querySelector('.gallery-grid');
    if (galleryGrid) {
      galleryGrid.className = `gallery-grid filter-${newFilter}`;
    }
  }

  private updateLayoutUI(): void {
    // Recalculate and update the gallery grid layout
    const galleryGrid = this.container.querySelector('.gallery-grid');
    if (!galleryGrid) return;
    
    const layout = this.viewportManager.calculateLayout();
    
    // Update CSS custom properties for dynamic layout
    galleryGrid.setAttribute('style', `
      --gallery-columns: ${layout.columns};
      --gallery-gap: ${layout.gap}px;
      --gallery-item-height: ${layout.itemHeight}px;
      --gallery-total-height: ${layout.totalHeight}px;
    `);
  }

  private updateImageGrid(images: ImageMetadata[]): void {
    const galleryGrid = this.container.querySelector('.gallery-grid');
    if (!galleryGrid) return;
    
    // Create or update image elements for the provided images
    images.forEach(image => {
      this.updateImageInGrid(image);
    });
  }

  private updateImageInGrid(image: ImageMetadata): void {
    const galleryGrid = this.container.querySelector('.gallery-grid');
    if (!galleryGrid) return;
    
    // Check if image element already exists
    let imageElement = galleryGrid.querySelector(`[data-image-id="${image.id}"]`);
    
    if (!imageElement) {
      // Create new image element
      imageElement = this.createImageElement(image);
      galleryGrid.appendChild(imageElement);
      
      // Observe with viewport manager
      this.viewportManager.observe(imageElement as HTMLElement, image.id);
    }
    
    // Update image element content
    this.updateImageElementContent(imageElement as HTMLElement, image);
  }

  private createImageElement(image: ImageMetadata): HTMLElement {
    const imageContainer = document.createElement('div');
    imageContainer.className = 'gallery-image-container';
    imageContainer.setAttribute('data-image-id', image.id);
    imageContainer.setAttribute('data-category', image.category);
    imageContainer.setAttribute('role', 'img');
    imageContainer.setAttribute('aria-label', image.alt);
    
    // Calculate position using viewport manager
    const position = this.viewportManager.getImagePosition(image.id);
    
    imageContainer.style.cssText = `
      position: absolute;
      left: ${position.x}px;
      top: ${position.y}px;
      width: ${position.width}px;
      height: ${position.height}px;
    `;
    
    return imageContainer;
  }

  private updateImageElementContent(element: HTMLElement, image: ImageMetadata): void {
    // Check if image is loaded
    const isLoaded = this.imageManager.getLoadingState().currentBatch.includes(image.id) === false;
    
    if (isLoaded) {
      // Show actual image
      element.innerHTML = `
        <img 
          src="${image.url}" 
          alt="${image.alt}"
          loading="lazy"
          class="gallery-image"
          onload="this.classList.add('loaded')"
          onerror="this.classList.add('error')"
        />
        <div class="image-overlay">
          <div class="image-info">
            <span class="image-category">${this.formatCategoryName(image.category)}</span>
          </div>
        </div>
      `;
    } else {
      // Show skeleton or loading state
      element.innerHTML = `
        <div class="image-skeleton">
          <div class="skeleton-shimmer"></div>
        </div>
      `;
    }
  }

  private showImageError(imageId: string, error: Error): void {
    const retryCount = this.uiState.retryableErrors.get(imageId) || 0;
    this.uiFeedback.showImageError(imageId, error, retryCount);
  }

  private hideImageError(imageId: string): void {
    this.uiFeedback.hideImageError(imageId);
  }

  private showNetworkError(error: any): void {
    this.uiFeedback.showNetworkError(error);
  }

  private showCacheWarning(error: any): void {
    this.uiFeedback.showCacheWarning(error);
  }

  private showInitializationError(error: Error): void {
    this.uiFeedback.showInitializationError(error);
  }

  /**
   * Handle gallery-wide retry
   */
  private handleGalleryRetry(): void {
    // Reset error state
    this.loadingState.error = null;
    this.uiState.retryableErrors.clear();
    
    // Restart loading
    this.startInitialLoading();
  }

  /**
   * Handle individual image retry
   */
  private handleImageRetry(imageId: string): void {
    const image = this.images.find(img => img.id === imageId);
    if (image) {
      this.retryFailedImage(imageId, this.errorRecovery.maxRetries);
    }
  }
}