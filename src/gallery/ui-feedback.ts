/**
 * UI Feedback and Loading Indicators System
 * Handles skeleton placeholders, progress indicators, error states, and loading time estimation
 */

import { ImageMetadata, LoadingState, NetworkState } from './types';

/**
 * Skeleton placeholder configuration
 */
interface SkeletonConfig {
  width: number;
  height: number;
  aspectRatio: number;
  showShimmer: boolean;
}

/**
 * Progress indicator configuration
 */
interface ProgressConfig {
  showPercentage: boolean;
  showEstimate: boolean;
  showBatchInfo: boolean;
  animationDuration: number;
}

/**
 * Error state configuration
 */
interface ErrorConfig {
  showRetryButton: boolean;
  showErrorDetails: boolean;
  maxRetryAttempts: number;
  retryDelay: number;
}

/**
 * Loading time estimation data
 */
interface LoadingEstimate {
  totalImages: number;
  loadedImages: number;
  averageLoadTime: number;
  estimatedTimeRemaining: number;
  networkSpeed: 'slow' | 'medium' | 'fast';
}

/**
 * UI Feedback Manager
 * Manages all visual feedback during gallery loading and interaction
 */
export class UIFeedbackManager {
  private container: HTMLElement;
  private skeletonConfig: SkeletonConfig;
  private progressConfig: ProgressConfig;
  private errorConfig: ErrorConfig;
  private loadingEstimate: LoadingEstimate;
  private loadingStartTime: number = 0;
  private imageLoadTimes: number[] = [];
  private networkState: NetworkState;

  // UI element references
  private progressContainer: HTMLElement | null = null;
  private progressBar: HTMLElement | null = null;
  private progressText: HTMLElement | null = null;
  private progressEstimate: HTMLElement | null = null;
  private errorContainer: HTMLElement | null = null;
  private galleryGrid: HTMLElement | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    
    // Default configurations
    this.skeletonConfig = {
      width: 300,
      height: 200,
      aspectRatio: 1.5,
      showShimmer: true
    };
    
    this.progressConfig = {
      showPercentage: true,
      showEstimate: true,
      showBatchInfo: false,
      animationDuration: 300
    };
    
    this.errorConfig = {
      showRetryButton: true,
      showErrorDetails: false,
      maxRetryAttempts: 3,
      retryDelay: 2000
    };
    
    this.loadingEstimate = {
      totalImages: 0,
      loadedImages: 0,
      averageLoadTime: 1000, // Default 1 second per image
      estimatedTimeRemaining: 0,
      networkSpeed: 'medium'
    };
    
    this.networkState = this.detectNetworkState();
    
