import { 
  ImageMetadata, 
  LoadingState, 
  QualitySettings, 
  ViewportInfo, 
  NetworkState,
  DeviceCapabilities,
  QualityPresets,
  NetworkQualityMap,
  NetworkSpeedThresholds,
  PerformanceBenchmarks
} from './types';
import { ImageManager as IImageManager } from './interfaces';

/**
 * Priority levels for image loading
 */
enum LoadingPriority {
  CRITICAL = 100,  // Above-the-fold images
  HIGH = 75,       // Near viewport images
  MEDIUM = 50,     // Preload candidates
  LOW = 25,        // Background preload
  DEFERRED = 0     // Far from viewport
}

/**
 * Image loading queue item
 */
interface QueueItem {
  metadata: ImageMetadata;
  priority: number;
  timestamp: number;
  retryCount: number;
  abortController: AbortController;
}

/**
 * Memory usage tracking
 */
interface MemoryTracker {
  totalSize: number;
  imageCount: number;
  lastCleanup: number;
  pressureLevel: 'low' | 'medium' | 'high';
  maxSize: number;
  cleanupThreshold: number;
  lastAccessTimes: Map<string, number>;
}

/**
 * ImageManager implementation with adaptive loading capabilities
 * Handles intelligent image loading, quality adaptation, and memory management
 */
export class ImageManager implements IImageManager {
  private loadingQueue: Map<string, QueueItem> = new Map();
  private activeRequests: Map<string, Promise<HTMLImageElement>> = new Map();
  private loadedImages: Map<string, HTMLImageElement> = new Map();
  private failedImages: Set<string> = new Set();
  private memoryTracker: MemoryTracker;
  private deviceCapabilities: DeviceCapabilities;
  private currentNetworkState: NetworkState;
  private maxConcurrentRequests = 6;
  private preloadThreshold = 200; // pixels
  private memoryLimit = 100 * 1024 * 1024; // 100MB default
  private cleanupInterval: number | null = null;
  private resizeTimeout: number | null = null;

  constructor() {
    this.memoryTracker = {
      totalSize: 0,
      imageCount: 0,
      lastCleanup: Date.now(),
      pressureLevel: 'low',
      maxSize: this.memoryLimit,
      cleanupThreshold: this.memoryLimit * 0.8,
      lastAccessTimes: new Map()
    };

    this.deviceCapabilities = this.detectDeviceCapabilities();
    this.currentNetworkState = this.detectNetworkState();
    
    // Set up memory monitoring
    this.setupMemoryMonitoring();
    
    // Listen for network changes
    this.setupNetworkMonitoring();
    
    // Listen for orientation changes
    this.setupOrientationMonitoring();
  }

  /**
   * Load a single image with adaptive quality
   */
  async loadImage(metadata: ImageMetadata): Promise<HTMLImageElement> {
    // Check if already loaded
    const cached = this.loadedImages.get(metadata.id);
    if (cached) {
      // Update access time for LRU tracking
      this.memoryTracker.lastAccessTimes.set(metadata.id, Date.now());
      return cached;
    }

    // Check if already loading
    const existing = this.activeRequests.get(metadata.id);
    if (existing) {
      return existing;
    }

    // Check memory pressure before loading new image
    if (this.memoryTracker.pressureLevel === 'high') {
      await this.performMemoryCleanup();
    }

    // Create loading promise
    const loadPromise = this.performImageLoad(metadata);
    this.activeRequests.set(metadata.id, loadPromise);

    try {
      const image = await loadPromise;
      this.loadedImages.set(metadata.id, image);
      this.updateMemoryUsage(image, metadata.id);
      return image;
    } catch (error) {
      this.failedImages.add(metadata.id);
      throw error;
    } finally {
      this.activeRequests.delete(metadata.id);
    }
  }

