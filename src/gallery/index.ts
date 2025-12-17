/**
 * Gallery Performance Optimization System
 * 
 * This module provides a comprehensive solution for optimizing image gallery performance
 * through progressive loading, intelligent caching, and adaptive quality management.
 * 
 * Key Features:
 * - Progressive image loading with viewport awareness
 * - Multi-tier caching (memory + disk + service worker)
 * - Virtual scrolling for large image collections
 * - Adaptive quality based on network and device conditions
 * - Comprehensive error handling and recovery
 * 
 * @example
 * ```typescript
 * import { GalleryComponent, ImageManager, CacheManager } from './gallery';
 * 
 * const gallery = new GalleryComponent({
 *   container: document.getElementById('gallery'),
 *   images: imageMetadataArray
 * });
 * 
 * await gallery.initialize();
 * ```
 */

// Export all types and interfaces
export * from './types';
export * from './interfaces';

// Export implementations
export { CacheManager } from './cache-manager';
export { ViewportManager } from './viewport-manager';
export { ImageManager } from './image-manager';
export { GalleryComponent } from './gallery-component';
export { UIFeedbackManager } from './ui-feedback';

// Export version information
export const VERSION = '1.0.0';
export const BUILD_DATE = new Date().toISOString();