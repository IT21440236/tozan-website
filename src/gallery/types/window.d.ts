/**
 * Window interface extensions for gallery performance system
 */

import { GalleryPerformanceSystem } from '../gallery-performance-init';

declare global {
  interface Window {
    galleryPerformanceSystem?: GalleryPerformanceSystem;
  }
}

export {}; // This makes the file a module