  /**
   * Preload multiple images with intelligent prioritization
   */
  async preloadImages(metadataList: ImageMetadata[]): Promise<void> {
    // Sort by priority and add to queue
    const sortedImages = metadataList
      .filter(img => !this.loadedImages.has(img.id) && !this.failedImages.has(img.id))
      .sort((a, b) => b.priority - a.priority);

    // Add to queue with appropriate priorities
    for (const metadata of sortedImages) {
      this.queueImage(metadata, metadata.priority);
    }

    // Process queue
    await this.processLoadingQueue();
  }

  /**
   * Cancel loading of a specific image
   */
  cancelLoading(imageId: string): void {
    const queueItem = this.loadingQueue.get(imageId);
    if (queueItem) {
      queueItem.abortController.abort();
      this.loadingQueue.delete(imageId);
    }

    const activeRequest = this.activeRequests.get(imageId);
    if (activeRequest) {
      this.activeRequests.delete(imageId);
    }
  }

  /**
   * Cancel all pending loads
   */
  cancelAllLoading(): void {
    for (const [imageId] of this.loadingQueue) {
      this.cancelLoading(imageId);
    }
  }

  /**
   * Get optimal image URL based on viewport and device capabilities
   */
  getOptimalImageUrl(metadata: ImageMetadata, viewport: ViewportInfo): string {
    const quality = this.adaptQuality(this.currentNetworkState);
    const devicePixelRatio = viewport.devicePixelRatio || 1;
    
    // Calculate optimal width based on viewport and device
    const optimalWidth = Math.min(
      viewport.width * devicePixelRatio,
      quality.maxWidth,
      metadata.dimensions.width
    );

    // For now, return the original URL - in a real implementation,
    // this would construct URLs with size and quality parameters
    if (optimalWidth <= 400) {
      return metadata.thumbnailUrl;
    }
    
    return metadata.url;
  }

  /**
   * Adapt quality settings based on network conditions
   */
  adaptQuality(networkState: NetworkState): QualitySettings {
    // Use data saver mode if enabled
    if (networkState.saveData) {
      return QualityPresets.LOW;
    }

    // Use network speed mapping
    const baseQuality = NetworkQualityMap[networkState.speed];
    
    // Adjust based on device capabilities
    if (this.deviceCapabilities.memory && this.deviceCapabilities.memory < 4) {
      // Low memory device - reduce quality
      return {
        ...baseQuality,
        maxWidth: Math.min(baseQuality.maxWidth, 800),
        quality: Math.min(baseQuality.quality, 70)
      };
    }

    // High-end device with good network
    if (networkState.speed === 'fast' && this.deviceCapabilities.devicePixelRatio > 2) {
      return QualityPresets.ULTRA;
    }

    return baseQuality;
  }

  /**
   * Check if image should be loaded at high quality
   */
  shouldLoadHighQuality(imageId: string): boolean {
    const networkState = this.currentNetworkState;
    
    // Don't load high quality on slow networks or data saver mode
    if (networkState.speed === 'slow' || networkState.saveData) {
      return false;
    }

    // Don't load high quality if memory pressure is high
    if (this.memoryTracker.pressureLevel === 'high') {
      return false;
    }

    return true;
  }

  /**
   * Get current loading state
   */
  getLoadingState(): LoadingState {
    const totalImages = this.loadedImages.size + this.activeRequests.size + this.loadingQueue.size + this.failedImages.size;
    const currentBatch = Array.from(this.activeRequests.keys());
    const pendingBatches = [Array.from(this.loadingQueue.keys())];

    return {
      totalImages,
      loadedImages: this.loadedImages.size,
      failedImages: this.failedImages.size,
      currentBatch,
      pendingBatches,
      isLoading: this.activeRequests.size > 0 || this.loadingQueue.size > 0,
      error: null
    };
  }

  /**
   * Get number of pending image loads
   */
  getPendingCount(): number {
    return this.loadingQueue.size;
  }

  /**
   * Get number of active concurrent requests
   */
  getActiveRequestCount(): number {
    return this.activeRequests.size;
  }