    this.initializeUI();
  }

  /**
   * Initialize UI elements
   */
  private initializeUI(): void {
    // Find or create progress container
    this.progressContainer = this.container.querySelector('.gallery-progress-indicator');
    if (!this.progressContainer) {
      this.createProgressIndicator();
    }
    
    // Find or create error container
    this.errorContainer = this.container.querySelector('.gallery-error-container');
    if (!this.errorContainer) {
      this.createErrorContainer();
    }
    
    // Find or create gallery grid
    this.galleryGrid = this.container.querySelector('.gallery-grid');
    if (!this.galleryGrid) {
      this.createGalleryGrid();
    }
    
    // Get references to progress elements
    this.progressBar = this.container.querySelector('.progress-fill');
    this.progressText = this.container.querySelector('.progress-text');
    this.progressEstimate = this.container.querySelector('.progress-estimate');
  }

  /**
   * Create progress indicator UI
   */
  private createProgressIndicator(): void {
    const progressHTML = `
      <div class="gallery-progress-indicator" style="display: none;">
        <div class="progress-bar">
          <div class="progress-fill" style="width: 0%;"></div>
        </div>
        <div class="progress-text">Loading images...</div>
        <div class="progress-estimate" style="display: none;">
          <span class="estimate-time">Estimating...</span>
          <span class="estimate-count"></span>
        </div>
      </div>
    `;
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = progressHTML;
    this.progressContainer = tempDiv.firstElementChild as HTMLElement;
    
    this.container.insertBefore(this.progressContainer, this.container.firstChild);
  }

  /**
   * Create error container UI
   */
  private createErrorContainer(): void {
    const errorHTML = `
      <div class="gallery-error-container" style="display: none;">
        <div class="error-message">
          <div class="error-icon">⚠️</div>
          <div class="error-text"></div>
          <div class="error-actions">
            <button class="retry-button" style="display: none;">Retry</button>
            <button class="dismiss-button">Dismiss</button>
          </div>
        </div>
      </div>
    `;
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = errorHTML;
    this.errorContainer = tempDiv.firstElementChild as HTMLElement;
    
    this.container.appendChild(this.errorContainer);
    
    // Set up error action handlers
    this.setupErrorHandlers();
  }

  /**
   * Create gallery grid UI
   */
  private createGalleryGrid(): void {
    this.galleryGrid = document.createElement('div');
    this.galleryGrid.className = 'gallery-grid';
    this.galleryGrid.setAttribute('role', 'grid');
    this.galleryGrid.setAttribute('aria-label', 'Photo gallery');
    
    this.container.appendChild(this.galleryGrid);
  }

  /**
   * Set up error action handlers
   */
  private setupErrorHandlers(): void {
    if (!this.errorContainer) return;
    
    const retryButton = this.errorContainer.querySelector('.retry-button');
    const dismissButton = this.errorContainer.querySelector('.dismiss-button');
    
    if (retryButton) {
      retryButton.addEventListener('click', () => {
        this.handleRetryClick();
      });
    }
    
    if (dismissButton) {
      dismissButton.addEventListener('click', () => {
        this.hideError();
      });
    }
  }

  /**
   * Show loading indicators
   */
  showLoadingIndicators(totalImages: number): void {
    this.loadingStartTime = performance.now();
    this.loadingEstimate.totalImages = totalImages;
    this.loadingEstimate.loadedImages = 0;
    
    // Show progress indicator
    this.showProgressIndicator();
    
    // Create skeleton placeholders
    this.createSkeletonPlaceholders(totalImages);
    
    // Start loading time estimation
    this.startLoadingEstimation();
  }

  /**
   * Hide loading indicators
   */
  hideLoadingIndicators(): void {
    // Hide progress indicator
    this.hideProgressIndicator();
    
    // Remove skeleton placeholders
    this.removeSkeletonPlaceholders();
    
    // Stop loading estimation
    this.stopLoadingEstimation();
  }

  /**
   * Update loading progress
   */
  updateLoadingProgress(loadingState: LoadingState): void {
    const progress = loadingState.totalImages > 0 
      ? loadingState.loadedImages / loadingState.totalImages 
      : 0;
    
    // Update progress bar
    this.updateProgressBar(progress);
    
    // Update progress text
    this.updateProgressText(loadingState);
    
    // Update loading estimate
    this.updateLoadingEstimate(loadingState);
    
    // Update skeleton placeholders
    this.updateSkeletonPlaceholders(loadingState);
  }

  /**
   * Show progress indicator
   */
  private showProgressIndicator(): void {
    if (this.progressContainer) {
      this.progressContainer.style.display = 'block';
      this.progressContainer.setAttribute('aria-live', 'polite');
    }
  }

  /**
   * Hide progress indicator
   */
  private hideProgressIndicator(): void {
    if (this.progressContainer) {
      this.progressContainer.style.display = 'none';
      this.progressContainer.removeAttribute('aria-live');
    }
  }

  /**
   * Update progress bar
   */
  private updateProgressBar(progress: number): void {
    if (this.progressBar) {
      const percentage = Math.round(progress * 100);
      this.progressBar.style.width = `${percentage}%`;
      this.progressBar.setAttribute('aria-valuenow', percentage.toString());
      this.progressBar.setAttribute('aria-valuemin', '0');
      this.progressBar.setAttribute('aria-valuemax', '100');
    }
  }

  /**
   * Update progress text
   */
  private updateProgressText(loadingState: LoadingState): void {
    if (!this.progressText) return;
    
    const { loadedImages, totalImages, currentBatch } = loadingState;
    
    let text = `Loading images... ${loadedImages}/${totalImages}`;
    
    if (this.progressConfig.showBatchInfo && currentBatch.length > 0) {
      text += ` (${currentBatch.length} in progress)`;
    }
    
    this.progressText.textContent = text;
  }

  /**
   * Update loading time estimate
   */
  private updateLoadingEstimate(loadingState: LoadingState): void {
    if (!this.progressEstimate || !this.progressConfig.showEstimate) return;
    
    const { loadedImages, totalImages } = loadingState;
    const remainingImages = totalImages - loadedImages;
    
    if (loadedImages > 0) {
      const elapsedTime = performance.now() - this.loadingStartTime;
      const averageTimePerImage = elapsedTime / loadedImages;
      const estimatedTimeRemaining = (remainingImages * averageTimePerImage) / 1000; // Convert to seconds
      
      this.loadingEstimate.averageLoadTime = averageTimePerImage;
      this.loadingEstimate.estimatedTimeRemaining = estimatedTimeRemaining;
      
      // Update UI
      const estimateTimeElement = this.progressEstimate.querySelector('.estimate-time');
      const estimateCountElement = this.progressEstimate.querySelector('.estimate-count');
      
      if (estimateTimeElement && estimatedTimeRemaining > 1) {
        const timeText = this.formatEstimatedTime(estimatedTimeRemaining);
        estimateTimeElement.textContent = `About ${timeText} remaining`;
        this.progressEstimate.style.display = 'block';
      }
      
      if (estimateCountElement) {
        estimateCountElement.textContent = `${remainingImages} images left`;
      }
    }
  }

  /**
   * Format estimated time for display
   */
  private formatEstimatedTime(seconds: number): string {
    if (seconds < 60) {
      return `${Math.round(seconds)} seconds`;
    } else if (seconds < 3600) {
      const minutes = Math.round(seconds / 60);
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    } else {
      const hours = Math.round(seconds / 3600);
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }
  }

  /**
   * Create skeleton placeholders
   */
  createSkeletonPlaceholders(count: number): void {
    if (!this.galleryGrid || !this.skeletonConfig.showShimmer) return;
    
    // Calculate grid layout
    const containerWidth = this.galleryGrid.clientWidth;
    const minItemWidth = 250;
    const gap = 16;
    const columns = Math.max(1, Math.floor((containerWidth + gap) / (minItemWidth + gap)));
    const itemWidth = (containerWidth - (columns - 1) * gap) / columns;
    const itemHeight = itemWidth / this.skeletonConfig.aspectRatio;
    
    // Create skeleton items
    for (let i = 0; i < Math.min(count, 20); i++) { // Limit initial skeletons
      const skeleton = this.createSkeletonItem(itemWidth, itemHeight, i);
      this.galleryGrid.appendChild(skeleton);
    }
  }

  /**
   * Create a single skeleton item
   */
  private createSkeletonItem(width: number, height: number, index: number): HTMLElement {
    const skeleton = document.createElement('div');
    skeleton.className = 'gallery-skeleton-item';
    skeleton.setAttribute('data-skeleton-index', index.toString());
    skeleton.setAttribute('aria-label', 'Loading image placeholder');
    
    skeleton.style.width = `${width}px`;
    skeleton.style.height = `${height}px`;
    
    // Add shimmer effect
    if (this.skeletonConfig.showShimmer) {
      skeleton.innerHTML = `
        <div class="skeleton-shimmer">
          <div class="skeleton-content">
            <div class="skeleton-image"></div>
            <div class="skeleton-text">
              <div class="skeleton-line skeleton-line-1"></div>
              <div class="skeleton-line skeleton-line-2"></div>
            </div>
          </div>
        </div>
      `;
    }
    
    return skeleton;
  }

  /**
   * Update skeleton placeholders as images load
   */
  private updateSkeletonPlaceholders(loadingState: LoadingState): void {
    if (!this.galleryGrid) return;
    
    const skeletons = this.galleryGrid.querySelectorAll('.gallery-skeleton-item');
    const loadedCount = loadingState.loadedImages;
    
    // Hide skeletons for loaded images
    skeletons.forEach((skeleton, index) => {
      if (index < loadedCount) {
        (skeleton as HTMLElement).style.display = 'none';
      }
    });
  }

  /**
   * Remove skeleton placeholders
   */
  private removeSkeletonPlaceholders(): void {
    if (!this.galleryGrid) return;
    
    const skeletons = this.galleryGrid.querySelectorAll('.gallery-skeleton-item');
    skeletons.forEach(skeleton => skeleton.remove());
  }

  /**
   * Show image error state
   */
  showImageError(imageId: string, error: Error, retryCount: number = 0): void {
    const imageElement = this.galleryGrid?.querySelector(`[data-image-id="${imageId}"]`);
    if (!imageElement) return;
    
    // Create error overlay
    const errorOverlay = document.createElement('div');
    errorOverlay.className = 'image-error-overlay';
    errorOverlay.innerHTML = `
      <div class="image-error-content">
        <div class="error-icon">❌</div>
        <div class="error-message">Failed to load</div>
        ${retryCount < this.errorConfig.maxRetryAttempts ? `
          <button class="image-retry-button" data-image-id="${imageId}">
            Retry (${this.errorConfig.maxRetryAttempts - retryCount} left)
          </button>
        ` : ''}
        ${this.errorConfig.showErrorDetails ? `
          <div class="error-details">${error.message}</div>
        ` : ''}
      </div>
    `;
    
    // Add retry handler
    const retryButton = errorOverlay.querySelector('.image-retry-button');
    if (retryButton) {
      retryButton.addEventListener('click', () => {
        this.handleImageRetry(imageId);
      });
    }
    
    imageElement.appendChild(errorOverlay);
  }

  /**
   * Hide image error state
   */
  hideImageError(imageId: string): void {
    const imageElement = this.galleryGrid?.querySelector(`[data-image-id="${imageId}"]`);
    if (!imageElement) return;
    
    const errorOverlay = imageElement.querySelector('.image-error-overlay');
    if (errorOverlay) {
      errorOverlay.remove();
    }
  }

  /**
   * Show network error
   */
  showNetworkError(error: any): void {
    this.showError('Network Error', 'Unable to load images. Please check your connection.', true);
  }

  /**
   * Show cache warning
   */
  showCacheWarning(error: any): void {
    this.showError('Cache Warning', 'Some images may load slower due to cache issues.', false);
  }

  /**
   * Show initialization error
   */
  showInitializationError(error: Error): void {
    this.showError('Initialization Error', `Failed to initialize gallery: ${error.message}`, true);
  }

  /**
   * Show generic error
   */
  private showError(title: string, message: string, showRetry: boolean = false): void {
    if (!this.errorContainer) return;
    
    const errorText = this.errorContainer.querySelector('.error-text');
    const retryButton = this.errorContainer.querySelector('.retry-button');
    
    if (errorText) {
      errorText.innerHTML = `<strong>${title}</strong><br>${message}`;
    }
    
    if (retryButton) {
      retryButton.style.display = showRetry ? 'inline-block' : 'none';
    }
    
    this.errorContainer.style.display = 'block';
    this.errorContainer.setAttribute('role', 'alert');
  }

  /**
   * Hide error
   */
  hideError(): void {
    if (this.errorContainer) {
      this.errorContainer.style.display = 'none';
      this.errorContainer.removeAttribute('role');
    }
  }

  /**
   * Start loading time estimation
   */
  private startLoadingEstimation(): void {
    // Adjust estimation based on network speed
    const networkMultiplier = this.getNetworkSpeedMultiplier();
    this.loadingEstimate.averageLoadTime *= networkMultiplier;
  }

  /**
   * Stop loading time estimation
   */
  private stopLoadingEstimation(): void {
    // Reset estimation data
    this.loadingEstimate.estimatedTimeRemaining = 0;
  }

  /**
   * Get network speed multiplier for estimation
   */
  private getNetworkSpeedMultiplier(): number {
    switch (this.networkState.speed) {
      case 'slow': return 3.0;
      case 'fast': return 0.5;
      default: return 1.0;
    }
  }

  /**
   * Detect network state
   */
  private detectNetworkState(): NetworkState {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    if (!connection) {
      return {
        speed: 'medium',
        effectiveType: 'unknown',
        downlink: 5,
        rtt: 500,
        saveData: false
      };
    }

    const speed = this.classifyNetworkSpeed(connection.downlink, connection.rtt);
    
    return {
      speed,
      effectiveType: connection.effectiveType || 'unknown',
      downlink: connection.downlink || 5,
      rtt: connection.rtt || 500,
      saveData: connection.saveData || false
    };
  }

  /**
   * Classify network speed
   */
  private classifyNetworkSpeed(downlink: number, rtt: number): 'slow' | 'medium' | 'fast' {
    if (rtt > 1000 || downlink < 1) {
      return 'slow';
    }
    
    if (rtt < 200 && downlink > 10) {
      return 'fast';
    }
    
    return 'medium';
  }

  /**
   * Handle retry button click
   */
  private handleRetryClick(): void {
    this.hideError();
    // Emit retry event - will be handled by gallery component
    this.container.dispatchEvent(new CustomEvent('gallery-retry'));
  }

  /**
   * Handle image retry
   */
  private handleImageRetry(imageId: string): void {
    this.hideImageError(imageId);
    // Emit image retry event
    this.container.dispatchEvent(new CustomEvent('gallery-image-retry', {
      detail: { imageId }
    }));
  }

  /**
   * Update configuration
   */
  updateConfig(config: {
    skeleton?: Partial<SkeletonConfig>;
    progress?: Partial<ProgressConfig>;
    error?: Partial<ErrorConfig>;
  }): void {
    if (config.skeleton) {
      this.skeletonConfig = { ...this.skeletonConfig, ...config.skeleton };
    }
    
    if (config.progress) {
      this.progressConfig = { ...this.progressConfig, ...config.progress };
    }
    
    if (config.error) {
      this.errorConfig = { ...this.errorConfig, ...config.error };
    }
  }

  /**
   * Get current loading estimate
   */
  getLoadingEstimate(): LoadingEstimate {
    return { ...this.loadingEstimate };
  }

  /**
   * Record image load time for estimation improvement
   */
  recordImageLoadTime(loadTime: number): void {
    this.imageLoadTimes.push(loadTime);
    
    // Keep only recent load times (last 20)
    if (this.imageLoadTimes.length > 20) {
      this.imageLoadTimes.shift();
    }
    
    // Update average load time
    if (this.imageLoadTimes.length > 0) {
      const sum = this.imageLoadTimes.reduce((a, b) => a + b, 0);
      this.loadingEstimate.averageLoadTime = sum / this.imageLoadTimes.length;
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    // Remove event listeners
    const retryButton = this.errorContainer?.querySelector('.retry-button');
    const dismissButton = this.errorContainer?.querySelector('.dismiss-button');
    
    if (retryButton) {
      retryButton.removeEventListener('click', this.handleRetryClick);
    }
    
    if (dismissButton) {
      dismissButton.removeEventListener('click', () => this.hideError());
    }
    
    // Clear UI elements
    this.removeSkeletonPlaceholders();
    this.hideLoadingIndicators();
    this.hideError();
  }
}