  /**
   * Check if image is currently loading
   */
  isImageLoading(imageId: string): boolean {
    return this.activeRequests.has(imageId) || this.loadingQueue.has(imageId);
  }

  /**
   * Add image to loading queue with priority
   */
  queueImage(metadata: ImageMetadata, priority: number): void {
    if (this.loadedImages.has(metadata.id) || this.loadingQueue.has(metadata.id)) {
      return;
    }

    const queueItem: QueueItem = {
      metadata,
      priority,
      timestamp: Date.now(),
      retryCount: 0,
      abortController: new AbortController()
    };

    this.loadingQueue.set(metadata.id, queueItem);
  }

  /**
   * Remove image from loading queue
   */
  dequeueImage(imageId: string): void {
    const queueItem = this.loadingQueue.get(imageId);
    if (queueItem) {
      queueItem.abortController.abort();
      this.loadingQueue.delete(imageId);
    }
  }

  /**
   * Reorder queue based on new priorities
   */
  reorderQueue(priorityMap: Map<string, number>): void {
    for (const [imageId, newPriority] of priorityMap) {
      const queueItem = this.loadingQueue.get(imageId);
      if (queueItem) {
        queueItem.priority = newPriority;
      }
    }
  }

  /**
   * Perform the actual image loading with error handling and retries
   */
  private async performImageLoad(metadata: ImageMetadata): Promise<HTMLImageElement> {
    const viewport: ViewportInfo = {
      width: window.innerWidth,
      height: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio || 1,
      isPortrait: window.innerHeight > window.innerWidth,
      isMobile: window.innerWidth < 768
    };

    const imageUrl = this.getOptimalImageUrl(metadata, viewport);
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        resolve(img);
      };
      
      img.onerror = () => {
        reject(new Error(`Failed to load image: ${imageUrl}`));
      };
      
      // Set crossOrigin for CORS if needed
      img.crossOrigin = 'anonymous';
      img.src = imageUrl;
      img.alt = metadata.alt;
    });
  }

  /**
   * Process the loading queue respecting concurrency limits
   */
  private async processLoadingQueue(): Promise<void> {
    while (this.loadingQueue.size > 0 && this.activeRequests.size < this.maxConcurrentRequests) {
      // Get highest priority item
      const sortedQueue = Array.from(this.loadingQueue.entries())
        .sort(([, a], [, b]) => b.priority - a.priority);
      
      if (sortedQueue.length === 0) break;
      
      const [imageId, queueItem] = sortedQueue[0];
      this.loadingQueue.delete(imageId);
      
      // Start loading
      try {
        await this.loadImage(queueItem.metadata);
      } catch (error) {
        console.warn(`Failed to load image ${imageId}:`, error);
      }
    }
  }

  /**
   * Detect device capabilities for quality adaptation
   */
  private detectDeviceCapabilities(): DeviceCapabilities {
    const nav = navigator as any;
    
    return {
      screenWidth: screen.width,
      screenHeight: screen.height,
      devicePixelRatio: window.devicePixelRatio || 1,
      memory: nav.deviceMemory,
      cores: nav.hardwareConcurrency,
      supportsWebP: this.checkWebPSupport(),
      supportsAVIF: this.checkAVIFSupport()
    };
  }

  /**
   * Detect current network state
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
   * Classify network speed based on downlink and RTT
   */
  private classifyNetworkSpeed(downlink: number, rtt: number): 'slow' | 'medium' | 'fast' {
    if (rtt > NetworkSpeedThresholds.SLOW_RTT || downlink < NetworkSpeedThresholds.SLOW_DOWNLINK) {
      return 'slow';
    }
    
    if (rtt < NetworkSpeedThresholds.FAST_RTT && downlink > NetworkSpeedThresholds.FAST_DOWNLINK) {
      return 'fast';
    }
    
    return 'medium';
  }

  /**
   * Check WebP support
   */
  private checkWebPSupport(): boolean {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  /**
   * Check AVIF support
   */
  private checkAVIFSupport(): boolean {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    try {
      return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
    } catch {
      return false;
    }
  }

  /**
   * Set up memory monitoring and cleanup
   */
  private setupMemoryMonitoring(): void {
    // Monitor memory usage every 30 seconds
    this.cleanupInterval = window.setInterval(() => {
      this.checkMemoryPressure();
      this.performMemoryCleanup();
    }, 30000);

    // Listen for memory pressure events if supported
    if ('memory' in performance) {
      const memoryInfo = (performance as any).memory;
      if (memoryInfo) {
        this.updateMemoryPressureLevel(memoryInfo);
      }
    }
  }

  /**
   * Set up network monitoring
   */
  private setupNetworkMonitoring(): void {
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', () => {
        this.currentNetworkState = this.detectNetworkState();
      });
    }
  }

  /**
   * Set up orientation change monitoring
   */
  private setupOrientationMonitoring(): void {
    // Handle orientation change
    window.addEventListener('orientationchange', () => {
      this.handleOrientationChange();
    });
    
    // Also listen for resize events as a fallback
    window.addEventListener('resize', () => {
      // Debounce resize events
      if (this.resizeTimeout !== null) {
        clearTimeout(this.resizeTimeout);
      }
      this.resizeTimeout = window.setTimeout(() => {
        this.handleOrientationChange();
      }, 250);
    });
  }

  /**
   * Handle device orientation changes
   */
  private handleOrientationChange(): void {
    // Update device capabilities after orientation change
    setTimeout(() => {
      const oldCapabilities = this.deviceCapabilities;
      this.deviceCapabilities = this.detectDeviceCapabilities();
      
      // Check if significant changes occurred
      const significantChange = 
        Math.abs(oldCapabilities.screenWidth - this.deviceCapabilities.screenWidth) > 100 ||
        Math.abs(oldCapabilities.screenHeight - this.deviceCapabilities.screenHeight) > 100;
      
      if (significantChange) {
        console.debug('Significant orientation change detected, adjusting loading strategy');
        
        // Cancel current loading queue and reorder based on new viewport
        this.reorderQueueForNewViewport();
        
        // Trigger memory cleanup as layout may have changed significantly
        this.performMemoryCleanup();
      }
    }, 100);
  }

  /**
   * Reorder loading queue after orientation change
   */
  private reorderQueueForNewViewport(): void {
    // Get current viewport
    const viewport: ViewportInfo = {
      width: window.innerWidth,
      height: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio || 1,
      isPortrait: window.innerHeight > window.innerWidth,
      isMobile: window.innerWidth < 768
    };

    // Recalculate priorities for queued images based on new viewport
    const newPriorities = new Map<string, number>();
    
    for (const [imageId, queueItem] of this.loadingQueue) {
      // Find image elements in DOM to check new positions
      const elements = document.querySelectorAll(`[data-image-id="${imageId}"]`);
      let newPriority = queueItem.priority;
      
      for (const element of elements) {
        const rect = element.getBoundingClientRect();
        const distanceFromViewport = Math.max(0, 
          Math.min(rect.top - viewport.height, viewport.height - rect.bottom)
        );
        
        // Closer to viewport = higher priority
        if (distanceFromViewport < 200) {
          newPriority = LoadingPriority.CRITICAL;
        } else if (distanceFromViewport < 500) {
          newPriority = LoadingPriority.HIGH;
        } else if (distanceFromViewport < 1000) {
          newPriority = LoadingPriority.MEDIUM;
        } else {
          newPriority = LoadingPriority.LOW;
        }
        break;
      }
      
      newPriorities.set(imageId, newPriority);
    }
    
    // Apply new priorities
    this.reorderQueue(newPriorities);
  }

  /**
   * Check memory pressure and update tracking
   */
  private checkMemoryPressure(): void {
    const memoryInfo = (performance as any).memory;
    if (memoryInfo) {
      this.updateMemoryPressureLevel(memoryInfo);
    }

    // Check our own memory usage
    if (this.memoryTracker.totalSize > this.memoryLimit) {
      this.memoryTracker.pressureLevel = 'high';
    } else if (this.memoryTracker.totalSize > this.memoryLimit * 0.7) {
      this.memoryTracker.pressureLevel = 'medium';
    } else {
      this.memoryTracker.pressureLevel = 'low';
    }
  }

  /**
   * Update memory pressure level based on browser memory info
   */
  private updateMemoryPressureLevel(memoryInfo: any): void {
    const usedRatio = memoryInfo.usedJSHeapSize / memoryInfo.totalJSHeapSize;
    
    if (usedRatio > 0.9) {
      this.memoryTracker.pressureLevel = 'high';
    } else if (usedRatio > 0.7) {
      this.memoryTracker.pressureLevel = 'medium';
    } else {
      this.memoryTracker.pressureLevel = 'low';
    }
  }

  /**
   * Perform memory cleanup by unloading off-screen images
   */
  private async performMemoryCleanup(): Promise<void> {
    if (this.memoryTracker.pressureLevel === 'low' && this.memoryTracker.totalSize < this.memoryTracker.cleanupThreshold) {
      return;
    }

    // Get viewport information
    const viewport = {
      top: window.pageYOffset,
      bottom: window.pageYOffset + window.innerHeight,
      left: window.pageXOffset,
      right: window.pageXOffset + window.innerWidth
    };

    // Find images that are candidates for unloading
    const unloadCandidates: Array<{id: string, image: HTMLImageElement, priority: number}> = [];
    
    for (const [imageId, image] of this.loadedImages) {
      let priority = 0;
      let isVisible = false;
      
      // Check if image element is in DOM and get its position
      const elements = document.querySelectorAll(`img[src="${image.src}"]`);
      
      for (const element of elements) {
        const rect = element.getBoundingClientRect();
        const elementTop = rect.top + window.pageYOffset;
        const elementBottom = elementTop + rect.height;
        
        // Calculate distance from viewport
        const distanceFromViewport = Math.min(
          Math.abs(elementTop - viewport.bottom),
          Math.abs(elementBottom - viewport.top)
        );
        
        // Keep images within buffer zone
        const buffer = window.innerHeight * 2;
        if (elementBottom >= viewport.top - buffer && elementTop <= viewport.bottom + buffer) {
          isVisible = true;
          break;
        }
        
        // Priority based on distance (farther = higher priority for unloading)
        priority = Math.max(priority, distanceFromViewport);
      }
      
      if (!isVisible) {
        // Add LRU factor - older access time = higher priority for unloading
        const lastAccess = this.memoryTracker.lastAccessTimes.get(imageId) || 0;
        const timeSinceAccess = Date.now() - lastAccess;
        priority += timeSinceAccess / 1000; // Convert to seconds
        
        unloadCandidates.push({id: imageId, image, priority});
      }
    }

    // Sort by priority (highest first = most suitable for unloading)
    unloadCandidates.sort((a, b) => b.priority - a.priority);

    // Determine how many images to unload based on memory pressure
    let targetUnloadCount = 0;
    if (this.memoryTracker.pressureLevel === 'high') {
      targetUnloadCount = Math.ceil(unloadCandidates.length * 0.5); // Unload 50%
    } else if (this.memoryTracker.pressureLevel === 'medium') {
      targetUnloadCount = Math.ceil(unloadCandidates.length * 0.3); // Unload 30%
    } else {
      // Even on low pressure, unload some if we're over threshold
      targetUnloadCount = Math.ceil(unloadCandidates.length * 0.2); // Unload 20%
    }

    // Unload selected images
    for (let i = 0; i < Math.min(targetUnloadCount, unloadCandidates.length); i++) {
      const candidate = unloadCandidates[i];
      this.unloadImage(candidate.id, candidate.image);
      
      // Stop if we've freed enough memory
      if (this.memoryTracker.totalSize < this.memoryTracker.cleanupThreshold * 0.7) {
        break;
      }
    }

    this.memoryTracker.lastCleanup = Date.now();
    
    // Update pressure level after cleanup
    this.checkMemoryPressure();
  }

  /**
   * Unload a specific image from memory
   */
  private unloadImage(imageId: string, image: HTMLImageElement): void {
    // Estimate image size (rough calculation)
    const estimatedSize = image.naturalWidth * image.naturalHeight * 4; // 4 bytes per pixel (RGBA)
    
    this.memoryTracker.totalSize -= estimatedSize;
    this.memoryTracker.imageCount--;
    this.memoryTracker.lastAccessTimes.delete(imageId);
    this.loadedImages.delete(imageId);
    
    // Clear the image source to free memory
    image.src = '';
    
    console.debug(`Unloaded image ${imageId}, freed ~${Math.round(estimatedSize / 1024)}KB`);
  }

  /**
   * Update memory usage tracking when an image is loaded
   */
  private updateMemoryUsage(image: HTMLImageElement, imageId: string): void {
    // Estimate image size (rough calculation)
    const estimatedSize = image.naturalWidth * image.naturalHeight * 4; // 4 bytes per pixel (RGBA)
    
    this.memoryTracker.totalSize += estimatedSize;
    this.memoryTracker.imageCount++;
    this.memoryTracker.lastAccessTimes.set(imageId, Date.now());
    
    // Check if we need cleanup after adding new image
    if (this.memoryTracker.totalSize > this.memoryTracker.cleanupThreshold) {
      // Schedule cleanup on next tick to avoid blocking
      setTimeout(() => this.performMemoryCleanup(), 0);
    }
  }

  /**
   * Get current memory usage statistics
   */
  getMemoryStats(): {
    totalSize: number;
    imageCount: number;
    pressureLevel: string;
    maxSize: number;
    utilizationPercent: number;
  } {
    return {
      totalSize: this.memoryTracker.totalSize,
      imageCount: this.memoryTracker.imageCount,
      pressureLevel: this.memoryTracker.pressureLevel,
      maxSize: this.memoryTracker.maxSize,
      utilizationPercent: (this.memoryTracker.totalSize / this.memoryTracker.maxSize) * 100
    };
  }

  /**
   * Force memory cleanup regardless of pressure level
   */
  async forceMemoryCleanup(): Promise<void> {
    const originalPressureLevel = this.memoryTracker.pressureLevel;
    this.memoryTracker.pressureLevel = 'high';
    await this.performMemoryCleanup();
    this.memoryTracker.pressureLevel = originalPressureLevel;
  }

  /**
   * Set memory limit and adjust cleanup threshold
   */
  setMemoryLimit(limitBytes: number): void {
    this.memoryLimit = limitBytes;
    this.memoryTracker.maxSize = limitBytes;
    this.memoryTracker.cleanupThreshold = limitBytes * 0.8;
    
    // Trigger cleanup if we're now over the new limit
    if (this.memoryTracker.totalSize > this.memoryTracker.cleanupThreshold) {
      setTimeout(() => this.performMemoryCleanup(), 0);
    }
  }

  /**
   * Handle low memory warning from browser
   */
  handleLowMemoryWarning(): void {
    console.warn('Low memory warning received, performing aggressive cleanup');
    this.memoryTracker.pressureLevel = 'high';
    this.forceMemoryCleanup();
  }

  /**
   * Clean up resources when ImageManager is destroyed
   */
  destroy(): void {
    // Cancel all active requests
    this.cancelAllLoading();
    
    // Clear cleanup interval
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    
    // Clear resize timeout
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = null;
    }
    
    // Clear all loaded images
    for (const [imageId, image] of this.loadedImages) {
      this.unloadImage(imageId, image);
    }
    
    // Clear all maps and sets
    this.loadingQueue.clear();
    this.activeRequests.clear();
    this.loadedImages.clear();
    this.failedImages.clear();
    this.memoryTracker.lastAccessTimes.clear();
  }
}